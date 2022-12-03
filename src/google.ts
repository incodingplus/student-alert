import { sheets, auth } from '@googleapis/sheets';
import fs from 'fs/promises';
import path from 'path';
import { dirname } from './setting.js';

const raw = await fs.readFile(path.resolve(dirname, '../credential', process.env.SPREAD_PATH), {encoding:'utf-8'});
const json = JSON.parse(raw);
const authorize = new auth.JWT(json.client_email, null, json.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
]);
const googleSheet = sheets({
    version:'v4',
    auth:authorize
});

const sheet = await googleSheet.spreadsheets.values.get({
    spreadsheetId:'1liovQ_eab5Q9cgxbwcN7gnDukOUIVCnCCmkd8raSf6o',
    range:'A1:B1'
});

console.log(sheet.data.values);