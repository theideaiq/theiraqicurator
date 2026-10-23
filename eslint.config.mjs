import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Artwork images come from Supabase storage at arbitrary URLs.
      '@next/next/no-img-element': 'off',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
