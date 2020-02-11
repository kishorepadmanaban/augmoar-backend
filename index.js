const express = require('express');
const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();

mongoose.Promise  = global.Promise;


//Mongodb connection
mongoose.connect('mongodb://admin:qazwsx12@68.183.86.113:27017/augmo',{ useNewUrlParser: true });
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
  //console.log(err);
  res.status(422).send({error:err.message});
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//Port listen
let port = 3030;
app.listen(process.env.port || port, function(){
  console.log("Port Listening "+port);
});
