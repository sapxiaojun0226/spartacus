import { isNotNullable, isNotUndefined } from './type-guards';

describe('Type guards', () => {
  describe('isNotUndefined', () => {
    it('should return false for "undefined" value', () => {
      expect(isNotUndefined(undefined)).toBeFalsy();
    });

    it('should return true for "null" value', () => {
      expect(isNotUndefined(null)).toBeTruthy();
    });

    it('should return true for falsy string', () => {
      expect(isNotUndefined('')).toBeTruthy();
    });

    it('should return true for falsy number', () => {
      expect(isNotUndefined(0)).toBeTruthy();
    });

    it('should return true for objects', () => {
      expect(isNotUndefined({ property: 'value' })).toBeTruthy();
    });

    it('should return true for false value', () => {
      expect(isNotUndefined(false)).toBeTruthy();
    });
  });

  describe('isNotNullable', () => {
    it('should return false for "undefined" value', () => {
      expect(isNotNullable(undefined)).toBeFalsy();
    });

    it('should return false for "null" value', () => {
      expect(isNotNullable(null)).toBeFalsy();
    });

    it('should return true for falsy string', () => {
      expect(isNotNullable('')).toBeTruthy();
    });

    it('should return true for falsy number', () => {
      expect(isNotNullable(0)).toBeTruthy();
    });

    it('should return true for objects', () => {
      expect(isNotNullable({ property: 'value' })).toBeTruthy();
    });

    it('should return true for false value', () => {
      expect(isNotNullable(false)).toBeTruthy();
    });
  });
});
