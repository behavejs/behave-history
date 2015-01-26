import BehaveHistory from '../../src/index';
import sinon from 'sinon';

describe('BehaveHistory', () => {

    beforeEach(() => {
        this.dispatcher = {
            register: sinon.spy(),
            dispatch: sinon.spy()
        };

        this.history = new BehaveHistory({
            dispatcher: this.dispatcher
        });
    });

    describe('.start()', () => {

        it('should be defined', (done) => {
            expect(this.history.start).toBeDefined();
            done();
        });

        it('should set the `_isStarted` flag to `true`', (done) => {
            this.history.start();
            expect(this.history._started).toEqual(true);
            done();
        });

        it('should add listener to window for hashchange/popstate events', (done) => {
            sinon.spy(window, 'addEventListener');
            this.history.start();
            var call = window.addEventListener.getCall(0);
            var args = call.args.slice();
            var evtType = (window.history.pushState) ? 'popstate' : 'hashchange';
            expect(args[0]).toEqual(evtType);

            window.addEventListener.restore();
            done();
        });
    });

    describe('.stop()', () => {

        it('should be defined', (done) => {
            expect(this.history.stop).toBeDefined();
            done();
        });

        it('should set the `_isStarted` flag to `false`', (done) => {
            this.history._started = true;
            this.history.stop();
            expect(this.history._started).toEqual(false);
            done();
        });

        it('should remove listener on window for hashchange/popstate events', (done) => {
            sinon.spy(window, 'removeEventListener');
            this.history.stop();
            var call = window.removeEventListener.getCall(0);
            var args = call.args.slice();
            var evtType = (window.history.pushState) ? 'popstate' : 'hashchange';
            expect(args[0]).toEqual(evtType);
            done();
        });
    });

    describe('._update(evt)', () => {

        beforeEach(() => {
            spyOn(this.history, '_pushState');
            spyOn(this.history, '_updateHash');
        });

        it('should be defined', (done) => {
            expect(this.history._update).toBeDefined();
            done();
        });

        it('should exit out if `evt.type` is not `this._eventType`', (done) => {
            var evt = {
                type: 'INCORRECT_TYPE',
                route: 'some/url',
                data: {test: 'data'},
                options: {}
            };

            this.history._update(evt);
            expect(this.history._pushState.calls.count()).toEqual(0);
            expect(this.history._updateHash.calls.count()).toEqual(0);
            done();
        });

        it('should exit out if `evt.route` matches result of `this._getFragment()`', (done) => {
            var evt = {
                type: 'ROUTE_CHANGE',
                route: 'some/url',
                data: {test: 'data'},
                options: {}
            };

            spyOn(this.history, '_getFragment').and.callFake(function() {
                return 'some/url';
            });

            this.history._update(evt);
            expect(this.history._pushState.calls.count()).toEqual(0);
            expect(this.history._updateHash.calls.count()).toEqual(0);

            done();
        });
    });

    describe('._pushState(data, route, replace)', () => {

        beforeEach(() => {
            spyOn(window.history, 'pushState');
        });

        it('should be defined', (done) => {
            expect(this.history._pushState).toBeDefined();
            done();
        });

        it('should update url to match specified route', (done) => {
            var evt = {
                type: 'ROUTE_CHANGE',
                route: 'some/url',
                data: {test: 'data'},
                options: {}
            };

            if (!window.history.pushState) done();

            this.history._update(evt);

            expect(window.history.pushState).toHaveBeenCalledWith(
                    evt.data,
                    document.title,
                    window.location.protocol +
                    '//' + window.location.host +
                    '/' + evt.route);

            window.history.pushState.calls.reset();

            done();
        });


        it('should send any data in event to window state if in supporting browsers', (done) => {
            var evt = {
                type: 'ROUTE_CHANGE',
                route: 'some/url',
                data: {test: 'data'},
                options: {}
            };

            if (!window.history.pushState) done();

            this.history._update(evt);

            expect(window.history.pushState).toHaveBeenCalledWith(
                    evt.data,
                    document.title,
                    window.location.protocol +
                    '//' + window.location.host +
                    '/' + evt.route);

            done();
        });

    });

    describe('._updateHash(route, replace)', () => {

        beforeEach(() => {
            this.history._wantsHashChange = true;
        });

        afterEach(() => {
            this.history._wantsHashChange = false;
        });

        it('should be defined', (done) => {
            expect(this.history._updateHash).toBeDefined();
            done();
        });

        it('should update url to match specified route', (done) => {
            var evt = {
                type: 'ROUTE_CHANGE',
                route: 'some/url',
                data: {test: 'data'},
                options: {}
            };

            this.history._location = { href: '', hash: '' };

            this.history._update(evt);

            expect(this.history._location.hash).toBe('#/' + evt.route);

            done();
        });
    });

    describe('._getFragment(fragment)', () => {

        it('should be defined', (done) => {
            expect(this.history._getFragment).toBeDefined();
            done();
        });

        it('should get url fragment if one is not provided in params', (done) => {
            spyOn(this.history, '_getPath').and.callFake(() => '/');
            this.history._isPushState = true;

            this.history._getFragment();
            expect(this.history._getPath).toHaveBeenCalled();

            done();
        });

        it('should clean up the fragment (remove whitespace and #\'s)', (done) => {
            expect(this.history._getFragment('#some/path   ')).toEqual('some/path');
            done();
        });
    });

    describe('._getHash()', () => {

        it('should be defined', (done) => {
            expect(this.history._getHash).toBeDefined();
            done();
        });

        it('should get url fragment', (done) => {

            this.history._location = { href: '/#/some/path' };
            expect(this.history._getHash()).toEqual('/some/path');

            done();
        });
    });

    describe('._getPath()', () => {

        beforeEach(() => {
            this.history._location = { pathname: '/some/path' };
            spyOn(this.history, '_getSearch').and.callFake(() => '');
        });

        it('should be defined', (done) => {
            expect(this.history._getPath).toBeDefined();
            done();
        });

        it('should get url fragment', (done) => {
            expect(this.history._getPath()).toEqual('some/path');
            done();
        });
    });

    describe('._getSearch()', () => {

        beforeEach(() => {
            this.history._location = { href: '/some/path?some=param' };
        });

        it('should be defined', (done) => {
            expect(this.history._getSearch).toBeDefined();
            done();
        });

        it('should get url fragment', (done) => {
            expect(this.history._getSearch()).toEqual('?some=param');
            done();
        });
    });

    describe('._handleHistoryEvent(e)', () => {

        beforeEach(() => {
            spyOn(this.history, '_getFragment').and.callFake(() => 'some/url');
        });

        it('should be defined', (done) => {
            expect(this.history._handleHistoryEvent).toBeDefined();
            done();
        });

        it('should call it\'s dispatcher\'s `dispatch` event, passing on any state if any',
                (done) => {

            var e = {
                type: 'popstate',
                state: { example: 'state' }
            };

            this.history._handleHistoryEvent(e);

            expect(this.history._dispatcher.dispatch.called).toBe(true);
            done();
        });
    });
});
