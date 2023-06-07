const router = require("express").Router();
const usercontrollers = require("../controllers/usercontroller");
const verifyrfershtoken = require("../helper/verifyrefershtoken");
const verifytoken = require("../helper/verifytoken");
router
  .route(
    "/users/success/:name/:address/:phone/:ownerid/:placeid/:price/:checkin/:checkout"
  )
  .get(usercontrollers.successorder);
router.route("/users/cancel").get(usercontrollers.cancelorder);
router
  .route(
    "/users/chapaverify/:name/:address/:phone/:ownerid/:placeid/:price/:checkin/:checkout"
  )
  .get(usercontrollers.chapaverrify);
router
  .route("/users/paywithstripe")
  .post(verifytoken.verifyToken, usercontrollers.paywithstripe);
router
  .route("/users/paywithchapa")
  .post(verifytoken.verifyToken, usercontrollers.paywithchapa);
router.route("/users/register").post(usercontrollers.createusers);
router
  .route("/users/order")
  .post(verifytoken.verifyToken, usercontrollers.placeorder);
router.route("/users/login").post(usercontrollers.loginuser);
router.route("/users/loginwithgoogle").post(usercontrollers.loginwithgooge);
router.route("/users/signupwithgoogle").post(usercontrollers.signupwithgoogle);
router.route("/users/verifycaptcha").post(usercontrollers.verifyrecaptcha);
router
  .route("/users/refershtoken")
  .get(verifyrfershtoken.verifyToken, usercontrollers.handlerefershtoken);
module.exports = router;
