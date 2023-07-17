import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage } from '../api/mp'
import * as fs from 'fs'

import { GroupContact } from '../types/MP'
import { groupBy } from '../utils'

const staffGroupIds: number[] = [490, 491, 363]


async function getAllRiverMembersInfo() {

  const contacts = await getAllRiverMembers();
  if (!contacts) return

  console.log(`${contacts.length} contacts`)

  const groupedContacts = groupBy(contacts, 'Contact_ID')
  const noStaffMembers: GroupContact[][] = groupedContacts.filter((contacts: GroupContact[]) => !contacts.find((contact: GroupContact) => staffGroupIds.includes(contact.Group_ID)) && contacts.find((contact: GroupContact) => contact.Group_ID === 500) && contacts.find((contact: GroupContact) => contact.Group_ID === 504))
  const cleanMembersArr: GroupContact[] = noStaffMembers.map((contacts: GroupContact[]) => contacts[0])
  const membersWithPic = cleanMembersArr.filter((contact: GroupContact) => contact.Image)

  console.log(`cleanMembersArr: ${cleanMembersArr.length} contacts`)
  console.log(`membersWithPic: ${membersWithPic.length} contacts`)
  return 
  membersWithPic.forEach((contact: GroupContact, i: number) => getImage(String(contact.Image)).then((blob: Buffer) => fs.writeFileSync('./src/img/'+ contact.Contact_ID +'.jpeg', blob)))
  // fs.writeFileSync('./src/img/'+ contact.Contact_ID +'.jpeg', blob)
  // fs.writeFileSync('./src/cleanMembers.json', JSON.stringify(cleanMembersArr, null, '\t'));
  fs.writeFileSync('./src/membersWithPic.json', JSON.stringify(membersWithPic, null, '\t'));

}

getAllRiverMembersInfo()




