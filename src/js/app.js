/*
@preserve
v1.0.11
*/
(function (jQuery) {
  var cssRules =
    ".gt-times {" +
    'font-family: "times new roman";' +
    "font-style: normal !important;" +
    "font-weight: bold;" +
    "text-transform: uppercase;" +
    "}" +
    ".gt-corsiva {" +
    'font-family: "Monotype Corsiva W01";' +
    "font-style: normal !important;" +
    "font-weight: bold;" +
    "text-transform: none !important;" +
    "}" +
    ".gt-times .gt-times sup {" +
    "display: none;" +
    "}";

  var regTypes = {
    "gt-times": [
      "GYROTONIC EXPANSION SYSTEM",
      "GYROTONIC",
      "GYROKINESIS",
      "GYROTONER",
      "ARCHWAY",
    ],
    "gt-corsiva": ["Ultima ", "Cobra", "The Art of Exercising and Beyond"],
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
      $.each(regTypes, function (font, termList) {
        $.each(termList, function (i, term) {
          var containerSelectors = [];
          var containerSelectorsNoReg = [];

          var termRre = new RegExp(term + "®(?![^<]*>|[^<>]*</)", "g");
          var termRe = new RegExp(term + "(?![^<]*>|[^<>]*</)", "g");

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
                '<span class="' + font + '">' + term + "<sup>®</sup></span>"
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
                "®)," +
                prepend +
                container +
                ":contains(" +
                term +
                "&reg;)"
            );
            containerSelectorsNoReg.push(
              prepend + container + ":contains(" + term + ")"
            );
          });

          $(containerSelectors.join(",")).each(
            replaceInEl(
              termRre,
              ":contains(" + term + "®),:contains(" + term + "&reg;)"
            )
          );
          $(containerSelectorsNoReg.join(","))
            .not("." + font)
            .each(replaceInEl(termRe, ":contains(" + term + ")"));
        });
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
