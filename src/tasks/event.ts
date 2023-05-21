import * as fs from 'fs'

import { getEventParticipants, getFormResponses, getRiverStaff, getSignedWaiver, putCardId } from '../api/mp'
import { EventContact, EventParticipant, GroupContact } from '../types/MP';
import { groupBy, join } from '../utils';
import { updateCardIds } from '../api/lib';




// Form Responses contains needed info but does not contain Attending_Online field
// so we need to get all local attendees from EventParticipants and merge them with the info from FormResponses
createEventParticipants()

async function createEventParticipants() {
  const eventId = 68675;
  const localParticipants: EventParticipant[] = await getEventParticipants(eventId)
  const formResponses: EventContact[] = await getFormResponses(eventId)
  const eventParticipants: EventContact[] = join(localParticipants, formResponses)

  var contacts = removeDuplicates(eventParticipants);
  contacts = await removeNonWaiverSigned(contacts)

  fs.writeFileSync('src/data/eventParticipants.json', JSON.stringify(contacts, null, '\t'));

  updateCardId(contacts)
}

function updateCardId(contacts: EventContact[]) {

  contacts = contacts.filter(c => c.ID_Card === null)
  console.log(contacts.length, 'contacts without Card_ID')
  
  updateCardIds(contacts, 'C')
}


async function removeStaff(contacts: EventContact[]): Promise<EventContact[]> {
  const staff: GroupContact[] = await getRiverStaff();
  contacts = contacts.filter(contact => !staff.find(s => s.Contact_ID === contact.Contact_ID))
  console.log('contacts', contacts.length)
  return contacts
}

function removeDuplicates(contacts: EventContact[]): EventContact[] {
  console.log(contacts.length, 'contacts')
  const groupedContacts = groupBy(contacts, 'Contact_ID')
  contacts = groupedContacts.map((contact: EventContact[]) => contact[0])
  console.log(contacts.length, 'without duplicates')
  return contacts
}


async function removeNonWaiverSigned(contacts: EventContact[]): Promise<EventContact[]> {
  const waivers: GroupContact[] = await getSignedWaiver();
  contacts = contacts.filter(contact => !!waivers.find(w => w.Contact_ID === contact.Contact_ID))
  console.log(contacts.length, 'with waiver')
  return contacts;
}