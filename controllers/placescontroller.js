const Place = require("../models/placesmodel");
const Order = require("../models/ordermodel");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.Cloudnry_Name,
  api_key: process.env.Cloudnry_Api,
  api_secret: process.env.Cloudnry_Secret,
});
exports.uploadimages = (req, res) => {
  try {
    res.json({
      message: "success",
      imageurl: req.files,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getplaceuploadbyuser = async (req, res) => {
  try {
    let places = await Place.find({ ownerid: req.user.user._id })
      .select({ _id: 1, title: 1, photos: 1, description: 1 })
      .sort({ createdAt: -1 });
    res.json({
      data: places,
      length: places.length,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getbookedplacebyuser = async (req, res) => {
  try {
    let store = [];
    let ownerorderdid = await Order.find({ ownerid: req.user.user._id }).select(
      { placeid: 1, checkin: 1, checkout: 1, price: 1 }
    );
    for (let i = ownerorderdid.length - 1; i >= 0; i--) {
      let place = await Place.findById(ownerorderdid[i].placeid).select({
        _id: 1,
        title: 1,
        photos: 1,
        description: 1,
      });
      place.checkin = ownerorderdid[i].checkin;
      place.checkout = ownerorderdid[i].checkout;
      place.price = ownerorderdid[i].price;
      store.push(place);
    }

    res.json({
      data: store,
      length: store.length,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getallplaces = async (req, res) => {
  try {
    let limit = 8;
    let page = req.params.page || 1;
    let skip = (page - 1) * limit;
    let places = await Place.find()
      .select({ _id: 1, title: 1, photos: 1, description: 1, price: 1 })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    res.json({
      data: places,
      length: places.length,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getallplaceslength = async (req, res) => {
  try {
    let places = await Place.find();
    res.json({
      length: Math.ceil(places.length / 8),
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getsingleplacebyid = async (req, res) => {
  try {
    const { id } = req.params;
    let places = await Place.findById(id);
    res.json({
      data: places,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.searchhplacebyquery = async (req, res) => {
  try {
    const searchquery = req.body.searchquery;
    console.log(searchquery);
    let places = await Place.find({ $text: { $search: searchquery } });
    res.json({
      data: places,
    });
  } catch (err) {
    console.log(err);
  }
};

// exports.removeimages = async (req, res) => {
//   try {
//     let string =
//       "https://res.cloudinary.com/dwq2ftoo3/image/upload/v1685775901/Airbnb/placeimages_1685775894926.jpg";
//     if (string.slice(0, 26) == req.body.imageid.slice(0, 26)) {
//       let result = await cloudinary.uploader.destroy(
//         req.body.imageid.slice(62, req.body.imageid.length - 4)
//       );
//     }
//     res.json({
//       message: "image deleted",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };

exports.increaseviewcount = async (req, res) => {
  try {
    const { id } = req.params;
    let places = await Place.findById(id);
    places.views += 1;
    await Place.findByIdAndUpdate(id, { $set: places });

    res.json({
      message: "data updated",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getchartdata = async (req, res) => {
  try {
    const { id } = req.params;
    let place = await Place.find({ ownerid: id }).select({
      maxGuests: 1,
      price: 1,
      views: 1,
      title: 1,
    });
    res.json({
      data: place,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.createplaces = async (req, res) => {
  try {
    const place = new Place({
      ownerid: req.body.ownerid,
      title: req.body.title,
      Address: req.body.Address,
      photos: req.body.photos,
      description: req.body.description,
      perks: req.body.perks,
      extrainfo: req.body.extrainfo,
      checkin: req.body.checkin,
      checkout: req.body.checkout,
      maxGuests: req.body.maxGuests,
      price: req.body.price,
    });
    await place.save();
    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    console.log(err);
  }
};
async function removeimages(imageid) {
  let string =
    "https://res.cloudinary.com/dwq2ftoo3/image/upload/v1685775901/Airbnb/placeimages_1685775894926.jpg";
  if (string.slice(0, 26) == imageid.slice(0, 26)) {
    let result = await cloudinary.uploader.destroy(
      imageid.slice(62, imageid.length - 4)
    );
    console.log(result);
  }
}

exports.updateplaces = async (req, res) => {
  try {
    const { id } = req.params;
    const finalstore = req.body.finalstore;
    for (let i = 0; i < finalstore.length; i++) {
      if (req.body.photos.includes(finalstore[i]) == false) {
        removeimages(finalstore[i]);
      }
    }
    const place = {
      ownerid: req.body.ownerid,
      title: req.body.title,
      Address: req.body.Address,
      photos: req.body.photos,
      description: req.body.description,
      perks: req.body.perks,
      extrainfo: req.body.extrainfo,
      checkin: req.body.checkin,
      checkout: req.body.checkout,
      maxGuests: req.body.maxGuests,
      price: req.body.price,
    };
    await Place.findByIdAndUpdate(id, { $set: place });
    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteplaces = async (req, res) => {
  try {
    const { id } = req.params;
    const photos = await Place.findById(id).select({ photos: 1 });
    for (let i = 0; i < photos.photos.length; i++) {
      removeimages(photos.photos[i]);
    }
    await Place.findByIdAndRemove(id);
    await Order.deleteMany({ placeid: id });
    res.json({
      data: "deleted",
    });
  } catch (err) {
    console.log(err);
  }
};
