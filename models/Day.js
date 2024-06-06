const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const getTodayMidnight = () => {
  let today = new Date();
  today.setHours(0, 0, 0, 0); // Set hours to 0 (midnight), minutes to 1, seconds to 0, and milliseconds to 0
  return today;
}

const DaySchema = new Schema({
  events: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  dayStart: {
    type: Date,
    default: getTodayMidnight,
  },
  totalEvents: {
    type: Number, default: 0 
  },
  totalSleepTime: {
    type: Number, default: 0 // in hours
  },
  totalSleepEvents: {
    type: Number, default: 0
  },
  totalNapTime: {
    type: Number, default: 0 // in hours
  },
  totalNapEvents: {
    type: Number, default: 0
  },
  totalMealEvents: {
    type: Number, default: 0
  },
  
});

module.exports = mongoose.model("Day", DaySchema);
