import { FACTS, getLesson, getQuestion, GOOD_DEEDS, LESSONS, PACKS, QUESTIONS, QUESTS, WORLDS } from '@/data';
import { ayahWords, getSurah, missingWordPuzzle, SURAHS } from '@/data/quran';
import { LANGUAGES, type LocalizedText } from '@/models';

/** Collects every LocalizedText-looking object inside a value. */
function localizedTexts(value: unknown, path = ''): { path: string; text: LocalizedText }[] {
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if ('en' in obj && 'de' in obj && 'bs' in obj) return [{ path, text: obj as unknown as LocalizedText }];
  return Object.entries(obj).flatMap(([k, v]) => localizedTexts(v, `${path}.${k}`));
}

describe('content integrity', () => {
  it('has six worlds in order', () => {
    expect(WORLDS.map((w) => w.id)).toEqual(['salah', 'prophets', 'quran', 'akhlaq', 'ramadan', 'arabic']);
    expect(WORLDS.map((w) => w.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(WORLDS[0].unlockRequirement).toBeNull();
  });

  it('uses unique ids', () => {
    for (const items of [QUESTS, LESSONS, QUESTIONS, FACTS, GOOD_DEEDS]) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('is translated into every language', () => {
    for (const pack of PACKS) {
      for (const { path, text } of localizedTexts(pack)) {
        for (const lang of LANGUAGES) {
          expect({ path, lang, ok: typeof text[lang] === 'string' && text[lang].trim().length > 0 }).toEqual({ path, lang, ok: true });
        }
      }
    }
  });

  it('lists the right quests in every world and has reachable unlock requirements', () => {
    for (const world of WORLDS) {
      const quests = QUESTS.filter((q) => q.worldId === world.id).sort((a, b) => a.order - b.order);
      expect(world.questIds).toEqual(quests.map((q) => q.id));
      expect(quests.map((q) => q.order)).toEqual(quests.map((_, i) => i + 1));
      if (world.unlockRequirement) {
        const required = QUESTS.filter((q) => q.worldId === world.unlockRequirement!.worldId);
        expect(world.unlockRequirement.questsCompleted).toBeLessThanOrEqual(required.length);
      }
    }
  });

  it('references only existing lessons and questions, each within its own world', () => {
    for (const quest of QUESTS) {
      expect(quest.steps.length).toBeGreaterThan(0);
      for (const step of quest.steps) {
        if (step.kind === 'lesson') expect(getLesson(step.lessonId)?.worldId).toBe(quest.worldId);
        if (step.kind === 'question') expect(getQuestion(step.questionId)?.worldId).toBe(quest.worldId);
        if (step.kind === 'recite') expect(getSurah(step.surahNumber)).toBeDefined();
        if (step.kind === 'tracing') expect(step.letters.length).toBeGreaterThan(0);
      }
    }
  });

  it('uses every lesson and question in some quest', () => {
    const used = new Set(QUESTS.flatMap((q) => q.steps.map((s) => (s.kind === 'lesson' ? s.lessonId : s.kind === 'question' ? s.questionId : ''))));
    for (const lesson of LESSONS) expect(used.has(lesson.id) ? lesson.id : `unused ${lesson.id}`).toBe(lesson.id);
    for (const question of QUESTIONS) expect(used.has(question.id) ? question.id : `unused ${question.id}`).toBe(question.id);
  });

  it('has well-formed questions', () => {
    for (const q of QUESTIONS) {
      switch (q.type) {
        case 'multipleChoice':
        case 'scenario':
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.options.some((o) => o.id === q.correctOptionId)).toBe(true);
          break;
        case 'ordering':
          expect(q.items.length).toBeGreaterThanOrEqual(3);
          break;
        case 'matching':
        case 'memory':
          expect(q.pairs.length).toBeGreaterThanOrEqual(3);
          break;
        case 'ayahOrder':
          expect(getSurah(q.surahNumber)?.ayahs.length).toBeGreaterThanOrEqual(3);
          break;
        case 'missingWord': {
          const puzzle = missingWordPuzzle(q.surahNumber, q.ayahNumber, q.missingWordIndex);
          expect(puzzle).not.toBeNull();
          expect(puzzle!.choices.length).toBe(4);
          expect(new Set(puzzle!.choices).size).toBe(4);
          break;
        }
        case 'trueFalse':
          expect(typeof q.correct).toBe('boolean');
          break;
      }
    }
  });

  it('every prophet story ends with "What did we learn?"', () => {
    for (const quest of QUESTS.filter((q) => q.kind === 'story')) {
      expect(quest.steps[0].kind).toBe('intro');
      expect(quest.steps[quest.steps.length - 1].kind).toBe('learned');
      expect(quest.steps.some((s) => s.kind === 'lesson')).toBe(true);
    }
  });

  it('attaches sources to every lesson about religious rulings or stories', () => {
    for (const lesson of LESSONS.filter((l) => l.worldId !== 'arabic' && l.id !== 'quran-structure' && l.id !== 'quran-makki-madani')) {
      expect({ id: lesson.id, hasSources: (lesson.sources?.length ?? 0) > 0 }).toEqual({ id: lesson.id, hasSources: true });
    }
  });
});

describe('verified Quran data', () => {
  it('contains the six short surahs with correct ayah counts', () => {
    expect(SURAHS.map((s) => [s.number, s.ayahs.length])).toEqual([
      [1, 7],
      [103, 3],
      [108, 3],
      [112, 4],
      [113, 5],
      [114, 6],
    ]);
    for (const s of SURAHS) {
      expect(s.ayahCount).toBe(s.ayahs.length);
      s.ayahs.forEach((a, i) => {
        expect(a.numberInSurah).toBe(i + 1);
        expect(ayahWords(a.arabic).length).toBeGreaterThan(0);
        for (const lang of LANGUAGES) expect(a.translation[lang].length).toBeGreaterThan(0);
      });
    }
  });

  it('does not prefix the Basmala to ayah 1 of surahs other than Al-Fatiha', () => {
    for (const s of SURAHS.filter((x) => x.number !== 1)) {
      expect(s.ayahs[0].arabic.startsWith('بِسْمِ')).toBe(false);
    }
  });
});
