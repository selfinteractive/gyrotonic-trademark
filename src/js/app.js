/*
@preserve
v1.1.4
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
    "}";

  var regFonts = {
    "gt-times": [
      "GYROTONIC EXPANSION SYSTEM",
      "GYROTONIC",
      "자이로토닉 레이크파크 스튜디오",
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
    "자이로토닉 레이크파크 스튜디오": REG_SYM,
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
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
  ];
  var regBreakout = ["strong"];

  function appendCss() {
    $("body").append("<style>" + cssRules + "</style>");
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
    });
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
