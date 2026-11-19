/* ═══════════════════════════════════════════════════════════════
   Site assistant (stage 1): rule-based, no AI, no external API.
   Fixed FAQ answers + guided choice tree + keyword matching.
   Anything it cannot answer, or any quote request, is handed to
   WhatsApp with a prefilled message. Zero running cost.
   Loaded by js/main.js. Edit DATA below to change answers.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__siteBotLoaded) return;
  window.__siteBotLoaded = true;

  var WA_NUMBER = '201018923563';
  var EMAIL = 'hello@mohammedessam.site';
  // Optional Gemini mode (stage 2). Leave empty to stay fully rule-based with zero cost.
  // Set to the URL of the proxy in bot-proxy/worker.js (the API key lives there, never in this file).
  var ENDPOINT = (document.querySelector('meta[name="sitebot-endpoint"]') || {}).content || '';
  var html = document.documentElement;
  var AR = (html.lang || '').toLowerCase().indexOf('ar') === 0 || html.getAttribute('dir') === 'rtl';

  // Where this script lives -> site root, so links work from any page depth.
  var me = document.currentScript || document.querySelector('script[src$="chatbot.js"]');
  var jsDir = me ? me.src.replace(/[^\/]*$/, '') : '';
  var ROOT = jsDir ? jsDir.replace(/js\/$/, '') : '/';
  var LANG_ROOT = ROOT + (AR ? 'ar/' : '');
  function link(p) { return LANG_ROOT + p; }

  /* ─────────────── DATA (both languages) ─────────────── */
  var SERVICES = [
    { id: 'shopify', href: 'services/shopify.html', color: 'yellow',
      ar: ['تطوير متاجر Shopify', 'محمد Shopify Partner. بيربط بوابة الدفع وشركة الشحن، وبيعمل ويربط التطبيقات، وبيعدّل المتجر على حسب احتياجك.'],
      en: ['Shopify Development', 'Mohammed is a Shopify Partner. He connects payment gateways and shipping companies, builds and integrates apps, and edits and customizes your store.'],
      kw: ['shopify', 'شوبيفاي', 'شوبفاي', 'متجر', 'store', 'ecommerce', 'تجاره', 'قالب', 'theme'] },
    { id: 'ai', href: 'services/ai.html', color: 'cyan',
      ar: ['حلول وهندسة الذكاء الاصطناعي', 'أدوات ذكاء اصطناعي تشتغل عنك: كتابة محتوى، معالجة صور، وتطبيقات على مقاس شغلك.'],
      en: ['AI Solutions & Engineering', 'Practical AI tools, prompt frameworks, content engines, and intelligent apps.'],
      kw: ['ai', 'ذكاء', 'اصطناعي', 'اتمته', 'automation', 'بوت', 'chatbot', 'gemini', 'chatgpt'] },
    { id: 'easy-orders', href: 'services/easy-orders.html', color: 'orange',
      ar: ['تصميم متاجر Easy Orders', 'متاجر سريعة، الطلب فيها على واتساب، ومربوطة بشركات الشحن المحلية.'],
      en: ['Easy Orders Store Design', 'Fast storefronts with direct WhatsApp checkouts and courier setup.'],
      kw: ['easy orders', 'easyorders', 'ايزي', 'ايزى', 'ازي اوردرز', 'الدفع عند الاستلام', 'cod'] },
    { id: 'web-dev', href: 'services.html#web-dev', color: 'pink',
      ar: ['تطوير المواقع والمنصات', 'مواقع لشركتك ومنصات سريعة، متصممة تخدم هدف البيزنس بتاعك.'],
      en: ['Web Development', 'Modern websites and digital portals engineered for business goals and usability.'],
      kw: ['موقع', 'مواقع', 'website', 'web', 'منصه', 'landing', 'لاندنج', 'بورتفوليو', 'portfolio site'] },
    { id: 'vibe-coding', href: 'services.html#vibe-coding', color: 'green',
      ar: ['Vibe Coding', 'بنحوّل فكرتك لنسخة شغالة وتطبيق حقيقي بسرعة (MVP).'],
      en: ['Vibe Coding', 'AI-assisted approach to rapidly turning ideas into functional digital MVPs.'],
      kw: ['vibe', 'mvp', 'فكره', 'تطبيق', 'app', 'نموذج', 'prototype', 'startup'] },
    { id: 'digital-ops', href: 'services.html#digital-ops', color: 'purple',
      ar: ['إدارة العمليات الرقمية', 'ترتيب الأوردرات، وربط الأدوات ببعض، وتظبيط تشغيل المتجر من غير أخطاء.'],
      en: ['Digital Operations', 'E-commerce order fulfillment workflows and operational tool coordination.'],
      kw: ['عمليات', 'تشغيل', 'اوردرات', 'طلبات', 'operations', 'fulfillment', 'شحن', 'shipping'] },
    { id: 'social-media', href: 'services.html#social-media', color: 'yellow',
      ar: ['إدارة وتشغيل السوشيال ميديا', 'تخطيط المحتوى، بناء حضورك على السوشيال، والتفاعل مع الناس.'],
      en: ['Social Media Management', 'Content planning, brand presence management, and organic audience engagement.'],
      kw: ['سوشيال', 'social', 'فيسبوك', 'انستجرام', 'instagram', 'facebook', 'محتوي', 'content', 'تيك توك'] },
    { id: 'google', href: 'services.html#google-presence', color: 'cyan',
      ar: ['تجهيز حضورك على جوجل', 'بنجهز حضور نشاطك على جوجل: إيميل شركتك على Gmail عبر Workspace + موقعك على خرائط جوجل.'],
      en: ['Google Business Presence', 'We set up your business presence on Google: business Gmail via Workspace + your Google Maps listing.'],
      kw: ['جوجل', 'google', 'خرايط', 'خرائط', 'maps', 'gmail', 'جيميل', 'ايميل', 'email', 'workspace', 'لوكيشن', 'location'] }
  ];
  // The three newer services (cards + sections on services.html). Scope and price are agreed on WhatsApp.
  var EXTRA = [
    { id: 'marketing', href: 'services.html#marketing', ar: 'إدارة التسويق', en: 'Marketing management',
      d: ['محمد بيدير تسويق نشاطك أونلاين: خطة، محتوى وإعلانات، ومتابعة للنتايج. التفاصيل والسعر على حسب شغلك، وبتتفق عليهم معاه على واتساب.',
          'Mohammed manages your online marketing: a plan, content and ads, and follow-up on results. Details and price depend on your business and are agreed with him on WhatsApp.'],
      kw: ['تسويق', 'اعلانات', 'اعلان', 'marketing', 'ads', 'campaign', 'حملات'] },
    { id: 'photos', href: 'services.html#ai-product-images', ar: 'صور المنتجات بالذكاء الاصطناعي', en: 'AI product images',
      d: ['محمد بيجهّزلك صور منتجات احترافية بالذكاء الاصطناعي من غير جلسة تصوير: بيحسّن صورك الحالية أو بيطلّع صور جديدة للمتجر والسوشيال. خد بالك إنها صور بالـ AI، مش تصوير حقيقي للمنتج. التفاصيل والسعر على واتساب.',
          'Mohammed prepares professional product images with AI, no photo shoot needed: he enhances your existing photos or creates new ones for your store and social media. Note these are AI images, not a real shoot of your product. Details and price on WhatsApp.'],
      kw: ['صور', 'تصوير', 'photo', 'photography', 'images', 'product photos', 'image', 'shoot'] },
    { id: 'addproducts', href: 'services.html#add-products', ar: 'إضافة المنتجات', en: 'Adding products',
      d: ['محمد بيضيفلك منتجاتك على المتجر: صور، وصف، أسعار، وتصنيفات مترتبة. التفاصيل والسعر على حسب عدد المنتجات، وبتتفق عليهم معاه على واتساب.',
          'Mohammed adds your products to your store: photos, descriptions, prices and organized collections. Details and price depend on how many products you have and are agreed with him on WhatsApp.'],
      kw: ['اضافه منتجات', 'رفع منتجات', 'ادخال منتجات', 'add products', 'upload products', 'catalog entry', 'catalog'] }
  ];
  function eName(x) { return AR ? x.ar : x.en; }
  function svcById(id) { for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i]; }
  function sName(s) { return (AR ? s.ar : s.en)[0]; }
  function sDesc(s) { return (AR ? s.ar : s.en)[1]; }

  // FAQ answers come from the site's own FAQ. No prices are stated on the site, so the bot gives none.
  var FAQ = [
    { id: 'platforms',
      q: ['إيه المنصات اللي بتشتغل عليها؟', 'What platforms do you work on?'],
      a: ['محمد بيشتغل أكتر على Shopify (بناء المتجر وتظبيط القالب)، ومتاجر Easy Orders، وتشغيل المتاجر، وأدوات الذكاء الاصطناعي، والـ Vibe Coding.',
          'Mohammed mostly works on Shopify (store setup, themes, products, checkout), Easy Orders stores, store operations, AI tools and Vibe Coding.'],
      kw: ['منصات', 'platform', 'تتخصص', 'specialize', 'بتشتغل علي'] },
    { id: 'time',
      q: ['المتجر بياخد قد إيه؟', 'How long does a store take?'],
      a: ['بيعتمد على حجم الشغل وعدد المنتجات. متجر Shopify كامل أو صفحة Easy Orders بياخد غالبًا من 5 لـ 10 أيام عمل، وده بيشمل المنتجات الأساسية والشحن والدفع وتجربة الطلب قبل ما المتجر يشتغل.',
          'It depends on the size of the job and how many products you have. A full Shopify store or Easy Orders page usually takes 5 to 10 working days. That includes the main products, shipping and payment setup, and testing an order before launch.'],
      kw: ['مده', 'وقت', 'كام يوم', 'ياخد', 'بياخد', 'تسليم', 'how long', 'days', 'timeline', 'turnaround', 'delivery time'] },
    { id: 'support',
      q: ['فيه دعم بعد الإطلاق؟', 'Is there support after launch?'],
      a: ['أيوه، فيه فترة دعم ومتابعة بعد ما المتجر يشتغل، عشان تتأكد إن كل حاجة ماشية صح وتتعمل أي تعديلات صغيرة. ومحمد بيشرحلك إزاي تدير المنتجات والطلبات بنفسك.',
          'Yes. After launch there is a support period to make sure everything runs fine and to fix small things. Mohammed also shows you how to manage your products and orders yourself.'],
      kw: ['دعم', 'support', 'بعد الاطلاق', 'بعد التسليم', 'متابعه', 'after launch', 'maintenance', 'صيانه'] },
    { id: 'improve',
      q: ['ممكن تحسّن متجر أو موقع موجود؟', 'Can you improve an existing store?'],
      a: ['أكيد. محمد بيراجع المتجر اللي عندك ويشوف إيه اللي بيبطّأه أو بيصعّب الطلب على العميل، وبعدين بيسرّع الصفحات ويسهّل الطلب على الموبايل.',
          'Yes. Mohammed reviews your current store, finds what slows it down or makes ordering hard on mobile, and fixes it so you sell more.'],
      kw: ['تحسين', 'موجود', 'قائم', 'عندي متجر', 'بطيء', 'بطء', 'optimize', 'improve', 'existing', 'audit', 'speed', 'cro'] },
    { id: 'start',
      q: ['نبدأ شغل إزاي؟', 'How do we get started?'],
      a: ['ابعت رسالة على واتساب أو من نموذج التواصل، واحكي فيها عن مشروعك وإيه اللي عايز توصله. ومحمد هيرد عليك بنفسه ويتكلم معاك في التفاصيل.',
          'Send a WhatsApp message or use the contact form and tell him about your project and what you want to reach. Mohammed will reply himself and talk through the details.'],
      kw: ['ابدا', 'نبدا', 'ابدأ', 'بداية', 'start', 'begin', 'get started', 'hire', 'اتعاقد', 'تعاقد'] }
  ];

  // Objection handling uses only facts that are already on the site.
  var OBJ = [
    { id: 'expensive', kw: ['غالي', 'غاليه', 'مكلف', 'اقل سعر', 'خصم', 'ارخص', 'expensive', 'too much', 'cheaper', 'discount'],
      a: ['الميزانية مهمة طبعًا. السعر بيتحدد حسب اللي محتاجه فعلًا، فتقدر تبدأ بالأساسيات وتزوّد بعدين. ابعت تفاصيلك على واتساب وهتاخد عرض سعر واضح من غير أي التزام.',
          'Budget matters, of course. The price depends on what you actually need, so you can start with the basics and add more later. Send your details on WhatsApp and you get a clear quote, no commitment.'] },
    { id: 'trust', kw: ['واثق', 'ثقه', 'ضمان', 'مضمون', 'خبره', 'ليه انت', 'ليه اشتغل', 'trust', 'guarantee', 'experience', 'why you', 'why should', 'reliable'],
      a: ['تقدر تتأكد بنفسك: محمد بنى وشغّل أكتر من 16 متجر ومنصة، وله أكتر من 5 سنين شغل فعلي. وفي معرض الأعمال مشاريع شغالة تفتحها وتجربها بإيدك. وكمان فيه دعم بعد ما المتجر يشتغل.',
          'You can check it yourself: Mohammed has built and run 16+ stores and platforms, with 5+ years of real work. The portfolio has live projects you can open and try. There is also support after launch.'], work: true },
    { id: 'later', kw: ['هفكر', 'بعدين', 'مش دلوقتي', 'لسه', 'later', 'think about', 'not now', 'maybe'],
      a: ['خد وقتك. ولو حابب، ابعت سؤال واحد على واتساب من غير أي التزام، وهتاخد رد واضح تقرر على أساسه.',
          'Take your time. If you want, send one question on WhatsApp, no commitment, and you get a clear answer to decide on.'] }
  ];
  var PRICE_KW = ['سعر', 'اسعار', 'كام', 'تكلف', 'تكلفه', 'ميزاني', 'عرض سعر', 'بكام', 'price', 'cost', 'quote', 'budget', 'how much', 'pricing', 'rate'];
  var WORK_KW = ['اعمال', 'اعمالك', 'نماذج', 'مشاريع', 'portfolio', 'work', 'projects', 'examples', 'امثله', 'case'];
  var CONTACT_KW = ['تواصل', 'رقم', 'واتس', 'whatsapp', 'contact', 'email', 'ايميل محمد', 'phone', 'call', 'اكلمك', 'كلمك'];
  var HI_KW = ['السلام', 'اهلا', 'مرحبا', 'هاي', 'hello', 'hi', 'hey', 'صباح', 'مساء'];

  /* ─────────────── UI strings ─────────────── */
  var T = AR ? {
    teaserTitle: 'أهلًا، أنا مساعد محمد الآلي', teaserText: 'محتاج إيه لشغلك؟ متجر، تسويق، سوشيال ميديا، صور منتجات، أدوات ذكاء اصطناعي وأكتر. قولي وأرشحلك الأنسب.', teaserGo: 'يلا نبدأ',
    rotate: ['اسأل المساعد', 'محتار تختار خدمة؟', 'عايز عرض سعر؟', 'اسألني أي حاجة'],
    ctxHello: function (n) { return 'شايفك بتتفرج على خدمة «' + n + '». تحب أقولك نبدأ فيها إزاي، أو أجهزلك رسالة جاهزة لمحمد؟'; },
    ctxWork: 'شايفك بتتفرج على الأعمال. لو مشروع عجبك، احكيلي فكرتك وأوصّلك لمحمد على واتساب.',
    ctxProducts: 'شايفك بتتفرج على منتجات محمد ومشاريعه. تحب أعرّفك على الخدمات اللي ممكن يقدمها لشغلك؟',
    ctxContact: 'جاهز تبعت طلبك؟ كمّل النموذج، أو أجهزلك رسالة واتساب في ثانية.',
    hes: {
      services: ['محتار تختار خدمة؟', 'قولي شغلك إيه وأقولك الأنسب ليك في أقل من دقيقة.', 'رشّحلي'],
      work: ['عجبك شغل معين؟', 'احكيلي فكرتك وأوصّلك لمحمد على واتساب.', 'احكيلك'],
      faq: ['ملقيتش إجابة سؤالك؟', 'اسألني هنا، أو كلّم محمد نفسه.', 'اسأل'],
      cta: ['جاهز تبدأ مشروعك؟', 'هجهزلك رسالة واتساب في ثانية، تبعتها وتكمّل التفاصيل.', 'جهّز رسالتي']
    },
    launcher: 'اسأل المساعد', title: 'مساعد محمد', sub: 'مساعد آلي، مش محمد نفسه',
    close: 'إغلاق', back: 'رجوع', restart: 'من الأول', wa: 'كلّم محمد على واتساب',
    placeholder: 'اكتب سؤالك هنا...', send: 'إرسال',
    greet: 'أهلًا بيك! أنا المساعد الآلي بتاع موقع محمد عصام. أعرّفك على خدمات محمد (متاجر، تسويق، سوشيال ميديا، صور منتجات، إضافة منتجات، أدوات ذكاء اصطناعي وأكتر) وأقولك الأنسب لشغلك، وأي حاجة تانية هوصّلك له على واتساب. محتاج إيه؟',
    mServices: 'الخدمات اللي بيقدمها محمد', mRecommend: 'رشّحلي الخدمة المناسبة ليا', mFaq: 'أسئلة بتتسأل كتير', mQuote: 'عايز عرض سعر', mContact: 'أكلّم محمد إزاي؟',
    pickService: 'اختار الخدمة اللي تهمك:', details: 'تفاصيل الخدمة', askWa: 'اسأل عن الخدمة دي على واتساب',
    recQ: 'طب محتاج إيه بالظبط؟', recAgain: 'ابدأ الترشيح من الأول',
    r_store: 'أبيع منتجات أونلاين', r_web: 'موقع لشركتي أو منصة', r_idea: 'عندي فكرة تطبيق أو نموذج سريع',
    r_ai: 'أتمتة أو أدوات ذكاء اصطناعي', r_ops: 'تنظيم الطلبات والتشغيل', r_vis: 'ظهور أقوى لنشاطي', r_other: 'تسويق أو صور منتجات بالـ AI أو إضافة منتجات', otherQ: 'تمام، تحب أنهي واحدة فيهم؟', o_more: 'حاجة تانية',
    extraIs: 'ده من الخدمات اللي محمد بيقدمها. التفاصيل والسعر بيتحددوا حسب شغلك، فأحسن تبعتله رسالة جاهزة على واتساب.',
    storeQ: 'عندك متجر شغال دلوقتي؟', s_new: 'لسه هبدأ متجر جديد', s_old: 'عندي متجر وعايز أحسّنه',
    newQ: 'تحب أنهي شكل؟', n_full: 'متجر كامل وأقدر أتحكم فيه أكتر', n_fast: 'متجر سريع، الطلب على واتساب والدفع عند الاستلام',
    visQ: 'عايز تظهر فين؟', v_social: 'السوشيال ميديا', v_google: 'جوجل: إيميل شركة وخرائط',
    recIs: 'أنسب خدمة ليك هي: ', recWhy: 'ده اقتراح مبدئي، ومحمد هيأكدلك على واتساب بعد ما يفهم مشروعك.',
    faqPick: 'اختار سؤال:', priceTitle: 'الأسعار',
    priceA: 'مفيش سعر ثابت على الموقع، لأن السعر بيختلف حسب اللي محتاجه (عدد المنتجات، التخصيص، الخدمات). ابعت ملخص طلبك على واتساب ومحمد هيرد عليك بعرض سعر واضح.',
    quoteQ: 'عايز عرض سعر لأنهي خدمة؟', quoteGo: 'ابعت طلب عرض السعر على واتساب',
    quoteSum: 'جهزتلك رسالة واتساب جاهزة. دوس عليها وابعتها، وكمّل تفاصيل مشروعك.',
    workA: 'تقدر تشوف المشاريع الشغالة وتفاصيل كل مشروع في معرض الأعمال.', workBtn: 'معرض الأعمال',
    contactA: 'أسرع طريقة هي واتساب. وفيه كمان نموذج التواصل، والإيميل: ',
    contactForm: 'نموذج التواصل', hiA: 'أهلًا بيك تاني! أساعدك في إيه؟',
    unknown: 'السؤال ده برا اللي أقدر أجاوب عليه، فالأحسن تسأل محمد نفسه. دوس على الزرار وهتلاقي رسالتك جاهزة على واتساب.',
    waMsgBase: 'أهلًا محمد، جيت من مساعد الموقع.', waSvc: 'مهتم بخدمة: ', waQuote: 'محتاج عرض سعر لخدمة: ', waAsk: 'سؤالي: ',
    waDefault: 'أهلًا محمد، جيت من مساعد الموقع وعايز أكلمك عن مشروعي.'
  } : {
    teaserTitle: "Hi I'm Mohammed's assistant", teaserText: 'What does your business need? A store, marketing, social media, product photos, AI tools and more. Tell me and I will point you to the right service.', teaserGo: 'Start now',
    rotate: ['Ask the assistant', 'Not sure which service?', 'Need a quote?', 'Talk to me now'],
    ctxHello: function (n) { return 'I see you are browsing "' + n + '". Want to know how we would start, or get a ready message for Mohammed?'; },
    ctxWork: 'I see you are browsing the work. If a project caught your eye, tell me your idea and I will pass you to Mohammed on WhatsApp.',
    ctxProducts: 'I see you are browsing products and ventures. Want a quick look at the services he offers for your business?',
    ctxContact: 'Ready to send your request? Finish the form, or I can prepare a WhatsApp message in one second.',
    hes: {
      services: ['Not sure which service?', 'Tell me your business and I will suggest the best fit in under a minute.', 'Recommend'],
      work: ['Something caught your eye?', 'Tell me your idea and I will connect you to Mohammed on WhatsApp.', 'Start'],
      faq: ["Didn't find your answer?", 'Ask me here, or talk to Mohammed directly.', 'Ask'],
      cta: ['Ready to start your project?', 'A ready WhatsApp message in one second. Send it and add the details.', 'Prepare my message']
    },
    launcher: 'Ask the assistant', title: "Mohammed's assistant", sub: 'Automated helper with ready answers, not a person',
    close: 'Close', back: 'Back', restart: 'Start over', wa: 'Chat with Mohammed on WhatsApp',
    placeholder: 'Type your question...', send: 'Send',
    greet: "Hi! I'm the automated assistant for Mohammed Essam's site. I walk you through Mohammed's services (stores, marketing, social media, product photos, adding products, AI tools and more) and point you to the right one. Anything else, I pass to him on WhatsApp. What do you need?",
    mServices: 'What services do you offer?', mRecommend: 'Recommend a service', mFaq: 'Common questions', mQuote: 'I want a quote', mContact: 'How to reach you',
    pickService: 'Pick a service:', details: 'Service details', askWa: 'Ask about this on WhatsApp',
    recQ: 'What do you need?', recAgain: 'Restart the recommendation',
    r_store: 'Sell products online', r_web: 'A website for my company or a platform', r_idea: 'An app idea or quick prototype',
    r_ai: 'Automation or AI tools', r_ops: 'Organize orders and operations', r_vis: 'Stronger visibility for my business', r_other: 'Marketing, AI product images or adding products', otherQ: 'Sure, which one?', o_more: 'Something else',
    extraIs: 'Mohammed does this too. Details and price depend on your business, so the best step is a ready message to him on WhatsApp.',
    storeQ: 'Do you already have a working store?', s_new: 'Not yet, starting a new store', s_old: 'Yes, I want to improve it',
    newQ: 'Which setup suits you?', n_full: 'Full store with more control and customization', n_fast: 'Fast store, WhatsApp ordering and cash on delivery',
    visQ: 'Where do you want visibility?', v_social: 'Social media', v_google: 'Google: business email and Maps',
    recIs: 'Best fit for you: ', recWhy: 'This is a first suggestion. Mohammed will confirm on WhatsApp once he understands your project.',
    faqPick: 'Pick a question:', priceTitle: 'Pricing',
    priceA: 'There is no fixed price on the site because it depends on scope (number of products, customization, services needed). Send your request summary on WhatsApp and Mohammed replies with a clear quote.',
    quoteQ: 'A quote for which service?', quoteGo: 'Send the quote request on WhatsApp',
    quoteSum: 'Your WhatsApp message is ready. Tap, send it, and add your project details.',
    workA: 'You can see live projects and case studies in the portfolio.', workBtn: 'View portfolio',
    contactA: 'WhatsApp is the fastest way. There is also the contact form and email: ',
    contactForm: 'Contact form', hiA: 'Hi there! How can I help?',
    unknown: "That is outside what I can answer with ready replies, so it is best to ask Mohammed directly. One tap and your message is ready on WhatsApp.",
    waMsgBase: "Hi Mohammed, I'm coming from the site assistant.", waSvc: "I'm interested in: ", waQuote: 'I need a quote for: ', waAsk: 'My question: ',
    waDefault: "Hi Mohammed, I'm coming from the site assistant and would like to talk about my project."
  };

  /* ─────────────── helpers ─────────────── */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function hits(text, kws) {
    var n = 0;
    for (var i = 0; i < kws.length; i++) { if (text.indexOf(norm(kws[i])) !== -1) n++; }
    return n;
  }
  function waLink(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function track(name, extra) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, extra || {}); } catch (e) {}
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ─────────────── load CSS ─────────────── */
  if (!document.getElementById('site-bot-css')) {
    var lk = el('link'); lk.id = 'site-bot-css'; lk.rel = 'stylesheet'; lk.href = ROOT + 'css/chatbot.css';
    document.head.appendChild(lk);
  }

  /* ─────────────── build widget ─────────────── */
  var launcher = el('button', 'sitebot-launcher');
  launcher.type = 'button';
  launcher.id = 'sitebot-launcher';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-expanded', 'false');
  var li = el('i', 'fas fa-comments'); li.setAttribute('aria-hidden', 'true');
  launcher.appendChild(li);
  var ltext = el('span', 'sitebot-launcher-text', T.rotate[0]);
  launcher.appendChild(ltext);
  var dot = el('span', 'sitebot-dot', '1'); dot.setAttribute('aria-hidden', 'true');
  launcher.appendChild(dot);
  launcher.setAttribute('aria-label', T.launcher);

  var panel = el('div', 'sitebot-panel');
  panel.id = 'sitebot-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', T.title);
  panel.hidden = true;
  panel.setAttribute('dir', AR ? 'rtl' : 'ltr');

  var head = el('div', 'sitebot-head');
  var ht = el('div', 'sitebot-head-text');
  ht.appendChild(el('strong', 'sitebot-title', T.title));
  ht.appendChild(el('span', 'sitebot-sub', T.sub));
  var closeBtn = el('button', 'sitebot-close'); closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', T.close);
  var ci = el('i', 'fas fa-times'); ci.setAttribute('aria-hidden', 'true'); closeBtn.appendChild(ci);
  head.appendChild(ht); head.appendChild(closeBtn);

  var log = el('div', 'sitebot-log');
  log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');

  var opts = el('div', 'sitebot-opts');

  var form = el('form', 'sitebot-form');
  var input = el('input', 'sitebot-input');
  input.type = 'text'; input.maxLength = 300; input.placeholder = T.placeholder; input.setAttribute('aria-label', T.placeholder);
  input.autocomplete = 'off';
  var sendBtn = el('button', 'sitebot-send'); sendBtn.type = 'submit'; sendBtn.setAttribute('aria-label', T.send);
  var si = el('i', 'fas fa-paper-plane'); si.setAttribute('aria-hidden', 'true'); sendBtn.appendChild(si);
  form.appendChild(input); form.appendChild(sendBtn);

  var waBar = el('a', 'sitebot-wa');
  waBar.target = '_blank'; waBar.rel = 'noopener noreferrer';
  var wi = el('i', 'fab fa-whatsapp'); wi.setAttribute('aria-hidden', 'true');
  waBar.appendChild(wi); waBar.appendChild(el('span', null, T.wa));
  waBar.href = waLink(T.waDefault);
  waBar.addEventListener('click', function () { track('chatbot_whatsapp_handoff', { source: 'footer' }); });

  panel.appendChild(head); panel.appendChild(log); panel.appendChild(opts); panel.appendChild(form); panel.appendChild(waBar);
  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  /* ─────────────── conversation engine ─────────────── */
  var started = false;
  var ctx = { service: null, lastQuestion: null };

  function scrollDown() { log.scrollTop = log.scrollHeight; }
  function say(text, who) {
    var m = el('div', 'sitebot-msg sitebot-' + (who || 'bot'));
    m.textContent = text;
    log.appendChild(m); scrollDown();
    return m;
  }
  function addAction(msgNode, label, href, external, kind) {
    var a = el('a', 'sitebot-action' + (kind ? ' sitebot-action-' + kind : ''), label);
    a.href = href;
    if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    msgNode.appendChild(a);
    return a;
  }
  function setWa(text) { waBar.href = waLink(text); }
  function waText(parts) { return [T.waMsgBase].concat(parts || []).join(' '); }
  function waAction(msgNode, label, text, kind) {
    var a = addAction(msgNode, label, waLink(text), true, kind || 'wa');
    a.addEventListener('click', function () { track('chatbot_whatsapp_handoff', { source: 'bot' }); });
    setWa(text);
  }
  function setOpts(list) {
    opts.textContent = '';
    list.forEach(function (o) {
      var b = el('button', 'sitebot-chip' + (o.cls ? ' ' + o.cls : ''), o.label);
      b.type = 'button';
      b.addEventListener('click', function () { say(o.label, 'user'); o.run(); });
      opts.appendChild(b);
    });
  }
  function navOpts(extra) {
    var list = extra || [];
    list.push({ label: T.restart, cls: 'sitebot-chip-ghost', run: home });
    return list;
  }

  function home() {
    ctx.service = null;
    setWa(T.waDefault);
    say(started ? T.hiA : T.greet);
    started = true;
    setOpts([
      { label: T.mServices, run: showServices },
      { label: T.mRecommend, run: recStart },
      { label: T.mFaq, run: showFaq },
      { label: T.mQuote, run: quoteStart },
      { label: T.mContact, run: showContact }
    ]);
  }

  function showServices() {
    say(T.pickService);
    var list = SERVICES.map(function (s) { return { label: sName(s), run: function () { showService(s); } }; });
    EXTRA.forEach(function (x) { list.push({ label: eName(x), run: function () { extraFor(x); } }); });
    setOpts(navOpts(list));
  }
  // Partner referral (only when a real link is set in js/partners.js)
  function partnerUrl(svc) {
    var P = window.SITE_PARTNERS || {};
    var u = P[svc.id === 'easy-orders' ? 'easyorders' : svc.id];
    return (svc.id === 'shopify' || svc.id === 'easy-orders') && typeof u === 'string' && /^https:\/\/\S+$/.test(u) ? u : '';
  }
  function partnerAction(m, svc) {
    var u = partnerUrl(svc);
    if (!u) return;
    m = say(AR ? 'ملحوظة: محمد Shopify Partner. لو سجّلت من لينكه أو فتحلك الحساب بنفسه، بياخد عمولة من Shopify.' : 'Note: Mohammed is a Shopify Partner. If you sign up through his link or he creates the account, he earns a commission from Shopify.');
    var a = addAction(m, AR ? 'سجّل من لينك محمد (هو شريك وبياخد عمولة من المنصة)' : "Sign up through Mohammed's link (he is a partner and earns a commission)", u, true, 'alt');
    a.rel = 'sponsored nofollow noopener noreferrer';
  }
  function showService(s, noList) {
    ctx.service = s;
    var m = say(sName(s) + ': ' + sDesc(s));
    addAction(m, T.details, link(s.href), false);
    partnerAction(m, s);
    waAction(m, T.askWa, waText([T.waSvc + sName(s)]));
    if (!noList) setOpts(navOpts([{ label: T.mServices, run: showServices }, { label: T.mRecommend, run: recStart }]));
  }

  function recommend(id) {
    var s = svcById(id);
    ctx.service = s;
    var m = say(T.recIs + sName(s) + '. ' + sDesc(s) + ' ' + T.recWhy);
    addAction(m, T.details, link(s.href), false);
    partnerAction(m, s);
    waAction(m, T.askWa, waText([T.waSvc + sName(s)]));
    setOpts(navOpts([{ label: T.recAgain, run: recStart }, { label: T.mQuote, run: function () { quoteFor(s); } }]));
  }
  function recStart() {
    say(T.recQ);
    setOpts(navOpts([
      { label: T.r_store, run: function () {
          say(T.storeQ);
          setOpts(navOpts([
            { label: T.s_new, run: function () {
                say(T.newQ);
                setOpts(navOpts([
                  { label: T.n_full, run: function () { recommend('shopify'); } },
                  { label: T.n_fast, run: function () { recommend('easy-orders'); } }
                ]));
              } },
            { label: T.s_old, run: function () { recommend('shopify'); } }
          ]));
        } },
      { label: T.r_web, run: function () { recommend('web-dev'); } },
      { label: T.r_idea, run: function () { recommend('vibe-coding'); } },
      { label: T.r_ai, run: function () { recommend('ai'); } },
      { label: T.r_ops, run: function () { recommend('digital-ops'); } },
      { label: T.r_other, run: otherStart },
      { label: T.r_vis, run: function () {
          say(T.visQ);
          setOpts(navOpts([
            { label: T.v_social, run: function () { recommend('social-media'); } },
            { label: T.v_google, run: function () { recommend('google'); } }
          ]));
        } }
    ]));
  }

  function extraFor(x) {
    var m = say(eName(x) + ': ' + (AR ? x.d[0] : x.d[1]));
    addAction(m, T.details, link(x.href), false);
    waAction(m, T.askWa, waText([T.waSvc + eName(x)]));
    setOpts(navOpts([{ label: T.mServices, run: showServices }, { label: T.mQuote, run: quoteStart }]));
  }
  function otherStart() {
    say(T.otherQ);
    var list = EXTRA.map(function (x) { return { label: eName(x), run: function () { extraFor(x); } }; });
    list.push({ label: T.o_more, run: function () {
      var m = say(T.unknown); waAction(m, T.wa, waText()); setOpts(navOpts());
    } });
    setOpts(navOpts(list));
  }
  function showFaq() {
    say(T.faqPick);
    var list = FAQ.map(function (f) { return { label: AR ? f.q[0] : f.q[1], run: function () { answerFaq(f); } }; });
    list.push({ label: AR ? 'الأسعار؟' : 'Pricing?', run: priceAnswer });
    setOpts(navOpts(list));
  }
  function answerFaq(f) {
    var m = say(AR ? f.a[0] : f.a[1]);
    if (f.id === 'start') waAction(m, T.wa, waText());
    setOpts(navOpts([{ label: T.mFaq, run: showFaq }, { label: T.mServices, run: showServices }]));
  }

  function priceAnswer() {
    var m = say(T.priceA);
    waAction(m, T.quoteGo, waText([T.waQuote + (ctx.service ? sName(ctx.service) : (AR ? '(هنحددها مع بعض)' : '(to be discussed)'))]));
    setOpts(navOpts([{ label: T.mQuote, run: quoteStart }]));
  }
  function quoteStart() {
    say(T.quoteQ);
    var list = SERVICES.map(function (s) { return { label: sName(s), run: function () { quoteFor(s); } }; });
    EXTRA.forEach(function (x) { list.push({ label: eName(x), run: function () { extraFor(x); } }); });
    setOpts(navOpts(list));
  }
  function quoteFor(s) {
    ctx.service = s;
    var m = say(T.quoteSum);
    waAction(m, T.quoteGo, waText([T.waQuote + sName(s)]));
    setOpts(navOpts([{ label: T.mServices, run: showServices }]));
  }
  function showContact() {
    var m = say(T.contactA + EMAIL);
    waAction(m, T.wa, waText());
    addAction(m, T.contactForm, link('contact.html'), false, 'alt');
    setOpts(navOpts());
  }
  function showWork() {
    var m = say(T.workA);
    addAction(m, T.workBtn, link('work.html'), false);
    setOpts(navOpts([{ label: T.mServices, run: showServices }]));
  }

  // Free text: keyword rules only. No match means hand off to WhatsApp.
  function handleText(raw) {
    var t = norm(raw);
    if (!t) return;
    say(raw, 'user');
    var best = null, bestScore = 0, i, sc;

    for (i = 0; i < OBJ.length; i++) {
      if (hits(t, OBJ[i].kw)) {
        var om = say(AR ? OBJ[i].a[0] : OBJ[i].a[1]);
        if (OBJ[i].work) addAction(om, T.workBtn, link('work.html'), false);
        waAction(om, T.wa, waText([T.waAsk + raw.slice(0, 200)]));
        return setOpts(navOpts([{ label: T.mQuote, run: quoteStart }, { label: T.mServices, run: showServices }]));
      }
    }
    if (hits(t, PRICE_KW)) { ctx.lastQuestion = raw; return priceAnswer(); }
    for (i = 0; i < SERVICES.length; i++) {
      sc = hits(t, SERVICES[i].kw);
      if (sc > bestScore) { bestScore = sc; best = { type: 's', v: SERVICES[i] }; }
    }
    for (i = 0; i < EXTRA.length; i++) {
      sc = hits(t, EXTRA[i].kw);
      if (sc > bestScore) { bestScore = sc; best = { type: 'x', v: EXTRA[i] }; }
    }
    for (i = 0; i < FAQ.length; i++) {
      sc = hits(t, FAQ[i].kw);
      if (sc > bestScore) { bestScore = sc; best = { type: 'f', v: FAQ[i] }; }
    }
    if (bestScore === 0) {
      if (hits(t, WORK_KW)) return showWork();
      if (hits(t, CONTACT_KW)) return showContact();
      if (hits(t, HI_KW) && t.split(' ').length <= 3) return home();
    }
    if (best) { return best.type === 's' ? showService(best.v) : best.type === 'x' ? extraFor(best.v) : answerFaq(best.v); }

    if (ENDPOINT) return askModel(raw);
    unknownReply(raw);
  }
  function unknownReply(raw) {
    var m = say(T.unknown);
    waAction(m, T.wa, waText([T.waAsk + raw.slice(0, 250)]));
    setOpts(navOpts([{ label: T.mFaq, run: showFaq }, { label: T.mServices, run: showServices }]));
  }
  var history = [];
  function askModel(raw) {
    history.push({ role: 'user', text: raw.slice(0, 300) });
    var wait = say(AR ? '...' : '...');
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl ? ctl.signal : undefined,
      body: JSON.stringify({ lang: AR ? 'ar' : 'en', messages: history.slice(-8) }) })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(function (d) {
        clearTimeout(timer);
        var reply = (d && typeof d.reply === 'string') ? d.reply.slice(0, 900) : '';
        if (!reply) throw new Error('empty');
        wait.textContent = reply;
        history.push({ role: 'bot', text: reply });
        var m = wait;
        waAction(m, T.wa, waText([T.waAsk + raw.slice(0, 200)]));
        setOpts(navOpts([{ label: T.mQuote, run: quoteStart }, { label: T.mServices, run: showServices }]));
      })
      .catch(function () { clearTimeout(timer); wait.remove(); unknownReply(raw); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value; input.value = '';
    handleText(v);
  });

  /* ─────────────── attention system ─────────────── */
  var store = {
    get: function (k, local) { try { return (local ? localStorage : sessionStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, local) { try { (local ? localStorage : sessionStorage).setItem(k, v); } catch (e) {} }
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var teaser = el('div', 'sitebot-teaser');
  teaser.hidden = true;
  teaser.setAttribute('role', 'status');
  var tx = el('button', 'sitebot-teaser-x'); tx.type = 'button'; tx.setAttribute('aria-label', T.close);
  var txi = el('i', 'fas fa-times'); txi.setAttribute('aria-hidden', 'true'); tx.appendChild(txi);
  var ttitle = el('strong', 'sitebot-teaser-title');
  var ttext = el('span', 'sitebot-teaser-text');
  var tgo = el('button', 'sitebot-teaser-go'); tgo.type = 'button';
  teaser.appendChild(tx); teaser.appendChild(ttitle); teaser.appendChild(ttext); teaser.appendChild(tgo);
  document.body.appendChild(teaser);
  var teaserAction = null;
  function showTeaser(title, text, goLabel, action, evt) {
    if (!panel.hidden) return false;
    ttitle.textContent = title; ttext.textContent = text; tgo.textContent = goLabel;
    teaserAction = action; teaser.hidden = false;
    track(evt || 'chatbot_teaser_shown');
    return true;
  }
  function hideTeaser() { teaser.hidden = true; }
  tx.addEventListener('click', hideTeaser);
  tgo.addEventListener('click', function () { var a = teaserAction; hideTeaser(); open(a); });

  // 2. Living button: periodic wiggle + notification dot until first open
  var opened = store.get('sitebot_opened', true) === '1';
  if (opened) dot.hidden = true;
  if (!reduceMotion) {
    setInterval(function () {
      if (!panel.hidden || !teaser.hidden) return;
      launcher.classList.add('sitebot-wiggle');
      setTimeout(function () { launcher.classList.remove('sitebot-wiggle'); }, 900);
    }, 9000);
  }

  // 4. Rotating text beside the button (every 10s, only while the panel is closed)
  var ri = 0;
  setInterval(function () {
    if (!panel.hidden) return;
    ri = (ri + 1) % T.rotate.length;
    ltext.classList.add('sitebot-fade');
    setTimeout(function () { ltext.textContent = T.rotate[ri]; ltext.classList.remove('sitebot-fade'); }, 250);
  }, 10000);

  // 3. Entry-page context: which page / service the visitor is on
  function pageContext() {
    var p = location.pathname.toLowerCase(), q = location.search.toLowerCase(), h = location.hash.toLowerCase();
    var i;
    for (i = 0; i < SERVICES.length; i++) {
      var id = SERVICES[i].id;
      if (p.indexOf('/services/' + id + '.html') !== -1 || h === '#' + id || (id === 'google' && h === '#google-presence')) return { svc: SERVICES[i] };
      if (q.indexOf('service=' + id) !== -1 || (id === 'easy-orders' && q.indexOf('service=easy') !== -1) || (id === 'google' && q.indexOf('service=google') !== -1)) return { svc: SERVICES[i] };
    }
    if (/\/(work|ai-projects)(\.html|\/)/.test(p) || p.indexOf('/work/') !== -1) return { page: 'work' };
    if (p.indexOf('products') !== -1) return { page: 'products' };
    if (p.indexOf('contact') !== -1) return { page: 'contact' };
    return {};
  }
  var PC = pageContext();
  function ctxMessage() {
    if (PC.svc) return { svc: PC.svc, text: T.ctxHello(sName(PC.svc)) };
    if (PC.page === 'work') return { text: T.ctxWork };
    if (PC.page === 'products') return { text: T.ctxProducts };
    if (PC.page === 'contact') return { text: T.ctxContact };
    return null;
  }

  // 1. Welcome bubble 3.5s after load, once per visitor, contextual when we know the page
  if (store.get('sitebot_welcome', true) !== '1') {
    setTimeout(function () {
      if (!panel.hidden) return;
      var c = ctxMessage();
      var shown = showTeaser(T.teaserTitle, c ? c.text : T.teaserText, T.teaserGo, null);
      if (shown) store.set('sitebot_welcome', '1', true);
    }, 3500);
  }

  // 5. Hesitation: 12s dwelling on a key section, message tied to that section (max 2 per session, once per section)
  var HES = { services: recStart, work: showWork, faq: showFaq, cta: quoteStart };
  var hesShown = parseInt(store.get('sitebot_hes_n') || '0', 10);
  var hesDone = {};
  var timers = {};
  var lastScroll = Date.now();
  window.addEventListener('scroll', function () { lastScroll = Date.now(); }, { passive: true });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var key = en.target.getAttribute('data-bot-section');
        if (en.isIntersecting && en.intersectionRatio >= 0.5) {
          if (hesDone[key] || timers[key]) return;
          timers[key] = setInterval(function () {
            // hesitation = section stays on screen and the visitor has stopped scrolling for ~8s
            if (Date.now() - lastScroll < 8000) return;
            clearInterval(timers[key]); timers[key] = null;
            if (hesDone[key] || hesShown >= 2 || !panel.hidden || !teaser.hidden || document.hidden) return;
            var m = T.hes[key]; if (!m) return;
            hesDone[key] = true;
            if (showTeaser(m[0], m[1], m[2], HES[key], 'chatbot_hesitation_' + key)) {
              hesShown++; store.set('sitebot_hes_n', String(hesShown));
            }
          }, 1000);
        } else if (timers[key]) { clearInterval(timers[key]); timers[key] = null; }
      });
    }, { threshold: [0, 0.5] });
    var secs = document.querySelectorAll('[data-bot-section]');
    for (var j = 0; j < secs.length; j++) io.observe(secs[j]);
  }

  /* ─────────────── open / close ─────────────── */
  function open(action) {
    teaser.hidden = true;
    dot.hidden = true; store.set('sitebot_opened', '1', true);
    panel.hidden = false;
    html.classList.add('sitebot-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (!started) {
      var c = ctxMessage();
      if (c && c.svc) { started = true; say(c.text); showService(c.svc); }
      else if (c) { started = true; say(c.text); home(); started = true; }
      else home();
    }
    if (typeof action === 'function') action();
    track('chatbot_open');
    setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 50);
  }
  function close() {
    panel.hidden = true;
    html.classList.remove('sitebot-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }
  launcher.addEventListener('click', function () { panel.hidden ? open() : close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
})();
