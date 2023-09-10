import { mongoUser } from '../app';
import axios from 'axios';

import { Request, Response } from 'express'
const FlightController: any = {

    getAllAirport: async (req: Request, res: Response) => {
        let airports = await mongoUser.db('countries').collection('everyAirportDB').find({}).toArray()
        res.json({
            airports
        })
    },
    airportAlgorithem: async (req: Request, res: Response) => {
        let airport1 = req.body.firstAirport;
        let airport2 = req.body.secondAirport;

        let firstAirportArr: any = []
        let secondAirportArr: any = []
        const firstFlightAxiosOptions = {
            method: 'GET',
            url: 'https://airlabs.co/api/v9/schedules'
            , params: {
                dep_iata: `${airport1}`,
                // api_key: process.env.FIRST_API_KEY,
                api_key: process.env.SECOND_API_KEY,
            },
        };


        const secondFlightAxiosOptions = {
            method: 'GET',
            url: 'https://airlabs.co/api/v9/schedules'
            , params: {
                dep_iata: `${airport2}`,
                // api_key: process.env.FIRST_API_KEY,
                api_key: process.env.SECOND_API_KEY,
            },
        };


        let flightsArr: any = []
        if (airport1 !== 'undefined' && airport2 !== 'undefined') {

            await axios.request(firstFlightAxiosOptions)
                .then(async (response) => {
                    const lastLayer = response.data.response
                    if (!(lastLayer == undefined)) {
                        for (let i = 0; i < lastLayer.length; i++) {
                            const flightData = [lastLayer[i].dep_iata, lastLayer[i].arr_iata, lastLayer[i].duration]
                            flightsArr.push(({ dep_code: flightData[0], arr_code: flightData[1], duration: flightData[2] }))
                        }
                        const key = 'arr_code';
                        firstAirportArr = [...new Map(flightsArr.map((item: any) =>
                            [item[key], item])).values()];
                    }
                })

            await axios.request(secondFlightAxiosOptions)
                .then(async (response) => {
                    const lastLayer = response.data.response
                    if (!(lastLayer == undefined)) {
                        for (let i = 0; i < lastLayer.length; i++) {
                            const flightData = [lastLayer[i].dep_iata, lastLayer[i].arr_iata, lastLayer[i].duration]
                            flightsArr.push(({ dep_code: flightData[0], arr_code: flightData[1], duration: flightData[2] }))
                        }
                        const key = 'arr_code';
                        secondAirportArr = [...new Map(flightsArr.map((item: any) =>
                            [item[key], item])).values()];
                    }
                }).then(() => {
                    let additionFinalArr = [];
                    const subtractionFinalArr = [];
                    for (let i = 0; i < firstAirportArr.length; i++) {
                        for (let j = 0; j < secondAirportArr.length; j++) {
                            if (firstAirportArr[i].arr_code === secondAirportArr[j].arr_code) {
                                const additionNewDuration = firstAirportArr[i].duration + secondAirportArr[j].duration
                                const subtractionNewDuration = firstAirportArr[i].duration - secondAirportArr[j].duration


                                // gives us the array of flights and duration combined  
                                additionFinalArr.push({
                                    arr_code: secondAirportArr[j].arr_code,
                                    bothAddDuration: additionNewDuration
                                })
                                // the same array but duration subtracted
                                subtractionFinalArr.push({
                                    arr_code: secondAirportArr[j].arr_code,
                                    bothSubDuration: Math.abs(subtractionNewDuration)
                                })
                            }
                        }
                    }
                    additionFinalArr.sort((a, b) => a.bothAddDuration - b.bothAddDuration);
                    subtractionFinalArr.sort((a, b) => a.bothSubDuration - b.bothSubDuration);

                    // starting the scoring algorithm
                    let addScore: number = 25;
                    let subScore: number = 25;
                    for (let i = 0; i < additionFinalArr.length; i++) {
                        if (additionFinalArr[i].bothAddDuration !== 0) {
                            additionFinalArr[i] = { arr_code: additionFinalArr[i].arr_code, duration: additionFinalArr[i].bothAddDuration, score: addScore }
                            addScore = addScore - 1;
                        }
                        if (subtractionFinalArr[i].bothSubDuration !== 0) {
                            subtractionFinalArr[i] = { arr_code: subtractionFinalArr[i].arr_code, duration: subtractionFinalArr[i].bothSubDuration, score: subScore }
                            subScore = subScore - 1;
                        }
                    }

                    let finalArr = [];
                    for (let i = 0; i < subtractionFinalArr.length; i++) {
                        for (let j = 0; j < subtractionFinalArr.length; j++) {
                            if (additionFinalArr[i].arr_code === subtractionFinalArr[j].arr_code) {
                                finalArr.push({
                                    arr_code: additionFinalArr[i].arr_code,
                                    score: subtractionFinalArr[j].score! + additionFinalArr[i].score!
                                })
                            }
                        }
                    }

                    let reallyArr = [];
                    for (let i = 0; i < finalArr.length; i++) {
                        if ((isNaN(finalArr[i].score) === false)) {
                            reallyArr.push({ arr_code: finalArr[i].arr_code, score: finalArr[i].score })
                        }
                    }
                    reallyArr.sort((a, b) => a.score - b.score);
                    let fa = reallyArr.reverse()
                    let temp3 = []
                    for(let i = 0 ; i < 5; i++) {
                        temp3.push(fa[i])
                    }    
                    res.send(temp3)
                }).catch((err) => console.log(err))
        }
    },

    getChosenAirportData: async (req: Request, res: Response) => {
        let askedAirportCode = req.body.targetAirport
        let airportData = await mongoUser.db('countries').collection('everyAirportDB').findOne({ Orig: askedAirportCode })
        res.json(airportData)
    },
    flightResultsForAlgo: async (req: Request, res: Response) => {
        let from = req.body.from;
        let to = req.body.to;
        let date = req.body.date;

        const options = {
            method: 'GET',
            url: 'https://flight-fare-search.p.rapidapi.com/v2/flights/',
            params: {
                from: from,
                to: to,
                date: date,
                adult: '1',
                type: 'economy',
                currency: 'USD'
            },
            headers: {
                'X-RapidAPI-Key': process.env.X_RAPID_API_KEY,
                'X-RapidAPI-Host': 'flight-fare-search.p.rapidapi.com'
            }
        };



        console.log('got here');
        let arr: any = []
        await axios.request(options).then((response) => {
            console.log((response.data));
            if (response.data.status !== 404) {
                arr = [200, response.data.results]
            } else if (response.data.status === 404) {
                arr = { status: 404 }
            }
        }).catch((err) => {
            arr = (err);
        })
        res.send(arr)
    },

    resultForTesting: async (req: Request, res: Response) => {
        const result = mongoUser.db('countries').collection('testing_results')
        let resultData = await result.find().toArray()
        res.send(resultData);
    },
    getChosenAirportsFlights: async (req: Request, res: Response) => {
        const { airportTarget, airportFrom } = req.body;

        let askedAirportCode1 = req.body.airportFrom
        let askedAirportCode2 = req.body.airportTarget
        let airportData1 = await mongoUser.db('countries').collection('everyAirportDB').findOne({ Orig: askedAirportCode1 })
        let airportData2 = await mongoUser.db('countries').collection('everyAirportDB').findOne({ Orig: askedAirportCode2 })

        const FlightAxiosOptions = {
            method: 'GET',
            url: 'https://airlabs.co/api/v9/schedules'
            , params: {
                dep_iata: `${airportFrom}`,
                // api_key: process.env.FIRST_API_KEY,
                api_key: process.env.SECOND_API_KEY,
            },
        };

        let arr: object[] = [];
        axios.request(FlightAxiosOptions).then((response) => {
            const lastLayer = response.data.response
            for (let i = 0; i < lastLayer.length; i++) {
                if (lastLayer[i].arr_iata === airportTarget) {
                    const hours = Math.floor(lastLayer[i].duration / 60)
                    const minutes = lastLayer[i].duration % 60
                    const depDate = lastLayer[i].dep_time.slice(0, 10)
                    const arrDate = lastLayer[i].arr_time.slice(0, 10)
                    const deptime = lastLayer[i].dep_time.slice(11, 16)
                    const arrtime = lastLayer[i].arr_time.slice(11, 16)

                    arr.push({

                        airline_code: lastLayer[i].airline_icao,
                        flight_number: lastLayer[i].flight_icao,
                        dep_airport_name: airportData1!.Name,
                        dep_country: airportData1!['Country Name'],
                        dep_code: lastLayer[i].dep_iata,
                        dep_time: depDate,
                        dep_hour: deptime,
                        arr_airport_name: airportData2!.Name,
                        arr_country: airportData2!['Country Name'],
                        arr_code: lastLayer[i].arr_iata,
                        arr_time: arrDate,
                        arr_hour: arrtime,
                        duration_hours: `${hours}h:${minutes}m`,
                    })
                }
            }
            res.status(200).send(arr)
        }).catch((err) => {
            res.status(500).send(err)
        })

    }
}

export default FlightController;
