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
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
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
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
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
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
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
    $set() {
        // overridden by instance, if it has props
    }
}

const noop$1 = () => {};

const state = {
  margin: 0,
  height: "100%",
  rounding: 5,
  rmin: 0.02,
  rscale: 4,
  levels: 50,
  size: 0.7,
  circleColor: "#1f77b4",
  circleOpacity: 0.5,
  strokeColor: "#1f77b4",
  impactColor: "#000",
  strokeWidth: 2,
  nodes: [],
  pi: 0,
  draw(el, options) {
    notebook
      .require(
        "d3-selection",
        "d3-scale",
        "d3-array",
        "d3-scale-chromatic",
        "d3-timer",
        "d3-quant"
      )
      .then((d3) => {
        draw(el, d3, options);
      });
  },
};

const draw = (el, d3, options) => {
  options = options || {};
  let svg = d3.select(el).selectAll("svg").data([0]).enter().append("svg");
  svg.append("rect");
  svg.append("circle");
  svg.append("g").classed("nodes", true);

  const width = el.offsetWidth,
    update = options.update || noop$1,
    height = el.offsetHeight,
    radius = 0.5 * state.size * Math.min(width, height),
    rmin = Math.max(1, state.rmin * radius),
    rmax = state.rscale * rmin,
    levels = state.levels,
    colors = d3.scaleOrdinal(
      d3.range(levels, 0, -1).map((t) => d3.interpolateInferno(t / levels))
    ),
    x = d3.scaleLinear().range([0, width]).domain([-1, 1]),
    y = d3.scaleLinear().range([0, height]).domain([-1, 1]),
    cx = d3
      .scaleLinear()
      .range([width / 2, radius])
      .domain([0, levels]),
    cy = d3
      .scaleLinear()
      .range([height / 2, radius])
      .domain([0, levels]),
    cr = d3.scaleLinear().range([rmax, rmin]).domain([0, state.levels]);

  svg = d3.select(el).select("svg").attr("height", height).attr("width", width);
  svg
    .select("rect")
    .attr("x", x(0) - radius)
    .attr("y", y(0) - radius)
    .attr("width", 2 * radius)
    .attr("height", 2 * radius)
    .attr("fill", "none")
    .attr("stroke", state.strokeColor)
    .attr("stroke-width", state.strokeWidth);
  svg
    .select("circle")
    .attr("cx", x(0))
    .attr("cy", y(0))
    .attr("r", radius)
    .classed("target", true)
    .attr("fill", state.circleColor)
    .attr("fill-opacity", state.circleOpacity)
    .attr("stroke-width", state.strokeWidth)
    .attr("stroke", state.scrokeColor);
  const nodes = svg
    .select(".nodes")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  if (!state.anim || options.restart) {
    if (state.anim) {
      state.anim.viz.stop();
      state.anim = undefined;
      nodes.html("");
    }
    state.anim = {
      sobol: d3.sobol(2),
      nodes: [],
      circle: 0,
      total: 0,
      target: d3.round(Math.PI, state.rounding),
    };
    state.anim.viz = d3.timer(() => {
      if (!state.anim.targetValue) {
        const xy = state.anim.sobol.next();

        const node = {
          x: 2 * (xy[0] - 0.5),
          y: 2 * (xy[1] - 0.5),
          l: 0,
        };
        state.anim.total += 1;
        if (node.x * node.x + node.y * node.y < 1) state.anim.circle += 1;

        const pival = (4 * state.anim.circle) / state.anim.total;
        state.anim.pi = d3.round(pival, state.rounding);
        state.anim.nodes.push(node);
        if (state.anim.pi === state.anim.target) state.anim.targetValue = pival;
        update(state.anim);
      }

      state.anim.nodes.forEach((node) => {
        if (node.l < levels) node.l++;
      });
      render();
    });
  } else {
    render();
  }

  function render() {
    const circles = nodes.selectAll("circle").data(state.anim.nodes);
    circles
      .enter()
      .append("circle")
      .attr("cx", (d) => cx(d.l) * d.x)
      .attr("cy", (d) => cy(d.l) * d.y)
      .attr("r", (d) => cr(d.l))
      .attr("fill", (d) => colors(d.l));

    circles
      .attr("cx", (d) => cx(d.l) * d.x)
      .attr("cy", (d) => cy(d.l) * d.y)
      .attr("r", (d) => cr(d.l))
      .attr("fill", (d) => colors(d.l));
  }
};

/* content/lab/pi/App.svelte generated by Svelte v3.23.2 */

function add_css() {
	var style = element("style");
	style.id = "svelte-1b1355s-style";
	style.textContent = ".full-height.svelte-1b1355s{height:100%}.game.svelte-1b1355s{height:90%;position:relative}.board.svelte-1b1355s{float:left}.main.svelte-1b1355s{position:absolute;top:0;left:0;right:0;bottom:0}";
	append(document.head, style);
}

function create_fragment(ctx) {
	let div4;
	let div0;
	let buttom;
	let t1;
	let div3;
	let div1;
	let p0;
	let t2;
	let t3;
	let t4;
	let p1;
	let t5;
	let t6;
	let t7;
	let div2;
	let mounted;
	let dispose;

	return {
		c() {
			div4 = element("div");
			div0 = element("div");
			buttom = element("buttom");
			buttom.textContent = "Restart";
			t1 = space();
			div3 = element("div");
			div1 = element("div");
			p0 = element("p");
			t2 = text("π: ");
			t3 = text(/*pival*/ ctx[1]);
			t4 = space();
			p1 = element("p");
			t5 = text("Points: ");
			t6 = text(/*points*/ ctx[0]);
			t7 = space();
			div2 = element("div");
			attr(buttom, "class", "pure-button pure-button-primary");
			attr(div0, "class", "pure-u-1");
			attr(div1, "class", "board svelte-1b1355s");
			attr(div2, "class", "full-height main svelte-1b1355s");
			attr(div3, "class", "pure-u-1 game svelte-1b1355s");
			attr(div4, "class", "pure-g full-height svelte-1b1355s");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div0);
			append(div0, buttom);
			append(div4, t1);
			append(div4, div3);
			append(div3, div1);
			append(div1, p0);
			append(p0, t2);
			append(p0, t3);
			append(div1, t4);
			append(div1, p1);
			append(p1, t5);
			append(p1, t6);
			append(div3, t7);
			append(div3, div2);
			/*div2_binding*/ ctx[4](div2);

			if (!mounted) {
				dispose = listen(buttom, "click", /*restart*/ ctx[3]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*pival*/ 2) set_data(t3, /*pival*/ ctx[1]);
			if (dirty & /*points*/ 1) set_data(t6, /*points*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div4);
			/*div2_binding*/ ctx[4](null);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let points = 0;
	let pival = 0;
	let game;
	if (state.anim) update(state.anim);

	function update(anim) {
		$$invalidate(0, points = anim.nodes.length);
		$$invalidate(1, pival = anim.pi);
	}

	function restart() {
		state.draw(game, { update, restart: true });
	}

	onMount(() => {
		state.draw(game, { update });
	});

	function div2_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			game = $$value;
			$$invalidate(2, game);
		});
	}

	return [points, pival, game, restart, div2_binding];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1b1355s-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

var main = (el) => {
  new App({ target: el });
};

export default main;
