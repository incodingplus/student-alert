import * as dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import type { QueueType } from './google.js';
import fs from 'fs/promises'

export const channelsArr = process.env.CHANNEL.split(',');
export const constraintChannel = process.env.CONSTRAINT.split(',');
export const spreadsArr = process.env.SPREAD_NAME.split(',');
export const DEFAULT_ID = process.env.DEFAULT_ID ?? '학생 알리미';

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

try{
    await fs.access(path.resolve(dirname, '../logs'))
} catch(err){
    await fs.mkdir(path.resolve(dirname, '../logs'));
}
export const spreadMap = new Map<string, (obj:QueueType)=>string[]>([
    [spreadsArr[0], obj => {
        const { id, type, inputValue } = obj;
        const requestBody: string[] = [id];
        if(type) requestBody.push(type);
        inputValue.forEach((data) => {
            if (data[0] === "일시") {
                const dates = data[1].split(" → ");
                let row = data[2].split(',').map(v => Number(v));
                requestBody[row[0]] = dates[0];
                if(row[1]) requestBody[row[1]] = dates[1];
            } else if(data[0] === '아이디'){
                let pushData = [data[1], data[1].replace(/\d+/, '')];
                let row = data[2].split(',').map(v => Number(v));
                for(let i = 0; i < row.length; i++){
                    requestBody[row[i]] = pushData[i];
                }
            } else requestBody[Number(data[2])] = data[1];
        });
        requestBody[9] = getToday();
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