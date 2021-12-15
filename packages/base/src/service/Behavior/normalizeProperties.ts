import { isObject } from 'lodash';
import { warn } from '../utils';

export default function normalizeProperties(properties) {
  if (!isObject(properties)) {
    throw new Error('properties is not object');
  }

  const result = {};

  const entries = Object.entries(properties);

  for (let i = 0; i < entries.length; i+=1) {
    const [key, prop] = entries[i];

    if (isPropertyType(prop)) {
      result[key] = {
        type: prop,
        value: getConstructorDefaultValue(prop),
      };
    } else if (isStandardProperty(prop)) {
      result[key] = {
        type: prop.type,
        value: prop.value || getConstructorDefaultValue(prop.type),
      };
    }
  }

  return result;
}

function isPropertyType(target) {
  const constructors = [String, Boolean, Number, Array, Object, null];
  return constructors.includes(target);
}

interface StandardProperty {
  type: any;
  value: any;
}

function isStandardProperty(target: StandardProperty) {
  if (!isObject(target)) return false;
  return isPropertyType(target.type);
}

function getConstructorDefaultValue(type) {
  switch (type) {
    case String:
      return '';

    case Number:
      return 0;

    case Boolean:
      return false;

    case Array:
      return [];

    case Object:
      return {};

    case null:
      return null;

    default:
      warn('incorrect property type');
  }
}
