const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const axios = require('axios');
const path = require('path');
const shell = require('shelljs');

var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

router.post('/upload_video', function(req, res, next) {
// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
let File = req.files.invitationVideo;
let file_name = req.files.invitationVideo.name;
file_name = file_name.replace(/\s/g, '');
//filename = path.pathname(filename)
let name = path.parse(file_name).name
let ext = path.parse(file_name).ext
ext = ext.toLowerCase()
file_name = name + Date.now() + ext
let video_url =
// Use the mv() method to place the file somewhere on your server
File.mv('assets/videos/youtube/' + file_name, function(err) {
  if (err) {
    return res.status(500).send(err);
  } else {
    console.log("file uploaded")
  shell.exec("ffmpeg -i " +'assets/videos/youtube/' + file_name + " -vcodec h264 -acodec mp3 -vf scale=480:-2,setsar=1:1 "+'assets/videos/compressed/'+file_name, function(code, stdout, stderr){
    res.send({status:"success", url:"http://159.65.146.12/invitation/assets/videos/compressed/"+file_name
  })
  });
  }
})
})

// router.post('/upload_video', function(req, res, next) {

// if (!req.files)
// return res.status(400).send('No files were uploaded.');

// // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
// let File = req.files.invitationVideo;
// let file_name = req.files.invitationVideo.name;
// file_name = file_name.replace(/\s/g, '');
// //filename = path.pathname(filename)
// let name = path.parse(file_name).name
// let ext = path.parse(file_name).ext
// ext = ext.toLowerCase()
// file_name = name + Date.now() + ext
// // Use the mv() method to place the file somewhere on your server
// File.mv('assets/videos/youtube/' + file_name, function(err) {
//   if (err) {
//     return res.status(500).send(err);
//   } else {
//     console.log("file uploaded")

// // If modifying these scopes, delete your previously saved credentials
// // at ~/.credentials/youtube-nodejs-quickstart.json
// var SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
// var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
//     process.env.USERPROFILE) + '/.credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';
// console.log(TOKEN_PATH)
// // Load client secrets from a local file.
// fs.readFile('client_secret.json', function processClientSecrets(err, content) {
//   if (err) {
//     console.log('Error loading client secret file: ' + err);
//     return;
//   }
//   value  = JSON.parse(content)
//   //console.log(value.web.client_id)
//   // Authorize a client with the loaded credentials, then call the YouTube API.
//   authorize(JSON.parse(content), runSample);
// });

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  *
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
//     var clientSecret = credentials.web.client_secret //"qP0fSxCHirfSGCBY_6ZKIHBA"//credentials.installed.client_secret;
//     var clientId = credentials.web.client_id;//"71004771712-8s1le482t2k9cqakj74omnq6327lreau.apps.googleusercontent.com"// credentials.installed.client_id;
//     var redirectUrl = "http://augmo-platform.firebaseapp.com/__/auth/handler"//credentials.installed.redirect_uris[0];
//   var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, function(err, token) {
//     if (err) {
//       getNewToken(oauth2Client, callback);
//     } else {
//       oauth2Client.credentials = JSON.parse(token);
//       callback(oauth2Client,'assets/videos/youtube/' + file_name);
//     }
//   });
// }

// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  *
//  * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback to call with the authorized
//  *     client.
//  */
// function getNewToken(oauth2Client, callback) {
//   var authUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES
//   });
//   console.log('Authorize this app by visiting this url: ', authUrl);
//   var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
//   });
//   rl.question('Enter the code from that page here: ', function(code) {
//     rl.close();
//     oauth2Client.getToken(code, function(err, token) {
//       if (err) {
//         console.log('Error while trying to retrieve access token', err);
//         return;
//       }
//       oauth2Client.credentials = token;
//       storeToken(token);
//       callback(oauth2Client);
//     });
//   });
// }

// /**
//  * Store token to disk be used in later program executions.
//  *
//  * @param {Object} token The token to store to disk.
//  */
// function storeToken(token) {
//   try {
//     fs.mkdirSync(TOKEN_DIR);
//   } catch (err) {
//     if (err.code != 'EEXIST') {
//       throw err;
//     }
//   }
//   fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//     if (err) throw err;
//     console.log('Token stored to ' + TOKEN_PATH);
//   });
//   console.log('Token stored to ' + TOKEN_PATH);
// }

// const youtube = google.youtube({
//   version: 'v3',
// });

// ////Uploading a video to youtube
// async function runSample(auth,fileName) {
//   const fileSize = fs.statSync(fileName).size;
//   fs.readFile(TOKEN_PATH, function(err, token) {
//     if (err) {
//       getNewToken(oauth2Client, callback);
//     } else {
//       google.auth.OAuth2.credentials = JSON.parse(token);
//     }
//   });
//   const res_youtube = await youtube.videos.insert(
//     {
//       auth:auth,
//       part: 'id,snippet,status',
//       notifySubscribers: false,
//       requestBody: {
//         snippet: {
//           title: 'Ad Shoott',
//           description: 'Ad shoot video',
//         },
//         status: {
//           privacyStatus: 'public',
//         },
//       },
//       media: {
//         body: fs.createReadStream(fileName),
//       },
//     },
//     {
//       // Use the `onUploadProgress` event from Axios to track the
//       // number of bytes uploaded to this point.
//       onUploadProgress: evt => {
//         const progress = (evt.bytesRead / fileSize) * 100;
//         readline.clearLine();
//         readline.cursorTo(0);
//         process.stdout.write(`${Math.round(progress)}% complete`);
//       },
//     }
//   );
//   ////Find Process of the Video
//   let videoProcess = setInterval(() => {
//     axios.get("https://www.googleapis.com/youtube/v3/videos?id="+res_youtube.data.id+"&key=AIzaSyAQenUJp7ig39XbWb6JM0n8hF68MRZCp6I&part=status").then(response=>{
//       // res.send({data:response.data})
//       console.log(response.data);

//       console.log(response.data.items[0].status.uploadStatus+"test")

//       if(response.data.items.length>0){
//         if(response.data.items[0].status.uploadStatus==="processed"){
//           downloadVideo(res_youtube.data.id)
//           clearInterval(videoProcess)
//         }else if(response.data.items[0].status.uploadStatus==="failed"||"rejected"||"deleted" ){
//           clearInterval(videoProcess)
//         }else{
//           console.log('loop')
//         }
//       }
//       // }else{
//       //   deleteVideo(res_youtube.data.id)
//       // }
//   }).catch(error=>{
//     console.log(error)
//   })
//   }, 3000);

//   console.log('\n\n');
//   console.log(res_youtube.data);
//   function downloadVideo(id){
//     var youtubedl = require('@microlink/youtube-dl');
//     var video = youtubedl('https://www.youtube.com/watch?v='+id,
//       // Optional arguments passed to youtube-dl.
//       ['--format=18'],
//       // Additional options can be given for calling `child_process.execFile()`.
//       { cwd: __dirname });

//     // Will be called when the download starts.
//     video.on('info', function(info) {
//       console.log('Download started');
//       console.log('filename: ' + info._filename);
//       console.log('size: ' + info.size);
//     });

//     video.pipe(fs.createWriteStream("filename"+Date.now()+'.mp4'));
//   }

//    }
//   }
// })
// })

module.exports = router;
//   async function deleteVideo(auth,id) {
//     fs.readFile(TOKEN_PATH, function(err, token) {
//       if (err) {
//         getNewToken(oauth2Client, callback);
//       } else {
//         google.auth.OAuth2.credentials = JSON.parse(token);
//       }
//     });
//     const res = await youtube.videos.delete(
//       {
//         auth:auth,
//         id:id,
//         part: 'id,snippet,status',
//         notifySubscribers: false,
//     }
//     ).catch(err=>{console.log(err)})
//     console.log('\n\n');
//     console.log(res);
//     return res;
//   return res.data;
// }