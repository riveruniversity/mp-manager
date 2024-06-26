import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { getPreregisteredGroups, getRiverStaff, getSignedWaiver } from "../api/mp";
import { Contact, EventContact, GroupContact } from "../types/MP";
import { Attendee } from "../types/Eventbrite";
import { group, youthWeek } from '../config/vars'
import { groupArrayBy } from "../utils";


export function noStaff(contacts: GroupContact[]) {
  // const noStaffMembers: GroupContact[] = contacts.filter((contacts: GroupContact) => !contacts.find((contact: GroupContact) => staffGroupIds.includes(contact.Group_ID)) && contacts.find((contact: GroupContact) => contact.Group_ID === 500) && contacts.find((contact: GroupContact) => contact.Group_ID === 504))
  // return noStaffMembers;
}

export async function removeStaff(contacts: EventContact[]): Promise<EventContact[]> {
  const staff: GroupContact[] = await getRiverStaff();
  contacts = contacts.filter(contact => !staff.find(staff => staff.Contact_ID === contact.Contact_ID))
  console.log(contacts.length, 'excluding staff')
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
  console.log(contacts.length, 'excluding group registrations')
  return contacts;
}


export async function removeAdults(contacts: EventContact[]): Promise<EventContact[]> {
  contacts = contacts.filter(contact => contact.Group_ID !== youthWeek.adult)
  console.log(contacts.length, 'excluding group registrations')
  return contacts;
}


export async function removeDuplicatesById<T>(contacts: T[], saveDuplicates = true): Promise<T[]> {
  // console.log(contacts.length, 'with duplicates')

  // remove duplicates by id
  let groupedContacts: Array<T[]> = groupArrayBy<T>(contacts, 'Contact_ID' as keyof T);
  let filtered: T[] = groupedContacts.map((contacts: T[]) => contacts[0]) as T[]
  return filtered
}

// Remove duplicates where first name, email (and phone) are the same
export async function removeDuplicates(eventContacts: EventContact[], saveDuplicates = true): Promise<EventContact[]> {
  // console.log(contacts.length, 'with duplicates')

  // remove duplicates by id
  let duplicates: EventContact[] = [];
  let groupedContacts: Array<EventContact[]> = groupArrayBy<EventContact>(eventContacts, 'Contact_ID');
  eventContacts = groupedContacts.map((contacts: EventContact[]) => contacts[0])

  // remove duplicates by email address
  groupedContacts = groupArrayBy<EventContact>(eventContacts, 'Email_Address');
  eventContacts = groupedContacts.reduce((acc, contacts: EventContact[], i) => {

    if (contacts.length === 1) acc = [...acc, ...contacts];
    else {
      const groupedByName = groupArrayBy<EventContact>(contacts, "First_Name");
      const filtered = groupedByName.reduce((accName, current: EventContact[]) => {
        if (current.length === 1) return [...accName, ...current]
        else {
          // console.log('groupedByName', current)

          const select = current.find(c => !!c.Mobile_Phone || !!c.Email_Address)
          if (select) accName.push(select) // don't include if no phone or email address
          duplicates = duplicates.concat(current);
        }
        return accName;
      }, [])

      acc = [...acc, ...filtered]
    }

    return acc;
  }, [])


  // remove duplicates by phone #
  groupedContacts = groupArrayBy<EventContact>(eventContacts, 'Mobile_Phone');
  eventContacts = groupedContacts.reduce((acc, contacts: EventContact[], i) => {
    if (contacts.length === 1) acc = [...acc, ...contacts];
    else {
      const groupedByName = groupArrayBy<EventContact>(contacts, "First_Name");
      const filtered = groupedByName.reduce((accName, current: EventContact[]) => {
        if (current.length === 1) return [...accName, ...current]
        else {
          const select = current.find(c => !!c.Mobile_Phone || !!c.Email_Address)
          if (select) accName.push(select) // don't include if no phone or email address
          duplicates = duplicates.concat(current);
        }
        return accName;
      }, [])

      acc = [...acc, ...filtered]
    }

    return acc;
  }, [])

  // fs.writeFileSync(`./src/data/eventContacts.json`, JSON.stringify(eventContacts, null, '\t'));
  // fs.writeFileSync(`./src/data/duplicates.json`, JSON.stringify(duplicates, null, '\t'));
  saveDuplicates && fs.writeFileSync('src/data/duplicates.csv', await json2csv(duplicates, { emptyFieldValue: '' }));

  console.log(eventContacts.length, 'excluding duplicates')
  return eventContacts
}


export async function removeOnline(contacts: EventContact[]): Promise<EventContact[]> {
  // console.log(contacts.length, 'with online viewers')
  contacts = contacts.filter(contact => !contact.Attending_Online)
  console.log(contacts.length, 'excluding online viewers')
  return contacts;
}


export function filterByName(response: Contact[] | Contact[], person: Attendee) {
  const fullName = (p: Contact | Contact) => (p.Display_Name + ' ' + p.First_Name + ' ' + p.Nickname).toLowerCase()
  const firstName = person.First_Name.toLowerCase().split(' ')[0]
  const lastName = person.Last_Name.toLowerCase().split(' ')[0]
  return response.filter((p: Contact | Contact) => fullName(p).includes(firstName) && fullName(p).includes(lastName)) // remove last name to get more results (but is more inaccurate)
}