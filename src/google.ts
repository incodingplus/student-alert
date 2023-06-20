import { sheets, auth } from "@googleapis/sheets";
import fs from "fs/promises";
import path from "path";
import { dirname, spreadMap } from "./setting.js";

const raw = await fs.readFile(
  path.resolve(dirname, "../credential", process.env.SPREAD_PATH),
  { encoding: "utf-8" }
);
const json = JSON.parse(raw);
const authorize = new auth.JWT(json.client_email, null, json.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);
const googleSheet = sheets({
  version: "v4",
  auth: authorize,
});
const spreadsheetId = process.env.SPREAD_ID;
const spreadsheetInfo = await googleSheet.spreadsheets.get({
  spreadsheetId,
})
export interface QueueType{
  id:string;
  type?:string;
  inputValue?:[string,string,string][]
  spreadName:string;
};

let working = false;
const queue:[string, QueueType][] = [];

/**
 * 값을 입력받아 스프레드시트에서 A열의 몇번째 행에 해당 값이 있는지를 반환해주는 함수
 * 값을 입력하지 않으면 스프레드시트에서 비어있는 부분의 행 번호를 알려준다.
 * @param {QueueType} obj
 * @returns {number} 열 번호를 반환
 */
const getRownumByValue = async (obj:QueueType) => {
  const sheet = await googleSheet.spreadsheets.values.get({
    spreadsheetId,
    range: obj.spreadName,
  });
  const sheetData = sheet.data.values;
  for (let rowNum = 0; rowNum < sheetData.length; rowNum++) {
    if (sheetData[rowNum][0] === obj.id) return rowNum;
  }
  return 0;
};

const addData = async (val: string[], spreadsheetName:string) => {
  await googleSheet.spreadsheets.values.append({
    spreadsheetId,
    range:spreadsheetName,
    valueInputOption:'RAW',
    requestBody:{
      values:[val]
    }
  });
};

const addToSpreadsheet = async (obj:QueueType) => {
  const requestBody = spreadMap.get(obj.spreadName)(obj);
  await addData(requestBody, obj.spreadName);
};

const deleteDataByrow = async (rowNum: number, spreadsheetName:string) => {
  const spreadsheetSheetId = spreadsheetInfo.data.sheets?.find?.(v => v.properties.title === spreadsheetName).properties.sheetId;
  await googleSheet.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody:{
      requests:[
        {
          deleteDimension:{
            range:{
              sheetId:spreadsheetSheetId,
              dimension:'ROWS',
              startIndex:rowNum,
              endIndex:rowNum + 1,
            }
          }
        }
      ]
    }
  });
};


const deleteSpreadsheet = async (obj:QueueType) => {
  let rowNum = await getRownumByValue(obj);
  if(rowNum !== 0) await deleteDataByrow(rowNum, obj.spreadName);
};

const workSpreadsheet = async (type:string, obj:QueueType) => {
  switch(type){
    case 'add': await addToSpreadsheet(obj); break;
    case 'del': await deleteSpreadsheet(obj); break;
  }
  if(queue[0]) await workSpreadsheet(...queue.shift());
}

export const addQueueSpread = async (_type:string, _obj:QueueType) => {
  queue.push([_type, _obj]);
  if(working) return;
  let count = 0;
  working = true;
  const [ type, obj ] = queue.shift();
  do{
    try{
      await workSpreadsheet(type, obj);
      working = false;
    } catch(err){
      count += 1;
      await new Promise(res => setTimeout(res, 3000));
    }
  }while(working && count < 5);
  if(count === 5){
    await fs.writeFile(path.resolve(dirname, '../logs/todo.json'), JSON.stringify([[type, obj], ...queue]));
    process.exit(1);
  }
}