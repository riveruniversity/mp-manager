import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage, getContact } from '../api/mp'
import * as fs from 'fs'

import { people } from '../data/eventbrite'
import { sleep } from '../utils';



async function findMPRecord() {

  var found: any[] = [];
  var notFound: any[] = [];


  people.forEach(async person => {

    var res = await getContact(`((Participant_ID_Table_Contact_ID_Table.First_Name='${person.FirstName}' AND Participant_ID_Table_Contact_ID_Table.Last_Name='${person.LastName}') OR (Display_Name Like '%${person.FirstName}%' AND Display_Name Like '%${person.LastName}%'))`)
    if (res.length) console.log(person.CellPhone + ': found by name ✅')
    else {
      // console.log(person.CellPhone + ': not found by name. Trying to find by phone number')
      if (person.CellPhone) res = await getContact(`Participant_ID_Table_Contact_ID_Table.Mobile_Phone='${String(person.CellPhone).replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}'`)
      if (res.length) console.log(person.CellPhone + ': found by phone ✅')
      else {
        // console.log(person.CellPhone + ': not found by phone #. Trying to find by email')
        if (person.Email) res = await getContact(`Participant_ID_Table_Contact_ID_Table.Email_Address='${person.Email}'`)
        if (res.length) console.log(person.CellPhone + ': found by email ✅')
        else {
          notFound = notFound.concat(person)
          console.log(person.CellPhone + ': not found ❌')
        }
      }
    }

    if (res.length) found = found.concat(res)
  })

  await sleep(10000)
  console.log(found.length + ' people found');
  fs.writeFileSync('./src/data/carShow.json', JSON.stringify(found, null, '\t'));
  fs.writeFileSync('./src/data/carShowNoMP.json', JSON.stringify(notFound, null, '\t'));
}

findMPRecord()