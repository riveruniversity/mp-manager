import axios from 'axios'
import { AxiosResponse } from 'axios'
import dotenv from 'dotenv';

dotenv.config();

interface Parameter {
    method: 'get' | 'post' | 'put';
    select?: string;
    filter?: string;
    top?: string;
    data?: any;
}

export function getBlankCardIds() {

    const table = `Group_Participants`
    const select = `$select=Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.Display_Name`
    const filter = `&$filter=Group_ID=${process.env.GRP_WVR} AND Participant_ID_Table_Contact_ID_Table.ID_Card IS null`
    const top = `&$top=5000`

    return request(table, {method: 'get', select, filter, top})
}
//: --------------------------------------------------------


export function getRiverMembers() {

    const table = `Group_Participants`
    const select = `$select=Participant_ID_Table_Contact_ID_Table.Contact_ID, Participant_ID_Table_Contact_ID_Table.ID_Card, Participant_ID_Table_Contact_ID_Table.Display_Name`
    const filter = `&$filter=Group_ID=${process.env.GRP_WVR} AND Group_ID=${process.env.GRP_MMBR} AND Group_Participants.Group_ID NOT IN (${process.env.GRP_STFF},${process.env.GRP_INTR},${process.env.GRP_CNTR})`
    const top = `&$top=5000`

    console.log(filter)

    return request(table, {method: 'get', select, filter, top})
}
//: --------------------------------------------------------


export function getFormResponses(eid: number) {

    const table = `Form_Responses`
    const select = `$select=Form_Responses.Contact_ID, Form_Responses.Phone_Number, Contact_ID_Table.ID_Card, Contact_ID_Table.First_Name, Contact_ID_Table.Last_Name`
    const filter = `&$filter=Event_ID=${eid} AND Phone_Number is not null AND Contact_ID_Table.ID_Card is null` //AND Contact_ID_Table.ID_Card is not null AND Contact_ID_Table.ID_Card NOT Like 'C%'
    const top = `&$top=5000`

    return request(table, {method: 'get', select, filter, top})
}
//: --------------------------------------------------------


export function putCardId(Contact_ID: number, ID_Card: string) {

    const table = `Contacts`
    
    const data = [{Contact_ID, ID_Card}];

    return request(table, {method: 'put', data})
}
//: --------------------------------------------------------


async function request(table: string, param: Parameter) {

    const baseUrl = `https://mp.revival.com/ministryplatformapi/tables/${table}?`
    
    var config = {
        method: param.method,
        url: baseUrl + param.select + param.filter + param.top,
        headers: { 
            'Authorization': 'Bearer ' + process.env.TOKEN,
            'Content-Type': 'application/json'
        },
        data: param.data
    };
    
    try {
        const response: AxiosResponse = await axios(config);
        return response.data;
    } catch (error: any) {
        console.log(error.response.data);
        //console.log('Error when requesting ', param.data);
        console.log(error.response.status, error.response.statusText);
        
    }
}
//: --------------------------------------------------------