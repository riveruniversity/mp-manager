import axios, { AxiosRequestConfig, ResponseType } from 'axios'
import { AxiosResponse } from 'axios'
import dotenv from 'dotenv';

dotenv.config();
// import { Parameter } from './types'
import { group } from './vars'


interface Parameter {
  method: 'get' | 'post' | 'put';
  select?: string;
  filter?: string;
  top?: string;
  data?: any;
  scope?: string;
  responseType?: ResponseType;
}

// 
export function getContact(fltr: string) {

  const table = `Group_Participants`
  const select = `$select=Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.Display_Name, Participant_ID_Table_Contact_ID_Table.First_Name, Participant_ID_Table_Contact_ID_Table.Last_Name, Participant_ID_Table_Contact_ID_Table.Mobile_Phone, Participant_ID_Table_Contact_ID_Table.Email_Address`
  const filter = `&$filter=Group_ID=${group.waiver} AND ${fltr} AND Participant_ID_Table_Contact_ID_Table.Contact_ID>20`
  const top = `&$top=5000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getBlankCardIds() {

  const table = `Group_Participants`
  const select = `$select=Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.Display_Name`
  const filter = `&$filter=Group_ID=${group.waiver} AND Participant_ID_Table_Contact_ID_Table.ID_Card IS null AND NOT Participant_ID_Table_Contact_ID_Table.Contact_ID<20`
  const top = `&$top=5000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------

export function getAllRiverMembers() {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.First_Name, Participant_ID_Table_Contact_ID_Table.Last_Name, Participant_ID_Table_Contact_ID_Table.Mobile_Phone, Participant_ID_Table_Contact_ID_Table.dp_fileUniqueId Image`
  const filter = `&$filter=Group_Participants.Group_ID IN (${group.waiver},${group.member},${group.staff},${group.intern},${group.contractor}) AND NOT Participant_ID_Table_Contact_ID_Table.Contact_ID<20 AND Participant_ID_Table.Participant_Engagement_ID=1` // AND Not Participant_ID_Table_Contact_ID_Table.ID_Card Like 'M-%'   ||  AND Participant_ID_Table_Contact_ID_Table.Contact_ID=126634
  const top = `&$top=50000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getRiverMembers() {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, Group_Participants.Group_Participant_ID, Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.Display_Name`
  const filter = `&$filter=Group_Participants.Group_ID IN (${group.waiver},${group.member}) AND NOT Participant_ID_Table_Contact_ID_Table.Contact_ID<20` // AND Participant_ID_Table_Contact_ID_Table.Contact_ID=126634
  const top = `&$top=50000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getRiverStaff() {

  const table = `Group_Participants`
  const select = `$select=Group_Participants.Group_ID, Group_Participants.Group_Participant_ID, Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.Display_Name`
  const filter = `&$filter=Group_Participants.Participant_ID = Participant_ID_Table_Contact_ID_Table.Participant_Record AND Group_Participants.Group_ID IN (${group.staff},${group.intern},${group.contractor}) AND NOT Participant_ID_Table_Contact_ID_Table.Contact_ID<20`
  const top = `&$top=1000`

  return request(table, { method: 'get', select, filter, top })
}
//: --------------------------------------------------------


export function getFormResponses(eid: number) {

  const table = `Form_Responses`
  const select = `$select=Form_Responses.Contact_ID, Form_Responses.Phone_Number, Contact_ID_Table.ID_Card, Contact_ID_Table.First_Name, Contact_ID_Table.Last_Name`
  const filter = `&$filter=Event_ID=${eid} AND Phone_Number is not null AND Contact_ID_Table.ID_Card is null` //AND Contact_ID_Table.ID_Card is not null AND Contact_ID_Table.ID_Card NOT Like 'C%'
  const top = `&$top=5000`

  return request(table, { method: 'get', select, filter, top })
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

  var config: AxiosRequestConfig = {
    method: param.method,
    url: baseUrl + param.scope + (param.select || '') + (param.filter || '') + (param.top || ''),
    headers: {
      'Authorization': 'Bearer ' + process.env.TOKEN,
      'Content-Type': 'application/json'
    },
    data: param.data,
  };

  if (param.responseType) {
    config.responseType = param.responseType
    // config.responseEncoding = "base64"
  }

  try {
    const response: AxiosResponse = await axios(config);
    return response.data;
  } catch (error: any) {
    console.log('cause', error.cause);
    console.log('Error when requesting ', config.url);
    console.log(error.response?.status, error.response?.statusText);

  }
}
//: --------------------------------------------------------