import * as fs from 'fs'
import { json2csv, Json2CsvOptions  } from 'json-2-csv';

import { getEventParticipants, getFormResponses } from '../api/mp'
import { removeDuplicates, removeGroupRegistrations, removeOnline, removeStaff } from '../services/filters';
import { EventContact, EventFormResponse, EventParticipant } from '../types/MP';
import { join, joinParticipantInfo } from '../utils';
import { events } from '../config/vars'
import { Lib } from '../api/lib';
import { findDuplicates, insertValues } from '../services/sql';

// >>> Settings
const eventId = events.christmas;

// Form Responses needed info but does not contain Attending_Online field
// so we need to get all local attendees from EventParticipants and merge them with the info from FormResponses

(async function createEventParticipants() {
  
  let eventParticipants: EventParticipant[]  = await getEventParticipants(eventId); 
  let formResponses: EventFormResponse[] = await getFormResponses(eventId);

  console.log(eventParticipants.length, 'event participants')
  console.log(formResponses.length, 'event form responses')

  // eventContacts = join(eventParticipants, formResponses) as EventContact[];
  let eventContacts: EventContact[] = joinParticipantInfo(formResponses, eventParticipants);
  eventContacts = await removeOnline(eventContacts);
  eventContacts = await removeDuplicates(eventContacts);
  eventContacts = await removeStaff(eventContacts);

  // - eventContacts = await removeNonWaiverSigned(contacts)             // only form responses are included, therefore all contacts signed the waiver
  // - eventContacts = contacts.filter(contact => !!contact.First_Name)  // Checked in locally but didn't submit form.

  fs.writeFileSync('src/data/eventContacts.csv', await json2csv(eventContacts, { emptyFieldValue: ''}));
  // - fs.writeFileSync('src/data/eventContacts.json', JSON.stringify(eventContacts, null, '\t'));

  // used to cross-check duplicates with SQL queries 
  //- -insertValues(eventContacts);
  //- -findDuplicates();

  Lib.updateCardIds(eventContacts, {prefix: 'C', onlyBlanks: true});
})()
