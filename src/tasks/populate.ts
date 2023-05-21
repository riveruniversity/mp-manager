import * as fs from 'fs'

import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, getImage } from '../api/mp'
import { updateCardIds } from '../api/lib';
import { groupBy } from '../utils';

// import { Contact, CarShowContact, Attendee } from '../types/MP'
// const contacts = require('../data/carShow.json');


populateCardId()

async function populateCardId() {
  const eventId = 68675
  // const contacts = await getBlankCardIds();
  // const contacts = await getFormResponses(eventId);
  // const contacts = await getRiverMembers();
  const contacts = await getRiverStaff();
  // const contacts = await getAllRiverMembers();

  if (!contacts) return

  console.log(`${contacts.length} contacts`)
  updateCardIds(contacts, '');
}