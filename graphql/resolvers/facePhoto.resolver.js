const { UserInputError } = require("apollo-server");

const Person = require("../../models/person.model");
const FacePhoto = require("../../models/facePhoto.model");
const Event = require("../../models/event.model");

const checkAuth = require("../../util/check-auth");
const { cloudinary } = require("../../util/cloudinary");

const {
  PersongqlParser,
  EventgqlParser,
  FacePhotogqlParser,
  FacePhotosgqlParser,
} = require("./merge");

module.exports = {
  Query: {
    async getFacePhotosCount(_, __, context) {
      const currUser = checkAuth(context);
      try {
        const existingPhotos = await FacePhoto.find(
          {
            creator: currUser._id,
          },
          ["id"]
        );
        return existingPhotos.length;
      } catch (err) {
        throw err;
      }
    },

    async getFacePhotos(_, { cursor, limit }, context) {
      const currUser = checkAuth(context);
      try {
        let photos;
        if (!cursor) {
          photos = await FacePhoto.find({
            creator: currUser._id,
          })
            .limit(limit)
            .sort({ _id: -1 });
        } else {
          photos = await FacePhoto.find({
            creator: currUser._id,
            _id: { $lt: cursor },
          })
            .limit(limit)
            .sort({ _id: -1 });
        }
        let hasNextPage = true;

        if (photos.length < limit) hasNextPage = false;

        return FacePhotosgqlParser(photos, hasNextPage);
      } catch (err) {
        throw err;
      }
    },
    async getFaceMatcherInEvent(_, { eventID }, context) {
      const currUser = checkAuth(context);

      try {
        const event = await Event.findOne({ shortID: eventID });
        if (!event){
          throw new Error("Event does not exist.");
        }
        if (
          event.creator != currUser._id &&
          !event.enrolledMembers.find((stud) => stud._id == currUser._id)
        ) {
          throw new Error(
            "Access Prohibited. You are not the owner of the event or join this event"
          );
        }
        const matcher = event.enrolledMembers.map(async (stud) => {
          const photos = await FacePhoto.find({ creator: stud });
          const member = await Person.findById(stud);

          return {
            member: PersongqlParser(member),
            facePhotos: photos.map((photo) => FacePhotogqlParser(photo)),
          };
        });

        return { event: EventgqlParser(event), matcher: matcher };
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    async addFacePhoto(_, { photoData, faceDescriptor }, context) {
      const currUser = checkAuth(context);
      try {
        const uploadedResponse = await cloudinary.uploader.upload(photoData, {
          folder: `Attendlytical/FaceGallery/${currUser._id}`,
        });

        const facePhoto = new FacePhoto({
          creator: currUser._id,
          photoURL: uploadedResponse.secure_url,
          photoPublicID: uploadedResponse.public_id,
          faceDescriptor,
        });

        await facePhoto.save();
        return FacePhotogqlParser(facePhoto);
      } catch (err) {
        throw err;
      }
    },
    async deleteFacePhoto(_, { photoID }, context) {
      checkAuth(context);
      try {
        const targetPhoto = await FacePhoto.findById(photoID);
        if (!targetPhoto) throw new UserInputError("Photo not exist");
        await cloudinary.uploader.destroy(targetPhoto.photoPublicID);
        await FacePhoto.deleteOne(targetPhoto);
        return "Delete Success";
      } catch (err) {
        throw err;
      }
    },
  },
};
