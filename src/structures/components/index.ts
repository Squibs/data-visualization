// @index('./*.{ts,tsx}', (f) => `export { default as ${f.name} } from '${f.path}';`)
export { default as HomePage } from './HomePage';
export { default as ProjectList } from './ProjectList';
export { default as SEO } from './SEO';
// @endindex
