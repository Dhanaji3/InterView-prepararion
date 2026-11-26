/* Workspace UI. Code samples are rendered as text, never executed. */
(() => {
  'use strict';
  const { escapeHtml: esc, plainText, createCatalog, filterRecords, paginate, readProgress, writeProgress } = StudyCore;
  const $ = selector => document.querySelector(selector);
  const paths = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    chat: '<path d="M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h10M7 14h6"/>',
    code: '<path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-14-2 18"/>',
    mic: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-14 4h3m4 0h3m-10 3h3"/>',
    bookmark: '<path d="M6 3h12v19l-6-4-6 4V3Z"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
    moon: '<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
    shield: '<path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7l10-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const views = [
    ['overview', 'Overview', 'grid'], ['topics', 'Topics', 'book'], ['scenarios', 'Scenarios', 'chat'],
    ['coding', 'Coding Lab', 'code'], ['mock', 'Mock Interview', 'mic'], ['plan', 'Study Plan', 'calendar'], ['saved', 'Saved', 'bookmark'],
  ];
  const descriptions = {
    html: 'Semantic structure, native forms and accessible browser interfaces.',
    css: 'Responsive layouts, cascade layers and maintainable styling decisions.',
    javascript: 'Closures, async orchestration, the event loop and language fluency.',
    'js-output': 'Predict the result and explain the execution model behind it.',
    typescript: 'Generics, narrowing and safe contracts at runtime boundaries.',
    vue2: 'Maintain legacy apps confidently: lifecycle, reactivity caveats and Vuex.',
    vue3: 'Composition API, typed components, reactivity and effect ownership.',
    migration: 'Incremental Vue 2 → 3 migration with tests and rollback planning.',
    nuxt: 'SSR, hydration, Nitro, async data and request-safe architecture.',
    tailwind: 'Design tokens, utility architecture and version-aware v3/v4 patterns.',
    scss: 'Modern Sass modules, reusable APIs and predictable generated CSS.',
    api: 'Resilient API clients, caching, auth and concurrent data updates.',
    performance: 'Find bottlenecks, improve Web Vitals and validate field impact.',
    accessibility: 'Build for keyboard, screen readers, zoom and real interaction.',
    git: 'Safe recovery, reviewable changes and collaborative release workflows.',
    security: 'Protect rendering, sessions, authorization and trust boundaries.',
    testing: 'Unit, component, contract and browser-level confidence.',
    debugging: 'Production symptoms, investigation workflows and lasting prevention.',
    'system-design': 'Turn constraints into architecture and plan for failure.',
    coding: 'Practical JavaScript and TypeScript, from utilities to async systems.',
    scenario: 'Practice judgment under pressure, not just textbook definitions.',
    behavioral: 'Tell your own stories with structure, evidence and honest reflection.',
  };
  const topicMeta = topics.filter(topic => questionBank[topic.id]).map(topic => ({ ...topic,
    description: topic.description || descriptions[topic.id] || 'Deeper decisions for real production systems.' }));
  const catalog = createCatalog(topicMeta, questionBank);
  const byId = new Map(catalog.map(record => [record.id, record]));
  const byTopic = new Map(topicMeta.map(topic => [topic.id, catalog.filter(record => record.topicId === topic.id)]));
  const typeNames = { qa: 'Interview Q&A', scenario: 'Scenario', debug: 'Debugging', output: 'Output', coding: 'Coding' };
  let storage;
  try { storage = window.localStorage; } catch (_) { /* A denied storage getter must not break navigation. */ }
  const restored = readProgress(storage, catalog, practiceRounds);
  const progress = restored.data;
  const bookmarks = new Set(progress.bookmarkedIds), mastered = new Set(progress.masteredIds);
  const contexts = new Map(), opened = new Set(), languages = new Map();
  const drafts = new Map(), revealed = new Set();
  const mockTotal = practiceRounds.reduce((sum, round) => sum + round.questions.length, 0);
  let activeView = 'overview', activeTopic = '', filters;
  let directoryGroup = 'All topics', directoryQuery = '', toastTimer, warnedStorage = false;

  function notify(message) {
    clearTimeout(toastTimer);
    $('#notification').textContent = message;
    $('#notification').classList.add('visible');
    toastTimer = setTimeout(() => $('#notification').classList.remove('visible'), 4000);
  }

  function save() {
    progress.bookmarkedIds = [...bookmarks]; progress.masteredIds = [...mastered];
    if (!writeProgress(storage, progress) && !warnedStorage) {
      warnedStorage = true;
      notify('Storage is unavailable. Changes work for this session, but cannot survive a refresh.');
    }
  }

  function applyTheme() {
    const dark = progress.theme === 'dark';
    document.documentElement.dataset.theme = progress.theme;
    $('#theme-toggle').innerHTML = icon(dark ? 'sun' : 'moon');
    $('#theme-toggle').setAttribute('aria-pressed', String(dark));
    $('#theme-toggle').setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    $('meta[name="theme-color"]').content = dark ? '#121521' : '#f6f7fb';
  }

  const doneFor = records => records.filter(record => mastered.has(record.id)).length;
  function bar(done, total, label) {
    return `<div class="progress-track" role="progressbar" aria-label="${esc(label)}" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${total || 1}"><span style="width:${total ? Math.round(done / total * 100) : 0}%"></span></div>`;
  }

  function topicIcon(topic) {
    const symbols = { html: '&lt;/&gt;', css: '#', javascript: 'JS', 'js-output': '>_', typescript: 'TS', vue2: 'V2', vue3: 'V3', migration: '2→3', nuxt: 'N', tailwind: '≈', scss: 'S', api: 'API', git: 'git', 'intro-project': 'Hi', 'micro-frontends': 'MFE', 'vite-config': 'Vi', 'package-json': 'npm', 'design-patterns': 'DP', 'quality-cicd': 'CI', 'gitlab-jira-confluence': 'GL' };
    const tone = ['Vue & Nuxt', 'Styling'].includes(topic.group) ? 'teal' : topic.group === 'Problem Solving' ? 'amber' : topic.group === 'Interview Skills' ? 'blue' : '';
    return `<span class="topic-icon ${tone}" aria-hidden="true">${symbols[topic.id] || icon('layers')}</span>`;
  }

  function topicCard(topic) {
    const records = byTopic.get(topic.id), done = doneFor(records);
    return `<button type="button" class="topic-card" data-topic="${topic.id}"><span class="topic-top">${topicIcon(topic)}${icon('arrow')}</span><span class="topic-title">${esc(topic.label)}</span><span class="topic-description">${esc(topic.description)}</span><span class="topic-bottom"><strong>${records.length} questions</strong><span>${done ? `${done} mastered` : esc(topic.group)}</span></span>${bar(done, records.length, `${topic.label} mastered`)}</button>`;
  }

  function heading(kicker, title, description, aside = '') {
    return `<div class="page-heading"><div><p class="eyebrow purple">${esc(kicker)}</p><h1 tabindex="-1">${esc(title)}</h1><p>${esc(description)}</p></div>${aside}</div>`;
  }

  function renderOverview() {
    const resume = topicMeta.find(topic => topic.id === progress.lastTopic) || topicMeta[0];
    const categories = [
      ['Foundations', ['html', 'css', 'javascript', 'js-output', 'typescript', 'browser-platform', 'design-patterns']],
      ['Framework expertise', ['vue2', 'vue3', 'migration', 'nuxt', 'state-management', 'micro-frontends']],
      ['Production engineering', ['api', 'performance', 'security', 'testing', 'deployment', 'observability', 'build-tooling', 'accessibility', 'tailwind', 'scss', 'git', 'vite-config', 'package-json', 'quality-cicd', 'gitlab-jira-confluence']],
      ['Interview practice', ['intro-project', 'coding', 'debugging', 'scenario', 'behavioral', 'leadership', 'system-design']],
    ];
    return `<div class="section-heading"><p class="eyebrow">YOUR INTERVIEW WORKSPACE</p><span class="tag">5+ years · Vue / Nuxt track</span></div>
      <section class="hero"><div class="hero-copy"><span class="hero-badge">${icon('spark')} A little practice. A lot of possibility.</span><h1 tabindex="-1">Your experience.<br>Your <span>next level.</span></h1><p>Go beyond knowing the answer. Build the confidence to explain the why—with senior-level questions, real-world scenarios, and hands-on problem solving.</p><div class="hero-actions"><button type="button" class="btn primary" data-topic="${resume.id}">Start learning ${icon('arrow')}</button><button type="button" class="btn ghost" data-go="mock">${icon('mic')} Try a mock interview</button></div></div>
      <div class="hero-visual" aria-hidden="true"><div class="code-window"><div class="window-bar"><i></i><i></i><i></i><span>your-next-chapter.ts</span></div><div class="window-code"><span class="comment">// Great answers start with practice.</span><br><span class="key">const</span> nextChapter = {<br>&nbsp;&nbsp;experience: <span class="value">'5+ years'</span>,<br>&nbsp;&nbsp;mindset: <span class="value">'keep growing'</span>,<br>&nbsp;&nbsp;ready: <span class="key">true</span><br>};</div></div><span class="ready-chip">${icon('check')} Built on what you already know</span></div></section>
      <div class="stats-grid">${[
        ['book', '', catalog.length, 'Questions to explore'], ['code', 'teal', byTopic.get('coding').length, 'Coding challenges'],
        ['chat', 'amber', catalog.filter(record => ['scenario', 'debug'].includes(record.type)).length, 'Scenarios & debugging'], ['check', 'blue', `${mastered.size}/${catalog.length}`, 'Questions mastered'],
      ].map(([symbol, tone, number, label]) => `<div class="stat"><span class="stat-icon ${tone}">${icon(symbol)}</span><div><strong class="stat-value">${number}</strong><span class="stat-label">${label}</span></div></div>`).join('')}</div>
      <div class="section-heading"><div><h2>Make today count</h2><p>One focused session is a step forward.</p></div><button type="button" class="text-button" data-go="plan">Your study plan ${icon('arrow')}</button></div>
      <div class="dashboard-grid"><section class="continue-card"><p class="eyebrow">YOUR NEXT SESSION</p><h3>${esc(resume.label)}</h3><p>${doneFor(byTopic.get(resume.id))} of ${byTopic.get(resume.id).length} mastered. Answer one question aloud, then compare your reasoning.</p><button type="button" class="btn small" data-topic="${resume.id}">Continue learning ${icon('arrow')}</button></section>
      <section class="blueprint"><div class="blueprint-top"><div><h3>Your preparation, at a glance</h3><p>Only questions you explicitly mark mastered count as progress.</p></div>${icon('target')}</div><div class="blueprint-rows">${categories.map(([label, ids]) => {
        const records = catalog.filter(record => ids.includes(record.topicId)), done = doneFor(records);
        return `<div class="blueprint-row"><span>${label}</span>${bar(done, records.length, label)}<span>${done}/${records.length}</span></div>`;
      }).join('')}</div></section></div>
      <div class="section-heading"><div><h2>Build depth, one topic at a time</h2><p>Start with the essentials. Stay for the interesting questions.</p></div><button type="button" class="text-button" data-go="topics">All ${topicMeta.length} topics ${icon('arrow')}</button></div>
      <div class="topic-grid">${['javascript', 'typescript', 'vue3', 'nuxt', 'system-design', 'performance'].map(id => topicCard(topicMeta.find(topic => topic.id === id))).join('')}</div>
      <div class="bottom-note">${icon('shield')}<span><strong>Your workspace, your browser.</strong> Bookmarks, mastered questions, theme, mock position and self-ratings are stored locally. No account needed. Draft answers stay in this session only.</span></div>`;
  }

  function renderDirectory() {
    const groups = ['All topics', ...new Set(topicMeta.map(topic => topic.group))];
    return `${heading('THE QUESTION LIBRARY', 'Explore your next deep dive.', 'From browser fundamentals to production ownership. Choose a topic and build senior-level depth.', '<button type="button" class="btn" data-browse-all>Browse all questions ' + icon('arrow') + '</button>')}
      <div class="directory-toolbar"><div class="group-filters" aria-label="Filter topic groups">${groups.map(group => `<button type="button" class="filter-chip" data-group="${esc(group)}" aria-pressed="${directoryGroup === group}">${esc(group)}</button>`).join('')}</div><label class="directory-search">${icon('search')}<span class="sr-only">Find a topic</span><input id="topic-search" type="search" placeholder="Find a topic…" value="${esc(directoryQuery)}" autocomplete="off" /></label></div><p id="directory-count" class="directory-count" aria-live="polite"></p><div id="directory-grid" class="topic-grid"></div>`;
  }

  function updateDirectory() {
    const query = directoryQuery.trim().toLowerCase();
    const matches = topicMeta.filter(topic => (directoryGroup === 'All topics' || topic.group === directoryGroup) && `${topic.label} ${topic.description} ${topic.group}`.toLowerCase().includes(query));
    $('#directory-count').textContent = `${matches.length} topics · ${matches.reduce((sum, topic) => sum + byTopic.get(topic.id).length, 0)} questions`;
    $('#directory-grid').innerHTML = matches.map(topicCard).join('') || empty('No topics found', 'Try a different name or clear the topic filters.', 'data-directory-reset', 'Clear filters');
    document.querySelectorAll('[data-group]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.group === directoryGroup)));
  }

  function empty(title, description, action, label) {
    return `<div class="empty-state">${icon('search')}<h2>${esc(title)}</h2><p>${esc(description)}</p><button type="button" class="btn" ${action}>${esc(label)}</button></div>`;
  }

  function options(values, value) { return values.map(([id, label]) => `<option value="${esc(id)}"${id === value ? ' selected' : ''}>${esc(label)}</option>`).join(''); }
  function select(label, key, values) {
    return `<label class="filter-select">${label}<select data-filter="${key}" aria-label="Filter by ${label.toLowerCase()}">${options(values, filters[key])}</select></label>`;
  }

  function renderLibrary() {
    let top;
    if (activeView === 'topics' && activeTopic && activeTopic !== 'all') {
      const topic = topicMeta.find(value => value.id === activeTopic), records = byTopic.get(topic.id);
      top = `<div class="breadcrumb"><button type="button" data-go="topics">Topics</button><span aria-hidden="true">/</span><span>${esc(topic.label)}</span></div><div class="topic-banner">${topicIcon(topic)}<div><p class="eyebrow">${esc(topic.group)}</p><h1 tabindex="-1">${esc(topic.label)}</h1><p>${esc(topic.description)}</p></div><div class="topic-banner-progress">${doneFor(records)} / ${records.length} mastered${bar(doneFor(records), records.length, 'Topic mastery')}</div></div>`;
    } else {
      const content = activeView === 'scenarios' ? ['THINK LIKE AN OWNER', 'Real problems. Senior decisions.', 'Investigate the cause, explain the trade-offs, and show how you prevent the next incident.'] :
        activeView === 'coding' ? ['THE CODING LAB', 'Build the solution. Explain the why.', 'Solve before revealing the approach. Compare JavaScript and TypeScript, then challenge your edge cases.'] :
        activeView === 'saved' ? ['YOUR PERSONAL SHORTLIST', 'Good questions, kept close.', 'The questions you bookmarked across every topic. Revisit the ones that deserve another look.'] :
        ['THE FULL QUESTION BANK', 'Follow your curiosity.', 'Search every topic, explanation and code example. Filter down to your next practice session.'];
      top = heading(...content);
    }
    const eligible = topicMeta.filter(topic => activeView !== 'scenarios' || ['scenario', 'debugging'].includes(topic.id));
    const formats = activeView === 'scenarios' ? [['scenario', 'Scenario'], ['debug', 'Debugging']] : Object.entries(typeNames);
    return `${top}<div class="library-toolbar"><label class="question-search">${icon('search')}<span class="sr-only">Search questions in this view</span><input id="question-search" type="search" placeholder="Search questions, answers, and code…" value="${esc(filters.query)}" autocomplete="off" /></label><div class="filter-row">
      ${activeView === 'coding' ? '' : select('Topic', 'topicId', [['all', 'All topics'], ...eligible.map(topic => [topic.id, topic.label])])}
      ${select('Depth', 'difficulty', [['all', 'All levels'], ['foundation', 'Foundation'], ['senior', 'Senior'], ['advanced', 'Advanced']])}
      ${activeView === 'coding' ? '' : select('Format', 'type', [['all', 'All formats'], ...formats])}
      ${select('Progress', 'status', [['all', 'All questions'], ['unmastered', 'To practice'], ['mastered', 'Mastered'], ['saved', 'Bookmarked']])}</div></div>
      <div class="results-row"><span id="result-count" role="status" aria-live="polite"></span><button type="button" class="text-button" data-reset>Reset filters</button></div><div id="question-list" class="question-list"></div><div id="load-more" class="load-more"></div>
      ${activeView === 'coding' ? `<div class="bottom-note">${icon('code')}<span>This is a study lab, not a code sandbox. Copy solutions and tests into your editor to run them. Vue exercises label their required setup context.</span></div>` : ''}`;
  }

  // Only authored curriculum is trusted as markup. User input is always escaped.
  function block(label, value, tone = '') {
    return value ? `<div class="answer-block ${tone}"><h4>${esc(label)}</h4><p>${value}</p></div>` : '';
  }
  function codeBlock(label, code, id) {
    return code ? `<div class="code-block"><div class="code-bar"><span>${esc(label)}</span><button type="button" class="copy-button" data-copy="${id}" aria-label="Copy ${esc(label)}">${icon('copy')} Copy</button></div><pre tabindex="0" aria-label="${esc(label)}"><code id="${id}">${esc(code)}</code></pre></div>` : '';
  }

  function body(record) {
    const item = record.item;
    if (record.type === 'debug') return [block('Symptoms', item.symptoms), block('Possible causes', item.causes), block('Investigation', item.investigation), block('Tools & evidence', item.devtools), block('Resolution', item.solution), block('Prevent a repeat', item.prevention, 'followup'), block('Senior follow-up', item.followup)].join('');
    if (record.type === 'output') return block('Expected output', esc(item.output)) + block('Reasoning', item.explanation);
    if (record.type === 'coding') {
      const language = languages.get(record.id) || 'js';
      return block('Approach', item.approach) + `<div class="language-switch" role="group" aria-label="Solution language">${[['js', 'JavaScript'], ['ts', 'TypeScript']].map(([value, label]) => `<button type="button" data-language="${value}" aria-pressed="${language === value}" aria-controls="solution-${record.id}-${value}">${label}</button>`).join('')}</div>` +
        [['js', 'JavaScript', item.jsCode], ['ts', 'TypeScript', item.tsCode]].map(([value, label, code]) => `<div id="solution-${record.id}-${value}" data-solution="${value}"${language !== value ? ' hidden' : ''}>${codeBlock(label + ' solution', code, `code-${record.id}-${value}`)}</div>`).join('') +
        block('Walkthrough & limits', item.explanation) + block('Time & space complexity', item.complexity) +
        `<details class="tests-disclosure"><summary>Test cases · Node.js assert examples</summary>${codeBlock('Tests — node:assert/strict', item.tests, `code-${record.id}-tests`)}</details>` + block('Stretch your solution', item.followup, 'followup');
    }
    return [block('What the interviewer is testing', item.testing, 'intent'), block('A strong answer', item.answer),
      block('Diagnosis & clarifying questions', item.diagnosis), block('Immediate mitigation', item.mitigation), block('Trade-offs', item.tradeoffs), block('Verification & prevention', item.verification),
      block('Illustrative example — adapt to your own experience', item.example), codeBlock('Example code', item.code, `code-${record.id}-example`), block('Common mistake', item.mistake, 'mistake'),
      item.followupQ ? block('Interviewer follow-up', `<strong>${item.followupQ}</strong>\n\n${item.followupA || ''}`, 'followup') : '',
    ].join('');
  }

  function actions(record) {
    const saved = bookmarks.has(record.id), done = mastered.has(record.id);
    return `<div class="question-actions"><div class="action-group"><button type="button" data-action="bookmark" aria-pressed="${saved}" aria-label="${saved ? 'Remove bookmark' : 'Bookmark question'}">${icon('bookmark')} ${saved ? 'Saved' : 'Save question'}</button><button type="button" data-action="master" aria-pressed="${done}" aria-label="${done ? 'Mark as to practice' : 'Mark question mastered'}">${icon('check')} ${done ? 'Mastered' : 'Mark mastered'}</button></div><button type="button" class="source-link" data-focus="${record.id}">${esc(record.topicLabel)} ${icon('arrow')}</button></div>`;
  }

  function questionCard(record) {
    const meta = `<span class="question-meta"><span class="tag ${record.difficulty}">${record.difficulty[0].toUpperCase() + record.difficulty.slice(1)}</span><span class="tag ${record.type}">${typeNames[record.type]}</span><span>${esc(record.topicLabel)}</span></span>`;
    const head = `<span class="question-number">${String(record.ordinal).padStart(2, '0')}</span><span class="question-main">${meta}<span class="question-title">${record.title}</span></span>`;
    const item = record.item, open = opened.has(record.id) ? ' open' : '';
    const challenge = ['coding', 'output'].includes(record.type);
    return `<article class="question-card${mastered.has(record.id) ? ' mastered' : ''}" id="question-${record.id}" data-record="${record.id}">${challenge ?
      `<div class="challenge-head">${head}</div><div class="challenge-brief">${record.type === 'coding' ? [['Constraints', item.constraints], ['Examples', item.examples], ['Edge cases to consider', item.edgeCases]].map(([label, value]) => `<div><h4>${label}</h4><p>${esc(value)}</p></div>`).join('') : codeBlock('Predict the output first', item.code, `code-${record.id}-prompt`)}</div><details class="solution-details" data-question="${record.id}"${open}><summary>${record.type === 'coding' ? 'Reveal approach & solution' : 'Reveal output & reasoning'}</summary><div class="answer-body">${body(record)}</div></details>` :
      `<details class="question-details" data-question="${record.id}"${open}><summary>${head}<span class="chevron" aria-hidden="true"></span></summary><div class="answer-body">${body(record)}</div></details>`}${actions(record)}</article>`;
  }

  function renderResults() {
    const matches = filterRecords(catalog, { ...filters, view: activeView }, bookmarks, mastered);
    const page = paginate(matches, filters.visible);
    $('#result-count').innerHTML = `<strong>${page.total}</strong> ${page.total === 1 ? 'question' : 'questions'}${filters.query ? ` matching “${esc(filters.query)}”` : ''} · ${mastered.size} mastered overall`;
    $('#question-list').innerHTML = page.items.map(questionCard).join('') || (activeView === 'saved' && !bookmarks.size ?
      empty('Your shortlist starts here.', 'Save a question from any topic to keep it close.', 'data-go="topics"', 'Explore topics') :
      empty('No questions match just yet.', 'Try a broader search or reset your filters.', 'data-reset', 'Reset filters'));
    $('#load-more').innerHTML = page.total ? `<span>Showing ${page.items.length} of ${page.total} questions</span>${page.hasMore ? '<button type="button" class="btn" data-more>Load 20 more questions</button>' : ''}` : '';
  }

  function renderMock() {
    const mock = progress.mock, round = practiceRounds[mock.round], prompt = round.questions[mock.question];
    const key = `${mock.round}:${mock.question}`;
    const position = practiceRounds.slice(0, mock.round).reduce((sum, value) => sum + value.questions.length, 0) + mock.question;
    return `${heading('SAY IT OUT LOUD', 'A little rehearsal. More confidence.', `${practiceRounds.length} guided rounds · ${mockTotal} prompts. Compare your reasoning with a checklist, then rate your own confidence.`, '<button type="button" class="btn" data-mock-restart>Restart interview</button>')}
      <div class="mock-layout"><nav class="round-list" aria-label="Mock interview rounds">${practiceRounds.map((value, index) => `<button type="button" class="round-button" data-round="${index}"${index === mock.round && !mock.completed ? ' aria-current="step"' : ''}><span>${String(index + 1).padStart(2, '0')}</span><span>${esc(value.title)}</span></button>`).join('')}</nav><section class="mock-card" aria-label="Practice prompt">${mock.completed ?
        `<div class="mock-complete">${icon('check')}<h2 tabindex="-1">You made it through.</h2><p>You reached the end of ${practiceRounds.length} rounds. ${Object.keys(mock.ratings).length} prompts have a self-rating.<br>This is practice, not an automatically graded assessment.</p><div class="button-row"><button type="button" class="btn primary" data-mock-restart>Practice again</button><button type="button" class="btn" data-go="topics">Revisit topics ${icon('arrow')}</button></div></div>` :
        `<div class="mock-top"><span>ROUND ${mock.round + 1} / ${practiceRounds.length} · ${esc(round.title)}</span><span>Prompt ${position + 1} of ${mockTotal}</span></div>${bar(position, mockTotal, 'Position in mock interview')}<p class="eyebrow purple">${icon('mic')} THINK, THEN SPEAK</p><h2 class="mock-question" tabindex="-1">${prompt.question}</h2><label class="mock-label" for="mock-answer">Make a quick outline of your spoken answer</label><textarea class="mock-draft" id="mock-answer" rows="5" placeholder="Clarify. Explain your approach. Discuss the trade-offs…">${esc(drafts.get(key) || '')}</textarea><p class="mock-draft-note">Drafts stay in this session only. Your position and self-ratings are saved locally; drafts disappear after a refresh.</p><div class="mock-actions"><button type="button" class="btn" data-mock-reveal aria-expanded="${revealed.has(key)}" aria-controls="mock-model">${revealed.has(key) ? 'Hide model answer' : 'Compare with model answer'}</button><button type="button" class="btn primary" data-mock-next>${position + 1 === mockTotal ? 'Finish interview' : 'Next prompt'} ${icon('arrow')}</button></div><div class="model-answer" id="mock-model"${revealed.has(key) ? '' : ' hidden'}><div class="answer-block"><h4>A strong response covers</h4><ul>${prompt.checklist.map(value => `<li>${esc(value)}</li>`).join('')}</ul></div>${block('Model reasoning — not a script to memorize', prompt.modelAnswer)}<div class="self-rating" role="group" aria-label="Self-rate this prompt"><span>Your confidence:</span>${[['revisit', 'Needs work'], ['developing', 'Getting there'], ['confident', 'Confident']].map(([value, label]) => `<button type="button" class="btn small" data-rating="${value}" aria-pressed="${mock.ratings[key] === value}">${label}</button>`).join('')}</div></div>`}</section></div>
      <div class="bottom-note">${icon('mic')}<span>No automated scoring, recording, or AI evaluation. Use a genuine personal example when you have one; explicitly label hypothetical answers.</span></div>`;
  }

  function renderPlan() {
    const weeks = [
      ['Foundations you can explain', 'Days 1–7', ['intro-project', 'javascript', 'typescript', 'html', 'css', 'js-output', 'design-patterns'], ['Explain closures, this and the event loop without notes.', 'Model API results in TypeScript. Compare types with runtime decoding.', 'Solve utility exercises and test edge cases. Revisit semantic and responsive interfaces.', 'Write and rehearse your introduction, project walkthrough and reason for changing jobs aloud.']],
      ['Framework depth, not trivia', 'Days 8–14', ['vue3', 'state-management', 'vue2', 'migration', 'nuxt', 'micro-frontends'], ['Build a composable with cancellation and scope cleanup.', 'Practice Pinia ownership, request isolation and incremental migration.', 'Trace Nuxt rendering, hydration, authentication and cache rules.']],
      ['Own the production story', 'Days 15–21', ['performance', 'testing', 'security', 'deployment', 'observability', 'vite-config', 'package-json', 'quality-cicd', 'gitlab-jira-confluence'], ['Diagnose LCP and INP with evidence. Test async failures deterministically.', 'Review session boundaries, idempotency, caches and API contracts.', 'Design delivery and rollback. Walk through an incident and prevention.']],
      ['Bring it all together', 'Days 22–28', ['system-design', 'coding', 'scenario', 'debugging', 'leadership', 'behavioral'], ['Clarify requirements, then design a dashboard or autosave editor.', 'Solve async and caching problems before revealing solutions.', 'Prepare five true STAR stories and rehearse mock rounds aloud.']],
    ];
    const curated = [
      ['Six essential explanations', ['javascript', 'typescript', 'html', 'css', 'vue3', 'nuxt'].map(id => byTopic.get(id)[0])],
      ['Production ownership', ['state-management', 'deployment', 'observability', 'security', 'testing', 'browser-platform'].map(id => byTopic.get(id).at(-1))],
      ['Stretch your coding', ['coding-map-limit', 'coding-inflight-dedupe', 'coding-lru-cache', 'coding-debounce-controls', 'coding-vue-race-safe-fetch', 'coding-optimistic-versioned-rollback'].map(id => byId.get(id))],
    ];
    return `${heading('PREPARE WITH INTENTION', 'A clear path to interview day.', 'A flexible four-week roadmap with two final review days. Aim for 45–60 focused minutes per day; adjust the pace to your schedule.')}
      <div class="plan-intro"><section class="plan-callout"><p class="eyebrow purple">A BETTER WAY TO PRACTICE</p><h2>Recall first. Read second.</h2><p>Start with your own answer. Reveal the model, find the gaps, and explain it again. Mark a question mastered only when you can reason through it without notes—not just recognize the words.</p><div class="button-row"><button type="button" class="btn primary" data-go="mock">Start a mock round ${icon('arrow')}</button></div></section><section class="blueprint"><p class="eyebrow">DAYS 29–30 · FINAL REVIEW</p><div class="answer-block"><h4>Keep it practical</h4><ul><li>Revisit bookmarks and your “Needs work” mock prompts.</li><li>Review your actual projects and honest STAR stories.</li><li>Prepare questions about team ownership and architecture.</li><li>Check your interview setup. Rest is part of preparation.</li></ul></div></section></div>
      <div class="plan-grid">${weeks.map(([title, days, ids, tasks], index) => `<section class="week-card"><div class="week-head"><span class="week-number">0${index + 1}</span><div><h2>${title}</h2><p class="week-days">${days} · 45–60 minutes / day</p></div></div><ul>${tasks.map(task => `<li>${esc(task)}</li>`).join('')}</ul><div class="topic-links">${ids.map(id => `<button type="button" data-topic="${id}">${esc(topicMeta.find(topic => topic.id === id).label)}</button>`).join('')}</div></section>`).join('')}</div><section class="curated-lists"><div class="section-heading"><div><h2>A small, useful shortlist</h2><p>Open a real question from the bank and put your reasoning to work.</p></div></div><div class="curated-grid">${curated.map(([title, records]) => `<div class="curated-card"><h3>${title}</h3><ol>${records.filter(Boolean).map(record => `<li><button type="button" data-focus="${record.id}">${esc(plainText(record.title))}</button></li>`).join('')}</ol></div>`).join('')}</div></section>`;
  }

  function render() {
    // Keep IDs unique: inactive panels are empty. View state and drafts live above.
    views.forEach(([view]) => {
      const active = view === activeView, panel = $(`#view-${view}`), tab = $(`#tab-${view}`);
      panel.hidden = !active; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      if (!active) panel.replaceChildren();
    });
    const panel = $(`#view-${activeView}`);
    panel.innerHTML = activeView === 'overview' ? renderOverview() : activeView === 'topics' && !activeTopic ? renderDirectory() : activeView === 'mock' ? renderMock() : activeView === 'plan' ? renderPlan() : renderLibrary();
    if (activeView === 'topics' && !activeTopic) updateDirectory();
    else if (['topics', 'scenarios', 'coding', 'saved'].includes(activeView)) renderResults();
    $('#saved-count').textContent = bookmarks.size;
    const label = activeView === 'topics' && byTopic.has(activeTopic) ? topicMeta.find(topic => topic.id === activeTopic).label : views.find(([id]) => id === activeView)[1];
    document.title = `${label} — InterviewPrep Pro`;
  }

  function navigate(view, topic = '', { historyMode = 'push', focus = true } = {}) {
    activeView = views.some(([id]) => id === view) ? view : 'overview';
    activeTopic = activeView === 'topics' && (topic === 'all' || byTopic.has(topic)) ? topic : '';
    const key = `${activeView}:${activeTopic}`;
    if (!contexts.has(key)) contexts.set(key, { query: '', topicId: activeTopic || 'all', difficulty: 'all', type: 'all', status: 'all', visible: 20 });
    filters = contexts.get(key);
    if (byTopic.has(activeTopic)) { progress.lastTopic = activeTopic; save(); }
    const hash = `#${activeView}${activeTopic ? '/' + activeTopic : ''}`;
    if (location.hash !== hash && historyMode !== 'none') {
      try { history[historyMode === 'replace' ? 'replaceState' : 'pushState'](null, '', hash); }
      catch (_) { location.hash = hash; }
    }
    render();
    const tab = $(`#tab-${activeView}`);
    const strip = $('#workspace-tabs'), left = tab.offsetLeft - strip.offsetLeft;
    if (left < strip.scrollLeft) strip.scrollLeft = left;
    else if (left + tab.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = left + tab.offsetWidth - strip.clientWidth;
    if (focus) { panelHeading()?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
    $('#announcer').textContent = `${views.find(([id]) => id === activeView)[1]} workspace opened.`;
  }

  function panelHeading() { return $(`#view-${activeView} h1`); }
  function fromHash(initial = false) {
    const [view, topic] = location.hash.slice(1).split('/');
    navigate(view || 'overview', topic || '', { historyMode: 'replace', focus: !initial });
  }

  function focusQuestion(id) {
    const record = byId.get(id);
    if (!record) return;
    navigate('topics', record.topicId, { focus: false });
    Object.assign(filters, { query: '', topicId: record.topicId, difficulty: 'all', type: 'all', status: 'all', visible: Math.ceil(record.ordinal / 20) * 20 });
    if (!['coding', 'output'].includes(record.type)) opened.add(id);
    render();
    const card = document.getElementById(`question-${id}`);
    card.querySelector('summary').focus({ preventScroll: true }); card.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  function updateAction(button, record) {
    const action = button.dataset.action, set = action === 'bookmark' ? bookmarks : mastered;
    const active = !set.has(record.id); active ? set.add(record.id) : set.delete(record.id); save();
    const card = button.closest('[data-record]');
    card.classList.toggle('mastered', mastered.has(record.id));
    card.querySelector('.question-actions').outerHTML = actions(record);
    const removes = (activeView === 'saved' && action === 'bookmark' && !active) || filters.status !== 'all';
    if (removes) renderResults();
    const replacement = document.getElementById(`question-${record.id}`)?.querySelector(`[data-action="${action}"]`);
    (replacement || $('#question-search')).focus({ preventScroll: true });
    $('#saved-count').textContent = bookmarks.size;
    const matches = filterRecords(catalog, { ...filters, view: activeView }, bookmarks, mastered);
    $('#result-count').innerHTML = `<strong>${matches.length}</strong> questions${filters.query ? ` matching “${esc(filters.query)}”` : ''} · ${mastered.size} mastered overall`;
    if ($('.topic-banner-progress')) {
      const records = byTopic.get(activeTopic), done = doneFor(records);
      $('.topic-banner-progress').innerHTML = `${done} / ${records.length} mastered${bar(done, records.length, 'Topic mastery')}`;
    }
    $('#announcer').textContent = action === 'bookmark' ? (active ? 'Question bookmarked.' : 'Bookmark removed.') : (active ? 'Question marked mastered.' : 'Question marked to practice.');
  }

  async function copyCode(button) {
    const code = document.getElementById(button.dataset.copy);
    try { if (!navigator.clipboard?.writeText) throw new Error('Unavailable'); await navigator.clipboard.writeText(code.textContent); notify('Code copied. Your editor is ready when you are.'); }
    catch (_) {
      const range = document.createRange(), selection = window.getSelection();
      range.selectNodeContents(code); selection.removeAllRanges(); selection.addRange(range); code.parentElement.focus({ preventScroll: true });
      notify('Code selected. Use Ctrl+C, ⌘C, or your device’s Copy action.');
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.view) { navigate(button.dataset.view, '', { focus: false }); button.focus({ preventScroll: true }); return; }
    if (button.dataset.go) { navigate(button.dataset.go); return; }
    if (button.dataset.topic) { navigate('topics', button.dataset.topic); return; }
    if (button.hasAttribute('data-browse-all')) { navigate('topics', 'all'); return; }
    if (button.dataset.focus) { focusQuestion(button.dataset.focus); return; }
    if (button.dataset.group) { directoryGroup = button.dataset.group; updateDirectory(); return; }
    if (button.hasAttribute('data-directory-reset')) { directoryGroup = 'All topics'; directoryQuery = ''; $('#topic-search').value = ''; updateDirectory(); $('#topic-search').focus(); return; }
    if (button.hasAttribute('data-reset')) { Object.assign(filters, { query: '', topicId: activeTopic || 'all', difficulty: 'all', type: 'all', status: 'all', visible: 20 }); render(); $('#question-search').focus(); return; }
    if (button.hasAttribute('data-more')) { const count = filters.visible; filters.visible += 20; renderResults(); document.querySelectorAll('#question-list > .question-card')[count]?.querySelector('summary')?.focus({ preventScroll: true }); return; }
    const record = byId.get(button.closest('[data-record]')?.dataset.record);
    if (record && button.dataset.action) { updateAction(button, record); return; }
    if (record && button.dataset.language) {
      languages.set(record.id, button.dataset.language);
      const card = button.closest('[data-record]');
      card.querySelectorAll('[data-solution]').forEach(node => { node.hidden = node.dataset.solution !== button.dataset.language; });
      card.querySelectorAll('[data-language]').forEach(node => node.setAttribute('aria-pressed', String(node === button))); return;
    }
    if (button.dataset.copy) { void copyCode(button); return; }
    if (button.hasAttribute('data-round')) {
      progress.mock.round = Number(button.dataset.round); progress.mock.question = 0; progress.mock.completed = false; save(); render(); $('.mock-question').focus({ preventScroll: true }); return;
    }
    const key = `${progress.mock.round}:${progress.mock.question}`;
    if (button.hasAttribute('data-mock-reveal')) { revealed.has(key) ? revealed.delete(key) : revealed.add(key); $('#mock-model').hidden = !revealed.has(key); button.setAttribute('aria-expanded', String(revealed.has(key))); button.textContent = revealed.has(key) ? 'Hide model answer' : 'Compare with model answer'; return; }
    if (button.dataset.rating) { progress.mock.ratings[key] = button.dataset.rating; save(); document.querySelectorAll('[data-rating]').forEach(node => node.setAttribute('aria-pressed', String(node === button))); $('#announcer').textContent = 'Self-rating saved locally.'; return; }
    if (button.hasAttribute('data-mock-next')) {
      if (progress.mock.question + 1 < practiceRounds[progress.mock.round].questions.length) progress.mock.question++;
      else if (progress.mock.round + 1 < practiceRounds.length) { progress.mock.round++; progress.mock.question = 0; }
      else progress.mock.completed = true;
      save(); render(); ($('.mock-question') || $('.mock-complete h2')).focus({ preventScroll: true }); return;
    }
    if (button.hasAttribute('data-mock-restart')) {
      if ((progress.mock.round || progress.mock.question || progress.mock.completed || drafts.size) && !window.confirm('Restart? This clears session drafts and mock self-ratings, but keeps bookmarks and mastered questions.')) return;
      progress.mock = { round: 0, question: 0, completed: false, ratings: {} }; drafts.clear(); revealed.clear(); save(); render(); $('.mock-question').focus({ preventScroll: true });
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'question-search') { filters.query = event.target.value; filters.visible = 20; renderResults(); }
    else if (event.target.id === 'topic-search') { directoryQuery = event.target.value; updateDirectory(); }
    else if (event.target.id === 'mock-answer') drafts.set(`${progress.mock.round}:${progress.mock.question}`, event.target.value);
  });
  document.addEventListener('change', event => {
    const key = event.target.dataset.filter;
    if (!key) return;
    if (key === 'topicId' && activeView === 'topics') {
      const retained = { ...filters, topicId: event.target.value, visible: 20 };
      navigate('topics', event.target.value, { focus: false }); Object.assign(filters, retained); render(); $('[data-filter="topicId"]').focus({ preventScroll: true });
    } else { filters[key] = event.target.value; filters.visible = 20; renderResults(); }
  });
  document.addEventListener('toggle', event => {
    if (!event.target.matches('details[data-question]') || !event.target.isConnected) return;
    event.target.open ? opened.add(event.target.dataset.question) : opened.delete(event.target.dataset.question);
  }, true);
  $('#workspace-tabs').addEventListener('keydown', event => {
    if (!event.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = views.findIndex(([id]) => id === activeView);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? views.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + views.length) % views.length;
    navigate(views[next][0], '', { focus: false }); $(`#tab-${views[next][0]}`).focus({ preventScroll: true });
  });
  $('#global-search-form').addEventListener('submit', event => {
    event.preventDefault(); const query = $('#global-search').value;
    navigate('topics', 'all', { focus: false }); Object.assign(filters, { query, difficulty: 'all', type: 'all', status: 'all', topicId: 'all', visible: 20 }); render(); $('#question-search').focus(); window.scrollTo({ top: 0, behavior: 'instant' });
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,select,[contenteditable="true"]')) { event.preventDefault(); $('#global-search').focus(); }
  });
  $('#theme-toggle').addEventListener('click', () => { progress.theme = progress.theme === 'dark' ? 'light' : 'dark'; applyTheme(); save(); });
  window.addEventListener('popstate', () => fromHash());
  window.addEventListener('hashchange', () => {
    const canonical = `#${activeView}${activeTopic ? '/' + activeTopic : ''}`;
    if (location.hash !== canonical) fromHash();
  });
  views.forEach(([view, , symbol]) => $(`#tab-${view}`).insertAdjacentHTML('afterbegin', icon(symbol)));
  applyTheme(); fromHash(true);
  if (!restored.available) notify('Local storage could not be read. You can still practice; check browser storage settings to keep progress.');
})();