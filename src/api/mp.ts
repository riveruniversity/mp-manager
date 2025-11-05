import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';
import dotenv from 'dotenv';
import { getAccessToken } from '../services/oauth';

dotenv.config();

import { group } from '../config/vars';
import { Contact, ContactAttributeParameter, ContactParameter, EventContact, FestParticipant, GroupContact } from '../types/MP';
import { EventParticipantRecord } from 'mp-api/dist/tables/event-participants';
import { ContactRecord } from 'mp-api/dist/tables/contacts';
import { ParticipantRecord } from 'mp-api/dist/tables/participants';


interface RequestParameter {
  method: 'get' | 'post' | 'put';
  select?: string;
  filter?: string;
  top?: string;
  data?: any;
  scope?: string;
  responseType?: ResponseType;
}




export function getContactDetails(filterString: string) {

  const table = `Contacts`;
  const select = `$select=Contacts.Contact_ID, Contacts.ID_Card, Contacts.First_Name, Contacts.Last_Name, Contacts.Display_Name, Contacts.Nickname, Contacts.Email_Address, Contacts.Mobile_Phone, Gender_ID_Table.Gender, Participant_Record_Table.Member_Status_ID, Participant_Record_Table_Member_Status_ID_Table.Member_Status, Contacts.Household_ID, Household_ID_Table.Household_Name, Contacts.Household_Position_ID, Household_Position_ID_Table.Household_Position, Contacts.Marital_Status_ID, Marital_Status_ID_Table.Marital_Status, Participant_Record_Table.Participant_ID, Participant_Record_Table.Participant_Type_ID, Participant_Record_Table.Participant_Engagement_ID, Participant_Record_Table_Participant_Engagement_ID_Table.Engagement_Level, Contact_Status_ID_Table.Contact_Status, Participant_Record_Table.Notes, Participant_Record_Table.Red_Flag_Notes, dp_fileUniqueId as Image`;
  const filter = `&$filter=${filterString}`;
  const top = `&$top=10000`;

  return request(table, { method: 'get', select, filter, top });
}
//: --------------------------------------------------------


export function getRiverAttendees(): Promise<Contact[]> {

  const table = `Contacts`;
  const select = `$select=*`;
  const filter = `&$filter=${C.Attendees} AND ${C.ID_Card_Unset} AND ${C.Engaged} AND ${C.Exclude_Defaults}`;
  const top = `&$top=50000`;

  return request(table, { method: 'get', select, filter, top });
}

export async function getRiverMembers(): Promise<Contact[]> {

  const table = `Contacts`;
  const select = `$select=*`;
  const filter = `&$filter=${C.MemberType} AND ${C.MemberStatus} AND ${C.ID_Card_Unset} AND ${C.Exclude_Defaults}`; //AND Contact_ID_Table.Contact_Status_ID=2
  const top = `&$top=50000`;

  return request(table, { method: 'get', select, filter, top });
}
//: --------------------------------------------------------


export async function getRmiContractors(): Promise<GroupContact[]> {

  const table = `Group_Participants`;
  const select = `$select=Group_Participants.Group_ID, ${G.Contact_ID}, ${G.ID_Card}, ${G.Display_Name}, ${G.First_Name}, ${G.Last_Name}, ${G.Mobile_Phone}, ${G.Email_Address}, Group_Participants.Participant_ID`;
  const filter = `&$filter=Group_Participants.Participant_ID = ${G.Participant_Record}  AND Group_Participants.Group_ID = ${group.contractor} AND Group_Participants.End_Date Is Null AND (${G.ID_Card} NOT LIKE 'C%' OR ${G.ID_Card} IS Null)`;
  const top = `&$top=1000`;

  return request(table, { method: 'get', select, filter, top });
}
//: --------------------------------------------------------


export async function getRmiStaff(): Promise<GroupContact[]> {

  const table = `Group_Participants`;
  const select = `$select=Group_Participants.Group_ID, ${G.Contact_ID}, ${G.ID_Card}, ${G.Display_Name}, ${G.First_Name}, ${G.Last_Name}, ${G.Mobile_Phone}, ${G.Email_Address}, Group_Participants.Participant_ID`;
  const filter = `&$filter=Group_Participants.Participant_ID = ${G.Participant_Record} AND Group_Participants.Group_ID IN (${group.staff}) AND Group_Participants.End_Date Is Null AND (${G.ID_Card} NOT LIKE 'S%' OR ${G.ID_Card} IS Null)`;
  const top = `&$top=1000`;

  return request(table, { method: 'get', select, filter, top });
}
//: --------------------------------------------------------


export async function getStaffAndContractors(): Promise<GroupContact[]> {

  const table = `Group_Participants`;
  const select = `$select=Group_Participants.Group_ID, ${G.Contact_ID}, ${G.ID_Card}, ${G.Display_Name}, ${G.First_Name}, ${G.Last_Name}, ${G.Mobile_Phone}, ${G.Email_Address}, Group_Participants.Participant_ID`;
  const filter = `&$filter=Group_Participants.Participant_ID = ${G.Participant_Record} AND Group_Participants.Group_ID IN (${group.staff}, ${group.contractor}) AND Group_Participants.End_Date is null`;
  const top = `&$top=1000`;

  return request(table, { method: 'get', select, filter, top });
}
//: --------------------------------------------------------



export function getEventParticipants(eid: number): Promise<EventParticipantRecord[]> {

  const table = `Event_Participants`;
  const select = `$select=Event_Participants.Group_ID, Event_Participants.Notes, ${G.Contact_ID}, ${G.ID_Card}, ${G.Display_Name}, ${G.First_Name}, ${G.Last_Name}, ${G.Nickname}, ${G.Mobile_Phone}, ${G.Email_Address}, ${G.Household_Position_ID}`;
  const filter = `&$filter=Event_ID=${eid}`; // AND ${Signed_Waiver}  AND Attending_Online='false' // AND Participant_ID_Table_Contact_ID_Table.ID_Card NOT Like 'C%'
  const top = `&$top=20000`;

  return request(table, { method: 'get', select, filter, top });
}
//: ........................................................


export function findEventParticipants(filtr: string): Promise<(EventParticipantRecord & ParticipantRecord)[]> {

  const table = `Event_Participants`;
  const select = `$select=*`;
  const filter = `&$filter=${filtr}`;
  const top = `&$top=20000`;

  return request(table, { method: 'get', select, filter, top });
}
//: ........................................................



export async function getYouthParticipants(eid: number): Promise<EventParticipantRecord[]> {

  const table = `Event_Participants`;
  const select = `$select=${G.Contact_ID}, ${G.ID_Card}, ${G.Display_Name}, ${G.First_Name}, ${G.Last_Name}, ${G.Nickname}, ${G.Mobile_Phone}, ${G.Email_Address}, ${G.Household_Position_ID}, Event_Participants.Group_ID, Event_Participants.Notes, Group_ID_Table.Group_Name, ${G.Member_Status}, Event_Participants._Setup_Date As [Registered_At], ${G.Created_Date}, Time_In`;
  const filter = `&$filter=Event_ID=${eid} AND Event_Participants.Participation_Status_ID <> 5 `; //
  // AND ${Signed_Waiver}  AND Attending_Online='false' || AND Participant_ID_Table_Contact_ID_Table.ID_Card NOT Like 'C%'  || 5=Cancelled ||  AND Event_Participants.Notes Is Not null || AND Mobile_Phone is null
  const top = `&$top=20000`;

  const eventParticipants = await request(table, { method: 'get', select, filter, top });
  console.log(eventParticipants.length, 'event participants');

  return eventParticipants;
}
//: ........................................................



export async function getFestParticipants(eid: number): Promise<FestParticipant[]> {

  const childrenFieldId = 1395;

  const table = `Form_Response_Answers`;
  // const select = `$select=${C.Contact_ID}, ${C.ID_Card}, ${C.Display_Name}, ${C.First_Name}, ${C.Last_Name}, ${C.Nickname}, ${C.Mobile_Phone}, ${C.Email_Address}, ${C.Household_Position_ID}, ${C.Created_Date}, Group_ID_Table.Group_Name, Event_Participants.*` 
  const select = `$select=Response As [Children], *, Form_Response_ID_Table.Contact_ID, Form_Response_ID_Table_Contact_ID_Table.Household_ID`;
  const filter = `&$filter=Form_Response_ID_Table.Form_ID=49 AND Event_Participant_ID_Table.Event_ID=${eid} AND Form_Field_ID=${childrenFieldId}`; //
  // AND ${Signed_Waiver}  AND Attending_Online='false' || AND Participant_ID_Table_Contact_ID_Table.ID_Card NOT Like 'C%'  || 5=Cancelled ||  AND Event_Participants.Notes Is Not null || AND Mobile_Phone is null
  const top = `&$top=20000`;

  const eventParticipants = await request(table, { method: 'get', select, filter, top });
  console.log(eventParticipants.length, 'event participants');

  return eventParticipants;
}
//: ........................................................

export function getFormResponses(eid: number): Promise<EventContact[]> {

  const table = `Form_Responses`;
  const select = `$select=Form_Responses.Contact_ID, Contact_ID_Table.ID_Card, Contact_ID_Table.First_Name, Contact_ID_Table.Last_Name, Contact_ID_Table.Email_Address, Contact_ID_Table.Mobile_Phone`;
  const filter = `&$filter=Event_ID=${eid} `; //AND Contact_ID_Table.ID_Card is not null // AND Contact_ID_Table.ID_Card NOT Like 'C%'  // AND Response_Date BETWEEN '08/01/2023' AND '08/31/2023'
  const top = `&$top=10000`;

  return request(table, { method: 'get', select, filter, top });
}
//: --------------------------------------------------------


export function updateContacts(Fields: ContactParameter[]) {

  const table = `Contacts`;

  return request(table, { method: 'put', data: Fields });
}
//: --------------------------------------------------------


export function createAttributes(Fields: ContactAttributeParameter[]) {

  const table = `Contact_Attributes`;

  return request(table, { method: 'post', data: Fields });
}
//: --------------------------------------------------------


export function putCardId(Contact_ID: number, ID_Card: string) {

  const table = `Contacts`;

  const data = [{ Contact_ID, ID_Card }]; // Array Updates a series of records

  return request(table, { method: 'put', data });
}
//: --------------------------------------------------------


export function getImage(fileId: string) {

  const table = `Files`;

  return request(table, { method: 'get', scope: 'files', select: fileId, responseType: 'arraybuffer' });
}
//: --------------------------------------------------------


async function request(table: string, param: RequestParameter) {

  const baseUrl = `https://mp.revival.com/ministryplatformapi`;
  param.scope = param.scope ? `/${param.scope}/` : `/tables/${table}?`;

  let token;
  try {
    token = await getAccessToken();
  } catch (err) {
    console.error(err);
    return undefined;
  }

  var config: AxiosRequestConfig = {
    method: param.method,
    url: baseUrl + param.scope + (param.select || '') + (param.filter || '') + (param.top || ''),
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    data: param.data,
  };

  if (param.responseType) {
    config.responseType = param.responseType;
    // config.responseEncoding = "base64"
  }

  // console.log('config.url', config.url)

  try {
    return axios(config)
      .then((response: AxiosResponse) => { console.log('✔️ ', param.method.toUpperCase(), table); return response.data; })
      // .then((response: AxiosResponse) => response.data)
      .catch(error => {
        console.log('❌ ', param.method.toUpperCase(), table);
        console.log(error.response?.status, error.response?.statusText, error.response?.data);
        if (param.method == 'get') return [];
        else return null;
      });

  } catch (error: any) {

    console.log('cause', error.cause);
    console.log('Error when requesting ', config.url);
  }
}
//: --------------------------------------------------------

export const G = {
  Contact_ID: `Participant_ID_Table_Contact_ID_Table.Contact_ID`,
  ID_Card: `Participant_ID_Table_Contact_ID_Table.ID_Card`,
  First_Name: `Participant_ID_Table_Contact_ID_Table.First_Name`,
  Last_Name: `Participant_ID_Table_Contact_ID_Table.Last_Name`,
  Display_Name: `Participant_ID_Table_Contact_ID_Table.Display_Name`,
  Nickname: `Participant_ID_Table_Contact_ID_Table.Nickname`,
  Mobile_Phone: `Participant_ID_Table_Contact_ID_Table.Mobile_Phone`,
  Email_Address: `Participant_ID_Table_Contact_ID_Table.Email_Address`,
  Image: `Participant_ID_Table_Contact_ID_Table.dp_fileUniqueId Image`,
  Created_Date: `Participant_ID_Table_Contact_ID_Table._Contact_Setup_Date`,
  Household_ID: `Participant_ID_Table_Contact_ID_Table.Household_ID`,
  Household_Position_ID: `Participant_ID_Table_Contact_ID_Table.Household_Position_ID`,
  Member_Status: `Participant_ID_Table_Member_Status_ID_Table.Member_Status`,
  Participant_Record: `Participant_ID_Table_Contact_ID_Table.Participant_Record`
};


export const C = {
  Attendees: `(${[2, 4, 10, 15, 17, 11].map(id => `Participant_Record_Table.Participant_Type_ID=${id}`).join(' OR ')})`, // `(Participant_Record_Table.Participant_Type_ID=2 OR Participant_Record_Table=4 OR Participant_Record_Table=10 OR Participant_Record_Table=15 OR Participant_Record_Table=17)`,
  MemberType: `(${[9, 20, 23, 24, 14].map(id => `Participant_Record_Table.Participant_Type_ID=${id}`).join(' OR ')})`,
  MemberStatus: `(Participant_Record_Table.Member_Status_ID=1)`,
  ID_Card_Unset: `(${['S', 'C', 'M', 'A'].map(str => `Contacts.ID_Card NOT LIKE '${str}-%'`).join(' AND ')} OR Contacts.ID_Card IS Null)`,
  Exclude_Defaults: `Contacts.Contact_ID > 20 AND Participant_Record > 5`,
  Engaged: `Participant_Record_Table.Participant_Engagement_ID=1`
};




const Exclude_Minors = `NOT Participant_ID_Table_Contact_ID_Table.Household_Position_ID=2`;
const Exclude_Defaults = `NOT Participant_ID_Table_Contact_ID_Table.Contact_ID<20`;
const Exclude_Trespassed = `NOT Group_ID=${group.trespassed}`;