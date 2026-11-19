/* Partner / referral links. EDIT ONLY THIS BLOCK.
   Paste the real referral link between the quotes (must start with https://).
   Empty = the partner box stays hidden everywhere and the bot does not mention it.
   Fill a platform ONLY if Mohammed is actually a partner there.
   Pages: services/shopify.html (key shopify), services/easy-orders.html (key easyorders), plus the bot. */
window.SITE_PARTNERS = {
  shopify: '',     // e.g. 'https://www.shopify.com/...' (Shopify Partner referral link)
  easyorders: ''   // leave empty unless he is an Easy Orders partner
};

(function () {
  function ok(u) { return typeof u === 'string' && /^https:\/\/[^\s]+$/.test(u); }
  function run() {
    var P = window.SITE_PARTNERS || {};
    var slots = document.querySelectorAll('[data-partner-slot]');
    for (var i = 0; i < slots.length; i++) {
      var key = slots[i].getAttribute('data-partner-slot');
      var url = P[key];
      if (!ok(url)) continue;
      var links = slots[i].querySelectorAll('[data-partner-link]');
      for (var j = 0; j < links.length; j++) {
        links[j].href = url;
        links[j].target = '_blank';
        links[j].rel = 'sponsored nofollow noopener noreferrer';
      }
      slots[i].hidden = false;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
