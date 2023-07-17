import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, getImage } from '../api/mp'
import { event } from '../config/vars'
import { Lib } from '../api/lib';

// import { Contact, CarShowContact, Attendee } from '../types/MP'
 const contacts = require('../data/eventParticipants.json');


populateCardId()

async function populateCardId() {
  const eventId = event.youthWeek
  // const contacts = await getBlankCardIds();
  // const contacts = await getFormResponses(eventId);
  // const contacts = await getRiverMembers();
  // const contacts = await getRiverStaff();
  // const contacts = await getAllRiverMembers();

  if (!contacts) return

  console.log(contacts.length,` contacts`)
  Lib.updateCardIds(contacts, {prefix: 'C', onlyBlanks: true});
}