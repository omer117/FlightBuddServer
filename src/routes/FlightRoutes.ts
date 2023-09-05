
import express from 'express'
import FlightController from '../controllers/FlightController';

const flightRouter = express.Router();
flightRouter.get('/getAirports', FlightController.getAllAirport)

flightRouter.post('/useAirportAlgo', FlightController.airportAlgorithem)

flightRouter.post('/getAirportsPrices', FlightController.flightResultsForAlgo)

flightRouter.post('/getChosenAirportData', FlightController.getChosenAirportData)

flightRouter.get('/resultForTesting', FlightController.resultForTesting)

export default flightRouter;