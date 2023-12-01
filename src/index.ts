import { Request, Response } from 'express';
import { acceptMailOptions, declineMailOptions, userExistsMailOptions, transporter } from './mailer';
import checkIfUserExists from './checkIfUserExists';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Request = require('express').Request;
const Response = require('express').Response;

const port = process.env.PORT || 3000;
const frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3001';
const corsOptions = {
    origin: frontendUrl,
    optionsSuccessStatus: 200
}

const app = express();
app.use(cors(corsOptions));

app.get('/check-user', async (req: Request, res: Response) => {
    try {
        const email = req.query.email.toLowerCase();
        console.log(email);
        const response = await checkIfUserExists(email);
        console.log(response);
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
                    transporter.sendMail(userExistsMailOptions(email));
                    res.status(409).send('User already exists');
                }
            }
        } else {
            transporter.sendMail(declineMailOptions(email));
            res.status(403).send({ error: 'User not found' });
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
