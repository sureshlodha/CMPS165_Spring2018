//Define Margin
      console.log("wtfff");

var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
    width = 960 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

//Define Color
var colors = d3.scaleOrdinal(d3.schemeCategory20);

//Define SVG
var svg_a = d3.select("div")
    //.append("div")
    //.attr("align", "left")
    .attr("class","bubbles")
    .append("svg")
    .attr("align", "left")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Define clipping region 
svg_a.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

//Define Scales   
var xScale = d3.scaleLinear()
    .domain([0,16]) //Need to redefine this after loading the data
    .range([0, width]);

var yScale = d3.scaleLinear()
    .domain([0,450]) //Need to redfine this after loading the data
    .range([height, 0]);

//Define Axis
var xAxis = d3.axisBottom(xScale).tickPadding(2);
var yAxis = d3.axisLeft(yScale).tickPadding(2);

//Define Tooltip here
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
  

d3.csv("EPA20002010CensusCombined2.csv", function(error, data) {
  if (error) throw error;

    data.forEach(function(d) {
        if (d["Pollutant"] === "O3") {
            d.EPA = +d["2000"];
            d.population = +d["Population 2000"];
            d.PopDensity = +d["Density per square mile of land area - Population 2000"];
        }
    })

    //Get Data
    // Define domain for xScale and yScale
    xScale.domain([0,d3.max(data, function(d) {return d.PopDensity; })]);
    yScale.domain([d3.min(data, function(d) {return d.EPA; }),d3.max(data, function(d) {return d.EPA; })]);
    
    
    
    var tipMouseover = function(d) {
        //console.log(d);
        var html  = "EPA: " + d.EPA + "<br>Population: " + d.population + "<br>Pop Density: " + d.PopDensity;
        tooltip.html(html)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 15) + "px")
            .style("background-color", "white")
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!
    };

    var tipMouseout = function(d) {
      tooltip.transition()
          .duration(300) // ms
          .style("opacity", 0); // don't care about position!
    };
    
    

    //Draw Scatterplot
    var dots = svg_a.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return Math.sqrt(d.population)/75; })
        .attr("cx", function(d) {return xScale(d.PopDensity);})
        .attr("cy", function(d) {return yScale(d.EPA);})
        .style("fill", function (d) { return colors(d.country); })
        .attr("clip-path", "url(#clip)")
        .on("mouseover", tipMouseover)        
        .on("mouseout", tipMouseout)
        .on("click", function(){
            
            d3.selectAll("circle")
                .style("opacity", 0.1);
            d3.select(this)
                .style("opacity", 1);
            });
    
    
    //Add .on("mouseover", .....
    //Add Tooltip.html with transition and style
    //Then Add .on("mouseout", ....

    //Scale Changes as we Zoom
    // Call the function d3.behavior.zoom to Add zoom

    //x-axis
    svg_a.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", 50)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Population Density(Population per Sq. mile)");

    //Y-axis
    svg_a.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .text("O3 Max 99th percentile");
});
