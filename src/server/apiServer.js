const axios = require('axios');

const ApiServer = {
    instance: null,
    initialize: (token) => {
        console.log(`Initialize axios with bearer token : ${token}`);
        ApiServer.instance = axios.create({
            baseURL: 'https://app.clio.com/',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },
    get: async (url) => {
        console.log("ApiServer.get: ", url);
        if (!ApiServer.instance) {
            console.error("No Axios instance, need to initialize ApiServer !")
        }
        let result = await ApiServer.instance.get(url);
        console.log("result:", result);
        return result;
    }
};

module.exports = ApiServer;
