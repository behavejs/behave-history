# behave-history
A better browser history manager

[ ![Codeship Status for behavejs/behave-history](https://codeship.com/projects/c4e33eb0-8268-0132-f7da-56a1ab730b01/status?branch=master)](https://codeship.com/projects/57870)

In most other frameworks, history management is directly tied to your routers. This violates the single responsibility rule and tightly couples two large components of the application together. Proper history management is now more important than ever, and having routers that you feel comfortable with is equally important. The only requirement to use `behave-history` is that you pass it a `dispatcher` on initialization. (Don't sweat, you don't have to be using the Flux/React style of architecture, there will be examples with other architectural patterns.)

___

### Installation

```shell
npm install --save behave-history
```

___

### Usage

```js
var dispatcher = require('behave-dispatcher'),
    BehaveHistory = require('behave-history');

/* in app initialization code */
var history = new BehaveHistory({
    // if app does not live at root of site update to app root
    root: '/',

    // pushState is default, use if you need to support IE8
    // URLs will have `#/` prefix
    hashChange: false,

    // event type to listen for to update history
    // also event type given to dispatcher when url changes from outside app
    eventType: 'ROUTE_CHANGE',

    // must have a `register` and a `dispatch` method
    // register method must take two params: 1) ID for callback, 2) callback
    // integrates directly with `behave-dispatcher`
    dispatcher: dispatcher
});

// you can start and stop history at any point
// history will ignore any dispatcher/window events unless started
history.start();

myApp.history = history;

/* NOTE: you must handle page load routing yourself */
myApp.on('start', () => {
    dispatcher.dispatch({
        type: 'ROUTE_CHANGE',
        route: window.location.pathname,
        data: {},
        options: {}
    });
});
```

History just dispatches an event on the passed in dispatcher, meaning you can initialize routers at any time during the application life-cycle.

This integrates seemlessly with any type of dispatcher or event system, you may need to do a thin layer of integration but this history module can be used in any application.


`behave-history` has a fantastic feature in modern browsers, any `evt.data` passed to a routing dispatch event will be set using `pushState`, meaning as users navigate backward and forward with the browser buttons, the dispatcher event fired will have a copy of that state at that moment in time. Allowing you to easily recreate previous states of your application. (`evt.data` will be an empty object if using `hashChange` or there is no data associated with current state).


___


### Testing

Simply run `npm install` and then `npm test`

___


### Release History

- 0.1.0 Initial Release
- 0.1.1 Updated readme and updated npm keywords
- 0.1.2 Added build badge
- 0.1.3 Moved away from same event for route and route change
- 0.1.4 Added new build

