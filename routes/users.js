var express = require('express');
var router = express.Router();
require('dotenv').config()
var bcrypt = require('bcrypt');
var mongoose = require('mongoose')
var bodyparser = require('body-parser')
const nodemailer = require("nodemailer");

var jwt = require('jsonwebtoken')
var { nanoid } = require("nanoid");
var ids = nanoid(5);

var {userdata}=require("../models/userflow");


let uri=process.env.URL
let jwtsecret=process.env.JWT






let sendmail=async (a)=>{
try{
  
let transporter = nodemailer.createTransport({

  service :"gmail",
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASS, 
  },
});

const mailData={
  from:"yourdetail90@gmail.com",
  subject:"Reset you account by clicking on the link",
  to:a.email,
  html:`<a href="http://localhost:5000/users/resetreq/${a.id}" target="_blank">click to reset<a>`
}


transporter.sendMail(mailData).then(res=>console.log(res)).catch(err=>console.log(err));

}

catch(err){
  console.log(err)
}
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('hello node');
});



router.post('/reg', async function (req, res, next) {

  try {
    await mongoose.connect(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });
    const salt = bcrypt.genSaltSync(10);

    let hash = await bcrypt.hash(req.body.password, salt)

    req.body.password = hash;
    await mongoose.connect(uri, { useNewUrlParser: true }, { useUnifiedTopology: true });
    let value = new userdata({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    })

    await value.save()

    await mongoose.disconnect()
  
    res.status(200).json({ "mess": "welcome" })
  }
  catch (err) {
    res.status(400).send({ err })

  }


})




router.post("/login", async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });


    let user = await userdata.findOne({ email: req.body.email })
  


    if (user) {

      let comp = await bcrypt.compare(req.body.password, user.password);
    
      if (comp) {

        let token = jwt.sign({ userid: user._id }, jwtsecret, { expiresIn: '1h' })

        
        res.json({ token: token })


        await mongoose.disconnect()


      }
      else {
        res.status(404).json({ "err": "invalid credentials" })
      }

    } else {
      res.status(404).json({ "err": "invalid credentials" })

    
    }

  }
  catch (err) {
    res.status(404).json({err})

  
  }

})








    
router.post("/reset",async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

    let user = await userdata.findOne({ email: { $eq: req.body.email } })
    if (user) {
    
      let identity = {};
      identity.id = ids;
      identity.email = req.body.email;

      await userdata.findOneAndUpdate({ email: req.body.email }, { $set: { resetid: ids } })

      
          sendmail(identity).then((result) => console.log("mail sent", result))
        .catch((error) => console.log(error))


      await mongoose.disconnect();

      res.json({ "mess": "reset ready" })
    }
    else {
      res.status(404).json({ "err": "user not found" })
    }

  } catch (err) {
  
    res.status(400).json({ err })

  }
})

router.get("/resetreq/:randstr",async (req,res)=>{
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

 


    let user = await userdata.findOne({ resetid: { $eq: req.params.randstr } })

  


    if (user) {

      
      res.redirect("http://localhost:3000/resetpassword")

      await mongoose.disconnect()

    

    }
    else {
      res.json({ "err": "invalid credentials" })
    }

  }
  catch (err) {
    res.json({ "err": "invalid credentials" })

  }

})

router.post("/resetpassword", async (req, res) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

    

    let user = await userdata.findOne({ email: { $eq: req.body.email } })




    if (user) {

      const salt = bcrypt.genSaltSync(10);

      let hash = await bcrypt.hash(req.body.password, salt)



      let doc = await userdata.updateOne({ _id: user._id }, {
        $set: { password: hash , resetid: "" } 
      });

  



      await mongoose.disconnect()

      res.json({ "mess": "password is reset" })

    }
    else {
      res.json({ "err": "invalid credentials" })
    }

  }
  catch (err) {
    res.json({ "err": "invalid credentials" })

    console.log(err)
  }

})


module.exports = router;
