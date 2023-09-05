import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';


const Schema = mongoose.Schema;

const UserSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose)


const UserModel = mongoose.model('user',UserSchema)
const user = new UserModel;
module.exports = UserModel,user;