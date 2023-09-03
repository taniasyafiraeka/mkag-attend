const { model, Schema } = require("mongoose");

const attendanceSchema = new Schema(
  {
    event: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: "Remote"
    },
    isOn: {
      type: Boolean,
      default: true
    },
    date: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = model("Attendance", attendanceSchema);
