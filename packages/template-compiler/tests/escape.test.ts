import { describe, it, expect } from 'vitest';
import {
  escapeHtmlBody,
  escapeHtmlQuote,
  genLitStr,
  genLitStrWithQuotes,
  dashToCamel,
  camelToDash,
} from '../src/escape';

describe('Escape', () => {
  describe('escapeHtmlBody', () => {
    it('should escape < character', () => {
      expect(escapeHtmlBody('<')).toBe('&lt;');
    });

    it('should escape " character', () => {
      expect(escapeHtmlBody('"')).toBe('&quot;');
    });

    it('should escape & character', () => {
      expect(escapeHtmlBody('&')).toBe('&amp;');
    });

    it('should escape multiple characters', () => {
      expect(escapeHtmlBody('<div class="test">')).toBe('&lt;div class=&quot;test&quot;>');
    });

    it('should not escape other characters', () => {
      expect(escapeHtmlBody('hello world')).toBe('hello world');
    });
  });

  describe('escapeHtmlQuote', () => {
    it('should escape " character', () => {
      expect(escapeHtmlQuote('"')).toBe('&quot;');
    });

    it('should escape & character', () => {
      expect(escapeHtmlQuote('&')).toBe('&amp;');
    });

    it('should not escape < character', () => {
      expect(escapeHtmlQuote('<')).toBe('<');
    });
  });

  describe('genLitStr', () => {
    it('should generate string with double quotes', () => {
      expect(genLitStr('hello')).toBe('"hello"');
    });

    it('should escape backslash', () => {
      expect(genLitStr('a\\b')).toBe('"a\\\\b"');
    });

    it('should escape newline', () => {
      expect(genLitStr('a\nb')).toBe('"a\\nb"');
    });

    it('should escape carriage return', () => {
      expect(genLitStr('a\rb')).toBe('"a\\rb"');
    });

    it('should escape tab', () => {
      expect(genLitStr('a\tb')).toBe('"a\\tb"');
    });

    it('should escape null character', () => {
      expect(genLitStr('a\0b')).toBe('"a\\0b"');
    });

    it('should escape double quote', () => {
      expect(genLitStr('a"b')).toBe('"a\\"b"');
    });
  });

  describe('genLitStrWithQuotes', () => {
    it('should use single quote when specified', () => {
      expect(genLitStrWithQuotes('hello', true)).toBe("'hello'");
    });

    it('should escape single quote when using single quotes', () => {
      expect(genLitStrWithQuotes("a'b", true)).toBe("'a\\'b'");
    });
  });

  describe('dashToCamel', () => {
    it('should convert dash-case to camelCase', () => {
      expect(dashToCamel('hello-world')).toBe('helloWorld');
    });

    it('should handle multiple dashes', () => {
      expect(dashToCamel('hello-world-test')).toBe('helloWorldTest');
    });

    it('should handle leading dash', () => {
      expect(dashToCamel('-hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(dashToCamel('')).toBe('');
    });

    it('should handle string without dashes', () => {
      expect(dashToCamel('hello')).toBe('hello');
    });
  });

  describe('camelToDash', () => {
    it('should convert camelCase to dash-case', () => {
      expect(camelToDash('helloWorld')).toBe('hello-world');
    });

    it('should handle multiple uppercase letters', () => {
      expect(camelToDash('helloWorldTest')).toBe('hello-world-test');
    });

    it('should handle leading uppercase letter', () => {
      expect(camelToDash('HelloWorld')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(camelToDash('')).toBe('');
    });

    it('should handle string without uppercase', () => {
      expect(camelToDash('hello')).toBe('hello');
    });
  });
});
