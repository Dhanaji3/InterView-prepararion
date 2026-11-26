/* Pure, shared catalog and persistence helpers. Browser global + Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StudyCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const STORAGE_KEY = 'interview-prep-pro:v1';
  const DIFFICULTIES = ['foundation', 'senior', 'advanced'];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function plainText(value) {
    return String(value ?? '').replace(/<[^>]*>/g, '').replace(/&(lt|gt|amp|quot|#39);/g,
      (_, name) => ({ lt: '<', gt: '>', amp: '&', quot: '"', '#39': "'" })[name]);
  }

  function stableHash(text) {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
    return (hash >>> 0).toString(36);
  }

  function createCatalog(topicDefinitions, banks) {
    const seen = new Set();
    return topicDefinitions.filter(topic => banks[topic.id]).flatMap(topic => {
      const bank = banks[topic.id];
      return bank.items.map((item, index) => {
        const title = item.q || item.problem || item.title || `Output prediction ${index + 1}`;
        const identity = item.q || item.problem || item.title || item.code;
        const id = item.id || `${topic.id}-${stableHash(identity)}`;
        if (seen.has(id)) throw new Error(`Duplicate question ID: ${id}`);
        seen.add(id);
        const type = topic.id === 'scenario' ? 'scenario' : bank.type;
        const difficulty = DIFFICULTIES.includes(item.difficulty) ? item.difficulty :
          (bank.type === 'qa' && /^(what|explain|when would|what's)\b/i.test(plainText(title)) ? 'foundation' : 'senior');
        const searchText = [topic.label, topic.group, topic.description, ...Object.values(item).flat()]
          .filter(Boolean).map(value => `${plainText(value)} ${value}`).join(' ').toLowerCase();
        return { id, topicId: topic.id, topicLabel: topic.label, group: topic.group, type,
          difficulty, title, ordinal: index + 1, item, searchText };
      });
    });
  }

  function filterRecords(records, filters = {}, bookmarks = new Set(), mastered = new Set()) {
    const terms = String(filters.query || '').trim().toLowerCase().split(/\s+/).filter(Boolean);
    return records.filter(record => {
      if (filters.view === 'coding' && record.type !== 'coding') return false;
      if (filters.view === 'scenarios' && !['scenario', 'debug'].includes(record.type)) return false;
      if (filters.view === 'saved' && !bookmarks.has(record.id)) return false;
      if (filters.topicId && filters.topicId !== 'all' && record.topicId !== filters.topicId) return false;
      if (filters.difficulty && filters.difficulty !== 'all' && record.difficulty !== filters.difficulty) return false;
      if (filters.type && filters.type !== 'all' && record.type !== filters.type) return false;
      if (filters.status === 'mastered' && !mastered.has(record.id)) return false;
      if (filters.status === 'unmastered' && mastered.has(record.id)) return false;
      if (filters.status === 'saved' && !bookmarks.has(record.id)) return false;
      return terms.every(term => record.searchText.includes(term));
    });
  }

  function sanitizeProgress(input, records, rounds) {
    const fallback = { version: 1, theme: 'light', bookmarkedIds: [], masteredIds: [], lastTopic: 'javascript',
      mock: { round: 0, question: 0, completed: false, ratings: {} } };
    if (!input || input.version !== 1 || typeof input !== 'object') return fallback;
    const ids = new Set(records.map(record => record.id));
    const cleanIds = values => Array.isArray(values) ? [...new Set(values.filter(id => ids.has(id)))] : [];
    const candidate = input.mock || {};
    const round = Number.isInteger(candidate.round) && candidate.round >= 0 && candidate.round < rounds.length ? candidate.round : 0;
    const question = Number.isInteger(candidate.question) && candidate.question >= 0 && candidate.question < (rounds[round]?.questions.length || 0) ? candidate.question : 0;
    const ratings = {};
    if (candidate.ratings && typeof candidate.ratings === 'object') {
      rounds.forEach((value, r) => value.questions.forEach((_, q) => {
        const key = `${r}:${q}`;
        if (['revisit', 'developing', 'confident'].includes(candidate.ratings[key])) ratings[key] = candidate.ratings[key];
      }));
    }
    return { version: 1, theme: input.theme === 'dark' ? 'dark' : 'light',
      bookmarkedIds: cleanIds(input.bookmarkedIds), masteredIds: cleanIds(input.masteredIds),
      lastTopic: records.some(record => record.topicId === input.lastTopic) ? input.lastTopic : fallback.lastTopic,
      mock: { round, question, completed: candidate.completed === true, ratings } };
  }

  function readProgress(storage, records, rounds) {
    try {
      return { data: sanitizeProgress(JSON.parse(storage.getItem(STORAGE_KEY)), records, rounds), available: true };
    } catch (_) {
      return { data: sanitizeProgress(null, records, rounds), available: false };
    }
  }

  function writeProgress(storage, data) {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch (_) { return false; }
  }

  function paginate(records, visibleCount = 20) {
    const limit = Number.isFinite(visibleCount) ? Math.max(0, Math.floor(visibleCount)) : 20;
    return { items: records.slice(0, limit), total: records.length, hasMore: records.length > limit };
  }

  return { STORAGE_KEY, DIFFICULTIES, escapeHtml, plainText, stableHash, createCatalog,
    filterRecords, sanitizeProgress, readProgress, writeProgress, paginate };
});