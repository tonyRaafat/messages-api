import mongoose from "mongoose";

const schema = new  mongoose.Schema({
    userId:String,
    otp:String,
    createdDate:Date,
    expiaryDate:Date
})

const UserOtpVerification = mongoose.model('UserOtpVerification',schema)

export {UserOtpVerification}