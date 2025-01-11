import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js'
import * as fs from 'fs'
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { getYouthParticipants, updateContacts } from '../api/mp'
import { removeDuplicates, removeGroupRegistrations, removeOnline, removeStaff } from '../services/filters';
import { EventContact, FormResponseRecord, YouthWeekParticipant, YouthWeekRegistrationInfo } from '../types/MP';
import { events, youthWeek } from '../config/vars'
import { Lib } from '../api/lib';
import { contactToBulkTextFormat } from '../services/converters';
import { saveAttendees, saveDevAttendees } from '../services/db';

import { formatNumber, getKeyByValue } from '../utils';
import { EventParticipantRecord } from 'mp-api/dist/tables/event-participants';

// >>> Settings
const eventId = events.youthWeek;
const eventName: string = getKeyByValue(events, eventId) || '';

const populateGuardianPhones = false;
const populateCardIds = false;
const saveToDb = false;


(async function getAllParticipants(set: Settings) {
  let eventParticipants: EventContact[] = await loadEventParticipants() as EventContact[];
  let youthParticipants: YouthWeekParticipant[] = eventParticipants.map(mapGuardianInfo); // .filter(onlyUs) // .filter(onlyInt)
  youthParticipants = youthParticipants.filter(p => !!p.Time_In)

  if (set.populateCardIds)
    return Lib.updateCardIds(youthParticipants, { prefix: 'C', onlyBlanks: true });


  if (set.populateGuardianPhones)
    populateGuardianPhoneNumbers(youthParticipants)


  if (set.saveToDb && !set.populateCardIds && !set.populateGuardianPhones)
    saveParticipantsToDb(youthParticipants);


  fs.writeFileSync('src/data/youthParticipant.json', JSON.stringify(youthParticipants, null, '\t'));
  // fs.writeFileSync('src/data/youthParticipants.csv', await json2csv(youthParticipants, { emptyFieldValue: '' }));

})({ populateGuardianPhones, populateCardIds, saveToDb })


async function populateGuardianPhoneNumbers(youthParticipants: YouthWeekParticipant[]) {
  const updateFields = youthParticipants
    .filter(p => p.Type == 'youth' || p.Type == 'kids')
    .filter(p => p.Mobile_Phone == null)
    .map(({ Contact_ID, Adult_Phone }) => ({ Contact_ID, Mobile_Phone: Adult_Phone }));

  console.log(updateFields.length, 'Updating Contacts: Mobile_Phone');
  updateFields.length && updateContacts(updateFields);
}


async function saveParticipantsToDb(youthParticipants: YouthWeekParticipant[]) {
  Leaders = youthParticipants.filter(p => p.Group_Leader);
  youthParticipants = youthParticipants.map(mapLeader)
    .filter(groupRegistrations)
    .filter(p => p.ID_Card !== null);

  console.log(youthParticipants.length, 'saveToDb youthParticipants');

  const bulkContacts = await contactToBulkTextFormat(youthParticipants, eventName);  // MP Contact Format
  saveAttendees(bulkContacts);
  saveDevAttendees();
}


async function loadEventParticipants() {

  let eventParticipants: EventParticipantRecord[] = (await getYouthParticipants(eventId))
  // .map(p => ({...p, ...{ Notes: '{}'}}));
  let eventContacts = await removeDuplicates(eventParticipants as EventContact[]);
  // - eventContacts = contacts.filter(contact => !!contact.First_Name)  // Checked in locally but didn't submit form.
  return eventContacts;
}


function mapGuardianInfo(participant: EventContact): YouthWeekParticipant {

  const phoneRegex = /(?<=Parent Phone: ).*(?=\W)/;

  if (participant.Notes.match(/Parent Phone/)) {
    var Registration_Info = {} as YouthWeekRegistrationInfo;
    var Adult_Phone = participant.Notes.match(phoneRegex)?.at(0) || participant.Mobile_Phone || ''; // ?.replaceAll(/\D/g, '') // remove non-digits doesn't work good, it removes the + prefix
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
  Type = Type.replace('registrant', 'adult') as YouthWeekRegistrationInfo['detail'];
  const Phone_Number = parsePhoneNumber(Adult_Phone, 'US');
  // if (!Phone_Number && Type != 'registrant') console.log(participant.Contact_ID, Type)
  if (isUs(Phone_Number)) Adult_Phone = formatNumber(Phone_Number!.nationalNumber);
  const Group_Leader = !!Registration_Info.type?.includes('Leader');

  return { ...participant, Adult_Phone, Phone_Number, Form, Type, Registration_Info, Group_Leader }
}


var Leaders: YouthWeekParticipant[] = [];

function mapLeader(participant: YouthWeekParticipant): YouthWeekParticipant {

  var Leader = (isYouth(participant) &&
    Leaders.find(leader => isRegistrant(leader) && leader.Phone_Number?.nationalNumber == participant.Phone_Number?.nationalNumber)?.Contact_ID) || null;
  return { ...participant, Church_Group: !!Leader, Leader }
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
  return participant.Type == 'adult';
}

function groupRegistrations(participant: YouthWeekParticipant) {
  return !participant.Group_Leader && !participant.Church_Group;
}


interface Settings {
  populateGuardianPhones: boolean;
  populateCardIds: boolean;
  saveToDb: boolean;
}