import * as dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import type { QueueType } from './google.js';

export const channelsArr = process.env.CHANNEL.split(',');
export const spreadsArr = process.env.SPREAD_NAME.split(',');

const getToday = (): string => {
    let today = new Date();
    let year = today.getFullYear();
    let month = (today.getMonth() + 1).toString().padStart(2, '0');
    let day = today.getDate().toString().padStart(2, '0');
    let hours = today.getHours().toString().padStart(2, '0');
    let mins = today.getMinutes().toString().padStart(2, '0');
    let secs = today.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}:${secs}`;
};

export const dirname = path.dirname(fileURLToPath(import.meta.url));
export const spreadMap = new Map<string, (obj:QueueType)=>string[]>([
    [spreadsArr[0], obj => {
        const { id, type, inputValue } = obj;
        const requestBody: string[] = [id];
        if(type) requestBody.push(type);
        inputValue.forEach((data) => {
            if (data[0] == "일시") {
            const dates = data[1].split(" → ");
            dates.length - 1
                ? requestBody.push(...dates)
                : requestBody.push(...dates, "");
            } else requestBody.push(data[1]);
        });
        requestBody.push(getToday());
        return requestBody;
    }],
    [spreadsArr[1], obj => {
        const { id, type, inputValue } = obj;
        const requestBody: string[] = [id];
        if(type) requestBody.push(type);
        requestBody.push(...inputValue.map(v => v[1]), getToday());
        return requestBody;
    }]
]);