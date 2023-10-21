import mongoose from "mongoose"
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new mongoose.Schema ({
    //account info
    userType: String,
    username: {type: String, unique: true, required: true},
    //personal info
    age: String,
    gender: String,
    //game results
    memoryGame: Array,
    mathGame: Array,
    redLightGreenLight: Array,
    keypadGame: Array
})

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('user', userSchema)
export default User;
