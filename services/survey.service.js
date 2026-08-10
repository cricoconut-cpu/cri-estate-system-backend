import Estate from "../models/Estate.js";
import Survey from "../models/Survey.js";

import {
    deleteFile,
    uploadFile,
} from "../utils/supabase.storage.js";

import {
    calculateSurveyStatistics,
} from "../utils/geojson.parser.js";



export const createSurvey = async ({
  estateId,
  year,
  surveyDate,
  files,
  uploadedBy,
}) => {


  // 1. Validate files

  if (
    !files?.geoJson ||
    !files?.orthomosaic ||
    !files?.metadata
  ) {

    throw new Error(
      "All survey files are required."
    );

  }



  // 2. Check estate exists

  const estate =
    await Estate.findById(
      estateId
    );


  if (!estate) {

    throw new Error(
      "Estate not found."
    );

  }



  // 3. Check existing survey

  const existingSurvey =
    await Survey.findOne({
      estate: estateId,
      year,
    });



  // 4. Delete previous files

  if (existingSurvey) {


    await deleteFile(
      existingSurvey.files.geoJson.path
    );


    await deleteFile(
      existingSurvey.files.orthomosaic.imagePath
    );


    await deleteFile(
      existingSurvey.files.orthomosaic.metadataPath
    );

  }



  // 5. Create storage paths

  const basePath =
    `estates/${estateId}/${year}`;



  const geoJsonPath =
    `${basePath}/geojson/trees.geojson`;


  const imagePath =
    `${basePath}/orthomosaic/map.png`;


  const metadataPath =
    `${basePath}/metadata/map.png.aux.xml`;




  // 6. Upload files


  const geoJsonFile =
    await uploadFile(
      files.geoJson[0],
      geoJsonPath
    );


  const imageFile =
    await uploadFile(
      files.orthomosaic[0],
      imagePath
    );


  const metadataFile =
    await uploadFile(
      files.metadata[0],
      metadataPath
    );




  // 7. Parse GeoJSON


  const geoJson =
    JSON.parse(
      files.geoJson[0]
      .buffer
      .toString()
    );


  const statistics =
    calculateSurveyStatistics(
      geoJson
    );




  // 8. Survey data


  const surveyData = {

    estate: estateId,

    year,

    surveyDate,


    files: {

      geoJson: {

        url: geoJsonFile.url,

        path: geoJsonFile.path,

      },


      orthomosaic: {

        imageUrl: imageFile.url,

        imagePath: imageFile.path,


        metadataUrl: metadataFile.url,

        metadataPath: metadataFile.path,

      },

    },


    statistics,


    uploadedBy,


    status: "completed",

  };




  // 9. Replace or create


  if (existingSurvey) {


    Object.assign(
      existingSurvey,
      surveyData
    );


    return await existingSurvey.save();

  }



  return await Survey.create(
    surveyData
  );


};