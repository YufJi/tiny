(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a[href]').forEach((link) => {
    const href = link.getAttribute('href').split('#')[0];
    if (href === path || (href === './' && path === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });

  document.querySelectorAll('pre').forEach((block) => {
    const text = block.textContent.trim();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = '复制';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = '已复制';
        setTimeout(() => { button.textContent = '复制'; }, 1400);
      } catch {
        button.textContent = '复制失败';
      }
    });
    block.style.position = 'relative';
    block.appendChild(button);
  });
})();
