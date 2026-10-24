/**
 * The site's five sections, in the order the home page's curriculum shows
 * them. The menu, the footer and each page's § number all follow this list.
 */
export const SECTIONS = [
  { href: '/museum', key: 'museum', n: '01' },
  { href: '/blog', key: 'blog', n: '02' },
  { href: '/syllabus', key: 'syllabus', n: '03' },
  { href: '/timetable', key: 'timetable', n: '04' },
  { href: '/manifesto', key: 'manifesto', n: '05' },
] as const;

export type SectionKey = (typeof SECTIONS)[number]['key'];

export const sectionNumber = (key: SectionKey) => `§${SECTIONS.find((s) => s.key === key)!.n}`;
