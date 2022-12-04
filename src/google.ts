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

const addData = async (val: string[]) => {
  await googleSheet.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: "시트1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [val],
    },
  });
};

const deleteDataByrow = async (rowNum: number) => {
  await googleSheet.spreadsheets.values.clear({
    spreadsheetId: spreadsheetId,
    range: `시트1!${rowNum}:${rowNum}`,
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

export const deleteSpreadsheet = async (id: string) => {
  const sheet = await googleSheet.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "시트1",
  });
  const sheetData = sheet.data.values;

  //몇번째 row에 있는지 rowNum을 받아옴
  let rowNum: number;
  sheetData.forEach((v, i) => {
    rowNum = i + 1;
    if (v[0] == id) return;
  });
  deleteDataByrow(rowNum);
};
//A(index+1)번째 있는 값을 삭제해야함
