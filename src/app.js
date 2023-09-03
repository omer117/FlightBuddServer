require('dotenv').config({ path: require('find-config')('.env') })

const axios = require('axios');
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
// const userController = require('./controllers/usersController')
// const JwtStrategy = require('./strategies/jwt/auth')
// const passport = require('passport');
// const userModel = require('./models/user/user')
// const User = require('./models/user/user')
// require('./strategies/jwt/auth')

const mongoose = require('mongoose')
const uri = process.env.MONGO_URI;
const mongoUser = new MongoClient(uri);
const bodyParser = require('body-parser');
const app = express();
const jsonParser = bodyParser.json();
const port = 3004


mongoose.connect(uri)
app.use(cors());
app.listen({ port: port }, console.log(`you are on http://localhost:${port}`))
const airportsCollection = mongoUser.db('countries').collection('everyAirportDB');
// passport.use(new JwtStrategy(User.authenticate()))
// passport.serializeUser(User.serializeUser())
// app.use(passport.initialize())

// app.get('/profile', passport.authenticate('jwt', { session: false }), accountController.profile)
// app.post('/login', passport.authenticate('local'), accountController.login)
// app.post('/register', accountController.register)


app.get('/getAirports', jsonParser, async (req, res) => {
    let airports = await airportsCollection.find({}).toArray()
    res.json({
        airports
    })
}
)

app.post('/getAirportsData', jsonParser, async (request, response) => {
    console.log(request.body);

    let airport1 = request.body.firstAirport;
    let airport2 = request.body.secondAirport;

    let firstAirportArr = []
    let secondAirportArr = []
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


    let flightsArr = []
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
                    firstAirportArr = [...new Map(flightsArr.map((item) =>
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
                    secondAirportArr = [...new Map(flightsArr.map((item) =>
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
                let addScore = 25;
                let subScore = 25;
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
                                score: subtractionFinalArr[j].score + additionFinalArr[i].score
                            })
                        }
                    }
                }

                let reallyArr = [];
                for (let i = 0; i < finalArr.length; i++) {
                    if ((isNaN(finalArr[i].score) === false) && finalArr[i].score !== 0 && finalArr[i].score > 0) {
                        isNaN(i)
                        reallyArr.push({ arr_code: finalArr[i].arr_code, score: finalArr[i].score })
                    }
                }
                reallyArr.sort((a, b) => a.score - b.score);
                response.send(reallyArr)
            }).catch((err) => console.log(err))
    }
}
)

app.post('/getAllChosenAirportsInfo', jsonParser, async (request, response) => {
    let askedAirportCode = request.body.targetAirport
    let airportData = await airportsCollection.findOne({ Orig: askedAirportCode })
    response.json(airportData)
})

app.post('/getResultForAlgo', jsonParser, async (request, response) => {
    let from = request.body.from;
    let to = request.body.to;
    let date = request.body.date;

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
    let arr = []
    await axios.request(options).then((response) => {
        console.log((response.data));
        if (response.data.status !== 404) {
            arr = (response.data.results)
        }
    }).catch((err) => {
        arr = (err);
    })
    response.send(arr)
})

app.get('/resultForTesting', jsonParser, async (request, response) => {
    const result = mongoUser.db('countries').collection('testing_results')
    let resultData = await result.find().toArray()
    response.send(resultData);
})

app.get('/', async (request, response) => {
    response.send("sup boi")
}
)
