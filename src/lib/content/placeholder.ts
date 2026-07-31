import type { Locale } from '@/lib/i18n/config'

import type {
  Certificate,
  Cohort,
  CourseWithCohorts,
  Post,
  RichText,
  SiteSettings,
  TeachingEngagement,
  Testimonial,
} from './types'

/**
 * محتوى تجريبي واقعي (SPEC §12).
 *
 * قرار مقصود: الحقول التي تخصّ هوية صاحب الموقع وبياناته الرسمية موسومة
 * بـ [PLACEHOLDER] لأن نشرها كما هي خطأ فادح، بينما محتوى الدورات مكتوب
 * كنص واقعي بلا وسم — الغرض منه اختبار التخطيط على أطوال نص حقيقية
 * بالعربية والإنجليزية معاً، والعربية أطول بـ ١٥–٢٥٪ عادة.
 *
 * فحص `scripts/check-placeholders.mjs` يمنع النشر مع بقاء أي وسم.
 */

const PLACEHOLDER = '[PLACEHOLDER]'

function pick<T>(locale: Locale, ar: T, en: T): T {
  return locale === 'ar' ? ar : en
}

function blocks(paragraphs: string[]): RichText {
  return paragraphs.map((text, index) => ({
    _type: 'block' as const,
    _key: `block-${index}`,
    style: 'normal' as const,
    children: [{ _type: 'span' as const, _key: `span-${index}`, text }],
    markDefs: [],
  }))
}

function daysFromNow(days: number): string {
  const date = new Date()
  date.setUTCHours(16, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

export function placeholderSiteSettings(locale: Locale): SiteSettings {
  return {
    fullName: pick(locale, `${PLACEHOLDER} اسم المدرّب`, `${PLACEHOLDER} Trainer Name`),
    headline: pick(
      locale,
      'مدرّب Front-End دولي · ١٢ سنة خبرة · محاضر جامعي',
      'International front-end trainer · 12 years of experience · university lecturer',
    ),
    shortBio: pick(
      locale,
      'أدرّب مهندسي الواجهات الأمامية منذ ١٢ سنة، وجاهياً وأونلاين، لأفراد وفرق هندسية في المنطقة وخارجها. أبني كل دورة حول مخرجات عملية قابلة للقياس، لا حول قائمة مواضيع.',
      'I have been training front-end engineers for 12 years, onsite and online, for individuals and engineering teams across the region and beyond. Every course is built around measurable, practical outcomes rather than a list of topics.',
    ),
    longBio: blocks(
      pick(
        locale,
        [
          'بدأت مساري كمطوّر واجهات أمامية عام ٢٠١٣، وانتقلت تدريجياً من بناء المنتجات إلى بناء المهندسين الذين يبنونها. اليوم أقسم وقتي بين التدريب المؤسسي للفرق الهندسية، والدورات المفتوحة للأفراد، والمحاضرات الجامعية.',
          'منهجيتي قائمة على أن الفهم يسبق الأدوات: من يفهم كيف يعمل المتصفح ولماذا تُعاد عمليات الرسم، يتعلم أي إطار عمل جديد في أيام لا في أشهر. لذلك تبدأ كل دورة من الأساس ثم تصعد إلى الإطار، وليس العكس.',
          'درّبت حتى الآن مئات المهندسين في عدة دول، وعملت مع فرق منتجات كان عليها إصلاح أداء تطبيقات في الإنتاج تحت ضغط حقيقي — وهذه التجارب هي ما يشكّل محتوى الدورات.',
        ],
        [
          'I started as a front-end developer in 2013 and gradually moved from building products to building the engineers who build them. Today I split my time between corporate training for engineering teams, open courses for individuals, and university lecturing.',
          'My approach rests on one idea: understanding precedes tooling. An engineer who understands how the browser works and why repaints happen picks up any new framework in days rather than months. So every course starts at the fundamentals and climbs to the framework, never the other way round.',
          'I have trained hundreds of engineers across several countries, and worked with product teams fixing production performance under real pressure — those engagements are what shapes the course material.',
        ],
      ),
    ),
    avatar: {
      url: '/placeholder/avatar.svg',
      alt: pick(
        locale,
        `${PLACEHOLDER} صورة شخصية للمدرّب`,
        `${PLACEHOLDER} portrait of the trainer`,
      ),
      width: 480,
      height: 480,
    },
    cvUrl: null,
    email: `${PLACEHOLDER}@example.com`,
    whatsappNumber: '+000000000000',
    socials: [
      { platform: 'linkedin', url: 'https://www.linkedin.com/in/placeholder' },
      { platform: 'github', url: 'https://github.com/placeholder' },
      { platform: 'youtube', url: 'https://www.youtube.com/@placeholder' },
    ],
    stats: [
      { label: pick(locale, 'متدرّب', 'trainees'), value: 850, suffix: '+' },
      { label: pick(locale, 'دورة مُنفَّذة', 'courses delivered'), value: 120, suffix: '+' },
      { label: pick(locale, 'دول', 'countries'), value: 7, suffix: null },
      { label: pick(locale, 'سنوات خبرة', 'years of experience'), value: 12, suffix: null },
    ],
    approach: pick(
      locale,
      [
        {
          title: 'الأساس قبل الإطار',
          body: 'نبدأ من المتصفح وآلية العرض والشبكة، ثم نبني الإطار فوق فهم راسخ — لا العكس.',
        },
        {
          title: 'مشروع حقيقي لا تمارين معزولة',
          body: 'كل دورة تُبنى حول مشروع واحد يتطوّر معك حتى نهاية البرنامج، وينتهي في مستودعك على GitHub.',
        },
        {
          title: 'مراجعة كود فردية',
          body: 'أراجع كود كل متدرّب شخصياً وأعطي ملاحظات مكتوبة — هذا الجزء لا يمكن أتمتته.',
        },
        {
          title: 'قياس لا انطباع',
          body: 'نقيس الأداء وإمكانية الوصول بأدوات فعلية قبل التحسين وبعده، فالتحسّن يجب أن يظهر في رقم.',
        },
      ],
      [
        {
          title: 'Fundamentals before frameworks',
          body: 'We start with the browser, rendering, and the network, then build the framework on solid ground — not the reverse.',
        },
        {
          title: 'A real project, not isolated drills',
          body: 'Each course is built around one project that grows with you and ends up in your own GitHub repository.',
        },
        {
          title: 'Individual code review',
          body: 'I review every trainee’s code personally and give written feedback — that part cannot be automated.',
        },
        {
          title: 'Measurement, not impressions',
          body: 'We measure performance and accessibility with real tools before and after — improvement has to show up as a number.',
        },
      ],
    ),
    timeline: pick(
      locale,
      [
        {
          period: '2021 — الآن',
          title: 'مدرّب Front-End مستقل',
          organisation: `${PLACEHOLDER} تدريب مؤسسي وأفراد`,
          body: 'برامج تدريبية للفرق الهندسية ودورات مفتوحة للأفراد، وجاهياً وأونلاين.',
        },
        {
          period: '2019 — الآن',
          title: 'محاضر غير متفرغ',
          organisation: `${PLACEHOLDER} جامعة`,
          body: 'تدريس مواد تطوير الويب وهندسة الواجهات لطلبة السنتين الثالثة والرابعة.',
        },
        {
          period: '2016 — 2021',
          title: 'مهندس واجهات أمامية أول',
          organisation: `${PLACEHOLDER} شركة منتجات`,
          body: 'قيادة تقنية لفريق واجهات وإعادة بناء منصة إنتاجية بأداء محسّن.',
        },
        {
          period: '2013 — 2016',
          title: 'مطوّر واجهات أمامية',
          organisation: `${PLACEHOLDER} وكالة رقمية`,
          body: 'بناء واجهات لعملاء في القطاعين الحكومي والخاص.',
        },
      ],
      [
        {
          period: '2021 — present',
          title: 'Independent front-end trainer',
          organisation: `${PLACEHOLDER} corporate and open training`,
          body: 'Training programmes for engineering teams and open courses for individuals, onsite and online.',
        },
        {
          period: '2019 — present',
          title: 'Adjunct lecturer',
          organisation: `${PLACEHOLDER} University`,
          body: 'Teaching web development and front-end engineering to third and fourth year students.',
        },
        {
          period: '2016 — 2021',
          title: 'Senior front-end engineer',
          organisation: `${PLACEHOLDER} product company`,
          body: 'Technical lead for a front-end team and a full rebuild of a production platform.',
        },
        {
          period: '2013 — 2016',
          title: 'Front-end developer',
          organisation: `${PLACEHOLDER} digital agency`,
          body: 'Building interfaces for public and private sector clients.',
        },
      ],
    ),
    seo: null,
  }
}

function cohortsFor(locale: Locale): Cohort[] {
  return [
    {
      id: 'cohort-react-1',
      courseSlug: 'react-professional',
      startDate: daysFromNow(21),
      endDate: daysFromNow(63),
      timezone: 'Asia/Amman',
      schedule: pick(locale, 'الأحد والثلاثاء ١٩:٠٠–٢١:٣٠', 'Sun & Tue 19:00–21:30'),
      mode: 'online',
      city: null,
      capacity: 20,
      seatsRemaining: 8,
      registrationDeadline: daysFromNow(14),
      declaredStatus: null,
      price: null,
    },
    {
      id: 'cohort-react-2',
      courseSlug: 'react-professional',
      startDate: daysFromNow(45),
      endDate: daysFromNow(87),
      timezone: 'Asia/Amman',
      schedule: pick(locale, 'السبت ١٠:٠٠–١٥:٠٠', 'Saturdays 10:00–15:00'),
      mode: 'onsite',
      city: pick(locale, 'عمّان', 'Amman'),
      capacity: 14,
      seatsRemaining: 2,
      registrationDeadline: daysFromNow(38),
      declaredStatus: null,
      price: null,
    },
    {
      id: 'cohort-foundations-1',
      courseSlug: 'frontend-foundations',
      startDate: daysFromNow(12),
      endDate: daysFromNow(75),
      timezone: 'Asia/Riyadh',
      schedule: pick(
        locale,
        'الاثنين والأربعاء ٢٠:٠٠–٢٢:٠٠',
        'Mon & Wed 20:00–22:00',
      ),
      mode: 'online',
      city: null,
      capacity: 25,
      seatsRemaining: 15,
      registrationDeadline: daysFromNow(7),
      declaredStatus: null,
      price: null,
    },
    {
      id: 'cohort-typescript-1',
      courseSlug: 'typescript-in-depth',
      startDate: daysFromNow(9),
      endDate: daysFromNow(37),
      timezone: 'Asia/Amman',
      schedule: pick(locale, 'الثلاثاء والخميس ١٩:٠٠–٢١:٠٠', 'Tue & Thu 19:00–21:00'),
      mode: 'online',
      city: null,
      capacity: 18,
      seatsRemaining: 0,
      registrationDeadline: daysFromNow(4),
      declaredStatus: null,
      price: null,
    },
    {
      id: 'cohort-performance-1',
      courseSlug: 'web-performance',
      startDate: null,
      endDate: null,
      timezone: 'Asia/Amman',
      schedule: pick(locale, 'يُعلن لاحقاً', 'To be announced'),
      mode: 'hybrid',
      city: pick(locale, 'دبي', 'Dubai'),
      capacity: 16,
      seatsRemaining: 16,
      registrationDeadline: null,
      declaredStatus: null,
      price: null,
    },
  ]
}

export function placeholderCourses(locale: Locale): CourseWithCohorts[] {
  const allCohorts = cohortsFor(locale)
  const cohortsOf = (slug: string) => allCohorts.filter((cohort) => cohort.courseSlug === slug)

  const courses: CourseWithCohorts[] = [
    {
      id: 'course-react',
      slug: 'react-professional',
      title: pick(
        locale,
        'React الاحترافي: من المكوّنات إلى الأداء',
        'Professional React: From Components to Performance',
      ),
      summary: pick(
        locale,
        'دورة عملية مكثّفة تنقلك من كتابة مكوّنات تعمل إلى بناء تطبيقات React سريعة وقابلة للصيانة، مع تركيز حقيقي على الأداء وإدارة الحالة.',
        'An intensive, hands-on course that takes you from writing components that work to building React applications that are fast and maintainable, with a genuine focus on performance and state management.',
      ),
      description: blocks(
        pick(
          locale,
          [
            'معظم من يكتب React اليوم يتقن الصياغة ولا يتقن النموذج الذهني. هذه الدورة تعالج ذلك: نفهم أولاً كيف يقرر React ما يُعاد رسمه ومتى، ثم نبني فوق هذا الفهم أنماط إدارة حالة وتقسيم مكوّنات تصمد في تطبيق حقيقي.',
            'نشتغل طوال الدورة على تطبيق واحد يكبر معنا جلسة بعد جلسة، ويمر بكل ما يمر به تطبيق إنتاجي: جلب بيانات، حالات تحميل وخطأ، نماذج معقّدة، توجيه، واختبارات. وفي الثلث الأخير نفتح أدوات القياس ونصلح أداء التطبيق الذي بنيناه بأيدينا.',
          ],
          [
            'Most people writing React today know the syntax but not the mental model. This course fixes that: we first understand how React decides what re-renders and when, then build state management and component-splitting patterns on top of that understanding — patterns that survive a real application.',
            'Throughout the course we work on a single application that grows session by session and goes through everything a production app does: data fetching, loading and error states, complex forms, routing, and tests. In the final third we open the profiler and fix the performance of the application we built ourselves.',
          ],
        ),
      ),
      level: 'intermediate',
      durationHours: 36,
      sessionsCount: 12,
      language: 'both',
      prerequisites: pick(
        locale,
        [
          'إتقان JavaScript الحديثة (ES2015+) والتعامل مع الوعود والدوال غير المتزامنة',
          'معرفة أساسية بـ HTML و CSS',
          'خبرة سابقة بسيطة بـ React أو أي إطار عمل مشابه',
        ],
        [
          'Solid modern JavaScript (ES2015+), including promises and async functions',
          'Working knowledge of HTML and CSS',
          'Some prior exposure to React or a comparable framework',
        ],
      ),
      outcomes: pick(
        locale,
        [
          'تشخيص سبب إعادة الرسم غير الضرورية وإصلاحها بأدوات القياس لا بالتخمين',
          'اختيار أداة إدارة الحالة المناسبة لكل حالة بدل استخدام أداة واحدة لكل شيء',
          'بناء نماذج معقّدة بتحقق موحّد وتجربة أخطاء واضحة',
          'كتابة اختبارات تُغطي سلوك المستخدم لا تفاصيل التنفيذ',
          'تقسيم الحزمة وتحميل الأجزاء عند الحاجة دون كسر تجربة التنقل',
        ],
        [
          'Diagnose and fix unnecessary re-renders using the profiler rather than guesswork',
          'Choose the right state management tool per situation instead of one tool for everything',
          'Build complex forms with unified validation and a clear error experience',
          'Write tests that cover user behaviour rather than implementation details',
          'Split bundles and lazy-load safely without breaking navigation',
        ],
      ),
      syllabus: pick(
        locale,
        [
          {
            title: 'النموذج الذهني لـ React',
            topics: [
              'دورة حياة العرض وآلية التوفيق (reconciliation)',
              'متى يُعاد الرسم فعلاً ولماذا',
              'الحالة المشتقة ومتى تكون خطأً',
            ],
            hours: 6,
          },
          {
            title: 'إدارة الحالة عملياً',
            topics: [
              'الحالة المحلية مقابل حالة الخادم',
              'السياق (Context) وحدوده الحقيقية',
              'مكتبات جلب البيانات والتخزين المؤقت',
            ],
            hours: 8,
          },
          {
            title: 'النماذج والتحقق',
            topics: ['النماذج غير المتحكَّم بها', 'التحقق بمخطط موحّد', 'إمكانية الوصول في النماذج'],
            hours: 6,
          },
          {
            title: 'الأداء والقياس',
            topics: [
              'React Profiler وقراءة نتائجه',
              'تقسيم الكود والتحميل الكسول',
              'Core Web Vitals في تطبيق React',
            ],
            hours: 10,
          },
          {
            title: 'الاختبارات والتسليم',
            topics: ['اختبار السلوك بـ Testing Library', 'اختبارات E2E', 'تجهيز البناء للإنتاج'],
            hours: 6,
          },
        ],
        [
          {
            title: 'The React mental model',
            topics: [
              'The render cycle and reconciliation',
              'When re-renders actually happen, and why',
              'Derived state and when it is a mistake',
            ],
            hours: 6,
          },
          {
            title: 'State management in practice',
            topics: [
              'Local state versus server state',
              'Context and its real limits',
              'Data-fetching libraries and caching',
            ],
            hours: 8,
          },
          {
            title: 'Forms and validation',
            topics: ['Uncontrolled forms', 'Schema-driven validation', 'Form accessibility'],
            hours: 6,
          },
          {
            title: 'Performance and measurement',
            topics: [
              'The React Profiler and reading its output',
              'Code splitting and lazy loading',
              'Core Web Vitals in a React application',
            ],
            hours: 10,
          },
          {
            title: 'Testing and delivery',
            topics: [
              'Behaviour testing with Testing Library',
              'End-to-end tests',
              'Preparing a production build',
            ],
            hours: 6,
          },
        ],
      ),
      modes: ['online', 'onsite'],
      locations: [pick(locale, { city: 'عمّان', country: 'الأردن' }, { city: 'Amman', country: 'Jordan' })],
      coverImage: null,
      technologies: ['React', 'TypeScript', 'Vite', 'Testing Library'],
      priceIndividual: { amount: 320, currency: 'USD' },
      corporate: { available: true, showPrice: false, price: null },
      faqs: pick(
        locale,
        [
          {
            question: 'هل تُسجَّل الجلسات؟',
            answer: 'نعم، تُسجَّل كل الجلسات وتبقى متاحة لك ستة أشهر بعد انتهاء الدورة.',
          },
          {
            question: 'ماذا لو فاتتني جلسة؟',
            answer:
              'تشاهد التسجيل، وتُتاح لك جلسة أسئلة تعويضية أسبوعية للحاق بما فاتك قبل الجلسة التالية.',
          },
        ],
        [
          {
            question: 'Are the sessions recorded?',
            answer:
              'Yes, every session is recorded and stays available to you for six months after the course ends.',
          },
          {
            question: 'What if I miss a session?',
            answer:
              'You watch the recording, and a weekly catch-up Q&A session is available to get you back on track before the next one.',
          },
        ],
      ),
      featured: true,
      order: 1,
      seo: null,
      cohorts: cohortsOf('react-professional'),
    },
    {
      id: 'course-foundations',
      slug: 'frontend-foundations',
      title: pick(
        locale,
        'أساسيات الفرونت اند: HTML و CSS و JavaScript الحديثة',
        'Front-End Foundations: Modern HTML, CSS, and JavaScript',
      ),
      summary: pick(
        locale,
        'برنامج شامل للمبتدئين يبني الأساس الصحيح من الصفر: بنية دلالية، تخطيطات حديثة، وJavaScript عملية — بلا أطر عمل.',
        'A comprehensive beginner programme that builds the right foundation from zero: semantic structure, modern layout, and practical JavaScript — no frameworks.',
      ),
      description: blocks(
        pick(
          locale,
          [
            'الخطأ الأكثر شيوعاً عند المبتدئين هو القفز إلى إطار عمل قبل إتقان الأساس، فينتهي بهم الأمر قادرين على نسخ حلول لا على حلّ مشكلات. هذه الدورة تبني الأساس بترتيبه الصحيح.',
            'نغطي HTML الدلالي وإمكانية الوصول، ثم CSS الحديثة بـ Flexbox و Grid والخصائص المنطقية التي تجعل الواجهة تعمل بالعربية والإنجليزية معاً، ثم JavaScript من المتغيرات حتى التعامل مع الشبكة وواجهات المتصفح.',
          ],
          [
            'The most common beginner mistake is jumping to a framework before mastering the fundamentals, ending up able to copy solutions rather than solve problems. This course builds the foundation in the right order.',
            'We cover semantic HTML and accessibility, then modern CSS with Flexbox, Grid, and the logical properties that make an interface work in both Arabic and English, then JavaScript from variables through to networking and browser APIs.',
          ],
        ),
      ),
      level: 'beginner',
      durationHours: 48,
      sessionsCount: 16,
      language: 'ar',
      prerequisites: pick(
        locale,
        ['استخدام الحاسوب بمستوى جيد', 'لا تُشترط أي خبرة برمجية سابقة'],
        ['Comfortable using a computer', 'No prior programming experience required'],
      ),
      outcomes: pick(
        locale,
        [
          'كتابة HTML دلالي صحيح يعمل مع قارئات الشاشة',
          'بناء تخطيطات متجاوبة بـ Grid و Flexbox تعمل RTL و LTR',
          'كتابة JavaScript نظيفة للتعامل مع الأحداث والبيانات',
          'استهلاك واجهات برمجية والتعامل مع حالات التحميل والخطأ',
          'نشر موقعك الأول على الإنترنت',
        ],
        [
          'Write correct semantic HTML that works with screen readers',
          'Build responsive layouts with Grid and Flexbox that work in both RTL and LTR',
          'Write clean JavaScript for handling events and data',
          'Consume APIs and handle loading and error states',
          'Deploy your first site to the web',
        ],
      ),
      syllabus: pick(
        locale,
        [
          {
            title: 'الويب وHTML الدلالي',
            topics: ['كيف يعمل المتصفح', 'العناصر الدلالية', 'النماذج وإمكانية الوصول'],
            hours: 12,
          },
          {
            title: 'CSS الحديثة',
            topics: ['نموذج الصندوق', 'Flexbox و Grid', 'الخصائص المنطقية و RTL', 'التجاوب'],
            hours: 16,
          },
          {
            title: 'JavaScript من الأساس',
            topics: ['الأنواع والدوال', 'DOM والأحداث', 'الوعود و async/await'],
            hours: 14,
          },
          {
            title: 'مشروع التخرّج',
            topics: ['بناء موقع كامل', 'النشر', 'مراجعة كود فردية'],
            hours: 6,
          },
        ],
        [
          {
            title: 'The web and semantic HTML',
            topics: ['How the browser works', 'Semantic elements', 'Forms and accessibility'],
            hours: 12,
          },
          {
            title: 'Modern CSS',
            topics: ['The box model', 'Flexbox and Grid', 'Logical properties and RTL', 'Responsiveness'],
            hours: 16,
          },
          {
            title: 'JavaScript from the ground up',
            topics: ['Types and functions', 'DOM and events', 'Promises and async/await'],
            hours: 14,
          },
          {
            title: 'Capstone project',
            topics: ['Building a complete site', 'Deployment', 'Individual code review'],
            hours: 6,
          },
        ],
      ),
      modes: ['online', 'onsite'],
      locations: [
        pick(locale, { city: 'عمّان', country: 'الأردن' }, { city: 'Amman', country: 'Jordan' }),
        pick(locale, { city: 'الرياض', country: 'السعودية' }, { city: 'Riyadh', country: 'Saudi Arabia' }),
      ],
      coverImage: null,
      technologies: ['HTML', 'CSS', 'JavaScript', 'Git'],
      priceIndividual: { amount: 280, currency: 'USD' },
      corporate: { available: true, showPrice: false, price: null },
      faqs: [],
      featured: true,
      order: 2,
      seo: null,
      cohorts: cohortsOf('frontend-foundations'),
    },
    {
      id: 'course-typescript',
      slug: 'typescript-in-depth',
      title: pick(locale, 'TypeScript بعمق للمهندسين', 'TypeScript in Depth for Engineers'),
      summary: pick(
        locale,
        'من الأنواع الأساسية إلى الأنواع الشرطية والمعمّمة — كيف تجعل نظام الأنواع يعمل لصالحك بدل أن تحاربه.',
        'From basic types to generics and conditional types — how to make the type system work for you instead of fighting it.',
      ),
      description: blocks(
        pick(
          locale,
          [
            'كثير من الفرق تستخدم TypeScript كـ JavaScript مع تعليقات، وتنتهي بـ any منتشرة في كل مكان. هذه الدورة تعالج ذلك من الجذر: نفهم كيف يستنتج المترجم الأنواع، ثم نستخدم ذلك لبناء واجهات برمجية داخلية يصعب استخدامها بشكل خاطئ.',
          ],
          [
            'Many teams use TypeScript as JavaScript with annotations and end up with `any` scattered everywhere. This course addresses that at the root: we understand how the compiler infers types, then use that to build internal APIs that are hard to misuse.',
          ],
        ),
      ),
      level: 'advanced',
      durationHours: 24,
      sessionsCount: 8,
      language: 'both',
      prerequisites: pick(
        locale,
        ['خبرة عملية بـ JavaScript', 'استخدام سابق لـ TypeScript ولو بمستوى بسيط'],
        ['Practical JavaScript experience', 'Some prior TypeScript usage, even at a basic level'],
      ),
      outcomes: pick(
        locale,
        [
          'قراءة رسائل خطأ المترجم المعقّدة وفهمها',
          'كتابة أنواع معمّمة تحافظ على الاستنتاج بدل كسره',
          'تصميم واجهات برمجية داخلية آمنة بالأنواع',
          'استبدال any بأنواع دقيقة في قاعدة كود قائمة',
        ],
        [
          'Read and understand complex compiler error messages',
          'Write generics that preserve inference instead of breaking it',
          'Design type-safe internal APIs',
          'Replace `any` with precise types in an existing codebase',
        ],
      ),
      syllabus: pick(
        locale,
        [
          {
            title: 'نظام الأنواع من الداخل',
            topics: ['الاستنتاج', 'التضييق', 'اتحاد وتقاطع الأنواع'],
            hours: 8,
          },
          {
            title: 'الأنواع المعمّمة والشرطية',
            topics: ['Generics', 'Conditional types', 'Mapped types', 'Template literal types'],
            hours: 10,
          },
          {
            title: 'التطبيق العملي',
            topics: ['تحسين قاعدة كود قائمة', 'الأنواع مع React', 'إعداد tsconfig الصارم'],
            hours: 6,
          },
        ],
        [
          {
            title: 'The type system from the inside',
            topics: ['Inference', 'Narrowing', 'Unions and intersections'],
            hours: 8,
          },
          {
            title: 'Generics and conditional types',
            topics: ['Generics', 'Conditional types', 'Mapped types', 'Template literal types'],
            hours: 10,
          },
          {
            title: 'Practical application',
            topics: ['Improving an existing codebase', 'Types with React', 'A strict tsconfig setup'],
            hours: 6,
          },
        ],
      ),
      modes: ['online'],
      locations: [],
      coverImage: null,
      technologies: ['TypeScript', 'React'],
      priceIndividual: { amount: 240, currency: 'USD' },
      corporate: { available: true, showPrice: false, price: null },
      faqs: [],
      featured: false,
      order: 3,
      seo: null,
      cohorts: cohortsOf('typescript-in-depth'),
    },
    {
      id: 'course-performance',
      slug: 'web-performance',
      title: pick(
        locale,
        'أداء الويب: من قياس Core Web Vitals إلى إصلاحها',
        'Web Performance: From Measuring Core Web Vitals to Fixing Them',
      ),
      summary: pick(
        locale,
        'ورشة مكثّفة للفرق التي لديها تطبيق بطيء في الإنتاج وتحتاج خطة إصلاح مبنية على قياس حقيقي.',
        'An intensive workshop for teams with a slow production application that need a fix plan grounded in real measurement.',
      ),
      description: blocks(
        pick(
          locale,
          [
            'الأداء ليس قائمة نصائح تُطبَّق عشوائياً، بل عملية: تقيس، تحدد العنق الحقيقي، تصلح، ثم تقيس مجدداً. في هذه الورشة نطبّق هذه الدورة على تطبيق حقيقي — تطبيقكم إن كانت الورشة مؤسسية.',
          ],
          [
            'Performance is not a list of tips applied at random — it is a loop: measure, identify the real bottleneck, fix, measure again. In this workshop we run that loop on a real application — yours, if the workshop is delivered in-house.',
          ],
        ),
      ),
      level: 'advanced',
      durationHours: 18,
      sessionsCount: 6,
      language: 'both',
      prerequisites: pick(
        locale,
        ['خبرة عملية ببناء تطبيقات ويب', 'إلمام بأدوات المطور في المتصفح'],
        ['Practical experience building web applications', 'Familiarity with browser developer tools'],
      ),
      outcomes: pick(
        locale,
        [
          'قياس Core Web Vitals من بيانات مستخدمين حقيقيين لا من المختبر فقط',
          'تحديد العنق الفعلي بدل تطبيق تحسينات عشوائية',
          'تحسين LCP و CLS و INP بخطوات قابلة للقياس',
          'بناء ميزانية أداء ومنع تراجعها في CI',
        ],
        [
          'Measure Core Web Vitals from real user data, not just lab runs',
          'Identify the actual bottleneck instead of applying random optimisations',
          'Improve LCP, CLS, and INP with measurable steps',
          'Establish a performance budget and prevent regressions in CI',
        ],
      ),
      syllabus: pick(
        locale,
        [
          { title: 'القياس أولاً', topics: ['بيانات الحقل والمختبر', 'قراءة التقارير'], hours: 4 },
          {
            title: 'إصلاح المقاييس الثلاثة',
            topics: ['LCP والصور والخطوط', 'CLS والحجوزات', 'INP والمهام الطويلة'],
            hours: 10,
          },
          { title: 'منع التراجع', topics: ['ميزانيات الأداء', 'فحوص CI'], hours: 4 },
        ],
        [
          { title: 'Measurement first', topics: ['Field versus lab data', 'Reading the reports'], hours: 4 },
          {
            title: 'Fixing the three metrics',
            topics: ['LCP, images, and fonts', 'CLS and space reservation', 'INP and long tasks'],
            hours: 10,
          },
          { title: 'Preventing regressions', topics: ['Performance budgets', 'CI checks'], hours: 4 },
        ],
      ),
      modes: ['online', 'hybrid'],
      locations: [pick(locale, { city: 'دبي', country: 'الإمارات' }, { city: 'Dubai', country: 'UAE' })],
      coverImage: null,
      technologies: ['Lighthouse', 'Chrome DevTools', 'Next.js'],
      priceIndividual: null,
      corporate: { available: true, showPrice: false, price: null },
      faqs: [],
      featured: true,
      order: 4,
      seo: null,
      cohorts: cohortsOf('web-performance'),
    },
  ]

  return courses
}

export function placeholderCertificates(locale: Locale): Certificate[] {
  const image = (alt: string) => ({
    url: '/placeholder/certificate.svg',
    alt,
    width: 800,
    height: 566,
  })

  return [
    {
      id: 'cert-1',
      title: pick(locale, `${PLACEHOLDER} شهادة مدرّب معتمد`, `${PLACEHOLDER} Certified Trainer`),
      issuer: `${PLACEHOLDER} ${pick(locale, 'جهة اعتماد دولية', 'international accreditation body')}`,
      issueDate: '2022-04-01',
      expiryDate: null,
      credentialId: `${PLACEHOLDER}-CT-0000`,
      verificationUrl: 'https://example.com/verify/placeholder',
      image: image(
        pick(
          locale,
          `${PLACEHOLDER} صورة شهادة مدرّب معتمد`,
          `${PLACEHOLDER} certified trainer certificate image`,
        ),
      ),
      category: 'training',
      order: 1,
    },
    {
      id: 'cert-2',
      title: pick(locale, `${PLACEHOLDER} شهادة تطوير ويب متقدم`, `${PLACEHOLDER} Advanced Web Development`),
      issuer: `${PLACEHOLDER} ${pick(locale, 'منصة تعليمية', 'learning platform')}`,
      issueDate: '2021-09-15',
      expiryDate: null,
      credentialId: `${PLACEHOLDER}-AWD-0000`,
      verificationUrl: 'https://example.com/verify/placeholder',
      image: image(
        pick(
          locale,
          `${PLACEHOLDER} صورة شهادة تطوير ويب متقدم`,
          `${PLACEHOLDER} advanced web development certificate image`,
        ),
      ),
      category: 'technical',
      order: 2,
    },
    {
      id: 'cert-3',
      title: pick(locale, `${PLACEHOLDER} شهادة إمكانية الوصول`, `${PLACEHOLDER} Accessibility Specialist`),
      issuer: `${PLACEHOLDER} ${pick(locale, 'جمعية معايير الويب', 'web standards association')}`,
      issueDate: '2023-02-20',
      expiryDate: '2026-02-20',
      credentialId: `${PLACEHOLDER}-A11Y-0000`,
      verificationUrl: 'https://example.com/verify/placeholder',
      image: image(
        pick(
          locale,
          `${PLACEHOLDER} صورة شهادة إمكانية الوصول`,
          `${PLACEHOLDER} accessibility certificate image`,
        ),
      ),
      category: 'technical',
      order: 3,
    },
    {
      id: 'cert-4',
      title: pick(locale, `${PLACEHOLDER} دبلوم تدريب المدربين`, `${PLACEHOLDER} Training of Trainers Diploma`),
      issuer: `${PLACEHOLDER} ${pick(locale, 'معهد تدريب', 'training institute')}`,
      issueDate: '2020-06-10',
      expiryDate: null,
      credentialId: `${PLACEHOLDER}-TOT-0000`,
      verificationUrl: null,
      image: image(
        pick(
          locale,
          `${PLACEHOLDER} صورة دبلوم تدريب المدربين`,
          `${PLACEHOLDER} training of trainers diploma image`,
        ),
      ),
      category: 'training',
      order: 4,
    },
    {
      id: 'cert-5',
      title: pick(locale, `${PLACEHOLDER} ماجستير هندسة برمجيات`, `${PLACEHOLDER} MSc Software Engineering`),
      issuer: `${PLACEHOLDER} ${pick(locale, 'جامعة', 'university')}`,
      issueDate: '2018-07-01',
      expiryDate: null,
      credentialId: null,
      verificationUrl: null,
      image: image(
        pick(
          locale,
          `${PLACEHOLDER} صورة شهادة الماجستير`,
          `${PLACEHOLDER} master's degree certificate image`,
        ),
      ),
      category: 'academic',
      order: 5,
    },
  ]
}

export function placeholderTestimonials(locale: Locale): Testimonial[] {
  return [
    {
      id: 'testimonial-1',
      screenshot: {
        url: '/placeholder/testimonial-1.svg',
        alt: pick(
          locale,
          'لقطة رسالة من المتدربة سارة م. تقول إن الدورة غيّرت طريقة تفكيرها وإنها فهمت لأول مرة لماذا يعمل العرض بهذه الطريقة لا كيف يُكتب فقط',
          'Screenshot of a message from trainee Sarah M. saying the course changed how she thinks and that she understood for the first time why rendering works the way it does, not just how to write it',
        ),
        width: 720,
        height: 252,
      },
      transcript: pick(
        locale,
        'الدورة غيّرت طريقة تفكيري بالكامل. أول مرة أفهم الـ rendering لماذا يعمل هكذا وليس فقط كيف أكتبه.',
        'The course completely changed how I think. It is the first time I understood why rendering works the way it does, not just how to write it.',
      ),
      traineeName: pick(locale, 'سارة م.', 'Sarah M.'),
      traineeTitle: pick(locale, 'مهندسة واجهات أمامية', 'Front-end engineer'),
      courseSlug: 'react-professional',
      courseTitle: pick(locale, 'React الاحترافي', 'Professional React'),
      cohortLabel: pick(locale, 'دفعة ربيع ٢٠٢٥', 'Spring 2025 cohort'),
      date: '2025-05-18',
      featured: true,
    },
    {
      id: 'testimonial-2',
      screenshot: {
        url: '/placeholder/testimonial-2.svg',
        alt: pick(
          locale,
          'لقطة رسالة من المتدرّب عمر ك. يقول إنها أفضل دورة حضرها منذ سنوات وإن وحدة الأداء وحدها عوّضت تكلفتها في أول سبرنت بعد عودته للعمل',
          'Screenshot of a message from trainee Omar K. saying it was the best training he has attended in years and that the performance module alone paid for itself in his first sprint back at work',
        ),
        width: 720,
        height: 252,
      },
      transcript: pick(
        locale,
        'أفضل تدريب حضرته منذ سنوات. وحدة الأداء وحدها عوّضت تكلفة الدورة في أول سبرنت بعد رجوعي للعمل.',
        'Best training I have attended in years. The performance module alone paid for itself in the first sprint back at work.',
      ),
      traineeName: pick(locale, 'عمر ك.', 'Omar K.'),
      traineeTitle: pick(locale, 'قائد فريق تقني', 'Tech lead'),
      courseSlug: 'web-performance',
      courseTitle: pick(locale, 'أداء الويب', 'Web Performance'),
      cohortLabel: pick(locale, 'ورشة مؤسسية ٢٠٢٥', 'Corporate workshop 2025'),
      date: '2025-03-02',
      featured: true,
    },
    {
      id: 'testimonial-3',
      screenshot: {
        url: '/placeholder/testimonial-3.svg',
        alt: pick(
          locale,
          'لقطة رسالة من المتدربة ليلى ح. تقول إن التطبيق العملي كان أقوى جزء وإنهم خرجوا بمشروع كامل على GitHub لا بشرائح عرض',
          'Screenshot of a message from trainee Layla H. saying the hands-on work was the strongest part and that they finished with a complete project on GitHub rather than slides',
        ),
        width: 720,
        height: 252,
      },
      transcript: pick(
        locale,
        'التطبيق العملي كان أقوى جزء. خرجنا بمشروع كامل على GitHub وليس بشرائح عرض فقط.',
        'The hands-on work was the strongest part. We finished with a complete project on GitHub, not just slides.',
      ),
      traineeName: pick(locale, 'ليلى ح.', 'Layla H.'),
      traineeTitle: null,
      courseSlug: 'frontend-foundations',
      courseTitle: pick(locale, 'أساسيات الفرونت اند', 'Front-End Foundations'),
      cohortLabel: pick(locale, 'دفعة خريف ٢٠٢٤', 'Autumn 2024 cohort'),
      date: '2024-12-11',
      featured: true,
    },
    {
      id: 'testimonial-4',
      screenshot: {
        url: '/placeholder/testimonial-4.svg',
        alt: pick(
          locale,
          'لقطة رسالة من المتدرّب يوسف أ. يقول إن الشرح كان واضحاً بلا حشو وإن المدرّب أجاب على كل الأسئلة حتى التي كان يخجل من طرحها',
          'Screenshot of a message from trainee Yousef A. saying the explanations were clear with zero fluff and that every question was answered, including ones he was embarrassed to ask',
        ),
        width: 720,
        height: 252,
      },
      transcript: pick(
        locale,
        'شرح واضح بلا حشو. أجاب على كل سؤال، حتى الأسئلة التي كنت أخجل من طرحها.',
        'Clear explanations, zero fluff. He answered every question, including the ones I was embarrassed to ask.',
      ),
      traineeName: pick(locale, 'يوسف أ.', 'Yousef A.'),
      traineeTitle: pick(locale, 'مطوّر ويب', 'Web developer'),
      courseSlug: 'typescript-in-depth',
      courseTitle: pick(locale, 'TypeScript بعمق', 'TypeScript in Depth'),
      cohortLabel: pick(locale, 'دفعة صيف ٢٠٢٥', 'Summer 2025 cohort'),
      date: '2025-08-04',
      featured: false,
    },
    {
      id: 'testimonial-5',
      screenshot: {
        url: '/placeholder/testimonial-5.svg',
        alt: pick(
          locale,
          'لقطة رسالة من المتدربة نور ع. تقول إنها حصلت على وظيفة بعد شهرين من الدورة وإن التدريب على مقابلات العمل كان إضافة لم تتوقعها',
          'Screenshot of a message from trainee Noor A. saying she landed a job two months after the course and that the interview preparation was an unexpected bonus',
        ),
        width: 720,
        height: 252,
      },
      transcript: pick(
        locale,
        'حصلت على وظيفة بعد شهرين من الدورة. التدريب على مقابلات العمل كان إضافة لم أتوقعها.',
        'I landed a job two months after the course. The interview preparation was an unexpected bonus.',
      ),
      traineeName: pick(locale, 'نور ع.', 'Noor A.'),
      traineeTitle: null,
      courseSlug: 'frontend-foundations',
      courseTitle: pick(locale, 'أساسيات الفرونت اند', 'Front-End Foundations'),
      cohortLabel: pick(locale, 'دفعة ربيع ٢٠٢٤', 'Spring 2024 cohort'),
      date: '2024-06-22',
      featured: false,
    },
  ]
}

export function placeholderTeaching(locale: Locale): TeachingEngagement[] {
  return [
    {
      id: 'teaching-1',
      institution: `${PLACEHOLDER} ${pick(locale, 'الجامعة الأولى', 'First University')}`,
      logo: null,
      role: pick(locale, 'محاضر غير متفرغ', 'Adjunct lecturer'),
      coursesTaught: pick(
        locale,
        ['تطوير تطبيقات الويب', 'هندسة الواجهات الأمامية', 'مشروع التخرّج'],
        ['Web application development', 'Front-end engineering', 'Capstone project'],
      ),
      startDate: '2019-09-01',
      endDate: null,
      city: pick(locale, 'عمّان', 'Amman'),
      country: pick(locale, 'الأردن', 'Jordan'),
      description: pick(
        locale,
        'تدريس مواد تطوير الويب لطلبة السنتين الثالثة والرابعة، والإشراف على مشاريع التخرّج المتعلقة بالواجهات الأمامية.',
        'Teaching web development to third and fourth year students, and supervising front-end capstone projects.',
      ),
      order: 1,
    },
    {
      id: 'teaching-2',
      institution: `${PLACEHOLDER} ${pick(locale, 'الجامعة الثانية', 'Second University')}`,
      logo: null,
      role: pick(locale, 'مدرّب معتمد — برنامج تأهيل الخريجين', 'Certified trainer — graduate readiness programme'),
      coursesTaught: pick(
        locale,
        ['معسكر الواجهات الأمامية', 'أساسيات الجاهزية للسوق'],
        ['Front-end bootcamp', 'Industry readiness fundamentals'],
      ),
      startDate: '2021-02-01',
      endDate: '2024-06-30',
      city: pick(locale, 'الرياض', 'Riyadh'),
      country: pick(locale, 'السعودية', 'Saudi Arabia'),
      description: pick(
        locale,
        'تصميم وتنفيذ معسكر تدريبي مكثّف لخريجي علوم الحاسوب لسدّ الفجوة بين المنهج الأكاديمي ومتطلبات السوق.',
        'Designed and delivered an intensive bootcamp for computer science graduates to close the gap between the academic curriculum and market requirements.',
      ),
      order: 2,
    },
    {
      id: 'teaching-3',
      institution: `${PLACEHOLDER} ${pick(locale, 'مركز أكاديمي', 'Academic centre')}`,
      logo: null,
      role: pick(locale, 'متحدث ضيف', 'Guest speaker'),
      coursesTaught: pick(
        locale,
        ['ندوات أداء الويب', 'إمكانية الوصول في الواجهات العربية'],
        ['Web performance seminars', 'Accessibility in Arabic interfaces'],
      ),
      startDate: '2022-01-01',
      endDate: null,
      city: pick(locale, 'دبي', 'Dubai'),
      country: pick(locale, 'الإمارات', 'UAE'),
      description: pick(
        locale,
        'ندوات دورية عن أداء الويب وإمكانية الوصول، مع تركيز على تحديات الواجهات العربية وثنائية الاتجاه.',
        'Regular seminars on web performance and accessibility, focused on the challenges of Arabic and bidirectional interfaces.',
      ),
      order: 3,
    },
  ]
}

export function placeholderPosts(locale: Locale): Post[] {
  return [
    {
      id: 'post-1',
      slug: 'rtl-layouts-that-do-not-break',
      title: pick(
        locale,
        'تخطيطات RTL لا تنكسر: دليل عملي بالخصائص المنطقية',
        'RTL Layouts That Do Not Break: A Practical Guide to Logical Properties',
      ),
      excerpt: pick(
        locale,
        'معظم مشاكل الواجهات العربية سببها خاصية واحدة: استخدام left و right بدل start و end. هذا المقال يشرح البديل عملياً.',
        'Most Arabic interface bugs come down to one habit: using left and right instead of start and end. This article walks through the alternative.',
      ),
      body: blocks(
        pick(
          locale,
          [
            'حين تبني واجهة تدعم العربية والإنجليزية معاً، أول ما ينكسر هو المسافات. زر عليه margin-left يبدو صحيحاً بالإنجليزية وخاطئاً تماماً بالعربية، والحل ليس كتابة ملف CSS ثانٍ بل تغيير الخاصية نفسها.',
            'الخصائص المنطقية تصف المسافة بالنسبة لاتجاه القراءة لا لجهة الشاشة: margin-inline-start تعني «قبل بداية النص»، فتصبح يساراً في الإنجليزية ويميناً في العربية تلقائياً. المتصفحات تدعمها منذ سنوات، وTailwind يوفّرها بأدوات ms و me و ps و pe.',
            'القاعدة العملية: امنع left و right في مراجعة الكود. الاستثناءات قليلة ومحددة — شعارات المنصات التي لا تنعكس، ومقتطفات الكود التي تبقى LTR دائماً.',
          ],
          [
            'When you build an interface that supports both Arabic and English, spacing is the first thing to break. A button with margin-left looks right in English and completely wrong in Arabic, and the fix is not a second stylesheet — it is changing the property itself.',
            'Logical properties describe spacing relative to reading direction rather than screen side: margin-inline-start means "before the start of the text", which becomes left in English and right in Arabic automatically. Browsers have supported them for years, and Tailwind exposes them as ms, me, ps, and pe.',
            'The practical rule: ban left and right in code review. The exceptions are few and specific — platform logos that must not mirror, and code snippets that always stay LTR.',
          ],
        ),
      ),
      coverImage: null,
      tags: ['CSS', 'RTL', 'i18n'],
      publishedAt: '2026-05-12',
      readingTime: 7,
    },
    {
      id: 'post-2',
      slug: 'measuring-before-optimising',
      title: pick(
        locale,
        'قِس قبل أن تحسّن: لماذا تفشل معظم محاولات تسريع المواقع',
        'Measure Before You Optimise: Why Most Performance Efforts Fail',
      ),
      excerpt: pick(
        locale,
        'الفرق التي تبدأ بالتحسين قبل القياس تصلح غالباً ما ليس مكسوراً. هذا المقال يشرح ترتيب الخطوات الصحيح.',
        'Teams that optimise before measuring usually fix what was not broken. This article lays out the correct order of operations.',
      ),
      body: blocks(
        pick(
          locale,
          [
            'أكثر خطأ شائع في مشاريع تحسين الأداء أن تبدأ بقائمة نصائح: اضغط الصور، أزل المكتبات، أضف تحميلاً كسولاً. النتيجة أسابيع عمل وتحسّن هامشي، لأن العنق الحقيقي كان في مكان آخر تماماً.',
            'ابدأ ببيانات الحقل لا المختبر. Lighthouse على جهازك يقيس جهازك أنت، بينما مستخدموك على شبكات أبطأ وأجهزة أضعف. بيانات المستخدمين الحقيقيين هي التي تقول أي مقياس يعاني فعلاً.',
            'ثم أصلح مقياساً واحداً في كل مرة، وقس بعده مباشرة. إن لم يتحرّك الرقم، تراجع عن التغيير. هذا الانضباط هو الفرق بين مشروع أداء ينجح وآخر ينتهي بجدول تغييرات بلا أثر.',
          ],
          [
            'The most common mistake in performance work is starting from a tips list: compress images, drop libraries, add lazy loading. The result is weeks of effort and marginal gains, because the real bottleneck was somewhere else entirely.',
            'Start with field data, not lab data. Lighthouse on your machine measures your machine, while your users are on slower networks and weaker devices. Real user data is what tells you which metric is actually suffering.',
            'Then fix one metric at a time and measure immediately after. If the number does not move, revert the change. That discipline is the difference between a performance project that works and one that ends as a changelog with no effect.',
          ],
        ),
      ),
      coverImage: null,
      tags: ['Performance', 'Core Web Vitals'],
      publishedAt: '2026-03-28',
      readingTime: 9,
    },
    {
      id: 'post-3',
      slug: 'teaching-fundamentals-first',
      title: pick(
        locale,
        'لماذا أدرّس الأساسيات قبل أطر العمل — بعد ١٢ سنة تدريب',
        'Why I Teach Fundamentals Before Frameworks — After 12 Years of Training',
      ),
      excerpt: pick(
        locale,
        'الاختصار الذي يبدو أسرع في البداية هو الأبطأ على المدى الطويل. ملاحظات من قاعات التدريب.',
        'The shortcut that looks faster at the start is the slowest over time. Notes from the training room.',
      ),
      body: blocks(
        pick(
          locale,
          [
            'كل بضع سنوات يظهر إطار عمل جديد، ويعود السؤال نفسه: هل نبدأ بتعليمه مباشرة؟ جوابي بعد ١٢ سنة تدريب لم يتغيّر: لا.',
            'المتدرّب الذي يبدأ من الإطار يتعلّم أنماطاً بلا أسباب. يعرف أن يكتب الخطاف الفلاني، ولا يعرف لماذا. وحين يتغيّر الإطار — وهو يتغيّر دائماً — يبدأ من الصفر مجدداً.',
            'المتدرّب الذي يفهم المتصفح وآلية العرض والشبكة يتعلّم أي إطار جديد في أيام، لأن الإطار عنده تفصيل تنفيذي لا صندوق أسود. هذا ليس رأياً بل نمط رأيته يتكرر في مئات المتدربين.',
          ],
          [
            'Every few years a new framework arrives and the same question returns: should we teach it directly? After 12 years of training my answer has not changed: no.',
            'A trainee who starts from the framework learns patterns without reasons. They know to write a particular hook, but not why. And when the framework changes — and it always does — they start from zero again.',
            'A trainee who understands the browser, rendering, and the network picks up any new framework in days, because to them the framework is an implementation detail rather than a black box. This is not an opinion; it is a pattern I have watched repeat across hundreds of trainees.',
          ],
        ),
      ),
      coverImage: null,
      tags: ['Teaching', 'Career'],
      publishedAt: '2026-01-15',
      readingTime: 6,
    },
  ]
}
