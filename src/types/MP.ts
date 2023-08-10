export interface GroupContact {
  Group_ID: number;
  Contact_ID: number;
  ID_Card: string | null;
  Display_Name: string;
  First_Name: string;
  Last_Name: string;
  Mobile_Phone: string;
  Image: string | null;
  Img: Buffer;
}


export interface Parameter {
  method: 'get' | 'post' | 'put';
  select?: string;
  filter?: string;
  top?: string;
  data?: any;
  scope?: string;
  responseType?: ResponseType;
}


// 
export interface Attendee {
  FirstName: string;
  LastName: string;
  Email: string;
  CellPhone: number | string | null;
}


export interface CarShowContact {
  Contact_ID: number;
  ID_Card: string | null;
  Display_Name: string;
  First_Name: string;
  Last_Name: string;
  Mobile_Phone: string | null;
}


export interface EventParticipant {
  Contact_ID: number;
  Group_ID: number | null;
  Household_Position_ID: number;
  Attending_Online: boolean;
}

export interface EventContact extends EventParticipant {
  // Form Response
  Contact_ID: number;
  ID_Card: string | null;
  First_Name: string;
  Last_Name: string;
  Phone_Number: string | null;
  Email_Address: string | null;
}