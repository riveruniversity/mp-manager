import { putCardId } from "./mp"
import { GroupContact, EventContact, CarShowContact, Contact } from "../types/MP"
import { cleanName, fixNumber, sleep, trimString } from "../utils"

interface UpdateOptions {
  onlyBlanks?: boolean;
  prefix?: string;
}

export class Lib {

  static async updateCardIds(contacts: (EventContact | CarShowContact | Contact)[], { prefix, onlyBlanks = true }: UpdateOptions): Promise<void> {
    // export async function updateCardIds(contacts: EventContact[], {prefix, onlyBlanks}: UpdateOptions): Promise<void> {

    if (onlyBlanks) {
      contacts = contacts.filter(c => c.ID_Card === null)
      console.log(contacts.length, 'contacts without Card_ID')
    }

    prefix ??= ''
    // const contacts = array.filter(contact => contact.ID_Card)
    for (const contact of contacts) {
      putCardId(contact.Contact_ID, prefix + contact.Contact_ID)
        .then(([card]: [GroupContact]) => console.log('success', card.Contact_ID, card.First_Name))
        .catch(() => console.log('skipped', contact.Contact_ID, contact.First_Name))
      await sleep(10)
    }
  }

  static trimData(eventContact: EventContact): EventContact {
    const contact = Object.entries(eventContact);
    return contact.reduce((acc: EventContact, [key, val]) => ({ ...acc, ...{ [key]: trimString(val) } }), {} as EventContact);
  }

  static fixValues(eventContact: EventContact): EventContact {
    return {
      ...eventContact,
      ...{ First_Name: cleanName(eventContact.First_Name) },
      ...{ Last_Name: cleanName(eventContact.Last_Name) },
      ...{ Mobile_Phone: fixNumber(eventContact.Mobile_Phone) },
    }
  }
}
