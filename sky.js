/* =====================================================================
   HeadSpace · Stargazing-Reiter, Mondphase, Himmelsereignisse, Wetter
   Nutzt Astro (astro.js), SkyData (sky-data.js) und Helfer aus index.html
   (esc, showModal, closeModal, switchTab, toast, S).
   Wetter: Open-Meteo (CC BY 4.0), Ortssuche: Open-Meteo Geocoding.
   ===================================================================== */
(function () {
  'use strict';
  const A = window.Astro, D = window.SkyData;
  const q = s => document.querySelector(s);
  const HOUR = 3600000, DAYMS = 86400000;
  const DEFAULT_LOC = { lat: 51.34, lon: 12.37, name: 'Leipzig', preset: true };

  const SK = {
    loc: (() => { try { return JSON.parse(localStorage.getItem('hs-loc')); } catch { return null; } })(),
    mode: localStorage.getItem('hs-skyt') || 'auto', custom: null,
    sub: localStorage.getItem('hs-skysub') || 'solar',
    wx: null, wxKey: null, wxAt: 0, wxErr: null, wxLoading: false,
    evCache: null, evKey: null,
  };
  const loc = () => SK.loc || DEFAULT_LOC;
  const obs = () => ({ lat: loc().lat, lon: loc().lon });

  /* ---------- kleine Helfer ---------- */
  const pad = n => String(n).padStart(2, '0');
  const fT = d => d ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : '–';
  const WDL = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const fD = d => WDL[d.getDay()] + ', ' + d.getDate() + '.' + (d.getMonth() + 1) + '.';
  const fDT = d => fD(d) + ' ' + fT(d);
  const sod = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  function inDays(t) {
    const n = Math.round((sod(t) - sod(Date.now())) / DAYMS);
    return n === 0 ? 'heute' : n === 1 ? 'morgen' : n === -1 ? 'gestern' : n > 1 ? 'in ' + n + ' Tagen' : 'vor ' + (-n) + ' Tagen';
  }
  const dir8 = az => ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten'][Math.round(az / 45) % 8];
  const dir16 = az => ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(az / 22.5) % 16];
  const altWord = a => a < 10 ? 'knapp über dem Horizont' : a < 25 ? 'tief' : a < 45 ? 'halbhoch' : a < 70 ? 'hoch' : 'fast senkrecht über dir';
  const fists = a => a < 7 ? 'gut eine halbe Faust' : Math.round(a / 10) === 1 ? 'etwa eine Faust' : 'etwa ' + Math.round(a / 10) + ' Fäuste';
  const where = p => `${dir8(p.az)}, ${altWord(p.alt)} – ${Math.round(p.alt)}° (${fists(p.alt)} über dem Horizont)`;
  const magTxt = m => (m < 0 ? '−' : '') + Math.abs(m).toFixed(1).replace('.', ',') + ' mag';
  const pct = x => Math.round(x * 100) + ' %';
  function nightBase(now = new Date()) { const d = new Date(now); if (d.getHours() < 12) d.setDate(d.getDate() - 1); d.setHours(12, 0, 0, 0); return d; }

  const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = {
    eye: sv('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    bino: sv('<circle cx="6.5" cy="15.5" r="4"/><circle cx="17.5" cy="15.5" r="4"/><path d="M10.5 15h3M5 11l2-6h3l.5 6M19 11l-2-6h-3l-.5 6"/>'),
    scope: sv('<path d="M3 13l13-6 2 4-13 6z"/><path d="M16 7l3-1.5 2 4L18 11M9 16l-3 5M10 16l3 5"/>'),
    smart: sv('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/><path d="M10 7l2 2 2-2" />'),
    pin: sv('<path d="M12 21s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
    star: sv('<path d="M12 3l2.4 6.3L21 9.8l-5 4.4 1.6 6.8L12 17.3 6.4 21l1.6-6.8-5-4.4 6.6-.5z"/>'),
    gal: sv('<ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-20 12 12)"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>'),
    neb: sv('<path d="M5 15c-2-3 1-7 5-6 1-3 6-3 7 1 3 0 4 4 1 6-1 3-6 3-8 1-2 1-4 0-5-2z"/>'),
    clus: sv('<circle cx="8" cy="9" r="1.2" fill="currentColor"/><circle cx="14" cy="7" r="1" fill="currentColor"/><circle cx="16" cy="13" r="1.4" fill="currentColor"/><circle cx="10" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="11" r=".9" fill="currentColor"/><circle cx="7" cy="17" r=".8" fill="currentColor"/>'),
    dbl: sv('<circle cx="9" cy="12" r="3"/><circle cx="16.5" cy="12" r="2"/>'),
    cons: sv('<circle cx="5" cy="17" r="1.3" fill="currentColor"/><circle cx="10" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="13" r="1.3" fill="currentColor"/><circle cx="19" cy="5" r="1.3" fill="currentColor"/><path d="M5 17l5-8 5 4 4-8" opacity=".6"/>'),
    cloud: sv('<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z"/>'),
    book: sv('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>'),
  };
  const dsoIcon = t => /Galax/.test(t) ? IC.gal : /Nebel|Überrest/.test(t) ? IC.neb : /Doppel/.test(t) ? IC.dbl : IC.clus;

  /* ---------- Mond-Grafik ---------- */
  let _mid = 0;
  function moonSVG(size, illum, waxing) {
    const id = 'm' + (++_mid), c = size / 2, r = size / 2 - 1.5, rx = r * Math.abs(1 - 2 * illum);
    let d = '';
    if (illum > 0.995) d = `M${c},${c - r}A${r},${r} 0 1,1 ${c},${c + r}A${r},${r} 0 1,1 ${c},${c - r}Z`;
    else if (illum > 0.005) {
      const o = waxing ? 1 : 0, i = waxing ? (illum < 0.5 ? 0 : 1) : (illum < 0.5 ? 1 : 0);
      d = `M${c},${c - r}A${r},${r} 0 0,${o} ${c},${c + r}A${rx},${r} 0 0,${i} ${c},${c - r}Z`;
    }
    const cr = [[.36, .34, .1], [.6, .3, .07], [.55, .58, .13], [.3, .62, .07], [.7, .7, .06], [.45, .8, .05]];
    return `<svg class="moon-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="width:${size}px;height:${size}px" aria-hidden="true">
      <defs><radialGradient id="${id}g" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#fffbea"/><stop offset=".7" stop-color="#e6dfc6"/><stop offset="1" stop-color="#bfb79c"/></radialGradient>
      <clipPath id="${id}c"><path d="${d}"/></clipPath></defs>
      <circle cx="${c}" cy="${c}" r="${r}" fill="#20223f"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="#fff" opacity=".035"/>
      ${d ? `<path d="${d}" fill="url(#${id}g)"/><g clip-path="url(#${id}c)" fill="#9c947c" opacity=".35">${cr.map(([x, y, s]) => `<circle cx="${x * size}" cy="${y * size}" r="${s * size}"/>`).join('')}</g>` : ''}
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/></svg>`;
  }
  function phaseName(ph, il) {
    if (il < 0.02) return 'Neumond';
    if (il > 0.985) return 'Vollmond';
    if (ph < 180) return Math.abs(ph - 90) < 7 ? 'Erstes Viertel' : ph < 90 ? 'Zunehmende Sichel' : 'Zunehmender Mond';
    return Math.abs(ph - 270) < 7 ? 'Letztes Viertel' : ph > 270 ? 'Abnehmende Sichel' : 'Abnehmender Mond';
  }

  /* ---------- Header-Mond ---------- */
  function badge() {
    const el = q('#moonBadge'); if (!el) return;
    const m = A.geo('Moon', new Date()), name = phaseName(m.phase, m.illum);
    el.innerHTML = moonSVG(26, m.illum, m.waxing) + `<span class="mb-txt"><b>${pct(m.illum)}</b><span class="mb-name">${name}</span></span>`;
    el.title = `${name} · ${pct(m.illum)} beleuchtet – Stargazing öffnen`;
  }

  /* ---------- Beobachtungszeit ---------- */
  function obsTime() {
    const now = new Date();
    if (SK.mode === 'now') return now;
    if (SK.mode === 'custom' && SK.custom) return new Date(SK.custom);
    const nb = nightBase(now);
    if (SK.mode === 'auto') {
      if (A.body('Sun', now, obs()).alt < -10) return now;
      const n = A.night(obs(), now.getHours() < 12 ? nb : now);
      const t = n.nautical || n.civil || n.sunset;
      return t && t > now ? new Date(t.getTime() + 20 * 60000) : now;
    }
    const t = new Date(nb), h = { '21': 21, '23': 23, '2': 26, '5': 29 }[SK.mode] ?? 21;
    t.setHours(h, 0, 0, 0); return t;
  }
  function autoLabel() {
    const now = new Date();
    return A.body('Sun', now, obs()).alt < -10 ? 'Jetzt' : 'Heute ab Dunkelheit';
  }

  /* =====================================================================
     Wetter (Open-Meteo)
     ===================================================================== */
  const WMO = { 0: ['Klar', '☀️', '🌙'], 1: ['Überwiegend klar', '🌤️', '🌙'], 2: ['Teils bewölkt', '⛅', '☁️'], 3: ['Bedeckt', '☁️', '☁️'], 45: ['Nebel', '🌫️'], 48: ['Reifnebel', '🌫️'], 51: ['Leichter Niesel', '🌦️'], 53: ['Niesel', '🌦️'], 55: ['Starker Niesel', '🌧️'], 56: ['Gefrierender Niesel', '🌧️'], 57: ['Gefrierender Niesel', '🌧️'], 61: ['Leichter Regen', '🌦️'], 63: ['Regen', '🌧️'], 65: ['Starker Regen', '🌧️'], 66: ['Gefrierender Regen', '🌧️'], 67: ['Gefrierender Regen', '🌧️'], 71: ['Leichter Schnee', '🌨️'], 73: ['Schnee', '🌨️'], 75: ['Starker Schnee', '❄️'], 77: ['Schneegriesel', '🌨️'], 80: ['Regenschauer', '🌦️'], 81: ['Regenschauer', '🌧️'], 82: ['Heftige Schauer', '⛈️'], 85: ['Schneeschauer', '🌨️'], 86: ['Schneeschauer', '❄️'], 95: ['Gewitter', '⛈️'], 96: ['Gewitter mit Hagel', '⛈️'], 99: ['Gewitter mit Hagel', '⛈️'] };
  const wmo = (c, night) => { const w = WMO[c] || ['–', '·']; return { txt: w[0], ic: night && w[2] ? w[2] : w[1] }; };

  async function loadWx(force) {
    const L = loc(), key = L.lat.toFixed(2) + ',' + L.lon.toFixed(2);
    if (!force && SK.wx && SK.wxKey === key && Date.now() - SK.wxAt < HOUR) return;
    if (!force && !SK.wx) {
      try { const c = JSON.parse(localStorage.getItem('hs-wx')); if (c && c.key === key && Date.now() - c.at < HOUR) { SK.wx = parseWx(c.data); SK.wxKey = key; SK.wxAt = c.at; return; } } catch { }
    }
    if (SK.wxLoading) return;
    SK.wxLoading = true; SK.wxErr = null;
    try {
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${L.lat}&longitude=${L.lon}&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`;
      const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      SK.wx = parseWx(data); SK.wxKey = key; SK.wxAt = Date.now();
      try { localStorage.setItem('hs-wx', JSON.stringify({ key, at: SK.wxAt, data })); } catch { }
    } catch (e) { SK.wxErr = 'Wetter nicht abrufbar (' + e.message + ')'; }
    SK.wxLoading = false;
  }
  function parseWx(j) {
    const off = (j.utc_offset_seconds || 0) * 1000;
    const tl = s => { const [d, t] = s.split('T'), [y, m, dd] = d.split('-').map(Number), [hh, mi] = (t || '00:00').split(':').map(Number); return new Date(Date.UTC(y, m - 1, dd, hh, mi) - off); };
    const H = j.hourly, hours = H.time.map((s, i) => ({ t: tl(s), cc: H.cloud_cover[i], low: H.cloud_cover_low[i], mid: H.cloud_cover_mid[i], high: H.cloud_cover_high[i], vis: H.visibility[i], rh: H.relative_humidity_2m[i], dew: H.dew_point_2m[i], temp: H.temperature_2m[i], pp: H.precipitation_probability[i], code: H.weather_code[i], wind: H.wind_speed_10m[i] }));
    const days = j.daily.time.map((s, i) => ({ t: tl(s), code: j.daily.weather_code[i], max: j.daily.temperature_2m_max[i], min: j.daily.temperature_2m_min[i], pp: j.daily.precipitation_probability_max[i] }));
    return { hours, days, cur: j.current, end: hours.length ? hours[hours.length - 1].t : new Date() };
  }
  // Bewertung einer Nacht (Abend des Datums base)
  function nightWx(base) {
    if (!SK.wx) return null;
    const b = nightBase(base), t0 = b.getTime() + 5 * HOUR, t1 = b.getTime() + 19 * HOUR; // 17:00 bis 07:00
    const hs = SK.wx.hours.filter(h => h.t >= t0 && h.t <= t1 && A.body('Sun', h.t, obs()).alt < -10);
    if (hs.length < 3) return null;
    const avg = k => hs.reduce((s, h) => s + (h[k] ?? 0), 0) / hs.length;
    const cc = avg('cc'), rh = avg('rh'), wind = Math.max(...hs.map(h => h.wind ?? 0)), pp = Math.max(...hs.map(h => h.pp ?? 0));
    const vis = Math.min(...hs.map(h => h.vis ?? 99999));
    const clear = hs.filter(h => h.cc <= 30);
    let score = 100 - cc * 1.0 - (rh > 90 ? 10 : 0) - (pp > 50 ? 15 : 0) - (vis < 5000 ? 15 : 0);
    const rating = score >= 75 ? ['Sehr gut', 'r4'] : score >= 55 ? ['Gut', 'r3'] : score >= 30 ? ['Mäßig', 'r2'] : ['Schlecht', 'r1'];
    // zusammenhängendes klares Fenster
    let win = null, cur = null;
    for (const h of hs) { if (h.cc <= 30) { cur = cur || { a: h.t, b: h.t }; cur.b = h.t; if (!win || cur.b - cur.a > win.b - win.a) win = { ...cur }; } else cur = null; }
    const notes = [];
    if (rh > 90) notes.push('sehr feucht – Dunst, Nebel oder Tau möglich, Optik abdecken');
    if (vis < 5000) notes.push('eingeschränkte Fernsicht (Dunst/Nebel)');
    if (pp > 40) notes.push('Niederschlag möglich (' + pp + ' %)');
    if (wind > 30) notes.push('windig (bis ' + Math.round(wind) + ' km/h) – Teleskop wackelt');
    const minT = Math.min(...hs.map(h => h.temp));
    return { hs, cc, rh, wind, pp, rating, win, clear: clear.length, notes, minT };
  }

  /* =====================================================================
     Himmelsereignisse
     ===================================================================== */
  const BRIGHT = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const PNAME = { Mercury: 'Merkur', Venus: 'Venus', Mars: 'Mars', Jupiter: 'Jupiter', Saturn: 'Saturn', Moon: 'Mond' };
  const STARS = [['Plejaden', 3.79, 24.12], ['Regulus', 10.139, 11.97], ['Spika', 13.42, -11.16], ['Antares', 16.49, -26.43], ['Aldebaran', 4.599, 16.51]];

  function computeEvents(fromT, days) {
    const out = [], toT = fromT + days * DAYMS;
    // Meteorströme
    const y0 = new Date(fromT).getFullYear();
    for (let y = y0 - 1; y <= y0 + 1; y++) for (const s of D.showers) {
      const peak = A.timeOfSolarLon(s.lambda, new Date(y, s.approx[0] - 1, s.approx[1], 12));
      if (peak.getTime() >= fromT - 1.5 * DAYMS && peak.getTime() <= toT)
        out.push({ id: `met-${s.code}-${peak.getFullYear()}`, kind: 'meteor', t: peak.getTime(), title: s.name, s, big: true, icon: '☄️' });
    }
    // Finsternisse
    for (const e of D.eclipses) { const t = Date.parse(e.date); if (t >= fromT - DAYMS && t <= toT) out.push({ id: e.id, kind: 'eclipse', t, title: e.title, e, big: true, icon: e.solar ? '🌘' : '🌕' }); }
    // Oppositionen & größte Elongationen (tägliche Abtastung)
    const step = DAYMS;
    for (const p of ['Mars', 'Jupiter', 'Saturn', 'Mercury', 'Venus']) {
      const samp = []; for (let t = fromT - 2 * step; t <= toT + 2 * step; t += step) samp.push([t, A.geo(p, new Date(t)).elong]);
      for (let i = 1; i < samp.length - 1; i++) {
        const [t, e] = samp[i]; if (!(e > samp[i - 1][1] && e >= samp[i + 1][1])) continue;
        let bt = t, be = e; for (let h = -24; h <= 24; h += 2) { const x = A.geo(p, new Date(t + h * HOUR)).elong; if (x > be) { be = x; bt = t + h * HOUR; } }
        if (bt < fromT - DAYMS || bt > toT) continue;
        if ((p === 'Mars' || p === 'Jupiter' || p === 'Saturn') && be > 170) out.push({ id: `opp-${p}-${new Date(bt).toISOString().slice(0, 10)}`, kind: 'opposition', t: bt, title: `${PNAME[p]} in Opposition`, p, big: true, icon: '🪐' });
        if ((p === 'Mercury' || p === 'Venus') && be > 15 && be < 50) { const ev = A.geo(p, new Date(bt)).evening; out.push({ id: `elo-${p}-${new Date(bt).toISOString().slice(0, 10)}`, kind: 'elongation', t: bt, title: `${PNAME[p]}: beste ${ev ? 'Abend' : 'Morgen'}sichtbarkeit`, p, evening: ev, elong: be, big: p === 'Venus' || be > 22, icon: '✨' }); }
      }
    }
    // Planetenkonjunktionen
    for (let i = 0; i < BRIGHT.length; i++) for (let j = i + 1; j < BRIGHT.length; j++) {
      const a = BRIGHT[i], b = BRIGHT[j], sep = t => A.separation(A.geo(a, new Date(t)), A.geo(b, new Date(t)));
      let prev2 = sep(fromT - 12 * HOUR), prev = sep(fromT);
      for (let t = fromT + 12 * HOUR; t <= toT; t += 12 * HOUR) {
        const cur = sep(t);
        if (prev < prev2 && prev <= cur && prev < 2.5) {
          let bt = t - 12 * HOUR, bs = prev; for (let h = -12; h <= 12; h++) { const x = sep(t - 12 * HOUR + h * HOUR); if (x < bs) { bs = x; bt = t - 12 * HOUR + h * HOUR; } }
          const ea = A.geo(a, new Date(bt)).elong, eb = A.geo(b, new Date(bt)).elong;
          if (Math.min(ea, eb) > 12) out.push({ id: `cnj-${a}-${b}-${new Date(bt).toISOString().slice(0, 10)}`, kind: 'conj', t: bt, title: `${PNAME[a]} trifft ${PNAME[b]}`, a, b, sep: bs, big: bs < 1.5, icon: '💫' });
        }
        prev2 = prev; prev = cur;
      }
    }
    // Mond bei hellen Planeten und Sternen
    const targets = [...['Venus', 'Mars', 'Jupiter', 'Saturn'].map(p => ({ n: PNAME[p], pos: t => A.geo(p, new Date(t)), p })), ...STARS.map(([n, ra, dec]) => ({ n, pos: t => A.precess(ra, dec, new Date(t)) }))];
    for (const tg of targets) {
      const sep = t => A.separation(A.geo('Moon', new Date(t)), tg.pos(t));
      let p2 = sep(fromT - 2 * HOUR), p1 = sep(fromT);
      for (let t = fromT + 2 * HOUR; t <= toT; t += 2 * HOUR) {
        const c = sep(t);
        if (p1 < p2 && p1 <= c && p1 < 2.2) {
          let bt = t - 2 * HOUR, bs = p1; for (let m = -120; m <= 120; m += 15) { const x = sep(t - 2 * HOUR + m * 60000); if (x < bs) { bs = x; bt = t - 2 * HOUR + m * 60000; } }
          const me = A.geo('Moon', new Date(bt)).elong;
          if (me > 25) out.push({ id: `mcj-${tg.n}-${new Date(bt).toISOString().slice(0, 10)}`, kind: 'moonconj', t: bt, title: `Mond bei ${tg.n}`, target: tg.n, p: tg.p, sep: bs, big: tg.n === 'Plejaden' || (tg.p && bs < 1.2), icon: '🌙' });
        }
        p2 = p1; p1 = c;
      }
    }
    return out.sort((x, y) => x.t - y.t);
  }
  function events() {
    const key = new Date().toDateString() + '|' + loc().lat.toFixed(1) + loc().lon.toFixed(1);
    if (SK.evKey !== key) { SK.evCache = computeEvents(sod(Date.now()), 60); SK.evKey = key; }
    return SK.evCache.filter(e => e.t > Date.now() - (e.kind === 'meteor' ? 1.2 : 0.6) * DAYMS);
  }
  const bigSoon = () => events().filter(e => e.big && e.t <= Date.now() + 14 * DAYMS);

  // beste Beobachtungszeit für Konjunktion/Elongation: Dämmerung oder dunkle Stunde, in der beide oben sind
  function bestView(bodies, t) {
    const base = nightBase(new Date(t)), n = A.night(obs(), base), o = obs();
    const cands = [];
    const from = (n.civil || n.sunset || base).getTime(), to = (n.sunrise || new Date(base.getTime() + 20 * HOUR)).getTime();
    for (let x = from; x <= to; x += 15 * 60000) {
      const d = new Date(x), sun = A.body('Sun', d, o).alt;
      if (sun > -5) continue;
      const alts = bodies.map(b => typeof b === 'string' ? A.body(b, d, o) : A.star(b.ra, b.dec, d, o));
      const minAlt = Math.min(...alts.map(a => a.alt));
      if (minAlt < 4) continue;
      cands.push({ d, alt: minAlt, p: alts[0], score: minAlt + Math.min(0, -sun - 6) * 0.5 });
    }
    if (!cands.length) return null;
    return cands.sort((a, b) => b.score - a.score)[0];
  }
  function meteorPlan(s, peak) {
    const base = nightBase(peak), n = A.night(obs(), base), o = obs();
    const from = (n.nautical || n.sunset || base).getTime(), to = (n.nauticalEnd || n.sunrise || new Date(base.getTime() + 20 * HOUR)).getTime();
    const rows = [];
    for (let x = Math.ceil(from / HOUR) * HOUR; x <= to; x += HOUR) {
      const d = new Date(x), rad = A.star(s.ra, s.dec, d, o), m = A.body('Moon', d, o), sun = A.body('Sun', d, o).alt;
      const moonF = m.alt > 0 ? 1 - 0.65 * m.illum : 1, darkF = sun < -15 ? 1 : 0.5;
      const rate = rad.alt > 0 ? s.zhr * Math.sin(rad.alt * Math.PI / 180) * moonF * darkF * 0.55 : 0;
      rows.push({ d, alt: rad.alt, az: rad.az, moonUp: m.alt > 0, moonAlt: m.alt, rate });
    }
    const best = rows.reduce((a, r) => (!a || r.rate > a.rate) ? r : a, null);
    const mPeak = A.geo('Moon', peak);
    return { base, n, rows, best, moonIllum: mPeak.illum, moon: A.riseSet('Moon', o, base, 30) };
  }

  /* ---------- Ereignis-Detail ---------- */
  const KIND = { meteor: 'Meteorstrom', eclipse: 'Finsternis', opposition: 'Opposition', elongation: 'Größte Elongation', conj: 'Planetentreffen', moonconj: 'Mond-Begegnung' };
  function wxLine(t) {
    const nw = nightWx(new Date(t));
    if (nw) return `<div class="ev-wx ${nw.rating[1]}">${IC.cloud}<div><b>Wetter für diese Nacht: ${nw.rating[0]}</b><br><span>Ø ${Math.round(nw.cc)} % Bewölkung${nw.win ? ` · klar etwa ${fT(nw.win.a)}–${fT(new Date(nw.win.b.getTime() + HOUR))}` : ''}${nw.notes.length ? ' · ' + nw.notes.join(' · ') : ''}. Tiefstwert ${Math.round(nw.minT)} °C.</span>${(t - Date.now()) > 5 * DAYMS ? '<br><span class="muted">Prognose für mehrere Tage im Voraus – noch unsicher.</span>' : ''}</div></div>`;
    if (SK.wx && t > SK.wx.end.getTime()) return `<div class="ev-wx">${IC.cloud}<div><span>Eine Wetterprognose gibt es ab etwa ${Math.max(1, Math.round((t - SK.wx.end.getTime()) / DAYMS))} Tagen vorher.</span></div></div>`;
    return '';
  }
  function eventDetail(e) {
    const d = new Date(e.t), o = obs();
    let what = '', cond = '', how = '';
    if (e.kind === 'meteor') {
      const s = e.s, plan = meteorPlan(s, d), b = plan.best;
      what = `<p>Sternschnuppen sind Staubkörnchen – meist kleiner als ein Sandkorn –, die mit hoher Geschwindigkeit (hier ${s.v} km/s) in die Hochatmosphäre eintauchen und in 80–100 km Höhe verglühen. Jedes Jahr um dieselbe Zeit kreuzt die Erde die Staubspur eines Kometen oder Asteroiden – dann kommen viele Meteore scheinbar aus einem Punkt, dem <b>Radianten</b>.</p><p><b>Ursprung:</b> ${s.parent}.<br>${s.note}</p>`;
      cond = `<div class="kv2"><span>Maximum</span><b>${fDT(d)} Uhr</b></div>
        <div class="kv2"><span>Beste Nacht</span><b>${fD(plan.base)} auf ${fD(new Date(plan.base.getTime() + DAYMS))}</b></div>${d.getHours() >= 8 && d.getHours() < 18 ? `<p class="sk-tip" style="margin:6px 0">Das Maximum fällt in den Tag – die Nacht davor (${fD(new Date(plan.base.getTime() - DAYMS))} auf ${fD(plan.base)}) lohnt sich genauso.</p>` : ''}
        <div class="kv2"><span>Radiant</span><b>${s.rad}${b ? ` – um ${fT(b.d)} ${dir8(b.az)}, ${Math.round(b.alt)}° hoch` : ''}</b></div>
        <div class="kv2"><span>Mond</span><b>${pct(plan.moonIllum)} beleuchtet${plan.moon.set ? ' · Untergang ' + fT(plan.moon.set) : ''}${plan.moon.rise ? ' · Aufgang ' + fT(plan.moon.rise) : ''}</b></div>
        <div class="kv2"><span>Theoretische Rate (ZHR)</span><b>${s.zhr} pro Stunde</b></div>
        ${b && b.rate > 0 ? `<div class="kv2"><span>Realistisch erwartbar</span><b>dunkler Landhimmel: bis ~${Math.max(1, Math.round(b.rate))}/h um ${fT(b.d)} · Stadt: ~${Math.max(1, Math.round(b.rate * 0.3))}/h</b></div>` : '<div class="kv2"><span>Realistisch</span><b>Radiant steht in dieser Nacht ungünstig tief.</b></div>'}
        <table class="mtab"><tr><th>Uhrzeit</th><th>Radiant</th><th>Mond</th><th>≈ pro h</th></tr>${plan.rows.filter((r, i) => i % 2 === 0 || r === b).map(r => `<tr class="${r === b ? 'best' : ''}"><td>${fT(r.d)}</td><td>${Math.max(0, Math.round(r.alt))}°</td><td>${r.moonUp ? 'oben' : '–'}</td><td>${Math.round(r.rate)}</td></tr>`).join('')}</table>`;
      how = `<ul><li>Raus aus der Stadt, weg von Lampen. Liegestuhl oder Isomatte – im Liegen sieht man den meisten Himmel.</li><li>20–30 Minuten Augen an die Dunkelheit gewöhnen lassen, nicht aufs Handy schauen (höchstens Rotlicht).</li><li>Nicht direkt auf den Radianten starren: rund 40–60° daneben und etwa halbhoch hinsehen – dort erscheinen die längsten Spuren.</li><li>Geduld: Meteore kommen in Schüben. Warm anziehen, Thermoskanne mitnehmen.</li><li>${IC.eye} Bloßes Auge ist ideal. Fernglas und Teleskop sind zu eng – Smart-Teleskope ebenso. Für Fotos: Kamera mit Weitwinkel aufs Stativ, Serienbelichtung.</li></ul>`;
    } else if (e.kind === 'eclipse') {
      const ee = e.e;
      what = `<p>${ee.detail}</p>`;
      cond = `<p>${ee.vis}</p>`;
      how = ee.solar ? `<ul><li><b>Niemals ungeschützt in die Sonne schauen</b> – auch nicht bei teilweiser Bedeckung, und erst recht nicht mit Fernglas oder Teleskop. Bleibende Augenschäden drohen.</li><li>Nur zertifizierte Finsternisbrillen (ISO 12312-2) oder Sonnenfilter vor dem Objektiv verwenden.</li><li>Schöner Trick: Lochkamera oder ein Sieb/Blätterdach – die Lichtflecken am Boden zeigen kleine Sonnensicheln.</li><li>Smart-Teleskope nur mit dem passenden Sonnenfilter.</li></ul>` : `<ul><li>Eine Mondfinsternis ist völlig ungefährlich – mit bloßem Auge, Fernglas und Teleskop.</li><li>Freie Sicht zum entsprechenden Horizont suchen, besonders bei tiefem Mond.</li><li>Im Fernglas wirken die Farben im Schattenbereich am schönsten; Smart-Teleskope eignen sich gut für Zeitreihen.</li></ul>`;
    } else if (e.kind === 'opposition') {
      const g = A.geo(e.p, d), mid = new Date(nightBase(d)); mid.setHours(24, 0, 0, 0);
      const p = A.body(e.p, mid, o), P = D.planets[e.p];
      what = `<p>Bei einer Opposition steht ein äußerer Planet der Sonne genau gegenüber: Die Erde überholt ihn auf ihrer Innenbahn. Er geht bei Sonnenuntergang auf, steht um Mitternacht am höchsten und ist die ganze Nacht sichtbar – und so hell und groß wie im ganzen Jahr nicht.${e.p === 'Mars' ? ' Beim Mars passiert das nur etwa alle 26 Monate.' : ''}</p>`;
      cond = `<div class="kv2"><span>Datum</span><b>${fD(d)}</b></div><div class="kv2"><span>Helligkeit</span><b>${magTxt(g.mag)}</b></div><div class="kv2"><span>Um Mitternacht</span><b>${where(p)}</b></div><div class="kv2"><span>Sternbild</span><b>${A.zodiac(g.lon, d)}</b></div>`;
      how = `<p>${P.find}</p><ul><li>${IC.eye} ${P.eye}</li><li>${IC.bino} ${P.bino}</li><li>${IC.scope} ${P.scope}</li><li>${IC.smart} ${P.smart}</li></ul><p class="muted">Auch die Wochen davor und danach sind fast genauso gut.</p>`;
    } else if (e.kind === 'elongation') {
      const P = D.planets[e.p], bv = bestView([e.p], e.t);
      what = `<p>Merkur und Venus laufen innerhalb der Erdbahn um die Sonne und entfernen sich von uns aus gesehen nie weit von ihr. Bei der „größten Elongation“ ist der Winkelabstand zur Sonne am größten (${Math.round(e.elong)}°) – die beste Gelegenheit, ${P.name} ${e.evening ? 'am Abendhimmel nach Sonnenuntergang' : 'am Morgenhimmel vor Sonnenaufgang'} zu sehen.</p>`;
      cond = bv ? `<div class="kv2"><span>Gute Zeit</span><b>${fD(bv.d)} gegen ${fT(bv.d)} Uhr</b></div><div class="kv2"><span>Position</span><b>${where(bv.p)}</b></div><div class="kv2"><span>Helligkeit</span><b>${magTxt(A.geo(e.p, d).mag)}</b></div>` : `<p>Von deinem Standort steht ${P.name} diesmal sehr ungünstig tief in der Dämmerung – eine schwierige Sichtbarkeit.</p>`;
      how = `<p>${P.find}</p><ul><li>${IC.eye} ${P.eye}</li><li>${IC.bino} ${P.bino}</li><li>${IC.scope} ${P.scope}</li></ul>`;
    } else if (e.kind === 'conj' || e.kind === 'moonconj') {
      const bodies = e.kind === 'conj' ? [e.a, e.b] : ['Moon', e.p || (() => { const s = STARS.find(x => x[0] === e.target); return { ra: s[1], dec: s[2] }; })()];
      const bv = bestView(bodies, e.t);
      what = e.kind === 'conj'
        ? `<p>Zwei Planeten stehen von der Erde aus gesehen dicht beieinander – nur ${e.sep.toFixed(1).replace('.', ',')}° (zum Vergleich: der Vollmond ist ½° groß). Eine reine Perspektive: In Wirklichkeit trennen sie viele Millionen Kilometer.</p>`
        : `<p>Der Mond zieht auf seiner Monatsbahn dicht an ${e.target} vorbei (Abstand von der Erdmitte aus etwa ${e.sep.toFixed(1).replace('.', ',')}°, von deinem Standort leicht anders). Solche Paare sind besonders fotogen.${e.target === 'Plejaden' ? ' Bei den Plejaden schiebt sich der Mond manchmal sogar vor einzelne Sterne – eine Sternbedeckung.' : ''}</p>`;
      cond = bv ? `<div class="kv2"><span>Engster Abstand</span><b>${fDT(d)} Uhr</b></div><div class="kv2"><span>Gute Zeit zum Hinsehen</span><b>${fD(bv.d)} gegen ${fT(bv.d)} Uhr</b></div><div class="kv2"><span>Position</span><b>${where(bv.p)}</b></div>` : `<div class="kv2"><span>Engster Abstand</span><b>${fDT(d)} Uhr</b></div><p>Von deinem Standort aus stehen beide in dieser Nacht nicht gleichzeitig hoch genug am dunklen Himmel – die Nächte davor oder danach können besser sein.</p>`;
      how = `<ul><li>${IC.eye} Mit bloßem Auge ein schönes Paar – kein Gerät nötig.</li><li>${IC.bino} Im Fernglas passen beide meist gemeinsam ins Bild.</li><li>${IC.scope} Im Teleskop meist zu weit auseinander für ein Gesichtsfeld – erst den einen, dann den anderen ansehen.</li><li>${IC.smart} Für Fotos lieber Smartphone oder Kamera mit leichtem Tele als ein Smart-Teleskop.</li></ul>`;
    }
    return `<div class="modal sheet ev-modal">
      <button class="ico close" data-act="close" aria-label="Schließen">✕</button>
      <div class="ev-head"><span class="ev-ico">${e.icon}</span><div><div class="ev-kind">${KIND[e.kind]} · ${inDays(e.t)}</div><h2>${esc(e.title)}</h2></div></div>
      <h3 class="ev-h">Was ist das?</h3>${what}
      <h3 class="ev-h">Beobachtungsbedingungen <span class="muted">· ${esc(loc().name)}</span></h3>${cond}${wxLine(e.t)}
      <h3 class="ev-h">So beobachtest du es</h3>${how}
    </div>`;
  }
  async function openEvent(id) {
    const e = events().find(x => x.id === id) || (SK.evCache || []).find(x => x.id === id);
    if (!e) return;
    showModal(eventDetail(e), 'skyev');
    if (!SK.wx) { await loadWx(); if (S.modal === 'skyev') showModal(eventDetail(e), 'skyev'); }
  }

  /* ---------- Hauptseite: Leiste + Pop-up ---------- */
  function evRow(e) {
    const m = A.geo('Moon', new Date(e.t));
    const extra = e.kind === 'meteor' ? `Mond ${pct(m.illum)}` : e.kind === 'eclipse' ? 'Finsternis' : e.kind === 'opposition' ? 'ganze Nacht sichtbar' : e.kind === 'elongation' ? (e.evening ? 'abends' : 'morgens') : `${e.sep.toFixed(1).replace('.', ',')}° Abstand`;
    return `<button class="ev-row" data-sk="ev" data-id="${e.id}"><span class="ev-ico sm">${e.icon}</span><span class="ev-main"><b>${esc(e.title)}</b><span>${inDays(e.t)} · ${fD(new Date(e.t))}${e.kind === 'meteor' ? ' · Maximum ' + fT(new Date(e.t)) : ''}</span></span><span class="ev-chip">${extra}</span></button>`;
  }
  function strip(el) {
    if (!el) return;
    let list = []; try { list = bigSoon(); } catch { }
    const m = A.geo('Moon', new Date());
    el.innerHTML = `${list.length ? `<section class="panel sk-strip"><div class="sk-strip-h"><h2>Am Himmel demnächst</h2><span class="hint">nächste 2 Wochen</span></div><div class="ev-list">${list.map(evRow).join('')}</div></section>` : ''}
      <button class="moon-deco" data-sk="gosky" aria-label="Stargazing öffnen" title="${phaseName(m.phase, m.illum)} · ${pct(m.illum)}">${moonSVG(132, m.illum, m.waxing)}</button>`;
  }
  function checkNew() {
    if (S.modal) return;
    let seen = []; try { seen = JSON.parse(localStorage.getItem('hs-seen-ev') || '[]'); } catch { }
    const fresh = bigSoon().filter(e => !seen.includes(e.id));
    if (!fresh.length) return;
    localStorage.setItem('hs-seen-ev', JSON.stringify([...seen, ...fresh.map(e => e.id)].slice(-200)));
    showModal(`<div class="modal sheet ev-modal"><button class="ico close" data-act="close" aria-label="Schließen">✕</button>
      <div class="ev-pop-h">${moonSVG(44, A.geo('Moon', new Date()).illum, A.geo('Moon', new Date()).waxing)}<div><div class="ev-kind">Neu im Himmelskalender</div><h2>${fresh.length === 1 ? 'Ein Ereignis steht bevor' : fresh.length + ' Ereignisse stehen bevor'}</h2></div></div>
      <div class="ev-list">${fresh.map(evRow).join('')}</div>
      <p class="muted" style="font-size:13px;margin-top:14px">Tippe auf ein Ereignis für Beobachtungsbedingungen und Hintergründe. Alle Termine stehen auch unter „Stargazing“.</p></div>`, 'skypop');
  }

  /* =====================================================================
     Stargazing-Reiter
     ===================================================================== */
  const TIMES = [['auto', null], ['21', '21 Uhr'], ['23', '23 Uhr'], ['2', '2 Uhr'], ['5', '5 Uhr']];
  function render(main) {
    const T = obsTime(), o = obs(), sun = A.body('Sun', T, o), m = A.body('Moon', T, o);
    const base = nightBase(T), n = A.night(o, base);
    const L = loc();
    main.innerHTML = `<div class="sky">
      <div class="sky-bar">
        <button class="btn sky-loc" data-sk="loc">${IC.pin}<span>${esc(L.name)}${L.preset ? ' <span class="muted">(voreingestellt)</span>' : ''}</span></button>
        <div class="chips sky-times">${TIMES.map(([k, l]) => `<button class="chip ${SK.mode === k ? 'on' : ''}" data-sk="time" data-t="${k}">${l || autoLabel()}</button>`).join('')}
          <label class="chip sky-custom ${SK.mode === 'custom' ? 'on' : ''}">Andere Zeit<input type="datetime-local" id="skCustom" value="${SK.custom || ''}"></label></div>
      </div>
      <p class="sky-when">Himmel am <b>${fD(T)} um ${fT(T)} Uhr</b>${sun.alt > -6 ? ' – <span class="warn">es ist noch hell, kaum etwas sichtbar</span>' : sun.alt > -12 ? ' – Dämmerung, nur helle Objekte' : sun.alt > -18 ? ' – fast dunkel' : ' – dunkle Nacht'}</p>
      <div class="sky-top">
        ${moonCard(T, m, n, base)}
        <section class="panel sk-card" id="skWx">${wxCard()}</section>
      </div>
      <div class="sk-seg">${[['solar', 'Sonnensystem'], ['cons', 'Sternbilder'], ['deep', 'Deep Sky']].map(([k, l]) => `<button class="${SK.sub === k ? 'on' : ''}" data-sk="sub" data-s="${k}">${l}</button>`).join('')}</div>
      <div id="skList">${listHTML(T, sun.alt, m, n)}</div>
      <div class="sk-ev-wrap">${eventsCard()}</div>
      <p class="vhint">Faustregel: Eine ausgestreckte Faust deckt etwa 10° am Himmel ab, ein Finger etwa 2°. Positionen gelten für ${esc(L.name)}; Wetterdaten von <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>.</p>
    </div>`;
    const ci = q('#skCustom');
    if (ci) ci.onchange = e => { if (!e.target.value) return; SK.custom = e.target.value; SK.mode = 'custom'; render(main); };
    if (!SK.wx || Date.now() - SK.wxAt > HOUR) loadWx().then(() => { const w = q('#skWx'); if (w && S.tab === 'sky') { w.innerHTML = wxCard(); const ev = q('#skEv'); if (ev) ev.outerHTML = eventsCard(); } });
  }
  function moonCard(T, m, n, base) {
    const o = obs(), rs = A.riseSet('Moon', o, base, 30);
    const full = A.nextPhase(180, new Date()), nw = A.nextPhase(0, new Date());
    // mondfreie Dunkelheit
    let dark = null;
    if (n.astro && n.astroEnd) {
      let cur = null;
      for (let t = n.astro.getTime(); t <= n.astroEnd.getTime(); t += 10 * 60000) {
        const up = A.body('Moon', new Date(t), o).alt > -0.5;
        if (!up) { cur = cur || { a: t, b: t }; cur.b = t; if (!dark || cur.b - cur.a > dark.b - dark.a) dark = { ...cur }; } else cur = null;
      }
    }
    const tip = m.illum > 0.75 ? 'Heller Mond: ideal für Mond, Planeten und Doppelsterne – schwache Galaxien und Nebel gehen im Mondlicht unter.' : m.illum < 0.25 ? 'Wenig Mondlicht: gute Bedingungen für Galaxien, Nebel und die Milchstraße.' : 'Am Terminator (Licht-Schatten-Grenze) zeigt der Mond im Fernglas die meisten Krater.';
    const age = m.phase / 360 * 29.53;
    return `<section class="panel sk-card sk-moon">
      <div class="sm-top">${moonSVG(92, m.illum, m.waxing)}<div><div class="ev-kind">Mond</div><h2>${phaseName(m.phase, m.illum)}</h2><div class="sm-pct">${pct(m.illum)} beleuchtet · ${age.toFixed(1).replace('.', ',')} Tage alt</div></div></div>
      <div class="kv2"><span>Mond</span><b>${rs.rise ? 'Aufgang ' + fT(rs.rise) : ''}${rs.rise && rs.set ? ' · ' : ''}${rs.set ? 'Untergang ' + fT(rs.set) : ''}${!rs.rise && !rs.set ? (rs.up ? 'die ganze Nacht oben' : 'nicht sichtbar') : ''}</b></div>
      <div class="kv2"><span>Sonne</span><b>Untergang ${fT(n.sunset)} · Aufgang ${fT(n.sunrise)}</b></div>
      <div class="kv2"><span>Astronomische Nacht</span><b>${n.astro && n.astroEnd ? fT(n.astro) + '–' + fT(n.astroEnd) : 'wird nicht ganz dunkel'}</b></div>
      <div class="kv2"><span>Dunkel & mondfrei</span><b>${dark && dark.b - dark.a >= 30 * 60000 ? fT(new Date(dark.a)) + '–' + fT(new Date(dark.b)) : 'kaum – der Mond stört'}</b></div>
      <div class="kv2"><span>Nächster Vollmond</span><b>${full ? fDT(full) : '–'}</b></div>
      <div class="kv2"><span>Nächster Neumond</span><b>${nw ? fDT(nw) : '–'}</b></div>
      <p class="sm-tip">${tip}</p></section>`;
  }
  function wxCard() {
    if (SK.wxLoading && !SK.wx) return '<div class="big-empty"><span class="spin" style="display:inline-block"></span><br>Wetter wird geladen …</div>';
    if (!SK.wx) return `<div class="ev-kind">Wetter</div><p class="muted">${esc(SK.wxErr || 'Noch keine Wetterdaten.')}</p><button class="btn" data-sk="wx">Erneut laden</button>`;
    const w = SK.wx, c = w.cur || {}, nowNight = A.body('Sun', new Date(), obs()).alt < -6, cw = wmo(c.weather_code, nowNight);
    const today = w.days.find(d => sod(d.t) === sod(Date.now())) || w.days[0];
    const tn = nightWx(new Date());
    const nb = nightBase(new Date()), t0 = nb.getTime() + 5 * HOUR;
    const hrs = w.hours.filter(h => h.t >= t0 && h.t <= t0 + 14 * HOUR && h.t.getHours() % 1 === 0);
    const next = [1, 2, 3].map(k => { const b = new Date(nb.getTime() + k * DAYMS); return { b, r: nightWx(b) }; }).filter(x => x.r);
    return `<div class="ev-kind">Wetter · ${esc(loc().name)}</div>
      <div class="wx-now"><span class="wx-ic">${cw.ic}</span><div><b>${Math.round(c.temperature_2m)} °C · ${cw.txt}</b><span>Heute ${Math.round(today.min)} bis ${Math.round(today.max)} °C · Wind ${Math.round(c.wind_speed_10m)} km/h · ${c.relative_humidity_2m} % Luftfeuchte</span></div></div>
      ${tn ? `<div class="wx-rate ${tn.rating[1]}"><span>Sterngucken heute Nacht</span><b>${tn.rating[0]}</b><small>Ø ${Math.round(tn.cc)} % Wolken${tn.win ? ` · klar etwa ${fT(tn.win.a)}–${fT(new Date(tn.win.b.getTime() + HOUR))}` : ''}</small></div>` : ''}
      <div class="wx-hours">${hrs.map(h => { const dark = A.body('Sun', h.t, obs()).alt < -12; return `<div class="wh ${dark ? 'dark' : ''}" title="${fT(h.t)}: ${h.cc} % Wolken (tief ${h.low} %, mittel ${h.mid} %, hoch ${h.high} %)"><span class="wh-bar"><i style="height:${Math.max(4, h.cc)}%"></i></span><span class="wh-c">${h.cc}%</span><span class="wh-t">${h.t.getHours()}</span></div>`; }).join('')}</div>
      <div class="wx-legend"><span>Balken = Bewölkung · dunkle Spalten = astronomisch dunkel</span></div>
      ${tn && tn.notes.length ? `<p class="wx-notes">${tn.notes.map(esc).join(' · ')}</p>` : ''}
      ${next.length ? `<div class="wx-next">${next.map(x => `<span class="wx-n ${x.r.rating[1]}">${WDL[x.b.getDay()]}-Nacht<b>${x.r.rating[0]}</b></span>`).join('')}</div>` : ''}`;
  }
  function eventsCard() {
    let list = []; try { list = events().filter(e => e.t <= Date.now() + 45 * DAYMS); } catch { }
    if (!list.length) return '<div id="skEv"></div>';
    return `<section class="panel sk-card" id="skEv"><header class="panel-h" style="padding:0 0 8px"><h2>Himmelsereignisse</h2><span class="hint">nächste 6 Wochen</span></header><div class="ev-list">${list.map(evRow).join('')}</div></section>`;
  }

  /* ---------- Listen ---------- */
  function gear(x) {
    const row = (ic, l, t) => t ? `<div class="gear"><span class="g-ic" title="${l}">${ic}</span><div><b>${l}</b><span>${esc(t)}</span></div></div>` : '';
    return `<div class="gears">${row(IC.eye, 'Bloßes Auge', x.eye)}${row(IC.bino, 'Fernglas', x.bino)}${row(IC.scope, 'Teleskop', x.scope)}${row(IC.smart, 'Smart-Teleskop', x.smart)}</div>`;
  }
  const facts = f => f && f.length ? `<div class="sk-sec"><h4>${IC.star} Interessant</h4><ul class="facts">${f.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
  const BODIES = new Map();
  const WOW = { Moon: 5, Saturn: 5, Jupiter: 5, Venus: 4, Mars: 4, Mercury: 2, Uranus: 2, Neptune: 1, ori: 5, uma: 5, tau: 5, cas: 4, cyg: 4, sco: 4, leo: 4, lyr: 4, gem: 4, cma: 4, sgr: 4, per: 3, peg: 3, and: 3, aql: 3, boo: 3, aur: 3, her: 3, umi: 3, crb: 3, vir: 2, dra: 2, cep: 2, cet: 2, cmi: 2, ari: 2, cnc: 1, m42: 5, m45: 5, m31: 5, chi: 4, m13: 4, albireo: 4, m44: 4, m57: 4, m8: 4, mizar: 3, m27: 3, m81: 3, m51: 3, m22: 3, m11: 3, ngc7000: 3, m35: 3, aur3: 3, m33: 2, m101: 2, m1: 2, m92: 2, m3: 2, leotrio: 2, m97: 1 };
  const wowStars = id => { const w = WOW[id] || 2; return `<span class="wow" title="Wow-Faktor ${w} von 5">${'★'.repeat(w)}<i>${'★'.repeat(5 - w)}</i></span>`; };
  function item({ id, icon, color, name, sub, pos, mag, visible, note, body, fig }) {
    BODIES.set(id, { icon, color, name, sub, pos, mag, note, body, fig });
    return `<button class="sk-item ${visible ? '' : 'off'}" data-sk="obj" data-id="${id}">
      <span class="sk-ic" ${color ? `style="color:${color}"` : ''}>${icon}</span><span class="sk-main"><b>${esc(name)} ${wowStars(id)}</b><span>${esc(sub)}</span></span>
      <span class="sk-pos">${pos ? `<b>${dir16(pos.az)} ${Math.round(pos.alt)}°</b>` : ''}${mag != null ? `<span>${magTxt(mag)}</span>` : ''}</span></button>`;
  }
  function openObj(id) {
    const o = BODIES.get(id); if (!o) return;
    showModal(`<div class="modal sheet ev-modal obj-modal"><button class="ico close" data-act="close" aria-label="Schließen">✕</button>
      <div class="ev-head"><span class="ev-ico" ${o.color ? `style="color:${o.color}"` : ''}>${o.icon}</span><div><div class="ev-kind">${esc(o.sub)}</div><h2>${esc(o.name)}</h2></div></div>
      ${o.pos || o.mag != null ? `<div class="obj-pos">${o.pos ? `<span><b>${dir16(o.pos.az)}</b>Richtung</span><span><b>${Math.round(o.pos.alt)}°</b>Höhe</span>` : ''}${o.mag != null ? `<span><b>${magTxt(o.mag)}</b>Helligkeit</span>` : ''}</div>` : ''}
      ${o.fig ? `<div class="obj-fig">${o.fig()}</div>` : ''}
      ${o.note ? `<p class="sk-note">${o.note}</p>` : ''}${o.body}</div>`, 'skyobj');
  }
  function listHTML(T, sunAlt, m, n) {
    const o = obs(), base = nightBase(T);
    if (SK.sub === 'solar') {
      const vis = [], off = [];
      for (const key of ['Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']) {
        const P = D.planets[key], b = A.body(key, T, o), rs = A.riseSet(key, o, base, 30);
        const needDark = { Moon: 99, Venus: -2, Jupiter: -3, Mercury: -5, Mars: -5, Saturn: -6, Uranus: -15, Neptune: -15 }[key];
        const up = b.alt > (key === 'Moon' ? 0 : 3), dark = sunAlt < needDark, tooClose = key !== 'Moon' && b.elong < 12;
        const visible = up && dark && !tooClose;
        const con = key === 'Moon' ? A.zodiac(b.lon, T) : A.zodiac(b.lon, T);
        const why = visible ? `<b>Jetzt:</b> ${where(b)}.` : tooClose ? 'Steht zu nah an der Sonne – derzeit nicht beobachtbar.' : !up ? `Gerade unter dem Horizont${rs.rise ? ' – Aufgang ' + fD(rs.rise) + ' um ' + fT(rs.rise) : ''}.` : 'Noch zu hell am Himmel – nach Einbruch der Dunkelheit.';
        const times = `${rs.rise ? 'Aufgang ' + fT(rs.rise) : ''}${rs.rise && rs.set ? ' · ' : ''}${rs.set ? 'Untergang ' + fT(rs.set) : ''}`;
        const extra = key === 'Moon' ? `${pct(b.illum)} beleuchtet` : `im Sternbild ${con} · ${b.dist.toFixed(2).replace('.', ',')} AE entfernt`;
        const html = item({ id: key, icon: `<span class="pl-dot" style="background:${P.color}"></span>`, name: P.name, sub: `${P.type} · ${extra}`, pos: up ? b : null, mag: b.mag, visible,
          note: why + (times ? `<br><span class="muted">${times}</span>` : ''),
          body: `<div class="sk-sec"><h4>${IC.pin} So findest du ihn</h4><p>${esc(P.find)}</p></div>${gear(P)}${facts(P.facts)}`,
          fig: () => `<div class="fig-art">${key === 'Moon' ? `<div class="moon-art">${moonSVG(170, b.illum, b.waxing)}</div><span>aktuelle Phase</span>` : SkyCharts.photo(key, `${SkyCharts.planetArt(key)}<span>Illustration</span>`, P.name)}</div><div class="fig-map">${SkyCharts.finder(b.ra, b.dec, P.name, { type: 'planet', color: P.color, fov: 42 })}<span>Position zwischen den Sternen</span></div>` });
        const sc = (WOW[key] + (key === 'Mars' && b.elong > 140 ? 1 : 0)) * 18 + Math.min(b.alt, 60) * 0.5;
        (visible ? vis : off).push([visible ? sc : -90, html]);
      }
      return section(vis, off, 'Sonnensystem');
    }
    if (SK.sub === 'cons') {
      const vis = [], off = [];
      for (const c of D.constellations) {
        const p = A.star(c.ra, c.dec, T, o), circ = c.dec > 90 - o.lat;
        const visible = p.alt > 12 && sunAlt < -8;
        const why = visible ? `<b>Jetzt:</b> ${where(p)}${circ ? ' · zirkumpolar – geht nie unter' : ''}.` : p.alt <= 12 ? (p.alt < 0 ? 'Zurzeit unter dem Horizont – zu einer anderen Jahres- oder Uhrzeit sichtbar.' : 'Steht gerade sehr tief am Horizont.') : 'Noch zu hell.';
        const story = c.story ? D.stories.find(s => s.id === c.story) : null;
        const html = item({ id: c.id, icon: IC.cons, color: '#b3a6ff', name: c.name, sub: `${c.latin} · ${c.stars}`, pos: p.alt > 0 ? p : null, visible, note: why,
          body: `<div class="sk-sec"><h4>${IC.pin} So findest du es</h4><p>${esc(c.find)}</p>${c.tip ? `<p class="sk-tip">${esc(c.tip)}</p>` : ''}</div>
            <div class="sk-sec"><h4>${IC.book} Sage</h4>${((D.sagas || {})[c.id] || [c.myth]).map(t => `<p>${esc(t)}</p>`).join('')}
            ${story ? `<div class="saga"><h5>${story.id === 'perseus' ? 'Wie die sechs Sternbilder zusammenhängen' : esc(story.title)}</h5>${story.text.map(t => `<p>${t}</p>`).join('')}</div>` : ''}</div>
            ${(D.cultures || {})[c.id] ? `<div class="sk-sec"><h4>${IC.star} Andere Kulturen, andere Bilder</h4><ul class="cultures">${D.cultures[c.id].map(([k, t]) => `<li><b>${esc(k)}</b><span>${esc(t)}</span></li>`).join('')}</ul></div>` : ''}`,
          fig: () => `<div class="fig-map wide">${SkyCharts.conChart(c.id, c)}<span>Sternkarte ${esc(c.name)} – Blick nach ${dir8(p.az)}, Norden oben</span></div>` });
        (visible ? vis : off).push([visible ? WOW[c.id] * 18 + Math.min(p.alt, 60) * 0.5 : -90, html]);
      }
      return section(vis, off, 'Sternbilder');
    }
    // Deep Sky
    const vis = [], off = [], moonBright = m.alt > 0 && m.illum > 0.45, mset = A.riseSet('Moon', o, T, 14).set;
    for (const x of D.deepsky) {
      const p = A.star(x.ra, x.dec, T, o);
      const visible = p.alt > 15 && sunAlt < -12;
      let why = visible ? `<b>Jetzt:</b> ${where(p)}.` : p.alt <= 15 ? (p.alt < 0 ? 'Zurzeit unter dem Horizont.' : 'Steht zu tief – Dunst und Licht schlucken es.') : 'Der Himmel ist noch nicht dunkel genug.';
      if (visible && moonBright && x.level >= 2) why += ` <span class="warn">Mondlicht stört${mset ? ' – besser nach Monduntergang (' + fT(mset) + ')' : ''}.</span>`;
      const lv = ['', 'leicht', 'mittel', 'anspruchsvoll'][x.level];
      const html = item({ id: x.id, icon: dsoIcon(x.type), color: '#62e6d8', name: `${x.name}`, sub: `${x.code} · ${x.type} · ${x.con} · ${lv}`, pos: p.alt > 0 ? p : null, mag: x.mag, visible, note: why + `<br><span class="muted">Entfernung ${x.dist}</span>`,
        body: `<div class="sk-sec"><h4>${IC.pin} So findest du es</h4><p>${esc(x.find)}</p></div>${gear(x)}${facts(x.facts)}`,
        fig: () => `<div class="fig-art">${SkyCharts.photo(x.id, `${SkyCharts.dsoArt(x)}<span>Illustration</span>`, x.name)}</div><div class="fig-map">${SkyCharts.finder(x.ra, x.dec, x.code, { fov: 32 })}<span>Aufsuchkarte</span></div>` });
      const sc = WOW[x.id] * 18 + Math.min(p.alt, 60) * 0.5 - (moonBright && x.level >= 2 ? 18 : 0) - (x.level === 3 ? 6 : 0);
      (visible ? vis : off).push([visible ? sc : -90, html]);
    }
    return section(vis, off, 'Deep-Sky-Objekte');
  }
  function section(vis, off, label) {
    vis.sort((a, b) => b[0] - a[0]);
    return `<div class="sk-list">${vis.map(x => x[1]).join('') || `<p class="muted sk-empty">Zur gewählten Zeit ist hier nichts gut sichtbar – probier eine spätere Uhrzeit.</p>`}</div>
      ${off.length ? `<details class="sk-off"><summary>${off.length} ${label} gerade nicht sichtbar</summary><div class="sk-list">${off.map(x => x[1]).join('')}</div></details>` : ''}`;
  }
  function openStory(id) {
    const s = D.stories.find(x => x.id === id); if (!s) return;
    showModal(`<div class="modal sheet ev-modal"><button class="ico close" data-act="close" aria-label="Schließen">✕</button>
      <div class="ev-kind">Geschichten am Himmel</div><h2>${esc(s.title)}</h2>
      ${s.text.map(p => `<p>${p}</p>`).join('')}</div>`, 'skystory');
  }

  /* ---------- Standort ---------- */
  function openLoc() {
    showModal(`<div class="modal sheet"><button class="ico close" data-act="close" aria-label="Schließen">✕</button>
      <h2>Standort</h2><p class="sub">Für Sichtbarkeit, Auf- und Untergänge und das Wetter. Wird nur auf diesem Gerät gespeichert.</p>
      <button class="btn primary block" data-sk="geo">${IC.pin} Aktuellen Standort verwenden</button>
      <p class="err" id="skGeoMsg" style="text-align:left"></p>
      <div class="search" style="margin-top:6px">${IC.pin}<input id="skCity" type="search" placeholder="Oder Ort suchen, z. B. Bad Schandau" autocomplete="off"></div>
      <div id="skCityRes" class="city-res"></div></div>`, 'skyloc');
    const inp = q('#skCity'); let tm;
    inp.oninput = () => { clearTimeout(tm); tm = setTimeout(() => citySearch(inp.value.trim()), 350); };
  }
  async function citySearch(name) {
    const box = q('#skCityRes'); if (!box) return;
    if (name.length < 2) { box.innerHTML = ''; return; }
    box.innerHTML = '<span class="spin" style="display:inline-block;margin:10px"></span>';
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=6&language=de&format=json`);
      const j = await r.json();
      box.innerHTML = (j.results || []).map(x => `<button class="city" data-sk="pick" data-lat="${x.latitude}" data-lon="${x.longitude}" data-name="${esc(x.name)}"><b>${esc(x.name)}</b><span>${esc([x.admin1, x.country].filter(Boolean).join(', '))}</span></button>`).join('') || '<p class="muted">Nichts gefunden.</p>';
    } catch { box.innerHTML = '<p class="muted">Ortssuche gerade nicht erreichbar.</p>'; }
  }
  function setLoc(l) {
    SK.loc = l; localStorage.setItem('hs-loc', JSON.stringify(l)); SK.wx = null; SK.evKey = null;
    closeModal(); toast('Standort: ' + l.name);
  }

  /* ---------- Ereignisse (Klicks) ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-sk]'); if (!b) return;
    const a = b.dataset.sk;
    if (a === 'time') { SK.mode = b.dataset.t; localStorage.setItem('hs-skyt', SK.mode); render(q('#main')); }
    else if (a === 'sub') { SK.sub = b.dataset.s; localStorage.setItem('hs-skysub', SK.sub); render(q('#main')); }
    else if (a === 'loc') openLoc();
    else if (a === 'gosky') switchTab('sky');
    else if (a === 'ev') openEvent(b.dataset.id);
    else if (a === 'story') openStory(b.dataset.id);
    else if (a === 'obj') openObj(b.dataset.id);
    else if (a === 'wx') { SK.wxErr = null; loadWx(true).then(() => { const w = q('#skWx'); if (w) w.innerHTML = wxCard(); }); }
    else if (a === 'pick') setLoc({ lat: +b.dataset.lat, lon: +b.dataset.lon, name: b.dataset.name });
    else if (a === 'geo') {
      const msg = q('#skGeoMsg');
      if (!navigator.geolocation) { msg.textContent = 'Standortabfrage wird von diesem Browser nicht unterstützt.'; return; }
      msg.textContent = 'Standort wird ermittelt …';
      navigator.geolocation.getCurrentPosition(p => setLoc({ lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), name: 'Mein Standort' }),
        err => { msg.textContent = err.code === 1 ? 'Zugriff verweigert – bitte in den Browser-Einstellungen erlauben oder Ort suchen.' : 'Standort nicht ermittelbar – bitte Ort suchen.'; }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
    }
  });

  window.Sky = { render, badge, strip, checkNew, openEvent, moonSVG, phaseName, loadWx, _computeEvents: computeEvents };
})();
