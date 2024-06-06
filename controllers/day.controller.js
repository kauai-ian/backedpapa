const Day = require('../models/Day');
const response = require('../helpers/response');


exports.listDays = async (req, res) => {
    try {
      const days = await Day.find().sort({ dayStart: -1 });
      return response({
        res,
        status: 200,
        message: "Days retrieved",
        data: days,
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
  
  exports.getDay = async (req, res) => {
    try {
      const { _id } = req.params;
      if (!_id) {
        return response({
          res,
          status: 400,
          message: "Missing required fields",
        });
      }
  
      const day = await Day.findById(_id);
      return response({
        res,
        status: 200,
        message: "Day retrieved",
        data: day,
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