import multer from "multer";


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "application/json",
    "image/png",
    "text/xml",
    "application/xml",
  ];


  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type."
      ),
      false
    );
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