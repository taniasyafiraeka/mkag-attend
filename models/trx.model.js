const { model, Schema } = require("mongoose");

const trxSchema = new Schema(
  {
    attendance: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = model("trx", trxSchema);
