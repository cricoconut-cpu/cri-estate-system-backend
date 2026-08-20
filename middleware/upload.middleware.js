import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = {
    ".geojson": [
      "application/json",
      "application/geo+json",
      "text/plain",
      "application/octet-stream",
    ],

    ".json": [
      "application/json",
      "application/geo+json",
      "text/plain",
      "application/octet-stream",
    ],

    ".png": ["image/png", "application/octet-stream"],
  };

  const allowedMimeTypes = allowedExtensions[extension];

  if (allowedMimeTypes && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error(`Invalid file type for ${file.fieldname}.`), false);
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

export const surveyUpload = upload.fields([
  {
    name: "geoJson",
    maxCount: 1,
  },

  {
    name: "orthomosaic",
    maxCount: 1,
  },

  {
    name: "bounds",
    maxCount: 1,
  },
]);
