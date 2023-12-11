"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailer_1 = require("./mailer");
const checkIfUserExists_1 = __importDefault(require("./checkIfUserExists"));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Request = require('express').Request;
const Response = require('express').Response;
const port = process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
const corsOptions = {
    origin: frontendUrl,
    optionsSuccessStatus: 200
};
const app = express();
app.use(cors(corsOptions));
app.get('/check-user', async (req, res) => {
    try {
        const email = req.query.email.toLowerCase();
        const response = await (0, checkIfUserExists_1.default)(email);
        if (response) {
            try {
                const token = process.env.TOKEN;
                const user = await axios.post(process.env.STRAPI_URL, {
                    email,
                    username: email.split('@')[0],
                    password: 'password',
                    role: '1'
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                res.send(user.data);
                mailer_1.transporter.sendMail((0, mailer_1.acceptMailOptions)(email));
            }
            catch (err) {
                if (err instanceof Error) {
                    console.log(err);
                    mailer_1.transporter.sendMail((0, mailer_1.userExistsMailOptions)(email));
                    res.status(409).send('User already exists');
                }
            }
        }
        else {
            mailer_1.transporter.sendMail((0, mailer_1.declineMailOptions)(email));
            res.status(403).send('User not found');
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
