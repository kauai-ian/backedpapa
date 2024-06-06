 const getMidnightDate = (date) => {
    let midnight = new Date(date);
    midnight.setHours(0, 0, 0, 0); 
    return midnight;
  }

  module.exports = getMidnightDate