const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

mongoose.Promise  = global.Promise;

// Connect to DB
var connectionOptions = {
  useNewUrlParser: true,
  connectTimeoutMS: 300000, // 5 minutes
  keepAlive: 120,
  ha: true, // Make sure the high availability checks are on
  haInterval: 10000, // Run every 10 seconds
  useFindAndModify: false,
  useUnifiedTopology: true,
  useCreateIndex: true
};
//Mongodb connection
mongoose.connect(process.env.DB,connectionOptions);
mongoose.set('useFindAndModify', false);
mongoose.connection.once('open', function() {
	console.log("Database connected successfully");
});

//To enable Cross-Origin Resource Sharing
app.use(cors());

// default options
app.use(fileUpload());

//BodyParser
app.use(bodyParser.json({
  parameterLimit: 100000,
  limit: '50mb',
  extended: true
}));

app.use(bodyParser());

//Route
app.use('/api',require('./routes/invitation'));
app.use('/api',require('./routes/youtube'));


//Error Handling
app.use(function(err,req,res,next){
  console.log("index", err);
  res.status(422).send({error:err.message});
});

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, '/')))

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//Port listen
let port = 3030;
app.listen(process.env.port || port, function(){
  console.log("Port Listening "+port);
});
