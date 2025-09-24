// src/utils/validation.mjs

import { z } from 'zod';

// Schema for raw CSV row validation
export const csvRowSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name too long'),
  image: z.string().trim().optional().default(''),
  link: z.string().trim().optional().default(''),
  age: z.string().trim().optional().default(''),
  sex: z.string().trim().optional().default(''),
  breed: z.string().trim().optional().default(''),
  town: z.string().trim().optional().default(''),
  postcode: z.string().trim().optional().default(''),
  charity: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  date: z.string().trim().optional().default('')
});

// Schema for processed dog record
export const dogRecordSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  link: z.string().url('Invalid link URL').optional().or(z.literal('')),
  age: z.string().max(50, 'Age field too long'),
  sex: z.enum(['Male', 'Female', 'Unknown'], { errorMap: () => ({ message: 'Sex must be Male, Female, or Unknown' }) }),
  breed: z.string().max(100, 'Breed field too long'),
  location: z.string().max(100, 'Location field too long'),
  county: z.string().max(100, 'County field too long'),
  region: z.string().max(100, 'Region field too long'),
  charity: z.string().max(200, 'Charity field too long'),
  description: z.string().max(5000, 'Description too long'),
  scrapedDate: z.date().nullable(),
  ageCategory: z.string().max(50, 'Age category field too long'),
  lastSeen: z.date()
});

// Sanitize functions
export function sanitizeString(input) {
  if (typeof input !== 'string') return '';

  // Remove control characters and normalize whitespace
  let sanitized = input
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Remove potentially dangerous characters for SQL injection (belt and suspenders)
  sanitized = sanitized.replace(/[<>'"&]/g, (match) => {
    const entities = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;', '&': '&amp;' };
    return entities[match] || match;
  });

  return sanitized;
}

export function sanitizeUrl(input) {
  if (!input || typeof input !== 'string') return '';

  const sanitized = sanitizeString(input);

  // Basic URL validation
  try {
    const url = new URL(sanitized);
    // Only allow HTTP(S) protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

export function sanitizePostcode(input) {
  if (!input || typeof input !== 'string') return '';

  // UK postcode pattern: Allow letters, numbers, and spaces only
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateAndSanitizeCsvRow(rawRow) {
  const errors = [];

  try {
    // First sanitize all string fields
    const sanitized = {
      name: sanitizeString(rawRow.name || ''),
      image: sanitizeString(rawRow.image || ''),
      link: sanitizeUrl(rawRow.link || ''),
      age: sanitizeString(rawRow.age || ''),
      sex: sanitizeString(rawRow.sex || ''),
      breed: sanitizeString(rawRow.breed || ''),
      town: sanitizeString(rawRow.town || ''),
      postcode: sanitizePostcode(rawRow.postcode || ''),
      charity: sanitizeString(rawRow.charity || ''),
      description: sanitizeString(rawRow.description || ''),
      date: sanitizeString(rawRow.date || '')
    };

    // Then validate with schema
    const validated = csvRowSchema.parse(sanitized);

    return {
      success: true,
      data: validated,
      errors: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.input
      }));
      return {
        success: false,
        data: null,
        errors: validationErrors
      };
    }

    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: error.message || 'Validation failed' }]
    };
  }
}

export function validateDogRecord(record) {
  try {
    const validated = dogRecordSchema.parse(record);
    return {
      success: true,
      data: validated,
      errors: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.input
      }));
      return {
        success: false,
        data: null,
        errors: validationErrors
      };
    }

    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: error.message || 'Validation failed' }]
    };
  }
}