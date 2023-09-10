import { UUID } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const UserSchema = new Schema({

    _id: {
        type:UUID,
        required: true
    },


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


export const UserModel = mongoose.model('user',UserSchema)