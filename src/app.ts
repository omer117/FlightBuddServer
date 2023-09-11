require('dotenv').config({ path: require('find-config')('.env') })
import express from 'express';

import  Jwt  from 'jsonwebtoken';
import { MongoClient } from 'mongodb'
import flightRouter from './routes/FlightRoutes';
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser';
import session from 'express-session';
import {expressjwt} from 'express-jwt'
import AuthRouter from './routes/authRoutes';
export const uri: string = process.env.MONGO_URI!;
export const secretkey: string = process.env.SECRET_KEY!;
export const mongoUser = new MongoClient(uri);

const jsonParser = bodyParser.json();
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

app.use('/AuthAPI', AuthRouter)
app.use('/flightsAPI', flightRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});