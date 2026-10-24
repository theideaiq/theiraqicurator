-- Syllabus, pop quiz and manifesto become editable from the staff room.
-- Safe to run more than once; seeds only empty tables.

create table if not exists public.syllabus_artists (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text not null default '',
  years text not null default '',
  disciplines text[] not null default '{}',
  note_en text not null default '',
  note_ar text not null default '',
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_ar text not null default '',
  -- [{ "en": "...", "ar": "..." }, ...] — two to four choices
  options jsonb not null default '[]',
  answer integer not null default 0 check (answer >= 0),
  why_en text not null default '',
  why_ar text not null default '',
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.manifesto_rules (
  id uuid primary key default gen_random_uuid(),
  rule_en text not null,
  rule_ar text not null default '',
  sort integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.syllabus_artists enable row level security;
drop policy if exists "public reads published syllabus_artists" on public.syllabus_artists;
create policy "public reads published syllabus_artists" on public.syllabus_artists for select using (published = true or public.is_staff());
drop policy if exists "staff writes syllabus_artists" on public.syllabus_artists;
create policy "staff writes syllabus_artists" on public.syllabus_artists for all using (public.is_staff()) with check (public.is_staff());

alter table public.quiz_questions enable row level security;
drop policy if exists "public reads published quiz_questions" on public.quiz_questions;
create policy "public reads published quiz_questions" on public.quiz_questions for select using (published = true or public.is_staff());
drop policy if exists "staff writes quiz_questions" on public.quiz_questions;
create policy "staff writes quiz_questions" on public.quiz_questions for all using (public.is_staff()) with check (public.is_staff());

alter table public.manifesto_rules enable row level security;
drop policy if exists "public reads published manifesto_rules" on public.manifesto_rules;
create policy "public reads published manifesto_rules" on public.manifesto_rules for select using (published = true or public.is_staff());
drop policy if exists "staff writes manifesto_rules" on public.manifesto_rules;
create policy "staff writes manifesto_rules" on public.manifesto_rules for all using (public.is_staff()) with check (public.is_staff());

insert into public.syllabus_artists (name_en, name_ar, years, disciplines, note_en, note_ar, sort)
select * from (values
  ('Yahya al-Wasiti', 'يحيى الواسطي', '13th c.', array['manuscript', 'painting']::text[], 'Illustrated the Maqamat al-Hariri in Baghdad in 1237 — the founding image-bank of Arab painting.', 'زوّق مقامات الحريري في بغداد سنة ١٢٣٧ — الأرشيف البصري المؤسس للتصوير العربي.', 10),
  ('Madiha Omar', 'مديحة عمر', '1908–2005', array['painting', 'letters']::text[], 'A pioneer of hurufiyya — turning the Arabic letter into pure abstraction, decades before it was a movement.', 'رائدة الحروفية — حوّلت الحرف العربي إلى تجريد خالص قبل أن يصبح تياراً بعقود.', 20),
  ('Faiq Hassan', 'فائق حسن', '1914–1992', array['painting']::text[], 'Founded the Société Primitive (al-Ruwwad) and taught generations of painters at the Institute of Fine Arts.', 'أسس جماعة الرواد ودرّس أجيالاً من الرسامين في معهد الفنون الجميلة.', 30),
  ('Jewad Selim', 'جواد سليم', '1919–1961', array['sculpture', 'painting']::text[], 'Co-founded the Baghdad Group for Modern Art in 1951 and made Nasb al-Hurriyah, the Freedom Monument in Tahrir Square.', 'شارك في تأسيس جماعة بغداد للفن الحديث عام ١٩٥١ وصنع نصب الحرية في ساحة التحرير.', 40),
  ('Shakir Hassan Al Said', 'شاكر حسن آل سعيد', '1925–2004', array['painting', 'letters']::text[], 'Philosopher-painter of walls, letters and Sufi silence; launched the One Dimension group in 1971.', 'فيلسوف الجدران والحروف والصمت الصوفي؛ أطلق جماعة البعد الواحد عام ١٩٧١.', 50),
  ('Naziha Salim', 'نزيهة سليم', '1927–2008', array['painting']::text[], 'Painted the women of rural Iraq with tenderness and colour; a member of al-Ruwwad.', 'رسمت نساء الريف العراقي بحنان ولون؛ وكانت عضواً في جماعة الرواد.', 60),
  ('Lorna Selim', 'لورنا سليم', '1928–2021', array['painting']::text[], 'Sheffield-born, Baghdad-made: painted the city’s alleys and shanasheel for decades.', 'ولدت في شيفيلد وتكوّنت في بغداد: رسمت أزقة المدينة وشناشيلها لعقود.', 70),
  ('Mahmoud Sabri', 'محمود صبري', '1927–2012', array['painting']::text[], 'Went from political realism to “Quantum Realism” — painting the atomic structure of things.', 'انتقل من الواقعية السياسية إلى «واقعية الكم» — رسم البنية الذرية للأشياء.', 80),
  ('Mohammed Ghani Hikmat', 'محمد غني حكمت', '1929–2011', array['sculpture']::text[], 'Gave Baghdad its public storytellers in bronze: Kahramana, Shahrazad and Shahryar.', 'منح بغداد حكّائيها البرونزيين: كهرمانة وشهرزاد وشهريار.', 90),
  ('Kadhim Hayder', 'كاظم حيدر', '1932–1985', array['painting']::text[], 'His 1965 series “The Epic of the Martyr” turned Karbala into modernist theatre.', 'حوّلت سلسلته «ملحمة الشهيد» عام ١٩٦٥ كربلاء إلى مسرح حداثي.', 100),
  ('Ismail Fattah', 'إسماعيل فتاح الترك', '1934–2004', array['sculpture', 'painting']::text[], 'Designed the split turquoise dome of the Martyr’s Monument (al-Shaheed), Baghdad, 1983.', 'صمم القبة الفيروزية المشطورة لنصب الشهيد في بغداد عام ١٩٨٣.', 110),
  ('Dia al-Azzawi', 'ضياء العزاوي', 'b. 1939', array['painting', 'print']::text[], 'Co-founded the New Vision group (1969); his Sabra and Shatila drawing is one of the century’s great anti-war works.', 'شارك في تأسيس جماعة الرؤية الجديدة (١٩٦٩)؛ ولوحته صبرا وشاتيلا من أعظم أعمال القرن ضد الحرب.', 120),
  ('Rafa al-Nasiri', 'رافع الناصري', '1940–2013', array['print', 'painting']::text[], 'Brought modern printmaking to Iraq after studying in Beijing and Lisbon; taught it to everyone.', 'أدخل الحفر الطباعي الحديث إلى العراق بعد دراسته في بكين ولشبونة، وعلّمه للجميع.', 130),
  ('Zaha Hadid', 'زها حديد', '1950–2016', array['architecture']::text[], 'Baghdad-born; the first woman to win the Pritzker Prize (2004). Made buildings that refuse right angles.', 'ولدت في بغداد؛ أول امرأة تنال جائزة بريتزكر (٢٠٠٤). صممت مباني ترفض الزوايا القائمة.', 140),
  ('Hanaa Malallah', 'هناء مال الله', 'b. 1958', array['painting']::text[], 'Her “ruins technique” burns, tears and layers material to record what war does to objects.', 'تقنيتها «تقنية الخرائب» تحرق المواد وتمزقها وتراكمها لتوثّق ما تفعله الحرب بالأشياء.', 150)
) as seed(name_en, name_ar, years, disciplines, note_en, note_ar, sort)
where not exists (select 1 from public.syllabus_artists);

insert into public.quiz_questions (question_en, question_ar, options, answer, why_en, why_ar, sort)
select * from (values
  ('Who made the Freedom Monument in Tahrir Square?', 'من صنع نصب الحرية في ساحة التحرير؟', '[{"en":"Faiq Hassan","ar":"فائق حسن"},{"en":"Jewad Selim","ar":"جواد سليم"},{"en":"Mohammed Ghani Hikmat","ar":"محمد غني حكمت"},{"en":"Your art teacher","ar":"مدرّس الفنية"}]'::jsonb, 1, 'Jewad Selim. He died in 1961, months before it was unveiled.', 'جواد سليم. توفي عام ١٩٦١ قبل أشهر من إزاحة الستار عنه.', 10),
  ('Mesopotamians “signed” clay by rolling a…', 'كان الرافدينيون «يوقّعون» على الطين بدحرجة…', '[{"en":"Rolling pin","ar":"شوبك"},{"en":"Cylinder seal","ar":"ختم أسطواني"},{"en":"Samoon","ar":"صمونة"},{"en":"Coin","ar":"عملة"}]'::jsonb, 1, 'A cylinder seal — a carved stone rolled across wet clay. Try it in the Seal Room below.', 'الختم الأسطواني — حجر منقوش يُدحرج على الطين الرطب. جرّبه في غرفة الأختام في الأسفل.', 20),
  ('The Ishtar Gate of Babylon was built under which king?', 'في عهد أي ملك بُنيت بوابة عشتار في بابل؟', '[{"en":"Hammurabi","ar":"حمورابي"},{"en":"Gilgamesh","ar":"كلكامش"},{"en":"Nebuchadnezzar II","ar":"نبوخذنصر الثاني"},{"en":"Sargon of Akkad","ar":"سرجون الأكدي"}]'::jsonb, 2, 'Nebuchadnezzar II, around 575 BCE. Most of it now lives in a museum in Berlin.', 'نبوخذنصر الثاني، حوالي ٥٧٥ قبل الميلاد. ومعظمها اليوم في متحف ببرلين.', 30),
  ('Al-Wasiti’s famous 1237 illustrations accompany which text?', 'رسوم الواسطي الشهيرة عام ١٢٣٧ ترافق أي نص؟', '[{"en":"Maqamat al-Hariri","ar":"مقامات الحريري"},{"en":"One Thousand and One Nights","ar":"ألف ليلة وليلة"},{"en":"The Epic of Gilgamesh","ar":"ملحمة كلكامش"},{"en":"Kalila wa Dimna","ar":"كليلة ودمنة"}]'::jsonb, 0, 'The Maqamat of al-Hariri — street life, markets and mischief in 13th-century Iraq.', 'مقامات الحريري — حياة الشارع والأسواق والمقالب في عراق القرن الثالث عشر.', 40),
  ('Which group did Shakir Hassan Al Said launch in 1971?', 'أي جماعة أطلقها شاكر حسن آل سعيد عام ١٩٧١؟', '[{"en":"The Pioneers","ar":"الرواد"},{"en":"New Vision","ar":"الرؤية الجديدة"},{"en":"One Dimension","ar":"البعد الواحد"},{"en":"The Spiky Hair Collective","ar":"جماعة السبايكي"}]'::jsonb, 2, 'One Dimension (al-Bu‘d al-Wahid): the letter as a pure visual form.', 'البعد الواحد: الحرف بوصفه شكلاً بصرياً خالصاً.', 50),
  ('Zaha Hadid, first woman to win the Pritzker, was born in…', 'زها حديد، أول امرأة تنال بريتزكر، ولدت في…', '[{"en":"London","ar":"لندن"},{"en":"Beirut","ar":"بيروت"},{"en":"Basra","ar":"البصرة"},{"en":"Baghdad","ar":"بغداد"}]'::jsonb, 3, 'Baghdad, 1950. Iraqi to the curve.', 'بغداد، ١٩٥٠. عراقية حتى في المنحنيات.', 60)
) as seed(question_en, question_ar, options, answer, why_en, why_ar, sort)
where not exists (select 1 from public.quiz_questions);

insert into public.manifesto_rules (rule_en, rule_ar, sort)
select * from (values
  ('Art is not a subject. It is a way of looking.', 'الفن مو مادة. هو طريقة نظر.', 10),
  ('Baghdad is the classroom. The street is the textbook.', 'بغداد هي الصف. والشارع هو الكتاب.', 20),
  ('Mesopotamia invented writing. We are just finishing the homework.', 'بلاد الرافدين اخترعت الكتابة. احنا بس دا نكمّل الواجب.', 30),
  ('A samoon is a sculpture you can eat.', 'الصمونة منحوتة تنأكل.', 40),
  ('No grades. Curiosity is the only attendance sheet.', 'ماكو درجات. الفضول هو دفتر الحضور الوحيد.', 50),
  ('Arabic and English share the same desk.', 'العربي والإنكليزي يگعدون على نفس الرحلة.', 60),
  ('Tape it to the wall. Frames are optional.', 'الصقها بالشريط على الحايط. البراويز اختيارية.', 70),
  ('Everyone is an artist until the bell rings. And after.', 'الكل فنانين لحد ما يدگ الجرس. وبعده هم.', 80)
) as seed(rule_en, rule_ar, sort)
where not exists (select 1 from public.manifesto_rules);
