const { gql } = require('apollo-server');
module.exports = gql`
  type FacePhoto {
    _id: ID!
    creator: Person!
    photoURL: String!
    faceDescriptor: String!
    createdAt: String
    updatedAt: String
  }

  type FacePhotos {
    facePhotos: [FacePhoto!]
    hasNextPage: Boolean
  }

  type FaceProfile {
    member: Person!
    facePhotos: [FacePhoto!]
  }
  type FaceMatcher {
    event: Event!
    matcher: [FaceProfile!]
  }

  type Query {
    getFacePhotosCount: Int!
    getFacePhotos(cursor: ID, limit: Int!): FacePhotos
    getFaceMatcherInEvent(eventID: String!): FaceMatcher!
  }

  type Mutation {
    addFacePhoto(
      photoData: String!
      faceDescriptor: String!
    ): FacePhoto!
    deleteFacePhoto(photoID: ID!): String
  }
`;
