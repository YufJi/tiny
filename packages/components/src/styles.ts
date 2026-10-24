export const BUILTIN_BASE_STYLES = `
page,
.tiny-view,
.tiny-scroll-view,
.tiny-swiper,
.tiny-swiper-item,
.tiny-checkbox-group,
.tiny-radio-group,
.tiny-button,
.tiny-progress,
.tiny-image,
.tiny-canvas,
.tiny-slider,
.tiny-switch,
.tiny-input {
  display: block;
  box-sizing: border-box;
}
.tiny-label,
.tiny-checkbox,
.tiny-radio {
  display: inline-block;
}
.tiny-text,
.tiny-icon {
  display: inline;
}
.tiny-input {
  width: 100%;
}
page {
  min-height: 100vh;
}
.tiny-hidden {
  display: none !important;
}
.tiny-scroll-view.is-vertical {
  overflow-y: auto;
}
.tiny-scroll-view.is-horizontal {
  overflow-x: auto;
}
.tiny-image {
  max-width: 100%;
  object-fit: fill;
}
.tiny-image-mode-aspectFit {
  object-fit: contain;
}
.tiny-image-mode-aspectFill {
  object-fit: cover;
}
.tiny-image-mode-widthFix {
  object-fit: fill;
  height: auto;
}
.tiny-button {
  position: relative;
  display: block;
  width: 100%;
  flex-shrink: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0 14px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 18px;
  font-weight: normal;
  text-align: center;
  text-decoration: none;
  line-height: 2.55555556;
  border: 0;
  border-radius: 5px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  color: #000000;
  background-color: #f8f8f8;
  cursor: pointer;
}
.tiny-button::after {
  content: " ";
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  box-sizing: border-box;
  pointer-events: none;
  transform: scale(0.5);
  transform-origin: 0 0;
}
.tiny-button:disabled {
  color: rgba(255, 255, 255, 0.6);
  opacity: 1;
  cursor: default;
}
.tiny-button-default {
  color: #000000;
  background-color: #f8f8f8;
}
.tiny-button-primary {
  color: #ffffff;
  background-color: #1aad19;
}
.tiny-button-warn {
  color: #ffffff;
  background-color: #e64340;
}
.tiny-button-default:disabled {
  color: rgba(0, 0, 0, 0.3);
  background-color: #f7f7f7;
}
.tiny-button-primary:disabled {
  background-color: #9ed99d;
}
.tiny-button-warn:disabled {
  background-color: #ec8b89;
}
.tiny-button-plain {
  color: #353535;
  border: 1px solid #353535;
  background-color: transparent;
}
.tiny-button-plain::after {
  border-width: 0;
}
.tiny-button-default.tiny-button-plain {
  color: #353535;
  border-color: #353535;
}
.tiny-button-primary.tiny-button-plain {
  color: #1aad19;
  border-color: #1aad19;
}
.tiny-button-warn.tiny-button-plain {
  color: #e64340;
  border-color: #e64340;
}
.tiny-button-plain:disabled {
  color: rgba(0, 0, 0, 0.2);
  border-color: rgba(0, 0, 0, 0.2);
  background-color: transparent;
}
.tiny-button-mini {
  display: inline-block;
  width: auto;
  padding: 0 1.34em;
  font-size: 13px;
  line-height: 2.3;
}
.tiny-button-loading::before {
  content: " ";
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 0;
  vertical-align: middle;
  background: transparent url(data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iciIgd2lkdGg9JzEyMHB4JyBoZWlnaHQ9JzEyMHB4JyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJub25lIiBjbGFzcz0iYmsiPjwvcmVjdD4KICAgIDxyZWN0IHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjRTlFOUU5JwogICAgICAgICAgdHJhbnNmb3JtPSdyb3RhdGUoMCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+CiAgICA8L3JlY3Q+CiAgICA8cmVjdCB4PSc0Ni41JyB5PSc0MCcgd2lkdGg9JzcnIGhlaWdodD0nMjAnIHJ4PSc1JyByeT0nNScgZmlsbD0nIzk4OTY5NycKICAgICAgICAgIHRyYW5zZm9ybT0ncm90YXRlKDMwIDUwIDUwKSB0cmFuc2xhdGUoMCAtMzApJz4KICAgICAgICAgICAgICAgICByZXBlYXRDb3VudD0naW5kZWZpbml0ZScvPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyM5Qjk5OUEnCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSg2MCA1MCA1MCkgdHJhbnNsYXRlKDAgLTMwKSc+CiAgICAgICAgICAgICAgICAgcmVwZWF0Q291bnQ9J2luZGVmaW5pdGUnLz4KICAgIDwvcmVjdD4KICAgIDxyZWN0IHg9JzQ2LjUnIHk9JzQwJyB3aWR0aD0nNycgaGVpZ2h0PScyMCcgcng9JzUnIHJ5PSc1JyBmaWxsPScjQTNBMUEyJwogICAgICAgICAgdHJhbnNmb3JtPSdyb3RhdGUoOTAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNBQkE5QUEnCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgxMjAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNCMkIyQjInCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgxNTAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNCQUI4QjknCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgxODAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNDMkMwQzEnCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgyMTAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNDQkNCQ0InCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgyNDAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNEMkQyRDInCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgyNzAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNEQURBREEnCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgzMDAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0PgogICAgPHJlY3QgeD0nNDYuNScgeT0nNDAnIHdpZHRoPSc3JyBoZWlnaHQ9JzIwJyByeD0nNScgcnk9JzUnIGZpbGw9JyNFMkUyRTInCiAgICAgICAgICB0cmFuc2Zvcm09J3JvdGF0ZSgzMzAgNTAgNTApIHRyYW5zbGF0ZSgwIC0zMCknPgogICAgPC9yZWN0Pgo8L3N2Zz4=) no-repeat;
  background-size: 100%;
  animation: tiny-button-loading-animate 1s steps(12, end) infinite;
}
.tiny-button-loading {
  color: rgba(0, 0, 0, 0.6);
  background-color: #dedede;
}
.tiny-button-loading.tiny-button-primary {
  color: rgba(255, 255, 255, 0.6);
  background-color: #179b16;
}
.tiny-button-loading.tiny-button-warn {
  color: rgba(255, 255, 255, 0.6);
  background-color: #ce3c39;
}
.tiny-button-loading.tiny-button-plain {
  color: #353535;
  background-color: transparent;
}
.tiny-button-loading.tiny-button-default.tiny-button-plain {
  color: #353535;
}
.tiny-button-loading.tiny-button-primary.tiny-button-plain {
  color: #1aad19;
}
.tiny-button-loading.tiny-button-warn.tiny-button-plain {
  color: #e64340;
}
.button-hover {
  color: rgba(0, 0, 0, 0.6);
  background-color: #dedede;
}
.button-hover.tiny-button-primary {
  color: rgba(255, 255, 255, 0.6);
  background-color: #179b16;
}
.button-hover.tiny-button-warn {
  color: rgba(255, 255, 255, 0.6);
  background-color: #ce3c39;
}
.button-hover.tiny-button-plain {
  color: rgba(53, 53, 53, 0.6);
  border-color: rgba(53, 53, 53, 0.6);
  background-color: transparent;
}
.button-hover.tiny-button-primary.tiny-button-plain {
  color: rgba(26, 173, 25, 0.6);
  border-color: rgba(26, 173, 25, 0.6);
}
.button-hover.tiny-button-warn.tiny-button-plain {
  color: rgba(230, 67, 64, 0.6);
  border-color: rgba(230, 67, 64, 0.6);
}
@keyframes tiny-button-loading-animate {
  0% {
    transform: rotate3d(0, 0, 1, 0deg);
  }
  100% {
    transform: rotate3d(0, 0, 1, 360deg);
  }
}
.tiny-progress-track {
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
}
.tiny-progress-bar {
  height: 100%;
  background: #3b82f6;
}
.tiny-swiper {
  position: relative;
  overflow: hidden;
  height: 150px;
}
.tiny-swiper-track {
  display: flex;
  flex-direction: row;
  height: 100%;
  transition-property: transform;
  transition-timing-function: ease;
}
.tiny-swiper.is-vertical .tiny-swiper-track {
  flex-direction: column;
}
.tiny-swiper-item {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
}
.tiny-swiper-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 8px;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.tiny-swiper.is-vertical .tiny-swiper-dots {
  left: auto;
  right: 8px;
  top: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: center;
}
.tiny-swiper-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}
.tiny-swiper-dot.is-active {
  background: #ffffff;
}
.tiny-view.is-inline {
  display: inline-block;
}
.tiny-text-selectable {
  user-select: text;
  -webkit-user-select: text;
}
.tiny-text-space-en,
.tiny-text-space-em,
.tiny-text-space-nbsp {
  white-space: pre-wrap;
}
.tiny-icon {
  display: inline-block;
  font-style: normal;
  line-height: 1;
}
.tiny-icon-success,
.tiny-icon-success_no_circle {
  color: #09bb07;
}
.tiny-icon-info {
  color: #10aeff;
}
.tiny-icon-warn,
.tiny-icon-waiting {
  color: #f76260;
}
.tiny-icon-cancel,
.tiny-icon-clear {
  color: #b2b2b2;
}
.tiny-icon-download {
  color: #09bb07;
}
.tiny-input {
  display: block;
  width: 100%;
  height: 1.4rem;
  min-height: 1.4rem;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-family: inherit;
  text-overflow: clip;
  overflow: hidden;
  white-space: nowrap;
}
.tiny-input::placeholder {
  color: #999999;
}
.tiny-checkbox,
.tiny-radio {
  vertical-align: middle;
}
.tiny-checkbox input,
.tiny-radio input {
  margin: 0;
  vertical-align: middle;
}
.tiny-switch {
  display: inline-block;
  vertical-align: middle;
}
.tiny-switch input {
  margin: 0;
  vertical-align: middle;
}
.tiny-slider-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}
.tiny-slider {
  flex: 1;
  width: 100%;
  height: 1.4rem;
  margin: 0;
  accent-color: var(--tiny-slider-active, #1aad19);
}
.tiny-slider-value {
  min-width: 2em;
  color: #333333;
  font-size: 14px;
  text-align: right;
}
.tiny-progress {
  display: flex;
  align-items: center;
}
.tiny-progress-track {
  flex: 1;
  overflow: hidden;
}
.tiny-progress-bar {
  width: 0;
  height: 100%;
  transition: width 0.3s ease;
}
.tiny-progress-info {
  margin-left: 15px;
  min-width: 2em;
  margin-top: 0;
  margin-bottom: 0;
}
.tiny-image-mode-scaleToFill {
  object-fit: fill;
}
.tiny-image-mode-heightFix {
  object-fit: fill;
  width: auto;
}
.tiny-image-mode-top {
  object-fit: none;
  object-position: top;
}
.tiny-image-mode-bottom {
  object-fit: none;
  object-position: bottom;
}
.tiny-image-mode-center {
  object-fit: none;
  object-position: center;
}
.tiny-image-mode-left {
  object-fit: none;
  object-position: left;
}
.tiny-image-mode-right {
  object-fit: none;
  object-position: right;
}
.tiny-image-mode-topLeft {
  object-fit: none;
  object-position: left top;
}
.tiny-image-mode-topRight {
  object-fit: none;
  object-position: right top;
}
.tiny-image-mode-bottomLeft {
  object-fit: none;
  object-position: left bottom;
}
.tiny-image-mode-bottomRight {
  object-fit: none;
  object-position: right bottom;
}
.tiny-scroll-view {
  width: 100%;
  overflow: hidden;
}
.tiny-scroll-view.is-vertical {
  overflow-y: auto;
  height: 100%;
}
.tiny-scroll-view.is-horizontal {
  overflow-x: auto;
  width: 100%;
}
.tiny-swiper {
  --tiny-swiper-items: 1;
}
.tiny-swiper-item {
  flex: 0 0 calc(100% / var(--tiny-swiper-items, 1));
  width: calc(100% / var(--tiny-swiper-items, 1));
}
.tiny-swiper-dot {
  width: 8px;
  height: 8px;
}
.tiny-canvas {
  display: block;
  width: 100%;
  height: 150px;
}

`
