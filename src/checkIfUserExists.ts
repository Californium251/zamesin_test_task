import { Base, FieldSet, Records } from 'airtable';
const Airtable = require('airtable');
require('dotenv').config();

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

export default checkIfUserExists;