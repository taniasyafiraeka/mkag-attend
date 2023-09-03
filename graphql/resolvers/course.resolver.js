var shortid = require("shortid");
const { UserInputError } = require("apollo-server");
const Attendance = require("../../models/attendance.model");

const Event = require("../../models/event.model");
const Person = require("../../models/person.model");
const Notification = require("../../models/notification.model");

const { validateEventInput } = require("../../util/validators");

const {
  people,
  EventgqlParser,
  EventsgqlParser,
} = require("./merge");

const checkAuth = require("../../util/check-auth");

const { sendEmail } = require("../../util/mail");

//global mail type naming
const { MAIL_TEMPLATE_TYPE } = require("../../globalData");

module.exports = {
  Query: {
    async getEvents(_, { currPage, pageSize }, context) {
      const currUser = checkAuth(context);
      try {
        let eventsEnrolled = [];
        if (currUser.userLevel === 0) {
          eventsEnrolled = await Event.find({
            enrolledMembers: currUser._id,
          })
            .skip((currPage - 1) * pageSize)
            .limit(pageSize)
            .sort({ _id: -1 });
        } else if (currUser.userLevel === 1) {
          eventsEnrolled = await Event.find({
            creator: currUser._id,
          })
            .skip((currPage - 1) * pageSize)
            .limit(pageSize)
            .sort({ _id: -1 });
        } else {
          throw new Error("Something wrong");
        }
        return EventsgqlParser(eventsEnrolled);
      } catch (err) {
        throw err;
      }
    },

    async getEventsCount(_, __, context) {
      const currUser = checkAuth(context);
      var count = 0;
      try {
        if (currUser.userLevel === 0) {
          const eventEnrolled = await Event.find(
            {
              creator: currUser._id,
            },
            ["id"]
          );
          count = eventEnrolled.length;
        } else if (currUser.userLevel === 1) {
          const eventCreated = await Event.find(
            {
              creator: currUser._id,
            },
            ["id"]
          );

          count = eventCreated.length;
        } else {
          throw new Error("Something wrong");
        }

        return count;
      } catch (err) {
        throw err;
      }
    },

    async getEvent(_, { eventID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        const event = await Event.findOne({ shortID: eventID });
        if (!event) {
          errors.general = "Event do not exist";
          throw new UserInputError("Event do not exist", { errors });
        }
        if (currUser.userLevel === 1) {
          if (event.creator != currUser._id) {
            errors.general = "Access forbidden. You do not own this event.";
            throw new UserInputError(
              "Access forbidden. You do not own this event.",
              {
                errors,
              }
            );
          }
        } else {
          const member = event.enrolledMembers.find(
            (s) => s == currUser._id
          );
          if (!member) {
            errors.general =
              "Access forbidden. You do not enrol to this event.";
            throw new UserInputError(
              "Access forbidden. You do not enrol to this event.",
              {
                errors,
              }
            );
          }
        }
        return EventgqlParser(event);
      } catch (err) {
        throw err;
      }
    },

    async getParticipants(_, { eventID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        const event = await Event.findOne({ shortID: eventID });
        if (!event) {
          errors.general = "Event do not exist";
          throw new UserInputError("Event do not exist", { errors });
        }
        if (currUser.userLevel === 1) {
          if (event.creator != currUser._id) {
            errors.general = "Access forbidden. You do not own this event.";
            throw new UserInputError(
              "Access forbidden. You do not own this event.",
              {
                errors,
              }
            );
          }
        } else {
          const member = event.enrolledMembers.find(
            (s) => s == currUser._id
          );
          if (!member) {
            errors.general =
              "Access forbidden. You do not enrol to this event.";
            throw new UserInputError(
              "Access forbidden. You do not enrol to this event.",
              {
                errors,
              }
            );
          }
        }

        return people(event.enrolledMembers);
        
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
 
    /*
        Event owner:
    */
    async createEvent(_, { eventInput: { code, name, session } }, context) {
      const currUser = checkAuth(context);

      const { valid, errors } = validateEventInput(code, name, session);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      try {
        if (currUser.userLevel !== 1) {
          errors.general = "You are not a administrator but want to create event!";
          throw new UserInputError(
            "You are not a administrator but want to create event!",
            { errors }
          );
        }

        let existingShortID;
        let id;
        do {
          id = shortid.generate();
          existingShortID = await Event.find({ shortID: id });
        } while (existingShortID.length > 0);

        const newEvent = new Event({
          creator: currUser._id,
          shortID: id,
          code,
          name,
          session,
        });

        await newEvent.save();

        return EventgqlParser(newEvent);
      } catch (err) {
        throw err;
      }
    },

    async deleteEvent(_, { eventID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        if (currUser.userLevel !== 1) {
          errors.general = "You are not a administrator but want to delete event!";
          throw new UserInputError(
            "You are not a administrator but want to delete event!",
            { errors }
          );
        }

        const event2Delete = await Event.findById(eventID);

        if (!event2Delete) {
          errors.general = "Delete a non existing event";
          throw new UserInputError("Delete a non existing event", {
            errors,
          });
        }
        await Event.deleteOne(event2Delete);

        //also delete the enrolment
        const enrolments = await PendingEnrolledEvent.find({
          event: eventID,
        });
        enrolments.map(async (enrolment) => {
          //notify the member who enrol still pending in this event
          const sendNotification = new Notification({
            receiver: enrolment.member,
            title: `Event Deleted Notification - Event ID: ${event2Delete.shortID}`,
            content: `Event owner: [${currUser.firstName} ${currUser.lastName}] had deleted the event: ${event2Delete.name} (${event2Delete.code}-${event2Delete.session}),
             hence deleted from your enrolment pending list`,
          });
          await sendNotification.save();

          const memberDoc = await Person.findById(enrolment.member);
          //notify member through email
          await sendEmail(
            memberDoc.email,
            memberDoc.firstName,
            MAIL_TEMPLATE_TYPE.DeletePendingEvent,
            { owner: currUser, event: event2Delete }
          );
        });

        await PendingEnrolledEvent.deleteMany({ event: eventID });

        //delete the pending event

        //delete all related attendance
        const attendanceList = await Attendance.find({ event: eventID });

        attendanceList.map(async (attendance) => {
          //delete all related expression
          await Expression.deleteMany({ attendance: attendance._id });
        });

        await Attendance.deleteMany({ event: eventID });

        //TODO: Notification to member who enrol to this
        event2Delete.enrolledMembers.map(async (stud) => {
          //delete all related warning
          await Warning.deleteOne({ member: stud, event: eventID });

          notification = new Notification({
            receiver: stud,
            title: `Event Deleted Notification - Event ID: ${event2Delete.shortID}`,
            content: `Event owner: [${currUser.firstName} ${currUser.lastName}] had deleted the event: ${event2Delete.name} (${event2Delete.code}-${event2Delete.session})`,
          });

          await notification.save();

          const memberDoc = await Person.findById(stud);

          //notify member through email
          await sendEmail(
            memberDoc.email,
            memberDoc.firstName,
            MAIL_TEMPLATE_TYPE.DeleteEvent,
            { owner: currUser, event: event2Delete }
          );
        });
        return EventgqlParser(event2Delete);
      } catch (err) {
        throw err;
      }
    },

   
    async withdrawEvent(_, { eventID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        if (currUser.userLevel !== 0) {
          errors.general = "You are not a member but want to unenrol event!";
          throw new UserInputError(
            "You are not a member but want to unenrol event!",
            { errors }
          );
        }

        const event2withdraw = await Event.findById(eventID);
        if (!event2withdraw) {
          errors.general = "Event not exist but member wish to withdraw!";
          throw new UserInputError(
            "Event not exist but member wish to withdraw!",
            { errors }
          );
        }
        const member = event2withdraw.enrolledMembers.find(
          (s) => s == currUser._id
        );

        if (!member) {
          errors.general = "Member do not enrol the event";
          throw new UserInputError("Member do not enrol the event", {
            errors,
          });
        }

        await Event.findByIdAndUpdate(
          event2withdraw.id,
          { $pull: { enrolledMembers: currUser._id } },
          { safe: true, upsert: true }
        );

        const owner = await Person.findById(event2withdraw.creator);

        if (!owner) {
          errors.general = "Event owner do not exist";
          throw new UserInputError("Event owner do not exist", { errors });
        }

        await Warning.deleteOne({ member: currUser._id, event: eventID });

        //notify administrator
        notification = new Notification({
          receiver: owner.id,
          title: `Event Withdrawal - Event ID: ${event2withdraw.shortID}`,
          content: `Member: [${currUser.firstName} ${currUser.lastName}(${currUser.cardID})] had withdrawn the event: ${event2withdraw.name} (${event2withdraw.code}-${event2withdraw.session}).`,
        });

        //notify administrator through email
        await sendEmail(
          owner.email,
          owner.firstName,
          MAIL_TEMPLATE_TYPE.WithdrawEvent,
          { member: currUser, event: event2withdraw }
        );

        await notification.save();

        return "Withdraw success!";
      } catch (err) {
        throw err;
      }
    },

    async enrolEvent(_, { eventID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        const event = await Event.findOne({ shortID: eventID });


        if (currUser.userLevel !== 0) {
          errors.general =
            "Added person is a not member and is not allowed to join any event";
          throw new UserInputError(
            "Added person is a not member and is not allowed to join any event",
            { errors }
          );
        }

        if (!event) {
          errors.general = "Event do not exist";
          throw new UserInputError("Event do not exist", { errors });
        }


        if (event.enrolledMembers.length > 0) {
          const member = event.enrolledMembers.find(
            (s) => s == currUser._id
          );

          if (member) {
            errors.general = "You already enrolled the event!";
            throw new UserInputError("You already enrolled the event", {
              errors,
            });
          }
        }
        event.enrolledMembers.push(currUser._id);
        await event.save();
        
        return "Enrol Success";
      } catch (err) {
        throw err;
      }
    },

    async kickParticipant(_, { participantID, eventID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        const event = await Event.findOne({ shortID: eventID });
        const kickedPerson = await Person.findById(participantID);

        if (!event) {
          errors.general = "Event do not exist";
          throw new UserInputError("Event do not exist", { errors });
        }

        if (event.creator != currUser._id) {
          errors.general = "You cannot kick the participant";
          throw new Error("You cannot kick the participant", { errors });
        }

        if (!kickedPerson) {
          errors.general = "Participant do not exist";
          throw new UserInputError("Participant do not exist", { errors });
        }

        const checkMemberExist = event.enrolledMembers.find(
          (id) => id == participantID
        );
        if (!checkMemberExist) {
          errors.general = "Participant do not exist in this event";
          throw new UserInputError("Participant do not exist in this event", {
            errors,
          });
        }

        await Event.findOneAndUpdate(
          { shortID: eventID },
          { $pull: { enrolledMembers: participantID } },
          { safe: true, upsert: true }
        );

        await Warning.deleteOne({ member: participantID, event: event.id });

        const notification = new Notification({
          receiver: participantID,
          title: `Kicked Out Notification - Event ID: ${eventID}`,
          content: `Event owner: [${currUser.firstName} ${currUser.lastName}] have kicked you out from the event: ${event.name} (${event.code}-${event.session})`,
        });

        await notification.save();

        //notify member through email
        await sendEmail(
          kickedPerson.email,
          kickedPerson.firstName,
          MAIL_TEMPLATE_TYPE.KickMember,
          { owner: currUser, event: event }
        );

        return "Kick Success!";
      } catch (err) {
        throw err;
      }
    },

  },
};
