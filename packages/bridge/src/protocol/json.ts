import { ProtocolError } from './errors';

export function assertJsonSafe(value: unknown, path = 'payload'): void {
  if (value === null) return;
  assertValue(value, path, new WeakSet());
}

function assertValue(value: unknown, path: string, visited: WeakSet<object>): void {
  if (value === null) return;

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'boolean') return;
  if (valueType === 'number') {
    if (!Number.isFinite(value)) {
      throw new ProtocolError('INVALID_PAYLOAD', `${path} contains a non-finite number`);
    }
    return;
  }
  if (valueType === 'undefined' || valueType === 'function' || valueType === 'bigint' || valueType === 'symbol') {
    throw new ProtocolError('INVALID_PAYLOAD', `${path} contains an unsupported ${valueType} value`);
  }

  if (Array.isArray(value)) {
    if (visited.has(value)) {
      throw new ProtocolError('INVALID_PAYLOAD', `${path} contains a circular reference`);
    }
    visited.add(value);
    value.forEach((item, index) => {
      assertValue(item, `${path}[${index}]`, visited);
    });
    return;
  }

  if (value instanceof Date || value instanceof Map || value instanceof Set) {
    throw new ProtocolError('INVALID_PAYLOAD', `${path} contains an unsupported ${value.constructor.name}`);
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new ProtocolError('INVALID_PAYLOAD', `${path} is not a plain object`);
  }

  const objectValue = value as object;
  if (visited.has(objectValue)) {
    throw new ProtocolError('INVALID_PAYLOAD', `${path} contains a circular reference`);
  }
  visited.add(objectValue);
  const record = value as Record<string, unknown>;
  for (const [key, item] of Object.entries(record)) {
    assertValue(item, `${path}.${key}`, visited);
  }
}
