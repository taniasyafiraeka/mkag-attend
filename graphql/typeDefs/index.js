const testingTypeDefs = require('./testing.type');
const facePhotoTypeDefs = require('./facePhoto.type');
const attendanceTypeDef = require('./attendance.type');
const personTypeDefs = require('./person.type');
const eventTypeDefs = require('./event.type');
const notificationTypeDefs = require('./notification.type');
const trxTypeDefs = require('./trx.type');

module.exports = [
  facePhotoTypeDefs,
  attendanceTypeDef,
  personTypeDefs,
  eventTypeDefs,
  notificationTypeDefs,
  trxTypeDefs
];
