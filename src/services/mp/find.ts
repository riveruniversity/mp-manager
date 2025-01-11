import { Contact, ErrorDetails } from "mp-api";
import { CreatePersonParams } from "./create";
import { formatPhone } from "../../utils";
import { byName, filterDuplicates } from "../filters";
import { mp } from "./api";
import { splitDuplicates } from "./filter";
import { cleanPhoneNumber } from "../../utils/strings";

// Find existing Contact record
// Must have:
// firstName, lastName, and at least one of the following fields: 
// phoneNumber, emailAddress, or dateOfBirth
export async function findContact(person: SearchParams) //
  : Promise<{ existing: Contact | undefined, duplicates: Contact[]; } | { error: ErrorDetails; }> {

  var existing: Contact | undefined = undefined;
  var filtered: Contact[] = [];
  var duplicates: Contact[] = [];
  var results: Contact[] | { error: ErrorDetails; } = [];

  let dateOfBirth = person.dateOfBirth && new Date(person.dateOfBirth).toISOString().split('T')[0] + 'T00:00:00';
  let phoneNumber = cleanPhoneNumber(person.phoneNumber);

  let firstNameQuery = person.firstName.match(/\w+/g)?.map(n => `CONCAT(Contacts.First_Name, Contacts.Nickname) LIKE '%${n}%'`).join(' OR ') || '__';
  let query = `(${firstNameQuery}) AND Contacts.Last_Name LIKE '%${person.lastName}%'`;
  // - AND (Contacts.Mobile_Phone='${formatPhone(phoneNumber!)}' OR Contacts.Email_Address='${emailAddress}' OR Contacts.Date_of_Birth='${dateOfBirth}')
  results = await mp.getContacts({ filter: query });

  if ('error' in results) return { error: results.error };

  const short = ({ displayName, contactID, householdID, householdPositionID, _contactSetupDate, participantRecord, dateOfBirth, mobilePhone, emailAddress }: Partial<Contact>) => ({ displayName, dateOfBirth, mobilePhone, emailAddress, contactID, householdID, householdPositionID, _contactSetupDate, participantRecord });
  console.log('▶️ ', 'query', query);
  console.log('🔍', 'results', results.map(short));

  filtered = results.filter(c => {
    console.log('c.dateOfBirth === dateOfBirth', c.dateOfBirth, c.dateOfBirth === dateOfBirth, dateOfBirth);
    console.log('c.mobilePhone === phoneNumber', c.mobilePhone, cleanPhoneNumber(c.mobilePhone) === phoneNumber, phoneNumber);
    console.log('c.emailAddress === emailAddress', c.emailAddress, c.emailAddress === person.emailAddress, person.emailAddress);
    console.log('===');
    return (c.emailAddress === person.emailAddress || c.dateOfBirth === dateOfBirth || cleanPhoneNumber(c.mobilePhone) === phoneNumber);
    // [] c.contactID !== person.registrant?.contact.contactID && 
  });

  if (filtered?.length) {

    if (filtered.length == 1)
      existing = filtered[0];
    else {
      [existing, duplicates] = splitDuplicates(filtered);

      if (filtered.length == 1)
        existing = filtered[0];

      else if (filtered.length > 1) {
        filtered = byName(filtered, person);
        existing = filtered[0] || existing;
      }
    }
  }

  existing && console.log('✔️ ', `Existing Contact ${person.firstName} ${person.lastName}`);
  duplicates.length && console.log(`🎭 Duplicate Contacts [${duplicates.length}] ${person.firstName} ${person.lastName}`, duplicates.map(f => f.contactID));

  return { existing, duplicates };
}

type AtLeastOne<T> = {
  [K in keyof T]-?: Pick<T, K> & Partial<Omit<T, K>>;
}[keyof T];

type ContactNameParams = Pick<CreatePersonParams, 'firstName' | 'lastName'>;
type ContactInfoParams = Pick<Required<CreatePersonParams>, 'phoneNumber' | 'emailAddress' | 'dateOfBirth'>;
type SearchParams = ContactNameParams & AtLeastOne<ContactInfoParams>;