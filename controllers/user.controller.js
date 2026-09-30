import mongoose from "mongoose";

import User from "../models/User.js";

const ALLOWED_ROLES = ["Admin", "Analyst", "Estate Manager"];

/*
|--------------------------------------------------------------------------
| Get All Users
|--------------------------------------------------------------------------
*/

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("assignedEstate", "name estateCode district")
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
      message: error.message || "Failed to load users.",
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
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!name?.trim() || !email?.trim() || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required.",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    if (role === "Estate Manager" && !assignedEstate) {
      return res.status(400).json({
        success: false,
        message: "Estate Manager must have an assigned estate.",
      });
    }

    if (
      role === "Estate Manager" &&
      !mongoose.Types.ObjectId.isValid(assignedEstate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned estate ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Duplicate Email
    |--------------------------------------------------------------------------
    */

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,

      assignedEstate: role === "Estate Manager" ? assignedEstate : null,

      isActive: true,
    });

    await user.populate("assignedEstate", "name estateCode district");

    return res.status(201).json({
      success: true,

      message: "User created successfully.",

      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedEstate: user.assignedEstate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create user.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update User
|--------------------------------------------------------------------------
*/

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { name, email, password, role, assignedEstate } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      user.name = name.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty.",
        });
      }

      const emailOwner = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: id,
        },
      });

      if (emailOwner) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists.",
        });
      }

      user.email = normalizedEmail;
    }

    /*
    |--------------------------------------------------------------------------
    | Role
    |--------------------------------------------------------------------------
    */

    if (role !== undefined) {
      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role.",
        });
      }

      user.role = role;
    }

    /*
    |--------------------------------------------------------------------------
    | Assigned Estate
    |--------------------------------------------------------------------------
    */

    const finalRole = role || user.role;

    if (finalRole === "Estate Manager") {
      const finalEstate =
        assignedEstate !== undefined ? assignedEstate : user.assignedEstate;

      if (!finalEstate) {
        return res.status(400).json({
          success: false,
          message: "Estate Manager must have an assigned estate.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(finalEstate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned estate ID.",
        });
      }

      user.assignedEstate = finalEstate;
    } else {
      user.assignedEstate = null;
    }

    /*
    |--------------------------------------------------------------------------
    | Password
    |--------------------------------------------------------------------------
    */

    if (password !== undefined && password !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 6 characters.",
        });
      }

      /*
       * User model pre-save hook
       * automatically hashes this.
       */
      user.password = password;
    }

    await user.save();

    await user.populate("assignedEstate", "name estateCode district");

    return res.status(200).json({
      success: true,

      message: "User updated successfully.",

      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedEstate: user.assignedEstate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Activate / Deactivate User
|--------------------------------------------------------------------------
*/

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent Admin Deactivating Own Account
    |--------------------------------------------------------------------------
    */

    const currentUserId = req.user?.id || req.user?._id;

    if (String(currentUserId) === String(id) && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.isActive = isActive;

    await user.save();

    await user.populate("assignedEstate", "name estateCode district");

    return res.status(200).json({
      success: true,

      message: isActive
        ? "User activated successfully."
        : "User deactivated successfully.",

      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedEstate: user.assignedEstate,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update user status.",
    });
  }
};
