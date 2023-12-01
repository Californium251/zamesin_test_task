"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExistsMailOptions = exports.declineMailOptions = exports.acceptMailOptions = exports.transporter = void 0;
const nodemailer = require('nodemailer');
require('dotenv').config();
exports.transporter = nodemailer.createTransport({
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
    subject: 'Вы записались на курс Вани Замесина.',
    text: `Вы записаны на курс. Занятия начнутся в понедельник, 25 декабря.
    
    Вот что можно сделать до начала обучения:
    1. Подписаться на канал Вани Замесина: https://t.me/zamesin
    2. Зайти в группу курса в Телеграме: https://t.me/joinchat/AAAAAE8X9XZ5ZjQyYjYwZg
    Короче, на всё подпишитесь, это интересно.
    
    Будем вас ждать. Если возникнут какие-то вопросы, пишите в ответе на это письмо.`,
});
exports.acceptMailOptions = acceptMailOptions;
const declineMailOptions = (email) => ({
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Нет доступа к курсу. Вот что с этим делать.',
    text: `К сожалению, у пользователя с этим имейлом нет досутпа. Тому может быть несколько причин:
    1. При оплате курса вы указали другой имейл.
    2. Мы что-то напутали и не так добавили. В этом случае напишите об этом в ответе на это письмо.
    3. Вы не оплатили курс. В этом случае оплатите курс и попробуйте ещё раз.
    Здесь могли бы быть ссылки на оплату, но это просто тестовое задание.`,
});
exports.declineMailOptions = declineMailOptions;
const userExistsMailOptions = (email) => ({
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: 'Вы уже записаны на курс.',
    text: `Вы уже записаны на курс. Занятия начнутся в понедельник, 25 декабря.
    
    Вот что можно сделать до начала обучения:
    1. Подписаться на канал Вани Замесина: https://t.me/zamesin
    2. Зайти в группу курса в Телеграме: https://t.me/joinchat/AAAAAE8X9XZ5ZjQyYjYwZg
    Короче, на всё подпишитесь, это интересно.
    
    Будем вас ждать. Если возникнут какие-то вопросы, пишите в ответе на это письмо.`,
});
exports.userExistsMailOptions = userExistsMailOptions;
