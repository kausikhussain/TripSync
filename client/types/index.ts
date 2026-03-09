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
    addedBy: string;
    checked: boolean;
    checkedBy: string | null;
    assignedTo: string | null;
}

export interface Expense {
    expenseId: string;
    description: string;
    amount: number;
    paidBy: string; // memberId
    date: string;
}

export interface Activity {
    activityId: string;
    text: string;
    timestamp: string;
}

export interface Trip {
    _id: string;
    tripId: string;
    tripName: string;
    startDate: string;
    endDate: string;
    creatorId: string;
    members: Member[];
    items: Item[];
    expenses: Expense[];
    activities: Activity[];
}
