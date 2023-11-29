require('dotenv').config();
const express = require('express');
const Airtable = require('airtable');
const app = express();
const port = process.env.PORT || 3000;

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.TABLE_NAME || 'Table 1';

const checkIfUserExists = async (email) => {
    return new Promise((resolve, reject) => {
        base(tableName).select({
            view: 'Grid view',
            maxRecords: 1,
            filterByFormula: `{Email} = '${email}'`,
        }).firstPage((err, records) => {
            if (err) {
                reject(err.message);
                return;
            }
            resolve(records.length > 0);
        })
    });
};

app.get('/check-user', async (req, res) => {
    try {
        const { email } = req.query;
        const response = await checkIfUserExists(email);
        console.log(response);
        res.send(response);
    } catch (error) {
        const response = { error: error.message };
        res.send(response);
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
