// Title-screen menu overlay: the "Amchi BAMBai" key art fills the title screen
// (cover-fit, top-anchored). The art has no baked-in menu block, so the
// engine's REAL buttons (listeners intact) live in a glass panel docked to the
// right edge, clamped to the viewport so it never clips on any screen size.

function place(panel) {
  // bottom-docked glass bar, centered: the key art's logo lives in the upper
  // half, and the art's painted menu block underneath is dissolved by the
  // .nu-title::after frost patch, so nothing clashes
  const M = 22; // breathing room from the viewport edges
  panel.style.left = '48%';
  panel.style.top = 'auto';
  panel.style.right = 'auto';
  panel.style.bottom = `${M}px`;
  panel.style.translate = '-50% 0';
  panel.style.width = 'max-content';
  panel.style.maxWidth = `calc(100vw - ${2 * M}px)`;
  panel.style.height = 'auto';
  panel.style.maxHeight = 'none';
}

function build(title) {
  if (title.querySelector('.nu-menu-panel')) { place(title.querySelector('.nu-menu-panel')); return; }
  const main = title.querySelector('.nu-title-main');
  if (!main) return;

  const panel = document.createElement('div');
  panel.className = 'nu-menu-panel';

  const brand = document.createElement('div');
  brand.className = 'nu-menu-brand';
  const emblem = new Image();
  emblem.src = '/brand/icon.png';
  emblem.alt = '';
  brand.append(emblem, document.createTextNode('BAMBai'));
  panel.append(brand);

  // the engine's own primary button + link row, reparented (listeners intact)
  const play = main.querySelector('.nu-play');
  const links = main.querySelector('.nu-title-links');
  if (play) panel.append(play);
  if (links) {
    const btns = [...links.querySelectorAll('button')];
    links.remove();
    for (const b of btns) panel.append(b);
  }
  const exit = document.createElement('button');
  exit.className = 'nu-link nu-exit';
  exit.type = 'button';
  exit.textContent = 'Exit';
  exit.addEventListener('click', () => { window.close(); });
  panel.append(exit);

  const keys = document.createElement('div');
  keys.className = 'nu-menu-keys';
  keys.innerHTML = '<span><kbd>\u2191</kbd><kbd>\u2193</kbd> select</span><span><kbd>Enter</kbd> confirm</span><span><kbd>Esc</kbd> menu</span>';
  panel.append(keys);

  title.append(panel);
  place(panel);

  // small corner credit line (original artwork is CC-BY)
  if (!title.querySelector('.nu-title-credit')) {
    const c = document.createElement('div');
    c.className = 'nu-title-credit';
    c.textContent = 'Fan-made parody · original artwork CC-BY · v0.9';
    title.append(c);
  }
}

export function initTitleMenu() {
  const ui = document.getElementById('ui');
  if (!ui) return;
  const mo = new MutationObserver(() => {
    const title = ui.querySelector('.nu-title');
    if (title) build(title);
  });
  mo.observe(ui, { childList: true, subtree: true });
  addEventListener('resize', () => {
    const panel = document.querySelector('.nu-menu-panel');
    if (panel) place(panel);
  });
}
