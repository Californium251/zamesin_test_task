"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Airtable = require('airtable');
require('dotenv').config();
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
exports.default = checkIfUserExists;
