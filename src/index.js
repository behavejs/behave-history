const routeStripper = /^[#\/]|\s+$/g;

class BehaveHistory {
    constructor(options={}) {

        this._root = options.root || '/';
        this._location = window.location;
        this._history = window.history;
        this._wantsHashChange = options.hashChange || false;
        this._hasPushState = !!(this._history && this._history.pushState);
        this._eventType = options.eventType || 'ROUTE';
        this._started = false;

        this._baseUrl = this._location.protocol +
                '//' + this._location.host;

        if (!options.dispatcher) throw new Error('No dispatcher passed to history!');
        this._dispatcher = options.dispatcher;

        this._dispatcher.register('HistoryService', (evt) => {
            if (!evt.options) evt.options = {};
            if (this._started) this._update(evt);
        });
    }

    start() {
        var evt = (this._hasPushState) ? 'popstate' : 'hashchange';
        window.addEventListener(evt, (e) => this._handleHistoryEvent(e));
        this._started = true;
    }

    stop() {
        var evt = (this._hasPushState) ? 'popstate' : 'hashchange';
        window.removeEventListener(evt, (e) => this._handleHistoryEvent(e));
        this._started = false;
    }

    _update(evt) {
        if (evt.type !== this._eventType) return;
        if (evt.route === this._getFragment()) return;

        var url = this._baseUrl + this._root + evt.route;

        if (this._hasPushState && !this._wantsHashChange) {
            this._pushState(evt.data || {}, url, !!evt.options.replace);
        } else {
            this._updateHash(evt.route, !!evt.options.replace);
        }

        this._dispatcher.dispatch({
            type: 'ROUTE_CHANGE',
            route: evt.route,
            data: evt.data,
            options: evt.options
        });
    }

    _pushState(data, route, replace) {
        this._history[(replace) ? 'replaceState' : 'pushState'](data, document.title, route);
    }

    _updateHash(route, replace) {
        if (replace) {
            let href = this._location.href.replace(/(javascript:|#).*$/, '');
            this._location.replace(href + '#' + route);
        } else {
            // Some browsers require that `hash` contains a leading #.
            this._location.hash = '#/' + route;
        }
    }

    _getFragment(fragment) {
        if (!fragment) fragment = this[(this._hasPushState) ? '_getPath' : '_getHash']();
        return fragment.replace(routeStripper, '');
    }

    _getHash() {
        var match = this._location.href.match(/#(.*)$/);
        return match ? match[1] : '';
    }

    _getPath() {
        var path = decodeURI(this._location.pathname + this._getSearch());
        var root = this._root.slice(0, -1);
        if (!path.indexOf(root)) path = path.slice(root.length);
        return path.charAt(0) === '/' ? path.slice(1) : path;
    }

    _getSearch() {
        var match = this._location.href.replace(/#.*/, '').match(/\?.+/);
        return match ? match[0] : '';
    }

    _handleHistoryEvent(e) {
        var data = {};

        if (e.type === 'popstate' && e.state !== null) data = e.state;
        this._dispatcher.dispatch({
            type: this._eventType,
            route: this._getFragment(),
            data: data,
            options: { originalEvent: e }
        });
    }
}

export default BehaveHistory;
