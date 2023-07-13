const multer = require("multer");
const { MEDIA_ROOT } = require("../utils/constants");

// const uploads = multer({ dest: "../media/uploads" });

const storage = multer.diskStorage({
  /*destination: function (req, file, cb) {
    cb(null, `${MEDIA_ROOT}/uploads`); 
    // destination folder// throw erro when folder dont exist
  },*/
  destination: `${MEDIA_ROOT}/uploads`, //create folder if dont exists
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // filename
  },
});

module.exports = multer({ storage });
