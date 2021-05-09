import objectKeys from './objectKeys';

/**
 * 拆分类型键名里真正的 key 和对应的 type
 * @method _separateTypeKey
 * @param  {String}         key 带类型标识的键名
 * @return {Object}             返回键名和类型标识两个字段，
 *                              如{k: 'content', t: '%s'}
 */
function _separateTypeKey(key) {
  const matches = (key || '').match(/(\w+)(%\w)$/i);
  const tk = {
    k: key,
  };
  if (matches) {
    tk.k = matches[1];
    tk.t = matches[2];
  }
  return tk;
}
/**
 * 超级字符串转换
 */
function __superToString(content) {
  let str = content;
  if (typeof content === 'object') {
    str = JSON.stringify(content);
  } else {
    str = `${content}`;
  }
  return str;
}
/**
 * 16进制颜色转成10进制数字
 * @method __h2dColor
 * @param  {String}   hex 16进制颜色字符串
 * @return {Number}       10进制数字
 */
function __h2dColor(hex) {
  let dec = `${hex}`;
  // 如果加了#号，去掉
  if (dec.indexOf('#') === 0) {
    dec = dec.substr(1);
  }
  // 如果是3位简写，补全成6位
  if (dec.length === 3) {
    dec = dec.replace(/(.)/g, '$1$1');
  }
  dec = parseInt(dec, 16);
  if (isNaN(dec)) {
    console.error(`${hex} is invalid hex color.`);
  }
  return dec;
}
/**
 * 移除 base64 数据头，native 接口不需要传入头部
 * @method __removeBase64Head
 * @param  {String}           base64 有头数据
 * @return {String}                  无头数据
 */
function __removeBase64Head(base64) {
  if (typeof base64 === 'string') {
    base64 = base64.replace(/^data:(\/|\w|\-|\.)+;base64,/i, '');
  }
  return base64;
}
/**
 * 把值转换成相应类型
 * @method toType
 * @param  {String} type  类型标识，目前支持
 *                        %s(字符串)
 *                        %c(16转10进制颜色)
 *                        %h(10转16进制颜色)
 *                        %b(移除 base64 数据格式头)
 *                        %a{mimeType}(添加 base64 数据头)
 *                        %d(整数)
 *                        %f(浮点数)
 * @param  {any} value 待转换值，类型未知
 * @return {any}       转换好的相应类型的
 */
export function toType(type, value) {
  if (type === '%s') {
    value = __superToString(value);
  } else if (type === '%c') {
    value = __h2dColor(value);
  } else if (type === '%b') {
    value = __removeBase64Head(value);
  } else if (type === '%d') {
    value = parseInt(value, 10);
  } else if (type === '%f') {
    value = parseFloat(value);
  }
  return value;
}
/**
 * 处理对象映射关系
 * @method _mapping
 * @param  {Object}  tObj 原始目标对象
 * @param  {Object}  map 映射关系，如{content: 'text'}，
 *                       即把 sObj.content 的值赋给 tObj.text，
 *                       并删除 tObj 的 content 属性，
 *                       所以 content 就是 sKey，text 就是 tKey。
 *                       可以把 map 对象中的冒号(:)理解成 to，
 *                       即 {content to text}。
 *                       其中 tKey 的值的最后可以加 %s 等类型标识转换成相应类型，
 *                       注意：要加到 最后赋值给 tObj 的 那个 tKey 的后面。
 *                       这么做的目的是因为：
 *                       有些接口的入参字段直接传入 非字符串 值时，接口完全无响应，
 *                       比如 JSBridge.call('alert',{message: 12345})
 *
 * @param  {Object} sObj 参照来源对象
 * @return {Object}     处理映射后的 tObj
 */
export function mapping(tObj, map, sObj) {
  let typeKey;
  sObj = sObj || {};
  objectKeys(map).forEach((sKey) => {
    let tKey = map[sKey];
    typeKey = _separateTypeKey(tKey);
    // 目标 key
    tKey = typeKey.k;
    // 映射条件，否则不赋值，避免添加 value 为 undefined 的 key
    if (tKey !== undefined && ( // 目标 key 定义过
      sKey in tObj || sKey in sObj) // 源数据至少有一个有效
        && tObj[tKey] === undefined // 目标数据空缺待赋值
    ) {
      // sKey 既可以是 sObj 的，也可以是 tObj 自己的，但sObj 优先级高于原始 tObj
      // 即 sObj[sKey]的值 会覆盖 tObj[sKey]的值
      // 并且要根据 type 占位符做相应类型转换
      tObj[tKey] = toType(typeKey.t, sObj[sKey] === undefined ? tObj[sKey] : sObj[sKey]);
      // 删除原始 tObj 中的 sKey，tKey 和 sKey 同名时不做删除
      if (tKey !== sKey) {
        delete tObj[sKey];
      }
    }
  });
  return tObj;
}
export function apCallback(params = {}, res) {
  const { complete } = params;
  const { success } = params;
  const { fail } = params;

  if (res && res.error) {
    if (fail) {
      fail(res);
    }
  } else if (success) {
    success(res);
  }
  if (complete) {
    complete(res);
  }
}
