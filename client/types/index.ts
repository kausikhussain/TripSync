export interface Member {
    memberId: string;
    name: string;
    role: 'admin' | 'member';
    joinedAt?: string;
}

export interface Item {
    itemId: string;
    itemName: string;
    category: string;
    checked: boolean;
    addedBy: string; // member name or ID
    assignedTo: string | null;
    checkedBy: string | null;
    createdAt?: string;
}

export interface Trip {
    tripId: string;
    tripName: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    members: Member[];
    items: Item[];
}
