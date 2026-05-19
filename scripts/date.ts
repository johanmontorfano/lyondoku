export function getDateTZ(from?: string) {
    if (from)
        return new Date(new Date(from).toLocaleString("en-US", {
            timeZone: "Europe/Paris"
        }));
    return new Date(new Date().toLocaleString("en-US", {
        timeZone: "Europe/Paris"
    }));
}

export function isToday(date: Date) {
    const today = getDateTZ();

    return (
        date.getDate() === today.getDate() &&   
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

export function getToday() {
    const date = getDateTZ();

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = (date.getDate()).toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getDateRange(a: string, b: string = getToday()) {
    const out = [];

    const cursor = getDateTZ(a);
    const to = getDateTZ(b);

    cursor.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    while (cursor <= to) {
        const year = cursor.getFullYear();
        const month = String(cursor.getMonth() + 1).padStart(2, "0");
        const day = String(cursor.getDate()).padStart(2, "0");

        out.push(`${year}-${month}-${day}`);
        cursor.setDate(cursor.getDate() + 1);
    }
    return out;
}
