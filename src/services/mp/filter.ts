//▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ RESULT FILTER ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

import { Contact, ContactWithEmailAddress, ContactWithEmailAddresses } from "mp-api";
import { groupArrayBy } from "../../utils";



export function byName(response: (ContactWithEmailAddress | Contact)[], person: Partial<(ContactWithEmailAddress | Contact)>)
  : (ContactWithEmailAddresses | Contact)[] {

  const lower = (name: string | null | undefined) => name?.toLowerCase().split(' ').shift();
  const firstName = lower(person.firstName);
  const lastName = lower(person.lastName);
  const nickName = lower(person.nickname);
  return response.filter(r =>
    (lower(r.firstName)?.includes(firstName || '') || firstName?.includes(lower(r.firstName) || '') || lower(r.nickname || '') == nickName) &&
    (lower(r.lastName)?.includes(lastName || '') || lastName?.includes(lower(r.lastName) || ''))
  );
  // remove last name to get more results (but is less accurate)
}

// Remove duplicates where first name, email (and phone) are the same
export function splitDuplicates(person: (ContactWithEmailAddress | Contact)[], saveDuplicates = true): [(ContactWithEmailAddress | Contact) | undefined, (ContactWithEmailAddress | Contact)[]] {
  // console.log(contacts.length, 'with duplicates')

  let unique: Contact | undefined;
  let duplicates: Contact[] = [];

  // remove duplicates by id
  let groupedContacts = groupArrayBy<Contact>(person, 'contactID');
  let contact = groupedContacts.map((contacts) => contacts[0]);

  if (contact.length === 1) return [contact[0], duplicates];

  // remove duplicates by email address
  groupedContacts = groupArrayBy<Contact>(contact, 'emailAddress');
  if (groupedContacts.length) contact = groupedContacts.reduce((acc: Contact[], contacts: Contact[]) => {

    if (contacts.length === 1) acc = [...acc, ...contacts];
    else {
      const groupedByName = groupArrayBy<Contact>(contacts, "firstName");
      const filtered: Contact[] = groupedByName.reduce((accName: Contact[], current: Contact[]) => {
        if (!current.length)
          return acc;
        else if (current.length == 1)
          return [...accName, ...current];
        else {
          let first = current[0];
          duplicates = duplicates.concat(current);
          return [...accName, first];
        }
      }, []);

      acc = [...acc, ...filtered];
    }

    return acc;
  }, []);


  if (contact.length === 1) return [contact[0], duplicates];


  // remove duplicates by phone #
  groupedContacts = groupArrayBy<Contact>(contact, 'mobilePhone');
  if (groupedContacts.length) contact = groupedContacts.reduce((acc: Contact[], contacts: Contact[], i) => {
    if (contacts.length === 1) acc = [...acc, ...contacts];
    else {
      const groupedByName = groupArrayBy<Contact>(contacts, "firstName");
      const filtered: Contact[] = groupedByName.reduce((accName: Contact[], current: Contact[]) => {
        if (!current.length)
          return acc;
        else if (current.length == 1)
          return [...accName, ...current];
        else {
          let first = current[0];
          duplicates = duplicates.concat(current);
          return [...accName, first];
        }

      }, []);

      acc = [...acc, ...filtered];
    }

    return acc;
  }, []);

  unique = contact.shift();
  if (contact.length)
    duplicates = [...duplicates, ...contact, unique!];

  return [unique, duplicates];
}
