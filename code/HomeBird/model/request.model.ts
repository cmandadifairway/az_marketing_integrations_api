export class LocationInput {
    city: string;
    state: string;
}

// Nullable properties are optional with Homebird
export class CheckUserInput {
    email: string;
    create_user: boolean = true;
    first_name: string = null;
    last_name: string = null;
}

// Nullable properties are optional with Homebird
export class SendLeadInput {
    loID: string;
    first_name: string;
    last_name: string;
    email: string;
    external_id?: string = null;
    mobile_phone?: string = null;
    work_phone?: string = null;
    home_phone?: string = null;
    purchase_price?: string = null;
    zip?: string = null;
    locations?: [LocationInput] = null;
    notes?: string = null;
}
