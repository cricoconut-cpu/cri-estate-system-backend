import Estate from "../models/Estate.js";
import Survey from "../models/Survey.js";

import { deleteFile, uploadFile } from "../utils/supabase.storage.js";

import { calculateSurveyStatistics } from "../utils/geojson.parser.js";

export const createSurvey = async ({
  estateId,
  year,
  surveyDate,
  files,
  uploadedBy,
}) => {
  // 1. Validate files

  if (!files?.geoJson || !files?.orthomosaic || !files?.metadata) {
    throw new Error("All survey files are required.");
  }

  // 2. Check estate exists

  const estate = await Estate.findById(estateId);

  if (!estate) {
    throw new Error("Estate not found.");
  }

  // 3. Find existing survey

  const existingSurvey = await Survey.findOne({
    estate: estateId,
    year,
  });

  // 4. Save old file paths BEFORE replacement

  const oldFiles = existingSurvey
    ? {
        geoJson: existingSurvey.files.geoJson.path,

        image: existingSurvey.files.orthomosaic.imagePath,

        metadata: existingSurvey.files.orthomosaic.metadataPath,
      }
    : null;

  // 5. Create new upload version

  const uploadVersion = Date.now();

  const basePath = `estates/${estateId}/${year}/${uploadVersion}`;

  const geoJsonPath = `${basePath}/geojson/trees.geojson`;

  const imagePath = `${basePath}/orthomosaic/map.png`;

  const metadataPath = `${basePath}/metadata/map.png.aux.xml`;

  let uploadedFiles = null;

  try {
    // 6. Upload new files first

    const geoJsonFile = await uploadFile(files.geoJson[0], geoJsonPath);

    const imageFile = await uploadFile(files.orthomosaic[0], imagePath);

    const metadataFile = await uploadFile(files.metadata[0], metadataPath);

    uploadedFiles = {
      geoJson: geoJsonFile,

      orthomosaic: {
        image: imageFile,

        metadata: metadataFile,
      },
    };

    // 7. Parse GeoJSON

    const geoJson = JSON.parse(files.geoJson[0].buffer.toString());

    const statistics = calculateSurveyStatistics(geoJson);

    // 8. Prepare survey data

    const surveyData = {
      estate: estateId,

      year,

      surveyDate,

      files: {
        geoJson: {
          url: uploadedFiles.geoJson.url,

          path: uploadedFiles.geoJson.path,
        },

        orthomosaic: {
          imageUrl: uploadedFiles.orthomosaic.image.url,

          imagePath: uploadedFiles.orthomosaic.image.path,

          metadataUrl: uploadedFiles.orthomosaic.metadata.url,

          metadataPath: uploadedFiles.orthomosaic.metadata.path,
        },
      },

      statistics,

      uploadedBy,

      status: "completed",
    };

    // 9. Create or replace survey

    let savedSurvey;

    if (existingSurvey) {
      Object.assign(existingSurvey, surveyData);

      savedSurvey = await existingSurvey.save();
    } else {
      savedSurvey = await Survey.create(surveyData);
    }

    // 10. Delete old files after successful replacement

    if (oldFiles) {
      await deleteFile(oldFiles.geoJson);

      await deleteFile(oldFiles.image);

      await deleteFile(oldFiles.metadata);
    }

    return savedSurvey;
  } catch (error) {
    // Cleanup newly uploaded files if something fails

    if (uploadedFiles) {
      await deleteFile(uploadedFiles.geoJson.path);

      await deleteFile(uploadedFiles.orthomosaic.image.path);

      await deleteFile(uploadedFiles.orthomosaic.metadata.path);
    }

    throw error;
  }
};

export const getSurveyByEstateYear = async (estateId, year) => {
  const survey = await Survey.findOne({
    estate: estateId,
    year,
  })
    .populate("estate", "name district area")
    .populate("uploadedBy", "name email role");

  if (!survey) {
    throw new Error("Survey not found.");
  }

  return survey;
};

export const getEstateSurveys = async (
  estateId
) => {


  const surveys =
    await Survey.find({
      estate: estateId,
    })
    .sort({
      year: -1,
      surveyDate: -1,
    })
    .select(
      "year surveyDate statistics status createdAt"
    );


  if (!surveys.length) {

    throw new Error(
      "No surveys found for this estate."
    );

  }


  return surveys;

};