import { Request, Response } from 'express'; // Add missing import
import { Base, FieldSet, Records } from 'airtable';
require('dotenv').config();
const express = require('express');
const Airtable = require('airtable');
const nodemailer = require('nodemailer');
const axios = require('axios');
const app = express();
const Request = require('express').Request;
const Response = require('express').Response;
const port = process.env.PORT || 3000;

const base: Base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName: string = process.env.TABLE_NAME || 'Table 1';

const checkIfUserExists: (email: string) => Promise<boolean | Error> = async (email: string) => {
    return new Promise((resolve, reject) => {
        base(tableName).select({
            view: 'Grid view',
            maxRecords: 1,
            filterByFormula: `{Email} = '${email}'`,
        }).firstPage((err: Error | null, records: Records<FieldSet> | undefined) => {
            if (err) {
                reject(err.message);
                return;
            }
            if (records !== undefined) {
                resolve(records.length > 0);
            }
        })
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

type MailOptionsType = {
    from: string,
    to: string,
    subject: string,
    text: string,
};

const acceptMailOptions: (email: string) => MailOptionsType = (email) => ({
    from: process.env.EMAIL_ADDRESS as string,
    to: email,
    subject: 'Welcome to the club!',
    text: 'Вы приняты в клуб! Поздравляем!',
});


const declineMailOptions: (email: string) => MailOptionsType = (email) => ({
    from: process.env.EMAIL_ADDRESS as string,
    to: email,
    subject: 'Access denied!',
    text: 'К сожалению, вы у вас пока нет доступа. Чтобы он появился, оплатите курс.',
});

const userExistsMailOptions: (email: string) => MailOptionsType = (email) => ({
    from: process.env.EMAIL_ADDRESS as string,
    to: email,
    subject: 'User already exists!',
    text: 'Вы и так уже в клубе. Можете переходить к обучению.',
});

app.get('/check-user', async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        const response = await checkIfUserExists(email);
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
            } catch (err) {
                if (err instanceof Error) {
                    res.send({ error: 'User already exists' });
                    transporter.sendMail(userExistsMailOptions(email));
                }
            }
        } else {
            transporter.sendMail(declineMailOptions(email));
            res.send({ error: 'User not found' });
        }
    } catch (error) {
        if (error instanceof Error) {
            const response = { error: error.message };
            res.send(response);
        }
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
