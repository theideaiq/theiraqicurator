/*
 * Editorial content that doesn't live in Supabase yet: the timetable,
 * the syllabus of artists and the pop quiz. Every string is bilingual.
 * Edit freely — the pages read straight from here.
 */

export type Bilingual = { en: string; ar: string };
export type Locale = 'en' | 'ar';

export const pick = (value: Bilingual, locale: string) => (locale === 'ar' ? value.ar : value.en);

export const SOCIAL = {
  instagram: 'https://www.instagram.com/theiraqicurator/',
  instagramHandle: '@theiraqicurator',
  email: 'iraqicurator@gmail.com',
};

/* ------------------------------------------------------------------ */
/* Timetable — exhibitions, workshops, talks                           */
/* ------------------------------------------------------------------ */

export type ClassSession = {
  id: string;
  kind: 'exhibition' | 'workshop' | 'talk' | 'screening';
  title: Bilingual;
  blurb: Bilingual;
  venue: Bilingual;
  /** ISO start in Baghdad time (UTC+3). Leave null when the date isn't public. */
  startsAt: string | null;
  /** Duration in minutes, used for calendar exports. */
  durationMinutes?: number;
  partners?: string[];
  color: 'rose' | 'saffron' | 'teal' | 'lapis' | 'brick';
};

export const TIMETABLE: ClassSession[] = [
  {
    id: 'aziza-namaa-alward',
    kind: 'exhibition',
    title: { en: 'Aziza — Namaa Alward', ar: 'عزيزة — نماء الورد' },
    blurb: {
      en: 'An art exhibition and breast-cancer awareness evening. When art makes room for awareness and hope.',
      ar: 'فعالية فنية توعوية بسرطان الثدي. حين يعطي الفن مساحة للوعي والأمل.',
    },
    venue: { en: 'The Station, Baghdad', ar: 'المحطة، بغداد' },
    startsAt: '2026-10-24T16:00:00+03:00',
    durationMinutes: 180,
    color: 'rose',
  },
  {
    id: 'sealed-memories',
    kind: 'workshop',
    title: { en: 'Sealed Memories', ar: 'ذكريات مختومة' },
    blurb: {
      en: 'A heritage, culture & art workshop: carve your own Mesopotamian cylinder seal and roll out your memories in clay.',
      ar: 'ورشة تراثية، ثقافية، فنية: اصنع ختمك الرافديني واستكشف ذكرياتك.',
    },
    venue: { en: 'A library in Baghdad', ar: 'مكتبة في بغداد' },
    startsAt: '2026-09-23T17:00:00+03:00',
    durationMinutes: 120,
    color: 'saffron',
  },
  {
    id: 'interactive-exhibition',
    kind: 'exhibition',
    title: { en: 'The Interactive Exhibition', ar: 'المعرض التفاعلي' },
    blurb: {
      en: 'L’exposition interactive — touch, play and make with the work, in partnership with the Institut Français d’Irak.',
      ar: 'معرض تفاعلي تلمس فيه العمل وتلعب وتصنع، بالشراكة مع المعهد الفرنسي في العراق.',
    },
    venue: { en: 'Institut Français, Baghdad', ar: 'المعهد الفرنسي، بغداد' },
    startsAt: null,
    partners: ['Ambassade de France en Irak', 'Institut Français Irak', 'TotalEnergies'],
    color: 'lapis',
  },
];

export type SessionStatus = 'upcoming' | 'today' | 'archive' | 'tba';

export function sessionStatus(session: ClassSession, now = new Date()): SessionStatus {
  if (!session.startsAt) return 'tba';
  const start = new Date(session.startsAt);
  const end = new Date(start.getTime() + (session.durationMinutes ?? 120) * 60_000);
  const baghdadDay = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Baghdad' });
  if (now > end) return 'archive';
  if (baghdadDay(now) === baghdadDay(start)) return 'today';
  return 'upcoming';
}

/* ------------------------------------------------------------------ */
/* Syllabus — the canon they skipped in school                         */
/* ------------------------------------------------------------------ */

export type Discipline = 'painting' | 'sculpture' | 'letters' | 'architecture' | 'print' | 'manuscript';

export type Artist = {
  id: string;
  name: Bilingual;
  years: string;
  disciplines: Discipline[];
  note: Bilingual;
};

export const SYLLABUS: Artist[] = [
  {
    id: 'wasiti',
    name: { en: 'Yahya al-Wasiti', ar: 'يحيى الواسطي' },
    years: '13th c.',
    disciplines: ['manuscript', 'painting'],
    note: {
      en: 'Illustrated the Maqamat al-Hariri in Baghdad in 1237 — the founding image-bank of Arab painting.',
      ar: 'زوّق مقامات الحريري في بغداد سنة ١٢٣٧ — الأرشيف البصري المؤسس للتصوير العربي.',
    },
  },
  {
    id: 'madiha-omar',
    name: { en: 'Madiha Omar', ar: 'مديحة عمر' },
    years: '1908–2005',
    disciplines: ['painting', 'letters'],
    note: {
      en: 'A pioneer of hurufiyya — turning the Arabic letter into pure abstraction, decades before it was a movement.',
      ar: 'رائدة الحروفية — حوّلت الحرف العربي إلى تجريد خالص قبل أن يصبح تياراً بعقود.',
    },
  },
  {
    id: 'faiq-hassan',
    name: { en: 'Faiq Hassan', ar: 'فائق حسن' },
    years: '1914–1992',
    disciplines: ['painting'],
    note: {
      en: 'Founded the Société Primitive (al-Ruwwad) and taught generations of painters at the Institute of Fine Arts.',
      ar: 'أسس جماعة الرواد ودرّس أجيالاً من الرسامين في معهد الفنون الجميلة.',
    },
  },
  {
    id: 'jewad-selim',
    name: { en: 'Jewad Selim', ar: 'جواد سليم' },
    years: '1919–1961',
    disciplines: ['sculpture', 'painting'],
    note: {
      en: 'Co-founded the Baghdad Group for Modern Art in 1951 and made Nasb al-Hurriyah, the Freedom Monument in Tahrir Square.',
      ar: 'شارك في تأسيس جماعة بغداد للفن الحديث عام ١٩٥١ وصنع نصب الحرية في ساحة التحرير.',
    },
  },
  {
    id: 'shakir-hassan',
    name: { en: 'Shakir Hassan Al Said', ar: 'شاكر حسن آل سعيد' },
    years: '1925–2004',
    disciplines: ['painting', 'letters'],
    note: {
      en: 'Philosopher-painter of walls, letters and Sufi silence; launched the One Dimension group in 1971.',
      ar: 'فيلسوف الجدران والحروف والصمت الصوفي؛ أطلق جماعة البعد الواحد عام ١٩٧١.',
    },
  },
  {
    id: 'naziha-salim',
    name: { en: 'Naziha Salim', ar: 'نزيهة سليم' },
    years: '1927–2008',
    disciplines: ['painting'],
    note: {
      en: 'Painted the women of rural Iraq with tenderness and colour; a member of al-Ruwwad.',
      ar: 'رسمت نساء الريف العراقي بحنان ولون؛ وكانت عضواً في جماعة الرواد.',
    },
  },
  {
    id: 'lorna-selim',
    name: { en: 'Lorna Selim', ar: 'لورنا سليم' },
    years: '1928–2021',
    disciplines: ['painting'],
    note: {
      en: 'Sheffield-born, Baghdad-made: painted the city’s alleys and shanasheel for decades.',
      ar: 'ولدت في شيفيلد وتكوّنت في بغداد: رسمت أزقة المدينة وشناشيلها لعقود.',
    },
  },
  {
    id: 'mahmoud-sabri',
    name: { en: 'Mahmoud Sabri', ar: 'محمود صبري' },
    years: '1927–2012',
    disciplines: ['painting'],
    note: {
      en: 'Went from political realism to “Quantum Realism” — painting the atomic structure of things.',
      ar: 'انتقل من الواقعية السياسية إلى «واقعية الكم» — رسم البنية الذرية للأشياء.',
    },
  },
  {
    id: 'ghani-hikmat',
    name: { en: 'Mohammed Ghani Hikmat', ar: 'محمد غني حكمت' },
    years: '1929–2011',
    disciplines: ['sculpture'],
    note: {
      en: 'Gave Baghdad its public storytellers in bronze: Kahramana, Shahrazad and Shahryar.',
      ar: 'منح بغداد حكّائيها البرونزيين: كهرمانة وشهرزاد وشهريار.',
    },
  },
  {
    id: 'kadhim-hayder',
    name: { en: 'Kadhim Hayder', ar: 'كاظم حيدر' },
    years: '1932–1985',
    disciplines: ['painting'],
    note: {
      en: 'His 1965 series “The Epic of the Martyr” turned Karbala into modernist theatre.',
      ar: 'حوّلت سلسلته «ملحمة الشهيد» عام ١٩٦٥ كربلاء إلى مسرح حداثي.',
    },
  },
  {
    id: 'ismail-fattah',
    name: { en: 'Ismail Fattah', ar: 'إسماعيل فتاح الترك' },
    years: '1934–2004',
    disciplines: ['sculpture', 'painting'],
    note: {
      en: 'Designed the split turquoise dome of the Martyr’s Monument (al-Shaheed), Baghdad, 1983.',
      ar: 'صمم القبة الفيروزية المشطورة لنصب الشهيد في بغداد عام ١٩٨٣.',
    },
  },
  {
    id: 'dia-azzawi',
    name: { en: 'Dia al-Azzawi', ar: 'ضياء العزاوي' },
    years: 'b. 1939',
    disciplines: ['painting', 'print'],
    note: {
      en: 'Co-founded the New Vision group (1969); his Sabra and Shatila drawing is one of the century’s great anti-war works.',
      ar: 'شارك في تأسيس جماعة الرؤية الجديدة (١٩٦٩)؛ ولوحته صبرا وشاتيلا من أعظم أعمال القرن ضد الحرب.',
    },
  },
  {
    id: 'rafa-nasiri',
    name: { en: 'Rafa al-Nasiri', ar: 'رافع الناصري' },
    years: '1940–2013',
    disciplines: ['print', 'painting'],
    note: {
      en: 'Brought modern printmaking to Iraq after studying in Beijing and Lisbon; taught it to everyone.',
      ar: 'أدخل الحفر الطباعي الحديث إلى العراق بعد دراسته في بكين ولشبونة، وعلّمه للجميع.',
    },
  },
  {
    id: 'zaha-hadid',
    name: { en: 'Zaha Hadid', ar: 'زها حديد' },
    years: '1950–2016',
    disciplines: ['architecture'],
    note: {
      en: 'Baghdad-born; the first woman to win the Pritzker Prize (2004). Made buildings that refuse right angles.',
      ar: 'ولدت في بغداد؛ أول امرأة تنال جائزة بريتزكر (٢٠٠٤). صممت مباني ترفض الزوايا القائمة.',
    },
  },
  {
    id: 'hanaa-malallah',
    name: { en: 'Hanaa Malallah', ar: 'هناء مال الله' },
    years: 'b. 1958',
    disciplines: ['painting'],
    note: {
      en: 'Her “ruins technique” burns, tears and layers material to record what war does to objects.',
      ar: 'تقنيتها «تقنية الخرائب» تحرق المواد وتمزقها وتراكمها لتوثّق ما تفعله الحرب بالأشياء.',
    },
  },
];

export const DISCIPLINES: Record<Discipline, Bilingual> = {
  painting: { en: 'Painting', ar: 'رسم' },
  sculpture: { en: 'Sculpture', ar: 'نحت' },
  letters: { en: 'Letters', ar: 'حروفية' },
  architecture: { en: 'Architecture', ar: 'عمارة' },
  print: { en: 'Print', ar: 'طباعة' },
  manuscript: { en: 'Manuscript', ar: 'مخطوطات' },
};

/* ------------------------------------------------------------------ */
/* Pop quiz                                                            */
/* ------------------------------------------------------------------ */

export type QuizQuestion = {
  q: Bilingual;
  options: Bilingual[];
  answer: number;
  why: Bilingual;
};

export const QUIZ: QuizQuestion[] = [
  {
    q: { en: 'Who made the Freedom Monument in Tahrir Square?', ar: 'من صنع نصب الحرية في ساحة التحرير؟' },
    options: [
      { en: 'Faiq Hassan', ar: 'فائق حسن' },
      { en: 'Jewad Selim', ar: 'جواد سليم' },
      { en: 'Mohammed Ghani Hikmat', ar: 'محمد غني حكمت' },
      { en: 'Your art teacher', ar: 'مدرّس الفنية' },
    ],
    answer: 1,
    why: {
      en: 'Jewad Selim. He died in 1961, months before it was unveiled.',
      ar: 'جواد سليم. توفي عام ١٩٦١ قبل أشهر من إزاحة الستار عنه.',
    },
  },
  {
    q: { en: 'Mesopotamians “signed” clay by rolling a…', ar: 'كان الرافدينيون «يوقّعون» على الطين بدحرجة…' },
    options: [
      { en: 'Rolling pin', ar: 'شوبك' },
      { en: 'Cylinder seal', ar: 'ختم أسطواني' },
      { en: 'Samoon', ar: 'صمونة' },
      { en: 'Coin', ar: 'عملة' },
    ],
    answer: 1,
    why: {
      en: 'A cylinder seal — a carved stone rolled across wet clay. Try it in the Seal Room below.',
      ar: 'الختم الأسطواني — حجر منقوش يُدحرج على الطين الرطب. جرّبه في غرفة الأختام في الأسفل.',
    },
  },
  {
    q: { en: 'The Ishtar Gate of Babylon was built under which king?', ar: 'في عهد أي ملك بُنيت بوابة عشتار في بابل؟' },
    options: [
      { en: 'Hammurabi', ar: 'حمورابي' },
      { en: 'Gilgamesh', ar: 'كلكامش' },
      { en: 'Nebuchadnezzar II', ar: 'نبوخذنصر الثاني' },
      { en: 'Sargon of Akkad', ar: 'سرجون الأكدي' },
    ],
    answer: 2,
    why: {
      en: 'Nebuchadnezzar II, around 575 BCE. Most of it now lives in a museum in Berlin.',
      ar: 'نبوخذنصر الثاني، حوالي ٥٧٥ قبل الميلاد. ومعظمها اليوم في متحف ببرلين.',
    },
  },
  {
    q: { en: 'Al-Wasiti’s famous 1237 illustrations accompany which text?', ar: 'رسوم الواسطي الشهيرة عام ١٢٣٧ ترافق أي نص؟' },
    options: [
      { en: 'Maqamat al-Hariri', ar: 'مقامات الحريري' },
      { en: 'One Thousand and One Nights', ar: 'ألف ليلة وليلة' },
      { en: 'The Epic of Gilgamesh', ar: 'ملحمة كلكامش' },
      { en: 'Kalila wa Dimna', ar: 'كليلة ودمنة' },
    ],
    answer: 0,
    why: {
      en: 'The Maqamat of al-Hariri — street life, markets and mischief in 13th-century Iraq.',
      ar: 'مقامات الحريري — حياة الشارع والأسواق والمقالب في عراق القرن الثالث عشر.',
    },
  },
  {
    q: { en: 'Which group did Shakir Hassan Al Said launch in 1971?', ar: 'أي جماعة أطلقها شاكر حسن آل سعيد عام ١٩٧١؟' },
    options: [
      { en: 'The Pioneers', ar: 'الرواد' },
      { en: 'New Vision', ar: 'الرؤية الجديدة' },
      { en: 'One Dimension', ar: 'البعد الواحد' },
      { en: 'The Spiky Hair Collective', ar: 'جماعة السبايكي' },
    ],
    answer: 2,
    why: {
      en: 'One Dimension (al-Bu‘d al-Wahid): the letter as a pure visual form.',
      ar: 'البعد الواحد: الحرف بوصفه شكلاً بصرياً خالصاً.',
    },
  },
  {
    q: { en: 'Zaha Hadid, first woman to win the Pritzker, was born in…', ar: 'زها حديد، أول امرأة تنال بريتزكر، ولدت في…' },
    options: [
      { en: 'London', ar: 'لندن' },
      { en: 'Beirut', ar: 'بيروت' },
      { en: 'Basra', ar: 'البصرة' },
      { en: 'Baghdad', ar: 'بغداد' },
    ],
    answer: 3,
    why: {
      en: 'Baghdad, 1950. Iraqi to the curve.',
      ar: 'بغداد، ١٩٥٠. عراقية حتى في المنحنيات.',
    },
  },
];

/* ------------------------------------------------------------------ */
/* Ticker                                                              */
/* ------------------------------------------------------------------ */

export const TICKER: Bilingual[] = [
  { en: 'Now showing: Aziza — Namaa Alward @ The Station', ar: 'يُعرض الآن: عزيزة — نماء الورد في المحطة' },
  { en: 'No grades. No uniforms. No attendance.', ar: 'بلا درجات. بلا زي موحد. بلا حضور وغياب.' },
  { en: 'Roll your own cylinder seal ↓', ar: 'دحرج ختمك الأسطواني ↓' },
  { en: 'The philosophy of the spiky haircut', ar: 'فلسفة السبايكي' },
  { en: 'I don’t want to be a CEO', ar: 'ما اريد اكون CEO' },
  { en: 'From Baghdad to the world', ar: 'من بغداد إلى العالم' },
];
