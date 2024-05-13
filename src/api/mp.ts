import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios'
import dotenv from 'dotenv';
import { getAccessToken } from '../services/oauth'

dotenv.config();

import { group } from '../config/vars'
import { Contact, EventContact, EventParticipant, GroupContact } from '../types/MP';


interface Parameter {
  method: 'get' | 'post' | 'put';
  select?: string;
  filter?: string;
  top?: string;
  data?: any;
  scope?: string;
  responseType?: ResponseType;
}


export interface ContactParameter extends Partial<Contact> {
  Contact_ID: number;
}


export function getContact(filtr: string) {

  const table = `Contacts`
  const select = `$select=Contacts.Contact_ID, Contacts.ID_Card, Contacts.First_Name, Contacts.Last_Name, Contacts.Display_Name, Contacts.Nickname, Contacts.Email_Address, Contacts.Mobile_Phone, Gender_ID_Table.Gender, Participant_Record_Table.Member_Status_ID, Participant_Record_Table_Member_Status_ID_Table.Member_Status, Contacts.Household_ID, Household_ID_Table.Household_Name, Contacts.Household_Position_ID, Household_Position_ID_Table.Household_Position, Contacts.Marital_Status_ID, Marital_Status_ID_Table.Marital_Status, Participant_Record_Table.Participant_ID, Participant_Record_Table.Participant_Type_ID, Participant_Record_Table.Participant_Engagement_ID, Participant_Record_Table_Participant_Engagement_ID_Table.Engagement_Level, Contact_Status_ID_Table.Contact_Status, Participant_Record_Table.Notes, Participant_Record_Table.Red_Flag_Notes, dp_fileUniqueId as Image`
  const filter = `&$filter=${filtr}`
  const top = `&$top=5000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getContactSignedWaiver(filtr: string) {

  const table = `Group_Participants`
  const select = `$select=${C.Contact_ID}, ${C.ID_Card}, ${C.Display_Name}, ${C.First_Name}, ${C.Last_Name}, ${C.Nickname}, ${C.Mobile_Phone}, ${C.Email_Address}, ${C.Household_Position_ID}`
  const filter = `&$filter=${Signed_Waiver} AND ${filtr} AND ${Exclude_Minors} AND ${Exclude_Defaults}`
  const top = `&$top=5000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getBlankCardIds() {

  const table = `Group_Participants`
  const select = `$select=${C.Contact_ID}, ${C.ID_Card}, ${C.Display_Name}e`
  const filter = `&$filter=Group_ID=${group.waiver} AND ${C.ID_Card} IS null AND ${Exclude_Defaults}`
  const top = `&$top=5000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------

export function getAllRiverMembers(): Promise<GroupContact[]> {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, ${C.Contact_ID}, ${C.ID_Card}, ${C.First_Name}, ${C.Last_Name}, ${C.Mobile_Phone}, ${C.Image}`
  const filter = `&$filter=Group_Participants.Group_ID IN (${group.waiver},${group.member},${group.staff},${group.intern},${group.contractor}) AND ${Exclude_Trespassed} AND ${Exclude_Defaults} ` // AND Participant_ID_Table.Participant_Engagement_ID=1 // AND Not ${Field.ID_Card} Like 'M-%'
  const top = `&$top=10000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getRiverMembers() {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, ${C.Contact_ID}, ${C.ID_Card}, ${C.Display_Name}`
  const filter = `&$filter=Group_Participants.Group_ID IN (${group.waiver},${group.member}) AND ${Exclude_Trespassed} AND ${Exclude_Defaults}` // AND ${Field.Contact_ID}=126634
  const top = `&$top=10000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getSignedWaiver() {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, ${C.Contact_ID}, ${C.Display_Name}`
  const filter = `&$filter=${Signed_Waiver} AND ${Exclude_Trespassed} AND ${Exclude_Defaults}` // AND ${Field.Contact_ID}=126634
  const top = `&$top=100000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getRiverStaff(): Promise<GroupContact[]> {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, ${C.Contact_ID}, ${C.ID_Card}, ${C.Display_Name}, ${C.First_Name}, ${C.Last_Name}, ${C.Mobile_Phone}, ${C.Email_Address}`
  const filter = `&$filter=Group_Participants.Participant_ID = Participant_ID_Table_Contact_ID_Table.Participant_Record AND Group_Participants.Group_ID IN (${group.staff},${group.intern},${group.contractor}) AND Group_Participants.End_Date is null`
  const top = `&$top=1000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getPreregisteredGroups() {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, ${C.Contact_ID}, ${C.Display_Name}`
  const filter = `&$filter=Group_Participants.Group_ID=542 AND ${Exclude_Trespassed} AND ${Exclude_Defaults}`
  const top = `&$top=100000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------



export function getEventParticipants(eid: number): Promise<EventParticipant[]> {

  const table = `Event_Participants`
  const select = `$select=${C.Contact_ID}, Event_Participants.Group_ID, ${C.Household_Position_ID}, Attending_Online` //, ${Field.First_Name}, ${Field.Last_Name}
  const filter = `&$filter=Event_ID=${eid}` // AND ${Signed_Waiver}  AND Attending_Online='false' // AND Participant_ID_Table_Contact_ID_Table.ID_Card NOT Like 'C%'
  const top = `&$top=10000`

  return request(table, { method: 'get', select, filter, top })
}
//: ........................................................

export function getFormResponses(eid: number): Promise<EventContact[]> {

  const table = `Form_Responses`
  const select = `$select=Form_Responses.Contact_ID, Contact_ID_Table.ID_Card, Contact_ID_Table.First_Name, Contact_ID_Table.Last_Name, Contact_ID_Table.Email_Address, Contact_ID_Table.Mobile_Phone`
  const filter = `&$filter=Event_ID=${eid} ` //AND Contact_ID_Table.ID_Card is not null // AND Contact_ID_Table.ID_Card NOT Like 'C%'  // AND Response_Date BETWEEN '08/01/2023' AND '08/31/2023'
  const top = `&$top=10000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function updateContact(Fields: ContactParameter) {

  const table = `Contacts`

  const data = [Fields];

  return request(table, { method: 'put', data })
}
//: --------------------------------------------------------


export function putCardId(Contact_ID: number, ID_Card: string) {

  const table = `Contacts`

  const data = [{ Contact_ID, ID_Card }];

  return request(table, { method: 'put', data })
}
//: --------------------------------------------------------


export function getImage(fileId: string) {

  const table = `Files`

  return request(table, { method: 'get', scope: 'files', select: fileId, responseType: 'arraybuffer' })
}
//: --------------------------------------------------------


async function request(table: string, param: Parameter) {

  const baseUrl = `https://mp.revival.com/ministryplatformapi`
  param.scope = param.scope ? `/${param.scope}/` : `/tables/${table}?`

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
    config.responseType = param.responseType
    // config.responseEncoding = "base64"
  }

  try {
    return axios(config)
    .then((response: AxiosResponse) => response.data)
    .catch(error => console.log(error.response?.status, error.response?.statusText, error.response?.data));

  } catch (error: any) {
    console.log('cause', error.cause);
    console.log('Error when requesting ', config.url);
  }
}
//: --------------------------------------------------------

export const C = {
  Contact_ID: `Participant_ID_Table_Contact_ID_Table.Contact_ID`,
  ID_Card: `Participant_ID_Table_Contact_ID_Table.ID_Card`,
  First_Name: `Participant_ID_Table_Contact_ID_Table.First_Name`,
  Last_Name: `Participant_ID_Table_Contact_ID_Table.Last_Name`,
  Display_Name: `Participant_ID_Table_Contact_ID_Table.Display_Name`,
  Nickname: `Participant_ID_Table_Contact_ID_Table.Nickname`,
  Mobile_Phone: `Participant_ID_Table_Contact_ID_Table.Mobile_Phone`,
  Email_Address: `Participant_ID_Table_Contact_ID_Table.Email_Address`,
  Image: `Participant_ID_Table_Contact_ID_Table.dp_fileUniqueId Image`,
  Household_Position_ID: `Participant_ID_Table_Contact_ID_Table.Household_Position_ID`
}

const Exclude_Minors = `NOT Participant_ID_Table_Contact_ID_Table.Household_Position_ID=2`
const Exclude_Defaults = `NOT Participant_ID_Table_Contact_ID_Table.Contact_ID<20`
const Exclude_Trespassed = `NOT Group_ID=${group.trespassed}`
const Signed_Waiver = `Group_ID IN (${group.waiver}, ${group.waiver2023})`