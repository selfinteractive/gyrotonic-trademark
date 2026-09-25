"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { JSDOM } = require("jsdom");

const SCRIPT_PATH = path.resolve(
  __dirname,
  "../..",
  process.env.GTTM_SCRIPT || "src/js/app.js"
);
const SCRIPT_SOURCE = fs.readFileSync(SCRIPT_PATH, "utf8");

// jsdom's querySelectorAll/matches implement jQuery's non-standard :contains()
// pseudo as a silent no-op instead of throwing the SyntaxError real browsers
// throw for it, so Sizzle's native-QSA fast path never falls back to its own
// (correct) JS matcher. Force the throw real browsers produce.
function forceSizzleContainsFallback(window) {
  function throwsForContains(fn) {
    return function (selector) {
      if (
        typeof selector === "string" &&
        selector.indexOf(":contains(") !== -1
      ) {
        throw new window.DOMException("unsupported pseudo-class", "SyntaxError");
      }
      return fn.apply(this, arguments);
    };
  }
  window.Document.prototype.querySelectorAll = throwsForContains(
    window.Document.prototype.querySelectorAll
  );
  window.Element.prototype.querySelectorAll = throwsForContains(
    window.Element.prototype.querySelectorAll
  );
  window.Element.prototype.matches = throwsForContains(
    window.Element.prototype.matches
  );
}

async function buildFixture(html) {
  const dom = new JSDOM(
    `<!DOCTYPE html><body><div id="fixture">${html}</div></body>`,
    { runScripts: "outside-only" }
  );
  const { window } = dom;

  forceSizzleContainsFallback(window);

  window.jQuery = window.$ = require("jquery")(window);
  window.GT_MANUAL = true;
  window.eval(SCRIPT_SOURCE);

  // Wait for _init's setTimeout(_init, 1) so appendCss (and jQuery discovery)
  // have run before we drive the script ourselves.
  await new Promise((resolve) => setTimeout(resolve, 10));

  async function apply(selectorPrepend) {
    window.gyrotonicTrademarks.apply(selectorPrepend);
    // replaceTrademarks runs its work inside jQuery(fn); queuing another
    // jQuery(fn) after it resolves once that work has actually executed.
    await new Promise((resolve) => window.jQuery(resolve));
    return window.document.getElementById("fixture").innerHTML;
  }

  return { window, apply };
}

async function format(html, selectorPrepend) {
  const fixture = await buildFixture(html);
  return fixture.apply(selectorPrepend);
}

module.exports = { buildFixture, format };

test("bare GYROTONIC text has no regContainers tag around it and is left unwrapped", async () => {
  assert.equal(await format("GYROTONIC"), "GYROTONIC");
});

test("typed ® on GYROTONIC and GYROKINESIS are both wrapped, no bare ® left", async () => {
  const result = await format("<p>GYROTONIC® and GYROKINESIS®</p>");
  assert.equal(
    result,
    '<p><span class="gttm gt-times">GYROTONIC<sup>®</sup></span> and <span class="gttm gt-times">GYROKINESIS<sup>®</sup></span></p>'
  );
});

test("Ultima XS wraps as one gt-corsiva span", async () => {
  const result = await format("<p>Ultima XS</p>");
  assert.equal(
    result,
    '<p><span class="gttm gt-corsiva">Ultima<sup>®</sup> XS</span></p>'
  );
});

test("gttm-ignore section is left untouched", async () => {
  const result = await format('<p class="gttm-ignore">GYROTONIC</p>');
  assert.equal(result, '<p class="gttm-ignore">GYROTONIC</p>');
});

test("stray ® directly after a .gttm span (editor italicised only the word) is stripped", async () => {
  const result = await format(
    '<h2><span class="sqsrte-text-color--accent"><em>GYROKINESIS</em>®</span></h2>'
  );
  assert.equal(
    result,
    '<h2><span class="sqsrte-text-color--accent"><em><span class="gttm gt-times">GYROKINESIS<sup>®</sup></span></em></span></h2>'
  );
  assert.equal((result.match(/®/g) || []).length, 1);
});

test("stray ® after two closing inline wrappers is stripped", async () => {
  const result = await format(
    "<p><strong><em>GYROTONIC</em></strong>&reg; method</p>"
  );
  assert.equal(
    result,
    '<p><strong><em><span class="gttm gt-times">GYROTONIC<sup>®</sup></span></em></strong> method</p>'
  );
});

test("® preceded by whitespace is left alone (not a stray doubled ®)", async () => {
  const result = await format("<p><em>GYROTONIC</em> ® x</p>");
  assert.equal(
    result,
    '<p><em><span class="gttm gt-times">GYROTONIC<sup>®</sup></span></em> ® x</p>'
  );
});

test("apply() is idempotent on the stray-® heading fixture", async () => {
  const fixture = await buildFixture(
    '<h2><span class="sqsrte-text-color--accent"><em>GYROKINESIS</em>®</span></h2>'
  );
  const once = await fixture.apply();
  const twice = await fixture.apply();
  assert.equal(twice, once);
});

test('"& Logo" in the same text node as GYROTONIC® is wrapped in gt-times-logo', async () => {
  const result = await format("<p><em>GYROTONIC® &amp; Logo</em>, x</p>");
  assert.equal(
    result,
    '<p><em><span class="gttm gt-times">GYROTONIC<sup>®</sup></span> <span class="gttm gt-times-logo">&amp; Logo</span></em>, x</p>'
  );
});

test('"& Logo" after a stray ® stripped from a bolded/italicised GYROTONIC is wrapped', async () => {
  const result = await format("<p><em>GYROTONIC</em>® &amp; Logo, x</p>");
  assert.equal((result.match(/®/g) || []).length, 1);
  assert.match(
    result,
    /<span class="gttm gt-times-logo">&amp; Logo<\/span>/
  );
});

test('footer block 4b99738a: split "& Logo" gets one gt-times-logo span per text piece', async () => {
  const html =
    '<span class="sqsrte-text-color--darkAccent"><em>GYROTONIC</em>® <strong><em>&amp; </em>Logo, </strong><em>GYROTONIC</em>® and <em>GYROKINESIS</em>®<br>are registered trademarks of Gyrotonic Sales Corp and are used with their permission.</span>';
  const result = await format(html);
  assert.equal((result.match(/®/g) || []).length, 3);
  assert.match(
    result,
    /<strong><em><span class="gttm gt-times-logo">&amp; <\/span><\/em><span class="gttm gt-times-logo">Logo<\/span>, <\/strong>/
  );
});

test("footer block 58fbaa4e: the &lt;logo typo is left alone, no doubled ®", async () => {
  const html =
    '<span class="sqsrte-text-color--darkAccent"><strong><em>GYROTONIC® &amp; &lt;logo</em>, </strong><em>GYROTONIC</em>® and <em>GYROKINESIS</em>®<br>are registered trademarks of Gyrotonic Sales Corp and are used with their permission.</span>';
  const result = await format(html);
  assert.equal((result.match(/®/g) || []).length, 3);
  assert.doesNotMatch(result, /gt-times-logo/);
});

test("GYROTONIC &amp; logo (lowercase) is still wrapped - capitalize handles display", async () => {
  const result = await format("<p>GYROTONIC &amp; logo</p>");
  assert.match(result, /<span class="gttm gt-times-logo">&amp; logo<\/span>/);
});

test("& Logo is NOT wrapped after GYROKINESIS, GYROTONIC EXPANSION SYSTEM, plain text, or across a <br>", async () => {
  const cases = [
    "<p>GYROKINESIS &amp; Logo</p>",
    "<p>GYROTONIC EXPANSION SYSTEM &amp; Logo</p>",
    "<p>Brand &amp; Logo</p>",
    "<p>GYROTONIC<br>&amp; Logo</p>",
  ];
  for (const html of cases) {
    const result = await format(html);
    assert.doesNotMatch(result, /gt-times-logo/, html);
  }
});

test("& Logo is not wrapped inside gttm-ignore, or outside a selectorPrepend scope", async () => {
  const ignored = await format('<p class="gttm-ignore">GYROTONIC® &amp; Logo</p>');
  assert.doesNotMatch(ignored, /gt-times-logo/);

  const fixture = await buildFixture(
    '<div class="scope"><p>GYROTONIC &amp; Logo</p></div><p>GYROTONIC &amp; Logo</p>'
  );
  const scoped = await fixture.apply(".scope");
  const scopedMatches = scoped.match(/gt-times-logo/g) || [];
  assert.equal(scopedMatches.length, 1);
});

test("apply() is idempotent on footer block 4b99738a", async () => {
  const html =
    '<span class="sqsrte-text-color--darkAccent"><em>GYROTONIC</em>® <strong><em>&amp; </em>Logo, </strong><em>GYROTONIC</em>® and <em>GYROKINESIS</em>®<br>are registered trademarks of Gyrotonic Sales Corp and are used with their permission.</span>';
  const fixture = await buildFixture(html);
  const once = await fixture.apply();
  const twice = await fixture.apply();
  assert.equal(twice, once);
});
