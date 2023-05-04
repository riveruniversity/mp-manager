import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage } from './api'
import * as fs from 'fs'

import { Contact } from './types'
import { groupBy } from './util'

const staffGroupIds: number[] = [490, 491, 363]




async function getAllRiverMembersInfo() {

  const contacts = await getAllRiverMembers();
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

}

getAllRiverMembersInfo()




