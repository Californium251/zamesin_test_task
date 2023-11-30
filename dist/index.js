"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express = require('express');
const Airtable = require('airtable');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const Request = require('express').Request;
const Response = require('express').Response;
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
            if (records !== undefined) {
                resolve(records.length > 0);
            }
        });
    });
};
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
    },
});
const acceptMailOptions = (email) => ({
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Welcome to the club!',
    text: 'Вы приняты в клуб! Поздравляем!',
});
const declineMailOptions = (email) => ({
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Access denied!',
    text: 'К сожалению, вы у вас пока нет доступа. Чтобы он появился, оплатите курс.',
});
app.get('/check-user', async (req, res) => {
    try {
        const { email } = req.query;
        console.log('email', email);
        const response = await checkIfUserExists(email);
        console.log('response', response);
        if (response) {
            try {
                const token = process.env.TOKEN;
                const user = await axios.post(process.env.STRAPI_URL, { data: { email } }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                res.send(user.data);
                transporter.sendMail(acceptMailOptions(email));
            }
            catch (err) {
                res.send(err);
                transporter.sendMail(declineMailOptions(email));
            }
        }
        else {
            transporter.sendMail(declineMailOptions(email));
            res.send({ error: 'User not found' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            const response = { error: error.message };
            res.send(response);
        }
    }
});
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
