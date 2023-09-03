const { gql } = require('apollo-server');
module.exports = gql`
  type Event {
    _id: ID!
    shortID: String!
    creator: Person!
    code: String!
    name: String!
    session: String!
    enrolledMembers: [Person!]
    attendanceList: [Attendance!]
    createdAt: String
  }

  type Events {
    events: [Event!]
  }

  input eventInput {
    code: String!
    name: String!
    session: String!
  }

  extend type Query {
    getEvents(currPage: Int!, pageSize: Int!): Events
    getEventsCount: Int!
    getParticipants(eventID: ID!): [Person!]
    getEvent(eventID: ID!): Event!

  }

  extend type Mutation {
    createEvent(eventInput: eventInput!): Event!
    deleteEvent(eventID: ID!): Event

    enrolEvent(eventID: ID!): String
    withdrawEvent(eventID: ID!): String
  }
`;
