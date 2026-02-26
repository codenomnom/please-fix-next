import type { MarkdownModule } from '../types/content';

export function pathToLang(path: string) {
  return path.match(/\/data\/([^/]+)\//)?.[1] ?? 'en';
}

export function getAvailableLanguages() {
  // no `eager: true` because we don't need the content, just the paths
  const modules = import.meta.glob('../data/**/*.{md,mdx}'); // only literals
  const langs = Object.keys(modules).map(pathToLang);
  return [...new Set(langs)]; // ex: ['en', 'es', 'fr']
}

export function getAllContentFiles() {
  const modules = import.meta.glob<MarkdownModule>('../data/**/*.{md,mdx}', { eager: true });
  return Object.entries(modules).map(([path, mod]) => {
    const lang = pathToLang(path);
    return { path, mod, lang };
  });
}