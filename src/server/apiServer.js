const axios = require('axios');
const config = require('./config.json');

const ApiServer = {
    get: async (url, token) => {
        console.log(`${url} with token = ${token}`)
        let result = await axios.get(url, {
            baseURL: config.apiHost,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return result;
    }
};

module.exports = ApiServer;
