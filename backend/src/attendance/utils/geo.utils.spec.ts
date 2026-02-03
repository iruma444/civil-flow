import { calculateDistance, isWithinRadius, getLocationValidationDetails } from './geo.utils';

describe('GeoUtils', () => {
    describe('calculateDistance', () => {
        it('should return 0 for same coordinates', () => {
            const distance = calculateDistance(35.6812, 139.7671, 35.6812, 139.7671);
            expect(distance).toBe(0);
        });

        it('should calculate distance between Tokyo Station and Shibuya Station', () => {
            // Tokyo Station: 35.6812, 139.7671
            // Shibuya Station: 35.6580, 139.7016
            const distance = calculateDistance(35.6812, 139.7671, 35.6580, 139.7016);
            // Approximately 6.5km
            expect(distance).toBeGreaterThan(6000);
            expect(distance).toBeLessThan(7000);
        });

        it('should calculate distance for nearby points', () => {
            // 約100m離れた2点
            const distance = calculateDistance(35.6812, 139.7671, 35.6813, 139.7682);
            expect(distance).toBeGreaterThan(90);
            expect(distance).toBeLessThan(110);
        });
    });

    describe('isWithinRadius', () => {
        it('should return true when within radius', () => {
            const result = isWithinRadius(35.6812, 139.7671, 35.6812, 139.7672, 100);
            expect(result).toBe(true);
        });

        it('should return false when outside radius', () => {
            const result = isWithinRadius(35.6812, 139.7671, 35.6820, 139.7690, 100);
            expect(result).toBe(false);
        });
    });

    describe('getLocationValidationDetails', () => {
        it('should return correct details', () => {
            const details = getLocationValidationDetails(35.6812, 139.7671, 35.6812, 139.7672, 100);
            expect(details).toHaveProperty('distance');
            expect(details).toHaveProperty('radius');
            expect(details).toHaveProperty('isWithin');
            expect(details.radius).toBe(100);
        });
    });
});
