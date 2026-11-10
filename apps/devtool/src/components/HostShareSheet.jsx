import React from 'react';
import './HostShareSheet.css';

const OPTIONS = [
  { type: 'appMessage', title: '发送给朋友', detail: 'onShareAppMessage' },
  { type: 'timeline', title: '分享到朋友圈', detail: 'onShareTimeline' },
  { type: 'favorites', title: '收藏', detail: 'onAddToFavorites' },
];

// Host-owned share sheet. The page callback still runs in the service thread;
// this only exposes the menu affordance the browser runtime is missing.
function HostShareSheet({ open, result, onSelect, onClose }) {
  if (!open) return null;
  return (
    <div className="td-share-backdrop" role="presentation" onClick={onClose}>
      <div
        className="td-share-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Share mini program page"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="td-share-head">
          <span>分享</span>
          <button type="button" className="td-share-close" aria-label="Close share sheet" onClick={onClose}>
            ×
          </button>
        </div>
        {result ? (
          <div className="td-share-result" role="status">
            {result.handled === false
              ? '当前页面没有分享回调'
              : `已调用分享：${String(result.share?.title ?? result.type ?? 'ok')}`}
          </div>
        ) : null}
        {OPTIONS.map((option) => (
          <button
            key={option.type}
            type="button"
            className="td-share-option"
            onClick={() => onSelect?.(option.type)}
          >
            <span className="td-share-option-title">{option.title}</span>
            <span className="td-share-option-detail">{option.detail}</span>
          </button>
        ))}
        <button type="button" className="td-share-cancel" onClick={onClose}>取消</button>
      </div>
    </div>
  );
}

export default HostShareSheet;
