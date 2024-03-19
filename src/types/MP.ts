export interface Contact {
  Contact_ID: number;
  ID_Card: string;
  First_Name: string;
  Last_Name: string;
  Display_Name: string;
  Nickname: string;
  Mobile_Phone: string;
  Email_Address: string;
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


// Not on MP (generated from CSV)
export interface Attendee {
  ID: string;
  StudentID?: number;
  FirstName: string;
  LastName: string;
  Email: string;
  CellPhone: string ;
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


export interface EventParticipant {
  Contact_ID: number;
  Group_ID: number | null;
  Household_Position_ID: number;
  Attending_Online: boolean;
  // Phone_Number: string;
}

export interface EventFormResponse {
  // Form Response
  Contact_ID: number;
  ID_Card: string | null;
  First_Name: string;
  Last_Name: string;
  Email_Address: string | null;
  Mobile_Phone: string | null;
}

export interface EventContact extends EventParticipant, EventFormResponse {

}



export interface BulkAttendee {
	first: string;
	last: string;
	email: string;
	phone: string ;
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