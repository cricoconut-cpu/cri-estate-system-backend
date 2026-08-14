import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".geojson", ".json", ".png", ".xml"];

  const fileName = file.originalname.toLowerCase();

  const isAllowed = allowedExtensions.some((ext) => fileName.endsWith(ext));

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type."), false);
  }
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
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
    name: "metadata",
    maxCount: 1,
  },
]);
