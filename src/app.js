const express = require("express");
const path = require("path");
const ejs = require("ejs");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const buyerAuth = require("./middleware/auth");
const { sendmail } = require("./controller/mailController");

require("./db/conn");

const store = new mongoDBStore({
  uri: "mongodb://localhost:27017/",
  databaseName: "Autonetics",
  collection: "sessions",
});

// Session
app.use(
  session({
    secret: "sunnysingh@23091998",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    resave: false,
    saveUninitialized: false,
    store: store,
    secure: true,
  })
  
);

const Request = require("./models/request");
const Buyer = require("./models/buyerSignups");

const port = process.env.PORT || 4000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", template_path);
app.use(express.static(static_path));

app.get("", (req, res) => {
  res.render("index", {
    isLogin: req.session.isLogin,
    msg: null,
  });
});

app.get("/requests", async (req, res) => {
  const Autonetics = await Request.find({})
  res.render("requests", {
    request: Autonetics,
    isLogin: req.session.isLogin,
    msg: null,
  });
});

app.get("/requests/:id", async (req,res) => {
  try {
    const Autonetics = await Request.findByIdAndDelete(req.params.id)
    res.redirect("/requests")
  } catch(error) {
    res.status(200)
    console.log(error);
  }
})

app.get("/buyerSignups", (req, res) => {
  res.render("buyerSignups", {
    isLogin: req.session.isLogin,
    msg: null,
  });
});

app.get("/buyerLogin", (req, res) => {
  res.render("buyerLogin", {
    isLogin: req.session.isLogin,
    msg: null,
  });
});

app.post("", async (req, res) => {
  try {
    const autoInc = await Request.find({});
    const requestCustomer = new Request({
      _id: autoInc.length + 1,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date: req.body.date,
    });

    const requested = await requestCustomer.save();
    res.status(201).render("index", {
      isLogin: req.session.isLogin,
      msg: null,

    });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/buyerSignups", async (req, res) => {
  try {
    const host = "http://localhost:4000";
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    const isMatch = await Buyer.findOne({ email });
    const token = jwt.sign(
      {
        email: email,
      },
      "saafghiuhbnbkjkhh",
      {
        expiresIn: "1h",
      }
    );
    if (isMatch && !isMatch.isVerified) {
      await sendmail(
        email,
        "Verify Email",
        `<!doctype html><html><head><meta name="viewport" content="width=device-width" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>NudgeAr</title><style>img{border:none;-ms-interpolation-mode:bicubic;max-width:100%}body{background-color:#f6f6f6;font-family:sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.4;margin:0;padding:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}table{border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%}table td{font-family:sans-serif;font-size:14px;vertical-align:top}.body{background-color:#f6f6f6;width:100%}.container{display:block;margin:0 auto !important;max-width:580px;padding:10px;width:580px}.content{box-sizing:border-box;display:block;margin:0 auto;max-width:580px;padding:10px}.main{background:#fff;border-radius:3px;width:100%}.wrapper{box-sizing:border-box;padding:20px}.content-block{padding-bottom:10px;padding-top:10px}.footer{clear:both;margin-top:10px;text-align:center;width:100%}.footer td, .footer p, .footer span, .footer a{color:#999;font-size:12px;text-align:center}h1,h2,h3,h4{color:#000;font-family:sans-serif;font-weight:400;line-height:1.4;margin:0;margin-bottom:30px}h1{font-size:35px;font-weight:300;text-align:center;text-transform:capitalize}p,ul,ol{font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px}p li, ul li, ol li{list-style-position:inside;margin-left:5px}a{color:#3498db;text-decoration:underline}.btn{box-sizing:border-box;width:100%}.btn>tbody>tr>td{padding-bottom:15px}.btn table{width:auto}.btn table td{background-color:#fff;border-radius:5px;text-align:center}.btn a{background-color:#fff;border:solid 1px #3498db;border-radius:5px;box-sizing:border-box;color:#3498db;cursor:pointer;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize}.btn-primary table td{background-color:#3498db}.btn-primary a{background-color:#3498db;border-color:#3498db;color:#fff}.last{margin-bottom:0}.first{margin-top:0}.align-center{text-align:center}.align-right{text-align:right}.align-left{text-align:left}.clear{clear:both}.mt0{margin-top:0}.mb0{margin-bottom:0}.preheader{color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0}.powered-by a{text-decoration:none}hr{border:0;border-bottom:1px solid #f6f6f6;margin:20px 0}@media only screen and (max-width: 620px){table[class=body] h1{font-size:28px !important;margin-bottom:10px !important}table[class=body] p, table[class=body] ul, table[class=body] ol, table[class=body] td, table[class=body] span, table[class=body] a{font-size:16px !important}table[class=body] .wrapper, table[class=body] .article{padding:10px !important}table[class=body] .content{padding:0 !important}table[class=body] .container{padding:0 !important;width:100% !important}table[class=body] .main{border-left-width:0 !important;border-radius:0 !important;border-right-width:0 !important}table[class=body] .btn table{width:100% !important}table[class=body] .btn a{width:100% !important}table[class=body] .img-responsive{height:auto !important;max-width:100% !important;width:auto !important}}@media all{.ExternalClass{width:100%}.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div{line-height:100%}.apple-link a{color:inherit !important;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;line-height:inherit !important;text-decoration:none !important}#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}.btn-primary table td:hover{background-color:#34495e !important}.btn-primary a:hover{background-color:#34495e !important;border-color:#34495e !important}}</style></head><body class=""> <span class="preheader">This is preheader text. Some clients will show this text as a preview.</span><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body"><tr><td>&nbsp;</td><td class="container"><div class="content"><table role="presentation" class="main"><tr><td class="wrapper"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td><p>Hi there,</p><p> Please confirm your email address by clicking the link below.</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"><tbody><tr><td align="left"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td> <a href="${host}/confirm-email/${token}" target="_blank">Confirm email address</a></td></tr></tbody></table></td></tr></tbody></table><p>We may need to send you critical information about our service and it is important that we have an accurate email address.</p></td></tr></table></td></tr></table><div class="footer"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="content-block"> <b>NudgeAr</b> <span class="apple-link">Support Team</span> <br> Don't like these emails? <a href="#">Unsubscribe</a>.</td></tr><tr><td class="content-block powered-by"> Powered by <a href="#">NudgeAr</a>.</td></tr></table></div></div></td><td>&nbsp;</td></tr></table></body></html>`
      );
      return res.render("buyerSignups", {
        isLogin: req.session.isLogin,
        msg:
          "You already registered but not verified. please verify your email ",
      });
    }

    if (isMatch) {
      return res.render("buyerSignups", {
        isLogin: req.session.isLogin,
        msg: "Email Already Exist",
      });
    }

    if (password !== cpassword) {
      return res.render("buyerSignups", {
        isLogin: req.session.isLogin,
        msg: "Password is not matching",
      });
    }

    const addBuyer = new Buyer({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phone: req.body.phone,
      password: password,
      confirmpassword: cpassword,
      address: req.body.address,
    });

    const buyerRegisterd = await addBuyer.save();
    await sendmail(
      email,
      "Verify Email",
      `<!doctype html><html><head><meta name="viewport" content="width=device-width" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>NudgeAr</title><style>img{border:none;-ms-interpolation-mode:bicubic;max-width:100%}body{background-color:#f6f6f6;font-family:sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.4;margin:0;padding:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}table{border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%}table td{font-family:sans-serif;font-size:14px;vertical-align:top}.body{background-color:#f6f6f6;width:100%}.container{display:block;margin:0 auto !important;max-width:580px;padding:10px;width:580px}.content{box-sizing:border-box;display:block;margin:0 auto;max-width:580px;padding:10px}.main{background:#fff;border-radius:3px;width:100%}.wrapper{box-sizing:border-box;padding:20px}.content-block{padding-bottom:10px;padding-top:10px}.footer{clear:both;margin-top:10px;text-align:center;width:100%}.footer td, .footer p, .footer span, .footer a{color:#999;font-size:12px;text-align:center}h1,h2,h3,h4{color:#000;font-family:sans-serif;font-weight:400;line-height:1.4;margin:0;margin-bottom:30px}h1{font-size:35px;font-weight:300;text-align:center;text-transform:capitalize}p,ul,ol{font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px}p li, ul li, ol li{list-style-position:inside;margin-left:5px}a{color:#3498db;text-decoration:underline}.btn{box-sizing:border-box;width:100%}.btn>tbody>tr>td{padding-bottom:15px}.btn table{width:auto}.btn table td{background-color:#fff;border-radius:5px;text-align:center}.btn a{background-color:#fff;border:solid 1px #3498db;border-radius:5px;box-sizing:border-box;color:#3498db;cursor:pointer;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize}.btn-primary table td{background-color:#3498db}.btn-primary a{background-color:#3498db;border-color:#3498db;color:#fff}.last{margin-bottom:0}.first{margin-top:0}.align-center{text-align:center}.align-right{text-align:right}.align-left{text-align:left}.clear{clear:both}.mt0{margin-top:0}.mb0{margin-bottom:0}.preheader{color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0}.powered-by a{text-decoration:none}hr{border:0;border-bottom:1px solid #f6f6f6;margin:20px 0}@media only screen and (max-width: 620px){table[class=body] h1{font-size:28px !important;margin-bottom:10px !important}table[class=body] p, table[class=body] ul, table[class=body] ol, table[class=body] td, table[class=body] span, table[class=body] a{font-size:16px !important}table[class=body] .wrapper, table[class=body] .article{padding:10px !important}table[class=body] .content{padding:0 !important}table[class=body] .container{padding:0 !important;width:100% !important}table[class=body] .main{border-left-width:0 !important;border-radius:0 !important;border-right-width:0 !important}table[class=body] .btn table{width:100% !important}table[class=body] .btn a{width:100% !important}table[class=body] .img-responsive{height:auto !important;max-width:100% !important;width:auto !important}}@media all{.ExternalClass{width:100%}.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div{line-height:100%}.apple-link a{color:inherit !important;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;line-height:inherit !important;text-decoration:none !important}#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}.btn-primary table td:hover{background-color:#34495e !important}.btn-primary a:hover{background-color:#34495e !important;border-color:#34495e !important}}</style></head><body class=""> <span class="preheader">This is preheader text. Some clients will show this text as a preview.</span><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body"><tr><td>&nbsp;</td><td class="container"><div class="content"><table role="presentation" class="main"><tr><td class="wrapper"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td><p>Hi there,</p><p> Please confirm your email address by clicking the link below.</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"><tbody><tr><td align="left"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td> <a href="${host}/confirm-email/${token}" target="_blank">Confirm email address</a></td></tr></tbody></table></td></tr></tbody></table><p>We may need to send you critical information about our service and it is important that we have an accurate email address.</p></td></tr></table></td></tr></table><div class="footer"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="content-block"> <b>NudgeAr</b> <span class="apple-link">Support Team</span> <br> Don't like these emails? <a href="#">Unsubscribe</a>.</td></tr><tr><td class="content-block powered-by"> Powered by <a href="#">NudgeAr</a>.</td></tr></table></div></div></td><td>&nbsp;</td></tr></table></body></html>`
    );

    res.status(201).render("index", {
      isLogin: req.session.isLogin,
      msg: "Please verify your email",
    });
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
  }
});

app.get("/confirm-email/:token", (req, res, next) => {
  const { token } = req.params;

  jwt.verify(token, "saafghiuhbnbkjkhh", async (err, verify) => {
    try {
      if (err) {
        return res
          .status(401)
          .send(
            `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>NudgeAr</title><style>@import url(https://fonts.googleapis.com/css?family=Sigmar+One);body{background:#f8f8fa;color:rgb(15,15,15);overflow:hidden}.congrats{position:absolute;top:140px;width:550px;height:100px;padding:20px 10px;text-align:center;margin:0 auto;left:0;right:0}h1{transform-origin:50% 50%;font-size:50px;font-family:'Sigmar One',cursive;cursor:pointer;z-index:2;position:absolute;top:0;text-align:center;width:100%}h3{background:#FFF;padding:25px;margin:50px 0;box-shadow:2px 2px 2px #f1e8e8}.blob{height:50px;width:50px;color:#fc0;position:absolute;top:45%;left:45%;z-index:1;font-size:30px;display:none}</style></head><body><div class="congrats"><h3>Sorry! you cannot accept this invitation now.</h3></div></body> <script>$(function(){var numberOfStars=200;for(var i=0;i<numberOfStars;i++){$('.congrats').append('<div class="blob fa fa-star '+i+'"> </div>');} animateText();animateBlobs();});$('.congrats').click(function(){reset();animateText();animateBlobs();});function reset(){$.each($('.blob'),function(i){TweenMax.set($(this),{x:0,y:0,opacity:1});});TweenMax.set($('h1'),{scale:1,opacity:1,rotation:0});} function animateText(){TweenMax.from($('h1'),0.8,{scale:0.4,opacity:0,rotation:15,ease:Back.easeOut.config(4),});} function animateBlobs(){var xSeed=_.random(350,380);var ySeed=_.random(120,170);$.each($('.blob'),function(i){var $blob=$(this);var speed=_.random(1,5);var rotation=_.random(5,100);var scale=_.random(0.8,1.5);var x=_.random(-xSeed,xSeed);var y=_.random(-ySeed,ySeed);TweenMax.to($blob,speed,{x:x,y:y,ease:Power1.easeOut,opacity:0,rotation:rotation,scale:scale,onStartParams:[$blob],onStart:function($element){$element.css('display','block');},onCompleteParams:[$blob],onComplete:function($element){$element.css('display','none');}});});}</script> </html>`
          );
      }
      const superAdmin = await Buyer.findOne({
        email: verify.email,
      });

      if (!superAdmin) {
        return res
          .status(401)
          .send(
            `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>NudgeAr</title><style>@import url(https://fonts.googleapis.com/css?family=Sigmar+One);body{background:#f8f8fa;color:rgb(15,15,15);overflow:hidden}.congrats{position:absolute;top:140px;width:550px;height:100px;padding:20px 10px;text-align:center;margin:0 auto;left:0;right:0}h1{transform-origin:50% 50%;font-size:50px;font-family:'Sigmar One',cursive;cursor:pointer;z-index:2;position:absolute;top:0;text-align:center;width:100%}h3{background:#FFF;padding:25px;margin:50px 0;box-shadow:2px 2px 2px #f1e8e8}.blob{height:50px;width:50px;color:#fc0;position:absolute;top:45%;left:45%;z-index:1;font-size:30px;display:none}</style></head><body><div class="congrats"><h3>Sorry! you cannot accept this invitation now.</h3></div></body> <script>$(function(){var numberOfStars=200;for(var i=0;i<numberOfStars;i++){$('.congrats').append('<div class="blob fa fa-star '+i+'"> </div>');} animateText();animateBlobs();});$('.congrats').click(function(){reset();animateText();animateBlobs();});function reset(){$.each($('.blob'),function(i){TweenMax.set($(this),{x:0,y:0,opacity:1});});TweenMax.set($('h1'),{scale:1,opacity:1,rotation:0});} function animateText(){TweenMax.from($('h1'),0.8,{scale:0.4,opacity:0,rotation:15,ease:Back.easeOut.config(4),});} function animateBlobs(){var xSeed=_.random(350,380);var ySeed=_.random(120,170);$.each($('.blob'),function(i){var $blob=$(this);var speed=_.random(1,5);var rotation=_.random(5,100);var scale=_.random(0.8,1.5);var x=_.random(-xSeed,xSeed);var y=_.random(-ySeed,ySeed);TweenMax.to($blob,speed,{x:x,y:y,ease:Power1.easeOut,opacity:0,rotation:rotation,scale:scale,onStartParams:[$blob],onStart:function($element){$element.css('display','block');},onCompleteParams:[$blob],onComplete:function($element){$element.css('display','none');}});});}</script> </html>`
          );
      }

      if (superAdmin.isVerified === true) {
        return res
          .status(401)
          .send(
            `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>NudgeAr</title><style>@import url(https://fonts.googleapis.com/css?family=Sigmar+One);body{background:#f8f8fa;color:rgb(15,15,15);overflow:hidden}.congrats{position:absolute;top:140px;width:550px;height:100px;padding:20px 10px;text-align:center;margin:0 auto;left:0;right:0}h1{transform-origin:50% 50%;font-size:50px;font-family:'Sigmar One',cursive;cursor:pointer;z-index:2;position:absolute;top:0;text-align:center;width:100%}h3{background:#FFF;padding:25px;margin:50px 0;box-shadow:2px 2px 2px #f1e8e8}.blob{height:50px;width:50px;color:#fc0;position:absolute;top:45%;left:45%;z-index:1;font-size:30px;display:none}</style></head><body><div class="congrats"><h3>Your email is already verified!</h3></div></body> <script>$(function(){var numberOfStars=200;for(var i=0;i<numberOfStars;i++){$('.congrats').append('<div class="blob fa fa-star '+i+'"> </div>');} animateText();animateBlobs();});$('.congrats').click(function(){reset();animateText();animateBlobs();});function reset(){$.each($('.blob'),function(i){TweenMax.set($(this),{x:0,y:0,opacity:1});});TweenMax.set($('h1'),{scale:1,opacity:1,rotation:0});} function animateText(){TweenMax.from($('h1'),0.8,{scale:0.4,opacity:0,rotation:15,ease:Back.easeOut.config(4),});} function animateBlobs(){var xSeed=_.random(350,380);var ySeed=_.random(120,170);$.each($('.blob'),function(i){var $blob=$(this);var speed=_.random(1,5);var rotation=_.random(5,100);var scale=_.random(0.8,1.5);var x=_.random(-xSeed,xSeed);var y=_.random(-ySeed,ySeed);TweenMax.to($blob,speed,{x:x,y:y,ease:Power1.easeOut,opacity:0,rotation:rotation,scale:scale,onStartParams:[$blob],onStart:function($element){$element.css('display','block');},onCompleteParams:[$blob],onComplete:function($element){$element.css('display','none');}});});}</script> </html>`
          );
      }
      superAdmin.isVerified = true;

      await superAdmin.save();
      return res.redirect("/buyerLogin");
    } catch (err) {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  });
});

app.post("/buyerLogin", async (req, res) => {
  try {
    const host = "http://localhost:4000";
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.render("buyerLogin", {
        isLogin: req.session.isLogin,
        msg: "All fields required",
      });
    }

    const buyerEmail = await Buyer.findOne({ email });

    if (!buyerEmail) {
      return res.render("buyerLogin", {
        isLogin: req.session.isLogin,
        msg: "Invalid Credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, buyerEmail.password);
    if (!isMatch) {
      return res.render("buyerLogin", {
        isLogin: req.session.isLogin,
        msg: "Invalid Credentials",
      });
    }

    if (!buyerEmail.isVerified) {
      const token = jwt.sign(
        {
          email: email,
        },
        "saafghiuhbnbkjkhh",
        {
          expiresIn: "1h",
        }
      );
      await sendmail(
        email,
        "jagjots28@gmail.com",
        `<!doctype html><html><head><meta name="viewport" content="width=device-width" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>NudgeAr</title><style>img{border:none;-ms-interpolation-mode:bicubic;max-width:100%}body{background-color:#f6f6f6;font-family:sans-serif;-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.4;margin:0;padding:0;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}table{border-collapse:separate;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%}table td{font-family:sans-serif;font-size:14px;vertical-align:top}.body{background-color:#f6f6f6;width:100%}.container{display:block;margin:0 auto !important;max-width:580px;padding:10px;width:580px}.content{box-sizing:border-box;display:block;margin:0 auto;max-width:580px;padding:10px}.main{background:#fff;border-radius:3px;width:100%}.wrapper{box-sizing:border-box;padding:20px}.content-block{padding-bottom:10px;padding-top:10px}.footer{clear:both;margin-top:10px;text-align:center;width:100%}.footer td, .footer p, .footer span, .footer a{color:#999;font-size:12px;text-align:center}h1,h2,h3,h4{color:#000;font-family:sans-serif;font-weight:400;line-height:1.4;margin:0;margin-bottom:30px}h1{font-size:35px;font-weight:300;text-align:center;text-transform:capitalize}p,ul,ol{font-family:sans-serif;font-size:14px;font-weight:normal;margin:0;margin-bottom:15px}p li, ul li, ol li{list-style-position:inside;margin-left:5px}a{color:#3498db;text-decoration:underline}.btn{box-sizing:border-box;width:100%}.btn>tbody>tr>td{padding-bottom:15px}.btn table{width:auto}.btn table td{background-color:#fff;border-radius:5px;text-align:center}.btn a{background-color:#fff;border:solid 1px #3498db;border-radius:5px;box-sizing:border-box;color:#3498db;cursor:pointer;display:inline-block;font-size:14px;font-weight:bold;margin:0;padding:12px 25px;text-decoration:none;text-transform:capitalize}.btn-primary table td{background-color:#3498db}.btn-primary a{background-color:#3498db;border-color:#3498db;color:#fff}.last{margin-bottom:0}.first{margin-top:0}.align-center{text-align:center}.align-right{text-align:right}.align-left{text-align:left}.clear{clear:both}.mt0{margin-top:0}.mb0{margin-bottom:0}.preheader{color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;visibility:hidden;width:0}.powered-by a{text-decoration:none}hr{border:0;border-bottom:1px solid #f6f6f6;margin:20px 0}@media only screen and (max-width: 620px){table[class=body] h1{font-size:28px !important;margin-bottom:10px !important}table[class=body] p, table[class=body] ul, table[class=body] ol, table[class=body] td, table[class=body] span, table[class=body] a{font-size:16px !important}table[class=body] .wrapper, table[class=body] .article{padding:10px !important}table[class=body] .content{padding:0 !important}table[class=body] .container{padding:0 !important;width:100% !important}table[class=body] .main{border-left-width:0 !important;border-radius:0 !important;border-right-width:0 !important}table[class=body] .btn table{width:100% !important}table[class=body] .btn a{width:100% !important}table[class=body] .img-responsive{height:auto !important;max-width:100% !important;width:auto !important}}@media all{.ExternalClass{width:100%}.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div{line-height:100%}.apple-link a{color:inherit !important;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;line-height:inherit !important;text-decoration:none !important}#MessageViewBody a{color:inherit;text-decoration:none;font-size:inherit;font-family:inherit;font-weight:inherit;line-height:inherit}.btn-primary table td:hover{background-color:#34495e !important}.btn-primary a:hover{background-color:#34495e !important;border-color:#34495e !important}}</style></head><body class=""> <span class="preheader">This is preheader text. Some clients will show this text as a preview.</span><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body"><tr><td>&nbsp;</td><td class="container"><div class="content"><table role="presentation" class="main"><tr><td class="wrapper"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td><p>Hi there,</p><p> Please confirm your email address by clicking the link below.</p><table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary"><tbody><tr><td align="left"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td> <a href="${host}/confirm-email/${token}" target="_blank">Confirm email address</a></td></tr></tbody></table></td></tr></tbody></table><p>We may need to send you critical information about our service and it is important that we have an accurate email address.</p></td></tr></table></td></tr></table><div class="footer"><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="content-block"> <b>NudgeAr</b> <span class="apple-link">Support Team</span> <br> Don't like these emails? <a href="#">Unsubscribe</a>.</td></tr><tr><td class="content-block powered-by"> Powered by <a href="#">NudgeAr</a>.</td></tr></table></div></div></td><td>&nbsp;</td></tr></table></body></html>`
      );
      return res.render("buyerLogin", {
        isLogin: req.session.isLogin,
        msg:
          "You already registered but not verified. please verify your email ",
      });
    }
    req.session.isLogin = true;
    await req.session.save();
    res.status(201).render("index", {
      isLogin: req.session.isLogin,
      msg: null,
    });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

app.get("/logout", buyerAuth, (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.status(200).redirect("/");
  });
});

app.get("/services", (req, res) => {
  res.render("service", {
    isLogin: req.session.isLogin,
  });
});

app.get("/faq", (req, res) => {
  res.render("faq", {
    isLogin: req.session.isLogin,
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    isLogin: req.session.isLogin,
  });
});

app.get("/sellerLogin", (req, res) => {
  res.render("sellerLogin", {
    isLogin: req.session.isLogin,
  });
});

app.get("/sellerSignup", (req, res) => {
  res.render("sellerSignup", {
    isLogin: req.session.isLogin,
  });
});

app.get("/about", buyerAuth, (req, res) => {
  res.render("about", {
    isLogin: req.session.isLogin,
  });
});

app.get("*", (req, res) => {
  res.render("404", {
    errorMsg: "Opps! Page Not Found",
  });
});

app.listen(port, () => {
  console.log(`Listening to the port ${port}`);
});
