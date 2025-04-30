import { getFormResponses, getRiverMembers, getRmiStaff, getRmiContractors, getRiverAttendees, getImage, getStaffAndContractors } from '../api/mp';
import { events } from '../config/vars';
import { Lib } from '../api/lib';

let prefix: string = '';

(async function populateCardId() {

  // let contacts = await getMembers();
  // let contacts = await getAttendees();
  // let contacts = await getStaff();
  let contacts = await getContractors();
  // let contacts = await getEventParticipants();

  if (!contacts) return;

  console.log(contacts.length, ` contacts`);
  Lib.updateCardIds(contacts, { prefix, onlyBlanks: false });
})();

async function getStaff() {
  prefix = 'S-';
  return await getRmiStaff();
}

async function getContractors() {
  prefix = 'C-';
  return await getRmiContractors();
}

async function getMembers() {

  prefix = 'M-';

  let contacts = await getRiverMembers();

  const staff = await getStaffAndContractors();
  contacts = contacts.filter(c => !staff.find(s => c.Contact_ID === s.Contact_ID));

  return contacts;
}

async function getAttendees() {

  prefix = 'A-';

  let contacts = await getRiverAttendees();

  const staff = await getStaffAndContractors();
  contacts = contacts.filter(c => !staff.find(s => c.Contact_ID === s.Contact_ID));

  return contacts;
}

async function getEventParticipants() {

  const eventId = events.youthWeek;
  let contacts = await getFormResponses(eventId);

  const staff = await getStaffAndContractors();
  contacts = contacts.filter(c => !staff.find(s => c.Contact_ID === s.Contact_ID));
  return contacts;
}