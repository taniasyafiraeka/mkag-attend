module.exports = {
  Query: {},
  Mutation: {
    async testingRegisterMember(_, { eventID }) {
      try {
        for (i = 0; i < 10; i++) {
          const password = "123";
          const hashedPassword = await bcrypt.hash(password, 12);

          const newPerson = new Person({
            firstName: "Member FN " + i,
            lastName: "Member LN " + i,
            email: "Member" + i + "@gmail.com",
            cardID: "A17CS0022",
            password: hashedPassword,
            userLevel: 0,
          });
          await newPerson.save();
          const event = await Event.findOne({ shortID: eventID });

          event.enrolledMembers.push(newPerson._id);
          event.save();
        }
        return "Create 50 member";
      } catch (err) {
        throw err;
      }
    },
    //TODO:/*Test*/
    async testingCreateEvent(_, __, context) {
      const currUser = checkAuth(context);
      let errors = {};

      try {
        if (currUser.userLevel !== 1) {
          errors.general =
            "The user is not a administrator but want to create event!";
          throw new UserInputError(
            "The user is not a administrator but want to create event!",
            { errors }
          );
        }
        for (i = 0; i < 50; i++) {
          let existingShortID;
          let id;
          do {
            id = shortid.generate();
            existingShortID = await Event.find({ shortID: id });
          } while (existingShortID.length > 0);
          const newEvent = new Event({
            shortID: "Event_" + id,
            creator: currUser._id,
            code: i + " SCSV2013",
            name: i + " Graphic",
            session: "20192020-01",
          });
          await newEvent.save();
        }
        return "Create 50 Event...";
      } catch (err) {
        throw err;
      }
    },
    //TODO:/*Test*/
    async testingDeleteAllEvent(_, __, context) {
      const currUser = checkAuth(context);
      let errors = {};

      try {
        if (currUser.userLevel !== 1) {
          errors.general =
            "The user is not a administrator but want to delete event!";
          throw new UserInputError(
            "The user is not a administrator but want to delete event!",
            { errors }
          );
        }

        await Event.deleteMany({ create: currUser._id });

        return "CDelete 50 Event...";
      } catch (err) {
        throw err;
      }
    },
  },
  async obtainMemberWarning(_, { participantID, eventID }, context) {
    const currUser = checkAuth(context);
    let errors = {};
    try {
      const warning = await Warning.findOne({
        member: participantID,
        event: eventID,
      });

      if (!warning) return 0;
      else return warning.count;
    } catch (err) {
      throw err;
    }
  },
  //TODO: Boilerplate notification
  async createNotification(_, __, context) {
    const currUser = checkAuth(context);
    let notification;
    for (i = 0; i < 50; i++) {
      notification = new Notification({
        receiver: currUser._id,
        title: i + " test",
        content: i + " test",
        status: "pending",
        checked: false,
      });
      await notification.save();
    }

    return "Created 50 unchecked Notification for testing...";
  },
  async deleteAllNotification(_, __, context) {
    await Notification.deleteMany({});
    return "Delete all notifications";
  },
  async checkNotification(_, { notificationID }, context) {
    const user = checkAuth(context);
    let errors = {};
    try {
      const searchedNotification = await Notification.findById(notificationID);

      if (!searchedNotification) {
        errors.general = "Notification do not exist";
        throw new UserInputError("Notification do not exist");
      }

      if (searchedNotification.receiver != user._id) {
        errors.general = "Receiver is not the current user";
        throw new UserInputError("Receiver is not the current user");
      }

      await Notification.findOneAndUpdate(
        {
          _id: notificationID,
        },
        { $set: { checked: true } }
      );
      return NotificationgqlParser(searchedNotification);
    } catch (err) {
      throw err;
    }
  },
};
