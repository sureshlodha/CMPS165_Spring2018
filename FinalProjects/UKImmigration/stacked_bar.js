var stuff = function() {
    
var w = 600,
    h = 450,
    margin = {top: 20, right: 200, bottom: 30, left: 40},
    svg = d3.select("#stack_svg").attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom);
//    width = +svg.attr("width") - margin.left - margin.right,
//    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*var qMap = {
    Q1: '03',
    Q2: '06',
    Q3: '09',
    Q4: '12'
}*/

var parsedate = d3.timeParse('%Y'); // time and date parsing and formatting

var fmtdate = d3.timeFormat('%Y-%m');

function parseTime(dateQ) {
    // dateQ is a string xxxx-Qx
    /*console.log(dateQ);*/
    return parsedate(dateQ)
}
    
var formatComma = d3.format(",");
    
var x = d3.scaleBand()
    .paddingInner(0.1)
    .rangeRound([0, w]);

var y = d3.scaleLinear()
    .rangeRound([h, 0]);

var z = d3.scaleOrdinal()
    .domain(["total_work", "family", "total_dependent", "total_study_no_short", "study_short", "total_no_visit", "total_other" ])
    .range(["rgb(216, 224, 67)", "rgb(65, 173, 224)", "rgb(154, 46, 173)", "rgb(157, 224, 76)", "rgb(121, 150, 85)", "rgb(156, 173, 133)", "rgb(186, 196, 174)"]);

var stack = d3.stack()
    .order(d3.stackOrderNone)

// Legend

var quantize = d3.scaleQuantize()
    .range(["rgb(186, 196, 174)", "rgb(156, 173, 133)", "rgb(121, 150, 85)", "rgb(157, 224, 76)",  "rgb(154, 46, 173)", "rgb(65, 173, 224)", "rgb(216, 224, 67)"]);

//var svg = d3.select("svg");

svg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", `translate(${w + margin.left + 60},35)`);

var legendQuant = d3.legendColor()
    .shapeWidth(30)
    .shapeHeight(h/7 - 3)
    .cells(7)
    .orient("vertical")
    .labels(["Other", "Visit", "Short Term Study", "Long Term Study", "Dependent", "Family","Work"])
    .scale(quantize)

svg.select(".legendQuant")
    .call(legendQuant);
    
// tooltip
var tooltip = d3.select('#stack_svg_div')
    .append('div')
    .attr('class', 'tooltip');
    
tooltip.append('div')
    .attr('class', 'amount');
    
d3.csv("visa_totals_type_totals.csv", function(d, i, columns) {
//    console.log(d, columns);
    let [a, b, ...cols] = columns;
    d.total = 0;
    cols.forEach(col => {
        d.total += +d[col];
    });
//    console.log(d.Quarter, d.total);
//    d.Quarter = parseTime(d.Quarter);
//    console.log(d.Quarter);
  return d;
}, function(error, data) {
  if (error) throw error;
  var keys = data.columns.slice(1);
    console.log(keys);

  data.sort(function(a, b) { return b.total - a.total; });
    
    var stacked = stack.keys(keys)(data);
  x.domain(data.map(function(d) { return d.Quarter; }).sort());
    let barw = x.bandwidth();
    console.log(x.domain(), barw);
  y.domain([0, d3.max(stacked, function(d) {console.log(d); return +d[0][1]; })]).nice();
    console.log(y.domain());
    console.log(y.range());
  z.domain(keys);
    console.log(data);
    console.log(d3.stack().keys(keys)(data))

  g.append("g")
    .selectAll("g")
    .data(stacked)
    .enter().append("g")
      .attr('id', d => d.key)
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.Quarter); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(+d[0]) - +y(d[1]); })
      .attr("width", barw)
        .attr('id', d => fmtdate(d.data.Quarter))
      .on('mouseover', function(d) {
        console.log(d);
        tooltip.select('.amount').html("Visas: " + formatComma(d[1]-d[0]));
        tooltip.style('display', 'block');
      })
      .on('mouseout', function() {tooltip.style('display', 'none');})
      .on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
            .style('left', (d3.event.layerX - 25) + 'px');
  });
    
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + h + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis")
      .attr('transform', `translate(${w}, 0)`)
      .call(d3.axisRight(y))//.ticks(null, "s"))
    .append("text")
      .attr('transform', `translate(-100, 0)`)
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 1.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Total Visas granted");

 /* var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });*/
});
}

stuff();