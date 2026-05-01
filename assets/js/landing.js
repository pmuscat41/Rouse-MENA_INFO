/**
 * Landing page: load requirements.json, render the country grid filtered by
 * region tab. Map will be added in the next round; for now the tabs filter
 * the grid only.
 */
(async function () {
  // Update relative-year placeholders before any async work runs.
  // Use this attribute on any element whose text should reflect "current
  // year minus 1997" (years of MEA patent practice, established Dubai 1997).
  const yearsSince1997 = new Date().getFullYear() - 1997;
  document.querySelectorAll('[data-years-since-1997]').forEach(el => {
    el.textContent = yearsSince1997;
  });

  const grid       = document.getElementById('rs-grid');
  const countEl    = document.getElementById('rs-count');
  const titleEl    = document.getElementById('rs-grid-title');
  const updatedEl  = document.getElementById('rs-updated');
  const tabsEl     = document.getElementById('rs-tabs');

  let response;
  try {
    response = await fetch('assets/data/requirements.json');
  } catch (err) {
    grid.innerHTML = '<p>Failed to load data — open this site via a local server (see README).</p>';
    return;
  }
  if (!response.ok) {
    grid.innerHTML = `<p>Failed to load data (HTTP ${response.status}).</p>`;
    return;
  }
  const data = await response.json();

  const all = [
    ...data.countries.map(c => ({ ...c, _kind: 'country' })),
    ...data.regional_systems.map(r => ({ ...r, _kind: 'regional' }))
  ];

  if (data.metadata && data.metadata.last_generated) {
    updatedEl.textContent = RS.formatDate(data.metadata.last_generated.slice(0, 10));
  }

  // Honour ?#mideast / ?#africa from a returning breadcrumb link
  let activeRegion = 'mideast';
  const hash = (window.location.hash || '').replace('#', '');
  if (hash === 'mideast' || hash === 'africa') {
    activeRegion = hash;
    document.querySelectorAll('.rs-tab').forEach(t => {
      const isActive = t.dataset.region === hash;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function render() {
    grid.innerHTML = '';

    const filtered = all
      .filter(item => item.region === activeRegion)
      .sort((a, b) => {
        // Regional systems pinned to the top of each region
        if (a._kind !== b._kind) return a._kind === 'regional' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    filtered.forEach(item => {
      const card = document.createElement('a');
      card.className = 'rs-card' + (item._kind === 'regional' ? ' regional' : '');
      card.href = `country.html?id=${item.id}`;

      const main = document.createElement('span');
      main.className = 'rs-card-main';
      main.textContent = item.name;
      card.appendChild(main);

      const meta = document.createElement('span');
      meta.className = 'rs-card-region';
      meta.textContent = item._kind === 'regional'
        ? 'Regional system'
        : (item.coverage || 'National');
      card.appendChild(meta);

      grid.appendChild(card);
    });

    titleEl.textContent = `${RS.regionLabel(activeRegion)} jurisdictions`;
    const nationals = filtered.filter(i => i._kind === 'country').length;
    const regionals = filtered.filter(i => i._kind === 'regional').length;
    let label = `${nationals} jurisdiction${nationals === 1 ? '' : 's'}`;
    if (regionals) {
      label += ` + ${regionals} regional system${regionals === 1 ? '' : 's'}`;
    }
    countEl.textContent = label;
  }

  // ---- Map -------------------------------------------------------------
  const mapAPI = initMap(data);

  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.rs-tab');
    if (!btn) return;
    document.querySelectorAll('.rs-tab').forEach(t => {
      const isActive = t === btn;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    activeRegion = btn.dataset.region;
    render();
    if (mapAPI) mapAPI.draw(activeRegion);
  });

  render();
  if (mapAPI) mapAPI.draw(activeRegion);
})();


/**
 * Build the D3 choropleth + regional-system markers. Returns { draw(region) }.
 * Geo data is loaded once; subsequent tab switches just re-project and redraw.
 */
function initMap(data) {
  if (typeof d3 === 'undefined') return null;

  const mapEl = document.getElementById('rs-map');
  const tip = document.getElementById('rs-tip');
  if (!mapEl) return null;

  const W = 720, H = 480;
  const svg = d3.select(mapEl).append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  const gCountries = svg.append('g');
  const gMarkers = svg.append('g');

  const coveredById = {};
  data.countries.forEach(c => {
    if (c.iso_alpha3) coveredById[c.iso_alpha3] = c;
  });

  const regionalByRegion = { mideast: [], africa: [] };
  data.regional_systems.forEach(r => {
    if (regionalByRegion[r.region]) regionalByRegion[r.region].push(r);
  });

  // Bounding boxes (lon/lat). Middle East extended west to lon 25 to fit
  // Turkey alongside the Gulf states.
  const regions = {
    mideast: {
      bbox: { type: 'Polygon', coordinates: [[[25, 42], [60, 42], [60, 11], [25, 11], [25, 42]]] }
    },
    africa: {
      bbox: { type: 'Polygon', coordinates: [[[-20, 38], [55, 38], [55, -36], [-20, -36], [-20, 38]]] }
    }
  };

  let features = null;
  let pendingRegion = null;
  let lastRegion = null;

  fetch('assets/data/countries.geo.json')
    .then(r => r.json())
    .then(geo => {
      features = geo.features;
      if (pendingRegion) draw(pendingRegion);
    })
    .catch(err => {
      console.warn('Map geo data failed to load:', err);
      mapEl.innerHTML = '<p style="padding:24px;text-align:center;color:#706F6F;font-size:13px;">Map data unavailable.</p>';
    });

  function draw(region) {
    if (!features) {
      pendingRegion = region;
      return;
    }
    if (!regions[region]) {
      svg.style('display', 'none');
      return;
    }
    svg.style('display', '');
    lastRegion = region;
    const cfg = regions[region];
    const proj = d3.geoMercator().fitExtent([[12, 12], [W - 12, H - 12]], cfg.bbox);
    const path = d3.geoPath(proj);

    const sel = gCountries.selectAll('path').data(features, d => d.id);
    sel.exit().remove();
    sel.enter().append('path')
      .merge(sel)
      .attr('d', path)
      .attr('fill', d => coveredById[d.id] ? '#096e4a' : '#E8E3DA')
      .attr('stroke', '#FAFBFC')
      .attr('stroke-width', 0.5)
      .style('cursor', d => coveredById[d.id] ? 'pointer' : 'default')
      .on('mouseover', function (e, d) {
        if (!coveredById[d.id]) return;
        d3.select(this).attr('fill', '#054930');
        tip.textContent = coveredById[d.id].name;
        tip.classList.add('visible');
      })
      .on('mousemove', function (e) {
        const r = mapEl.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left + 12) + 'px';
        tip.style.top = (e.clientY - r.top - 30) + 'px';
      })
      .on('mouseout', function (e, d) {
        if (!coveredById[d.id]) return;
        d3.select(this).attr('fill', '#096e4a');
        tip.classList.remove('visible');
      })
      .on('click', function (e, d) {
        if (!coveredById[d.id]) return;
        window.location.href = `country.html?id=${coveredById[d.id].id}`;
      });

    // Country fallback markers (green) for covered countries whose polygon
    // isn't in the geo dataset (e.g. Bahrain — island, too small at this
    // resolution). Plus regional system markers (purple).
    gMarkers.selectAll('*').remove();

    const renderedIds = new Set(features.map(f => f.id));
    const fallbackCountries = data.countries.filter(c =>
      c.region === region
      && c.iso_alpha3
      && !renderedIds.has(c.iso_alpha3)
      && Array.isArray(c.fallback_coordinates)
    );
    fallbackCountries.forEach(c => {
      const p = proj(c.fallback_coordinates);
      if (!p) return;
      const grp = gMarkers.append('g')
        .attr('transform', `translate(${p[0]},${p[1]})`)
        .style('cursor', 'pointer')
        .on('click', () => window.location.href = `country.html?id=${c.id}`)
        .on('mouseover', function () {
          tip.textContent = c.name;
          tip.classList.add('visible');
        })
        .on('mousemove', function (e) {
          const rect = mapEl.getBoundingClientRect();
          tip.style.left = (e.clientX - rect.left + 12) + 'px';
          tip.style.top = (e.clientY - rect.top - 30) + 'px';
        })
        .on('mouseout', function () {
          tip.classList.remove('visible');
        });
      grp.append('circle')
        .attr('r', 6)
        .attr('fill', '#096e4a')
        .attr('stroke', '#FAFBFC')
        .attr('stroke-width', 1.5);
    });

    const markers = regionalByRegion[region] || [];
    markers.forEach(r => {
      if (!r.host_coordinates) return;
      const p = proj(r.host_coordinates);
      if (!p) return;
      const grp = gMarkers.append('g')
        .attr('transform', `translate(${p[0]},${p[1]})`)
        .style('cursor', 'pointer')
        .on('click', () => window.location.href = `country.html?id=${r.id}`)
        .on('mouseover', function () {
          tip.textContent = r.name;
          tip.classList.add('visible');
        })
        .on('mousemove', function (e) {
          const rect = mapEl.getBoundingClientRect();
          tip.style.left = (e.clientX - rect.left + 12) + 'px';
          tip.style.top = (e.clientY - rect.top - 30) + 'px';
        })
        .on('mouseout', function () {
          tip.classList.remove('visible');
        });
      grp.append('circle').attr('r', 7).attr('fill', '#5b2080').attr('stroke', 'white').attr('stroke-width', 2);
      grp.append('circle').attr('r', 11).attr('fill', 'none').attr('stroke', '#5b2080').attr('stroke-width', 1.5).attr('opacity', 0.5);
      grp.append('text')
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#5b2080')
        .text((r.id || '').toUpperCase());
    });
  }

  return { draw };
}
