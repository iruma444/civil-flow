/**
 * GPS位置情報ユーティリティ
 * 2点間の距離計算（Haversine公式）
 */

// 地球の半径（メートル）
const EARTH_RADIUS_METERS = 6371000;

/**
 * 度をラジアンに変換
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine公式を使用して2点間の距離を計算
 * @param lat1 地点1の緯度
 * @param lng1 地点1の経度
 * @param lat2 地点2の緯度
 * @param lng2 地点2の経度
 * @returns 2点間の距離（メートル）
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * 指定した位置が現場の有効範囲内にあるかチェック
 * @param userLat ユーザーの緯度
 * @param userLng ユーザーの経度
 * @param siteLat 現場の緯度
 * @param siteLng 現場の経度
 * @param radiusMeters 有効範囲（メートル）
 * @returns 範囲内の場合true
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  siteLat: number,
  siteLng: number,
  radiusMeters: number,
): boolean {
  const distance = calculateDistance(userLat, userLng, siteLat, siteLng);
  return distance <= radiusMeters;
}

/**
 * デバッグ用：距離と範囲内かどうかの詳細情報を返す
 */
export function getLocationValidationDetails(
  userLat: number,
  userLng: number,
  siteLat: number,
  siteLng: number,
  radiusMeters: number,
): { distance: number; radius: number; isWithin: boolean } {
  const distance = calculateDistance(userLat, userLng, siteLat, siteLng);
  return {
    distance: Math.round(distance),
    radius: radiusMeters,
    isWithin: distance <= radiusMeters,
  };
}
