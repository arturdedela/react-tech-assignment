export function getBearing([prevLng, prevLat]: number[], [lng, lat]: number[]) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(prevLat);
  const φ2 = toRad(lat);
  const Δλ = toRad(lng - prevLng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const bearing = toDeg(Math.atan2(y, x));

  return (bearing + 360) % 360;
}
