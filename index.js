require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Airtable = require('airtable');
const app = express();
const port = process.env.PORT || 3000;

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const checkIfUserExists = async (email) => base('Table 1').select({
    view: 'Grid view',
    maxRecords: 1,
    filterByFormula: `{Email} = '${email}'`,
}).firstPage((err, records) => {
    if (err) {
        console.error(err);
        return;
    }
    if (records.length > 0) {
        console.log(`User with email ${email} exists.`);
    } else {
        console.log(`User with email ${email} does not exist.`);
    }
});

app.get('/check-user', async (req, res) => {
    try {
        const { email } = req.query;
        const response = await checkIfUserExists(email);
        res.send(response);
    } catch (error) {
        const response = { error: error.message };
        res.send(response);
    }
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
