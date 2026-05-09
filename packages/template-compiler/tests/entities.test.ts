import { describe, it, expect } from 'vitest';
import { decodeEntity, decodeHtmlEntities } from '../src/entities';

describe('Entities', () => {
  describe('decodeEntity', () => {
    it('should decode &amp;', () => {
      expect(decodeEntity('&amp;')).toBe('&');
    });

    it('should decode &lt;', () => {
      expect(decodeEntity('&lt;')).toBe('<');
    });

    it('should decode &gt;', () => {
      expect(decodeEntity('&gt;')).toBe('>');
    });

    it('should decode &quot;', () => {
      expect(decodeEntity('&quot;')).toBe('"');
    });

    it('should decode numeric entity decimal', () => {
      expect(decodeEntity('&#65;')).toBe('A');
    });

    it('should decode numeric entity hex', () => {
      expect(decodeEntity('&#x41;')).toBe('A');
    });

    it('should decode lowercase hex entity', () => {
      expect(decodeEntity('&#x61;')).toBe('a');
    });

    it('should return undefined for invalid entity', () => {
      expect(decodeEntity('&invalid')).toBeUndefined();
    });

    it('should return undefined for unknown entity', () => {
      expect(decodeEntity('&unknown;')).toBeUndefined();
    });

    it('should return undefined for invalid numeric entity', () => {
      expect(decodeEntity('&#xZZZ;')).toBeUndefined();
    });

    // Glass-easel compatibility test cases
    describe('glass-easel compatibility', () => {
      it('should decode &#x41; to A', () => {
        expect(decodeEntity('&#x41;')).toBe('A');
      });

      it('should decode &#97; to a', () => {
        expect(decodeEntity('&#97;')).toBe('a');
      });

      it('should return undefined for &#xG; (invalid hex)', () => {
        expect(decodeEntity('&#xG;')).toBeUndefined();
      });

      it('should return undefined for &#x (incomplete hex)', () => {
        expect(decodeEntity('&#x;')).toBeUndefined();
      });

      it('should return undefined for &#A; (invalid decimal)', () => {
        expect(decodeEntity('&#A;')).toBeUndefined();
      });

      it('should return undefined for &# (incomplete decimal)', () => {
        expect(decodeEntity('&#;')).toBeUndefined();
      });

      it('should return undefined for &lt (missing semicolon)', () => {
        expect(decodeEntity('&lt')).toBeUndefined();
      });

      it('should decode &lt; to <', () => {
        expect(decodeEntity('&lt;')).toBe('<');
      });

      it('should decode &gt; to >', () => {
        expect(decodeEntity('&gt;')).toBe('>');
      });

      it('should decode &nbsp; to non-breaking space', () => {
        expect(decodeEntity('&nbsp;')).toBe('\u00A0');
      });

      it('should decode &#x85; to control character', () => {
        expect(decodeEntity('&#x85;')).toBe('\u0085');
      });

      it('should decode &#x2028; to line separator', () => {
        expect(decodeEntity('&#x2028;')).toBe('\u2028');
      });
    });
  });

  describe('decodeHtmlEntities', () => {
    it('should decode entities in HTML string', () => {
      expect(decodeHtmlEntities('&lt;div&gt;')).toBe('<div>');
    });

    it('should decode multiple entities', () => {
      expect(decodeHtmlEntities('&lt;div class=&quot;test&quot;&gt;')).toBe('<div class="test">');
    });

    it('should leave text without entities unchanged', () => {
      expect(decodeHtmlEntities('hello world')).toBe('hello world');
    });

    it('should handle mixed content', () => {
      expect(decodeHtmlEntities('Price: &euro;100')).toBe('Price: €100');
    });

    // Glass-easel compatibility test cases
    describe('glass-easel compatibility', () => {
      it('should handle incomplete entities as text', () => {
        // In glass-easel, incomplete entities are preserved as text with & escaped
        expect(decodeHtmlEntities('&lt')).toBe('&lt');
        expect(decodeHtmlEntities('&lt ')).toBe('&lt ');
      });

      it('should decode &nbsp; to non-breaking space', () => {
        expect(decodeHtmlEntities('&nbsp;')).toBe('\u00A0');
      });

      it('should decode entities in tag content', () => {
        expect(decodeHtmlEntities('<div>&lt;test&gt;</div>')).toBe('<div><test></div>');
      });

      it('should handle control characters', () => {
        expect(decodeHtmlEntities('<div>&#x85;</div>')).toBe('<div>\u0085</div>');
        expect(decodeHtmlEntities('<div> &#x2028; </div>')).toBe('<div> \u2028 </div>');
      });

      it('should handle standalone ampersand', () => {
        expect(decodeHtmlEntities('&')).toBe('&');
      });

      it('should decode &amp; to &', () => {
        expect(decodeHtmlEntities('&amp;')).toBe('&');
      });
    });
  });
});
