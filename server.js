require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URL, err => {
  if (err) {
    console.error(err);
  } else {
    console.log('Connected to mongodb');
  }
});
app.listen(process.env.PORT, () => {
  console.log(`listing  ${process.env.PORT}...`);
});