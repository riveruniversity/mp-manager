//▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ RESULT FILTER ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

import { Contact } from "mp-api";
import { groupArrayBy } from "../../utils";




export function byName(response: Contact[], person: Partial<Contact>) {
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
export function splitDuplicates(person: Contact[], saveDuplicates = true): [Contact | undefined, Contact[]] {
  // console.log(contacts.length, 'with duplicates')

  let unique: Contact | undefined;
  let duplicates: Contact[] = [];

  // remove duplicates by id
  let groupedContacts = groupArrayBy<Contact>(person, 'contactID');
  person = groupedContacts.map((contacts) => contacts[0]);

  if (person.length === 1) return [person[0], duplicates];

  // remove duplicates by email address
  groupedContacts = groupArrayBy<Contact>(person, 'emailAddress');
  person = groupedContacts.reduce((acc: Contact[], contacts: Contact[]) => {

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


  if (person.length === 1) return [person[0], duplicates];


  // remove duplicates by phone #
  groupedContacts = groupArrayBy<Contact>(person, 'mobilePhone');
  person = groupedContacts.reduce((acc: Contact[], contacts: Contact[], i) => {
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

  unique = person.shift();
  if (person.length) duplicates.concat(duplicates, person);

  return [unique, duplicates];
}
