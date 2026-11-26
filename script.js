/* ==========================================================================
  Frontend Interview Prep Pro — data only; UI lives in app.js.
  Load senior-content.js and coding-content.js before this classic script.
  Code samples and tests are educational strings, not executed by the app.
  Each question bank has a `type`:
   'qa'      -> question / testing / answer / example / code / mistake / follow-up
   'output'  -> code snippet / output / explanation
   'coding'  -> problem / approach / jsCode / tsCode / explanation / complexity / followup
   'debug'   -> title / symptoms / causes / investigation / devtools / solution / prevention
   ========================================================================== */

const topics = [
  { id: 'html', label: 'HTML', group: 'Core Skills' },
  { id: 'css', label: 'CSS', group: 'Core Skills' },
  { id: 'javascript', label: 'JavaScript', group: 'Core Skills' },
  { id: 'js-output', label: 'JS Output Questions', group: 'Core Skills' },
  { id: 'typescript', label: 'TypeScript', group: 'Core Skills' },

  { id: 'vue2', label: 'Vue 2', group: 'Vue & Nuxt' },
  { id: 'vue3', label: 'Vue 3', group: 'Vue & Nuxt' },
  { id: 'migration', label: 'Vue 2 → 3 Migration', group: 'Vue & Nuxt' },
  { id: 'nuxt', label: 'Nuxt', group: 'Vue & Nuxt' },

  { id: 'tailwind', label: 'Tailwind CSS', group: 'Styling' },
  { id: 'scss', label: 'SCSS / Sass', group: 'Styling' },

  { id: 'api', label: 'REST APIs', group: 'Engineering' },
  { id: 'performance', label: 'Performance', group: 'Engineering' },
  { id: 'accessibility', label: 'Accessibility', group: 'Engineering' },
  { id: 'git', label: 'Git', group: 'Engineering' },
  { id: 'security', label: 'Security', group: 'Engineering' },
  { id: 'testing', label: 'Testing', group: 'Engineering' },

  { id: 'debugging', label: 'Debugging Scenarios', group: 'Problem Solving' },
  { id: 'system-design', label: 'System Design', group: 'Problem Solving' },
  { id: 'coding', label: 'Coding Problems', group: 'Problem Solving' },

  { id: 'scenario', label: 'Scenario-Based', group: 'Interview Skills' },
  { id: 'behavioral', label: 'Behavioral', group: 'Interview Skills' },

  { id: 'mock-interview', label: 'Mock Interview', group: 'Practice' },
  { id: 'prep-plan', label: 'Prep Plan & Top Lists', group: 'Practice' },
];

/* ========================================================================
   HTML
   ======================================================================== */
const htmlQuestions = [
  {
    q: 'What is the difference between <code>defer</code> and <code>async</code> on a script tag?',
    testing: 'Script loading behavior and its effect on rendering and execution order.',
    answer: `Both download the script without blocking HTML parsing. <code>defer</code> executes scripts after the document has been parsed, in the order they appear, so it suits application code that depends on the DOM or on other scripts. <code>async</code> executes as soon as the script has downloaded, in whatever order scripts finish, which suits independent scripts such as analytics. A normal script without either attribute blocks parsing while it downloads and runs. Module scripts are deferred by default.`,
    mistake: 'Using async for scripts that depend on each other or on the DOM, which leads to intermittent ordering bugs.',
  },
  {
    q: 'Why should you use <code>label</code> elements, and how do you associate them with form controls?',
    testing: 'Basic accessibility and usability of forms.',
    answer: `A label gives a control an accessible name and enlarges its click target, so screen reader users hear what the field is for and mouse users can click the text to focus it. Associate it by wrapping the control inside the label or by matching the label <code>for</code> attribute to the control <code>id</code>. A placeholder is not a replacement, because it disappears while typing and is not reliably announced as a name.`,
    mistake: 'Using only placeholder text as the label, which fails accessibility and confuses users who have already started typing.',
  },
  {
    q: 'You inherit a website where everything is built using <code>&lt;div&gt;</code> elements. What problems can this cause and how would you improve it?',
    testing: 'Whether you understand semantic HTML as an engineering concern, not just a style preference.',
    answer: `A "div soup" page usually has three real problems: accessibility, SEO, and maintainability. Screen readers lose the document outline because there are no landmarks or headings to navigate by. Search engines have a harder time understanding what's the main content versus navigation or ads. And for the team, it's harder to read the markup because every div looks the same — you have to rely on class names to guess intent.

My approach is to do this incrementally, not a rewrite. I replace structural wrappers with semantic elements first — <code>header</code>, <code>nav</code>, <code>main</code>, <code>article</code>, <code>section</code>, <code>footer</code> — because that's low risk and immediately improves the accessibility tree and SEO outline. Then I look at interactive divs with click handlers and convert them to <code>button</code> or <code>a</code>, since those give you keyboard support and correct semantics for free. I prioritize by impact: the main navigation and primary content first, decorative wrappers last.`,
    example: `On a real project, the entire site used div.container, div.row, div.box for literally everything, including what was functionally a nav bar. Screen reader users had no way to jump to navigation or skip to main content. We added a skip link, replaced the top div with nav, wrapped the content in main, and it fixed several accessibility audit failures in one pass without touching the CSS at all.`,
    code: `<!-- Before -->\n<div class="header">\n  <div class="nav"><div onclick="go()">Home</div></div>\n</div>\n<div class="content">...</div>\n\n<!-- After -->\n<header>\n  <nav><a href="/">Home</a></nav>\n</header>\n<main>...</main>`,
    mistake: 'Treating this as a cosmetic/"nice to have" task instead of flagging it as an accessibility and SEO risk, which makes it much harder to get it prioritized against feature work.',
    followupQ: 'Would you do a full rewrite, or fix it incrementally? How do you decide?',
    followupA: 'Incrementally, always, unless the codebase is tiny. A full rewrite risks regressions across a page that may already work for most users, and it competes with feature delivery. I\'d fix high-traffic, high-impact areas first — main nav, forms, primary content — and track the rest as tech debt tickets so it doesn\'t get lost.',
  },
  {
    q: 'A form is difficult to use with a keyboard. How would you debug and fix it?',
    testing: 'Practical accessibility debugging skills, not just theoretical WCAG knowledge.',
    answer: `First, I unplug the mouse mentally and just use Tab, Shift+Tab, Enter and Space to go through the form myself. I'm checking three things: can I reach every control, is the tab order logical, and is there a visible focus indicator at every step.

Common root causes I look for: a custom dropdown or checkbox built from a div with a click handler and no keyboard handler; <code>tabindex</code> values that are positive and out of order (anything above 0 almost always causes problems); focus outlines removed by a global <code>outline: none</code> without a replacement style; and modals or validation errors that don't move focus to themselves. Once I find the broken control, I fix it at the element level — use a real <code>button</code>/<code>input</code> where possible, add proper key handlers (Enter/Space for custom buttons, arrow keys for custom selects) and ARIA attributes, and restore a visible focus style.`,
    example: 'On a checkout form, a custom "country" dropdown was a div with an onclick. Keyboard users couldn\'t open it at all. I rebuilt it using a native select for the common case, which solved keyboard support, screen reader support and mobile usability in one change instead of re-implementing all of that manually.',
    code: `/* Common culprit */\n*:focus { outline: none; } /* removes focus ring everywhere, don't do this */\n\n/* Fix: keep a visible, intentional focus style */\n:focus-visible {\n  outline: 2px solid #2563eb;\n  outline-offset: 2px;\n}`,
    mistake: 'Removing outline: none globally for aesthetics without providing a replacement focus style — this is one of the most common accessibility regressions I see in code review.',
    followupQ: 'How would you test this without a screen reader available?',
    followupA: 'Keyboard-only navigation catches most of these issues already. Beyond that, I\'d use the browser\'s accessibility tree inspector in DevTools to check the computed role and name of each control, and run an automated check like axe or Lighthouse to catch anything obvious I missed, while being clear that automated tools only catch part of the real problems.',
  },
  {
    q: 'An SEO audit shows that important content is not being indexed. What would you investigate?',
    testing: 'Understanding how rendering strategy and markup affect crawlability — important for someone who has worked with Nuxt.',
    answer: `I'd start by checking how the content is actually delivered to the crawler, not just what the browser shows me. If this is a client-side rendered SPA, the crawler might see an empty shell before JavaScript runs — some crawlers execute JS, but not reliably or consistently, and it's risky to depend on it. I'd check "view source" versus the rendered DOM to see the gap.

Beyond rendering, I look at: is the content behind a client-side route change that never updates the document title/meta description; are there <code>noindex</code> meta tags accidentally left in from a staging config; is important content hidden until a user interaction (like a tab or accordion) in a way that removes it from the DOM entirely rather than just visually hiding it; and are canonical tags pointing somewhere unexpected. If rendering is the issue, the real fix is usually moving to SSR or static generation for that content, which is exactly why a framework like Nuxt is valuable for content-heavy pages.`,
    example: 'We had a Nuxt site where a few pages were set up as pure client-side routes. The content looked fine in a browser, but Search Console showed "Discovered, currently not indexed." Switching those routes to server-rendered pages resolved it within a couple of crawl cycles.',
    mistake: 'Assuming that because content is visible in the browser, it\'s indexable — these are not the same thing for JavaScript-heavy pages.',
    followupQ: 'What\'s the difference between SSR and SSG for SEO, and when would you pick one over the other?',
    followupA: 'SSR renders on every request, so content can be fresh and personalized, but it adds server load and response time. SSG renders at build time, so it\'s extremely fast and cheap to serve, but content can go stale until the next build or an on-demand revalidation. For marketing or blog content that doesn\'t change per request, I\'d default to SSG. For something user-specific or frequently changing, SSR.',
  },
  {
    q: 'What is semantic HTML, and why does it matter beyond accessibility?',
    testing: 'Whether you can articulate semantic HTML as a multi-benefit decision (a11y, SEO, maintainability), not a single-purpose rule.',
    answer: `Semantic HTML means choosing elements based on what they mean, not how they look — a <code>button</code> for something clickable, a <code>nav</code> for navigation, a <code>time</code> for a date. The browser, assistive technology and search engines all get this meaning "for free" from the tag itself, instead of relying on us to reconstruct it from classes and JavaScript.

Practically, it reduces the amount of ARIA and JavaScript you need to write — a native button already handles focus, keyboard activation and the correct accessibility role. It also makes the codebase self-documenting; a new developer reading <code>&lt;article&gt;</code> and <code>&lt;aside&gt;</code> understands content structure faster than reading nested divs.`,
    mistake: 'Treating ARIA as a substitute for semantic HTML instead of a fallback — the first rule of ARIA is: don\'t use ARIA if a native element already does the job.',
  },
  {
    q: 'What is the difference between <code>localStorage</code>, <code>sessionStorage</code> and cookies, and when would you use each?',
    testing: 'Practical understanding of browser storage trade-offs, which matters for auth token decisions.',
    answer: `<code>localStorage</code> persists until explicitly cleared, is scoped per origin, and is accessible from JavaScript — good for things like saving a theme preference or draft form data. <code>sessionStorage</code> behaves the same but is scoped to a single tab and clears when the tab closes — good for short-lived UI state like a wizard step. Cookies are smaller, sent automatically with every matching HTTP request, and can be marked <code>HttpOnly</code> and <code>Secure</code>, so they're the only one of the three that JavaScript can be fully blocked from reading — which matters a lot for storing sensitive tokens.

In practice, for an access token I lean toward a short-lived cookie with <code>HttpOnly</code>, <code>Secure</code> and <code>SameSite</code> set, because it limits exposure to XSS. localStorage is simpler to use but is directly readable by any script running on the page, which is a real risk if there's ever an XSS vulnerability.`,
    example: 'On one project we moved auth tokens from localStorage to an HttpOnly cookie after a security review flagged XSS exposure. It required a small backend change to set the cookie on login, but it meaningfully reduced the blast radius of any future XSS bug.',
    mistake: 'Storing long-lived auth tokens in localStorage purely because it\'s convenient to read from JavaScript, without considering the XSS exposure.',
    followupQ: 'If you use HttpOnly cookies, how does the frontend read the user\'s login state?',
    followupA: 'The frontend doesn\'t read the token directly — it either checks a separate small non-sensitive flag (like a "logged in" boolean in a readable cookie or returned by an endpoint), or simply calls an authenticated "me" endpoint on load and treats a 401 as logged out.',
  },
  {
    q: 'What is the difference between <code>async</code> and <code>defer</code> on a <code>&lt;script&gt;</code> tag?',
    testing: 'Understanding of page load performance and script execution order — relevant to performance optimization experience.',
    answer: `Both let the HTML parser keep working while the script downloads, instead of blocking like a plain script tag does. The difference is execution timing. <code>defer</code> scripts run in the order they appear, after the HTML is fully parsed, right before <code>DOMContentLoaded</code> — this is what I use for most app scripts since the DOM is guaranteed to be ready. <code>async</code> scripts run as soon as they finish downloading, which could be before or after parsing finishes, and in whatever order they happen to arrive — fine for independent scripts like analytics, risky for anything with dependencies.`,
    code: `<script src="app.js" defer></script>\n<script src="analytics.js" async></script>`,
    mistake: 'Using async for a script that depends on another script or on DOM elements existing, which causes intermittent bugs that are hard to reproduce because they depend on network timing.',
  },
  {
    q: 'What are <code>data-*</code> attributes and when would you use them?',
    testing: 'Whether you reach for the right tool instead of overusing classes or inline attributes for JS hooks.',
    answer: 'They\'re custom attributes for storing extra information directly on an element, read through the element\'s <code>dataset</code> property in JavaScript, or targeted in CSS with attribute selectors. I use them as a clean hook between markup and behavior — for example, <code>data-testid</code> for test selectors so tests don\'t break when a class name changes for styling reasons, or <code>data-user-id</code> to avoid a second lookup when handling a click.',
    code: `<button data-action="delete" data-id="42">Delete</button>\n\nbutton.addEventListener('click', (e) => {\n  const { action, id } = e.currentTarget.dataset;\n});`,
    mistake: 'Using CSS classes as JavaScript hooks (e.g. <code>.js-toggle</code>) and then breaking the behavior when a designer renames the class for styling — data attributes decouple styling hooks from behavior hooks.',
  },
  {
    q: 'What is the difference between the <code>defer</code> execution point and placing a script right before <code>&lt;/body&gt;</code>?',
    testing: 'Depth of understanding beyond the "just use defer" rule of thumb.',
    answer: 'Placing a plain script before <code>&lt;/body&gt;</code> was the old technique to avoid blocking rendering, because by then the HTML above it has already parsed. But the browser still has to download and execute it in place before moving on if there\'s no <code>defer</code>/<code>async</code>. With <code>defer</code> in the <code>&lt;head&gt;</code>, downloading can start immediately while the parser keeps working, and execution still happens at the same safe point — after parsing, in order. So <code>defer</code> in the head is strictly better: same safety guarantees, earlier download start.',
  },
  {
    q: 'How do you approach form validation for a production form?',
    testing: 'Whether you think about both UX and security, and client vs server responsibilities.',
    answer: `I treat client-side validation as a UX layer, not a security layer. I use native HTML validation attributes first — <code>required</code>, <code>type="email"</code>, <code>pattern</code>, <code>min</code>/<code>max</code> — because they're free, accessible, and work without JavaScript. On top of that I add JavaScript validation for things native HTML can't express well, like "password and confirm password must match," with messages that are announced to screen readers through <code>aria-live</code> or <code>aria-describedby</code> on the field.

Server-side validation is non-negotiable regardless of what the client does, since client-side checks can always be bypassed.`,
    code: `<label for="email">Email</label>\n<input id="email" type="email" required aria-describedby="email-error" />\n<p id="email-error" role="alert"></p>`,
    mistake: 'Relying only on client-side validation and trusting that data arriving at the API is already clean.',
  },
  {
    q: 'What is the purpose of the <code>&lt;iframe&gt;</code> element, and what are the risks of using it?',
    testing: 'Awareness of security implications, which matters for a security-conscious senior candidate.',
    answer: 'An iframe embeds another HTML document inside the current page — common for embedding payment widgets, maps, or third-party video. The main risk is that it can be used for clickjacking if your own site is iframed by an attacker, so I set <code>X-Frame-Options</code> or a <code>Content-Security-Policy: frame-ancestors</code> directive on pages that shouldn\'t be embeddable. When I embed third-party content myself, I scope its permissions tightly with the <code>sandbox</code> attribute and only allow what\'s actually needed.',
    code: `<iframe src="https://trusted-widget.example.com" title="Partner widget" sandbox="allow-scripts"></iframe>`,
    mistake: 'Combining allow-scripts and allow-same-origin for an embed on the parent\'s own origin can let it remove the sandbox and reload unsandboxed. Prefer a separate origin for untrusted content, start with minimal permissions and add allow-same-origin only after reviewing the origin and threat model.',
  },
  {
    q: 'What are the key meta tags you\'d always include for a production page, and why?',
    testing: 'Practical SEO and rendering knowledge beyond "add a title tag".',
    answer: 'At minimum: a unique <code>&lt;title&gt;</code> and <code>meta description</code> per page for search results, <code>viewport</code> for correct mobile scaling, a <code>canonical</code> link to avoid duplicate content issues, and Open Graph tags (<code>og:title</code>, <code>og:description</code>, <code>og:image</code>) so shared links look right on social platforms. For content-heavy or multi-language sites I also add <code>hreflang</code> tags.',
    code: `<meta name="viewport" content="width=device-width, initial-scale=1" />\n<meta name="description" content="..." />\n<link rel="canonical" href="https://example.com/page" />\n<meta property="og:title" content="..." />`,
  },
  {
    q: 'What is the accessibility tree, and how is it different from the DOM?',
    testing: 'Deeper accessibility understanding than "add alt text".',
    answer: 'The DOM is the full structural representation of the page. The accessibility tree is a parallel, reduced representation built from the DOM that assistive technology actually reads — it includes each element\'s computed role, name, state and value, and strips out things that aren\'t relevant to accessibility, like purely decorative wrapper divs. Two elements can look identical in the DOM inspector but have very different accessibility tree entries depending on semantics and ARIA. I use the "Accessibility" pane in Chrome DevTools to check this directly rather than guessing.',
  },
  {
    q: 'When would you use ARIA attributes, and what is the first rule of ARIA?',
    testing: 'Whether you understand ARIA as an addition, not a replacement, for semantics.',
    answer: 'The first rule of ARIA is: if a native HTML element or attribute already has the semantics you need, use it instead of adding ARIA. ARIA exists for the gaps — custom widgets that HTML doesn\'t have a native equivalent for, like a tab panel, a combobox, or a toast notification. In those cases I use the documented ARIA design patterns rather than inventing my own, because screen readers have specific expectations about how roles like <code>tablist</code> or <code>dialog</code> behave.',
    mistake: 'Adding <code>role="button"</code> to a div instead of just using a <code>&lt;button&gt;</code>, which still requires manually adding keyboard handling that the native element gives you for free.',
  },
  {
    q: 'How do you manage focus for a single-page application when the route changes?',
    testing: 'SPA-specific accessibility knowledge — a common gap for Vue/Nuxt developers.',
    answer: 'In a traditional multi-page site, the browser resets focus to the top of the new document automatically. In an SPA, the DOM just updates in place, so screen reader users get no signal that anything changed. I move focus programmatically to the new page\'s main heading or a visually-hidden "route announcer" element, and update the document title so it\'s announced. Some teams add a persistent visually-hidden live region that announces "Navigated to X" on every route change.',
    code: `router.afterEach((to) => {\n  document.title = to.meta.title;\n  const heading = document.querySelector('h1');\n  heading?.setAttribute('tabindex', '-1');\n  heading?.focus();\n});`,
  },
];

/* ========================================================================
   CSS
   ======================================================================== */
const cssQuestions = [
  {
    q: 'Explain the CSS box model and what <code>box-sizing: border-box</code> changes.',
    testing: 'Fundamental layout sizing that causes real bugs.',
    answer: `Every element is a box made of content, padding, border and margin. With the default <code>content-box</code>, the width and height you set apply only to the content, so padding and border are added on top and the element becomes larger than declared. With <code>border-box</code>, the declared width and height include padding and border, which makes sizing predictable, especially for percentage widths with padding. Many projects apply it globally to all elements.`,
    mistake: 'Setting width 100% plus padding on a content-box element and then wondering why it overflows its parent.',
  },
  {
    q: 'When would you choose Flexbox and when would you choose Grid?',
    testing: 'Choosing the right layout tool instead of using one for everything.',
    answer: `Flexbox is one-dimensional: it lays items out along a single row or column and distributes space and alignment along that axis, which suits toolbars, navigation and centering. Grid is two-dimensional: it defines rows and columns together, so it suits page layouts and card grids where items must align in both directions. They combine well: Grid for the overall page structure and Flexbox for the content inside each area. Pick based on whether the layout is driven by content flow along one axis or by an explicit two-dimensional structure.`,
    mistake: 'Nesting many flex containers with hacks to imitate a grid that a single Grid definition would express clearly.',
  },
  {
    q: 'A layout works on desktop but breaks on mobile. How would you debug it?',
    testing: 'Systematic responsive debugging process rather than guessing.',
    answer: `I start in the browser's device toolbar at the actual breakpoint where it breaks, not just a generic "mobile" preset, because the bug is usually tied to a specific width. Then I check, in order: is there a fixed width or min-width somewhere forcing horizontal overflow; is a flex or grid container not wrapping because <code>flex-wrap</code> or a responsive <code>grid-template-columns</code> is missing; are media queries actually targeting the right range (an off-by-one in min-width/max-width is a classic bug); and is something like a fixed-position element overlapping content because viewport units behave differently with mobile browser chrome.

A trick I use a lot: add <code>outline: 1px solid red</code> temporarily to suspect elements to see their real box size versus what I expect — it's faster than reading computed styles one by one.`,
    code: `/* Quick diagnostic, remove before committing */\n* { outline: 1px solid red; }`,
    mistake: 'Fixing the symptom with a magic pixel value at one breakpoint instead of finding the actual overflow source, which just moves the bug to a different width.',
    followupQ: 'How do you prevent this class of bug from happening in the first place?',
    followupA: 'Mobile-first CSS — write the base styles for small screens and add complexity with min-width media queries as the screen grows, rather than trying to override desktop styles downward. It\'s much harder to accidentally leave a fixed-width desktop assumption in place when you never wrote one to begin with.',
  },
  {
    q: 'Two developers have created conflicting CSS rules. How would you identify and solve the issue?',
    testing: 'Specificity and cascade knowledge applied to a team/process problem.',
    answer: 'First I find which rule is actually winning using DevTools — the computed styles panel shows every matching rule and which one is struck through versus active, which tells me the specificity conflict directly instead of me calculating it by hand. Then I look at why it happened: usually it\'s two rules targeting the same element with different specificity weights (an ID selector versus a class, or a different nesting depth), or an <code>!important</code someone added to force a fix. The long-term solution is usually a naming convention like BEM so two developers styling different components can\'t accidentally collide, plus a lint rule discouraging <code>!important</code> and deep nesting.',
    mistake: 'Reaching for <code>!important</code> to "win" the conflict, which just creates a harder conflict for the next person.',
  },
  {
    q: 'A modal appears behind another component even though its <code>z-index</code> is higher. Why?',
    testing: 'Real understanding of stacking contexts, not just "z-index: 9999 fixes everything".',
    answer: `This is almost always a stacking context problem, not a z-index problem. z-index only compares elements within the same stacking context. A new stacking context is created by things like a parent with <code>position: relative/absolute/fixed</code> combined with a z-index, <code>transform</code>, <code>opacity</code> less than 1, or <code>filter</code>. If the modal's ancestor accidentally created its own stacking context — for example, a parent card has <code>transform: translateY(0)</code> for an animation — the modal's high z-index only wins within that parent's context, not globally.

The fix is either to remove the unintentional stacking context from the ancestor, or to render the modal at the document root using a portal/teleport so it's not nested inside any component context at all.`,
    code: `<!-- Vue 3 -->\n<Teleport to="body">\n  <div class="modal">...</div>\n</Teleport>`,
    mistake: 'Continuously increasing z-index values to "win" without realizing the real issue is which stacking context the element is trapped in.',
  },
  {
    q: 'You have a deeply nested SCSS file. How would you refactor it?',
    testing: 'CSS architecture judgment for long-term maintainability.',
    answer: 'Deep nesting usually means the selector specificity has grown out of control and the generated CSS is now hard to override safely. I refactor toward flatter, component-scoped selectors — ideally one class per component root using something like BEM, so nesting in the SCSS source stays shallow (2 levels max as a rule of thumb) while still being organized. I also extract repeated patterns into mixins or CSS variables instead of nesting deeper to reach a shared value.',
    code: `// Before: deep nesting, high specificity\n.card { .header { .title { span { color: red; } } } }\n\n// After: flat, BEM-style\n.card__title { color: red; }`,
    mistake: 'Nesting to mirror the HTML structure 1:1, which feels natural but produces selectors with specificity that\'s painful to override later.',
  },
  {
    q: 'When would you choose CSS Grid instead of Flexbox?',
    testing: 'Practical layout decision-making, a very common senior-level question.',
    answer: 'Flexbox is one-dimensional — it\'s great when you\'re laying things out in a single row or column and want content to dictate size, like a navbar or a button group. Grid is two-dimensional — I reach for it when I need to control rows and columns together, like a page layout, a card grid, or anything where items need to align across both axes. A practical rule I use: if I catch myself wrapping flex items and then trying to align them into a grid-like shape with margins, that\'s a sign it should have been Grid from the start.',
    code: `.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 16px;\n}`,
  },
  {
    q: 'Explain the CSS box model and how <code>box-sizing</code> changes it.',
    testing: 'Fundamental but still frequently asked to a senior candidate to confirm fluency.',
    answer: 'Every element is a box made of content, padding, border, and margin. By default (<code>content-box</code>), width and height apply only to the content area, so padding and border add on top of your declared size — which makes sizing math annoying. I set <code>box-sizing: border-box</code> globally on almost every project, so width and height include padding and border, making layout math predictable.',
    code: `*, *::before, *::after { box-sizing: border-box; }`,
  },
  {
    q: 'Explain CSS specificity and how the cascade resolves conflicting rules.',
    testing: 'Core mental model for reading computed styles and debugging overrides.',
    answer: 'Specificity is calculated roughly as inline styles > ID selectors > classes/attributes/pseudo-classes > element selectors, each category outweighing all of the ones below it regardless of count. When specificity ties, the cascade falls back to source order — the last rule defined wins. <code>!important</code> overrides normal specificity entirely, which is why I avoid it except as a last resort or for utility classes designed to always win.',
  },
  {
    q: 'What is the difference between <code>visibility: hidden</code>, <code>display: none</code>, and <code>opacity: 0</code>?',
    testing: 'Precision on rendering and accessibility implications of "hiding" something.',
    answer: '<code>display: none</code> removes the element from layout and the accessibility tree entirely — nothing is rendered, no space is reserved, screen readers skip it. <code>visibility: hidden</code> keeps the layout space but hides the element visually and from most assistive tech, and it can be selectively overridden on children with <code>visibility: visible</code>. <code>opacity: 0</code> keeps the element fully present, interactive, and in the accessibility tree — it\'s only invisible to sighted users, so a transparent button can still be tabbed to and clicked, which is sometimes a bug and sometimes exactly what you want for a custom-styled control.',
  },
  {
    q: 'What is a stacking context and what creates one?',
    testing: 'Follow-on to the modal/z-index question, tests if you know the full trigger list.',
    answer: 'A stacking context is an isolated layer for z-index comparisons. It\'s created by the root element, and also by any element with: position relative/absolute/fixed/sticky plus a z-index, opacity less than 1, a transform, filter, will-change naming one of these, or a few others like isolation: isolate. Once created, z-index values inside only compete with siblings inside the same context — they can never escape to compete with elements outside it, no matter how high the number.',
  },
  {
    q: 'What is the difference between <code>em</code>, <code>rem</code>, <code>px</code>, <code>vh</code> and <code>vw</code>?',
    testing: 'Whether you make deliberate unit choices instead of defaulting to px everywhere.',
    answer: '<code>px</code> is an absolute unit. <code>em</code> is relative to the font size of the current element (which makes it compound in nested contexts, sometimes unpredictably). <code>rem</code> is relative to the root font size, which I prefer for most spacing and typography because it scales consistently with user font-size preferences without the compounding problem of em. <code>vh</code>/<code>vw</code> are percentages of the viewport height/width — useful for full-screen sections, but risky for font sizes alone since they don\'t have a sensible minimum or maximum without <code>clamp()</code>.',
    code: `font-size: clamp(1rem, 2vw + 0.5rem, 1.5rem);`,
  },
  {
    q: 'What does <code>clamp()</code> do and why is it useful for responsive typography?',
    testing: 'Modern CSS fluency.',
    answer: '<code>clamp(min, preferred, max)</code> lets a value scale fluidly with the viewport while never going below the min or above the max. For typography, this replaces a long list of media queries with one line that scales smoothly instead of jumping at breakpoints.',
    code: `h1 { font-size: clamp(1.75rem, 4vw, 3rem); }`,
  },
  {
    q: 'What are CSS custom properties (variables) and how are they different from Sass variables?',
    testing: 'Understanding runtime vs compile-time styling tools.',
    answer: 'CSS custom properties, declared with <code>--name: value</code> and read with <code>var(--name)</code>, are live in the browser — they can be read and changed at runtime with JavaScript, and they cascade and can be overridden per element or media query. Sass variables are compile-time only; they get replaced with their literal value when the CSS is built, so they can\'t respond to runtime conditions like a user toggling dark mode. I use CSS variables for anything that needs to change at runtime (themes, dynamic spacing), and Sass variables for build-time logic like breakpoint values used inside mixins.',
  },
  {
    q: 'What is a CSS container query and how is it different from a media query?',
    testing: 'Awareness of modern component-level responsive design.',
    answer: 'A media query responds to the viewport size. A container query responds to the size of a containing element, which means a component can adapt based on the space it\'s actually given — inside a narrow sidebar versus a wide main column — regardless of the overall screen size. This is a big deal for reusable component libraries, since the component no longer needs to know anything about the page layout it\'s placed in.',
    code: `.card-wrapper { container-type: inline-size; }\n@container (min-width: 400px) {\n  .card { flex-direction: row; }\n}`,
  },
  {
    q: 'What is the difference between pseudo-classes and pseudo-elements?',
    testing: 'Basic vocabulary precision expected at any experience level, but still worth confirming.',
    answer: 'A pseudo-class (single colon, like <code>:hover</code>, <code>:nth-child</code>) targets an element in a particular state or position, without creating new content. A pseudo-element (double colon, like <code>::before</code>, <code>::after</code>) generates a virtual child element you can style, commonly used for decorative content, icons, or clearable layout tricks.',
  },
  {
    q: 'How do CSS transitions differ from CSS animations?',
    testing: 'When to reach for each tool.',
    answer: 'A transition interpolates between two states — it needs a trigger, like a hover or a class toggle, and it only runs once per trigger. An animation uses <code>@keyframes</code> to define multiple steps and can run automatically, loop, and have more complex timing without needing an external state change. I use transitions for simple state changes like a hover effect, and animations for anything that needs to play on its own, like a loading spinner.',
  },
  {
    q: 'What is the difference between <code>transform</code> and changing <code>top</code>/<code>left</code> for animating position?',
    testing: 'Performance-aware CSS, connects to the performance section.',
    answer: 'Changing <code>top</code>/<code>left</code> triggers layout recalculation because the browser has to figure out how that affects every other element around it, then paint, then composite — the full pipeline. <code>transform: translate()</code> (and <code>opacity</code>) can usually be handled entirely on the compositor thread, skipping layout and paint, which is why it animates much more smoothly, especially on lower-end devices.',
    code: `/* Prefer this for animated position changes */\n.card { transition: transform .2s ease; }\n.card:hover { transform: translateY(-4px); }`,
  },
  {
    q: 'What does <code>object-fit</code> do and when would you use it?',
    testing: 'Practical image layout knowledge.',
    answer: '<code>object-fit</code> controls how an image or video fills its box when the box\'s aspect ratio doesn\'t match the media\'s natural aspect ratio. <code>cover</code> fills the box and crops overflow (good for thumbnails/cards), <code>contain</code> fits the whole media inside without cropping (good for logos), and <code>fill</code> stretches it to match exactly (usually distorts the image, rarely what you want).',
    code: `.thumbnail img { width: 100%; height: 200px; object-fit: cover; }`,
  },
  {
    q: 'What is the difference between <code>overflow: hidden</code>, <code>scroll</code> and <code>auto</code>?',
    testing: 'Basic but relevant for layout bugs.',
    answer: '<code>hidden</code> clips overflowing content with no way to access it through scrolling. <code>scroll</code> always shows scrollbars, even if content fits. <code>auto</code> only shows scrollbars when the content actually overflows, which is what I default to for most scrollable containers since it avoids showing unnecessary UI.',
  },
  {
    q: 'What is BEM and why would a team adopt it?',
    testing: 'CSS architecture at scale, relevant for team collaboration.',
    answer: 'BEM (Block, Element, Modifier) is a naming convention — <code>.block__element--modifier</code> — that keeps selectors flat and makes ownership of a class obvious just from its name. It solves the "two developers stepping on each other\'s CSS" problem because class names are scoped to a specific component by convention instead of by accident, and it avoids the need for deep nesting or high-specificity overrides.',
    code: `.card { }\n.card__title { }\n.card--featured { }`,
  },
  {
    q: 'What are SCSS mixins and when would you use one instead of a plain CSS class?',
    testing: 'Judgment on reusable style abstractions.',
    answer: 'A mixin is a reusable block of styles that can take parameters, injected at compile time wherever it\'s included. I use a mixin when the same pattern needs slightly different values in different places — like a button variant that needs different colors but identical padding/radius/transition logic — versus a plain utility class when the values never change.',
    code: `@mixin button-variant($bg, $color) {\n  background: $bg;\n  color: $color;\n  padding: 10px 20px;\n  border-radius: 8px;\n}\n.btn-primary { @include button-variant(#4f46e5, #fff); }`,
  },
  {
    q: 'How would you structure a large SCSS codebase for maintainability?',
    testing: 'Senior-level architecture thinking, directly related to the "restructure a messy SCSS bundle" scenario.',
    answer: 'I organize by purpose, not by page: an abstracts folder for variables/mixins/functions (no actual CSS output), a base folder for resets and global element styles, a components folder with one partial per component, and a single entry file that imports everything in the right cascade order. Each partial should be independently understandable without needing to trace five levels of nested imports.',
  },
  {
    q: 'When would you choose Tailwind over hand-written SCSS, and when would you choose SCSS instead?',
    testing: 'Judgment call rather than loyalty to one tool.',
    answer: 'Tailwind is great for speed and consistency — a constrained design system expressed as utilities means less time naming things and less unused CSS shipped, since it only generates what\'s used. I reach for SCSS (or plain CSS with variables) when the design has a lot of truly unique, complex components where utility classes would become long and hard to read, or when the team strongly prefers separating markup from presentation. In practice, on a Vue/Nuxt project I often use both — Tailwind for layout and spacing, SCSS modules for a few highly custom components.',
  },
];

/* ========================================================================
   JavaScript
   ======================================================================== */
const javascriptQuestions = [
  {
    q: 'What is the difference between <code>==</code> and <code>===</code>, and which should you use?',
    testing: 'Understanding type coercion and defaulting to predictable comparisons.',
    answer: `<code>==</code> compares after type coercion, so <code>'0' == 0</code> is true and <code>null == undefined</code> is true. <code>===</code> compares value and type without coercion. Use strict equality by default because the coercion rules are hard to remember and cause subtle bugs. A deliberate use of <code>== null</code> to check for both null and undefined is a common, accepted exception, but it should be a conscious choice. Use <code>Object.is</code> when you need to distinguish NaN or negative zero.`,
    mistake: 'Relying on loose equality for conditions and being surprised by results such as an empty array equal to false.',
  },
  {
    q: 'Explain how <code>this</code> is determined in JavaScript, including arrow functions.',
    testing: 'A core concept that interviewers use to probe depth.',
    answer: `For regular functions, <code>this</code> depends on how the function is called: as a method it is the object before the dot, with <code>call</code>, <code>apply</code> or <code>bind</code> it is the value you pass, with <code>new</code> it is the new instance, and in a plain call it is undefined in strict mode. Arrow functions do not have their own <code>this</code>; they capture it from the surrounding scope where they were defined, so it cannot be changed by call or bind. That makes arrows convenient for callbacks inside methods, but they are not suitable as object methods that need their own receiver or as constructors.`,
    code: `const user = {\n  name: 'Ava',\n  regular() { return this.name; },\n};\nconst detached = user.regular;\nuser.regular(); // 'Ava'\ndetached(); // this is undefined in strict mode, so reading name throws`,
    mistake: 'Passing a method as a callback and losing its receiver, or using an arrow function as an object method and expecting this to be the object.',
  },
  {
    q: 'What is the difference between <code>var</code>, <code>let</code> and <code>const</code>?',
    testing: 'Scope and hoisting fundamentals, usually a warm-up question.',
    answer: '<code>var</code> is function-scoped and hoisted with an initial value of <code>undefined</code>, which is why it can be read before its declaration line without throwing. <code>let</code> and <code>const</code> are block-scoped and hoisted into a "temporal dead zone" — they exist but can\'t be accessed before the declaration, which throws a <code>ReferenceError</code> instead of silently returning undefined. <code>const</code> additionally prevents reassigning the binding, though if the value is an object or array, its contents can still be mutated.',
    code: `console.log(a); // undefined\nvar a = 1;\n\nconsole.log(b); // ReferenceError\nlet b = 2;`,
    mistake: 'Assuming const makes an object immutable — it only locks the variable binding, not the object\'s contents.',
  },
  {
    q: 'Explain closures with a practical example.',
    testing: 'Whether you can connect the concept to real code you\'d actually write, not just the textbook definition.',
    answer: 'A closure is a function that remembers the variables from the scope it was created in, even after that outer function has finished running. I use this constantly for things like creating private state, or for factory functions that configure a behavior once and reuse it.',
    code: `function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst counter = createCounter();\ncounter(); // 1\ncounter(); // 2`,
    example: 'Debounce and throttle utilities are closures in practice — the timer ID or last-call timestamp lives in the closure scope between calls.',
  },
  {
    q: 'Explain <code>this</code> in JavaScript, and how <code>call</code>, <code>apply</code> and <code>bind</code> change it.',
    testing: 'A classic but still important fundamental, especially for debugging "this" bugs in event handlers.',
    answer: '<code>this</code> is determined by how a function is called, not where it\'s defined — except for arrow functions, which capture <code>this</code> lexically from their enclosing scope at creation time. <code>call</code> and <code>apply</code> invoke a function immediately with a specific <code>this</code> (apply takes arguments as an array, call takes them individually). <code>bind</code> returns a new function permanently bound to a given <code>this</code>, which I use when passing a method as a callback and needing it to keep its original context.',
    code: `// ES module context (strict mode)\nconst obj = { name: 'Alex', greet() { console.log(this.name); } };\nconst fn = obj.greet;\ntry { fn(); } catch (error) { console.log(error.name); } // TypeError: this is undefined\nconst bound = obj.greet.bind(obj);\nbound(); // 'Alex'`,
    mistake: 'Passing an object method directly as an event handler or callback (<code>el.addEventListener(\'click\', obj.greet)</code>) and being surprised <code>this</code> is wrong inside it.',
  },
  {
    q: 'Explain prototypal inheritance in JavaScript.',
    testing: 'Understanding what classes are syntactic sugar over.',
    answer: 'Every object has an internal link to another object, its prototype, and property/method lookups walk up this prototype chain if they\'re not found directly on the object. Class syntax is syntactic sugar over this same mechanism — <code>class Dog extends Animal</code> just wires up the prototype chain for you. Understanding this matters when debugging why a method is or isn\'t found, or why mutating a shared prototype affects every instance.',
    code: `function Animal(name) { this.name = name; }\nAnimal.prototype.speak = function () { return \`\${this.name} makes a sound\`; };\nconst dog = new Animal('Rex');\ndog.speak(); // found via the prototype chain`,
  },
  {
    q: 'What are higher-order functions, and why are they useful?',
    testing: 'Functional programming fluency used daily with array methods.',
    answer: 'A higher-order function either accepts a function as an argument or returns one. <code>map</code>, <code>filter</code>, <code>reduce</code> are the most common ones I use daily — they let you express "what" transformation you want without writing the "how" of the loop yourself, which makes the code more declarative and easier to read.',
    code: `const total = items.filter(i => i.active).reduce((sum, i) => sum + i.price, 0);`,
  },
  {
    q: 'What is currying, and when have you actually used it?',
    testing: 'Whether this is a real tool in your toolbox or just memorized trivia.',
    answer: 'Currying transforms a function that takes multiple arguments into a sequence of functions that each take one argument. I\'ve used it for creating configured, reusable versions of a function — like a logger curried with a module name, so every call site doesn\'t have to repeat it.',
    code: `const log = (scope) => (message) => console.log(\`[\${scope}] \${message}\`);\nconst authLog = log('auth');\nauthLog('user signed in');`,
  },
  {
    q: 'Explain the difference between <code>Promise.all</code>, <code>Promise.allSettled</code>, <code>Promise.race</code> and <code>Promise.any</code>.',
    testing: 'Real async orchestration knowledge used in dashboards fetching multiple resources.',
    answer: '<code>Promise.all</code> resolves when every promise resolves, but rejects immediately if any one of them rejects — good when all results are required together. <code>Promise.allSettled</code> waits for every promise to finish regardless of success or failure and gives you the status of each — good when partial failure is acceptable, like a dashboard with independent widgets. <code>Promise.race</code> resolves or rejects as soon as the first promise settles, useful for timeouts. <code>Promise.any</code> resolves as soon as the first one succeeds, ignoring earlier rejections, and only rejects if all of them fail.',
    code: `const results = await Promise.allSettled([fetchUser(), fetchOrders(), fetchNotifications()]);\n// each widget can render independently even if one request failed`,
  },
  {
    q: 'Explain the JavaScript event loop in a way suitable for a senior frontend interview.',
    testing: 'The single most common "explain this deeply" JS question at senior level.',
    answer: `JavaScript runs on a single thread with a call stack, but it can still handle async work through the event loop. When the call stack is empty, the event loop checks the microtask queue first (promise callbacks, <code>queueMicrotask</code>) and drains it completely — including any new microtasks added while draining — before moving on to a single macrotask (like a <code>setTimeout</code> callback or a UI event). Then it repeats: drain all microtasks, run one macrotask, drain microtasks again, and so on.

This is why promise callbacks consistently run before a <code>setTimeout(fn, 0)</code>, even though both are "async" — microtasks always get priority over the next macrotask.`,
    code: `console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n// Output: A, D, C, B`,
    followupQ: 'Where does <code>queueMicrotask</code> fit relative to a Promise <code>.then()</code>?',
    followupA: 'They both go into the same microtask queue and run in the order they were scheduled, so a <code>queueMicrotask</code> call and a <code>.then()</code> callback are processed with equal priority relative to each other — what matters is which one was queued first.',
  },
  {
    q: 'What is event delegation and why would you use it over attaching a listener to every item?',
    testing: 'Performance-conscious DOM event handling, especially for dynamic lists.',
    answer: 'Instead of attaching a click listener to every row in a list, I attach one listener to a shared ancestor and use event bubbling to figure out which child was actually clicked. This is both more memory-efficient for large lists and automatically covers items added to the DOM later, without needing to re-bind listeners.',
    code: `list.addEventListener('click', (e) => {\n  const row = e.target.closest('[data-id]');\n  if (row) selectItem(row.dataset.id);\n});`,
  },
  {
    q: 'What is the difference between event bubbling and event capturing?',
    testing: 'Follow-on to delegation, confirms the full event flow model.',
    answer: 'The DOM event flow has three phases: capturing (from the window down to the target), the target phase, and bubbling (from the target back up to the window). By default, <code>addEventListener</code> listens during the bubbling phase; passing <code>{ capture: true }</code> makes it listen during the capturing phase instead, which is occasionally useful for intercepting an event before a child has a chance to stop it.',
  },
  {
    q: 'How would you implement debounce and throttle, and when would you use each?',
    testing: 'One of the most common senior-level practical coding asks.',
    answer: 'Debounce delays execution until a pause in events — good for a search input where you only want to fire the API call after the user stops typing. Throttle guarantees execution at most once per time window regardless of how many events fire — good for a scroll handler where you want regular updates but not on every single pixel.',
    code: `function debounce(fn, wait) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), wait);\n  };\n}\n\nfunction throttle(fn, limit) {\n  let inThrottle = false;\n  return (...args) => {\n    if (inThrottle) return;\n    fn(...args);\n    inThrottle = true;\n    setTimeout(() => (inThrottle = false), limit);\n  };\n}`,
  },
  {
    q: 'What is memoization, and how would you implement a simple memoize function?',
    testing: 'Performance optimization technique, commonly combined with a coding exercise.',
    answer: 'Memoization caches the result of a function call keyed by its arguments, so repeated calls with the same input return the cached result instead of redoing the work. It\'s most useful for pure, expensive computations — I\'d avoid it for functions with side effects or that depend on external state changing.',
    code: `function memoize(fn) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
    mistake: 'Memoizing a function whose output depends on something other than its arguments (like the current time or a mutable external object), which produces stale, incorrect results.',
  },
  {
    q: 'What is the difference between <code>call</code> and spreading arguments with the spread operator when calling a function?',
    testing: 'Distinguishes rest/spread usage from this-binding utilities.',
    answer: '<code>call</code> is about controlling <code>this</code> plus passing arguments individually. Spread (<code>fn(...args)</code>) is purely about expanding an array into individual arguments — it doesn\'t touch <code>this</code> at all. They solve different problems and are often used together: <code>fn.apply(thisArg, args)</code> is effectively <code>fn.call(thisArg, ...args)</code>.',
  },
  {
    q: 'What are pure functions, and why do they matter for a Vue/React-style reactive UI?',
    testing: 'Connects a core JS concept to practical framework behavior.',
    answer: 'A pure function always returns the same output for the same input and has no side effects. In a reactive UI framework, computed values and render functions should be pure — if a computed property has a side effect or depends on something outside its tracked dependencies, you get subtle bugs where the UI doesn\'t update when it should, or updates when it shouldn\'t.',
  },
  {
    q: 'What is the difference between shallow copy and deep copy, and how would you deep clone an object?',
    testing: 'Practical state management knowledge, relevant to avoiding accidental shared references.',
    answer: 'A shallow copy duplicates the top-level structure but nested objects/arrays still point to the same references, so mutating a nested value affects both copies. A deep copy recursively duplicates everything. For simple JSON-safe data I use <code>structuredClone(obj)</code> which is now broadly supported; for older environments, <code>JSON.parse(JSON.stringify(obj))</code> works but silently drops functions, <code>undefined</code>, and loses special types like <code>Date</code>.',
    code: `const copy = structuredClone(original); // modern, handles most types correctly`,
  },
  {
    q: 'What is strict mode and what problems does it help catch?',
    testing: 'Shows awareness of JS footguns strict mode protects against.',
    answer: '<code>\'use strict\'</code> turns silent mistakes into thrown errors — assigning to an undeclared variable, duplicating a parameter name, or using a reserved word as an identifier. ES modules and class bodies are strict mode by default, which is one more reason modern codebases rarely need to declare it explicitly anymore.',
  },
  {
    q: 'What are JavaScript modules, and what is the difference between named and default exports?',
    testing: 'Basic but relevant to how a Vue/Nuxt project is organized.',
    answer: 'Modules let you split code into files with explicit imports/exports instead of relying on global scope. A default export is the one "main" thing a file exports, imported without braces and can be renamed freely on import. Named exports can have multiple per file, must be imported with the same name (or aliased explicitly), and are generally easier to tree-shake since bundlers can statically see exactly what\'s being used.',
  },
  {
    q: 'What is the difference between synchronous and asynchronous error handling, and how do you handle errors in async/await code?',
    testing: 'Practical error-handling patterns for API calls.',
    answer: 'With promises, unhandled rejections silently fail unless you attach a <code>.catch</code>. With async/await, I wrap the awaited call in <code>try/catch</code> so the error surfaces at the point it happened, which keeps stack traces clearer than chained <code>.catch</code> calls scattered across a promise chain.',
    code: `async function loadUser(id) {\n  try {\n    const res = await api.get(\`/users/\${id}\`);\n    return res.data;\n  } catch (err) {\n    logError(err);\n    throw new Error('Failed to load user');\n  }\n}`,
  },
  {
    q: 'What is an IIFE and why would you still use one today?',
    testing: 'Historical knowledge with a modern-relevance check.',
    answer: 'An Immediately Invoked Function Expression runs as soon as it\'s defined, creating an isolated scope. It used to be the standard way to avoid polluting global scope before modules existed. Today, modules handle that automatically, so I rarely need an IIFE for scoping — but I still see it used for one-off async setup code at the top of a script, or inside library bundles to avoid leaking internals.',
  },
  {
    q: 'What is the difference between <code>Object.freeze</code> and <code>const</code>?',
    testing: 'Immutability nuance, often confused.',
    answer: '<code>const</code> only prevents reassigning the variable itself. <code>Object.freeze</code> actually prevents adding, removing or changing properties on the object (shallowly — nested objects are still mutable unless frozen separately). I use freeze for things like shared configuration constants that should never be accidentally mutated at runtime.',
  },
  {
    q: 'What is a WeakMap and when would you use one over a Map?',
    testing: 'Lesser-known but relevant for memory-conscious code, like caching DOM-keyed data.',
    answer: 'A WeakMap holds its keys weakly, meaning if the only reference to an object is as a WeakMap key, the garbage collector can still clean it up. I\'d use it to associate metadata with a DOM node or object without creating a memory leak that outlives the element itself, which a regular Map would otherwise cause.',
  },
  {
    q: 'What is the difference between <code>==</code> and <code>===</code>, and when, if ever, would you use <code>==</code>?',
    testing: 'Coercion understanding.',
    answer: '<code>===</code> compares value and type with no coercion. <code>==</code> coerces types before comparing, which produces surprising results like <code>\'\' == 0</code> being true. I default to <code>===</code> everywhere. The one common exception is checking for both <code>null</code> and <code>undefined</code> at once with <code>value == null</code>, which is a widely accepted, intentional idiom.',
  },
  {
    q: 'What are generators, and have you had a practical use for them?',
    testing: 'Checks breadth beyond the daily-driver features.',
    answer: 'A generator function (<code>function*</code>) can pause and resume execution, yielding multiple values over time instead of returning once. I\'ve used them for lazily processing large or infinite sequences — like paginating through an API without loading everything into memory at once — though in day-to-day frontend work, I reach for them far less often than promises or async/await.',
  },
  {
    q: 'What are the differences between <code>Array.map</code>, <code>forEach</code> and <code>reduce</code>, and how do you decide which to use?',
    testing: 'Day-to-day code quality judgment.',
    answer: '<code>forEach</code> is for side effects, with no return value. <code>map</code> transforms each item into a new array of the same length — I only use it when I\'m going to use the resulting array. <code>reduce</code> is for folding a list down into a single value (a sum, an object, a grouped structure). Using map and throwing away the result, or using forEach to try to build a new array by pushing, are both signs the wrong tool was picked.',
  },
];

/* ========================================================================
   JS Output Questions
   ======================================================================== */
const jsOutputQuestions = [
  {
    code: `console.log([] + []);\nconsole.log([] + {});\nconsole.log(1 + '2' - 1);`,
    output: '(empty string), [object Object], 11',
    explanation: 'The plus operator converts both arrays and objects to strings, so an empty array becomes an empty string and an object becomes <code>[object Object]</code>. In the last line <code>1 + \'2\'</code> concatenates to the string <code>\'12\'</code>, and subtraction then coerces it back to a number, giving 11.',
  },
  {
    code: `const o = { a: 1, get b() { return this.a + 1; } };\nconst { b } = o;\no.a = 5;\nconsole.log(b, o.b);`,
    output: '2, 6',
    explanation: 'Destructuring reads the getter once and stores the resulting value 2, so later changes to <code>o.a</code> do not affect it. Reading <code>o.b</code> again calls the getter with the current value of <code>a</code>, giving 6.',
  },
  {
    code: `async function f() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\nf();\nconsole.log(3);`,
    output: '1, 3, 2',
    explanation: 'The async function runs synchronously until its first await, logging 1. The await schedules the rest as a microtask, so the caller continues and logs 3, then 2 runs once the call stack is empty.',
  },
  {
    code: `console.log(0.1 + 0.2 === 0.3);\nconsole.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);`,
    output: 'false, true',
    explanation: 'Binary floating point cannot represent 0.1 and 0.2 exactly, so their sum is slightly above 0.3. Compare with a small tolerance such as <code>Number.EPSILON</code>, or work in integer units like cents for money.',
  },
  {
    code: `console.log([10, 9, 1].sort());\nconsole.log([1, 2, 3].map(parseInt));`,
    output: '[1, 10, 9], [1, NaN, NaN]',
    explanation: 'The default sort converts items to strings and compares them lexicographically, so 10 comes before 9. <code>map</code> passes the index as a second argument, so <code>parseInt</code> receives radix 0, 1 and 2 for the three items; radix 1 is invalid and the digit 3 is not valid in base 2, so they produce NaN.',
  },
  {
    code: `const fns = [];\nfor (let i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns.map((f) => f()));\nconsole.log(Boolean('0'), Boolean(''), Boolean([]));`,
    output: '[0, 1, 2], true, false, true',
    explanation: '<code>let</code> creates a new binding for each loop iteration, so each closure keeps its own value. In the second line a non-empty string, even <code>\'0\'</code>, and an empty array are truthy, while the empty string is falsy.',
  },
  {
    code: `console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");`,
    output: 'A, D, C, B',
    explanation: 'Synchronous code runs first (A, D). Then microtasks (the resolved promise) drain before any macrotask, so C logs before B even though the timeout was scheduled first.',
  },
  {
    code: `console.log(1);\nsetTimeout(() => console.log(2), 0);\nnew Promise((resolve) => {\n  console.log(3);\n  resolve();\n}).then(() => console.log(4));\nconsole.log(5);`,
    output: '1, 3, 5, 4, 2',
    explanation: 'The Promise executor runs synchronously (logs 3 immediately), the rest of the sync code finishes (5), then the microtask queue runs (4), then the macrotask (2).',
  },
  {
    code: `function foo() {\n  console.log(a);\n  var a = 10;\n}\nfoo();`,
    output: 'undefined',
    explanation: '<code>var</code> declarations are hoisted to the top of the function with an initial value of undefined, so <code>a</code> exists but hasn\'t been assigned yet at the point it\'s logged.',
  },
  {
    code: `console.log(typeof a);\nlet a = 5;`,
    output: 'ReferenceError: Cannot access \'a\' before initialization',
    explanation: '<code>let</code> is hoisted but lives in the temporal dead zone until its declaration line, so accessing it earlier throws, unlike <code>var</code> which would just be undefined.',
  },
  {
    code: `const arr = [1, 2, 3];\narr.forEach((n, i) => {\n  setTimeout(() => console.log(n), 0);\n});`,
    output: '1, 2, 3',
    explanation: 'Each arrow function callback creates its own closure over the block-scoped <code>n</code> from that specific iteration, so each timeout logs the value captured at that iteration — this is the classic case where switching from <code>var</code> to <code>let</code>/block scope fixes a once-common bug.',
  },
  {
    code: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}`,
    output: '3, 3, 3',
    explanation: '<code>var</code> is function-scoped, so all three callbacks close over the same single <code>i</code>, which has already reached 3 by the time any timeout fires. Replacing <code>var</code> with <code>let</code> would log 0, 1, 2 instead, since let creates a new binding per loop iteration.',
  },
  {
    code: `console.log([] + []);\nconsole.log([] + {});\nconsole.log(1 + '1');\nconsole.log('5' - 2);`,
    output: '"" , "[object Object]", "11", 3',
    explanation: 'The <code>+</code> operator coerces operands to strings when either side is a string or when both are objects/arrays (converted via toString). <code>-</code> only has a numeric meaning, so it coerces the string to a number instead.',
  },
  {
    code: `function makeGreeter() {\n  return {\n    name: 'A',\n    greet: () => console.log(this.name),\n  };\n}\nconst obj = makeGreeter.call({ name: 'Outer' });\nobj.greet();`,
    output: 'Outer',
    explanation: 'The arrow captures <code>this</code> from the explicit enclosing call to <code>makeGreeter</code>, whose receiver is { name: "Outer" }. Calling it as <code>obj.greet()</code> cannot rebind that receiver. The output is independent of browser-global, CommonJS or ES-module top-level this behavior.',
  },
  {
    code: `async function getValue() {\n  return 10;\n}\nconsole.log(getValue());`,
    output: 'Promise { 10 }',
    explanation: 'An async function always returns a Promise, even if the body just returns a plain value — the value gets wrapped automatically. You\'d need <code>.then()</code> or <code>await</code> to get the actual 10.',
  },
  {
    code: `async function run() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\nrun();\nconsole.log(3);`,
    output: '1, 3, 2',
    explanation: 'Code before the first <code>await</code> runs synchronously (logs 1). The <code>await</code> pauses the function and schedules the rest as a microtask, so the synchronous caller continues (logs 3) before the microtask resumes and logs 2.',
  },
  {
    code: `const a = { value: 1 };\nconst b = a;\nb.value = 2;\nconsole.log(a.value);`,
    output: '2',
    explanation: 'Objects are assigned by reference, so <code>b</code> and <code>a</code> point to the same object in memory — mutating through one is visible through the other.',
  },
  {
    code: `function Person(name) {\n  this.name = name;\n}\nconst p = Person('Alex');\nconsole.log(p);\nconsole.log(window.name);`,
    output: 'undefined, "Alex" (in non-strict mode, in a browser)',
    explanation: 'Calling a constructor function without <code>new</code> means <code>this</code> defaults to the global object (in non-strict mode), so <code>name</code> ends up on <code>window</code> instead of a new object, and the function returns nothing explicitly.',
  },
  {
    code: `console.log(0.1 + 0.2 === 0.3);`,
    output: 'false',
    explanation: 'Floating point numbers are stored in binary, and 0.1 and 0.2 can\'t be represented exactly, so their sum is something like 0.30000000000000004. Comparing floats for equality should use a small epsilon tolerance instead of <code>===</code>.',
  },
  {
    code: `let x = 10;\nfunction outer() {\n  console.log(x);\n  let x = 20;\n}\nouter();`,
    output: 'ReferenceError: Cannot access \'x\' before initialization',
    explanation: 'The inner <code>let x</code> shadows the outer <code>x</code> for the whole function scope, including before its own declaration line — this is the temporal dead zone applying even though an outer variable with the same name exists.',
  },
  {
    code: `console.log(typeof null);\nconsole.log(typeof undefined);\nconsole.log(typeof NaN);`,
    output: '"object", "undefined", "number"',
    explanation: '<code>typeof null</code> returning "object" is a long-standing JavaScript quirk/bug kept for backwards compatibility. NaN is still of type number — it represents an invalid number, not an absence of a value.',
  },
];

/* ========================================================================
   TypeScript
   ======================================================================== */
const typescriptQuestions = [
  {
    q: 'What is the difference between <code>type</code> and <code>interface</code> in TypeScript?',
    testing: 'Practical knowledge of two overlapping features.',
    answer: `Both describe object shapes and can be extended. Interfaces support declaration merging, where several declarations with the same name combine, and are commonly used for public object contracts and class implementation. Type aliases can name any type, including unions, intersections, tuples and mapped or conditional types, which interfaces cannot express. In practice, use whichever the team standard prefers for object shapes and use type aliases when you need a union or a computed type. Consistency matters more than the choice.`,
    mistake: 'Believing one is always faster or the only correct choice, and mixing styles randomly across a codebase.',
  },
  {
    q: 'What are utility types such as <code>Partial</code>, <code>Pick</code>, <code>Omit</code> and <code>Record</code>, and when do you use them?',
    testing: 'Deriving types instead of duplicating them.',
    answer: `Utility types transform existing types so they stay in sync with their source. <code>Partial&lt;T&gt;</code> makes every property optional, which suits update payloads. <code>Pick&lt;T, K&gt;</code> selects a subset of properties and <code>Omit&lt;T, K&gt;</code> removes some. <code>Record&lt;K, V&gt;</code> describes an object with keys of one type and values of another. Deriving types this way avoids copied definitions that drift apart, but deeply layered utility types can become hard to read, so give important results a clear name.`,
    mistake: 'Copying an interface and removing fields by hand, so changes to the original no longer flow to the copy.',
  },
  {
    q: 'What is the difference between <code>type</code> and <code>interface</code>, and when do you choose one over the other?',
    testing: 'One of the most common TS interview questions — tests if you have an actual opinion, not just the textbook differences.',
    answer: 'Interfaces can be extended and merged across multiple declarations, which makes them a good fit for public object/component contracts that other code might augment. Type aliases can represent unions, intersections, tuples and primitives, which interfaces can\'t. In practice, my default is interface for object shapes like props or API models, and type for anything that needs union/intersection logic — I don\'t treat it as a strict rule, just a habit that keeps the codebase consistent.',
    code: `interface User { id: number; name: string; }\ntype Status = 'idle' | 'loading' | 'error';`,
  },
  {
    q: 'Explain union and intersection types with a practical example.',
    testing: 'Core type composition fluency.',
    answer: 'A union (<code>A | B</code>) means a value could be either type — useful for representing one of several known states. An intersection (<code>A & B</code>) means a value must satisfy both types at once — useful for combining smaller shapes into a larger one, like merging base props with variant-specific props.',
    code: `type BaseProps = { id: string };\ntype ButtonProps = BaseProps & { label: string; onClick: () => void };\ntype Result = { status: 'ok'; data: User } | { status: 'error'; message: string };`,
  },
  {
    q: 'What are generics, and why are they better than using <code>any</code>?',
    testing: 'Generics are the single biggest gap for developers transitioning from "any everywhere" TypeScript.',
    answer: 'Generics preserve relationships between input and output types without opting out of checking with <code>any</code>. However, a generic <code>fetchJson&lt;T&gt;()</code> that only asserts the response type does not validate JSON: the caller chooses T and the compiler trusts that claim. The example below is explicitly an unchecked assertion. For untrusted responses, read unknown and use a runtime decoder or schema that validates the complete required shape before returning a User.',
    code: `interface User { id: number; name: string; }\nasync function fetchJson<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  const raw: unknown = await res.json();\n  return raw as T; // assertion only; no runtime validation\n}\nconst user = await fetchJson<User>('/api/user'); // trusted only if the boundary validates it`,
  },
  {
    q: 'What are the most useful TypeScript utility types — <code>Partial</code>, <code>Pick</code>, <code>Omit</code>, <code>Required</code>, <code>Readonly</code>, <code>Record</code> — and when would you reach for each?',
    testing: 'Practical, everyday TS usage rather than theory.',
    answer: '<code>Partial<T></code> makes every property optional — I use it for update/patch payloads where only some fields change. <code>Pick<T, K></code> selects a subset of properties — good for a lightweight list-view type derived from a full model. <code>Omit<T, K></code> removes properties — good for a "create" payload that excludes a server-generated id. <code>Required<T></code> is the opposite of Partial. <code>Readonly<T></code> prevents reassignment of properties, useful for props coming into a component. <code>Record<K, V></code> builds an object type with specific keys, useful for lookup maps.',
    code: `type UpdateUser = Partial<Pick<User, 'name' | 'email'>>;\ntype CreateUser = Omit<User, 'id'>;\ntype StatusColors = Record<Status, string>;`,
  },
  {
    q: 'What is the difference between <code>unknown</code> and <code>any</code>?',
    testing: 'A classic "do you actually care about type safety" question.',
    answer: '<code>any</code> opts a value entirely out of type checking — you can do anything with it, which defeats the purpose of using TypeScript at all. <code>unknown</code> also accepts any value, but forces you to narrow its type with a check or assertion before you can use it, so you get safety back without losing flexibility at the boundary. I use <code>unknown</code> for things like a catch block\'s error, or data from an external source before it\'s validated.',
    code: `interface User { id: number; name: string; }\nfunction isUser(value: unknown): value is User {\n  if (typeof value !== 'object' || value === null) return false;\n  const record = value as Record<string, unknown>;\n  return Object.prototype.hasOwnProperty.call(record, 'id') &&\n    Object.prototype.hasOwnProperty.call(record, 'name') &&\n    typeof record.id === 'number' && Number.isFinite(record.id) &&\n    typeof record.name === 'string';\n}`,
  },
  {
    q: 'What is a type guard, and how would you write a custom one?',
    testing: 'Related to the unknown/any question, and to safely typing API responses.',
    answer: 'A type guard is a function that narrows a value\'s type based on a runtime check, using the <code>value is Type</code> return annotation so TypeScript applies the narrowing wherever the guard is used in a conditional.',
    code: `function isErrorResponse(res: ApiResponse): res is ErrorResponse {\n  return res.status === 'error';\n}\nif (isErrorResponse(response)) {\n  console.log(response.message); // TS knows this branch has .message\n}`,
  },
  {
    q: 'What are conditional types and mapped types? Give a simple example of each.',
    testing: 'More advanced type-level programming, common at senior level.',
    answer: 'A conditional type picks between two types based on a condition, similar to a ternary at the type level. A mapped type transforms the properties of an existing type, often used to build custom utility types beyond the built-in ones.',
    code: `type IsString<T> = T extends string ? true : false;\n\ntype Nullable<T> = { [K in keyof T]: T[K] | null };`,
  },
  {
    q: 'What is the difference between <code>keyof</code> and <code>typeof</code> in TypeScript?',
    testing: 'Commonly confused operators.',
    answer: '<code>typeof</code> (in a type position) gets the TypeScript type of a value, useful for deriving a type from a runtime constant instead of duplicating it. <code>keyof</code> gets a union of the property names of a type, useful for writing generic functions that safely access a property by name.',
    code: `const config = { theme: 'dark', lang: 'en' };\ntype Config = typeof config;\ntype ConfigKey = keyof Config; // 'theme' | 'lang'`,
  },
  {
    q: 'An API returns different response shapes depending on success or failure. How would you type it safely?',
    testing: 'Directly matches the scenario asked in the spec — real API typing judgment.',
    answer: 'I model this as a discriminated union with a shared "tag" property, usually <code>status</code> or <code>success</code>, so TypeScript can narrow the type automatically once that field is checked, without needing manual casts.',
    code: `type ApiResult<T> =\n  | { success: true; data: T }\n  | { success: false; error: string };\n\nfunction handle<T>(result: ApiResult<T>) {\n  if (result.success) {\n    return result.data; // narrowed automatically\n  }\n  throw new Error(result.error);\n}`,
  },
  {
    q: 'Your project uses <code>any</code> everywhere. How would you gradually introduce stricter TypeScript?',
    testing: 'Pragmatic migration judgment, relevant to real legacy codebases.',
    answer: 'I wouldn\'t try to fix it all at once — that usually stalls and nobody finishes it. I\'d start by enabling <code>noImplicitAny</code> only (not full strict mode) so new code is held to a higher bar without having to retroactively fix everything. Then I\'d type the "edges" first — API responses and shared utility functions — since those give the most leverage, as their types flow into everywhere that consumes them. I\'d track remaining <code>any</code> usage with a lint rule set to warn, and tighten it to error once the count gets low enough to be realistic.',
    mistake: 'Flipping on full <code>strict: true</code> on a large legacy codebase in one PR, which produces hundreds of errors, blocks everyone else\'s work, and usually gets reverted.',
  },
  {
    q: 'How would you design a reusable generic component or function, like a typed API service?',
    testing: 'Senior-level generic design, not just syntax recall.',
    answer: 'I design the generic around the one thing that actually varies between usages — usually the response/data shape — and keep everything else (method, error handling, base URL) fixed and non-generic. A generic API client, for example, is generic over the response type per call, not over the whole client. In this minimal example, the cast to Promise&lt;T&gt; is an unchecked assertion, not runtime validation; a production boundary should accept a decoder from unknown to T and validate required fields.',
    code: `class ApiService {\n  constructor(private baseUrl: string) {}\n\n  async get<T>(path: string): Promise<T> {\n    const res = await fetch(\`\${this.baseUrl}\${path}\`);\n    if (!res.ok) throw new Error(\`Request failed: \${res.status}\`);\n    return res.json() as Promise<T>;\n  }\n}\nconst api = new ApiService('/api');\nconst user = await api.get<User>('/user');`,
  },
  {
    q: 'What is the difference between <code>never</code> and <code>void</code>?',
    testing: 'Precise type vocabulary, often tripped up.',
    answer: '<code>void</code> means a function doesn\'t return a meaningful value (it might still return <code>undefined</code>). <code>never</code> means the function never returns at all — it always throws, or loops forever. I use <code>never</code> in exhaustiveness checks, so TypeScript errors if a new union member is added to a switch statement without handling it.',
    code: `function assertUnreachable(x: never): never {\n  throw new Error('Unhandled case: ' + x);\n}`,
  },
  {
    q: 'What are generic constraints, and why would you add one?',
    testing: 'Prevents a generic from being too permissive.',
    answer: 'A constraint (<code>T extends SomeShape</code>) limits a generic parameter to types that satisfy a given shape, so you can safely access properties on it inside the function instead of being stuck with a completely unknown type.',
    code: `function getId<T extends { id: string }>(item: T): string {\n  return item.id;\n}`,
  },
  {
    q: 'What are TypeScript enums, and what are the trade-offs versus using a union of string literals?',
    testing: 'Shows awareness of a real, debated TypeScript pattern.',
    answer: 'Enums group named constants and compile to an actual object at runtime, which adds a small amount of output code. A union of string literals (<code>type Status = \'idle\' | \'loading\' | \'error\'</code>) has zero runtime cost and works more naturally with plain JSON data from an API. I lean toward string literal unions for most app code, and reserve enums for cases where I specifically want a namespaced, reverse-mappable set of constants.',
  },
  {
    q: 'What are declaration files (<code>.d.ts</code>), and when have you needed to write one?',
    testing: 'Real-world necessity, not everyday but important to know.',
    answer: 'A declaration file provides type information for JavaScript code that doesn\'t ship its own types — usually an older or untyped npm package. I\'ve had to write a small one to describe the shape of a third-party library\'s module so the rest of the codebase could use it with full type checking instead of falling back to <code>any</code>.',
    code: `// shims.d.ts\ndeclare module 'legacy-untyped-lib' {\n  export function doThing(value: string): number;\n}`,
  },
];

/* ========================================================================
   Vue 2
   ======================================================================== */
const vue2Questions = [
  {
    q: 'How does Vue 2 reactivity work, and what are its limitations?',
    testing: 'Knowing the Object.defineProperty model and why it matters for migration.',
    answer: `Vue 2 walks the data object when a component is created and converts each existing property into a getter and setter with <code>Object.defineProperty</code>. The getters track which watchers depend on a property and the setters notify them. Because the properties must exist at creation, adding a new property or setting an array item by index is not detected, so you use <code>Vue.set</code> or <code>this.$set</code>, and array mutation methods are patched. Vue 3 replaced this with Proxy, which removes these limitations.`,
    mistake: 'Adding a property to a reactive object after creation and expecting the view to update.',
  },
  {
    q: 'What is the difference between a computed property and a watcher in Vue 2?',
    testing: 'Choosing derived state over imperative reactions.',
    answer: `A computed property derives a value from other reactive data, is cached until its dependencies change and is used in templates like a normal property. A watcher runs a function when a value changes, which suits side effects such as calling an API or saving to storage. Prefer computed for derived values because it is declarative and cached, and use a watcher only when you must perform an action in response to a change.`,
    mistake: 'Using a watcher to copy one piece of data into another, which a computed property would express more simply and reliably.',
  },
  {
    q: 'A Vue 2 component has grown to 1000 lines. How would you refactor it?',
    testing: 'Component decomposition judgment — one of the most common real-world Vue questions.',
    answer: 'First I read through it to find natural seams — a 1000-line component is almost always several components glued together, plus some logic that doesn\'t belong in a component at all. I extract clearly reusable UI pieces (a table, a filter bar, a modal) into child components with well-defined props/events. For logic that\'s not UI — formatting, API calls, validation — I pull it into plain JS modules or, if it needs reactivity, a mixin (and I\'d flag that this is exactly the kind of thing that becomes a clean composable once the project moves to Vue 3). I do this incrementally behind the existing tests if there are any, or I add a few key tests first if there aren\'t, so I can refactor with confidence.',
    mistake: 'Trying to split the component by file size alone rather than by actual responsibility, which just creates several tightly-coupled components that all still have to change together.',
    followupQ: 'How do you decide what becomes a component versus a mixin versus a plain utility function?',
    followupA: 'If it renders something and needs its own template, it\'s a component. If it\'s shared reactive behavior without its own template — like a "sortable list" behavior reused by several components — it\'s a mixin in Vue 2. If it has no reactivity and is a pure transformation (formatting a date, validating an email), it\'s a plain function with no framework dependency at all.',
  },
  {
    q: 'A watcher is firing more often than expected. How would you investigate it?',
    testing: 'Debugging reactivity issues — directly from the spec\'s scenario list.',
    answer: 'I first check what the watcher is actually watching — if it\'s watching a whole object with <code>deep: true</code>, any nested mutation anywhere in that object triggers it, which is a very common cause of "too many" firings. I add a quick <code>console.trace()</code> inside the watcher temporarily to see the call stack causing each trigger, which usually points straight at the offending mutation. Then I either narrow the watch target to the specific property that actually matters, or switch to a computed property if the goal was really just a derived value rather than a side effect.',
    code: `// Too broad — fires on any nested change\nwatch: { form: { handler() { ... }, deep: true } }\n\n// Narrower — fires only when this field changes\ncomputed: { email() { return this.form.email; } },\nwatch: { email(val) { ... } }`,
  },
  {
    q: 'Two sibling components need to share state. What approaches can you use in Vue 2?',
    testing: 'Component communication patterns beyond parent-child props/events.',
    answer: 'For simple cases, lift the shared state up to the common parent and pass it down as props, with events bubbling changes back up. For state shared across many unrelated components, I\'d use Vuex so there\'s a single source of truth instead of threading props through several layers. For a small, localized bit of shared reactive state that doesn\'t need the full ceremony of Vuex, a simple reactive object exported from a shared JS module also works in Vue 2, though I\'d only do that for small, well-contained cases.',
  },
  {
    q: 'When would you use a computed property instead of a watcher?',
    testing: 'One of the most common Vue fundamentals questions, still relevant to confirm at senior level.',
    answer: 'Computed properties are for deriving a value from existing reactive state — they\'re cached and only recompute when a dependency changes. Watchers are for running a side effect in response to a change — an API call, a DOM manipulation, logging. If I catch myself writing a watcher just to set another piece of data to a transformed version of the watched value, that\'s a sign it should have been a computed property instead.',
  },
  {
    q: 'Why is <code>key</code> important in a <code>v-for</code> loop?',
    testing: 'Foundational but still worth confirming the "why", not just "you need a key".',
    answer: 'Vue uses the key to track which DOM node corresponds to which data item across re-renders, so it can correctly reuse, reorder or remove the exact right elements instead of guessing based on position. Without a stable key (or using the array index as a key when the list can be reordered or filtered), Vue can reuse the wrong DOM node for the wrong item, which causes bugs like an input keeping the wrong value after a list is filtered or sorted.',
    mistake: 'Using the array index as the key for a list that can be reordered, inserted into, or filtered — it works fine for a static list, but breaks silently the moment order changes.',
  },
  {
    q: 'Explain the Vue 2 instance lifecycle hooks and when you\'d use each.',
    testing: 'Lifecycle fluency, needed daily.',
    answer: '<code>created</code> runs after reactivity is set up but before the DOM is mounted — good for fetching initial data. <code>mounted</code> runs after the DOM exists — good for anything that needs to measure or manipulate the real DOM, like integrating a third-party library. <code>beforeDestroy</code>/<code>destroyed</code> are for cleanup — removing event listeners, clearing timers, so you don\'t leak memory when the component is removed.',
  },
  {
    q: 'What is the difference between <code>v-if</code> and <code>v-show</code>?',
    testing: 'Classic, still asked at senior level to check you know the performance implication.',
    answer: '<code>v-if</code> actually adds/removes the element from the DOM, which means components inside are destroyed and recreated, re-running their lifecycle hooks. <code>v-show</code> always renders the element and just toggles CSS display, so the component state stays alive. I use <code>v-show</code> for something toggled frequently where keeping state matters (like a tab panel the user flips back and forth on), and <code>v-if</code> for something rarely shown or where I actually want a clean reset each time.',
  },
  {
    q: 'What is the difference between props and data in a Vue 2 component?',
    testing: 'Foundational, confirms one-way data flow understanding.',
    answer: 'Props are passed down from a parent and should be treated as read-only inside the child — mutating a prop directly triggers a Vue warning because it breaks the single source of truth. Data is local, mutable state owned by the component itself. If a prop needs to be used as an editable starting value, the convention is to copy it into local data (or a computed with a setter) rather than mutate the prop.',
  },
  {
    q: 'What are scoped slots, and when would you use one over a regular slot?',
    testing: 'Reusable component design, especially for lists/tables.',
    answer: 'A regular slot lets the parent inject markup into a fixed spot in the child. A scoped slot additionally lets the child pass data back out to the parent\'s slot content, so the parent can decide how to render data that the child owns — like a table component that handles sorting/pagination internally but lets the parent fully control how each cell is rendered.',
    code: `<!-- Child -->\n<template v-for="item in items">\n  <slot name="row" :item="item" />\n</template>\n\n<!-- Parent -->\n<my-table>\n  <template #row="{ item }"><td>{{ item.name }}</td></template>\n</my-table>`,
  },
  {
    q: 'How does Vuex help with state management, and when is a project too small to need it?',
    testing: 'Judgment about when NOT to reach for a state management library.',
    answer: 'Vuex centralizes shared state and the logic that mutates it (mutations, actions), so unrelated components can read and update the same state predictably instead of passing props through many layers. I\'d introduce it once state needs to be shared across more than a couple of component trees, or once prop drilling three or four levels deep starts happening regularly. For a small app or state that\'s only relevant to one feature area, local component state or a small shared composable/module is simpler and has less ceremony.',
  },
  {
    q: 'What are mixins in Vue 2, and what problems can they cause?',
    testing: 'Sets up the migration conversation — mixins are one of the main pain points Vue 3 composables solve.',
    answer: 'A mixin bundles reusable options (data, methods, lifecycle hooks) that get merged into any component that uses it. The problem is that the source of a property or method becomes unclear once a component uses two or three mixins — if two mixins define the same method name, the merge behavior isn\'t always obvious, and your editor can\'t easily trace where something came from. This "implicit merging" problem is exactly what composables in Vue 3 fix, since composables are explicit imports and explicit returns.',
    mistake: 'Stacking many mixins on one component, creating hidden dependencies between them that are hard to trace and can silently break when the mixins are reordered.',
  },
  {
    q: 'What does the reactivity caveat around adding new properties to an object mean in Vue 2, and how do you work around it?',
    testing: 'A well-known Vue 2-specific gotcha.',
    answer: 'Vue 2\'s reactivity is built on <code>Object.defineProperty</code>, which only works on properties that exist when the object is made reactive. Adding a brand-new property to an existing reactive object afterward doesn\'t trigger reactivity by default. The workaround is <code>Vue.set(obj, \'newProp\', value)</code> (or <code>this.$set</code>), or replacing the whole object. This limitation is actually one of the strong technical reasons Vue 3 moved to Proxies — they can observe property additions and deletions natively.',
    code: `// Doesn't trigger reactivity in Vue 2\nthis.user.age = 30;\n\n// Works\nthis.$set(this.user, 'age', 30);`,
  },
  {
    q: 'What is the difference between filters and computed properties in Vue 2?',
    testing: 'Legacy feature knowledge, also relevant since filters were removed in Vue 3.',
    answer: 'Filters were a template-only syntax (<code>{{ value | currency }}</code>) for simple text transformations, piped inline in the template. Computed properties are full JavaScript and can be used anywhere in the component, not just inside interpolation. Vue 3 removed filters entirely in favor of using computed properties or methods for the same job, which is one small but real thing to account for in a migration.',
  },
  {
    q: 'How would you communicate between deeply nested parent and child components without prop drilling?',
    testing: 'Alternative to Vuex for narrower scope, also connects to Vue 3\'s provide/inject.',
    answer: 'In Vue 2, <code>provide</code>/<code>inject</code> lets an ancestor expose data that any descendant can consume directly, without passing it through every intermediate component\'s props. I\'d use it for things like a theme or a form context that many nested components need, reserving Vuex for state that\'s genuinely global and mutated from many places.',
  },
];

/* ========================================================================
   Vue 3
   ======================================================================== */
const vue3Questions = [
  {
    q: 'How does Vue 3 reactivity work under the hood?',
    testing: 'The single most common deep Vue 3 question at senior level.',
    answer: 'Vue 3 wraps reactive objects in a JavaScript <code>Proxy</code>, which intercepts property gets and sets. On get, Vue tracks which "effect" (a render function, computed, or watcher) is currently running and registers it as a dependency of that property. On set, Vue looks up which effects depend on that property and reruns them. This is a meaningful upgrade over Vue 2\'s <code>Object.defineProperty</code>-based approach, because a Proxy can observe property additions, deletions and array index/length changes natively, without needing a workaround like <code>Vue.set</code>.',
  },
  {
    q: 'What is the difference between <code>ref</code> and <code>reactive</code>, and when do you use each?',
    testing: 'Extremely common question — tests practical daily usage, not just definitions.',
    answer: '<code>reactive()</code> wraps an object in a Proxy directly. Destructuring a primitive property reads a disconnected snapshot; destructuring a nested object retains its reactive proxy, but does not follow later replacement of that property on the parent. Use <code>toRefs</code>, <code>toRef</code> or a getter when that linkage matters. <code>ref()</code> wraps any value in a tracked <code>.value</code> property. Passing the ref itself preserves linkage; extracting its current primitive value does not. Templates unwrap refs in supported contexts. My default is ref for most state, and reactive for cohesive object-shaped state such as a form.',
    code: `const count = ref(0);\ncount.value++; // need .value in script\n\nconst state = reactive({ count: 0 });\nstate.count++; // no .value needed`,
  },
  {
    q: 'What happens when you destructure a reactive object, and how do you avoid losing reactivity?',
    testing: 'A very common real bug for developers new to the Composition API.',
    answer: 'Destructuring a primitive property of a <code>reactive()</code> object creates a disconnected snapshot. A destructured nested object remains a reactive proxy, so its mutations still trigger tracking, but replacing the parent property will not redirect that local reference. Use <code>toRefs()</code> or <code>toRef()</code> to retain a property link, or read the property through a getter. This describes ordinary reactive-object destructuring, not Vue 3.5\'s compiler-transformed reactive props destructure in script setup.',
    code: `const state = reactive({ count: 0, name: 'Alex' });\nconst { count } = state; // not reactive anymore\n\nconst { count: countRef } = toRefs(state); // stays reactive`,
  },
  {
    q: 'When would you use <code>computed</code> versus <code>watch</code> versus <code>watchEffect</code>?',
    testing: 'Precise, practical decision-making across all three reactive tools.',
    answer: 'Use <code>computed</code> when you need a derived, cached value to use in the template or elsewhere — it\'s declarative and has no side effects. Use <code>watch</code> when you need to run a side effect in response to a specific, known source changing, and you need access to both the old and new values. Use <code>watchEffect</code> when the side effect\'s dependencies aren\'t fixed in advance — it automatically tracks whatever reactive values it reads during its run, which is convenient but can be harder to read since the dependencies aren\'t explicit in the code the way they are with <code>watch</code>.',
    code: `watch(userId, (newId, oldId) => { fetchUser(newId); });\n\nwatchEffect(() => { document.title = \`\${user.value.name} | App\`; });`,
  },
  {
    q: 'What problems do composables solve compared to Vue 2 mixins?',
    testing: 'The core motivation behind the Composition API, and a near-guaranteed migration question.',
    answer: 'A composable is just a function that uses Composition API primitives (<code>ref</code>, <code>computed</code>, lifecycle hooks) and returns what the component needs. Unlike mixins, everything is explicit — you see exactly what a composable returns and you choose names for the properties yourself when you destructure it, so there\'s no silent merging or naming collision between two composables used in the same component. It also composes more naturally — a composable can call another composable directly.',
    code: `function useMousePosition() {\n  const x = ref(0), y = ref(0);\n  const update = (e) => { x.value = e.pageX; y.value = e.pageY; };\n  onMounted(() => window.addEventListener('mousemove', update));\n  onUnmounted(() => window.removeEventListener('mousemove', update));\n  return { x, y };\n}`,
  },
  {
    q: 'How would you design a reusable composable — for example, a <code>useFetch</code> composable?',
    testing: 'Senior-level composable design, not just toy examples.',
    answer: 'I keep the composable focused on one responsibility, return the minimum reactive state the consumer needs (data, loading, error), and handle cleanup internally so the consumer doesn\'t have to remember to. For something like data fetching, I also think about re-fetching when a reactive input (like a route param) changes, usually by accepting a ref/getter as an argument and watching it internally.',
    code: `function useFetch(urlRef) {\n  const data = ref(null);\n  const error = ref(null);\n  const loading = ref(false);\n\n  async function load() {\n    loading.value = true;\n    error.value = null;\n    try {\n      const res = await fetch(urlRef.value);\n      data.value = await res.json();\n    } catch (e) {\n      error.value = e;\n    } finally {\n      loading.value = false;\n    }\n  }\n\n  watch(urlRef, load, { immediate: true });\n  return { data, error, loading };\n}`,
  },
  {
    q: 'What is the difference between the Options API and the Composition API, and which do you prefer?',
    testing: 'Opinion with justification — senior candidates should have a real stance.',
    answer: 'Options API organizes a component by option type (data, computed, methods), which is approachable for small components but means related logic for one feature ends up scattered across several sections. Composition API organizes code by feature/concern instead, which scales much better for larger components, and it enables composables for sharing logic cleanly. I prefer Composition API with <code>&lt;script setup&gt;</code> for most new code, but I don\'t think Options API is "wrong" — for a very simple component, it can honestly be just as readable.',
  },
  {
    q: 'What is <code>&lt;script setup&gt;</code> and what does it give you over a plain <code>setup()</code> function?',
    testing: 'Practical, everyday Vue 3 syntax.',
    answer: '<code>&lt;script setup&gt;</code> is compile-time sugar — everything declared at the top level is automatically exposed to the template without an explicit return statement, and it reduces boilerplate for <code>defineProps</code>/<code>defineEmits</code>. It also compiles to a more efficient render function than the options-based equivalent. I use it as the default for all new single-file components.',
    code: `<script setup>\nimport { ref } from 'vue';\nconst count = ref(0);\n</script>\n<template><button @click="count++">{{ count }}</button></template>`,
  },
  {
    q: 'What do <code>defineProps</code>, <code>defineEmits</code> and <code>defineExpose</code> do?',
    testing: 'Core script setup API, commonly asked in combination.',
    answer: '<code>defineProps</code> declares the component\'s props, with full TypeScript inference if typed generically. <code>defineEmits</code> declares the events a component can emit, so Vue and TypeScript can validate emit calls. <code>defineExpose</code> is needed because <code>&lt;script setup&gt;</code> components are closed by default — if a parent needs to call a method or access a ref on the child directly via a template ref, the child has to explicitly expose it.',
    code: `const props = defineProps<{ title: string }>();\nconst emit = defineEmits<{ (e: 'update', value: string): void }>();\ndefineExpose({ focusInput });`,
  },
  {
    q: 'What is <code>provide</code>/<code>inject</code>, and what are the trade-offs compared to a dedicated state management library?',
    testing: 'Scoping judgment — when to use the lighter-weight option.',
    answer: 'Provide/inject lets an ancestor component make a value available to any descendant, without threading it through props. It\'s great for scoped, tree-specific state — like form context or a design-system theme — but it\'s less structured than Pinia/Vuex: there\'s no built-in devtools time-travel, and it\'s easy to lose track of where an injected value came from in a large app. I use it for localized, component-tree-scoped concerns, and a real store for app-wide state.',
  },
  {
    q: 'What is <code>Teleport</code> and why is it useful for things like modals?',
    testing: 'Directly connects to the earlier z-index/stacking-context CSS question.',
    answer: '<code>Teleport</code> renders a component\'s content into a different part of the DOM — commonly directly under <code>&lt;body&gt;</code> — while keeping it logically part of the same component tree for props, events and reactivity. This solves the exact stacking-context and overflow-clipping problems that modals run into when they\'re deeply nested inside components with their own positioning or transforms.',
    code: `<Teleport to="body">\n  <div class="modal" v-if="isOpen">...</div>\n</Teleport>`,
  },
  {
    q: 'What is <code>Suspense</code> and what problem does it solve?',
    testing: 'Newer Vue 3 feature, shows you track the ecosystem.',
    answer: '<code>Suspense</code> is an experimental Vue 3 feature whose API may change. It shows fallback content while descendant async dependencies, such as async setup, resolve, centralizing loading state for a subtree. It is not a general error boundary: handle failures through an appropriate error-capture policy. Check the pinned Vue version before depending on its behavior in a production component API.',
  },
  {
    q: 'How would you optimize a large Vue 3 application for performance?',
    testing: 'Broad, senior-level optimization checklist.',
    answer: 'I\'d look at a few layers: route-level code splitting with lazy-loaded route components so the initial bundle is smaller; <code>v-memo</code> or careful key usage for large lists that re-render often; virtualizing very long lists instead of rendering thousands of DOM nodes; making sure computed properties are actually used for derived data instead of recomputing in the template; and checking for components that are reactive to more state than they need, since over-broad reactivity means more re-renders than necessary.',
    code: `const UserProfile = defineAsyncComponent(() => import('./UserProfile.vue'));`,
  },
  {
    q: 'What is the difference between a functional component and a regular component in Vue 3, and when would you use one?',
    testing: 'Less common but shows deeper framework knowledge.',
    answer: 'A functional component has no internal state or lifecycle — it\'s effectively just a render function based on its props. I\'d reach for one for simple, purely presentational pieces rendered very frequently (like a single item in a huge list), where avoiding the overhead of a full stateful component instance has a measurable benefit.',
  },
  {
    q: 'How do you type props and emits in a Vue 3 + TypeScript component?',
    testing: 'Connects TypeScript and Vue 3 directly.',
    answer: 'With <code>&lt;script setup lang="ts"&gt;</code>, I use the generic type argument form of <code>defineProps</code> and <code>defineEmits</code> so TypeScript infers everything, including optional props and default values through <code>withDefaults</code>.',
    code: `interface Props { title: string; count?: number }\nconst props = withDefaults(defineProps<Props>(), { count: 0 });\nconst emit = defineEmits<{ (e: 'change', value: number): void }>();`,
  },
  {
    q: 'What are async components, and why would you use <code>defineAsyncComponent</code>?',
    testing: 'Directly related to performance/code splitting.',
    answer: 'An async component is loaded lazily, only when it\'s actually rendered, instead of being bundled into the initial chunk. I use it for large components that aren\'t needed on first paint — a heavy modal, a rarely used settings panel, or a chart library that\'s only needed on one route — to keep the initial bundle smaller.',
  },
];

/* ========================================================================
   Vue 2 → 3 Migration
   ======================================================================== */
const migrationQuestions = [
  {
    q: 'What are the main breaking changes you check first when moving from Vue 2 to Vue 3?',
    testing: 'A concrete migration checklist rather than general advice.',
    answer: `Start with the global API change from a global Vue object to <code>createApp</code>, the removal of filters, the removal of the event bus pattern based on <code>$on</code> and <code>$off</code>, changes to <code>v-model</code> on components, the <code>v-if</code> and <code>v-for</code> precedence change, and the new lifecycle hook names. Then check third-party libraries, since many need new versions, plus Vuex or Vue Router versions and build tooling. Use the migration build and compiler warnings to find incompatibilities per area, and cover critical flows with tests before changing anything.`,
    mistake: 'Starting to change code before inventorying dependencies that have no Vue 3 support.',
  },
  {
    q: 'You are asked to migrate a large Vue 2 application to Vue 3. What is your overall strategy?',
    testing: 'The most important migration question — tests structured thinking under real constraints.',
    answer: `I treat this as a project with its own phases, not just a dependency bump. First, assessment: inventory the app's size, third-party dependencies, and how much Options API versus already-composable-style code exists. Second, a dependency audit — check which libraries (UI kit, router, state management, form library) have Vue 3-compatible versions, since an unmaintained dependency is often the real blocker, not the app code itself. Third, build the migration plan — usually using the official migration build, which runs Vue 3 internally with compatibility flags for Vue 2 behavior, so the app can run and be tested while individual pieces are updated. Then I migrate incrementally, by feature area, with tests and QA passing at each stage, and only remove the compatibility flags once everything is confirmed working. Finally, I keep a rollback plan — usually just the ability to redeploy the previous version quickly — until the migration has been stable in production for a while.`,
    mistake: 'Starting by rewriting components to the Composition API before confirming the app even builds and runs on Vue 3 core — architecture style and the framework version upgrade are two separate concerns and should be done in that order.',
  },
  {
    q: 'Would you migrate everything at once, or incrementally? How do you decide?',
    testing: 'Risk management judgment for a real production app.',
    answer: 'Almost always incrementally for anything beyond a small app. A big-bang rewrite freezes feature work for an unpredictable length of time and makes any regression hard to isolate, since dozens of things changed at once. I prefer migrating behind the Vue 2/3 compatibility build, tackling one feature area or route at a time, keeping the app shippable throughout. The only time I\'d consider a single cutover is a genuinely small app where the entire migration can be done and fully tested in a day or two.',
  },
  {
    q: 'How would you identify breaking changes before starting the migration?',
    testing: 'Due diligence, directly from the spec.',
    answer: 'I\'d go through the official Vue 3 migration guide\'s breaking changes list systematically against the actual codebase — things like filters being removed, <code>v-model</code> argument changes, global API changes (<code>Vue.use</code> becoming <code>app.use</code>), and the <code>$children</code>/<code>$listeners</code> removals. I\'d also grep the codebase for patterns known to break, like direct DOM manipulation that assumed specific Vue 2 internals, or reliance on mixin merge order.',
  },
  {
    q: 'How would you handle Vuex during the migration — keep it, or move to Pinia?',
    testing: 'Shows awareness of the modern Vue ecosystem, not just the core framework.',
    answer: 'Vuex 4 supports Vue 3, so the app can migrate the framework first and keep Vuex temporarily if time is tight. But I\'d generally recommend moving to Pinia as a follow-up phase, since it\'s simpler, has first-class TypeScript support, and is the direction the ecosystem has moved — Vuex is in maintenance mode. I wouldn\'t do both migrations in the same PR; separating "upgrade the framework" from "change the state library" makes each change easier to review and roll back independently.',
  },
  {
    q: 'How would you migrate mixins to composables?',
    testing: 'Connects directly to the Vue 2/Vue 3 comparison questions, applied practically.',
    answer: 'I go mixin by mixin, extract its data/methods/lifecycle hooks into a function that uses <code>ref</code>/<code>reactive</code> and the Composition API lifecycle hooks, and return exactly what consuming components need, with explicit names. Any component that used the mixin then calls the composable instead and destructures what it needs — which also forces me to clean up any naming collisions that the mixin merge had been silently resolving.',
    code: `// Vue 2 mixin\nexport default { data() { return { isOpen: false }; }, methods: { toggle() { this.isOpen = !this.isOpen; } } };\n\n// Vue 3 composable\nexport function useToggle(initial = false) {\n  const isOpen = ref(initial);\n  const toggle = () => (isOpen.value = !isOpen.value);\n  return { isOpen, toggle };\n}`,
  },
  {
    q: 'How would you test the application during the migration to catch regressions?',
    testing: 'Quality assurance strategy for a risky change.',
    answer: 'If there are existing tests, I run the full suite against the migration build at every stage — that\'s the fastest signal. If test coverage is weak (which is common on older Vue 2 apps), I prioritize adding tests for the highest-risk, highest-traffic flows before migrating them, rather than trying to backfill full coverage everywhere. I also rely on manual QA for visual/interaction regressions that automated tests might not catch, especially around anything touching the removed <code>$listeners</code>/<code>.sync</code> patterns.',
  },
  {
    q: 'How would you convince stakeholders that a Vue 2 to Vue 3 migration is worth the investment?',
    testing: 'Communication and business-impact framing — a real senior/lead skill.',
    answer: 'I\'d frame it around risk and cost, not "it\'s newer." Vue 2 reached end of life, meaning no more security patches — that\'s a direct business risk, not just a technical preference. I\'d also point to concrete gains: faster reactivity and smaller bundle size from tree-shaking, continued compatibility with actively maintained libraries, and lower onboarding cost since new hires are learning Vue 3 by default now. I\'d propose it as an incremental, scoped plan with checkpoints, not an open-ended rewrite, so leadership can see progress and stop/pause at a safe point if priorities shift.',
  },
  {
    q: 'What routing and third-party library concerns come up during a Vue 2 to Vue 3 migration?',
    testing: 'Ecosystem-level awareness beyond just the core framework.',
    answer: 'Vue Router 4 is required for Vue 3 and has some API changes (like <code>createRouter</code>/<code>createWebHistory</code> replacing the old constructor-based setup). For third-party UI libraries, I check compatibility early since it\'s often the longest pole in the schedule — an unmaintained component library can block the whole migration until it\'s replaced. I also check for any library relying on Vue 2-specific internals or the global Vue constructor pattern, since Vue 3\'s app-instance-based API changed how plugins are registered.',
  },
  {
    q: 'What is your rollback strategy if something goes wrong after deploying the migrated app?',
    testing: 'Production-safety mindset, directly asked in the spec.',
    answer: 'I\'d deploy behind a flag or to a subset of traffic if the infrastructure supports it, so a problem is caught before it affects everyone. Regardless, I make sure the previous Vue 2 build artifact is still deployable at a moment\'s notice, and I keep the migration in a dedicated branch that can be reverted independently of other feature work, so rolling back the migration doesn\'t mean losing unrelated fixes shipped in the same window.',
  },
];

/* ========================================================================
   Nuxt
   ======================================================================== */
const nuxtQuestions = [
  {
    q: 'When would you choose SSR instead of CSR for a Nuxt application?',
    testing: 'Rendering-strategy decision-making, asked constantly for Nuxt roles.',
    answer: 'I choose SSR when SEO matters, when the content is meaningfully different per request (personalized or frequently changing), or when faster perceived load time (first contentful paint) matters more than avoiding server cost. Pure CSR is fine for something like an authenticated internal dashboard where SEO is irrelevant and the user already expects a brief loading state after logging in.',
  },
  {
    q: 'A Nuxt page has a hydration mismatch. How would you debug it?',
    testing: 'One of the most common real Nuxt production issues.',
    answer: 'A hydration mismatch means the server-rendered HTML and the client\'s first render don\'t agree, so Vue has to discard and redo work, and you often see a console warning naming the mismatched element. The usual suspects are: using browser-only APIs (<code>window</code>, <code>localStorage</code>) during render instead of inside <code>onMounted</code>, rendering something time or randomness-dependent (like <code>new Date()</code> or <code>Math.random()</code>) differently on server versus client, or conditionally rendering based on a value that isn\'t available yet on the server. I check the exact component named in the warning, find what differs between server and client render, and move anything browser-dependent behind a mounted check or a <code>&lt;ClientOnly&gt;</code> wrapper.',
    code: `<ClientOnly>\n  <UserLocalTime />\n</ClientOnly>`,
  },
  {
    q: 'How would you improve the performance of a Nuxt application?',
    testing: 'Broad performance checklist specific to SSR apps.',
    answer: 'I\'d look at: payload size from the server (avoid serializing unnecessary data into the initial state), image optimization (Nuxt Image for responsive, lazy-loaded images), route-based code splitting (automatic with Nuxt, but worth checking large shared chunks), caching rendered pages or API responses where content doesn\'t change per request, and reducing third-party script weight, since those often dominate the real-world loading experience more than the app\'s own code.',
  },
  {
    q: 'How would you implement authentication in a Nuxt application?',
    testing: 'Practical, security-aware feature implementation.',
    answer: 'I\'d use a server route or middleware to handle login and set an HttpOnly cookie with the session/token, so client-side JavaScript never directly handles the raw token. On the client, a Nuxt middleware checks auth state before entering protected routes, redirecting to login if needed. For SSR, the middleware needs to check auth on the server render too, not just client-side, otherwise a logged-out user could briefly see protected content in the initial HTML.',
  },
  {
    q: 'How would you handle SEO in a Nuxt application?',
    testing: 'Connects to the HTML/SEO question earlier but applied to the specific framework\'s tools.',
    answer: 'Nuxt\'s <code>useHead</code>/<code>useSeoMeta</code> composables let each page set its own title, meta description and Open Graph tags at render time, which is exactly what\'s needed for per-page SEO since a single static title tag won\'t work for a multi-page app. For content pages I\'d default to SSG or ISR-style caching so crawlers get fully rendered HTML quickly, and I\'d make sure canonical URLs and a sitemap are generated correctly, especially for sites with both static and dynamic routes.',
  },
  {
    q: 'What are the trade-offs between SSR and SSG in Nuxt?',
    testing: 'Directly asked in the spec — core rendering strategy trade-off.',
    answer: 'SSG pre-renders pages at build time, so serving them is extremely fast and cheap (often just static files on a CDN), but content can go stale until the next build, which isn\'t great for frequently changing or personalized data. SSR renders per request, so content is always fresh and can be personalized per user, but it needs a running server, adds response latency, and scales differently (more server load under traffic). I\'d use SSG for mostly-static content like marketing pages or blogs, and SSR for anything personalized, frequently updated, or dependent on request-specific data like auth state.',
  },
  {
    q: 'What is Nuxt middleware, and how is it different from a plugin?',
    testing: 'Core Nuxt concepts, commonly confused.',
    answer: 'Middleware runs before a route is resolved, typically for things like auth checks or redirects — it can prevent navigation entirely. A plugin runs once during app initialization to register something globally, like a third-party library, a global directive, or injecting a helper available app-wide. They solve different problems: middleware is about route-level gatekeeping, plugins are about app-level setup.',
  },
  {
    q: 'What are Nuxt layouts, and when would you use more than one?',
    testing: 'Page structure organization.',
    answer: 'A layout wraps page content with shared structure — header, nav, footer — without repeating that markup on every page. I\'d use multiple layouts when sections of the app need meaningfully different shells, like a marketing layout with a full nav/footer versus a minimal auth layout for login/signup with no main navigation at all.',
  },
  {
    q: 'What are Nuxt server routes (the server/api directory), and why would you use them instead of calling an external API directly from the client?',
    testing: 'Nuxt\'s backend-for-frontend capability — often underused.',
    answer: 'Files under <code>server/api</code> become backend endpoints that run on Nuxt\'s Nitro server engine. I use them to hide secrets (API keys that must never reach the client), to combine or reshape data from multiple backend services into exactly what the frontend needs, or to add a caching layer in front of a slower upstream API — all without needing a fully separate backend service.',
    code: `// server/api/weather.get.ts\nexport default defineEventHandler(async (event) => {\n  const res = await $fetch('https://external-api.example.com/weather', {\n    headers: { Authorization: \`Bearer \${process.env.WEATHER_KEY}\` },\n  });\n  return res;\n});`,
  },
  {
    q: 'How does Nuxt handle caching, and what would you cache?',
    testing: 'Performance + architecture combined.',
    answer: 'Nuxt can cache rendered routes and server route responses using route rules or Nitro\'s caching utilities, serving a cached response instead of regenerating it on every request. I\'d cache things that are expensive to compute but don\'t change per user — a public content page, or a server route that proxies a slow third-party API — while making sure anything user-specific is explicitly excluded from the cache.',
  },
  {
    q: 'What are composables in Nuxt, and are they different from Vue 3 composables?',
    testing: 'Nuxt-specific nuance.',
    answer: 'They\'re the same underlying concept as Vue 3 composables, with the addition that Nuxt auto-imports anything in the <code>composables</code> directory, so you don\'t need an explicit import statement in most cases. Nuxt also provides its own built-in composables, like <code>useFetch</code> and <code>useState</code>, which are SSR-aware — <code>useState</code>, for example, shares state safely between server and client without leaking between different users\' requests, which a plain module-level variable would risk doing on the server.',
  },
  {
    q: 'What is the difference between <code>useFetch</code> and calling <code>fetch</code> directly inside a Nuxt component?',
    testing: 'A very common real mistake for developers new to Nuxt.',
    answer: '<code>useFetch</code> is SSR-aware — it runs on the server during server rendering and serializes the result into the page payload, so the client doesn\'t refetch the same data again on hydration. Calling the browser\'s <code>fetch</code> directly in a component\'s setup doesn\'t have that integration, so you risk either fetching twice (once on the server, once again on the client) or missing server-side data entirely depending on how it\'s wired up.',
  },
];

/* ========================================================================
   Tailwind CSS
   ======================================================================== */
const tailwindQuestions = [
  {
    q: 'Why does Tailwind use utility classes, and what are the main criticisms?',
    testing: 'Balanced view of the utility-first approach.',
    answer: `Utility classes let you style directly in markup with a constrained design scale, which avoids naming CSS, prevents dead stylesheet growth and keeps styles close to the component. The generated stylesheet stays small because only used classes are emitted. The criticisms are long class lists that reduce readability, repetition when components are not extracted, and a learning curve for the vocabulary. The usual answer is to extract components and use variants and tokens consistently, so repetition lives in one place.`,
    mistake: 'Copying the same long class string across many files instead of creating a component.',
  },
  {
    q: 'A large Tailwind project has repetitive, long class strings everywhere. How would you improve the architecture?',
    testing: 'Scaling utility-first CSS without losing its benefits — directly from the spec.',
    answer: 'I\'d extract repeated utility combinations into actual Vue components rather than reaching for <code>@apply</code> everywhere — a <code>BaseButton</code> component with variant props is more reusable and more discoverable than a CSS class that happens to bundle ten utilities. I\'d reserve <code>@apply</code> for a small number of truly global, cross-cutting patterns, not as a general de-duplication tool, since overusing it starts to recreate the maintenance problems of hand-written CSS while losing the traceability of utility classes in the markup.',
    code: `<!-- Better: a component encapsulates the class string -->\n<BaseButton variant="primary">Save</BaseButton>`,
  },
  {
    q: 'When would you choose Tailwind over SCSS, and when would SCSS be better?',
    testing: 'Judgment, not tool loyalty — asked directly in the spec.',
    answer: 'Tailwind wins when the team wants speed and visual consistency enforced by a constrained design token system, and when shipping only the CSS that\'s actually used matters for bundle size. SCSS wins when a design has a lot of genuinely unique, complex components where utility classes become long and hard to scan, or when the team strongly prefers keeping markup clean and styling separated into its own files. In practice I often use both on the same project — Tailwind for layout/spacing/common patterns, SCSS modules for a handful of highly custom, animation-heavy components.',
  },
  {
    q: 'How do you configure a custom theme in Tailwind, and why would you extend the default theme instead of overriding it?',
    testing: 'Practical, everyday Tailwind configuration knowledge.',
    answer: 'I extend the <code>theme.extend</code> section in <code>tailwind.config.js</code> so the project\'s custom design tokens (brand colors, spacing scale, font sizes) are added alongside Tailwind\'s sensible defaults, rather than replacing them outright and losing useful built-in values the team didn\'t intend to remove.',
    code: `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: { brand: { 500: '#4f46e5', 600: '#4338ca' } },\n    },\n  },\n};`,
  },
  {
    q: 'What are Tailwind variants, and how do responsive/state variants work together?',
    testing: 'Core mental model for reading Tailwind class strings quickly.',
    answer: 'A variant is a prefix that conditionally applies a utility — <code>hover:</code>, <code>focus:</code>, <code>dark:</code>, or a breakpoint like <code>md:</code>. They can be stacked, so <code>md:hover:bg-brand-600</code> only applies the hover background starting at the md breakpoint. Reading these from left to right as "under this condition, apply this utility" makes long class strings much easier to parse.',
  },
  {
    q: 'What are arbitrary values in Tailwind, and when is it appropriate to use them versus adding a value to the theme config?',
    testing: 'Judgment about consistency versus one-off flexibility.',
    answer: 'Arbitrary values (like <code>top-[117px]</code>) let you use a one-off value without editing the config. I use them for genuinely one-time, unlikely-to-repeat values — matching a specific design asset\'s exact position, for example. If I notice the same arbitrary value being used in more than one place, that\'s a signal it should actually be promoted into the theme config as a real design token instead.',
  },
  {
    q: 'How does Tailwind keep production CSS small despite having thousands of utility classes available?',
    testing: 'Understanding of the build pipeline, relevant to performance discussions.',
    answer: 'Tailwind scans your actual template/source files at build time and only generates CSS for class names it finds being used, so the shipped stylesheet only contains what the project actually references rather than the entire utility set. This is why the content/glob configuration pointing at all your template files has to be accurate — missing a file path there can mean classes silently don\'t get generated in production even though they work in dev.',
  },
  {
    q: 'How would you implement dark mode in a Tailwind project?',
    testing: 'Common real feature request.',
    answer: 'Tailwind supports a <code>dark:</code> variant, toggled either by the user\'s OS preference or manually via a class on the html element, configured with <code>darkMode: \'class\'</code>. I prefer the class-based strategy over the media-query-based one because it lets the app offer an explicit theme toggle instead of being fully locked to OS preference, while still defaulting to the OS preference on first load.',
    code: `<html class="dark">\n<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">...</div>`,
  },
];

/* ========================================================================
   SCSS / Sass
   ======================================================================== */
const scssQuestions = [
  {
    q: 'What is the difference between a mixin, a function and a placeholder selector in SCSS?',
    testing: 'Choosing the right reuse mechanism.',
    answer: `A mixin outputs a block of declarations wherever it is included and can take arguments, so it suits reusable styling such as a media query helper. A function returns a single value, for example a calculated size, and is used inside property values. A placeholder selector, used with <code>@extend</code>, groups selectors so they share one rule instead of duplicating declarations, but it can produce large selector lists and surprising ordering. Prefer mixins and functions for clarity and use extend sparingly.`,
    mistake: 'Overusing extend across unrelated components, which creates tangled selectors that are hard to debug.',
  },
  {
    q: 'Your SCSS bundle has become difficult to maintain. How would you restructure it?',
    testing: 'The core SCSS architecture scenario from the spec.',
    answer: 'I\'d reorganize using the 7-1-style pattern — separate folders for abstracts (variables, functions, mixins — no CSS output on their own), base (resets, typography), components (one partial per UI component), and a single top-level file that imports everything in the right order. I\'d also audit for deep nesting and flatten it, since that\'s usually the real root cause of "hard to maintain," not just file organization.',
  },
  {
    q: 'What are SCSS partials and why use them instead of one large stylesheet?',
    testing: 'Basic organizational tool, still worth confirming.',
    answer: 'A partial (filename starting with an underscore, like <code>_buttons.scss</code>) is meant to be imported into another file rather than compiled on its own. Splitting styles into partials by component or concern makes the codebase navigable — you can jump straight to <code>_buttons.scss</code> instead of searching through one enormous file.',
  },
  {
    q: 'What is the difference between a Sass mixin and a Sass function?',
    testing: 'Precision about two frequently confused Sass tools.',
    answer: 'A mixin outputs a block of CSS declarations and is included with <code>@include</code>. A function computes and returns a single value (a color, a number) and is used inline wherever a value is expected, called like a normal function. I use a function when I need a computed value I\'ll plug into different properties, and a mixin when I need to output a reusable chunk of actual styles.',
    code: `@function rem($px, $base: 16) { @return ($px / $base) * 1rem; }\n.title { font-size: rem(24); }`,
  },
  {
    q: 'What is the difference between <code>@extend</code> and a mixin, and why do many teams avoid <code>@extend</code>?',
    testing: 'A more opinionated, senior-level SCSS question.',
    answer: '<code>@extend</code> makes one selector inherit another selector\'s styles by combining them in the compiled output, which can produce unexpected, hard-to-predict selector combinations, especially across media queries or nested contexts. A mixin just copies the declarations into wherever it\'s included, which is more predictable and easier to reason about. I default to mixins for this reason and rarely reach for <code>@extend</code> in new code.',
  },
  {
    q: 'How do Sass modules (<code>@use</code>) differ from the older <code>@import</code>?',
    testing: 'Modern Sass tooling awareness.',
    answer: '<code>@import</code> dumps everything into global scope and can load the same file multiple times, causing duplicate output. <code>@use</code> loads a module with its own namespace, so variables and mixins have to be referenced with a prefix (<code>namespace.$variable</code>), which avoids naming collisions and makes it clear where something came from — <code>@import</code> is actually deprecated in newer Sass versions in favor of this.',
    code: `// _colors.scss\n$primary: #4f46e5;\n\n// app.scss\n@use 'colors';\n.btn { background: colors.$primary; }`,
  },
  {
    q: 'How deep should SCSS nesting go, and why?',
    testing: 'Connects directly to the CSS specificity/refactor question.',
    answer: 'As a rule of thumb, I keep nesting to two or three levels at most. Beyond that, the generated selector specificity gets high enough that overriding it later requires matching or exceeding that same nesting depth, which compounds the problem for the next person touching the file. A flatter, BEM-style approach avoids this entirely.',
  },
];

/* ========================================================================
   REST APIs
   ======================================================================== */
const apiQuestions = [
  {
    q: 'What is the difference between PUT and PATCH, and which HTTP methods are idempotent?',
    testing: 'REST semantics that affect retries and caching.',
    answer: `PUT replaces the whole resource with the supplied representation, while PATCH applies a partial update. GET, PUT, DELETE, HEAD and OPTIONS are idempotent, meaning repeating the same request has the same effect as sending it once. POST is not idempotent by default, so a retry can create a duplicate, which is why create operations often use an idempotency key. PATCH may or may not be idempotent depending on how the update is defined.`,
    mistake: 'Retrying a failed POST automatically and creating duplicate records.',
  },
  {
    q: 'How do you handle authentication tokens and expiry in a frontend API client?',
    testing: 'Practical client design around sessions.',
    answer: `Attach credentials in one place, such as an interceptor, instead of in every call. Prefer an HTTP-only secure cookie managed by the server where possible, because it is not readable from JavaScript. When a request returns unauthorized, attempt a single coordinated refresh and queue other requests behind it so several parallel refreshes do not run, then retry once. If refresh fails, clear state and send the user to sign in without losing their work. Never log tokens.`,
    mistake: 'Letting every failed request trigger its own refresh, which causes races and repeated logouts.',
  },
  {
    q: 'An API takes 5 seconds to respond. How would you improve the perceived user experience?',
    testing: 'UX-aware frontend engineering, not just "make the API faster" (which the candidate often doesn\'t control).',
    answer: 'Since I may not control the backend\'s actual latency, I focus on perceived performance: show a skeleton loader that mirrors the final layout instead of a blank screen or spinner, so the wait feels shorter and less jarring. If part of the data can be fetched faster than the rest, I render progressively instead of waiting for everything together. I\'d also check whether the request can be triggered earlier — prefetching on hover or on route-enter — so the wait happens before the user is actually looking at the result.',
  },
  {
    q: 'An API sometimes returns a 500 error. What should the frontend do?',
    testing: 'Resilience and error-handling patterns in production code.',
    answer: 'Show a recoverable error and preserve user input. For automatic retries, use a small bounded budget and exponential backoff only for explicitly allowed idempotent reads and eligible transient failures. This JSON-read example allows GET only, retries network TypeErrors and 500/502/503/504 responses, and never retries 4xx responses (including 429, which needs a separate Retry-After policy). Abort and JSON parsing errors do not retry. Other methods need their own reviewed replay/body/idempotency contract; do not infer safety from merely not being POST. Production policies should add jitter and an overall deadline.',
    code: `async function safeFetch(url, options = {}, retries = 2) {\n  if (!Number.isInteger(retries) || retries < 0 || retries > 5) {\n    throw new RangeError('retries must be an integer from 0 to 5');\n  }\n  const retryMethods = new Set(['GET']);\n  const retryStatuses = new Set([500, 502, 503, 504]);\n  const method = (options.method || 'GET').toUpperCase();\n  const signal = options.signal;\n  const checkAbort = () => {\n    if (signal?.aborted) throw signal.reason ?? new DOMException('Aborted', 'AbortError');\n  };\n  const sleep = ms => new Promise((resolve, reject) => {\n    if (signal?.aborted) { reject(signal.reason ?? new DOMException('Aborted', 'AbortError')); return; }\n    function onAbort() {\n      clearTimeout(timer); signal.removeEventListener('abort', onAbort);\n      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));\n    }\n    const timer = setTimeout(() => { signal?.removeEventListener('abort', onAbort); resolve(); }, ms);\n    signal?.addEventListener('abort', onAbort, { once: true });\n  });\n  for (let attempt = 0; ; attempt++) {\n    checkAbort();\n    let res;\n    try { res = await fetch(url, { ...options, method }); }\n    catch (error) {\n      checkAbort();\n      if (!retryMethods.has(method) || !(error instanceof TypeError) || attempt >= retries) throw error;\n      await sleep(Math.min(2000, 100 * 2 ** attempt));\n      continue;\n    }\n    checkAbort();\n    if (res.ok) return res.json(); // decoding errors deliberately do not retry\n    if (!retryMethods.has(method) || !retryStatuses.has(res.status) || attempt >= retries) {\n      throw new Error('HTTP ' + res.status);\n    }\n    await res.body?.cancel(); // release the failed response before retrying\n    await sleep(Math.min(2000, 100 * 2 ** attempt));\n  }\n}\n// Contract: URL string, JSON endpoint, no request body; retry policy is GET-only.`,
  },
  {
    q: 'How would you handle token expiration in a frontend app?',
    testing: 'Common, practical auth-flow problem.',
    answer: 'I\'d intercept API responses at a central layer (an axios interceptor, or a wrapper around fetch) so a 401 triggers a single shared refresh flow instead of every individual request handling it separately. While the refresh is in flight, I queue up any other requests that also hit a 401 so they wait for the new token instead of each independently trying to refresh and causing a race. If the refresh itself fails, that\'s when I redirect to login.',
  },
  {
    q: 'How would you prevent duplicate API requests — for example, a user double-clicking a submit button?',
    testing: 'Common real production bug, directly asked in the spec.',
    answer: 'I disable the button immediately on the first click and re-enable it only after the request settles (success or failure), rather than relying on the user not clicking twice. For search-as-you-type or similar patterns, I\'d also debounce the trigger itself, and for navigational requests, cancel any in-flight request for the same resource before starting a new one.',
    code: `async function handleSubmit() {\n  if (isSubmitting.value) return;\n  isSubmitting.value = true;\n  try { await api.post('/orders', payload); }\n  finally { isSubmitting.value = false; }\n}`,
  },
  {
    q: 'How would you cancel an in-flight API request — for example, when a user navigates away or types a new search query?',
    testing: 'Practical use of AbortController, a commonly underused browser API.',
    answer: 'I use an <code>AbortController</code>, pass its signal into the fetch call, and call <code>abort()</code> when a new request supersedes the old one or the component unmounts. This matters most for search-as-you-type, where an older, slower response could otherwise arrive after a newer one and incorrectly overwrite the UI with stale results.',
    code: `let controller;\nasync function search(query) {\n  controller?.abort();\n  controller = new AbortController();\n  const res = await fetch(\`/search?q=\${query}\`, { signal: controller.signal });\n  return res.json();\n}`,
  },
  {
    q: 'What is the difference between authentication and authorization, and how does that affect frontend design?',
    testing: 'Precision in a commonly conflated pair of terms.',
    answer: 'Authentication confirms who the user is (login). Authorization determines what that user is allowed to do. On the frontend, I use the user\'s role/permissions (from the authenticated session, never trusted blindly) to conditionally show or hide UI — but I always treat that as a UX convenience, not a security boundary, since the real authorization check has to happen on the server regardless of what the UI shows.',
  },
  {
    q: 'How would you implement pagination for a large data set — offset-based or cursor-based, and why?',
    testing: 'Real API design trade-off understanding, useful for a dashboard-heavy role.',
    answer: 'Offset-based pagination (<code>page=2&limit=20</code>) is simple and lets users jump to an arbitrary page, but can show duplicate or skipped items if the underlying data changes between requests. Cursor-based pagination (using a pointer like "give me items after this ID") is more consistent under changing data and scales better for very large data sets, at the cost of not being able to jump to an arbitrary page number directly. For a typical paginated table I\'d default to offset for simplicity; for an infinite-scroll feed with frequently changing data, cursor-based.',
  },
  {
    q: 'How would you implement optimistic updates, and what\'s the risk?',
    testing: 'Advanced UX pattern that shows real production experience.',
    answer: 'An optimistic update applies the expected result to the UI immediately, before the server confirms it, so the interaction feels instant — like a chat message appearing right away or liking a post. The risk is handling failure gracefully: if the server rejects the change, I have to roll the UI back to its previous state and clearly communicate that it failed, otherwise the UI and the real server state silently diverge.',
  },
  {
    q: 'How do you handle loading and error states consistently across a large application?',
    testing: 'Architectural consistency, not just a one-off component pattern.',
    answer: 'I standardize the shape of async state — something like <code>{ data, loading, error }</code> — through a shared composable so every API-driven component follows the same pattern instead of each one reinventing its own flags. This keeps loading/error UI consistent across the app and makes it much easier to review for missing states in code review.',
  },
  {
    q: 'What HTTP caching headers matter for a frontend-driven API, and how would you use them?',
    testing: 'Shows understanding that goes beyond just calling fetch.',
    answer: '<code>Cache-Control</code> controls whether and how long a response can be cached by the browser or a CDN. <code>ETag</code>/<code>If-None-Match</code> lets the client send a conditional request that returns a cheap 304 if nothing changed, instead of re-downloading the full payload. For frequently requested, rarely changing data, I\'d push the team to add appropriate cache headers rather than relying purely on client-side in-memory caching.',
  },
];

/* ========================================================================
   Performance
   ======================================================================== */
const performanceQuestions = [
  {
    q: 'What are Core Web Vitals, and how would you improve each one?',
    testing: 'Knowing the metrics and matching fixes to causes.',
    answer: `The three metrics are Largest Contentful Paint for loading, Interaction to Next Paint for responsiveness and Cumulative Layout Shift for visual stability. To improve LCP, make the main image or text load early, reduce server and render-blocking time and avoid lazy-loading the hero element. To improve INP, split long tasks, reduce JavaScript work in event handlers and avoid heavy rendering after input. To improve CLS, reserve space for images, ads and dynamic content and avoid inserting content above what the user is reading. Measure with field data first, then reproduce in the lab.`,
    mistake: 'Optimizing a lab score without checking field data from real users and devices.',
  },
  {
    q: 'What is code splitting and lazy loading, and when can it hurt?',
    testing: 'Understanding the trade-offs of loading strategy.',
    answer: `Code splitting divides the bundle into chunks so users download only what the current route needs, and lazy loading defers loading a chunk until it is required, for example with a dynamic import. It reduces initial load cost. It can hurt when it splits too finely, causing many small requests and waterfalls, or when a critical component is loaded late and delays what the user needs. Split at route and heavy feature boundaries, prefetch likely next routes and check the network waterfall.`,
    mistake: 'Lazy-loading above-the-fold content, which delays the very thing users came to see.',
  },
  {
    q: 'A production website became noticeably slower after a new release. How would you investigate it, step by step, using DevTools?',
    testing: 'The signature senior-level performance debugging scenario.',
    answer: `I'd start by reproducing it with the Performance panel recording a real page load, since guessing is slower than measuring. I look at the flame chart for long tasks blocking the main thread, and check the Network panel for anything new that got noticeably bigger — a new dependency, an unoptimized image, a duplicated chunk from a bad code-split. I'd compare Core Web Vitals (LCP, CLS, INP) before and after the release using Lighthouse or field data if available, since that tells me which specific metric regressed and narrows down where to look. If it's JS-bound, I check the bundle analyzer output for the release to see what got added. If it's render-bound, I check for a new source of unnecessary re-renders.`,
    code: `# Quick starting points\n# 1. Lighthouse / PageSpeed Insights — compare before/after scores\n# 2. Chrome DevTools > Performance tab — record a reload, inspect the flame chart\n# 3. Network tab — sort by size, look for new large payloads\n# 4. Bundle analyzer on the build — spot unexpectedly large chunks`,
  },
  {
    q: 'What are the Core Web Vitals, and what does each one actually measure?',
    testing: 'Baseline vocabulary for any performance conversation today.',
    answer: 'LCP (Largest Contentful Paint) measures how long it takes the largest visible element to render — a proxy for perceived load speed. CLS (Cumulative Layout Shift) measures unexpected visual movement, usually from images or ads loading without reserved space. INP (Interaction to Next Paint) measures how responsive the page feels to user input, replacing the older First Input Delay metric with a more complete picture across the whole session rather than just the first interaction.',
  },
  {
    q: 'How would you reduce a large JavaScript bundle size?',
    testing: 'Everyday, practical performance work.',
    answer: 'I\'d start with a bundle analyzer to see what\'s actually large, since intuition about bundle size is often wrong. Common wins: route-based code splitting so each page only loads what it needs, replacing a heavy library with a lighter alternative or a native API, tree-shaking by using ES module imports instead of importing an entire library\'s default export, and lazy-loading anything not needed for the initial render, like a modal or a rarely used chart.',
  },
  {
    q: 'What is tree shaking, and what can prevent it from working?',
    testing: 'Build tooling understanding, relevant to bundle size work.',
    answer: 'Tree shaking removes unused exports from the final bundle, based on static analysis of ES module imports/exports. It breaks down when code has side effects the bundler can\'t safely prove are unused, or when a library ships as CommonJS instead of ES modules, since CommonJS\'s dynamic <code>require</code> pattern can\'t be statically analyzed the same way.',
  },
  {
    q: 'What is image optimization, and what techniques would you apply?',
    testing: 'Images are usually the single biggest contributor to page weight.',
    answer: 'Serve modern formats with a fallback and appropriate responsive sizes. Lazy-load below-the-fold images, not the likely above-the-fold hero/LCP image: delaying its discovery or download worsens LCP. Give a measured critical hero high fetch priority when justified, without marking every image high priority. Set intrinsic dimensions or aspect-ratio to reserve space and reduce CLS.',
    code: `<!-- Above-the-fold LCP candidate: no lazy loading -->\n<img src="hero.webp" width="800" height="450" fetchpriority="high" alt="Product overview" />\n<!-- Noncritical image below the fold -->\n<img src="details.webp" width="800" height="450" loading="lazy" alt="Product details" />`,
  },
  {
    q: 'What is the difference between preloading and prefetching a resource?',
    testing: 'Resource hint nuance.',
    answer: '<code>preload</code> tells the browser a resource is needed for the current page and should be fetched with high priority right away — good for a critical font or hero image. <code>prefetch</code> tells the browser a resource will likely be needed for a future navigation, fetched at low priority during idle time — good for the next likely route in an SPA.',
    code: `<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />\n<link rel="prefetch" href="/dashboard.js" />`,
  },
  {
    q: 'How would you detect and fix a memory leak in a long-running single-page application?',
    testing: 'Connects to the debugging scenarios section — memory growth is a common real issue.',
    answer: 'I\'d use the Memory tab in DevTools to take heap snapshots at different points in time (e.g., after navigating between the same two pages repeatedly) and compare them — objects that keep growing in count across snapshots point to the leak. Common causes in a Vue app: event listeners or timers set up in <code>mounted</code>/<code>onMounted</code> without being removed in the matching cleanup hook, or a closure holding a reference to a large object/DOM node that never gets released.',
    code: `onMounted(() => window.addEventListener('resize', onResize));\nonUnmounted(() => window.removeEventListener('resize', onResize)); // easy to forget`,
  },
  {
    q: 'What is code splitting, and how does it apply to a Vue Router-based app?',
    testing: 'Everyday technique, commonly implemented incorrectly (eagerly imported anyway).',
    answer: 'Code splitting breaks the bundle into smaller chunks loaded on demand instead of all at once. In Vue Router, using a dynamic <code>import()</code> for a route component automatically creates a separate chunk for that route, so users only download the code for the page they\'re actually visiting.',
    code: `const routes = [\n  { path: '/settings', component: () => import('./views/Settings.vue') },\n];`,
  },
  {
    q: 'What is the difference between compression (gzip/Brotli) and minification?',
    testing: 'Build/deployment-level performance knowledge.',
    answer: 'Minification removes unnecessary characters from the source (whitespace, long variable names) to shrink the file itself before it\'s even sent. Compression (gzip or the more efficient Brotli) happens at the HTTP transfer layer, re-encoding the already-minified file to be smaller over the wire, then decompressed by the browser on arrival. They\'re complementary — you want both, and Brotli over gzip where the server supports it, since it typically compresses smaller.',
  },
  {
    q: 'How does a CDN help frontend performance, beyond "it makes things faster"?',
    testing: 'Explains the actual mechanism, not just repeating marketing language.',
    answer: 'A CDN serves static assets from edge servers physically closer to the user, reducing the network round-trip time compared to a single origin server. It also offloads traffic from the origin so it can focus on dynamic requests, and many CDNs provide built-in caching and compression, reducing both latency and bandwidth cost.',
  },
  {
    q: 'What rendering performance pitfalls would you look for in a Vue component that re-renders too often?',
    testing: 'Connects reactivity understanding to performance in practice.',
    answer: 'I\'d check whether the component is reactive to more state than it actually uses — a parent re-rendering because of a prop deep inside an object it doesn\'t even read from. I\'d also look for a computed property that\'s recreated with a new object/array reference every time (breaking reference equality checks downstream), and for large lists rendered without virtualization where only a few items are ever visible.',
  },
];

/* ========================================================================
   Accessibility
   ======================================================================== */
const accessibilityQuestions = [
  {
    q: 'What is the first rule of ARIA, and what makes a custom button accessible?',
    testing: 'Preferring native semantics over custom widgets.',
    answer: `The first rule is to use a native element with the needed semantics and behavior if one exists, because ARIA only changes how something is announced and does not add behavior. A native <code>button</code> already provides keyboard activation with Enter and Space, focus and a role. A custom element would need a role, a tabindex, key handling and visible focus styles, all of which you must build and test. Use ARIA to fill gaps for complex widgets, and verify with a keyboard and a screen reader.`,
    mistake: 'Making a div clickable with an onclick handler and no role, focus or keyboard support.',
  },
  {
    q: 'How do you test color contrast and keyboard accessibility?',
    testing: 'A practical testing routine.',
    answer: `For contrast, check text and interface components against the WCAG ratios, normally 4.5 to 1 for body text and 3 to 1 for large text and component boundaries, using browser tools, and test each theme and state. For keyboard use, unplug the mouse and tab through every flow: focus order should be logical, focus must always be visible, there must be no keyboard traps and every action must be reachable. Add automated checks in the pipeline and finish with a manual screen reader pass, since tools catch only a portion of issues.`,
    mistake: 'Relying only on an automated score and never trying the interface with a keyboard.',
  },
  {
    q: 'You built a custom dropdown. How would you make it accessible?',
    testing: 'Directly from the spec — a very common practical accessibility ask.',
    answer: 'I\'d give it the correct ARIA roles and states for a listbox/combobox pattern (<code>role="listbox"</code>, <code>aria-expanded</code> on the trigger, <code>aria-selected</code> on options), make sure it\'s fully operable with the keyboard (Enter/Space to open, arrow keys to move through options, Enter to select, Escape to close), and manage focus explicitly — moving focus into the option list when it opens and back to the trigger when it closes. I\'d also make sure the selected value is announced, not just visually indicated by a checkmark or color.',
    code: `<button aria-haspopup="listbox" aria-expanded="false">Choose option</button>\n<ul role="listbox">\n  <li role="option" aria-selected="true">Option A</li>\n</ul>`,
  },
  {
    q: 'How would you make a modal dialog accessible?',
    testing: 'Also directly from the spec — a very common pattern with several easy-to-miss details.',
    answer: 'I give the modal container <code>role="dialog"</code> and <code>aria-modal="true"</code>, label it with <code>aria-labelledby</code> pointing at its heading, move focus into it the moment it opens (usually to the close button or the first focusable element), and trap Tab/Shift+Tab inside it so focus can\'t escape to the page behind it while it\'s open. Escape should close it, clicking the backdrop should close it, and when it closes, focus should return to whatever element originally triggered it — not get lost at the top of the page.',
  },
  {
    q: 'What is WCAG, and what are the four core principles it\'s organized around?',
    testing: 'Baseline accessibility vocabulary.',
    answer: 'WCAG (Web Content Accessibility Guidelines) is the standard most legal and organizational accessibility requirements are based on. It\'s organized around four principles, often remembered as POUR: Perceivable (content must be presentable to the senses, e.g., alt text for images), Operable (interface must be usable via keyboard, not just mouse), Understandable (content and operation must be predictable), and Robust (content works reliably across different assistive technologies).',
  },
  {
    q: 'What is focus management, and why does it matter more in a single-page application?',
    testing: 'Connects to the earlier SPA route-change focus question.',
    answer: 'Focus management means deliberately controlling where keyboard focus goes after a UI change — a route navigation, opening a modal, submitting a form. In a traditional multi-page site, the browser handles this automatically by loading a new document. In an SPA, nothing resets focus unless the app does it explicitly, so without deliberate handling, keyboard and screen reader users can end up with focus stuck on an element that no longer makes sense, or not realize the page content changed at all.',
  },
  {
    q: 'When should you use a <code>&lt;button&gt;</code> versus a styled <code>&lt;div&gt;</code> for something clickable?',
    testing: 'Always a button, almost never a div — tests if you know why.',
    answer: 'Always a real <code>&lt;button&gt;</code> for anything that triggers an action, unless there\'s a very specific reason not to. A native button is focusable, operable by both Enter and Space, and announced with the correct role automatically. A styled div with a click handler needs all of that re-implemented manually — <code>tabindex="0"</code>, keydown handling for Enter/Space, and <code>role="button"</code> — and it\'s easy to miss one of those details, which is exactly the kind of bug that shows up in accessibility audits.',
  },
  {
    q: 'What does sufficient color contrast mean, and how would you check it?',
    testing: 'Practical, testable accessibility requirement.',
    answer: 'WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text, between the text color and its background. I check this with the contrast checker built into Chrome DevTools\' color picker, or a dedicated tool, especially for text on top of gradients or images where it\'s easy to end up with low contrast in some areas even if it looks fine in others.',
  },
  {
    q: 'How would you make a complex form accessible — for example, one with validation errors?',
    testing: 'Connects to the HTML forms question but focused purely on a11y.',
    answer: 'Every input needs a properly associated <code>&lt;label&gt;</code>, not just visually adjacent text. Error messages should be linked to their field with <code>aria-describedby</code> so screen readers announce them when the field is focused, and the field itself should get <code>aria-invalid="true"</code> when it fails validation. For a whole-form error summary, I use a live region so the error count is announced as soon as validation runs, rather than silently appearing with no announcement.',
  },
  {
    q: 'What do screen readers actually rely on to describe a page, beyond visible text?',
    testing: 'Shows understanding of the accessibility tree in practice, not just "add alt text".',
    answer: 'They rely on the accessibility tree built from the DOM — each element\'s role (what kind of control it is), name (its accessible label), state (expanded, checked, disabled) and value. This is why semantic HTML and correct ARIA matter so much: a visually identical element can be completely silent or misleading to a screen reader if its role or name isn\'t set correctly, even though sighted users would never notice anything wrong.',
  },
];

/* ========================================================================
   Git
   ======================================================================== */
const gitQuestions = [
  {
    q: 'How do you undo changes in Git, and what is the difference between reset, revert and restore?',
    testing: 'Choosing a safe undo for the situation.',
    answer: `<code>git restore</code> discards changes in the working tree or unstages files, and affects no history. <code>git revert</code> creates a new commit that reverses an earlier commit, which is safe on shared branches because history is preserved. <code>git reset</code> moves the branch pointer and can rewrite history, so it is for local, unpublished work. Before a destructive command, check what it will do and keep a backup branch. The reflog can recover lost commits for a limited time.`,
    mistake: 'Using reset and force push on a shared branch.',
  },
  {
    q: 'What does a good commit message and pull request look like?',
    testing: 'Professional collaboration habits.',
    answer: `A good commit is small, focused and has a message that explains what changed and why, with a concise summary line and an optional body for context. A good pull request has a clear title and description, links the ticket, explains the approach and any risks, includes tests and screenshots for visual changes and is small enough to review thoroughly. Keeping changes focused makes review faster and reverts safer.`,
    mistake: 'Large pull requests that mix refactoring and features with messages such as "fixes".',
  },
  {
    q: 'You accidentally pushed a bad commit to production. What would you do?',
    testing: 'Incident-response composure, directly from the spec.',
    answer: 'First priority is stopping the bleeding, not fixing history — I\'d revert the deploy or roll back to the last known-good release/build artifact immediately if that\'s faster than fixing forward. In git, I\'d use <code>git revert</code> to create a new commit that undoes the bad change, rather than <code>reset</code>-ing and force-pushing, since revert preserves history and is safe on a shared branch that others may have already pulled. Once production is stable again, I\'d investigate root cause and add whatever check (test, lint rule, required review) would have caught it.',
    code: `git revert <bad-commit-sha>\ngit push`,
    mistake: 'Using <code>git reset --hard</code> plus a force-push on a shared branch to "undo" the commit, which rewrites history other people may have already based work on, and can cause their next pull/push to silently drop or conflict with the reverted work.',
  },
  {
    q: 'You have a large merge conflict right before a release. How would you handle it?',
    testing: 'Also directly from the spec — a realistic, high-pressure scenario.',
    answer: 'I\'d avoid resolving a large conflict under time pressure alone if I can help it — I\'d pull in whoever authored the conflicting changes so we resolve it together with full context on intent, rather than me guessing which version is "right" line by line. I\'d resolve in small, reviewable chunks, run the full test suite after resolving, and if the release deadline is truly immovable and the conflict is large, I\'d push to postpone rather than rush a resolution that risks shipping a broken merge.',
  },
  {
    q: 'What is the difference between <code>git merge</code> and <code>git rebase</code>, and when would you use each?',
    testing: 'One of the most common Git questions, still worth a clear senior-level answer.',
    answer: 'Merge combines two branches by creating a new commit with two parents, preserving the exact history of both branches as they happened. Rebase replays your branch\'s commits on top of another branch\'s latest commit, producing a linear history as if you\'d started from there. I use rebase to clean up my own feature branch before opening a PR (squashing/reordering local commits), but I avoid rebasing a branch that others have already pulled from, since it rewrites commit hashes and breaks their local history.',
  },
  {
    q: 'What does <code>git cherry-pick</code> do, and when have you needed it?',
    testing: 'Less common command, tests real usage versus memorized definition.',
    answer: 'Cherry-pick applies a specific commit from one branch onto another, without merging the whole branch. I\'ve used it to backport a single bug fix into a release branch that\'s otherwise frozen for new features, without dragging in unrelated commits from main.',
    code: `git cherry-pick <commit-sha>`,
  },
  {
    q: 'What is the difference between <code>git reset</code> and <code>git revert</code>?',
    testing: 'Directly relevant to the "bad commit in production" scenario.',
    answer: '<code>reset</code> moves the branch pointer, optionally discarding commits and/or working directory changes — it rewrites history, which is risky on a shared branch. <code>revert</code> creates a brand-new commit that undoes the changes of a previous commit, keeping history intact and safe to push to a shared branch.',
  },
  {
    q: 'What is <code>git stash</code>, and when do you use it?',
    testing: 'Everyday workflow tool.',
    answer: 'Stash temporarily shelves uncommitted changes so you can switch branches cleanly — for example, to quickly check out main and fix an urgent bug without committing half-finished work. I pop it back once I return to the original task.',
    code: `git stash\ngit checkout main\n# ...fix urgent bug...\ngit checkout feature-branch\ngit stash pop`,
  },
  {
    q: 'What makes a good pull request, from a reviewer\'s perspective?',
    testing: 'Team collaboration — a real senior-level concern beyond raw git commands.',
    answer: 'Small and focused on one logical change, with a description that explains the "why," not just the "what" (the diff already shows what changed). I also appreciate a PR that calls out anything risky or worth double-checking, and ideally includes how it was tested. A 2,000-line PR mixing a refactor with a feature is much harder to review carefully, and harder to revert safely if something goes wrong.',
  },
  {
    q: 'What is your commit strategy — many small commits, or fewer larger ones?',
    testing: 'Style/process opinion, with reasoning expected.',
    answer: 'I commit in small, logical chunks locally so each commit tells a clear story, but before opening a PR I\'ll often squash trivial "fix typo"/"oops" commits so the history that lands on main is clean and each commit is something you\'d actually want to <code>git blame</code> back to later.',
  },
];

/* ========================================================================
   Security
   ======================================================================== */
const securityQuestions = [
  {
    q: 'What is XSS, and how do you prevent it in a Vue or Nuxt application?',
    testing: 'Understanding injection and the correct defenses.',
    answer: `Cross-site scripting lets an attacker run script in your page, usually through untrusted content rendered as HTML. Vue escapes text interpolation by default, so the main risk is <code>v-html</code> and other raw HTML sinks, plus unsafe URLs and third-party content. Avoid rendering untrusted HTML, sanitize it with a maintained library when you must, validate URLs, and add a Content Security Policy as an extra layer. Keep tokens out of places scripts can read where possible.`,
    mistake: 'Using v-html with user-provided content because it was convenient.',
  },
  {
    q: 'What is CSRF, and how do SameSite cookies and tokens help?',
    testing: 'Cookie-based session security.',
    answer: `Cross-site request forgery tricks a browser into sending an authenticated request to your site from another site, because cookies are attached automatically. SameSite cookie settings limit when cookies are sent on cross-site requests, and anti-forgery tokens or origin checks make sure that the request came from your own interface. Use them together with proper authorization, and use safe methods for reads so a simple link cannot change state.`,
    mistake: 'Assuming CORS alone prevents forged requests, when the request is still sent and may still take effect.',
  },
  {
    q: 'You discover user-generated HTML is being rendered directly into the page. What security risks exist, and how would you fix it?',
    testing: 'The core XSS scenario directly from the spec.',
    answer: 'This is a classic stored XSS risk — if user content is inserted as raw HTML (like <code>v-html</code> or <code>innerHTML</code>) without sanitization, an attacker could submit a payload like a script tag or an event handler attribute that runs in another user\'s browser with their session, potentially stealing cookies/tokens or performing actions as them. The fix is to render user content as plain text by default (letting the framework escape it automatically, which Vue does for <code>{{ }}</code> interpolation), and if rich text genuinely needs to be supported, sanitize it through a dedicated library like DOMPurify before rendering it as HTML — never trust that "we validate on the way in" is enough on its own.',
    code: `<!-- Risky -->\n<div v-html="userComment"></div>\n\n<!-- Safer -->\n<div v-html="sanitize(userComment)"></div>`,
    mistake: 'Assuming backend validation alone prevents XSS — sanitization needs to happen at the point of rendering as HTML, since data can come from anywhere (including a compromised dependency or a different code path than the one that was validated).',
  },
  {
    q: 'What is XSS, and what are the main types?',
    testing: 'Foundational security vocabulary.',
    answer: 'Cross-Site Scripting is injecting malicious script into a page that then runs in another user\'s browser. Stored XSS persists the payload on the server (like a comment field) so it affects every viewer. Reflected XSS comes from something like a URL parameter echoed directly back into the page without escaping. DOM-based XSS happens entirely on the client, when JavaScript writes attacker-controlled data into the DOM unsafely, without the server ever being involved in reflecting it.',
  },
  {
    q: 'What is CSRF, and how is it mitigated?',
    testing: 'Commonly confused with XSS — tests precise understanding.',
    answer: 'Cross-Site Request Forgery tricks a logged-in user\'s browser into making a request to another site without their intent — since cookies are sent automatically with matching-domain requests, a malicious site could trigger an action on your site using the victim\'s existing session. It\'s mitigated with CSRF tokens (a value tied to the user\'s session that must be included in state-changing requests) and by setting the <code>SameSite</code> cookie attribute, which stops the cookie from being sent on cross-site requests in the first place.',
  },
  {
    q: 'What is CORS, and why does it exist?',
    testing: 'Frequently misunderstood as a security vulnerability rather than a protection.',
    answer: 'CORS (Cross-Origin Resource Sharing) is a browser mechanism that controls whether JavaScript running on one origin is allowed to read a response from a different origin. It exists to protect users — without it, any website could silently make authenticated requests to another site on your behalf and read the response. The server opts in to allowing specific origins via response headers; CORS is enforced by the browser, not the server, so it doesn\'t stop non-browser clients, and it\'s not itself an authentication or authorization mechanism.',
  },
  {
    q: 'What is a Content Security Policy (CSP), and what does it protect against?',
    testing: 'A more advanced, defense-in-depth security header.',
    answer: 'CSP is a response header that tells the browser which sources of scripts, styles, images, etc. are allowed to load and execute on the page. It\'s a strong defense-in-depth measure against XSS — even if an attacker manages to inject a script tag, a strict CSP can prevent it from executing if its source isn\'t explicitly allowed.',
    code: `Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com`,
  },
  {
    q: 'Where should you store an authentication token — cookies, localStorage, or sessionStorage — and why?',
    testing: 'Connects directly to the earlier HTML storage question, with a security lens.',
    answer: 'I lean toward an HttpOnly, Secure cookie with <code>SameSite</code> set appropriately, because JavaScript can\'t read it at all, which limits the damage an XSS vulnerability could do — an attacker\'s injected script simply can\'t exfiltrate a token it can\'t see. localStorage/sessionStorage are directly readable by any script on the page, which is a real risk if there\'s ever an XSS bug, even an unrelated one in a third-party script.',
  },
  {
    q: 'What is input sanitization, and how is it different from validation?',
    testing: 'Precision on two frequently conflated security practices.',
    answer: 'Validation checks whether input meets expected rules (is this a valid email, is this field required) and rejects what doesn\'t qualify. Sanitization transforms potentially dangerous input into a safe form, like stripping or escaping HTML before rendering it. Both matter, and for user-generated content that will be rendered, validation alone isn\'t enough — you still need to sanitize at the point of rendering.',
  },
  {
    q: 'What is the principle of least privilege, and how does it apply to frontend authorization checks?',
    testing: 'Broader security mindset beyond a specific vulnerability class.',
    answer: 'Grant only the access actually needed for a task, nothing more by default. On the frontend, this means not exposing admin-only UI or data to a role that shouldn\'t see it, even if the actual enforcement happens server-side — hiding it on the client reduces the chance of accidental misuse and reduces what an attacker can learn just by exploring the UI, even though it\'s not a substitute for real server-side authorization.',
  },
];

/* ========================================================================
   Testing
   ======================================================================== */
const testingQuestions = [
  {
    q: 'What is the difference between unit, integration and end-to-end tests, and how do you balance them?',
    testing: 'A sensible testing strategy for frontend applications.',
    answer: `Unit tests check small pieces of logic in isolation and run fast. Integration tests check that several parts, such as a component with its store and a mocked API, work together. End-to-end tests drive the real application in a browser and verify complete user flows, but they are slower and more fragile. Use many fast tests for logic, a solid layer of component and integration tests for behavior, and a few end-to-end tests for critical journeys such as sign-in and checkout. Test behavior that users see, not implementation details.`,
    mistake: 'Testing internal implementation, so every refactor breaks tests even when behavior is unchanged.',
  },
  {
    q: 'You inherit a Vue application with zero tests. How would you introduce testing?',
    testing: 'Directly from the spec — a realistic, common situation.',
    answer: 'I wouldn\'t try to add full coverage everywhere at once — that stalls real work and rarely finishes. I\'d start with the highest-risk, highest-traffic flows (checkout, login, whatever the business cares most about not breaking), write a few end-to-end tests for those critical paths first since they catch the most damaging regressions with the least test-writing effort, then layer in unit tests for complex, pure logic (utility functions, composables) as I touch that code anyway. I\'d also set a team norm that new code includes tests, so coverage grows naturally over time instead of becoming a separate, deprioritized project.',
  },
  {
    q: 'What is the difference between unit, integration, and end-to-end testing?',
    testing: 'Foundational testing vocabulary, still worth confirming precisely.',
    answer: 'Unit tests check a single function or component in isolation, usually with dependencies mocked — fast and focused. Integration tests check how several units work together, like a component with its real child components or a composable with the store. End-to-end tests drive the app through a real (or close-to-real) browser, exercising actual user flows across the whole stack — slowest but gives the most confidence that the real feature works.',
  },
  {
    q: 'What is mocking, and when would you avoid it?',
    testing: 'Testing judgment, not just tool usage.',
    answer: 'Mocking replaces a real dependency (an API call, a module) with a controlled fake so a test can run quickly and deterministically without hitting a real network or database. I avoid over-mocking when it starts testing the mock\'s behavior instead of the real code\'s behavior — if I mock so much of a component\'s dependencies that the test can\'t actually catch a real integration bug, the test has stopped providing real confidence.',
  },
  {
    q: 'How would you test a Vue component that makes an API call?',
    testing: 'Practical component-testing pattern.',
    answer: 'I\'d mock the API module at the test level so the test controls exactly what response comes back, then assert on the rendered output for each state — loading, success, and error — rather than testing the real network call, which would make the test slow and flaky.',
    code: `vi.mock('@/api/users', () => ({ getUser: vi.fn().mockResolvedValue({ name: 'Alex' }) }));\n\ntest('renders user name after load', async () => {\n  const wrapper = mount(UserCard, { props: { id: 1 } });\n  await flushPromises();\n  expect(wrapper.text()).toContain('Alex');\n});`,
  },
  {
    q: 'What does test coverage actually measure, and why isn\'t 100% coverage the goal?',
    testing: 'Shows mature judgment about metrics versus real quality.',
    answer: 'Coverage measures which lines/branches ran during tests — it says nothing about whether the test actually asserted anything meaningful. A test can execute a line without checking its output and still count as "covered." I treat coverage as a tool to spot obviously untested areas, not as a target to chase to 100%, since that often produces low-value tests written just to move the number.',
  },
  {
    q: 'What is regression testing, and how do you decide what should be covered by it?',
    testing: 'Connects testing strategy to real production stability.',
    answer: 'Regression testing re-runs existing tests to catch cases where a new change accidentally breaks previously working behavior. I prioritize covering bugs that have happened before — if something broke once in production, I add a test for that exact case so it can never silently regress again, which tends to be a very efficient way to build a meaningful regression suite over time.',
  },
];

/* ========================================================================
   Debugging Scenarios (type: 'debug')
   ======================================================================== */
const debuggingScenarios = [
  {
    title: 'Button click does nothing in one browser only',
    symptoms: 'A button works in most browsers, but in one browser the click appears to do nothing and no error is visible.',
    causes: 'A newer JavaScript or DOM API unsupported in that browser throws an error inside the handler; an overlay element is covering the button; a CSS rule changes pointer events; an extension or setting interferes.',
    investigation: 'Open the console in the affected browser and look for errors when clicking. Use the element inspector to check which element receives the click and whether pointer-events or an overlay is involved.',
    devtools: 'Console, Elements panel with the click target highlighted, and the compatibility information for any API used in the handler.',
    solution: 'Replace or polyfill the unsupported API, fix the overlay or style that blocks the click, and verify in the affected browser.',
    prevention: 'Define supported browsers, test them regularly and add a lint or build target check for unsupported features.',
  },
  {
    title: 'A list renders slowly after loading a few thousand items',
    symptoms: 'Scrolling and typing in a filter field feel laggy once the list grows, and the page freezes briefly on load.',
    causes: 'Rendering every item to the DOM at once, expensive work inside each item, filtering on every keystroke and unnecessary re-renders of unchanged rows.',
    investigation: 'Record a performance profile while filtering and scrolling. Look at scripting and rendering time, the number of DOM nodes and which components re-render.',
    devtools: 'Performance panel, the Vue devtools component timeline, and memory or DOM node counts.',
    solution: 'Virtualize the list, paginate or limit results, debounce filter input, memoize derived data and avoid recalculating per row.',
    prevention: 'Test with realistic data volumes and set a budget for the main interactions.',
  },
  {
    title: 'Page is blank after deployment',
    symptoms: 'The site loads a blank white page in production, but worked fine locally and in staging.',
    causes: 'A JavaScript error early in the bundle breaking the whole app (one error can halt all subsequent execution); a wrong base path/public path config so assets 404; an environment variable that\'s missing or empty in production only; a routing mismatch between the server and the SPA\'s history mode.',
    investigation: 'Open the browser console first — this almost always shows the actual error immediately. Check the Network tab for any 404s on JS/CSS files, which points to a path/base config issue rather than a code bug.',
    devtools: 'Console for the thrown error and stack trace; Network tab filtered to JS/CSS to spot 404s; compare the failing environment\'s env vars against a working one.',
    solution: 'Fix the specific error shown in the console (usually a null reference from an env-dependent value), or correct the base/public path config so assets resolve correctly in production.',
    prevention: 'Add a production build smoke test to CI that actually loads the built app, not just that the build command exits with code 0.',
  },
  {
    title: 'API works locally but fails in production',
    symptoms: 'Requests succeed on localhost but return errors (or are blocked entirely) once deployed.',
    causes: 'A CORS misconfiguration specific to the production domain; an environment-specific API base URL that\'s wrong or still pointing at localhost; a missing production environment variable (API key, auth secret); different network/firewall rules in production blocking the request.',
    investigation: 'Check the Network tab response — a CORS failure shows a specific browser error referencing the policy, which is different from a generic failed request. Confirm the actual URL being called in production matches what\'s expected.',
    devtools: 'Network tab for the request/response and any CORS error text in the console; compare configured env vars per environment.',
    solution: 'Add the production origin to the server\'s allowed CORS origins, or fix the misconfigured base URL/env variable for that environment.',
    prevention: 'Keep environment configuration in one clearly documented place, and verify it as part of the deployment checklist rather than discovering it after shipping.',
  },
  {
    title: 'CSS works in Chrome but breaks in Safari',
    symptoms: 'Layout looks correct in Chrome/Edge but is visibly broken in Safari — spacing, flex behavior, or a feature not rendering at all.',
    causes: 'Use of a CSS feature not yet supported (or with different default behavior) in Safari, like certain gap support in flexbox historically, or a vendor-prefix requirement; a WebKit-specific flexbox/grid bug.',
    investigation: 'Check caniuse.com for the specific property in question against Safari\'s supported version. Reproduce in Safari\'s own DevTools (or BrowserStack if Safari isn\'t available locally) rather than guessing from Chrome alone.',
    devtools: 'Safari Web Inspector directly, or a cross-browser testing tool if on Windows/Linux without access to Safari.',
    solution: 'Add the needed vendor prefix, use a supported alternative property, or add a small Safari-specific CSS fallback guarded by a feature query (<code>@supports</code>).',
    prevention: 'Include Safari in the regular cross-browser QA pass before release, not just after a bug report comes in.',
  },
  {
    title: 'A Vue component is rendering repeatedly',
    symptoms: 'A component (or its children) seems to re-render constantly, sometimes visible as flickering or degraded performance.',
    causes: 'A computed property or object/array literal being recreated with a new reference on every render, which breaks downstream equality checks; a watcher with <code>deep: true</code> reacting to its own side effect, creating a loop; a parent passing a new inline function/object as a prop every render.',
    investigation: 'Use Vue Devtools\' component inspector to see which component is re-rendering and how often, then trace which reactive dependency is changing by temporarily logging inside a watcher/computed.',
    devtools: 'Vue Devtools component/timeline panel; temporary console.trace() inside the suspect watcher or computed.',
    solution: 'Stabilize the reference (memoize the object, move it out of the render path) or narrow the watcher to the specific property actually needed instead of a deep watch on the whole object.',
    prevention: 'Default to narrow, specific watchers and computed properties instead of broad deep watches, and review new watchers in code review with this failure mode in mind.',
  },
  {
    title: 'Memory usage keeps increasing',
    symptoms: 'The browser tab\'s memory grows over time during normal use, eventually causing slowdowns or a crash in long sessions.',
    causes: 'Event listeners or timers added on mount without being removed on unmount; a growing array/cache with no eviction; closures holding references to large objects or detached DOM nodes.',
    investigation: 'Take heap snapshots in DevTools at two points in time doing the same repeated action (e.g., open/close a modal 10 times) and compare — objects whose count keeps growing point directly at the leak.',
    devtools: 'Memory tab — heap snapshot comparison; Performance monitor for a live memory graph while interacting with the app.',
    solution: 'Add the missing cleanup in <code>onUnmounted</code>/<code>beforeDestroy</code> for whatever was set up in the mount hook, and cap any unbounded in-memory cache.',
    prevention: 'Treat "every addEventListener/setInterval needs a matching cleanup" as a code review checklist item.',
  },
  {
    title: 'Modal cannot be closed',
    symptoms: 'Clicking the close button, pressing Escape, or clicking outside the modal doesn\'t close it.',
    causes: 'The close handler is bound to a stale piece of state; an event listener was never attached due to a timing bug (added before the element existed); an overlapping element is intercepting the click before it reaches the intended target.',
    investigation: 'Use the Elements panel to confirm the click actually lands on the expected element — hover highlighting shows what\'s really on top, which can reveal an invisible overlay stealing the click.',
    devtools: 'Elements panel to inspect z-index/stacking and verify event listeners attached (Event Listeners tab).',
    solution: 'Fix the binding/timing bug, or correct the stacking/overlap so the intended element actually receives the click.',
    prevention: 'Centralize modal open/close logic in one composable so every modal in the app shares the same tested close behavior instead of each one reimplementing it slightly differently.',
  },
  {
    title: 'Mobile menu doesn\'t work',
    symptoms: 'The hamburger menu doesn\'t open, or opens but doesn\'t close, on mobile/touch devices specifically.',
    causes: 'A hover-based interaction that has no touch equivalent; a click handler relying on a desktop-only event; viewport meta tag misconfiguration causing unexpected layout/touch target issues; z-index/overlay stacking hiding the menu behind other content on small screens.',
    investigation: 'Use the device toolbar/responsive mode and actually click (not hover) through the flow at the real breakpoint, since desktop testing with a mouse can mask touch-specific issues.',
    devtools: 'Device toolbar with touch simulation enabled; Elements panel to confirm the menu isn\'t rendered behind another element at that breakpoint.',
    solution: 'Make the trigger a real click/tap handler rather than relying on hover, and confirm stacking/positioning at the actual mobile breakpoint.',
    prevention: 'Include real mobile/touch testing (not just a resized browser window) in the QA checklist for any navigation change.',
  },
  {
    title: 'Images load slowly',
    symptoms: 'Pages feel slow specifically because images take a long time to appear, especially on slower connections.',
    causes: 'Unoptimized, oversized image files; no lazy loading, so every image on the page competes for bandwidth immediately; missing responsive image sizing, serving a huge desktop image even to a small mobile viewport.',
    investigation: 'Network tab sorted by size/time to identify the worst offenders; check actual rendered size versus natural file dimensions to spot oversized originals.',
    devtools: 'Network tab (filter: Img); Lighthouse\'s image-related audits, which flag this directly.',
    solution: 'Compress and resize images appropriately, serve modern formats (WebP/AVIF), and add <code>loading="lazy"</code> for below-the-fold images.',
    prevention: 'Add an image optimization step to the build pipeline so oversized assets can\'t reach production unnoticed.',
  },
  {
    title: 'User loses form data after navigation',
    symptoms: 'A user fills out a long form, navigates away (intentionally or by accident) and back, and finds the form empty again.',
    causes: 'Form state lives only in local component state that gets destroyed when the component unmounts on navigation; no persistence layer (session storage, a store, or a backend draft) backing the form.',
    investigation: 'Confirm whether the state is component-local versus store-backed, and check if the route change actually destroys and recreates the component.',
    devtools: 'Vue Devtools to inspect whether the component (and its state) is destroyed on navigation.',
    solution: 'Persist in-progress form state to sessionStorage or a store that survives the route change, or warn the user with a route guard before navigating away from unsaved changes.',
    prevention: 'For any form expected to take more than a minute to fill out, build in autosave or a navigation guard from the start rather than retrofitting it after a complaint.',
  },
  {
    title: 'Application crashes for only some users',
    symptoms: 'Most users are unaffected, but a subset consistently hits a crash or broken state.',
    causes: 'A code path depending on a browser feature not supported in their specific browser/version; locale/language-specific formatting assumptions breaking for certain regions; a specific data shape from the API (like a null field) that only occurs for certain accounts.',
    investigation: 'Correlate crash reports (via an error tracking tool like Sentry) with browser, locale, and account data to find the common factor among affected users, rather than trying to reproduce blind.',
    devtools: 'Error tracking tool\'s breadcrumbs/context; reproduce locally once the common factor (browser version, locale, data shape) is identified.',
    solution: 'Add the missing null/undefined guard, feature-detect instead of assuming support, or fix the locale-specific formatting bug.',
    prevention: 'Add defensive handling for "optional" API fields by default, and test with at least one non-default locale during development.',
  },
  {
    title: 'Authentication randomly fails',
    symptoms: 'Users are intermittently logged out or denied access without a clear, consistent trigger.',
    causes: 'A race condition between an expiring token and a refresh flow that isn\'t properly queued, causing some requests to fire with a stale token; clock skew between client and server affecting token expiry checks; multiple tabs each trying to refresh the token independently and invalidating each other\'s refresh.',
    investigation: 'Check the Network tab for 401s and the timing of the token refresh relative to the failing request; check if multiple tabs are open when it occurs.',
    devtools: 'Network tab timeline to see request ordering around a 401; application storage panel to inspect the token\'s actual expiry.',
    solution: 'Centralize refresh behind a single in-flight promise for concurrent requests within one JavaScript context only. That promise does not coordinate tabs. Use a reviewed server concurrency/rotation policy as the correctness boundary; supported Web Locks can serialize cooperating same-origin tabs, while BroadcastChannel can notify session changes but is not a lock. Bound retries, never broadcast credentials and reauthenticate when renewal is genuinely invalid.',
    prevention: 'Treat auth/token refresh as shared, carefully tested infrastructure code, not something re-implemented ad hoc per feature.',
  },
  {
    title: 'Build suddenly fails in CI/CD',
    symptoms: 'The build works locally but fails in the CI pipeline, blocking deployment.',
    causes: 'A dependency version mismatch between local and CI (no lockfile committed, or CI installing fresh without respecting it); an environment variable set locally but missing in CI; a case-sensitivity issue in an import path that only matters on CI\'s Linux file system versus a developer\'s case-insensitive OS.',
    investigation: 'Read the actual CI log output carefully — the real error is almost always there, just easy to miss among noise. Compare the Node/package manager version locally versus what CI uses.',
    devtools: 'CI log output; reproduce locally with the same Node version and a clean install using the lockfile.',
    solution: 'Fix the import path casing, commit/respect the lockfile, or add the missing CI environment variable.',
    prevention: 'Make local development use the same Node version and clean-install process as CI (e.g., via an .nvmrc and committed lockfile) to avoid "works on my machine" drift.',
  },
  {
    title: 'CSS styles are not applied',
    symptoms: 'A style rule appears to be ignored — the expected visual change simply doesn\'t show up.',
    causes: 'A more specific selector elsewhere overriding it; the class name has a typo or doesn\'t match due to dynamic class binding logic; the stylesheet isn\'t loaded at all due to a build/import issue; the element is being styled, but a parent\'s overflow or layout property is clipping/hiding the visual result.',
    investigation: 'Inspect the element directly and check the Styles panel — it shows every matching rule and which one is struck through as overridden, which answers the question immediately instead of guessing.',
    devtools: 'Elements panel > Styles pane (shows cascade and specificity winner/loser directly).',
    solution: 'Increase specificity appropriately, fix the class name/binding, or remove the conflicting override.',
    prevention: 'A consistent naming convention (like BEM) significantly reduces how often two rules accidentally collide in the first place.',
  },
  {
    title: 'Vue hydration mismatch occurs',
    symptoms: 'A console warning about hydration mismatch appears in a Nuxt/SSR app, sometimes with a visible flash of incorrect content.',
    causes: 'Rendering something environment-dependent (window size, localStorage value, current date/time) during the initial render instead of after mount; conditional rendering based on data that differs between server and client.',
    investigation: 'Read exactly which component/element the warning names, and check what data it depends on that could differ between server and client render.',
    devtools: 'Browser console (the warning names the specific mismatch); compare "view source" (server output) against the live DOM after hydration.',
    solution: 'Move browser-only logic into <code>onMounted</code>, or wrap the browser-dependent part in <code>&lt;ClientOnly&gt;</code> so it only renders after hydration.',
    prevention: 'Treat any use of <code>window</code>/<code>localStorage</code>/<code>Date.now()</code> during setup/render as a flag to double-check SSR safety before merging.',
  },
  {
    title: 'API returns stale data',
    symptoms: 'The UI shows outdated information even though the underlying data has definitely changed on the server.',
    causes: 'An overly aggressive cache layer (browser HTTP cache, a client-side data cache, or a CDN) serving an old response; a component not re-fetching when a relevant parameter (like a route id) changes because the fetch was only triggered once on mount.',
    investigation: 'Check the actual response in the Network tab (look at response headers and whether it was served "from disk cache"/"from memory cache") versus hitting the API directly to confirm what the server currently returns.',
    devtools: 'Network tab (cache status column); compare direct API call result versus what the app displays.',
    solution: 'Fix the cache invalidation/headers, or make the data-fetching composable re-run when its relevant reactive input changes instead of only on initial mount.',
    prevention: 'Be deliberate about what\'s cached and for how long, and always re-fetch (or invalidate) after a mutation that affects the same resource.',
  },
];

/* ========================================================================
   System Design
   ======================================================================== */
const systemDesignQuestions = [
  {
    q: 'How would you design the frontend of a large e-commerce product listing page?',
    testing: 'Clarifying requirements and covering rendering, data, performance and UX.',
    answer: `Start by clarifying requirements: traffic, SEO needs, filters, sorting, personalization and devices. Render the first page on the server or ahead of time for SEO and a fast first paint, then hydrate. Keep filters, sort and page in the URL so views are shareable and the back button works. Use paginated or cursor-based API calls, cancel outdated requests and debounce filter changes. Optimize images with responsive sizes and lazy loading below the fold, and reserve space to avoid layout shift. Cache results sensibly, handle loading, empty and error states, ensure keyboard and screen reader support and track performance and conversion events.`,
    mistake: 'Jumping to a library choice without clarifying requirements and trade-offs.',
  },
  {
    q: 'Design a scalable e-commerce frontend.',
    testing: 'Broad system design, checks whether you think in layers (architecture, state, performance, security) instead of just listing pages.',
    answer: `I'd split it into a public, SEO-critical side (product listing, product detail, category pages) rendered with SSR/SSG since search visibility and fast first paint matter a lot for conversion, and a logged-in side (cart, checkout, account) that can lean more on client-side rendering since SEO doesn't matter there. Components: a shared product card, a cart composable/store that syncs with the server so the cart survives a refresh, and a checkout flow broken into small, independently validated steps. For the API layer, I'd use a thin service layer so the UI doesn't call fetch directly everywhere, which makes it easy to add caching, retries and error handling consistently. For performance, image optimization and route-based code splitting matter most since product images dominate page weight. For security, payment details should never touch application code directly — delegate to a PCI-compliant provider's hosted fields/iframe. For testing, I'd prioritize end-to-end coverage on checkout specifically, since that's the single most costly flow to have break silently.`,
  },
  {
    q: 'Design a dashboard that needs to display 100,000 records.',
    testing: 'Performance-focused system design — a very common senior ask.',
    answer: 'The core idea is: never render 100,000 DOM nodes at once. I\'d paginate or virtualize the list — virtual scrolling renders only the rows currently visible in the viewport, recycling DOM nodes as the user scrolls, which keeps the DOM small regardless of the total data size. Filtering and sorting should happen server-side for a data set this large, rather than shipping all 100,000 records to the client and processing in JS. I\'d debounce filter inputs so the API isn\'t hit on every keystroke, and cache recent query results client-side so flipping back to a previous filter doesn\'t re-fetch unnecessarily. For state, I\'d keep the current page/filter/sort state in the URL so it\'s shareable and survives a refresh.',
  },
  {
    q: 'Design a reusable component library for a company with multiple product teams.',
    testing: 'Component architecture at an organizational scale.',
    answer: 'I\'d structure it as a separately versioned package (published internally via a private registry) rather than copy-pasted between repos, so updates can be adopted deliberately per team instead of silently diverging. Components should be built around composition — accepting slots/props for flexibility rather than hardcoding every variant — with design tokens (colors, spacing, typography) as the single source of truth so the whole library can be re-themed centrally. I\'d document every component with usage examples and accessibility notes, and enforce visual regression testing so a change to a shared button doesn\'t silently break ten different product teams\' UIs.',
  },
  {
    q: 'Design a frontend architecture to support multiple teams working on the same product.',
    testing: 'Organizational/architectural scaling, not just technical.',
    answer: 'I\'d split the codebase along clear domain boundaries (e.g., checkout, catalog, account) so each team owns a vertical slice end-to-end, rather than everyone editing one shared monolith of components. Shared primitives (buttons, inputs, layout) live in a central design-system package consumed by every team. For very large orgs, this might extend to a micro-frontend approach where each domain is independently deployable, though I\'d only reach for that complexity once the team-count and deploy-friction genuinely justify it — for a lot of teams, well-organized modules inside one app with clear ownership boundaries and good CI are enough.',
  },
  {
    q: 'Design a real-time notification system for a web application.',
    testing: 'Real-time architecture, connects to WebSockets/polling trade-offs.',
    answer: 'I\'d use WebSockets (or a managed service built on them) for true real-time push, falling back to polling only if WebSockets aren\'t available in a given environment. On the frontend, a dedicated store/composable owns the connection and exposes a simple reactive notification list to the rest of the app, so components don\'t each manage their own socket connection. I\'d handle reconnect logic explicitly (exponential backoff), deduplicate notifications that might arrive twice during a reconnect, and persist a read/unread state so a page refresh doesn\'t lose which notifications were already seen.',
  },
  {
    q: 'Design a large form with autosave.',
    testing: 'Connects directly to the "user loses form data" debugging scenario, but as a proactive design.',
    answer: 'I\'d break the form into logical sections so validation and autosave can happen per-section instead of all-or-nothing. Autosave is debounced (save a few seconds after the user stops typing, not on every keystroke) and shows a clear, unobtrusive status indicator ("Saving...", "Saved", "Error saving") so the user trusts the system instead of wondering if their work is safe. I\'d persist in-progress state locally (sessionStorage or a draft endpoint) as a safety net in case the autosave request itself fails, and handle conflict scenarios if the same draft could theoretically be edited from two tabs.',
  },
  {
    q: 'Design a scalable Vue application architecture for long-term maintainability.',
    testing: 'Ties together everything — architecture, state, performance, testing — into one coherent answer.',
    answer: 'I\'d organize by feature/domain folders rather than by file type, so everything related to one feature lives together and is easy to find or remove. State management (Pinia) is used for genuinely shared, cross-feature state only — most state stays local to its component or feature. Composables handle reusable logic, a thin API service layer handles all network calls so error handling/retries are consistent, and route-based code splitting keeps the initial bundle small as the app grows. I\'d also set up linting, type checking and a baseline of tests in CI from day one, since retrofitting those onto a large app later is far more expensive than maintaining them continuously.',
  },
  {
    q: 'Design the caching and error-handling strategy for a frontend that talks to several backend services.',
    testing: 'API-layer architecture at a system level.',
    answer: 'I\'d centralize all network access behind a single API layer so caching, retries, and error normalization are handled in one place instead of duplicated per feature. Each service\'s errors get mapped into a consistent shape the UI can rely on, so a component doesn\'t need to know which backend failed, only that it did and what the user-facing message should be. Caching policy depends on the data: short-lived in-memory cache for data that changes often but is read frequently (like user profile), no cache for anything transactional (like placing an order), and a longer cache with explicit invalidation for rarely-changing reference data (like country lists).',
  },
];

/* ========================================================================
   Coding Problems (type: 'coding')
   ======================================================================== */
const codingProblems = [
  {
    problem: 'Implement a <code>debounce(fn, wait)</code> function.',
    approach: 'Return a wrapper function that clears any pending timer on each call and schedules a new one, so <code>fn</code> only actually runs once the calls stop for <code>wait</code> milliseconds.',
    jsCode: `function debounce(fn, wait) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), wait);\n  };\n}`,
    tsCode: `function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): (...args: Parameters<T>) => void {\n  let timer: ReturnType<typeof setTimeout>;\n  return function (this: unknown, ...args: Parameters<T>) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), wait);\n  };\n}`,
    explanation: 'The closure keeps the timer id alive between calls. Each new call cancels the previous timer, so only the last call within the quiet period actually executes.',
    complexity: 'O(1) per call.',
    followup: 'How would you add a "leading edge" option so it fires immediately on the first call too?',
  },
  {
    problem: 'Implement a <code>throttle(fn, limit)</code> function.',
    approach: 'Track whether we\'re currently "in cooldown." Call immediately the first time, then ignore calls until the cooldown window passes.',
    jsCode: `function throttle(fn, limit) {\n  let inCooldown = false;\n  return function (...args) {\n    if (inCooldown) return;\n    fn.apply(this, args);\n    inCooldown = true;\n    setTimeout(() => (inCooldown = false), limit);\n  };\n}`,
    tsCode: `function throttle<T extends (...args: any[]) => void>(fn: T, limit: number): (...args: Parameters<T>) => void {\n  let inCooldown = false;\n  return function (this: unknown, ...args: Parameters<T>) {\n    if (inCooldown) return;\n    fn.apply(this, args);\n    inCooldown = true;\n    setTimeout(() => (inCooldown = false), limit);\n  };\n}`,
    explanation: 'This leading-only throttle runs immediately, then drops calls during cooldown. It limits frequency but does not guarantee execution at regular intervals when no calls arrive, and it does not deliver a trailing call. The minimal version assumes the callback does not throw or reenter the wrapper.',
    complexity: 'O(1) per call.',
    followup: 'What\'s the difference in behavior between "leading" and "trailing" throttle?',
  },
  {
    problem: 'Implement a deep clone function for plain objects/arrays.',
    approach: 'Recursively copy each property; for modern environments, prefer the built-in <code>structuredClone</code>.',
    jsCode: `function deepClone(value) {\n  if (value === null || typeof value !== 'object') return value;\n  if (Array.isArray(value)) return value.map(deepClone);\n  return Object.fromEntries(\n    Object.entries(value).map(([k, v]) => [k, deepClone(v)])\n  );\n}\n\n// Modern alternative: structuredClone(value) for its supported types.`,
    tsCode: `function deepClone<T>(value: T): T {\n  if (value === null || typeof value !== 'object') return value;\n  if (Array.isArray(value)) return value.map(deepClone) as unknown as T;\n  return Object.fromEntries(\n    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deepClone(v)])\n  ) as T;\n}`,
    explanation: 'Primitives are returned as-is since they\'re already copied by value. Objects/arrays are recursively rebuilt so nested references aren\'t shared with the original.',
    complexity: 'O(n) where n is the total number of nested properties.',
    followup: 'How would this naive version break on circular references, and how would structuredClone handle it differently?',
  },
  {
    problem: 'Flatten a nested array to a given depth (or fully flatten).',
    approach: 'Use the built-in <code>Array.prototype.flat(depth)</code>, or implement it manually with recursion for full control.',
    jsCode: `function flatten(arr, depth = Infinity) {\n  return depth > 0\n    ? arr.reduce((acc, item) =>\n        acc.concat(Array.isArray(item) ? flatten(item, depth - 1) : item), [])\n    : arr.slice();\n}`,
    tsCode: `function flatten(arr: readonly unknown[], depth = Infinity): unknown[] {\n  return depth > 0\n    ? arr.reduce<unknown[]>((acc, item) =>\n        acc.concat(Array.isArray(item) ? flatten(item, depth - 1) : item), [])\n    : arr.slice();\n}`,
    explanation: 'Each recursive call reduces the remaining depth by one, stopping either when depth runs out or there\'s nothing left to flatten.',
    complexity: 'Repeated concat copies growing prefixes: O(n²) worst-case time even on a flat n-element input, not O(n). With d active array levels, a conservative time bound is O(n² + nd) and retained intermediate arrays/stack O(nd + d); flat input uses O(n) peak space but O(n²) cumulative copying. Prefer a push-based traversal for linear output construction.',
    followup: 'How would you flatten an array without recursion, to avoid a stack overflow on extremely deep nesting?',
  },
  {
    problem: 'Implement a <code>groupBy(array, keyFn)</code> utility.',
    approach: 'Reduce the array into an object keyed by the result of <code>keyFn</code> for each item.',
    jsCode: `function groupBy(array, keyFn) {\n  return array.reduce((acc, item) => {\n    const key = keyFn(item);\n    (acc[key] ??= []).push(item);\n    return acc;\n  }, Object.create(null));\n}\n// groupBy(users, u => u.role)`,
    tsCode: `function groupBy<T, K extends PropertyKey>(array: readonly T[], keyFn: (item: T) => K): Partial<Record<K, T[]>> {\n  const groups = Object.create(null) as Partial<Record<K, T[]>>;\n  return array.reduce((acc, item) => {\n    const key = keyFn(item);\n    (acc[key] ??= []).push(item);\n    return acc;\n  }, groups);\n}`,
    explanation: 'A null-prototype accumulator makes __proto__, constructor and toString ordinary group keys rather than inherited properties. Nullish assignment initializes each bucket once. The TypeScript return is Partial because keys with no matching input are absent; asserting a complete Record would falsely claim every possible key exists.',
    complexity: 'O(n).',
    followup: 'How would you adapt this to group by multiple keys at once (a composite key)?',
  },
  {
    problem: 'Remove duplicates from an array (primitives, then objects by a key).',
    approach: 'For primitives, a <code>Set</code> is the simplest solution. For objects, dedupe using a Map keyed by whatever uniquely identifies each item.',
    jsCode: `const uniquePrimitives = (arr) => [...new Set(arr)];\n\nfunction uniqueBy(arr, keyFn) {\n  const seen = new Map();\n  for (const item of arr) {\n    const key = keyFn(item);\n    if (!seen.has(key)) seen.set(key, item);\n  }\n  return [...seen.values()];\n}`,
    tsCode: `const uniquePrimitives = <T>(arr: T[]): T[] => [...new Set(arr)];\n\nfunction uniqueBy<T, K>(arr: T[], keyFn: (item: T) => K): T[] {\n  const seen = new Map<K, T>();\n  for (const item of arr) {\n    const key = keyFn(item);\n    if (!seen.has(key)) seen.set(key, item);\n  }\n  return [...seen.values()];\n}`,
    explanation: 'A Set automatically ignores duplicate primitive values. For objects, equality by reference doesn\'t help, so we track "seen" keys explicitly using a Map that preserves insertion order.',
    complexity: 'O(n).',
    followup: 'How would you dedupe while keeping the last occurrence of each key instead of the first?',
  },
  {
    problem: 'Implement a simplified version of <code>Promise.all</code>.',
    approach: 'Track how many promises have resolved; resolve the returned promise once all have settled successfully, and reject immediately on the first rejection.',
    jsCode: `function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let completed = 0;\n    if (promises.length === 0) return resolve(results);\n    promises.forEach((p, i) => {\n      Promise.resolve(p).then((value) => {\n        results[i] = value;\n        if (++completed === promises.length) resolve(results);\n      }, reject);\n    });\n  });\n}`,
    tsCode: `function promiseAll<T>(promises: readonly (T | PromiseLike<T>)[]): Promise<Awaited<T>[]> {\n  return new Promise<Awaited<T>[]>((resolve, reject) => {\n    const results: Awaited<T>[] = [];\n    let completed = 0;\n    if (promises.length === 0) return resolve(results);\n    promises.forEach((p, i) => {\n      Promise.resolve(p).then((value) => {\n        results[i] = value;\n        if (++completed === promises.length) resolve(results);\n      }, reject);\n    });\n  });\n}`,
    explanation: 'Results are written by index, not push order, so they come back in the original order even if an earlier promise resolves later than a later one. Any single rejection rejects the whole thing immediately.',
    complexity: 'O(n) promises tracked concurrently.',
    followup: 'How would this change to implement <code>Promise.allSettled</code> instead?',
  },
  {
    problem: 'Implement a simple event emitter with <code>on</code>, <code>off</code> and <code>emit</code>.',
    approach: 'Store listeners in a map keyed by event name, each value an array of callback functions.',
    jsCode: `class EventEmitter {\n  #listeners = new Map();\n  on(event, cb) {\n    if (!this.#listeners.has(event)) this.#listeners.set(event, []);\n    this.#listeners.get(event).push(cb);\n    return () => this.off(event, cb);\n  }\n  off(event, cb) {\n    this.#listeners.set(event, (this.#listeners.get(event) || []).filter(fn => fn !== cb));\n  }\n  emit(event, ...args) {\n    (this.#listeners.get(event) || []).forEach(cb => cb(...args));\n  }\n}`,
    tsCode: `class EventEmitter<Events extends Record<string, any[]>> {\n  #listeners = new Map<keyof Events, Array<(...args: any[]) => void>>();\n  on<K extends keyof Events>(event: K, cb: (...args: Events[K]) => void) {\n    if (!this.#listeners.has(event)) this.#listeners.set(event, []);\n    this.#listeners.get(event)!.push(cb as any);\n    return () => this.off(event, cb);\n  }\n  off<K extends keyof Events>(event: K, cb: (...args: Events[K]) => void) {\n    this.#listeners.set(event, (this.#listeners.get(event) || []).filter(fn => fn !== cb));\n  }\n  emit<K extends keyof Events>(event: K, ...args: Events[K]) {\n    (this.#listeners.get(event) || []).forEach(cb => cb(...args));\n  }\n}`,
    explanation: '<code>on</code> returns an "unsubscribe" function for convenience, which is a common pattern in composables for cleanup in <code>onUnmounted</code>.',
    complexity: 'on: expected amortized O(1); off: O(k) time and O(k) replacement-array space; emit: O(k) plus listener work, with O(1) iteration overhead. Stored listeners use O(L) space across events. k is the listeners for one event; L is the total.',
    followup: 'How would you add a <code>once(event, cb)</code> method that auto-unsubscribes after the first call?',
  },
  {
    problem: 'Implement a <code>memoize(fn)</code> higher-order function.',
    approach: 'Cache results in a Map keyed by a serialized representation of the arguments.',
    jsCode: `function memoize(fn) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
    tsCode: `function memoize<T extends (...args: any[]) => any>(fn: T): T {\n  const cache = new Map<string, ReturnType<T>>();\n  return ((...args: Parameters<T>) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key)!;\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  }) as T;\n}`,
    explanation: 'Only use this minimal cache for pure, receiver-independent functions whose ordered JSON serialization uniquely represents the inputs. Functions, undefined, NaN and other unsupported values can collide or be lost; cycles throw and object key order affects the string. The cache is unbounded, and cached objects are returned by reference. Production designs need an explicit identity and eviction policy.',
    complexity: 'Every call serializes inputs: O(s) for s serialized characters, plus function cost on a miss (assuming ordinary JSON data). String hashing/lookup can also cost O(s), so a hit is not constant-time overall. Space O(total retained key lengths + cached results), with O(s) transient key storage.',
    followup: 'Why would JSON.stringify as a cache key fail for arguments that are functions, or for objects with different key order?',
  },
  {
    problem: 'Implement a <code>curry(fn)</code> function that works for any function arity.',
    approach: 'Return a function that collects arguments until it has at least as many as <code>fn.length</code>, then calls the original function.',
    jsCode: `function curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return (...more) => curried.apply(this, [...args, ...more]);\n  };\n}\nconst add3 = curry((a, b, c) => a + b + c);\nadd3(1)(2)(3); // 6`,
    tsCode: `function curry<T extends (...args: any[]) => any>(fn: T): any {\n  return function curried(this: unknown, ...args: any[]): any {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return (...more: any[]) => curried.apply(this, [...args, ...more]);\n  };\n}`,
    explanation: 'Relies on <code>fn.length</code>, the declared parameter count, to know when enough arguments have been collected to finally invoke the original function.',
    complexity: 'A partial call copies all collected arguments: O(a + b) for a previous and b new arguments, not O(1). Collecting n arguments one at a time costs O(n²) cumulative copying plus the final function cost. The latest partial retains O(n) argument slots; keeping every intermediate partial can retain O(n²) slots.',
    followup: 'Why does this approach break for functions using rest parameters or default parameter values?',
  },
  {
    problem: 'Implement a case-insensitive search/filter over an array of objects by a given field.',
    approach: 'Normalize both the query and the field value to lowercase before comparing, and use <code>includes</code> for a substring match.',
    jsCode: `function searchBy(items, field, query) {\n  const q = query.trim().toLowerCase();\n  if (!q) return items;\n  return items.filter((item) => String(item[field] ?? '').toLowerCase().includes(q));\n}`,
    tsCode: `function searchBy<T>(items: T[], field: keyof T, query: string): T[] {\n  const q = query.trim().toLowerCase();\n  if (!q) return items;\n  return items.filter((item) => String(item[field] ?? '').toLowerCase().includes(q));\n}`,
    explanation: 'Trimming and lowering both sides avoids common false negatives from casing or stray whitespace. Returning the original list for an empty query avoids an unnecessary full re-filter.',
    complexity: 'O(n) per search.',
    followup: 'How would you make this match across multiple fields, like both a name and an email?',
  },
  {
    problem: 'Implement a simple client-side pagination helper for an in-memory array.',
    approach: 'Slice the array based on the requested page and page size.',
    jsCode: `function paginate(items, page, pageSize) {\n  const start = (page - 1) * pageSize;\n  return {\n    data: items.slice(start, start + pageSize),\n    totalPages: Math.ceil(items.length / pageSize),\n  };\n}`,
    tsCode: `function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; totalPages: number } {\n  const start = (page - 1) * pageSize;\n  return {\n    data: items.slice(start, start + pageSize),\n    totalPages: Math.ceil(items.length / pageSize),\n  };\n}`,
    explanation: 'This is for client-side pagination of already-loaded data. For large datasets I\'d do this server-side instead, as discussed in the system design section.',
    complexity: 'O(pageSize) per page request.',
    followup: 'How would you adapt this for server-side, cursor-based pagination instead of offset-based slicing?',
  },
  {
    problem: 'Implement the core logic for infinite scrolling using <code>IntersectionObserver</code>.',
    approach: 'Observe a sentinel element at the bottom of the list; when it becomes visible, load the next page and append results.',
    jsCode: `function setupInfiniteScroll(sentinelEl, loadMore) {\n  const observer = new IntersectionObserver((entries) => {\n    if (entries[0].isIntersecting) loadMore();\n  }, { rootMargin: '200px' });\n  observer.observe(sentinelEl);\n  return () => observer.disconnect();\n}`,
    tsCode: `function setupInfiniteScroll(sentinelEl: Element, loadMore: () => void): () => void {\n  const observer = new IntersectionObserver((entries) => {\n    if (entries[0].isIntersecting) loadMore();\n  }, { rootMargin: '200px' });\n  observer.observe(sentinelEl);\n  return () => observer.disconnect();\n}`,
    explanation: '<code>IntersectionObserver</code> is more efficient than a scroll event listener since it doesn\'t fire on every pixel of scroll — the browser only notifies when the visibility actually crosses the threshold. The rootMargin loads the next page slightly before the sentinel is fully in view, so the user doesn\'t see a loading gap.',
    complexity: 'O(1) per intersection check (browser-optimized); O(pageSize) per load.',
    followup: 'How would you prevent duplicate loadMore calls firing if the observer fires twice in quick succession?',
  },
  {
    problem: 'Write a function that checks whether two values are deeply equal.',
    approach: 'Recursively compare primitives directly, and objects/arrays by comparing their own enumerable keys and recursing into each value.',
    jsCode: `function deepEqual(a, b) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\n  if (Array.isArray(a) !== Array.isArray(b)) return false;\n  if (Array.isArray(a) && a.length !== b.length) return false;\n  const aKeys = Object.keys(a), bKeys = Object.keys(b);\n  if (aKeys.length !== bKeys.length) return false;\n  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));\n}`,
    tsCode: `function deepEqual(a: unknown, b: unknown): boolean {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;\n  if (Array.isArray(a) !== Array.isArray(b)) return false;\n  if (Array.isArray(a) && (!Array.isArray(b) || a.length !== b.length)) return false;\n  const left = a as Record<string, unknown>, right = b as Record<string, unknown>;\n  const aKeys = Object.keys(left), bKeys = Object.keys(right);\n  if (aKeys.length !== bKeys.length) return false;\n  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && deepEqual(left[key], right[key]));\n}`,
    explanation: 'Scope: acyclic plain JSON-like data with dense arrays and own enumerable string data keys, not arbitrary JavaScript objects. This implementation also explicitly supports undefined and NaN leaves through Object.is; NaN equals NaN and signed zeros differ. Check matching own keys before reading values so a missing key cannot masquerade as an undefined value. Arrays and objects differ and object key order does not matter. Dates, Maps, Sets, class instances, accessors, symbols and cycles are outside this contract; it does not validate or compare those types correctly.',
    complexity: 'O(n) time over compared properties and leaves for the supported plain-data trees. O(n + d) worst-case auxiliary space for key arrays and recursion depth d.',
    followup: 'How would this naive implementation handle arrays, and does key order matter for objects?',
  },
  {
    problem: 'Implement a simple string template formatter: <code>format("Hello {name}", { name: "Alex" })</code>.',
    approach: 'Use a regular expression to find <code>{key}</code> placeholders and replace each with the corresponding value from the data object.',
    jsCode: `function format(template, data) {\n  return template.replace(/\\{(\\w+)\\}/g, (match, key) =>\n    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : match\n  );\n}`,
    tsCode: `function format(template: string, data: Record<string, unknown>): string {\n  return template.replace(/\\{(\\w+)\\}/g, (match, key: string) =>\n    Object.prototype.hasOwnProperty.call(data, key) ? String(data[key]) : match\n  );\n}`,
    explanation: 'The replacer function receives the matched placeholder and the captured key name; returning the original match for a missing key avoids silently rendering "undefined" in the output.',
    complexity: 'O(n) where n is the template length.',
    followup: 'How would you support nested keys, like <code>{user.name}</code>?',
  },
];

/* ========================================================================
   Original coding exercise supplements, keyed by their preserved array index.
   tests run AFTER jsCode in an async Node callback with assert supplied by
   node:assert/strict. Browser APIs below are local test doubles, not app work.
   ======================================================================== */
const originalCodingSupplements = {
  0: {
    examples: 'Calling save("draft A"), then save("draft B") before wait expires invokes fn only with "draft B", using the last call\'s receiver.',
    constraints: 'Trailing-only debounce; finite nonnegative wait within the host timer range. No cancel/flush API or promise return. Timer callback errors and rejected async results must be handled by the caller.',
    edgeCases: 'Latest arguments and this win; wait 0 still schedules a task; continuous calls postpone indefinitely; owner disposal needs a richer cancel-enabled variant.',
    tests: `let nextId = 0; const pending = new Map(), seen = [];
function setTimeout(fn, delay) { const id = ++nextId; pending.set(id, { fn, delay }); return id; }
function clearTimeout(id) { pending.delete(id); }
const save = debounce(function (text) { seen.push(this.prefix + text); }, 25);
save.call({ prefix: 'old:' }, 'A'); save.call({ prefix: 'new:' }, 'B');
assert.equal(pending.size, 1); assert.deepEqual(seen, []);
const timer = [...pending.values()][0]; assert.equal(timer.delay, 25); timer.fn();
assert.deepEqual(seen, ['new:B']);`,
  },
  1: {
    examples: 'With limit=100, calls A at t=0 and B at t=50 deliver only A; C after cooldown delivers immediately. There is no trailing B.',
    constraints: 'Leading-only cooldown; finite nonnegative delay within host range. This minimal callback must be synchronous, nonthrowing and nonreentrant; no cancellation or async-result handling.',
    edgeCases: 'First call is immediate; calls in cooldown are discarded; idle time causes no callback; wait 0 still blocks until its timer runs.',
    tests: `const pending = [], seen = [];
function setTimeout(fn, delay) { pending.push({ fn, delay }); return pending.length; }
const limited = throttle(function (n) { seen.push(this.base + n); }, 100);
limited.call({ base: 10 }, 1); limited.call({ base: 20 }, 2);
assert.deepEqual(seen, [11]); assert.equal(pending.length, 1); assert.equal(pending[0].delay, 100);
pending.shift().fn(); assert.deepEqual(seen, [11]);
limited.call({ base: 30 }, 3); assert.deepEqual(seen, [11, 33]);`,
  },
  2: {
    examples: 'Cloning { profile: { name: "Ana" }, roles: ["editor"] } produces independent nested objects and arrays; editing the clone does not edit the source.',
    constraints: 'Finite acyclic JSON-data trees: primitives, dense arrays and plain objects with own enumerable string data keys. No Dates, functions, symbols, getters, custom prototypes or alias preservation; recursion must fit the stack.',
    edgeCases: 'null and primitive leaves return unchanged; empty containers clone; an own __proto__ key stays data through Object.fromEntries; cyclic inputs overflow and are unsupported.',
    tests: `const source = { profile: { name: 'Ana' }, roles: ['editor'], missing: null };
const copy = deepClone(source); assert.deepEqual(copy, source);
assert.notEqual(copy, source); assert.notEqual(copy.roles, source.roles);
copy.profile.name = 'Bea'; assert.equal(source.profile.name, 'Ana');
assert.equal(deepClone(null), null); assert.equal(deepClone(7), 7);
const special = deepClone(JSON.parse('{"__proto__":{"safe":true}}'));
assert.equal(Object.prototype.hasOwnProperty.call(special, '__proto__'), true);
assert.equal(Object.getPrototypeOf(special), Object.prototype);`,
  },
  3: {
    examples: 'flatten([1,[2,[3]]], 1) returns [1,2,[3]]; depth 2 or the default Infinity returns [1,2,3]. Depth 0 returns a shallow copy.',
    constraints: 'Finite dense arrays, acyclic nesting, depth a nonnegative integer or Infinity; depth and sizes must fit recursion/memory limits. This concat-based educational version is not a linear-time implementation.',
    edgeCases: 'Empty arrays; empty nested arrays; limited depth retains nested references; depth 0 does not mutate or return the original top-level array. Sparse/custom-spreadable inputs are outside scope.',
    tests: `const nested = [1, [2, [3]]];
assert.deepEqual(flatten(nested, 1), [1, 2, [3]]);
assert.deepEqual(flatten(nested), [1, 2, 3]);
const shallow = flatten(nested, 0); assert.notEqual(shallow, nested); assert.equal(shallow[1], nested[1]);
assert.deepEqual(flatten([[], [[], 4]], 2), [4]); assert.deepEqual(flatten([]), []);
assert.deepEqual(nested, [1, [2, [3]]]);`,
  },
  4: {
    examples: 'Grouping users by role yields role buckets in input order. Keys such as __proto__ and constructor work without inherited-property collisions.',
    constraints: 'Finite dense array; keyFn is pure and returns a PropertyKey. Number keys are converted to strings, so 1 and "1" share a bucket; use a Map when key identity must differ.',
    edgeCases: 'Empty input yields a null-prototype object; absent keys are undefined; symbol keys work; original item references and order within groups are preserved.',
    tests: `const rows = [{ role: '__proto__', id: 1 }, { role: 'constructor', id: 2 }, { role: '__proto__', id: 3 }, { role: 'toString', id: 4 }];
const grouped = groupBy(rows, row => row.role);
assert.equal(Object.getPrototypeOf(grouped), null);
assert.deepEqual(grouped.__proto__.map(row => row.id), [1, 3]);
assert.equal(grouped.constructor[0], rows[1]); assert.equal(grouped.toString[0], rows[3]);
const key = Symbol('bucket'); assert.deepEqual(groupBy([7], () => key)[key], [7]);
assert.equal(Object.keys(groupBy([], x => x)).length, 0); assert.equal(grouped.missing, undefined);`,
  },
  5: {
    examples: 'uniquePrimitives([1,1,2]) returns [1,2]. uniqueBy([{id:1,name:"A"},{id:1,name:"B"}], x=>x.id) keeps the first record.',
    constraints: 'Finite dense arrays; Set/Map SameValueZero equality for primitive/key identity. Object keys compare by reference, not structure. keyFn must be deterministic and caller owns input mutations.',
    edgeCases: 'Empty array; repeated NaN collapses; +0 and -0 share a key; distinct object references remain distinct unless keyFn extracts the same key.',
    tests: `assert.deepEqual(uniquePrimitives([1, 1, NaN, NaN, 2]), [1, NaN, 2]);
const a = { id: 1, name: 'first' }, b = { id: 1, name: 'last' }, c = { id: 2 };
const unique = uniqueBy([a, b, c], row => row.id);
assert.deepEqual(unique, [a, c]); assert.equal(unique[0], a);
assert.deepEqual(uniqueBy([], row => row.id), []); assert.equal(uniquePrimitives([{}, {}]).length, 2);`,
  },
  6: {
    examples: 'await promiseAll([Promise.resolve(2), 3, thenable]) preserves positions regardless of settlement order. Any rejection rejects the aggregate.',
    constraints: 'Finite dense array only; accepts values, promises and PromiseLike values. Not a complete spec polyfill: no iterable/subclass handling, tuple inference or sparse-array support.',
    edgeCases: 'Empty input resolves []; thenables are assimilated; synchronous thenable errors reject; rejection does not cancel other inputs; an unsettled input can keep success pending forever.',
    tests: `let release;
const slow = new Promise(resolve => { release = resolve; });
const result = promiseAll([slow, Promise.resolve(2), 3]); release(1);
assert.deepEqual(await result, [1, 2, 3]); assert.deepEqual(await promiseAll([]), []);
assert.deepEqual(await promiseAll([{ then(resolve) { resolve(4); } }]), [4]);
const failure = new Error('one failed');
await assert.rejects(promiseAll([1, Promise.reject(failure)]), error => error === failure);
await assert.rejects(promiseAll([{ then() { throw new Error('bad thenable'); } }]), /bad thenable/);`,
  },
  7: {
    examples: 'Register on("saved", cb), emit("saved", 7), then call the returned unsubscribe; future saved emissions no longer invoke cb.',
    constraints: 'Synchronous dispatch; off removes all registrations with the same callback identity. Returned unsubscribe delegates to that same all-matching policy. Exceptions propagate and stop dispatch; async rejections are not observed.',
    edgeCases: 'Unknown event is a no-op; duplicate callbacks run twice until off removes both; off replaces the list, so removal during an existing dispatch does not cancel its captured callbacks. Added listeners wait until the next emit (forEach snapshots length).',
    tests: `const bus = new EventEmitter(), seen = [];
const cb = (id, label) => seen.push([id, label]);
const unsubscribe = bus.on('saved', cb); bus.emit('saved', 7, 'A'); unsubscribe(); bus.emit('saved', 8, 'B');
assert.deepEqual(seen, [[7, 'A']]);
bus.on('saved', cb); bus.on('saved', cb); bus.emit('saved', 9, 'C');
assert.equal(seen.length, 3); bus.off('saved', cb); bus.emit('saved', 10, 'D'); assert.equal(seen.length, 3);
assert.doesNotThrow(() => bus.emit('missing'));
bus.on('fail', () => { throw new Error('listener failure'); }); assert.throws(() => bus.emit('fail'), /listener failure/);`,
  },
  8: {
    examples: 'Memoizing (a,b)=>a+b evaluates it once for repeated memoized(2,3) calls; memoized(3,2) uses a separate serialized argument key.',
    constraints: 'Pure receiver-independent function, JSON-serializable arguments with stable key ordering and no serialization collisions in the domain. No undefined, functions, NaN, bigint, cycles, special objects or toJSON hooks. Cache has no eviction.',
    edgeCases: 'Falsy cached results must be recognized with has; thrown computations are not cached; cached objects share identity; JSON serialization cost remains on every cache hit.',
    tests: `let calls = 0;
const add = memoize((a, b) => { calls++; return a + b; });
assert.equal(add(2, 3), 5); assert.equal(add(2, 3), 5); assert.equal(calls, 1);
assert.equal(add(3, 2), 5); assert.equal(calls, 2);
let zeros = 0; const zero = memoize(() => { zeros++; return 0; }); zero(); zero(); assert.equal(zeros, 1);
let failures = 0; const fail = memoize(() => { failures++; throw new Error('not cached'); });
assert.throws(() => fail(), /not cached/); assert.throws(() => fail(), /not cached/); assert.equal(failures, 2);`,
  },
  9: {
    examples: 'For a fixed three-parameter function, curry(fn)(1)(2)(3), curry(fn)(1,2)(3) and curry(fn)(1,2,3) all invoke fn with those arguments.',
    constraints: 'Fixed declared arity from fn.length only; no rest/default parameters or placeholders. Partial calls capture the initial receiver lexically. This is a runtime example, and the TS return any deliberately does not claim type-safe curried inference.',
    edgeCases: 'A zero-arity function invokes on the first wrapper call; extra arguments pass through; no-argument partial calls keep waiting; reusing a partial creates independent branches without mutating earlier arguments.',
    tests: `const sum = curry((a, b, c) => a + b + c);
assert.equal(sum(1)(2)(3), 6); assert.equal(sum(1, 2)(3), 6); assert.equal(sum(1, 2, 3), 6);
const first = sum(1); assert.equal(first(2)(3), 6); assert.equal(first(4, 5), 10);
const withReceiver = curry(function (a, b) { return this.base + a + b; });
assert.equal(withReceiver.call({ base: 10 }, 2)(3), 15);
assert.equal(curry(() => 7)(), 7);`,
  },
  10: {
    examples: 'searchBy([{name:"Ana"},{name:"BEA"}], "name", " be ") returns only BEA. A blank query returns the exact original array.',
    constraints: 'Dense array of non-null records with trusted ordinary field values; string query. Case folding is toLowerCase, not locale-aware collation or accent normalization; coercion may call value.toString.',
    edgeCases: 'Missing/null fields search as empty text; numeric fields stringify; query whitespace trims; an empty input works; empty query preserves identity while a nonempty query returns a new filtered array.',
    tests: `const rows = [{ name: 'Ana' }, { name: 'BEA' }, { name: null }, {}, { name: 42 }];
assert.deepEqual(searchBy(rows, 'name', ' be '), [rows[1]]);
assert.equal(searchBy(rows, 'name', '  '), rows);
assert.deepEqual(searchBy(rows, 'name', '42'), [rows[4]]);
assert.deepEqual(searchBy(rows, 'name', 'missing'), []); assert.deepEqual(searchBy([], 'name', 'a'), []);`,
  },
  11: {
    examples: 'paginate([1,2,3,4,5], 2, 2) returns {data:[3,4], totalPages:3}. Page numbers are one-based.',
    constraints: 'Already-loaded finite dense array; page and pageSize must be positive integers, with safe arithmetic. This minimal helper assumes validated inputs and does not clamp pages or reject invalid arguments.',
    edgeCases: 'Empty input has totalPages 0; an out-of-range positive page returns []; last page may be shorter; slice copies the page array but retains item identities. Zero/negative sizes are outside scope.',
    tests: `assert.deepEqual(paginate([1, 2, 3, 4, 5], 2, 2), { data: [3, 4], totalPages: 3 });
assert.deepEqual(paginate([1, 2, 3, 4, 5], 3, 2), { data: [5], totalPages: 3 });
assert.deepEqual(paginate([], 1, 2), { data: [], totalPages: 0 });
assert.deepEqual(paginate([1], 3, 2), { data: [], totalPages: 1 });
const row = { id: 1 }, input = [row]; const page = paginate(input, 1, 10); assert.notEqual(page.data, input); assert.equal(page.data[0], row);`,
  },
  12: {
    examples: 'Observe a bottom sentinel with rootMargin 200px to request a page before it enters view; call the returned cleanup function when its owner unmounts.',
    constraints: 'Browser IntersectionObserver and a real sentinel element when copied into an app. Callback assumes a nonempty entries batch for its one target. loadMore must own in-flight/exhaustion guards and handle errors; this observer alone is not a pager.',
    edgeCases: 'Non-intersecting notification does nothing; repeated intersections can call loadMore repeatedly; empty/exhausted pages and stale responses are caller responsibilities; cleanup disconnects observation.',
    tests: `let observer; const sentinel = {}; let loads = 0;
class IntersectionObserver {
  constructor(callback, options) { this.callback = callback; this.options = options; observer = this; }
  observe(target) { this.target = target; }
  disconnect() { this.disconnected = true; }
}
const stop = setupInfiniteScroll(sentinel, () => { loads++; });
assert.equal(observer.target, sentinel); assert.equal(observer.options.rootMargin, '200px');
observer.callback([{ isIntersecting: false }]); assert.equal(loads, 0);
observer.callback([{ isIntersecting: true }]); observer.callback([{ isIntersecting: true }]); assert.equal(loads, 2);
stop(); assert.equal(observer.disconnected, true);`,
  },
  13: {
    examples: 'deepEqual({a:[1,null]}, {a:[1,null]}) is true; [] versus {} and {a:undefined} versus {b:undefined} are false. NaN leaves compare equal.',
    constraints: 'Acyclic plain JSON-data trees extended to undefined/NaN leaves, with dense arrays and own enumerable string data properties. No getters, proxies, symbols, Date/Map/Set/classes, cycles or prototype comparison; this is not universal JS equality.',
    edgeCases: 'null versus object; matching own keys regardless of insertion order; missing versus undefined key; arrays versus objects and differing array lengths; NaN equals itself, +0 differs from -0 by Object.is.',
    tests: `assert.equal(deepEqual({ a: [1, null] }, { a: [1, null] }), true);
assert.equal(deepEqual({ a: undefined }, { b: undefined }), false);
assert.equal(deepEqual([], {}), false); assert.equal(deepEqual([1], { 0: 1 }), false);
assert.equal(deepEqual([1], [1, 2]), false); assert.equal(deepEqual(null, {}), false);
assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
assert.equal(deepEqual(NaN, NaN), true); assert.equal(deepEqual({ n: NaN }, { n: NaN }), true);
assert.equal(deepEqual(0, -0), false); assert.equal(deepEqual({ a: 1 }, { a: 2 }), false);`,
  },
  14: {
    examples: 'format("Hello {name}, {missing}", {name:"Ana"}) returns "Hello Ana, {missing}". Only own keys replace placeholders.',
    constraints: 'Trusted string template and data record; placeholder names match JavaScript regex \\w (letters/digits/underscore), not paths or expressions. Values use String coercion. No HTML escaping: render user-controlled results as text or sanitize separately.',
    edgeCases: 'Repeated placeholders replace everywhere; absent or inherited keys remain literal; 0/false/null/undefined stringify when present; dollar signs in values stay literal because replacement uses a callback.',
    tests: `assert.equal(format('Hello {name}, {missing}', { name: 'Ana' }), 'Hello Ana, {missing}');
assert.equal(format('{x}/{x}/{zero}/{no}', { x: '$&', zero: 0, no: false }), '$&/$&/0/false');
assert.equal(format('{toString}', {}), '{toString}');
assert.equal(format('{x}', Object.create({ x: 'inherited' })), '{x}');
assert.equal(format('{x}/{n}', { x: undefined, n: null }), 'undefined/null');
assert.equal(format('{user.name}', { user: { name: 'Ana' } }), '{user.name}');`,
  },
};

Object.entries(originalCodingSupplements).forEach(([index, supplement]) => {
  Object.assign(codingProblems[Number(index)], supplement);
});

/* ========================================================================
   Scenario-Based (engineering judgment, team collaboration)
   ======================================================================== */
const scenarioQuestions = [
  {
    q: 'A production bug occurs 30 minutes before release. What do you do?',
    testing: 'Prioritization and composure under pressure.',
    answer: 'First, I assess severity and blast radius — is this a cosmetic issue or something that breaks a core flow for most users. If it\'s severe, I\'d advocate for delaying release rather than shipping a known-broken experience, since a short delay is almost always cheaper than a bad production incident. If it\'s minor, I\'d document it, get a quick team decision on whether it\'s acceptable to ship with a fast-follow fix, and make sure it\'s tracked so it doesn\'t get forgotten after release goes out.',
  },
  {
    q: 'A designer gives you a design that\'s difficult to implement responsively. How do you handle it?',
    testing: 'Cross-functional communication and pragmatic problem-solving.',
    answer: 'I\'d bring it back to the designer early, not after I\'ve already struggled silently for a day. I\'d explain the specific technical constraint (not just "this is hard") and usually come with one or two alternative approaches that preserve the design intent while being feasible — designers generally appreciate being looped in with options rather than being told no.',
  },
  {
    q: 'The backend API doesn\'t match what the frontend actually needs. What do you do?',
    testing: 'Collaboration across the stack, a daily reality for frontend engineers.',
    answer: 'I\'d raise it directly with the backend team with a concrete example of the mismatch and what shape would actually work, rather than quietly working around it in the frontend with brittle transformation logic. If a contract change isn\'t possible in time, I\'d isolate the transformation logic in one place (like the API service layer) so it\'s easy to remove once the backend is updated, instead of scattering workarounds across components.',
  },
  {
    q: 'A product manager asks for a feature that will significantly increase technical debt. How do you respond?',
    testing: 'Technical judgment combined with business-aware communication.',
    answer: 'I wouldn\'t just say no — I\'d explain the trade-off concretely: what we gain by shipping fast now, and what cost we\'re taking on later (slower future changes, higher bug risk), so the PM can make an informed call rather than an uninformed one. Sometimes the debt is genuinely worth it for a time-sensitive opportunity; my job is to make sure that\'s a deliberate decision, not an invisible one, and to get a commitment to revisit it.',
  },
  {
    q: 'A senior developer disagrees with your architecture decision. How do you handle the discussion?',
    testing: 'Handling technical disagreement professionally.',
    answer: 'I\'d treat it as a discussion about trade-offs, not a competition. I\'d ask what concerns they have specifically, since there\'s often a real, valid point behind the disagreement that I hadn\'t fully considered. If we still disagree after discussing it, I\'d suggest a quick prototype or a time-boxed spike to settle it with evidence rather than opinion, and I\'m fine deferring to their experience if their reasoning is stronger — being right matters less than the team shipping something solid.',
  },
  {
    q: 'You have a deadline tomorrow but discover significant technical debt blocking it cleanly. What do you prioritize?',
    testing: 'Pragmatism under real constraints.',
    answer: 'I\'d scope the smallest safe path to the deadline — sometimes that means a deliberate, clearly-labeled shortcut rather than a proper fix, as long as it\'s safe and I flag it openly rather than hiding it. I wouldn\'t silently take on debt without telling anyone; I\'d communicate it so the team can decide if the trade-off is acceptable, and make sure it\'s tracked as a follow-up, not forgotten.',
  },
  {
    q: 'A teammate submits code that works but is difficult to maintain. How would you review it?',
    testing: 'Code review style and team culture awareness.',
    answer: 'I\'d focus feedback on specific, actionable points rather than a vague "this is messy" — pointing at a concrete place where naming or structure would help the next reader, with a suggestion, not just a criticism. I\'d distinguish between "this will cause a bug" (blocking) and "this could be cleaner" (a suggestion, not a blocker) so the review doesn\'t stall shipping over a stylistic preference.',
  },
  {
    q: 'A page works perfectly on your machine but fails for another developer. What do you do?',
    testing: '"Works on my machine" debugging and empathy.',
    answer: 'I wouldn\'t dismiss it — I\'d get the exact error and steps from them, then compare environment differences systematically: Node/package versions, OS, browser, environment variables, and whether their local data/state differs from mine. Most "works on my machine" bugs come down to one of those concrete differences, not something mysterious.',
  },
  {
    q: 'A customer reports the website is slow, but your local environment feels fast. How do you investigate?',
    testing: 'Connects to the performance debugging scenario but from an initial report, not a known regression.',
    answer: 'I\'d get specifics from the customer — device, browser, network conditions, and what exactly feels slow — since "slow" can mean very different things. I\'d use real user monitoring data or field Core Web Vitals if available, rather than relying only on my local, fast-connection testing, and I\'d test with throttled network/CPU in DevTools to approximate their likely conditions.',
  },
  {
    q: 'A feature request changes significantly halfway through development. How do you handle it?',
    testing: 'Adaptability without silently absorbing scope creep.',
    answer: 'I\'d assess how much of the in-progress work is actually reusable versus wasted, and communicate that clearly — if the change meaningfully affects the timeline, I say so rather than quietly trying to absorb it and risk a rushed, lower-quality result. I\'d also ask what drove the change, since understanding the "why" sometimes reveals a simpler way to satisfy the new requirement using what\'s already built.',
  },
  {
    q: 'You\'re asked to estimate a task you\'ve never done before. How do you approach it?',
    testing: 'Estimation under uncertainty — a very common real situation.',
    answer: 'I\'d break it into smaller known pieces and estimate those individually rather than guessing at the whole thing, explicitly calling out the parts I\'m uncertain about and giving a range instead of false precision. If the uncertainty is high enough, I\'d propose a short time-boxed spike first to reduce the unknowns before committing to a firm estimate.',
  },
  {
    q: 'You notice a colleague is struggling but hasn\'t asked for help. What do you do?',
    testing: 'Team collaboration and emotional intelligence.',
    answer: 'I\'d check in privately and informally rather than calling it out in a group setting, since people are more likely to be honest about being stuck one-on-one. I\'d offer specific help ("want to pair on this for 20 minutes?") rather than a vague "let me know if you need anything," which is easy to ignore.',
  },
  {
    q: 'Leadership wants to adopt a new framework or major dependency. How do you evaluate whether it\'s a good idea?',
    testing: 'Technical decision-making at a strategic level.',
    answer: 'I\'d weigh it against the actual problem it solves versus the cost of adoption — team learning curve, migration effort for existing code, and long-term maintenance/community health of the dependency. I\'m cautious about adopting something just because it\'s popular; I\'d want a concrete pain point it solves better than what we already have, and ideally a small pilot before committing the whole codebase to it.',
  },
  {
    q: 'Two team members strongly disagree on a technical approach and it\'s stalling progress. How do you help resolve it?',
    testing: 'Facilitation and conflict resolution, a lead-level skill.',
    answer: 'I\'d try to separate the disagreement from the people — get both to state the concrete trade-offs of their approach, not just their preference, often in writing so it\'s less emotionally charged. If there\'s no clear technical winner, I\'d suggest a time-boxed decision process (a quick spike, or simply picking one with a plan to revisit if it doesn\'t work out) so the team isn\'t stuck indefinitely waiting for perfect consensus.',
  },
  {
    q: 'You inherit a codebase with no documentation and the original author has left. How do you get up to speed?',
    testing: 'Real-world onboarding and exploration strategy.',
    answer: 'I\'d start by running the app and exploring it as a user first, then trace the most important flows backward through the code rather than trying to read every file top to bottom. I\'d write down what I learn as I go — even rough notes become documentation for the next person — and I\'d prioritize understanding the riskiest/most complex areas first, since that\'s where I\'m most likely to introduce a bug if I touch it blind.',
  },
  {
    q: 'You realize partway through a sprint that a task is going to take much longer than estimated. What do you do?',
    testing: 'Communication and transparency around slipping timelines.',
    answer: 'I flag it as soon as I realize it, not at the end of the sprint — the earlier the team knows, the more options exist (descope, get help, adjust the sprint plan). I\'d also come with a quick explanation of why the estimate was off, since that\'s useful for calibrating future estimates, not just for this one task.',
  },
];

/* ========================================================================
   Behavioral
   ======================================================================== */
const behavioralQuestions = [
  {
    q: 'How do you stay up to date with changes in the frontend ecosystem?',
    testing: 'Continuous learning habits that are specific and realistic.',
    answer: `Describe real habits: following official documentation and release notes for the tools you use, reading a few trusted blogs or newsletters, trying new features in small side projects, and learning from code review and teammates. Explain how you decide what is worth adopting, for example by checking maturity, community support and whether it solves a problem you actually have, instead of chasing every trend. Share what you learned recently and how you applied it.`,
    mistake: 'Listing many sources you do not really follow, or saying you learn only when a project demands it.',
  },
  {
    q: 'Tell me about a time you had to learn a new technology quickly.',
    testing: 'Adaptability and a structured approach to learning.',
    answer: `Use a real example. Describe the need, how you broke the learning into steps, such as reading the official guide, building a small prototype and asking an experienced colleague, and how you applied it on the project. Share the result, what was difficult and what you would do differently. This shows that you can become productive in unfamiliar areas without waiting for formal training.`,
    mistake: 'Claiming you learned something complex overnight, or giving an example without a clear outcome.',
  },
  {
    q: 'Tell me about yourself and your frontend experience.',
    testing: 'How clearly and confidently you can summarize your experience and strengths in under two minutes.',
    answer: 'I\'d structure it as: current focus, core technical strengths, then a concrete highlight. For example: "I\'m a frontend developer with about five years of experience, mostly focused on Vue and Nuxt applications. I spend most of my time building component-driven interfaces, working closely with design and backend teams, and I particularly enjoy the performance and accessibility side of frontend work. Recently I led a Vue 2 to Vue 3 migration for a mid-sized application, which was a good mix of technical planning and cross-team coordination." Keep it tight, relevant to the role, and end somewhere that invites a natural follow-up question.',
  },
  {
    q: 'Tell me about your most challenging project.',
    testing: 'Depth of a real, specific story — use STAR (Situation, Task, Action, Result).',
    answer: 'Situation: pick a project with genuine complexity — a migration, a performance crisis, a tight deadline with ambiguous requirements. Task: what was specifically expected of you. Action: the concrete decisions you made, especially ones that show judgment, not just effort. Result: a measurable or at least clearly stated outcome, and ideally what you\'d do differently next time, which shows reflection rather than just reciting a win.',
  },
  {
    q: 'Tell me about a production bug you fixed.',
    testing: 'Debugging process and ownership under pressure.',
    answer: 'Walk through it like a real investigation: how you noticed or were alerted to it, how you reproduced it, the specific debugging steps (not just "I found it"), the fix, and what you did afterward to prevent it recurring — a test, a monitoring alert, a process change. The "prevention" part is what separates a mid-level answer from a senior one.',
  },
  {
    q: 'Tell me about a disagreement with a teammate.',
    testing: 'Maturity and collaboration skills, not conflict avoidance or steamrolling.',
    answer: 'Pick a real, specific disagreement (technical is usually safest), describe both perspectives fairly, how the conversation actually happened, and how it was resolved — ideally with mutual respect intact regardless of who was "right." Avoid a story where you were obviously right and they were obviously wrong; that undersells your collaboration skills more than it shows technical judgment.',
  },
  {
    q: 'Tell me about a technical decision you made that you\'re proud of.',
    testing: 'Technical ownership and the ability to justify a decision with trade-offs.',
    answer: 'Pick a decision with real trade-offs, not an obvious choice. Explain the alternatives you considered, why you picked what you did, and the actual outcome — including anything you\'d adjust in hindsight, since real technical maturity includes acknowledging imperfect decisions.',
  },
  {
    q: 'Tell me about a time you improved performance.',
    testing: 'Concrete, metric-backed impact — directly relevant to the performance section.',
    answer: 'Be specific: what was slow, how you diagnosed it (tools, not guesses), what you changed, and the measurable improvement (load time, bundle size, a Core Web Vital) if you have numbers. If you don\'t have exact numbers, describe the before/after experience concretely rather than vaguely saying "it got faster."',
  },
  {
    q: 'Tell me about a time you introduced a new technology or tool to your team.',
    testing: 'Influence and initiative, plus judgment about adoption risk.',
    answer: 'Explain the problem that motivated it, why you chose that specific tool over alternatives, how you got buy-in (a small pilot, a proof of concept, documentation), and the actual outcome, including any resistance you had to work through.',
  },
  {
    q: 'Why are you looking for a new opportunity?',
    testing: 'Professionalism and self-awareness — avoid badmouthing a previous employer.',
    answer: 'Frame it around what you\'re moving toward, not just what you\'re leaving — growth, scope, technology, or team structure you\'re looking for. Keep any mention of a difficult previous situation brief, factual, and non-dramatic.',
  },
  {
    q: 'Why should we hire you?',
    testing: 'Ability to connect your specific strengths to the specific role.',
    answer: 'Tie two or three concrete strengths directly to what the role actually needs, using a specific example for each rather than a generic adjective list. Generic answers like "I\'m a hard worker" are forgettable; "I\'ve specifically led a Vue 2 to 3 migration, which seems directly relevant to the modernization work you mentioned" is memorable.',
  },
  {
    q: 'What are your strengths?',
    testing: 'Self-awareness with evidence, not just a list of adjectives.',
    answer: 'Pick strengths that are actually relevant to frontend engineering (e.g., debugging methodically, communicating technical trade-offs clearly, component architecture) and back each with a brief real example, rather than reciting a generic list.',
  },
  {
    q: 'What is one area you are working on improving?',
    testing: 'Genuine self-awareness versus a rehearsed non-answer like "I work too hard."',
    answer: 'Pick something real and specific — for example, "delegating more instead of doing everything myself on a deadline" or "getting better at estimating ambiguous work" — and briefly describe what you\'re actively doing about it, which shows it\'s a real, in-progress effort, not just a line for the interview.',
  },
  {
    q: 'Tell me about a time you had to learn something new quickly.',
    testing: 'Learning agility, relevant to a fast-moving frontend ecosystem.',
    answer: 'Pick a concrete example — a new framework feature, an unfamiliar part of the codebase, a tool you hadn\'t used — and describe your actual learning process (docs, a small spike, asking someone), not just "I figured it out."',
  },
  {
    q: 'Tell me about a time you received critical feedback. How did you respond?',
    testing: 'Coachability — a strong signal for how well you\'ll grow on a new team.',
    answer: 'Describe the feedback honestly, your initial reaction (it\'s fine to admit it stung a little), and specifically what you changed afterward. A good answer shows you actually acted on it, not just "I listened politely."',
  },
  {
    q: 'Tell me about a time you had to make a decision with incomplete information.',
    testing: 'Judgment under uncertainty, common in fast-moving product environments.',
    answer: 'Describe what information you did have, how you reduced the biggest unknowns quickly (a quick experiment, asking the right person), the decision you made, and the outcome — including what you\'d do differently if the same situation came up again.',
  },
];

/* ========================================================================
   Question bank assembly
   ======================================================================== */
const questionBank = {
  html: { type: 'qa', items: htmlQuestions },
  css: { type: 'qa', items: cssQuestions },
  javascript: { type: 'qa', items: javascriptQuestions },
  'js-output': { type: 'output', items: jsOutputQuestions },
  typescript: { type: 'qa', items: typescriptQuestions },
  vue2: { type: 'qa', items: vue2Questions },
  vue3: { type: 'qa', items: vue3Questions },
  migration: { type: 'qa', items: migrationQuestions },
  nuxt: { type: 'qa', items: nuxtQuestions },
  tailwind: { type: 'qa', items: tailwindQuestions },
  scss: { type: 'qa', items: scssQuestions },
  api: { type: 'qa', items: apiQuestions },
  performance: { type: 'qa', items: performanceQuestions },
  accessibility: { type: 'qa', items: accessibilityQuestions },
  git: { type: 'qa', items: gitQuestions },
  security: { type: 'qa', items: securityQuestions },
  testing: { type: 'qa', items: testingQuestions },
  debugging: { type: 'debug', items: debuggingScenarios },
  'system-design': { type: 'qa', items: systemDesignQuestions },
  coding: { type: 'coding', items: codingProblems },
  scenario: { type: 'qa', items: scenarioQuestions },
  behavioral: { type: 'qa', items: behavioralQuestions },
};

// Merge before practice assembly; existing banks keep their original array identity.
{
  const practiceIndex = topics.findIndex((topic) => topic.group === 'Practice');
  topics.splice(practiceIndex < 0 ? topics.length : practiceIndex, 0, ...seniorExpansion.topics);
  for (const { id } of seniorExpansion.topics) {
    questionBank[id] = { type: 'qa', items: [] };
  }
  for (const [id, items] of Object.entries(seniorExpansion.additions)) {
    questionBank[id].items.push(...items);
  }
  codingProblems.push(...seniorCodingProblems);
}

/* ========================================================================
   Mock interview — practice mode rounds
   Pulls real questions already written above so content stays consistent.
   ======================================================================== */
function findItem(bank, matchText) {
  return bank.find((item) => {
    const haystack = item.q || item.problem || item.title || '';
    return haystack.includes(matchText);
  });
}

function toPracticeQuestion(item, checklist) {
  const questionText = item.q || item.problem || item.title;
  // Trusted authored prose only: never inject a raw solution string as HTML.
  const modelAnswer = item.answer || [item.approach, item.explanation, item.complexity].filter(Boolean).join('\n\n') || item.solution || '';
  return { question: questionText, checklist, modelAnswer };
}

const practiceRounds = [
  {
    title: 'HTML + CSS',
    questions: [
      toPracticeQuestion(
        findItem(htmlQuestions, 'inherit a website where everything is built using'),
        ['Names concrete problems: accessibility, SEO, maintainability', 'Proposes an incremental fix, not a rewrite', 'Gives a real or realistic example']
      ),
      toPracticeQuestion(
        findItem(cssQuestions, 'appears behind another component'),
        ['Identifies this as a stacking context issue, not a z-index value issue', 'Names what creates a stacking context', 'Mentions Teleport/portal as a real fix']
      ),
      toPracticeQuestion(
        findItem(cssQuestions, 'choose CSS Grid instead of Flexbox'),
        ['Explains 1D vs 2D layout', 'Gives a concrete example of each', 'Avoids saying one is just "better"']
      ),
    ],
  },
  {
    title: 'JavaScript',
    questions: [
      toPracticeQuestion(
        findItem(javascriptQuestions, 'Explain closures with a practical example'),
        ['Defines a closure correctly', 'Gives a real code example', 'Connects it to a practical use case like debounce']
      ),
      toPracticeQuestion(
        findItem(javascriptQuestions, 'event loop in a way suitable for a senior frontend interview'),
        ['Mentions call stack, microtasks, macrotasks', 'Explains microtasks drain before the next macrotask', 'Uses a concrete setTimeout/Promise example']
      ),
      toPracticeQuestion(
        findItem(javascriptQuestions, 'implement debounce and throttle'),
        ['States the core difference (delay vs rate-limit)', 'Gives a real use case for each', 'Can sketch the implementation']
      ),
    ],
  },
  {
    title: 'TypeScript',
    questions: [
      toPracticeQuestion(
        findItem(typescriptQuestions, 'difference between <code>type</code> and <code>interface</code>'),
        ['States the real structural differences (merging, unions)', 'Gives a personal default/preference with reasoning']
      ),
      toPracticeQuestion(
        findItem(typescriptQuestions, 'An API returns different response shapes'),
        ['Proposes a discriminated union', 'Shows how narrowing works after the check', 'Avoids reaching for "any" as the answer']
      ),
    ],
  },
  {
    title: 'Vue 2 + Vue 3',
    questions: [
      toPracticeQuestion(
        findItem(vue2Questions, 'grown to 1000 lines'),
        ['Talks about finding natural seams, not splitting by line count', 'Distinguishes UI components vs logic extraction', 'Mentions doing it incrementally, safely']
      ),
      toPracticeQuestion(
        findItem(vue3Questions, 'difference between <code>ref</code> and <code>reactive</code>'),
        ['Explains ref needs .value, reactive doesn\'t', 'Mentions the destructuring pitfall with reactive', 'States a personal default and why']
      ),
      toPracticeQuestion(
        findItem(vue3Questions, 'problems do composables solve'),
        ['Names the mixin naming-collision/implicit-merge problem', 'Explains composables are explicit', 'Gives a real composable example']
      ),
    ],
  },
  {
    title: 'Nuxt',
    questions: [
      toPracticeQuestion(
        findItem(nuxtQuestions, 'choose SSR instead of CSR'),
        ['Names SEO and freshness as the deciding factors', 'Gives a concrete example of each use case']
      ),
      toPracticeQuestion(
        findItem(nuxtQuestions, 'hydration mismatch'),
        ['Explains what a hydration mismatch actually is', 'Names common causes (window, Date, random)', 'Describes a concrete fix like ClientOnly']
      ),
    ],
  },
  {
    title: 'Performance',
    questions: [
      toPracticeQuestion(
        findItem(performanceQuestions, 'became noticeably slower after a new release'),
        ['Describes a structured investigation, not a guess', 'Names specific DevTools panels/tools', 'Connects the fix back to what was found']
      ),
      toPracticeQuestion(
        findItem(performanceQuestions, 'Core Web Vitals'),
        ['Names LCP, CLS, INP correctly', 'Explains what each one actually measures']
      ),
    ],
  },
  {
    title: 'Architecture / System Design',
    questions: [
      toPracticeQuestion(
        findItem(systemDesignQuestions, 'scalable e-commerce frontend'),
        ['Separates SEO-critical vs authenticated areas', 'Talks about API layer, caching, performance', 'Mentions security for payment specifically']
      ),
      toPracticeQuestion(
        findItem(systemDesignQuestions, '100,000 records'),
        ['Proposes virtualization, not rendering everything', 'Mentions server-side filtering/sorting', 'Addresses state in the URL']
      ),
    ],
  },
  {
    title: 'Scenario-Based',
    questions: [
      toPracticeQuestion(
        findItem(scenarioQuestions, 'occurs 30 minutes before release'),
        ['Assesses severity/blast radius first', 'Makes a clear recommendation, not just "it depends"', 'Mentions tracking/follow-up']
      ),
      toPracticeQuestion(
        findItem(scenarioQuestions, 'significantly increase technical debt'),
        ['Doesn\'t just say no', 'Frames it as an explicit trade-off for the PM to decide', 'Mentions getting a commitment to revisit']
      ),
    ],
  },
  {
    title: 'Behavioral',
    questions: [
      toPracticeQuestion(
        findItem(behavioralQuestions, 'Tell me about yourself'),
        ['Concise — under ~2 minutes spoken', 'Includes one concrete highlight, not just a list of skills', 'Ends somewhere that invites a follow-up']
      ),
      toPracticeQuestion(
        findItem(behavioralQuestions, 'most challenging project'),
        ['Uses a STAR structure', 'Includes a measurable or clearly stated result', 'Includes a reflection on what they\'d do differently']
      ),
    ],
  },
  {
    title: 'Final Senior-Level Round',
    questions: [
      toPracticeQuestion(
        findItem(migrationQuestions, 'What is your overall strategy'),
        ['Covers assessment, dependency audit, incremental plan', 'Mentions testing and rollback strategy', 'Shows awareness this spans more than just code']
      ),
      toPracticeQuestion(
        findItem(securityQuestions, 'user-generated HTML is being rendered directly'),
        ['Identifies this as an XSS risk specifically', 'Proposes sanitization at render time', 'Doesn\'t rely solely on backend validation']
      ),
      toPracticeQuestion(
        findItem(behavioralQuestions, 'Why should we hire you'),
        ['Ties strengths directly to the role, not generically', 'Uses a specific example per strength', 'Sounds confident without sounding rehearsed']
      ),
    ],
  },
];

practiceRounds.push(
  {
    title: 'Production readiness',
    questions: [
      toPracticeQuestion(questionBank.deployment.items[0], [
        'Promotes the same immutable artifact digest through staging and production',
        'Separates public runtime configuration from secrets and build identity',
        'Names the retained artifact and compatible configuration needed for rollback',
      ]),
      toPracticeQuestion(questionBank.deployment.items[1], [
        'Defines the flag owner, safe fallback, expiry and removal criteria',
        'Tests both branches and keeps SSR and hydration evaluation consistent',
        'Separates a kill switch from server authorization and data recovery',
      ]),
      toPracticeQuestion(questionBank.observability.items[0], [
        'Defines eligible journey starts, successful completion and failure',
        'Segments release/cohort latency and completion rather than only counting exceptions',
        'Explains sampling gaps and actionable SLO/error-budget alerts',
      ]),
      toPracticeQuestion(questionBank.observability.items[1], [
        'Distinguishes a controlled lab run from a real-user distribution',
        'Considers weak hardware, cache state, long sessions and sample size',
        'Uses a representative trace to diagnose the field regression and verifies after rollout',
      ]),
    ],
  },
  {
    title: 'State & async architecture',
    questions: [
      toPracticeQuestion(questionBank['state-management'].items[0], [
        'Assigns explicit owners to component, URL, shared client and server state',
        'Defines freshness, invalidation and logout cleanup instead of duplicating responses',
        'Treats an editable draft as an intentional copy with a base revision',
      ]),
      toPracticeQuestion(questionBank['state-management'].items[1], [
        'Explains why destructured primitive state and unwrapped getters become snapshots',
        'Uses storeToRefs for state/getters and extracts bound actions directly',
        'Tests a source update rather than only the consumer\'s initial render',
      ]),
      toPracticeQuestion(seniorCodingProblems.find((item) => item.id === 'coding-inflight-dedupe'), [
        'Shares the exact pending promise and evicts on success and rejection',
        'Includes method, request parameters and tenant/auth scope in request identity',
        'Handles synchronous loader throws and distinguishes single-flight from persistent caching',
        'Defines cancellation ownership and does not claim an in-memory promise coordinates tabs',
      ]),
    ],
  },
  {
    title: 'Technical leadership',
    questions: [
      toPracticeQuestion(questionBank.leadership.items[0], [
        'Records context, constraints, alternatives and accepted consequences in the ADR',
        'Names an accountable owner and evidence or triggers for revisiting the decision',
        'Preserves history by superseding decisions rather than rewriting the original rationale',
      ]),
      toPracticeQuestion(questionBank.leadership.items[1], [
        'Labels correctness/security risks as blockers and preferences as suggestions',
        'Gives actionable feedback with reasoning and uses automation for mechanical rules',
        'Timeboxes disagreement and keeps urgent fixes backed by targeted evidence and owned follow-up',
      ]),
    ],
  }
);

/* ========================================================================
   Pure text helper (no browser dependency)
   ======================================================================== */
function stripTags(html) {
  return String(html).replace(/<[^>]*>/g, '');
}

















