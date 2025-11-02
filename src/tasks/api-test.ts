import { CreateFormResponseAnswerParams } from "mp-api";
import { mp } from "../services/mp/api";
// import { findContact } from "../services/mp/find";

function getEvent() {
  mp.getEvent(70551)
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function getContact() {
  mp.getContact(126634)
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function getContacts() {
  mp.getContacts({ filter: 'Contact_ID=126634' })
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function createFormResponse(formID: number = 49) {
  mp.createFormResponse({ formID, responseDate: new Date().toISOString().split('T')[0] + 'T00:00:00'  })
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function createFormResponseAnswers() {
  mp.createFormResponseAnswers([{ formFieldID: 1399, formResponseID: 168596, response: null }])
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function updateContacts() {
  mp.updateContacts([{ contactID: 305590, genderID: 1, idCard: 'A-' + 305590 }])
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}
 
function getContactEmailAddresses() {
  mp.getContactEmailAddresses({ filter: 'Contact_ID=126634' })
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function getContactAttributes() {
  mp.getContactAttributes({ filter: 'Contact_ID=126634', select: 'Contact_Attributes.*, Attribute_ID_Table.Attribute_Name' })
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function getContactsWithEmailAddresses() {
  mp.getContactsWithEmailAddress({ filter: `(CONCAT(Contact_ID_Table.First_Name, Contact_ID_Table.Nickname) LIKE '%Wilhelm%') AND Contact_ID_Table.Last_Name LIKE '%Mauch%' OR Contact_Email_Addresses.Email_Address='wilhelm.mauch@email.com'` })
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

function getContactDetails() {
  mp.getContactDetails(126634)
    .then(res => res && 'error' in res ? console.log(res.error) : console.log(res))
    .catch(err => console.log(err));
}

// findContact({ firstName: 'Aaliyah', lastName: 'Montoya', emailAddress: 'graceontopofgrace123@gmail.com' })
//   .then(contact => console.log(contact))
//   .catch(err => console.log(err));

// getContactDetails();

function updateManyContacts() {
  const recs = [
  {"contactID": 187697, "planningCenterID": 153521751},
];

recs.forEach(record => mp.updateContacts([record]).catch(err => console.log(err)))
}