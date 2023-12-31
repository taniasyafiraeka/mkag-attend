const Trx = require("../../models/trx.model");
const { TrxgqlParser } = require("./merge");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getTrx(_, { trxInput: { attendanceID, memberID } }, context) {
      const user = checkAuth(context);

      try {
        const trx = await Trx.findOne({
          attendance: attendanceID,
          member: memberID,
        });
        if (!trx) throw new Error("Transaction does not exist");
        return TrxgqlParser(trx);
      } catch (err) {
        throw err;
      }
    },
    async getTrxListInAttendance(_, {attendanceID}, context) {
      const user = checkAuth(context);

      try {
        const trxList = await Trx.find({
          attendance: attendanceID,
        });
        return trxList.map((trx) => TrxgqlParser(trx));
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    async createTrx(_, { trxInput: { attendanceID, memberID } }, context) {
      const user = checkAuth(context);

      try {
        const existingTrx = await Trx.find({
          attendance: attendanceID,
          member: memberID,
        });

        if (existingTrx.length <= 0) {
          const trx = new Trx({
            attendance: attendanceID,
            member: memberID,
          });
          await trx.save();
          return "Attendance Recorded";
        }

        return "";
      } catch (err) {
        throw err;
      }
    },
  },
};
