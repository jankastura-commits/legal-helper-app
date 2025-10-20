const axios = require('axios');

async function getFirmData(ico) {
    const response = await axios.get(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`);
    return response.data;
}

module.exports = { getFirmData };