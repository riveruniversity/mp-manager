import * as fs from 'fs'
import { removeDuplicatesById, removeDuplicates, removeOnline, removeStaff } from '../services/filters';
import { GroupContact } from '../types/MP';
import { cleanName } from '../utils';


(async function cleanNames() {

  let contacts: GroupContact[] = await getAllRiverMembers();
  if (!contacts) return

  console.log(`${contacts.length} contacts`);
  contacts = await removeDuplicatesById<GroupContact>(contacts);

  let updateContacts: ContactParameter[] = contacts.reduce((acc, {Contact_ID, First_Name, Last_Name}) => {

    const cleanFirstName = cleanName(First_Name);
    const cleanLastName = cleanName(Last_Name);

    const updateParams: ContactParameter | any = { 
      Contact_ID,
      First_Name_Old: First_Name,
      Last_Name_Old: Last_Name,
      ...(cleanFirstName !== First_Name) && { First_Name: cleanFirstName },
      ...(cleanLastName !== Last_Name) && { Last_Name: cleanLastName },
    }

    if (!!updateParams.First_Name || !!updateParams.Last_Name) acc.push(updateParams)

    return acc;
  
  }, [] as ContactParameter[])

  console.log('updateContacts', updateContacts)

  // updateContact()

})()
