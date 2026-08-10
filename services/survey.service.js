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

  // 2. Check estate

  const estate = await Estate.findById(estateId);

  if (!estate) {
    throw new Error("Estate not found.");
  }

  // 3. Find existing survey

  const existingSurvey = await Survey.findOne({
    estate: estateId,
    year,
  });

  // 4. Create new upload version

  const uploadVersion = Date.now();

  const basePath = `estates/${estateId}/${year}/${uploadVersion}`;

  const geoJsonPath = `${basePath}/geojson/trees.geojson`;

  const imagePath = `${basePath}/orthomosaic/map.png`;

  const metadataPath = `${basePath}/metadata/map.png.aux.xml`;

  let uploadedFiles;

  try {
    // 5. Upload new files first

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

    // 6. Parse GeoJSON

    const geoJson = JSON.parse(files.geoJson[0].buffer.toString());

    const statistics = calculateSurveyStatistics(geoJson);

    // 7. Prepare survey data

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

    // 8. Update existing survey
    // or create new one

    let savedSurvey;

    if (existingSurvey) {
      Object.assign(existingSurvey, surveyData);

      savedSurvey = await existingSurvey.save();
    } else {
      savedSurvey = await Survey.create(surveyData);
    }

    // 9. Delete old files AFTER success

    if (existingSurvey) {
      const oldFiles = [
        existingSurvey.files.geoJson.path,

        existingSurvey.files.orthomosaic.imagePath,

        existingSurvey.files.orthomosaic.metadataPath,
      ];

      for (const filePath of oldFiles) {
        await deleteFile(filePath);
      }
    }

    return savedSurvey;
  } catch (error) {
    // If upload/update fails,
    // new files should be removed

    if (uploadedFiles) {
      await deleteFile(uploadedFiles.geoJson.path);

      await deleteFile(uploadedFiles.orthomosaic.image.path);

      await deleteFile(uploadedFiles.orthomosaic.metadata.path);
    }

    throw error;
  }
};
