/* =====================================================================
   HeadSpace · Astronomie-Rechenkern
   Positionen nach Paul Schlyter, „How to compute planetary positions“
   (Genauigkeit ~1–2 Bogenminuten, für Beobachtung völlig ausreichend).
   Keine externen Abhängigkeiten.
   ===================================================================== */
(function (global) {
  'use strict';
  const RAD = Math.PI / 180, DEG = 180 / Math.PI;
  const rev = x => ((x % 360) + 360) % 360;
  const sin = x => Math.sin(x * RAD), cos = x => Math.cos(x * RAD), tan = x => Math.tan(x * RAD);
  const asin = x => Math.asin(Math.max(-1, Math.min(1, x))) * DEG;
  const acos = x => Math.acos(Math.max(-1, Math.min(1, x))) * DEG;
  const atan2 = (y, x) => Math.atan2(y, x) * DEG;

  // Tage seit 2000-01-00 0:00 UT (Schlyter)
  const dayNum = date => date.getTime() / 86400000 + 2440587.5 - 2451543.5;

  const EL = {
    Sun: d => ({ N: 0, i: 0, w: 282.9404 + 4.70935e-5 * d, a: 1, e: 0.016709 - 1.151e-9 * d, M: 356.0470 + 0.9856002585 * d }),
    Moon: d => ({ N: 125.1228 - 0.0529538083 * d, i: 5.1454, w: 318.0634 + 0.1643573223 * d, a: 60.2666, e: 0.0549, M: 115.3654 + 13.0649929509 * d }),
    Mercury: d => ({ N: 48.3313 + 3.24587e-5 * d, i: 7.0047 + 5.0e-8 * d, w: 29.1241 + 1.01444e-5 * d, a: 0.387098, e: 0.205635 + 5.59e-10 * d, M: 168.6562 + 4.0923344368 * d }),
    Venus: d => ({ N: 76.6799 + 2.4659e-5 * d, i: 3.3946 + 2.75e-8 * d, w: 54.891 + 1.38374e-5 * d, a: 0.72333, e: 0.006773 - 1.302e-9 * d, M: 48.0052 + 1.6021302244 * d }),
    Mars: d => ({ N: 49.5574 + 2.11081e-5 * d, i: 1.8497 - 1.78e-8 * d, w: 286.5016 + 2.92961e-5 * d, a: 1.523688, e: 0.093405 + 2.516e-9 * d, M: 18.6021 + 0.5240207766 * d }),
    Jupiter: d => ({ N: 100.4542 + 2.76854e-5 * d, i: 1.303 - 1.557e-7 * d, w: 273.8777 + 1.64505e-5 * d, a: 5.20256, e: 0.048498 + 4.469e-9 * d, M: 19.895 + 0.0830853001 * d }),
    Saturn: d => ({ N: 113.6634 + 2.3898e-5 * d, i: 2.4886 - 1.081e-7 * d, w: 339.3939 + 2.97661e-5 * d, a: 9.55475, e: 0.055546 - 9.499e-9 * d, M: 316.967 + 0.0334442282 * d }),
    Uranus: d => ({ N: 74.0005 + 1.3978e-5 * d, i: 0.7733 + 1.9e-8 * d, w: 96.6612 + 3.0565e-5 * d, a: 19.18171 - 1.55e-8 * d, e: 0.047318 + 7.45e-9 * d, M: 142.5905 + 0.011725806 * d }),
    Neptune: d => ({ N: 131.7806 + 3.0173e-5 * d, i: 1.77 - 2.55e-7 * d, w: 272.8461 - 6.027e-6 * d, a: 30.05826 + 3.313e-8 * d, e: 0.008606 + 2.15e-9 * d, M: 260.2471 + 0.005995147 * d }),
  };

  function kepler(M, e) {
    M = rev(M);
    let E = M + e * DEG * sin(M) * (1 + e * cos(M));
    for (let k = 0; k < 8; k++) {
      const dE = (E - e * DEG * sin(E) - M) / (1 - e * cos(E));
      E -= dE; if (Math.abs(dE) < 1e-6) break;
    }
    return E;
  }
  function orbit(o) {
    const E = kepler(o.M, o.e);
    const xv = o.a * (cos(E) - o.e), yv = o.a * Math.sqrt(1 - o.e * o.e) * sin(E);
    return { v: atan2(yv, xv), r: Math.hypot(xv, yv) };
  }
  function sunEcl(d) {
    const o = EL.Sun(d), { v, r } = orbit(o), lon = rev(v + o.w);
    return { lon, r, x: r * cos(lon), y: r * sin(lon), M: rev(o.M), L: rev(o.M + o.w) };
  }
  const obliq = d => 23.4393 - 3.563e-7 * d;

  function helio(name, d) {
    const o = EL[name](d), { v, r } = orbit(o), vw = v + o.w;
    let x = r * (cos(o.N) * cos(vw) - sin(o.N) * sin(vw) * cos(o.i));
    let y = r * (sin(o.N) * cos(vw) + cos(o.N) * sin(vw) * cos(o.i));
    let z = r * sin(vw) * sin(o.i);
    if (name === 'Jupiter' || name === 'Saturn' || name === 'Uranus') {
      const Mj = rev(EL.Jupiter(d).M), Ms = rev(EL.Saturn(d).M), Mu = rev(EL.Uranus(d).M);
      let lon = atan2(y, x), lat = atan2(z, Math.hypot(x, y));
      if (name === 'Jupiter') lon += -0.332 * sin(2 * Mj - 5 * Ms - 67.6) - 0.056 * sin(2 * Mj - 2 * Ms + 21) + 0.042 * sin(3 * Mj - 5 * Ms + 21) - 0.036 * sin(Mj - 2 * Ms) + 0.022 * cos(Mj - Ms) + 0.023 * sin(2 * Mj - 3 * Ms + 52) - 0.016 * sin(Mj - 5 * Ms - 69);
      if (name === 'Saturn') {
        lon += 0.812 * sin(2 * Mj - 5 * Ms - 67.6) - 0.229 * cos(2 * Mj - 4 * Ms - 2) + 0.119 * sin(Mj - 2 * Ms - 3) + 0.046 * sin(2 * Mj - 6 * Ms - 69) + 0.014 * sin(Mj - 3 * Ms + 32);
        lat += -0.02 * cos(2 * Mj - 4 * Ms - 2) + 0.018 * sin(2 * Mj - 6 * Ms - 49);
      }
      if (name === 'Uranus') lon += 0.04 * sin(Ms - 2 * Mu + 6) + 0.035 * sin(Ms - 3 * Mu + 33) - 0.015 * sin(Mj - Mu + 20);
      x = r * cos(lat) * cos(lon); y = r * cos(lat) * sin(lon); z = r * sin(lat);
    }
    return { x, y, z, r };
  }

  function moonEcl(d) {
    const o = EL.Moon(d), { v, r } = orbit(o), vw = v + o.w;
    const x = r * (cos(o.N) * cos(vw) - sin(o.N) * sin(vw) * cos(o.i));
    const y = r * (sin(o.N) * cos(vw) + cos(o.N) * sin(vw) * cos(o.i));
    const z = r * sin(vw) * sin(o.i);
    let lon = atan2(y, x), lat = atan2(z, Math.hypot(x, y)), dist = r;
    const s = EL.Sun(d), Ms = rev(s.M), Mm = rev(o.M), Ls = rev(s.M + s.w), Lm = rev(o.M + o.w + o.N), D = Lm - Ls, F = Lm - o.N;
    lon += -1.274 * sin(Mm - 2 * D) + 0.658 * sin(2 * D) - 0.186 * sin(Ms) - 0.059 * sin(2 * Mm - 2 * D) - 0.057 * sin(Mm - 2 * D + Ms) + 0.053 * sin(Mm + 2 * D) + 0.046 * sin(2 * D - Ms) + 0.041 * sin(Mm - Ms) - 0.035 * sin(D) - 0.031 * sin(Mm + Ms) - 0.015 * sin(2 * F - 2 * D) + 0.011 * sin(Mm - 4 * D);
    lat += -0.173 * sin(F - 2 * D) - 0.055 * sin(Mm - F - 2 * D) - 0.046 * sin(Mm + F - 2 * D) + 0.033 * sin(F + 2 * D) + 0.017 * sin(2 * Mm + F);
    dist += -0.58 * cos(Mm - 2 * D) - 0.46 * cos(2 * D);
    return { lon: rev(lon), lat, dist };
  }
  function eclToEq(lon, lat, d) {
    const e = obliq(d);
    const x = cos(lon) * cos(lat), y = sin(lon) * cos(lat), z = sin(lat);
    const ye = y * cos(e) - z * sin(e), ze = y * sin(e) + z * cos(e);
    return { ra: rev(atan2(ye, x)) / 15, dec: atan2(ze, Math.hypot(x, ye)) };
  }

  // geozentrische Größen eines Körpers
  function geo(name, date) {
    const d = dayNum(date), sun = sunEcl(d);
    if (name === 'Sun') { const eq = eclToEq(sun.lon, 0, d); return { ...eq, lon: sun.lon, lat: 0, dist: sun.r, sunLon: sun.lon }; }
    if (name === 'Moon') {
      const m = moonEcl(d), eq = eclToEq(m.lon, m.lat, d);
      const elong = acos(cos(m.lon - sun.lon) * cos(m.lat));
      const fv = 180 - elong;
      return { ...eq, lon: m.lon, lat: m.lat, distER: m.dist, elong, phaseAngle: fv, illum: (1 + cos(fv)) / 2, waxing: rev(m.lon - sun.lon) < 180, phase: rev(m.lon - sun.lon), mag: -12.7 + 0.026 * Math.abs(fv) + 4e-9 * fv ** 4, sunLon: sun.lon };
    }
    const h = helio(name, d);
    const xg = h.x + sun.x, yg = h.y + sun.y, zg = h.z;
    const R = Math.hypot(xg, yg, zg), lon = rev(atan2(yg, xg)), lat = atan2(zg, Math.hypot(xg, yg));
    const eq = eclToEq(lon, lat, d), r = h.r, s = sun.r;
    const fv = acos((r * r + R * R - s * s) / (2 * r * R));
    const elong = acos((s * s + R * R - r * r) / (2 * s * R));
    const l5 = 5 * Math.log10(r * R);
    let mag;
    switch (name) {
      case 'Mercury': mag = -0.36 + l5 + 0.027 * fv + 2.2e-13 * fv ** 6; break;
      case 'Venus': mag = -4.34 + l5 + 0.013 * fv + 4.2e-7 * fv ** 3; break;
      case 'Mars': mag = -1.51 + l5 + 0.016 * fv; break;
      case 'Jupiter': mag = -9.25 + l5 + 0.014 * fv; break;
      case 'Saturn': {
        const ir = 28.06, Nr = 169.51 + 3.82e-5 * d;
        const B = asin(sin(lat) * cos(ir) - cos(lat) * sin(ir) * sin(lon - Nr));
        mag = -9.0 + l5 + 0.044 * fv - 2.6 * Math.abs(sin(B)) + 1.2 * sin(B) ** 2; break;
      }
      case 'Uranus': mag = -7.15 + l5 + 0.001 * fv; break;
      case 'Neptune': mag = -6.9 + l5 + 0.001 * fv; break;
    }
    return { ...eq, lon, lat, dist: R, rHelio: r, elong, phaseAngle: fv, illum: (1 + cos(fv)) / 2, mag, evening: rev(lon - sun.lon) < 180, sunLon: sun.lon };
  }

  // Präzession J2000 → Datum (einfach, für Sternkatalog)
  function precess(raH, dec, date) {
    const yrs = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400000);
    const ra = raH * 15;
    const dRA = (3.075 + 1.336 * sin(ra) * tan(dec)) * yrs / 3600; // Stunden
    const dDec = 20.04 * cos(ra) * yrs / 3600;
    return { ra: (raH + dRA + 24) % 24, dec: dec + dDec };
  }
  function lst(date, lonE) {
    const d = dayNum(date), s = EL.Sun(d), L = rev(s.M + s.w);
    const ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    return rev(L + 180 + ut * 15 + lonE); // Grad
  }
  function horizon(raH, dec, date, obs) {
    const ha = lst(date, obs.lon) - raH * 15;
    const x = cos(ha) * cos(dec), y = sin(ha) * cos(dec), z = sin(dec);
    const xh = x * sin(obs.lat) - z * cos(obs.lat), zh = x * cos(obs.lat) + z * sin(obs.lat);
    return { alt: asin(zh), az: rev(atan2(y, xh) + 180) };
  }
  // vollständige Position am Beobachtungsort
  function body(name, date, obs) {
    const g = geo(name, date), h = horizon(g.ra, g.dec, date, obs);
    if (name === 'Moon') h.alt -= asin(1 / g.distER) * cos(h.alt); // Parallaxe
    return { ...g, ...h };
  }
  function star(raH, dec, date, obs) { const p = precess(raH, dec, date); return { ...p, ...horizon(p.ra, p.dec, date, obs) }; }

  // Nulldurchgang einer Höhenfunktion suchen (Aufgang 'rise' / Untergang 'set')
  function findCross(altFn, h0, t0, hours, want, stepMin = 10) {
    const step = stepMin * 60000, end = t0 + hours * 3600000;
    let tp = t0, ap = altFn(new Date(t0)) - h0;
    for (let t = t0 + step; t <= end; t += step) {
      const a = altFn(new Date(t)) - h0;
      if ((ap < 0 && a >= 0 && want !== 'set') || (ap >= 0 && a < 0 && want !== 'rise')) {
        let lo = tp, hi = t, alo = ap;
        for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2, am = altFn(new Date(mid)) - h0; if ((am < 0) === (alo < 0)) { lo = mid; alo = am; } else hi = mid; }
        return new Date((lo + hi) / 2);
      }
      tp = t; ap = a;
    }
    return null;
  }
  const H0 = { Sun: -0.833, Moon: -0.833 };
  const altOf = (name, obs) => t => body(name, t, obs).alt;
  function riseSet(name, obs, from, hours = 30) {
    const f = altOf(name, obs), h0 = H0[name] ?? -0.567, t = from.getTime();
    return { rise: findCross(f, h0, t, hours, 'rise'), set: findCross(f, h0, t, hours, 'set'), up: f(from) > h0 };
  }
  function starRiseSet(raH, dec, obs, from, hours = 26) {
    const f = t => star(raH, dec, t, obs).alt, t = from.getTime();
    return { rise: findCross(f, -0.567, t, hours, 'rise', 15), set: findCross(f, -0.567, t, hours, 'set', 15) };
  }

  // Nacht ab "Mittag des Tages" von day
  function night(obs, day) {
    const noon = new Date(day); noon.setHours(12, 0, 0, 0);
    const f = altOf('Sun', obs), t = noon.getTime();
    const r = {};
    r.sunset = findCross(f, -0.833, t, 24, 'set');
    r.civil = findCross(f, -6, t, 24, 'set');
    r.nautical = findCross(f, -12, t, 24, 'set');
    r.astro = findCross(f, -18, t, 24, 'set');
    const base = (r.sunset || noon).getTime();
    r.astroEnd = r.astro ? findCross(f, -18, r.astro.getTime() + 60000, 20, 'rise') : null;
    r.nauticalEnd = r.nautical ? findCross(f, -12, r.nautical.getTime() + 60000, 20, 'rise') : null;
    r.sunrise = findCross(f, -0.833, base + 60000, 24, 'rise');
    return r;
  }

  // Mondphasen-Ereignisse (0 Neumond, 90 erstes Viertel, 180 Vollmond, 270 letztes Viertel)
  function nextPhase(target, from) {
    const ph = t => rev(geo('Moon', new Date(t)).phase - target + 180) - 180; // -180..180
    let t = from.getTime(), p = ph(t);
    for (let k = 0; k < 140; k++) {
      const t2 = t + 6 * 3600000, p2 = ph(t2);
      if (p < 0 && p2 >= 0 && p2 - p < 90) {
        let lo = t, hi = t2;
        for (let j = 0; j < 20; j++) { const m = (lo + hi) / 2; if (ph(m) < 0) lo = m; else hi = m; }
        return new Date((lo + hi) / 2);
      }
      t = t2; p = p2;
    }
    return null;
  }

  // Sonnenlänge bezogen auf J2000 (für Meteorstrom-Maxima, IMO-Konvention)
  function solarLonJ2000(date) {
    const d = dayNum(date), T = d / 36525;
    return rev(sunEcl(d).lon - 1.397 * T);
  }
  function timeOfSolarLon(target, approx) {
    let t = approx.getTime();
    for (let k = 0; k < 8; k++) {
      const diff = rev(target - solarLonJ2000(new Date(t)) + 180) - 180;
      t += diff / 0.98561 * 86400000;
      if (Math.abs(diff) < 1e-5) break;
    }
    return new Date(t);
  }

  // Winkelabstand zweier Positionen (RA in Stunden)
  function separation(a, b) {
    return acos(sin(a.dec) * sin(b.dec) + cos(a.dec) * cos(b.dec) * cos((a.ra - b.ra) * 15));
  }

  // Tierkreis-Sternbild nach ekliptikaler Länge (J2000, IAU-Grenzen auf der Ekliptik)
  const ZOD = [[28.7, 'Fische'], [53.4, 'Widder'], [90.4, 'Stier'], [118.2, 'Zwillinge'], [138.1, 'Krebs'], [173.9, 'Löwe'], [217.8, 'Jungfrau'], [241.1, 'Waage'], [248.0, 'Skorpion'], [266.6, 'Schlangenträger'], [299.7, 'Schütze'], [327.5, 'Steinbock'], [351.6, 'Wassermann'], [360, 'Fische']];
  function zodiac(lonOfDate, date) {
    const T = dayNum(date) / 36525, l = rev(lonOfDate - 1.397 * T);
    for (const [lim, n] of ZOD) if (l < lim) return n;
    return 'Fische';
  }

  global.Astro = { rev, dayNum, geo, body, star, horizon, precess, riseSet, starRiseSet, night, nextPhase, solarLonJ2000, timeOfSolarLon, separation, zodiac, findCross, altOf };
})(window);
