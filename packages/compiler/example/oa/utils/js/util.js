const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const isArr = (arr) => {
  return Object.prototype.toString.call(arr) == '[object Array]';
}

const Outputmoney = (number) => {
  if (isNaN(number) || number === "") return "0.00";
  number = Math.round(number * 100) / 100;
  if (number < 0)
    return '-' + outputdollars(Math.floor(Math.abs(number) - 0) + '') + outputcents(Math.abs(number) - 0);
  else
    return outputdollars(Math.floor(number - 0) + '') + outputcents(number - 0);
}

const outputdollars = (number) => {
  if (number.length <= 3)
    return (number == '' ? '0' : number);
  else {
    var mod = number.length % 3;
    var output = (mod == 0 ? '' : (number.substring(0, mod)));
    for (var i = 0; i < Math.floor(number.length / 3); i++) {
      if ((mod == 0) && (i == 0))
        output += number.substring(mod + 3 * i, mod + 3 * i + 3);
      else
        output += ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
    }
    return (output);
  }
}

const outputcents = (amount) => {
  amount = Math.round(((amount) - Math.floor(amount)) * 100);
  return (amount < 10 ? '.0' + amount : '.' + amount);
}

const contains = (arr, obj) => {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
}

const isNull = (data) => {
  if (data == null || typeof (data) == "undefined") {
    return true;
  } else {
    return false;
  }
}

const getImgSrc = (fileName) => {
  var extensions = fileName.substring(fileName.lastIndexOf('.') + 1);
  var imgsrc = "";
  extensions = extensions.toLowerCase();
  switch (extensions) {
    case "msg":
      imgsrc = "img/msg.png";
      break;
    case "pdf":
      imgsrc = "img/pdf.png";
      break;
    case "png":
    case "jpg":
    case "jpeg":
    case "jpe":
    case "tif":
    case "gif":
    case "bmp":
      imgsrc = "img/jpg.png";
      break;
    case "txt":
    case "text":
    case "conf":
    case "def":
    case "list":
    case "log":
    case "in":
      imgsrc = "img/txt.png";
      break;
    case "doc":
    case "dot":
    case "docx":
      imgsrc = "img/word.png";
      break;
    case "xls":
    case "xlm":
    case "xla":
    case "xlt":
    case "xlw":
    case "xlsx":
    case "csv":
      imgsrc = "img/excel.png";
      break;
    case "ppt":
    case "pps":
    case "pot":
    case "pptx":
      imgsrc = "img/ppt.png";
      break;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
      imgsrc = "img/zip.png";
      break;
    case "mp3":
    case "wav":
    case "wav":
    case "acc":
    case "acc":
    case "mp4":
    case "rmvb":
    case "avi":
    case "flv":
    case "flv":
    case "mkv":
    case "bmp":
      imgsrc = "img/avi.png";
      break;
    default:
      imgsrc = "img/txt.png";
      break;
  }
  return imgsrc;

}

const isNullObj = (data) => {
  if (JSON.stringify(data) === '{}') {
    return false // 如果为空,返回false
  }
  return true // 如果不为空，则会执行到这一步，返回true
}

const errFunTips = (res) => {
  console.log(res)
  // 处理错误的返回信息
  let {
      data = ''
  } = res;
  var errorMsg = data;
  var errormsg = "";
  // res是否有返回值；
  if (isNull(errorMsg)) {
    errormsg = "oa_alert_response_null";
  } else {
    // res的返回值是否是正常的数据结构类型

    if (isJSON(errorMsg)) {
      // 判断当前的错误的code 
      let {
        status = {
          status_code:''
        },
        errMsg = ''
      } = errorMsg;
      var status_code = status.status_code;
      // 如果code存在

      if (!isNull(status_code)) {
        // 存在的code的错误信息

        if (status_code == 1001) {
          errormsg = "oa_error_status_1001";
        } else if (status_code == 1002) {
          errormsg = "oa_error_status_1002";
        } else if (status_code == 1003) {
          errormsg = "oa_error_status_1003";
        } else if (status_code == 1004) {
          errormsg = "oa_error_status_1004";
        } else if (status_code == 1005) {
          errormsg = "oa_error_status_1005";
        } else if (status_code == 1006) {
          errormsg = "oa_error_status_1006";
        } else if (status_code == 1007) {
          errormsg = "oa_error_status_1007";
        } else if (status_code == 1008) {
          errormsg = "oa_error_status_1008";
        } else if (status_code == 1009) {
          errormsg = "oa_error_status_1009";
        } else if (status_code == 1010) {
          errormsg = "oa_error_status_1010";
        } else if (status_code == 1011) {
          errormsg = "oa_error_status_1011";
        } else if (status_code == 400) {
          errormsg = "oa_error_status_400";
        } else if (status_code == 406) {
          errormsg = "oa_error_status_406";
        } else if (status_code == 408) {
          errormsg = "oa_error_status_408";
        } else if (status_code == 504) {
          errormsg = "oa_error_status_504";
        } else if (status_code == 500) {
          // 当前错误信息为500的时候

         
          let {
              status = {
                message:''
              }
          } = errorMsg
          var errorMes = status.message;
          // 如果errorMes不是空的时候，抛出错误信息
          if (!isNull(errorMes) && isJSON(errorMes)) {
            var mesjson = JSON.parse(errorMes);
            errormsg = mesjson.message;
          }
        }
      }
    } else {
      // 403的code的时候
      errorMsg = errorMsg.toString();
      if (errorMsg.indexOf("HTTP Status 403") > -1) {
        errormsg = "oa_error_status_403";
      }
    }
  }
  // 如果message为空的时候
  if (errormsg == "") {
    errormsg = "oa_error_system_info";
  }
  // 提示报错信息
  alertFunc(errormsg);
}


// 网络请求的异常报错提示
const alertFunc = (msg) => {
  if (wx.getStorageSync('lang')[msg]){
    wx.showModal({
      title: wx.getStorageSync('lang')['OA_index_alert_prompt'], // 提示的title
      showCancel: false,
      content: wx.getStorageSync('lang')[msg], // 提示的报错信息
    })
  }else{
    wx.showModal({
      title: wx.getStorageSync('lang')['OA_index_alert_prompt'], // 提示的title
      showCancel: false,
      content: msg, // 提示的报错信息
    })
  }
  
}

const hasValue = (data, search, tempValue) => {
  if (data[search]) {
    return data[search]
  } else {
    null
  }
}

const isJSON = (str) => {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }

    } catch (e) {
      return false;
    }
  } else if (typeof (str) == "object" && Object.prototype.toString.call(str).toLowerCase() == "[object object]" && !str.length) {
    return true;
  }
}

const appendZero = (obj) => {
  if (obj < 10) return "0" + "" + obj;
  else return obj;
}



const isNumber = (inputData) => {
  if (parseFloat(inputData).toString() == 'NaN') {
    return false;
  } else {
    return true;
  }
}

const getMimeType = (fileType) => {
  let mimetype = "";
  let isCanDown = false;
  // 可支持的文件类型： doc docx xls xlsx ppt pptx pdf
  fileType = fileType.toLowerCase();
  switch (fileType) {

    case "doc":
      mimetype = "doc";
      isCanDown = true;
      break;
    case "docx":
      mimetype = "docx";
      isCanDown = true;
      break;
    case "xls":
      mimetype = "xls";
      isCanDown = true;
      break;
    case "xlsx":
      mimetype = "xlsx";
      isCanDown = true;
      break;
    case "ppt":
      mimetype = "ppt";
      isCanDown = true;
      break;
    case "pptx":
      mimetype = "pptx";
      isCanDown = true;
      break;
    case "pdf":
      mimetype = "pdf";
      isCanDown = true;
      break;
    case "png":
    case "jpg":
    case "jpeg":
    case "jpe":
    case "tif":
    case "gif":
      mimetype = "image";
      isCanDown = true;
      break;
    default:
      mimetype = "other";
      isCanDown = false;
      break;

  }
  return {
    mimetype,
    isCanDown
  };
}


module.exports = {
  formatTime: formatTime,
  isArr: isArr,
  Outputmoney: Outputmoney,
  outputdollars: outputdollars,
  outputcents: outputcents,
  contains: contains,
  isNull: isNull,
  getImgSrc: getImgSrc,
  isNullObj: isNullObj,
  errFunTips: errFunTips,
  alertFunc:alertFunc,
  hasValue: hasValue,
  isJSON: isJSON,
  appendZero: appendZero,
  isNumber: isNumber,
  getMimeType: getMimeType
}