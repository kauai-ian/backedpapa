const express = require("express");
const router = express.Router();

const eventController = require("../controllers/event.controller");
const dayController = require("../controllers/day.controller")

router.post("/events", eventController.createEvent);
router.get("/events", eventController.listEvents)
router.get("/events/:_id", eventController.getEvent)
router.put("/events/:_id", eventController.editEvent);
router.delete("/events/:_id", eventController.deleteEvent);
router.post("/events/statistics", eventController.getStatistics);

router.get("/days", dayController.listDays);
router.get("/days/:_id", dayController.getDay);

module.exports = router;
