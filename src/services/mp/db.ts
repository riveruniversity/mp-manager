import { Schema, model, connect, HydratedDocument, Query, FilterQuery, UpdateWithAggregationPipeline, UpdateQuery, Mongoose } from 'mongoose';
import { dbUser, dbPass, dbUrl } from '../../config/vars';
import * as fs from 'fs';
import { sleep } from '../../utils';
import { CreatePersonParams } from './create';
import { GroupParticipant } from 'mp-api';

var db: Mongoose | null;
var dbInitiated: boolean = false;

const errorSchema = new Schema<RequestError>({
  message: { type: String },
  data: { type: String },
  completed: { type: [String] }
},
  { _id: false, timestamps: true }
);

const groupAssignmentSchema = new Schema<GroupAssignment>({
  groupID: { type: Number, required: true },
  groupRoleID: { type: Number, required: true },
  startDate: { type: String, required: true },
}, { _id: false });

const createPersonSchema = new Schema<Person>({
  _id: { type: String, required: true },
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  dateOfBirth: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  householdID: { type: Number || null, default: null },
  householdPositionID: { type: Number || null, default: null },
  participantTypeID: { type: Number || null, default: null },
  groupAssignments: [groupAssignmentSchema],
  groupParticipants: [groupAssignmentSchema],
  contact: { type: Number || null, default: null },
  participant: { type: Number || null, default: null },
  error: errorSchema,
}, { timestamps: true });


const PersonModel = model<Person>('Person', createPersonSchema);

async function connectDB() {

  db = await connect(dbUrl + '/kids')
    .then(db => db)
    .catch(err => {
      console.log("🛑 ", err.message);
      return null;
    });

  if (db) console.log('🔗', 'connected to MongoDB:', db.connection.name);

  dbInitiated = true;
}

export async function savePerson(minor: Person) {

  if (!db) await connectDB();

  const doc: HydratedDocument<Person> = new PersonModel(minor);
  doc.save()
    .catch(err => console.log('Error when saving minor: ', minor, err.result, err.results));
}

export async function updatePerson(minor: Person, update:  UpdateQuery<Person>) { // UpdateWithAggregationPipeline | UpdateQuery<Person>

  if (!db) await connectDB();

  PersonModel.updateOne({ _id: minor._id }, update)
    // .catch(err => console.log('Error when updating minor: ', minor, err.result, err.results));
    .catch(err => console.log('Error when updating minor: ', minor, err));
}

export async function getPeople(filter: FilterQuery<Person>): Promise<Person[]> {

  if (!db) await connectDB();

  console.log('🔍', 'getting people from DB');
  return PersonModel.find(filter || {}).lean()//.limit(5);
}

export async function savePeople(people: Person[]) {

  if (!db) await connectDB();

  if (!(await awaitDbInit('savePeople'))) return;

  people = people.map(p => ({ ...p, ...{ _id: p.firstName + p.lastName + p.dateOfBirth } }));
  PersonModel.insertMany(people, { ordered: false, rawResult: true }) // i remove { ordered: false } to see errors
    .then(savedPeople => console.log('💾', 'people saved', savedPeople.insertedCount))
    .catch(err => {
      console.log('Error when trying to save people. See errors.json for more details!');
      console.log(err.errorResponse);
      console.log(err.insertedDocs.length, 'saved.');
      console.log(err.writeErrors.length, 'skipped.');
      fs.writeFileSync('src/data/errors.json', JSON.stringify(err.writeErrors, null, '\t'));
    });
}


export async function saveDevPeople() {
  console.log('💾', 'saving dev people...');
  savePeople(devPeople);
}
``;
const devPeople: Person[] = [
  {
    firstName: "Amira", lastName: "Mauch", phoneNumber: '8134507575', dateOfBirth: '07/15/2021',
    householdID: 97932, householdPositionID: 2, participantTypeID: 11,
    groupAssignments: [{
      groupID: 522,   // Minor Waver
      groupRoleID: 4, // Class Member
      startDate: new Date().toISOString()
    }]
  },
];



async function awaitDbInit(task: string) {
  while (!dbInitiated) {
    await sleep(50);
  }

  if (!db) return console.log('DB not initialized. Did not execute ' + task);
  else return true;
}

export async function closeConnection() {
  db?.connection.close();
  console.log('⏏️ ', 'db disconnected');
}


export interface Person extends CreatePersonParams {
  _id?: string;
  contact?: number;
  participant?: number;
  groupParticipants?: Partial<GroupParticipant>[];
  error?: RequestError;
  completed?: string[];
}


type GroupAssignment = {
  groupID: number;
  groupRoleID: number;
  startDate: string;
};


type RequestError = {
  message: string;
  data: string;
  completed: Array<string>;
};