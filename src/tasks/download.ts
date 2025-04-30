import { getBlankCardIds, getFormResponses, getRiverMembers, getRmiStaff, getAllRiverMembers, getImage } from '../api/mp';
import { contactToBulkTextFormat } from '../services/converters';
import { EventContact } from '../types/MP';

import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

const fileName: string = `staff`;

(async function getStaff() {

  const contacts = await getRmiStaff() as unknown as EventContact[];
  if (!contacts) return

  console.log(`${contacts.length} contacts`)

  fs.writeFileSync(`./src/data/${fileName}.csv`, await json2csv(contacts, { emptyFieldValue: '' })); 
})()