
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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

    /* src/Window.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file = "src/Window.svelte";

    function create_fragment(ctx) {
    	let div1;
    	let header;
    	let button;
    	let t1;
    	let div0;
    	let h2;
    	let t3;
    	let section;
    	let h1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			button = element("button");
    			button.textContent = "close";
    			t1 = space();
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = `${/*title*/ ctx[0]}`;
    			t3 = space();
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Pezillionaire Interactive Manufacturing";
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "window-close svelte-3ct6ft");
    			add_location(button, file, 65, 4, 1433);
    			attr_dev(h2, "class", "svelte-3ct6ft");
    			add_location(h2, file, 70, 6, 1569);
    			attr_dev(div0, "class", "window-title svelte-3ct6ft");
    			add_location(div0, file, 69, 4, 1536);
    			attr_dev(header, "class", "window-header svelte-3ct6ft");
    			add_location(header, file, 64, 2, 1398);
    			add_location(h1, file, 74, 4, 1645);
    			attr_dev(section, "class", "window-main svelte-3ct6ft");
    			add_location(section, file, 73, 2, 1611);
    			attr_dev(div1, "class", "window svelte-3ct6ft");
    			add_location(div1, file, 63, 0, 1375);
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
    			append_dev(div1, t3);
    			append_dev(div1, section);
    			append_dev(section, h1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", handleClick, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function handleClick() {
    	console.log("click");
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, []);
    	let title = "Title";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ title, handleClick });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Desktop.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/Desktop.svelte";

    function create_fragment$1(ctx) {
    	let window;
    	let t0;
    	let section;
    	let div0;
    	let svg0;
    	let path0;
    	let path1;
    	let t1;
    	let span0;
    	let t3;
    	let div1;
    	let svg1;
    	let path2;
    	let path3;
    	let t4;
    	let span1;
    	let current;
    	window = new Window({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(window.$$.fragment);
    			t0 = space();
    			section = element("section");
    			div0 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "Pez HD";
    			t3 = space();
    			div1 = element("div");
    			svg1 = svg_element("svg");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			t4 = space();
    			span1 = element("span");
    			span1.textContent = "Trash";
    			attr_dev(path0, "class", "svg-prime");
    			attr_dev(path0, "d", "M2 0h44M2 1h44M0 2h2m44 0h2M0 3h2m44 0h2M0 4h2m44 0h2M0 5h2m44 0h2M0 6h2m6 0h32m6 0h2M0 7h2m6 0h32m6 0h2M0 8h2m4 0h2m32 0h2m4 0h2M0 9h2m4 0h2m32 0h2m4 0h2M0 10h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m8 0h2m4 0h2M0 11h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m8 0h2m4 0h2M0 12h2m4 0h2m32 0h2m4 0h2M0 13h2m4 0h2m32 0h2m4 0h2M0 14h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m16 0h2m4 0h2M0 15h2m4 0h2m2 0h2m2 0h2m2 0h2m2 0h2m16 0h2m4 0h2M0 16h2m4 0h2m32 0h2m4 0h2M0 17h2m4 0h2m32 0h2m4 0h2M0 18h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2M0 19h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2M0 20h2m4 0h2m32 0h2m4 0h2M0 21h2m4 0h2m32 0h2m4 0h2M0 22h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2M0 23h2m4 0h2m2 0h2m2 0h2m24 0h2m4 0h2M0 24h2m4 0h2m32 0h2m4 0h2M0 25h2m4 0h2m32 0h2m4 0h2M0 26h2m4 0h2m2 0h2m2 0h2m2 0h2m20 0h2m4 0h2M0 27h2m4 0h2m2 0h2m2 0h2m2 0h2m20 0h2m4 0h2M0 28h2m4 0h2m32 0h2m4 0h2M0 29h2m4 0h2m32 0h2m4 0h2M0 30h2m4 0h2m32 0h2m4 0h2M0 31h2m4 0h2m32 0h2m4 0h2M0 32h2m6 0h32m6 0h2M0 33h2m6 0h32m6 0h2M0 34h2m44 0h2M0 35h2m44 0h2M0 36h2m44 0h2M0 37h2m44 0h2M0 38h2m44 0h2M0 39h2m44 0h2M0 40h2m44 0h2M0 41h2m44 0h2M0 42h2m22 0h16m6 0h2M0 43h2m22 0h16m6 0h2M0 44h2m44 0h2M0 45h2m44 0h2M0 46h2m44 0h2M0 47h2m44 0h2M0 48h2m44 0h2M0 49h2m44 0h2M0 50h2m44 0h2M0 51h2m44 0h2M2 52h46M2 53h46M2 54h2m40 0h2M2 55h2m40 0h2M2 56h2m40 0h2M2 57h2m40 0h2M2 58h2m40 0h2M2 59h2m40 0h2M2 60h44M2 61h44");
    			add_location(path0, file$1, 9, 6, 226);
    			attr_dev(path1, "class", "svg-alt");
    			attr_dev(path1, "d", "M2 2h44M2 3h44M2 4h44M2 5h44M2 6h6m32 0h6M2 7h6m32 0h6M2 8h4m2 0h32m2 0h4M2 9h4m2 0h32m2 0h4M2 10h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h8m2 0h4M2 11h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h2m2 0h8m2 0h4M2 12h4m2 0h32m2 0h4M2 13h4m2 0h32m2 0h4M2 14h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h16m2 0h4M2 15h4m2 0h2m2 0h2m2 0h2m2 0h2m2 0h16m2 0h4M2 16h4m2 0h32m2 0h4M2 17h4m2 0h32m2 0h4M2 18h4m2 0h2m2 0h2m2 0h24m2 0h4M2 19h4m2 0h2m2 0h2m2 0h24m2 0h4M2 20h4m2 0h32m2 0h4M2 21h4m2 0h32m2 0h4M2 22h4m2 0h2m2 0h2m2 0h24m2 0h4M2 23h4m2 0h2m2 0h2m2 0h24m2 0h4M2 24h4m2 0h32m2 0h4M2 25h4m2 0h32m2 0h4M2 26h4m2 0h2m2 0h2m2 0h2m2 0h20m2 0h4M2 27h4m2 0h2m2 0h2m2 0h2m2 0h20m2 0h4M2 28h4m2 0h32m2 0h4M2 29h4m2 0h32m2 0h4M2 30h4m2 0h32m2 0h4M2 31h4m2 0h32m2 0h4M2 32h6m32 0h6M2 33h6m32 0h6M2 34h44M2 35h44M2 36h44M2 37h44M2 38h44M2 39h44M2 40h44M2 41h44M2 42h22m16 0h6M2 43h22m16 0h6M2 44h44M2 45h44M2 46h44M2 47h44M2 48h44M2 49h44M2 50h44M2 51h44M4 54h40M4 55h40M4 56h40M4 57h40M4 58h40M4 59h40");
    			add_location(path1, file$1, 10, 6, 1613);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 -0.5 48 62");
    			attr_dev(svg0, "shape-rendering", "crispEdges");
    			add_location(svg0, file$1, 8, 4, 127);
    			add_location(span0, file$1, 12, 4, 2625);
    			attr_dev(div0, "class", "icon mac");
    			add_location(div0, file$1, 7, 2, 100);
    			attr_dev(path2, "class", "svg-prime");
    			attr_dev(path2, "d", "M16 0h12M16 1h12M14 2h2m12 0h2M14 3h2m12 0h2M2 4h40M2 5h40M0 6h2m40 0h2M0 7h2m40 0h2M0 8h44M0 9h44M2 10h2m36 0h2M2 11h2m36 0h2M2 12h2m36 0h2M2 13h2m36 0h2M2 14h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2M2 15h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2M2 16h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 17h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 18h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 19h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 20h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 21h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 22h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 23h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 24h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 25h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 26h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 27h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 28h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 29h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 30h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 31h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 32h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 33h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 34h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 35h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 36h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 37h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 38h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 39h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 40h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 41h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 42h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 43h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 44h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 45h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 46h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 47h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 48h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 49h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 50h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 51h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 52h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 53h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 54h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 55h2m6 0h2m6 0h2m6 0h2m6 0h2m4 0h2M2 56h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2M2 57h2m4 0h2m6 0h2m6 0h2m6 0h2m6 0h2M2 58h2m36 0h2M2 59h2m36 0h2M2 60h2m36 0h2M2 61h2m36 0h2M4 62h36M4 63h36");
    			add_location(path2, file$1, 16, 6, 2784);
    			attr_dev(path3, "class", "svg-alt");
    			attr_dev(path3, "d", "M16 2h12M16 3h12M2 6h40M2 7h40M4 10h36M4 11h36M4 12h36M4 13h36M4 14h4m2 0h6m2 0h6m2 0h6m2 0h6M4 15h4m2 0h6m2 0h6m2 0h6m2 0h6M4 16h6m2 0h6m2 0h6m2 0h6m2 0h4M4 17h6m2 0h6m2 0h6m2 0h6m2 0h4M4 18h6m2 0h6m2 0h6m2 0h6m2 0h4M4 19h6m2 0h6m2 0h6m2 0h6m2 0h4M4 20h6m2 0h6m2 0h6m2 0h6m2 0h4M4 21h6m2 0h6m2 0h6m2 0h6m2 0h4M4 22h6m2 0h6m2 0h6m2 0h6m2 0h4M4 23h6m2 0h6m2 0h6m2 0h6m2 0h4M4 24h6m2 0h6m2 0h6m2 0h6m2 0h4M4 25h6m2 0h6m2 0h6m2 0h6m2 0h4M4 26h6m2 0h6m2 0h6m2 0h6m2 0h4M4 27h6m2 0h6m2 0h6m2 0h6m2 0h4M4 28h6m2 0h6m2 0h6m2 0h6m2 0h4M4 29h6m2 0h6m2 0h6m2 0h6m2 0h4M4 30h6m2 0h6m2 0h6m2 0h6m2 0h4M4 31h6m2 0h6m2 0h6m2 0h6m2 0h4M4 32h6m2 0h6m2 0h6m2 0h6m2 0h4M4 33h6m2 0h6m2 0h6m2 0h6m2 0h4M4 34h6m2 0h6m2 0h6m2 0h6m2 0h4M4 35h6m2 0h6m2 0h6m2 0h6m2 0h4M4 36h6m2 0h6m2 0h6m2 0h6m2 0h4M4 37h6m2 0h6m2 0h6m2 0h6m2 0h4M4 38h6m2 0h6m2 0h6m2 0h6m2 0h4M4 39h6m2 0h6m2 0h6m2 0h6m2 0h4M4 40h6m2 0h6m2 0h6m2 0h6m2 0h4M4 41h6m2 0h6m2 0h6m2 0h6m2 0h4M4 42h6m2 0h6m2 0h6m2 0h6m2 0h4M4 43h6m2 0h6m2 0h6m2 0h6m2 0h4M4 44h6m2 0h6m2 0h6m2 0h6m2 0h4M4 45h6m2 0h6m2 0h6m2 0h6m2 0h4M4 46h6m2 0h6m2 0h6m2 0h6m2 0h4M4 47h6m2 0h6m2 0h6m2 0h6m2 0h4M4 48h6m2 0h6m2 0h6m2 0h6m2 0h4M4 49h6m2 0h6m2 0h6m2 0h6m2 0h4M4 50h6m2 0h6m2 0h6m2 0h6m2 0h4M4 51h6m2 0h6m2 0h6m2 0h6m2 0h4M4 52h6m2 0h6m2 0h6m2 0h6m2 0h4M4 53h6m2 0h6m2 0h6m2 0h6m2 0h4M4 54h6m2 0h6m2 0h6m2 0h6m2 0h4M4 55h6m2 0h6m2 0h6m2 0h6m2 0h4M4 56h4m2 0h6m2 0h6m2 0h6m2 0h6M4 57h4m2 0h6m2 0h6m2 0h6m2 0h6M4 58h36M4 59h36M4 60h36M4 61h36");
    			add_location(path3, file$1, 17, 6, 4675);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 -0.5 44 64");
    			attr_dev(svg1, "shape-rendering", "crispEdges");
    			add_location(svg1, file$1, 15, 4, 2685);
    			add_location(span1, file$1, 19, 4, 6177);
    			attr_dev(div1, "class", "icon trash");
    			add_location(div1, file$1, 14, 2, 2656);
    			attr_dev(section, "class", "desktop");
    			add_location(section, file$1, 6, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(window, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(div0, t1);
    			append_dev(div0, span0);
    			append_dev(section, t3);
    			append_dev(section, div1);
    			append_dev(div1, svg1);
    			append_dev(svg1, path2);
    			append_dev(svg1, path3);
    			append_dev(div1, t4);
    			append_dev(div1, span1);
    			current = true;
    		},
    		p: noop,
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
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
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
    	validate_slots("Desktop", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Desktop> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Window });
    	return [];
    }

    class Desktop extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Desktop",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Clock.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/Clock.svelte";

    function create_fragment$2(ctx) {
    	let time;
    	let t_value = /*formatter*/ ctx[1].format(/*date*/ ctx[0]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			time = element("time");
    			t = text(t_value);
    			attr_dev(time, "datetime", /*date*/ ctx[0]);
    			add_location(time, file$2, 19, 0, 361);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clock",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    function replaceContents(node) {
      node.innerHTML = '';
      return node;
    }

    var clock = new Clock({
      target: replaceContents(document.querySelector('#clock')),
    });

    var desktop = new Desktop({
      target: replaceContents(document.querySelector('#desktop')),
    });

    var main = { clock, desktop };

    return main;

}());
//# sourceMappingURL=scripts.js.map
