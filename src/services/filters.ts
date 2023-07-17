import { getPreregisteredGroups, getRiverStaff, getSignedWaiver } from "../api/mp";
import { EventContact, GroupContact } from "../types/MP";
import { group, youthWeek } from '../config/vars'
import { groupBy } from "../utils";



export function noStaff(contacts: GroupContact[]) {
  // const noStaffMembers: GroupContact[] = contacts.filter((contacts: GroupContact) => !contacts.find((contact: GroupContact) => staffGroupIds.includes(contact.Group_ID)) && contacts.find((contact: GroupContact) => contact.Group_ID === 500) && contacts.find((contact: GroupContact) => contact.Group_ID === 504))
  // return noStaffMembers;
}

export async function removeStaff(contacts: EventContact[]): Promise<EventContact[]> {
  const staff: GroupContact[] = await getRiverStaff();
  contacts = contacts.filter(contact => !staff.find(staff => staff.Contact_ID === contact.Contact_ID))
  console.log(contacts.length, 'without staff')
  return contacts
}

export async function removeNonWaiverSigned(contacts: EventContact[]): Promise<EventContact[]> {
  const waivers: GroupContact[] = await getSignedWaiver();
  contacts = contacts.filter(contact => !!waivers.find(w => w.Contact_ID === contact.Contact_ID))
  console.log(contacts.length, 'with waiver')
  return contacts;
}


export async function removeGroupRegistrations(contacts: EventContact[]): Promise<EventContact[]> {
  const groups: GroupContact[] = await getPreregisteredGroups();
  contacts = contacts.filter(contact => !groups.find(g => g.Contact_ID === contact.Contact_ID))
  console.log(contacts.length, 'without group registrations')
  return contacts;
}


export async function removeAdults(contacts: EventContact[]): Promise<EventContact[]> {
  contacts = contacts.filter(contact => contact.Group_ID !== youthWeek.adult)
  console.log(contacts.length, 'without group registrations')
  return contacts;
}


export async function removeDuplicates(contacts: EventContact[]): Promise<EventContact[]> {
  console.log(contacts.length, 'with duplicates')
  const groupedContacts = groupBy(contacts, 'Contact_ID')
  contacts = groupedContacts.map((contact: EventContact[]) => contact[0])
  console.log(contacts.length, 'without duplicates')
  return contacts
}