import Estate from "../models/Estate.js";
import Survey from "../models/Survey.js";
import User from "../models/User.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const totalEstates = await Estate.countDocuments();

    const totalUsers = await User.countDocuments();

    const totalSurveys = await Survey.countDocuments();

    const latestSurvey = await Survey.findOne()
      .sort({
        createdAt: -1,
      })
      .populate("estate", "name")
      .populate("uploadedBy", "name");

    return res.status(200).json({
      success: true,

      data: {
        totalEstates,

        totalUsers,

        totalSurveys,

        latestSurvey,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
