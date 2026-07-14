const generateToken = require("../utils/generateToken");
const { loginUser } = require("../services/auth.service");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          assignedEstate: user.assignedEstate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
