export default function formatDate(date) {
  const now = new Date();
  const timeDiff = now - date;

  if (timeDiff < 24 * 60 * 60 * 1000) {
    // Less than 1 day
    // Display time only
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } else {
    // Display full date and time
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleDateString(undefined, options);
  }
}
