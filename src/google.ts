import { sheets, auth } from "@googleapis/sheets";

import path from "path";
import { dirname, spreadMap } from "./setting";

const author = new auth.GoogleAuth({
  scopes:["https://www.googleapis.com/auth/spreadsheets"]
})

const googleSheet = sheets({
  version: "v4",
  auth:author,
});
const spreadsheetId = Bun.env.HAN_SPREAD_ID;

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
 */
const getRownumByValue = async (obj:QueueType) => {
  const sheet = await googleSheet.spreadsheets.values.get({
    spreadsheetId,
    range: obj.spreadName,
  });
  const sheetData = sheet.data.values;
  if(!sheetData) return 0;
  for (let rowNum = 0; rowNum < sheetData.length; rowNum++) {
    if (sheetData[rowNum][0] === obj.id) return rowNum;
  }
  return 0;
};

const addData = async (val: string[], spreadsheetName:string) => {
  await googleSheet.spreadsheets.values.append({
    spreadsheetId,
    range:`${spreadsheetName}!A:A`,
    valueInputOption:'RAW',
    insertDataOption:'INSERT_ROWS',
    requestBody:{
      values:[val]
    }
  });
};

const addToSpreadsheet = async (obj:QueueType) => {
  const mapFun = spreadMap.get(obj.spreadName);
  if(!mapFun) return;
  const requestBody = mapFun(obj);
  await addData(requestBody, obj.spreadName);
};

const deleteDataByrow = async (rowNum: number, spreadsheetName:string) => {
  const pro = spreadsheetInfo.data.sheets?.find?.(v => v.properties?.title === spreadsheetName)?.properties;
  if(!pro) return;
  const spreadsheetSheetId = pro.sheetId;
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
  if(queue[0]) {
    const val = queue.shift();
    if(!val) return;
    await workSpreadsheet(...val);
  }
}

export const addQueueSpread = async (_type:string, _obj:QueueType) => {
  queue.push([_type, _obj]);
  if(working) return;
  let count = 0;
  working = true;
  const val = queue.shift();
  if(!val) return;
  const [ type, obj ] = val;
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
    await Bun.write(path.resolve(dirname, '../logs/todo.json'), JSON.stringify([[type, obj], ...queue]));
    process.exit(1);
  }
}