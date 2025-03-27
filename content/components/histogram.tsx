import * as React from "npm:react";
import * as d3 from "npm:d3";

const largestRectangle = (Height) => {
  var stack = [],
    max_area = 0,
    area,
    x1,
    x2,
    y;

  Height.map((h, i) => {
    while (stack.length && h < Height[stack[stack.length - 1]]) calc_area(i);
    stack.push(i);
  });

  while (stack.length) calc_area(Height.length);

  return [x1, x2, y];

  function calc_area(i) {
    var j = stack.splice(stack.length - 1);
    var t = stack.length ? stack[stack.length - 1] + 1 : 0;
    area = Height[j] * (i - t);
    if (area > max_area) {
      max_area = area;
      y = Height[j];
      x1 = t;
      x2 = i;
    }
  }
};


export const LargestHistogram = ({N, H, speed, aspectRatio}: {N: number, H: number, speed: number, aspectRatio: string}) => {
  const el = React.useRef(null);
  const style = {width: "100%", position: "relative", paddingTop: aspectRatio};
  const styleInner = {position: "absolute", top: 0, left: 0, bottom: 0, right: 0};
  React.useEffect(() => {
    return histogram(el.current, N, H, speed);
  }, [N, H]);
  return (
    <div className="gol-container-outer" style={style}>
      <div className="gol-container" ref={el} style={styleInner}></div>
    </div>
  );
}

const histogram = (el, N, H, speed) => {
  const generateData = () => d3.range(0, N).map(d3.randomUniform(1, H - 2));
  const color = d3.scaleSequential(d3.interpolateViridis).domain([0, H + 5]);
  const areaColor = color(H + 5);
  const animation = {};
  let end = false;
  let data = generateData();

  d3.select(el).select("svg").remove();
  const svg = d3.select(el).append("svg");
  const paper = svg.append("g");
  const area = svg.append("rect").style("fill", areaColor).style("fill-opacity", 0.6);

  const width = el.offsetWidth,
    height = el.offsetHeight,
    barWidth = width / data.length,
    y = d3.scaleLinear().domain([0, H]).range([height, 0]);
  svg.attr("width", width).attr("height", height);

  paper
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("transform", (d, i) => "translate(" + i * barWidth + ")")
    .attr("y", y)
    .attr("height", (d) => height - y(d))
    .attr("width", barWidth - 1)
    .attr("fill", color)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round");

  paper.selectAll("rect").call(update, data).call(animate, 2000);

  function update(histogram, di) {
    var ad = largestRectangle(di);

    histogram
      .data(di)
      .attr("y", function (d) {
        return y(d);
      })
      .attr("height", function (d) {
        return height - y(d);
      })
      .attr("fill", function (d) {
        return color(d);
      });

    area
      .attr("transform", "translate(" + ad[0] * barWidth + "," + y(ad[2]) + ")")
      .attr("width", barWidth * (ad[1] - ad[0]) - 1)
      .attr("height", height - y(ad[2]));
  }

  function animate(histogram, duration) {
    if (end) return;

    const data1 = generateData(),
      Ht = d3.interpolateArray(data, data1);

    d3.select(animation)
      .transition()
      .duration(duration)
      .tween("attr:y", function () {
        return function (t) {
          update(histogram, Ht(t));
        };
      });

    d3.timeout(() => {
      data = data1;
      animate(histogram, duration);
    }, (Math.random() + 1) * duration);
  }

  return () => {
    end = true;
  }
};
