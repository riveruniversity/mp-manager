import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getImage, getRmiContractors, getRiverAttendees } from '../api/mp'
import { attendeeToBulkTextFormat, contactToBulkTextFormat } from '../services/converters';
import { events } from '../config/vars'
import { Lib } from '../api/lib';
import { Contact } from '../types/MP';


(async function populateCardId() {

  const eventId = events.youthWeek
  const contacts = await getRiverAttendees();
  // const contacts = await getRiverMembers();
  // const contacts = await getFormResponses(eventId);
  // const contacts = await getRmiContractors();
  // const contacts = await getRiverStaff();
  // const contacts = await getAllRiverMembers();

  if (!contacts) return

  console.log(contacts.length,` contacts`)
  Lib.updateCardIds(contacts, {prefix: 'A-', onlyBlanks: false});
})()