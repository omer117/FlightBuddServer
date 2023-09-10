const axios = require('axios') 

const firstFlightAxiosOptions = {
    method: 'GET',
    url: 'https://airlabs.co/api/v9/schedules'
    , params: {
        dep_iata: 'TLV',
        // api_key: process.env.FIRST_API_KEY,
        api_key: '88267542-db82-4d2a-b060-c44e96bff0db',
    },
};

axios.request(firstFlightAxiosOptions).then((response) => {
    console.log(response.data);
}).catch((err) => {
    console.log(err);
});