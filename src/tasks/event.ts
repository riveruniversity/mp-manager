import * as fs from 'fs'

import { getEventParticipants, getFormResponses } from '../api/mp'
import { removeDuplicates, removeGroupRegistrations, removeOnline, removeStaff } from '../services/filters';
import { EventContact, EventParticipant } from '../types/MP';
import { join, joinParticipantInfo } from '../utils';
import { event } from '../config/vars'
import { Lib } from '../api/lib';

const eventId = event.carShow;

// Form Responses needed info but does not contain Attending_Online field
// so we need to get all local attendees from EventParticipants and merge them with the info from FormResponses

(async function createEventParticipants() {
  
  var eventParticipants: EventContact[]  = await getEventParticipants(eventId) as EventContact[];  //| EventParticipant[]
  var formResponses: EventContact[] = await getFormResponses(eventId);
  console.log(formResponses.length, 'form responses')
  // eventParticipants = join(eventParticipants, formResponses) as EventContact[];
  eventParticipants = joinParticipantInfo(eventParticipants, formResponses) as EventContact[];
  eventParticipants = await removeOnline(eventParticipants);
  eventParticipants = await removeDuplicates(eventParticipants);
  eventParticipants = await removeStaff(eventParticipants);
  // contacts = await removeNonWaiverSigned(contacts)
  // contacts = contacts.filter(contact => !!contact.First_Name) // Checked in but didn't submit form.

  // fs.writeFileSync('src/data/localParticipants.json', JSON.stringify(localParticipants, null, '\t'));
  fs.writeFileSync('src/data/eventParticipants.json', JSON.stringify(eventParticipants, null, '\t'));

  Lib.updateCardIds(formResponses, {prefix: 'C', onlyBlanks: true});
})()
