const csv = require('csvtojson')
// import { json2csv } from "json-2-csv";
// import * as fs from 'fs'

import { Attendee } from "../types/MP";
import { groupOrderedArrayBy } from "../utils";

const csvHeaders = ["First Name", "Last Name", "Email", "Cell Phone"];


// >>> Load CSV File
const csvFilePath = `./src/data/eventbrite.csv`


export const people: Promise<Attendee[]> =

  csv().fromFile(csvFilePath)
    // Filter headers
    .then((jsonObj: Attendee[]) => jsonObj.map((attendee) => Object.entries(attendee)
      .reduce((acc, [key, value]) => csvHeaders.includes(key) ? ({ ...acc, ...{ [key.replace(' ', '')]: value } }) : acc, {}))
    )
    // Fix phone numbers
    .then((attendees: Attendee[]) => attendees.map(attendee => ({ ...attendee, CellPhone: fixNumber(attendee.CellPhone) })))
    // Generate Id by combining all attendee data 
    .then((attendees: Attendee[]) => attendees.map((attendee) => {
      const idString = Object.values(attendee).join('').toLowerCase().replace(/ /, '');
      return { ...attendee, ID: Buffer.from(idString).toString('base64') };
    }))
    // Grouping by Id to remove duplicates
    .then(async (attendees: Attendee[]) => {
      // fs.writeFileSync(`src/data/attendees.csv`, await json2csv(attendees, { emptyFieldValue: '' }));
      const groupedById = groupOrderedArrayBy<Attendee>(attendees, "ID");
      return groupedById.map(attendee => attendee[0]);
    })


function fixNumber(num: string) {

  const cleaned = String(num).trim()
    .replace(/(?<!^)\+|[^\d+]+/g, '')  // Remove non digits and keep the +
    .replace(/^00/, '+')               // Remove preceding '00'
    .replace(/^\+?1(?=\d{10})/, '')    // Remove preceding '+1' or '1' for American numbers     


  if (cleaned.length == 10) {
    return cleaned
  }
  else if (cleaned.includes('+')) {
    return ''
  }
  else {
    return ''
  }
}