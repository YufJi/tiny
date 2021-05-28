const $_documentContainer$1 = document.createElement('div');
$_documentContainer$1.setAttribute('style', 'display: none;');
$_documentContainer$1.innerHTML = '<dom-module id="tt-icon-style">\n  <template>\n    <style>\n      :host {\n        display: inline-block;\n        font-size: 0;\n      }\n\n      :host([hidden]) {\n        display: none;\n      }\n\n      #icon {\n        font: normal normal normal 14px/1 "ttui";\n      }\n\n      #icon[class^="tt-icon-"]:before,\n      #icon[class*=" tt-icon-"]:before {\n        margin: 0;\n        box-sizing: border-box;\n      }\n\n      .tt-icon-success { color: #F95959; }\n      .tt-icon-success:before { content: "\\e613"; }\n      .tt-icon-success_no_circle { color: #F95959;}\n      .tt-icon-success_no_circle:before { content: "\\e610";}\n      .tt-icon-info { color: #CACACA; }\n      .tt-icon-info:before { content: "\\e60d"; }\n      .tt-icon-warn { color: #F5A623;}\n      .tt-icon-warn:before { content: "\\e614";}\n      .tt-icon-waiting { color: #50ABF9;}\n      .tt-icon-waiting:before { content: "\\e612";}\n      .tt-icon-clear { color: #F95959;}\n      .tt-icon-clear:before { content: "\\e615";}\n      .tt-icon-cancel { color: #222222;}\n      .tt-icon-cancel:before { content: "\\e611";}\n      .tt-icon-download { color: #222222;}\n      .tt-icon-download:before { content: "\\e60f";}\n      .tt-icon-search { color: #222222;}\n      .tt-icon-search:before { content: "\\e60e";}\n    </style>\n  </template>\n</dom-module>';
document.head.appendChild($_documentContainer$1);

function _templateObject$3() {
  const data = _taggedTemplateLiteralLoose(['<style include="tt-icon-style"></style><i id="icon" class$="tt-icon-[[ type ]]" style$="color: [[ color ]]; font-size: [[ size ]]px"></i>'], ['<style include="tt-icon-style"></style><i id="icon" class\\$="tt-icon-[[ type ]]" style\\$="color: [[ color ]]; font-size: [[ size ]]px"></i>']);

  _templateObject$3 = function _templateObject() {
    return data;
  };

  return data;
}

const Icon = /* #__PURE__ */(function (_Base) {
  _inheritsLoose(Icon, _Base);

  function Icon() {
    return _Base.apply(this, arguments) || this;
  }

  _createClass(Icon, null, [{
    key: 'template',
    get: function get() {
      return html$1(_templateObject$3());
    },
  }, {
    key: 'is',
    get: function get() {
      return 'tt-icon';
    },
  }, {
    key: 'properties',
    get: function get() {
      return {
        type: {
          type: String,
        },
        color: {
          type: String,
        },
        size: {
          type: Number,
          value: 24,
        },
      };
    },
  }]);

  return Icon;
})(Base(PolymerElement));

window.customElements.define(Icon.is, Icon);
