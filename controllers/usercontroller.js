const User = require("../models/usermodel");
const Order = require("../models/ordermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Googemodel = require("../models/goolemodel");
const axios = require("axios");
const paypal = require("paypal-rest-sdk");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

exports.createusers = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    await user.save();
    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    res.json({
      message: "This email alerady registerd",
    });
  }
};

exports.signupwithgoogle = async (req, res) => {
  try {
    const user = new Googemodel({
      username: req.body.username,
      email: req.body.email,
      imageurl: req.body.imageurl,
    });
    await user.save();
    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    res.json({
      message: "This email alerady registerd",
    });
  }
};

exports.loginwithgooge = async (req, res) => {
  try {
    const user = await Googemodel.findOne({ email: req.body.email });
    if (user != null) {
      const accessToken = jwt.sign({ user: user }, process.env.SecretToken, {
        expiresIn: "15m",
      });
      const refershToken = jwt.sign({ user: user }, process.env.RefreshToken, {
        expiresIn: "7d",
      });
      res.json({
        message: "success",
        userid: user._id,
        useremail: user.email,
        accessToken: accessToken,
        refershToken: refershToken,
        username: user.username,
      });
    } else {
      res.json({
        message: "no user found with this GoogleEmail",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.loginuser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user != null) {
      const validate = await bcrypt.compare(req.body.password, user.password);
      if (validate) {
        const accessToken = jwt.sign({ user: user }, process.env.SecretToken, {
          expiresIn: "15m",
        });
        const refershToken = jwt.sign(
          { user: user },
          process.env.RefreshToken,
          { expiresIn: "7d" }
        );

        res.json({
          message: "success",
          userid: user._id,
          useremail: user.email,
          accessToken: accessToken,
          refershToken: refershToken,
          username: user.username,
        });
      } else {
        res.json({
          message: "Incorrect Password",
        });
      }
    } else {
      res.json({
        message: "no user found with this Email",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.handlerefershtoken = async (req, res) => {
  try {
    const accessToken = jwt.sign(
      { user: req.user.user },
      process.env.SecretToken,
      {
        expiresIn: "15m",
      }
    );
    const refershToken = jwt.sign(
      { user: req.user.user },
      process.env.RefreshToken,
      { expiresIn: "7d" }
    );

    res.json({
      message: "success",
      userid: req.user.user._id,
      useremail: req.user.user.email,
      accessToken: accessToken,
      refershToken: refershToken,
      username: req.user.user.username,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.verifyrecaptcha = async (req, res) => {
  try {
    const { captchaValue } = req.body;
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SITE_SECRET}&response=${captchaValue}`
    );
    res.status(200).json({
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.placeorder = async (req, res) => {
  try {
    let { name, address, phone, ownerid, placeid, price, checkin, checkout } =
      req.body;
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `https://airbnb-jovi.onrender.com/api/users/success/${name}/${address}/${phone}/${ownerid}/${placeid}/${price}/${checkin}/${checkout}`,
        cancel_url: "https://airbnb-jovi.onrender.com/api/users/cancel",
      },
      transactions: [
        {
          item_list: {
            shipping_address: {
              recipient_name: name,
              city: address,
              phone: phone,
              state: address,
              country_code: "US",
              line1: address,
              line2: address,
              postal_code: "95131",
            },
          },

          amount: {
            currency: "USD",
            total: price,
          },
          description: "payment for your place reservtions",
        },
      ],
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.json({
              link: payment.links[i].href,
            });
          }
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
};
exports.successorder = async (req, res) => {
  try {
    let { name, address, phone, ownerid, placeid, price, checkin, checkout } =
      req.params;

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: price,
          },
        },
      ],
    };
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          const order = new Order({
            name: name,
            address: address,
            phone: phone,
            ownerid: ownerid,
            placeid: placeid,
            price: price,
            checkin: checkin,
            checkout: checkout,
          });
          await order.save();

          res.redirect("https://addishomefind.netlify.app/success");
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.cancelorder = async (req, res) => {
  try {
    res.redirect("https://addishomefind.netlify.app/cancel");
  } catch (err) {
    console.log(err);
  }
};

const stripeChargeCallback = (req, res) => async (stripeErr, stripeRes) => {
  if (stripeErr) {
    res.status(500).send({ error: stripeErr });
  } else {
    let { name, address, phone, ownerid, placeid, price, checkin, checkout } =
      req.body;
    const order = new Order({
      name: name,
      address: address,
      phone: phone,
      ownerid: ownerid,
      placeid: placeid,
      price: price,
      checkin: checkin,
      checkout: checkout,
    });
    await order.save();
    res.status(200).send({ success: stripeRes });
  }
};

exports.paywithstripe = async (req, res) => {
  try {
    const body = {
      source: req.body.token,
      amount: req.body.price,
      currency: "usd",
    };
    stripe.charges.create(body, stripeChargeCallback(req, res));
  } catch (err) {
    console.log(err);
  }
};

exports.paywithchapa = async (req, res) => {
  try {
    let { name, address, phone, ownerid, placeid, price, checkin, checkout } =
      req.body;
    let tx_ref = Date.now();
    tx_ref = tx_ref.toString();
    let paymentbody = {
      amount: price,
      currency: "ETB",
      phone_number: "0932223057",
      tx_ref: tx_ref,
      callback_url: `https://airbnb-jovi.onrender.com/api/users/chapaverify/${name}/${address}/${phone}/${ownerid}/${placeid}/${price}/${checkin}/${checkout}`,
      return_url: "https://addishomefind.netlify.app/success",
    };
    let response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      paymentbody,
      {
        headers: {
          Authorization: `Bearer CHASECK_TEST-z353MchAAChZd0XyBhq5rdlloP0w54dN`,
        },
      }
    );
    res.json({
      checkout_url: response.data.data.checkout_url,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.chapaverrify = async (req, res) => {
  try {
    let { name, address, phone, ownerid, placeid, price, checkin, checkout } =
      req.params;
          console.log(req.query);

   let response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${req.query.trx_ref}`,
      {
        headers: {
          Authorization: `Bearer CHASECK_TEST-z353MchAAChZd0XyBhq5rdlloP0w54dN`,
        },
      }
    );
    if (response.data.status == "success") {
      const order = new Order({
        name: name,
        address: address,
        phone: phone,
        ownerid: ownerid,
        placeid: placeid,
        price: price,
        checkin: checkin,
        checkout: checkout,
      });
      await order.save();
    }
  } catch (err) {
    console.log(err);
  }
};
