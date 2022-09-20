import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { DefaultSettings } from "./defaultData";

export interface Message {
    content: string,
    date: string,
    sender: {
        id: number,
        firstName: string,
        lastName: string,
        email: string
        avatar: string,
    }
};

export interface Conversation {
    id: number,
    name: string,
    avatar: string,
    messages: Message[],
};

export interface Contact {
    id: number,
    firstName: string,
    lastName: string,
    avatar: string,
    email: string,
    lastSeen: Date,
};

export interface ContactGroup {
    letter: string,
    contacts: Contact[],
};

export interface Notification {
    flag: string,
    title: string,
    message: string,
};


export interface Setting {
    id: number,
    type: string,
    value?: boolean | string | File,
    title: string,
    description?: string,
};

export interface Settings {
    id: number,
    title: string,
    description?: string,
    settings: Setting[],
};

const useChatStore = defineStore("chat", () => {
    // local storage
    const storage = JSON.parse(localStorage.getItem('chat') || '{}');

    // app status refs
    const status = ref('idle');

    // app data refs
    const contacts: Ref<Contact[] | undefined> = ref(storage.contacts); // fetched always
    const conversations: Ref<Conversation[] | undefined> = ref(storage.conversations); // not fetched but updated
    const notifications: Ref<Notification[] | undefined> = ref(storage.notifications); // not fetched but updated
    const archivedConversations: Ref<Conversation[] | undefined> = ref(storage.archivedConversations); // not fetched
    const settings: Ref<Settings[]> = ref(/*storage.settings ||*/ DefaultSettings); // not fetched

    // ui refs
    const activeSidebarComponent: Ref<string> = ref(storage.activeSidebarComponent || 'messages');
    const delayLoading: Ref<boolean> = ref(true);

    // contacts grouped alphabetically.
    const contactGroups: Ref<ContactGroup[] | undefined> = computed(() => {
        let sortedContacts = [...(contacts.value as Contact[])];

        sortedContacts.sort();

        let groups: ContactGroup[] = [];
        let currentLetter: string = '';
        let groupNames: string[] = [];

        // create an array of letter for every different sort level.
        for (let contact of sortedContacts) {
            // if the first letter is different create a new group.
            if (contact.firstName[0].toUpperCase() !== currentLetter) {
                currentLetter = contact.firstName[0].toUpperCase();
                groupNames.push(currentLetter)
            }
        }

        // create an array that groups contact names based on the first letter;
        for (let groupName of groupNames) {
            let group: ContactGroup = { letter: groupName, contacts: [] };
            for (let contact of sortedContacts) {
                if (contact.firstName[0].toUpperCase() === groupName) {
                    group.contacts.push(contact);
                }
            }
            groups.push(group);
        }

        return groups;
    });

    const getStatus = computed(() => status);

    return {
        // status refs
        status,
        getStatus,

        // data refs
        conversations,
        contacts,
        contactGroups,
        notifications,
        archivedConversations,
        settings,

        // ui refs
        activeSidebarComponent,
        delayLoading,
    };
});

export default useChatStore;