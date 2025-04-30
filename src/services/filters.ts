import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { getPreregisteredGroups, getRmiStaff, getSignedWaiver } from "../api/mp";
import { EventContact, FestParticipant, GroupContact } from "../types/MP";
import { Attendee } from "../types/Eventbrite";
import { group, youthWeek } from '../config/vars'
import { groupArrayBy } from '../utils';
import { Contact } from 'mp-api';
import { CreatePersonParams } from './mp/create';


export function noStaff(contacts: GroupContact[]) {
  // const noStaffMembers: GroupContact[] = contacts.filter((contacts: GroupContact) => !contacts.find((contact: GroupContact) => staffGroupIds.includes(contact.Group_ID)) && contacts.find((contact: GroupContact) => contact.Group_ID === 500) && contacts.find((contact: GroupContact) => contact.Group_ID === 504))
  // return noStaffMembers;
}

export async function removeStaff(contacts: EventContact[]): Promise<EventContact[]> {
  const staff: GroupContact[] = await getRmiStaff();
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


export function removeDuplicatesById<T>(contacts: T[], saveDuplicates = true): T[] {
  // console.log(contacts.length, 'with duplicates')

  // remove duplicates by id
  let groupedContacts: Array<T[]> = groupArrayBy<T>(contacts, 'Contact_ID' as keyof T);
  let filtered: T[] = groupedContacts.map((contacts: T[]) => contacts[0]) as T[]
  return filtered
}


export function byName(results: Contact[], person: Partial<CreatePersonParams>) {
  const lower = (name: string | null) => name && name.toLowerCase().split(' ').shift() || '';
  const firstName = lower(person.firstName || '');
  const lastName = lower(person.lastName || '');
  return results.filter(r =>
    (lower(r.firstName).includes(firstName) || firstName.includes(lower(r.firstName)) || lower(r.nickname) == firstName) &&
    (lower(r.lastName).includes(lastName) || lastName.includes(lower(r.lastName)))
  )
  // remove last name to get more results (but is less accurate)
}



// Remove duplicates where first name, email (and phone) are the same
export function filterDuplicates(results: Contact[], returnDuplicates=true): Array<Contact[]> {
  // console.log(contacts.length, 'with duplicates')

  // remove duplicates by id
  let duplicates: Contact[] = [];
  let groupedContacts: Array<Contact[]> = groupArrayBy<Contact>(results, 'contactID');
  results = groupedContacts.map((contacts: Contact[]) => contacts[0])

  // remove duplicates by email address
  groupedContacts = groupArrayBy<Contact>(results, 'emailAddress');
  results = groupedContacts.reduce((acc, contacts: Contact[], i) => {

    if (contacts.length === 1) acc = [...acc, ...contacts];
    else {
      const groupedByName = groupArrayBy<Contact>(contacts, "firstName");
      const filtered = groupedByName.reduce((accName, current: Contact[]) => {
        if (current.length === 1) return [...accName, ...current]
        else {
          // console.log('groupedByName', current)

          const select = current.find(c => !!c.mobilePhone || !!c.emailAddress)
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
  groupedContacts = groupArrayBy<Contact>(results, 'mobilePhone');
  results = groupedContacts.reduce((acc, contacts: Contact[], i) => {
    if (contacts.length === 1) acc = [...acc, ...contacts];
    else {
      const groupedByName = groupArrayBy<Contact>(contacts, "firstName");
      const filtered = groupedByName.reduce((accName, current: Contact[]) => {
        if (current.length === 1) return [...accName, ...current]
        else {
          const select = current.find(c => !!c.mobilePhone || !!c.emailAddress)
          if (select) accName.push(select) // don't include if no phone or email address
          duplicates = duplicates.concat(current);
        }
        return accName;
      }, [])

      acc = [...acc, ...filtered]
    }

    return acc;
  }, [])

  return [results, duplicates];
}


export async function removeOnline(contacts: EventContact[]): Promise<EventContact[]> {
  // console.log(contacts.length, 'with online viewers')
  contacts = contacts.filter(contact => !contact.Attending_Online)
  console.log(contacts.length, 'excluding online viewers')
  return contacts;
}

