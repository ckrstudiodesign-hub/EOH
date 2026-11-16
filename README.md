# Emerge on Horizon (EOH) website

The new website for Emerge on Horizon, Dr. Shaheena Kadri and Alisha Kadri, Dubai.
Designed and built by CKR Creatives.

## Pages
- `index.html`: home
- `about.html`, `blog.html`, `contact.html`
- `programmes.html`, `coaching.html`, `workshops.html`, `consultations.html`: services

## Run it on your computer
Double-click **Open website.bat** (Windows), or run:

```
npx --yes http-server -p 8080 -c-1 -o
```

Opening `index.html` directly from the folder will not play the YouTube video or some animations; use the command above.

## Hosting
It is a static site (HTML, CSS, JavaScript, images and videos), so it can be hosted anywhere: GitHub Pages, Netlify, Vercel or any web host.

## Credits
Stock photos and videos are from Pexels (free licence); sources are listed in `img/services/SOURCES.txt`, `img/mission/SOURCES.txt`, `video/SOURCES.txt` and `video/MISSION-SOURCE.txt`.

## Free eBook popup & Google Sheet Lead Capture
`js/ebook.js` shows a popup 3 seconds after the website opens (once per visit, and never again after signing up) that collects an email and delivers the eBook in `downloads/unlocking-horizons-ebook.pdf`. Any link or button with `data-ebook-open` also opens it.

### Automatic Google Sheets Storage & Instant Email Alerts
When a visitor enters their email address:
1. It is automatically saved as a new row in your private Google Sheet (`EOH Leads & Subscribers`).
2. An instant notification alert is emailed to `ckrstudiodesign@gmail.com`.
3. The visitor gets direct access to download the eBook.

👉 **To activate Google Sheets in 2 minutes**, follow the instructions in [`GOOGLE-SHEET-SETUP.md`](./GOOGLE-SHEET-SETUP.md) and paste your Google Apps Script Web App URL into `CONFIG.sheetScriptUrl` in [`js/ebook.js`](./js/ebook.js).

### Optional: Emailing the eBook to Visitors via EmailJS
The email can also be sent directly to the visitor's inbox using [EmailJS](https://www.emailjs.com) (free plan: 200 emails a month). To switch it on:

1. Sign up at emailjs.com, then **Email Services → Add service** and connect the EOH mailbox (for example Gmail or Outlook). Copy the **Service ID**.
2. **Email Templates → Create template**. Set **To Email** to `{{to_email}}`, **Reply To** to `support@emergeonhorizon.com`, subject `Your free eBook from Emerge on Horizon`, and a body like:

   > Hi,
   >
   > Thank you for joining Emerge on Horizon! Here is your free eBook, "{{ebook_title}}":
   >
   > {{ebook_link}}
   >
   > Happy Emerging!
   > The EOH team

   Copy the **Template ID**.
3. **Account → General**: copy the **Public Key**.
4. Paste the three values into `CONFIG` at the top of `js/ebook.js`.
5. In EmailJS **Account → Security**, add the live website domain to the allowed list.

Until the keys are filled in, the popup still works but shows the download link on screen instead of emailing it.
