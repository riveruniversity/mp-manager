import { Schema, model, connect, HydratedDocument, Query, FilterQuery, UpdateWithAggregationPipeline, UpdateQuery, Mongoose } from 'mongoose';
import { dbUser, dbPass, dbUrl } from '../config/vars';
import { BulkAttendee } from '../types/MP'
import * as fs from 'fs';
import { sleep } from '../utils';

var db: Mongoose | null;
var dbInitiated: boolean = false;

// Schema corresponding to the document interface.
const attendeeSchema = new Schema<BulkAttendee>({
  _id: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  barcode: String,
  fam: Boolean,
  onMp: Boolean,
  type: { type: String, required: false },
  sentEmail: { type: Boolean, default: false },
  sentText: { type: Boolean, default: false },
  textError: String,
  emailError: String
});

const BulkAttendeeModel = model<BulkAttendee>('Attendee', attendeeSchema);

async function connectDB() {

  db = await connect(dbUrl)
    .then(db => db)
    .catch(err => {
      console.log("🛑 ", err.message);
      return null
    });

  if (db) console.log('🔗', 'connected to MongoDB:', db.connection.name);

  dbInitiated = true;
  }

export async function saveAttendee(attendee: BulkAttendee) {
  const doc: HydratedDocument<BulkAttendee> = new BulkAttendeeModel(attendee);
  doc.save()
    .catch(err => console.log('Error when saving attendee: ', attendee, err.result, err.results))
}

export async function updateAttendee(attendee: BulkAttendee, update: UpdateWithAggregationPipeline | UpdateQuery<BulkAttendee>) {
  BulkAttendeeModel.updateOne({ barcode: attendee.barcode }, update)
    .catch(err => console.log('Error when updating attendee: ', attendee, err.result, err.results))
}

export async function getAttendees(filter: FilterQuery<BulkAttendee>): Promise<BulkAttendee[]> {
  console.log(new Date().getTime(), '👥 getting attendees from DB')
  return BulkAttendeeModel.find(filter || {})
}

export async function saveAttendees(attendees: BulkAttendee[]) {

  if (!db) connectDB();

  if (!(await awaitDbInit('saveAttendees'))) return;

  attendees = attendees.map(a => ({ ...a, ...{ _id: a.barcode } }))
  BulkAttendeeModel.insertMany(attendees, { ordered: false, rawResult: true })
    .then(savedAttendees => console.log('💾 attendees saved', savedAttendees.insertedCount))
    .catch(err => {
      console.log('Error when trying to save attendees. See errors.json for more details!')
      fs.writeFileSync('src/data/errors.json', JSON.stringify(err.writeErrors, null, '\t'));
      console.log(err.insertedDocs.length, 'saved.')
      console.log(err.writeErrors.length, 'skipped.')
    })
}


export async function saveDevAttendees() {
  console.log('💾 saving dev attendees...')
  saveAttendees(devAttendees);
}

const devAttendees: BulkAttendee[] = [
  {first : "Wilhelm", last : "Mauch", email : "wmauch@revival.com", phone : '8134507575', barcode : '126634', fam : false, onMp: true},
  {first : "Adrian", last : "Garcia", email : "agarcia@revival.com", phone : '8139512245', barcode : '118838', fam : false,onMp: true},
]



interface BulkInfo {
  sentEmail?: boolean;
  sentText?: boolean;
  textError?: string;
  emailError?: string;
}

async function awaitDbInit(task: string) {
  while (!dbInitiated) {
    await sleep(50);
  }

  if (!db) return console.log('DB not initialized. Did not execute '+ task);
  else return true;
}