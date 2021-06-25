const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const moment = require('moment-timezone');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const PDFDocument = require ('pdfkit');
const nodemailer = require('nodemailer');
const server = require('../scripts/constants');
const shell = require('shelljs');
const upload = require('../scripts/aws')

const Invitation = require('../models/invitation');
const User = require('../models/user');
const Info = require('../models/infocard');

// load module
var vuforia = require('vuforia-api');

// init client with valid credentials
var client = vuforia.client({

    // provision_access_key
    'accessKey': 'c3abfd916b3ccc42c7328641f6dc4a290853ddfc',

    // server_secret_key
    'secretKey': '46fae2f9393785fe36e952563c3eccc32449aa4e'
});

// util for base64 encoding and decoding
var util = vuforia.util();



const Domain = "https://studio.augmoar.com"
// const Domain = "http://localhost:3030"

//Post Sign Up
router.post('/signup', function(req, res, next) {
  User.findOne({email:req.body.email}).then(function(data){
      if(!data)
      {
        User.create(req.body).then(function(data) {
          res.send({status: "success",message:"user created successfully",data})
        })
      }else{
          res.send({status:"error", message:"user already exist"})
      }
  }).catch(next);
});


//Post Service Request
router.delete('/user/:id', function(req, res, next) {
  User.findByIdAndRemove({_id:req.params.id}).then(function(data) {
      User.find({},null,{sort:{date:-1}}).then(function(data) {
          res.send(data);
      });
  }).catch(next);
});


//User login
router.post('/login', function(req, res, next) {
  User.findOne({email:req.body.email,password:req.body.password}).then(function(data) {
      if(data){
          // if(data.confirmed){
              res.send({status:"success",data})
          // }else{
          //     res.send({status:"email not confirmed"})
          // }
      }else{
          res.send({status:"email or password incorrect"})
      }
  }).catch(next);
});


//Forget Pass
router.post('/forget_password', function(req, res, next) {
  User.findOne({
    email: req.body.email
  }).then(function(data) {
    if (data) {
      //Send mail
      nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "md-in-77.webhostbox.net", port: 465, secure: true, // true for 465, false for other ports
          auth: {
            user: "kishore@augmo.net", // generated ethereal user
            pass: "QAZwsx!@123" // generated ethereal password
          }
        });

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"Augmo | Augmented Reality" <kishore@augmo.net>', // sender address
          to: req.body.email, // list of receivers
          subject: 'Forget Password Request', // Subject line
          text: '', // plain text body
          html: '<h5>Please click this link to reset your password:</h5><a href='+server.server+'/?email='+req.body.email+'&id='+data._id+'>Reset password</a>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          res.send({status: "success", message:"password sent to your email successfully"})
        });
      });
    } else {
      res.send({error: "invalid email id"});
    }
  }).catch(next);
});


//Reset Pass
router.post('/reset_password', function(req, res, next) {
  console.log(req.body)
  User.findOne({
    email: req.body.email
  }).then(function(data) {
  console.log(data)
  if (data) {
      if(data.password === req.body.oldpassword)
      {
          User.findOneAndUpdate({email:req.body.email},{password:req.body.newpassword}).then(function(data){
              res.send({status:"success",message:"password changed successfully"})
          })
      }else{
          res.send({status:"incorrect password"})
      }
    } else {
      res.send({status: "email not exist"});
    }
  }).catch(next);
});

//Reset Password from email
router.post('/reset_password_from_mail', function(req, res, next) {
  User.findOne({
    email: req.body.email,
    _id:req.body.id
  }).then(function(data) {
    if (data) {
      User.findOneAndUpdate({email:req.body.email},{password:req.body.newpassword}).then(function(data){
          res.send({status:"success",message:"password changed successfully"})
      })
    } else {
      res.send({status: "email not exist"});
    }
  }).catch(next);
});

//Post Invitation
router.post('/invitation', function(req, res, next) {
  Invitation.create(req.body).then(function(data) {
    res.send(data);
  }).catch(next);
});

//Post Invitation
router.get('/invitation/:id', function(req, res, next) {
  Invitation.find({email:req.params.id}).then(function(data) {
    res.send(data);
  }).catch(next);
});

//Post Invitation
router.delete('/invitation/:id', function(req, res, next) {
  Invitation.findByIdAndRemove({_id:req.params.id}).then(function(data) {
    Invitation.find({name:"Kishore kumar"}).then(function(data) {
      res.send(data);
    }).catch(next);
  }).catch(next);
});

//Invitation Image
router.post('/invitationimage', function(req, res, next) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let File = req.files.invitationImage;
  let filename = req.files.invitationImage.name;
  filename = filename.replace(/\s/g, '');
  //filename = path.pathname(filename)
  let name = path.parse(filename).name
  let ext = path.parse(filename).ext
  ext = ext.toLowerCase()
  filename = name + Date.now() + ext
  console.log(filename)
  // Use the mv() method to place the file somewhere on your server
  File.mv('assets/images/invitations/' + filename, function(err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      let image = Domain+'/assets/images/invitations/' + filename;
      console.log(image)

      var target = {
        // name of the target, unique within a database
        'name': filename,
        // width of the target in scene unit
        'width': 1.0,
        // the base64 encoded binary recognition image data
        'image': util.encodeFileBase64('assets/images/invitations/' + filename),
        // indicates whether or not the target is active for query
        'active_flag': true,
        // the base64 encoded application metadata associated with the target
        'application_metadata': util.encodeBase64('some metadata about your image')
      };

      client.addTarget(target, function (error, result) {
        if (error) { // e.g. [Error: AuthenticationFailure]
            console.error({result});
            if(result.result_code==="BadImage")
            {
              res.send({error:"Bad Image"})
            }
        } else {
          console.log({result});
          if(result.result_code==="TargetCreated"){
            //Check if duplicate target exist
              client.checkForDuplicateTargets(result.target_id, function (error, duplicate) {

              console.log(duplicate)
              if(duplicate.similar_targets.length<1)
              {
                var getTarget = setInterval(function(){
                  client.retrieveTarget(result.target_id, function (error, result) {

                    console.log(result)
                    if(result.target_record.tracking_rating !== -1)
                    {
                      res.send({status:"success",response:result, image});
                      clearInterval(getTarget);
                    }
                  })
                }, 3000);
              }else{
                res.send({error:"Duplicate target exist"})

                var getTarget = setInterval(function(){
                client.deleteTarget(result.target_id, function (error, result) {
                  console.log(result)
                  if(result.result_code === "Success")
                  {
                    clearInterval(getTarget);
                  }else if(result.result_code==="UnknownTarget"){
                    res.send({status:"No target exist"})
                    clearInterval(getTarget)
                  }
                })
              }, 3000);
              }
            })
            .catch(error => {
              console.log(error);
            }).catch(next);
          }
        }
    });
    }
  })
});


//Post Invitation
router.get('/gettarget/:id', function(req, res, next) {
  client.retrieveTarget(req.params.id, function (error, result) {
    console.log(result);
    res.send(result);
  })
});

//Post Invitation
router.get('/getsummary/:id', function(req, res, next) {
  axios.get(Domain+'/vuforia/Summary.php?target_id='+req.params.id)
  .then(response => {
    console.log(response.data);
    res.send(response.data);
  })
  .catch(error => {
    console.log(error);
  }).catch(next);
});

//Delete Invitation
router.delete('/deleteinvitationimage/:id', function(req, res, next) {
  var deleteTarget = setInterval(function(){
    client.deleteTarget(req.params.id, function (error, result) {
    console.log(result);
    if(result.result_code==="Success")
    {
      res.send(response.data);
      clearInterval(deleteTarget);
    }else if(result.result_code==="UnknownTarget"){
      res.send(response.data)
      clearInterval(deleteTarget)
    }
  })
}, 3000);
});

//Delete Gallery Image
router.delete('/deleteinvitationvideo', function(req, res, next) {
  console.log(req.body.image);
  fs.unlink("./"+req.body.image, (err) => {
    // if (err) throw err;
    res.send({status:"success"})
    console.log('successfully deleted ');
  });
});

//Delete Gallery Image
router.delete('/deletegalleryimage', function(req, res, next) {
  // console.log(req.body.image);
  // fs.unlink("./"+req.body.image, (err) => {
  //   if (err) throw err;
    res.send({status:"success"})
  //   console.log('successfully deleted ');
  // });
});


//Invitation Video
router.post('/invitationvideo', async function(req, res, next) {
// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
let File = req.files.invitationVideo;
let file_name = req.files.invitationVideo.name;
file_name = file_name.replace(/\s/g, '');
//filename = path.pathname(filename)
let name = path.parse(file_name).name
let ext = path.parse(file_name).ext
ext = ext.toLowerCase()
file_name = name + Date.now() + ext
// let video_url =
// Use the mv() method to place the file somewhere on your server
File.mv('assets/videos/youtube/' + file_name, async function(err) {
  if (err) {
    return res.status(500).send(err);
  } else {
    upload('assets/videos/youtube/' + file_name, file_name, function(cb, location){
      console.log("file uploaded")
      console.log(location)
    // shell.exec("ffmpeg -i " +'assets/videos/youtube/' + file_name + " -vcodec h264 -acodec libfdk_aac -vf scale=480:-2,setsar=1:1 "+'assets/videos/compressed/'+file_name, function(code, stdout, stderr){
      res.send({status:"success", url:location
    // })
    })
  });
  }
})
});


//Gallery Images
router.post('/galleryimages', function(req, res, next) {
  let images = [];
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  console.log(Object.keys(req.files).length);

  for(let i=0;i<Object.keys(req.files).length;i++)
  {
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let File = req.files['galleryImages'+[i]];
  let filename = req.files['galleryImages'+[i]].name;
  filename = filename.replace(/\s/g, '');
  //filename = path.pathname(filename)
  let name = path.parse(filename).name
  let ext = path.parse(filename).ext
  ext = ext.toLowerCase()
  filename = name + Date.now() + ext

  // Use the mv() method to place the file somewhere on your server
  File.mv('assets/images/gallery/' + filename, function(err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      upload('assets/images/gallery/' + filename, filename, function(cb, location){ 
      images.push(location)
      if(i===Object.keys(req.files).length-1)
      {
        res.send({
          url: images,
          status: 'success'
        })
      }
  })
}
})
}
});


//Gallery Video
router.post('/galleryvideo', function(req, res, next) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let File = req.files.galleryVideo;
  let filename = req.files.galleryVideo.name;
  filename = filename.replace(/\s/g, '');
  //filename = path.pathname(filename)
  let name = path.parse(filename).name
  let ext = path.parse(filename).ext
  ext = ext.toLowerCase()
  filename = name + Date.now() + ext
  // Use the mv() method to place the file somewhere on your server
  File.mv('assets/videos/gallery/' + filename, function(err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.send({
        url: Domain+'/assets/videos/gallery/' + filename,
        status: 'success'
      })
    }
  })
});

router.post('/delete_all',function(req, res, next){
  if(req.body.metadata.productCategory==="invitation")
  {
    var deleteTarget = setInterval(function(){
      // axios.get(Domain+'/vuforia/DeleteTarget.php?target_id='+req.body.metadata.vuforia.target_record.target_id)
      // .then(response => {
        client.deleteTarget(req.body.metadata.vuforia.target_record.target_id, function (error, result) {
        console.log(result);
        if(result.result_code==="Success")
        {
          Invitation.findByIdAndRemove({_id:req.body._id}).then(invitation=>{
            Invitation.find({email:req.body.email}).then(invitation=>{
            res.send({status:"success",data:invitation});
            clearInterval(deleteTarget);
          })
        })
        }else if(result.result_code==="UnknownTarget"){
          Invitation.findByIdAndRemove({_id:req.body._id}).then(invitation=>{
            Invitation.find({email:req.body.email}).then(invitation=>{
              res.send({status:"No target exist",data:invitation})
            clearInterval(deleteTarget);
          })
        })
        }
      })
      // .catch(error => {
      //   console.log(error);
      // }).catch(next);
    }, 3000);
  }else if(req.body.metadata.productCategory==="photo")
  {
    let photos = req.body.metadata.photos.filter(photo=>photo.vuforia.target_record.target_id)
    if(photos.length>0)
    {
      for(let i=0; i<photos.length; i++){
          console.log(photos[i].vuforia.target_record)
          // axios.get(Domain+'/vuforia/DeleteTarget.php?target_id='+photos[i].vuforia.target_record.target_id)
          // .then(response => {
            client.deleteTarget(photos[i].vuforia.target_record.target_id, function (error, result) {

            if(result.result_code==="Success")
            {
              if(i === photos.length-1)
              {
                Invitation.findByIdAndRemove({_id:req.body._id}).then(invitation=>{
                  Invitation.find({email:req.body.email}).then(invitation=>{
                    res.send({status:"success",data:invitation});
                  })
                })
              }
            }else if(result.result_code==="UnknownTarget"){
              Invitation.findByIdAndRemove({_id:req.body._id}).then(invitation=>{
              })
              // res.send({status:"success"})
            }
          })
      }
    }
  }
})

router.post('/delete_all_to_logout',function(req, res, next){
  if(req.body.project.vuforia)
  {
    Invitation.findOne({"metadata.vuforia.target_record.target_id":req.body.project.vuforia.target_record.target_id}).then(invitation=>{
      if(!invitation){
        var deleteTarget = setInterval(function(){
          // axios.get(Domain+'/vuforia/DeleteTarget.php?target_id='+req.body.vuforia.target_record.target_id)
          // .then(response => {
            client.deleteTarget(req.body.vuforia.target_record.target_id, function (error, result) {

            console.log(response.data);
            if(result.result_code==="Success")
            {
              // res.send({status:"success",data:invitation});
              clearInterval(deleteTarget);
            }else if(result.result_code==="UnknownTarget"){
              // res.send({status:"No target exist",data:invitation})
              clearInterval(deleteTarget);
            }
          })
        }, 3000);
      }
    })
  }
  if(req.body.photo._id)
  {
    Invitation.findOne({_id:req.body.photo._id}).then(photo=>{
      if(!photo)
      {
        let photos = req.body.metadata.photos.filter(photo=>photo.vuforia.target_record.target_id)
        if(photos.length>0)
        {
          for(let i=0; i<photos.length; i++){
            client.deleteTarget(req.body.vuforia.target_record.target_id, function (error, result) {

              // axios.get(Domain+'/vuforia/DeleteTarget.php?target_id='+photos[i].vuforia.target_record.target_id)
              // .then(response => {
              if(result.result_code==="Success")
              {
                if(i === photos.length-1)
                {
                  // res.send({status:"success",data:invitation});
                }
              }else if(result.result_code==="UnknownTarget"){
                console.log(result.result_code)
              }
            })
          }
        }
      }
    })
  }
  res.send({status:"success"})
})



//User Login
router.post('/sendotp', function(req, res, next) {
  let phone = 91+req.body.phone;
  let otp   = Math.floor(999 + Math.random() * 9000);
  axios.get(Domain+'/aqua/src/otp.php?otp='+otp+'&phone='+phone)
  .then(response => {
    console.log(response.data);
    if(response.data.status === 'success')
    {
      res.send({status:"success",otp:otp,response:response.data})
    }
  })
  .catch(error => {
    console.log(error);
  }).catch(next);
});

//Send metadata
router.post('/sendmetadata', function(req, res, next) {
  req.body.metadata.limit = 10;
  var update = {
    'application_metadata': util.encodeBase64(JSON.stringify(req.body.metadata))
  };
  
  var getTarget = setInterval(function(){
    client.updateTarget(req.body.target_id, update, function (error, result) {

  // axios.get(Domain+'/vuforia/UpdateTarget.php?target_id='+req.body.target_id+'&metadata='+encodeURIComponent(JSON.stringify(req.body.metadata)))
  // .then(response => {
    console.log(result);
    if(result.result_code==="Success")
    {
      req.body.metadata.published = true;
      Invitation.findOne({target_id:req.body.target_id}).then(invitation=>{
        if(!invitation){
          Invitation.create(req.body).then(function(data) {
            res.send({status:"success"});
          }).catch(next);
        }else{
          Invitation.findOneAndUpdate({target_id:req.body.target_id},req.body).then(function(data) {
            res.send({status:"success"});
          }).catch(next);
        }
      })
      clearInterval(getTarget);
    }else if(result.result_code==="UnknownTarget"){
      clearInterval(getTarget);
    }
  })
}, 3000);
});


router.post('/send_payment_details', function(req, res, next) {
  var getTarget = setInterval(function(){
  req.body.data.limit = 10000
  var update = {
    'application_metadata': util.encodeBase64(JSON.stringify(req.body.data))
  };
  // axios.get(Domain+'/vuforia/UpdateTarget.php?target_id='+req.body.data.vuforia.target_record.target_id+'&metadata='+encodeURIComponent(JSON.stringify(req.body.data)))
  // .then(response => {
    client.updateTarget(req.body.data.vuforia.target_record.target_id, update, function (error, result) {
    if(result.result_code==="Success")
    {
      Invitation.findOne({target_id:req.body.data.vuforia.target_record.target_id}).then(invitation=>{
        if(invitation){
          Invitation.findOneAndUpdate({target_id:req.body.data.vuforia.target_record.target_id},{metadata:req.body.data}).then(function(data) {
            User.findOneAndUpdate({email:req.body.data.email},{address:req.body.address}).then(user=>{
              // Capture the payment
              var data = {
                amount:req.body.data.payment.totalamount*100
              }
              axios.post('https://rzp_live_BLJqjMmbrn3TrC:XRsGa0iWxiklsNpbyM6rmXOV@api.razorpay.com/v1/payments/'+req.body.data.payment.payment_id+'/capture',data)
                .then(response => {
                  if(response.data.status === "captured")
                  {
                    res.send({status:"success"});
                  }else{
                    res.send(response.data.error);
                  }
                })
                .catch(error => {
                  res.send({error:error.response});
                }).catch(next);
            })
          }).catch(next);
        }
      })
      clearInterval(getTarget);
    }else if(result.result_code==="UnknownTarget"){
      clearInterval(getTarget);
    }
  })
}, 3000);
});

router.post('/send_payment_details_photo', function(req, res, next) {
  console.log(req.body)

  let photos = req.body.totalImages
  photos = photos.map(photo=>{
    photo.payment = {
      payment:true,
      payment_id: req.body.payment_id,
      totalAmount:req.body.totalAmount,
      gst:req.body.gst
    }
    return photo
  })
  if(photos.length>0)
    {
      for(let i=0; i<photos.length; i++){
        var getTarget = setInterval(function(){
          photos[i].limit = 10000
          var update = {
            'application_metadata': util.encodeBase64(JSON.stringify(photos[i]))
          };
          client.updateTarget(req.body.data.vuforia.target_record.target_id, update, function (error, result) {

          // axios.get(Domain+'/vuforia/UpdateTarget.php?target_id='+photos[i].vuforia.target_record.target_id+'&metadata='+encodeURIComponent(JSON.stringify(photos[i])))
          // .then(response => {
            console.log(result)
            if(result.result_code==="Success")
            {
              if(i===photos.length-1){
                Invitation.findByIdAndUpdate({_id:req.body._id},{"metadata.payment":photos[i].payment,"metadata._id":req.body._id}).then(photo=>{
                  // Capture the payment
                  var data = {
                    amount:req.body.totalAmount*100
                  }
                  console.log(req.body.payment_id)
                  axios.post('https://rzp_live_BLJqjMmbrn3TrC:XRsGa0iWxiklsNpbyM6rmXOV@api.razorpay.com/v1/payments/'+req.body.payment_id+'/capture',data)
                .then(response => {
                  console.log(response.data);
                  if(response.data.status === "captured")
                  {
                    res.send({status:"success"});
                  }else{
                    res.send(response.data.error);
                  }
                })
                .catch(error => {
                  res.send(error);
                }).catch(next);
                })
              }
              clearInterval(getTarget);
            }else if(result.result_code==="UnknownTarget"){
              clearInterval(getTarget);
            }
          })
        }, 3000);
      }
    }
});



//Send metadata
router.post('/send_metadata_photo', function(req, res, next) {
  req.body.metadata.limit = 10;
  var update = {
    'application_metadata': util.encodeBase64(JSON.stringify(req.body.metadata))
  };
  var getTarget = setInterval(function(){
    client.updateTarget(req.body.target_id, update, function (error, result) {
  // axios.get(Domain+'/vuforia/UpdateTarget.php?target_id='+req.body.target_id+'&metadata='+encodeURIComponent(JSON.stringify(req.body.metadata)))
  // .then(response => {
    console.log(result);
    if(result.result_code==="Success")
    {
      req.body.metadata.published = true;
      let photos = {};
      photos.metadata = req.body.photos;
      photos._id      = req.body.photos._id;
      photos.email      = req.body.photos.email;
      photos.metadata.photos[req.body.index].published = true;
      photos.metadata.payment = {
        payment:false
      };
      if(req.body.photos._id){
        Invitation.findById({_id:photos._id}).then(invitation=>{
          if(!invitation){
            Invitation.create(photos).then(function(invitation) {
              Invitation.findOneAndUpdate({_id:invitation._id},{"metadata._id":invitation._id}).then(function(invitation) {
              console.log(invitation)
                res.send({status:"success",_id:invitation._id});
              }).catch(next);
          }).catch(next);
          }else{
            Invitation.findOneAndUpdate({_id:photos._id},photos).then(function(invitation) {
              res.send({status:"success",_id:invitation._id});
            }).catch(next);
          }
        })
      }else{
        Invitation.create(photos).then(function(invitation) {
          Invitation.findOneAndUpdate({_id:invitation._id},{"metadata._id":invitation._id}).then(function(invitation) {
            console.log(invitation)
              res.send({status:"success",_id:invitation._id});
            }).catch(next);
        }).catch(next);
      }
      clearInterval(getTarget);
    }
  })
}, 3000);
});

router.post('/delete_all_to_create_new_project',function(req, res, next){
  if(req.body.type==="invitation")
  {
    if(req.body.invitation.vuforia)
    {
      var getTarget = setInterval(function(){
        client.deleteTarget(req.body.invitation.vuforia.target_record.target_id, function (error, result) {

      // axios.get(Domain+'/vuforia/DeleteTarget.php?target_id='+req.body.invitation.vuforia.target_record.target_id)
      // .then(response => {
        console.log(result);
        if(result.result_code==="Success")
        {
          clearInterval(getTarget);
        }else if(result.result_code==="UnknownTarget"){
          clearInterval(getTarget);
        }
      })
    }, 3000);
    }
  }else if(req.body.type==="photo")
  {
    let photos = req.body.photo.photos.filter(photo=>photo.vuforia.target_record.target_id)
    if(photos.length>0)
    {
      for(let i=0; i<photos.length; i++){
        var getTarget = setInterval(function(){
          client.deleteTarget(req.body.invitation.vuforia.target_record.target_id, function (error, result) {
          // axios.get(Domain+'/vuforia/DeleteTarget.php?target_id='+photos[i].vuforia.target_record.target_id)
          // .then(response => {
            console.log(result)
            if(result.result_code==="Success")
            {
              clearInterval(getTarget);
            }else if(result.result_code==="UnknownTarget"){
              clearInterval(getTarget);
            }
          })
        }, 3000);
      }
    }
  }
  res.status(200).send({status:"success"});
})

//Post Personal Details
router.post('/personal_details', function(req, res, next) {
  User.findOneAndUpdate({email:req.body.id},req.body).then(function(data) {
    User.findOne({phone:req.body.phone}).then(function(data) {
      res.status(201).send(data);
    }).catch(next);
  }).catch(next);
});

//Get Personal Details
router.get('/personal_details', function(req, res, next) {
  User.findOne({email:req.body.email}).then(function(data) {
    res.send(data);
  }).catch(next);
});

//Vendor Logo
router.post('/vendor_logo', function(req, res, next) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let File = req.files.vendor_logo;
  let filename = req.files.vendor_logo.name;
  filename = filename.replace(/\s/g, '');
  //filename = path.pathname(filename)
  let name = path.parse(filename).name
  let ext = path.parse(filename).ext
  ext = ext.toLowerCase()
  filename = name + Date.now() + ext
  // Use the mv() method to place the file somewhere on your server
  File.mv('assets/images/vendor/' + filename, function(err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      res.send({
        url: Domain+'/assets/images/vendor/' + filename,
        status: 'success'
      })
    }
  })
});

//Post Personal Details
router.post('/manage_address', function(req, res, next) {
  User.findOneAndUpdate({email:req.body.id},{address:req.body.address}).then(function(data) {
    User.findOne({email:req.body.id}).then(function(data) {
      res.send(data);
    }).catch(next);
  }).catch(next);
});

//Post Personal Details
router.post('/buy_info_card', function(req, res, next) {
  Info.create(req.body).then(function(data) {
      res.send(data);
  }).catch(next);
});

//Like
router.post('/like/:target_id', function(req, res, next) {
  Invitation.findOneAndUpdate({target_id:req.params.target_id},{$inc:{"metadata.likes":1},$push:{"metadata.likes_history":req.body}}).then(invitation=>{
    Invitation.findOne({target_id:req.params.target_id}).then(invitation=>{
      res.send(invitation);
    })
  }).catch(next);
});

//Comment
router.post('/comment/:target_id', function(req, res, next) {
  console.log(req.body)
  Invitation.findOneAndUpdate({target_id:req.params.target_id},{$push:{"metadata.comments":req.body}}).then(invitation=>{
    Invitation.findOne({target_id:req.params.target_id}).then(invitation=>{
      res.send(invitation);
    })
  }).catch(next);
});

//Get Invitation
router.post('/likes_and_comments/:target_id', function(req, res, next) {
    Invitation.findOne({target_id:req.params.target_id}).then(invitation=>{
      res.send(invitation);
  }).catch(next);
});

//Get Invitation
router.post('/likes_history/:target_id', function(req, res, next) {
  function onlyUnique(value, index, self) {
    return self.indexOf(value.udid) === index;
  }
  Invitation.findOne({target_id:req.params.target_id}).then(invitation=>{
    console.log(invitation)
    let like_history = invitation.metadata.likes_history.filter(onlyUnique)
    console.log(like_history)
    res.send({like_history});
}).catch(next);
});

//Get Preview
router.post('/preview/:id', function(req, res, next) {
  Invitation.findOne({_id:req.params.id}).then(invitation=>{
    res.send({status:"success", data:invitation});
}).catch(next);
});

router.get('/getlocation',function(req,res,next){
  axios.get("http://ip-api.com/json").then(response=>{
      res.send(response)  
  })
})

module.exports = router;
