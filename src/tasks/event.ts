import { getEventParticipants, getFormResponses } from '../api/mp'
import { removeDuplicates, removeGroupRegistrations, removeOnline, removeStaff } from '../services/filters';
import { EventContact, EventFormResponse, EventParticipant } from '../types/MP';
import { events } from '../config/vars'
import { Lib } from '../api/lib';
import { findDuplicates, insertValues } from '../services/sql';
import { contactToBulkTextFormat, joinParticipantInfo } from '../services/converters';

// >>> Settings
const eventName: string = 'womansConf';
const eventId = events.womansConf;

// Form Responses needed info but does not contain Attending_Online field
// so we need to get all local attendees from EventParticipants and merge them with the info from FormResponses

(async function createEventParticipants() {
  
  let eventParticipants: EventParticipant[]  = (await getEventParticipants(eventId)); 
  let formResponses: EventFormResponse[] = (await getFormResponses(eventId)).map(formResponse => ({...formResponse, Email_Address: formResponse.Email_Address}) );

  console.log(eventParticipants.length, 'event participants')
  console.log(formResponses.length, 'event form responses')

  // eventContacts = join(eventParticipants, formResponses) as EventContact[];
  let eventContacts: EventContact[] = joinParticipantInfo(formResponses, eventParticipants);
  eventContacts = await removeOnline(eventContacts);
  eventContacts = await removeDuplicates(eventContacts);
  eventContacts = await removeStaff(eventContacts);

  // - eventContacts = await removeNonWaiverSigned(contacts)             // only form responses are included, therefore all contacts signed the waiver
  // - eventContacts = contacts.filter(contact => !!contact.First_Name)  // Checked in locally but didn't submit form.

  // fs.writeFileSync('src/data/eventContacts.csv', await json2csv(eventContacts, { emptyFieldValue: ''}));
  // fs.writeFileSync('src/data/eventContacts.json', JSON.stringify(eventContacts, null, '\t'));

  // used to cross-check duplicates with SQL queries 
  //- -insertValues(eventContacts);
  //- -findDuplicates();

  contactToBulkTextFormat(eventContacts, eventName);  // MP Contact Format

  Lib.updateCardIds(eventContacts, {prefix: 'C', onlyBlanks: true});
})()
