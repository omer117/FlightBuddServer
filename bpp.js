const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://flight-fare-search.p.rapidapi.com/v2/flights/',
  params: {
    from: 'LHR',
    to: 'DXB',
    date: '2023-09-21',
    adult: '1',
    type: 'economy',
    currency: 'USD'
  },
  headers: {
    'X-RapidAPI-Key': 'caf7a8ca4bmsh0cf8302e0615e0dp133372jsn400ef3dda888',
    'X-RapidAPI-Host': 'flight-fare-search.p.rapidapi.com'
  }
};


async function func(){
    const response = await axios.request(options);
	console.log((response.data.results[0]));
}

func()