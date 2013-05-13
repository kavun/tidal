function Tidal() {
	this._cache = {};
	this._uid = -1;
}

/**
 * subscribe a function to an event
 *
 * @param {string} name - event namespace
 * @param {function} fn - callback
 * @param {object=} context - context to apply callback with (optional)
 * @returns {number} token
 *
 * @example
 *		`Tidal.subscribe('event.name', function (args) {});`
 *		`Tidal.subscribe('event-name', function (args) {}, {});`
 */
Tidal.prototype.subscribe = function (name, fn, context) {
	var cache = this._cache;
	if (!cache.hasOwnProperty(name))
		cache[name] = [];

	cache[name].push({
		fn: fn,
		ctx: context || this,
		uid: ++this._uid
	});

	return this._uid;
}

/**
 * publishes an event with argument(s)
 * can be called similar to both `Function.prototype.call` and `Function.prototype.apply` in that you can supply a single argument array, or a list of arguments
 * optimized to use `Function.prototype.call` when less than 4 arguments are passed in - inspired by http://backbonejs.org/docs/backbone.html#section-24
 * 
 * @param {string} name - event name
 * @param (...anything=) args (optional)
 * @returns {Tidal}
 * 
 * @example
 *		Tidal.publish('event.name', [1, 2, 'another argument']);
 *		Tidal.publish('event.name',  1, 2, 'another argument' );
 */
Tidal.prototype.publish = function (name) {
	var cache = this._cache;
	if (!cache.hasOwnProperty(name)) return;

	var handlers = cache[name];
	var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 1) : arguments[1] || [];
	var i = handlers.length;
	var numArgs = args.length;
	while (i--) {
		var handler = handlers[i];
		switch (numArgs) {
			case 0: handler.fn.call(handler.ctx); break;
			case 1: handler.fn.call(handler.ctx, args[0]); break;
			case 2: handler.fn.call(handler.ctx, args[0], args[1]); break;
			case 3: handler.fn.call(handler.ctx, args[0], args[1], args[2]); break;
			default: handler.fn.apply(handler.ctx, args); break;
		}
	}

	return this;
}

/**
 * Removes subscription(s) by handler (returned by `.subscribe()`), event name, context, or callback
 * 
 * @param {array|string|function|object} arg - handler (returned by `.subscribe()`), name, callback, or context
 * @returns {Tidal}
 * 
 * @example
 *		`Tidal.unsubscribe(['event.name', fn]);` - removes a single callback handler for a specific event
 *		`Tidal.unsubscribe('event.name');` - removes all subscriptions callbacks for a specific event
 *		`Tidal.unsubscribe(context);` - removes all subscriptions that are applied with a context of passed in object
 *			can be used to remove all callbacks globally if context was not supplied when calling `.subscribe()` by passing in an instance of `Tidal`
 *		`Tidal.unsubscribe(fn);` - removes all subscriptions for any event name whose callback is the passed in function
 */
Tidal.prototype.unsubscribe = function (arg) {
	var name, fn, handlers;
	var cache = this._cache;
	var isCallback = typeof arg === 'function';
	var isContext  = typeof arg === 'object';
	var isUid      = typeof arg === 'number';
	var isName     = typeof arg === 'string';
	var isHandle   = Object.prototype.toString.call(arg) === '[object Array]';
	if (isHandle) {
		name = arg[0], fn = arg[1];
		if (!cache.hasOwnProperty(name)) return;
		handlers = cache[name];
		for (var i = 0, l = handlers.length; i < l; i++) {
			if (handlers[i].fn === fn) {
				handlers.splice(i, 1);
			}
		}
	} else if (isName) {
		if (!cache.hasOwnProperty(arg)) return;
		cache[arg] = [];
	} else if (isCallback || isContext || isUid) {
		for (var _name in cache) {
			handlers = cache[_name];
			for (var i = 0, l = handlers.length; i < l; i++) {
				if ( (isCallback && handlers[i].fn  === arg) || 
					 (isContext  && handlers[i].ctx === arg) || 
					 (isUid      && handlers[i].uid === arg) ) {
					handlers.splice(i, 1);
				}
			}
		}
	}

	return this;
}