export function getDeviceLocation() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const segments = timeZone.split("/");
  const city = (segments[segments.length - 1] || timeZone).replace(/_/g, " ");
  const region = segments.length > 1 ? segments[0].replace(/_/g, " ") : "";
  return { city, region, timeZone };
}
