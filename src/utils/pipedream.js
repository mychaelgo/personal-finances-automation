const axios = require('axios');

const getPersonalFinancesDataStores = async () => {
    const config = {
        method: 'get',
        url: process.env.PIPEDREAM_DB_GET_ENDPOINT
    };

    return await axios(config);
}

const updatePersonalFinancesDataStores = async (key, value) => {
    const data = JSON.stringify({
        key,
        value
    });

    const config = {
        method: 'post',
        url: process.env.PIPEDREAM_DB_UPDATE_ENDPOINT,
        data
    };

    return await axios(config);
}

const updateTransactionInGoogleSheets = async (data) => {
    const config = {
        method: 'post',
        url: process.env.PIPEDREAM_WORKFLOW_UPDATE_GOOGLE_SHEETS_URL,
        data: {
            source: process.env.PIPEDREAM_WORKFLOW_UPDATE_GOOGLE_SHEETS_SOURCE,
            data
        }
    };

    return await axios(config);
}

module.exports = {
    getPersonalFinancesDataStores,
    updatePersonalFinancesDataStores,
    updateTransactionInGoogleSheets
};