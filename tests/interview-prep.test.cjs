'use strict';

// Run with: node --test interview-prep-pro/tests/interview-prep.test.cjs
// Only repository-authored educational strings are evaluated, never user input.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');
const core = require('../study-core.js');

const ROOT = path.resolve(__dirname, '..');
const TIMEOUT_MS = 5000;
const DATA_FILES = ['senior-content.js', 'coding-content.js', 'script.js'];
const dataSource = DATA_FILES.map(name => fs.readFileSync(path.join(ROOT, name), 'utf8')).join('\n;\n');

function loadData() {
  const context = vm.createContext(Object.create(null));
  // Classic-script const bindings share one lexical scope; capture after merging.
  vm.runInContext(`${dataSource}\n;globalThis.captured = {
    topics, questionBank, codingProblems, practiceRounds
  };`, context, { filename: 'interview-prep-data.js', timeout: TIMEOUT_MS });
  return { context, data: context.captured };
}

const loaded = loadData();
// Cross the data-only boundary once. Core fixtures/expected values now belong to
// Node's realm. Do NOT do this to coding outputs: their identity is meaningful.
const { topics, questionBank, codingProblems, practiceRounds } = JSON.parse(JSON.stringify(loaded.data));
const contentTopics = topics.filter(topic => Object.hasOwn(questionBank, topic.id));
const records = core.createCatalog(topics, questionBank);
const ids = records.map(record => record.id);
const originalData = JSON.stringify({ topics, questionBank, codingProblems, practiceRounds });

function nonempty(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim().length > 0, `${label} must not be blank`);
}

function normalizedTitle(title) {
  return core.plainText(title).replace(/\s+/g, ' ').trim().toLowerCase();
}

function defaultProgress() {
  return {
    version: 1, theme: 'light', bookmarkedIds: [], masteredIds: [], lastTopic: 'javascript',
    mock: { round: 0, question: 0, completed: false, ratings: {} },
  };
}

function sanitize(input) {
  return core.sanitizeProgress(input, records, practiceRounds);
}

function storageWith(raw = null) {
  const values = new Map(raw === null ? [] : [[core.STORAGE_KEY, raw]]);
  const calls = [];
  return {
    calls,
    getItem(key) { calls.push(['get', key]); return values.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key, value]); values.set(key, value); },
  };
}

async function runAuthoredSample(item) {
  const timeouts = new Set(), intervals = new Set();
  let deadline;
  const context = vm.createContext({
    // Keep Object, Array, Promise and all Error constructors native to the VM.
    // Both solution outputs and expected literals are created inside that realm,
    // so the injected strict assert compares matching prototypes, not host ones.
    assert, AbortController, AbortSignal, DOMException, performance, queueMicrotask,
    fetch() { throw new Error('Unexpected network request in an authored sample'); },
    setTimeout(callback, delay, ...args) {
      const handle = setTimeout(() => {
        timeouts.delete(handle);
        callback(...args);
      }, delay);
      timeouts.add(handle);
      return handle;
    },
    clearTimeout(handle) { timeouts.delete(handle); clearTimeout(handle); },
    setInterval(callback, delay, ...args) {
      const handle = setInterval(callback, delay, ...args);
      intervals.add(handle);
      return handle;
    },
    clearInterval(handle) { intervals.delete(handle); clearInterval(handle); },
  });
  let solution = item.jsCode;
  if (item.id === 'coding-vue-race-safe-fetch') {
    const vueImport = /^import \{ shallowRef, watch, onScopeDispose \} from 'vue';$/gm;
    assert.equal((solution.match(vueImport) || []).length, 1, 'Strip only the known Vue import');
    solution = solution.replace(vueImport, '');
    // useRaceSafeFetch remains defined, but the authored test calls only the
    // framework-neutral createLatestRequest. No fake Vue implementation needed.
  }
  try {
    const result = vm.runInContext(`(async function () {
      'use strict';
      ${solution}
      ${item.tests}
    })()`, context, {
      filename: `${item.id || 'original-coding-sample'}.js`, timeout: TIMEOUT_MS,
    });
    // VM's execution timeout covers synchronous code, not an unsettled promise.
    // A host-owned deadline bounds the async result and observes its rejection.
    await Promise.race([
      result,
      new Promise((_, reject) => {
        deadline = setTimeout(() => reject(new Error(`Sample exceeded ${TIMEOUT_MS} ms`)), TIMEOUT_MS);
      }),
    ]);
  } finally {
    clearTimeout(deadline);
    for (const handle of timeouts) clearTimeout(handle);
    for (const handle of intervals) clearInterval(handle);
  }
}

test('data scripts load, merge and assemble practice with no document, window or storage', () => {
  assert.equal(vm.runInContext('typeof document', loaded.context), 'undefined');
  assert.equal(vm.runInContext('typeof window', loaded.context), 'undefined');
  assert.equal(vm.runInContext('typeof localStorage', loaded.context), 'undefined');
  assert.equal(vm.runInContext('typeof fetch', loaded.context), 'undefined');
  assert.equal(loaded.data.questionBank.coding.items, loaded.data.codingProblems);
  const again = loadData();
  assert.equal(again.data.codingProblems.length, codingProblems.length, 'Fresh loads do not accumulate additions');
  assert.equal(JSON.stringify(again.data), JSON.stringify(loaded.data));
});

test('catalog meets curriculum minimums with 35 populated content topics', t => {
  assert.ok(records.length >= 425, `Expected >=425 records, found ${records.length}`);
  assert.equal(contentTopics.length, 35);
  assert.equal(new Set(contentTopics.map(topic => topic.id)).size, 35);
  assert.deepEqual(new Set(records.map(record => record.topicId)), new Set(contentTopics.map(topic => topic.id)));
  for (const [type, minimum] of [['coding', 40], ['scenario', 35], ['debug', 25]]) {
    assert.ok(records.filter(record => record.type === type).length >= minimum, `${type} needs >=${minimum}`);
  }
  assert.equal(records.length, Object.values(questionBank).reduce((sum, bank) => sum + bank.items.length, 0));
  assert.equal(records.some(record => ['mock-interview', 'prep-plan'].includes(record.topicId)), false);
  t.diagnostic(`${records.length} records; ${contentTopics.length} topics; ${codingProblems.length} coding samples; ${practiceRounds.length} rounds`);
});

test('catalog IDs are globally unique, with normalized titles unique within each topic', () => {
  assert.equal(new Set(ids).size, ids.length);
  for (const topic of contentTopics) {
    const titles = records.filter(record => record.topicId === topic.id).map(record => normalizedTitle(record.title));
    assert.equal(new Set(titles).size, titles.length, `Duplicate title in ${topic.id}`);
  }
});

const requiredFields = {
  qa: ['q', 'testing', 'answer'],
  output: ['code', 'output', 'explanation'],
  coding: ['problem', 'approach', 'jsCode', 'tsCode', 'explanation', 'complexity', 'followup', 'examples', 'constraints', 'edgeCases', 'tests'],
  debug: ['title', 'symptoms', 'causes', 'investigation', 'devtools', 'solution', 'prevention'],
};

for (const topic of contentTopics) {
  test(`topic schema: ${topic.id}`, () => {
    nonempty(topic.label, `${topic.id}.label`);
    nonempty(topic.group, `${topic.id}.group`);
    const bank = questionBank[topic.id];
    assert.ok(Object.hasOwn(requiredFields, bank.type), `Unknown bank type: ${bank.type}`);
    assert.ok(bank.items.length > 0, `${topic.id} must be populated`);
    const topicRecords = records.filter(record => record.topicId === topic.id);
    assert.equal(topicRecords.length, bank.items.length);
    bank.items.forEach((item, index) => {
      for (const field of requiredFields[bank.type]) nonempty(item[field], `${topic.id}[${index}].${field}`);
      const record = topicRecords[index];
      nonempty(record.id, `${topic.id}[${index}].id`);
      nonempty(record.title, `${record.id}.title`);
      assert.equal(record.item, item);
      assert.equal(record.ordinal, index + 1);
      assert.equal(record.topicLabel, topic.label);
      assert.equal(record.group, topic.group);
      assert.equal(record.type, topic.id === 'scenario' ? 'scenario' : bank.type);
      assert.ok(core.DIFFICULTIES.includes(record.difficulty), `${record.id}.difficulty`);
      assert.equal(record.searchText, record.searchText.toLowerCase());
      if (item.id) {
        assert.equal(record.id, item.id, 'Explicit IDs must be preserved');
        assert.ok(core.DIFFICULTIES.includes(item.difficulty));
        assert.ok(Array.isArray(item.tags) && item.tags.length > 0, `${item.id}.tags`);
        for (const tag of item.tags) nonempty(tag, `${item.id}.tag`);
      }
    });
  });
}

test('all 56 coding exercises include examples, constraints, edge cases, runnable tests and both languages', () => {
  assert.equal(codingProblems.length, 56);
  assert.equal(questionBank.coding.items.length, 56);
  for (const item of codingProblems) {
    for (const field of requiredFields.coding) nonempty(item[field], `${item.id || item.problem}.${field}`);
    assert.match(item.tests, /assert\./, 'Tests need executable assertions, not only prose');
    assert.notEqual(item.jsCode, item.tsCode, 'TypeScript should not simply duplicate untyped JavaScript');
  }
});

test('new scenario entries include diagnosis, mitigation, tradeoffs, verification and follow-ups', () => {
  const authored = questionBank.scenario.items.filter(item => item.id);
  assert.ok(authored.length > 0);
  for (const item of authored) {
    for (const field of ['diagnosis', 'mitigation', 'answer', 'tradeoffs', 'verification', 'mistake', 'followupQ', 'followupA']) {
      nonempty(item[field], `${item.id}.${field}`);
    }
  }
});

test('all 33 practice questions resolve to real catalog prompts and meaningful answers', () => {
  assert.equal(practiceRounds.length, 13);
  assert.equal(practiceRounds.reduce((sum, round) => sum + round.questions.length, 0), 33);
  assert.equal(new Set(practiceRounds.map(round => round.title)).size, practiceRounds.length);
  const byTitle = new Map(records.map(record => [record.title, record]));
  const seen = new Set();
  for (const round of practiceRounds) {
    nonempty(round.title, 'round.title');
    assert.ok(round.questions.length > 0);
    for (const question of round.questions) {
      nonempty(question.question, `${round.title}.question`);
      nonempty(question.modelAnswer, `${round.title}.modelAnswer`);
      assert.ok(!seen.has(question.question), `Duplicate practice prompt: ${question.question}`);
      seen.add(question.question);
      const record = byTitle.get(question.question);
      assert.ok(record, `Unresolved practice prompt: ${question.question}`);
      const item = record.item;
      const expected = item.answer || [item.approach, item.explanation, item.complexity].filter(Boolean).join('\n\n') || item.solution;
      assert.equal(question.modelAnswer, expected);
      assert.doesNotMatch(question.modelAnswer, /\bundefined\b|\[object Object\]/);
      assert.ok(Array.isArray(question.checklist) && question.checklist.length >= 2);
      for (const point of question.checklist) nonempty(point, `${round.title}.checklist`);
    }
  }
});

test('createCatalog preserves stable IDs when all topics and banks are reordered', () => {
  const reorderedBanks = Object.fromEntries(Object.entries(questionBank).map(([id, bank]) => [id, {
    ...bank, items: bank.items.slice().reverse(),
  }]));
  const reordered = core.createCatalog(topics.slice().reverse(), reorderedBanks);
  const originalIds = new Map(records.map(record => [record.item, record.id]));
  assert.equal(reordered.length, records.length);
  for (const record of reordered) assert.equal(record.id, originalIds.get(record.item));
  assert.notEqual(reordered[0].id, records[0].id, 'Exercise an actual reorder');
  const outputs = reordered.filter(record => record.type === 'output');
  assert.equal(outputs[0].id, records.filter(record => record.type === 'output').at(-1).id);
  assert.equal(outputs[0].ordinal, 1, 'Ordinal can change without changing identity');
});

test('createCatalog skips navigation-only topics and allows equivalent titles in different topics', () => {
  const definitions = [{ id: 'a', label: 'A', group: 'Core' }, { id: 'b', label: 'B', group: 'Core' }, { id: 'nav' }];
  const banks = { a: { type: 'qa', items: [{ q: 'What is state?', answer: 'A' }] },
    b: { type: 'qa', items: [{ q: 'What is state?', answer: 'B' }] } };
  const result = core.createCatalog(definitions, banks);
  assert.equal(result.length, 2);
  assert.notEqual(result[0].id, result[1].id);
  assert.equal(result[0].title, result[1].title);
});

test('createCatalog honors explicit difficulty and otherwise infers foundation or senior', () => {
  const definitions = [{ id: 'a', label: 'A', group: 'Core' }];
  const bank = { type: 'qa', items: [
    { q: 'What is state?' }, { q: 'Investigate stale state.' },
    { q: 'Explain state.', difficulty: 'advanced' }, { q: 'What is a store?', difficulty: 'impossible' },
  ] };
  assert.deepEqual(core.createCatalog(definitions, { a: bank }).map(record => record.difficulty),
    ['foundation', 'senior', 'advanced', 'foundation']);
});

test('createCatalog rejects explicit duplicate IDs within or across topics', () => {
  const a = { id: 'a', label: 'A', group: 'Core' }, b = { id: 'b', label: 'B', group: 'Core' };
  const first = { id: 'duplicate', q: 'First' }, second = { id: 'duplicate', q: 'Second' };
  assert.throws(() => core.createCatalog([a], { a: { type: 'qa', items: [first, second] } }), /Duplicate question ID/);
  assert.throws(() => core.createCatalog([a, b], {
    a: { type: 'qa', items: [first] }, b: { type: 'qa', items: [second] },
  }), /Duplicate question ID/);
});

test('createCatalog rejects implicit duplicate identities instead of silently losing questions', () => {
  assert.throws(() => core.createCatalog([{ id: 'a', label: 'A', group: 'Core' }], {
    a: { type: 'qa', items: [{ q: 'Same' }, { q: 'Same' }] },
  }), /Duplicate question ID/);
});

test('stableHash is deterministic and content-sensitive', () => {
  assert.equal(core.stableHash('same text'), core.stableHash('same text'));
  assert.notEqual(core.stableHash('same text'), core.stableHash('different text'));
  assert.match(core.stableHash(''), /^[a-z0-9]+$/);
});

test('filters default to the complete catalog and all-valued selectors are neutral', () => {
  assert.deepEqual(core.filterRecords(records), records);
  assert.deepEqual(core.filterRecords(records, {
    topicId: 'all', type: 'all', difficulty: 'all', status: 'all', query: ' \t\n ',
  }), records);
});

test('global code search finds AbortController across QA and JS/TS coding content', () => {
  const result = core.filterRecords(records, { query: '  AbortController  ' });
  assert.ok(result.length > 0);
  assert.ok(result.some(record => record.type === 'qa'));
  assert.ok(result.some(record => record.id === 'coding-abortable-timeout'));
  assert.ok(result.some(record => record.id === 'coding-vue-race-safe-fetch'));
  for (const record of result) assert.ok(record.searchText.includes('abortcontroller'));
  assert.deepEqual(core.filterRecords(records, { query: 'abortcontroller' }), result);
});

test('search combines whitespace-separated terms with AND and includes answers, tags and code', () => {
  const result = core.filterRecords(records, { query: 'abortcontroller   signal' });
  assert.ok(result.length > 0);
  for (const record of result) {
    assert.ok(record.searchText.includes('abortcontroller'));
    assert.ok(record.searchText.includes('signal'));
  }
  const dedupe = records.find(record => record.id === 'coding-inflight-dedupe');
  assert.ok(core.filterRecords([dedupe], { query: 'pending.delete' }).length === 1, 'Search solution bodies');
  assert.ok(core.filterRecords([dedupe], { query: 'samevaluezero' }).length === 1, 'Search constraints/answer text');
  assert.ok(core.filterRecords([dedupe], { query: 'identity' }).length === 1, 'Search metadata');
  assert.deepEqual(core.filterRecords(records, { query: 'abortcontroller definitely-not-an-authored-term-92841' }), []);
});

test('category/view, topic, type, query and difficulty filters intersect', () => {
  const result = core.filterRecords(records, {
    view: 'coding', topicId: 'coding', type: 'coding', difficulty: 'advanced', query: 'abortcontroller signal',
  });
  assert.ok(result.length > 0);
  for (const record of result) {
    assert.equal(record.topicId, 'coding');
    assert.equal(record.type, 'coding');
    assert.equal(record.difficulty, 'advanced');
    assert.ok(record.searchText.includes('abortcontroller') && record.searchText.includes('signal'));
  }
  assert.deepEqual(core.filterRecords(records, { view: 'coding', topicId: 'html', query: 'semantic' }), []);
});

test('coding and scenarios views select truthful record categories', () => {
  assert.deepEqual(core.filterRecords(records, { view: 'coding' }), records.filter(record => record.type === 'coding'));
  const scenarios = core.filterRecords(records, { view: 'scenarios' });
  assert.deepEqual(scenarios, records.filter(record => record.type === 'scenario' || record.type === 'debug'));
  assert.ok(scenarios.some(record => record.type === 'scenario'));
  assert.ok(scenarios.some(record => record.type === 'debug'));
  assert.ok(scenarios.every(record => record.type !== 'qa'));
});

for (const difficulty of ['foundation', 'senior', 'advanced']) {
  test(`difficulty filter: ${difficulty}`, () => {
    const result = core.filterRecords(records, { difficulty });
    assert.ok(result.length > 0);
    assert.deepEqual(result, records.filter(record => record.difficulty === difficulty));
  });
}

for (const type of ['qa', 'output', 'coding', 'scenario', 'debug']) {
  test(`type filter: ${type}`, () => {
    const result = core.filterRecords(records, { type });
    assert.ok(result.length > 0);
    assert.deepEqual(result, records.filter(record => record.type === type));
  });
}

test('saved view and saved status use bookmarks, independently of mastery', () => {
  const bookmarks = new Set([ids[0], ids[1], 'removed-id']), mastered = new Set([ids[1], ids[2]]);
  assert.deepEqual(core.filterRecords(records, { view: 'saved' }, bookmarks, mastered), records.slice(0, 2));
  assert.deepEqual(core.filterRecords(records, { status: 'saved' }, bookmarks, mastered), records.slice(0, 2));
  assert.deepEqual(core.filterRecords(records, { view: 'saved', status: 'mastered' }, bookmarks, mastered), [records[1]]);
  assert.deepEqual(core.filterRecords(records, { view: 'saved', status: 'unmastered' }, bookmarks, mastered), [records[0]]);
  assert.deepEqual(core.filterRecords(records, { view: 'saved' }), []);
});

test('mastered/unmastered filters are complementary and do not mutate progress sets', () => {
  const bookmarks = new Set([ids[0]]), mastered = new Set([ids[1], ids[2], 'removed-id']);
  const before = [...mastered];
  const done = core.filterRecords(records, { status: 'mastered' }, bookmarks, mastered);
  const todo = core.filterRecords(records, { status: 'unmastered' }, bookmarks, mastered);
  assert.deepEqual(done, [records[1], records[2]]);
  assert.equal(done.length + todo.length, records.length);
  assert.ok(todo.every(record => !mastered.has(record.id)));
  assert.deepEqual([...mastered], before);
  assert.deepEqual([...bookmarks], [ids[0]]);
});

test('saved/mastered status still combines with category, topic, difficulty and query', () => {
  const chosen = records.find(record => record.id === 'coding-abortable-timeout');
  const saved = new Set([chosen.id, ids[0]]), mastered = new Set([chosen.id]);
  const filters = { view: 'saved', status: 'mastered', topicId: 'coding', type: 'coding', difficulty: 'advanced', query: 'deadline signal' };
  assert.deepEqual(core.filterRecords(records, filters, saved, mastered), [chosen]);
  assert.deepEqual(core.filterRecords(records, { ...filters, query: 'missing-query-93847' }, saved, mastered), []);
});

test('pagination defaults to 20 without changing total, ordering or record identities', () => {
  const page = core.paginate(records);
  assert.deepEqual(page, { items: records.slice(0, 20), total: records.length, hasMore: true });
  assert.notEqual(page.items, records);
  assert.equal(page.items[0], records[0]);
});

test('pagination grows a stable prefix and correctly reports exhaustion', () => {
  const first = core.paginate(records, 20), next = core.paginate(records, 40);
  assert.deepEqual(next.items.slice(0, 20), first.items);
  assert.equal(next.items.length, 40);
  assert.equal(next.total, records.length);
  assert.equal(core.paginate(records, records.length).hasMore, false);
  assert.equal(core.paginate(records, records.length + 100).items.length, records.length);
  assert.deepEqual(core.paginate([]), { items: [], total: 0, hasMore: false });
});

test('pagination floors fractional counts, clamps negatives and defaults invalid counts', () => {
  assert.equal(core.paginate(records, 2.9).items.length, 2);
  for (const limit of [0, -1, -2.5]) {
    assert.deepEqual(core.paginate(records, limit), { items: [], total: records.length, hasMore: true });
  }
  for (const limit of [NaN, Infinity, -Infinity, '10', null]) assert.equal(core.paginate(records, limit).items.length, 20);
});

test('pagination composes with filtering rather than reporting the unfiltered total', () => {
  const filtered = core.filterRecords(records, { view: 'scenarios' });
  const page = core.paginate(filtered, 7);
  assert.equal(page.total, filtered.length);
  assert.deepEqual(page.items, filtered.slice(0, 7));
  assert.equal(page.hasMore, filtered.length > 7);
});

test('progress defaults are versioned, light-first and contain empty independent collections', () => {
  const first = sanitize(null), second = sanitize(null);
  assert.deepEqual(first, defaultProgress());
  first.bookmarkedIds.push(ids[0]);
  first.mock.ratings['0:0'] = 'confident';
  assert.deepEqual(second, defaultProgress(), 'Defaults must not share mutable arrays or rating objects');
});

test('progress rejects missing, old, future and incorrectly typed schema versions', () => {
  for (const value of [undefined, null, false, 1, 'data', [], {}, { version: 0 }, { version: 2 }, { version: '1' }]) {
    assert.deepEqual(sanitize(value), defaultProgress());
  }
});

test('progress restores valid theme, topic, IDs, last practice cursor, completion and ratings', () => {
  const round = practiceRounds.length - 1, question = practiceRounds[round].questions.length - 1;
  const input = {
    version: 1, theme: 'dark', bookmarkedIds: [ids[0]], masteredIds: [ids[1]], lastTopic: 'vue3',
    mock: { round, question, completed: true, ratings: { '0:0': 'revisit', [`${round}:${question}`]: 'confident' } },
  };
  assert.deepEqual(sanitize(input), input);
});

test('progress drops unknown IDs, invalid ID types and duplicates without reordering valid IDs', () => {
  const result = sanitize({ version: 1,
    bookmarkedIds: [ids[2], ids[0], ids[2], 'removed-id', null, 42, {}, '__proto__'],
    masteredIds: ['removed-id', ids[1], ids[1], false],
  });
  assert.deepEqual(result.bookmarkedIds, [ids[2], ids[0]]);
  assert.deepEqual(result.masteredIds, [ids[1]]);
  for (const invalid of [null, true, 'not-an-array', { 0: ids[0] }]) {
    const clean = sanitize({ version: 1, bookmarkedIds: invalid, masteredIds: invalid });
    assert.deepEqual(clean.bookmarkedIds, []);
    assert.deepEqual(clean.masteredIds, []);
  }
});

test('progress falls back for unsupported theme and unknown or navigation-only topic', () => {
  for (const theme of ['system', 'DARK', null, {}, false]) assert.equal(sanitize({ version: 1, theme }).theme, 'light');
  for (const lastTopic of ['removed-topic', 'mock-interview', 'prep-plan', null, {}]) {
    assert.equal(sanitize({ version: 1, lastTopic }).lastTopic, 'javascript');
  }
});

test('progress rejects out-of-range, fractional and nonnumeric round indices', () => {
  for (const round of [-1, 0.5, practiceRounds.length, Infinity, NaN, '1', null, false]) {
    assert.equal(sanitize({ version: 1, mock: { round, question: 0 } }).mock.round, 0);
  }
});

test('progress validates question index against the selected round, not another round', () => {
  const round = practiceRounds.length - 1;
  for (const question of [-1, 0.5, practiceRounds[round].questions.length, Infinity, NaN, '1', null, true]) {
    const result = sanitize({ version: 1, mock: { round, question } });
    assert.equal(result.mock.round, round);
    assert.equal(result.mock.question, 0);
  }
  assert.equal(sanitize({ version: 1, mock: { round, question: 1 } }).mock.question, 1);
});

test('progress requires completed to be the literal boolean true', () => {
  assert.equal(sanitize({ version: 1, mock: { completed: true } }).mock.completed, true);
  for (const completed of [false, 'true', 1, null, [], {}]) {
    assert.equal(sanitize({ version: 1, mock: { completed } }).mock.completed, false);
  }
  for (const mock of [undefined, null, false, 'invalid']) assert.deepEqual(sanitize({ version: 1, mock }).mock, defaultProgress().mock);
});

test('progress allows only revisit/developing/confident ratings for real round/question pairs', () => {
  const ratings = {
    '0:0': 'revisit', '0:1': 'developing', '0:2': 'confident', '1:0': 'mastered',
    '1:1': true, '1:2': 5, '99:0': 'confident', '0:99': 'confident',
    '-1:0': 'confident', '0:0:1': 'confident', '00:0': 'confident',
  };
  assert.deepEqual(sanitize({ version: 1, mock: { ratings } }).mock.ratings,
    { '0:0': 'revisit', '0:1': 'developing', '0:2': 'confident' });
  for (const invalid of [null, false, 'confident', 7]) assert.deepEqual(sanitize({ version: 1, mock: { ratings: invalid } }).mock.ratings, {});
});

test('progress ignores unrelated persisted properties and does not modify input', () => {
  const input = JSON.parse(`{"version":1,"theme":"dark","bookmarkedIds":["${ids[0]}"],"openedIds":["${ids[1]}"],"mock":{"ratings":{"__proto__":{"polluted":true},"0:0":"revisit"}},"__proto__":{"polluted":true}}`);
  const before = JSON.stringify(input);
  const result = sanitize(input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(Object.hasOwn(result, 'openedIds'), false);
  assert.equal(Object.hasOwn(result, '__proto__'), false);
  assert.equal(Object.hasOwn(result.mock.ratings, '__proto__'), false);
  assert.equal(Object.prototype.polluted, undefined);
  assert.deepEqual(result.masteredIds, []);
});

test('readProgress handles empty available storage with usable defaults', () => {
  const storage = storageWith();
  assert.deepEqual(core.readProgress(storage, records, practiceRounds), { data: defaultProgress(), available: true });
  assert.deepEqual(storage.calls, [['get', core.STORAGE_KEY]]);
});

test('readProgress handles malformed JSON without throwing', () => {
  for (const raw of ['{', '', 'undefined', '{"version":1,}', '[not json]']) {
    assert.deepEqual(core.readProgress(storageWith(raw), records, practiceRounds), { data: defaultProgress(), available: false });
  }
});

test('readProgress distinguishes readable invalid-version data from inaccessible storage', () => {
  for (const input of [{ version: 2, theme: 'dark' }, { version: '1' }, null, []]) {
    assert.deepEqual(core.readProgress(storageWith(JSON.stringify(input)), records, practiceRounds),
      { data: defaultProgress(), available: true });
  }
});

test('readProgress degrades safely when storage is missing, denied or has a throwing getter', () => {
  for (const storage of [undefined, null, {},
    { getItem() { throw new Error('SecurityError'); } },
    { get getItem() { throw new Error('Storage access denied'); } }]) {
    assert.deepEqual(core.readProgress(storage, records, practiceRounds), { data: defaultProgress(), available: false });
  }
});

test('readProgress sanitizes unknown/duplicate IDs, invalid cursors and forbidden ratings', () => {
  const dirty = {
    version: 1, theme: 'dark', bookmarkedIds: [ids[0], ids[0], 'removed'], masteredIds: [ids[1], 'removed'],
    lastTopic: 'removed', mock: { round: 99, question: -1, completed: 'true', ratings: { '0:0': 'developing', '0:1': 'expert' } },
  };
  const result = core.readProgress(storageWith(JSON.stringify(dirty)), records, practiceRounds);
  assert.equal(result.available, true);
  assert.deepEqual(result.data, {
    ...defaultProgress(), theme: 'dark', bookmarkedIds: [ids[0]], masteredIds: [ids[1]],
    mock: { round: 0, question: 0, completed: false, ratings: { '0:0': 'developing' } },
  });
});

test('writeProgress writes the versioned key and valid progress round-trips', () => {
  const storage = storageWith();
  const data = sanitize({ version: 1, theme: 'dark', lastTopic: 'coding', bookmarkedIds: [ids[0]], masteredIds: [ids[1]],
    mock: { round: 1, question: 2, completed: true, ratings: { '1:2': 'confident' } } });
  assert.equal(core.STORAGE_KEY, 'interview-prep-pro:v1');
  assert.equal(core.writeProgress(storage, data), true);
  assert.deepEqual(storage.calls, [['set', core.STORAGE_KEY, JSON.stringify(data)]]);
  assert.deepEqual(core.readProgress(storage, records, practiceRounds), { data, available: true });
});

test('writeProgress returns false for missing, denied or quota-exceeded storage', () => {
  for (const storage of [undefined, null, {},
    { setItem() { throw Object.assign(new Error('Quota exceeded'), { name: 'QuotaExceededError' }); } },
    { get setItem() { throw new Error('SecurityError'); } }]) {
    assert.equal(core.writeProgress(storage, defaultProgress()), false);
  }
});

test('writeProgress catches serialization failures without writing or mutating state', () => {
  const storage = storageWith(), data = defaultProgress();
  data.circular = data;
  assert.equal(core.writeProgress(storage, data), false);
  assert.deepEqual(storage.calls, []);
  assert.equal(data.circular, data);
});

test('escapeHtml encodes script markup, attribute delimiters and ampersands', () => {
  assert.equal(core.escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  assert.equal(core.escapeHtml(`<img src=x onerror='alert("x")'> &`),
    '&lt;img src=x onerror=&#39;alert(&quot;x&quot;)&#39;&gt; &amp;');
  assert.equal(core.escapeHtml('&lt;b&gt;'), '&amp;lt;b&amp;gt;', 'Already encoded input is still treated as text');
  assert.equal(core.escapeHtml('safe / ` = text'), 'safe / ` = text');
});

test('escapeHtml safely handles nullish and non-string text values', () => {
  assert.equal(core.escapeHtml(null), '');
  assert.equal(core.escapeHtml(undefined), '');
  assert.equal(core.escapeHtml(0), '0');
  assert.equal(core.escapeHtml(false), 'false');
  assert.equal(core.escapeHtml({ toString: () => '<untrusted>' }), '&lt;untrusted&gt;');
});

test('plainText strips authored tags and decodes documented text entities without a DOM', () => {
  assert.equal(core.plainText('<code>&lt;div&gt; &amp; &quot;yes&quot; &#39;no&#39;</code>'), `<div> & "yes" 'no'`);
  assert.equal(core.plainText(null), '');
  assert.equal(core.plainText(42), '42');
  // plainText is a search/text helper, not an HTML sanitizer. Escape at the sink.
  assert.equal(core.escapeHtml(core.plainText('&lt;script&gt;')), '&lt;script&gt;');
});

test('catalog/filter/pagination/progress helpers leave source curriculum unchanged', () => {
  core.createCatalog(topics, questionBank);
  core.paginate(core.filterRecords(records, { query: 'vue', difficulty: 'senior' }), 3);
  sanitize({ version: 1, bookmarkedIds: [ids[0]] });
  assert.equal(JSON.stringify({ topics, questionBank, codingProblems, practiceRounds }), originalData);
});

test('sample harness keeps output and expected objects in the same realm', async () => {
  await runAuthoredSample({ jsCode: 'function sample() { return { items: [1, 2] }; }', tests: `
    const output = sample();
    assert.equal(Object.getPrototypeOf(output), Object.prototype);
    assert.equal(Object.getPrototypeOf(output.items), Array.prototype);
    assert.deepEqual(output, { items: [1, 2] });
  ` });
});

test('sample harness creates a fresh realm for every exercise', async () => {
  await runAuthoredSample({ jsCode: 'globalThis.sampleMarker = 1; Object.prototype.sampleMarker = 1;', tests: 'assert.equal(globalThis.sampleMarker, 1);' });
  await runAuthoredSample({ jsCode: '', tests: 'assert.equal(typeof sampleMarker, "undefined"); assert.equal(Object.prototype.sampleMarker, undefined);' });
  assert.equal(Object.prototype.sampleMarker, undefined);
});

test('sample harness observes assertion failures instead of reporting false success', async () => {
  await assert.rejects(runAuthoredSample({ jsCode: '', tests: 'assert.deepEqual([1], [2]);' }), { code: 'ERR_ASSERTION' });
});

for (const [index, item] of codingProblems.entries()) {
  test(`authored JavaScript ${String(index + 1).padStart(2, '0')}: ${core.plainText(item.problem)}`,
    { timeout: TIMEOUT_MS }, async () => {
      await runAuthoredSample(item);
    });
}