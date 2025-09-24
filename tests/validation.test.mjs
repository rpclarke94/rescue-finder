// tests/validation.test.mjs

import {
  sanitizeString,
  sanitizeUrl,
  sanitizePostcode,
  validateAndSanitizeCsvRow,
  validateDogRecord
} from '../src/utils/validation.mjs';

describe('Validation Utils', () => {
  describe('sanitizeString', () => {
    test('removes control characters', () => {
      expect(sanitizeString('Hello\x00World')).toBe('HelloWorld');
      expect(sanitizeString('Test\x1FString')).toBe('TestString');
    });

    test('normalizes whitespace', () => {
      expect(sanitizeString('  Hello   World  ')).toBe('Hello World');
      expect(sanitizeString('Multiple\n\nNewlines')).toBe('Multiple Newlines');
    });

    test('escapes dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(sanitizeString("O'Reilly & Associates")).toBe('O&#39;Reilly &amp; Associates');
    });

    test('handles non-string inputs', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    test('validates and returns valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://test.org/path')).toBe('http://test.org/path');
    });

    test('rejects invalid protocols', () => {
      expect(sanitizeUrl('ftp://example.com')).toBe('');
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    test('handles malformed URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('');
      expect(sanitizeUrl('http://')).toBe('');
    });

    test('handles empty inputs', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null)).toBe('');
    });
  });

  describe('sanitizePostcode', () => {
    test('formats UK postcodes correctly', () => {
      expect(sanitizePostcode('SW1A 1AA')).toBe('SW1A 1AA');
      expect(sanitizePostcode('m1 1aa')).toBe('M1 1AA');
      expect(sanitizePostcode('B33-8TH')).toBe('B33 8TH');
    });

    test('removes invalid characters', () => {
      expect(sanitizePostcode('SW1A$1AA')).toBe('SW1A 1AA');
      expect(sanitizePostcode('M1@1AA!')).toBe('M1 1AA');
    });

    test('handles empty inputs', () => {
      expect(sanitizePostcode('')).toBe('');
      expect(sanitizePostcode(null)).toBe('');
    });
  });

  describe('validateAndSanitizeCsvRow', () => {
    test('validates and sanitizes valid row', () => {
      const rawRow = {
        name: '  Buddy  ',
        image: 'https://example.com/image.jpg',
        link: 'https://example.com/dog/1',
        age: '2 years',
        sex: 'Male',
        breed: 'Labrador',
        town: 'London',
        postcode: 'SW1A 1AA',
        charity: 'Test Charity',
        description: 'A lovely dog',
        date: '2024-01-01'
      };

      const result = validateAndSanitizeCsvRow(rawRow);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Buddy');
      expect(result.data.postcode).toBe('SW1A 1AA');
      expect(result.errors).toHaveLength(0);
    });

    test('rejects row with empty name', () => {
      const rawRow = {
        name: '',
        charity: 'Test Charity'
      };

      const result = validateAndSanitizeCsvRow(rawRow);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'name')).toBe(true);
    });

    test('handles missing fields gracefully', () => {
      const rawRow = {
        name: 'Buddy'
      };

      const result = validateAndSanitizeCsvRow(rawRow);
      expect(result.success).toBe(true);
      expect(result.data.image).toBe('');
      expect(result.data.description).toBe('');
    });
  });

  describe('validateDogRecord', () => {
    test('validates complete dog record', () => {
      const record = {
        externalId: 'abc123',
        name: 'Buddy',
        imageUrl: 'https://example.com/image.jpg',
        link: 'https://example.com/dog/1',
        age: '2 years',
        sex: 'Male',
        breed: 'Labrador',
        location: 'London',
        county: 'Greater London',
        region: 'London',
        charity: 'Test Charity',
        description: 'A lovely dog',
        scrapedDate: new Date(),
        ageCategory: '1 - 3 years',
        lastSeen: new Date()
      };

      const result = validateDogRecord(record);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('rejects invalid sex values', () => {
      const record = {
        externalId: 'abc123',
        name: 'Buddy',
        imageUrl: '',
        link: '',
        age: '2 years',
        sex: 'InvalidSex',
        breed: 'Labrador',
        location: 'London',
        county: 'Greater London',
        region: 'London',
        charity: 'Test Charity',
        description: 'A lovely dog',
        scrapedDate: null,
        ageCategory: '1 - 3 years',
        lastSeen: new Date()
      };

      const result = validateDogRecord(record);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'sex')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      const record = {
        externalId: 'abc123',
        name: 'Buddy',
        imageUrl: 'not-a-url',
        link: '',
        age: '2 years',
        sex: 'Male',
        breed: 'Labrador',
        location: 'London',
        county: 'Greater London',
        region: 'London',
        charity: 'Test Charity',
        description: 'A lovely dog',
        scrapedDate: null,
        ageCategory: '1 - 3 years',
        lastSeen: new Date()
      };

      const result = validateDogRecord(record);
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.field === 'imageUrl')).toBe(true);
    });
  });
});