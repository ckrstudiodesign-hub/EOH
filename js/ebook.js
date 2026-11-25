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
    sheetScriptUrl: 'https://script.google.com/macros/s/AKfycbzNomr9ZdQNr6htMJvev5x2vd6yU6IdqYOr_kO6NrbfvGUZhchU5KpaMpXlcgNfSdv9/exec',
    notificationEmail: 'ckrstudiodesign@gmail.com',

    // Optional EmailJS parameters (if configured, also emails eBook to visitor)
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY',
    ebookPath: 'downloads/unlocking-horizons-ebook.pdf',
    ebookTitle: 'Unlocking Horizons: An Entrepreneur’s Guide to Emerge',
    showAfterMs: 1200           // auto-open 1.2s after the page opens / refreshes
  };

  var configured = !/YOUR_/.test(CONFIG.serviceId + CONFIG.templateId + CONFIG.publicKey);
  var ebookUrl = new URL(CONFIG.ebookPath, location.href).href;

  var css = '' +
'.eb{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:16px;visibility:hidden;pointer-events:none}' +
'.eb.open{visibility:visible;pointer-events:auto}' +
'.eb-veil{position:absolute;inset:0;background:rgba(26,14,8,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity 300ms ease;will-change:opacity}' +
'.eb.open .eb-veil{opacity:1}' +
'.eb-card{position:relative;width:min(760px,100%);max-height:calc(100svh - 32px);overflow:auto;background:#FCF7EC;color:#1A1410;border-radius:16px;padding:clamp(26px,4vw,38px) clamp(24px,4vw,40px);' +
  'box-shadow:0 32px 90px rgba(26,14,8,.32);font-family:"Zilla Slab",Georgia,serif;opacity:0;transform:translateY(16px) scale(.97) translateZ(0);will-change:transform,opacity;transition:opacity 260ms cubic-bezier(.23,1,.32,1),transform 420ms cubic-bezier(.23,1,.32,1)}' +
'.eb.open .eb-card{opacity:1;transform:none}' +
'.eb-x{position:absolute;top:0;right:0;width:44px;height:44px;border-radius:0 16px 0 0;border:0;background:#B89600;color:#fff;display:grid;place-items:center;cursor:pointer;transition:background-color 200ms ease,transform 160ms ease}' +
'.eb-x:hover{background:#9C7F00}.eb-x:active{transform:scale(.95)}' +
'.eb h2{margin:0 36px 0 0;font-family:"Zilla Slab",Georgia,serif;font-size:clamp(1.5rem,3.2vw,1.85rem);font-weight:600;letter-spacing:-0.01em;line-height:1.2;color:#B89600}' +
'.eb-intro{margin-top:18px;font-size:.9688rem;line-height:1.65;color:#1A1410}' +
'.eb-lead{margin:0 0 8px}' +
'.eb-lead em{font-style:italic;font-weight:700;color:#B89600}' +
'.eb-bold{margin:10px 0 0;font-weight:700;color:#1A1410}' +
'.eb-box{margin-top:18px;padding:22px 24px;border-radius:14px;border:1px solid #DFD5B5;background:rgba(255,255,255,.35)}' +
'.eb-box h3{margin:0 0 8px;font-family:"Zilla Slab",Georgia,serif;font-size:clamp(1.25rem,2.4vw,1.45rem);font-weight:600;color:#B89600;letter-spacing:-0.01em}' +
'.eb-box-p{margin:0 0 6px;font-size:.9688rem;line-height:1.6;color:#1A1410}' +
'.eb-form{margin-top:22px;display:grid;gap:14px}' +
'.eb-field{position:relative;margin-top:4px}' +
'.eb-field label{position:absolute;top:-10px;left:14px;padding:0 6px;background:#FCF7EC;font-size:.875rem;font-weight:500;color:#1A1410;line-height:1.2;z-index:1}' +
'.eb-in{width:100%;box-sizing:border-box;height:48px;padding:0 16px;border-radius:8px;border:1px solid #D8CCA8;background:#FFFDF9;font:inherit;font-size:1rem;color:#1A1410;transition:border-color 200ms ease,box-shadow 200ms ease}' +
'.eb-in:focus{outline:none;border-color:#B89600;box-shadow:0 0 0 3px rgba(184,150,0,.15)}' +
'.eb-in[aria-invalid=true]{border-color:#C2410C}' +
'.eb-btn{justify-self:start;height:44px;padding:0 30px;border-radius:999px;border:2px solid #B89600;background:#FFFDF9;color:#B89600;font:inherit;font-weight:600;font-size:.9688rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background-color 200ms ease,color 200ms ease,transform 160ms ease}' +
'.eb-btn:hover{background:#B89600;color:#fff}.eb-btn:active{transform:scale(.97)}.eb-btn[disabled]{opacity:.7;cursor:progress}' +
'.eb-msg{min-height:1.1em;font-size:.875rem;color:#C2410C;margin-top:-6px}' +
'.eb-msg:empty{display:none}' +
'.eb-foot{margin-top:18px;font-size:.9688rem;line-height:1.6;color:#1A1410}' +
'.eb-foot p{margin:0}' +
'.eb-sign{margin-top:12px;font-family:"Zilla Slab",Georgia,serif;font-size:.9688rem;font-weight:600;color:#B89600}' +
'.eb-done{display:none;text-align:left;margin-top:16px}' +
'.eb.sent .eb-intro,.eb.sent .eb-box,.eb.sent .eb-foot{display:none}.eb.sent .eb-done{display:block}' +
'.eb-done p{margin:0 0 18px;color:#1A1410;font-size:1rem;line-height:1.6}' +
'.eb-done a.eb-btn{text-decoration:none;width:auto}' +
'@media (prefers-reduced-motion:reduce){.eb-card,.eb-veil{transition:none}}';

  var html = '' +
'<div class="eb-veil" data-eb-close></div>' +
'<div class="eb-card" role="dialog" aria-modal="true" aria-labelledby="eb-title">' +
  '<button class="eb-x" type="button" data-eb-close aria-label="Close"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
  '<h2 id="eb-title">Your Journey with EOH Starts Here!</h2>' +
  '<div class="eb-intro">' +
    '<p class="eb-lead">Hi,</p>' +
    '<p class="eb-lead">Welcome to Emerge on Horizon! We’re delighted to see you! As a token of our appreciation, we want to gift you a FREE eBook, <em>“' + CONFIG.ebookTitle + '”</em>, specifically designed to help you.</p>' +
    '<p class="eb-bold">Action Plan for the First 30 Days to unlock your potential and get started.</p>' +
  '</div>' +
  '<div class="eb-box">' +
    '<h3>Claim Your Free eBook Now!</h3>' +
    '<p class="eb-box-p">Enter your email address below and get instant access to your eBook!</p>' +
    '<p class="eb-box-p">Join us in learning the keys to success in the world of entrepreneurship.</p>' +
    '<form class="eb-form" novalidate>' +
      '<div class="eb-field">' +
        '<label for="eb-email">Email</label>' +
        '<input class="eb-in" id="eb-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="" required>' +
      '</div>' +
      '<div class="eb-msg" role="alert" aria-live="polite"></div>' +
      '<button class="eb-btn" type="submit">Submit Now</button>' +
    '</form>' +
  '</div>' +
  '<div class="eb-foot">' +
    '<p>By signing up, you’ll also receive insider tips, upcoming events, and more surprises designed just for you!</p>' +
    '<div class="eb-sign">Happy Emerging!</div>' +
  '</div>' +
  '<div class="eb-done" aria-live="polite">' +
    '<p class="eb-done-text"></p>' +
    '<a class="eb-btn" href="' + ebookUrl + '" target="_blank" rel="noopener" download>Download the eBook now</a>' +
    '<div class="eb-sign">Happy Emerging!</div>' +
  '</div>' +
'</div>';
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
    root.querySelector('.eb-done a').focus({ preventScroll: true });
  }

  function saveToGoogleSheet(data) {
    if (!CONFIG.sheetScriptUrl) {
      console.info('EOH: Google Sheets endpoint not yet set in CONFIG.sheetScriptUrl (see GOOGLE-SHEET-SETUP.md).');
      return Promise.resolve(false);
    }
    // Support either an object or (email, name, source)
    var payload = (typeof data === 'object' && data !== null) ? data : {
      email: arguments[0],
      name: arguments[1],
      source: arguments[2]
    };

    var params = new URLSearchParams();
    params.append('name', payload.name || 'Website Visitor');
    params.append('email', payload.email || '');
    params.append('phone', payload.phone || '-');
    params.append('service', payload.service || payload.source || ('Free eBook: ' + CONFIG.ebookTitle));
    params.append('message', payload.message || 'eBook Download / Newsletter');
    params.append('source', payload.source || ('Free eBook: ' + CONFIG.ebookTitle));
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

  // Expose global helpers for any other forms (e.g. contact/consultations)
  window.submitEOHLead = saveToGoogleSheet;
  window.sendEOHLead = saveToGoogleSheet;

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

  // Auto-open after page load / refresh
  setTimeout(function () {
    open();
  }, CONFIG.showAfterMs || 1200);
})();
