import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { mongoUser } from "../app";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: 'http://localhost:3004/auth/google/callback', // Adjust the callback URL as needed
}, async (accessToken: any, refreshToken: any, profile: any, done: any) => {

    const users = mongoUser.db('countries').collection('users')
    
}))