export interface Contact {
  Contact_ID: number;
  Group_ID: number;
  ID_Card: null | string;
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
  CellPhone: number | string;
}


export interface CarShowContact {
  Contact_ID: number;
  ID_Card: string | null;
  Display_Name: string;
  First_Name: string;
  Last_Name: string;
  Mobile_Phone: string | null;

}
