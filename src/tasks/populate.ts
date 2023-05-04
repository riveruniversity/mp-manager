import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, putCardId, getImage } from '../api'

import { Contact, CarShowContact, Attendee } from '../types'
const contacts = require('../data/carShow.json');


async function populateCardId() {
  // const eventId = 68302
  // const contacts = await getBlankCardIds();
  // const contacts = await getFormResponses(eventId);
  // const contacts = await getRiverMembers();
  // const riverStaff = await getRiverStaff();
  // const contacts = await getAllRiverMembers();

  if (!contacts) return

  console.log(`${contacts.length} contacts`)

  updateCardId(contacts);
}


// function updateCardId(arr: Contact[]) {
function updateCardId(arr: CarShowContact[]) {
  const ppl = arr.filter(contact => !contact.ID_Card)
  console.log('ppl', ppl.length)
  ppl.forEach((contact: CarShowContact) => putCardId(contact.Contact_ID, "C" + contact.Contact_ID).then((card) => console.log('success', card[0].Contact_ID, card[0].First_Name)))
}


populateCardId()