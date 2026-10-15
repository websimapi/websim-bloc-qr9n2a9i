const iframe = document.getElementById('target');
const openBtn = document.getElementById('open');
const twitchBtn = document.getElementById('twitch');
const toolbar = document.getElementById('toolbar');
const topTrigger = document.getElementById('top-trigger');

let hideTimeout;

function hideToolbar() {
  toolbar.classList.add('toolbar-hidden');
  topTrigger.style.display = 'block';
}

function showToolbar() {
  toolbar.classList.remove('toolbar-hidden');
  topTrigger.style.display = 'none';
  resetHideTimer();
}

function resetHideTimer() {
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(hideToolbar, 10000);
}

window.addEventListener('load', resetHideTimer);
if (document.readyState === 'complete') {
  resetHideTimer();
}

topTrigger.addEventListener('mouseenter', showToolbar);

let topStartY = 0;
topTrigger.addEventListener('touchstart', (e) => {
  topStartY = e.touches[0].clientY;
}, {passive: true});

topTrigger.addEventListener('touchmove', (e) => {
  if (e.touches[0].clientY > topStartY + 5) {
    showToolbar();
  }
}, {passive: true});

// Allow swipe-up on the toolbar itself to hide it again
let toolbarTouchStartY = 0;
toolbar.addEventListener('touchstart', (e) => {
  // start tracking only when toolbar is visible
  if (toolbar.classList.contains('toolbar-hidden')) return;
  toolbarTouchStartY = e.touches[0].clientY;
}, {passive: true});

toolbar.addEventListener('touchmove', (e) => {
  if (!toolbarTouchStartY) return;
  const currentY = e.touches[0].clientY;
  // if user drags upward more than 10px, hide toolbar
  if (currentY < toolbarTouchStartY - 10) {
    hideToolbar();
    toolbarTouchStartY = 0;
  }
}, {passive: true});

toolbar.addEventListener('touchend', () => {
  toolbarTouchStartY = 0;
});

toolbar.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
toolbar.addEventListener('mouseleave', resetHideTimer);

openBtn.addEventListener('click', ()=> {
  const url = iframe.src;
  // try to open in new tab
  window.open(url, '_blank', 'noopener,noreferrer') || location.assign(url);
});

twitchBtn.addEventListener('click', ()=> {
  const twitchUrl = 'https://twitch.tv/captainrumsalot';
  window.open(twitchUrl, '_blank', 'noopener,noreferrer') || location.assign(twitchUrl);
});

// make the new watch text act like a pointer to the Twitch button (opens the same channel)
const watchLink = document.getElementById('watch-link');
if (watchLink) {
  watchLink.addEventListener('click', () => twitchBtn.click());
  watchLink.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); twitchBtn.click(); } });
}



// If the parent supports resizing or wants to toggle toolbar visibility via postMessage,
// listen for simple commands to keep this iframe embeddable and friendly.
window.addEventListener('message', (ev) => {
  if (!ev.data || typeof ev.data !== 'object') return;
  const {type, payload} = ev.data;
  if (type === 'set-toolbar-visible') {
    document.getElementById('toolbar').style.display = payload ? 'flex' : 'none';
  } else if (type === 'set-src' && typeof payload === 'string') {
    iframe.src = payload;
  }
});