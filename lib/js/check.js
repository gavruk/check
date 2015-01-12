!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.check=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var $, Check,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

$ = jQuery;

$.check = {};

$.check.fn = {};

$.fn.check = function(opts) {
  return $.check.fn.construct.apply(this, opts);
};

Check = (function() {
  Check.prototype.checkTemplate = "<div class=\"check-container\">\n    <div class=\"check\">\n        <div class=\"front\">\n            <div class=\"higher\">\n                <div class=\"name display\">{{name}}</div>\n                <div class=\"order display\">\n                    <div class=\"ordertext\">PAY TO THE ORDER OF</div>\n                    <div class=\"orderval\">{{order}}</div>\n                </div>\n                <div class=\"bankname display\">{{bankName}}</div>\n            </div>\n            <div class=\"lower\">\n                <div class=\"routing-box\">\n                    <div class=\"label\">Routing Number</div>\n                    <div class=\"routingnumber display\">{{routingNumber}}</div>\n                </div>\n                <div class=\"account-box\">\n                    <div class=\"label\">Account Number</div>\n                    <div class=\"accountnumber display\">{{accountNumber}}</div>\n                </div>\n                <div class=\"numbers\">1234</div>\n            </div>\n        </div>\n    </div>\n</div>";

  Check.prototype.template = function(tpl, data) {
    return tpl.replace(/\{\{(.*?)\}\}/g, function(match, key, str) {
      return data[key];
    });
  };

  Check.prototype.defaults = {
    formSelectors: {
      accountNumberInput: 'input[name="account-number"]',
      routingNumberInput: 'input[name="routing-number"]',
      nameInput: 'input[name="name"]',
      bankNameInput: 'input[name="bank-name"]',
      orderInput: 'input[name="order"]'
    },
    checkSelectors: {
      checkContainer: '.check-container',
      check: '.check',
      accountNumberDisplay: '.accountnumber',
      routingNumberDisplay: '.routingnumber',
      nameDisplay: '.name',
      bankNameDisplay: '.bankname',
      orderDisplay: '.orderval'
    },
    values: {
      accountNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
      routingNumber: '&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;',
      name: 'Full Name',
      bankName: 'Bank Name',
      order: '_________________________'
    }
  };

  function Check(el, opts) {
    this.options = $.extend(true, {}, this.defaults, opts);
    $.extend(this.options.values, $.check.values);
    this.$el = $(el);
    if (!this.options.container) {
      console.log("Please provide a container");
      return;
    }
    this.$container = $(this.options.container);
    this.render();
    this.attachHandlers();
    this.handleInitialValues();
  }

  Check.prototype.render = function() {
    var baseWidth;
    this.$container.append(this.template(this.checkTemplate, $.extend({}, this.options.values)));
    $.each(this.options.checkSelectors, (function(_this) {
      return function(name, selector) {
        return _this["$" + name] = _this.$container.find(selector);
      };
    })(this));
    $.each(this.options.formSelectors, (function(_this) {
      return function(name, selector) {
        var obj;
        if (_this.options[name]) {
          obj = $(_this.options[name]);
        } else {
          obj = _this.$el.find(selector);
        }
        return _this["$" + name] = obj;
      };
    })(this));
    if (this.options.width) {
      baseWidth = parseInt(this.$checkContainer.css('width'));
      return this.$checkContainer.css("transform", "scale(" + (this.options.width / baseWidth) + ")");
    }
  };

  Check.prototype.attachHandlers = function() {
    this.$accountNumberInput.bindVal(this.$accountNumberDisplay, {
      fill: false,
      filters: this.accountNumberFilter
    }).on('keydown', this.handle('captureAccountNumber'));
    this.$routingNumberInput.bindVal(this.$routingNumberDisplay, {
      fill: false
    }).on('keydown', this.handle('captureRoutingNumber'));
    this.$bankNameInput.bindVal(this.$bankNameDisplay, {
      fill: false
    }).on('keydown', this.handle('captureName'));
    this.$orderInput.bindVal(this.$orderDisplay, {
      fill: false
    });
    return this.$nameInput.bindVal(this.$nameDisplay, {
      fill: false,
      join: ' '
    }).on('keydown', this.handle('captureName'));
  };

  Check.prototype.accountNumberFilter = function(val, $el) {
    var beg, end;
    if (val.length <= 10) {
      return val;
    }
    beg = val.substring(0, 3);
    end = val.substring(val.length - 4);
    return beg + '...' + end;
  };

  Check.prototype.handleInitialValues = function() {
    return $.each(this.options.formSelectors, (function(_this) {
      return function(name, selector) {
        var el;
        el = _this["$" + name];
        if (el.val()) {
          el.trigger('paste');
          return setTimeout(function() {
            return el.trigger('keyup');
          });
        }
      };
    })(this));
  };

  Check.prototype.handle = function(fn) {
    return (function(_this) {
      return function(e) {
        var $el, args;
        $el = $(e.currentTarget);
        args = Array.prototype.slice.call(arguments);
        args.unshift($el);
        return _this.handlers[fn].apply(_this, args);
      };
    })(this);
  };

  Check.prototype.handlers = {
    captureName: function($el, e) {
      var allowedSymbols, banKeyCodes, keyCode;
      keyCode = e.which || e.keyCode;
      banKeyCodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 106, 107, 109, 110, 111, 186, 187, 188, 189, 190, 191, 192, 219, 220, 221, 222];
      allowedSymbols = [189, 109, 190, 110, 222];
      if (banKeyCodes.indexOf(keyCode) !== -1 && !(!e.shiftKey && __indexOf.call(allowedSymbols, keyCode) >= 0)) {
        return e.preventDefault();
      }
    },
    captureAccountNumber: function($el, e) {
      var maxLength, val;
      val = $el.val();
      maxLength = 10;
      if (!this.isKeyAllowedForNumber(e)) {
        e.preventDefault();
      }
    },
    captureRoutingNumber: function($el, e) {
      var maxLength, val;
      val = $el.val();
      maxLength = 9;
      if (!this.isKeyAllowedForNumber(e)) {
        e.preventDefault();
        return;
      }
      if (val.length === maxLength && !this.isSpecialKey(e)) {
        return e.preventDefault();
      }
    }
  };

  Check.prototype.isKeyAllowedForNumber = function(e) {
    var allowedKeyCodes, keyCode;
    keyCode = e.which || e.keyCode;
    if (keyCode >= 48 && keyCode <= 57) {
      return true;
    }
    if (keyCode >= 96 && keyCode <= 105) {
      return true;
    }
    if (e.ctrlKey || e.metaKey) {
      return true;
    }
    allowedKeyCodes = [8, 9, 17, 35, 36, 37, 39, 46, 91, 92, 144, 145];
    if (allowedKeyCodes.indexOf(keyCode) !== -1) {
      return true;
    }
    return false;
  };

  Check.prototype.isSpecialKey = function(e) {
    var allowedKeyCodes, keyCode;
    keyCode = e.which || e.keyCode;
    allowedKeyCodes = [8, 9, 17, 35, 36, 37, 39, 46, 91, 92, 144, 145];
    if (allowedKeyCodes.indexOf(keyCode) !== -1) {
      return true;
    }
    return false;
  };

  $.fn.bindVal = function(out, opts) {
    var $el, i, joiner, o, outDefaults;
    if (opts == null) {
      opts = {};
    }
    opts.fill = opts.fill || false;
    opts.filters = opts.filters || [];
    if (!(opts.filters instanceof Array)) {
      opts.filters = [opts.filters];
    }
    opts.join = opts.join || "";
    if (!(typeof opts.join === "function")) {
      joiner = opts.join;
      opts.join = function() {
        return joiner;
      };
    }
    $el = $(this);
    outDefaults = (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = out.length; _i < _len; i = ++_i) {
        o = out[i];
        _results.push(out.eq(i).text());
      }
      return _results;
    })();
    $el.on('focus', function() {
      return out.addClass('focused');
    });
    $el.on('blur', function() {
      return out.removeClass('focused');
    });
    $el.on('keyup change paste', function(e) {
      var filter, join, outVal, val, _i, _j, _len, _len1, _ref, _results;
      val = $el.map(function() {
        return $(this).val();
      }).get();
      join = opts.join(val);
      val = val.join(join);
      if (val === join) {
        val = "";
      }
      _ref = opts.filters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        filter = _ref[_i];
        val = filter(val, $el, out);
      }
      _results = [];
      for (i = _j = 0, _len1 = out.length; _j < _len1; i = ++_j) {
        o = out[i];
        if (opts.fill) {
          outVal = val + outDefaults[i].substring(val.length);
        } else {
          outVal = val || outDefaults[i];
        }
        _results.push(out.eq(i).text(outVal));
      }
      return _results;
    });
    return $el;
  };

  return Check;

})();

$.fn.extend({
  check: function() {
    var args, option;
    option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.each(function() {
      var $this, data;
      $this = $(this);
      data = $this.data('check');
      if (!data) {
        $this.data('check', (data = new Check(this, option)));
      }
      if (typeof option === 'string') {
        return data[option].apply(data, args);
      }
    });
  }
});


},{}]},{},[1])
(1)
});