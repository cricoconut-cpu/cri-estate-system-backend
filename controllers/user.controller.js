import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("assignedEstate", "name estateCode")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedEstate } = req.body;

    /*
    ------------------------------------------
    Basic validation
    ------------------------------------------
    */

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,

        message: "Name, email, password and role are required.",
      });
    }

    /*
    ------------------------------------------
    Estate Manager validation
    ------------------------------------------
    */

    if (role === "Estate Manager" && !assignedEstate) {
      return res.status(400).json({
        success: false,

        message: "Estate Manager must have an assigned estate.",
      });
    }

    /*
    ------------------------------------------
    Duplicate email
    ------------------------------------------
    */

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,

        message: "Email already exists.",
      });
    }

    /*
    ------------------------------------------
    Create user
    ------------------------------------------
    */

    const user = await User.create({
      name,

      email,

      password,

      role,

      assignedEstate: role === "Estate Manager" ? assignedEstate : null,
    });

    return res.status(201).json({
      success: true,

      message: "User created successfully.",

      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
