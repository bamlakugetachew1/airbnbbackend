const jwt = require('jsonwebtoken');
exports.verifyToken = (req, res, next) => {
   try{
    let token = req.headers["authorization"];
        token = token && token.split(" ")[1];
    if (!token) {
      res.json({
        message: "we diddnt get a token",
      });
    } else {
      jwt.verify(token, process.env.SecretToken, (err, user) => {
        if (err) {
          res.send(err);
        } else {
          req.user = user;
          next();
        }
      });
    }
   }
   catch(err){
    console.log(err);
   }
};

