/**
 * Country / regional-system detail page. Driven by ?id=xxx.
 *
 * Pill rendering for the Required? column:
 *   "Yes"                              -> green pill
 *   "No" / "Not required" / "N/A"      -> grey pill
 *   "Yes, …" or "If …"                 -> red conditional pill
 *   anything else                      -> red conditional pill (defensive)
 *
 * Prev/next is alphabetical within the same region + kind (national vs
 * regional). Items with no siblings (Turkey, GCC alone in ME) hide the nav.
 */
(async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    window.location.replace('index.html');
    return;
  }

  let res;
  try {
    res = await fetch('assets/data/requirements.json');
  } catch (err) {
    showError('Failed to load data — open this site via a local server (see README).');
    return;
  }
  if (!res.ok) {
    showError(`Failed to load data (HTTP ${res.status}).`);
    return;
  }
  const data = await res.json();

  const all = [
    ...data.countries.map(c => ({ ...c, _kind: 'country' })),
    ...data.regional_systems.map(r => ({ ...r, _kind: 'regional' }))
  ];
  const item = all.find(x => x.id === id);
  if (!item) {
    showError(`Jurisdiction "${id}" not found. <a href="index.html">Back to hub.</a>`);
    return;
  }

  renderItem(item, all);
  if (data.metadata && data.metadata.last_generated) {
    document.getElementById('rs-updated').textContent =
      RS.formatDate(data.metadata.last_generated.slice(0, 10));
  }

  // ---- Render helpers ---------------------------------------------------

  function renderItem(it, allItems) {
    document.title = `${it.name} | Rouse MEA Patent Filing Hub`;
    document.getElementById('rs-h1').textContent = `${it.name} — patent filing`;
    document.getElementById('rs-country-name').textContent = it.name;
    document.getElementById('rs-verified').textContent =
      `Last verified: ${RS.formatDate(it.last_verified)}`;
    document.getElementById('rs-sub').textContent = subFor(it);

    const regionLink = document.getElementById('rs-region-link');
    regionLink.textContent = RS.regionLabel(it.region);
    regionLink.href = `index.html#${it.region}`;

    renderKeyFacts(it);
    renderRows(it.formality_documents);
    renderInfo(it.information_required);

    document.getElementById('rs-cta-title').textContent =
      `Request the ${it.name} fee schedule`;
    document.getElementById('rs-cta-link').href = `register.html?country=${it.id}`;

    renderPrevNext(it, allItems);
  }

  function subFor(it) {
    if (it._kind === 'regional') {
      const office = it.host_office_city
        ? `${it.host_office_city}, ${it.host_office_country}`
        : it.host_office_country;
      const members = it.member_states_count
        ? ` Filings cover the ${it.member_states_count} member states.`
        : '';
      return `Filing requirements at ${it.long_name} (host office in ${office}).${members}`;
    }
    return `Filing requirements at the ${it.office}.`;
  }

  function renderKeyFacts(it) {
    const wrap = document.getElementById('rs-keyfacts');
    wrap.innerHTML = '';
    const facts = it._kind === 'regional'
      ? [
          ['Coverage',      it.coverage || 'Regional'],
          ['Host office',   `${it.host_office_city}, ${it.host_office_country}`],
          ['Member states', String(it.member_states_count || '—')],
          ['Treaty',        it.treaty || '—']
        ]
      : [
          ['Coverage',        it.coverage || 'National'],
          ['Office',          it.office || '—'],
          ['Filing language', it.filing_language || '—'],
          ['Routes',          (it.routes || []).join(' · ') || '—']
        ];
    facts.forEach(([label, value]) => {
      const cell = document.createElement('div');
      cell.className = 'rs-keyfact';
      const lbl = document.createElement('span');
      lbl.className = 'rs-keyfact-label';
      lbl.textContent = label;
      const val = document.createElement('span');
      val.className = 'rs-keyfact-value';
      val.textContent = value;
      cell.appendChild(lbl);
      cell.appendChild(val);
      wrap.appendChild(cell);
    });
  }

  function renderRows(rows) {
    const tbody = document.getElementById('rs-rows');
    const aside = document.getElementById('rs-aside');
    tbody.innerHTML = '';
    aside.textContent = '';
    if (!rows || rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="rs-empty">No formality data on file.</td></tr>';
      return;
    }
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.appendChild(td(row.document, 'rs-cell-doc'));
      const required = document.createElement('td');
      required.appendChild(renderPill(row.required));
      tr.appendChild(required);
      tr.appendChild(td(row.format));
      tr.appendChild(td(row.authentication));
      tr.appendChild(td(row.translation));
      tr.appendChild(td(row.deadline));
      tbody.appendChild(tr);
    });

    // Aside: show "eCopies accepted" if every format mentions eCopy
    const allECopy = rows.every(r => /e[\s-]?copy/i.test(r.format || ''));
    if (allECopy) aside.textContent = 'eCopies accepted across all documents.';
  }

  function td(text, className) {
    const el = document.createElement('td');
    if (className) el.className = className;
    el.textContent = text || '';
    return el;
  }

  function renderPill(value) {
    const span = document.createElement('span');
    if (!value) return span;
    const v = String(value).trim();
    const low = v.toLowerCase();
    if (low === 'no' || low === 'not required' || low === 'not applicable') {
      span.className = 'rs-pill rs-pill-no';
      span.textContent = v;
      return span;
    }
    if (low === 'yes') {
      span.className = 'rs-pill rs-pill-yes';
      span.textContent = 'Yes';
      return span;
    }
    if (low.startsWith('yes,') || low.startsWith('if ')) {
      span.className = 'rs-pill rs-pill-cond';
      span.textContent = v;
      span.title = v;
      return span;
    }
    span.className = 'rs-pill rs-pill-cond';
    span.textContent = v;
    span.title = v;
    return span;
  }

  function renderInfo(items) {
    const ul = document.getElementById('rs-info-list');
    ul.innerHTML = '';
    if (!items || items.length === 0) {
      ul.innerHTML = '<li class="rs-info-empty">No information panel data on file.</li>';
      return;
    }
    items.forEach(text => {
      const li = document.createElement('li');
      li.textContent = text;
      ul.appendChild(li);
    });
  }

  function renderPrevNext(it, allItems) {
    const prevEl = document.getElementById('rs-prev');
    const nextEl = document.getElementById('rs-next');
    const siblings = allItems
      .filter(x => x.region === it.region && x._kind === it._kind)
      .sort((a, b) => a.name.localeCompare(b.name));
    if (siblings.length < 2) return;
    const idx = siblings.findIndex(x => x.id === it.id);
    const prev = siblings[idx - 1];
    const next = siblings[idx + 1];
    if (prev) {
      prevEl.hidden = false;
      prevEl.href = `country.html?id=${prev.id}`;
      prevEl.innerHTML = `<span class="rs-foot-arrow">←</span> ${prev.name}`;
    }
    if (next) {
      nextEl.hidden = false;
      nextEl.href = `country.html?id=${next.id}`;
      nextEl.innerHTML = `${next.name} <span class="rs-foot-arrow">→</span>`;
    }
  }

  function showError(html) {
    document.querySelector('main.rs-page').innerHTML =
      `<div class="rs-error">${html}</div>`;
  }
})();
