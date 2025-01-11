import { PhoneNumber } from "libphonenumber-js";
import { ContactRecord } from "mp-api/dist/tables/contacts";
import { EventParticipantRecord } from "mp-api/dist/tables/event-participants";

export interface Contact {
  Contact_ID: number;
  ID_Card: string | null;
  First_Name: string;
  Last_Name: string;
  Display_Name: string;
  Nickname?: string;
  Mobile_Phone: string | null;
  Email_Address: string | null;
  Gender?: any;
  Member_Status_ID?: any;
  Member_Status?: any;
  Household_ID: number;
  Household_Name: string;
  Household_Position_ID: number;
  Household_Position: string;
  Marital_Status_ID?: any;
  Marital_Status?: any;
  Participant_ID: number;
  Participant_Type_ID: number;
  Participant_Engagement_ID: number;
  Engagement_Level: string;
  Contact_Status: string;
  Notes: string;
  Red_Flag_Notes?: any;
  Image?: any;
}

export interface GroupContact {
  Group_ID: number | null;
  Contact_ID: number;
  ID_Card: string | null;
  Display_Name: string;
  First_Name: string;
  Last_Name: string;
  Mobile_Phone: string | null;
  Image: string | null;
  Img: Buffer;
}



export interface FormResponseRecord {
  // Form Response
  Form_Response_ID: number;
  Form_ID: number;
  Response_Date: string;
  IP_Address: string;
  Contact_ID: number;
  First_Name: string | null;
  Last_Name: string | null;
  Email_Address: string | null;
  Phone_Number: string | null;
  Address_Line_1: null;
  Address_Line_2: null;
  Address_City: null;
  Address_State: null;
  Address_Zip: null;
  Event_ID: number;
  Pledge_Campaign_ID: null;
  Opportunity_ID: null;
  Opportunity_Response: null;
  Congregation_ID: number;
  Notification_Sent: boolean;
  Expires: null;
  Event_Participant_ID: number;
}


export interface FormResponseAnswerRecord {
  Form_Response_Answer_ID: number;
  Form_Field_ID: number;
  Response: string | null;
  Form_Response_ID: number;
  Event_Participant_ID: number;
  Pledge_ID: number | null;
  Opportunity_Response: null;
  Placed: boolean;
  Children?: string | null;
}

export interface EventContact extends EventParticipantRecord, FormResponseRecord, ContactRecord {

}


export interface FestParticipant extends EventParticipantRecord, FormResponseRecord, FormResponseAnswerRecord, ContactRecord {

}



export interface CarShowContact {
  Contact_ID: number;
  ID_Card: string | null;
  Display_Name: string;
  First_Name: string;
  Last_Name: string;
  Nickname: string;
  Mobile_Phone: string | null;
  Email_Address: string | null;
  Household_Position_ID: number;
}



export interface YouthWeekParticipant extends EventParticipantRecord, Contact {
  Adult_Phone: string; // extracted from Participant.Notes
  Phone_Number: PhoneNumber | undefined;
  Type: YouthWeekRegistrationInfo['detail'];
  Form: string;
  Registration_Info: YouthWeekRegistrationInfo;
  Group_Leader: boolean;
  Church_Group?: boolean;
  Leader?: number | null;

}

export interface YouthWeekRegistrationInfo {
  detail: 'adult' | 'youth' | 'kids' | '_'; //  'adult' if not using the dynamic form
  adult?: YouthWeekAdult;
  emergencyContact: YouthWeekEmergencyContact;
  type?: string;
  churchOrGroup?: YouthWeekChurch;
  qrCodePhone?: string;
}


interface YouthWeekEmergencyContact {
  fullName: string;
  phoneNumber: string;
}

interface YouthWeekAdult {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  eventParticipantID: number;
}


interface YouthWeekChurch {
  name: string;
  location: string;
}



export interface BulkAttendee {
  first: string;
  last: string;
  email: string;
  phone: string;
  barcode: string;
  fam?: boolean;
  file?: string;
  onMp?: boolean;
  type?: 'adult' | 'kids' | 'youth' | '_';

  url?: string;

  // DB
  _id?: string;
  sentEmail?: boolean;
  sentText?: boolean;
  textError?: string;
  emailError?: string;
}

export interface BulkAttendeeWithFile extends BulkAttendee {
  file: string;
}




export interface ContactAttribute {
  Contact_Attribute_ID: number;
  Contact_ID: number;
  Attribute_ID: number;
  Start_Date: string;
  End_Date?: string | null;
  Notes?: string | null;
}

export interface ContactParameter extends Partial<Contact> {
  Contact_ID: number;
}

export interface ContactAttributeParameter extends Partial<ContactAttribute> {
  Contact_ID: number;
  Attribute_ID: number;
  Start_Date: string;
}


