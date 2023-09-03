const Person = require("../../models/person.model");
const Event = require("../../models/event.model");

const person = async (personID) => {
  try {
    const result = await Person.findById(personID);
    if (result) return PersongqlParser(result);
    else return null;
  } catch (err) {
    throw err;
  }
};

const people = async (personID) => {
  try {
    const results = await Person.find({ _id: { $in: personID } });
    return results.map((r) => {

        return PersongqlParser(r);
      });
  } catch (err) {
    throw err;
  }
};


const event = async (eventID) => {
  try {
    const result = await Event.findById(eventID);
    if (result) return EventgqlParser(result);
    else return null;
  } catch (err) {
    throw err;
  }
};

const eventUsingShortID = async (eventID) => {
  try {
    const result = await Event.findOne({ shortID: eventID });
    if (result) return EventgqlParser(result);
    else return null;
  } catch (err) {
    throw err;
  }
};

const events = async (eventList) => {
  try {
    return eventList.map((r) => {
      return EventgqlParser(r);
    });
  } catch (err) {
    throw err;
  }
};

const notifications = async (notificationList) => {
  try {
    return notificationList.map((r) => {
      return NotificationgqlParser(r);
    });
  } catch (err) {
    throw err;
  }
};

const PersongqlParser = (person, token) => {
  return {
    ...person._doc,
    createdAt: new Date(person._doc.createdAt).toISOString(),
    lastLogin: new Date(person._doc.lastLogin).toISOString(),
    token,
  };
};

const EventgqlParser = (event) => {
  return {
    ...event._doc,
    createdAt: new Date(event._doc.createdAt).toISOString(),
    updatedAt: new Date(event._doc.updatedAt).toISOString(),
    creator: person.bind(this, event._doc.creator),
    enrolledMembers: people.bind(this, event._doc.enrolledMembers),
  };
};

const EventsgqlParser = (eventsList) => {
  return {
    events: events.bind(this, eventsList),
  };
};


const NotificationgqlParser = (notification, hasNextPage) => {
  return {
    ...notification._doc,
    createdAt: new Date(notification._doc.createdAt).toISOString(),
    updatedAt: new Date(notification._doc.updatedAt).toISOString(),
    receiver: person.bind(this, notification._doc.receiver),
    hasNextPage,
  };
};

const NotificationsgqlParser = (notificationList, hasNextPage) => {
  return {
    notifications: notifications.bind(this, notificationList),
    hasNextPage,
  };
};

const AttendancegqlParser = (attendanceData) => {
  return {
    ...attendanceData._doc,
    event: eventUsingShortID.bind(this, attendanceData._doc.event),
  };
};

const TrxgqlParser = (trxData) => {
  return {
    ...trxData._doc,
    attendanceID: trxData._doc.attendance,
    memberID: trxData._doc.member,
    createdAt: new Date(trxData._doc.createdAt).toISOString(),
    updatedAt: new Date(trxData._doc.updatedAt).toISOString(),
  };
};

const FacePhotogqlParser = (photo) => {
  return {
    ...photo._doc,
    creator: person.bind(this, photo._doc.creator),
    createdAt: new Date(photo._doc.createdAt).toISOString(),
    updatedAt: new Date(photo._doc.updatedAt).toISOString(),
  };
};

const FacePhotosgqlParser = (photoList, hasNextPage) => {
  return {
    facePhotos: photoList.map((photo) => FacePhotogqlParser(photo)),
    hasNextPage,
  };
};

module.exports = {
  person,
  people,
  event,
  events,
  notifications,
  EventgqlParser,
  EventsgqlParser,
  PersongqlParser,
  NotificationgqlParser,
  NotificationsgqlParser,
  AttendancegqlParser,
  TrxgqlParser,
  FacePhotogqlParser,
  FacePhotosgqlParser,
};
