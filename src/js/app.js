(function (jQuery) {
  var cssRules = '.gt-times {'+
    'font-family: "times new roman";' +
    'font-style: normal !important;' +
    'font-weight: bold;' +
    'text-transform: uppercase;' +
  '}' +
  '.gt-times .gt-times sup {' +
    'display: none;' +
  '}';

  var regTypes = ['GYROTONIC EXPANSION SYSTEM', 'GYROTONIC', 'GYROKINESIS', 'GYROTONER'];
  var regContainers = ['span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'];
  var regBreakout = ['strong'];

  function replaceTrademarks() {
    jQuery(function($){

      $('body').append('<style>' + cssRules + '</style>');

      $.each(regTypes, function (i, term) {
        var containerSelectors = [];
        var containerSelectorsNoReg = [];

        var termRre = new RegExp("(?<!<[^>]*)" + term + "®", "g");
        var termRe = new RegExp("(?<!<[^>]*)" + term, "g");

        function replaceInEl(re) {
          return function(){
            var text = $(this).html();
            text = text.replace(
              re,
              '<span class="gt-times">' + term + "<sup>®</sup></span>"
            );
            $(this).html(text);
          }
        }

        $.each(regContainers, function (j, container) {
          containerSelectors.push(container + ':contains(' + term + '®),' + container + ':contains(' + term + '&reg;)');
          containerSelectorsNoReg.push(container + ':contains(' + term + ')');
        });

        $(containerSelectors.join(",")).each(replaceInEl(termRre));
        $(containerSelectorsNoReg.join(","))
          .not(".gt-times")
          .each(replaceInEl(termRe));
      });
    });
  }

  var injected = false;
  function _injectJquery(){
    if(injected) return;
    function l(u, i) {
      var d = document;
      if (!d.getElementById(i)) {
        var s = d.createElement('script');
        s.src = u;
        s.id = i;
        d.body.appendChild(s);
      }
      injected = true;
    }
    l('//code.jquery.com/jquery-3.2.1.min.js', 'jquery');
  }

  function _init() {

    // find jquery
    if (window.$ && window.$() && window.$().jquery) {
      jQuery = window.$;
    } else if (!jQuery || !jQuery.jquery) {
      // inject it if we couldn't find it
      _injectJquery();
      return setTimeout(_init, 200);
    }

    // allow end user to disable auto-replace with window.GT_MANUAL constant
    if(!window.GT_MANUAL) {
      replaceTrademarks();
    }

  }

  setTimeout(_init, 1);

  window.gyrotonicTrademarks = {
    apply: replaceTrademarks
  }
})(window.jQuery);
