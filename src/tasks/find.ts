import * as fs from 'fs'
import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage, getContact, Field } from '../api/mp'
import { people } from '../data/eventbrite'
import { sleep } from '../utils';


async function findMPRecord() {

  var found: any[] = [];
  var notFound: any[] = [];


  people.forEach(async person => {

    // await getContact(`((${Field.First_Name}='${person.FirstName}' AND ${Field.Last_Name}='${person.LastName}') OR (Display_Name Like '${person.FirstName}%' AND Display_Name Like '${person.LastName}%') OR (${Field.Nickname}='${person.FirstName}' AND ${Field.Last_Name}='${person.LastName}'))`)
    // if (res.length) console.log(person.CellPhone + ': found by name ✅')
    var res;
    if (person.CellPhone)
      res = await getContact(`${Field.Mobile_Phone}='${String(person.CellPhone).replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}'`)
    if (res.length) console.log(person.CellPhone + ': found by phone ✅')
    else {
      // console.log(person.CellPhone + ': not found by phone #. Trying to find by email')
      if (person.Email) res = await getContact(`${Field.Email_Address}='${person.Email}'`)
      if (res.length) console.log(person.CellPhone + ': found by email ✅')
      else {
        notFound = notFound.concat(person)
        console.log(person.CellPhone + ': not found ❌')
      }
    }

    if (res.length) found = found.concat(res)
  })

  await sleep(10000)
  console.log(found.length + ' people found');
  console.log(notFound.length + ' people not found');

  fs.writeFileSync('./src/data/carShow/carShowOnMP.json', JSON.stringify(found, null, '\t'));
  fs.writeFileSync('./src/data/carShow/carShowNoMP.json', JSON.stringify(notFound, null, '\t'));
}

findMPRecord()