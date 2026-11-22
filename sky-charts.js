/* =====================================================================
   HeadSpace · Sternkarten & Illustrationen (alles selbst gezeichnet, SVG)
   Sterne: J2000, RA in Stunden, Dec in Grad, Helligkeit in mag.
   ===================================================================== */
(function () {
  'use strict';
  // [Schlüssel, Name|null, RA, Dec, mag]  ·  Linien als Schlüsselpaare
  const FIG = {
    uma: { s: [['a', 'Dubhe', 11.062, 61.75, 1.8], ['b', 'Merak', 11.031, 56.38, 2.4], ['g', 'Phekda', 11.897, 53.69, 2.4], ['d', 'Megrez', 12.257, 57.03, 3.3], ['e', 'Alioth', 12.9, 55.96, 1.8], ['z', 'Mizar', 13.399, 54.93, 2.2], ['h', 'Alkaid', 13.792, 49.31, 1.9], ['o', null, 8.504, 60.72, 3.4], ['up', null, 9.849, 59.04, 3.8], ['th', null, 9.548, 51.68, 3.2], ['io', null, 8.987, 48.04, 3.1], ['ch', null, 11.767, 47.78, 3.7], ['ps', null, 11.161, 44.5, 3.0], ['mu', null, 10.372, 41.5, 3.1], ['nu', null, 11.308, 33.09, 3.5]],
      l: [['a', 'b'], ['b', 'g'], ['g', 'd'], ['d', 'a'], ['d', 'e'], ['e', 'z'], ['z', 'h'], ['a', 'up'], ['up', 'o'], ['b', 'th'], ['th', 'io'], ['g', 'ch'], ['ch', 'ps'], ['ps', 'mu'], ['ch', 'nu']] },
    umi: { s: [['a', 'Polaris', 2.53, 89.26, 2.0], ['d', null, 17.537, 86.59, 4.4], ['e', null, 16.766, 82.04, 4.2], ['z', null, 15.734, 77.79, 4.3], ['b', 'Kochab', 14.845, 74.16, 2.1], ['g', 'Pherkad', 15.345, 71.83, 3.0], ['h', null, 16.292, 75.76, 5.0]],
      l: [['a', 'd'], ['d', 'e'], ['e', 'z'], ['z', 'b'], ['b', 'g'], ['g', 'h'], ['h', 'z']] },
    cas: { s: [['b', 'Caph', 0.153, 59.15, 2.3], ['a', 'Schedar', 0.675, 56.54, 2.2], ['g', null, 0.945, 60.72, 2.4], ['d', 'Ruchbah', 1.43, 60.24, 2.7], ['e', 'Segin', 1.907, 63.67, 3.4]],
      l: [['b', 'a'], ['a', 'g'], ['g', 'd'], ['d', 'e']] },
    cep: { s: [['a', 'Alderamin', 21.31, 62.59, 2.5], ['b', 'Alfirk', 21.478, 70.56, 3.2], ['g', 'Errai', 23.656, 77.63, 3.2], ['i', null, 22.828, 66.2, 3.5], ['z', null, 22.181, 58.2, 3.4], ['d', 'δ Cephei', 22.486, 58.42, 4.1]],
      l: [['a', 'b'], ['b', 'g'], ['g', 'i'], ['i', 'b'], ['i', 'z'], ['z', 'a']] },
    and: { s: [['a', 'Alpheratz', 0.14, 29.09, 2.1], ['d', null, 0.655, 30.86, 3.3], ['b', 'Mirach', 1.162, 35.62, 2.1], ['g', 'Alamak', 2.065, 42.33, 2.1], ['mu', null, 0.946, 38.5, 3.9], ['nu', null, 0.83, 41.08, 4.5], ['pi', null, 0.614, 33.72, 4.4]],
      l: [['a', 'd'], ['d', 'b'], ['b', 'g'], ['b', 'mu'], ['mu', 'nu'], ['d', 'pi']] },
    peg: { s: [['a', 'Markab', 23.079, 15.21, 2.5], ['b', 'Scheat', 23.063, 28.08, 2.4], ['g', 'Algenib', 0.221, 15.18, 2.8], ['A', 'Alpheratz', 0.14, 29.09, 2.1], ['e', 'Enif', 21.736, 9.88, 2.4], ['z', null, 22.691, 10.83, 3.4], ['th', null, 22.17, 6.2, 3.5], ['h', null, 22.717, 30.22, 2.9], ['mu', null, 22.833, 24.6, 3.5], ['la', null, 22.775, 23.57, 4.0]],
      l: [['a', 'b'], ['b', 'A'], ['A', 'g'], ['g', 'a'], ['a', 'z'], ['z', 'th'], ['th', 'e'], ['b', 'h'], ['b', 'mu'], ['mu', 'la']] },
    per: { s: [['a', 'Mirfak', 3.405, 49.86, 1.8], ['b', 'Algol', 3.136, 40.96, 2.1], ['g', null, 3.08, 53.51, 2.9], ['d', null, 3.715, 47.79, 3.0], ['e', null, 3.964, 40.01, 2.9], ['z', null, 3.902, 31.88, 2.9], ['h', null, 2.845, 55.9, 3.8], ['r', null, 3.086, 38.84, 3.4], ['x', null, 3.983, 35.79, 4.0], ['o', null, 3.738, 32.29, 3.8]],
      l: [['h', 'g'], ['g', 'a'], ['a', 'd'], ['d', 'e'], ['e', 'x'], ['x', 'z'], ['z', 'o'], ['a', 'b'], ['b', 'r']] },
    cet: { s: [['a', 'Menkar', 3.038, 4.09, 2.5], ['b', 'Diphda', 0.726, -17.99, 2.0], ['g', null, 2.722, 3.24, 3.5], ['d', null, 2.658, 0.33, 4.1], ['o', 'Mira', 2.322, -2.98, 3.5], ['z', null, 1.858, -10.34, 3.7], ['t', null, 1.734, -15.94, 3.5], ['i', null, 0.324, -8.82, 3.6], ['h', null, 1.143, -10.18, 3.5], ['th', null, 1.4, -8.18, 3.6]],
      l: [['a', 'g'], ['g', 'd'], ['d', 'o'], ['o', 'z'], ['z', 't'], ['t', 'b'], ['b', 'i'], ['i', 'h'], ['h', 'th'], ['th', 'z']] },
    lyr: { s: [['a', 'Wega', 18.616, 38.78, 0.0], ['e', null, 18.739, 39.67, 4.7], ['z', null, 18.746, 37.61, 4.4], ['d', null, 18.908, 36.9, 4.3], ['b', 'Sheliak', 18.835, 33.36, 3.5], ['g', 'Sulafat', 18.982, 32.69, 3.2]],
      l: [['a', 'z'], ['z', 'b'], ['b', 'g'], ['g', 'd'], ['d', 'z'], ['a', 'e']] },
    aql: { s: [['a', 'Altair', 19.846, 8.87, 0.8], ['g', 'Tarazed', 19.771, 10.61, 2.7], ['b', 'Alshain', 19.922, 6.41, 3.7], ['z', null, 19.09, 13.86, 3.0], ['d', null, 19.425, 3.11, 3.4], ['l', null, 19.104, -4.88, 3.4], ['th', null, 20.188, -0.82, 3.2], ['h', null, 19.874, 1.01, 3.9]],
      l: [['g', 'a'], ['a', 'b'], ['a', 'd'], ['d', 'l'], ['d', 'h'], ['h', 'th'], ['g', 'z']] },
    cyg: { s: [['a', 'Deneb', 20.69, 45.28, 1.3], ['g', 'Sadr', 20.37, 40.26, 2.2], ['b', 'Albireo', 19.512, 27.96, 3.1], ['d', null, 19.75, 45.13, 2.9], ['e', null, 20.77, 33.97, 2.5], ['h', null, 19.938, 35.08, 3.9], ['z', null, 21.216, 30.23, 3.2], ['k', null, 19.285, 53.37, 3.8], ['i', null, 19.495, 51.73, 3.8]],
      l: [['a', 'g'], ['g', 'h'], ['h', 'b'], ['d', 'g'], ['g', 'e'], ['e', 'z'], ['d', 'i'], ['i', 'k']] },
    dra: { s: [['b', 'Rastaban', 17.507, 52.3, 2.8], ['g', 'Eltanin', 17.943, 51.49, 2.2], ['x', null, 17.892, 56.87, 3.7], ['n', null, 17.536, 55.18, 4.9], ['d', null, 19.209, 67.66, 3.1], ['e', null, 19.803, 70.27, 3.8], ['ch', null, 18.351, 72.73, 3.6], ['z', null, 17.146, 65.71, 3.2], ['h', null, 16.4, 61.51, 2.7], ['th', null, 16.031, 58.57, 4.0], ['i', null, 15.415, 58.97, 3.3], ['a', 'Thuban', 14.073, 64.38, 3.7], ['k', null, 12.558, 69.79, 3.9], ['l', null, 11.523, 69.33, 3.8]],
      l: [['b', 'g'], ['g', 'x'], ['x', 'n'], ['n', 'b'], ['x', 'd'], ['d', 'e'], ['e', 'ch'], ['ch', 'z'], ['z', 'h'], ['h', 'th'], ['th', 'i'], ['i', 'a'], ['a', 'k'], ['k', 'l']] },
    boo: { s: [['a', 'Arktur', 14.261, 19.18, -0.05], ['e', 'Izar', 14.75, 27.07, 2.4], ['d', null, 15.258, 33.31, 3.5], ['b', 'Nekkar', 15.032, 40.39, 3.5], ['g', 'Seginus', 14.535, 38.31, 3.0], ['r', null, 14.53, 30.37, 3.6], ['h', 'Muphrid', 13.911, 18.4, 2.7], ['z', null, 14.686, 13.73, 3.8]],
      l: [['a', 'e'], ['e', 'd'], ['d', 'b'], ['b', 'g'], ['g', 'r'], ['r', 'a'], ['a', 'h'], ['a', 'z']] },
    crb: { s: [['a', 'Gemma', 15.578, 26.71, 2.2], ['b', null, 15.464, 29.11, 3.7], ['th', null, 15.549, 31.36, 4.1], ['g', null, 15.712, 26.3, 3.8], ['d', null, 15.827, 26.07, 4.6], ['e', null, 15.96, 26.88, 4.2], ['i', null, 16.024, 29.85, 4.9]],
      l: [['th', 'b'], ['b', 'a'], ['a', 'g'], ['g', 'd'], ['d', 'e'], ['e', 'i']] },
    her: { s: [['b', 'Kornephoros', 16.504, 21.49, 2.8], ['z', null, 16.688, 31.6, 2.8], ['h', null, 16.715, 38.92, 3.5], ['p', null, 17.251, 36.81, 3.2], ['e', null, 17.005, 30.93, 3.9], ['d', null, 17.25, 24.84, 3.1], ['a', 'Ras Algethi', 17.244, 14.39, 3.1], ['mu', null, 17.774, 27.72, 3.4], ['th', null, 17.937, 37.25, 3.9], ['i', null, 17.657, 46.01, 3.8], ['s', null, 16.568, 42.44, 4.2], ['t', null, 16.33, 46.31, 3.9], ['g', null, 16.365, 19.15, 3.8]],
      l: [['z', 'h'], ['h', 'p'], ['p', 'e'], ['e', 'z'], ['z', 'b'], ['b', 'g'], ['e', 'd'], ['d', 'a'], ['d', 'mu'], ['h', 's'], ['s', 't'], ['p', 'th'], ['th', 'i']] },
    leo: { s: [['a', 'Regulus', 10.14, 11.97, 1.4], ['h', null, 10.122, 16.76, 3.5], ['g', 'Algieba', 10.333, 19.84, 2.0], ['z', null, 10.278, 23.42, 3.4], ['mu', null, 9.879, 26.01, 3.9], ['e', null, 9.764, 23.77, 3.0], ['d', 'Zosma', 11.235, 20.52, 2.6], ['th', 'Chertan', 11.237, 15.43, 3.3], ['b', 'Denebola', 11.818, 14.57, 2.1]],
      l: [['a', 'h'], ['h', 'g'], ['g', 'z'], ['z', 'mu'], ['mu', 'e'], ['g', 'd'], ['d', 'b'], ['b', 'th'], ['th', 'a'], ['d', 'th']] },
    vir: { s: [['a', 'Spika', 13.42, -11.16, 1.0], ['g', 'Porrima', 12.694, -1.45, 2.7], ['e', 'Vindemiatrix', 13.036, 10.96, 2.8], ['d', null, 12.927, 3.4, 3.4], ['z', null, 13.578, -0.6, 3.4], ['b', null, 11.845, 1.76, 3.6], ['h', null, 12.332, -0.67, 3.9], ['th', null, 13.166, -5.54, 4.4], ['i', null, 14.267, -6.0, 4.1], ['mu', null, 14.718, -5.66, 3.9]],
      l: [['b', 'h'], ['h', 'g'], ['g', 'd'], ['d', 'e'], ['g', 'th'], ['th', 'a'], ['d', 'z'], ['z', 'i'], ['i', 'mu']] },
    gem: { s: [['a', 'Kastor', 7.577, 31.89, 1.6], ['b', 'Pollux', 7.755, 28.03, 1.1], ['g', 'Alhena', 6.629, 16.4, 1.9], ['mu', null, 6.383, 22.51, 2.9], ['h', 'Propus', 6.248, 22.51, 3.3], ['e', null, 6.732, 25.13, 3.0], ['d', null, 7.335, 21.98, 3.5], ['x', null, 6.755, 12.9, 3.4], ['k', null, 7.741, 24.4, 3.6], ['i', null, 7.429, 27.8, 3.8], ['t', null, 7.186, 30.25, 4.4], ['th', null, 6.88, 33.96, 3.6], ['z', null, 7.068, 20.57, 3.9], ['l', null, 7.301, 16.54, 3.6]],
      l: [['a', 't'], ['t', 'e'], ['e', 'mu'], ['mu', 'h'], ['t', 'th'], ['a', 'i'], ['i', 'b'], ['b', 'k'], ['b', 'd'], ['d', 'z'], ['z', 'g'], ['d', 'l'], ['l', 'x']] },
    tau: { s: [['a', 'Aldebaran', 4.599, 16.51, 0.9], ['b', 'Elnath', 5.438, 28.61, 1.7], ['z', null, 5.627, 21.14, 3.0], ['th', null, 4.478, 15.87, 3.4], ['g', null, 4.33, 15.63, 3.6], ['d', null, 4.382, 17.54, 3.8], ['e', null, 4.477, 19.18, 3.5], ['l', null, 4.011, 12.49, 3.5], ['o', null, 3.414, 9.03, 3.6], ['P', 'Plejaden', 3.791, 24.11, 2.9]],
      l: [['z', 'a'], ['a', 'th'], ['th', 'g'], ['g', 'd'], ['d', 'e'], ['e', 'b'], ['g', 'l'], ['l', 'o']] },
    ori: { s: [['a', 'Beteigeuze', 5.919, 7.41, 0.5], ['b', 'Rigel', 5.242, -8.2, 0.1], ['g', 'Bellatrix', 5.419, 6.35, 1.6], ['d', 'Mintaka', 5.533, -0.3, 2.2], ['e', 'Alnilam', 5.604, -1.2, 1.7], ['z', 'Alnitak', 5.679, -1.94, 1.8], ['k', 'Saiph', 5.796, -9.67, 2.1], ['l', null, 5.585, 9.93, 3.4], ['i', null, 5.59, -5.91, 2.8], ['p2', null, 4.843, 8.9, 4.4], ['p3', null, 4.83, 6.96, 3.2], ['p4', null, 4.853, 5.61, 3.7], ['p5', null, 4.904, 2.44, 3.7]],
      l: [['a', 'l'], ['l', 'g'], ['a', 'z'], ['g', 'd'], ['d', 'e'], ['e', 'z'], ['z', 'k'], ['d', 'b'], ['k', 'b'], ['g', 'p3'], ['p2', 'p3'], ['p3', 'p4'], ['p4', 'p5'], ['e', 'i']] },
    cma: { s: [['a', 'Sirius', 6.752, -16.72, -1.46], ['b', 'Mirzam', 6.378, -17.96, 2.0], ['e', 'Adhara', 6.977, -28.97, 1.5], ['d', 'Wezen', 7.14, -26.39, 1.8], ['h', 'Aludra', 7.402, -29.3, 2.4], ['z', null, 6.338, -30.06, 3.0], ['o', null, 7.05, -23.83, 3.0], ['g', null, 7.063, -15.63, 4.1]],
      l: [['b', 'a'], ['a', 'g'], ['a', 'o'], ['o', 'd'], ['d', 'e'], ['d', 'h'], ['e', 'z']] },
    cmi: { s: [['a', 'Prokyon', 7.655, 5.22, 0.4], ['b', 'Gomeisa', 7.453, 8.29, 2.9]], l: [['a', 'b']] },
    aur: { s: [['a', 'Kapella', 5.278, 46.0, 0.1], ['b', 'Menkalinan', 5.992, 44.95, 1.9], ['th', null, 5.995, 37.21, 2.6], ['B', 'Elnath', 5.438, 28.61, 1.7], ['i', null, 4.95, 33.17, 2.7], ['e', null, 5.032, 43.82, 3.0], ['h', null, 5.109, 41.23, 3.2], ['z', null, 5.041, 41.08, 3.8]],
      l: [['a', 'b'], ['b', 'th'], ['th', 'B'], ['B', 'i'], ['i', 'a'], ['a', 'e']] },
    cnc: { s: [['a', 'Acubens', 8.975, 11.86, 4.3], ['d', 'Asellus Australis', 8.745, 18.15, 3.9], ['g', 'Asellus Borealis', 8.722, 21.47, 4.7], ['i', null, 8.778, 28.76, 4.0], ['b', null, 8.275, 9.19, 3.5]],
      l: [['b', 'd'], ['d', 'g'], ['g', 'i'], ['d', 'a']] },
    sco: { s: [['a', 'Antares', 16.49, -26.43, 1.0], ['b', null, 16.091, -19.81, 2.6], ['d', null, 16.006, -22.62, 2.3], ['p', null, 15.981, -26.11, 2.9], ['s', null, 16.353, -25.59, 2.9], ['t', null, 16.598, -28.22, 2.8], ['e', null, 16.836, -34.29, 2.3], ['mu', null, 16.864, -38.05, 3.0], ['z', null, 16.91, -42.36, 3.6], ['h', null, 17.203, -43.24, 3.3], ['th', null, 17.622, -43.0, 1.9], ['i', null, 17.793, -40.13, 3.0], ['k', null, 17.708, -39.03, 2.4], ['l', 'Shaula', 17.56, -37.1, 1.6]],
      l: [['b', 'd'], ['d', 'p'], ['d', 's'], ['s', 'a'], ['a', 't'], ['t', 'e'], ['e', 'mu'], ['mu', 'z'], ['z', 'h'], ['h', 'th'], ['th', 'i'], ['i', 'k'], ['k', 'l']] },
    sgr: { s: [['e', 'Kaus Australis', 18.403, -34.38, 1.8], ['d', null, 18.35, -29.83, 2.7], ['l', null, 18.466, -25.42, 2.8], ['s', 'Nunki', 18.921, -26.3, 2.0], ['ph', null, 18.761, -26.99, 3.2], ['t', null, 19.116, -27.67, 3.3], ['z', null, 19.043, -29.88, 2.6], ['g', null, 18.097, -30.42, 3.0], ['h', null, 18.294, -36.76, 3.1]],
      l: [['g', 'd'], ['d', 'l'], ['l', 'ph'], ['d', 'ph'], ['ph', 's'], ['s', 't'], ['t', 'z'], ['z', 'ph'], ['z', 'e'], ['e', 'g'], ['e', 'h']] },
    ari: { s: [['a', 'Hamal', 2.12, 23.46, 2.0], ['b', 'Sheratan', 1.911, 20.81, 2.6], ['g', null, 1.892, 19.29, 3.9], ['f', null, 2.833, 27.26, 3.6]],
      l: [['f', 'a'], ['a', 'b'], ['b', 'g']] },
    // nur für Aufsuchkarten
    _tri: { s: [['a', null, 1.885, 29.58, 3.4], ['b', null, 2.159, 34.99, 3.0], ['g', null, 2.289, 33.85, 4.0]], l: [['a', 'b'], ['b', 'g'], ['g', 'a']] },
    _cvn: { s: [['a', 'Cor Caroli', 12.934, 38.32, 2.9], ['b', null, 12.562, 41.36, 4.2]], l: [['a', 'b']] },
    _sge: { s: [['g', null, 19.979, 19.49, 3.5], ['d', null, 19.79, 18.53, 3.8], ['a', null, 19.668, 18.01, 4.4], ['b', null, 19.684, 17.48, 4.4]], l: [['g', 'd'], ['d', 'a'], ['d', 'b']] },
    _sct: { s: [['a', null, 18.587, -8.24, 3.9], ['b', null, 18.786, -4.75, 4.2]], l: [['a', 'b']] },
    _ple: { s: [['1', null, 3.819, 24.05, 3.6], ['2', null, 3.747, 24.11, 3.7], ['3', null, 3.763, 24.37, 3.9], ['4', null, 3.772, 23.95, 4.2], ['5', null, 3.753, 24.47, 4.3]], l: [] },
  };
  const ALL = [];
  for (const [cid, f] of Object.entries(FIG)) for (const s of f.s) ALL.push({ cid, k: s[0], n: s[1], ra: s[2], dec: s[3], m: s[4] });

  const R = Math.PI / 180;
  function proj(ra0, de0) {
    const sd0 = Math.sin(de0 * R), cd0 = Math.cos(de0 * R);
    return (ra, de) => {
      const dra = (ra - ra0) * 15 * R, sd = Math.sin(de * R), cd = Math.cos(de * R);
      const cc = sd0 * sd + cd0 * cd * Math.cos(dra);
      if (cc < 0.25) return null;
      return [-(cd * Math.sin(dra)) / cc / R, (cd0 * sd - sd0 * cd * Math.cos(dra)) / cc / R]; // Grad, Osten links
    };
  }
  let uid = 0;
  const radius = m => Math.max(0.7, 3.4 - 0.62 * m);
  // Kernfunktion: zeichnet Sternfeld um (ra0, de0)
  function chart({ ra0, de0, fov, focus, marks = [], w = 360, h = 250, fitFocus = false, labels = true }) {
    const P = proj(ra0, de0), id = 'sc' + (++uid);
    let scale, cx = w / 2, cy = h / 2, ox = 0, oy = 0;
    if (fitFocus && focus && FIG[focus]) {
      const pts = FIG[focus].s.map(s => P(s[2], s[3])).filter(Boolean);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
      ox = (Math.max(...xs) + Math.min(...xs)) / 2; oy = (Math.max(...ys) + Math.min(...ys)) / 2;
      scale = Math.min((w - 70) / Math.max(bw, 6), (h - 60) / Math.max(bh, 6));
    } else scale = Math.min(w, h) / fov;
    const T = p => p && [cx + (p[0] - ox) * scale, cy - (p[1] - oy) * scale];
    const inside = q => q && q[0] > -10 && q[0] < w + 10 && q[1] > -10 && q[1] < h + 10;
    const pos = {};
    for (const s of ALL) { const q = T(P(s.ra, s.dec)); if (inside(q)) pos[s.cid + ':' + s.k] = q; }
    let lines = '', stars = '', labs = ''; const placed = [];
    for (const [cid, f] of Object.entries(FIG)) for (const [a, b] of f.l) {
      const p = pos[cid + ':' + a], q = pos[cid + ':' + b]; if (!p || !q) continue;
      lines += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" class="${cid === focus ? 'cl-f' : 'cl-o'}"/>`;
    }
    for (const s of ALL) {
      const q = pos[s.cid + ':' + s.k]; if (!q) continue;
      const f = s.cid === focus, r = radius(s.m) * (f ? 1.15 : 0.9);
      stars += `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${(r * 3).toFixed(1)}" fill="url(#${id}g)" opacity="${f ? .55 : .3}"/><circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${r.toFixed(1)}" fill="${f ? '#fff' : '#cfd2f0'}" opacity="${f ? 1 : .75}"/>`;
      if (labels && s.n && (f || s.m < 1.6 || !focus) && s.cid[0] !== '_') {
        const lx = q[0] + r + 4, ly = q[1] + 3.5;
        if (!placed.some(([x, y]) => Math.abs(x - lx) < 46 && Math.abs(y - ly) < 11)) { placed.push([lx, ly]); labs += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="${f ? 'sl-f' : 'sl-o'}">${s.n}</text>`; }
      }
    }
    // Sternbildnamen (nur in Aufsuchkarten)
    if (!focus) for (const [cid, f] of Object.entries(FIG)) {
      if (cid[0] === '_') continue;
      const qs = f.s.map(x => pos[cid + ':' + x[0]]).filter(Boolean); if (qs.length < 2) continue;
      const cx2 = qs.reduce((a, q) => a + q[0], 0) / qs.length, cy2 = qs.reduce((a, q) => a + q[1], 0) / qs.length;
      const nm = ((window.SkyData || {}).constellations || []).find(c => c.id === cid)?.name; if (!nm) continue;
      let ly2 = cy2 + 16; const hit = y => placed.some(([x, yy]) => Math.abs(x - cx2) < 70 && Math.abs(yy - y) < 12);
      if (hit(ly2)) ly2 = cy2 - 14; if (hit(ly2)) ly2 = cy2 + 30;
      labs += `<text x="${cx2.toFixed(1)}" y="${ly2.toFixed(1)}" class="sl-con" text-anchor="middle">${nm.toUpperCase()}</text>`;
    }
    let mk = '';
    for (const m of marks) {
      const q = T(P(m.ra, m.dec)); if (!q) continue;
      if (m.type === 'planet') mk += `<circle cx="${q[0]}" cy="${q[1]}" r="11" fill="${m.color}" opacity=".18"/><circle cx="${q[0]}" cy="${q[1]}" r="5" fill="${m.color}" stroke="#fff" stroke-width="1"/>`;
      else mk += `<circle cx="${q[0]}" cy="${q[1]}" r="10" fill="none" stroke="#62e6d8" stroke-width="1.8"/><circle cx="${q[0]}" cy="${q[1]}" r="16" fill="none" stroke="#62e6d8" stroke-width=".8" opacity=".5"/>`;
      mk += `<text x="${q[0] + 14}" y="${q[1] - 12}" class="sl-m">${m.label}</text>`;
    }
    return `<svg class="skychart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Sternkarte"><defs><radialGradient id="${id}g"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#9fb0ff" stop-opacity="0"/></radialGradient><radialGradient id="${id}b" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#151838"/><stop offset="1" stop-color="#070816"/></radialGradient></defs>
      <rect width="${w}" height="${h}" rx="14" fill="url(#${id}b)"/>${lines}${stars}${labs}${mk}
      <text x="${w - 10}" y="16" class="sl-c" text-anchor="end">N ↑ · O ←</text></svg>`;
  }
  const conChart = (cid, c) => chart({ ra0: c.ra, de0: c.dec, focus: cid, fitFocus: true });
  const finder = (ra, dec, label, opt = {}) => chart({ ra0: ra, de0: dec, fov: opt.fov || 34, marks: [{ ra, dec, label, type: opt.type, color: opt.color }] });

  /* ---------- Illustrationen ---------- */
  function rng(seed) { let x = 0; for (const ch of seed) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const wrap = (inner, defs = '') => { const id = 'il' + (++uid); return `<svg class="skyart" viewBox="0 0 200 200" role="img" aria-label="Illustration"><defs><radialGradient id="${id}bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#121433"/><stop offset="1" stop-color="#05060f"/></radialGradient>${defs.replace(/§/g, id)}</defs><rect width="200" height="200" rx="16" fill="url(#${id}bg)"/>${bgStars(id)}${inner.replace(/§/g, id)}</svg>`; };
  function bgStars(seed) { const r = rng(seed + 'bg'); let s = ''; for (let i = 0; i < 40; i++) s += `<circle cx="${(r() * 200).toFixed(1)}" cy="${(r() * 200).toFixed(1)}" r="${(r() * .9 + .2).toFixed(2)}" fill="#fff" opacity="${(r() * .5 + .15).toFixed(2)}"/>`; return s; }
  const blur = '<filter id="§bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter><filter id="§bs" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>';

  const PLANET_ART = {
    Mercury: () => wrap(`<circle cx="100" cy="100" r="54" fill="url(#§p)"/><g fill="#6d655c" opacity=".45"><circle cx="80" cy="82" r="9"/><circle cx="116" cy="70" r="5"/><circle cx="118" cy="118" r="11"/><circle cx="84" cy="126" r="6"/><circle cx="104" cy="98" r="4"/></g>${shade()}`, `<radialGradient id="§p" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#d9d0c4"/><stop offset="1" stop-color="#7d746a"/></radialGradient>${shadeDef()}`),
    Venus: () => wrap(`<circle cx="100" cy="100" r="58" fill="url(#§p)"/><g fill="none" stroke="#fff6dc" stroke-width="6" opacity=".35" filter="url(#§bs)"><path d="M48 90c30-12 70 10 104-4"/><path d="M50 116c34-10 66 8 100-6"/></g>${shade()}`, `<radialGradient id="§p" cx="38%" cy="35%" r="72%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#f1dca8"/><stop offset="1" stop-color="#b8935a"/></radialGradient>${shadeDef()}${blur}`),
    Mars: () => wrap(`<circle cx="100" cy="100" r="54" fill="url(#§p)"/><path d="M58 104c18-8 26 6 44-2s26-14 40-4" fill="none" stroke="#7a2e1a" stroke-width="9" opacity=".45" filter="url(#§bs)"/><ellipse cx="96" cy="52" rx="20" ry="6" fill="#fff" opacity=".85"/>${shade()}`, `<radialGradient id="§p" cx="38%" cy="35%" r="72%"><stop offset="0" stop-color="#ffb07a"/><stop offset=".6" stop-color="#d4592c"/><stop offset="1" stop-color="#7a2a14"/></radialGradient>${shadeDef()}${blur}`),
    Jupiter: () => wrap(`<clipPath id="§c"><circle cx="100" cy="100" r="62"/></clipPath><circle cx="100" cy="100" r="62" fill="#e9d8b8"/><g clip-path="url(#§c)">${[[62, 10, '#c79a6b'], [78, 8, '#e0c39a'], [90, 7, '#b5835a'], [112, 9, '#a87048'], [126, 6, '#d6b38b'], [140, 9, '#c0956a']].map(([y, h, c]) => `<rect x="30" y="${y}" width="140" height="${h}" fill="${c}" opacity=".85"/>`).join('')}<ellipse cx="124" cy="118" rx="11" ry="6" fill="#b5462c"/></g>${shade(62)}`, shadeDef()),
    Saturn: () => wrap(`<g transform="rotate(-16 100 100)"><ellipse cx="100" cy="100" rx="92" ry="22" fill="none" stroke="#d8c29a" stroke-width="10" opacity=".75"/><ellipse cx="100" cy="100" rx="74" ry="16" fill="none" stroke="#b7a07a" stroke-width="5" opacity=".7"/></g><circle cx="100" cy="100" r="44" fill="url(#§p)"/>${shade(44)}<g transform="rotate(-16 100 100)"><path d="M8 100a92 22 0 0 0 184 0" fill="none" stroke="#e6d2aa" stroke-width="10" opacity=".85"/></g>`, `<radialGradient id="§p" cx="38%" cy="35%" r="72%"><stop offset="0" stop-color="#fbe9c2"/><stop offset="1" stop-color="#b8935a"/></radialGradient>${shadeDef()}`),
    Uranus: () => wrap(`<circle cx="100" cy="100" r="50" fill="url(#§p)"/><ellipse cx="100" cy="100" rx="12" ry="70" fill="none" stroke="#bfeee9" stroke-width="1.5" opacity=".4" transform="rotate(-8 100 100)"/>${shade(50)}`, `<radialGradient id="§p" cx="38%" cy="35%" r="72%"><stop offset="0" stop-color="#e2fbf8"/><stop offset="1" stop-color="#5fb7b2"/></radialGradient>${shadeDef()}`),
    Neptune: () => wrap(`<circle cx="100" cy="100" r="50" fill="url(#§p)"/><ellipse cx="88" cy="112" rx="9" ry="5" fill="#1c2e78" opacity=".7"/><path d="M60 88c22-6 52-4 80 0" stroke="#9fb6ff" stroke-width="3" opacity=".35" fill="none"/>${shade(50)}`, `<radialGradient id="§p" cx="38%" cy="35%" r="72%"><stop offset="0" stop-color="#9ab6ff"/><stop offset="1" stop-color="#2a3f9a"/></radialGradient>${shadeDef()}`),
  };
  function shade(r = 54) { return `<circle cx="100" cy="100" r="${r}" fill="url(#§sh)"/>`; }
  function shadeDef() { return '<radialGradient id="§sh" cx="30%" cy="28%" r="85%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>'; }

  function dsoArt(x) {
    const r = rng(x.id), t = x.type;
    if (/Doppel/.test(t)) {
      const two = x.id === 'albireo' ? [['#ffcf6b', 9], ['#7fa8ff', 6]] : [['#f4f6ff', 8], ['#e8ecff', 5]];
      return wrap(`<g filter="url(#§bs)"><circle cx="86" cy="104" r="${two[0][1] * 2.2}" fill="${two[0][0]}" opacity=".5"/><circle cx="122" cy="92" r="${two[1][1] * 2.2}" fill="${two[1][0]}" opacity=".5"/></g><circle cx="86" cy="104" r="${two[0][1]}" fill="${two[0][0]}"/><circle cx="122" cy="92" r="${two[1][1]}" fill="${two[1][0]}"/>${x.id === 'mizar' ? '<circle cx="150" cy="70" r="3" fill="#fff"/>' : ''}`, blur);
    }
    if (/Galax/.test(t)) {
      const edge = /m81|leotrio/.test(x.id), tilt = (r() * 60 - 30).toFixed(0), ry = edge ? 14 : 34;
      let arms = ''; if (!edge) for (let i = 0; i < 2; i++) arms += `<path d="M100 100 C ${130 + i * -60} ${70 + i * 60}, ${170 + i * -140} ${110 - i * 20}, ${150 + i * -100} ${150 - i * 100}" stroke="#b9c6ff" stroke-width="10" fill="none" opacity=".35" filter="url(#§bs)"/>`;
      const extra = x.id === 'm81' ? `<ellipse cx="150" cy="60" rx="26" ry="6" fill="#ffc9b0" opacity=".6" transform="rotate(30 150 60)" filter="url(#§bs)"/>` : x.id === 'm51' ? `<circle cx="140" cy="62" r="12" fill="#ffe9c9" opacity=".7" filter="url(#§bs)"/>` : '';
      return wrap(`<g transform="rotate(${tilt} 100 100)"><ellipse cx="100" cy="100" rx="78" ry="${ry}" fill="#7f8fd8" opacity=".35" filter="url(#§bl)"/>${arms}<ellipse cx="100" cy="100" rx="46" ry="${ry * .55}" fill="#d7dcff" opacity=".45" filter="url(#§bs)"/><ellipse cx="100" cy="100" rx="14" ry="${Math.max(5, ry * .3)}" fill="#fff4dd"/></g>${extra}`, blur);
    }
    if (/Planetarisch/.test(t)) {
      if (x.id === 'm27') return wrap(`<ellipse cx="100" cy="100" rx="62" ry="56" fill="#ff7a8a" opacity=".25" filter="url(#§bl)"/><path d="M62 60 Q100 100 62 140 L138 140 Q100 100 138 60Z" fill="#7fe6c9" opacity=".55" filter="url(#§bs)"/><circle cx="100" cy="100" r="2.5" fill="#fff"/>`, blur);
      if (x.id === 'm97') return wrap(`<circle cx="100" cy="100" r="54" fill="#8fe8dc" opacity=".45" filter="url(#§bs)"/><circle cx="84" cy="94" r="12" fill="#05060f" opacity=".7" filter="url(#§bs)"/><circle cx="118" cy="104" r="12" fill="#05060f" opacity=".7" filter="url(#§bs)"/>`, blur);
      return wrap(`<ellipse cx="100" cy="100" rx="56" ry="48" fill="none" stroke="#ff7a6a" stroke-width="16" opacity=".5" filter="url(#§bs)"/><ellipse cx="100" cy="100" rx="44" ry="37" fill="none" stroke="#7fe6c9" stroke-width="14" opacity=".75" filter="url(#§bs)"/><ellipse cx="100" cy="100" rx="30" ry="25" fill="#5b7bd8" opacity=".35"/><circle cx="100" cy="100" r="2.2" fill="#fff"/>`, blur);
    }
    if (/Supernova/.test(t)) {
      let f = ''; for (let i = 0; i < 14; i++) { const a = r() * 6.28, l = 30 + r() * 30; f += `<path d="M${100 + Math.cos(a) * 12} ${100 + Math.sin(a) * 9} Q${100 + Math.cos(a + .4) * l * .6} ${100 + Math.sin(a + .4) * l * .5} ${100 + Math.cos(a) * l} ${100 + Math.sin(a) * l * .75}" stroke="#ff6a4a" stroke-width="2" fill="none" opacity=".7"/>`; }
      return wrap(`<ellipse cx="100" cy="100" rx="60" ry="44" fill="#7fa8ff" opacity=".35" filter="url(#§bl)"/>${f}<circle cx="100" cy="100" r="2.5" fill="#fff"/>`, blur);
    }
    if (/Emission/.test(t)) {
      let b = ''; for (let i = 0; i < 7; i++) b += `<circle cx="${60 + r() * 80}" cy="${60 + r() * 80}" r="${22 + r() * 30}" fill="${['#ff5f8a', '#ff8fa8', '#d84a7a', '#ffb0c0'][i % 4]}" opacity="${(.25 + r() * .25).toFixed(2)}" filter="url(#§bl)"/>`;
      const dark = x.id === 'ngc7000' ? '<path d="M70 150 Q90 110 120 120 T150 70" stroke="#05060f" stroke-width="18" fill="none" opacity=".6" filter="url(#§bs)"/>' : x.id === 'm8' ? '<path d="M50 104 Q100 92 150 108" stroke="#05060f" stroke-width="12" fill="none" opacity=".55" filter="url(#§bs)"/>' : '<circle cx="100" cy="96" r="16" fill="#9fd8ff" opacity=".5" filter="url(#§bs)"/>';
      let st = ''; for (let i = 0; i < 4; i++) st += `<circle cx="${92 + r() * 16}" cy="${90 + r() * 14}" r="1.8" fill="#fff"/>`;
      return wrap(b + dark + st, blur);
    }
    if (/Kugel/.test(t)) {
      let s = ''; for (let i = 0; i < 260; i++) { const a = r() * 6.28, d = Math.pow(r(), 1.8) * 70; s += `<circle cx="${(100 + Math.cos(a) * d).toFixed(1)}" cy="${(100 + Math.sin(a) * d).toFixed(1)}" r="${(r() * .9 + .4).toFixed(2)}" fill="${r() < .2 ? '#ffd9a8' : '#fff'}" opacity="${(1 - d / 90).toFixed(2)}"/>`; }
      return wrap(`<circle cx="100" cy="100" r="36" fill="#fff6e0" opacity=".35" filter="url(#§bl)"/>${s}`, blur);
    }
    // offene Sternhaufen
    let s = '', n = x.id === 'm45' ? 9 : x.id === 'chi' ? 70 : 55;
    if (x.id === 'm45') {
      const P = [[70, 80, 5], [92, 70, 4], [110, 86, 6], [128, 74, 4], [118, 108, 4.5], [86, 112, 3.5], [140, 98, 3]];
      s = `<ellipse cx="104" cy="92" rx="60" ry="40" fill="#5f8cff" opacity=".25" filter="url(#§bl)"/>` + P.map(([cx, cy, rr]) => `<circle cx="${cx}" cy="${cy}" r="${rr * 2.2}" fill="#9fc0ff" opacity=".35" filter="url(#§bs)"/><circle cx="${cx}" cy="${cy}" r="${rr * .6}" fill="#fff"/>`).join('');
    } else {
      const centers = x.id === 'chi' ? [[72, 100], [130, 100]] : x.id === 'aur3' ? [[50, 130], [100, 100], [150, 70]] : [[100, 100]];
      for (const [cx, cy] of centers) for (let i = 0; i < n / centers.length; i++) { const a = r() * 6.28, d = Math.pow(r(), .9) * (centers.length > 1 ? 30 : 60); s += `<circle cx="${(cx + Math.cos(a) * d).toFixed(1)}" cy="${(cy + Math.sin(a) * d).toFixed(1)}" r="${(r() * 1.6 + .5).toFixed(2)}" fill="${r() < .15 ? '#ffcf8a' : '#e6ecff'}"/>`; }
    }
    return wrap(s, blur);
  }

  window.SkyCharts = { conChart, finder, planetArt: k => (PLANET_ART[k] ? PLANET_ART[k]() : ''), dsoArt, FIG };
})();
