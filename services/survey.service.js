export const createSurvey = async ({
  estateId,
  year,
  surveyDate,
  files,
  uploadedBy,
}) => {
  // 1. Validate required files

  if (!files?.geoJson || !files?.orthomosaic || !files?.bounds) {
    throw new Error("GeoJSON, orthomosaic image and bounds file are required.");
  }

  // 2. Check estate exists

  const estate = await Estate.findById(estateId);

  if (!estate) {
    throw new Error("Estate not found.");
  }

  // 3. Find existing survey for same estate + year

  const existingSurvey = await Survey.findOne({
    estate: estateId,
    year,
  });

  // 4. Save old file paths before replacement

  const oldFiles = existingSurvey
    ? {
        geoJson: existingSurvey.files.geoJson.path,

        image: existingSurvey.files.orthomosaic.imagePath,

        // Old surveys may still have metadataPath.
        // Keep this only for deleting previously uploaded surveys.
        metadata: existingSurvey.files.orthomosaic.metadataPath,
      }
    : null;

  // 5. Create new upload version

  const uploadVersion = Date.now();

  const basePath = `estates/${estateId}/${year}/${uploadVersion}`;

  const geoJsonPath = `${basePath}/geojson/trees.geojson`;

  const imagePath = `${basePath}/orthomosaic/map.png`;

  const boundsPath = `${basePath}/spatial/bounds.json`;

  let uploadedFiles = null;

  try {
    // 6. Upload new files

    const geoJsonFile = await uploadFile(files.geoJson[0], geoJsonPath);

    const imageFile = await uploadFile(files.orthomosaic[0], imagePath);

    const boundsFile = await uploadFile(files.bounds[0], boundsPath);

    uploadedFiles = {
      geoJson: geoJsonFile,

      orthomosaic: {
        image: imageFile,
      },

      bounds: boundsFile,
    };

    // 7. Parse GeoJSON

    const geoJson = JSON.parse(files.geoJson[0].buffer.toString("utf-8"));

    const statistics = calculateSurveyStatistics(geoJson);

    // 8. Parse bounds JSON

    const spatialData = JSON.parse(files.bounds[0].buffer.toString("utf-8"));

    // 9. Validate bounds structure

    if (
      !spatialData.crs ||
      !spatialData.bounds ||
      typeof spatialData.bounds.north !== "number" ||
      typeof spatialData.bounds.south !== "number" ||
      typeof spatialData.bounds.east !== "number" ||
      typeof spatialData.bounds.west !== "number"
    ) {
      throw new Error("Invalid bounds JSON format.");
    }

    // 10. Prepare survey data

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

          // No new AUX/XML metadata
          // metadata fields are intentionally omitted.
        },
      },

      spatial: {
        crs: spatialData.crs,

        bounds: {
          north: spatialData.bounds.north,

          south: spatialData.bounds.south,

          east: spatialData.bounds.east,

          west: spatialData.bounds.west,
        },
      },

      statistics,

      uploadedBy,

      status: "completed",
    };

    // 11. Create or replace survey

    let savedSurvey;

    if (existingSurvey) {
      Object.assign(existingSurvey, surveyData);

      savedSurvey = await existingSurvey.save();
    } else {
      savedSurvey = await Survey.create(surveyData);
    }

    // 12. Delete old files AFTER successful replacement

    if (oldFiles) {
      if (oldFiles.geoJson) {
        await deleteFile(oldFiles.geoJson);
      }

      if (oldFiles.image) {
        await deleteFile(oldFiles.image);
      }

      // Delete old AUX/XML if the previous
      // survey was uploaded using the old system.
      if (oldFiles.metadata) {
        await deleteFile(oldFiles.metadata);
      }
    }

    return savedSurvey;
  } catch (error) {
    // 13. Remove newly uploaded files
    // if anything fails

    if (uploadedFiles) {
      if (uploadedFiles.geoJson?.path) {
        await deleteFile(uploadedFiles.geoJson.path);
      }

      if (uploadedFiles.orthomosaic?.image?.path) {
        await deleteFile(uploadedFiles.orthomosaic.image.path);
      }

      if (uploadedFiles.bounds?.path) {
        await deleteFile(uploadedFiles.bounds.path);
      }
    }

    throw error;
  }
};
