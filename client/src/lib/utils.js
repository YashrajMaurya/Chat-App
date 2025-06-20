export function formatMessageTime(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        // Extract hours and minutes with leading zeros
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${hours}:${minutes}`;
    } catch (err) {
        return "Invalid Date";
    }
}

