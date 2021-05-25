import { PolymerElement, html } from '@polymer/polymer';
import { prefix } from '@/utils/config';
import { Base, Hover } from './mixins';

const documentContainer = document.createElement('div');
documentContainer.setAttribute('style', 'display: none;');
documentContainer.innerHTML = `<dom-module id="button-style">
  <template>
    <style>
      ::slotted(*) {
        -webkit-user-select: none;
        user-select: none;
      }

      :host {
        position: relative;
        display: block;
        margin-left: auto;
        margin-right: auto;
        padding-left: 14px;
        padding-right: 14px;
        box-sizing: border-box;
        font-size: 18px;
        text-align: center;
        text-decoration: none;
        line-height: 2.55555556;
        border-radius: 5px;
        color: rgba(0,0,0,1);
        background-color: rgba(244,245,246,1);
        border-color: rgba(216,216,216,1);
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
      }

      :host:after {
        content: " ";
        width: 200%;
        height: 200%;
        position: absolute;
        top: 0;
        left: 0;
        border: 1px solid rgba(0, 0, 0, 0.2);
        -webkit-transform: scale(0.5) translateZ(0);
        transform: scale(0.5) translateZ(0);
        -webkit-transform-origin: 0 0;
        transform-origin: 0 0;
        box-sizing: border-box;
        border-radius: 10px;
      }

      :host([type=primary]) {
        color: rgba(255,255,255,1);
        border-color: rgba(248,89,89,1);
        background-color: rgba(248,89,89,1);
      }
  
      :host([type=warn]) {
        color: #FFFFFF;
        background-color: #E64340;
      }

      host[disabled][type=default] */
      :host([disabled]:not([type])) {
        opacity: 0.6;
        background-color: rgba(244,245,246,1);
        color: rgba(0, 0, 0, 0.3);
      }

      :host([disabled][type=primary]) {
        background-color: rgba(252,192,193,1);
        color: rgba(255,255,255,0.4)
      }

      :host([disabled][type=warn]) {
        background-color: #EC8B89;
      }
      
      :host([type=primary][plain]) {
        color: rgba(248,89,89,1);
        border: 1px solid rgba(248,89,89,1);
        background-color: transparent;
      }

      :host([type=primary][plain][disabled]) {
        color: rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 0, 0, 0.2);
      }

      :host([type=primary][plain]):after {
        border-width: 0;
      }

      :host([type=default][plain]) {
        color: rgba(0,0,0,1);
        border: 1px solid rgba(0, 0, 0, 0.2);
        background-color: transparent;
      }

      :host([type=default][plain][disabled]) {
        color: rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 0, 0, 0.2);
      }


      :host([type=default][plain]):after {
        border-width: 0;
      }

      :host([plain]) {
        color: #353535;
        border: 1px solid #353535;
        background-color: transparent;
      }

      :host([plain][disabled]) {
        color: rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 0, 0, 0.2);
      }

      :host([plain]):after {
        border-width: 0;
      }
    
      :host([type=warn][plain]) {
        color: #e64340;
        border: 1px solid #e64340;
        background-color: transparent;
      }

      :host([type=warn][plain][disabled]) {
        color: rgba(0, 0, 0, 0.2);
        border-color: rgba(0, 0, 0, 0.2);
      }

      :host([type=warn][plain]):after {
        border-width: 0;
      }
    
      :host([size=mini]) {
        display: inline-block;
        line-height: 2.3;
        font-size: 14px;
        padding: 0 1.34em;
      }

      :host([loading][type=primary]) {
        color: rgba(255, 255, 255, 0.6);
        background-color: rgba(222,79,79,1);
      }
      :host([loading][type=primary][plain]) {
        color: rgba(248,89,89,1);
        background-color: transparent;
      }

      :host([loading][type=default]) {
        color: rgba(34,34,34,0.6);
        background-color: rgba(219,220,220,1);
        border-color: rgba(216,216,216,1);
      }
      
      :host([loading][type=default][plain]) {
        color: #353535;
        background-color: transparent;
      }
      
      :host([loading][type=warn]) {
        color: rgba(255, 255, 255, 0.6);
        background-color: #CE3C39;
      }

      :host([loading][type=warn][plain]) {
        color: #e64340;
        background-color: transparent;
      }
    
      @-webkit-keyframes tt-button-loading-animate {
        0% {
          -webkit-transform: rotate3d(0, 0, 1, 0deg);
          transform: rotate3d(0, 0, 1, 0deg);
        }

        100% {
          -webkit-transform: rotate3d(0, 0, 1, 360deg);
          transform: rotate3d(0, 0, 1, 360deg);
        }
      }

      @keyframes tt-button-loading-animate {
        0% {
          -webkit-transform: rotate3d(0, 0, 1, 0deg);
          transform: rotate3d(0, 0, 1, 0deg);
        }

        100% {
          -webkit-transform: rotate3d(0, 0, 1, 360deg);
          transform: rotate3d(0, 0, 1, 360deg);
        }
      }

      :host(.button-hover) {
        color: rgba(34,34,34,0.6);
        background-color: rgba(219,220,220,1);
        border-color: rgba(216,216,216,1);
      }
      
      :host(.button-hover[plain]) {
        color: rgba(53, 53, 53, 0.6);
        border-color: rgba(53, 53, 53, 0.6);
        background-color: transparent;
      }
      

      :host(.button-hover[type=primary]) {
        color: rgba(255, 255, 255, 0.6);
        background-color: rgba(222,79,79,1);
      }

      :host(.button-hover[type=primary][plain]) {
        color: rgba(248,89,89,0.6);
        border-color: rgba(248,89,89,0.6);
        background-color: transparent;
      }

      :host(.button-hover[loading][type=primary][plain]) {
        color: rgba(248,89,89,1);
      }

      :host(.button-hover[type=default][plain]) {
        color: rgba(34,34,34,0.6);
        border: 1px solid rgba(0, 0, 0, 0.1);
        background-color: transparent;
      }

      :host(.button-hover[loading][type=default][plain]) {
        color: rgba(34,34,34,1);
      }
    
      :host(.button-hover[type=warn]) {
        color: rgba(255, 255, 255, 0.6);
        background-color: #CE3C39;
      }

      :host(.button-hover[type=warn][plain]) {
        color: rgba(230, 67, 64, 0.6);
        border-color: rgba(230, 67, 64, 0.6);
        background-color: transparent;
      }
    

      #icon {
        display: none;
      }
      :host([loading]) #icon {
        display: inline-block;
        width: 18px;
        height: 18px;
        vertical-align: middle;
        -webkit-animation: tt-button-loading-animate 1s steps(12, end) infinite;
        animation: tt-button-loading-animate 1s steps(12, end) infinite;
        background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAAXNSR0IArs4c6QAABQ9JREFUWAntmF2IVVUUx+9k5ViJn1MWJpMoioMyZRYYFEVCWVFPvQmCpeiLr74HvYojKUSPPkovvYiiGNijVA8SxkRphR/5nVpO5fT7Xc46s+/cc+7HjPdeH1zwn33O3vus9TvrrLP3uVOpPLDOZqBvuu7Hx8efxsdLaDlagAbQQvQQuoKuocvoR3Sir6/vd9op25SAgZxDxLfRy2gQ6UdA24cbnDvnDPoaHQTeG2rLDNCyAdrP5HfRe8jjRoAzJo3HebRjjB9QgN+mbclaBgZ2HR43o3nI65plVDDnBGBZ5i2ZT4E+StvUmgID6pz30QfI4wAIYLoqp9BJ9Cu6iqxZzZq2ngfRq+hF9CjSzyNZ67H6HO0DfJy21JxYasDq/CNkdjXnmyntJvoS+SK19Ejx9zjz30L6XIQCNvwepm8X/v6mLbRS4CyzH3NVwMYj/Y++r9ChRo4Lo2Wd+J7F4Sak/3gX4skJvbMs042AfblUPHod/on24myUdtoG+Bqc7EWxDMpjHGOM0NZZITCOhpm5FcW47Xk0gqO2lyKuKzViWRrW70oUwM7fQaxDHqRm9moMBzPp+BBZ/HezwRu0e+41rL7xaSJMTryoQsv1CSzWfI3VATP6OnoMWatqDO3HsW9/RyyD3oHzSJBx3EG3eZBaDTB3NJtBgTUvNsu+XD/b0Ukjxrf4/wyZ4dB2mKzv3GqA6X0FuRqYWWEthWOoW/YFgdxIZJDNBG5BuU0GHmJE0JDZvZPP7vABsVzPd6OU6500bD5A6t2VBtC/mQQ9ibptbkY+YXdCMz0E23O0VcuBOVuFIrMOjnLHpTuOEzphxHSt/wZFHdtujFgpsOuh2fVl8w5PoV7ZEQLL5iainkdVM+VhFnia4Ysx0IP2NDEjmWb4mWBIgV2kza7SXCF6ZW4mwSbw4gCJTs8jwzHWS+BzQAiqlWb4n2wwnVi9ogd/ZEiTGeVR0+nbOR9Zx9oTqGtrcDXixB93t7MTp5Vf4ji9C0tgbjYgtMCXs/NuN9bwm0nQfHlNgc1wZNe5biRnPOiBCVgYO68NJljorsPWshpEvTJ3uZBJzTnzAzpHM7pYixezJc7M+rrWENMXTskWx7HUTpCzJfqVdAEJHBNWcNxtM6NmV2B3OdAmfkmnGWas8hMSNrK8jjv24q5Yll1/oBZmV4jJwN/TZ8Fby0pYfyh2y1JYY5ttv2tyqwEm9X6P+uUfGbZ9gTt/Kr+iQwfZk/TzIOrXSHdgivKsRq4BrvZUKt/R3kIB7R2+gUOddcTwba36LzB5zKoSvG7jqgPmjlzSTqC0ll0tNnQCGp/C+cMhWGyFvZ2+bJxXzYFCw5HfoMMoMu0N/IWO4+gS7bSNGP04CdioVd+dm8TwX2F11gjYsdfQIBJah7Y+AT/uT+NU520boGbRElD60G88UcvxWlF26a+m3rbQsse1nsElKBw71wBm4Af0G869iaaGP2t1DjKrJkQ/4VdgYS+VwTLWGNgJBNHxahS/+XSsCWlAM/8Hcmv3JlwW/eeLY/730+XJ5cqPqfiRENelrR9a1xvBMt4c2Eka4M/SrEXxcsQjNEMex3l6I/alpZQCxjyvvwBoYc0yVmNmr2UD2mwtQ8uR4AJE4KkA+/JeAdZrW7K2gMMj4C5zS5Ebio9b8MnAnqvIcNSqm5PfLdaqfW3ZlIDTCMBbl08ifxNas75YtsK68AtoTfvIrwJZtxnQ/8Dumwz8D1o3mfMxYRE2AAAAAElFTkSuQmCC) no-repeat;  background-size: 100%;
      }

      :host([loading][plain]) #icon {
        background: transparent url(data:image/png;base64,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) no-repeat;  background-size: 100%;
      }

      :host #mask {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255,255,255,.775);
      }
      
    </style>
  </template>
</dom-module>`;
document.head.appendChild(documentContainer);

class Button extends Hover(Base(PolymerElement)) {
  static get is() {
    return `${prefix}-button`;
  }

  static get properties() {
    return {
      type: {
        type: String,
        value: 'default',
        reflectToAttribute: true,
      },
      size: {
        type: String,
        value: 'default',
        reflectToAttribute: true,
      },
      disabled: {
        type: Boolean,
        reflectToAttribute: true,
      },
      plain: {
        type: Boolean,
        reflectToAttribute: true,
      },
      loading: {
        type: Boolean,
        reflectToAttribute: true,
      },
      formType: {
        type: String,
      },
      openType: {
        type: String,
        value: '',
      },
      hoverStartTime: {
        type: Number,
        value: 20,
      },
      hoverStayTime: {
        type: Number,
        value: 70,
      },
      hoverClass: {
        type: String,
        value: 'button-hover',
        observer: '_hoverClassChange',
      },
    };
  }

  static get template() {
    return html`
      <style include="button-style">
      </style>
      <i id="icon" if="[[loading]]"></i>
      <slot></slot>
      <template is="dom-if" if="[[showMask(disabled, type)]]">
        <div id="mask"></div>
      </template>
    `;
  }

  get listeners() {
    return {
      tap: '_onButtonTap',
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._defaultHoverClass = 'button-hover';
  }

  _onButtonTap() {
    const _this2 = this;

    if (this.disabled) {
      return;
    }

    if (this.formType) {
      if (this.formType === 'submit') {
        this.dispatchEvent(new CustomEvent('formSubmit', {
          bubbles: true,
          composed: true,
        }));
      }

      if (this.formType === 'reset') {
        this.dispatchEvent(new CustomEvent('formReset', {
          bubbles: true,
          composed: true,
        }));
      }
    }

    if (!this._lock && this.openType) {
      this._lock = true;
      setTimeout(() => {
        _this2._lock = false;
      }, 1000);

      if (this.openType === 'share') {

      } else if (this.openType === 'getPhoneNumber') {

      } else if (this.openType === 'launchApp') {

      } else if (this.openType === 'contact') {

      }
    }
  }

  showMask(disabled, type) {
    return disabled && type === 'default';
  }
}

window.customElements.define(Button.is, Button);
