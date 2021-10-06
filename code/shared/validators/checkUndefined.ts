export function checkProperties(obj) {
    try {
        for (const key in obj) {
            if (obj[key] === undefined) return false;
        }
        return true;
    } catch (error) {
        console.log("Error found while checkin for the incoming request", error);
    }
}
