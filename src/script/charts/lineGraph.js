import { locationChange } from '../locationSelect';
var data, svg;

var margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = 1280 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


var x = d3.scaleTime()
  .range([0, width]);
var y = d3.scaleLinear()
  .domain([0, 11])
  .range([height, 0]);


var xAxis = d3.axisBottom()
  .scale(x);
var yAxis = d3.axisLeft()
  .scale(y)
  .tickSize(3, 0);


var mean = d3.line()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.mean); });
var bandsArea = d3.area()
  .x(function(d) { return x(d.date); })
  .y0(function(d) { return y(d.low); })
  .y1(function(d) { return y(d.high); });


export default function (d, location, selector) {
  svg = d3.select(selector)
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  data = d;

  const bandsData = getBollingerBands(config.n, config.k, data, location);

  x.domain(d3.extent(data, function(d) { return d.date; }));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg.append("path")
    .datum(bandsData)
    .attr("class", "area bands deviation")
    .attr("d", bandsArea);

  svg.append("path")
    .datum(bandsData)
    .attr("class", "line mean bands")
    .attr("d", mean);

  // Add the scatterplot
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
      .attr("class", "scatterplot dot")
      .attr("r", 1)
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d[location].mean); });
}


locationChange.subscribe(update);

function update(location) {
  const bandsData = getBollingerBands(config.n, config.k, data, location);

  console.log("yay", svg.select(".deviation"));

  svg.select(".deviation")
    .datum(bandsData)
    .transition().duration(1000)
    .attr("d", bandsArea);

  svg.select(".mean")
    .datum(bandsData)
    .transition().duration(1000)
    .attr("d", mean);

  // Add the scatterplot
  svg.selectAll(".scatterplot")
    .data(data)
    .transition().duration(1000)
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d[location].mean); });
}

function getBollingerBands(n, k, data, location) {
  var bands = [];
  for (var i = 1, len = data.length; i < len; i++) {
    var slice = data.slice(Math.max(i + 1 - n, 0), i);
    var mean = d3.mean(slice, function(d) { return d[location].mean; });
    var stdDev = Math.sqrt(d3.mean(slice.map(function(d) {
      return Math.pow(d[location].mean - mean, 2);
    })));
    bands.push({ date: data[i].date,
     mean: mean,
     low: mean - (k * stdDev),
     high: mean + (k * stdDev) });
  }
  return bands;
}
