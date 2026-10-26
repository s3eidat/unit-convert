/* Unit Convert — every unit maps to its category's base unit (a factor, or to/from functions for non-linear scales). */
(function () {
  "use strict";
  var $ = S3.$, $$ = S3.$$;
  var KEY = "units.v1";

  // [symbol, name, factor-to-base | {to, from}, extra search words]
  var CATS = [
    { id: "length", name: "Length", base: "m", def: ["km", "mi"], units: [
      ["nm", "nanometre", 1e-9], ["µm", "micrometre", 1e-6, "um micron"], ["mm", "millimetre", 1e-3, "millimeter"], ["cm", "centimetre", 1e-2, "centimeter"],
      ["m", "metre", 1, "meter"], ["km", "kilometre", 1e3, "kilometer"], ["in", "inch", 0.0254, "inches \""], ["ft", "foot", 0.3048, "feet '"],
      ["yd", "yard", 0.9144, "yards"], ["mi", "mile", 1609.344, "miles"], ["nmi", "nautical mile", 1852], ["ly", "light-year", 9460730472580800]] },
    { id: "mass", name: "Mass", base: "kg", def: ["kg", "lb"], units: [
      ["mg", "milligram", 1e-6], ["g", "gram", 1e-3, "grams"], ["kg", "kilogram", 1, "kilo kilos"], ["t", "tonne (metric)", 1000, "ton metric"],
      ["ct", "carat", 0.0002], ["oz", "ounce", 0.028349523125, "ounces"], ["lb", "pound", 0.45359237, "lbs pounds"], ["st", "stone", 6.35029318],
      ["us ton", "short ton (US)", 907.18474], ["uk ton", "long ton (UK)", 1016.0469088]] },
    { id: "temp", name: "Temperature", base: "K", def: ["°C", "°F"], units: [
      ["°C", "Celsius", { to: function (v) { return v + 273.15; }, from: function (k) { return k - 273.15; } }, "c centigrade"],
      ["°F", "Fahrenheit", { to: function (v) { return (v - 32) * 5 / 9 + 273.15; }, from: function (k) { return (k - 273.15) * 9 / 5 + 32; } }, "f"],
      ["K", "Kelvin", 1, "k"], ["°R", "Rankine", 5 / 9, "r"]] },
    { id: "volume", name: "Volume", base: "L", def: ["L", "gal"], units: [
      ["mL", "millilitre", 1e-3, "ml milliliter cc"], ["cm³", "cubic centimetre", 1e-3, "cm3"], ["L", "litre", 1, "l liter liters"], ["m³", "cubic metre", 1000, "m3"],
      ["in³", "cubic inch", 0.016387064, "in3"], ["ft³", "cubic foot", 28.316846592, "ft3"], ["fl oz", "fluid ounce (US)", 0.0295735295625, "floz"],
      ["pt", "pint (US)", 0.473176473], ["qt", "quart (US)", 0.946352946], ["gal", "gallon (US)", 3.785411784, "gallons"],
      ["uk pt", "pint (UK)", 0.56826125], ["uk gal", "gallon (UK)", 4.54609, "imperial"], ["bbl", "barrel (oil)", 158.987294928]] },
    { id: "area", name: "Area", base: "m²", def: ["m²", "ft²"], units: [
      ["mm²", "square millimetre", 1e-6, "mm2"], ["cm²", "square centimetre", 1e-4, "cm2"], ["m²", "square metre", 1, "m2 sqm"], ["dunam", "dunam (دونم)", 1000, "dunum donum"],
      ["ha", "hectare", 1e4], ["km²", "square kilometre", 1e6, "km2"], ["in²", "square inch", 0.00064516, "in2"], ["ft²", "square foot", 0.09290304, "ft2 sqft"],
      ["yd²", "square yard", 0.83612736, "yd2"], ["ac", "acre", 4046.8564224, "acres"], ["mi²", "square mile", 2589988.110336, "mi2"]] },
    { id: "speed", name: "Speed", base: "m/s", def: ["km/h", "mph"], units: [
      ["m/s", "metres per second", 1, "mps"], ["km/h", "kilometres per hour", 1 / 3.6, "kph kmh"], ["mph", "miles per hour", 0.44704],
      ["kn", "knot", 1852 / 3600, "knots"], ["ft/s", "feet per second", 0.3048, "fps"], ["c", "speed of light", 299792458]] },
    { id: "time", name: "Time", base: "s", def: ["h", "min"], units: [
      ["ns", "nanosecond", 1e-9], ["µs", "microsecond", 1e-6, "us"], ["ms", "millisecond", 1e-3], ["s", "second", 1, "sec seconds"],
      ["min", "minute", 60, "minutes"], ["h", "hour", 3600, "hr hours"], ["d", "day", 86400, "days"], ["wk", "week", 604800, "weeks"],
      ["mo", "month (average)", 2629746, "months"], ["yr", "year (average)", 31556952, "years"], ["dec", "decade", 315569520], ["cent", "century", 3155695200]] },
    { id: "data", name: "Data", base: "B", def: ["GB", "GiB"], units: [
      ["bit", "bit", 0.125, "bits b"], ["B", "byte", 1, "bytes"], ["kB", "kilobyte", 1e3, "kb"], ["MB", "megabyte", 1e6, "mb"], ["GB", "gigabyte", 1e9, "gb gig"],
      ["TB", "terabyte", 1e12, "tb"], ["PB", "petabyte", 1e15, "pb"], ["KiB", "kibibyte", 1024, "kib"], ["MiB", "mebibyte", 1048576, "mib"],
      ["GiB", "gibibyte", 1073741824, "gib"], ["TiB", "tebibyte", 1099511627776, "tib"], ["PiB", "pebibyte", 1125899906842624, "pib"],
      ["kbit", "kilobit", 125, "kbps"], ["Mbit", "megabit", 125000, "mbps megabits"], ["Gbit", "gigabit", 1.25e8, "gbps"]] },
    { id: "pressure", name: "Pressure", base: "Pa", def: ["bar", "psi"], units: [
      ["Pa", "pascal", 1], ["hPa", "hectopascal", 100, "mbar millibar"], ["kPa", "kilopascal", 1e3], ["MPa", "megapascal", 1e6],
      ["bar", "bar", 1e5], ["atm", "atmosphere", 101325], ["psi", "pound per square inch", 6894.757293168361],
      ["mmHg", "millimetre of mercury", 133.322387415, "torr"], ["inHg", "inch of mercury", 3386.389]] },
    { id: "energy", name: "Energy", base: "J", def: ["kcal", "kJ"], units: [
      ["J", "joule", 1], ["kJ", "kilojoule", 1e3], ["MJ", "megajoule", 1e6], ["cal", "calorie", 4.184], ["kcal", "kilocalorie (food Calorie)", 4184, "calories"],
      ["Wh", "watt-hour", 3600], ["kWh", "kilowatt-hour", 3.6e6], ["BTU", "British thermal unit", 1055.05585262, "btu"],
      ["ft·lbf", "foot-pound", 1.3558179483314004, "ftlb"], ["eV", "electronvolt", 1.602176634e-19], ["thm", "therm (US)", 105480400]] },
    { id: "power", name: "Power", base: "W", def: ["kW", "hp"], units: [
      ["W", "watt", 1, "watts"], ["kW", "kilowatt", 1e3], ["MW", "megawatt", 1e6], ["hp", "horsepower (mechanical)", 745.69987158227022],
      ["PS", "metric horsepower", 735.49875, "cv"], ["BTU/h", "BTU per hour", 0.29307107017], ["kcal/h", "kilocalorie per hour", 1.1622222222]] },
    { id: "angle", name: "Angle", base: "°", def: ["°", "rad"], units: [
      ["°", "degree", 1, "deg degrees"], ["rad", "radian", 180 / Math.PI, "radians"], ["grad", "gradian", 0.9, "gon"], ["′", "arcminute", 1 / 60, "arcmin"],
      ["″", "arcsecond", 1 / 3600, "arcsec"], ["turn", "turn", 360, "revolution rev"], ["mil", "NATO mil", 360 / 6400]] },
    { id: "fuel", name: "Fuel economy", base: "km/L", def: ["L/100km", "mpg"], units: [
      ["km/L", "kilometres per litre", 1, "kmpl"],
      ["L/100km", "litres per 100 km", { to: function (v) { return 100 / v; }, from: function (k) { return 100 / k; } }, "l100km consumption"],
      ["mpg", "miles per gallon (US)", 1.609344 / 3.785411784, "mpg us"], ["mpg uk", "miles per gallon (UK)", 1.609344 / 4.54609, "imperial"]] },
    { id: "cooking", name: "Cooking", base: "mL", def: ["cup", "mL"], units: [
      ["tsp", "teaspoon (US)", 4.92892159375, "teaspoons"], ["tbsp", "tablespoon (US)", 14.78676478125, "tablespoons"], ["fl oz", "fluid ounce (US)", 29.5735295625],
      ["cup", "cup (US)", 236.5882365, "cups"], ["pt", "pint (US)", 473.176473], ["mL", "millilitre", 1, "ml"], ["L", "litre", 1000, "l liter"],
      ["m tsp", "teaspoon (metric)", 5], ["m tbsp", "tablespoon (metric)", 15], ["m cup", "cup (metric)", 250, "metric cup"]] }];
  var NOTES = {
    data: "SI units (kB, MB, GB) are powers of 1000; binary units (KiB, MiB, GiB) are powers of 1024. Disk makers use GB; many operating systems show GiB.",
    cooking: "Volume only. Converting cups to grams needs the ingredient's density (a cup of flour and a cup of sugar weigh differently).",
    fuel: "L/100km is consumption (lower is better); km/L and mpg are economy (higher is better).",
    time: "A month is the average Gregorian month (30.436875 days), a year is 365.2425 days.",
    temp: "Temperatures convert with offsets, not just a factor: 0 °C = 32 °F."
  };

  CATS.forEach(function (c) { c.units = c.units.map(function (u) { return { sym: u[0], name: u[1], f: u[2], words: (u[0] + " " + u[1] + " " + (u[3] || "")).toLowerCase(), cat: c }; }); });
  function cat(id) { return CATS.filter(function (c) { return c.id === id; })[0] || CATS[0]; }
  function unit(c, sym) { return c.units.filter(function (u) { return u.sym === sym; })[0]; }

  function toBase(u, v) { return typeof u.f === "number" ? v * u.f : u.f.to(v); }
  function fromBase(u, b) { return typeof u.f === "number" ? b / u.f : u.f.from(b); }
  function convert(v, a, b) { return fromBase(b, toBase(a, v)); }

  function num(v) {
    v = String(v == null ? "" : v)
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x6F0; })
      .replace(/٫/g, ".").replace(/[,\s_٬]/g, "").replace(/^−/, "-");
    return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(v) ? parseFloat(v) : NaN;
  }
  // 10 significant digits for display; plain (no grouping) when written back into an input.
  function fmt(v) {
    if (!isFinite(v)) return "—";
    if (v === 0) return "0";
    var a = Math.abs(v);
    if (a >= 1e15 || a < 1e-6) return v.toPrecision(7).replace(/\.?0+e/, "e");
    return Number(v.toPrecision(10)).toLocaleString("en-US", { maximumFractionDigits: 12 });
  }
  function raw(v) { return isFinite(v) ? String(Number(v.toPrecision(12))) : ""; }

  // ---------- state & render ----------
  var st = { cat: "length", a: "km", b: "mi", last: "a" };

  function fillSelects() {
    var c = cat(st.cat);
    ["#ua", "#ub"].forEach(function (id) {
      var sel = $(id); sel.innerHTML = "";
      c.units.forEach(function (u) { sel.appendChild(S3.h("option", { value: u.sym, text: u.name + " (" + u.sym + ")" })); });
    });
    $("#ua").value = st.a; $("#ub").value = st.b;
    $$("#cats button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === st.cat)); });
    $("#all-h").textContent = "All " + c.name.toLowerCase() + " units";
    $("#note").textContent = NOTES[c.id] || "";
  }

  function compute() {
    var c = cat(st.cat), ua = unit(c, st.a), ub = unit(c, st.b);
    var src = st.last === "a" ? $("#va") : $("#vb"), dst = st.last === "a" ? $("#vb") : $("#va");
    var v = num(src.value), from = st.last === "a" ? ua : ub, to = st.last === "a" ? ub : ua;
    dst.value = isNaN(v) ? "" : raw(convert(v, from, to));
    var va = num($("#va").value);
    var one = convert(1, ua, ub);
    $("#formula").textContent = !isNaN(va) ? fmt(va) + " " + ua.sym + " = " + fmt(convert(va, ua, ub)) + " " + ub.sym +
      (typeof ua.f === "number" && typeof ub.f === "number" ? "   ·   1 " + ua.sym + " = " + fmt(one) + " " + ub.sym : "") : "Type a number on either side.";
    $("#all").innerHTML = '<thead><tr><th>Unit</th><th>Symbol</th><th class="v">Value</th></tr></thead><tbody>' +
      c.units.map(function (u) {
        var x = isNaN(va) ? NaN : convert(va, ua, u);
        return '<tr class="' + (u === ub ? "on" : "") + '" data-v="' + S3.esc(raw(x)) + '"><td>' + S3.esc(u.name) + '</td><td class="s">' + S3.esc(u.sym) + '</td><td class="v">' + S3.esc(fmt(x)) + "</td></tr>";
      }).join("") + "</tbody>";
    S3.store(KEY, { cat: st.cat, a: st.a, b: st.b, va: $("#va").value });
  }

  function setCat(id, a, b) {
    var c = cat(id);
    st.cat = c.id; st.a = a && unit(c, a) ? a : c.def[0]; st.b = b && unit(c, b) ? b : c.def[1];
    if (st.a === st.b) st.b = c.units.filter(function (u) { return u.sym !== st.a; })[0].sym;
    st.last = "a"; fillSelects(); compute();
  }

  // ---------- search: unit names, or "5 km to mi" ----------
  function find(word, c) {
    word = word.toLowerCase().replace(/^°/, "");
    var pool = c ? c.units : [].concat.apply([], CATS.map(function (x) { return x.units; }));
    var exact = pool.filter(function (u) { return u.sym.toLowerCase().replace(/^°/, "") === word; });
    if (exact.length) return exact;
    return pool.filter(function (u) { return u.words.split(/\s+/).indexOf(word) >= 0 || u.name.toLowerCase() === word || u.name.toLowerCase() + "s" === word; });
  }
  function parseQuery(q) {
    var m = /^\s*([-+−]?[\d.,٠-٩]+(?:e[-+]?\d+)?)\s*(.+?)\s+(?:to|in|into|as|=|->|→)\s+(.+?)\s*$/i.exec(q);
    if (!m || isNaN(num(m[1]))) return null;
    var froms = find(m[2]);
    for (var i = 0; i < froms.length; i++) {
      var tos = find(m[3], froms[i].cat);
      if (tos.length) return { v: num(m[1]), a: froms[i], b: tos[0] };
    }
    return null;
  }
  function search() {
    var q = $("#q").value.trim(), box = $("#hits");
    box.innerHTML = "";
    if (!q) { box.hidden = true; $("#q").setAttribute("aria-expanded", "false"); return; }
    var p = parseQuery(q), hits = [];
    if (p) hits.push({ label: fmt(p.v) + " " + p.a.sym + " → " + fmt(convert(p.v, p.a, p.b)) + " " + p.b.sym, sub: p.a.cat.name, go: function () { setCat(p.a.cat.id, p.a.sym, p.b.sym); $("#va").value = raw(p.v); compute(); } });
    var words = q.toLowerCase().split(/\s+/);
    CATS.forEach(function (c) {
      c.units.forEach(function (u) {
        if (hits.length < 12 && words.every(function (w) { return u.words.indexOf(w) >= 0 || c.name.toLowerCase().indexOf(w) >= 0; }))
          hits.push({ label: u.name + " (" + u.sym + ")", sub: c.name, go: function () { setCat(c.id, u.sym === c.def[1] ? c.def[0] : u.sym, u.sym === c.def[1] ? u.sym : null); } });
      });
    });
    hits.forEach(function (h, i) {
      box.appendChild(S3.h("button", { type: "button", role: "option", "class": i ? "" : "on", onclick: function () { h.go(); $("#q").value = ""; search(); } },
        [h.label, S3.h("span", { text: h.sub })]));
    });
    if (!hits.length) box.appendChild(S3.h("div", { "class": "none", text: "No unit matches “" + q + "”" }));
    box.hidden = false; $("#q").setAttribute("aria-expanded", "true");
  }

  // ---------- wiring ----------
  CATS.forEach(function (c) {
    $("#cats").appendChild(S3.h("button", { type: "button", "data-v": c.id, "aria-pressed": "false", onclick: function () { setCat(c.id); } }, [c.name]));
  });
  var sv = S3.store(KEY) || {};
  st.cat = cat(sv.cat).id;
  var c0 = cat(st.cat);
  st.a = unit(c0, sv.a) ? sv.a : c0.def[0]; st.b = unit(c0, sv.b) ? sv.b : c0.def[1];
  fillSelects();
  $("#va").value = sv.va != null ? sv.va : "1";
  compute();

  $("#va").addEventListener("input", function () { st.last = "a"; compute(); });
  $("#vb").addEventListener("input", function () { st.last = "b"; compute(); });
  $("#ua").addEventListener("change", function () { st.a = this.value; compute(); });
  $("#ub").addEventListener("change", function () { st.b = this.value; st.last = "a"; compute(); });
  $("#swap").addEventListener("click", function () {
    var t = st.a; st.a = st.b; st.b = t;
    var tv = $("#va").value; $("#va").value = $("#vb").value; $("#vb").value = tv;
    st.last = "a"; fillSelects(); compute();
  });
  $("#copy").addEventListener("click", function () {
    var t = $("#formula").textContent.split("   ·")[0];
    if (!$("#vb").value) return S3.toast("Type a number first", "error");
    S3.copy(t); S3.done();
  });
  $("#all").addEventListener("click", function (e) {
    var tr = e.target.closest("tbody tr");
    if (tr && tr.dataset.v) { S3.copy(tr.dataset.v); S3.done(); }
  });
  $("#q").addEventListener("input", search);
  $("#q").addEventListener("keydown", function (e) {
    var bs = $$("#hits button"), i = bs.findIndex(function (b) { return b.classList.contains("on"); });
    if (e.key === "Enter" && bs[Math.max(0, i)]) { e.preventDefault(); bs[Math.max(0, i)].click(); }
    else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && bs.length) {
      e.preventDefault();
      var j = (i + (e.key === "ArrowDown" ? 1 : -1) + bs.length) % bs.length;
      bs.forEach(function (b, k) { b.classList.toggle("on", k === j); }); bs[j].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Escape") { $("#q").value = ""; search(); }
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".search")) $("#hits").hidden = true; });

  window.S3_DEMO = function () { setCat("temp", "°C", "°F"); $("#va").value = "37"; compute(); };

  window.S3_SELFTEST = function () {
    function U(c, s) { return unit(cat(c), s); }
    function near(a, b) { return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)); }
    var p = parseQuery("5 km to mi"), q = parseQuery("72 f in c");
    return near(convert(100, U("temp", "°C"), U("temp", "°F")), 212) && near(convert(-40, U("temp", "°C"), U("temp", "°F")), -40) &&
      near(convert(0, U("temp", "°C"), U("temp", "K")), 273.15) && near(convert(491.67, U("temp", "°R"), U("temp", "°C")), 0) &&
      near(convert(1, U("length", "mi"), U("length", "km")), 1.609344) && near(convert(1, U("length", "ft"), U("length", "in")), 12) &&
      near(convert(1, U("mass", "lb"), U("mass", "g")), 453.59237) &&
      near(convert(1, U("data", "GiB"), U("data", "B")), 1073741824) && fmt(convert(1, U("data", "GB"), U("data", "GiB"))) === "0.9313225746" &&
      fmt(convert(10, U("fuel", "L/100km"), U("fuel", "mpg"))) === "23.52145833" &&
      fmt(convert(1, U("pressure", "atm"), U("pressure", "psi"))) === "14.69594878" &&
      near(convert(1, U("energy", "kWh"), U("energy", "MJ")), 3.6) && near(convert(Math.PI, U("angle", "rad"), U("angle", "°")), 180) &&
      near(convert(1, U("area", "dunam"), U("area", "m²")), 1000) && near(convert(3, U("cooking", "tsp"), U("cooking", "tbsp")), 1) &&
      fmt(0.1 + 0.2) === "0.3" && !!p && p.b.sym === "mi" && fmt(convert(p.v, p.a, p.b)) === "3.106855961" &&
      !!q && q.a.sym === "°F" && q.b.sym === "°C" && fmt(convert(q.v, q.a, q.b)) === "22.22222222";
  };
})();
