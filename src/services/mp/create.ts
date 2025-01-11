
import type { Contact, CreateGroupParticipantParams, GroupParticipant, Participant } from 'mp-api';
import { mp } from './api'; import { FestParticipant } from '../../types/MP';
import { findContact } from './find';




export const createPerson = async (params: CreatePersonParams)
  : Promise<CreatedPerson | { completed: Partial<CreatedPerson>; error: any; }> => {
  let {
    firstName,
    lastName,
    householdID,
    householdPositionID,
    participantTypeID,
    groupAssignments
  } = params;


  // Find existing or create new Contact record
  // ------------------------------------------
  let [existing, duplicates]: Contact[][] = await findContact(params);
  let contact: WithRequired<Contact, 'contactID'> | undefined | { error: any; } = existing.shift();
  let isNewContact: boolean = !contact;

  if (!contact)
    contact = await createContact(params);

  if (!('error' in contact) && !contact.idCard)
    contact = await updateContact(contact, { idCard: "C" + contact.contactID });

  if ('error' in contact)
    return {
      completed: {}, error: { message: contact.error.response.data.Message, data: contact.error.config.data }
    };


  if (!contact.householdID || contact.householdID !== householdID) {
    var updatedContact = await updateContact(contact, { householdID, householdPositionID });
    if ('error' in updatedContact)
      return {
        completed: { contact },
        error: { message: updatedContact.error.response.data.Message, data: updatedContact.error.config.data }
      };
    else
      contact = updatedContact;
  }



  // Find existing or create new Participant record
  // ----------------------------------------------
  let participant: WithRequired<Participant, 'participantID'> | { error: any; } | undefined;
  if (!isNewContact && contact.participantRecord) {
    participant = await mp.getParticipant(contact.participantRecord);
    if (participant && 'error' in participant)
      return {
        completed: { contact }, error: { message: participant.error.response.data.Message, data: participant.error.config.data }
      };
  }
  else {
    participant = await mp.createParticipant({
      contactID: contact.contactID,
      participantTypeID,
      participantStartDate: new Date().toISOString()
    });
    if (participant && 'error' in participant)
      return {
        completed: { contact }, error: { message: participant.error.response.data.Message, data: participant.error.config.data }
      };
  }

  if (!participant) return { completed: { contact }, error: 'Participant not found and not created!' };


  // Find existing or add Group Participant Record
  // ---------------------------------------------
  const newGroupParticipants: GroupParticipant[] = [];
  const oldGroupParticipants: GroupParticipant[] = [];
  let existingGroupParticipantRecords: GroupParticipant[] | null = await findExistingGroupParticipants(participant);
  let groupParticipant: GroupParticipant | null | undefined = undefined;
  for (let groupAssignment of groupAssignments.filter(ga => ga.groupID > 0)) {
    groupParticipant = await findExistingGroupRecord(existingGroupParticipantRecords, groupAssignment, participant);

    if (groupParticipant) {
      oldGroupParticipants.push(groupParticipant);
    }
    else {
      const res = await mp.createGroupParticipant({
        ...groupAssignment,
        participantID: participant.participantID
      });
      if (!('error' in res))
        newGroupParticipants.push(res);
      else
        return {
          completed: { contact, participant }, error: res.error 
        };
    }
  }


  // -------------------------------------
  console.log(`✅ Registration completed for ${firstName} ${lastName}`);

  return {
    isNewContact,
    contact,
    participant,
    newGroupParticipants,
    oldGroupParticipants,
    groupParticipants: [...newGroupParticipants, ...oldGroupParticipants]
      .map(({ groupID, groupParticipantID }) => ({ groupID, groupParticipantID })),
    params,
  };
};



// ==
async function createContact({ firstName, lastName, emailAddress, dateOfBirth, householdPositionID, householdID }: CreatePersonParams)
  : Promise<Contact | { completed: Partial<CreatedPerson>; error: any; }> {

  let contact = await mp.createContact({
    firstName,
    lastName,
    displayName: `${lastName}, ${firstName}`,
    nickname: firstName,
    company: false,
    emailAddress,
    dateOfBirth,
    householdPositionID,
    householdID
  });


  if ('error' in contact)
    return { completed: {}, error: contact.error };

  console.log(`🆕 New Contact created: `, [contact.contactID]);
  return contact;
}

async function updateContact(contact: Contact, data: Partial<Contact>): Promise<Contact | { error: any; }> {

  const res = await mp.updateContacts([
    {
      contactID: contact.contactID,
      ...data
    }
  ]);
  if ('error' in res) return res;
  return res instanceof Array ? res[0] : res;
}


async function findExistingGroupParticipants(participant: Participant): Promise<GroupParticipant[] | null> {

  let existingGroupParticipantRecords: GroupParticipant[] | { error: any; } = await mp.getGroupParticipants({
    filter: `Participant_ID=${participant.participantID} AND End_Date is null`
  });

  if (!('error' in existingGroupParticipantRecords))
    return existingGroupParticipantRecords;
  else
    return null;
}

async function findExistingGroupRecord(existingGroupParticipantRecords: GroupParticipant[] | null, groupAssignment: Partial<CreateGroupParticipantParams>, participant: Participant) {

  if (existingGroupParticipantRecords) {
    let groupParticipant: GroupParticipant | undefined = existingGroupParticipantRecords
      .find(gp => gp.participantID === participant.participantID && gp.groupID === groupAssignment.groupID);;

    // if (groupParticipant)
    // 	console.log(`✔️ Existing Group Participant found:`, [groupParticipant.groupParticipantID]);
    // else
    // 	console.log(`➖ No Existing Group Participant found for Participant_ID '${participant.participantID}', Group_ID '${groupAssignment.groupID}' in `, existingGroupParticipantRecords);

    return groupParticipant;
  }
  else
    return null;
}

type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type CreatePersonParams = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber?: string;
  participantTypeID: number;
  groupAssignments: Omit<CreateGroupParticipantParams, 'participantID'>[];
  emailAddress?: string;
  notes?: string;
  householdID?: number;
  householdPositionID: number;
  // registrant: FestParticipant;
};

export type CreatedPerson = {
  isNewContact: boolean;
  contact: Contact;
  participant: Participant;
  groupParticipants?: Partial<GroupParticipant>[];
  newGroupParticipants: GroupParticipant[];
  oldGroupParticipants: GroupParticipant[];
  params: CreatePersonParams;
};

type PersonType = 'registrant' | 'minor';