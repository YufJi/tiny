const WHITE_SPACE_RE = /[\s\n\r\t\f]/;
const VAR_CHAR_RE = /[_a-zA-Z0-9$]/;
const VAR_HEAD_CHAR_RE = /[_a-zA-Z$]/;
const DIGIT_RE = /[0-9]/;

class PathsParser {
  public expression: string;

  public cur: number;

  public errMsg: string;

  constructor() {
    this.expression = '';
    this.cur = 0;
    this.errMsg = '';
  }

  parse(value) {
    this.cur = 0;
    this.expression = value;

    if (this.expression.length === 0) {
      this.errMsg = 'the path string should not be empty';
    }

    try {
      return this.multiPaths();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  multiPaths() {
    return [this.singlePath()].concat(this.multiPaths2());
  }

  multiPaths2() {
    if (this.curToken() === ',') {
      this.next();

      return [this.singlePath()].concat(this.multiPaths2());
    } else {
      return [];
    }
  }

  singlePath() {
    return [this.varName()].concat(this.singlePath2());
  }

  singlePath2() {
    const token = this.curToken();
    switch (token) {
      case '.':
        this.next();

        return [this.varName()].concat(this.singlePath2());

      case '[':
        this.next();

        const index = this.int();

        if (this.curToken() === ']') {
          this.next();

          return [index].concat(this.singlePath2());
        }

        this.emitError('"[" should be paired with "]" and only digits (0-9) can be put inside [] in the path string');
        return [];

      default:
        if (WHITE_SPACE_RE.test(token) || token === '*' || VAR_HEAD_CHAR_RE.test(token)) {
          return [this.varName()].concat(this.singlePath2());
        }

        if (token && token !== ',') {
          this.emitError('maybe "," or "." is needed');
        }
    }

    return [];
  }

  varName() {
    let name = '';
    const token = this.curToken();

    if (WHITE_SPACE_RE.test(token)) {
      this.next();
      name = this.varName();
    } else if (token === '*') {
      this.next();

      if (this.curToken() !== '*') {
        this.emitError('maybe you want **, but got *');
        return '';
      }

      this.next();

      name = '**';

      const token2 = this.curToken();

      if (token2 === '.') {
        console.warn(
          `"**" can only be used at the end of a path descriptor: ${
            this.expression}`,
        );
      } else if (token2 && token2 !== ',' && !WHITE_SPACE_RE.test(token2)) {
        this.emitError('the length of continuous "*" should be 2');
      }
    } else {
      if (!VAR_HEAD_CHAR_RE.test(token)) {
        this.emitError(
          'the first letter of (sub)path string should match /[_a-zA-Z$]/',
        );
        return '';
      }

      this.next();
      name = token + this.varNameAfter();
    }

    this.skipWhiteSpace();

    return name;
  }

  varNameAfter() {
    const token = this.curToken();

    if (VAR_CHAR_RE.test(token)) {
      this.next();

      return token + this.varNameAfter();
    } else {
      if (token === ']') {
        this.emitError('"]" should be paired with "["');
      } else if (token && ['.', '[', ','].every((char) => token !== char) && !WHITE_SPACE_RE.test(token)) {
        this.emitError('the non-first letter of (sub)path string should match /[_a-zA-Z0-9$]/');
      }

      return '';
    }
  }

  int() {
    let index = -1;
    const token = this.curToken();

    if (WHITE_SPACE_RE.test(token)) {
      this.next();
      index = this.int();
    } else if (DIGIT_RE.test(token)) {
      this.next();
      index = parseInt(token + this.intAfter(), 10);
    } else if (token === ']') {
      this.emitError('there should be digits (0-9) inside [] in the path string');
    } else if (token) {
      this.emitError('only digits (0-9) can be put inside [] in the path string');
    } else {
      this.emitError('"[" should be paired with "]"');
    }

    this.skipWhiteSpace();

    return index;
  }

  intAfter() {
    const token = this.curToken();

    if (DIGIT_RE.test(token)) {
      this.next();

      return token + this.intAfter();
    } else {
      return '';
    }
  }

  curToken() {
    return this.cur < this.expression.length
      ? this.expression[this.cur]
      : '';
  }

  next() {
    this.cur++;
  }

  skipWhiteSpace() {
    if (WHITE_SPACE_RE.test(this.curToken())) {
      this.next();
      this.skipWhiteSpace();
    }
  }

  emitError(msg) {
    throw new Error(`parsing observers failed at character position ${this.cur} of "${this.expression}": ${msg}`);
  }
}

export const pathsParser = new PathsParser();
