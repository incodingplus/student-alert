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
const conNames = [""];
const sheet = await googleSheet.spreadsheets.values.get({
  spreadsheetId: "1liovQ_eab5Q9cgxbwcN7gnDukOUIVCnCCmkd8raSf6o",
  range: "A1:B1",
});

const getToday = (): string => {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  return year + "-" + month + "-" + day;
};

const addData = async (val: string[]) => {
  const sheet = await googleSheet.spreadsheets.values.append({
    spreadsheetId: "1liovQ_eab5Q9cgxbwcN7gnDukOUIVCnCCmkd8raSf6o",
    range: "시트1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
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
  const requestBody: string[] = [chatId, type, getToday()];
  inputValue.forEach((data) => {
    if (data[0] == "일시") {
      const dates = data[1].split(" → ");
      requestBody.push(...dates);
    } else requestBody.push(data[1]);
  });
  await addData(requestBody);
};

console.log(sheet.data.values);
