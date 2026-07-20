// Alarm timestamps come back as ISO strings from the API; the dashboard
// displays them as "DD-MM-YYYY HH:mm:ss" (matching the Howen VSS export
// format) and the date filter needs the same day compared in local time.
function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatAlarmDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function toDateInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
