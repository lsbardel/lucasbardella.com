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
function to_number(value) {
    return value === '' ? undefined : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
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

// We need to keep a state across refresh
var planarity = (el, options) => {
  notebook
    .require(
      "d3-selection",
      "d3-scale",
      "d3-drag",
      "d3-transition",
      "d3-timer",
      "d3-format"
    )
    .then((d3) => {
      planarity$1(el, d3, state, options);
    });
};

// We need to keep a state across refresh
const state = {
  nodes: 8,
  radius: 15,
  points: [],
  links: [],
  crosses: 0,
  start: 0,
  moves: 0,
  time: 0,
  strokeWidth: 2,
  circleColor: "#4DA6FF",
  linkColor: "#555",
  interSectionColor: "#ff7600",
  highlightIntersections: true,
  update() {},
};

const randomNode = (node) => {
  var x = Math.random(),
    y = Math.random();
  if (node) {
    node[0] = x;
    node[1] = y;
  } else {
    node = [x, y];
  }
  return node;
};

const scramble = (graph) => {
  if (graph.points.length < 4) return graph;
  do {
    graph.points.forEach(randomNode);
  } while (!intersections(graph.links));
};

const addPlanarLink = (link, links) => {
  if (
    !links.some(function (to) {
      return intersect(link, to);
    })
  ) {
    links.push(link);
  }
};
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];

// Returns true if two line segments intersect.
// Based on http://stackoverflow.com/a/565282/64009
const intersect = (a, b) => {
  // Check if the segments are exactly the same (or just reversed).
  if ((a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]))
    return true;

  // Represent the segments as p + tr and q + us, where t and u are scalar
  // parameters.
  var p = a[0],
    r = [a[1][0] - p[0], a[1][1] - p[1]],
    q = b[0],
    s = [b[1][0] - q[0], b[1][1] - q[1]];

  // Solve p + tr = q + us to find an intersection point.
  // First, cross both sides with s:
  //   (p + tr) × s = (q + us) × s
  // We know that s × s = 0, so this can be rewritten as:
  //   t(r × s) = (q − p) × s
  // Then solve for t to get:
  //   t = (q − p) × s / (r × s)
  // Similarly, for u we get:
  //   u = (q − p) × r / (r × s)
  var rxs = cross(r, s),
    q_p = [q[0] - p[0], q[1] - p[1]],
    t = cross(q_p, s) / rxs,
    u = cross(q_p, r) / rxs,
    epsilon = 1e-6;

  return t > epsilon && t < 1 - epsilon && u > epsilon && u < 1 - epsilon;
};

const intersections = (links) => {
  var n = links.length,
    i = -1,
    j,
    x,
    count = 0;
  // Reset flags.
  while (++i < n) {
    (x = links[i]).intersection = false;
    x[0].intersection = false;
    x[1].intersection = false;
  }
  i = -1;
  while (++i < n) {
    x = links[i];
    j = i;
    while (++j < n) {
      if (intersect(x, links[j])) {
        x.intersection = x[0].intersection = x[1].intersection = links[
          j
        ].intersection = links[j][0].intersection = links[
          j
        ][1].intersection = true;
        count++;
      }
    }
  }
  return count;
};

const planarity$1 = (el, d3, graph, options) => {
  // Generates a random planar graph with *n* nodes.
  options = { ...graph, ...options };
  const format = d3.format(",.2f");

  graph.update = options.update ? options.update : graph.update;
  if (graph.points.length !== options.nodes || options.restart) {
    graph.nodes = options.nodes;
    graph.points = [];
    graph.links = [];
    graph.start = new Date();
    graph.moves = 0;
    if (!graph.timer)
      graph.timer = d3.timer(() => {
        if (graph.crosses) {
          graph.time = format((new Date() - graph.start) / 1000);
          graph.update(graph);
        }
      });
    for (let i = 0; i < graph.nodes; i++) graph.points.push(randomNode());
    for (let i = 0; i < graph.nodes; i++)
      addPlanarLink(
        [
          graph.points[i],
          graph.points[Math.floor(Math.random() * graph.nodes)],
        ],
        graph.links
      );
    for (let i = 0; i < graph.nodes; i++)
      for (let j = i + 1; j < graph.nodes; j++)
        addPlanarLink([graph.points[i], graph.points[j]], graph.links);
    scramble(graph);
  }
  // Set-up paper (first time only)
  const g = d3
    .select(el)
    .selectAll("svg")
    .data([0])
    .enter()
    .append("svg")
    .append("g");
  g.append("g").attr("class", "links");
  g.append("g").attr("class", "nodes");

  // re-draw the graph
  const padding = graph.radius + 2;
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  const vis = d3
    .select(el)
    .selectAll("svg")
    .attr("height", height)
    .attr("width", width)
    .selectAll("g")
    .attr("transform", "translate(" + [padding, padding] + ")");
  const lines = vis
    .selectAll(".links")
    .style("stroke-width", graph.strokeWidth)
    .style("stroke", graph.linkColor);
  const nodes = vis
    .selectAll(".nodes")
    .style("stroke-width", graph.strokeWidth)
    .style("stroke", graph.linkColor)
    .style("fill", graph.circleColor);

  const x = d3.scaleLinear().range([0, width - 2 * padding]);
  const y = d3.scaleLinear().range([0, height - 2 * padding]);
  update(options.restart);

  function update(transition) {
    graph.crosses = intersections(graph.links);
    const intersect = graph.highlightIntersections
      ? (d) => (d.intersection ? graph.interSectionColor : graph.linkColor)
      : graph.linkColor;

    var line = lines.selectAll("line").data(graph.links);
    line.exit().transition().remove();
    line
      .enter()
      .append("line")
      .attr("x1", (d) => x(d[0][0]))
      .attr("y1", (d) => y(d[0][1]))
      .attr("x2", (d) => x(d[1][0]))
      .attr("y2", (d) => y(d[1][1]))
      .style("stroke", intersect);

    if (transition) line = line.transition();
    line
      .attr("x1", (d) => x(d[0][0]))
      .attr("y1", (d) => y(d[0][1]))
      .attr("x2", (d) => x(d[1][0]))
      .attr("y2", (d) => y(d[1][1]))
      .style("stroke", intersect);

    const circles = nodes.selectAll("circle");
    let node = circles.data(graph.points);
    node.exit().transition().remove();
    node
      .enter()
      .append("circle")
      .attr("r", graph.radius)
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .call(
        d3
          .drag()
          .on("start", (d) => {
            if (!graph.crosses) circles.on(".drag", null);
            else
              return {
                x: x(d[0]),
                y: y(d[1]),
              };
          })
          .on("drag", (d) => {
            // Jitter to prevent coincident nodes.
            d[0] =
              Math.max(0, Math.min(1, x.invert(d3.event.x))) +
              Math.random() * 1e-4;
            d[1] =
              Math.max(0, Math.min(1, y.invert(d3.event.y))) +
              Math.random() * 1e-4;
            update();
          })
          .on("end", () => {
            ++graph.moves;
            options.update(graph);
          })
      );

    if (transition) node = node.transition();
    node.attr("cx", (d) => x(d[0])).attr("cy", (d) => y(d[1]));
    options.update(graph);
  }
};

/* content/lab/planarity/App.svelte generated by Svelte v3.23.2 */

function add_css() {
	var style = element("style");
	style.id = "svelte-1b1355s-style";
	style.textContent = ".full-height.svelte-1b1355s{height:100%}.game.svelte-1b1355s{height:90%;position:relative}.board.svelte-1b1355s{float:left}.main.svelte-1b1355s{position:absolute;top:0;left:0;right:0;bottom:0}";
	append(document.head, style);
}

function create_fragment(ctx) {
	let div4;
	let div0;
	let label;
	let input0;
	let t0;
	let input1;
	let t1;
	let buttom;
	let t3;
	let div3;
	let div1;
	let p0;
	let t4;
	let t5;
	let t6;
	let p1;
	let t7;
	let t8;
	let t9;
	let p2;
	let t10;
	let code;
	let t11;
	let t12;
	let t13;
	let div2;
	let mounted;
	let dispose;

	return {
		c() {
			div4 = element("div");
			div0 = element("div");
			label = element("label");
			input0 = element("input");
			t0 = space();
			input1 = element("input");
			t1 = space();
			buttom = element("buttom");
			buttom.textContent = "Restart";
			t3 = space();
			div3 = element("div");
			div1 = element("div");
			p0 = element("p");
			t4 = text("Moves: ");
			t5 = text(/*moves*/ ctx[1]);
			t6 = space();
			p1 = element("p");
			t7 = text("Crosses: ");
			t8 = text(/*crosses*/ ctx[3]);
			t9 = space();
			p2 = element("p");
			t10 = text("Time:\n        ");
			code = element("code");
			t11 = text(/*time*/ ctx[2]);
			t12 = text("\n        seconds");
			t13 = space();
			div2 = element("div");
			attr(input0, "type", "number");
			attr(input0, "min", "4");
			attr(input0, "max", "20");
			attr(input1, "type", "range");
			attr(input1, "min", "4");
			attr(input1, "max", "20");
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
			append(div0, label);
			append(label, input0);
			set_input_value(input0, /*nodes*/ ctx[0]);
			append(label, t0);
			append(label, input1);
			set_input_value(input1, /*nodes*/ ctx[0]);
			append(div0, t1);
			append(div0, buttom);
			append(div4, t3);
			append(div4, div3);
			append(div3, div1);
			append(div1, p0);
			append(p0, t4);
			append(p0, t5);
			append(div1, t6);
			append(div1, p1);
			append(p1, t7);
			append(p1, t8);
			append(div1, t9);
			append(div1, p2);
			append(p2, t10);
			append(p2, code);
			append(code, t11);
			append(p2, t12);
			append(div3, t13);
			append(div3, div2);
			/*div2_binding*/ ctx[8](div2);

			if (!mounted) {
				dispose = [
					listen(input0, "input", /*input0_input_handler*/ ctx[6]),
					listen(input1, "change", /*input1_change_input_handler*/ ctx[7]),
					listen(input1, "input", /*input1_change_input_handler*/ ctx[7]),
					listen(buttom, "click", /*restart*/ ctx[5])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*nodes*/ 1 && to_number(input0.value) !== /*nodes*/ ctx[0]) {
				set_input_value(input0, /*nodes*/ ctx[0]);
			}

			if (dirty & /*nodes*/ 1) {
				set_input_value(input1, /*nodes*/ ctx[0]);
			}

			if (dirty & /*moves*/ 2) set_data(t5, /*moves*/ ctx[1]);
			if (dirty & /*crosses*/ 8) set_data(t8, /*crosses*/ ctx[3]);
			if (dirty & /*time*/ 4) set_data(t11, /*time*/ ctx[2]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div4);
			/*div2_binding*/ ctx[8](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let nodes = 8;
	let moves = 0;
	let time = 0;
	let crosses = 0;
	let game;

	function update(state) {
		$$invalidate(1, moves = state.moves);
		$$invalidate(2, time = state.time);
		$$invalidate(3, crosses = state.crosses);
	}

	function restart() {
		planarity(game, { nodes, update, restart: true });
	}

	onMount(() => {
		planarity(game, { nodes, update });
	});

	function input0_input_handler() {
		nodes = to_number(this.value);
		$$invalidate(0, nodes);
	}

	function input1_change_input_handler() {
		nodes = to_number(this.value);
		$$invalidate(0, nodes);
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			game = $$value;
			$$invalidate(4, game);
		});
	}

	return [
		nodes,
		moves,
		time,
		crosses,
		game,
		restart,
		input0_input_handler,
		input1_change_input_handler,
		div2_binding
	];
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
