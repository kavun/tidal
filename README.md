# Tidal
javascript pub/sub library

## Dependencies
none

## Usage

```js
var tidal = new Tidal();
```
Tidal is built so that you can create `new Tidal` instances each with their own event cache. Many other pub/sub libraries are implemented as singletons and thus only allow creation of instances by using some form of `Object.create` or `.extend()`.

1. **`Tidal.prototype.subscribe('name', fn, [context])`**
	```
	@param {string} name - event namespace
	@param {function} fn - callback
	@param {object=} context - context to apply callback with (optional)
	@returns {number} token
	```
	
	```js
	var tokenOne = tidal.subscribe('eventone', fn);
	var tokenTwo = tidal.subscribe('eventtwo', fn, context)
	```
	
	The context argument lessens the overhead of having to rely on other libraries to create proxy functions like `jQuery.proxy()` or `_.bind()`
2. **`Tidal.prototype.publish('name', ...)`**

	```
	@param {string} name - event name
 	@param (...anything=) args (optional)
 	@returns {Tidal}
	```
	
	`publish` will accept a list of arguments **or** an argument array
	
	```js
	tidal.publish('eventone', 1, 2, 3, 'arg');	// subscribers called with `Function.prototype.apply`
	tidal.publish('eventthree', [1, 2, 3]);		// subscribers called with `Function.prototype.call`
	```
	
	Optimized to use `Function.prototype.call` when less than 4 arguments are passed in. Inspired by [Backbone.js](http://backbonejs.org/docs/backbone.html#section-24)
3. **`Tidal.prototype.unsubscribe( token | ['name', fn] | 'eventname' | fn )`**
	Allows unsubscribing with:
	- **token** - *will unsubscribe a single subscription*
	
		```js
		tidal.unsubscribe(tokenOne);
		```
	- **handler** - *will unsubscribe any subscriptions with the passed in name and callback*
	
		```js
		var eventName = 'thebigevent';
		var callback = function () {};
		tidal.subscribe(eventName, callback);
		todal.unsubscribe([eventName, callback]);
		```
	- **event namespace** - *will unsubscribe any subscriptions for an event namespace*
		```js
		tidal.subscribe('test-event', functionOne);
		tidal.subscribe('test-event', functionTwo);
		tidal.unsubscribe('test-event');
		```
	- **callback** - *will unsubscribe any subscriptions for any event with a specified callback*
		```js
		tidal.subscribe('event-one', singleFunction);
		tidal.subscribe('event-two', singleFunction);
		tidal.unsubscribe(singleFunction);
		```
