const { UserInputError } = require("apollo-server");
const Attendance = require("../../models/attendance.model");
const Event = require("../../models/event.model");
const Notification = require("../../models/notification.model");
const Trx = require("../../models/trx.model");

const { EventgqlParser, AttendancegqlParser } = require("./merge");
const { validateAttendanceInput } = require("../../util/validators");
const checkAuth = require("../../util/check-auth");
const { OfficialURL, MAIL_TEMPLATE_TYPE } = require("../../globalData");

module.exports = {
  Query: {
    async getAttendanceListCountInEvent(_, { eventID }, context) {
      const currUser = checkAuth(context);
      try {
        const event = await Event.findOne({ shortID: eventID });
        if (!event) {
          throw new Error("Event do not exist");
        }

        if (
          event.creator != currUser._id &&
          !event.enrolledMembers.find((stud) => stud._id == currUser._id)
        ) {
          throw new Error(
            "Access forbidden. You are not the event owner or join this event."
          );
        }
        let attendanceList;

        if (currUser.userLevel === 0) {
          attendanceList = await Attendance.find({ event: event.shortID }, [
            "id",
          ]);
        } else if (currUser.userLevel === 1) {
          attendanceList = await Attendance.find({ event: event.shortID }, [
            "id",
          ]);
        } else
          throw new Error(
            `Something wrong with your role index: ${currUser.userLevel}!`
          );
        return attendanceList.length;
      } catch (err) {
        throw err;
      }
    },

    async getAttendance(_, { attendanceID }, context) {
      const currUser = checkAuth(context);
      try {
        const attendance = await Attendance.findById(attendanceID);

        if (!attendance) {
          throw new Error("Attendance do not exist");
        }

        const event = await Event.findOne({ shortID: attendance.event });
        if (!event) {
          throw new Error("Event do not exist");
        }

        if (
          event.creator != currUser._id &&
          !event.enrolledMembers.find((user) => user._id == currUser._id)
        ) {
          throw new Error(
            "Access forbidden. You are not the event owner or participants in this event."
          );
        }

        return AttendancegqlParser(attendance);
      } catch (err) {
        throw err;
      }
    },

    async getAttendanceListInEvent(
      _,
      { eventID, currPage, pageSize },
      context
    ) {
      const currUser = checkAuth(context);
      try {
        const event = await Event.findOne({ shortID: eventID });

        if (!event) {
          throw new Error("Event do not exist");
        }
        if (
          event.creator != currUser._id &&
          !event.enrolledMembers.find((stud) => stud._id == currUser._id)
        ) {
          throw new Error(
            "Access forbidden. You are not the event owner or join this event."
          );
        }

        let createdAttendance_list = [];
        if (currUser.userLevel === 0) {
          createdAttendance_list = await Attendance.find({
            event: event.shortID,
          })
            .skip((currPage - 1) * pageSize)
            .limit(pageSize)
            .sort({ _id: -1 });
        } else if (currUser.userLevel === 1) {
          createdAttendance_list = await Attendance.find({
            event: event.shortID,
          })
            .skip((currPage - 1) * pageSize)
            .limit(pageSize)
            .sort({ _id: -1 });
        } else {
          throw new Error("Something wrong");
        }
        return {
          event: EventgqlParser(event),
          attendanceList: createdAttendance_list.map((attendance) =>
            AttendancegqlParser(attendance)
          ),
        };
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    async createAttendance(
      _,
      { attendanceInput: { date, time, eventID } },
      context
    ) {
      const currUser = checkAuth(context);
      const { valid, errors } = validateAttendanceInput(date, time);
      try {
        if (!valid) {
          throw new UserInputError("Errors", { errors });
        }
        const attendance = new Attendance({
          date,
          time,
          event: eventID,
        });
        await attendance.save();

        const event = await Event.findOne({ shortID: eventID });
        if (!event) {
          throw new Error("Event does not exist.");
        }

        event.enrolledMembers.map(async (memberID) => {
          const sendNotification = new Notification({
            receiver: memberID,
            title: `New Attendance Notification - Event ID: ${event.shortID}`,
            content: `Event owner: [${currUser.firstName} ${currUser.lastName}] had created an attendance in the event: ${event.name} (${event.code}-${event.session}).
            Enter room using URL: ${OfficialURL}/event/${event.shortID}/attendanceRoom/${attendance._id}`,
          });
          await sendNotification.save();
          Object.assign(event, {
            attendanceID: attendanceID,
            attendanceURL: `${OfficialURL}/event/${event.shortID}/attendanceRoom/${attendance._id}`,
          });

          const memberDoc = await Person.findById(enrolment.member);
          //notify member through email
          await sendEmail(
            memberDoc.email,
            memberDoc.firstName,
            MAIL_TEMPLATE_TYPE.CreateAttendance,
            { owner: currUser, event: event }
          );
        });

        return AttendancegqlParser(attendance);
      } catch (err) {
        throw err;
      }
    },

    async editAttendanceMode(_, { attendanceID, mode }, context) {
      const currUser = checkAuth(context);
      try {
        const attendance = await Attendance.findById(attendanceID);

        if (!attendance) {
          throw new Error("Edit a non existing attendance");
        }

        const event = await Event.findOne({ shortID: attendance.event });
        if (!event) {
          throw new Error("Event does not exist");
        }

        if (event.creator != currUser._id) {
          throw new Error("You are not the event owner");
        }

        await Attendance.findByIdAndUpdate(attendanceID, {
          $set: {
            mode,
          },
        });
        const editedAttendance = await Attendance.findById(attendanceID);

        return AttendancegqlParser(editedAttendance);
      } catch (err) {
        throw err;
      }
    },

    async editAttendanceOnOff(_, { attendanceID, isOn }, context) {
      const currUser = checkAuth(context);
      try {
        const attendance = await Attendance.findById(attendanceID);

        if (!attendance) {
          throw new Error("Edit a non existing attendance");
        }

        const event = await Event.findOne({ shortID: attendance.event });
        if (!event) {
          throw new Error("Event does not exist");
        }

        if (event.creator != currUser._id) {
          throw new Error("You are not the event owner");
        }

        await Attendance.findByIdAndUpdate(attendanceID, {
          $set: {
            isOn,
          },
        });
        const editedAttendance = await Attendance.findById(attendanceID);

        return AttendancegqlParser(editedAttendance);
      } catch (err) {
        throw err;
      }
    },

    async deleteAttendance(_, { attendanceID }, context) {
      const currUser = checkAuth(context);
      let errors = {};
      try {
        const attendance2Delete = await Attendance.findById(attendanceID);

        if (!attendance2Delete) {
          errors.general = "Delete a non existing attendance";
          throw new UserInputError("Delete a non existing attendance", {
            errors,
          });
        }

        await Attendance.deleteOne(attendance2Delete);

        return AttendancegqlParser(attendance2Delete);
      } catch (err) {
        throw err;
      }
    },
  },
};
