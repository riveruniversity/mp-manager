import { Contact, ContactEmailAddress, ContactWithEmailAddresses, ErrorDetails } from "mp-api";
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
  : Promise<{ existing: ContactWithEmailAddresses | undefined, duplicates: ContactWithEmailAddresses[]; } | { error: ErrorDetails; }> {

  var existing: Contact | undefined = undefined;
  var filtered: Contact[] = [];
  var duplicates: Contact[] = [];
  var results: ContactWithEmailAddresses[] | { error: ErrorDetails; } = [];

  let dateOfBirth = person.dateOfBirth && new Date(person.dateOfBirth).toISOString().split('T')[0] + 'T00:00:00';
  let phoneNumber = cleanPhoneNumber(person.phoneNumber);
  let emailAddress = person.emailAddress?.toLocaleLowerCase();

  results = (await mp.getContacts(getNameQuery(person))) as ContactWithEmailAddresses[] | { error: ErrorDetails; };
  if ('error' in results) return { error: results.error };

  results = await getAllContactEmailAddresses(results);
  // const short = ({ displayName, contactID, householdID, householdPositionID, _contactSetupDate, participantRecord, dateOfBirth, mobilePhone, emailAddresses }: Partial<ContactWithEmailAddresses>) => ({ displayName, dateOfBirth, mobilePhone, emailAddresses, contactID, householdID, householdPositionID, _contactSetupDate, participantRecord });
  // console.log('🔍 ', 'query', query);
  // console.log('🔍', 'results', results.map(short));

  filtered = results.filter((c) => {
    // console.log('c.dateOfBirth === dateOfBirth', c.dateOfBirth, c.dateOfBirth === dateOfBirth, dateOfBirth);
    // console.log('c.mobilePhone === phoneNumber', c.mobilePhone, cleanPhoneNumber(c.mobilePhone) === phoneNumber, phoneNumber);
    // console.log('c.emailAddress === emailAddress', c.emailAddress, c.emailAddress === person.emailAddress, person.emailAddress);
    // console.log('===');
    return (c.emailAddresses.includes(emailAddress || '') || c.dateOfBirth === dateOfBirth || cleanPhoneNumber(c.mobilePhone) === phoneNumber);
  });

  if (filtered?.length) {

    if (filtered.length == 1)
      existing = filtered[0];
    else {
      filtered = byName(filtered, person);
      if (filtered.length == 1)
        existing = filtered[0];
      else if (filtered.length > 1)
        [existing, duplicates] = splitDuplicates(filtered);
    }
  }

  existing && console.log('✔️ ', `Existing Contact ${person.firstName} ${person.lastName}`);
  duplicates.length && console.log(`🎭 Duplicate Contacts [${duplicates.length}] ${person.firstName} ${person.lastName}`, duplicates.map(f => f.contactID));

  return { existing, duplicates } as { existing: ContactWithEmailAddresses | undefined, duplicates: ContactWithEmailAddresses[]; };
}

type AtLeastOne<T> = {
  [K in keyof T]-?: Pick<T, K> & Partial<Omit<T, K>>;
}[keyof T];

type ContactNameParams = Pick<CreatePersonParams, 'firstName' | 'lastName'>;
type ContactInfoParams = Pick<Required<CreatePersonParams>, 'phoneNumber' | 'emailAddress' | 'dateOfBirth'>;
type SearchParams = ContactNameParams & AtLeastOne<ContactInfoParams>;

function getNameQuery(person: SearchParams) {
  let firstNameQuery = person.firstName.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g)?.map(n => `CONCAT(Contacts.First_Name, Contacts.Nickname) COLLATE Latin1_general_CI_AI LIKE '%${n}%'`).join(' OR ') || '_';
  let lastNameQuery = `Contacts.Last_Name COLLATE Latin1_general_CI_AI LIKE '%${person.lastName}%'`;
  let query = `(${firstNameQuery}) AND ${lastNameQuery}`;
  return { filter: query };
}


export async function getAllContactEmailAddresses(results: Contact[]): Promise<ContactWithEmailAddresses[]> {
  return Promise.all(results.map(async c => {
    let emailAddresses: ContactEmailAddress[] | string[] | { error: ErrorDetails; } = await mp.getContactEmailAddresses({ filter: `Contact_ID=${c.contactID}` });
    if ('error' in emailAddresses) return { ...c, emailAddresses: [] };

    emailAddresses = emailAddresses.map(e => e.emailAddress.toLowerCase());
    c.emailAddress && emailAddresses.push(c.emailAddress.toLowerCase());
    return { ...c, emailAddresses };
  }));
}