const { gql } = require('apollo-server');
module.exports = gql`
  extend type Mutation {
    #TODO: Remove this later
    testingRegisterMember(eventID: String!): String
    testingCreateEvent: String
    testingDeleteAllEvent: String

    createNotification: String
    deleteAllNotification: String

    obtainMemberWarning(participantID: ID!, eventID: String!): Int!

}
`;
