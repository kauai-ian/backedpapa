const Event = require("../models/Event");
const Day = require("../models/Day");
const response = require("../helpers/response");
const getMidnightDate = require("../helpers/getMidnight");
const { cleanupDayEvents } = require("../helpers/cleanupDayEvents");

exports.createEvent = async (req, res) => {
  let statusCode = 200;
  try {
    if (!req?.body) {
      statusCode = 400;
      throw new Error("request body is missing");
    }
    const { eventType, notes, eventStart, eventEnd, _id } = req.body;
    const userId = req.user.sub;
    if (!eventType || !eventStart || !eventEnd) {
      statusCode = 400;
      throw new Error("Missing required fields");
    }
    const eventDateMidnight = getMidnightDate(eventStart);
    let day = await Day.findOne({ dayStart: eventDateMidnight });

    if (!day) {
      day = new Day({ events: [], dayStart: eventDateMidnight });
      await day.save();
      console.log("New day created:", day);
    }

    const newEvent = new Event({
      eventType,
      notes,
      eventStart,
      eventEnd,
      dayId: day._id,
      user: userId,
    });
    await newEvent.save();
    console.log("new event created:", newEvent);

    day.events.push(newEvent._id);
    await day.save();

    await exports.updateStatistics(day._id);

const updatedDay = await Day.findById(day._id);


    return response({
      res,
      status: 201,
      message: "Event created successfully",
      data: updatedDay,
    });
  } catch (error) {
    console.error(error);
    return response({
      res,
      status: statusCode,
      message: error.message,
    });
  }
};

exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventStart: -1 }); // Sort by eventStart in descending order
    return response({
      res,
      status: 200,
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error(error);
    return response({
      res,
      status: 500,
      message: "Server error",
    });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return response({
        res,
        status: 400,
        message: "Missing required fields",
      });
    }

    const event = await Event.findById(_id);
    if (!event) {
      return response({
        res,
        status: 404,
        message: "Event not found",
      });
    }
    return response({
      res,
      status: 200,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    console.error(error);
    return response({
      res,
      status: 500,
      message: "Server error",
    });
  }
};

exports.editEvent = async (req, res) => {
  let statusCode = 200;
  try {
    const { _id } = req.params;
    const { eventType, notes, eventStart, eventEnd } = req.body;
    console.log(req.body);
    if (!_id || !eventType || !eventStart || !eventEnd) {
      return response({
        res,
        status: 400,
        message: "missing required fields",
      });
    }

    const event = await Event.findById(_id);
    if (!event) {
      return response({
        res,
        status: 404,
        message: "Event not found",
      });
    }

    const originalDay = await Day.findById(event.dayId);
    const newDayStart = getMidnightDate(eventStart);

    //if event start date has changed, update the associated day
    if (originalDay.dayStart.getTime() !== newDayStart.getTime()) {
      const newDay =
        (await Day.findOne({ dayStart: newDayStart })) ||
        new Day({ dayStart: newDayStart, events: [] });

      // remove id from original days events array
      originalDay.events = originalDay.events.filter(
        (eventId) => eventId.toString() !== _id
      );
      await originalDay.save();
      //add event id to new days events array
      newDay.events.push(_id);
      await newDay.save();

      //update events day id
      event.dayId = newDay._id;
    }
    //update event details
    event.eventType = eventType;
    event.notes = notes;
    event.eventStart = eventStart;
    event.eventEnd = eventEnd;
    await event.save();

    //update statistics
    await exports.updateStatistics(originalDay._id);
    if (originalDay.dayStart.getTime() !== newDayStart.getTime()) {
      await exports.updateStatistics(event.dayId);
    }

    return response({
      res,
      status: 200,
      message: "event updated",
      data: event,
    });
  } catch (error) {
    console.error(error);
    return response({
      res,
      status: statusCode,
      message: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return response({
        res,
        status: 400,
        message: "missing required fields",
      });
    }

    const event = await Event.findByIdAndDelete(_id);
    if (!event) {
      return response({
        res,
        status: 404,
        message: "Event not found",
      });
    }

    const day = await Day.findById(event.dayId);
    if (!day) {
      return response({
        res,
        status: 404,
        message: "Associated day not found",
      });
    }

    day.events = day.events.filter((eventId) => eventId.toString() !== _id);
    await day.save();

    await Event.findByIdAndDelete(_id);

    await cleanupDayEvents();

    await exports.updateStatistics(day._id);

    return response({
      res,
      status: 200,
      message: "Event deleted and removed from day",
    });
  } catch (error) {
    console.error(error);
    return response({
      res,
      status: 500,
      message: "Server error",
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { eventTypes, eventStart, eventEnd } = req.body;

    if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
      return response({
        res,
        status: 400,
        message: "Invalid or missing event types ",
      });
    }

    const filter = {
      eventStart: { $gte: new Date(eventStart), $lte: new Date(eventEnd) },
    };

    const events = await Event.find({
      eventType: { $in: eventTypes },
      ...filter,
    });

    let totalEvents = events.length;
    let totalSleepTime = 0;
    let totalSleepEvents = 0;
    let totalNapTime = 0;
    let totalNapEvents = 0;
    let totalMealEvents = 0;
    let totalDiaperChanges = 0;
    let sleepEvents = [];
    let napEvents = []
   

    // console.log({
    //   eventTypes: eventType,
    //   eventStart: { $gte: new Date(eventStart) },
    //   eventEnd: { $lte: new Date(eventEnd) },
    // });

    events.forEach((event) => {
      const eventDuration = (event.eventEnd - event.eventStart) / (1000 * 60 * 60);
      
      if (event.eventType === "sleep") {
        totalSleepTime += eventDuration;
        totalSleepEvents++;
        sleepEvents.push({
          eventStart: event.eventStart,
          eventEnd: event.eventEnd
        })
      } else if (event.eventType === "nap") {
        totalNapTime += eventDuration;
        totalNapEvents++;
        napEvents.push({
          eventStart: event.eventStart,
          eventEnd: event.eventEnd
        })
      } else if (event.eventType === "meal") {
        totalMealEvents++;
      }
      else if (event.eventType === "diaper") {
        totalDiaperChanges++;
      }
    });

    const averageSleepTime = totalSleepEvents > 0 ? totalSleepTime / totalSleepEvents : 0;
    const averageNapTime = totalNapEvents > 0 ? totalNapTime / totalNapEvents : 0;

    const data = {
      totalEvents,
      totalSleepTime,
      totalSleepEvents,
      totalNapTime,
      totalNapEvents,
      totalMealEvents,
      averageSleepTime,
      averageNapTime,
      totalDiaperChanges,
      sleepEvents,
      napEvents
    };

    return response({
      res,
      status: 200,
      message: "Statistics retrieved successfully",
      data: data, // might need to be an object to access the properties
    });
  } catch (error) {
    console.error(error);
    return response({
      res,
      status: 500,
      message: "An error occurred while fetching statistics",
      error: error.message,
    });
  }
};

exports.updateStatistics = async (dayId) => {
  try {
    const day = await Day.findById(dayId).populate("events");
    if (!day) {
      throw new Error("Day not found");
    }

    let totalSleepTime = 0;
    let totalSleepEvents = 0;
    let totalNapTime = 0;
    let totalNapEvents = 0;
    let totalMealEvents = 0;
    let totalDiaperChanges = 0;

    day.events.forEach((event) => {
      const { eventType, eventStart, eventEnd } = event;
      if (!["sleep", "nap", "meal", "diaper"].includes(eventType)) {
        return response({
          res,
          status: 400,
          message: "invalid event type",
        });
      }

      if (eventType === "sleep") {
        const sleepDuration =
          (new Date(eventEnd) - new Date(eventStart)) / (1000 * 60 * 60);
        totalSleepTime += sleepDuration;
        totalSleepEvents++;
      } else if (eventType === "nap") {
        const napDuration =
          (new Date(eventEnd) - new Date(eventStart)) / (1000 * 60 * 60);
        totalNapTime += napDuration;
        totalNapEvents++;
      } else if (eventType === "meal") {
        totalMealEvents++;
      }
      else if (eventType === "diaper") {
        totalDiaperChanges++;
      }
      
    });

    day.totalSleepTime = totalSleepTime;
    day.totalSleepEvents = totalSleepEvents;
    day.totalNapTime = totalNapTime;
    day.totalNapEvents = totalNapEvents;
    day.totalMealEvents = totalMealEvents;
    day.totalDiaperChanges = totalDiaperChanges

    await day.save();
    console.log("statistics updated successfully");
    return day;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while updating statistics");
  }
};
