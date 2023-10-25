import * as fs from 'fs'
import SQL from 'sql.js';
import initSqlJs from 'sql.js/dist/sql-wasm.js';

import { Attendee, EventContact } from '../types/MP';


//sql.js/dist/sql-wasm.wasm
let db: SQL.Database;
let sqlStr: string;
let stmt: any;
let result: any;

initSqlJs().then(function (SQL) {
  // const fileBuffer = fs.readFileSync('src/data/contacts-db.sqlite');
  // db = new SQL.Database(fileBuffer);
  db = new SQL.Database();
});


export function saveDb() {
  var data = db.export();
  var buffer = Buffer.from(data);
  fs.writeFileSync("src/data/contacts-db.sqlite", buffer);
}


export async function insertValues(contacts: EventContact[]) {

  sqlStr = `CREATE TABLE bulk (Contact_ID INT, ID_Card TINYTEXT, First_Name TINYTEXT, Last_Name TINYTEXT, Email_Address TINYTEXT, Mobile_Phone TINYTEXT, Group_ID INT, Household_Position_ID INT, Attending_Online BOOL);\n`;

  for (let c of contacts) {
    sqlStr += `INSERT INTO bulk VALUES (${c.Contact_ID}, '${c.ID_Card}', '${c.First_Name}', "${c.Last_Name.replaceAll('\"','\'')}", '${c.Email_Address}', '${c.Mobile_Phone}', ${c.Group_ID}, ${c.Household_Position_ID}, ${c.Attending_Online});\n`;
  }

  fs.writeFileSync('src/data/statements.sql', sqlStr);

  result = db.exec(sqlStr);
  console.log('Inserted into Table')
  saveDb();
}


export async function findDuplicates() {

  // - sqlStr = `SELECT * FROM bulk WHERE 1 < (Select Count(*) from [bulk] b WHERE b.First_Name = bulk.First_Name AND b.Email_Address = bulk.Email_Address AND NOT bulk.Email_Address=null)`
  sqlStr = 
 `SELECT ID_Card, First_Name, Last_Name, Email_Address, Mobile_Phone, COUNT(*) 
  FROM bulk
  GROUP BY First_Name, Mobile_Phone
  
  HAVING COUNT(*)>1 AND NOT Mobile_Phone='null'
 `

  result = db.exec(sqlStr);
  // console.log('results', result)
  console.log('results', result.length && result[0].values.length)
  fs.writeFileSync('src/data/result.json', JSON.stringify(result, null, '\t'));
}
