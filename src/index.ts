import { getBlankCardIds, getFormResponses, putCardId } from './api'

interface Contact {
    Contact_ID: number;
    ID_Card: null | string;
    Display_Name: string;
    First_Name: string;
    Last_Name: string;
}

async function populateCardId() {
    const turkeyEvent = 68468
    //const contacts = await getBlankCardIds()
    const contacts = await getFormResponses(turkeyEvent)

    if(!contacts) return 

    console.log(`${contacts.length} contacts`, contacts)
    console.log(`${contacts.length} contacts`)
    
    contacts.forEach(async (contact: Contact) => {
        //console.log(contact);
        const card = await putCardId(contact.Contact_ID, "T"+contact.Contact_ID)
        console.log('success', card[0].Contact_ID, card[0].First_Name);
    });
}


populateCardId()