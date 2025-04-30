import * as fs from 'fs';
import { updateContacts, getContactDetails, createAttributes, findEventParticipants } from '../api/mp';
import { Contact, ContactAttributeParameter, ContactParameter } from '../types/MP';
import { ContactRecord } from 'mp-api/dist/tables/contacts';
import { EventParticipantRecord } from 'mp-api/dist/tables/event-participants';
import { ParticipantRecord } from 'mp-api/dist/tables/participants';
// import { } from 'mp-api'

async function fixEmail() {
  let contacts: Contact[] = await getContactDetails(`Contacts.Email_Address Like '%@gmail.co'`);
  console.log('contacts', contacts.length);

  const updateParams: ContactParameter[] = contacts
    .filter(({ Email_Address }) => !!Email_Address)
    .map(({ Contact_ID, Email_Address }) => ({
      Contact_ID,
      Email_Address: Email_Address?.split('@').at(0) + '@gmail.com',
    }));

  if (contacts.length) {
    fs.writeFileSync(`./src/data/fix_${contacts.length}.json`, JSON.stringify(contacts, null, '\t'));
    // updateContacts(updateParams);
  }
}

async function addNeverAttended() {
  let query = `Participant_ID_Table._Last_Attendance_Ever is null AND Participant_ID_Table.Participant_End_Date is null AND Not Participation_Status_ID=3 AND _Setup_Date > '2024-11-01'`;
  let contacts: (EventParticipantRecord & ParticipantRecord)[] = await findEventParticipants(query);
  console.log('contacts', contacts.length);

  const attributes: ContactAttributeParameter[] = contacts
    // .filter(({ Email_Address }) => !!Email_Address)
    .map(contact => {
        
      return {
        Contact_ID: contact.Contact_ID,
        Attribute_ID: 73,
        Start_Date: contact.Time_In,
        Notes: 'added via mp-manager'
      };
    });

  if (contacts.length) {
    fs.writeFileSync(`./src/data/never_attended.json`, JSON.stringify(contacts, null, '\t'));
    // createAttributes(attributes);
  }
}

addNeverAttended()