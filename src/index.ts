import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage } from './api'
import * as fs from 'fs'

interface Contact {
  Contact_ID: number;
  Group_ID: number;
  ID_Card: null | string;
  Display_Name: string;
  First_Name: string;
  Last_Name: string;
  Mobile_Phone: string;
  Image: string | null;
  Img: Buffer;
}

const staffGroupIds: number[] = [490, 491, 363]

async function populateCardId() {
  const eventId = 68302
  // const contacts = await getBlankCardIds()
  // const contacts = await getFormResponses(eventId)
  // const contacts = await getRiverMembers();
  const contacts = await getAllRiverMembers();
  // const riverStaff = await getRiverStaff();

  if (!contacts) return

  console.log(`${contacts.length} contacts`)

  const groupedContacts = groupBy(contacts, 'Contact_ID')
  const noStaffMembers: Contact[][] = groupedContacts.filter((contacts: Contact[]) => !contacts.find((contact: Contact) => staffGroupIds.includes(contact.Group_ID)) && contacts.find((contact: Contact) => contact.Group_ID === 500) && contacts.find((contact: Contact) => contact.Group_ID === 504))
  const cleanMembersArr: Contact[] = noStaffMembers.map((contacts: Contact[]) => contacts[0])
  const membersWithPic = cleanMembersArr.filter((contact: Contact) => contact.Image)

  console.log(`cleanMembersArr: ${cleanMembersArr.length} contacts`)
  console.log(`membersWithPic: ${membersWithPic.length} contacts`)
  membersWithPic.forEach((contact: Contact, i: number) => getImage(String(contact.Image)).then((blob: Buffer) => fs.writeFileSync('./src/img/'+ contact.Contact_ID +'.jpeg', blob)))
  // fs.writeFileSync('./src/img/'+ contact.Contact_ID +'.jpeg', blob)
  // fs.writeFileSync('./src/cleanMembers.json', JSON.stringify(cleanMembersArr, null, '\t'));
  fs.writeFileSync('./src/membersWithPic.json', JSON.stringify(membersWithPic, null, '\t'));

  // updateCardId(cleanMembersArr);
}

populateCardId()



function updateCardId(arr: Contact[]) {
  arr.forEach((contact: Contact) => {
    putCardId(contact.Contact_ID, "M-" + contact.Contact_ID).then((card) => console.log('success', card[0].Contact_ID, card[0].First_Name))
  })
}


function groupBy(array: any[], key: string) {
  const participants: any[] = [];

  var outObject = array.reduce(function (a, e) {
    // GROUP BY estimated key (estKey), well, may be a just plain key
    // a -- Accumulator result object
    // e -- sequentially checked Element, the Element that is tested just at this iteration

    // new grouping name may be calculated, but must be based on real value of real field
    let estKey = (e[key]);

    (a[estKey] ? a[estKey] : (a[estKey] = null || [])).push(e);
    return a;
  }, {});

  for (var key in outObject) {
    participants.push(outObject[key]);
  }

  return participants;
}