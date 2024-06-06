const mongoose = require('mongoose');
const Day = require('../models/Day'); 
const Event = require('../models/Event'); 

exports.cleanupDayEvents = async () => {
  try {
    const days = await Day.find();
    const cleanupPromises = days.map(async (day) => {
const validEventIds = []

await Promise.all(day.events.map(async (eventId) => {
    const eventExists = await Event.exists({_id: eventId})

    if (eventExists) {
        validEventIds.push(eventId)
    }
}))

if(validEventIds.length !== day.events.length) {
    day.events = validEventIds;
    await day.save()
    console.log(`Updated day ${day._id} with valid event IDs`)
}
    })

await Promise.all(cleanupPromises)
console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}