const { gql } = require('apollo-server');
module.exports = gql`
  type Attendee {
    attendance: Attendance!
    person: Person!
  }

  type Attendance {
    _id: ID!
    event: Event!
    time: String!
    date: String!
    mode: String!
    isOn: Boolean!
  }

  type AttendanceListInEvent {
    event: Event!
    attendanceList: [Attendance!]
  }

  input attendanceInput {
    time: String!
    date: String!
    eventID: String!
  }
  extend type Query {
    getAttendance(attendanceID: ID!): Attendance!
    getAttendanceListCountInEvent(eventID: String!): Int!
    getAttendanceListInEvent(eventID: String!, currPage: Int!, pageSize: Int!): AttendanceListInEvent!
  }
  extend type Mutation {
    createAttendance(attendanceInput: attendanceInput!): Attendance!
    editAttendanceMode(attendanceID: ID!, mode: String!): Attendance!
    editAttendanceOnOff(attendanceID: ID!, isOn: Boolean!): Attendance!

    deleteAttendance(attendanceID: ID!): Attendance!
  }
`;
