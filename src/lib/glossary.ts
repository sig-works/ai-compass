import glossarySections from '@/data/glossary.json';

export interface GlossaryTerm {
  id?: string;
  term: string;
  category: string;
  reading?: string;
  fullName?: string;
  plainSummary: string;
  meaning: string;
  usageInAi: string;
  workflow: string[];
  example: string;
  misconception: string;
  relatedTerms: string[];
  sourceNames: string[];
  aliases?: string[];
  keywords?: string[];
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
  if (term.id) {
    TERM_INDEX.set(term.id.toLowerCase(), term);
  }
  TERM_INDEX.set(term.term.toLowerCase(), term);
  if (term.reading) {
    TERM_INDEX.set(term.reading.toLowerCase(), term);
  }
  if (term.fullName) {
    TERM_INDEX.set(term.fullName.toLowerCase(), term);
  }
  for (const alias of term.aliases ?? []) {
    TERM_INDEX.set(alias.toLowerCase(), term);
  }
  for (const keyword of term.keywords ?? []) {
    TERM_INDEX.set(keyword.toLowerCase(), term);
  }
}

export function findGlossaryTerm(term: string) {
  return TERM_INDEX.get(term.toLowerCase());
}
