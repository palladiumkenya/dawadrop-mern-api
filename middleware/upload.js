const multer = require("multer");
const { MEDIA_ROOT, BASE_DIR } = require("../utils/constants");
const { default: slugify } = require("slugify");

// const uploads = multer({ dest: "../media/uploads" });

module.exports = ({ dest }) => {
  const storage = multer.diskStorage({
    destination: `${BASE_DIR}/${MEDIA_ROOT}${dest}`, //create folder if dont exists
    filename: function (req, file, cb) {
      cb(
        null,
        Date.now() +
          "-" +
          slugify(file.originalname, { lower: true, trim: true })
      ); // filename
    },
  });

  return multer({ storage });
};
