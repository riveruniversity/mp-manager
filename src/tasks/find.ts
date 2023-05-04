import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage, getContact } from '../api'
import * as fs from 'fs'

import { people } from '../data/eventbrite'



function findMPRecord() {

  var list: any[] = [];

  const accumulate = new Promise((resolve, reject) => {

    people.forEach(async (person, i) => {

      var res = await getContact(`Participant_ID_Table_Contact_ID_Table.Email_Address='${person.Email}'`)
      if (res.length) console.log(person.CellPhone + ': found by email ✅', res)
      else {
        // console.log(person.CellPhone + ': not found by email. Trying to find by phone #')
        res = await getContact(`Participant_ID_Table_Contact_ID_Table.Mobile_Phone='${String(person.CellPhone).replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}'`)
        if (res.length) console.log(person.CellPhone + ': found by phone ✅', res)
        else {
          // console.log(person.CellPhone + ': not found by phone #. Trying to find by name')
          res = await getContact(`((Participant_ID_Table_Contact_ID_Table.First_Name='${person.FirstName}' AND Participant_ID_Table_Contact_ID_Table.Last_Name='${person.LastName}') OR (Display_Name Like '%${person.FirstName}%' AND Display_Name Like '%${person.LastName}%'))`)
          if (res.length) console.log(person.CellPhone + ': found by name ✅', res)
          else console.log(person.CellPhone + ': not found ❌')
        }
      }

      if (res.length) list = list.concat(res)
      if (i == people.length - 1) resolve(true)
    })
  })

  accumulate.then(() => {
    console.log(list.length + ' people found');
    fs.writeFileSync('./src/data/carShow.json', JSON.stringify(list, null, '\t'));
  })
  
  

}

findMPRecord()