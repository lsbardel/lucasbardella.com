function noop() { }
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
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
function element(name) {
    return document.createElement(name);
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
function to_number(value) {
    return value === '' ? null : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}

let current_component;
function set_current_component(component) {
    current_component = component;
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
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    // Do not reenter flush while dirty components are updated, as this can
    // result in an infinite loop. Instead, let the inner flush handle it.
    // Reentrancy is ok afterwards for bindings etc.
    if (flushidx !== 0) {
        return;
    }
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        try {
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
        }
        catch (e) {
            // reset dirty state to not end up in a deadlocked state and then rethrow
            dirty_components.length = 0;
            flushidx = 0;
            throw e;
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
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
    seen_callbacks.clear();
    set_current_component(saved_component);
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
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
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
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
        mount_component(component, options.target, options.anchor, options.customElement);
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
        if (!is_function(callback)) {
            return noop;
        }
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

/* content/lab/svelte/App.svelte generated by Svelte v3.55.1 */

function create_fragment(ctx) {
	let form;
	let fieldset;
	let label0;
	let input0;
	let t0;
	let input1;
	let t1;
	let label1;
	let input2;
	let t2;
	let input3;
	let t3;
	let p;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8_value = /*a*/ ctx[0] + /*b*/ ctx[1] + "";
	let t8;
	let mounted;
	let dispose;

	return {
		c() {
			form = element("form");
			fieldset = element("fieldset");
			label0 = element("label");
			input0 = element("input");
			t0 = space();
			input1 = element("input");
			t1 = space();
			label1 = element("label");
			input2 = element("input");
			t2 = space();
			input3 = element("input");
			t3 = space();
			p = element("p");
			t4 = text(/*a*/ ctx[0]);
			t5 = text(" + ");
			t6 = text(/*b*/ ctx[1]);
			t7 = text(" = ");
			t8 = text(t8_value);
			attr(input0, "type", "number");
			attr(input0, "min", "0");
			attr(input0, "max", "10");
			attr(input1, "type", "range");
			attr(input1, "min", "0");
			attr(input1, "max", "10");
			attr(input2, "type", "number");
			attr(input2, "min", "0");
			attr(input2, "max", "10");
			attr(input3, "type", "range");
			attr(input3, "min", "0");
			attr(input3, "max", "10");
			attr(form, "class", "pure-form pure-form-stacked");
		},
		m(target, anchor) {
			insert(target, form, anchor);
			append(form, fieldset);
			append(fieldset, label0);
			append(label0, input0);
			set_input_value(input0, /*a*/ ctx[0]);
			append(label0, t0);
			append(label0, input1);
			set_input_value(input1, /*a*/ ctx[0]);
			append(fieldset, t1);
			append(fieldset, label1);
			append(label1, input2);
			set_input_value(input2, /*b*/ ctx[1]);
			append(label1, t2);
			append(label1, input3);
			set_input_value(input3, /*b*/ ctx[1]);
			insert(target, t3, anchor);
			insert(target, p, anchor);
			append(p, t4);
			append(p, t5);
			append(p, t6);
			append(p, t7);
			append(p, t8);

			if (!mounted) {
				dispose = [
					listen(input0, "input", /*input0_input_handler*/ ctx[2]),
					listen(input1, "change", /*input1_change_input_handler*/ ctx[3]),
					listen(input1, "input", /*input1_change_input_handler*/ ctx[3]),
					listen(input2, "input", /*input2_input_handler*/ ctx[4]),
					listen(input3, "change", /*input3_change_input_handler*/ ctx[5]),
					listen(input3, "input", /*input3_change_input_handler*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*a*/ 1 && to_number(input0.value) !== /*a*/ ctx[0]) {
				set_input_value(input0, /*a*/ ctx[0]);
			}

			if (dirty & /*a*/ 1) {
				set_input_value(input1, /*a*/ ctx[0]);
			}

			if (dirty & /*b*/ 2 && to_number(input2.value) !== /*b*/ ctx[1]) {
				set_input_value(input2, /*b*/ ctx[1]);
			}

			if (dirty & /*b*/ 2) {
				set_input_value(input3, /*b*/ ctx[1]);
			}

			if (dirty & /*a*/ 1) set_data(t4, /*a*/ ctx[0]);
			if (dirty & /*b*/ 2) set_data(t6, /*b*/ ctx[1]);
			if (dirty & /*a, b*/ 3 && t8_value !== (t8_value = /*a*/ ctx[0] + /*b*/ ctx[1] + "")) set_data(t8, t8_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(form);
			if (detaching) detach(t3);
			if (detaching) detach(p);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let a = 1;
	let b = 2;

	function input0_input_handler() {
		a = to_number(this.value);
		$$invalidate(0, a);
	}

	function input1_change_input_handler() {
		a = to_number(this.value);
		$$invalidate(0, a);
	}

	function input2_input_handler() {
		b = to_number(this.value);
		$$invalidate(1, b);
	}

	function input3_change_input_handler() {
		b = to_number(this.value);
		$$invalidate(1, b);
	}

	return [
		a,
		b,
		input0_input_handler,
		input1_change_input_handler,
		input2_input_handler,
		input3_change_input_handler
	];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

var main = (notebook, el) => {
  new App({ target: el });
};

export { main as default };
//# sourceMappingURL=main.js.map
