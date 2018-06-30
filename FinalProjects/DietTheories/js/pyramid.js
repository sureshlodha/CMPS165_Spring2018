// Reference:
// - https://bl.ocks.org/borgar/b952bb581923c9993d68

var d3;

// SET UP DIMENSIONS
var w = 770,
  h = 400;

// margin.middle is distance from center line to each y-axis
var margin = {
    top: 20,
    right: 124,
    bottom: 50,
    left: 195,
    middle: 28
};


// the width of each side of the chart
// <-regionWidth-><-middle-><-middle-><-regionWidth->
var regionWidth = w  / 2 - margin.middle - 20;

// these are the x-coordinates of the y-axes
var pointA = regionWidth; //left
var pointB = w - regionWidth; //right

// svg transform string
function translation(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

var categories;
var yScale;
var xScale;

d3.csv('data/food.csv', function(data) {
    // Group databy year
    d3.select(".pyramid")
        .append('p')
        .html('Diet Recommended Servings Per Day')
        .style('text-align', 'center');
    
    var chart = d3.select(".pyramid")
        .append('svg')
        .attr("id", "chart")
        .attr("height", h)
        .attr("width", w)
        .style('margin', 'auto')
        .style('display', 'block')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

    var maxValue = Math.max(
        d3.max(data, function(d) {
            return +d.serving;
        }),
        d3.max(data, function(d) {
            return +d.serving;
        })
    );
  
    // d3.scale.linear()
    xScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, regionWidth -9])
        .nice();
    
    // d3.scale.ordinal()
    yScale = d3.scaleBand()
                .domain(data.map(function(d) {
                    return d.category;
                }))
                .rangeRound([h - margin.bottom, 0], 0.1);

    
    // d3.scale.ordinal()
    var color = d3.scaleOrdinal()
        .range(["#b2907c", "#a1bb00", "#ed3030", "#8acbe3", "#ffba00", "#ff8c00"]);


    // d3.svg.axis()
    var yAxisLeft = d3.axisRight(yScale)
        .tickSize(4, 0)
        .tickPadding(margin.middle + 12);

    var yAxisRight = d3.axisLeft(yScale)
        .tickSize(4, 0)
        .tickFormat('');

    var xAxisRight = d3.axisBottom(xScale)
        .tickValues([1,2,3,4,5,6,7,8,9])
        .tickSize(4, 1)
        .tickFormat(d3.format(''));

    var xAxisLeft = d3.axisBottom(xScale.copy().range([pointA, 8]))
        .tickValues([1,2,3,4,5,6,7,8,9])
        .tickSize(4, 1)
        .tickFormat(d3.format(''));

    var svg = d3.select("#chart");
    
    
    // MAKE GROUPS FOR EACH SIDE OF CHART
    // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = svg.append('g').attr('class', 'leftBarGroup')
                            .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = svg.append('g').attr('class', 'rightBarGroup')
                            .attr('transform', translation(pointB, 0));
    
    //USDA
    var leftUSDAGroup = svg.append('g').attr('class', 'leftUSDAGroup')
                            .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightUSDAGroup = svg.append('g').attr('class', 'rightUSDAGroup')
                            .attr('transform', translation(pointB, 0));

  
    // ADD MARKS
    var rightTitle = svg.append('text')
        .text('Paleo Serving Size')
        .style('text-anchor', 'middle')
        .attr('transform', translation(w-w/5, h-margin.bottom + 30));
    var leftTitle = svg.append('text')
        .text('Vegan Serving Size')
        .style('text-anchor', 'middle')
        .attr('transform', translation(w-w + 150, h-margin.bottom + 30));
        
    var dislcaimer = svg.append('text')
        .text('Disclaimer: These serving sizes are approximated to the nearest whole number. The values are accurate for a healthy young adult male')
        .attr('transform', translation(0, 399))
        .attr("font-size", 7);


    // DRAW AXES
    svg.append('g')
        .attr('class', 'axis y left')
        .attr('transform', translation(pointA, 0))
        .call(yAxisLeft)
        .selectAll('text')
        .style('text-anchor', 'middle');

    svg.append('g')
        .attr('class', 'axis y right')
        .attr('transform', translation(pointB, 0))
        .call(yAxisRight);

    svg.append('g')
        .attr('class', 'axis x left')
        .attr('transform', translation(0, h-margin.bottom))
        .call(xAxisLeft);

    svg.append('g')
        .attr('class', 'axis x right')
        .attr('transform', translation(pointB, h-margin.bottom))
        .call(xAxisRight);

    // DRAW THE BARS
    var leftUSDABar = d3.select('.leftUSDAGroup').selectAll('rectUSDA').data(data.filter(function(d) {return d.diet =="USDA";}));
    var rightUSDABar = d3.select('.rightUSDAGroup').selectAll('rectUSDA').data(data.filter(function(d) {return d.diet =="USDA";}));

    var leftBars = d3.select('.leftBarGroup').selectAll('rect').data(data.filter(function(d) {return d.diet =="Vegan";}));
    var rightBars = d3.select('.rightBarGroup').selectAll('rect').data(data.filter(function(d) {return d.diet =="Paleo";}));
    
    rightBars.enter().append('rect')
        .attr('class', 'enter')
        .attr('x',0)
        .style('fill', function(d) { return color(d.category); })
        .style('fill-opacity', "0.6")
        .attr('height', yScale.bandwidth())
        .attr('y', function(d) { return yScale(d.category); })
        .attr("width", function(d) { return xScale(d.serving); });

     leftBars.enter().append('rect')
        .attr('class', 'enter')
        .attr('x',0)
        .style('fill', function(d) { return color(d.category); })
        .style('fill-opacity', "0.6")
        .attr('height', yScale.bandwidth())
        .attr('y', function(d) { return yScale(d.category); })
        .attr("width", function(d) { return xScale(d.serving); });
    
    // USDA BARS
    leftUSDABar.enter().append('rect')
        .attr('class', 'enter')
        .attr('class', 'rectUSDA')
        .attr("stroke", "#423e7e")
        .attr("stroke-width", 3)
        .attr('x',0)
        .attr('height', yScale.bandwidth())
        .attr('y', function(d) { return yScale(d.category); })
        .attr("width", function(d) { return xScale(d.serving); });
    
     rightUSDABar.enter().append('rect')
        .attr('class', 'enter')
        .attr('class', 'rectUSDA')
        .attr("stroke", "#423e7e") 
        .attr("stroke-width", 3)
        .attr('x',0)
        .attr('height', yScale.bandwidth())
        .attr('y', function(d) { return yScale(d.category); })
        .attr("width", function(d) { return xScale(d.serving); });

    
    // the legend
    var legend = d3.select("#chart")
    legend.append('rect')
        .attr('x', w - margin.left - 560)
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', '#423e7e')
        .style('fill-opacity', "0.6");
    legend.append('text')
        .attr('x', w - margin.left - 530)
        .attr('y', 16)
        .text('USDA Serving Size');

    function updateLeft() {
        var selected = d3.event.target.value;
        console.log(selected);
        
//        d3.select('.leftBarGroup')
//                .selectAll('rect')
//                .remove();
//        
//        var leftBars = d3.select('.leftBarGroup')
//                .selectAll('rect')
//                .data(data.filter(function(d) {return d.diet == selected;}));
        
        var leftBars = d3.select('.leftBarGroup')
                .selectAll('rect')
                .data(data.filter(function(d) {return d.diet == selected;}));
    
        leftBars
            .transition()
            .duration(1000)
            .style('fill', function(d) { return color(d.category); })
            .attr('y', function(d) { return yScale(d.category); })
            .attr("width", function(d) { return xScale(d.serving); });
        
        leftTitle.text(selected + " Serving Size");
    }
    
    function updateRight() {
        var selected = d3.event.target.value;
        console.log(selected);
        
//        d3.select('.leftBarGroup')
//                .selectAll('rect')
//                .remove();
//        
//        var leftBars = d3.select('.leftBarGroup')
//                .selectAll('rect')
//                .data(data.filter(function(d) {return d.diet == selected;}));
        
        var rightBars = d3.select('.rightBarGroup')
                .selectAll('rect')
                .data(data.filter(function(d) {return d.diet == selected;}));
    
        rightBars
            .transition()
            .duration(1000)
            .style('fill', function(d) { return color(d.category); })
            .attr('y', function(d) { return yScale(d.category); })
            .attr("width", function(d) { return xScale(d.serving); });
        
        rightTitle.text(selected + " Serving Size");   
    }
    
    var leftdrop = d3.select(".pyramid")
        .append("select")
        .attr('class', 'spaceout')
        .attr("name", "left");
    
    leftopt = leftdrop.append("option")
        .text("Zone")
        .attr("value", "Zone");
    leftopt = leftdrop.append("option")
        .text("Vegan")
        .attr("value", "Vegan")
        .attr("selected", "selected");
    leftopt = leftdrop.append("option")
        .text("Paleo")
        .attr("value", "Paleo");
    
//    var leftopt = leftdrop.selectAll("option")
//        .data(data)
//        .enter()
//        .append("option");
    
    leftdrop.on("change", updateLeft);
    
//    leftopt.text(function (d) {
//        return d.diet;
//    }).attr("value", function (d) {
////        console.log(d.diet);
//        return d.diet;
//    });
    
    
    var rightdrop = d3.select(".pyramid")
        .append("select")
        .attr("name", "right");
    
    rightdrop.append("option")
        .text("Zone")
        .attr("value", "Zone");
    rightdrop.append("option")
        .text("Vegan")
        .attr("value", "Vegan");
    rightdrop.append("option")
        .text("Paleo")
        .attr("value", "Paleo")
        .attr("selected", "selected");
    
    rightdrop.on("change", updateRight);
    
});