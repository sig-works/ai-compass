import glossarySections from '@/data/glossary.json';

export interface GlossaryTerm {
  term: string;
  category: string;
  plainSummary: string;
  meaning: string;
  usageInAi: string;
  workflow: string[];
  example: string;
  misconception: string;
  relatedTerms: string[];
  sourceNames: string[];
  aliases?: string[];
}

export interface GlossarySection {
  id: string;
  title: string;
  description: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY_SECTIONS = glossarySections as GlossarySection[];

export const GLOSSARY_TERMS = GLOSSARY_SECTIONS.flatMap((section) => section.terms);

const TERM_INDEX = new Map<string, GlossaryTerm>();

for (const term of GLOSSARY_TERMS) {
  TERM_INDEX.set(term.term.toLowerCase(), term);
  for (const alias of term.aliases ?? []) {
    TERM_INDEX.set(alias.toLowerCase(), term);
  }
}

export function findGlossaryTerm(term: string) {
  return TERM_INDEX.get(term.toLowerCase());
}
