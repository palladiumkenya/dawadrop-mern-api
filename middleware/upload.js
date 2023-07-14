const multer = require("multer");
const { PROFILE_MEDIA, MEDIA_ROOT, BASE_DIR } = require("../utils/constants");
const { default: slugify } = require("slugify");

// const uploads = multer({ dest: "../media/uploads" });

const storage = multer.diskStorage({
  /*destination: function (req, file, cb) {
    cb(null, `${MEDIA_ROOT}/uploads`); 
    // destination folder// throw erro when folder dont exist
  },*/
  destination: `${BASE_DIR}/${MEDIA_ROOT}${PROFILE_MEDIA}`, //create folder if dont exists
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + slugify(file.originalname, { lower: true, trim: true })
    ); // filename
  },
});

module.exports = multer({ storage });
