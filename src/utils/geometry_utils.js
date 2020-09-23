export function slope(y, x) {
  let angle = Math.atan2(y, x) * 57.2958;
  return 180 + angle;
}
