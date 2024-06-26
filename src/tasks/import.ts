const csv = require('csvtojson')
// import { json2csv } from "json-2-csv";
// import * as fs from 'fs'

import { Attendee } from "../types/MP";
import { fixNumber, groupOrderedArrayBy } from "../utils";

const csvHeaders = ["First Name", "Last Name", "Email", "Cell Phone"];


// >>> Load CSV File
export async function importCsv(fileName: string): Promise<Attendee[]> {

  return csv()
    .fromFile(`./src/data/` + fileName)
    // Filter headers
    .then((jsonObj: Attendee[]) => jsonObj.map((attendee) => Object.entries(attendee)
      .reduce((acc, [key, value]) => csvHeaders.includes(key) ? ({ ...acc, ...{ [key.replace(' ', '')]: value } }) : acc, {}))
    )
    // Fix phone numbers
    .then((attendees: Attendee[]) => attendees.map(attendee => ({ ...attendee, CellPhone: fixNumber(attendee.CellPhone) })))
    // Generate Id by combining all attendee data 
    .then((attendees: Attendee[]) => attendees.map((attendee) => {
      const idString = Object.values(attendee).join('').toLowerCase().replaceAll(/ /g, '');
      return { ...attendee, ID: Buffer.from(idString).toString('base64') };
    }))
    // Grouping by Id to remove duplicates
    .then(async (attendees: Attendee[]) => {
      // fs.writeFileSync(`src/data/attendees.csv`, await json2csv(attendees, { emptyFieldValue: '' }));
      const groupedById = groupOrderedArrayBy<Attendee>(attendees, "ID");
      return groupedById.map(attendee => attendee[0]);
    })

}


