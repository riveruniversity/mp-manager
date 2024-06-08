import eventbrite from 'eventbrite';
// import dotenv from 'dotenv';
// dotenv.config();

import { eventbriteToken } from '../config/vars';
import { fixNumber, groupOrderedArrayBy } from '../utils';
import { Attendee } from '../types/Eventbrite';

const eb = eventbrite({ token: eventbriteToken });


export async function getAttendees(eventId: number): Promise<Attendee[]> {
  console.log('🗃️ ', 'getting attendees from Eventbrite...')
  const url = `/events/${eventId}/attendees/?expand=answers&continuation=`;
  return getAllPages<AttendeeData>(url, 'attendees')

    // Generate Id by combining all attendee data & fix phone numbers
    .then((attendees: AttendeeData[]) => attendees.map((attendee) => {
      const cell_phone = fixNumber(attendee.profile.cell_phone)
      const id = generateId(attendee.profile);
      return { ...attendee.profile, cell_phone, id };
    }))
    // Grouping by Id to remove duplicates
    .then(async (attendees: Profile[]) => {
      console.log('👥', attendees.length, 'attendees on Eventbrite');
      // fs.writeFileSync(`src/data/attendees.csv`, await json2csv(attendees, { emptyFieldValue: '' }));
      const groupedById = groupOrderedArrayBy<Profile>(attendees, 'id');
      console.log('👥', groupedById.length, 'attendees excluding duplicates')
      return groupedById.map(attendee => attendee[0]);
    })
    // Convert to standard Attendee interface
    .then((attendees: Profile[]) => attendees.map(profile => ({
      Contact_ID: profile.id,
      First_Name: profile.first_name,
      Last_Name: profile.last_name,
      Email_Address: profile.email || '',
      Mobile_Phone: profile.cell_phone || '',
    })))
}


async function getAllPages<T>(url: string, key: string) {
  let data: T[] = [];
  let continuation: string = '1';

  try {
    while (continuation) {
      let response: PaginatedResponse<T> = await eb.request(url)
      data = data.concat(response[key] as T[])

      continuation = response.pagination?.continuation || '';
      url = url.replace(/(?<=continuation=)(\w+)?/, continuation);
    }

    return data;

  } catch ({ parsedError }: any) {
    console.log(parsedError);
    throw parsedError;
  }
}


function generateId(attendee: Profile): string {
  const { id, name, addresses, ...profile} = attendee;
  const idString = Object.values(profile).join('').toLowerCase().replaceAll(/ /g, '');
  const idBase64 = Buffer.from(idString).toString('base64');
  return idBase64;
}



interface PaginatedResponse<T> {
  [key: string]: T[] | Pagination | undefined;
  pagination?: Pagination;
}

interface Pagination {
  object_count: number;
  page_number: number;
  page_size: number;
  page_count: number;
  continuation: string;
  has_more_items: boolean;
}



export interface AttendeeData {
  costs: Costs;
  resource_uri: string;
  id: string;
  changed: string;
  created: string;
  quantity: number;
  variant_id: Object;
  profile: Profile;
  barcodes: Barcode[];
  answers: any[];
  checked_in: boolean;
  cancelled: boolean;
  refunded: boolean;
  affiliate: string;
  guestlist_id: Object;
  invited_by: Object;
  status: string;
  ticket_class_name: string;
  delivery_method: string;
  event_id: string;
  order_id: string;
  ticket_class_id: string;
}

interface Barcode {
  status: string;
  barcode: string;
  created: string;
  changed: string;
  checkin_type: number;
  is_printed: boolean;
}

export interface Profile {
  first_name: string;
  last_name: string;
  addresses?: Object;
  cell_phone?: string;
  email: string;
  name: string;

  // Generated
  id: string;
}



interface Costs {
  base_price: BasePrice;
  eventbrite_fee: BasePrice;
  gross: BasePrice;
  payment_fee: BasePrice;
  tax: BasePrice;
}

interface BasePrice {
  display: string;
  currency: string;
  value: number;
  major_value: string;
}
