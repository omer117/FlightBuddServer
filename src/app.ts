require('dotenv').config({ path: require('find-config')('.env') })
import express from 'express';
import { MongoClient } from 'mongodb'
import flightRouter from './routes/FlightRoutes';
import mongoose from 'mongoose'
import cors from 'cors'
import AuthRouter from './routes/AuthRoutes';
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
export const uri: string = process.env.MONGO_URI!;
export const secretkey: string = process.env.SECRET_KEY!;
export const mongoUser = new MongoClient(uri);
mongoose.connect(uri)
const app = express();
app.use(cors());
const port = 3004

app.use(express.json()); // format
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());


app.use('/AuthAPI', AuthRouter)
app.use('/flightsAPI', flightRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});