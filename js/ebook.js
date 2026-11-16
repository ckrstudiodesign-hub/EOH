/* Free eBook popup: collects an email, stores it automatically in Google Sheets,
   sends an instant email notification to ckrstudiodesign@gmail.com, and delivers the eBook.
   
   Google Sheets & Email Notification Setup:
   1. Follow the quick steps in GOOGLE-SHEET-SETUP.md (takes 2 minutes).
   2. Paste the deployed Web App URL into CONFIG.sheetScriptUrl below.
   
   Optional EmailJS setup (if emailing the eBook directly to visitors):
   1. Create an account at https://www.emailjs.com and connect the EOH mailbox under "Email Services".
   2. Create an Email Template with {{to_email}} and {{ebook_link}} in the body.
   3. Paste serviceId, templateId, publicKey in CONFIG.
   
   Open the popup from anywhere with a link or button that has data-ebook-open on it. */
(function () {
  'use strict';

  var CONFIG = {
    // Google Sheets & Email Notification endpoint (Google Apps Script Web App URL)
    sheetScriptUrl: '',
    notificationEmail: 'ckrstudiodesign@gmail.com',

    // Optional EmailJS parameters (if configured, also emails eBook to visitor)
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY',
    ebookPath: 'downloads/unlocking-horizons-ebook.pdf',
    ebookTitle: 'Unlocking Horizons: An Entrepreneur’s Guide to Emerge',
    showAfterMs: 3000           // auto-open this long after the website opens (once per visit)
  };

  var KEY = 'eoh-ebook';
  function store(v) { try { if (v === undefined) return localStorage.getItem(KEY); localStorage.setItem(KEY, v); } catch (e) { return null; } }
  function seenThisVisit(set) { try { if (set) sessionStorage.setItem(KEY, '1'); return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  // Show on every new visit, but only once per visit (not again on each page), and never after signing up.
  function canAutoOpen() { return store() !== 'claimed' && !seenThisVisit(); }
  var configured = !/YOUR_/.test(CONFIG.serviceId + CONFIG.templateId + CONFIG.publicKey);
  var ebookUrl = new URL(CONFIG.ebookPath, location.href).href;

  var css = '' +
'.eb{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:16px;visibility:hidden;pointer-events:none}' +
'.eb.open{visibility:visible;pointer-events:auto}' +
'.eb-veil{position:absolute;inset:0;background:rgba(26,14,8,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity 300ms ease}' +
'.eb.open .eb-veil{opacity:1}' +
'.eb-card{position:relative;width:min(560px,100%);max-height:calc(100svh - 32px);overflow:auto;background:#FFFEFB;color:#1A0E08;border-radius:24px;padding:clamp(24px,4vw,40px);' +
  'box-shadow:0 40px 100px rgba(26,14,8,.35);font-family:var(--font,"Google Sans Flex",system-ui,sans-serif);opacity:0;transform:translateY(16px) scale(.97);transition:opacity 260ms cubic-bezier(.23,1,.32,1),transform 420ms cubic-bezier(.23,1,.32,1)}' +
'.eb.open .eb-card{opacity:1;transform:none}' +
'.eb-x{position:absolute;top:14px;right:14px;width:40px;height:40px;border-radius:999px;border:0;background:#F3EDE3;color:#1A0E08;display:grid;place-items:center;cursor:pointer;transition:background-color 200ms ease,transform 160ms ease}' +
'.eb-x:hover{background:#EADFCF}.eb-x:active{transform:scale(.94)}' +
'.eb-kick{display:inline-flex;align-items:center;gap:8px;font-size:.8125rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#B89600}' +
'.eb-kick::before{content:"";width:8px;height:8px;border-radius:2px;background:currentColor;transform:rotate(45deg)}' +
'.eb h2{margin:12px 40px 0 0;font-size:clamp(1.6rem,4vw,2.1rem);font-weight:600;letter-spacing:-0.035em;line-height:1.08}' +
'.eb-lead{margin:14px 0 0;color:#6B5D53;font-size:1rem;line-height:1.55}' +
'.eb-lead em{font-style:normal;font-weight:600;color:#1A0E08}' +
'.eb-list{margin:18px 0 0;padding:0;list-style:none;display:grid;gap:8px;font-size:.9375rem}' +
'.eb-list li{display:flex;gap:10px;align-items:flex-start}' +
'.eb-list svg{flex:none;margin-top:3px;color:#E8540F}' +
'.eb-form{margin-top:22px;display:grid;gap:10px}' +
'.eb-form label{font-size:.875rem;font-weight:500}' +
'.eb-row{display:flex;gap:8px;flex-wrap:wrap}' +
'.eb-in{flex:1 1 220px;min-width:0;height:50px;padding:0 16px;border-radius:12px;border:1px solid #E9E1D6;background:#fff;font:inherit;font-size:1rem;color:inherit;transition:border-color 200ms ease,box-shadow 200ms ease}' +
'.eb-in:focus{outline:none;border-color:#E8540F;box-shadow:0 0 0 4px rgba(232,84,15,.14)}' +
'.eb-in[aria-invalid=true]{border-color:#C2410C}' +
'.eb-btn{flex:0 0 auto;height:50px;padding:0 22px;border-radius:12px;border:0;background:#1A0E08;color:#F8F4EE;font:inherit;font-weight:600;font-size:1rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background-color 200ms ease,transform 160ms ease}' +
'.eb-btn:hover{background:#2E1A10}.eb-btn:active{transform:scale(.97)}.eb-btn[disabled]{opacity:.7;cursor:progress}' +
'.eb-msg{min-height:1.2em;font-size:.875rem;color:#C2410C}' +
'.eb-fine{margin-top:6px;font-size:.8125rem;color:#6B5D53;line-height:1.5}' +
'.eb-done{display:none;text-align:left}' +
'.eb.sent .eb-form,.eb.sent .eb-list,.eb.sent .eb-lead{display:none}.eb.sent .eb-done{display:block}' +
'.eb-done p{margin:14px 0 0;color:#6B5D53;line-height:1.55}' +
'.eb-done a.eb-btn{margin-top:20px;text-decoration:none;width:auto}' +
'.eb-sign{margin-top:18px;font-family:"Kaushan Script",cursive;font-size:1.25rem;color:#B89600}' +
'@media (prefers-reduced-motion:reduce){.eb-card,.eb-veil{transition:none}}';

  var check = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var html = '' +
'<div class="eb-veil" data-eb-close></div>' +
'<div class="eb-card" role="dialog" aria-modal="true" aria-labelledby="eb-title">' +
  '<button class="eb-x" type="button" data-eb-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
  '<span class="eb-kick">Free eBook</span>' +
  '<h2 id="eb-title">Your journey with EOH starts here</h2>' +
  '<p class="eb-lead">Welcome to Emerge on Horizon! As a thank-you for visiting, we’d love to gift you <em>“' + CONFIG.ebookTitle + '”</em>, with an action plan for your first 30 days.</p>' +
  '<ul class="eb-list"><li>' + check + 'A clear 30-day plan to unlock your potential</li><li>' + check + 'Keys to success in the world of entrepreneurship</li><li>' + check + 'Sent straight to your inbox, free</li></ul>' +
  '<form class="eb-form" novalidate>' +
    '<label for="eb-email">Email address</label>' +
    '<div class="eb-row"><input class="eb-in" id="eb-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" required>' +
    '<button class="eb-btn" type="submit">Send me the eBook</button></div>' +
    '<div class="eb-msg" role="alert" aria-live="polite"></div>' +
    '<p class="eb-fine">By signing up, you’ll also receive insider tips, upcoming events and more from EOH. Unsubscribe any time.</p>' +
  '</form>' +
  '<div class="eb-done" aria-live="polite">' +
    '<p class="eb-done-text"></p>' +
    '<a class="eb-btn" href="' + ebookUrl + '" target="_blank" rel="noopener" download>Download the eBook now</a>' +
    '<div class="eb-sign">Happy Emerging!</div>' +
  '</div>' +
'</div>';

  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  var root = document.createElement('div');
  root.className = 'eb'; root.setAttribute('data-lenis-prevent', ''); root.innerHTML = html;
  document.body.appendChild(root);

  var form = root.querySelector('.eb-form'), input = root.querySelector('#eb-email'),
      btn = root.querySelector('.eb-form .eb-btn'), msg = root.querySelector('.eb-msg'),
      doneText = root.querySelector('.eb-done-text'), lastFocus = null, isOpen = false;

  function open() {
    if (isOpen) return; isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { (root.classList.contains('sent') ? root.querySelector('.eb-done a') : input).focus({ preventScroll: true }); }, 60);
  }
  function close() {
    if (!isOpen) return; isOpen = false;
    root.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  root.addEventListener('click', function (e) { if (e.target.closest('[data-eb-close]')) close(); });
  document.addEventListener('keydown', function (e) {
    if (!isOpen) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(root.querySelectorAll('button,input,a[href]'), function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-ebook-open]');
    if (t) { e.preventDefault(); open(); }
  });

  function showDone(email, emailed) {
    doneText.textContent = emailed
      ? 'Thank you! We’ve sent the eBook to ' + email + '. It should arrive in a minute or two; if you can’t see it, check your spam or promotions folder.'
      : 'Thank you! Your eBook is ready. Download it below.' + (configured ? ' (We couldn’t email it just now, so here it is directly.)' : '');
    root.querySelector('#eb-title').textContent = emailed ? 'Check your inbox' : 'Your eBook is ready';
    root.classList.add('sent');
    store('claimed');
    root.querySelector('.eb-done a').focus({ preventScroll: true });
  }

  function saveToGoogleSheet(email, name, source) {
    if (!CONFIG.sheetScriptUrl) {
      console.info('EOH: Google Sheets endpoint not yet set in CONFIG.sheetScriptUrl (see GOOGLE-SHEET-SETUP.md).');
      return Promise.resolve(false);
    }
    var params = new URLSearchParams();
    params.append('email', email);
    params.append('name', name || 'Subscriber');
    params.append('source', source || ('Free eBook: ' + CONFIG.ebookTitle));
    params.append('page', location.href);
    params.append('notificationEmail', CONFIG.notificationEmail || 'ckrstudiodesign@gmail.com');

    return fetch(CONFIG.sheetScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    }).catch(function () {
      try {
        var beacon = new Image();
        beacon.src = CONFIG.sheetScriptUrl + '?' + params.toString();
      } catch (err) {}
    });
  }

  // Expose global helper for any other forms (e.g. contact/consultations)
  window.submitEOHLead = function (data) {
    return saveToGoogleSheet(data.email, data.name, data.source);
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      input.setAttribute('aria-invalid', 'true');
      msg.textContent = 'Please enter a valid email address.';
      input.focus(); return;
    }
    input.removeAttribute('aria-invalid'); msg.textContent = '';

    btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';

    // 1. Automatically store in Google Sheet and notify ckrstudiodesign@gmail.com
    var sheetPromise = saveToGoogleSheet(email, 'eBook Visitor', 'Free eBook: ' + CONFIG.ebookTitle);

    // 2. Deliver eBook (via EmailJS if configured, otherwise direct download)
    if (configured) {
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: CONFIG.serviceId,
          template_id: CONFIG.templateId,
          user_id: CONFIG.publicKey,
          template_params: { to_email: email, reply_to: email, ebook_link: ebookUrl, ebook_title: CONFIG.ebookTitle }
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('EmailJS ' + r.status);
        showDone(email, true);
      }).catch(function () {
        showDone(email, false);
      }).then(function () { btn.disabled = false; btn.textContent = label; });
    } else {
      // Wait briefly for Google Sheet submission before revealing the download
      Promise.race([
        sheetPromise,
        new Promise(function (res) { setTimeout(res, 600); })
      ]).then(function () {
        showDone(email, false);
        btn.disabled = false; btn.textContent = label;
      }).catch(function () {
        showDone(email, false);
        btn.disabled = false; btn.textContent = label;
      });
    }
  });

  // Also seamlessly enhance any footer newsletter form on the page to save to the same Google Sheet
  document.addEventListener('DOMContentLoaded', function () {
    var ftNews = document.querySelector('.ft-news');
    if (ftNews) {
      ftNews.addEventListener('submit', function (ev) {
        var emInput = ftNews.querySelector('#ft-email');
        var nmInput = ftNews.querySelector('#ft-name');
        if (emInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emInput.value.trim())) {
          saveToGoogleSheet(emInput.value.trim(), nmInput ? nmInput.value.trim() : '', 'Footer Newsletter');
        }
      }, true);
    }
  });

  // Auto-open 3 seconds after the website opens, once per visit.
  if (canAutoOpen()) {
    setTimeout(function () { seenThisVisit(true); open(); }, CONFIG.showAfterMs);
  }
})();
