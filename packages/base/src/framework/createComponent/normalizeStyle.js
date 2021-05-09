import Platform from '../Platform';
import transformStyle from '../utils/transformStyle';
import normalizeClassNameStyle from './normalizeClassNameStyle';

function parseStyle(style) {
  const styles = {};
  if (style) {
    style.split(';').filter((s) => {
      return !!s.trim();
    }).forEach((rule) => {
      const nameIndex = rule.indexOf(':');
      let name;
      let value;
      if (nameIndex !== -1) {
        name = rule.slice(0, nameIndex).trim();
        value = rule.slice(nameIndex + 1).trim();
        styles[name] = value;
      }
    });
  }
  return styles;
}
export default function normalizeStyle(component, cProps) {
  let totalStyle = [];
  const { tagName } = component.$mp;
  const { style, className, id } = cProps || component.props;

  totalStyle = normalizeClassNameStyle(totalStyle, component, tagName, className, id);
  // inline
  if (style) {
    let styleObj = style;
    if (typeof styleObj === 'string') {
      styleObj = parseStyle(styleObj.trim());
    }
    totalStyle.push(transformStyle(styleObj));
  }
  if (Platform.OS === 'web') {
    if (totalStyle.length) {
      totalStyle = Object.assign.apply(undefined, [{}].concat(totalStyle));
    } else {
      totalStyle = undefined;
    }
  } else if (!totalStyle.length) {
    totalStyle = undefined;
  }
  return totalStyle;
}
