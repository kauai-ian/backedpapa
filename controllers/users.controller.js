const User = require("../models/User");
const response = require("../helpers/response");

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find();
    return response({
      res,
      status: 200,
      message: "Users retrieved successfully",
      data: users,
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

exports.getUserById = async (req, res) => {
  try {
    const { sub } = req.params;
    if (!sub) {
      return response({
        res,
        status: 400,
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ sub });
    if (!user) {
      return response({
        res,
        status: 404,
        message: "User not found",
      });
    }
    return response({
      res,
      status: 200,
      message: "User retrieved successfully",
      data: user,
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

exports.createUser = async (req, res) => {
  try {
    const { name, email, sub, displayName, picture } = req.body;
    // existing user
    const existingUser = await User.findOne({ sub
    });
    if (existingUser) {
      return response({
        res,
        status: 409,
        message: "User already exists",
        data: existingUser,
      });
    }    
    
    const newUser = new User({ name, email, sub, displayName });
    await newUser.save();
    return response({
      res,
      status: 201,
      message: "User created successfully",
      data: newUser,
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

exports.updateUser = async (req, res) => {
  try {
    const { sub } = req.params;
    const { body } = req;
    if (!sub || !body) {
      return response({
        res,
        status: 400,
        message: "Missing required fields",
      });
    }

    const updatedUser = await User.findOneAndUpdate({ sub }, body, {
      new: true,
    });
    return response({
      res,
      status: 200,
      message: "User updated successfully",
      data: updatedUser,
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

exports.deleteUser = async (req, res) => {
  try {
    const { sub } = req.params;
    if (!sub) {
      return response({
        res,
        status: 400,
        message: "Missing required fields",
      });
    }

    const user = await User.findOneAndDelete({ sub });
    if (!user) {
      return response({
        res,
        status: 404,
        message: "User not found",
      });
    }
    return response({
      res,
      status: 200,
      message: "User deleted successfully",
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


// TODO: Implement the following functions:
// - addConnection
// - removeConnection
// - getConnections
