
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

    /* src/menu/MenuAction.svelte generated by Svelte v3.31.2 */
    const file = "src/menu/MenuAction.svelte";

    function create_fragment(ctx) {
    	let button;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = (/*active*/ ctx[0] ? "✓" : "") + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			attr_dev(span0, "class", "svelte-bvj0kg");
    			add_location(span0, file, 25, 2, 405);
    			attr_dev(span1, "class", "menuitem-icon svelte-bvj0kg");
    			add_location(span1, file, 26, 2, 427);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-bvj0kg");
    			add_location(button, file, 24, 0, 356);
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
    						if (is_function(/*toggle*/ ctx[2](/*name*/ ctx[1]))) /*toggle*/ ctx[2](/*name*/ ctx[1]).apply(this, arguments);
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
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			if (dirty & /*active*/ 1 && t2_value !== (t2_value = (/*active*/ ctx[0] ? "✓" : "") + "")) set_data_dev(t2, t2_value);
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
    	validate_slots("MenuAction", slots, []);
    	const dispatch = createEventDispatcher();
    	let { active } = $$props;
    	let { name } = $$props;
    	let { type } = $$props;

    	function toggle() {
    		$$invalidate(0, active = !active);
    		const value = { name, active, type };
    		dispatch("action", value);
    	}

    	const writable_props = ["active", "name", "type"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuAction> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		active,
    		name,
    		type,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active*/ 1) ;

    		if ($$self.$$.dirty & /*type*/ 8) ;

    		if ($$self.$$.dirty & /*name*/ 2) ;
    	};

    	return [active, name, toggle, type];
    }

    class MenuAction extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { active: 0, name: 1, type: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuAction",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<MenuAction> was created without expected prop 'active'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<MenuAction> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[3] === undefined && !("type" in props)) {
    			console.warn("<MenuAction> was created without expected prop 'type'");
    		}
    	}

    	get active() {
    		throw new Error("<MenuAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<MenuAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<MenuAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MenuAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<MenuAction>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<MenuAction>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/menu/MenuLink.svelte generated by Svelte v3.31.2 */

    const file$1 = "src/menu/MenuLink.svelte";

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
    	validate_slots("MenuLink", slots, []);
    	let { name } = $$props;
    	let { type } = $$props;
    	let { url } = $$props;
    	const writable_props = ["name", "type", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuLink> was created with unknown prop '${key}'`);
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

    class MenuLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0, type: 2, url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuLink",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<MenuLink> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console.warn("<MenuLink> was created without expected prop 'type'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console.warn("<MenuLink> was created without expected prop 'url'");
    		}
    	}

    	get name() {
    		throw new Error("<MenuLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MenuLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<MenuLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<MenuLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<MenuLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<MenuLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/menu/index.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/menu/index.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (22:4) {#if root.svg}
    function create_if_block_4(ctx) {
    	let span0;
    	let raw_value = /*root*/ ctx[1].svg + "";
    	let t0;
    	let span1;
    	let t1_value = /*root*/ ctx[1].type + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			attr_dev(span0, "class", "folder-svgicon svelte-11dcbbz");
    			add_location(span0, file$2, 22, 6, 397);
    			attr_dev(span1, "class", "folder-svg-label svelte-11dcbbz");
    			add_location(span1, file$2, 25, 6, 472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			span0.innerHTML = raw_value;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2 && raw_value !== (raw_value = /*root*/ ctx[1].svg + "")) span0.innerHTML = raw_value;			if (dirty & /*root*/ 2 && t1_value !== (t1_value = /*root*/ ctx[1].type + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(22:4) {#if root.svg}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if root.name}
    function create_if_block_3(ctx) {
    	let span;
    	let t_value = /*root*/ ctx[1].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "folder-name");
    			add_location(span, file$2, 28, 6, 558);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2 && t_value !== (t_value = /*root*/ ctx[1].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(28:4) {#if root.name}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if expanded}
    function create_if_block(ctx) {
    	let ul;
    	let current;
    	let each_value = /*root*/ ctx[1].menuItems;
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

    			attr_dev(ul, "class", "svelte-11dcbbz");
    			add_location(ul, file$2, 33, 4, 647);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2) {
    				each_value = /*root*/ ctx[1].menuItems;
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
    		source: "(33:2) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (41:10) {:else}
    function create_else_block(ctx) {
    	let item;
    	let current;
    	const item_spread_levels = [/*item*/ ctx[4]];
    	let item_props = {};

    	for (let i = 0; i < item_spread_levels.length; i += 1) {
    		item_props = assign(item_props, item_spread_levels[i]);
    	}

    	item = new MenuAction({ props: item_props, $$inline: true });
    	item.$on("action", /*action_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(item.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_changes = (dirty & /*root*/ 2)
    			? get_spread_update(item_spread_levels, [get_spread_object(/*item*/ ctx[4])])
    			: {};

    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(41:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:41) 
    function create_if_block_2(ctx) {
    	let link;
    	let current;
    	const link_spread_levels = [/*item*/ ctx[4]];
    	let link_props = {};

    	for (let i = 0; i < link_spread_levels.length; i += 1) {
    		link_props = assign(link_props, link_spread_levels[i]);
    	}

    	link = new MenuLink({ props: link_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = (dirty & /*root*/ 2)
    			? get_spread_update(link_spread_levels, [get_spread_object(/*item*/ ctx[4])])
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
    		source: "(39:41) ",
    		ctx
    	});

    	return block;
    }

    // (37:10) {#if item.type === "folder"}
    function create_if_block_1(ctx) {
    	let menu;
    	let current;
    	const menu_spread_levels = [/*item*/ ctx[4]];
    	let menu_props = {};

    	for (let i = 0; i < menu_spread_levels.length; i += 1) {
    		menu_props = assign(menu_props, menu_spread_levels[i]);
    	}

    	menu = new Menu({ props: menu_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menu_changes = (dirty & /*root*/ 2)
    			? get_spread_update(menu_spread_levels, [get_spread_object(/*item*/ ctx[4])])
    			: {};

    			menu.$set(menu_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(37:10) {#if item.type === \\\"folder\\\"}",
    		ctx
    	});

    	return block;
    }

    // (35:6) {#each root.menuItems as item}
    function create_each_block(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let li__class_value;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[4].type === "folder") return 0;
    		if (/*item*/ ctx[4].type === "link") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, ":class", li__class_value = /*item*/ ctx[4].type);
    			attr_dev(li, "class", "svelte-11dcbbz");
    			add_location(li, file$2, 35, 8, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(li, t);
    			}

    			if (!current || dirty & /*root*/ 2 && li__class_value !== (li__class_value = /*item*/ ctx[4].type)) {
    				attr_dev(li, ":class", li__class_value);
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
    			if (detaching) detach_dev(li);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:6) {#each root.menuItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let button;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*root*/ ctx[1].svg && create_if_block_4(ctx);
    	let if_block1 = /*root*/ ctx[1].name && create_if_block_3(ctx);
    	let if_block2 = /*expanded*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(button, "class", "svelte-11dcbbz");
    			toggle_class(button, "expanded", /*expanded*/ ctx[0]);
    			add_location(button, file$2, 20, 2, 348);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`folder type-${/*root*/ ctx[1].type.toLowerCase()}`) + " svelte-11dcbbz"));
    			add_location(div, file$2, 14, 0, 218);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			if (if_block1) if_block1.m(button, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseenter", /*toggle*/ ctx[2], false, false, false),
    					listen_dev(div, "mouseleave", /*toggle*/ ctx[2], false, false, false),
    					listen_dev(div, "click", /*toggle*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*root*/ ctx[1].svg) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*root*/ ctx[1].name) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

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
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*root*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(`folder type-${/*root*/ ctx[1].type.toLowerCase()}`) + " svelte-11dcbbz"))) {
    				attr_dev(div, "class", div_class_value);
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
    			if (detaching) detach_dev(div);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Menu", slots, []);
    	let { expanded = false } = $$props;
    	let { root } = $$props;

    	function toggle() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	const writable_props = ["expanded", "root"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function action_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    	};

    	$$self.$capture_state = () => ({ Item: MenuAction, Link: MenuLink, expanded, root, toggle });

    	$$self.$inject_state = $$props => {
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*root*/ 2) ;
    	};

    	return [expanded, root, toggle, action_handler];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { expanded: 0, root: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*root*/ ctx[1] === undefined && !("root" in props)) {
    			console.warn("<Menu> was created without expected prop 'root'");
    		}
    	}

    	get expanded() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/NavMenu.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$3 = "src/NavMenu.svelte";

    function create_fragment$3(ctx) {
    	let nav;
    	let menu;
    	let current;

    	menu = new Menu({
    			props: { root: /*ThemesMenu*/ ctx[0] },
    			$$inline: true
    		});

    	menu.$on("action", handleAction);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			create_component(menu.$$.fragment);
    			attr_dev(nav, "class", "navMenu");
    			add_location(nav, file$3, 106, 0, 5780);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			mount_component(menu, nav, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_component(menu);
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

    function handleAction(event) {
    	console.log(event);
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavMenu", slots, []);

    	const ThemesMenu = {
    		type: "toggle",
    		name: "Themes",
    		menuItems: [
    			{
    				type: "action",
    				name: "harmony",
    				active: true
    			},
    			{
    				type: "action",
    				name: "creekside",
    				active: false
    			},
    			{
    				type: "action",
    				name: "overcast",
    				active: false
    			},
    			{
    				type: "action",
    				name: "alpenglow",
    				active: false
    			}
    		]
    	};

    	const themes = [
    		{
    			name: "harmony",
    			primary: "#0466c8",
    			alt: "#e2e7ed"
    		},
    		{
    			name: "alpenglow",
    			primary: "#480ca8",
    			alt: "#ffc8dd"
    		},
    		{
    			name: "overcast",
    			primary: "#222",
    			alt: "#bfb8b9"
    		},
    		{
    			name: "creekside",
    			primary: "#006d77",
    			alt: "#edf6f9"
    		}
    	];

    	const setTheme = i => {
    		const root = document.querySelector(":root");
    		themes[activeTheme].active = false;
    		themes[i].active = true;
    		activeTheme = i;
    		localStorage.clear();
    		localStorage.setItem("theme", JSON.stringify(themes[i]));
    		root.style.setProperty("--primary", themes[i].primary);
    		root.style.setProperty("--alt", themes[i].alt);

    		setTimeout(
    			() => {
    				menuThemeOpen = false;
    			},
    			300
    		);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<NavMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Menu,
    		ThemesMenu,
    		themes,
    		handleAction,
    		setTheme
    	});

    	return [ThemesMenu];
    }

    class NavMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavMenu",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Clock.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/Clock.svelte";

    function create_fragment$4(ctx) {
    	let time;
    	let t_value = /*formatter*/ ctx[1].format(/*date*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			time = element("time");
    			t = text(t_value);
    			attr_dev(time, "datetime", /*date*/ ctx[0]);
    			add_location(time, file$4, 0, 0, 0);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clock",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Window.svelte generated by Svelte v3.31.2 */

    const { window: window_1 } = globals;
    const file$5 = "src/Window.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(button, file$5, 6, 4, 154);
    			attr_dev(h2, "class", "svelte-ssk6g2");
    			add_location(h2, file$5, 10, 6, 284);
    			attr_dev(div0, "class", "window-title svelte-ssk6g2");
    			add_location(div0, file$5, 9, 4, 251);
    			attr_dev(header, "class", "window-header svelte-ssk6g2");
    			add_location(header, file$5, 5, 2, 98);
    			attr_dev(section, "class", "window-main svelte-ssk6g2");
    			add_location(section, file$5, 13, 2, 326);
    			attr_dev(div1, "class", "window svelte-ssk6g2");
    			set_style(div1, "left", /*window*/ ctx[2].left + "px");
    			set_style(div1, "top", /*window*/ ctx[2].top + "px");
    			add_location(div1, file$5, 0, 0, 0);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get title() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/File.svelte generated by Svelte v3.31.2 */
    const file$6 = "src/File.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = (/*active*/ ctx[0] ? "✓" : "") + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span0 = element("span");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			attr_dev(span0, "class", "svelte-bvj0kg");
    			add_location(span0, file$6, 19, 2, 323);
    			attr_dev(span1, "class", "menuitem-icon svelte-bvj0kg");
    			add_location(span1, file$6, 20, 2, 345);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-bvj0kg");
    			add_location(button, file$6, 18, 0, 274);
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
    						if (is_function(/*action*/ ctx[2](/*name*/ ctx[1]))) /*action*/ ctx[2](/*name*/ ctx[1]).apply(this, arguments);
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
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			if (dirty & /*active*/ 1 && t2_value !== (t2_value = (/*active*/ ctx[0] ? "✓" : "") + "")) set_data_dev(t2, t2_value);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("File", slots, []);
    	const dispatch = createEventDispatcher();

    	function action(value) {
    		dispatch("action", value);
    	}

    	let { active } = $$props;
    	let { name } = $$props;
    	let { type } = $$props;
    	const writable_props = ["active", "name", "type"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		action,
    		active,
    		name,
    		type
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*active*/ 1) ;

    		if ($$self.$$.dirty & /*type*/ 8) ;

    		if ($$self.$$.dirty & /*name*/ 2) ;
    	};

    	return [active, name, action, type];
    }

    class File extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { active: 0, name: 1, type: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<File> was created without expected prop 'active'");
    		}

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<File> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[3] === undefined && !("type" in props)) {
    			console.warn("<File> was created without expected prop 'type'");
    		}
    	}

    	get active() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Link.svelte generated by Svelte v3.31.2 */

    const file$7 = "src/Link.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(span0, file$7, 11, 2, 126);
    			attr_dev(span1, "class", "menuitem-icon svelte-17atzqy");
    			add_location(span1, file$7, 12, 2, 148);
    			attr_dev(a, "href", /*url*/ ctx[1]);
    			attr_dev(a, "class", "svelte-17atzqy");
    			add_location(a, file$7, 10, 0, 109);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, []);
    	let { name } = $$props;
    	let { type } = $$props;
    	let { url } = $$props;
    	const writable_props = ["name", "type", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
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

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 0, type: 2, url: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<Link> was created without expected prop 'name'");
    		}

    		if (/*type*/ ctx[2] === undefined && !("type" in props)) {
    			console.warn("<Link> was created without expected prop 'type'");
    		}

    		if (/*url*/ ctx[1] === undefined && !("url" in props)) {
    			console.warn("<Link> was created without expected prop 'url'");
    		}
    	}

    	get name() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Folder.svelte generated by Svelte v3.31.2 */
    const file$8 = "src/Folder.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (22:4) {#if root.svg}
    function create_if_block_4$1(ctx) {
    	let span0;
    	let raw_value = /*root*/ ctx[1].svg + "";
    	let t0;
    	let span1;
    	let t1_value = /*root*/ ctx[1].type + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = space();
    			span1 = element("span");
    			t1 = text(t1_value);
    			attr_dev(span0, "class", "folder-svgicon svelte-11dcbbz");
    			add_location(span0, file$8, 22, 6, 387);
    			attr_dev(span1, "class", "folder-svg-label svelte-11dcbbz");
    			add_location(span1, file$8, 25, 6, 462);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			span0.innerHTML = raw_value;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span1, anchor);
    			append_dev(span1, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2 && raw_value !== (raw_value = /*root*/ ctx[1].svg + "")) span0.innerHTML = raw_value;			if (dirty & /*root*/ 2 && t1_value !== (t1_value = /*root*/ ctx[1].type + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(22:4) {#if root.svg}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if root.name}
    function create_if_block_3$1(ctx) {
    	let span;
    	let t_value = /*root*/ ctx[1].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "folder-name");
    			add_location(span, file$8, 28, 6, 548);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2 && t_value !== (t_value = /*root*/ ctx[1].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(28:4) {#if root.name}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#if expanded}
    function create_if_block$1(ctx) {
    	let ul;
    	let current;
    	let each_value = /*root*/ ctx[1].files;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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

    			attr_dev(ul, "class", "svelte-11dcbbz");
    			add_location(ul, file$8, 33, 4, 637);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*root*/ 2) {
    				each_value = /*root*/ ctx[1].files;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(33:2) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (41:10) {:else}
    function create_else_block$1(ctx) {
    	let file_1;
    	let current;
    	const file_1_spread_levels = [/*file*/ ctx[4]];
    	let file_1_props = {};

    	for (let i = 0; i < file_1_spread_levels.length; i += 1) {
    		file_1_props = assign(file_1_props, file_1_spread_levels[i]);
    	}

    	file_1 = new File({ props: file_1_props, $$inline: true });
    	file_1.$on("action", /*action_handler*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(file_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(file_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const file_1_changes = (dirty & /*root*/ 2)
    			? get_spread_update(file_1_spread_levels, [get_spread_object(/*file*/ ctx[4])])
    			: {};

    			file_1.$set(file_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(file_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(file_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(file_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(41:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:41) 
    function create_if_block_2$1(ctx) {
    	let link;
    	let current;
    	const link_spread_levels = [/*file*/ ctx[4]];
    	let link_props = {};

    	for (let i = 0; i < link_spread_levels.length; i += 1) {
    		link_props = assign(link_props, link_spread_levels[i]);
    	}

    	link = new Link({ props: link_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(link.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = (dirty & /*root*/ 2)
    			? get_spread_update(link_spread_levels, [get_spread_object(/*file*/ ctx[4])])
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(39:41) ",
    		ctx
    	});

    	return block;
    }

    // (37:10) {#if file.type === "folder"}
    function create_if_block_1$1(ctx) {
    	let folder;
    	let current;
    	const folder_spread_levels = [/*file*/ ctx[4]];
    	let folder_props = {};

    	for (let i = 0; i < folder_spread_levels.length; i += 1) {
    		folder_props = assign(folder_props, folder_spread_levels[i]);
    	}

    	folder = new Folder({ props: folder_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(folder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(folder, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const folder_changes = (dirty & /*root*/ 2)
    			? get_spread_update(folder_spread_levels, [get_spread_object(/*file*/ ctx[4])])
    			: {};

    			folder.$set(folder_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(folder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(folder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(folder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(37:10) {#if file.type === \\\"folder\\\"}",
    		ctx
    	});

    	return block;
    }

    // (35:6) {#each root.files as file}
    function create_each_block$1(ctx) {
    	let li;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let li__class_value;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*file*/ ctx[4].type === "folder") return 0;
    		if (/*file*/ ctx[4].type === "link") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if_block.c();
    			t = space();
    			attr_dev(li, ":class", li__class_value = /*file*/ ctx[4].type);
    			attr_dev(li, "class", "svelte-11dcbbz");
    			add_location(li, file$8, 35, 8, 683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			if_blocks[current_block_type_index].m(li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(li, t);
    			}

    			if (!current || dirty & /*root*/ 2 && li__class_value !== (li__class_value = /*file*/ ctx[4].type)) {
    				attr_dev(li, ":class", li__class_value);
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
    			if (detaching) detach_dev(li);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(35:6) {#each root.files as file}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let button;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*root*/ ctx[1].svg && create_if_block_4$1(ctx);
    	let if_block1 = /*root*/ ctx[1].name && create_if_block_3$1(ctx);
    	let if_block2 = /*expanded*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(button, "class", "svelte-11dcbbz");
    			toggle_class(button, "expanded", /*expanded*/ ctx[0]);
    			add_location(button, file$8, 20, 2, 338);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`folder type-${/*root*/ ctx[1].type.toLowerCase()}`) + " svelte-11dcbbz"));
    			add_location(div, file$8, 14, 0, 208);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			if (if_block1) if_block1.m(button, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseenter", /*toggle*/ ctx[2], false, false, false),
    					listen_dev(div, "mouseleave", /*toggle*/ ctx[2], false, false, false),
    					listen_dev(div, "click", /*toggle*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*root*/ ctx[1].svg) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*root*/ ctx[1].name) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

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
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*root*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(`folder type-${/*root*/ ctx[1].type.toLowerCase()}`) + " svelte-11dcbbz"))) {
    				attr_dev(div, "class", div_class_value);
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
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
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
    	validate_slots("Folder", slots, []);
    	let { expanded = false } = $$props;
    	let { root } = $$props;

    	function toggle() {
    		$$invalidate(0, expanded = !expanded);
    	}

    	const writable_props = ["expanded", "root"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Folder> was created with unknown prop '${key}'`);
    	});

    	function action_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    	};

    	$$self.$capture_state = () => ({ File, Link, expanded, root, toggle });

    	$$self.$inject_state = $$props => {
    		if ("expanded" in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ("root" in $$props) $$invalidate(1, root = $$props.root);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*root*/ 2) ;
    	};

    	return [expanded, root, toggle, action_handler];
    }

    class Folder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { expanded: 0, root: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Folder",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*root*/ ctx[1] === undefined && !("root" in props)) {
    			console.warn("<Folder> was created without expected prop 'root'");
    		}
    	}

    	get expanded() {
    		throw new Error("<Folder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Folder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<Folder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<Folder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Desktop.svelte generated by Svelte v3.31.2 */

    const { console: console_1$1 } = globals;
    const file$9 = "src/Desktop.svelte";

    // (45:4) {#if windowMac}
    function create_if_block_1$2(ctx) {
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

    			if (dirty & /*$$scope*/ 256) {
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(45:4) {#if windowMac}",
    		ctx
    	});

    	return block;
    }

    // (46:6) <Window title="Pez Disk" on:close={() => (windowMac = !windowMac)}>
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
    			add_location(h1, file$9, 46, 8, 1144);
    			add_location(p, file$9, 47, 8, 1200);
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
    		source: "(46:6) <Window title=\\\"Pez Disk\\\" on:close={() => (windowMac = !windowMac)}>",
    		ctx
    	});

    	return block;
    }

    // (51:4) {#if windowTrash}
    function create_if_block$2(ctx) {
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

    			if (dirty & /*$$scope*/ 256) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(51:4) {#if windowTrash}",
    		ctx
    	});

    	return block;
    }

    // (52:6) <Window title="Garbage" on:close={() => (windowTrash = !windowMac)}>
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
    			add_location(path0, file$9, 59, 14, 1576);
    			attr_dev(path1, "class", "svg-alt");
    			attr_dev(path1, "d", "M7 8.4h1m10 0h4m4 0h1m-20 1h2m8 0h6m1 0h2m-19 1h3m6 0h12m-21 1h5m4 0h10m-19 1h8m1 0h9m-17 1h17m-16 1h16m-17 1h17m-16 1h15m-14 1h14m-15 1h14m-13 1h13m-12 1h11m-10 1h9m-10 1h9m-12 1h10m-8 1h6");
    			add_location(path1, file$9, 63, 14, 2105);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 32 32");
    			add_location(svg0, file$9, 58, 12, 1501);
    			add_location(span0, file$9, 68, 12, 2401);
    			attr_dev(a0, "href", "https://twitter.com/pezillionaire");
    			attr_dev(a0, "class", "icon");
    			attr_dev(a0, "target", "blank");
    			add_location(a0, file$9, 53, 10, 1369);
    			attr_dev(path2, "class", "svg-prime");
    			attr_dev(path2, "d", "M12 .444h8m-11 1h14m-16 1h18m-19 1h20m-21 1h22m-23 1h24m-25 1h4m1 0h16m1 0h4m-27 1h5m3 0h12m3 0h5m-28 1h5m18 0h5m-29 1h6m18 0h6m-30 1h6m18 0h6m-30 1h6m18 0h6m-31 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h6m20 0h6m-32 1h7m18 0h7m-31 1h7m16 0h7m-30 1h8m14 0h8m-30 1h4m1 0h5m10 0h10m-29 1h3m2 0h6m6 0h11m-27 1h3m2 0h5m6 0h10m-26 1h4m12 0h10m-25 1h4m11 0h9m-23 1h8m6 0h8m-21 1h7m6 0h7m-18 1h5m6 0h5m-14 1h3m6 0h3m-10 1h1m6 0h1");
    			add_location(path2, file$9, 76, 14, 2651);
    			attr_dev(path3, "class", "svg-alt");
    			attr_dev(path3, "d", "M7 6.444h1m16 0h1m-18 1h3m12 0h3m-18 1h18m-18 1h18m-18 1h18m-18 1h18m-19 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-20 1h20m-19 1h18m-17 1h16m-15 1h14m-18 1h1m5 0h10m-16 1h2m6 0h6m-13 1h2m5 0h6m-12 1h12m-11 1h11m-6 1h6m-6 1h6m-6 1h6m-6 1h6m-6 1h6");
    			add_location(path3, file$9, 80, 14, 3215);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 32 32");
    			add_location(svg1, file$9, 75, 12, 2576);
    			add_location(span1, file$9, 85, 12, 3576);
    			attr_dev(a1, "href", "https://github.com/pezillionaire");
    			attr_dev(a1, "class", "icon");
    			attr_dev(a1, "target", "blank");
    			add_location(a1, file$9, 70, 10, 2445);
    			attr_dev(path4, "class", "svg-prime");
    			attr_dev(path4, "d", "M3 .533h29m-29 1h29m-30 1h30m-30 1h4m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m7 0h3m5 0h3m5 0h3m-31 1h5m23 0h3m-31 1h5m23 0h3m-31 1h5m22 0h4m-31 1h5m21 0h4m-30 1h5m20 0h4m-29 1h5m19 0h4m-28 1h11m4 0h12m-27 1h11m3 0h12m-26 1h11m2 0h12m-25 1h11m1 0h12m-24 1h23m-15 1h8m-8 1h6m-6 1h6m-6 1h5");
    			add_location(path4, file$9, 89, 14, 3778);
    			attr_dev(path5, "class", "svg-alt");
    			attr_dev(path5, "d", "M6 3.533h23m-23 1h23m-23 1h23m-23 1h23m-23 1h23m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h7m3 0h5m3 0h5m-23 1h23m-23 1h23m-23 1h22m-22 1h21m-21 1h20m-20 1h19m-13 1h4m-4 1h3m-3 1h2m-2 1h1");
    			add_location(path5, file$9, 93, 14, 4399);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "viewBox", "0 0 32 32");
    			add_location(svg2, file$9, 88, 12, 3703);
    			add_location(span2, file$9, 98, 12, 4816);
    			attr_dev(a2, "href", "https://twitch.tv/pezillionaire");
    			attr_dev(a2, "class", "icon");
    			attr_dev(a2, "target", "blank");
    			add_location(a2, file$9, 87, 10, 3620);
    			attr_dev(div, "class", "socials");
    			add_location(div, file$9, 52, 8, 1337);
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
    		source: "(52:6) <Window title=\\\"Garbage\\\" on:close={() => (windowTrash = !windowMac)}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let nav1;
    	let nav0;
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
    	nav0 = new NavMenu({ $$inline: true });
    	nav0.$on("action", /*action_handler*/ ctx[2]);
    	clock = new Clock({ $$inline: true });
    	let if_block0 = /*windowMac*/ ctx[0] && create_if_block_1$2(ctx);
    	let if_block1 = /*windowTrash*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav1 = element("nav");
    			create_component(nav0.$$.fragment);
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
    			add_location(nav1, file$9, 39, 2, 885);
    			attr_dev(div, "id", "clock");
    			add_location(div, file$9, 40, 2, 948);
    			attr_dev(header, "role", "banner");
    			add_location(header, file$9, 38, 0, 860);
    			attr_dev(section0, "class", "window-layer");
    			add_location(section0, file$9, 43, 2, 1011);
    			attr_dev(path0, "class", "svg-prime-fill");
    			attr_dev(path0, "d", "M6 60v-4H4V4h2V2h52v2h2v52h-2v8H6z");
    			add_location(path0, file$9, 112, 8, 5142);
    			attr_dev(path1, "class", "svg-alt-fill");
    			attr_dev(path1, "d", "M10 33V4H6v52h2v6h2V33zm10 27v-2h-8v4h8v-2zm36-1v-3h2V4h-4v40h-2V4H26v40h-2V4h-2v58h34v-3zm-36-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-4v-1h-8v2h8v-1zm0-5V4h-8v4h8V6z");
    			add_location(path1, file$9, 113, 8, 5221);
    			attr_dev(path2, "class", "svg-prime-fill");
    			attr_dev(path2, "d", "M38 57v-1h-2v-2h2v2h2v-2h2v2h-2v2h-2v-1zM26 45v-1h26v2H26v-1zm8-6v-1h-2v-2h-2v-4h4v2h2v2h6v-2h2v-2h4v4h-2v2h-2v2H34v-1zm-2-14v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1zm10 0v-1h-2V10h2V8h4v2h2v14h-2v2h-4v-1z");
    			add_location(path2, file$9, 117, 8, 5616);
    			attr_dev(path3, "class", "svg-alt-fill");
    			attr_dev(path3, "d", "M34 16v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1zm10 5v-2h-2v4h2v-2zm0-5v-1h-2v2h2v-1z");
    			add_location(path3, file$9, 121, 8, 5887);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 64 64");
    			add_location(svg0, file$9, 111, 6, 5073);
    			add_location(span0, file$9, 126, 6, 6044);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "icon mac");
    			toggle_class(button0, "open", /*windowMac*/ ctx[0]);
    			add_location(button0, file$9, 105, 4, 4939);
    			attr_dev(path4, "class", "svg-alt-fill");
    			attr_dev(path4, "d", "M14 64v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2z");
    			add_location(path4, file$9, 135, 8, 6293);
    			attr_dev(path5, "class", "svg-prime-fill");
    			attr_dev(path5, "d", "M32 64H14v-2h-2V10h-2V6h2V4h12V2h2V0h12v2h2v2h12v2h2v4h-2v52h-2v2H32zm-.002-2h18V10h-36v52h18zM19 58h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zm8 0h-1v-2h2V16h-2v-2h2v2h2v40h-2v2h-1zM32 8h20V6H12v2h20zm0-4h6V2H26v2h6z");
    			add_location(path5, file$9, 139, 8, 6427);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 64 64");
    			add_location(svg1, file$9, 134, 6, 6224);
    			add_location(span1, file$9, 144, 6, 6798);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "icon trash");
    			toggle_class(button1, "open", /*windowTrash*/ ctx[1]);
    			add_location(button1, file$9, 128, 4, 6084);
    			attr_dev(section1, "class", "icon-layer");
    			add_location(section1, file$9, 104, 2, 4906);
    			attr_dev(main, "role", "main");
    			add_location(main, file$9, 42, 0, 990);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav1);
    			mount_component(nav0, nav1, null);
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
    					if_block0 = create_if_block_1$2(ctx);
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
    					if_block1 = create_if_block$2(ctx);
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
    			transition_in(nav0.$$.fragment, local);
    			transition_in(clock.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav0.$$.fragment, local);
    			transition_out(clock.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(nav0);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Desktop", slots, []);
    	let windowMac = true;

    	// let windowFolder = true;
    	let windowTrash = false;

    	let root = [
    		{
    			type: "folder",
    			name: "Docs",
    			files: [
    				{ type: "file", name: "Harmony" },
    				{ type: "file", name: "Creekside" },
    				{ type: "file", name: "Overcast" },
    				{ type: "file", name: "Overcast" }
    			]
    		},
    		{
    			type: "folder",
    			name: "Pics",
    			files: [
    				{ type: "file", name: "Harmony" },
    				{ type: "file", name: "Creekside" },
    				{ type: "file", name: "Overcast" },
    				{ type: "file", name: "Overcast" }
    			]
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Desktop> was created with unknown prop '${key}'`);
    	});

    	const action_handler = event => console.log(event);
    	const close_handler = () => $$invalidate(0, windowMac = !windowMac);
    	const close_handler_1 = () => $$invalidate(1, windowTrash = !windowMac);
    	const click_handler = () => $$invalidate(0, windowMac = true);
    	const click_handler_1 = () => $$invalidate(1, windowTrash = true);

    	$$self.$capture_state = () => ({
    		Nav: NavMenu,
    		Clock,
    		Window,
    		Folder,
    		windowMac,
    		windowTrash,
    		root
    	});

    	$$self.$inject_state = $$props => {
    		if ("windowMac" in $$props) $$invalidate(0, windowMac = $$props.windowMac);
    		if ("windowTrash" in $$props) $$invalidate(1, windowTrash = $$props.windowTrash);
    		if ("root" in $$props) root = $$props.root;
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

    class Desktop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Desktop",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    function replaceContents(node) {
      node.innerHTML = '';
      return node;
    }

    var desktop = new Desktop({
      target: replaceContents(document.querySelector('#desktop')),
    });



    var main = { desktop };

    return main;

}());
//# sourceMappingURL=scripts.js.map
