const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const userroutes = require("./routes/userroutes");
const placeroutes = require("./routes/placeroutes");
const app = express();
app.use(cors({ credentials: true, origin: "https://cloneairbnbet.netlify.app" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("combined"));
app.use("/api", placeroutes);
app.use("/api", userroutes);


module.exports = app;
