"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var routeStripper = /^[#\/]|\s+$/g;

var BehaveHistory = (function () {
  function BehaveHistory() {
    var _this = this;
    var options = arguments[0] === undefined ? {} : arguments[0];


    this._root = options.root || "/";
    this._location = window.location;
    this._history = window.history;
    this._wantsHashChange = options.hashChange || false;
    this._hasPushState = !!(this._history && this._history.pushState);
    this._eventType = options.eventType || "ROUTE";
    this._started = false;

    this._baseUrl = this._location.protocol + "//" + this._location.host;

    if (!options.dispatcher) throw new Error("No dispatcher passed to history!");
    this._dispatcher = options.dispatcher;

    this._dispatcher.register("HistoryService", function (evt) {
      if (!evt.options) evt.options = {};
      if (_this._started) _this._update(evt);
    });
  }

  _prototypeProperties(BehaveHistory, null, {
    start: {
      value: function start() {
        var _this2 = this;
        var evt = this._hasPushState ? "popstate" : "hashchange";
        window.addEventListener(evt, function (e) {
          return _this2._handleHistoryEvent(e);
        });
        this._started = true;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    stop: {
      value: function stop() {
        var _this3 = this;
        var evt = this._hasPushState ? "popstate" : "hashchange";
        window.removeEventListener(evt, function (e) {
          return _this3._handleHistoryEvent(e);
        });
        this._started = false;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _update: {
      value: function Update(evt) {
        if (evt.type !== this._eventType) return;
        if (evt.route === this._getFragment()) return;

        var url = this._baseUrl + this._root + evt.route;

        if (this._hasPushState && !this._wantsHashChange) {
          this._pushState(evt.data || {}, url, !!evt.options.replace);
        } else {
          this._updateHash(evt.route, !!evt.options.replace);
        }

        this._dispatcher.dispatch({
          type: "ROUTE_CHANGE",
          route: evt.route,
          data: evt.data,
          options: evt.options
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _pushState: {
      value: function PushState(data, route, replace) {
        this._history[replace ? "replaceState" : "pushState"](data, document.title, route);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _updateHash: {
      value: function UpdateHash(route, replace) {
        if (replace) {
          var href = this._location.href.replace(/(javascript:|#).*$/, "");
          this._location.replace(href + "#" + route);
        } else {
          // Some browsers require that `hash` contains a leading #.
          this._location.hash = "#/" + route;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getFragment: {
      value: function GetFragment(fragment) {
        if (!fragment) fragment = this[this._hasPushState ? "_getPath" : "_getHash"]();
        return fragment.replace(routeStripper, "");
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getHash: {
      value: function GetHash() {
        var match = this._location.href.match(/#(.*)$/);
        return match ? match[1] : "";
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getPath: {
      value: function GetPath() {
        var path = decodeURI(this._location.pathname + this._getSearch());
        var root = this._root.slice(0, -1);
        if (!path.indexOf(root)) path = path.slice(root.length);
        return path.charAt(0) === "/" ? path.slice(1) : path;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getSearch: {
      value: function GetSearch() {
        var match = this._location.href.replace(/#.*/, "").match(/\?.+/);
        return match ? match[0] : "";
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _handleHistoryEvent: {
      value: function HandleHistoryEvent(e) {
        var data = {};

        if (e.type === "popstate" && e.state !== null) data = e.state;
        this._dispatcher.dispatch({
          type: this._eventType,
          route: this._getFragment(),
          data: data,
          options: { originalEvent: e }
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return BehaveHistory;
})();

module.exports = BehaveHistory;