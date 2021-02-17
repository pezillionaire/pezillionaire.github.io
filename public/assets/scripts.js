
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
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

    const pezMenuItems = [
      // {
      //   name: 'About this Pez…',
      //   type: 'action',
      // },
      {
        name: 'Resume',
        type: 'link',
        url: 'https://github.com/pezillionaire/resume',
      },
      {
        name: 'Contact',
        type: 'link',
        url: 'https://github.com/pezillionaire/resume',
      },
      {
        name: 'This Does Nothing… Yet!',
        type: 'action',
      },
      // {
      //   name: 'Shut\'er Down',
      //   type: 'action',
      // },
    ];

    const ProjectsMenuItems = [
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
        svg: '<svg viewBox=\'0 0 64 64\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M20 4.433h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-24 1h8m4 0h12m-28 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-32 1h4m8 0h4m12 0h4m-36 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-40 1h4m4 0h4m16 0h4m4 0h4m-44 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-48 1h4m4 0h4m16 0h4m4 0h4m4 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-44 1h4m4 0h4m4 0h4m8 0h4m8 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m4 0h4m4 0h16m4 0h4m4 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m8 0h4m12 0h8m8 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-48 1h4m4 0h4m20 0h8m4 0h4m-44 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-40 1h4m4 0h8m8 0h8m4 0h4m-36 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-32 1h4m4 0h4m8 0h4m4 0h4m-36 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-40 1h12m16 0h12m-44 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-48 1h4m12 0h16m12 0h4m-52 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m48 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4m-56 1h4m8 0h4m24 0h4m8 0h4\'/></svg>',
        items: pezMenuItems,
      },
      {
        name: 'Files',
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
    			attr_dev(span0, "class", "svelte-bvj0kg");
    			add_location(span0, file, 29, 2, 507);
    			attr_dev(span1, "class", "menuitem-icon svelte-bvj0kg");
    			add_location(span1, file, 30, 2, 534);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-bvj0kg");
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

    	const block = {
    		c: function create() {
    			a = element("a");
    			span0 = element("span");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "⋮";
    			attr_dev(span0, "class", "svelte-17atzqy");
    			add_location(span0, file$1, 11, 2, 126);
    			attr_dev(span1, "class", "menuitem-icon svelte-17atzqy");
    			add_location(span1, file$1, 12, 2, 148);
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			attr_dev(a, "class", "svelte-17atzqy");
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
    			attr_dev(span, "class", "menu-svgicon svelte-ndv8it");
    			add_location(span, file$2, 46, 6, 1241);
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
    			attr_dev(span, "class", "" + (null_to_empty(`menu-name ${/*menu*/ ctx[1].svg ? "hidden" : ""}`) + " svelte-ndv8it"));
    			add_location(span, file$2, 51, 6, 1344);
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

    			attr_dev(ul, "class", "svelte-ndv8it");
    			add_location(ul, file$2, 56, 4, 1461);
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
    			attr_dev(li, "class", "svelte-ndv8it");
    			add_location(li, file$2, 58, 8, 1514);
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
    			attr_dev(button, "class", "svelte-ndv8it");
    			toggle_class(button, "expanded", /*expanded*/ ctx[0]);
    			add_location(button, file$2, 44, 2, 1192);
    			attr_dev(menu_1, "class", "svelte-ndv8it");
    			add_location(menu_1, file$2, 43, 0, 1129);
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
    					listen_dev(menu_1, "click", /*menuToggle*/ ctx[2], false, false, false),
    					listen_dev(menu_1, "mouseenter", /*menuCheckActive*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*menu*/ ctx[1].svg) if_block0.p(ctx, dirty);
    			if (/*menu*/ ctx[1].name) if_block1.p(ctx, dirty);

    			if (dirty & /*expanded*/ 1) {
    				toggle_class(button, "expanded", /*expanded*/ ctx[0]);
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
    			attr_dev(ul, "class", "svelte-1nti9ad");
    			add_location(ul, file$3, 100, 4, 2751);
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

    // (102:6) {#each items as { name, active }
    function create_each_block$1(ctx) {
    	let li;
    	let button;
    	let span0;
    	let t0_value = /*name*/ ctx[12] + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = (/*active*/ ctx[13] ? "✓" : "") + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

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
    			t2 = text(t2_value);
    			t3 = space();
    			add_location(span0, file$3, 104, 12, 2913);
    			attr_dev(span1, "class", "menuitem-icon svelte-1nti9ad");
    			add_location(span1, file$3, 105, 12, 2945);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-1nti9ad");
    			add_location(button, file$3, 103, 10, 2838);
    			attr_dev(li, "class", "svelte-1nti9ad");
    			add_location(li, file$3, 102, 8, 2823);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, span0);
    			append_dev(span0, t0);
    			append_dev(button, t1);
    			append_dev(button, span1);
    			append_dev(span1, t2);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, { once: true }, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*items*/ 1 && t0_value !== (t0_value = /*name*/ ctx[12] + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*items*/ 1 && t2_value !== (t2_value = (/*active*/ ctx[13] ? "✓" : "") + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
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
    			attr_dev(button, "class", "svelte-1nti9ad");
    			toggle_class(button, "active", /*expanded*/ ctx[1]);
    			add_location(button, file$3, 96, 2, 2601);
    			attr_dev(menu_1, "class", "svelte-1nti9ad");
    			add_location(menu_1, file$3, 95, 0, 2592);
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
    			attr_dev(div, "class", "click-capture svelte-le7meu");
    			add_location(div, file$4, 25, 2, 523);
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
    			add_location(nav, file$4, 19, 0, 358);
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
    	let time;
    	let t_value = /*formatter*/ ctx[1].format(/*date*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			time = element("time");
    			t = text(t_value);
    			attr_dev(time, "datetime", /*date*/ ctx[0]);
    			add_location(time, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, time, anchor);
    			append_dev(time, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*date*/ 1 && t_value !== (t_value = /*formatter*/ ctx[1].format(/*date*/ ctx[0]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*date*/ 1) {
    				attr_dev(time, "datetime", /*date*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(time);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Clock", slots, []);
    	let date = new Date();

    	const formatter = new Intl.DateTimeFormat("en",
    	{
    			hour12: true,
    			hour: "numeric",
    			minute: "2-digit"
    		});

    	const minutes = ("0" + date.getMinutes()).slice(-2);

    	onMount(() => {
    		setInterval(
    			() => {
    				$$invalidate(0, date = new Date());
    			},
    			1000
    		);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Clock> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, date, formatter, minutes });

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [date, formatter];
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

    /* src/windows/Window.svelte generated by Svelte v3.31.2 */

    const { window: window_1 } = globals;
    const file$6 = "src/windows/Window.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let header;
    	let button;
    	let t1;
    	let div0;
    	let h2;
    	let t2;
    	let t3;
    	let section;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			button = element("button");
    			button.textContent = "close modal";
    			t1 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			t2 = text(/*title*/ ctx[0]);
    			t3 = space();
    			section = element("section");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "window-close svelte-ssk6g2");
    			add_location(button, file$6, 71, 4, 1529);
    			attr_dev(h2, "class", "svelte-ssk6g2");
    			add_location(h2, file$6, 75, 6, 1659);
    			attr_dev(div0, "class", "window-title svelte-ssk6g2");
    			add_location(div0, file$6, 74, 4, 1626);
    			attr_dev(header, "class", "window-header svelte-ssk6g2");
    			add_location(header, file$6, 70, 2, 1473);
    			attr_dev(section, "class", "window-main svelte-ssk6g2");
    			add_location(section, file$6, 78, 2, 1701);
    			attr_dev(div1, "class", "window svelte-ssk6g2");
    			set_style(div1, "left", /*window*/ ctx[2].left + "px");
    			set_style(div1, "top", /*window*/ ctx[2].top + "px");
    			add_location(div1, file$6, 65, 0, 1375);
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

    			if (default_slot) {
    				default_slot.m(section, null);
    			}

    			/*div1_binding*/ ctx[10](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "keydown", /*handle_keydown*/ ctx[7], false, false, false),
    					listen_dev(window_1, "mouseup", /*stop*/ ctx[5], false, false, false),
    					listen_dev(window_1, "mousemove", /*move*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*close*/ ctx[3], false, false, false),
    					listen_dev(header, "mousedown", /*start*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t2, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*window*/ 4) {
    				set_style(div1, "left", /*window*/ ctx[2].left + "px");
    			}

    			if (!current || dirty & /*window*/ 4) {
    				set_style(div1, "top", /*window*/ ctx[2].top + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	let modal;
    	let window = { top: 32, left: 32, moving: false };

    	function start() {
    		$$invalidate(2, window.moving = true, window);
    	}

    	function stop() {
    		$$invalidate(2, window.moving = false, window);

    		if (window.left <= 0) {
    			$$invalidate(2, window.left = 0, window);
    		}

    		if (window.top <= 0) {
    			$$invalidate(2, window.top = 0, window);
    		}
    	}

    	function move(e) {
    		if (window.moving) {
    			$$invalidate(2, window.left += e.movementX, window);
    			$$invalidate(2, window.top += e.movementY, window);
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

    	let { title = "title" } = $$props;
    	const writable_props = ["title"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal = $$value;
    			$$invalidate(1, modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		dispatch,
    		close,
    		modal,
    		window,
    		start,
    		stop,
    		move,
    		handle_keydown,
    		previously_focused,
    		title
    	});

    	$$self.$inject_state = $$props => {
    		if ("modal" in $$props) $$invalidate(1, modal = $$props.modal);
    		if ("window" in $$props) $$invalidate(2, window = $$props.window);
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		modal,
    		window,
    		close,
    		start,
    		stop,
    		move,
    		handle_keydown,
    		$$scope,
    		slots,
    		div1_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get title() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;

    const file$7 = "src/App.svelte";

    // (17:4) {#if windowMac}
    function create_if_block_1$1(ctx) {
    	let window;
    	let current;

    	window = new Window({
    			props: {
    				title: "Pez Disk",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	window.$on("close", /*close_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(window.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(window, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const window_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				window_changes.$$scope = { dirty, ctx };
    			}

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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(17:4) {#if windowMac}",
    		ctx
    	});

    	return block;
    }

    // (18:6) <Window title="Pez Disk" on:close={() => (windowMac = !windowMac)}>
    function create_default_slot_1(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Pezillionaire Interactive Mfg. Concern";
    			t1 = space();
    			p = element("p");
    			add_location(h1, file$7, 18, 8, 510);
    			add_location(p, file$7, 19, 8, 566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(18:6) <Window title=\\\"Pez Disk\\\" on:close={() => (windowMac = !windowMac)}>",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if windowTrash}
    function create_if_block$3(ctx) {
    	let window;
    	let current;

    	window = new Window({
    			props: {
    				title: "Garbage",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	window.$on("close", /*close_handler_1*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(window.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(window, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const window_changes = {};

    			if (dirty & /*$$scope*/ 128) {
    				window_changes.$$scope = { dirty, ctx };
    			}

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
    		source: "(23:4) {#if windowTrash}",
    		ctx
    	});

    	return block;
    }

    // (24:6) <Window title="Garbage" on:close={() => (windowTrash = !windowMac)}>
    function create_default_slot(ctx) {
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
    			span0.textContent = "Rants";
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
    			add_location(path0, file$7, 31, 14, 942);
    			attr_dev(path1, "class", "svg-alt");
    			attr_dev(path1, "d", "M7 8.4h1m10 0h4m4 0h1m-20 1h2m8 0h6m1 0h2m-19 1h3m6 0h12m-21 1h5m4 0h10m-19 1h8m1 0h9m-17 1h17m-16 1h16m-17 1h17m-16 1h15m-14 1h14m-15 1h14m-13 1h13m-12 1h11m-10 1h9m-10 1h9m-12 1h10m-8 1h6");
    			add_location(path1, file$7, 35, 14, 1471);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 32 32");
    			add_location(svg0, file$7, 30, 12, 867);
    			add_location(span0, file$7, 40, 12, 1767);
    			attr_dev(a0, "href", "https://twitter.com/pezillionaire");
    			attr_dev(a0, "class", "icon");
    			attr_dev(a0, "target", "blank");
    			add_location(a0, file$7, 25, 10, 735);
    			attr_dev(path2, "class", "svg-prime");
    			attr_dev(path2, "d", "M12 .444h8m-11 1h14m-16 1h18m-19 1h20m-21 1h22m-23 1h24m-25 1h4m1 0h16m1 0h4m-27 1h5m3 0h12m3 0h5m-28 1h5m18 0h5m-29 1h6m18 0h6m-30 1h6m18 0h6m-30 1h6m18 0h6m-31 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h7m18 0h7m-31 1h7m16 0h7m-30 1h8m14 0h8m-30 1h4m1 0h5m10 0h10m-29 1h3m2 0h6m6 0h11m-27 1h3m2 0h5m6 0h10m-26 1h4m12 0h10m-25 1h4m11 0h9m-23 1h8m6 0h8m-21 1h7m6 0h7m-18 1h5m6 0h5m-14 1h3m6 0h3m-10 1h1m6 0h1");
    			add_location(path2, file$7, 48, 14, 2017);
    			attr_dev(path3, "class", "svg-alt");
    			attr_dev(path3, "d", "M7 6.444h1m16 0h1m-18 1h3m12 0h3m-18 1h18m-18 1h18m-18 1h18m-18 1h18m-19 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-19 1h18m-17 1h16m-15 1h14m-18 1h1m5 0h10m-16 1h2m6 0h6m-13 1h2m5 0h6m-12 1h12m-11 1h11m-6 1h6m-6 1h6m-6 1h6m-6 1h6m-6 1h6");
    			add_location(path3, file$7, 52, 14, 2581);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 32 32");
    			add_location(svg1, file$7, 47, 12, 1942);
    			add_location(span1, file$7, 57, 12, 2942);
    			attr_dev(a1, "href", "https://github.com/pezillionaire");
    			attr_dev(a1, "class", "icon");
    			attr_dev(a1, "target", "blank");
    			add_location(a1, file$7, 42, 10, 1811);
    			attr_dev(path4, "class", "svg-prime");
    			attr_dev(path4, "d", "M3 .533h29m-29 1h29m-30 1h30m-30 1h4m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m22 0h4m-31 1h5m21 0h4m-30 1h5m20 0h4m-29 1h5m19 0h4m-28 1h11m4 0h12m-27 1h11m3 0h12m-26 1h11m2 0h12m-25 1h11m1 0h12m-24 1h23m-15 1h8m-8 1h6m-6 1h6m-6 1h5");
    			add_location(path4, file$7, 61, 14, 3144);
    			attr_dev(path5, "class", "svg-alt");
    			attr_dev(path5, "d", "M6 3.533h23m-23 1h23m-23 1h23m-23 1h23m-23 1h23m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h23m-23 1h23m-23 1h22m-22 1h21m-21 1h20m-20 1h19m-13 1h4m-4 1h3m-3 1h2m-2 1h1");
    			add_location(path5, file$7, 65, 14, 3765);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 32 32");
    			add_location(svg2, file$7, 60, 12, 3069);
    			add_location(span2, file$7, 70, 12, 4182);
    			attr_dev(a2, "href", "https://twitch.tv/pezillionaire");
    			attr_dev(a2, "class", "icon");
    			attr_dev(a2, "target", "blank");
    			add_location(a2, file$7, 59, 10, 2986);
    			attr_dev(div, "class", "socials");
    			add_location(div, file$7, 24, 8, 703);
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(24:6) <Window title=\\\"Garbage\\\" on:close={() => (windowTrash = !windowMac)}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let header;
    	let nav;
    	let t0;
    	let div;
    	let clock;
    	let t1;
    	let main;
    	let section0;
    	let t2;
    	let t3;
    	let section1;
    	let button0;
    	let svg0;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let t4;
    	let span0;
    	let t6;
    	let button1;
    	let svg1;
    	let path4;
    	let path5;
    	let t7;
    	let span1;
    	let current;
    	let mounted;
    	let dispose;
    	nav = new Nav({ $$inline: true });
    	nav.$on("action", /*action_handler*/ ctx[2]);
    	clock = new Clock({ $$inline: true });
    	let if_block0 = /*windowMac*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block1 = /*windowTrash*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div = element("div");
    			create_component(clock.$$.fragment);
    			t1 = space();
    			main = element("main");
    			section0 = element("section");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			section1 = element("section");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			t4 = space();
    			span0 = element("span");
    			span0.textContent = "Pez Disk";
    			t6 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			t7 = space();
    			span1 = element("span");
    			span1.textContent = "Garbage";
    			attr_dev(div, "id", "clock");
    			add_location(div, file$7, 12, 2, 314);
    			attr_dev(header, "role", "banner");
    			add_location(header, file$7, 10, 0, 237);
    			attr_dev(section0, "class", "window-layer");
    			add_location(section0, file$7, 15, 2, 377);
    			attr_dev(path0, "class", "svg-prime-fill");
    			attr_dev(path0, "d", "M6 60v-4H4V4h2V2h52v2h2v52h-2v8H6z");
    			add_location(path0, file$7, 85, 8, 4534);
    			attr_dev(path1, "class", "svg-alt-fill");
    			attr_dev(path1, "d", "M10 33V4H6v52h2v6h2V33zm10 27v-2h-8v4h8v-2zm36-1v-3h2V4h-4v40h-2V4H26v40h-2V4h-2v58h34v-3zm-36-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-5V4h-8v4h8V6z");
    			add_location(path1, file$7, 86, 8, 4613);
    			attr_dev(path2, "class", "svg-prime-fill");
    			attr_dev(path2, "d", "M38 57v-1h-2v-2h2v2h2v-2h2v2h-2v2h-2v-1zM26 45v-1h26v2H26v-1zm8-6v-1h-2v-2h-2v-4h4v2h2v2h6v-2h2v-2h4v4h-2v2h-2v2H34v-1zm-2-14v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1zm10 0v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1z");
    			add_location(path2, file$7, 90, 8, 5008);
    			attr_dev(path3, "class", "svg-alt-fill");
    			attr_dev(path3, "d", "M34 16v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1zm10 5v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1z");
    			add_location(path3, file$7, 94, 8, 5279);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 64 64");
    			add_location(svg0, file$7, 84, 6, 4465);
    			add_location(span0, file$7, 99, 6, 5436);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "icon mac");
    			toggle_class(button0, "open", /*windowMac*/ ctx[0]);
    			add_location(button0, file$7, 78, 4, 4331);
    			attr_dev(path4, "class", "svg-alt-fill");
    			attr_dev(path4, "d", "M14 64v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2z");
    			add_location(path4, file$7, 108, 8, 5685);
    			attr_dev(path5, "class", "svg-prime-fill");
    			attr_dev(path5, "d", "M32 64H14v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2H32zm-.002-2h18V10h-36v52h18zM19 58h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zM32 8h20V6H12v2h20zm0-4h6V2H26v2h6z");
    			add_location(path5, file$7, 112, 8, 5819);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 64 64");
    			add_location(svg1, file$7, 107, 6, 5616);
    			add_location(span1, file$7, 117, 6, 6190);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "icon trash");
    			toggle_class(button1, "open", /*windowTrash*/ ctx[1]);
    			add_location(button1, file$7, 101, 4, 5476);
    			attr_dev(section1, "class", "desktop-layer");
    			add_location(section1, file$7, 77, 2, 4295);
    			attr_dev(main, "role", "main");
    			add_location(main, file$7, 14, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(nav, header, null);
    			append_dev(header, t0);
    			append_dev(header, div);
    			mount_component(clock, div, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			if (if_block0) if_block0.m(section0, null);
    			append_dev(section0, t2);
    			if (if_block1) if_block1.m(section0, null);
    			append_dev(main, t3);
    			append_dev(main, section1);
    			append_dev(section1, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(svg0, path2);
    			append_dev(svg0, path3);
    			append_dev(button0, t4);
    			append_dev(button0, span0);
    			append_dev(section1, t6);
    			append_dev(section1, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, path4);
    			append_dev(svg1, path5);
    			append_dev(button1, t7);
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
    			if (/*windowMac*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*windowMac*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(section0, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*windowTrash*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*windowTrash*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(section0, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*windowMac*/ 1) {
    				toggle_class(button0, "open", /*windowMac*/ ctx[0]);
    			}

    			if (dirty & /*windowTrash*/ 2) {
    				toggle_class(button1, "open", /*windowTrash*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(clock.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(clock.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(nav);
    			destroy_component(clock);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let windowMac = true;
    	let windowTrash = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const action_handler = event => console.log(event);
    	const close_handler = () => $$invalidate(0, windowMac = !windowMac);
    	const close_handler_1 = () => $$invalidate(1, windowTrash = !windowMac);
    	const click_handler = () => $$invalidate(0, windowMac = true);
    	const click_handler_1 = () => $$invalidate(1, windowTrash = true);

    	$$self.$capture_state = () => ({
    		Nav,
    		Clock,
    		Window,
    		windowMac,
    		windowTrash
    	});

    	$$self.$inject_state = $$props => {
    		if ("windowMac" in $$props) $$invalidate(0, windowMac = $$props.windowMac);
    		if ("windowTrash" in $$props) $$invalidate(1, windowTrash = $$props.windowTrash);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		windowMac,
    		windowTrash,
    		action_handler,
    		close_handler,
    		close_handler_1,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
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
