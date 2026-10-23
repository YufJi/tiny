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
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #1e293b;
  color: #f8fafc;
  font: inherit;
  line-height: 1.4;
  cursor: pointer;
}
.tiny-button-hover {
  opacity: 0.85;
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
`
