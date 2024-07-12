import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js'
import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { getYouthParticipants, updateContacts } from '../api/mp'
import { removeDuplicates, removeGroupRegistrations, removeOnline, removeStaff } from '../services/filters';
import { EventContact, EventFormResponse, EventParticipant, YouthWeekParticipant, YouthWeekRegistrationInfo } from '../types/MP';
import { events, youthWeek } from '../config/vars'
import { Lib } from '../api/lib';
import { contactToBulkTextFormat } from '../services/converters';
import { saveAttendees, saveDevAttendees } from '../services/db';

import { fixNumber, getKeyByValue } from '../utils';

// >>> Settings
const eventId = events.youthWeek;
const eventName: string = getKeyByValue(events, eventId) || '';


populateGuardianPhoneNumbers();
// getAllParticipants();

var Leaders: YouthWeekParticipant[] = [];

async function getAllParticipants() {
  let eventParticipants: EventContact[] = await loadEventParticipants() as EventContact[];
  let youthParticipants: YouthWeekParticipant[] = eventParticipants.map(mapGuardianInfo);
  Leaders = youthParticipants.filter(p => p.Group_Leader);
  youthParticipants = youthParticipants.map(mapLeader);
  youthParticipants = youthParticipants.filter(groupRegistrations);
  console.log(youthParticipants.length, 'youthParticipant');
  fs.writeFileSync('src/data/youthParticipant.json', JSON.stringify(youthParticipants, null, '\t'));
  // fs.writeFileSync('src/data/youngContacts.csv', await json2csv(youngContacts, { emptyFieldValue: '' }));


  // const bulkContacts = await contactToBulkTextFormat(youthParticipants, eventName);  // MP Contact Format
  // saveAttendees(bulkContacts);
  // saveDevAttendees();
}

async function populateGuardianPhoneNumbers() {
  let eventParticipants: EventContact[] = await loadEventParticipants() as EventContact[];
  let youngContacts: YouthWeekParticipant[] = eventParticipants.map(mapGuardianInfo)
  // .filter(participant => participant.Type == 'youth' || participant.Type == 'kids')
  // .filter(onlyUs)
  // .filter(onlyInt)

  console.log(youngContacts.length, 'youngContacts');
  // fs.writeFileSync('src/data/youngContacts.json', JSON.stringify(youngContacts, null, '\t'));
  // fs.writeFileSync('src/data/youngContacts.csv', await json2csv(youngContacts, { emptyFieldValue: '' }));


  // updateMobilePhone(youngContacts);
}

function updateMobilePhone(youngContacts: YouthWeekParticipant[]) {
  const updateFields = youngContacts.map(({ Contact_ID, Adult_Phone }) => ({ Contact_ID, Mobile_Phone: Adult_Phone }));
  console.log(updateFields.length, 'updateMobilePhone');
  updateFields.length && updateContacts(updateFields);
}



async function loadEventParticipants() {

  let eventParticipants: EventParticipant[] = await getYouthParticipants(eventId);
  console.log(eventParticipants.length, 'event participants');

  let eventContacts = await removeDuplicates(eventParticipants as EventContact[]);


  // - eventContacts = await removeNonWaiverSigned(contacts)             // only form responses are included, therefore all contacts signed the waiver
  // - eventContacts = contacts.filter(contact => !!contact.First_Name)  // Checked in locally but didn't submit form.

  // fs.writeFileSync('src/data/eventParticipants.json', JSON.stringify(eventContacts, null, '\t'));
  // fs.writeFileSync('src/data/eventParticipants.csv', await json2csv(eventContacts, { emptyFieldValue: '' }));

  // Lib.updateCardIds(eventContacts, {prefix: 'C', onlyBlanks: true});

  return eventContacts;
}



function mapGuardianInfo(participant: EventContact): YouthWeekParticipant {

  const phoneRegex = /(?<=Parent Phone: ).*(?=\W)/;

  if (participant.Notes.match(/Parent Phone/)) {
    var Registration_Info = {} as YouthWeekRegistrationInfo;
    var Adult_Phone = participant.Notes.match(phoneRegex)?.at(0) || participant.Mobile_Phone || ''; // ?.replaceAll(/\D/g, '') // remove non-digits doesn't work good, it removes the + prefix
    // console.log('participant.Notes.match(phoneRegex)', participant.Notes)
    var Type = participant.Group_ID && youthWeek[participant.Group_ID as keyof typeof youthWeek] as unknown as YouthWeekRegistrationInfo['detail'] || '_';
    var Form = 'Old';
  }
  else {
    var Registration_Info: YouthWeekRegistrationInfo = JSON.parse(participant.Notes);
    var Adult_Phone = Registration_Info?.adult?.phoneNumber || Registration_Info?.qrCodePhone || participant.Mobile_Phone || '';
    var Type = Registration_Info?.detail || '_';
    var Form = 'Dynamic';
  }

  participant.Notes = ''
  const Phone_Number = parsePhoneNumber(Adult_Phone, 'US');
  // if (!Phone_Number && Type != 'registrant') console.log(participant.Contact_ID, Type)
  if (isUs(Phone_Number)) Adult_Phone = fixNumber(Phone_Number?.nationalNumber);
  const Group_Leader = !!Registration_Info.type?.includes('Leader');

  return { ...participant, Adult_Phone, Phone_Number, Form, Type, Registration_Info, Group_Leader }
}


function mapLeader(participant: YouthWeekParticipant): YouthWeekParticipant {

  var Leader = isYouth(participant) &&
    Leaders.find(leader => isRegistrant(leader) && participant.Phone_Number?.nationalNumber == leader.Phone_Number?.nationalNumber);

  return { ...participant, Church_Group: !!Leader }
}


function onlyUs(participant: YouthWeekParticipant) {
  return participant.Phone_Number?.country == 'US' || participant.Phone_Number?.country == 'CA';
}

function onlyInt(participant: YouthWeekParticipant) {
  return participant.Phone_Number?.country != 'US' && participant.Phone_Number?.country != 'CA';
}

function isUs(Phone_Number: PhoneNumber | undefined) {
  return Phone_Number?.country == 'US' || Phone_Number?.country == 'CA';
}

function isInt(Phone_Number: PhoneNumber | undefined) {
  return Phone_Number?.country != 'US' && Phone_Number?.country != 'CA';
}

function isYouth(participant: YouthWeekParticipant) {
  return participant.Type == 'youth' || participant.Type == 'kids';
}

function isRegistrant(participant: YouthWeekParticipant) {
  return participant.Type == 'adult' || participant.Type == 'registrant';
}

function groupRegistrations(participant: YouthWeekParticipant) {
  return !participant.Group_Leader && !participant.Church_Group;
}
