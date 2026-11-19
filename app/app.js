// Vice City Trophy Atlas — offline GTA VI trophy guide and tracker.
// Vanilla ES modules, no libraries, no network: the only fetch is the local
// data file. Progress lives in localStorage; export/import move it as JSON.
const KEY = 'vice-city-trophy-atlas-v1';
const POWERPYX = 'https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/';
const GTABASE = 'https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series';
const OUTPUTLAG = 'https://outputlag.com/guides/gta-6-trophy-list/';

// Roadmap phases, in the order a player meets them. Trophy ids are the
// official list's ids. Built from the official descriptions; times and the
// difficulty rating are PowerPyx's.
const PHASES = [
  {
    title: 'Phase 1 — Story first',
    time: '60–80 hours',
    blurb: 'Play the story through all five chapters. Every chapter and named-mission trophy pops automatically as you go — there is nothing to hunt here, just play. Do the optional missions as they appear: you need 100 of them for the 100% checklist later, and there are far more than 100 in total.',
    trophies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    watch: 'Watch out: the Chapter 1 meditation for Positive Mental Attitude (see Missables). Keep a manual save at the start of every chapter.',
  },
  {
    title: 'Phase 2 — Side questlines',
    time: 'During & after the story',
    blurb: 'Finish the optional questlines. Each ends with a finale trophy, and every one of them stays available in free-roam after the story — quest givers can go quiet mid-story but they all come back.',
    trophies: [22, 23, 24, 26, 27, 20, 29, 25],
    watch: 'Watch out: Andy is Lucia-only, Tyrone and Bret are Jason-only. Strangers & Freaks counts only certain strands — Moses, Tyrone, Yasmani, Andy, Billy and Eddie do not count.',
  },
  {
    title: 'Phase 3 — Activities & collectibles',
    time: 'About 60 hours',
    blurb: 'The open-world grind: stunts, ranges, races, cards, scans and the map. Most of it feeds the 100% checklist directly, so work it alongside the checklist rather than after it.',
    trophies: [15, 16, 17, 18, 19, 21, 28, 30, 31, 32, 35, 42, 46, 47],
    watch: 'Watch out: for 100% you need 300 stunts (trophy: 250), 200 of 277 vehicles scanned (trophy: 100) and 70 of 80 challenges (trophy: 50).',
  },
  {
    title: 'Phase 4 — Crime, money & cleanup',
    time: 'About 40 hours, then the platinum',
    blurb: 'Robberies, vaults, gang operations and the money trophies, then whatever is left. Five trophies in this phase have no confirmed method in any published guide yet — their entries say so plainly.',
    trophies: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 48, 49, 50, 51, 52, 53, 54, 55, 14, 1],
    watch: 'Watch out: cheats disable trophies and saving — keep them off for the whole run. A Long Road (100%) pops last; the platinum follows it.',
  },
];
const ROADMAP_ORDER = PHASES.flatMap((p) => p.trophies);

// The house-style seeded progress for screenshots: 13 of 55 earned, part way.
const SEED_13 = [2, 3, 4, 5, 8, 9, 10, 15, 16, 20, 21, 35, 42];

const params = new URLSearchParams(location.search);
const shotMode = params.has('shot');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let saved = {};
try { saved = JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { saved = {}; }
let earned = new Set((saved.earned ?? []).filter((id) => byId.has(id)));
let spoiler = saved.spoiler !== undefined ? !!saved.spoiler : false;
if (shotMode && params.get('seed')) {
  const seed = params.get('seed');
  earned = new Set(seed === '13' ? SEED_13 : seed.split(',').map(Number).filter((id) => byId.has(id)));
}
if (shotMode && params.get('spoiler')) spoiler = params.get('spoiler') === 'on';

const state = {
  view: params.get('view') || 'tracker',
  search: params.get('search') || '',
  grade: params.get('grade') || 'all',
  kind: params.get('kind') || 'all',
  sort: params.get('sort') || 'official',
  selected: params.get('detail') ? Number(params.get('detail')) : null,
};

const $ = (id) => document.getElementById(id);
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const GRADE_MARK = { platinum: '◆', gold: '◆', silver: '◆', bronze: '◆' };

function save() {
  if (shotMode) return; // screenshot renders never persist seeded progress
  localStorage.setItem(KEY, JSON.stringify({ earned: [...earned], spoiler }));
}

function isSpoiled(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function filtered() {
  const q = state.search.trim().toLowerCase();
  let list = trophies.filter((t) => {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  if (state.sort === 'unearned') list = [...list].sort((a, b) => Number(earned.has(a.id)) - Number(earned.has(b.id)) || a.id - b.id);
  else if (state.sort === 'grade') list = [...list].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  else if (state.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function tagEl(text, cls) { return el('span', `tag ${cls}`, text); }

function renderProgress() {
  const n = earned.size;
  $('earnedCount').textContent = n;
  $('progressFill').style.width = `${(n / trophies.length) * 100}%`;
  $('progressBarWrap').setAttribute('aria-valuenow', String(n));
  $('progressSub').textContent = `${Math.round((n / trophies.length) * 100)}% to the platinum — ${trophies.length - n} to go`;
  const counts = $('gradeCounts');
  counts.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const s = el('span');
    s.append(el('b', null, `${got}/${total} `), document.createTextNode(g));
    counts.append(s);
  }
}

function renderNextUp() {
  const next = ROADMAP_ORDER.filter((id) => !earned.has(id)).slice(0, 3);
  const box = $('nextUp');
  box.replaceChildren();
  box.append(el('strong', null, 'Next up: '));
  if (!next.length) {
    box.append(document.createTextNode('Every trophy earned — the platinum is yours.'));
    return;
  }
  for (const id of next) {
    const t = byId.get(id);
    const phase = PHASES.findIndex((p) => p.trophies.includes(id)) + 1;
    const item = el('span', 'next-item');
    const b = el('b', null, t.name);
    b.style.cursor = 'pointer';
    b.addEventListener('click', () => select(id));
    item.append(b, document.createTextNode(` (Phase ${phase})`));
    box.append(item);
  }
}

function renderList() {
  const list = filtered();
  const box = $('trophyList');
  box.replaceChildren();
  $('listMeta').textContent = `${list.length} of ${trophies.length} trophies shown · ${earned.size} earned`;
  for (const t of list) {
    const card = el('div', 'trophy-card');
    card.setAttribute('role', 'listitem');
    if (earned.has(t.id)) card.classList.add('earned');
    if (state.selected === t.id) card.classList.add('selected');
    const spoiled = isSpoiled(t);
    if (spoiled) card.classList.add('spoiled');

    const boxInput = document.createElement('input');
    boxInput.type = 'checkbox';
    boxInput.checked = earned.has(t.id);
    boxInput.setAttribute('aria-label', `Mark ${t.name} as earned`);
    boxInput.addEventListener('change', (e) => {
      e.stopPropagation();
      if (boxInput.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    boxInput.addEventListener('click', (e) => e.stopPropagation());
    card.append(boxInput);

    const body = el('div');
    body.append(el('div', 'trophy-name', spoiled ? 'Hidden story trophy' : t.name));
    body.append(el('div', 'trophy-desc', spoiled ? 'Earn this trophy to reveal its name and description.' : t.description));
    const tags = el('div', 'trophy-tags');
    tags.append(tagEl(t.grade, t.grade), tagEl(t.kind === 'misc' ? 'Milestone' : t.kind, ''));
    if (t.missable) tags.append(tagEl('⚠ possibly missable', 'missable'));
    if (t.guide.startsWith('Not yet confirmed')) tags.append(tagEl('method unconfirmed', 'unconfirmed'));
    body.append(tags);
    if (spoiled) body.append(el('div', 'spoiler-note', 'Story spoiler hidden — earn it (or turn spoilers off) to reveal.'));
    card.append(body);

    const mark = el('span', `trophy-grade-mark ${t.grade}`, GRADE_MARK[t.grade]);
    mark.setAttribute('aria-hidden', 'true');
    card.append(mark);

    card.addEventListener('click', () => select(t.id));
    box.append(card);
  }
  if (!list.length) box.append(el('p', 'detail-empty', 'No trophies match these filters.'));
}

function renderDetail() {
  const pane = $('detailPane');
  pane.replaceChildren();
  const t = state.selected ? byId.get(state.selected) : filtered()[0];
  if (!t) { pane.append(el('p', 'detail-empty', 'No trophy selected.')); return; }
  state.selected = t.id;
  const spoiled = isSpoiled(t);

  const tags = el('div', 'trophy-tags');
  tags.append(tagEl(t.grade, t.grade), tagEl(t.kind === 'misc' ? 'Milestone' : t.kind, ''));
  if (t.missable) tags.append(tagEl('⚠ possibly missable', 'missable'));
  pane.append(tags);
  pane.append(el('h3', null, spoiled ? 'Hidden story trophy' : t.name));
  pane.append(el('p', 'official', spoiled ? 'Earn this trophy to reveal its official description.' : `“${t.description}” — official description`));

  if (spoiled) {
    pane.append(el('p', 'detail-empty', 'This is a story trophy and spoilers are hidden. Tick it earned above, or turn “Hide story spoilers” off, to read its guide.'));
  } else {
    if (t.missable && t.missable_note) {
      const call = el('div', 'missable-callout');
      call.append(el('strong', null, 'Missable warning — '), document.createTextNode(t.missable_note));
      pane.append(call);
    }
    if (t.guide.startsWith('Not yet confirmed')) {
      const call = el('div', 'unconfirmed-callout');
      call.append(el('strong', null, 'Not yet confirmed — '), document.createTextNode('No published guide has pinned down this trophy\'s method yet. What follows is only what the official description supports.'));
      pane.append(call);
    }
    pane.append(el('h4', null, 'Guide'));
    pane.append(el('p', 'guide-text', t.guide));
    pane.append(el('h4', null, 'Sources'));
    const ul = el('ul', 'source-list-inline');
    t.sources.forEach((s, i) => {
      const li = el('li');
      li.append(el('span', 'src-role', `${i === 0 ? 'Official list' : 'Guide method'}: `));
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = s.name;
        li.append(a);
      } else {
        li.append(document.createTextNode(s.name));
      }
      ul.append(li);
    });
    pane.append(ul);
  }

  const earnedBtn = el('button', 'btn', earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned');
  earnedBtn.style.marginTop = '12px';
  earnedBtn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderAll();
  });
  pane.append(earnedBtn);
}

function renderRoadmap() {
  const wrap = $('roadmapPhases');
  wrap.replaceChildren();
  for (const p of PHASES) {
    const card = el('div', 'phase');
    const head = el('div', 'phase-head');
    head.append(el('h3', null, p.title), el('span', 'phase-time', p.time));
    card.append(head, el('p', null, p.blurb));
    const chips = el('div', 'phase-trophies');
    for (const id of p.trophies) {
      const t = byId.get(id);
      const chip = el('button', `phase-chip${earned.has(id) ? ' done' : ''}`, `${t.name} · ${t.grade}`);
      chip.type = 'button';
      chip.addEventListener('click', () => { select(id); switchView('tracker'); });
      chips.append(chip);
    }
    card.append(chips);
    if (p.watch) card.append(el('p', 'phase-watch', p.watch));
    wrap.append(card);
  }
}

function renderMissables() {
  const wrap = $('missableList');
  wrap.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  for (const t of flagged) {
    const card = el('div', 'missable-card');
    card.append(tagEl(t.grade, t.grade), tagEl('possibly missable', 'missable'));
    card.append(el('h3', null, t.name));
    card.append(el('p', 'official', `“${t.description}” — official description`));
    card.append(el('p', 'guide-text', t.guide));
    const call = el('div', 'missable-callout');
    call.append(el('strong', null, 'What to do: '), document.createTextNode(t.missable_note));
    card.append(call);
    const src = el('p');
    src.append(document.createTextNode('Sources: '));
    const a = document.createElement('a');
    a.href = POWERPYX; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'PowerPyx — GTA 6 Trophy Guide & Roadmap';
    src.append(a);
    src.append(document.createTextNode(' · '));
    const b = document.createElement('a');
    b.href = GTABASE; b.target = '_blank'; b.rel = 'noopener';
    b.textContent = 'GTABase — GTA 6 Trophy Guide & Achievements List';
    src.append(b);
    card.append(src);
    wrap.append(card);
  }
  $('missableTabBadge').textContent = String(flagged.length);
}

function renderSources() {
  const list = $('sourceList');
  list.replaceChildren();
  const sources = [
    {
      name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap',
      url: POWERPYX,
      text: 'The main method source for this atlas: per-trophy methods, the roadmap times and difficulty rating (4/10, ~200 hours), the missable flag, and the 100% checklist details.',
    },
    {
      name: 'GTABase — GTA 6 Trophy Guide & Achievements List',
      url: GTABASE,
      text: 'Per-trophy unlock tips for all 55 trophies, the roadmap, the missable flag and the 100% checklist details — the second method source beside every guide in this atlas.',
    },
    {
      name: 'Output Lag — GTA 6 Trophy List',
      url: OUTPUTLAG,
      text: 'Method sections for the robbery, partner, free-roam and grind trophies, the time-sensitive Yago race note for Strangers & Freaks, and the Chapter 1 save rules.',
    },
    {
      name: 'Exophase — GTA 6 trophy list',
      url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/',
      text: 'The official list mirror: the 55 names, descriptions and grades in this guide match the list Exophase published on 18 November 2026.',
    },
    {
      name: 'Radio Times — GTA 6 trophy guide',
      url: 'https://www.radiotimes.com/technology/gaming/gta-6-trophies-achievements-list/',
      text: 'Independent cross-check of the full 55-trophy list, names, descriptions and grades.',
    },
    {
      name: 'Press Start — GTA 6 trophy list',
      url: 'https://press-start.com.au/news/2026/11/18/gta-6-trophy-list/',
      text: 'Independent cross-check of the full 55-trophy list, names, descriptions and grades — published 18 November 2026.',
    },
    {
      name: 'EGamers.io — GTA 6 trophy list',
      url: 'https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/',
      text: 'Cross-check of the missable flag (only Positive Mental Attitude is flagged) and the difficulty and time estimates.',
    },
    {
      name: 'Official in-game descriptions',
      url: null,
      text: 'Trophy names and descriptions are shown exactly as PlayStation publishes them — the one exception to this guide\'s own-words rule. They come from the official list shipped with this guide.',
    },
  ];
  for (const s of sources) {
    const card = el('div', 'source-card');
    card.append(el('h3', null, s.name), el('p', null, s.text));
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url; a.target = '_blank'; a.rel = 'noopener'; a.className = 'src-link';
      a.textContent = s.url;
      card.append(a);
    }
    list.append(card);
  }
}

function select(id) {
  state.selected = id;
  renderList();
  renderDetail();
  document.querySelector('.detail')?.scrollIntoView({ block: 'nearest' });
}

function switchView(view) {
  state.view = view;
  for (const v of ['tracker', 'roadmap', 'missables', 'sources']) {
    $(`view-${v}`).classList.toggle('active', v === view);
    $(`tab-${v}`).classList.toggle('active', v === view);
  }
}

function renderAll() {
  renderProgress();
  renderNextUp();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
  renderSources();
}

// Controls
for (const v of ['tracker', 'roadmap', 'missables', 'sources']) {
  $(`tab-${v}`).addEventListener('click', () => switchView(v));
}
$('search').value = state.search;
$('search').addEventListener('input', (e) => { state.search = e.target.value; renderList(); renderDetail(); });
$('gradeFilter').value = state.grade;
$('gradeFilter').addEventListener('change', (e) => { state.grade = e.target.value; renderList(); renderDetail(); });
$('kindFilter').value = state.kind;
$('kindFilter').addEventListener('change', (e) => { state.kind = e.target.value; renderList(); renderDetail(); });
$('sortFilter').value = state.sort;
$('sortFilter').addEventListener('change', (e) => { state.sort = e.target.value; renderList(); });
$('spoilerToggle').checked = spoiler;
$('spoilerToggle').addEventListener('change', (e) => { spoiler = e.target.checked; save(); renderAll(); });
$('exportBtn').addEventListener('click', () => {
  const payload = { app: 'vice-city-trophy-atlas', version: 1, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'vice-city-trophy-atlas-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const raw = Array.isArray(data) ? data : data.earned ?? [];
    let added = 0;
    for (const item of raw) {
      const id = typeof item === 'number' ? item : trophies.find((t) => t.name === item)?.id;
      if (id && byId.has(id) && !earned.has(id)) { earned.add(id); added++; }
    }
    save();
    renderAll();
    $('listMeta').textContent = `Imported ${added} new ${added === 1 ? 'trophy' : 'trophies'} from ${file.name}.`;
  } catch {
    $('listMeta').textContent = `Could not read ${file.name} — not a valid progress file.`;
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!earned.size) return;
  if (confirm(`Clear all ${earned.size} earned trophies?`)) {
    earned.clear();
    save();
    renderAll();
  }
});

switchView(state.view);
renderAll();
if (shotMode) {
  const scroll = Number(params.get('scroll') || 0);
  if (scroll) window.scrollTo(0, scroll);
}
// Signal render completion (screenshots and drive tests wait on this).
requestAnimationFrame(() => { window.__shotReady = true; });
