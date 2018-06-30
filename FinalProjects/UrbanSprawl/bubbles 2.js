//Define Margin
var margin = {left: 80, right: 440, top: 50, bottom: 50 }, 
    width = 1260 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

//Define Color
var colors = d3.scaleOrdinal()
  .domain(["Mideast", "Great Lakes", "Southwest", "Southeast", "Far West", "Plains", "Rocky Mountain", "New England"])
  .range(d3.schemeCategory10);

			var color_1 = d3.scaleSqrt()
                                .domain([0,750, 1500, 3000])
                                .range(d3.schemeReds[5]);
            var color_2 = d3.scaleLinear()
                                .domain([.04, .08, .12, .16])
                                .range(d3.schemeBlues[5]);
            var formatComma = d3.format(",");

//Define SVG
var svg_a = d3.select("div#chart")
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

//
svg_a.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(20,4)");

//Define Scales   
//Teacher wanted a log scale...
var xScale = d3.scaleSqrt()
    .domain([0,3200])
    .range([0, width]);

var yScale = d3.scaleLinear()
    .domain([.04, 0.16])
    .range([height, 0]);

//Define Axis
var xAxis = d3.axisBottom(xScale).tickPadding(2);
var yAxis = d3.axisLeft(yScale).tickPadding(2);

        
//Define Tooltip here
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var year = 1990;

function circleSelected(){
    var tempvaluecircleselection = 0;
    d3.selectAll(".dot").each( function(d, i){
        var elt = d3.select(this);
        var cx = elt.attr("cx")
        if (cx != null){
                //console.log(elt)
                var opacity = elt.style("opacity")
                //console.log(opacity)
                if (opacity != 0.7) {
                    tempvaluecircleselection++;
                }
        }
        //console.log(elt.attr("opacity") > 0)
        });
    return (tempvaluecircleselection != 0);
};

                function circleSelected2(){
                        var tempvaluecircleselection = 0;
                    d3.selectAll(".dot").each( function(d, i){
                        var elt = d3.select(this);
                        var cx = elt.attr("cx")
                        if (cx != null){
                            //console.log(elt)
                            var opacity = elt.style("opacity")
                            console.log(opacity)
                            if (opacity != 0.1) {
                                tempvaluecircleselection++;
                            }
                        }
                        //console.log(elt.attr("opacity") > 0)
                    });
                    return (tempvaluecircleselection != 0);
                };
d3.csv("Data.csv", function(error, data) {
    if (error) throw error;
    console.log(data)

    // Define domain for xScale and yScale
    //yScale.domain([.7*d3.min(data, function(d) {return d["Pollutant 1990"]; }),2.9*d3.max(data, function(d) {return d["Pollutant 1990"]; })]);
    var tipMouseover = function(d) {
        //console.log(d);

        var MSA = "MSA: "
        var PV = "O3 concentration: "
        var POP = "Population: "
        var PD = "Population Density: "
        var html  = MSA.bold() + d["Core Based Statistical Area"] + "<br>" + PV.bold() + d["Pollutant " + year] + "<br>" + PD.bold() + d["Density " + year] + "<br>" + POP.bold() + formatComma(d["Population " + year]);
        tooltip.html(html)
            .style("left", (540) + "px")
            .style("top", (100) + "px")
            //.style("background-color", colors(d.country))
            .transition()
            .duration(200) // ms
            .style("opacity", .9) // started as 0!            

            //d3.selectAll(".dot")
            //    .style("opacity", 0.1);
            //d3.select(this)
            //    .style("opacity", 1);    

    };

    var zoom = d3.zoom()
      .scaleExtent([1, 5])
      .on("zoom", zoomed);
    
    function zoomed() {
        var new_x_scale = d3.event.transform.rescaleX(xScale);
        var new_y_scale = d3.event.transform.rescaleY(yScale);
//      console.log(d3.event.transform)
        svg_a.select(".x.axis").call(xAxis.scale(new_x_scale));
        svg_a.select(".y.axis").call(yAxis.scale(new_y_scale));
        svg_a.selectAll(".dot")
        //.attr("r", function(d) { return Math.sqrt(d["Population 1990"])/75; })
        .attr("cx", function(d) {return new_x_scale(d["Density " + year]);})
        .attr("cy", function(d) {return new_y_scale(d["Pollutant " + year]);})
        .attr("transform", d3.event.transform)
};

    //append zoom area
    svg_a.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    var tipMouseout = function(d) {
      tooltip.transition()
          .duration(300) // ms
          .style("opacity", 0); // don't care about position!
        //if(!clicked){
            //d3.selectAll(".dot")
            //    .style("opacity", .7);
        //}
        
    };
       
    var click = function(d){
        console.log(this)
        if (!circleSelected()) {
                d3.selectAll(".dot")
                    .style("opacity", 0.1);
            d3.select(this)
                .style("opacity", 1);
        }
        else{
            if(d3.select(this).style("opacity") == 1){
                d3.select(this)
                .style("opacity", .1);
                if (!circleSelected2()){
                                    d3.selectAll(".dot")
                    .style("opacity", 0.7);
                }
            }
            else{
                d3.select(this)
                .style("opacity", 1);
            }
        }
    }
    
    function order(a, b) {
        return +b["Population " + year] - +a["Population " + year];
    }
    
    //Draw Scatterplot
    svg_a.selectAll(".dot")        
        .data(data.sort(order))
        .enter().append("circle")
        .style("opacity", .7)
        .attr("class", "dot")
        .attr("id", function(d) {
            return "d_" + d.MSA_GEOID;
        })
        //.data(data.filter(function(d){return +d["Population 1990"] < 1000000;}))
        .attr("msanum", function (d) { return d["MSA GEOID"]; })
        .attr("region", function (d) { return d["region"]; })
        .attr("clicked", 0)
        .attr("r", function(d) { return Math.sqrt(d["Population " + year])/75; })//Math.pow(d["Population " + val], (1/3))/5
        .attr("cx", function(d) {return xScale(d["Density " + year]);})
        .attr("cy", function(d) {return yScale(d["Pollutant " + year]);})
        .style("fill", function (d) { return colors(d["region"]); })
        .attr("clip-path", "url(#clip)")        
        .on("mouseover", tipMouseover)
        .on("mouseout", tipMouseout)
        .on("click", click);
 
    //x-axis
    svg_a.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", 35)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Population Density (Population per Sq. mile)");

    //Y-axis
    svg_a.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -85)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .text("O3 Concentration (Parts per million)");
    
    //http://d3-legend.susielu.com/#color-ordinal
    var legendOrdinal = d3.legendColor()
        .shape("path", d3.symbol().type(d3.symbolCircle).size(130)())
        .shapePadding(4)
        .cellFilter(function(d){ return d.label !== "" })
        .scale(colors);

    svg_a.select(".legendOrdinal")
        .call(legendOrdinal);
        
})

            var g = svg_a.append("g")
                .attr("class", "legendThreshold1")
                .attr("transform", "translate(" + (width + margin.left+60) + "," + (margin.top - 20) + ")");
                g.append("text")
                .attr("class", "caption")
                .attr("x", 0)
                .attr("y", -6)
                .attr("font-weight", "bold")
                .text("Population Density");
            
            var g = svg_a.append("g")
                .attr("class", "legendThreshold2")
                .attr("transform", "translate(" + (width + margin.left+60) + "," + (margin.top + 220) + ")");
                g.append("text")
                .attr("class", "caption")
                .attr("x", 0)
                .attr("y", -6)
                .attr("font-weight", "bold")
                .text("O3 Concentration");
            var legend = d3.legendColor()
//                .labels(function (d) { return labels[d.i]; })
            .cells(6)
                .shapePadding(4)
                .labelFormat(d3.format(","))
                .scale(color_1);
                svg_a.select(".legendThreshold1")
                .call(legend);
            var legend_2 = d3.legendColor()
//                .labels(function (d) { return labels[d.i]; })
            .cells(5)
                .shapePadding(4)
                .labelFormat(d3.format(".2f"))
                .scale(color_2);
                svg_a.select(".legendThreshold2")
                .call(legend_2);

//https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
var slider2 = d3.sliderHorizontal()
    .min(1990)
    .max(2010)
    .step(1)
    .width(700)
    .tickFormat(d3.format("d"))
    .on('onchange', val => {
        year = +val;
        d3.select("p#value2").text(val);
        var tipMouseover = function(d) {
            //Trying to decrease opacity of other dots when hovering
            //https://stackoverflow.com/questions/39564878/opacity-update-on-all-d3-svg-circles-except-for-the-class-hovered
            //d3.selectAll(".dot")
            //    .style("opacity", 0.1);
            //d3.select(this)
            //    .style("opacity", 1);  
            
            //console.log(d);
            var MSA = "MSA: "
        var PV = "O3 concentration: "
        var POP = "Population: "
        var PD = "Population Density: "
        var html  = MSA.bold() + d["Core Based Statistical Area"] + "<br>" + PV.bold() + d["Pollutant " + val] + "<br>" + PD.bold() + d["Density " + val] + "<br>" + POP.bold() + formatComma(d["Population " + val]);
            tooltip.html(html)
                .style("left", (540) + "px")
                .style("top", (100) + "px")
                //.style("left", (d3.event.pageX) + "px")
                //.style("top", (d3.event.pageY - 15) + "px")
                //.style("background-color", colors(d.country))
                .transition()
                .duration(200) // ms
                .style("opacity", .9) // started as 0!
        };
        svg_a.selectAll(".dot") //svg_a.selectAll(".dot[region='Mideast']")
            .attr("class", "dot")
            .attr("r", function(d) { return Math.pow(d["Population " + val], (1/2))/75; }) //Math.pow(d["Population " + val], (1/3))/5
            .attr("cx", function(d) {return xScale(d["Density " + val]);})
            .attr("cy", function(d) {return yScale(d["Pollutant " + val]);})
            .attr("clip-path", "url(#clip)");
//            .on("mouseover", tipMouseover);
        d3.selectAll(".mass[class*=msa1]")
			.style("fill", function(d) {
				  var value_1 = d.properties["Density " + val];
                  return color_1(value_1);
            });
        d3.selectAll(".mass[class*=msa2]")
			.style("fill", function(d) {
				  var value_2 = d.properties["Pollutant " + val];
                  return color_2(value_2);
            });        //d3.selectAll(".mass")
        //    .style("fill", "blue");
    });

var g = d3.select("div#slider2").append("svg")
    .attr("class", "slider")
    .attr("width", 1000)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

g.call(slider2);

d3.select("p#value2").text((slider2.value()));