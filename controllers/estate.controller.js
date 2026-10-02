import * as estateService from "../services/estate.service.js";

/*
|--------------------------------------------------------------------------
| Error Response Helper
|--------------------------------------------------------------------------
*/

const sendError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
};

/*
|--------------------------------------------------------------------------
| Get All Estates
|--------------------------------------------------------------------------
*/

export const getAllEstates = async (req, res) => {
  try {
    const estates = await estateService.getAllEstates(req.user);

    return res.status(200).json({
      success: true,

      message: "Estates retrieved successfully.",

      data: estates,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

/*
|--------------------------------------------------------------------------
| Get Estate By ID
|--------------------------------------------------------------------------
*/

export const getEstateById = async (req, res) => {
  try {
    const estate = await estateService.getEstateById(req.params.id, req.user);

    return res.status(200).json({
      success: true,

      message: "Estate retrieved successfully.",

      data: estate,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
