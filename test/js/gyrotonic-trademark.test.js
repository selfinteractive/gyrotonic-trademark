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
