import React, { useEffect } from 'react';
import './MobileNotice.css';

// Full-screen gate shown when the debugger is opened from a mobile browser.
function MobileNotice() {
  useEffect(() => {
    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    document.title = '请在电脑端访问 · Tiny Devtool';
    document.documentElement.lang = 'zh-CN';
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
    };
  }, []);

  return (
    <main className="td-mobile-gate">
      <div className="td-mobile-gate-card">
        <div className="td-mobile-gate-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <rect x="10" y="15" width="44" height="29" rx="4" stroke="currentColor" strokeWidth="2.4" />
            <path d="M24 50h16M28 44v6M36 44v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M24 25h16M24 32h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          </svg>
        </div>
        <div className="td-mobile-gate-eyebrow">Tiny Runtime Debugger</div>
        <h1 className="td-mobile-gate-title">请在电脑端访问</h1>
        <p className="td-mobile-gate-text">
          调试器需要桌面浏览器的大屏、多窗口预览和元素检查能力，暂不支持手机端浏览器直接打开。
        </p>
        <div className="td-mobile-gate-hint">
          <span className="td-mobile-gate-dot" />
          请复制当前链接，在电脑浏览器中继续
        </div>
        <div className="td-mobile-gate-url" title={window.location.href}>
          {window.location.origin}
          {window.location.pathname}
        </div>
        <div className="td-mobile-gate-en">Desktop browser required</div>
      </div>
    </main>
  );
}

export default MobileNotice;
