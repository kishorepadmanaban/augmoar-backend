const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const moment = require('moment-timezone');


const infocardSchema = new Schema({
  date: { type : Date , default:moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")},
},{strict: false});

//Model
const infocard = mongoose.model('infocard',infocardSchema);


module.exports  = infocard;