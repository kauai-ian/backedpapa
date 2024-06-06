const response = ({ res, status, message, data }) => {
    return res.status(status).json({ message, data });
  };
  
  module.exports = response;