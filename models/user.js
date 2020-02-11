const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;
const moment = require('moment');


const userSchema = new Schema({
  created_at: { type : Date , default:new Date()},
  email:String,
  password:String,
  confirmed:{ type : Boolean , default:false},
  name:String,
  phone:String,
  user_type:String,
  vendor_logo:String
},{strict: false});

//Model
const user = mongoose.model('user',userSchema);


module.exports    = user;
