import { getBlankCardIds, getFormResponses, getRiverMembers, getRiverStaff, getAllRiverMembers, getImage } from '../api/mp'
import { events } from '../config/vars'
import { Lib } from '../api/lib';


(async function populateCardId() {

  const eventId = events.youthWeek
  const contacts = await getBlankCardIds();
  // const contacts = await getFormResponses(eventId);
  // const contacts = await getRiverMembers();
  // const contacts = await getRiverStaff();
  // const contacts = await getAllRiverMembers();

  if (!contacts) return

  console.log(contacts.length,` contacts`)
  Lib.updateCardIds(contacts, {prefix: 'C', onlyBlanks: true});
})()