import { sheets, auth } from "@googleapis/sheets";
import fs from "fs/promises";
import path from "path";
import { dirname } from "./setting.js";

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
const spreadsheetName = process.env.SPREAD_NAME;
const spreadsheetNameJisi = process.env.SPREAD_NAME_JISI
const spreadsheetInfo = await googleSheet.spreadsheets.get({
  spreadsheetId,
})
interface QueueType{
  id:string;
  type?:string;
  inputValue?:[string,string][]
  spreadName:string;
};

let working = false;
const queue:[string, QueueType][] = [];

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

/**
 * 값을 입력받아 스프레드시트에서 A열의 몇번째 행에 해당 값이 있는지를 반환해주는 함수
 * 값을 입력하지 않으면 스프레드시트에서 비어있는 부분의 행 번호를 알려준다.
 * @param {string} value
 * @returns 열 번호를 반환
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
  working = true;

  const [ type, obj ] = queue.shift();
  await workSpreadsheet(type, obj);
  working = false;
}