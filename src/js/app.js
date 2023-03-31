/*
@preserve
v1.0.20
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
    ".gt-corsiva {" +
    'font-family: "MTCORSVA";' +
    "font-style: normal !important;" +
    "font-weight: bold;" +
    "text-transform: none !important;" +
    "}" +
    ".gt-times .gt-times sup {" +
    "display: none;" +
    "}" +
    "@font-face {" +
    "font-family: 'MTCORSVA';" +
    "src: url('https://www.gyrotonic.com/wp-content/themes/gyrotonic/fonts/MTCORSVA.eot');" +
    "src: local('MTCORSVA'), url('https://www.gyrotonic.com/wp-content/themes/gyrotonic/fonts/MTCORSVA.woff') format('woff'), url('https://www.gyrotonic.com/wp-content/themes/gyrotonic/fonts/MTCORSVA.ttf') format('truetype');" +
    "}";

  var regFonts = {
    "gt-times": [
      "GYROTONIC EXPANSION SYSTEM",
      "GYROTONIC",
      "GYROKINESIS",
      "GYROTONER",
      "ARCHWAY",
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
    "The Art of Exercising and Beyond": REG_SYM,
    Ultima: REG_SYM,
    ARCHWAY: TM_SYM,
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

          if (typeof termDef === "string") {
            term = termDef;
          } else {
            term = termDef.term;
            afterTerm = termDef.afterTerm || "";
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
              if (!$clone.is(contains)) return;

              var text = $(this).html();
              text = text.replace(
                re,
                '<span class="' +
                  font +
                  '">' +
                  term +
                  "<sup>" +
                  termSym +
                  "</sup>" +
                  afterTerm +
                  "</span>"
              );
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
                ")"
            )
          );
          $(containerSelectorsNoReg.join(","))
            .not("." + font)
            .each(replaceInEl(termRe, ":contains(" + term + afterTerm + ")"));
        });
      });

      // cleanup any nested issues (Ultima XS Ultima)
      $('span[class^="gt-"] span[class^="gt-"]').each(function (i, nestedEl) {
        var $nestedEl = $(nestedEl);
        $nestedEl.find("sup").remove();
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
    l("//code.jquery.com/jquery-3.2.1.min.js", "jquery");
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
