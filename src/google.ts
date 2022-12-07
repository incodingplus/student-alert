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
const spreadsheetId = "1liovQ_eab5Q9cgxbwcN7gnDukOUIVCnCCmkd8raSf6o";
const conNames = [""];

const getToday = (): string => {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  return year + "-" + month + "-" + day;
};

/**
 * 값을 입력받아 스프레드시트에서 A열의 몇번째 행에 해당 값이 있는지를 반환해주는 함수
 * 값을 입력하지 않으면 스프레드시트에서 비어있는 부분의 행 번호를 알려준다.
 * @param {string} value
 * @returns 열 번호를 반환
 */
const getRownumByValue = async (value: string) => {
  const sheet = await googleSheet.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "시트1",
  });
  const sheetData = sheet.data.values;

  let rowNum: number;
  for (let i = 0; i < sheetData.length; i++) {
    rowNum = i + 1;
    if (sheetData[i][0] == value) break;
  }
  return rowNum;
};

const getLastRownum = async () => {
  const sheet = await googleSheet.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "시트1",
  });
  const sheetData = sheet.data.values;

  let rowNum: number;
  for (let i = 0; i < sheetData.length; i++) {
    rowNum = i + 1;
    console.log(sheetData[i][0]);
    if (!sheetData[i][0]) break;
  }
  if (sheetData.length == rowNum) rowNum++;
  return rowNum;
};
const addData = async (val: string[]) => {
  let rowNum = await getLastRownum();
  await googleSheet.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: `시트1!${rowNum}:${rowNum}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [val],
    },
  });
};

export const addToSpreadsheet = async (
  chatId: string,
  type: string,
  inputValue: [string, string][]
) => {
  const requestBody: string[] = [chatId, type];
  inputValue.forEach((data) => {
    if (data[0] == "일시") {
      const dates = data[1].split(" → ");
      dates.length - 1
        ? requestBody.push(...dates)
        : requestBody.push(...dates, "");
    } else requestBody.push(data[1]);
  });
  requestBody.push(getToday());
  await addData(requestBody);
};

const deleteDataByrow = async (rowNum: number) => {
  await googleSheet.spreadsheets.values.clear({
    spreadsheetId: spreadsheetId,
    range: `시트1!${rowNum}:${rowNum}`,
  });
};
export const deleteSpreadsheet = async (id: string) => {
  let rowNum = await getRownumByValue(id);
  deleteDataByrow(rowNum);
};
//A(index+1)번째 있는 값을 삭제해야함
