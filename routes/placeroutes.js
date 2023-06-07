const router = require("express").Router();
const placecontrollers = require("../controllers/placescontroller");
const verifytoken = require("../helper/verifytoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
  cloud_name: process.env.Cloudnry_Name,
  api_key: process.env.Cloudnry_Api,
  api_secret: process.env.Cloudnry_Secret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Airbnb",
    public_id: (req, file) => {
      return `${file.fieldname}_${Date.now()}`;
    },
  },
});
const upload = multer({ storage: storage });

// router
//   .route("/places/removeitems")
//   .post(verifytoken.verifyToken, placecontrollers.removeimages);

router.route("/places/searchquery").post(placecontrollers.searchhplacebyquery);
router;
router
  .route("/places/getplacebyuser")
  .get(verifytoken.verifyToken, placecontrollers.getplaceuploadbyuser);



router
  .route("/places/getbookedbyuser")
  .get(verifytoken.verifyToken, placecontrollers.getbookedplacebyuser);
router
  .route("/places/create")
  .post(verifytoken.verifyToken, placecontrollers.createplaces);
router.route("/places/allplaces/:page").get(placecontrollers.getallplaces);
router.route("/places/allplaceslength").get(placecontrollers.getallplaceslength);
router
  .route("/places/increaseview/:id")
  .get(placecontrollers.increaseviewcount);
router
  .route("/places/getchartdata/:id")
  .get(verifytoken.verifyToken, placecontrollers.getchartdata);
router
  .route("/places/:id")
  .get(placecontrollers.getsingleplacebyid)
  .delete(verifytoken.verifyToken, placecontrollers.deleteplaces)
  .patch(verifytoken.verifyToken, placecontrollers.updateplaces);
router.post(
  "/places/uploadimage",
  upload.array("placeimages"),
  placecontrollers.uploadimages
);
module.exports = router;
