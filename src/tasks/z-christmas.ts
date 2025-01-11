import parsePhoneNumber, { PhoneNumber } from 'libphonenumber-js';
import * as fs from 'fs';
import { Contact } from 'mp-api';
import { json2csv, Json2CsvOptions } from 'json-2-csv';

import { getFestParticipants } from '../api/mp';
import { FestParticipant } from '../types/MP';

import { capitalize, formatNumber, showPercent, sleep } from '../utils';
import { createPerson, CreatePersonParams } from '../services/mp/create';
import { GROUP_IDS, GROUP_ROLES, HOUSEHOLD_POSITIONS, PARTICIPANT_TYPES } from '../services/mp/const';
import { getAgeGroupId } from '../utils/dates';
import { closeConnection, getPeople, Person, saveDevPeople, savePeople, updatePerson } from '../services/mp/db';


// >>> Settings
const eventId = 70549;

// saveDevPeople()
// getAllParticipants({ saveToDb: true });
createParticipants();

async function createParticipants() {
  const filter = { contact: null };
  const people = await getPeople(filter);
  console.log('👥', 'people count', people.length);

  for (let i in people) {
    const person = people[i];
    showPercent<Person>(i, people, 'firstName');
    let created = await createPerson(person);

    if (!('error' in created)) {
      updatePerson(person, {
        contact: created.contact.contactID,
        participant: created.participant.participantID,
        groupParticipants: created.groupParticipants
      });
    }
    else {
      let contact = created.completed.contact?.contactID;
      let participant = created.completed.participant?.participantID;
      let errorDetails: Partial<Person> = {
        ...contact && { contact },
        ...participant && { participant },
        error: {
          completed: Object.keys(created.completed),
          ...created.error
        }
      };

      console.log('errorDetails', errorDetails);
      updatePerson(person, { error: errorDetails });
    }
  }
  sleep(3000).then(closeConnection);
  console.log('🏁', 'Completed');
}



async function getAllParticipants({ saveToDb }: { saveToDb: boolean; }) {
  let eventParticipants: FestParticipant[] = await loadEventParticipants() as FestParticipant[];
  let adultWithKids = eventParticipants.map(mapKidsInfo).filter(p => p.isValid);
  let createKids = adultWithKids.map(record => {
    const newKids: CreatePersonParams[] = record.Kids.map(({ firstName, lastName, dateOfBirth }) => {
      const { Household_ID, Phone_Number, Response_Date } = record.participant;
      return {
        firstName, lastName,
        dateOfBirth,
        phoneNumber: Phone_Number || undefined,
        householdID: Household_ID || undefined,
        householdPositionID: HOUSEHOLD_POSITIONS.CHILD_MINOR,
        participantTypeID: PARTICIPANT_TYPES.CHILD,
        groupAssignments: [
          {
            groupID: GROUP_IDS.MINOR_WAIVER,
            groupRoleID: GROUP_ROLES.CLASS_MEMBER,
            startDate: Response_Date
          },
          {
            groupID: getAgeGroupId(dateOfBirth) || 0,
            groupRoleID: GROUP_ROLES.CLASS_MEMBER,
            startDate: Response_Date
          }
        ]
      };
    });

    return newKids;
  }).flat();

  console.log('createKids', createKids.length);

  saveToDb && savePeople(createKids);


  // fs.writeFileSync('src/data/eventParticipants.json', JSON.stringify(eventParticipants, null, '\t'));
  fs.writeFileSync('src/data/adultWithKids.json', JSON.stringify(adultWithKids, null, '\t'));
  fs.writeFileSync('src/data/createKids.json', JSON.stringify(createKids, null, '\t'));
  // fs.writeFileSync('src/data/youthParticipants.csv', await json2csv(youthParticipants, { emptyFieldValue: '' }));

};





async function loadEventParticipants() {

  let eventParticipants: FestParticipant[] = await getFestParticipants(eventId);
  // let eventContacts = await removeDuplicates(eventParticipants);
  return eventParticipants;
}


function mapKidsInfo(participant: FestParticipant) {

  var Kids: KidInfo[] = [];

  if (!participant.Children?.includes('<')) {
    const familyKids = participant.Children?.split('\n');
    if (familyKids?.length) {
      Kids = familyKids.reduce((acc: any[], child) => {
        const kidData = child.split(' ').map(d => d.trim()).map(d => capitalize(d));
        if (kidData.length == 3)
          acc.push({ firstName: kidData[0], lastName: kidData[1], dateOfBirth: kidData[2] });
        return acc;
      }, [] as KidInfo[]);
    }
  }
  else {
    // [] parse other form versions
  }

  const isValid = (function () {
    if (!Kids.length)
      return false;
    else {
      const validation = Kids.reduce((acc: boolean[], curr) => {
        const { firstName, lastName, dateOfBirth } = curr;
        const date = !isNaN(new Date(dateOfBirth).getTime());
        const fName = firstName.length > 2 && isNaN(parseFloat(firstName));
        const lName = lastName.length > 2 && isNaN(parseFloat(lastName));
        acc.push(date && fName && lName);
        return acc;
      }, []);
      return validation.every(b => b);
    }
  })();

  let Adult_Phone = participant.Phone_Number || ''; // ?.replaceAll(/\D/g, '') // remove non-digits doesn't work good, it removes the + prefix
  let phoneNumber = parsePhoneNumber(Adult_Phone, 'US');
  if (phoneNumber && isUs(phoneNumber))
    Adult_Phone = formatNumber(phoneNumber.nationalNumber);

  return { isValid, Kids, phoneNumber: Adult_Phone, participant };
}




function isUs(phoneNumber: PhoneNumber | undefined) {
  return phoneNumber?.country == 'US' || phoneNumber?.country == 'CA';
}

function isInt(phoneNumber: PhoneNumber | undefined) {
  return phoneNumber?.country != 'US' && phoneNumber?.country != 'CA';
}


interface KidInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contact?: Contact | null;
}


interface UpdateData { }