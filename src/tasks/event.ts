import * as fs from 'fs'

import { getEventParticipants, getFormResponses } from '../api/mp'
import { removeDuplicates, removeGroupRegistrations, removeOnline, removeStaff } from '../services/filters';
import { EventContact, EventParticipant } from '../types/MP';
import { join } from '../utils';
import { event } from '../config/vars'
import { Lib } from '../api/lib';

const eventId = event.fireConf;

// Form Responses needed info but does not contain Attending_Online field
// so we need to get all local attendees from EventParticipants and merge them with the info from FormResponses
createEventParticipants()

async function createEventParticipants() {
  
  var eventParticipants: EventContact[]  = await getEventParticipants(eventId) as EventContact[];  //| EventParticipant[]
  eventParticipants = await removeOnline(eventParticipants);
  var formResponses: EventContact[] = await getFormResponses(eventId);
  eventParticipants = join(eventParticipants, formResponses) as EventContact[];
  eventParticipants = await removeDuplicates(eventParticipants);
  eventParticipants = await removeStaff(eventParticipants);
  // contacts = await removeNonWaiverSigned(contacts)
  // contacts = contacts.filter(contact => !!contact.First_Name) // Checked in but didn't submit form.

  // fs.writeFileSync('src/data/localParticipants.json', JSON.stringify(localParticipants, null, '\t'));
  fs.writeFileSync('src/data/eventParticipants.json', JSON.stringify(eventParticipants, null, '\t'));

  Lib.updateCardIds(formResponses, {prefix: 'C', onlyBlanks: true});
}
