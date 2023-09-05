require('dotenv').config({ path: require('find-config')('.env') })
import express from 'express';
import { MongoClient } from 'mongodb'
import flightRouter from './routes/FlightRoutes';
import mongoose from 'mongoose'
import cors from 'cors'
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
export const uri: string = process.env.MONGO_URI! ;
export const mongoUser = new MongoClient(uri);
mongoose.connect(uri)
const app = express();
app.use(cors());
const port = 3004

app.use(express.json()); // format

app.use('/flightsAPI', flightRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});