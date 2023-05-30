export interface Deltas {
    archives: Delta;
    additions: Delta;
    updates: Delta;
}

export interface Delta {
    count: number;
    users: any;
    removeUserTags?: any;
    subscribeMembers?: any;
    changes: Changes[];
}

export interface Changes {
    action: string;
    emailAddr: string;
    changes?: Change[];
}

export interface Change {
    key: string;
    oldValue: any;
    newValue: any;
}
