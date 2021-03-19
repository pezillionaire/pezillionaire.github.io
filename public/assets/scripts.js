
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const windows = writable([
      {
        title: 'Pez HD',
        top: 0,
        left: 0,
        visible: true,
        moving: false,
      },
      {
        title: 'Garbage',
        top: 0,
        left: 0,
        visible: false,
        moving: false,
      },
    ]);

    const pezMenuItems = [
      {
        name: 'This Does Nothing… Yet!',
        type: 'action',
      },
    ];

    const ProjectsMenuItems = [
      {
        name: 'Resume',
        type: 'link',
        url: 'https://github.com/pezillionaire/resume',
      },
      {
        name: 'Gifl.ink',
        type: 'link',
        url: 'http://gifl.ink',
      },
      {
        name: 'Peak Design System',
        type: 'link',
        url: 'https://peak.wealth.bar',
      },
    ];

    const ThemesMenuItems = [
      {
        name: 'harmony',
        type: 'select',
        active: true,
        primary: '#0466c8',
        alt: '#e2e7ed',
      },
      {
        name: 'alpinglow',
        type: 'select',
        active: false,
        primary: '#480ca8',
        alt: '#ffc8dd',
      },
      {
        name: 'overcast',
        type: 'select',
        active: false,
        primary: '#222',
        alt: '#bfb8b9',
      },
      {
        name: 'creekside',
        type: 'select',
        active: false,
        primary: '#006d77',
        alt: '#edf6f9',
      },
    ];

    const menus = writable([
      {
        name: 'Pez',
        component: 'Menu',
        active: false,
        svg: '<svg viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'><path class=\'svg-fill-prime\' d=\'M4 60v-4h4v-4h4v-4h4v-8h-4v-4H8V24h4v-4H8v-4h4v-4h4V8h4V4h8v4h4V4h12v4h4v4h4v4h4v20h-4v4h-4v8h4v4h4v4h4v8h-4v-8h-4v-4H40v4H24v-4H12v4H8v8H4v-4zm36-10v-2h4v-8h4v-4h4V16h-4v-4h-4V8H32v4h-4V8h-8v4h-4v4h-4v4h4v4h-4v12h4v4h4v8h4v4h16v-2zm-16-6v-4h-4v-4h-4v-4h4v-4h-4v-4h4v-4h-4v-4h4v-4h4v4h-4v4h4v4h4v-4h4v4h8v-4h-4v-4h4v-4h4v4h4v4h-4v4h4v4h-4v4h4v4h-4v4h-4v8h-4V36h4v-4h-4v-4H24v4h-4v4h8v12h-4v-4zm0-18v-2h-4v4h4v-2zm20 0v-2h-4v4h4v-2zm0-8v-2h-4v4h4v-2zM16 62v-2h4v4h-4v-2zm28 0v-2h4v4h-4v-2z\'/></svg>',
        items: pezMenuItems,
      },
      {
        name: 'Stuff',
        component: 'Menu',
        active: false,
        items: ProjectsMenuItems,
      },
      {
        name: 'Theme',
        component: 'SelectMenu',
        active: false,
        items: ThemesMenuItems,
      },
    ]);

    const menusActive = writable(false);

    /* src/menu/ItemAction.svelte generated by Svelte v3.31.2 */
    const file = "src/menu/ItemAction.svelte";

    function create_fragment(ctx) {
    	let button;
    	let span0;
    	let t0_value = /*item*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = (/*isActive*/ ctx[1] ? "✓" : "") + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			add_location(span0, file, 29, 2, 507);
    			attr_dev(span1, "class", "menuitem icon");
    			add_location(span1, file, 30, 2, 534);
    			attr_dev(button, "type", "button");
    			add_location(button, file, 28, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span0);
    			append_dev(span0, t0);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			append_dev(span1, t2);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*toggle*/ ctx[2](/*item*/ ctx[0]))) /*toggle*/ ctx[2](/*item*/ ctx[0]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*item*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*isActive*/ 2 && t2_value !== (t2_value = (/*isActive*/ ctx[1] ? "✓" : "") + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemAction", slots, []);
    	const dispatch = createEventDispatcher();
    	let { index } = $$props;
    	let { item } = $$props;
    	let isActive = item.active;

    	function toggle(item) {
    		$$invalidate(1, isActive = !isActive);
    		item.active = !item.active;
    		const value = { item, index };
    		dispatch("action", value);
    	}

    	const writable_props = ["index", "item"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemAction> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		index,
    		item,
    		isActive,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    		if ("item" in $$props) $$invalidate(0, item = $$props.item);
    		if ("isActive" in $$props) $$invalidate(1, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*index*/ 8) ;

    		if ($$self.$$.dirty & /*item*/ 1) ;
    	};

    	return [item, isActive, toggle, index];
    }

    class ItemAction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { index: 3, item: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemAction",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[3] === undefined && !("index" in props)) {
    			console.warn("<ItemAction> was created without expected prop 'index'");
    		}

    		if (/*item*/ ctx[0] === undefined && !("item" in props)) {
    			console.warn("<ItemAction> was created without expected prop 'item'");
    		}
    	}

    	get index() {
    		throw new Error("<ItemAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ItemAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<ItemAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<ItemAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/menu/ItemLink.svelte generated by Svelte v3.31.2 */

    const file$1 = "src/menu/ItemLink.svelte";

    function create_fragment$1(ctx) {
    	let a;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			a = element("a");
    			span0 = element("span");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			span1 = element("span");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			add_location(span0, file$1, 11, 2, 126);
    			attr_dev(path, "class", "svg-fill-prime");
    			attr_dev(path, "d", "M0 7V0h8v4H6V2H2v10h4v-2h2v4H0V7zm10 3V8H4V6h6V2h2v2h2v2h2v2h-2v2h-2v2h-2v-2z");
    			add_location(path, file$1, 14, 6, 248);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			add_location(svg, file$1, 13, 4, 181);
    			attr_dev(span1, "class", "menuitem icon");
    			add_location(span1, file$1, 12, 2, 148);
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			add_location(a, file$1, 10, 0, 109);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, span0);
    			append_dev(span0, t0);
    			append_dev(a, t1);
    			append_dev(a, span1);
    			append_dev(span1, svg);
    			append_dev(svg, path);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*url*/ 2) {
    				attr_dev(a, "href", /*url*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemLink", slots, []);
    	let { name } = $$props;
    	let { type } = $$props;
    	let { url } = $$props;
    	const writable_props = ["name", "type", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({ name, type, url });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("url" in $$props) $$invalidate(1, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 4) ;

    		if ($$self.$$.dirty & /*name*/ 1) ;

    		if ($$self.$$.dirty & /*url*/ 2) ;
    	};

    	return [name, url, type];
    }

    class ItemLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0, type: 2, url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemLink",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<ItemLink> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console.warn("<ItemLink> was created without expected prop 'type'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console.warn("<ItemLink> was created without expected prop 'url'");
    		}
    	}

    	get name() {
    		throw new Error("<ItemLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ItemLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<ItemLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<ItemLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<ItemLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<ItemLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/menu/Menu.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/menu/Menu.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (46:4) {#if menu.svg}
    function create_if_block_4(ctx) {
    	let span;
    	let raw_value = /*menu*/ ctx[1].svg + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "menu-svgicon");
    			add_location(span, file$2, 46, 6, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(46:4) {#if menu.svg}",
    		ctx
    	});

    	return block;
    }

    // (51:4) {#if menu.name}
    function create_if_block_3(ctx) {
    	let span;
    	let t_value = /*menu*/ ctx[1].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", `menu-name ${/*menu*/ ctx[1].svg ? "hidden" : ""}`);
    			add_location(span, file$2, 51, 6, 1352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(51:4) {#if menu.name}",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#if expanded}
    function create_if_block(ctx) {
    	let ul;
    	let current;
    	let each_value = /*menu*/ ctx[1].items;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$2, 56, 4, 1469);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menu*/ 2) {
    				each_value = /*menu*/ ctx[1].items;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(56:2) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (64:10) {:else}
    function create_else_block(ctx) {
    	let action;
    	let current;

    	action = new ItemAction({
    			props: {
    				item: /*item*/ ctx[8],
    				index: /*index*/ ctx[10]
    			},
    			$$inline: true
    		});

    	action.$on("action", /*action_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(action.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(action, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(action.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(action.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(action, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(64:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (62:41) 
    function create_if_block_2(ctx) {
    	let link;
    	let current;
    	const link_spread_levels = [/*item*/ ctx[8]];
    	let link_props = {};

    	for (let i = 0; i < link_spread_levels.length; i += 1) {
    		link_props = assign(link_props, link_spread_levels[i]);
    	}

    	link = new ItemLink({ props: link_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = (dirty & /*menu*/ 2)
    			? get_spread_update(link_spread_levels, [get_spread_object(/*item*/ ctx[8])])
    			: {};

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(link, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(62:41) ",
    		ctx
    	});

    	return block;
    }

    // (60:10) {#if item.type === 'folder'}
    function create_if_block_1(ctx) {
    	let menu_1;
    	let current;
    	const menu_1_spread_levels = [/*item*/ ctx[8]];
    	let menu_1_props = {};

    	for (let i = 0; i < menu_1_spread_levels.length; i += 1) {
    		menu_1_props = assign(menu_1_props, menu_1_spread_levels[i]);
    	}

    	menu_1 = new Menu({ props: menu_1_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menu_1_changes = (dirty & /*menu*/ 2)
    			? get_spread_update(menu_1_spread_levels, [get_spread_object(/*item*/ ctx[8])])
    			: {};

    			menu_1.$set(menu_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(60:10) {#if item.type === 'folder'}",
    		ctx
    	});

    	return block;
    }

    // (58:6) {#each menu.items as item, index}
    function create_each_block(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[8].type === "folder") return 0;
    		if (/*item*/ ctx[8].type === "link") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, ":class", /*item*/ ctx[8].type);
    			add_location(li, file$2, 58, 8, 1522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(58:6) {#each menu.items as item, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let menu_1;
    	let button;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*menu*/ ctx[1].svg && create_if_block_4(ctx);
    	let if_block1 = /*menu*/ ctx[1].name && create_if_block_3(ctx);
    	let if_block2 = /*expanded*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			menu_1 = element("menu");
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			toggle_class(button, "active", /*expanded*/ ctx[0]);
    			add_location(button, file$2, 44, 2, 1137);
    			add_location(menu_1, file$2, 43, 0, 1128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, menu_1, anchor);
    			append_dev(menu_1, button);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			if (if_block1) if_block1.m(button, null);
    			append_dev(menu_1, t1);
    			if (if_block2) if_block2.m(menu_1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*menuToggle*/ ctx[2], false, false, false),
    					listen_dev(button, "mouseenter", /*menuCheckActive*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*menu*/ ctx[1].svg) if_block0.p(ctx, dirty);
    			if (/*menu*/ ctx[1].name) if_block1.p(ctx, dirty);

    			if (dirty & /*expanded*/ 1) {
    				toggle_class(button, "active", /*expanded*/ ctx[0]);
    			}

    			if (/*expanded*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*expanded*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(menu_1, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(menu_1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $menus;
    	let $menusActive;
    	validate_store(menus, "menus");
    	component_subscribe($$self, menus, $$value => $$invalidate(6, $menus = $$value));
    	validate_store(menusActive, "menusActive");
    	component_subscribe($$self, menusActive, $$value => $$invalidate(7, $menusActive = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	let { menuIndex } = $$props;
    	const menu = $menus[menuIndex];
    	let expanded = false;

    	// - keep an eye on the menu activity
    	// - menuIndex seems to break recursion (should rely on index maybe?)
    	menus.subscribe(value => {
    		$$invalidate(0, expanded = value[menuIndex].active);
    	});

    	// - toggle menu open/closed
    	// - if value is set to boolean use that - otherwise filp the value
    	const menuToggle = value => {
    		value === false || value === true
    		? $$invalidate(0, expanded = value)
    		: $$invalidate(0, expanded = !expanded);

    		set_store_value(menus, $menus[menuIndex].active = expanded, $menus);
    		set_store_value(menusActive, $menusActive = expanded, $menusActive);

    		$menus.forEach((m, i) => {
    			if (i !== menuIndex) {
    				m.active = false;
    			}
    		});

    		menus.set($menus);
    	};

    	// - when mouseing on, check to see if this is active/expanded
    	const menuCheckActive = () => {
    		if ($menusActive & !expanded) {
    			menuToggle();
    		}
    	};

    	const writable_props = ["menuIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function action_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("menuIndex" in $$props) $$invalidate(4, menuIndex = $$props.menuIndex);
    	};

    	$$self.$capture_state = () => ({
    		menus,
    		menusActive,
    		Action: ItemAction,
    		Link: ItemLink,
    		menuIndex,
    		menu,
    		expanded,
    		menuToggle,
    		menuCheckActive,
    		$menus,
    		$menusActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("menuIndex" in $$props) $$invalidate(4, menuIndex = $$props.menuIndex);
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*menuIndex*/ 16) ;
    	};

    	return [expanded, menu, menuToggle, menuCheckActive, menuIndex, action_handler];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { menuIndex: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*menuIndex*/ ctx[4] === undefined && !("menuIndex" in props)) {
    			console.warn("<Menu> was created without expected prop 'menuIndex'");
    		}
    	}

    	get menuIndex() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuIndex(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/menu/SelectMenu.svelte generated by Svelte v3.31.2 */
    const file$3 = "src/menu/SelectMenu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i].name;
    	child_ctx[13] = list[i].active;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (100:2) {#if expanded}
    function create_if_block$1(ctx) {
    	let ul;
    	let each_value = /*items*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "role", "menu");
    			add_location(ul, file$3, 100, 4, 2750);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*itemSelect, items*/ 33) {
    				each_value = /*items*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(100:2) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (107:14) {#if active}
    function create_if_block_1$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M4 13v-1H2v-2H0V6h2v2h2v2h2V8h2V6h2V4h2V2h2V0h2v4h-2v2h-2v2h-2v2H8v2H6v2H4z");
    			add_location(path, file$3, 108, 16, 3137);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			attr_dev(svg, "shape-rendering", "crispEdges");
    			attr_dev(svg, "class", "svg-fill");
    			add_location(svg, file$3, 107, 14, 3014);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(107:14) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (102:6) {#each items as { name, active }
    function create_each_block$1(ctx) {
    	let li;
    	let button;
    	let span0;
    	let t0_value = /*name*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*active*/ ctx[13] && create_if_block_1$1(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*index*/ ctx[15]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			if (if_block) if_block.c();
    			t2 = space();
    			add_location(span0, file$3, 104, 12, 2912);
    			attr_dev(span1, "class", "menuitem icon");
    			add_location(span1, file$3, 105, 12, 2944);
    			attr_dev(button, "type", "button");
    			add_location(button, file$3, 103, 10, 2837);
    			add_location(li, file$3, 102, 8, 2822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, span0);
    			append_dev(span0, t0);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			if (if_block) if_block.m(span1, null);
    			append_dev(li, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, { once: true }, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*name*/ ctx[12] + "")) set_data_dev(t0, t0_value);

    			if (/*active*/ ctx[13]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(102:6) {#each items as { name, active }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let menu_1;
    	let button;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*expanded*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			menu_1 = element("menu");
    			button = element("button");
    			button.textContent = `${/*menu*/ ctx[2].name}`;
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "type", "button");
    			toggle_class(button, "active", /*expanded*/ ctx[1]);
    			add_location(button, file$3, 96, 2, 2600);
    			add_location(menu_1, file$3, 95, 0, 2591);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, menu_1, anchor);
    			append_dev(menu_1, button);
    			append_dev(menu_1, t1);
    			if (if_block) if_block.m(menu_1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*menuToggle*/ ctx[3], false, false, false),
    					listen_dev(button, "mouseenter", /*menuCheckActive*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*expanded*/ 2) {
    				toggle_class(button, "active", /*expanded*/ ctx[1]);
    			}

    			if (/*expanded*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(menu_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(menu_1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $menus;
    	let $menusActive;
    	validate_store(menus, "menus");
    	component_subscribe($$self, menus, $$value => $$invalidate(8, $menus = $$value));
    	validate_store(menusActive, "menusActive");
    	component_subscribe($$self, menusActive, $$value => $$invalidate(9, $menusActive = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SelectMenu", slots, []);
    	let { menuIndex } = $$props;
    	const menu = $menus[menuIndex];
    	const items = $menus[menuIndex].items;
    	let expanded = false;

    	// - keep an eye on the menu activity
    	menus.subscribe(value => {
    		$$invalidate(1, expanded = value[menuIndex].active);
    	});

    	// --------------------------------------------------
    	// -- Theme Selection wizardry
    	// --------------------------------------------------
    	const setTheme = index => {
    		// clear out active menu item
    		items.forEach(i => {
    			i.active = false;
    		});

    		// not really theming but I still wanna set the menu selection JIC (onload)
    		$$invalidate(0, items[index].active = true, items);

    		localStorage.clear();
    		localStorage.setItem("theme", JSON.stringify(items[index]));
    		const root = document.querySelector(":root");
    		root.style.setProperty("--primary", items[index].primary);
    		root.style.setProperty("--alt", items[index].alt);
    	};

    	// -- check local for a set theme or set the first one
    	const getTheme = () => {
    		if (localStorage.getItem("theme") == "") {
    			// set to default
    			return 0;
    		} else {
    			const theme = JSON.parse(localStorage.getItem("theme"));
    			const themeByName = i => i.name === theme.name;
    			setTheme(items.findIndex(themeByName));
    		}
    	};

    	// --------------------------------------------------
    	// -- Menu functionality
    	// --------------------------------------------------
    	// - toggle menu open/closed
    	// - if value is set to boolean use that - otherwise filp the value
    	const menuToggle = value => {
    		value === false || value === true
    		? $$invalidate(1, expanded = value)
    		: $$invalidate(1, expanded = !expanded);

    		set_store_value(menus, $menus[menuIndex].active = expanded, $menus);
    		set_store_value(menusActive, $menusActive = expanded, $menusActive);

    		$menus.forEach((m, i) => {
    			if (i !== menuIndex) {
    				m.active = false;
    			}
    		});

    		menus.set($menus);
    	};

    	// - when mouseing on, check to see if this is active/expanded
    	const menuCheckActive = () => {
    		if ($menusActive & !expanded) {
    			menuToggle();
    		}
    	};

    	// - change active menu selection
    	const itemSelect = index => {
    		$$invalidate(0, items[index].active = true, items);

    		// ideally the actions would be passed in
    		setTheme(index);

    		// TODO: replace w/ CSS transitions
    		setTimeout(
    			() => {
    				menuToggle(false);
    			},
    			200
    		);
    	};

    	// - set the theme on load
    	onMount(async () => {
    		getTheme();
    	});

    	const writable_props = ["menuIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SelectMenu> was created with unknown prop '${key}'`);
    	});

    	const click_handler = index => itemSelect(index);

    	$$self.$$set = $$props => {
    		if ("menuIndex" in $$props) $$invalidate(6, menuIndex = $$props.menuIndex);
    	};

    	$$self.$capture_state = () => ({
    		menus,
    		menusActive,
    		onMount,
    		menuIndex,
    		menu,
    		items,
    		expanded,
    		setTheme,
    		getTheme,
    		menuToggle,
    		menuCheckActive,
    		itemSelect,
    		$menus,
    		$menusActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("menuIndex" in $$props) $$invalidate(6, menuIndex = $$props.menuIndex);
    		if ("expanded" in $$props) $$invalidate(1, expanded = $$props.expanded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*menuIndex*/ 64) ;
    	};

    	return [
    		items,
    		expanded,
    		menu,
    		menuToggle,
    		menuCheckActive,
    		itemSelect,
    		menuIndex,
    		click_handler
    	];
    }

    class SelectMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { menuIndex: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMenu",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*menuIndex*/ ctx[6] === undefined && !("menuIndex" in props)) {
    			console.warn("<SelectMenu> was created without expected prop 'menuIndex'");
    		}
    	}

    	get menuIndex() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuIndex(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Nav.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/Nav.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (21:2) {#each $menus as menu, index}
    function create_each_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*comps*/ ctx[2][/*menu*/ ctx[4].component];

    	function switch_props(ctx) {
    		return {
    			props: { menuIndex: /*index*/ ctx[6] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*comps*/ ctx[2][/*menu*/ ctx[4].component])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(21:2) {#each $menus as menu, index}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if $menusActive}
    function create_if_block$2(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "click-capture");
    			add_location(div, file$4, 25, 2, 522);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*menusClose*/ ctx[3], { once: true }, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:0) {#if $menusActive}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let nav;
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*$menus*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*$menusActive*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(nav, "role", "navigation");
    			add_location(nav, file$4, 19, 0, 357);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*comps, $menus*/ 6) {
    				each_value = /*$menus*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(nav, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*$menusActive*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $menusActive;
    	let $menus;
    	validate_store(menusActive, "menusActive");
    	component_subscribe($$self, menusActive, $$value => $$invalidate(0, $menusActive = $$value));
    	validate_store(menus, "menus");
    	component_subscribe($$self, menus, $$value => $$invalidate(1, $menus = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	const comps = { SelectMenu, Menu };

    	const menusClose = () => {
    		set_store_value(menusActive, $menusActive = false, $menusActive);

    		$menus.forEach(m => {
    			m.active = false;
    		});

    		menus.set($menus);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		menus,
    		menusActive,
    		Menu,
    		SelectMenu,
    		comps,
    		menusClose,
    		$menusActive,
    		$menus
    	});

    	return [$menusActive, $menus, comps, menusClose];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Clock.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/Clock.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let time;
    	let t0;
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			time = element("time");
    			t0 = text(/*hours*/ ctx[3]);
    			t1 = text(/*tick*/ ctx[1]);
    			t2 = text(/*minutes*/ ctx[2]);
    			t3 = text(/*meridiem*/ ctx[4]);
    			attr_dev(time, "datetime", /*date*/ ctx[0]);
    			add_location(time, file$5, 1, 2, 19);
    			attr_dev(div, "id", "clock");
    			add_location(div, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, time);
    			append_dev(time, t0);
    			append_dev(time, t1);
    			append_dev(time, t2);
    			append_dev(time, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hours*/ 8) set_data_dev(t0, /*hours*/ ctx[3]);
    			if (dirty & /*tick*/ 2) set_data_dev(t1, /*tick*/ ctx[1]);
    			if (dirty & /*minutes*/ 4) set_data_dev(t2, /*minutes*/ ctx[2]);
    			if (dirty & /*meridiem*/ 16) set_data_dev(t3, /*meridiem*/ ctx[4]);

    			if (dirty & /*date*/ 1) {
    				attr_dev(time, "datetime", /*date*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let minutes;
    	let hours;
    	let meridiem;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clock", slots, []);
    	let date = new Date();
    	let tick = ":";

    	onMount(() => {
    		setInterval(
    			() => {
    				$$invalidate(0, date = new Date());
    				$$invalidate(1, tick = tick == ":" ? " " : ":");
    			},
    			1000
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clock> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		date,
    		tick,
    		minutes,
    		hours,
    		meridiem
    	});

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    		if ("tick" in $$props) $$invalidate(1, tick = $$props.tick);
    		if ("minutes" in $$props) $$invalidate(2, minutes = $$props.minutes);
    		if ("hours" in $$props) $$invalidate(3, hours = $$props.hours);
    		if ("meridiem" in $$props) $$invalidate(4, meridiem = $$props.meridiem);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*date*/ 1) {
    			 $$invalidate(2, minutes = ("0" + date.getMinutes()).slice(-2));
    		}

    		if ($$self.$$.dirty & /*date*/ 1) {
    			 $$invalidate(3, hours = date.getHours() <= 12
    			? date.getHours()
    			: date.getHours() - 12);
    		}

    		if ($$self.$$.dirty & /*date*/ 1) {
    			 $$invalidate(4, meridiem = date.getHours() < 12 ? " AM" : " PM");
    		}
    	};

    	return [date, tick, minutes, hours, meridiem];
    }

    class Clock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clock",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/windows/pezHD.svelte generated by Svelte v3.31.2 */

    const file$6 = "src/windows/pezHD.svelte";

    function create_fragment$6(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t6;
    	let a;
    	let t8;
    	let t9;
    	let p3;
    	let t11;
    	let h4;
    	let t13;
    	let p4;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Pezillionaire Interactive Manufacturing Concern";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Welcome,";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "This is a website on internet. It is my space to explore coding concepts, play with interaction ideas, and create user experiences.";
    			t5 = space();
    			p2 = element("p");
    			t6 = text("It will be updated randomly. The source can be found ");
    			a = element("a");
    			a.textContent = "here";
    			t8 = text(". Sometimes this site will be up to date – sometimes it will not — this is ok.");
    			t9 = space();
    			p3 = element("p");
    			p3.textContent = "This is project an ongoing concern… if you have concerns send me a message.";
    			t11 = space();
    			h4 = element("h4");
    			h4.textContent = "— Andrew [Pez] Pengelly";
    			t13 = space();
    			p4 = element("p");
    			p4.textContent = "P.S. Garbage links are in the garbage.";
    			add_location(h1, file$6, 18, 0, 307);
    			add_location(p0, file$6, 19, 0, 364);
    			add_location(p1, file$6, 20, 0, 380);
    			attr_dev(a, "href", "https://github.com/pezillionaire/pezillionaire.github.io");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$6, 21, 56, 575);
    			add_location(p2, file$6, 21, 0, 519);
    			add_location(p3, file$6, 22, 0, 749);
    			add_location(h4, file$6, 23, 0, 832);
    			add_location(p4, file$6, 24, 0, 865);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t6);
    			append_dev(p2, a);
    			append_dev(p2, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, p3, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, p4, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(p4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PezHD", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PezHD> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PezHD extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PezHD",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/windows/Gabage.svelte generated by Svelte v3.31.2 */

    const file$7 = "src/windows/Gabage.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let a0;
    	let svg0;
    	let path0;
    	let path1;
    	let t0;
    	let span0;
    	let t2;
    	let a1;
    	let svg1;
    	let path2;
    	let path3;
    	let t3;
    	let span1;
    	let t5;
    	let a2;
    	let svg2;
    	let path4;
    	let path5;
    	let t6;
    	let span2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t0 = space();
    			span0 = element("span");
    			span0.textContent = "Void";
    			t2 = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "Codes";
    			t5 = space();
    			a2 = element("a");
    			svg2 = svg_element("svg");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t6 = space();
    			span2 = element("span");
    			span2.textContent = "Games";
    			attr_dev(path0, "class", "svg-prime");
    			attr_dev(path0, "d", "M2 .4h28m-29 1h30m-31 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h7m1 0h10m4 0h4m1 0h5m-32 1h7m2 0h8m6 0h1m2 0h6m-32 1h7m3 0h6m12 0h4m-32 1h7m5 0h4m10 0h6m-32 1h7m8 0h1m9 0h7m-32 1h8m17 0h7m-32 1h9m16 0h7m-32 1h8m17 0h7m-32 1h9m15 0h8m-32 1h10m14 0h8m-32 1h9m14 0h9m-32 1h10m13 0h9m-32 1h11m11 0h10m-32 1h12m9 0h11m-32 1h11m9 0h12m-32 1h8m10 0h14m-32 1h10m6 0h16m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-32 1h32m-31 1h30m-29 1h28");
    			add_location(path0, file$7, 21, 6, 477);
    			attr_dev(path1, "class", "svg-alt");
    			attr_dev(path1, "d", "M7 8.4h1m10 0h4m4 0h1m-20 1h2m8 0h6m1 0h2m-19 1h3m6 0h12m-21 1h5m4 0h10m-19 1h8m1 0h9m-17 1h17m-16 1h16m-17 1h17m-16 1h15m-14 1h14m-15 1h14m-13 1h13m-12 1h11m-10 1h9m-10 1h9m-12 1h10m-8 1h6");
    			add_location(path1, file$7, 22, 6, 952);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 32 32");
    			add_location(svg0, file$7, 20, 4, 410);
    			add_location(span0, file$7, 24, 4, 1186);
    			attr_dev(a0, "href", "https://twitter.com/pezillionaire");
    			attr_dev(a0, "class", "icon");
    			attr_dev(a0, "target", "blank");
    			add_location(a0, file$7, 18, 2, 330);
    			attr_dev(path2, "class", "svg-prime");
    			attr_dev(path2, "d", "M12 .444h8m-11 1h14m-16 1h18m-19 1h20m-21 1h22m-23 1h24m-25 1h4m1 0h16m1 0h4m-27 1h5m3 0h12m3 0h5m-28 1h5m18 0h5m-29 1h6m18 0h6m-30 1h6m18 0h6m-30 1h6m18 0h6m-31 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h7m18 0h7m-31 1h7m16 0h7m-30 1h8m14 0h8m-30 1h4m1 0h5m10 0h10m-29 1h3m2 0h6m6 0h11m-27 1h3m2 0h5m6 0h10m-26 1h4m12 0h10m-25 1h4m11 0h9m-23 1h8m6 0h8m-21 1h7m6 0h7m-18 1h5m6 0h5m-14 1h3m6 0h3m-10 1h1m6 0h1");
    			add_location(path2, file$7, 28, 6, 1358);
    			attr_dev(path3, "class", "svg-alt");
    			attr_dev(path3, "d", "M7 6.444h1m16 0h1m-18 1h3m12 0h3m-18 1h18m-18 1h18m-18 1h18m-18 1h18m-19 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-19 1h18m-17 1h16m-15 1h14m-18 1h1m5 0h10m-16 1h2m6 0h6m-13 1h2m5 0h6m-12 1h12m-11 1h11m-6 1h6m-6 1h6m-6 1h6m-6 1h6m-6 1h6");
    			add_location(path3, file$7, 29, 6, 1868);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 32 32");
    			add_location(svg1, file$7, 27, 4, 1291);
    			add_location(span1, file$7, 31, 4, 2167);
    			attr_dev(a1, "href", "https://github.com/pezillionaire");
    			attr_dev(a1, "class", "icon");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$7, 26, 2, 1213);
    			attr_dev(path4, "class", "svg-prime");
    			attr_dev(path4, "d", "M3 .533h29m-29 1h29m-30 1h30m-30 1h4m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m22 0h4m-31 1h5m21 0h4m-30 1h5m20 0h4m-29 1h5m19 0h4m-28 1h11m4 0h12m-27 1h11m3 0h12m-26 1h11m2 0h12m-25 1h11m1 0h12m-24 1h23m-15 1h8m-8 1h6m-6 1h6m-6 1h5");
    			add_location(path4, file$7, 35, 6, 2337);
    			attr_dev(path5, "class", "svg-alt");
    			attr_dev(path5, "d", "M6 3.533h23m-23 1h23m-23 1h23m-23 1h23m-23 1h23m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h23m-23 1h23m-23 1h22m-22 1h21m-21 1h20m-20 1h19m-13 1h4m-4 1h3m-3 1h2m-2 1h1");
    			add_location(path5, file$7, 36, 6, 2904);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 32 32");
    			add_location(svg2, file$7, 34, 4, 2270);
    			add_location(span2, file$7, 38, 4, 3259);
    			attr_dev(a2, "href", "https://twitch.tv/pezillionaire");
    			attr_dev(a2, "class", "icon");
    			attr_dev(a2, "target", "blank");
    			add_location(a2, file$7, 33, 2, 2195);
    			attr_dev(div, "class", "socials");
    			add_location(div, file$7, 17, 0, 306);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(a0, t0);
    			append_dev(a0, span0);
    			append_dev(div, t2);
    			append_dev(div, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path2);
    			append_dev(svg1, path3);
    			append_dev(a1, t3);
    			append_dev(a1, span1);
    			append_dev(div, t5);
    			append_dev(div, a2);
    			append_dev(a2, svg2);
    			append_dev(svg2, path4);
    			append_dev(svg2, path5);
    			append_dev(a2, t6);
    			append_dev(a2, span2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Gabage", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Gabage> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Gabage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gabage",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Window.svelte generated by Svelte v3.31.2 */

    const { window: window_1 } = globals;
    const file$8 = "src/Window.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let header;
    	let button;
    	let t1;
    	let div0;
    	let h2;
    	let t2_value = /*window*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let section;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = /*components*/ ctx[1][/*window*/ ctx[0].title];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			button = element("button");
    			button.textContent = "close window";
    			t1 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			section = element("section");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "window-close");
    			add_location(button, file$8, 86, 4, 2120);
    			add_location(h2, file$8, 88, 6, 2239);
    			attr_dev(div0, "class", "window-title");
    			add_location(div0, file$8, 87, 4, 2206);
    			attr_dev(header, "class", "window-header");
    			add_location(header, file$8, 85, 2, 2064);
    			attr_dev(section, "class", "window-main");
    			add_location(section, file$8, 91, 2, 2288);
    			attr_dev(div1, "class", "window");
    			set_style(div1, "left", /*window*/ ctx[0].left + "px");
    			set_style(div1, "top", /*window*/ ctx[0].top + "px");
    			add_location(div1, file$8, 84, 0, 1990);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, button);
    			append_dev(header, t1);
    			append_dev(header, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t2);
    			append_dev(div1, t3);
    			append_dev(div1, section);

    			if (switch_instance) {
    				mount_component(switch_instance, section, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*handle_keydown*/ ctx[6], false, false, false),
    					listen_dev(window_1, "mouseup", /*stop*/ ctx[4], false, false, false),
    					listen_dev(window_1, "mousemove", /*move*/ ctx[5], false, false, false),
    					listen_dev(button, "click", /*close*/ ctx[2], false, false, false),
    					listen_dev(header, "mousedown", /*start*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*window*/ 1) && t2_value !== (t2_value = /*window*/ ctx[0].title + "")) set_data_dev(t2, t2_value);

    			if (switch_value !== (switch_value = /*components*/ ctx[1][/*window*/ ctx[0].title])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, section, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty & /*window*/ 1) {
    				set_style(div1, "left", /*window*/ ctx[0].left + "px");
    			}

    			if (!current || dirty & /*window*/ 1) {
    				set_style(div1, "top", /*window*/ ctx[0].top + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, []);
    	let { window = {} } = $$props;
    	let { index = 0 } = $$props;
    	const components = {};
    	components["Pez HD"] = PezHD;
    	components["Garbage"] = Gabage;
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	const app = document.getElementById("app");

    	function start() {
    		$$invalidate(0, window.moving = true, window);

    		// remove text selection when dragging windows
    		app.style.userSelect = "none";
    	}

    	function stop() {
    		$$invalidate(0, window.moving = false, window);

    		// reset default text select on release
    		app.removeAttribute("style");

    		if (window.left <= 0) {
    			$$invalidate(0, window.left = 0, window);
    		}

    		if (window.top <= 0) {
    			$$invalidate(0, window.top = 0, window);
    		}
    	}

    	function move(e) {
    		if (window.moving) {
    			$$invalidate(0, window.left += e.movementX, window);
    			$$invalidate(0, window.top += e.movementY, window);
    		}
    	}

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}
    	}; // if (e.key === 'Tab') {
    	//   // trap focus
    	//   const nodes = modal.querySelectorAll('*');
    	//   const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

    	//   let index = tabbable.indexOf(document.activeElement);
    	//   if (index === -1 && e.shiftKey) index = 0;
    	//   index += tabbable.length + (e.shiftKey ? -1 : 1);
    	//   index %= tabbable.length;
    	//   tabbable[index].focus();
    	//   e.preventDefault();
    	// }
    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	onMount(async () => {
    		// getTheme();
    		$$invalidate(0, window.left = 16, window);

    		$$invalidate(0, window.top = 16, window);
    	});

    	const writable_props = ["window", "index"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("window" in $$props) $$invalidate(0, window = $$props.window);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		onDestroy,
    		PezHD,
    		Garbage: Gabage,
    		window,
    		index,
    		components,
    		dispatch,
    		close,
    		app,
    		start,
    		stop,
    		move,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ("window" in $$props) $$invalidate(0, window = $$props.window);
    		if ("index" in $$props) $$invalidate(7, index = $$props.index);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*window*/ 1) ;

    		if ($$self.$$.dirty & /*index*/ 128) ;
    	};

    	return [window, components, close, start, stop, move, handle_keydown, index];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { window: 0, index: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get window() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set window(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$9 = "src/App.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (39:6) {#if window.visible}
    function create_if_block$3(ctx) {
    	let window;
    	let current;

    	function close_handler() {
    		return /*close_handler*/ ctx[4](/*index*/ ctx[9]);
    	}

    	window = new Window({
    			props: {
    				window: /*window*/ ctx[7],
    				index: /*index*/ ctx[9]
    			},
    			$$inline: true
    		});

    	window.$on("close", close_handler);

    	const block = {
    		c: function create() {
    			create_component(window.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(window, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const window_changes = {};
    			if (dirty & /*$windows*/ 1) window_changes.window = /*window*/ ctx[7];
    			window.$set(window_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(window, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(39:6) {#if window.visible}",
    		ctx
    	});

    	return block;
    }

    // (38:4) {#each $windows as window, index}
    function create_each_block$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*window*/ ctx[7].visible && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*window*/ ctx[7].visible) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$windows*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(38:4) {#each $windows as window, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let nav;
    	let t0;
    	let clock;
    	let t1;
    	let main;
    	let section0;
    	let t2;
    	let section1;
    	let button0;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let t3;
    	let span0;
    	let t5;
    	let button1;
    	let svg1;
    	let path4;
    	let path5;
    	let t6;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	nav = new Nav({ $$inline: true });
    	nav.$on("action", /*action_handler*/ ctx[3]);
    	clock = new Clock({ $$inline: true });
    	let each_value = /*$windows*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			create_component(clock.$$.fragment);
    			t1 = space();
    			main = element("main");
    			section0 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			section1 = element("section");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			t3 = space();
    			span0 = element("span");
    			span0.textContent = "Pez HD";
    			t5 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t6 = space();
    			span1 = element("span");
    			span1.textContent = "Garbage";
    			attr_dev(header, "role", "banner");
    			add_location(header, file$9, 31, 0, 686);
    			attr_dev(section0, "class", "window-layer");
    			add_location(section0, file$9, 36, 2, 804);
    			attr_dev(path0, "class", "svg-prime-fill");
    			attr_dev(path0, "d", "M6 60v-4H4V4h2V2h52v2h2v52h-2v8H6z");
    			add_location(path0, file$9, 47, 8, 1286);
    			attr_dev(path1, "class", "svg-alt-fill");
    			attr_dev(path1, "d", "M10 33V4H6v52h2v6h2V33zm10 27v-2h-8v4h8v-2zm36-1v-3h2V4h-4v40h-2V4H26v40h-2V4h-2v58h34v-3zm-36-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-5V4h-8v4h8V6z");
    			add_location(path1, file$9, 48, 8, 1365);
    			attr_dev(path2, "class", "svg-prime-fill");
    			attr_dev(path2, "d", "M38 57v-1h-2v-2h2v2h2v-2h2v2h-2v2h-2v-1zM26 45v-1h26v2H26v-1zm8-6v-1h-2v-2h-2v-4h4v2h2v2h6v-2h2v-2h4v4h-2v2h-2v2H34v-1zm-2-14v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1zm10 0v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1z");
    			add_location(path2, file$9, 49, 8, 1732);
    			attr_dev(path3, "class", "svg-alt-fill");
    			attr_dev(path3, "d", "M34 16v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1zm10 5v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1z");
    			add_location(path3, file$9, 50, 8, 1975);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 64 64");
    			add_location(svg0, file$9, 46, 6, 1217);
    			add_location(span0, file$9, 52, 6, 2104);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "icon mac");
    			toggle_class(button0, "open", /*openWindowByName*/ ctx[2]("PezHD"));
    			add_location(button0, file$9, 45, 4, 1085);
    			attr_dev(path4, "class", "svg-alt-fill");
    			attr_dev(path4, "d", "M14 64v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2z");
    			add_location(path4, file$9, 56, 8, 2347);
    			attr_dev(path5, "class", "svg-prime-fill");
    			attr_dev(path5, "d", "M32 64H14v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2H32zm-.002-2h18V10h-36v52h18zM19 58h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zM32 8h20V6H12v2h20zm0-4h6V2H26v2h6z");
    			add_location(path5, file$9, 57, 8, 2453);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 64 64");
    			add_location(svg1, file$9, 55, 6, 2278);
    			add_location(span1, file$9, 59, 6, 2796);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "icon trash");
    			toggle_class(button1, "open", /*openWindowByName*/ ctx[2]("Garbage"));
    			add_location(button1, file$9, 54, 4, 2142);
    			attr_dev(section1, "class", "desktop-layer");
    			add_location(section1, file$9, 44, 2, 1049);
    			attr_dev(main, "role", "main");
    			add_location(main, file$9, 35, 0, 783);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(nav, header, null);
    			append_dev(header, t0);
    			mount_component(clock, header, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section0, null);
    			}

    			append_dev(main, t2);
    			append_dev(main, section1);
    			append_dev(section1, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(button0, t3);
    			append_dev(button0, span0);
    			append_dev(section1, t5);
    			append_dev(section1, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path4);
    			append_dev(svg1, path5);
    			append_dev(button1, t6);
    			append_dev(button1, span1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$windows, closeWindow*/ 3) {
    				each_value = /*$windows*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*openWindowByName*/ 4) {
    				toggle_class(button0, "open", /*openWindowByName*/ ctx[2]("PezHD"));
    			}

    			if (dirty & /*openWindowByName*/ 4) {
    				toggle_class(button1, "open", /*openWindowByName*/ ctx[2]("Garbage"));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(clock.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(clock.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(nav);
    			destroy_component(clock);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $windows;
    	validate_store(windows, "windows");
    	component_subscribe($$self, windows, $$value => $$invalidate(0, $windows = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	const closeWindow = index => {
    		set_store_value(windows, $windows[index].visible = false, $windows);
    	};

    	const openWindowByName = name => {
    		
    	}; // $windows.find(win => win.name === name)

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const action_handler = event => console.log(event);
    	const close_handler = index => closeWindow(index);
    	const click_handler = () => set_store_value(windows, $windows[0].visible = true, $windows);
    	const click_handler_1 = () => set_store_value(windows, $windows[1].visible = true, $windows);

    	$$self.$capture_state = () => ({
    		windows,
    		Nav,
    		Clock,
    		Window,
    		closeWindow,
    		openWindowByName,
    		$windows
    	});

    	return [
    		$windows,
    		closeWindow,
    		openWindowByName,
    		action_handler,
    		close_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    function replaceContents(node) {
      node.innerHTML = '';
      return node;
    }

    var app = new App({
      target: replaceContents(document.querySelector('#app')),
    });

    var app$1 = { app };

    return app$1;

}());
//# sourceMappingURL=scripts.js.map
