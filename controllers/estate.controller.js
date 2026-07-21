import * as estateService from "../services/estate.service.js";

export const getAllEstates = async (req, res, next) => {
  try {
    const estates = await estateService.getAllEstates(req.user);

    return res.status(200).json({
      success: true,
      message: "Estates retrieved successfully.",
      data: estates,
    });
  } catch (error) {
    next(error);
  }
};

export const getEstateById = async (req, res, next) => {
  try {
    const estate = await estateService.getEstateById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Estate retrieved successfully.",
      data: estate,
    });
  } catch (error) {
    next(error);
  }
};