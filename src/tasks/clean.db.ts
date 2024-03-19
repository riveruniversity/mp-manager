import { getRiverMembers, getRiverStaff, getAllRiverMembers } from '../api/mp'
import * as fs from 'fs'
import { removeDuplicates, removeOnline, removeStaff } from '../services/filters';


(async function getAllRiverMembersInfo() {

  let contacts = await getAllRiverMembers();
  if (!contacts) return

  console.log(`${contacts.length} contacts`);


  contacts = await removeOnline(contacts);
  contacts = await removeDuplicates(contacts);
  contacts = await removeStaff(contacts);


  fs.writeFileSync('./src/members.json', JSON.stringify(contacts, null, '\t'));

})()




