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
  const gBase    = svg.append('g');   // back layer: uncovered countries
  const gCovered = svg.append('g');   // top layer: covered countries (hover/click)
  const gMarkers = svg.append('g');   // regional + fallback dots
  const gLabels  = svg.append('g').attr('pointer-events', 'none');

  // Three-shade green palette. The map_shade key (1/2/3) on each country
  // is a 4-colour-theorem coloring across adjoining covered jurisdictions
  // so neighbours read distinct.
  const SHADES = { 1: '#096e4a', 2: '#0e8a5b', 3: '#054930' };
  const HOVER_FILL = '#022218';

  const coveredById = {};
  data.countries.forEach(c => {
    if (c.iso_alpha3) coveredById[c.iso_alpha3] = c;
  });

  const regionalByRegion = { mideast: [], africa: [] };
  data.regional_systems.forEach(r => {
    if (regionalByRegion[r.region]) regionalByRegion[r.region].push(r);
  });

  // Bounding boxes (lon/lat). Middle East stretched west to fit Turkey
  // alongside the Gulf states; keepBounds is wider than the bbox so we
  // include border-overlap polygons (Iran, Egypt etc.) as background.
  const regions = {
    mideast: {
      bbox: { type: 'Polygon', coordinates: [[[26, 42], [60, 42], [60, 12], [26, 12], [26, 42]]] },
      keepBounds: { minLon: 18, maxLon: 68, minLat: 5, maxLat: 48 }
    },
    africa: {
      bbox: { type: 'Polygon', coordinates: [[[-20, 38], [55, 38], [55, -36], [-20, -36], [-20, 38]]] },
      keepBounds: { minLon: -25, maxLon: 60, minLat: -40, maxLat: 40 }
    }
  };

  let features = null;
  let centroids = null;
  let pendingRegion = null;

  fetch('assets/data/countries.geo.json')
    .then(r => r.json())
    .then(geo => {
      features = geo.features;
      // Pre-compute geographic centroids for region-based filtering.
      centroids = {};
      features.forEach(f => {
        try { centroids[f.id] = d3.geoCentroid(f); }
        catch (e) { centroids[f.id] = null; }
      });
      if (pendingRegion) draw(pendingRegion);
    })
    .catch(err => {
      console.warn('Map geo data failed to load:', err);
      mapEl.innerHTML = '<p style="padding:24px;text-align:center;color:#706F6F;font-size:13px;">Map data unavailable.</p>';
    });

  function draw(region) {
    if (!features) { pendingRegion = region; return; }
    if (!regions[region]) { svg.style('display', 'none'); return; }
    svg.style('display', '');

    const cfg = regions[region];
    const proj = d3.geoMercator().fitExtent([[12, 12], [W - 12, H - 12]], cfg.bbox);
    const path = d3.geoPath(proj);

    // Filter to features whose centroid sits within the region's
    // geographic envelope. This drops Bermuda, Pacific islands etc.,
    // whose tiny polygons project to giant invalid shapes when fit to
    // a small bbox and would otherwise cover the visible map.
    const visible = features.filter(f => {
      if (coveredById[f.id]) return true;          // never drop a covered country
      const c = centroids[f.id];
      if (!c) return false;
      const [lon, lat] = c;
      const b = cfg.keepBounds;
      return lon >= b.minLon && lon <= b.maxLon && lat >= b.minLat && lat <= b.maxLat;
    });

    // A country is "covered" only on its own region tab — UAE on the
    // Middle East view is green and labeled, on the Africa view it just
    // sits as background grey. Same for Egypt etc. crossing the other way.
    const isCoveredHere = (id) => {
      const c = coveredById[id];
      return c && c.region === region;
    };
    const baseFeatures = visible.filter(f => !isCoveredHere(f.id));
    const coveredFeatures = visible.filter(f => isCoveredHere(f.id));

    // Base layer (uncovered, non-interactive)
    const base = gBase.selectAll('path').data(baseFeatures, d => d.id);
    base.exit().remove();
    base.enter().append('path').merge(base)
      .attr('d', path)
      .attr('fill', '#E8E3DA')
      .attr('stroke', '#FAFBFC')
      .attr('stroke-width', 0.5)
      .style('pointer-events', 'none');

    // Covered layer (interactive, on top of base)
    const cov = gCovered.selectAll('path').data(coveredFeatures, d => d.id);
    cov.exit().remove();
    cov.enter().append('path').merge(cov)
      .attr('d', path)
      .attr('fill', d => SHADES[coveredById[d.id].map_shade] || SHADES[1])
      .attr('stroke', '#FAFBFC')
      .attr('stroke-width', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', function (e, d) {
        d3.select(this).attr('fill', HOVER_FILL);
        tip.textContent = coveredById[d.id].name;
        tip.classList.add('visible');
      })
      .on('mousemove', function (e) {
        const r = mapEl.getBoundingClientRect();
        tip.style.left = (e.clientX - r.left + 12) + 'px';
        tip.style.top = (e.clientY - r.top - 30) + 'px';
      })
      .on('mouseout', function (e, d) {
        d3.select(this).attr('fill', SHADES[coveredById[d.id].map_shade] || SHADES[1]);
        tip.classList.remove('visible');
      })
      .on('click', function (e, d) {
        window.location.href = `country.html?id=${coveredById[d.id].id}`;
      });

    // Markers (regional systems + fallback dots for missing-polygon countries)
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
        .on('mouseout', function () { tip.classList.remove('visible'); });
      grp.append('circle')
        .attr('r', 6)
        .attr('fill', SHADES[c.map_shade] || SHADES[1])
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
        .on('mouseout', function () { tip.classList.remove('visible'); });
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

    // Country labels — drawn last so they sit on top of everything.
    gLabels.selectAll('*').remove();
    coveredFeatures.forEach(f => {
      const c = coveredById[f.id];
      const centre = path.centroid(f);
      if (!isFinite(centre[0]) || !isFinite(centre[1])) return;
      const label = c.map_label || c.name;
      const fontSize = label.length > 8 ? 9 : 10;
      gLabels.append('text')
        .attr('x', centre[0])
        .attr('y', centre[1])
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', fontSize)
        .attr('font-weight', 700)
        .attr('fill', '#FAFBFC')
        .attr('paint-order', 'stroke')
        .attr('stroke', '#04362e')
        .attr('stroke-width', 2.5)
        .attr('stroke-linejoin', 'round')
        .text(label);
    });
    // Labels for fallback-marker countries (e.g. Bahrain)
    fallbackCountries.forEach(c => {
      const p = proj(c.fallback_coordinates);
      if (!p) return;
      gLabels.append('text')
        .attr('x', p[0])
        .attr('y', p[1] - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', 9)
        .attr('font-weight', 700)
        .attr('fill', '#FAFBFC')
        .attr('paint-order', 'stroke')
        .attr('stroke', '#04362e')
        .attr('stroke-width', 2.5)
        .attr('stroke-linejoin', 'round')
        .text(c.map_label || c.name);
    });
  }

  return { draw };
}
