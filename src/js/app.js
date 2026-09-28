/*
@preserve
v2.2.1
*/
(function (jQuery) {
  var REG_SYM = "®";
  var TM_SYM = "™";
  var ENCODED_SYMS = {
    "®": "&reg;",
    "™": "&trade;",
  };
  var cssRules =
    ".gt-times {" +
    'font-family: "times new roman";' +
    "font-style: normal !important;" +
    "font-weight: bold;" +
    "text-transform: uppercase;" +
    "}" +
    ".gt-times-normal {" +
    'font-family: "times new roman";' +
    "font-style: normal !important;" +
    "font-weight: lighter !important;" +
    "text-transform: uppercase;" +
    "}" +
    ".gt-corsiva {" +
    'font-family: "times new roman";' +
    "font-style: italic !important;" +
    "font-weight: normal;" +
    "text-transform: none !important;" +
    "}" +
    ".gt-times .gt-times sup {" +
    "display: none;" +
    "}" +
    ".gt-times-logo {" +
    'font-family: "times new roman";' +
    "font-style: normal !important;" +
    "font-weight: bold;" +
    "text-transform: capitalize !important;" +
    "}" +
    ".gt-times-logo .gt-lowercase {" +
    "text-transform: lowercase !important;" +
    "}";

  var regFonts = {
    "gt-times": [
      "GYROTONIC EXPANSION SYSTEM",
      "GYROTONIC",
      "자이로토닉",
      "GYROKINESIS",
      "GYROTONER",
      "ARCHWAY",
      "Archway",
    ],
    "gt-times-normal": [
      "ULTIMA REVEAL",
      "Ultima Reveal",
      "Ultima&reg; Reveal",
      "Ultima® Reveal",
    ],
    "gt-corsiva": [
      {
        term: "Ultima",
        afterTerm: " XS",
      },
      "Ultima",
      "Cobra",
      "The Art of Exercising and Beyond",
    ],
  };
  var regTypes = {
    "GYROTONIC EXPANSION SYSTEM": REG_SYM,
    GYROTONIC: REG_SYM,
    GYROKINESIS: REG_SYM,
    GYROTONER: REG_SYM,
    Cobra: REG_SYM,
    자이로토닉: REG_SYM,
    "The Art of Exercising and Beyond": REG_SYM,
    "Ultima Reveal": REG_SYM,
    "ULTIMA REVEAL": REG_SYM,
    "Ultima&reg; Reveal": REG_SYM,
    "Ultima® Reveal": REG_SYM,
    Ultima: REG_SYM,
    ARCHWAY: REG_SYM,
    Archway: REG_SYM,
    // Archway: TM_SYM,
  };
  var regContainers = [
    "strong",
    "span",
    "p",
    "a",
    "b",
    "i",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
  ];
  var regBreakout = ["strong"];
  var inlineWrapperTags = ["em", "strong", "b", "i", "a", "span"];

  function appendCss() {
    jQuery("body").append("<style>" + cssRules + "</style>");
  }

  // Returns a function that, called repeatedly, walks forward in document
  // order from startEl and returns each text node making up "the rest of
  // the line": it passes transparently through inline wrapper elements
  // (em, strong, b, i, a, span) - both climbing out of one as an ancestor
  // and descending into one as a sibling - and stops (returning null) at a
  // <br>, any other element, or the end of the document. Shared by the
  // stray-®/™ strip and the "& Logo" match, both of which need "the text
  // that follows a .gttm span within the same line."
  function lineTextWalker(startEl) {
    var node = startEl;
    var pendingDescend = null;

    // An already-wrapped trademark/logo span (class "gttm") is a stop, not
    // a transparent wrapper - otherwise a second apply() call would walk
    // back into content it already produced and re-match it.
    function isTransparentWrapper(el) {
      return (
        el.nodeType === 1 &&
        inlineWrapperTags.indexOf(el.tagName.toLowerCase()) !== -1 &&
        !/(^|\s)gttm(\s|$)/.test(el.className || "")
      );
    }

    function siblingOrClimb(n) {
      while (n) {
        if (n.nextSibling) return n.nextSibling;
        var parent = n.parentNode;
        if (!parent || !isTransparentWrapper(parent)) {
          return null;
        }
        n = parent;
      }
      return null;
    }

    return function next() {
      while (true) {
        if (pendingDescend) {
          node = pendingDescend;
          pendingDescend = null;
        } else {
          var found = siblingOrClimb(node);
          if (!found) return null;
          node = found;
        }

        if (node.nodeType === 3) {
          return node;
        }
        if (node.nodeType === 1) {
          if (node.tagName.toLowerCase() === "br" || !isTransparentWrapper(node)) {
            return null;
          }
          if (node.firstChild) {
            pendingDescend = node.firstChild;
          }
        }
        // else: comment or other node type, or an empty inline wrapper -
        // loop again and advance past it.
      }
    };
  }

  function replaceTrademarks(selectorPrepend) {
    jQuery(function ($) {
      // first pass on replacing
      $.each(regFonts, function (font, termList) {
        $.each(termList, function (i, termDef) {
          var afterTerm = "";
          var term = "";
          var afterTermSymbol = "";
          var afterTermSymEncoded = "";

          if (typeof termDef === "string") {
            term = termDef;
          } else {
            term = termDef.term;
            afterTerm = termDef.afterTerm || "";
            afterTermSymbol = termDef.afterTermSymbol || "";
            afterTermSymEncoded = ENCODED_SYMS[afterTermSymbol];
          }

          var containerSelectors = [];
          var containerSelectorsNoReg = [];
          var termSym = regTypes[term];
          var termSymEncoded = ENCODED_SYMS[termSym];

          var termRre = new RegExp(
            term + termSym + afterTerm + "(?![^<]*>|[^<>]*</)",
            "g"
          );
          var termRe = new RegExp(
            term + afterTerm + "(?![^<]*>|[^<>]*</)",
            "g"
          );

          function replaceInEl(re, contains) {
            return function () {
              // make sure we actually need to replace this one by seeing if it
              // has TMs outside of its children's content
              var $clone = $(this).clone();
              $clone.find("*").remove();
              // console.log($clone);
              if (
                $clone.hasClass("gttm-ignore") ||
                !$clone.is(contains) ||
                $clone.hasClass("gttm")
              )
                return;

              var text = $(this).html();

              text = text.replace(
                re,
                '<span class="gttm ' +
                  font +
                  '">' +
                  term +
                  "<sup>" +
                  termSym +
                  "</sup>" +
                  afterTerm +
                  (afterTermSymbol
                    ? "<sup>" + afterTermSymbol + "</sup>"
                    : "") +
                  "</span>"
              );

              // remove any symbols not wrapped in a span
              const toRemove = Object.keys(ENCODED_SYMS).concat(
                Object.values(regTypes)
              );

              toRemove.forEach((sym) => {
                text = text.replace(
                  new RegExp(`(?!<sup>)${sym}(?!<\/sup>)`, "g"),
                  ""
                );
              });

              $(this).html(text);
            };
          }

          $.each(regContainers, function (j, container) {
            var prepend = selectorPrepend ? selectorPrepend + " " : "";
            containerSelectors.push(
              prepend +
                container +
                ":contains(" +
                term +
                "" +
                termSym +
                afterTerm +
                ")," +
                prepend +
                container +
                ":contains(" +
                term +
                termSymEncoded +
                afterTerm +
                (afterTermSymbol
                  ? "<sup>" + afterTermSymEncoded + "</sup>"
                  : "") +
                ")"
            );

            containerSelectorsNoReg.push(
              prepend + container + ":contains(" + term + afterTerm + ")"
            );
          });

          $(containerSelectors.join(",")).each(
            replaceInEl(
              termRre,
              ":contains(" +
                term +
                "" +
                termSym +
                afterTerm +
                "),:contains(" +
                term +
                termSymEncoded +
                afterTerm +
                (afterTermSymbol
                  ? "<sup>" + afterTermSymEncoded + "</sup>"
                  : "") +
                ")"
            )
          );
          $(containerSelectorsNoReg.join(","))
            .not("." + font)
            .each(replaceInEl(termRe, ":contains(" + term + afterTerm + ")"));
        });
      });

      // cleanup any nested issues (Ultima XS Ultima)
      $('span[class*="gttm"] span[class*="gttm"]').each(function (i, nestedEl) {
        var $nestedEl = $(nestedEl);
        $nestedEl.find("sup").remove();
      });
      $('span[class*="gttm"] > span[class*="gttm"]').each(function (
        i,
        nestedEl
      ) {
        var $nestedEl = $(nestedEl);
        $nestedEl.contents().unwrap();
      });

      // A ® or ™ that the editor typed outside the italicised/bolded word
      // (e.g. <em>GYROTONIC</em>®) sits in the parent's text, which the
      // first pass never touches, so the reader sees it doubled. Strip
      // only when it is the very first character right after a .gttm
      // span - whitespace or anything else in front of it means it is not
      // a doubled symbol and is left alone.
      var prepend = selectorPrepend ? selectorPrepend + " " : "";
      $(prepend + ".gttm").each(function () {
        var nextText = lineTextWalker(this)();
        if (nextText && /^[®™]/.test(nextText.nodeValue)) {
          nextText.nodeValue = nextText.nodeValue.slice(1);
        }
      });

      // "& Logo" directly after a GYROTONIC® span, in Times New Roman
      // bold. Runs after the stray-® strip above, so a doubled ® between
      // the two never confuses the match.
      $(prepend + ".gttm").each(function () {
        if (!isGyrotonicSpan(this)) return;

        var pieces = matchLogoAttribution(lineTextWalker(this));
        if (!pieces) return;

        pieces.forEach(function (piece, index) {
          var node = piece.node;
          var matchNode = piece.start > 0 ? node.splitText(piece.start) : node;
          if (piece.end - piece.start < matchNode.nodeValue.length) {
            matchNode.splitText(piece.end - piece.start);
          }
          var doc = matchNode.ownerDocument;
          var span = doc.createElement("span");
          span.className = "gttm gt-times-logo";
          var text = matchNode.nodeValue;

          // The last piece always ends in "logo". Its last three letters go
          // in a .gt-lowercase span, so with the outer capitalize any typed
          // casing ("LOGO", "logo") displays as "Logo" without rewriting it.
          if (index === pieces.length - 1) {
            var lower = doc.createElement("span");
            lower.className = "gt-lowercase";
            lower.textContent = text.slice(-3);
            span.textContent = text.slice(0, -3);
            span.appendChild(lower);
          } else {
            span.textContent = text;
          }
          matchNode.parentNode.replaceChild(span, matchNode);
        });
      });
    });
  }

  // True for a .gttm span whose term is exactly "GYROTONIC" - not
  // GYROKINESIS, GYROTONIC EXPANSION SYSTEM, or any other regFonts entry.
  function isGyrotonicSpan(el) {
    var first = el.firstChild;
    return !!(first && first.nodeType === 3 && first.nodeValue === "GYROTONIC");
  }

  // Walks `next` (a lineTextWalker cursor) looking for "& Logo" (raw or
  // &amp;-encoded - both decode to the same "&" character in the DOM)
  // immediately after optional whitespace, with "logo" matched
  // case-insensitively. Returns an array of {node, start, end} pieces - one
  // per text node the match touches, since a match split across separate
  // inline elements (footer block 4b99738a) can't be wrapped in one span -
  // or null if no match is found before the walk stops.
  function matchLogoAttribution(next) {
    var pieces = [];
    var sawAmp = false;
    var node;

    while ((node = next())) {
      var text = node.nodeValue;
      var i = 0;

      if (!sawAmp) {
        while (i < text.length && /\s/.test(text[i])) i++;
        if (i >= text.length) continue;
        if (text[i] !== "&") return null;

        var ampStart = i;
        i++;
        sawAmp = true;
        pieces.push({ node: node, start: ampStart, end: null });

        while (i < text.length && /\s/.test(text[i])) i++;
        if (i >= text.length) {
          pieces[pieces.length - 1].end = text.length;
          continue;
        }

        var logoMatch = /^logo\b/i.exec(text.slice(i));
        if (!logoMatch) return null;
        pieces[pieces.length - 1].end = i + logoMatch[0].length;
        return pieces;
      }

      while (i < text.length && /\s/.test(text[i])) i++;
      var rest = text.slice(i);
      var m = /^logo\b/i.exec(rest);
      if (m) {
        pieces.push({ node: node, start: i, end: i + m[0].length });
        return pieces;
      }
      if (i >= text.length) continue;
      return null;
    }

    return null;
  }

  var injected = false;
  function _injectJquery() {
    if (injected) return;
    function l(u, i) {
      var d = document;
      if (!d.getElementById(i)) {
        var s = d.createElement("script");
        s.src = u;
        s.id = i;
        d.body.appendChild(s);
      }
      injected = true;
    }
    l("https://code.jquery.com/jquery-3.2.1.min.js", "jquery");
  }

  function _init() {
    // find jquery
    if (window.$ && window.$() && window.$().jquery) {
      jQuery = window.$;
    } else if (!jQuery || !jQuery().jquery) {
      // inject it if we couldn't find it
      _injectJquery();
      return setTimeout(_init, 200);
    }

    appendCss();

    // allow end user to disable auto-replace with window.GT_MANUAL constant
    if (!window.GT_MANUAL) {
      replaceTrademarks();
    }
  }

  setTimeout(_init, 1);

  window.gyrotonicTrademarks = {
    apply: replaceTrademarks,
  };
})(window.jQuery);
