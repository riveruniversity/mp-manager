import { PhoneNumber } from "libphonenumber-js";

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


export interface EventParticipant {
  Contact_ID: number;
  ID_Card: string | null;
  Group_ID: number | null;
  Household_Position_ID: number;
  Attending_Online: boolean;
  Event_Participant_ID: number,
  Participant_ID: number,
  Participation_Status_ID: number,
  Notes: string;
  // Phone_Number: string;
}

export interface YouthWeekParticipant extends EventParticipant, Contact {
  Adult_Phone: string; // extracted from Participant.Notes
  Phone_Number: PhoneNumber | undefined;
  Type: YouthWeekRegistrationInfo['detail'];
  Form: string;
  Registration_Info: YouthWeekRegistrationInfo;
  Group_Leader: boolean;
  Church_Group?: boolean;
}

export interface YouthWeekRegistrationInfo {
  detail: 'registrant' | 'adult' | 'youth' | 'kids' | '_'; //  'adult' if not using the dynamic form
  adult?: YouthWeekAdult;
  emergencyContact: YouthWeekEmergencyContact;
  type?: string;
  churchOrGroup?: YouthWeekChurch;
	qrCodePhone?: string;
}



export interface EventFormResponse {
  // Form Response
  Contact_ID: number;
  ID_Card: string | null;
  First_Name: string;
  Last_Name: string;
  Nickname?: string;
  Email_Address: string | null;

  Phone_Number: string | null;
}

export interface EventContact extends EventParticipant, EventFormResponse, Contact {

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