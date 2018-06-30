/*
TODO:
2 - Rescale the color scale to actually see the more dense areas of severity
3 - color legend
4 - label axes
5 - can select bars to grey out other bars
6 - 2 modes, stacked bar and severity
*/

//define the margins
var margin = {top: 10, right: 40, bottom: 150, left: 70},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//define the svg
var svg = d3.select("body").append("svg") //will need to change body to something else
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//color scale data
var colorRange = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'];
var colorDomain = [];

//scales
var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);
var yScale = d3.scaleLinear().range([height, 0]);
var cScale = d3.scaleThreshold().range(colorRange);

//create the x and y axes
var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale); //.ticks .tickformat



d3.csv("AggregateInjuries(1).csv", function(error, data) {
    data.forEach(function(d) {
        d.type = d.injury_type;
        d.number = +d.num_injuries;
        d.severity = +d.total_severity / +d.num_injuries;
    });
    
    //block for color scale domain
    cMax = d3.max(data, function(d) { return d.severity; });
    cMin = d3.min(data, function(d) { return d.severity; }); //maybe try 0 to see impact
    
    d = (cMax - cMin)/5;
    
    colorDomain = [cMin + 1*d, cMin + 2*d, cMin + 3*d, cMin + 4*d, cMin + 5*d];
    
    //update the domains of the scales with the data
    xScale.domain(data.map(function(d) { return d.type; }));
    yScale.domain([0, d3.max(data, function(d) { return d.number; })]);
    cScale.domain(colorDomain);
    
    //draw the bars
    var bars = svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", height)
        .attr("height", 0)
        .attr("width", xScale.bandwidth())
        .attr("x", function(d) {
            return xScale(d.type);
        })
        .transition().ease(d3.easeCubic).duration(1200)
        .delay(function(d,i) { return i*100; })
        .attr("y", function(d) {
            return yScale(d.number);
        })
        .attr("height", function(d) {
            return height - yScale(d.number);
        })
        .attr("stroke", "#000000")
        .attr("fill", function(d) {
            return(cScale(d.severity))
        });
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-0.8em")
        .attr("dy", ".25em")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-60)");
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll("text");
})