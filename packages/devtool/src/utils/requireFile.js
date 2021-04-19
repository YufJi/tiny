/**
 * 加载、读取静态资源文件
 */

export default function requireFile(url) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  const contentType = xhr.getResponseHeader('content-type');
  if (/(java|ecma)script/.test(contentType)) {
    return eval(xhr.responseText);
  } else if (/json/.test(contentType)) {
    return JSON.parse(xhr.responseText);
  }
}
