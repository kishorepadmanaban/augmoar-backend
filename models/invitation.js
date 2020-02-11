const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const moment = require('moment-timezone');


const invitationSchema = new Schema({
  date: { type : Date , default:moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")},
},{strict: false});

//Model
const invoice = mongoose.model('invitation',invitationSchema);


module.exports    = invoice;

