/* Additional, explicitly authored Coding Lab exercises.
   Classic-script binding: load before script.js; no ESM export or runtime imports.
   jsCode/tsCode/tests are educational strings, never executed by the application.
   Tests run beside their solution in an async node:test callback with
   const assert = require('node:assert/strict'); await is permitted.
   TS snippets are independent modules (ES2022 + DOM libs); no implicit any.
   Only the labelled Vue solution string needs Vue 3 when copied into a project.
*/
const seniorCodingProblems = [
  {
    id: 'coding-mfe-event-bus-replay',
    problem: 'Scenario: micro-frontends load at different times. Build an event bus with topic subscriptions, optional retained values that are replayed to late subscribers, and handler error isolation.',
    approach: 'Keep a map of topic handlers and a map of retained payloads. A retained publish stores the latest value; subscribing replays it immediately. Every handler runs inside a guard that reports errors without stopping others.',
    jsCode: `function createEventBus({ onError = () => {} } = {}) {
  const handlers = new Map(), retained = new Map();
  function run(handler, topic, payload) {
    try { handler(payload, topic); } catch (error) { onError(error, topic); }
  }
  return {
    publish(topic, payload, { retain = false } = {}) {
      if (retain) retained.set(topic, payload);
      for (const handler of [...(handlers.get(topic) ?? [])]) run(handler, topic, payload);
    },
    subscribe(topic, handler, { replay = true } = {}) {
      let set = handlers.get(topic);
      if (!set) handlers.set(topic, set = new Set());
      const owned = set;
      owned.add(handler);
      if (replay && retained.has(topic)) run(handler, topic, retained.get(topic));
      return () => {
        owned.delete(handler);
        if (owned.size === 0 && handlers.get(topic) === owned) handlers.delete(topic);
      };
    },
    clear(topic) { retained.delete(topic); },
  };
}`,
    tsCode: `type Handler<T> = (payload: T, topic: string) => void;

interface EventBus {
  publish<T>(topic: string, payload: T, options?: { retain?: boolean }): void;
  subscribe<T>(topic: string, handler: Handler<T>, options?: { replay?: boolean }): () => void;
  clear(topic: string): void;
}

function createEventBus({ onError = () => {} }: { onError?: (error: unknown, topic: string) => void } = {}): EventBus {
  const handlers = new Map<string, Set<Handler<never>>>();
  const retained = new Map<string, unknown>();
  function run(handler: Handler<never>, topic: string, payload: unknown): void {
    try { (handler as Handler<unknown>)(payload, topic); } catch (error) { onError(error, topic); }
  }
  return {
    publish(topic, payload, { retain = false } = {}) {
      if (retain) retained.set(topic, payload);
      for (const handler of [...(handlers.get(topic) ?? [])]) run(handler, topic, payload);
    },
    subscribe(topic, handler, { replay = true } = {}) {
      let set = handlers.get(topic);
      if (!set) { set = new Set(); handlers.set(topic, set); }
      const owned = set;
      owned.add(handler as Handler<never>);
      if (replay && retained.has(topic)) run(handler as Handler<never>, topic, retained.get(topic));
      return () => {
        owned.delete(handler as Handler<never>);
        if (owned.size === 0 && handlers.get(topic) === owned) handlers.delete(topic);
      };
    },
    clear(topic) { retained.delete(topic); },
  };
}`,
    explanation: 'Micro-frontends mount independently, so one may publish the current session before another has subscribed. Retaining the latest value and replaying it to new subscribers removes the need for load-order coordination. Only the latest value per topic is kept, so it suits state-like events such as session, locale or the selected customer, not a log of actions. Handler errors are reported through a callback so one faulty application cannot stop the others, and dispatch iterates over a snapshot so unsubscribing during delivery is safe. Treat published payloads as untrusted by consumers and keep the topic names and shapes in a documented contract.',
    complexity: 'publish is O(h) for h handlers of the topic; subscribe and unsubscribe are O(1) on average. Space is O(handlers + retained topics).',
    followup: 'Namespace topics per application, add schema validation of payloads and expire retained values when the session ends.',
    examples: 'The shell publishes a retained session event. An Agent application that mounts later subscribes and immediately receives the same session payload.',
    constraints: 'Topics are strings; handlers are synchronous; one bus instance is shared by the shell and the micro-frontends.',
    edgeCases: 'Non-retained events are not replayed; replay can be disabled per subscription; a failing handler does not affect others; clearing a topic removes its retained value.',
    tests: `const errors = [];
const bus = createEventBus({ onError: (error, topic) => errors.push([error.message, topic]) });
const early = [];
bus.subscribe('session', payload => early.push(payload));
bus.publish('session', { user: 'a' }, { retain: true });
assert.deepEqual(early, [{ user: 'a' }]);
const late = [];
const off = bus.subscribe('session', payload => late.push(payload));
assert.deepEqual(late, [{ user: 'a' }]);
bus.publish('toast', 'hi');
const lateToast = [];
bus.subscribe('toast', payload => lateToast.push(payload));
assert.deepEqual(lateToast, []);
off();
bus.publish('session', { user: 'b' }, { retain: true });
assert.equal(late.length, 1);
assert.equal(early.length, 2);
const noReplay = [];
bus.subscribe('session', payload => noReplay.push(payload), { replay: false });
assert.deepEqual(noReplay, []);
bus.subscribe('boom', () => { throw new Error('bad handler'); });
const survivors = [];
bus.subscribe('boom', payload => survivors.push(payload));
bus.publish('boom', 1);
assert.deepEqual(survivors, [1]);
assert.deepEqual(errors, [['bad handler', 'boom']]);
bus.clear('session');
const afterClear = [];
bus.subscribe('session', payload => afterClear.push(payload));
assert.deepEqual(afterClear, []);`,
    difficulty: 'advanced', tags: ['micro-frontends', 'events', 'communication', 'architecture'],
  },
  {
    id: 'coding-deep-clone-cycles',
    problem: 'Implement deepClone(value) that copies nested objects, arrays, Dates, Maps and Sets, preserves shared and circular references, and keeps functions by reference.',
    approach: 'Recursively copy container types and record every original-to-copy pair in a WeakMap before recursing, so a cycle or shared reference resolves to the already created copy.',
    jsCode: `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Date) return new Date(value.getTime());
  if (value instanceof RegExp) return new RegExp(value.source, value.flags);
  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    for (const [key, item] of value) copy.set(deepClone(key, seen), deepClone(item, seen));
    return copy;
  }
  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    for (const item of value) copy.add(deepClone(item, seen));
    return copy;
  }
  const copy = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) copy[key] = deepClone(value[key], seen);
  return copy;
}`,
    tsCode: `function deepClone<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (value === null || typeof value !== 'object') return value;
  const source = value as unknown as object;
  if (seen.has(source)) return seen.get(source) as T;
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as unknown as T;
  if (value instanceof Map) {
    const copy = new Map<unknown, unknown>();
    seen.set(source, copy);
    for (const [key, item] of value) copy.set(deepClone(key, seen), deepClone(item, seen));
    return copy as unknown as T;
  }
  if (value instanceof Set) {
    const copy = new Set<unknown>();
    seen.set(source, copy);
    for (const item of value) copy.add(deepClone(item, seen));
    return copy as unknown as T;
  }
  const copy: Record<PropertyKey, unknown> = Array.isArray(value)
    ? ([] as unknown as Record<PropertyKey, unknown>)
    : Object.create(Object.getPrototypeOf(source));
  seen.set(source, copy);
  for (const key of Reflect.ownKeys(source)) {
    copy[key] = deepClone((source as Record<PropertyKey, unknown>)[key], seen);
  }
  return copy as unknown as T;
}`,
    explanation: 'Registering the copy before visiting children is what makes cycles terminate: when the traversal meets the original again it returns the copy that already exists. The same table keeps shared references shared instead of duplicating them. Date, RegExp, Map and Set need explicit handling because their state is not stored in ordinary properties. Functions are returned as they are, since they cannot be cloned meaningfully. The built-in structuredClone covers many cases natively but throws for functions and drops prototypes, so a custom clone is for the cases it cannot handle.',
    complexity: 'O(n) time in the number of reachable values and O(n) space for the copy and the lookup table, plus recursion depth.',
    followup: 'Preserve property descriptors, handle typed arrays and avoid stack overflow on very deep structures with an explicit stack.',
    examples: 'Cloning an object that contains a Date, a Map and a reference to itself returns a distinct object whose self reference points to the clone, not the original.',
    constraints: 'Plain data graphs with standard built-ins. Class instances keep their prototype but their private fields and internal slots are not copied.',
    edgeCases: 'null and primitives are returned unchanged; circular and shared references are preserved; mutating the clone never affects the source.',
    tests: `const source = { a: 1, date: new Date(5), map: new Map([['k', { x: 1 }]]), set: new Set([1]), list: [1, { y: 2 }], fn() { return 1; } };
source.self = source;
source.again = source.list;
const clone = deepClone(source);
assert.notEqual(clone, source);
assert.equal(clone.self, clone);
assert.equal(clone.again, clone.list);
assert.notEqual(clone.date, source.date);
assert.equal(clone.date.getTime(), 5);
assert.notEqual(clone.map.get('k'), source.map.get('k'));
assert.deepEqual(clone.map.get('k'), { x: 1 });
assert.deepEqual([...clone.set], [1]);
assert.equal(clone.fn, source.fn);
clone.list[1].y = 9;
assert.equal(source.list[1].y, 2);
assert.equal(deepClone(null), null);
assert.equal(deepClone(7), 7);`,
    difficulty: 'senior', tags: ['clone', 'recursion', 'cycles', 'data-structures'],
  },
  {
    id: 'coding-throttle-leading-trailing',
    problem: 'Implement throttle(fn, waitMs, options) that limits calls to one per window, supports leading and trailing invocation, and offers cancel.',
    approach: 'Use a timer to represent the active window. A call outside a window runs immediately when leading is enabled; calls during a window store the latest arguments, which run when the window ends if trailing is enabled.',
    jsCode: `function throttle(fn, waitMs, { leading = true, trailing = true } = {}) {
  if (!leading && !trailing) throw new TypeError('Enable leading or trailing');
  let timer = null, pendingArgs = null, pendingThis;
  function startWindow() {
    timer = setTimeout(() => {
      timer = null;
      if (pendingArgs) {
        const args = pendingArgs, self = pendingThis;
        pendingArgs = null; pendingThis = undefined;
        fn.apply(self, args);
        startWindow();
      }
    }, waitMs);
  }
  function throttled(...args) {
    if (timer === null) {
      if (leading) fn.apply(this, args);
      else if (trailing) { pendingArgs = args; pendingThis = this; }
      startWindow();
    } else if (trailing) {
      pendingArgs = args; pendingThis = this;
    }
  }
  throttled.cancel = () => { clearTimeout(timer); timer = null; pendingArgs = null; pendingThis = undefined; };
  return throttled;
}`,
    tsCode: `interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

interface Throttled<A extends unknown[]> {
  (this: unknown, ...args: A): void;
  cancel(): void;
}

function throttle<A extends unknown[]>(fn: (this: unknown, ...args: A) => void, waitMs: number,
  { leading = true, trailing = true }: ThrottleOptions = {}): Throttled<A> {
  if (!leading && !trailing) throw new TypeError('Enable leading or trailing');
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: A | null = null;
  let pendingThis: unknown;
  function startWindow(): void {
    timer = setTimeout(() => {
      timer = null;
      if (pendingArgs) {
        const args = pendingArgs, self = pendingThis;
        pendingArgs = null; pendingThis = undefined;
        fn.apply(self, args);
        startWindow();
      }
    }, waitMs);
  }
  const throttled = function (this: unknown, ...args: A): void {
    if (timer === null) {
      if (leading) fn.apply(this, args);
      else if (trailing) { pendingArgs = args; pendingThis = this; }
      startWindow();
    } else if (trailing) {
      pendingArgs = args; pendingThis = this;
    }
  } as Throttled<A>;
  throttled.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null; pendingArgs = null; pendingThis = undefined;
  };
  return throttled;
}`,
    explanation: 'Throttle guarantees a maximum rate, unlike debounce, which waits for quiet. The leading call gives immediate feedback and the trailing call makes sure the final value is not lost. After a trailing call a new window starts, so the maximum rate still holds. Storing only the most recent arguments discards intermediate values, which is correct for scroll and resize handlers where only the latest state matters. Cancel clears the window and the pending call, which is needed on teardown.',
    complexity: 'O(1) time and space per call.',
    followup: 'Use requestAnimationFrame as the window for visual updates, and add flush support.',
    examples: 'With a 30 ms window, calling t(1), t(2), t(3) immediately runs fn(1), and fn(3) runs when the window ends.',
    constraints: 'waitMs is a non-negative number and at least one of leading or trailing is enabled.',
    edgeCases: 'Leading only ignores calls inside the window; trailing only waits for the end of the first window; cancel drops the pending trailing call.',
    tests: `const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const calls = [];
const t = throttle(x => calls.push(x), 30);
t(1); t(2); t(3);
assert.deepEqual(calls, [1]);
await sleep(45);
assert.deepEqual(calls, [1, 3]);
await sleep(40);
t(4);
assert.deepEqual(calls, [1, 3, 4]);
t(5); t.cancel();
await sleep(45);
assert.deepEqual(calls, [1, 3, 4]);
const trailingOnly = [];
const t2 = throttle(x => trailingOnly.push(x), 20, { leading: false });
t2(1); t2(2);
assert.deepEqual(trailingOnly, []);
await sleep(35);
assert.deepEqual(trailingOnly, [2]);
t2.cancel();
const leadingOnly = [];
const t3 = throttle(x => leadingOnly.push(x), 20, { trailing: false });
t3(1); t3(2);
await sleep(35);
assert.deepEqual(leadingOnly, [1]);
assert.throws(() => throttle(() => {}, 10, { leading: false, trailing: false }), TypeError);`,
    difficulty: 'senior', tags: ['throttle', 'timers', 'events', 'performance'],
  },
  {
    id: 'coding-memoize-resolver-async',
    problem: 'Implement memoize(fn, resolver) with a custom key resolver, a clear method, and safe handling of promises that reject.',
    approach: 'Cache results in a Map by resolved key. For promise results, remove the entry if the promise rejects so a transient failure is not cached forever.',
    jsCode: `function memoize(fn, resolver = (...args) => args[0]) {
  const cache = new Map();
  function memoized(...args) {
    const key = resolver(...args);
    if (cache.has(key)) return cache.get(key);
    const value = fn.apply(this, args);
    cache.set(key, value);
    if (value && typeof value.then === 'function') {
      value.then(undefined, () => { if (cache.get(key) === value) cache.delete(key); });
    }
    return value;
  }
  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;
  return memoized;
}`,
    tsCode: `interface Memoized<A extends unknown[], R> {
  (this: unknown, ...args: A): R;
  clear(): void;
  size(): number;
}

function memoize<A extends unknown[], R>(fn: (this: unknown, ...args: A) => R,
  resolver: (...args: A) => unknown = (...args: A) => args[0]): Memoized<A, R> {
  const cache = new Map<unknown, R>();
  const memoized = function (this: unknown, ...args: A): R {
    const key = resolver(...args);
    if (cache.has(key)) return cache.get(key) as R;
    const value = fn.apply(this, args);
    cache.set(key, value);
    if (value && typeof (value as { then?: unknown }).then === 'function') {
      (value as unknown as Promise<unknown>).then(undefined, () => {
        if (cache.get(key) === value) cache.delete(key);
      });
    }
    return value;
  } as Memoized<A, R>;
  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;
  return memoized;
}`,
    explanation: 'The default resolver uses only the first argument, which is fast but wrong for multi-argument functions, so callers supply a resolver that builds a precise key. Storing the promise itself de-duplicates concurrent calls for the same key. Removing a rejected promise from the cache prevents a temporary failure from becoming permanent. The cache is unbounded, so use it for small key spaces or add a size limit or expiry for long-lived applications.',
    complexity: 'O(1) average lookup plus the cost of the resolver. Space grows with the number of distinct keys.',
    followup: 'Add a maximum size with least-recently-used eviction and an expiry time per entry.',
    examples: 'A memoized square function called twice with 4 runs the original once. A resolver based on both arguments distinguishes add(1, 2) from add(1, 3).',
    constraints: 'Keys follow Map equality. The wrapped function should be pure or at least safe to reuse results from.',
    edgeCases: 'Undefined results are cached; rejected promises are evicted; clear removes everything; different arguments with the default resolver and the same first argument share a result.',
    tests: `let runs = 0;
const square = memoize(x => { runs++; return x * x; });
assert.equal(square(4), 16); assert.equal(square(4), 16);
assert.equal(runs, 1);
let adds = 0;
const add = memoize((a, b) => { adds++; return a + b; }, (a, b) => a + ':' + b);
assert.equal(add(1, 2), 3); assert.equal(add(1, 3), 4); assert.equal(add(1, 2), 3);
assert.equal(adds, 2);
square.clear();
assert.equal(square.size(), 0);
square(4);
assert.equal(runs, 2);
let attempts = 0;
const flaky = memoize(async x => { attempts++; if (attempts === 1) throw new Error('bad'); return x; });
await assert.rejects(flaky(1), /bad/);
assert.equal(await flaky(1), 1);
assert.equal(await flaky(1), 1);
assert.equal(attempts, 2);`,
    difficulty: 'senior', tags: ['memoization', 'caching', 'promises', 'performance'],
  },
  {
    id: 'coding-pipe-async-steps',
    problem: 'Implement pipeAsync(...steps) that composes synchronous and asynchronous functions left to right, passing each result to the next step and rejecting on the first failure.',
    approach: 'Validate that every step is a function, then return an async function that awaits each step in order and feeds the awaited value forward.',
    jsCode: `function pipeAsync(...steps) {
  for (const step of steps) {
    if (typeof step !== 'function') throw new TypeError('pipeAsync expects functions');
  }
  return async function (input) {
    let value = input;
    for (const step of steps) value = await step.call(this, value);
    return value;
  };
}`,
    tsCode: `type Step = (value: unknown) => unknown;

function pipeAsync(...steps: Step[]): (input: unknown) => Promise<unknown> {
  for (const step of steps) {
    if (typeof step !== 'function') throw new TypeError('pipeAsync expects functions');
  }
  return async function (this: unknown, input: unknown): Promise<unknown> {
    let value = input;
    for (const step of steps) value = await step.call(this, value);
    return value;
  };
}`,
    explanation: 'Awaiting each result means a step can return either a plain value or a promise, so callers do not need to care. A thrown error or a rejected promise stops the pipeline and propagates, so later steps never run with bad input. With no steps the input passes through unchanged. Validating at composition time reports a programming mistake immediately instead of when the pipeline first runs. The typed signature here is intentionally loose; overloads can chain precise input and output types for a fixed number of steps.',
    complexity: 'O(k) steps executed sequentially; wall time is the sum of the step durations.',
    followup: 'Add typed overloads for up to five steps and an AbortSignal that stops the pipeline between steps.',
    examples: 'pipeAsync(x => x + 1, async x => x * 2, String) applied to 1 resolves to the string 4.',
    constraints: 'Each step takes one argument and returns a value or a promise.',
    edgeCases: 'No steps returns the input; a step that throws rejects the result; a non-function argument throws a TypeError at composition time.',
    tests: `const run = pipeAsync(x => x + 1, async x => x * 2, x => String(x));
assert.equal(await run(1), '4');
assert.equal(await pipeAsync()(7), 7);
let reached = false;
const failing = pipeAsync(() => { throw new Error('stop'); }, () => { reached = true; });
await assert.rejects(failing(1), /stop/);
assert.equal(reached, false);
assert.throws(() => pipeAsync(1), TypeError);`,
    difficulty: 'foundation', tags: ['composition', 'async', 'functional'],
  },
  {
    id: 'coding-balanced-brackets-validator',
    problem: 'Scenario: an expression editor must flag unmatched brackets. Check whether a string has correctly nested and matched (), [] and {} while ignoring other characters.',
    approach: 'Push opening brackets on a stack. For each closing bracket, pop and compare with the expected opener. The input is balanced only if no mismatch occurs and the stack is empty at the end.',
    jsCode: `function isBalanced(text) {
  const pairs = new Map([[')', '('], [']', '['], ['}', '{']]);
  const openers = new Set(pairs.values());
  const stack = [];
  for (const char of text) {
    if (openers.has(char)) stack.push(char);
    else if (pairs.has(char)) {
      if (stack.pop() !== pairs.get(char)) return false;
    }
  }
  return stack.length === 0;
}`,
    tsCode: `function isBalanced(text: string): boolean {
  const pairs = new Map<string, string>([[')', '('], [']', '['], ['}', '{']]);
  const openers = new Set<string>(pairs.values());
  const stack: string[] = [];
  for (const char of text) {
    if (openers.has(char)) stack.push(char);
    else if (pairs.has(char)) {
      if (stack.pop() !== pairs.get(char)) return false;
    }
  }
  return stack.length === 0;
}`,
    explanation: 'The last opened bracket must be the first one closed, which is exactly what a stack models. Popping from an empty stack returns undefined, which never equals an expected opener, so an extra closing bracket fails correctly. Checking that the stack is empty at the end catches unclosed openers. Using a map of closers to openers keeps the logic data-driven, so supporting another bracket pair is a one-line change.',
    complexity: 'O(n) time and O(n) space in the worst case for the stack.',
    followup: 'Return the index of the first error so the editor can highlight it, and ignore brackets inside string literals.',
    examples: '"([]{})" is balanced, "(]" is not, and "a(b)c" is balanced because other characters are ignored.',
    constraints: 'A string of any length; only round, square and curly brackets are considered.',
    edgeCases: 'Empty string is balanced; a leading closing bracket fails; unclosed openers fail; interleaved pairs such as "([)]" fail.',
    tests: `assert.equal(isBalanced('([]{})'), true);
assert.equal(isBalanced(''), true);
assert.equal(isBalanced('a(b)c'), true);
assert.equal(isBalanced('(]'), false);
assert.equal(isBalanced('(('), false);
assert.equal(isBalanced(')('), false);
assert.equal(isBalanced('([)]'), false);
assert.equal(isBalanced('}'), false);`,
    difficulty: 'foundation', tags: ['stack', 'strings', 'validation', 'editor'],
  },
  {
    id: 'coding-debounce-cancel-flush',
    problem: 'Scenario: a search box fires a request on every keystroke. Implement debounce(fn, waitMs) with cancel, flush and pending controls so navigation can drop or force the last call.',
    approach: 'Keep only the latest arguments and context plus one timer. A shared invoke function clears state, so a timer firing and an explicit flush run through the same path.',
    jsCode: `function debounce(fn, waitMs) {
  let timer = null, lastArgs, lastThis, result;
  function invoke() {
    const args = lastArgs, self = lastThis;
    timer = null; lastArgs = lastThis = undefined;
    result = fn.apply(self, args);
    return result;
  }
  function debounced(...args) {
    lastArgs = args; lastThis = this;
    clearTimeout(timer);
    timer = setTimeout(invoke, waitMs);
  }
  debounced.cancel = () => { clearTimeout(timer); timer = null; lastArgs = lastThis = undefined; };
  debounced.flush = () => (timer === null ? result : (clearTimeout(timer), invoke()));
  debounced.pending = () => timer !== null;
  return debounced;
}`,
    tsCode: `interface Debounced<A extends unknown[], R> {
  (this: unknown, ...args: A): void;
  cancel(): void;
  flush(): R | undefined;
  pending(): boolean;
}

function debounce<A extends unknown[], R>(fn: (this: unknown, ...args: A) => R, waitMs: number): Debounced<A, R> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: A | undefined;
  let lastThis: unknown;
  let result: R | undefined;
  function invoke(): R {
    const args = lastArgs as A, self = lastThis;
    timer = null; lastArgs = undefined; lastThis = undefined;
    result = fn.apply(self, args);
    return result;
  }
  const debounced = function (this: unknown, ...args: A): void {
    lastArgs = args; lastThis = this;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(invoke, waitMs);
  } as Debounced<A, R>;
  debounced.cancel = () => { if (timer !== null) clearTimeout(timer); timer = null; lastArgs = undefined; lastThis = undefined; };
  debounced.flush = () => {
    if (timer === null) return result;
    clearTimeout(timer);
    return invoke();
  };
  debounced.pending = () => timer !== null;
  return debounced;
}`,
    explanation: 'Only the final burst argument list is retained, so intermediate keystrokes never reach the handler. Both the timer and flush call invoke, which clears pending state before running fn; a throwing handler therefore cannot leave a stale pending flag. Cancel discards the call without invoking it, which is what a route change or component teardown usually needs. Debounce delays work and does not make it cheaper, so pair it with request cancellation for stale responses.',
    complexity: 'O(1) time and space per call, excluding the wrapped function.',
    followup: 'Add leading-edge invocation and a maximum wait so a continuous stream still produces periodic calls.',
    examples: 'Calling d(1), d(2), d(3) within the wait window runs fn once with 3. d(4) followed by d.flush() runs fn immediately with 4.',
    constraints: 'waitMs is a non-negative number; the wrapped function may return a value, but debounced calls themselves return nothing. Timers come from the host environment.',
    edgeCases: 'flush with nothing pending returns the last result without calling fn; cancel after the timer already fired is a no-op; the this value from the last call is preserved.',
    tests: `const calls = [];
const d = debounce(x => { calls.push(x); return x * 2; }, 20);
d(1); d(2); d(3);
assert.equal(d.pending(), true);
await new Promise(resolve => setTimeout(resolve, 45));
assert.deepEqual(calls, [3]);
assert.equal(d.pending(), false);
d(4);
assert.equal(d.flush(), 8);
assert.deepEqual(calls, [3, 4]);
d(5); d.cancel();
await new Promise(resolve => setTimeout(resolve, 45));
assert.deepEqual(calls, [3, 4]);
assert.equal(d.flush(), 8);`,
    difficulty: 'senior', tags: ['debounce', 'timers', 'search', 'cleanup'],
  },
  {
    id: 'coding-lru-cache-ttl',
    problem: 'Scenario: an API client caches responses. Build a bounded LRU cache whose entries also expire after a time-to-live, with an injectable clock for deterministic tests.',
    approach: 'A Map preserves insertion order, so deleting and re-inserting a key on access moves it to the most recent end. Store an expiry timestamp with each value and evict the first key when capacity is exceeded.',
    jsCode: `class TtlLruCache {
  constructor({ capacity, ttlMs, now = Date.now }) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('capacity');
    if (!(ttlMs > 0)) throw new RangeError('ttlMs');
    this.capacity = capacity; this.ttlMs = ttlMs; this.now = now;
    this.entries = new Map();
  }
  get(key) {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) { this.entries.delete(key); return undefined; }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }
  set(key, value) {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
    if (this.entries.size > this.capacity) this.entries.delete(this.entries.keys().next().value);
    return this;
  }
  delete(key) { return this.entries.delete(key); }
  get size() { return this.entries.size; }
}`,
    tsCode: `interface TtlLruOptions {
  capacity: number;
  ttlMs: number;
  now?: () => number;
}

class TtlLruCache<K, V> {
  private readonly entries = new Map<K, { value: V; expiresAt: number }>();
  private readonly capacity: number;
  private readonly ttlMs: number;
  private readonly now: () => number;

  constructor({ capacity, ttlMs, now = Date.now }: TtlLruOptions) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError('capacity');
    if (!(ttlMs > 0)) throw new RangeError('ttlMs');
    this.capacity = capacity; this.ttlMs = ttlMs; this.now = now;
  }
  get(key: K): V | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) { this.entries.delete(key); return undefined; }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value;
  }
  set(key: K, value: V): this {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs });
    if (this.entries.size > this.capacity) {
      const oldest = this.entries.keys().next();
      if (!oldest.done) this.entries.delete(oldest.value);
    }
    return this;
  }
  delete(key: K): boolean { return this.entries.delete(key); }
  get size(): number { return this.entries.size; }
}`,
    explanation: 'Map iteration follows insertion order, so the first key is always the least recently used one once every read and write re-inserts its key. Expiry is checked lazily on read, which avoids timers and keeps the structure easy to dispose. The size can include expired entries until they are read or evicted, which is an acceptable trade for O(1) operations. A fake clock makes expiry tests deterministic instead of sleeping.',
    complexity: 'get, set and delete are O(1) on average. Space is O(capacity).',
    followup: 'Add stale-while-revalidate behavior and request de-duplication so concurrent misses for one key share a single fetch.',
    examples: 'With capacity 2, setting a, b, reading a, then setting c evicts b. After the TTL passes, get(a) returns undefined.',
    constraints: 'Capacity is a positive integer and ttlMs is positive. Keys follow Map equality. Values may be any type, including undefined, which get cannot distinguish from a miss.',
    edgeCases: 'Overwriting an existing key refreshes both recency and expiry; reading an expired entry removes it; invalid options throw RangeError.',
    tests: `let time = 0;
const cache = new TtlLruCache({ capacity: 2, ttlMs: 100, now: () => time });
cache.set('a', 1).set('b', 2);
assert.equal(cache.get('a'), 1);
cache.set('c', 3);
assert.equal(cache.get('b'), undefined);
assert.equal(cache.get('a'), 1);
assert.equal(cache.size, 2);
time = 150;
assert.equal(cache.get('a'), undefined);
assert.equal(cache.get('c'), undefined);
assert.equal(cache.size, 0);
cache.set('d', 4); time = 249;
assert.equal(cache.get('d'), 4);
assert.throws(() => new TtlLruCache({ capacity: 0, ttlMs: 10 }), RangeError);
assert.throws(() => new TtlLruCache({ capacity: 1, ttlMs: 0 }), RangeError);`,
    difficulty: 'senior', tags: ['cache', 'data-structures', 'ttl', 'testability'],
  },
  {
    id: 'coding-event-emitter-isolation',
    problem: 'Scenario: several widgets subscribe to a shared event bus. Implement an emitter where on returns an unsubscribe function, once is supported, and one failing listener cannot stop the others.',
    approach: 'Store listeners per event in a Set. Emit over a snapshot so unsubscribing during dispatch is safe, run every listener, then report collected failures together.',
    jsCode: `function createEmitter() {
  const listeners = new Map();
  function on(event, listener) {
    if (typeof listener !== 'function') throw new TypeError('listener');
    let set = listeners.get(event);
    if (!set) listeners.set(event, set = new Set());
    set.add(listener);
    return () => {
      set.delete(listener);
      if (set.size === 0 && listeners.get(event) === set) listeners.delete(event);
    };
  }
  function once(event, listener) {
    const off = on(event, (...args) => { off(); return listener(...args); });
    return off;
  }
  function emit(event, ...args) {
    const errors = [];
    for (const listener of [...(listeners.get(event) ?? [])]) {
      try { listener(...args); } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, 'Listener failures for ' + String(event));
  }
  return { on, once, emit };
}`,
    tsCode: `type Listener<P extends unknown[]> = (...args: P) => void;

interface Emitter<E extends Record<string, unknown[]>> {
  on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void;
  once<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void;
  emit<K extends keyof E>(event: K, ...args: E[K]): void;
}

function createEmitter<E extends Record<string, unknown[]>>(): Emitter<E> {
  const listeners = new Map<keyof E, Set<Listener<never>>>();
  function on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    if (typeof listener !== 'function') throw new TypeError('listener');
    let set = listeners.get(event);
    if (!set) { set = new Set(); listeners.set(event, set); }
    const owned = set;
    owned.add(listener as Listener<never>);
    return () => {
      owned.delete(listener as Listener<never>);
      if (owned.size === 0 && listeners.get(event) === owned) listeners.delete(event);
    };
  }
  function once<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    const off = on(event, (...args: E[K]) => { off(); listener(...args); });
    return off;
  }
  function emit<K extends keyof E>(event: K, ...args: E[K]): void {
    const errors: unknown[] = [];
    for (const listener of [...(listeners.get(event) ?? [])]) {
      try { (listener as Listener<E[K]>)(...args); } catch (error) { errors.push(error); }
    }
    if (errors.length) throw new AggregateError(errors, 'Listener failures for ' + String(event));
  }
  return { on, once, emit };
}`,
    explanation: 'Iterating a copy means a listener may unsubscribe itself or another listener without skipping entries or running a removed one twice. Catching per listener isolates failures, while an AggregateError still surfaces every problem to the caller instead of swallowing them. The returned unsubscribe function makes cleanup in a component lifecycle straightforward, and removing empty sets prevents the map from growing with abandoned event names.',
    complexity: 'emit is O(l) for l listeners of the event; on and unsubscribe are O(1) on average. Space is O(total listeners).',
    followup: 'Add an AbortSignal option to on so a whole group of subscriptions can be removed together.',
    examples: 'Subscribing two listeners and emitting once calls both. A once listener runs on the first emit only. If the first listener throws, the second still runs and emit throws an AggregateError.',
    constraints: 'Event keys follow Map equality. Listeners are synchronous; asynchronous listener failures are not captured by emit.',
    edgeCases: 'Unsubscribing twice is harmless; a listener removed during emit still runs for that emit because dispatch uses a snapshot; emitting with no listeners does nothing.',
    tests: `const bus = createEmitter();
const seen = [];
const offA = bus.on('save', value => seen.push('a' + value));
bus.once('save', value => seen.push('once' + value));
bus.emit('save', 1); bus.emit('save', 2);
assert.deepEqual(seen, ['a1', 'once1', 'a2']);
offA(); offA();
bus.emit('save', 3);
assert.deepEqual(seen, ['a1', 'once1', 'a2']);
const ran = [];
bus.on('boom', () => { throw new Error('first'); });
bus.on('boom', () => ran.push('second'));
let caught;
try { bus.emit('boom'); } catch (error) { caught = error; }
assert.ok(caught instanceof AggregateError);
assert.equal(caught.errors.length, 1);
assert.deepEqual(ran, ['second']);
assert.doesNotThrow(() => bus.emit('unknown'));
assert.throws(() => bus.on('x', null), TypeError);`,
    difficulty: 'senior', tags: ['events', 'cleanup', 'error-handling', 'architecture'],
  },
  {
    id: 'coding-optimistic-store-rollback',
    problem: 'Scenario: a UI applies edits optimistically before the server confirms them. Build a store where rolling back one failed edit does not undo later edits that are still pending.',
    approach: 'Keep a confirmed base state plus an ordered list of pending updater functions. The visible state is always derived by replaying pending updaters over the base, so removing one simply recomputes the view.',
    jsCode: `function createOptimisticStore(initial) {
  let confirmed = initial;
  const pending = [];
  const view = () => pending.reduce((state, entry) => entry.update(state), confirmed);
  const indexOf = id => pending.findIndex(entry => entry.id === id);
  return {
    get: view,
    apply(id, update) {
      if (indexOf(id) !== -1) throw new Error('Duplicate edit: ' + id);
      pending.push({ id, update });
      return view();
    },
    confirm(id) {
      const index = indexOf(id);
      if (index === -1) return view();
      const [entry] = pending.splice(index, 1);
      confirmed = entry.update(confirmed);
      return view();
    },
    rollback(id) {
      const index = indexOf(id);
      if (index !== -1) pending.splice(index, 1);
      return view();
    },
    pendingCount: () => pending.length,
  };
}`,
    tsCode: `interface OptimisticStore<S> {
  get(): S;
  apply(id: string, update: (state: S) => S): S;
  confirm(id: string): S;
  rollback(id: string): S;
  pendingCount(): number;
}

function createOptimisticStore<S>(initial: S): OptimisticStore<S> {
  let confirmed = initial;
  const pending: Array<{ id: string; update: (state: S) => S }> = [];
  const view = (): S => pending.reduce((state, entry) => entry.update(state), confirmed);
  const indexOf = (id: string): number => pending.findIndex(entry => entry.id === id);
  return {
    get: view,
    apply(id, update) {
      if (indexOf(id) !== -1) throw new Error('Duplicate edit: ' + id);
      pending.push({ id, update });
      return view();
    },
    confirm(id) {
      const index = indexOf(id);
      if (index === -1) return view();
      const [entry] = pending.splice(index, 1);
      confirmed = entry.update(confirmed);
      return view();
    },
    rollback(id) {
      const index = indexOf(id);
      if (index !== -1) pending.splice(index, 1);
      return view();
    },
    pendingCount: () => pending.length,
  };
}`,
    explanation: 'Restoring a saved snapshot on failure would also erase edits made after it, which is the classic optimistic-update bug. Replaying updaters over a confirmed base avoids that: each edit is an independent function, so removing a failed one leaves the others intact. Updaters must be pure and order-tolerant. Confirming an edit folds it into the base, so it no longer depends on its position in the pending queue.',
    complexity: 'Reading the view is O(p) for p pending edits; apply, confirm and rollback are O(p). Space is O(p).',
    followup: 'Handle a server response that returns the authoritative record, and decide how pending edits should rebase on top of it.',
    examples: 'Start with count 0 and title a. Apply increment as edit one, then a title change as edit two. Rolling back edit one leaves title b with count 0.',
    constraints: 'Edit IDs are unique while pending. Updaters are pure functions that return a new state without mutating the input.',
    edgeCases: 'Rolling back or confirming an unknown ID is a no-op; duplicate pending IDs throw; the original initial state object is never mutated.',
    tests: `const store = createOptimisticStore({ count: 0, title: 'a' });
store.apply('one', s => ({ ...s, count: s.count + 1 }));
store.apply('two', s => ({ ...s, title: 'b' }));
assert.deepEqual(store.get(), { count: 1, title: 'b' });
assert.deepEqual(store.rollback('one'), { count: 0, title: 'b' });
assert.deepEqual(store.confirm('two'), { count: 0, title: 'b' });
assert.equal(store.pendingCount(), 0);
assert.deepEqual(store.rollback('missing'), { count: 0, title: 'b' });
store.apply('three', s => ({ ...s, count: s.count + 5 }));
assert.throws(() => store.apply('three', s => s), /Duplicate edit/);
assert.deepEqual(store.confirm('three'), { count: 5, title: 'b' });`,
    difficulty: 'advanced', tags: ['optimistic-ui', 'state', 'rollback', 'concurrency'],
  },
  {
    id: 'coding-virtual-window-range',
    problem: 'Scenario: a long list must render only visible rows. Compute the visible index range, spacer offset and total height for a fixed-height virtual list with overscan.',
    approach: 'Clamp the scroll position to the scrollable range, derive the first and last visible indices by division, expand by the overscan and clamp to the item count.',
    jsCode: `function getVirtualRange({ scrollTop, viewportHeight, itemHeight, itemCount, overscan = 2 }) {
  for (const [name, value] of Object.entries({ viewportHeight, itemHeight })) {
    if (!(value > 0)) throw new RangeError(name);
  }
  if (!Number.isInteger(itemCount) || itemCount < 0) throw new RangeError('itemCount');
  const totalHeight = itemCount * itemHeight;
  const top = Math.min(Math.max(scrollTop, 0), Math.max(0, totalHeight - viewportHeight));
  const clamp = value => Math.min(Math.max(value, 0), itemCount);
  const start = clamp(Math.floor(top / itemHeight) - overscan);
  const end = clamp(Math.ceil((top + viewportHeight) / itemHeight) + overscan);
  return { start, end, offsetTop: start * itemHeight, totalHeight };
}`,
    tsCode: `interface VirtualInput {
  scrollTop: number;
  viewportHeight: number;
  itemHeight: number;
  itemCount: number;
  overscan?: number;
}

interface VirtualRange {
  start: number;
  end: number;
  offsetTop: number;
  totalHeight: number;
}

function getVirtualRange({ scrollTop, viewportHeight, itemHeight, itemCount, overscan = 2 }: VirtualInput): VirtualRange {
  if (!(viewportHeight > 0)) throw new RangeError('viewportHeight');
  if (!(itemHeight > 0)) throw new RangeError('itemHeight');
  if (!Number.isInteger(itemCount) || itemCount < 0) throw new RangeError('itemCount');
  const totalHeight = itemCount * itemHeight;
  const top = Math.min(Math.max(scrollTop, 0), Math.max(0, totalHeight - viewportHeight));
  const clamp = (value: number): number => Math.min(Math.max(value, 0), itemCount);
  const start = clamp(Math.floor(top / itemHeight) - overscan);
  const end = clamp(Math.ceil((top + viewportHeight) / itemHeight) + overscan);
  return { start, end, offsetTop: start * itemHeight, totalHeight };
}`,
    explanation: 'The range is half-open: start is included and end is excluded, so the rendered slice is items.slice(start, end). Overscan renders a few extra rows on each side so fast scrolling does not reveal blank space. Clamping the scroll position first handles elastic overscroll and a shrinking list without producing a negative or out-of-bounds range. The offset positions the rendered slice inside a container whose height equals the total, preserving native scrollbar behavior.',
    complexity: 'O(1) time and space, independent of the list size.',
    followup: 'Support variable row heights using a measured-height cache and a prefix-sum search to find the first visible row.',
    examples: 'scrollTop 100, viewport 200, item height 50, 100 items and overscan 1 give start 1, end 7, offsetTop 50 and total height 5000.',
    constraints: 'Fixed positive item height and viewport height, a non-negative integer item count and a non-negative overscan.',
    edgeCases: 'Zero items returns an empty range; a scroll position beyond the end is clamped to the last page; negative scroll values act as zero.',
    tests: `assert.deepEqual(getVirtualRange({ scrollTop: 100, viewportHeight: 200, itemHeight: 50, itemCount: 100, overscan: 1 }),
  { start: 1, end: 7, offsetTop: 50, totalHeight: 5000 });
assert.deepEqual(getVirtualRange({ scrollTop: 0, viewportHeight: 200, itemHeight: 50, itemCount: 100, overscan: 2 }),
  { start: 0, end: 6, offsetTop: 0, totalHeight: 5000 });
assert.deepEqual(getVirtualRange({ scrollTop: 99999, viewportHeight: 200, itemHeight: 50, itemCount: 100, overscan: 1 }),
  { start: 95, end: 100, offsetTop: 4750, totalHeight: 5000 });
assert.deepEqual(getVirtualRange({ scrollTop: 50, viewportHeight: 200, itemHeight: 50, itemCount: 0 }),
  { start: 0, end: 0, offsetTop: 0, totalHeight: 0 });
assert.equal(getVirtualRange({ scrollTop: -40, viewportHeight: 100, itemHeight: 50, itemCount: 10, overscan: 0 }).start, 0);
assert.throws(() => getVirtualRange({ scrollTop: 0, viewportHeight: 0, itemHeight: 50, itemCount: 1 }), RangeError);`,
    difficulty: 'senior', tags: ['virtualization', 'performance', 'math', 'lists'],
  },
  {
    id: 'coding-query-string-roundtrip',
    problem: 'Scenario: filter state must live in the URL. Implement stringifyQuery and parseQuery that round-trip repeated keys, encode safely and tolerate malformed input.',
    approach: 'Encode each key and value with encodeURIComponent, repeat the key for arrays and skip null or undefined. When parsing, split on the first equals sign, decode defensively and collect repeated keys into arrays.',
    jsCode: `function stringifyQuery(params) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item === undefined || item === null) continue;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(item)));
    }
  }
  return parts.join('&');
}
function safeDecode(text) {
  try { return decodeURIComponent(text.replace(/\\+/g, ' ')); } catch { return text; }
}
function parseQuery(query) {
  const result = Object.create(null);
  const text = query.startsWith('?') ? query.slice(1) : query;
  for (const part of text.split('&')) {
    if (!part) continue;
    const at = part.indexOf('=');
    const key = safeDecode(at === -1 ? part : part.slice(0, at));
    const value = at === -1 ? '' : safeDecode(part.slice(at + 1));
    if (key in result) result[key] = [].concat(result[key], value);
    else result[key] = value;
  }
  return result;
}`,
    tsCode: `type QueryValue = string | number | boolean | null | undefined;
type QueryInput = Record<string, QueryValue | readonly QueryValue[]>;
type QueryResult = Record<string, string | string[]>;

function stringifyQuery(params: QueryInput): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    const items: readonly QueryValue[] = Array.isArray(value) ? value : [value as QueryValue];
    for (const item of items) {
      if (item === undefined || item === null) continue;
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(item)));
    }
  }
  return parts.join('&');
}

function safeDecode(text: string): string {
  try { return decodeURIComponent(text.replace(/\\+/g, ' ')); } catch { return text; }
}

function parseQuery(query: string): QueryResult {
  const result: QueryResult = Object.create(null);
  const text = query.startsWith('?') ? query.slice(1) : query;
  for (const part of text.split('&')) {
    if (!part) continue;
    const at = part.indexOf('=');
    const key = safeDecode(at === -1 ? part : part.slice(0, at));
    const value = at === -1 ? '' : safeDecode(part.slice(at + 1));
    const existing = result[key];
    if (existing === undefined) result[key] = value;
    else result[key] = ([] as string[]).concat(existing, value);
  }
  return result;
}`,
    explanation: 'A null-prototype result means a key such as __proto__ is just data and cannot pollute Object.prototype. Decoding converts plus signs to spaces for form-style queries and falls back to the raw text for a malformed percent sequence instead of throwing on user-controlled input. All parsed values are strings, so callers must validate and convert types deliberately. Splitting on the first equals sign keeps values that contain an equals sign intact.',
    complexity: 'O(n) in the length of the query or the number of parameters. Space is O(n).',
    followup: 'Add a schema layer that converts numbers and booleans and rejects unknown keys.',
    examples: 'stringifyQuery({ tag: ["a", "b"], q: "x y" }) returns tag=a&tag=b&q=x%20y. parseQuery("?tag=a&tag=b&q=x+y") yields tag as an array and q as x y.',
    constraints: 'Keys are strings; values are primitives or arrays of primitives. Nested objects are not supported.',
    edgeCases: 'null and undefined values are skipped; a key without equals parses as an empty string; malformed percent sequences are kept literally; a __proto__ key is stored as ordinary data.',
    tests: `assert.equal(stringifyQuery({ tag: ['a', 'b'], q: 'x y', skip: undefined, none: null, n: 0 }), 'tag=a&tag=b&q=x%20y&n=0');
assert.deepEqual({ ...parseQuery('?tag=a&tag=b&q=x+y&flag') }, { tag: ['a', 'b'], q: 'x y', flag: '' });
assert.deepEqual({ ...parseQuery('a=1=2&b=%E0%A4%A') }, { a: '1=2', b: '%E0%A4%A' });
assert.deepEqual({ ...parseQuery('') }, {});
const polluted = parseQuery('__proto__=bad');
assert.equal({}.bad, undefined);
assert.equal(Object.getPrototypeOf(polluted), null);
assert.equal(polluted['__proto__'], 'bad');
const round = parseQuery(stringifyQuery({ s: 'a&b=c', t: ['1', '2'] }));
assert.deepEqual({ ...round }, { s: 'a&b=c', t: ['1', '2'] });`,
    difficulty: 'senior', tags: ['url', 'parsing', 'security', 'routing'],
  },
  {
    id: 'coding-task-dependency-order',
    problem: 'Scenario: a build or onboarding flow has steps with prerequisites. Return a valid execution order for tasks with dependencies and report unknown dependencies and cycles clearly.',
    approach: 'Use Kahn topological sorting: count unmet dependencies, start with tasks that have none, and release dependents as their counts reach zero. Anything left over is part of or behind a cycle.',
    jsCode: `function orderTasks(tasks) {
  const known = new Set();
  for (const task of tasks) {
    if (known.has(task.id)) throw new Error('Duplicate task: ' + task.id);
    known.add(task.id);
  }
  const unmet = new Map(), dependents = new Map();
  for (const task of tasks) { unmet.set(task.id, 0); dependents.set(task.id, []); }
  for (const task of tasks) {
    for (const dep of new Set(task.deps)) {
      if (!known.has(dep)) throw new Error('Unknown dependency ' + dep + ' for ' + task.id);
      unmet.set(task.id, unmet.get(task.id) + 1);
      dependents.get(dep).push(task.id);
    }
  }
  const queue = tasks.filter(task => unmet.get(task.id) === 0).map(task => task.id);
  const order = [];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    order.push(id);
    for (const next of dependents.get(id)) {
      const remaining = unmet.get(next) - 1;
      unmet.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }
  if (order.length !== tasks.length) {
    const stuck = tasks.map(task => task.id).filter(id => !order.includes(id));
    throw new Error('Cycle among: ' + stuck.join(', '));
  }
  return order;
}`,
    tsCode: `interface Task {
  id: string;
  deps: readonly string[];
}

function orderTasks(tasks: readonly Task[]): string[] {
  const known = new Set<string>();
  for (const task of tasks) {
    if (known.has(task.id)) throw new Error('Duplicate task: ' + task.id);
    known.add(task.id);
  }
  const unmet = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const task of tasks) { unmet.set(task.id, 0); dependents.set(task.id, []); }
  for (const task of tasks) {
    for (const dep of new Set(task.deps)) {
      if (!known.has(dep)) throw new Error('Unknown dependency ' + dep + ' for ' + task.id);
      unmet.set(task.id, (unmet.get(task.id) ?? 0) + 1);
      dependents.get(dep)?.push(task.id);
    }
  }
  const queue = tasks.filter(task => unmet.get(task.id) === 0).map(task => task.id);
  const order: string[] = [];
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    order.push(id);
    for (const next of dependents.get(id) ?? []) {
      const remaining = (unmet.get(next) ?? 0) - 1;
      unmet.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }
  if (order.length !== tasks.length) {
    const stuck = tasks.map(task => task.id).filter(id => !order.includes(id));
    throw new Error('Cycle among: ' + stuck.join(', '));
  }
  return order;
}`,
    explanation: 'Each task becomes ready only after every dependency has been emitted, which is exactly a topological order. Using the input order to seed and extend the queue makes the result deterministic. Validating duplicates and unknown dependencies up front gives actionable errors instead of a silent partial order. A self-dependency or mutual dependency never reaches zero unmet prerequisites, so it is reported as a cycle. The reported set can include tasks downstream of the cycle, which is still useful for finding the problem.',
    complexity: 'O(V + E) time using maps; the final stuck-task filter is O(V squared) in the worst case because of includes and can use a Set if required. Space is O(V + E).',
    followup: 'Return the actual cycle path, or group tasks into parallel stages that can run at the same time.',
    examples: 'build depends on lint and types, and deploy depends on build. The order is lint, types, build, deploy.',
    constraints: 'Task IDs are unique strings. Dependencies reference other IDs and may contain duplicates. The graph is expected to be small enough for in-memory processing.',
    edgeCases: 'Empty input returns an empty order; duplicate dependency entries are counted once; a self-dependency is reported as a cycle; unknown dependencies throw before ordering starts.',
    tests: `const tasks = [
  { id: 'build', deps: ['lint', 'types'] },
  { id: 'lint', deps: [] },
  { id: 'types', deps: [] },
  { id: 'deploy', deps: ['build'] },
];
assert.deepEqual(orderTasks(tasks), ['lint', 'types', 'build', 'deploy']);
assert.deepEqual(orderTasks([]), []);
assert.deepEqual(orderTasks([{ id: 'a', deps: [] }, { id: 'b', deps: ['a', 'a'] }]), ['a', 'b']);
assert.throws(() => orderTasks([{ id: 'a', deps: ['b'] }, { id: 'b', deps: ['a'] }]), /Cycle among: a, b/);
assert.throws(() => orderTasks([{ id: 'a', deps: ['a'] }]), /Cycle among: a/);
assert.throws(() => orderTasks([{ id: 'a', deps: ['zzz'] }]), /Unknown dependency zzz/);
assert.throws(() => orderTasks([{ id: 'a', deps: [] }, { id: 'a', deps: [] }]), /Duplicate task/);`,
    difficulty: 'senior', tags: ['graphs', 'topological-sort', 'build-tooling', 'validation'],
  },
  {
    id: 'coding-token-bucket-limiter',
    problem: 'Scenario: a client must stay under an API rate limit. Implement a token bucket that reports whether a request may proceed and how long to wait otherwise, using an injectable clock.',
    approach: 'Track a fractional token count and the last update time. On every call, add tokens for the elapsed time up to capacity, then spend the cost if enough tokens are available; otherwise compute the wait from the deficit.',
    jsCode: `function createTokenBucket({ capacity, refillPerSecond, now = Date.now }) {
  if (!Number.isFinite(capacity) || capacity <= 0) throw new RangeError('capacity');
  if (!Number.isFinite(refillPerSecond) || refillPerSecond <= 0) throw new RangeError('refillPerSecond');
  let tokens = capacity, last = now();
  return {
    take(cost = 1) {
      const current = now();
      tokens = Math.min(capacity, tokens + (Math.max(0, current - last) / 1000) * refillPerSecond);
      last = current;
      if (cost > capacity) return { allowed: false, retryAfterMs: Infinity };
      if (tokens >= cost) { tokens -= cost; return { allowed: true, retryAfterMs: 0 }; }
      return { allowed: false, retryAfterMs: Math.ceil(((cost - tokens) / refillPerSecond) * 1000) };
    },
  };
}`,
    tsCode: `interface TokenBucketOptions {
  capacity: number;
  refillPerSecond: number;
  now?: () => number;
}

interface TakeResult {
  allowed: boolean;
  retryAfterMs: number;
}

function createTokenBucket({ capacity, refillPerSecond, now = Date.now }: TokenBucketOptions): { take(cost?: number): TakeResult } {
  if (!Number.isFinite(capacity) || capacity <= 0) throw new RangeError('capacity');
  if (!Number.isFinite(refillPerSecond) || refillPerSecond <= 0) throw new RangeError('refillPerSecond');
  let tokens = capacity;
  let last = now();
  return {
    take(cost = 1): TakeResult {
      const current = now();
      tokens = Math.min(capacity, tokens + (Math.max(0, current - last) / 1000) * refillPerSecond);
      last = current;
      if (cost > capacity) return { allowed: false, retryAfterMs: Infinity };
      if (tokens >= cost) { tokens -= cost; return { allowed: true, retryAfterMs: 0 }; }
      return { allowed: false, retryAfterMs: Math.ceil(((cost - tokens) / refillPerSecond) * 1000) };
    },
  };
}`,
    explanation: 'Refilling lazily from elapsed time avoids timers and gives exact behavior with a fake clock. The capacity allows a short burst while the refill rate bounds the average. A rejected request does not consume tokens, and the returned wait lets the caller schedule a retry instead of polling. Clamping negative elapsed time protects against clock adjustments. Client-side limiting is a courtesy and a smoothing tool, not a security boundary, because the server must enforce its own limits.',
    complexity: 'O(1) time and space per call.',
    followup: 'Combine it with a queue that delays requests until tokens are available, and honor a server Retry-After header by draining the bucket.',
    examples: 'A bucket with capacity 2 and one token per second allows two immediate requests, rejects the third with a 1000 ms wait, and allows another after one second.',
    constraints: 'Positive finite capacity and refill rate; cost defaults to one. The clock returns milliseconds and may be injected.',
    edgeCases: 'A cost larger than the capacity can never succeed and reports an infinite wait; time moving backwards adds no tokens; a rejected call leaves tokens unchanged apart from refill.',
    tests: `let time = 0;
const bucket = createTokenBucket({ capacity: 2, refillPerSecond: 1, now: () => time });
assert.equal(bucket.take().allowed, true);
assert.equal(bucket.take().allowed, true);
const denied = bucket.take();
assert.equal(denied.allowed, false);
assert.equal(denied.retryAfterMs, 1000);
time = 500;
assert.equal(bucket.take().retryAfterMs, 500);
time = 1000;
assert.equal(bucket.take().allowed, true);
time = 100000;
assert.equal(bucket.take(2).allowed, true);
assert.equal(bucket.take(3).retryAfterMs, Infinity);
time = 50;
assert.equal(bucket.take().allowed, false);
assert.throws(() => createTokenBucket({ capacity: 0, refillPerSecond: 1 }), RangeError);`,
    difficulty: 'senior', tags: ['rate-limiting', 'api', 'time', 'testability'],
  },
  {
    id: 'coding-immutable-set-in-path',
    problem: 'Scenario: a form stores nested values under dotted field names. Implement an immutable setIn(obj, path, value) that shares unchanged branches, creates arrays for numeric segments and rejects unsafe keys.',
    approach: 'Walk the path recursively, copying only the containers along it. Choose an array or object container from the current key, and keep every untouched sibling by reference.',
    jsCode: `const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
function setIn(source, path, value) {
  const keys = String(path).split('.');
  if (keys.some(key => key === '' || UNSAFE_KEYS.has(key))) throw new TypeError('Invalid path: ' + path);
  function update(node, index) {
    if (index === keys.length) return value;
    const key = keys[index];
    const container = node !== null && typeof node === 'object' ? node : (/^\\d+$/.test(key) ? [] : {});
    const copy = Array.isArray(container) ? container.slice() : { ...container };
    copy[key] = update(container[key], index + 1);
    return copy;
  }
  return update(source, 0);
}`,
    tsCode: `const UNSAFE_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

function setIn<T>(source: T, path: string, value: unknown): T {
  const keys = String(path).split('.');
  if (keys.some(key => key === '' || UNSAFE_KEYS.has(key))) throw new TypeError('Invalid path: ' + path);
  function update(node: unknown, index: number): unknown {
    if (index === keys.length) return value;
    const key = keys[index];
    const container: Record<string, unknown> = node !== null && typeof node === 'object'
      ? (node as Record<string, unknown>)
      : (/^\\d+$/.test(key) ? ([] as unknown as Record<string, unknown>) : {});
    const copy: Record<string, unknown> = Array.isArray(container)
      ? (container.slice() as unknown as Record<string, unknown>)
      : { ...container };
    copy[key] = update(container[key], index + 1);
    return copy;
  }
  return update(source, 0) as T;
}`,
    explanation: 'Only containers on the path are copied, so unchanged branches keep their identity and reference-based change detection in frameworks stays effective. The next container type comes from the key at that level, which creates an array for a numeric key and an object otherwise. Rejecting __proto__, constructor and prototype segments prevents prototype pollution from user-controlled field names. The original input is never mutated, which keeps undo history and equality checks reliable.',
    complexity: 'O(d + c) time for path depth d plus the size of each copied container; space is the same for the new containers.',
    followup: 'Add getIn and deleteIn helpers and support bracket syntax such as items[0].name.',
    examples: 'setIn({ user: { tags: ["a"] }, other: {} }, "user.tags.1", "b") returns a new tree with tags a and b and the same other object reference.',
    constraints: 'Dotted string paths with no empty segments. Values are plain objects and arrays. Class instances and Maps are not supported.',
    edgeCases: 'A missing branch is created; a primitive in the way is replaced by a new container; unsafe or empty segments throw TypeError; the source object is unchanged.',
    tests: `const original = { user: { name: 'x', tags: ['a'] }, other: { k: 1 } };
const next = setIn(original, 'user.tags.1', 'b');
assert.deepEqual(next.user.tags, ['a', 'b']);
assert.deepEqual(original.user.tags, ['a']);
assert.equal(next.other, original.other);
assert.notEqual(next.user, original.user);
assert.deepEqual(setIn({}, 'items.0.name', 'n'), { items: [{ name: 'n' }] });
assert.equal(Array.isArray(setIn({}, 'items.0', 1).items), true);
assert.deepEqual(setIn({ a: 'text' }, 'a.b', 1), { a: { b: 1 } });
assert.throws(() => setIn({}, '__proto__.polluted', true), TypeError);
assert.throws(() => setIn({}, 'a..b', 1), TypeError);
assert.equal({}.polluted, undefined);`,
    difficulty: 'senior', tags: ['immutability', 'forms', 'security', 'objects'],
  },
  {
    id: 'coding-map-limit',
    problem: 'Implement mapLimit(items, limit, mapper): bound active asynchronous work, preserve input order, and reject on the first observed failure.',
    approach: 'Use a shared index and at most limit workers. Mark failure before rejecting so workers stop claiming new indices.',
    jsCode: `async function mapLimit(items, limit, mapper) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('limit');
  const results = new Array(items.length);
  let next = 0, failed = false;
  async function worker() {
    while (!failed && next < items.length) {
      const index = next++;
      try { results[index] = await mapper(items[index], index); }
      catch (error) { failed = true; throw error; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}`,
    tsCode: `async function mapLimit<T, R>(items: readonly T[], limit: number,
  mapper: (item: T, index: number) => R | PromiseLike<R>): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('limit');
  const results: R[] = new Array(items.length);
  let next = 0, failed = false;
  async function worker(): Promise<void> {
    while (!failed && next < items.length) {
      const index = next++;
      try { results[index] = await mapper(items[index], index); }
      catch (error) { failed = true; throw error; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}`,
    explanation: 'Index assignment happens synchronously before awaiting, so no two workers claim the same item. Fail-fast rejects the outer promise but does not magically abort running tasks; their outcomes remain observed by Promise.all. Work claimed before a failure is observed may finish. Mapper cancellation must be a separate cooperative signal contract.',
    complexity: 'Time O(n) orchestration plus mapper work; asynchronous wall time depends on task durations and limit. Space O(n + min(n, limit)) including results and workers, excluding task internals.',
    followup: 'Add a collect-errors policy or a caller-owned AbortSignal without leaving rejected worker promises unobserved.',
    examples: 'await mapLimit([3, 1, 2], 2, async n => n * 2) returns [6, 2, 4], regardless of completion order.',
    constraints: 'A finite, dense readonly array; positive integer limit; mapper may return a value or promise and may throw. Caller must not mutate the input while mapping.',
    edgeCases: 'Empty array returns []; limit larger than input starts only n workers; synchronous throws reject; first observed rejection stops new scheduling.',
    tests: `let active = 0, maximum = 0;
const out = await mapLimit([3, 1, 2], 2, async n => {
  maximum = Math.max(maximum, ++active);
  await new Promise(resolve => setTimeout(resolve, n));
  active--; return n * 2;
});
assert.deepEqual(out, [6, 2, 4]); assert.equal(maximum, 2);
assert.deepEqual(await mapLimit([], 1, x => x), []);
await assert.rejects(mapLimit([], 0, x => x), RangeError);
let started = 0;
await assert.rejects(mapLimit([1, 2, 3], 1, () => { started++; throw new Error('bad'); }), /bad/);
assert.equal(started, 1);`,
    difficulty: 'advanced', tags: ['async', 'concurrency', 'error-policy'],
  },
  {
    id: 'coding-retry-backoff',
    problem: 'Retry explicitly approved safe operations with capped exponential backoff and cancellation, including cancellation during a delay.',
    approach: 'Separate an abort-aware sleep from the retry loop. Require shouldRetry to opt in after every non-final failure.',
    jsCode: `function abortReason(signal) {
  return signal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' });
}
function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(abortReason(signal)); return; }
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    const timer = setTimeout(() => { cleanup(); resolve(); }, ms);
    function onAbort() { clearTimeout(timer); cleanup(); reject(abortReason(signal)); }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
async function retryBackoff(operation, options = {}) {
  const { attempts = 3, baseMs = 100, maxMs = 5000,
    signal, shouldRetry = () => false } = options;
  if (!Number.isInteger(attempts) || attempts < 1 ||
      !Number.isFinite(baseMs) || baseMs < 0 ||
      !Number.isFinite(maxMs) || maxMs < 0 || maxMs > 2147483647)
    throw new RangeError('retry options');
  let delay = Math.min(baseMs, maxMs);
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (signal?.aborted) throw abortReason(signal);
    try {
      const value = await operation(attempt, signal);
      if (signal?.aborted) throw abortReason(signal);
      return value;
    } catch (error) {
      if (signal?.aborted) throw abortReason(signal);
      if (attempt === attempts || !shouldRetry(error, attempt)) throw error;
      await abortableSleep(delay, signal);
      delay = Math.min(maxMs, delay * 2);
    }
  }
  throw new Error('Unreachable');
}`,
    tsCode: `function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? Object.assign(new Error('Aborted'), { name: 'AbortError' });
}
function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(abortReason(signal)); return; }
    const cleanup = () => signal?.removeEventListener('abort', onAbort);
    const timer = setTimeout(() => { cleanup(); resolve(); }, ms);
    function onAbort() {
      clearTimeout(timer); cleanup();
      if (signal) reject(abortReason(signal));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
type RetryOptions = { attempts?: number; baseMs?: number; maxMs?: number;
  signal?: AbortSignal; shouldRetry?: (error: unknown, attempt: number) => boolean };
async function retryBackoff<T>(operation: (attempt: number, signal?: AbortSignal) => PromiseLike<T> | T,
  options: RetryOptions = {}): Promise<T> {
  const { attempts = 3, baseMs = 100, maxMs = 5000,
    signal, shouldRetry = () => false } = options;
  if (!Number.isInteger(attempts) || attempts < 1 ||
      !Number.isFinite(baseMs) || baseMs < 0 ||
      !Number.isFinite(maxMs) || maxMs < 0 || maxMs > 2147483647)
    throw new RangeError('retry options');
  let delay = Math.min(baseMs, maxMs);
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (signal?.aborted) throw abortReason(signal);
    try {
      const value = await operation(attempt, signal);
      if (signal?.aborted) throw abortReason(signal);
      return value;
    } catch (error) {
      if (signal?.aborted) throw abortReason(signal);
      if (attempt === attempts || !shouldRetry(error, attempt)) throw error;
      await abortableSleep(delay, signal);
      delay = Math.min(maxMs, delay * 2);
    }
  }
  throw new Error('Unreachable');
}`,
    explanation: 'attempts includes the initial call. Delays are min(maxMs, baseMs * 2^retryIndex). Cancellation removes delay listeners and timers; an active operation must itself honor the supplied signal to stop promptly. Default policy never retries: the callback opts in only for safe/idempotent operations or requests protected by server idempotency keys, not arbitrary mutations. HTTP failures must be turned into errors by the operation.',
    complexity: 'Time O(a) control work plus a operation costs and backoff delays for a attempts; total wait is the sum of capped delays. Space O(1) auxiliary, one timer/listener at a time.',
    followup: 'Inject a clock and random source to test jitter, Retry-After, and global retry budgets deterministically.',
    examples: 'retryBackoff(readResource, { attempts: 4, baseMs: 100, maxMs: 250, shouldRetry: isTransient }) waits 100, 200, 250 ms on successive approved failures.',
    constraints: 'attempts >= 1 integer; finite nonnegative delays; maxMs <= 2^31-1 ms. shouldRetry is synchronous; signals belong to the caller. No built-in jitter.',
    edgeCases: 'Already aborted signal prevents the first call; abort during sleep rejects immediately; final failure propagates unchanged; attempts: 1 never sleeps.',
    tests: `let calls = 0;
assert.equal(await retryBackoff(() => { if (++calls < 3) throw new Error('transient'); return 7; },
  { baseMs: 0, shouldRetry: () => true }), 7);
assert.equal(calls, 3);
calls = 0;
await assert.rejects(retryBackoff(() => { calls++; throw new Error('unsafe'); }), /unsafe/);
assert.equal(calls, 1);
const controller = new AbortController();
const pending = retryBackoff(() => { throw new Error('again'); },
  { signal: controller.signal, baseMs: 1000, shouldRetry: () => true });
const rejected = assert.rejects(pending, /cancel/);
queueMicrotask(() => controller.abort(new Error('cancel')));
await rejected;
await assert.rejects(retryBackoff(() => 1, { attempts: 0 }), RangeError);`,
    difficulty: 'advanced', tags: ['async', 'retry', 'cancellation', 'idempotency'],
  },
  {
    id: 'coding-abortable-timeout',
    problem: 'Wrap an operation in a deadline that rejects promptly and aborts its child signal, while respecting external cancellation.',
    approach: 'Own a child AbortController and one timer. A single finish gate clears the timer and the parent abort listener on every settlement path.',
    jsCode: `function withTimeout(operation, ms, parentSignal) {
  if (!Number.isFinite(ms) || ms < 0 || ms > 2147483647)
    return Promise.reject(new RangeError('ms'));
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    let done = false, timer;
    const cleanup = () => {
      clearTimeout(timer);
      parentSignal?.removeEventListener('abort', onAbort);
    };
    const finish = (ok, value) => {
      if (done) return;
      done = true; cleanup();
      if (ok) resolve(value); else reject(value);
    };
    const cancel = reason => {
      finish(false, reason);
      controller.abort(reason);
    };
    function onAbort() { cancel(parentSignal.reason); }
    if (parentSignal?.aborted) { onAbort(); return; }
    parentSignal?.addEventListener('abort', onAbort, { once: true });
    timer = setTimeout(() => cancel(Object.assign(new Error('Deadline exceeded'),
      { name: 'TimeoutError' })), ms);
    Promise.resolve().then(() => {
      if (!done) return operation(controller.signal);
    }).then(value => finish(true, value), error => finish(false, error));
  });
}`,
    tsCode: `function withTimeout<T>(operation: (signal: AbortSignal) => PromiseLike<T> | T,
  ms: number, parentSignal?: AbortSignal): Promise<T> {
  if (!Number.isFinite(ms) || ms < 0 || ms > 2147483647)
    return Promise.reject(new RangeError('ms'));
  return new Promise<T>((resolve, reject) => {
    const controller = new AbortController();
    let done = false, timer: ReturnType<typeof setTimeout> | undefined;
    const cleanup = () => {
      clearTimeout(timer);
      parentSignal?.removeEventListener('abort', onAbort);
    };
    function finish(ok: true, value: T): void;
    function finish(ok: false, value: unknown): void;
    function finish(ok: boolean, value: unknown): void {
      if (done) return;
      done = true; cleanup();
      if (ok) resolve(value as T); else reject(value);
    }
    const cancel = (reason: unknown) => { finish(false, reason); controller.abort(reason); };
    function onAbort() { cancel(parentSignal?.reason); }
    if (parentSignal?.aborted) { onAbort(); return; }
    parentSignal?.addEventListener('abort', onAbort, { once: true });
    timer = setTimeout(() => cancel(Object.assign(new Error('Deadline exceeded'),
      { name: 'TimeoutError' })), ms);
    Promise.resolve().then(() => {
      if (!done) return operation(controller.signal);
      return undefined;
    }).then(value => { if (!done) finish(true, value as T); }, error => finish(false, error));
  });
}`,
    explanation: 'Unlike merely racing an already-started promise, the wrapper provides an owned child signal. It never aborts the caller controller. Deadline/cancel rejection is prompt even if the operation ignores abort, but that operation may still consume resources; its eventual rejection is observed. TS assertions only bridge the gated settlement implementation, not response validation.',
    complexity: 'Time O(1) wrapper overhead plus operation work, with deadline-limited waiting (subject to event-loop delays). Space O(1) auxiliary timer/controller/listener, excluding the operation.',
    followup: 'How would you distinguish an idle timeout from a total deadline for a streamed response?',
    examples: 'await withTimeout(signal => fetch(url, { signal }), 500) either returns a Response or rejects with TimeoutError after the deadline.',
    constraints: 'Finite ms in [0, 2^31-1]. The operation is invoked in a microtask, not synchronously; CPU-blocking JavaScript cannot be preempted by a timer.',
    edgeCases: 'Pre-aborted parent never invokes the operation; zero ms still permits already-resolved microtasks; completion removes parent listeners; synchronous throws reject.',
    tests: `assert.equal(await withTimeout(() => 42, 100), 42);
let child;
await assert.rejects(withTimeout(signal => { child = signal; return new Promise(() => {}); }, 0),
  { name: 'TimeoutError' });
assert.equal(child.aborted, true);
const parent = new AbortController(); parent.abort(new Error('parent cancelled'));
let invoked = false;
await assert.rejects(withTimeout(() => { invoked = true; }, 10, parent.signal), /parent cancelled/);
assert.equal(invoked, false);
await assert.rejects(withTimeout(() => { throw new Error('sync'); }, 100), /sync/);`,
    difficulty: 'advanced', tags: ['async', 'timeout', 'abort-controller'],
  },
  {
    id: 'coding-inflight-dedupe',
    problem: 'Share only in-flight requests with identical explicit keys; evict successes and failures so future calls can retry.',
    approach: 'Store the exact shared promise in a Map. Defer loader invocation so the entry exists even if the loader throws synchronously.',
    jsCode: `function createRequestDeduper(load) {
  const pending = new Map();
  return function request(key) {
    if (pending.has(key)) return pending.get(key);
    const shared = Promise.resolve().then(() => load(key)).then(
      value => { pending.delete(key); return value; },
      error => { pending.delete(key); throw error; }
    );
    pending.set(key, shared);
    return shared;
  };
}`,
    tsCode: `function createRequestDeduper<K, V>(load: (key: K) => V | PromiseLike<V>) {
  const pending = new Map<K, Promise<V>>();
  return function request(key: K): Promise<V> {
    const existing = pending.get(key);
    if (existing) return existing;
    const shared = Promise.resolve().then(() => load(key)).then(
      value => { pending.delete(key); return value; },
      error => { pending.delete(key); throw error; }
    );
    pending.set(key, shared);
    return shared;
  };
}`,
    explanation: 'This is single-flight, not persistent memoization. Request identity keys must include every response-affecting dimension: method, normalized URL/query, body identity, tenant/auth scope and relevant headers. Do not mix users under a URL-only key. The deduper/loader owns shared cancellation: an individual subscriber must not abort work needed by others. This version deliberately has no per-subscriber signal; a separate wrapper can stop that subscriber waiting without aborting shared work.',
    complexity: 'Time expected O(1) per lookup/settlement plus loader work and key construction. Space O(k) for k distinct in-flight keys, excluding payloads.',
    followup: 'Add subscriber reference counts and abort shared work only after every subscriber releases ownership.',
    examples: 'const read = createRequestDeduper(key => apiRead(key)); read("tenantA:user7") === read("tenantA:user7") while pending.',
    constraints: 'Map key identity uses SameValueZero; object keys use reference identity, not deep equality. Loader must not recursively await the same key. Caller handles returned rejections.',
    edgeCases: 'Synchronous loader throws evict; rejected keys may be requested again; distinct auth scopes never share; no consumers does not automatically cancel a hung loader.',
    tests: `let calls = 0;
const read = createRequestDeduper(async key => { calls++; return key + '!'; });
const first = read('a'), second = read('a');
assert.equal(first, second); assert.equal(await first, 'a!');
assert.equal(calls, 1); await read('a'); assert.equal(calls, 2);
let failures = 0;
const bad = createRequestDeduper(() => { failures++; throw new Error('fail'); });
await assert.rejects(bad('x'), /fail/); await assert.rejects(bad('x'), /fail/);
assert.equal(failures, 2);`,
    difficulty: 'senior', tags: ['async', 'requests', 'identity', 'caching'],
  },
  {
    id: 'coding-lru-cache',
    problem: 'Implement a bounded LRU cache: reads and overwrites promote entries; writes evict the least recently used entry.',
    approach: 'Use Map insertion order, deleting then reinserting a touched key. Capacity zero intentionally stores nothing.',
    jsCode: `class LRUCache {
  #entries = new Map();
  #capacity;
  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity < 0) throw new RangeError('capacity');
    this.#capacity = capacity;
  }
  get size() { return this.#entries.size; }
  has(key) { return this.#entries.has(key); }
  get(key) {
    if (!this.#entries.has(key)) return undefined;
    const value = this.#entries.get(key);
    this.#entries.delete(key); this.#entries.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.#capacity === 0) return;
    this.#entries.delete(key); this.#entries.set(key, value);
    if (this.size > this.#capacity) this.#entries.delete(this.#entries.keys().next().value);
  }
}`,
    tsCode: `class LRUCache<K, V> {
  #entries = new Map<K, V>();
  #capacity: number;
  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 0) throw new RangeError('capacity');
    this.#capacity = capacity;
  }
  get size(): number { return this.#entries.size; }
  has(key: K): boolean { return this.#entries.has(key); }
  get(key: K): V | undefined {
    if (!this.#entries.has(key)) return undefined;
    const value = this.#entries.get(key) as V; // has() permits stored undefined
    this.#entries.delete(key); this.#entries.set(key, value);
    return value;
  }
  set(key: K, value: V): void {
    if (this.#capacity === 0) return;
    this.#entries.delete(key); this.#entries.set(key, value);
    if (this.size > this.#capacity) {
      const oldest = this.#entries.keys().next();
      if (!oldest.done) this.#entries.delete(oldest.value);
    }
  }
}`,
    explanation: 'Map order is oldest to newest; promotion requires delete followed by set even on overwrite. has() is deliberately non-promoting and distinguishes a missing entry from a stored undefined. The collection-size bound counts entries, not bytes.',
    complexity: 'Time expected amortized O(1) per get/has/set using typical Map implementations. Space O(capacity) entries; values may be arbitrarily large.',
    followup: 'Replace insertion-order Map with a hash table plus doubly linked list if explicit O(1) bookkeeping is required.',
    examples: 'Capacity 2: set a, set b, get a, set c evicts b, leaving a and c.',
    constraints: 'Nonnegative integer capacity. No TTL, persistence, or byte budget. Keys use Map identity.',
    edgeCases: 'Capacity 0 remains empty; overwriting does not grow size; undefined is a valid value; has does not refresh recency.',
    tests: `const cache = new LRUCache(2);
cache.set('a', 1); cache.set('b', 2); assert.equal(cache.get('a'), 1);
cache.set('c', 3); assert.equal(cache.has('b'), false);
cache.set('a', undefined); assert.equal(cache.has('a'), true);
assert.equal(cache.get('a'), undefined); assert.equal(cache.size, 2);
const zero = new LRUCache(0); zero.set('x', 1); assert.equal(zero.size, 0);
assert.throws(() => new LRUCache(-1), RangeError);`,
    difficulty: 'senior', tags: ['data-structures', 'cache', 'lru'],
  },
  {
    id: 'coding-ttl-cache',
    problem: 'Implement a lazy TTL cache with exact expiry-boundary behavior and an injectable monotonic clock.',
    approach: 'Store value and expiry together. Delete expired entries on read and provide an explicit sweep for entries never read again.',
    jsCode: `class TTLCache {
  #entries = new Map();
  #now;
  constructor(now = () => performance.now()) { this.#now = now; }
  set(key, value, ttlMs) {
    if (!Number.isFinite(ttlMs) || ttlMs < 0) throw new RangeError('ttlMs');
    const expires = this.#now() + ttlMs;
    if (!Number.isFinite(expires)) throw new RangeError('expiry');
    if (ttlMs === 0) this.#entries.delete(key);
    else this.#entries.set(key, { value, expires });
  }
  get(key) {
    const entry = this.#entries.get(key);
    if (!entry) return { hit: false };
    if (this.#now() >= entry.expires) {
      this.#entries.delete(key); return { hit: false };
    }
    return { hit: true, value: entry.value };
  }
  sweep() {
    const now = this.#now(); let removed = 0;
    for (const [key, entry] of this.#entries) {
      if (now >= entry.expires) { this.#entries.delete(key); removed++; }
    }
    return removed;
  }
}`,
    tsCode: `class TTLCache<K, V> {
  #entries = new Map<K, { value: V; expires: number }>();
  #now: () => number;
  constructor(now: () => number = () => performance.now()) { this.#now = now; }
  set(key: K, value: V, ttlMs: number): void {
    if (!Number.isFinite(ttlMs) || ttlMs < 0) throw new RangeError('ttlMs');
    const expires = this.#now() + ttlMs;
    if (!Number.isFinite(expires)) throw new RangeError('expiry');
    if (ttlMs === 0) this.#entries.delete(key);
    else this.#entries.set(key, { value, expires });
  }
  get(key: K): { hit: false } | { hit: true; value: V } {
    const entry = this.#entries.get(key);
    if (!entry) return { hit: false };
    if (this.#now() >= entry.expires) {
      this.#entries.delete(key); return { hit: false };
    }
    return { hit: true, value: entry.value };
  }
  sweep(): number {
    const now = this.#now(); let removed = 0;
    for (const [key, entry] of this.#entries) {
      if (now >= entry.expires) { this.#entries.delete(key); removed++; }
    }
    return removed;
  }
}`,
    explanation: 'Expiry is inclusive: now >= expires is a miss. Reads do not extend TTL. A discriminated hit result preserves stored undefined. There are no timers to clean up, but lazy expiry is not a memory bound: untouched expired keys remain until sweep; combine with capacity eviction in production.',
    complexity: 'Time expected O(1) set/get; sweep O(k) over retained entries. Space O(k), including expired entries not yet swept.',
    followup: 'Combine TTL with LRU and a periodic sweep whose timer is disposed by the cache owner.',
    examples: 'At clock 0, set("a", 7, 10); get at 9 is a hit, at 10 a miss.',
    constraints: 'Finite nonnegative TTL; injected clock returns finite monotonic milliseconds. No cross-process sharing or wall-clock persistence.',
    edgeCases: 'TTL 0 deletes immediately; overwrites reset expiry; undefined differs from a miss; clock rollback is outside the clock contract.',
    tests: `let now = 0; const cache = new TTLCache(() => now);
cache.set('a', undefined, 10); now = 9;
assert.deepEqual(cache.get('a'), { hit: true, value: undefined });
now = 10; assert.deepEqual(cache.get('a'), { hit: false });
cache.set('b', 2, 5); now = 15; assert.equal(cache.sweep(), 1);
cache.set('z', 1, 0); assert.equal(cache.get('z').hit, false);
assert.throws(() => cache.set('bad', 1, -1), RangeError);`,
    difficulty: 'senior', tags: ['cache', 'ttl', 'testing', 'clock'],
  },
  {
    id: 'coding-all-settled-array',
    problem: 'Implement an array-only allSettledArray that preserves order and captures both fulfilled values and rejection reasons.',
    approach: 'Turn every input into a promise that always fulfills with a status record, then aggregate those records.',
    jsCode: `function allSettledArray(values) {
  return Promise.all(Array.from(values, value => Promise.resolve(value).then(
    result => ({ status: 'fulfilled', value: result }),
    reason => ({ status: 'rejected', reason })
  )));
}`,
    tsCode: `function allSettledArray<T>(values: readonly (T | PromiseLike<T>)[]):
  Promise<PromiseSettledResult<Awaited<T>>[]> {
  return Promise.all(Array.from(values, value => Promise.resolve(value).then(
    (result): PromiseFulfilledResult<Awaited<T>> => ({ status: 'fulfilled', value: result }),
    (reason: unknown): PromiseRejectedResult => ({ status: 'rejected', reason })
  )));
}`,
    explanation: 'Each rejection handler converts failure into data, so Promise.all no longer fails because one input rejects. Array.from also visits sparse positions as undefined. This is intentionally not a spec-complete Promise subclass/iterator implementation; use native Promise.allSettled in real applications.',
    complexity: 'Time O(n) coordination plus promise settlement time (waits for all inputs). Space O(n) promises and result records.',
    followup: 'How would tuple inference preserve a distinct value type for every input position?',
    examples: 'allSettledArray([1, Promise.reject("offline")]) returns fulfilled 1 followed by rejected "offline".',
    constraints: 'Array inputs only; accepts values and thenables; does not limit concurrency or impose timeouts.',
    edgeCases: 'Empty array resolves []; thrown thenable errors become rejection records; a never-settling input keeps the aggregate pending.',
    tests: `assert.deepEqual(await allSettledArray([Promise.resolve(2), Promise.reject('bad'), 3]), [
  { status: 'fulfilled', value: 2 }, { status: 'rejected', reason: 'bad' },
  { status: 'fulfilled', value: 3 }
]);
assert.deepEqual(await allSettledArray([]), []);
assert.deepEqual(await allSettledArray(new Array(1)), [{ status: 'fulfilled', value: undefined }]);`,
    difficulty: 'senior', tags: ['promises', 'error-policy', 'arrays'],
  },
  {
    id: 'coding-debounce-controls',
    problem: 'Extend trailing debounce with cancel() and flush(), retaining the latest arguments and receiver without retaining them after completion.',
    approach: 'Capture one pending call. Clear state before invoking so a reentrant call can schedule another debounce safely.',
    jsCode: `function debounceControlled(fn, wait) {
  if (!Number.isFinite(wait) || wait < 0 || wait > 2147483647) throw new RangeError('wait');
  let timer, args, receiver;
  function invoke() {
    const current = args, context = receiver;
    timer = undefined; args = undefined; receiver = undefined;
    return fn.apply(context, current);
  }
  function wrapped(...nextArgs) {
    clearTimeout(timer); args = nextArgs; receiver = this;
    timer = setTimeout(invoke, wait);
  }
  wrapped.cancel = () => {
    clearTimeout(timer); timer = undefined; args = undefined; receiver = undefined;
  };
  wrapped.flush = () => {
    if (timer === undefined) return undefined;
    clearTimeout(timer); return invoke();
  };
  return wrapped;
}`,
    tsCode: `type Debounced<A extends unknown[], R, C> = {
  (this: C, ...args: A): void; cancel(): void; flush(): R | undefined;
};
function debounceControlled<A extends unknown[], R, C>(fn: (this: C, ...args: A) => R,
  wait: number): Debounced<A, R, C> {
  if (!Number.isFinite(wait) || wait < 0 || wait > 2147483647) throw new RangeError('wait');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let args: A | undefined, receiver: C | undefined;
  function invoke(): R {
    const current = args as A, context = receiver as C;
    timer = undefined; args = undefined; receiver = undefined;
    return fn.apply(context, current);
  }
  function wrapped(this: C, ...nextArgs: A): void {
    clearTimeout(timer); args = nextArgs; receiver = this;
    timer = setTimeout(invoke, wait);
  }
  wrapped.cancel = (): void => {
    clearTimeout(timer); timer = undefined; args = undefined; receiver = undefined;
  };
  wrapped.flush = (): R | undefined => {
    if (timer === undefined) return undefined;
    clearTimeout(timer); return invoke();
  };
  return wrapped;
}`,
    explanation: 'Unlike the original basic debounce, this API can release pending work and synchronously execute it. flush returns only the pending call result, not a cached previous result. cancel cannot undo an already-running callback. Scoped TS assertions rely on invoke being called only with a pending call. Timer callback errors follow host timer error handling; handle asynchronous callback rejections yourself.',
    complexity: 'Time O(1) bookkeeping per call/cancel/flush plus callback cost. Space O(a) retained latest arguments for arity a, one receiver and timer.',
    followup: 'Add maxWait so sustained activity cannot postpone work forever, with a deterministic fake-clock test suite.',
    examples: 'const save = debounceControlled(persist, 300); save("a"); save("b"); save.flush() persists only "b" immediately.',
    constraints: 'wait is finite in [0, 2^31-1]; no leading edge. Callers must clean up pending timers when their owner is disposed.',
    edgeCases: 'flush with no pending call returns undefined; cancel is idempotent; zero wait still schedules; reentrant callback can schedule a new pending call.',
    tests: `const seen = [];
const d = debounceControlled(function (n) { seen.push(this.base + n); return n * 2; }, 1000);
d.call({ base: 10 }, 1); d.call({ base: 20 }, 2);
assert.equal(d.flush(), 4); assert.deepEqual(seen, [22]);
assert.equal(d.flush(), undefined);
d.call({ base: 0 }, 3); d.cancel(); assert.equal(d.flush(), undefined);
const fired = await new Promise(resolve => { const task = debounceControlled(resolve, 0); task(8); });
assert.equal(fired, 8);`,
    difficulty: 'senior', tags: ['timers', 'debounce', 'cleanup'],
  },
  {
    id: 'coding-trailing-throttle',
    problem: 'Implement a trailing-only throttle: execute the latest call at the end of each occupied fixed window, never immediately.',
    approach: 'Start a timer only when no window is open. Subsequent calls replace arguments without resetting that timer.',
    jsCode: `function throttleTrailing(fn, wait) {
  if (!Number.isFinite(wait) || wait < 0 || wait > 2147483647) throw new RangeError('wait');
  let timer, args, receiver;
  function wrapped(...nextArgs) {
    args = nextArgs; receiver = this;
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      const current = args, context = receiver;
      timer = undefined; args = undefined; receiver = undefined;
      fn.apply(context, current);
    }, wait);
  }
  wrapped.cancel = () => {
    clearTimeout(timer); timer = undefined; args = undefined; receiver = undefined;
  };
  return wrapped;
}`,
    tsCode: `function throttleTrailing<A extends unknown[], C>(fn: (this: C, ...args: A) => void,
  wait: number): { (this: C, ...args: A): void; cancel(): void } {
  if (!Number.isFinite(wait) || wait < 0 || wait > 2147483647) throw new RangeError('wait');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let args: A | undefined, receiver: C | undefined;
  function wrapped(this: C, ...nextArgs: A): void {
    args = nextArgs; receiver = this;
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      const current = args as A, context = receiver as C;
      timer = undefined; args = undefined; receiver = undefined;
      fn.apply(context, current);
    }, wait);
  }
  wrapped.cancel = (): void => {
    clearTimeout(timer); timer = undefined; args = undefined; receiver = undefined;
  };
  return wrapped;
}`,
    explanation: 'Different from both basic leading throttle and debounce: activity does not restart the window, and the final call is not dropped. The next window begins with the next incoming call after delivery. Clear captured state before invoking for reentrancy. Runtime timer exceptions and rejected async callbacks are the caller responsibility.',
    complexity: 'Time O(1) per incoming call plus callback work per delivered window. Space O(a) latest arguments for arity a, with one timer/receiver.',
    followup: 'Define leading+trailing behavior precisely so a single call does not accidentally execute twice.',
    examples: 'Calls A at t=0 and B at t=30 with wait=100 deliver B at approximately t=100, not t=130.',
    constraints: 'Finite wait in [0, 2^31-1]; trailing-only fixed window from the first call; not a hard real-time scheduler.',
    edgeCases: 'Single call is delayed; cancel drops pending work; wait 0 still waits for a timer task; callback may reenter.',
    tests: `const seen = [];
await new Promise(resolve => {
  const task = throttleTrailing(function (n) { seen.push(this.base + n); resolve(); }, 0);
  task.call({ base: 1 }, 2); task.call({ base: 10 }, 3);
  assert.deepEqual(seen, []);
});
assert.deepEqual(seen, [13]);
const cancelled = throttleTrailing(() => seen.push(99), 0);
cancelled(); cancelled.cancel();
await new Promise(resolve => setTimeout(resolve, 0));
assert.deepEqual(seen, [13]);`,
    difficulty: 'senior', tags: ['timers', 'throttle', 'rate-limiting'],
  },
  {
    id: 'coding-clone-cyclic-data',
    problem: 'Clone cyclic plain-data graphs, preserving aliases and sparse arrays, while rejecting unsupported object types and accessors.',
    approach: 'Register each output in a WeakMap before traversing its own properties. Copy data properties via descriptors, never by invoking getters.',
    jsCode: `function clonePlainGraph(value, seen = new WeakMap()) {
  if (typeof value === 'function') throw new TypeError('Functions unsupported');
  if (value === null || typeof value !== 'object') return value;
  const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
  if (!array && proto !== Object.prototype && proto !== null)
    throw new TypeError('Only plain objects and arrays');
  if (seen.has(value)) return seen.get(value);
  const copy = array ? new Array(value.length) : Object.create(proto);
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    if (array && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!('value' in descriptor)) throw new TypeError('Accessors unsupported');
    Object.defineProperty(copy, key, {
      value: clonePlainGraph(descriptor.value, seen),
      enumerable: descriptor.enumerable, writable: true, configurable: true
    });
  }
  return copy;
}`,
    tsCode: `function clonePlainGraph(value: unknown, seen = new WeakMap<object, object>()): unknown {
  if (typeof value === 'function') throw new TypeError('Functions unsupported');
  if (value === null || typeof value !== 'object') return value;
  const array = Array.isArray(value), proto: unknown = Object.getPrototypeOf(value);
  if (!array && proto !== Object.prototype && proto !== null)
    throw new TypeError('Only plain objects and arrays');
  if (seen.has(value)) return seen.get(value);
  const copy: object = Array.isArray(value) ? new Array(value.length) :
    Object.create(proto as object | null) as object;
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    if (array && key === 'length') continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor)) throw new TypeError('Accessors unsupported');
    Object.defineProperty(copy, key, {
      value: clonePlainGraph(descriptor.value as unknown, seen),
      enumerable: descriptor.enumerable, writable: true, configurable: true
    });
  }
  return copy;
}`,
    explanation: 'The original recursive clone cannot terminate on cycles. WeakMap preserves both cycles and shared references. Supported values: primitives (including symbol/undefined/bigint), ordinary arrays, and same-realm plain/null-prototype objects with own data properties. Symbol and non-enumerable keys are copied; __proto__ is defined as data safely. Date, Map, Set, class instances, functions and accessors are rejected. Descriptor writability/frozen state and custom array prototypes are not preserved. Proxies/untrusted exotic objects are outside the contract; use structuredClone for its broader documented type support.',
    complexity: 'Time O(V + E) over object nodes and own property edges, plus O(sum of array lengths) for allocating sparse arrays. Space O(V + E + sum of array lengths) including outputs; recursion O(depth), potentially stack-limited.',
    followup: 'Implement iterative traversal to remove recursion-depth risk while preserving aliases.',
    examples: 'For x.self = x and x.a = x.b = shared, clone.self === clone and clone.a === clone.b, but clone.a !== shared.',
    constraints: 'Trusted, finite same-realm plain-data graph; recursion depth must fit the JS stack. Output is mutable, not an exact descriptor clone. TS returns unknown rather than claiming arbitrary class preservation.',
    edgeCases: 'Null prototypes, cyclic arrays, repeated aliases, holes, symbol keys, and an own __proto__ data key are supported; getters are rejected without executing them.',
    tests: `const shared = { n: 1 }, source = { a: shared, b: shared }; source.self = source;
const copy = clonePlainGraph(source);
assert.equal(copy.self, copy); assert.equal(copy.a, copy.b); assert.notEqual(copy.a, shared);
const sparse = new Array(3); sparse[2] = source;
const cloned = clonePlainGraph(sparse); assert.equal(0 in cloned, false); assert.equal(cloned.length, 3);
assert.throws(() => clonePlainGraph(new Date()), TypeError);
let read = false;
assert.throws(() => clonePlainGraph({ get value() { read = true; return 1; } }), TypeError);
assert.equal(read, false);`,
    difficulty: 'advanced', tags: ['graphs', 'weakmap', 'clone', 'data-contracts'],
  },
  {
    id: 'coding-build-validated-tree',
    problem: 'Build a forest from unordered { id, parentId, label } rows; reject duplicate IDs, missing parents, self-links and cycles.',
    approach: 'Index copies first, validate parent chains using visiting/done colors, then attach children in input order.',
    jsCode: `function buildForest(rows) {
  const nodes = new Map();
  for (const row of rows) {
    if (typeof row.id !== 'string' || row.id.length === 0 ||
        (row.parentId !== null && (typeof row.parentId !== 'string' || !row.parentId)) ||
        typeof row.label !== 'string') throw new TypeError('Invalid row');
    if (nodes.has(row.id)) throw new Error('Duplicate id');
    nodes.set(row.id, { id: row.id, parentId: row.parentId, label: row.label, children: [] });
  }
  const colors = new Map();
  for (const id of nodes.keys()) {
    let current = id; const path = [];
    while (current !== null && colors.get(current) !== 2) {
      if (colors.get(current) === 1) throw new Error('Cycle');
      const node = nodes.get(current);
      if (!node) throw new Error('Orphan parent');
      colors.set(current, 1); path.push(current); current = node.parentId;
    }
    for (const key of path) colors.set(key, 2);
  }
  const roots = [];
  for (const node of nodes.values()) {
    if (node.parentId === null) roots.push(node);
    else nodes.get(node.parentId).children.push(node);
  }
  return roots;
}`,
    tsCode: `type TreeRow = { id: string; parentId: string | null; label: string };
type TreeNode = TreeRow & { children: TreeNode[] };
function buildForest(rows: readonly TreeRow[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>();
  for (const row of rows) {
    if (typeof row.id !== 'string' || row.id.length === 0 ||
        (row.parentId !== null && (typeof row.parentId !== 'string' || !row.parentId)) ||
        typeof row.label !== 'string') throw new TypeError('Invalid row');
    if (nodes.has(row.id)) throw new Error('Duplicate id');
    nodes.set(row.id, { id: row.id, parentId: row.parentId, label: row.label, children: [] });
  }
  const colors = new Map<string, 1 | 2>();
  for (const id of nodes.keys()) {
    let current: string | null = id; const path: string[] = [];
    while (current !== null && colors.get(current) !== 2) {
      if (colors.get(current) === 1) throw new Error('Cycle');
      const node: TreeNode | undefined = nodes.get(current);
      if (!node) throw new Error('Orphan parent');
      colors.set(current, 1); path.push(current); current = node.parentId;
    }
    for (const key of path) colors.set(key, 2);
  }
  const roots: TreeNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentId === null) roots.push(node);
    else nodes.get(node.parentId)!.children.push(node); // validated above
  }
  return roots;
}`,
    explanation: 'An orphan policy is explicit: reject, rather than silently promoting missing-parent nodes. Colors detect rootless cycles as well as self-parenting. Every node is finalized once, so validation does not repeatedly walk complete ancestor chains. Input rows stay untouched, and Map safely accepts IDs such as __proto__. Extra input fields are intentionally not copied.',
    complexity: 'Time expected O(n) for indexing, chain validation and linking. Space O(n) for maps, path, and the returned forest; no recursive call stack.',
    followup: 'Return structured validation diagnostics for all invalid rows instead of throwing on the first error.',
    examples: '[child(parent=root), root(parent=null)] becomes one root containing child even though the child was listed first.',
    constraints: 'Rows are non-null records with nonempty string IDs, string labels and parentId string|null; null alone means root. Reject invalid runtime field types. No partial forest on error.',
    edgeCases: 'Empty rows return []; duplicate IDs reject even if rows match; missing parent, self-cycle, and disconnected cycles reject; sibling/root order follows input.',
    tests: `const row = (id, parentId = null) => ({ id, parentId, label: id });
const input = [row('c', 'r'), row('r')], forest = buildForest(input);
assert.equal(forest[0].children[0].id, 'c'); assert.equal('children' in input[0], false);
assert.deepEqual(buildForest([]), []);
assert.throws(() => buildForest([row('a'), row('a')]), /Duplicate/);
assert.throws(() => buildForest([row('a', 'missing')]), /Orphan/);
assert.throws(() => buildForest([row('a', 'b'), row('b', 'a')]), /Cycle/);
assert.throws(() => buildForest([row('a', 'a')]), /Cycle/);`,
    difficulty: 'advanced', tags: ['trees', 'validation', 'graphs'],
  },
  {
    id: 'coding-iterative-traversal',
    problem: 'Traverse a forest in depth-first preorder without recursion; detect cycles or shared nodes instead of looping or visiting twice.',
    approach: 'Use a reversed explicit stack to preserve child order and a Set of object identities for strict-forest validation.',
    jsCode: `function preorder(roots) {
  const stack = [], seen = new Set(), values = [];
  for (let i = roots.length - 1; i >= 0; i--) stack.push(roots[i]);
  while (stack.length) {
    const node = stack.pop();
    if (seen.has(node)) throw new Error('Not a forest: repeated node');
    seen.add(node); values.push(node.value);
    for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
  }
  return values;
}`,
    tsCode: `type TraversalNode<T> = { value: T; children: readonly TraversalNode<T>[] };
function preorder<T>(roots: readonly TraversalNode<T>[]): T[] {
  const stack: TraversalNode<T>[] = [], seen = new Set<TraversalNode<T>>(), values: T[] = [];
  for (let i = roots.length - 1; i >= 0; i--) stack.push(roots[i]);
  while (stack.length) {
    const node = stack.pop()!;
    if (seen.has(node)) throw new Error('Not a forest: repeated node');
    seen.add(node); values.push(node.value);
    for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]);
  }
  return values;
}`,
    explanation: 'Pushing children right-to-left makes the leftmost child pop first. Identity validation deliberately rejects DAG sharing as well as cycles; this is a forest traversal, not graph traversal. Avoid spreading huge child arrays into push, which can exceed the argument-count limit.',
    complexity: 'Time O(n) on a valid forest (more generally O(V + E) before invalid input is rejected). Space O(n) for output, visited identities, and worst-case explicit stack.',
    followup: 'Implement breadth-first traversal with a head index rather than repeated Array.shift().',
    examples: 'A with children B,C, plus root D, traverses [A,B,C,D].',
    constraints: 'Finite nodes with value and dense children arrays; object identity defines uniqueness. No mutation during traversal.',
    edgeCases: 'Empty forest returns []; a very deep chain avoids recursive stack overflow; duplicate roots and shared children reject.',
    tests: `const b = { value: 'B', children: [] };
const a = { value: 'A', children: [b, { value: 'C', children: [] }] };
assert.deepEqual(preorder([a, { value: 'D', children: [] }]), ['A', 'B', 'C', 'D']);
assert.deepEqual(preorder([]), []);
b.children.push(a); assert.throws(() => preorder([a]), /repeated/);`,
    difficulty: 'senior', tags: ['trees', 'traversal', 'iterative'],
  },
  {
    id: 'coding-safe-own-path',
    problem: 'Read an explicit property path using only own data properties, without traversing prototypes or executing getters.',
    approach: 'Inspect descriptors at every segment and reject dangerous names. Return a found discriminant so undefined can be a real value.',
    jsCode: `function getOwnPath(root, path) {
  const blocked = new Set(['__proto__', 'prototype', 'constructor']);
  let value = root;
  for (const key of path) {
    if ((typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'symbol') ||
        (typeof key === 'string' && blocked.has(key))) return { found: false };
    if (value === null || typeof value !== 'object') return { found: false };
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor)) return { found: false };
    value = descriptor.value;
  }
  return { found: true, value };
}`,
    tsCode: `function getOwnPath(root: unknown, path: readonly PropertyKey[]):
  { found: false } | { found: true; value: unknown } {
  const blocked = new Set(['__proto__', 'prototype', 'constructor']);
  let value: unknown = root;
  for (const key of path) {
    if ((typeof key !== 'string' && typeof key !== 'number' && typeof key !== 'symbol') ||
        (typeof key === 'string' && blocked.has(key))) return { found: false };
    if (value === null || typeof value !== 'object') return { found: false };
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor)) return { found: false };
    value = descriptor.value as unknown;
  }
  return { found: true, value };
}`,
    explanation: 'A segment array avoids ambiguous dotted names: ["a.b"] differs from ["a", "b"]. Own descriptors avoid inherited values and accessors. Rejecting prototype-related names is defense in depth, even when they are own data. This is not a sandbox: descriptor access can still trigger Proxy traps, so inputs must be trusted non-proxy data.',
    complexity: 'Time O(d) for path depth d under ordinary-object lookup assumptions. Space O(1) auxiliary beyond the supplied path.',
    followup: 'Design a typed tuple-path overload while keeping runtime validation for untrusted JSON.',
    examples: 'getOwnPath({ users: [{ name: "Ana" }] }, ["users", 0, "name"]) returns { found: true, value: "Ana" }.',
    constraints: 'Path is an array of PropertyKey segments; only non-null objects are traversed. No expression evaluation, prototype traversal or string path parsing.',
    edgeCases: 'Empty path finds the root, including null; stored undefined is found; inherited values and getters are not; holes are missing.',
    tests: `assert.deepEqual(getOwnPath({ a: { b: undefined } }, ['a', 'b']), { found: true, value: undefined });
assert.deepEqual(getOwnPath(Object.create({ x: 1 }), ['x']), { found: false });
assert.equal(getOwnPath({}, ['__proto__', 'polluted']).found, false);
let called = false;
assert.equal(getOwnPath({ get x() { called = true; return 1; } }, ['x']).found, false);
assert.equal(called, false); assert.deepEqual(getOwnPath(null, []), { found: true, value: null });`,
    difficulty: 'senior', tags: ['security', 'objects', 'property-paths'],
  },
  {
    id: 'coding-immutable-path-update',
    problem: 'Immutably replace an existing nested value while preserving untouched branches and validating each path segment.',
    approach: 'Recurse to the leaf and shallow-copy only changed ancestors. Reject missing keys, prototype keys, non-plain containers and invalid array indices.',
    jsCode: `function updateAtPath(root, path, replace) {
  const blocked = new Set(['__proto__', 'prototype', 'constructor']);
  function visit(value, depth) {
    if (depth === path.length) return replace(value);
    const key = path[depth];
    if ((typeof key !== 'string' && typeof key !== 'number') || blocked.has(String(key)))
      throw new TypeError('Unsafe key');
    if (value === null || typeof value !== 'object') throw new TypeError('Not a container');
    const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
    if (!array && proto !== Object.prototype && proto !== null) throw new TypeError('Not plain');
    if (array && (typeof key !== 'number' || !Number.isInteger(key) || key < 0 || key >= value.length))
      throw new RangeError('Array index');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor)) throw new Error('Missing data property');
    const child = visit(descriptor.value, depth + 1);
    if (Object.is(child, descriptor.value)) return value;
    const copy = array ? value.slice() : Object.assign(Object.create(null), value);
    Object.defineProperty(copy, key, { value: child, enumerable: true, writable: true, configurable: true });
    return copy;
  }
  return visit(root, 0);
}`,
    tsCode: `function updateAtPath(root: unknown, path: readonly (string | number)[],
  replace: (value: unknown) => unknown): unknown {
  const blocked = new Set(['__proto__', 'prototype', 'constructor']);
  function visit(value: unknown, depth: number): unknown {
    if (depth === path.length) return replace(value);
    const key = path[depth];
    if ((typeof key !== 'string' && typeof key !== 'number') || blocked.has(String(key)))
      throw new TypeError('Unsafe key');
    if (value === null || typeof value !== 'object') throw new TypeError('Not a container');
    const array = Array.isArray(value), proto: unknown = Object.getPrototypeOf(value);
    if (!array && proto !== Object.prototype && proto !== null) throw new TypeError('Not plain');
    if (Array.isArray(value) && (typeof key !== 'number' || !Number.isInteger(key) || key < 0 || key >= value.length))
      throw new RangeError('Array index');
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !('value' in descriptor)) throw new Error('Missing data property');
    const child = visit(descriptor.value as unknown, depth + 1);
    if (Object.is(child, descriptor.value)) return value;
    const copy: object = Array.isArray(value) ? value.slice() :
      Object.assign(Object.create(null) as object, value);
    Object.defineProperty(copy, key, { value: child, enumerable: true, writable: true, configurable: true });
    return copy;
  }
  return visit(root, 0);
}`,
    explanation: 'Structural sharing prevents deep-copying unrelated branches. Empty paths replace the root; identity updates preserve the entire original reference. Object copies intentionally have null prototypes, avoiding __proto__ assignment hazards. This is a trusted JSON-like tree updater, not a general descriptor-preserving graph updater; no aliases/cycles, proxies, getters, custom array properties, or non-enumerable/symbol fields. The replacement callback must not mutate its argument. TS returns unknown because a callback can change the leaf type.',
    complexity: 'Time O(d + sum of copied container widths) plus replacement cost, not merely O(d). Space O(d + sum of copied widths) including copied ancestors and recursive stack.',
    followup: 'Add a typed overload for a known state shape without falsely preserving types when the leaf type changes.',
    examples: 'updateAtPath(state, ["users", 0, "name"], () => "Bea") changes only the root, users array and first user references.',
    constraints: 'Trusted JSON-like acyclic tree with own enumerable data properties only; existing paths only. Arrays require numeric in-range occupied indices; no auto-creation.',
    edgeCases: 'Empty path replaces root; no-op callback returns original; missing/hole keys throw; unsafe prototype segments reject before copying.',
    tests: `const stable = { keep: true }, state = { user: { score: 1 }, stable };
const next = updateAtPath(state, ['user', 'score'], n => Number(n) + 1);
assert.equal(state.user.score, 1); assert.equal(next.user.score, 2);
assert.equal(next.stable, stable); assert.notEqual(next.user, state.user);
assert.equal(updateAtPath(state, ['user'], x => x), state);
assert.equal(updateAtPath(state, [], () => 9), 9);
assert.throws(() => updateAtPath(state, ['missing'], () => 1), /Missing/);
assert.throws(() => updateAtPath(state, ['__proto__'], () => 1), /Unsafe/);`,
    difficulty: 'advanced', tags: ['immutability', 'state', 'structural-sharing'],
  },
  {
    id: 'coding-binary-search-first',
    problem: 'Find the first occurrence of a number in a sorted array using binary search, returning -1 when absent.',
    approach: 'Use a half-open [low, high) lower-bound search, then check whether the insertion position equals the target.',
    jsCode: `function binarySearchFirst(values, target) {
  let low = 0, high = values.length;
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    if (values[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low < values.length && values[low] === target ? low : -1;
}`,
    tsCode: `function binarySearchFirst(values: readonly number[], target: number): number {
  let low = 0, high = values.length;
  while (low < high) {
    const mid = low + Math.floor((high - low) / 2);
    if (values[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low < values.length && values[low] === target ? low : -1;
}`,
    explanation: 'When values[mid] is at least the target, keep mid as a candidate by moving high, not low. On termination low is the first position whose value is >= target. Arithmetic midpoint avoids 32-bit bitwise truncation. Sortedness is a precondition, not an O(n) validation hidden inside an O(log n) claim.',
    complexity: 'Time O(log(n + 1)); space O(1) auxiliary.',
    followup: 'Return the complete equal-value range using both lower and upper bounds.',
    examples: 'binarySearchFirst([1,2,2,2,5], 2) returns 1; searching 4 returns -1.',
    constraints: 'Dense ascending readonly array of finite numbers, finite target. NaN and unsorted input are outside the contract; input is not modified.',
    edgeCases: 'Empty input, one element, all duplicates, target before first or after last, and negative values.',
    tests: `assert.equal(binarySearchFirst([1, 2, 2, 2, 5], 2), 1);
assert.equal(binarySearchFirst([], 2), -1);
assert.equal(binarySearchFirst([1], 1), 0);
assert.equal(binarySearchFirst([1, 3], 2), -1);
assert.equal(binarySearchFirst([-4, -2, 0], -4), 0);`,
    difficulty: 'senior', tags: ['algorithms', 'binary-search', 'arrays'],
  },
  {
    id: 'coding-two-sum-indices',
    problem: 'Return two distinct indices whose integer values sum to a target, or null when no pair exists.',
    approach: 'Scan once, checking a Map for the complement before storing the current value and its earliest index.',
    jsCode: `function twoSumIndices(values, target) {
  const indices = new Map();
  for (let j = 0; j < values.length; j++) {
    const complement = target - values[j];
    if (indices.has(complement)) return [indices.get(complement), j];
    if (!indices.has(values[j])) indices.set(values[j], j);
  }
  return null;
}`,
    tsCode: `function twoSumIndices(values: readonly number[], target: number): [number, number] | null {
  const indices = new Map<number, number>();
  for (let j = 0; j < values.length; j++) {
    const complement = target - values[j];
    const i = indices.get(complement);
    if (i !== undefined) return [i, j];
    if (!indices.has(values[j])) indices.set(values[j], j);
  }
  return null;
}`,
    explanation: 'Looking up before insertion prevents reusing the current element. Retaining first indices gives a deterministic rule: first completing right index, then earliest compatible left index. This is an exact-integer problem, not an approximate floating-point equality algorithm.',
    complexity: 'Time expected O(n) with Map; space O(n) in the worst case.',
    followup: 'Return every unique value pair without repeating duplicate pairs; explain the output-size cost.',
    examples: 'twoSumIndices([2,7,11,15], 9) returns [0,1]; [3,3] with target 6 also returns [0,1].',
    constraints: 'Dense finite integer values and target with absolute values <= 10^9, keeping sums/complements exactly representable. Array remains unchanged.',
    edgeCases: 'Empty/single-item arrays return null; zeros and negatives work; duplicate values require separate indices.',
    tests: `assert.deepEqual(twoSumIndices([2, 7, 11, 15], 9), [0, 1]);
assert.deepEqual(twoSumIndices([3, 3], 6), [0, 1]);
assert.deepEqual(twoSumIndices([-2, 0, 2], 0), [0, 2]);
assert.equal(twoSumIndices([3], 6), null); assert.equal(twoSumIndices([], 0), null);`,
    difficulty: 'senior', tags: ['algorithms', 'hash-map', 'arrays'],
  },
  {
    id: 'coding-merge-intervals',
    problem: 'Merge overlapping or touching closed intervals without mutating the input, rejecting invalid endpoints.',
    approach: 'Validate and copy pairs, sort by start, then merge into the last output pair when boundaries overlap.',
    jsCode: `function mergeIntervals(intervals) {
  const sorted = intervals.map(pair => {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isFinite(pair[0]) ||
        !Number.isFinite(pair[1]) || pair[0] > pair[1]) throw new RangeError('interval');
    return [pair[0], pair[1]];
  }).sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (!last || start > last[1]) merged.push([start, end]);
    else last[1] = Math.max(last[1], end);
  }
  return merged;
}`,
    tsCode: `function mergeIntervals(intervals: readonly (readonly [number, number])[]): [number, number][] {
  const sorted = intervals.map((pair): [number, number] => {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isFinite(pair[0]) ||
        !Number.isFinite(pair[1]) || pair[0] > pair[1]) throw new RangeError('interval');
    return [pair[0], pair[1]];
  }).sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (!last || start > last[1]) merged.push([start, end]);
    else last[1] = Math.max(last[1], end);
  }
  return merged;
}`,
    explanation: 'Sorted starts ensure that only the latest merged interval can overlap the next one. Copying both input pairs and output pairs prevents accidental in-place changes to caller state. Closed intervals [1,2] and [2,3] touch and merge; half-open scheduling intervals may need a different rule.',
    complexity: 'Time O(n log n) for sorting plus O(n) scan. Space O(n) for copies/results; engine sort workspace is implementation-dependent, conventionally O(n).',
    followup: 'Insert one interval into an already sorted, non-overlapping interval list in O(n) time.',
    examples: '[[5,7],[1,3],[3,6],[9,9]] becomes [[1,7],[9,9]].',
    constraints: 'Dense array of exactly two finite numeric endpoints per pair, start <= end. Touching closed intervals merge.',
    edgeCases: 'Empty array, zero-length intervals, duplicates, nested ranges, negative endpoints, and reversed/NaN endpoints.',
    tests: `const input = [[5, 7], [1, 3], [3, 6], [9, 9]];
assert.deepEqual(mergeIntervals(input), [[1, 7], [9, 9]]);
assert.deepEqual(input, [[5, 7], [1, 3], [3, 6], [9, 9]]);
assert.deepEqual(mergeIntervals([]), []);
assert.throws(() => mergeIntervals([[3, 1]]), RangeError);
assert.throws(() => mergeIntervals([[0, NaN]]), RangeError);`,
    difficulty: 'senior', tags: ['algorithms', 'sorting', 'intervals'],
  },
  {
    id: 'coding-balanced-brackets',
    problem: 'Validate correctly nested (), [] and {} brackets, rejecting every non-bracket character.',
    approach: 'Push the expected closer for every opener. Each closer must equal the top expectation.',
    jsCode: `function balancedBrackets(text) {
  const closeFor = new Map([['(', ')'], ['[', ']'], ['{', '}']]);
  const closers = new Set([')', ']', '}']), stack = [];
  for (const char of text) {
    if (closeFor.has(char)) stack.push(closeFor.get(char));
    else if (!closers.has(char) || stack.pop() !== char) return false;
  }
  return stack.length === 0;
}`,
    tsCode: `function balancedBrackets(text: string): boolean {
  const closeFor = new Map<string, string>([['(', ')'], ['[', ']'], ['{', '}']]);
  const closers = new Set([')', ']', '}']), stack: string[] = [];
  for (const char of text) {
    const closer = closeFor.get(char);
    if (closer !== undefined) stack.push(closer);
    else if (!closers.has(char) || stack.pop() !== char) return false;
  }
  return stack.length === 0;
}`,
    explanation: 'Matching counts alone cannot detect crossed nesting such as ([)]. The stack remembers exactly which closer is legal next. This deliberately is not a JavaScript parser: quotes, comments, whitespace and letters are rejected rather than ignored.',
    complexity: 'Time O(n) for n characters; space O(n) worst-case nesting depth.',
    followup: 'Return the first mismatching offset and expected token for a user-facing validator.',
    examples: '"{[()]}" is true; "([)]" and "() text" are false.',
    constraints: 'String input; accepted alphabet is only the six bracket characters. Empty input is valid.',
    edgeCases: 'Closer before opener, leftover openers, crossed nesting, repeated pairs, and non-bracket characters.',
    tests: `assert.equal(balancedBrackets('{[()]}'), true);
assert.equal(balancedBrackets(''), true);
assert.equal(balancedBrackets('([)]'), false);
assert.equal(balancedBrackets(')'), false);
assert.equal(balancedBrackets('(('), false);
assert.equal(balancedBrackets('() '), false);`,
    difficulty: 'senior', tags: ['algorithms', 'stack', 'strings'],
  },
  {
    id: 'coding-longest-distinct-window',
    problem: 'Return the longest substring with no repeated Unicode code point, preferring the earliest on ties.',
    approach: 'Use last-seen code-point indices and a sliding left boundary that never moves backward.',
    jsCode: `function longestDistinctSubstring(text) {
  const chars = Array.from(text), last = new Map();
  let left = 0, bestStart = 0, bestLength = 0;
  for (let right = 0; right < chars.length; right++) {
    const previous = last.get(chars[right]);
    if (previous !== undefined) left = Math.max(left, previous + 1);
    last.set(chars[right], right);
    const length = right - left + 1;
    if (length > bestLength) { bestStart = left; bestLength = length; }
  }
  return { substring: chars.slice(bestStart, bestStart + bestLength).join(''), length: bestLength };
}`,
    tsCode: `function longestDistinctSubstring(text: string): { substring: string; length: number } {
  const chars = Array.from(text), last = new Map<string, number>();
  let left = 0, bestStart = 0, bestLength = 0;
  for (let right = 0; right < chars.length; right++) {
    const previous = last.get(chars[right]);
    if (previous !== undefined) left = Math.max(left, previous + 1);
    last.set(chars[right], right);
    const length = right - left + 1;
    if (length > bestLength) { bestStart = left; bestLength = length; }
  }
  return { substring: chars.slice(bestStart, bestStart + bestLength).join(''), length: bestLength };
}`,
    explanation: 'The max guard matters for cases like abba, where a repeated character may lie outside the current window. Array.from iterates code points, so an emoji surrogate pair counts once. Combining sequences and joined emoji are still multiple code points: grapheme clusters would require segmentation, and normalization is not performed.',
    complexity: 'Time expected O(n) for n code points, including output construction. Space O(n) for code-point storage, last-seen Map and result.',
    followup: 'Use Intl.Segmenter for grapheme-cluster semantics and retain original UTF-16 offsets.',
    examples: '"abba" returns { substring: "ab", length: 2 }; "😀a😀b" returns { substring: "a😀b", length: 3 }.',
    constraints: 'String input; equality is exact code-point equality, not locale-aware or normalized visual equality.',
    edgeCases: 'Empty input gives empty substring and 0; all same characters; equal-length ties; astral code points.',
    tests: `assert.deepEqual(longestDistinctSubstring('abba'), { substring: 'ab', length: 2 });
assert.deepEqual(longestDistinctSubstring('😀a😀b'), { substring: 'a😀b', length: 3 });
assert.deepEqual(longestDistinctSubstring(''), { substring: '', length: 0 });
assert.deepEqual(longestDistinctSubstring('aaaa'), { substring: 'a', length: 1 });`,
    difficulty: 'senior', tags: ['algorithms', 'sliding-window', 'unicode'],
  },
  {
    id: 'coding-typed-emitter-once',
    problem: 'Implement a typed tuple-payload emitter with on(), once(), off() and emit(), including reentrant-safe once delivery.',
    approach: 'Register identity entries rather than wrapping listener identity. Remove once entries before invoking, and snapshot each emission.',
    jsCode: `class TypedEmitter {
  #events = new Map();
  #add(event, fn, once) {
    let entries = this.#events.get(event);
    if (!entries) { entries = new Set(); this.#events.set(event, entries); }
    const entry = { fn, once }; entries.add(entry);
    return () => this.#remove(event, entry);
  }
  #remove(event, entry) {
    const entries = this.#events.get(event);
    entries?.delete(entry);
    if (entries?.size === 0) this.#events.delete(event);
  }
  on(event, fn) { return this.#add(event, fn, false); }
  once(event, fn) { return this.#add(event, fn, true); }
  off(event, fn) {
    for (const entry of this.#events.get(event) ?? [])
      if (entry.fn === fn) this.#remove(event, entry);
  }
  emit(event, ...args) {
    const entries = this.#events.get(event);
    for (const entry of [...(entries ?? [])]) {
      if (!entries.has(entry)) continue;
      if (entry.once) this.#remove(event, entry);
      entry.fn(...args);
    }
  }
}`,
    tsCode: `type EventEntry = { fn: unknown; once: boolean };
class TypedEmitter<E extends { [K in keyof E]: unknown[] }> {
  #events = new Map<keyof E, Set<EventEntry>>();
  #add<K extends keyof E>(event: K, fn: (...args: E[K]) => void, once: boolean): () => void {
    let entries = this.#events.get(event);
    if (!entries) { entries = new Set(); this.#events.set(event, entries); }
    const entry: EventEntry = { fn, once }; entries.add(entry);
    return () => this.#remove(event, entry);
  }
  #remove(event: keyof E, entry: EventEntry): void {
    const entries = this.#events.get(event);
    entries?.delete(entry);
    if (entries?.size === 0) this.#events.delete(event);
  }
  on<K extends keyof E>(event: K, fn: (...args: E[K]) => void): () => void {
    return this.#add(event, fn, false);
  }
  once<K extends keyof E>(event: K, fn: (...args: E[K]) => void): () => void {
    return this.#add(event, fn, true);
  }
  off<K extends keyof E>(event: K, fn: (...args: E[K]) => void): void {
    for (const entry of this.#events.get(event) ?? [])
      if (entry.fn === fn) this.#remove(event, entry);
  }
  emit<K extends keyof E>(event: K, ...args: E[K]): void {
    const entries = this.#events.get(event);
    for (const entry of [...(entries ?? [])]) {
      if (!entries?.has(entry)) continue;
      if (entry.once) this.#remove(event, entry);
      (entry.fn as (...args: E[K]) => void)(...args);
    }
  }
}
// const bus = new TypedEmitter<{ saved: [id: string, version: number] }>();
// bus.emit('saved', 'user-7', 2); // wrong name or payload is a type error
`,
    explanation: 'Unlike the original emitter, once is removed before callback execution so recursively emitting the same event cannot fire it twice. Listeners added during emit wait until the next emission; listeners removed before their turn are skipped. off removes all matching registrations; returned unsubscribe removes just one. Listener exceptions propagate synchronously and stop that emission. TS privately stores heterogeneous callbacks as unknown and restores the event-specific tuple only inside emit; keyed public methods maintain the event/payload relationship, with no any-based public escape hatch.',
    complexity: 'Time expected O(1) registration and returned unsubscribe; off O(k), emit O(k) plus callback costs for k event listeners. Space O(L) stored registrations plus O(k) emission snapshot (more for recursive emits).',
    followup: 'Offer a separate async emission API with an explicit fail-fast versus collect-errors policy.',
    examples: 'A saved event typed as [id: string, version: number] requires bus.emit("saved", "x", 2); once fires only on the first matching emission.',
    constraints: 'Synchronous handlers, tuple payloads, Map event identity. No wildcard events or automatic async rejection handling.',
    edgeCases: 'Reentrant once, unsubscribe during dispatch, duplicate callback registrations, empty event and thrown listener errors.',
    tests: `const bus = new TypedEmitter(); let onceCalls = 0, total = 0;
bus.once('save', () => { onceCalls++; bus.emit('save', 0); });
const off = bus.on('save', n => { total += n; });
bus.emit('save', 3); bus.emit('save', 2);
assert.equal(onceCalls, 1); assert.equal(total, 5);
off(); bus.emit('save', 10); assert.equal(total, 5);
const fn = () => { total++; }; bus.on('x', fn); bus.on('x', fn); bus.off('x', fn);
bus.emit('x'); assert.equal(total, 5);`,
    difficulty: 'advanced', tags: ['typescript', 'events', 'reentrancy'],
  },
  {
    id: 'coding-vue-race-safe-fetch',
    problem: 'Vue 3 context: implement a fetching composable that aborts superseded requests, ignores stale settlements and cleans up on scope disposal.',
    approach: 'Separate a framework-neutral latest-request controller from a Vue adapter. Use both a version token and a child AbortController, since loaders may ignore abort.',
    jsCode: `// Vue 3 ES module / setup context; this import is inside a solution string only.
import { shallowRef, watch, onScopeDispose } from 'vue';

function createLatestRequest(load, publish) {
  let version = 0, controller, stopped = false;
  return {
    async run(key) {
      if (stopped) return;
      const token = ++version;
      controller?.abort();
      const current = new AbortController(); controller = current;
      publish({ data: null, error: null, loading: true });
      try {
        const data = await load(key, current.signal);
        if (!stopped && token === version && !current.signal.aborted)
          publish({ data, error: null, loading: false });
      } catch (error) {
        if (!stopped && token === version && !current.signal.aborted)
          publish({ data: null, error, loading: false });
      }
    },
    stop() { stopped = true; version++; controller?.abort(); }
  };
}
function useRaceSafeFetch(url, decode) {
  const state = shallowRef({ data: null, error: null, loading: false });
  const latest = createLatestRequest(async (key, signal) => {
    const response = await fetch(key, { signal });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return decode(await response.json());
  }, value => { state.value = value; });
  const unwatch = watch(url, value => { void latest.run(value); }, { immediate: true, flush: 'sync' });
  onScopeDispose(() => { unwatch(); latest.stop(); });
  return state;
}`,
    tsCode: `// Vue 3 ES module, called in setup() or an active effectScope.
import { shallowRef, watch, onScopeDispose, type Ref } from 'vue';
type RequestState<T> = { data: T | null; error: unknown; loading: boolean };
function createLatestRequest<K, T>(load: (key: K, signal: AbortSignal) => Promise<T>,
  publish: (state: RequestState<T>) => void) {
  let version = 0, controller: AbortController | undefined, stopped = false;
  return {
    async run(key: K): Promise<void> {
      if (stopped) return;
      const token = ++version;
      controller?.abort();
      const current = new AbortController(); controller = current;
      publish({ data: null, error: null, loading: true });
      try {
        const data = await load(key, current.signal);
        if (!stopped && token === version && !current.signal.aborted)
          publish({ data, error: null, loading: false });
      } catch (error: unknown) {
        if (!stopped && token === version && !current.signal.aborted)
          publish({ data: null, error, loading: false });
      }
    },
    stop(): void { stopped = true; version++; controller?.abort(); }
  };
}
function useRaceSafeFetch<T>(url: Ref<string>, decode: (raw: unknown) => T) {
  const state = shallowRef<RequestState<T>>({ data: null, error: null, loading: false });
  const latest = createLatestRequest<string, T>(async (key, signal) => {
    const response = await fetch(key, { signal });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const raw: unknown = await response.json();
    return decode(raw);
  }, value => { state.value = value; });
  const unwatch = watch(url, value => { void latest.run(value); }, { immediate: true, flush: 'sync' });
  onScopeDispose(() => { unwatch(); latest.stop(); });
  return state;
}`,
    explanation: 'Every run invalidates the previous token before aborting its signal. Only the current request may publish success/error/loading completion, so an old finally cannot clear a new loading indicator. stop invalidates and aborts without publishing after disposal. decode must perform runtime schema validation; a generic alone cannot prove JSON shape. Context: Vue 3 client-side setup or effectScope, not a Nuxt SSR hydration-aware replacement for useFetch. Requests are instance-owned, not shared deduped requests.',
    complexity: 'Time O(1) controller bookkeeping per request plus fetch/decode work. Space O(payload) current reactive state plus O(r) unresolved loader closures when r superseded loaders ignore abort.',
    followup: 'Add a refresh method and a retained stale-data policy while preserving request ownership and Nuxt SSR semantics.',
    examples: 'const state = useRaceSafeFetch(urlRef, parseUser); changing urlRef aborts the old fetch; state.value exposes data/error/loading.',
    constraints: 'Vue 3 is needed only for the copied adapter; core helper tests below need no Vue. Call within an active scope. load/publish are trusted callbacks; publish must not throw. stop is permanent.',
    edgeCases: 'Old responses arriving last, old rejections, HTTP errors, decoder errors, rapid source changes and disposal during pending work. Ignore-abort loaders may still consume resources.',
    tests: `// Run against createLatestRequest from this snippet (omit Vue import for a Node-only core test).
const releases = new Map(), signals = [], states = [];
const latest = createLatestRequest((key, signal) => {
  signals.push(signal); return new Promise(resolve => releases.set(key, resolve));
}, state => states.push(state));
const first = latest.run('old'), second = latest.run('new');
assert.equal(signals[0].aborted, true);
releases.get('new')('fresh'); await second;
releases.get('old')('stale'); await first;
assert.equal(states.at(-1).data, 'fresh');
const third = latest.run('third'), count = states.length;
latest.stop(); releases.get('third')('ignored'); await third;
assert.equal(signals[2].aborted, true); assert.equal(states.length, count);
// In a Vue test project also test ref changes and effectScope.stop() against the adapter.`,
    difficulty: 'advanced', tags: ['vue3', 'composables', 'async', 'cleanup', 'race-conditions'],
  },
  {
    id: 'coding-paginated-load-guard',
    problem: 'Create a cursor pager that shares duplicate loadMore calls and ignores responses from before a reset.',
    approach: 'Track one pending promise per generation; invalidate generations on reset and merge each accepted page only once.',
    jsCode: `function createPager(fetchPage, initialCursor = '') {
  let items = [], cursor = initialCursor, pending = null, version = 0;
  return {
    get state() { return { items: items.slice(), cursor, loading: pending !== null }; },
    loadMore() {
      if (pending) return pending;
      if (cursor === null) return Promise.resolve();
      const token = version, requested = cursor;
      const task = Promise.resolve().then(() => fetchPage(requested)).then(page => {
        if (token !== version) return;
        if (!Array.isArray(page.items) || (page.nextCursor !== null && typeof page.nextCursor !== 'string'))
          throw new TypeError('Invalid page');
        if (page.nextCursor === requested) throw new Error('Cursor did not advance');
        items = items.concat(page.items); cursor = page.nextCursor;
      }).finally(() => { if (token === version) pending = null; });
      pending = task; return task;
    },
    reset() { version++; items = []; cursor = initialCursor; pending = null; }
  };
}`,
    tsCode: `type Page<T> = { items: T[]; nextCursor: string | null };
function createPager<T>(fetchPage: (cursor: string) => Promise<Page<T>>, initialCursor = '') {
  let items: T[] = [], cursor: string | null = initialCursor;
  let pending: Promise<void> | null = null, version = 0;
  return {
    get state() { return { items: items.slice(), cursor, loading: pending !== null }; },
    loadMore(): Promise<void> {
      if (pending) return pending;
      if (cursor === null) return Promise.resolve();
      const token = version, requested = cursor;
      const task = Promise.resolve().then(() => fetchPage(requested)).then(page => {
        if (token !== version) return;
        if (!Array.isArray(page.items) || (page.nextCursor !== null && typeof page.nextCursor !== 'string'))
          throw new TypeError('Invalid page');
        if (page.nextCursor === requested) throw new Error('Cursor did not advance');
        items = items.concat(page.items); cursor = page.nextCursor;
      }).finally(() => { if (token === version) pending = null; });
      pending = task; return task;
    },
    reset(): void { version++; items = []; cursor = initialCursor; pending = null; }
  };
}`,
    explanation: 'The pending promise is assigned before invoking fetchPage in a microtask, preventing double-triggered loads. Reset permits a new request immediately; an older result/finally cannot mutate the new generation. Reset does not abort transport or suppress errors returned to old callers. null alone means exhausted; the empty string is a valid initial cursor. The adapter must validate item schemas; only the outer page shape is checked here.',
    complexity: 'Time O(N + p) per accepted page due to immutable concat with N existing and p new items; repeated pages can total O(totalItems^2). state getter O(N). Space O(N + p) while merging, plus outstanding old requests.',
    followup: 'Add cancellation, per-query identity, bounded retained pages and item-ID deduplication for overlapping server pages.',
    examples: 'Two observer callbacks calling loadMore before settlement receive the same promise and append just one page.',
    constraints: 'fetchPage returns { items, nextCursor }; string cursors advance or become null, with no longer cursor cycles by server contract. Page item objects are treated as immutable; state array is a defensive shallow copy.',
    edgeCases: 'Empty terminal page, duplicate trigger, failed page retried at same cursor, reset during load, and a cursor that does not advance.',
    tests: `let calls = 0;
const pager = createPager(async () => { calls++; return { items: [1, 2], nextCursor: null }; });
const a = pager.loadMore(), b = pager.loadMore(); assert.equal(a, b);
await a; await pager.loadMore(); assert.equal(calls, 1);
assert.deepEqual(pager.state.items, [1, 2]);
let release;
const stale = createPager(() => new Promise(resolve => { release = resolve; }));
const old = stale.loadMore(); await Promise.resolve(); stale.reset();
release({ items: [9], nextCursor: null }); await old;
assert.deepEqual(stale.state.items, []); assert.equal(stale.state.loading, false);`,
    difficulty: 'advanced', tags: ['pagination', 'async', 'state', 'race-conditions'],
  },
  {
    id: 'coding-optimistic-versioned-rollback',
    problem: 'Implement optimistic scalar/whole-value replacement with versioned rollback so an older failed save never undoes newer intent.',
    approach: 'Track the highest acknowledged value/version separately from the visible optimistic value. Roll back only when the failing version is still current.',
    jsCode: `function createOptimisticValue(initial, save) {
  let value = initial, confirmed = initial, version = 0, acknowledged = 0;
  return {
    get value() { return value; },
    async set(next) {
      const token = ++version; value = next;
      try {
        await save(next, token);
        if (token > acknowledged) { acknowledged = token; confirmed = next; }
        if (token === version) value = confirmed;
      } catch (error) {
        if (token === version) value = confirmed;
        throw error;
      }
    }
  };
}`,
    tsCode: `function createOptimisticValue<T>(initial: T,
  save: (next: T, version: number) => Promise<void>) {
  let value = initial, confirmed = initial, version = 0, acknowledged = 0;
  return {
    get value(): T { return value; },
    async set(next: T): Promise<void> {
      const token = ++version; value = next;
      try {
        await save(next, token);
        if (token > acknowledged) { acknowledged = token; confirmed = next; }
        if (token === version) value = confirmed;
      } catch (error: unknown) {
        if (token === version) value = confirmed;
        throw error;
      }
    }
  };
}`,
    explanation: 'Rolling back to the immediate pre-call snapshot is unsafe when it contains an earlier optimistic value whose own request may fail. This version rolls back to the highest acknowledged value. It is intentionally a latest-intent replacement model, not an operation-rebasing engine: a late acknowledgement of an older request updates the internal baseline but does not overwrite the visible newer version. After ambiguous failures or older acknowledgements following a newer rollback, reconcile with an authoritative refetch. Client versions protect UI state only; the server must enforce compatible revision/idempotency semantics (or serialize writes) to prevent out-of-order persisted updates.',
    complexity: 'Time O(1) bookkeeping per mutation plus save work; space O(1) retained values plus O(k) closures for k pending saves, excluding payload sizes.',
    followup: 'Handle dependent patches with an ordered optimistic operation log and authoritative server revisions.',
    examples: 'Initial A; optimistic B then C; B fails late: visible C remains. If both fail, the current failure rolls back to acknowledged A.',
    constraints: 'Immutable whole-value replacements; save resolves without canonical transformed data. Caller catches each rejection; server consistency/reconciliation is outside this minimal client model.',
    edgeCases: 'Old failure after new success; both overlapping failures; new failure after old success; late old acknowledgement may require a refetch rather than guessing server state.',
    tests: `const pending = new Map();
const state = createOptimisticValue('A', (next, version) => new Promise((resolve, reject) => pending.set(version, { resolve, reject })));
const old = state.set('B'), oldError = assert.rejects(old, /old/);
const fresh = state.set('C'); assert.equal(state.value, 'C');
pending.get(2).resolve(); await fresh;
pending.get(1).reject(new Error('old')); await oldError; assert.equal(state.value, 'C');
const failed = state.set('D'), failure = assert.rejects(failed, /latest/);
pending.get(3).reject(new Error('latest')); await failure; assert.equal(state.value, 'C');`,
    difficulty: 'advanced', tags: ['state', 'optimistic-ui', 'versioning', 'race-conditions'],
  },
  {
    id: 'coding-serial-async-queue',
    problem: 'Implement a FIFO asynchronous task queue that runs one task at a time and continues after task rejection.',
    approach: 'Chain each task after a private tail promise, but replace that tail with a rejection-swallowing completion barrier while returning the original task promise.',
    jsCode: `function createAsyncQueue() {
  let tail = Promise.resolve(), size = 0;
  return {
    get size() { return size; },
    add(task) {
      size++;
      const result = tail.then(() => task());
      tail = result.then(() => { size--; }, () => { size--; });
      return result;
    },
    onIdle() { return tail; }
  };
}`,
    tsCode: `function createAsyncQueue() {
  let tail: Promise<void> = Promise.resolve(), size = 0;
  return {
    get size(): number { return size; },
    add<T>(task: () => T | PromiseLike<T>): Promise<T> {
      size++;
      const result = tail.then(() => task());
      tail = result.then(() => { size--; }, () => { size--; });
      return result;
    },
    onIdle(): Promise<void> { return tail; }
  };
}`,
    explanation: 'A rejected private tail would poison all later tasks, so each internal completion handler resolves regardless of task outcome. The caller still receives the original rejection. size counts running plus queued tasks. onIdle snapshots work enqueued so far, not future additions. A task awaiting another task it enqueues on this same serial queue deadlocks, because that child cannot start until the parent completes.',
    complexity: 'Time O(1) enqueue bookkeeping, O(n) orchestration over n tasks plus task durations. Space O(k) promise links/closures for k pending tasks.',
    followup: 'Add a maximum queue size and explicit rejection/backpressure policy rather than allowing unlimited producers.',
    examples: 'queue.add(saveA); queue.add(saveB) starts B only after A settles, even if A rejects.',
    constraints: 'Tasks are lazy zero-argument functions. No priority, cancellation or capacity limit; running tasks must eventually settle for progress.',
    edgeCases: 'Synchronous throws, rejected promises, empty onIdle, enqueue during a task, and same-queue dependency deadlock.',
    tests: `const queue = createAsyncQueue(), order = []; let active = 0;
const first = queue.add(async () => { assert.equal(++active, 1); order.push('a'); await Promise.resolve(); active--; return 1; });
const bad = queue.add(() => { order.push('bad'); throw new Error('broken'); });
const rejected = assert.rejects(bad, /broken/);
const last = queue.add(() => { assert.equal(active, 0); order.push('c'); return 3; });
assert.equal(queue.size, 3);
assert.equal(await first, 1); await rejected; assert.equal(await last, 3);
await queue.onIdle(); assert.equal(queue.size, 0); assert.deepEqual(order, ['a', 'bad', 'c']);`,
    difficulty: 'senior', tags: ['async', 'queue', 'error-policy', 'backpressure'],
  },
  {
    id: 'coding-compose-unary',
    problem: 'Compose synchronous unary transformations right-to-left with an identity result for an empty composition.',
    approach: 'Validate function arguments once and fold from the final function to the first on every invocation.',
    jsCode: `function composeUnary(...functions) {
  if (functions.some(fn => typeof fn !== 'function')) throw new TypeError('Expected functions');
  return value => {
    let result = value;
    for (let i = functions.length - 1; i >= 0; i--) result = functions[i](result);
    return result;
  };
}`,
    tsCode: `// Homogeneous T -> T functions are intentional: no unsound variadic type casts.
function composeUnary<T>(...functions: Array<(value: T) => T>): (value: T) => T {
  if (functions.some(fn => typeof fn !== 'function')) throw new TypeError('Expected functions');
  return (value: T): T => {
    let result = value;
    for (let i = functions.length - 1; i >= 0; i--) result = functions[i](result);
    return result;
  };
}`,
    explanation: 'compose(f, g)(x) means f(g(x)), unlike a left-to-right pipe. The TS API deliberately supports homogeneous transforms only; heterogeneous composition requires overloads or recursive tuple validation, not returning any. Functions are synchronous and receiver-independent; thrown errors propagate immediately. An empty composition returns its argument by identity.',
    complexity: 'Time O(k) construction/validation, and O(k + sum of function costs) per call. Space O(k) retained function references, O(1) auxiliary per call excluding intermediate values.',
    followup: 'Provide type-safe overloads for heterogeneous two- and three-function composition, then design an async pipe.',
    examples: 'composeUnary(n => n + 1, n => n * 2)(3) returns 7, not 8.',
    constraints: 'Unary synchronous functions with a compatible common domain/codomain; no this contract. The JS version cannot enforce type compatibility at runtime.',
    edgeCases: 'No functions returns identity; one function works unchanged; thrown errors stop the pipeline; async functions are outside the contract.',
    tests: `assert.equal(composeUnary(n => n + 1, n => n * 2)(3), 7);
const object = {}; assert.equal(composeUnary()(object), object);
assert.equal(composeUnary(s => s.trim(), s => s.toUpperCase())(' a '), 'A');
assert.throws(() => composeUnary(3), TypeError);
assert.throws(() => composeUnary(() => { throw new Error('stop'); })(1), /stop/);`,
    difficulty: 'senior', tags: ['functional-programming', 'composition', 'typescript'],
  },
  {
    id: 'coding-async-filter-batches',
    problem: 'Filter an array with asynchronous predicates in bounded batches while preserving order and avoiding truthy-promise filtering mistakes.',
    approach: 'Await all predicates in each batch, then append accepted values in their original positions before starting the next batch.',
    jsCode: `async function filterAsyncBatched(items, batchSize, predicate) {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError('batchSize');
  const output = [];
  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize);
    const accepted = await Promise.all(batch.map((item, index) =>
      Promise.resolve().then(() => predicate(item, start + index))));
    for (let i = 0; i < batch.length; i++) {
      if (typeof accepted[i] !== 'boolean') throw new TypeError('Predicate must return boolean');
      if (accepted[i]) output.push(batch[i]);
    }
  }
  return output;
}`,
    tsCode: `async function filterAsyncBatched<T>(items: readonly T[], batchSize: number,
  predicate: (item: T, index: number) => boolean | PromiseLike<boolean>): Promise<T[]> {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new RangeError('batchSize');
  const output: T[] = [];
  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize);
    const accepted = await Promise.all(batch.map((item, index) =>
      Promise.resolve().then(() => predicate(item, start + index))));
    for (let i = 0; i < batch.length; i++) {
      if (typeof accepted[i] !== 'boolean') throw new TypeError('Predicate must return boolean');
      if (accepted[i]) output.push(batch[i]);
    }
  }
  return output;
}`,
    explanation: 'Array.filter(async () => ...) keeps every promise because promises are truthy. This implementation waits for boolean results and maintains order explicitly. Unlike a replenishing worker pool, a batch waits for its slowest predicate before starting more work, trading throughput for simple pressure control. A rejection stops later batches, not already-started predicates; their rejections are still observed by Promise.all.',
    complexity: 'Time O(n) coordination plus predicate work; wall time is the sum of the slowest predicate in each batch. Space O(n) worst-case output plus O(min(n, batchSize)) temporary work.',
    followup: 'Compare throughput with a replenishing async map pool and add an error-as-false policy only if product semantics allow it.',
    examples: 'await filterAsyncBatched([1,2,3,4], 2, async n => n % 2 === 0) returns [2,4].',
    constraints: 'Finite dense readonly input; positive integer batchSize; predicates return booleans or boolean promises. Input is not mutated while filtering.',
    edgeCases: 'Empty input returns []; partial final batch; synchronous throws; rejection stops subsequent batches; nonboolean results reject instead of coercing.',
    tests: `let active = 0, maximum = 0;
const out = await filterAsyncBatched([1, 2, 3, 4, 5], 2, async n => {
  maximum = Math.max(maximum, ++active); await Promise.resolve(); active--; return n % 2 === 0;
});
assert.deepEqual(out, [2, 4]); assert.equal(maximum, 2);
assert.deepEqual(await filterAsyncBatched([], 2, () => true), []);
await assert.rejects(filterAsyncBatched([1], 1, () => 'yes'), TypeError);
let called = 0;
await assert.rejects(filterAsyncBatched([1, 2], 1, () => { called++; throw new Error('bad'); }), /bad/);
assert.equal(called, 1);`,
    difficulty: 'senior', tags: ['async', 'arrays', 'batching', 'backpressure'],
  },
];