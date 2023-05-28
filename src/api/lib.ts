import { putCardId } from "./mp"
import { GroupContact, EventContact } from "../types/MP"
import { sleep } from "../utils"

interface UpdateOptions {
  onlyBlanks?: boolean;
  prefix?: string;
}

export async function updateCardIds(contacts: EventContact[], {prefix, onlyBlanks}: UpdateOptions): Promise<void> {

  if (onlyBlanks) {
    contacts = contacts.filter(c => c.ID_Card === null)
    console.log(contacts.length, 'contacts without Card_ID')
  }

  prefix ??= ''
  // const contacts = array.filter(contact => contact.ID_Card)
  for(const contact of contacts) {
    putCardId(contact.Contact_ID, prefix + contact.Contact_ID)
      .then(([card]:[GroupContact]) => console.log('success', card.Contact_ID, card.First_Name))
      .catch(() => console.log('skipped', contact.Contact_ID, contact.First_Name))
    await sleep(10)
  }
}