import Estate from "../models/Estate.js";

import { estateResponseDto } from "../utils/estate.dto.js";

/*
|--------------------------------------------------------------------------
| Helper: Service Error
|--------------------------------------------------------------------------
*/

const serviceError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

/*
|--------------------------------------------------------------------------
| Helper: Roles With Full Estate Access
|--------------------------------------------------------------------------
*/

const hasFullEstateAccess = (user) => {
  return user?.role === "Admin" || user?.role === "Analyst";
};

/*
|--------------------------------------------------------------------------
| Helper: Assigned Estate ID
|--------------------------------------------------------------------------
*/

const getAssignedEstateId = (user) => {
  if (!user?.assignedEstate) {
    return null;
  }

  /*
   * Supports both:
   *
   * ObjectId
   *
   * and populated:
   *
   * {
   *   _id: ...
   * }
   */

  return String(user.assignedEstate?._id || user.assignedEstate);
};

/*
|--------------------------------------------------------------------------
| Get All Estates
|--------------------------------------------------------------------------
*/

export const getAllEstates = async (user) => {
  /*
  |--------------------------------------------------------------------------
  | Admin + Analyst
  |--------------------------------------------------------------------------
  */

  if (hasFullEstateAccess(user)) {
    const estates = await Estate.find().populate("manager", "name email").sort({
      name: 1,
    });

    return estates.map(estateResponseDto);
  }

  /*
  |--------------------------------------------------------------------------
  | Estate Manager
  |--------------------------------------------------------------------------
  */

  if (user?.role === "Estate Manager") {
    const assignedEstateId = getAssignedEstateId(user);

    if (!assignedEstateId) {
      throw serviceError("No estate has been assigned to this account.", 403);
    }

    const estate = await Estate.findById(assignedEstateId).populate(
      "manager",
      "name email",
    );

    if (!estate) {
      throw serviceError("Assigned estate was not found.", 404);
    }

    /*
     * Return array because GET /estates
     * already returns an array.
     */

    return [estateResponseDto(estate)];
  }

  throw serviceError("You are not authorized to access estates.", 403);
};

/*
|--------------------------------------------------------------------------
| Get Estate By ID
|--------------------------------------------------------------------------
*/

export const getEstateById = async (estateId, user) => {
  /*
  |--------------------------------------------------------------------------
  | Check Permission BEFORE Fetching Estate
  |--------------------------------------------------------------------------
  */

  if (user?.role === "Estate Manager") {
    const assignedEstateId = getAssignedEstateId(user);

    if (!assignedEstateId) {
      throw serviceError("No estate has been assigned to this account.", 403);
    }

    if (String(estateId) !== assignedEstateId) {
      throw serviceError("You are not authorized to access this estate.", 403);
    }
  } else if (!hasFullEstateAccess(user)) {
    throw serviceError("You are not authorized to access this estate.", 403);
  }

  /*
  |--------------------------------------------------------------------------
  | Get Estate
  |--------------------------------------------------------------------------
  */

  const estate = await Estate.findById(estateId).populate(
    "manager",
    "name email",
  );

  if (!estate) {
    throw serviceError("Estate not found.", 404);
  }

  return estateResponseDto(estate);
};
