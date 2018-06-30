// Define the Margins.
var margin = {top: 20, right: 80, bottom: 70, left: 80},             // defines the respective values of the margin attibute/object
    width = 760 - margin.left - margin.right,                         // defines the width dimension for the chart itself
    height = 500 - margin.top - margin.bottom;                        // defines the height dimension for the chart itself

// Used to determine whether to load line data separated or overlapped when a state is clicked
var zoomLinesToggled = false;

// Defining the chlkoropleth map legend svg
var svgLegend = d3.select("body")
                  .append("svg").attr("class", "svg-legends")
                  .attr("width", width/6)
                  .attr("height", 450);

// Used for determining whether a current path feature (a state) is clicked on, thus loading its data onto the line graph
var active = d3.select(null);

// Simple formatting for commas for integer values printed out as strings
var formatComma = d3.format(",");

// D3 Projection for US map
var projection = d3.geoAlbersUsa()
  .translate([width / 1.55, height / 1.65]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

//Define path generator for map
var path = d3.geoPath()
        .projection(projection);

// Definition for scale of bee map chloropleth groupings
var beeScale = d3.scaleThreshold()
    .domain([1, 30, 70, 120])  
 .range(["#cbc9e2", "#9e9ac8", "#756bb1", "#54278f", "#2c134c"]);

// Definition for what the bee map legend will display to signify quantiled color ranges
var beeLegend = d3.scaleOrdinal()  
  .domain(["< 1", "1", "30", "70", "> 120"])
 .range(["#cbc9e2", "#9e9ac8", "#756bb1", "#54278f", "#2c134c"]);

// Definition for the bee legend svg
svgLegend.append("g")
  .attr("class", "legendQuant beeLegend")
  .style("background-color","blue")
  .attr("transform", "translate(10,20)");

// Main functionality for displaying the legend for bee map
var legendPop = d3.legendColor()
    .labelFormat(d3.format(".0f")).shapePadding(-2).shapeHeight(30)
.title('Honey Bee Colony Loss in Thousands').titleWidth(90)
    .labelAlign("start")
    .scale(beeLegend);

// Calls the variable for displaying the bee map legend
svgLegend.select(".beeLegend")
  .call(legendPop);

// Definition for scale of temp map chloropleth groupings
var tempScale = d3.scaleThreshold() 
  .domain([1.0, 2.2, 3.4, 4.6])
 .range(["#fcbba1","#fc9272","#fb6a4a","#de2d26","#66070a"]);

// Definition for what the temp map legend will display to signify quantiled color ranges
var tempLegend = d3.scaleOrdinal()  
  .domain(["< 1.0", "1.0", "2.2", "3.4", "> 4.6"])
.range(["#fcbba1","#fc9272","#fb6a4a","#de2d26","#66070a"]);

// Definition for the temp legend svg
svgLegend.append("g")
  .attr("class", "legendQuant tempLegend")
  .attr("transform", "translate(10,20)");

// Main functionality for displaying the legend for temp map
var legendProd = d3.legendColor()
    .labelFormat(d3.format(".1f")).shapePadding(-2).shapeHeight(30)
.title('Temperature Change in Fahrenheit').titleWidth(90)
    .scale(tempLegend)

// Calls the variable for displaying the bee map legend
svgLegend.select(".tempLegend")
  .call(legendProd);

// Selects which legend to display first upon loading into the page
d3.select(".beeLegend").attr("opacity", "1");
d3.select(".tempLegend").attr("opacity", "0");

//Define quantize scale to sort data values into buckets of color for both sets of .csv data
var colorBeeData = d3.scaleQuantize()
                   .range(["rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)","rgb(44,19,76)"]);
                    //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
                    //https://github.com/d3/d3-scale-chromatic

var colorTempData = d3.scaleQuantize()
                    .range(["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"]);
                    //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
                    //https://github.com/d3/d3-scale-chromatic

//Create SVG element for Bee Population Graph
var svgBee = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + margin.bottom)
        .attr("id", "beeSvg")
        .attr("transform", "translate(0,0)")

// Reference for use in later functionality
var g = svgBee.append("g");

var svgLegend2 = d3.select("body")
                  .append("svg").attr("class", "svg-legends")
                  .attr("width", width/6)
                  .attr("height", 450);

// Definition of svg for line graph
var svgLineGraph = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right + margin.right)                       // defines the width of the "div" of where the chart can be displayed
    .attr("height", height + margin.top + margin.bottom + margin.bottom)                     // defines the height of the "div" of where the chart can be displayed
    .append("g")                                                             // groups elements together (clean code) and allows application of transformations                                                                                                                (affects how visual elements are rendered)
    .attr("id", "svgLine")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // scales the dimensional appearance of graph based on the margin values
            
// Variable used when parsing dates from the csv file(s) to go on the line graph
var parseTime = d3.timeParse("%Y"); // Tells d3 to parse the data as a date (years) when reading .csv strings. It can return a date object fromn there (which is used later on)

// Define X, X2, Y, and Y2 SCALES.
var x =                                 // Sets the scale (mapping of values to placements on line) for x-axis  
    d3.scaleTime().range([0, width + margin.right]);   // Places date/time values on the ticks of the x axis 

var x2 = d3.scaleLinear()
	      .range([0,width + margin.right]);

var y =                                 // Sets the scale (mapping of values to placements on line) for y-axis
    d3.scaleLinear()                         // Sets the scale to be a specal ordinal scale (mapping to labels rather than values) 
    .range([height + margin.bottom, 0]);                     // Reverses ordering of how y-axis bars are displayed (big to small versus small to big)

var y2 =                                 
    d3.scaleLinear()                          
    .range([height + margin.bottom, 0]);                    

// Used for displaying the data displayed on the line graph as curved lines (one for each data set)
var line = d3.line()                                   // Defines lines on screen
        .curve(d3.curveBasis)                          // Sets how the line transistions from point to point. It rounds of of points to make smooth curves. 
        .x(function(d) { //console.log(d);
            return x(d.date); })          // Data field for x coordinates
        .y(function(d) { //console.log(d.b);
            return y(d.b);        // Data field for y coordinates    
                        });

var line2 = d3.line()                                   
        .curve(d3.curveBasis)                           
        .x(function(d) { return x(d.date); })          
        .y(function(d) { return y2(d.t); });       

// Define X, Y, and Y2 AXES
function xAxis() {
  return d3.axisBottom(x)                              // Sets axis to be at bottom (orientation wise) 
    .ticks(10)
} 

function yAxis() {
    return d3.axisLeft(y)                            // Sets axis to be on left (orientation wise)   
    .ticks(5)                                        // number of ticks, though varies with data
    .tickFormat( function(d) { return (d) });
    
}

function y2Axis() {
    return d3.axisRight(y2)                            // Sets axis to be on right (orientation wise)   
    .ticks(5)                                        
    .tickFormat( function(d) { return (d) });
    
}

//// Define X and Y GRID
//function make_x_grid() {        
//    return d3.axisBottom(x);
////         .ticks(5)
//}
//
//function make_y_grid() {        
//    return d3.axisLeft(y)
//        .ticks(5)
//}   

// From https://bl.ocks.org/pjsier/28d1d410b64dcd74d9dab348514ed256. This code is used for adding an animation to the line graph load-in. 
function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }

// Initial load in for bee colony data from 1978 - 2017 for the line graph
d3.csv("data/newMergedBees.csv", types, function(error, data){   // Parses the data from the .csv file using a d3.csv request
    
 if (error) throw error;
    
    var newData = [];
                    
  // format the data
  data.forEach(function(d) {
      if(d.state === "all"){
          d.dt = d.date
          d.date = parseTime(d.date);
          d.dateInt = parseInt(d.dt)
          d.b = +d.beePop;
          d.stateName = d.state;
          newData.push(d);
      }
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
  y.domain([d3.min(data, function(d) {return Math.min(d.b);}), d3.max(data, function(d) {return Math.max(d.b);})]);

// Calculate the linear regression (average) line for the given data    
var lg = calcLinear(newData, "x", "y", 1978, 2017, d3.min(newData, function(d){ return d.b}), d3.max(newData, function(d){ return d.b}));

// Draws the linear regression line on screen    
  svgLineGraph.append("line")
	        .attr("class", "regression")
            .attr("x1", x(parseTime(lg.ptA.x)))
	        .attr("y1", y(lg.ptA.y))
            .attr("x2", x(parseTime(lg.ptB.x)))
	        .attr("y2", y(lg.ptB.y))
            .attr("id", "dotted1");
   

  // Draws the line for the data in the line graph area, with transition animation added
  svgLineGraph.append("path")
      .data([newData])
      .attr("class", "line")
      .attr("d", line)
    .attr('pointer-events', 'none')
    .attr("id", "path")
      .transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);

  // Adds the X Axis
  var x_axis = svgLineGraph.append("g")
      .attr("transform", "translate(0," + (height + margin.bottom) + ")")
      .call(xAxis(x));    
    
  // This section defines any text/labels related to the axis
  svgLineGraph.append("text")
      .attr("y", 7.4 * margin.bottom)
      .attr("x",width/1.87)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text("Years");

  // Adds the Y Axis
  svgLineGraph.append("g")
      .attr("class", "axisSteelBlue")
    .attr("id", "leftaxis")
      .call(d3.axisLeft(y));
  
  // This section defines any text/labels related to the axis
  svgLineGraph.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text("Number of Honey Bee Colonies (Thousands)");
    
// The following code places a mouseover feature for the bee line that displays the current (interpolated) value for the current spot in the graph's timeline    
    
    var mouseG = svgLineGraph.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data([newData])
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");
    
     mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", "black")
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width + margin.right) // can't catch mouse events on a g element
      .attr('height', height + margin.top + margin.bottom)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text 
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0.6");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + (height + margin.bottom);
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                idx = bisect(d.values, xDate);

            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            // Style the text for each line appropriately
            if(lines[i].id == "path") {
                d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(0)).style("font-size", "22").style("font-weight", "bold").style("color", "red");
            }
            else {
                d3.select(this).select('text')
              .text(y2.invert(pos.y).toFixed(1)).style("font-size", "22").style("font-weight", "bold");
            }
            
//            if(lines[i].id == "path") {
//                d3.select(this).select('text')
//              .text(y.invert(pos.y).toFixed(2));
//            }
//            else {
//                d3.select(this).select('text')
//              .text(y2.invert(pos.y).toFixed(2));
//            }

            return "translate(" + mouse[0] + "," + pos.y +")";
          });
    });
});

// The types functions below are needed for sending the appropriate data to the linear regression function
function types(d){
        if(d.state === "all"){
          d.dt = d.date
          d.x = parseInt(d.dt)
          d.y = +d.beePop;
      }

	    return d;
	  }

function types2(d){
        if(d.state === "all"){
          d.dt = d.date
          d.x = parseInt(d.dt)
          d.y = +d.Temp;
      }

	    return d;
	  }

// Below is the code for calculatriing the linear regression of data sets for the line graph (state data)

    // Calculate a linear regression from the data

		// Takes 5 parameters:
    // (1) Your data
    // (2) The column of data plotted on your x-axis
    // (3) The column of data plotted on your y-axis
    // (4) The minimum value of your x-axis
    // (5) The minimum value of your y-axis

    // Returns an object with two points, where each point is an object with an x and y coordinate

    function calcLinear(data, x, y, minX, maxX, minY, maxY){
        /////////
        //SLOPE//
        /////////   
          
        // Let n = the number of data points
        var n = data.length;
  
        // Get just the points
        var pts = [];
        data.forEach(function(d,i){
          var obj = {};
          obj.x = d[x];
          obj.y = d[y];
          obj.mult = obj.x*obj.y;
          pts.push(obj);
        });
  
        // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
        // Let b equal the sum of all x-values times the sum of all y-values
        // Let c equal n times the sum of all squared x-values
        // Let d equal the squared sum of all x-values
        var sum = 0;
        var xSum = 0;
        var ySum = 0;
        var sumSq = 0;
        pts.forEach(function(pt){
          sum = sum + pt.mult;
          xSum = xSum + pt.x;
          ySum = ySum + pt.y;
          sumSq = sumSq + (pt.x * pt.x);
        });
        var a = sum * n;
        var b = xSum * ySum;
        var c = sumSq * n;
        var d = xSum * xSum;
  
        // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
        // slope = m = (a - b) / (c - d)
        var m = (a - b) / (c - d);
  
        /////////////
        //INTERCEPT//
        /////////////
  
        // Let e equal the sum of all y-values
        var e = ySum;
  
        // Let f equal the slope times the sum of all x-values
        var f = m * xSum;
  
        // Plug the values you have calculated for e and f into the following equation for the y-intercept
        // y-intercept = b = (e - f) / n
        var b = (e - f) / n;
  
        // Print the equation below the chart
        //document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
        //document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;
        
        var lg;
  
        if(m > 0) {
          lg = {
              ptA : {
                  x: minX,
                  y: m * minX + b
              },
              ptB : {
                  y: maxY,
                  x: Math.floor((maxY - b) / m)
              }
          }
        }
        else {
          lg = {
              ptA : {
                  x: minX,
                  y: m * minX + b
              },
              ptB : {
                  y: minY,
                  x: Math.floor((minY - b) / m)
              }
          }
        }
        
        // Clipping the lines from leaving the graph bounds
        while (lg.ptB.x > maxX || lg.ptB.y > maxY){
            if(lg.ptB.x > maxX){
              lg.ptB.y = m * maxX + b;
              lg.ptB.x = maxX;
            } 
            else if (y > maxY){
              lg.ptB.x = (y-b)/m;
              lg.ptB.y = maxY;
            }
        }
  
      // // while (lg.ptA.x != minX || lg.ptA.y != minY){
      //     if(lg.ptA.x != minX){
      //         lg.ptA.y = m * minX + b;
      //         lg.ptA.x = minX;
      //     } 
      //     // else 
      //     if (lg.ptA.y < minY){
      //         lg.ptA.x = (y-b)/m;
      //         lg.ptA.y = minY;
      //     }
      // // }
  
  
      // // while (lg.ptB.x != maxX || lg.ptB.y != maxY){
      //     if(lg.ptB.x != maxX){
      //       lg.ptB.y = m * maxX + b;
      //       lg.ptB.x = maxX;
      //     } 
      // //     else 
      // if (lg.ptB.y > maxY){
      //       lg.ptB.x = (y-b)/m;
      //       lg.ptB.y = maxY;
      //     }
      // // }
      
    //   while(lg.ptB.y > maxY  ||  lg.ptB.y < minY  ||  lg.ptB.x > maxX){
    //       if(m > 0  && lg.ptB.y > maxY){ // positive slop and right end of line is over the maxY value.
    //           lg.ptB.y = maxY;
    //           lg.ptB.x = (y-b)/m;
    //       }
    //       else if(m < 0  &&  lg.ptB.y < minY){
    //           lg.ptB.y = minY;
    //           lg.ptB.x = (y-b)/m;
    //       }
  
    //       if(lg.ptB.x > maxX){
    //           lg.ptB.x = maxX;
    //           lg.ptB.y = m*maxX+b;
    //       }
    //   }
  
        return lg;
      }

    function calcLinear2(data, x, y, minX, maxX, minY, maxY){
      /////////
      //SLOPE//
      /////////   
        
      // Let n = the number of data points
      var n = data.length;

      // Get just the points
      var pts = [];
      data.forEach(function(d,i){
        var obj = {};
        obj.x = d[x];
        obj.y = d[y];
        obj.mult = obj.x*obj.y;
        pts.push(obj);
      });

      // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
      // Let b equal the sum of all x-values times the sum of all y-values
      // Let c equal n times the sum of all squared x-values
      // Let d equal the squared sum of all x-values
      var sum = 0;
      var xSum = 0;
      var ySum = 0;
      var sumSq = 0;
      pts.forEach(function(pt){
        sum = sum + pt.mult;
        xSum = xSum + pt.x;
        ySum = ySum + pt.y;
        sumSq = sumSq + (pt.x * pt.x);
      });
      var a = sum * n;
      var b = xSum * ySum;
      var c = sumSq * n;
      var d = xSum * xSum;

      // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
      // slope = m = (a - b) / (c - d)
      var m = (a - b) / (c - d);

      /////////////
      //INTERCEPT//
      /////////////

      // Let e equal the sum of all y-values
      var e = ySum;

      // Let f equal the slope times the sum of all x-values
      var f = m * xSum;

      // Plug the values you have calculated for e and f into the following equation for the y-intercept
      // y-intercept = b = (e - f) / n
      var b = (e - f) / n;

      // Print the equation below the chart
      //document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
      //document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;
      
      var lg;

      if(m > 0) {
        lg = {
            ptA : {
                x: minX,
                y: m * minX + b
            },
            ptB : {
                y: maxY,
                x: Math.floor((maxY - b) / m)
            }
        }
      }
      else {
        lg = {
            ptA : {
                x: minX,
                y: m * minX + b
            },
            ptB : {
                y: minY,
                x: Math.floor((minY - b) / m)
            }
        }
      }
      
      // Clipping the lines from leaving the graph bounds
    //   while (lg.ptB.x > maxX || lg.ptB.y > maxY){
    //       if(lg.ptB.x > maxX){
    //         lg.ptB.y = m * maxX + b;
    //         lg.ptB.x = maxX;
    //       } 
    //       else if (y > maxY){
    //         lg.ptB.x = (y-b)/m;
    //         lg.ptB.y = maxY;
    //       }
    //   }

    // // while (lg.ptA.x != minX || lg.ptA.y != minY){
    //     if(lg.ptA.x != minX){
    //         lg.ptA.y = m * minX + b;
    //         lg.ptA.x = minX;
    //     } 
    //     // else 
    //     if (lg.ptA.y < minY){
    //         lg.ptA.x = (y-b)/m;
    //         lg.ptA.y = minY;
    //     }
    // // }


    // while (lg.ptB.x != maxX || lg.ptB.y != maxY){
        if(lg.ptB.x != maxX){
          lg.ptB.y = m * maxX + b;
          lg.ptB.x = maxX;
        } 
    //     else 
    if (lg.ptB.y > maxY){
          lg.ptB.x = (y-b)/m;
          lg.ptB.y = maxY;
        }
    // }
    
    // while(lg.ptB.y > maxY  ||  lg.ptB.y < minY  ||  lg.ptB.x > maxX){
    //     if(m > 0  &&  lg.ptB.y > maxY){ // positive slop and right end of line is over the maxY value.
    //         lg.ptB.y = maxY;
    //         lg.ptB.x = (y-b)/m;
    //     }
    //     else if(m < 0  &&  lg.ptB.y < minY){
    //         lg.ptB.y = minY;
    //         lg.ptB.x = (y-b)/m;
    //     }

    //     if(lg.ptB.x > maxX){
    //         lg.ptB.x = maxX;
    //         lg.ptB.y = m*maxX+b;
    //     }
    // }

      return lg; //lg2
    }

// Initial load in for temperature data from 1978 - 2017 for the line graph
d3.csv("data/newMergedTemp.csv", types2, function(error, data){   // Parses the data from the .csv file using a d3.csv request
    
 if (error) throw error;
    
    var newData = [];
                    
  // format the data
  data.forEach(function(d) {
      if(d.state === "all"){
          d.dt = d.date
          d.date = parseTime(d.date);
          d.dateInt = parseInt(d.dt)
          d.t = +d.Temp;
          d.stateName = d.state;
          newData.push(d);
      }
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
  y2.domain([d3.min(data, function(d) {return Math.min(d.t);}), d3.max(data, function(d) {return Math.max(d.t); })]);
    
    // Calculate the linear regression for the given data set
    var lg = calcLinear(newData, "x", "y", 1978, 2017, d3.max(newData, function(d){ return d.t}), d3.max(newData, function(d){ return d.t}));
    
    // Plot the linear regresion lione for the given data set on screen
    svgLineGraph.append("line")
	        .attr("class", "regression")
            .attr("x1", x(parseTime(lg.ptA.x)))
	        .attr("y1", y2(lg.ptA.y))
            .attr("x2", x(parseTime(lg.ptB.x)))
	        .attr("y2", y2(lg.ptB.y))
            .attr("id", "dotted2");

  // Draw the path for the temperature data line
  svgLineGraph.append("path")
      .data([newData])
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", line2)
    .attr('pointer-events', 'none')
      .attr("id", "path2")
      .transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);

  // Add the Y2 Axis (right side)
  svgLineGraph.append("g")
      .attr("class", "axisRed")
      .attr("transform", "translate( " + (width + margin.right) + ", 0 )")
    .attr("id", "rightaxis")
      .call(d3.axisRight(y2));
    
  // This section defines any text/labels related to the axis
  svgLineGraph.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", 0 - margin.left - 673)
      .attr("x",0 + (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text("Average Temperature (Fahrenheit)");
    
    var mouseG = svgLineGraph.append("g")
      .attr("class", "mouse-over-effects");

// The following code places a mouseover feature for the bee line that displays the current (interpolated) value for the current spot in the graph's timeline      
    
    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data([newData])
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");
    
     mousePerLine.append("circle")
      .attr("r", 7)
      .style("stroke", "black")
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(-60,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width + margin.right) // can't catch mouse events on a g element
      .attr('height', height + margin.top + margin.bottom)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0.6");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + (height + margin.bottom);
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xDate = x.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                idx = bisect(d.values, xDate);

            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            // Style the text for each line appropriately
            if(lines[i].id == "path") {
                d3.select(this).select('text')
              .text(y.invert(pos.y).toFixed(0)).style("font-size", "22").style("font-weight", "bold").style("color", "red");
            }
            else {
                d3.select(this).select('text')
              .text(y2.invert(pos.y).toFixed(1)).style("font-size", "22").style("font-weight", "bold");
            }

            return "translate(" + mouse[0] + "," + pos.y +")";
          });
    });
});



     
// Load net change .csv data by state
d3.csv("data/data.csv", function(data) {            
    
    //Load in GeoJSON data for U.S. (lv1 GeoJSON attributes)
    d3.json("data/usanew.json", function(json) {

        //Merge the net change data with respective svg and U.S. GeoJSON data
        //Loop through once for each state to get net change data
        for (var i = 0; i < data.length; i++) {

            //Grab state name
            var dataState = data[i].state;
            
            var temps = parseFloat(data[i].temps);
            var bees = parseFloat(data[i].bees);
            var code = data[i].abbreviation;

            //Find the corresponding region inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonRegion = json.features[j].properties.name; // References name property in GeoJSON data

                // If the name on the GeoJSON matches the name for the region, assign current net change data to GeoJSON feature
                if (dataState == jsonRegion) {

                    //Copy the data value into the JSON for Population 
                    json.features[j].properties.temps = temps;
                    json.features[j].properties.bees = bees;
                    json.features[j].properties.code = code;
                    json.features[j].properties.naming = dataState;
                    //Stop looking through the JSON
                    break;

                }
            }		
        }
        
        // Displays by default upon loading the page the net change data
                       g.selectAll("path")
                       .data(json.features)
                       .enter()
                       .append("path")
                       .attr("d", path).attr("class", "feature")
                           .on("click", clicked)
                        .attr("stroke","#fff").attr("stroke-width","0.4").style("opacity", "0.8").style("stroke-opacity", "1")
                        .attr("stateName", function(d) {
                           return d.properties.naming;
                       })
                        .attr("x", function(d){                        
                            return path.centroid(d)[0];
                        })
                       .attr("y", function(d){
                            return  path.centroid(d)[1];
                        })
                       .style("fill", function(d) {
                            //Get data value
                            var value = d.properties.bees;
                            if (value) {
                                //If value exists…
                                return beeScale(value);
                            } else {
                                //If value is undefined…
                                return "#ccc";
                            }
                       })
        // Mouseover functionality for states
        .on("mouseover",function(d){
                           // Grab tooltip data from .csv file
                            var state = d.properties.name;
                            var temps = d.properties.temps;
                            var bees = d.properties.bees;
            
                            //Get this bar's x/y values, then augment for the tooltip
                            var xPosition = parseFloat(d3.select(this).attr("x")) + 140.0;// augmented to the right of the circle it defines
                            var yPosition = parseFloat(d3.select(this).attr("y")) + 120;
                           
                           // Make cursor look like the "clickable" icon
                           d3.select(this).style("cursor", "pointer"); 
                           
                           // Put tooltip on map relative to current state position
                           d3.select("#tooltip").style("left", xPosition + "px").style("top", yPosition + "px");
                           
                           // Make the tooltip elements appear on screen via playing with their opacity values
                            d3.select(this)
                                .style("opacity", "1");
                            
                           //State Title
                            d3.select(".state-title").text(state).style("opacity", 0).style("opacity", 1);
                           
                           // Bee colony net change
                            if (bees > 0){
                                d3.select(".bees").text("Net Honey Bee Loss |\xa0 " + formatComma(bees) + ",000 colonies").style("opacity", 1);
                            } else if (bees < 0){
                                d3.select(".bees").text("Net Honey Bee Gain |\xa0 " + formatComma(-1*bees) + ",000 colonies").style("opacity", 1);
                            }
                            else  {
                                d3.select(".bees").text("Net Honey Bee Loss |\xa0 Data Unavailable").style("opacity", 1);
                            }
                           
                           // Temp net change
                            if (temps){
                                d3.select(".temps").text("Net Temp. Increase \xa0|\xa0 " + temps + " degrees").style("opacity", 1);
                            }
                            else  {
                                d3.select(".temps").text("Net Temp. Increase \xa0|\xa0 Data Unavailable").style("opacity", 1);
                            }
                           
                           //Show the tooltip 
                            d3.select("#tooltip").classed("hidden", false);                    
                        })
        // Mouseout functionality for states
                       .on("mouseout", function(d){
                        
                            // Opacity reset for hovering, depending on whether there is an active node present 
                            
                           if(active.node() == null) {
                                d3.select(this)
                                .style("opacity", "0.8");
                            }
                            
                            if(active.node() != null) {
                                if(active.node() == d3.select(this)._groups[0][0]) {
                                    d3.select(this)
                                .style("opacity", "0.8");
                                }
                                else {
                                    d3.select(this)
                                .style("opacity", "0.2");
                                }
                            }
                           
                           // Change cursor back to default icon
                           d3.select(this).style("cursor", "default"); 
        
                            //Show the tooltip 
                            d3.select("#tooltip").classed("hidden", true);    
                       })
            
                   // Adding Labels for each State
                    g.selectAll("text")
                       .data(json.features)
                       .enter()
                       .append("svg:text").attr("class", "state-labels")
                       .text(function(d){
                            if (d.properties.code == "RI" || d.properties.code == "DE"){
                                return "";
                            }
                            return d.properties.code;
                        })
                       .attr("x", function(d){                       
                            return path.centroid(d)[0];
                        })
                       .attr("y", function(d){          
                            return  path.centroid(d)[1];
                        })
                        .attr("dy", function(d){
                            // edge cases due to centroid calculation issue
                            // see: https://github.com/mbostock/d3/pull/1011
                            // deviations adjusted to test case at map height = 166px
                            function dy(n) {
                                return (n * projection.translate()[1]) / height
                            }
                            switch (d.properties.code)
                            {   case "FL":
                                    return dy(30)
                                case "LA":
                                    return dy(-10)
                                case "NH":
                                    return dy(20)
                                case "MA":
                                    return dy(1)
                                case "DE":
                                    return dy(5)
                                case "MD":
                                    return dy(-4)
                                case "RI":
                                    return dy(4)
                                case "CT":
                                    return dy(2)
                                case "NJ":
                                    return dy(20)
                                case "DC":
                                    return dy(-3)
                                default:
                                    return 0
                            }
                        })
                        .attr("dx", function(d){
                            // edge cases due to centroid calculation issue
                            // see: https://github.com/mbostock/d3/pull/1011
                            // deviations adjusted to test case at map height = 166px
                            function dx(n) {
                                return (n * projection.translate()[0]) / width
                            }
                            switch (d.properties.code)
                            {   
                                case "FL":
                                    return dx(30)
                                case "LA":
                                    return dx(-10)
                                case "NH":
                                    return dx(3)
                                case "MA":
                                    return dx(1)
                                case "DE":
                                    return dx(5)
                                case "MD":
                                    return dx(-8)
                                case "RI":
                                    return dx(4)
                                case "CT":
                                    return dx(2)
                                case "NJ":
                                    return dx(2)
                                case "DC":
                                    return dx(-3)
                                default:
                                    return 0
                            }
                        })
                       .attr("text-anchor","middle")
                       .attr('font-size','6pt')
                       .style("color","white");
        
        // Transitions/defines spacing of bloc1 text
        d3.select("#bloc1")
            .transition().duration(1000)
            .text("\xa0 Honey Bee Colony Count Change, 1978-2017 \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0");
        
        // Defining Button Interactivity on map
            var togData = false;
            var togCities = false; 
        
        // toggleCity = toggleTemperature
            d3.select(".toggleCity")
                .on("click", function(){
                    // Determine if current line is visible
                    togData=!togData;
                        
                        // Fill the map chloropleth with temperature data color quantiles
                        g.selectAll("path")
                            .transition().duration(1000)
                            .style("fill", function(d) {
                                var value = d.properties.temps;
                                if (value) {
                                    //If value exists…
                                    return tempScale(value);
                                } else {
                                    //If value is undefined…
                                    return "#ccc";
                                } 
                         });
                    
                       // Make the temperature cloropleth legend appear and the bee legend disappear
                        d3.select(".tempLegend").transition().duration(1000).attr("opacity", "1");
                        d3.select(".beeLegend").transition().duration(1000).attr("opacity", "0");
  
                        var stateNaming = d3.select("#bloc2").text();
                        
                        // Transition the bloc1 text to reflect temperature map data
                        d3.select("#bloc1")
                            .transition().duration(1000)
                            .text("Temperature Change in Fahrenheit, 1978-2017 \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0");
                        
                        // Transition bloc2 text as well
                        d3.select("#bloc2")
                            .transition().duration(1000)
                            .text(stateNaming);

                });
                
               // toggleData = toggleHoneyBees
                 d3.select(".toggleData")
                .on("click", function() {
                     
                     // Fill map with bee data
                        g.selectAll("path")
                            .transition().duration(1000)
                            .style("fill", function(d) {
                                var value = d.properties.bees;
                                if (value) {
                                    //If value exists…   
                                    return beeScale(value);
                                } else {
                                    //If value is undefined…
                                    return "#ccc";
                                } 
                         });
                    
                        // Make bee legend visible and temp legend gone
                        d3.select(".tempLegend").transition().duration(1000).attr("opacity", "0");
                        d3.select(".beeLegend").transition().duration(1000).attr("opacity", "1");

                        var stateNaming = d3.select("#bloc2").text();
                        
                        // Transition bloc1 text to reflect bee data
                        d3.select("#bloc1")
                            .transition().duration(1000)
                            .text("\xa0 Honey Bee Colony Count Change, 1978-2017 \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0");
                        
                       // Transition bloc2 text as well
                        d3.select("#bloc2")
                            .transition().duration(1000)
                            .text(stateNaming);

                 });
        
                 // Click functionality for separation button tied to line graph
                 d3.select(".toggleSeparation").on("click", function (e) {
                     zoomLinesToggled = true;
                     var currStateName = "";
                     if(active.node() != null) {
                         currStateName = active.node().getAttribute("stateName");
                         console.log(currStateName);
                     }
                     else {
                         currStateName = "United States";
                     }
                     console.log(active.node())
                     if(currStateName === "United States") {
                        drawChart("all");
                     }
                     else {
                        drawChart(currStateName)   
                     }
                });
        
             // Click functionality for overlap button tied to line graph
                d3.select(".toggleOverlap").on("click", function (e) {
                    zoomLinesToggled = false;
                    var currStateName = "";
                     if(active.node() != null) {
                         currStateName = active.node().getAttribute("stateName");
                     }
                     else {
                         currStateName = "United States";
                     }
                    if(currStateName === "United States") {
                        drawChart("all");
                    }
                    else {
                        drawChart(currStateName)   
                    }
                });
            
    });
});

// Functionality for when the states are clicked
function clicked(d) {
                // Highlight state selected while greying out all other states
                g.selectAll("path").attr("d", path).style("opacity", "0.2")
                 var stateId = d.id;
                 g.selectAll("path")._groups[0][stateId].style.opacity = 1;
    
                  // Handles case when you click on current active state (returns to full US)
                  if (active.node() === this) {
                      active.node().setAttribute("stroke-width","0.4")
                      active.node().setAttribute("stroke","#fff")
                      active.classed("active", false);
                      g.selectAll("path").attr("d", path).style("opacity", "0.8")
                      return reset();
                  }
                  
                  // Handles case when you click a state while no other state is clicked
                  if(active.node() === null && active.node() !== this) {
                      active.classed("active", false);
                      active = d3.select(this).classed("active", true);
                      active.node().setAttribute("stroke-width","4")
                      active.node().setAttribute("stroke","#ff9")
                  }
    
                  // Handles case when you transition from one state to another    
                  if(active.node() != null && active.node() !== this) {
                      active.node().setAttribute("stroke-width","0.4")
                      active.node().setAttribute("stroke","#fff")
                      active.classed("active", false);
                      active = d3.select(this).classed("active", true);
                      active.node().setAttribute("stroke-width","4")
                      active.node().setAttribute("stroke","#ff9")
                      console.log(active.node())
                      console.log(active.node().getAttribute("style"))
                  }

                      var neigh = d.properties.name;

                      // Call to function which draws state line graph data    
                      drawChart(neigh);
    
                    // Transitions state text
                    d3.select("#bloc2")
                            .transition().duration(1000)
                            .text(neigh);
                }

            // Sets both graphs back to their default (initial) view
            function reset() {
                  active.classed("active", false);
                  active = d3.select(null);
                      var neigh = "all";

                      drawChart(neigh);
                
                d3.select("#bloc2")
                            .transition().duration(1000)
                            .text("United States");
                }

            // Function that draws the updated line chart
            var drawChart = function(field) {
                
              // remove the previous chart features
                d3.select('#svgLine').select('#path').remove();
                d3.select('#svgLine').select('#path2').remove();
                d3.select('#svgLine').select('#leftaxis').remove();
                d3.select('#svgLine').select('#rightaxis').remove();
                d3.selectAll("#dotted1").remove();
                d3.selectAll("#dotted2").remove();
                
                // types funtions needed for correct parsinog of data when redrawing new linear regression lines
                function types3(d){
                    if(field === d.state){
                      d.dt = d.date
                      d.x = parseInt(d.dt)
                      d.y = +d.beePop;
                  }
                    return d;
                  }
                
                function types4(d){
                    if(field === d.state){
                      d.dt = d.date
                      d.x = parseInt(d.dt)
                      d.y = +d.Temp;
                  }
                    return d;
                  }
                
// Updates the bee data line                
d3.csv("data/newMergedBees.csv", types3, function(error, data){   // Parses the data from the .csv file using a d3.csv request
    
 if (error) throw error;

  var newData = [];
                    
  // format the data
  data.forEach(function(d) {
      if(field === d.state){
          d.dt = d.date
          d.date = parseTime(d.date);
          d.dateInt = parseInt(d.dt)
          d.b = +d.beePop;
          d.stateName = d.state;
          newData.push(d);
      }
  });
                    
  if(!zoomLinesToggled) {
      // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
  y.domain([d3.min(data, function(d) {return Math.min(d.b);}), d3.max(data, function(d) {return Math.max(d.b);})]);
   
  // Linear regression calculation      
  var lg = calcLinear(newData, "x", "y", 1978, 2017, d3.min(newData, function(d){ return d.b}), d3.max(newData, function(d){ return d.b}));

  // Draws linear regression line       
  svgLineGraph.append("line")
	        .attr("class", "regression")
            .attr("x1", x(parseTime(lg.ptA.x)))
	        .attr("y1", y(lg.ptA.y))
            .attr("x2", x(parseTime(lg.ptB.x)))
	        .attr("y2", y(lg.ptB.y))
            .attr("id","dotted1");
            
  // Add the valueline path.
  svgLineGraph.append("path")
      .data([newData])
      .attr("class", "line")
      .attr("d", line)
    .attr('pointer-events', 'none')
    .attr("id", "path")
      .transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);

// Add the Y Axis
  svgLineGraph.append("g")
      .attr("class", "axisSteelBlue")
    .attr("id", "leftaxis")
      .call(d3.axisLeft(y));
  
  }
  //Case for when line separation is toggled    
  else {
      
  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
  y.domain([d3.min(data, function(d) {return Math.min(d.b);}), d3.max(data, function(d) {return Math.max(d.b);})]);
   
  // Handles new domain for line/axis (gives it separation look)      
  var ydomainLow = y.domain()[0];
  var ydomainHigh = y.domain()[1];
  var ydomainLength = ydomainHigh - ydomainLow;
  var yaddVal = ydomainLength / 2;   
  y.domain([(ydomainLow - (3 *yaddVal)), (ydomainHigh)]);        
   
  // Linear regression calculation      
  var lg = calcLinear2(newData, "x", "y", 1978, 2017, d3.min(newData, function(d){ return d.b}), d3.max(newData, function(d){ return d.b}));
  
  // Draws linear regression line      
  svgLineGraph.append("line")
	        .attr("class", "regression")
            .attr("x1", x(parseTime(lg.ptA.x)))
	        .attr("y1", y(lg.ptA.y))
            .attr("x2", x(parseTime(lg.ptB.x)))
	        .attr("y2", y(lg.ptB.y))
            .attr("id","dotted1");
            
  // Add the valueline path.
  svgLineGraph.append("path")
      .data([newData])
      .attr("class", "line")
      .attr("d", line)
    .attr('pointer-events', 'none')
    .attr("id", "path")
      .transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);

  // Add the Y Axis
  svgLineGraph.append("g")
      .attr("class", "axisSteelBlue")
    .attr("id", "leftaxis")
      .call(d3.axisLeft(y));
  
  }
});

// Updates the temp data line                
d3.csv("data/newMergedTemp.csv", types4, function(error, data){   // Parses the data from the .csv file using a d3.csv request
    
 if (error) throw error;
    
    var newData = [];
                    
  // format the data
  data.forEach(function(d) {
      if(field === d.state){
          d.dt = d.date
          d.date = parseTime(d.date);
          d.dateInt = parseInt(d.dt)
          d.t = +d.Temp;
          d.stateName = d.state;
          newData.push(d);
      }
  });

  if(!zoomLinesToggled) {
      // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
  y2.domain([d3.min(data, function(d) {return Math.min(d.t);}), d3.max(data, function(d) {return Math.max(d.t); })]);   
    
  var lg = calcLinear(newData, "x", "y", 1978, 2017, d3.max(newData, function(d){ return d.t}), d3.max(newData, function(d){ return d.t}));
    
     d3.selectAll("#dotted2").remove();
    
    svgLineGraph.append("line")
	        .attr("class", "regression")
            .attr("x1", x(parseTime(lg.ptA.x)))
	        .attr("y1", y2(lg.ptA.y))
            .attr("x2", x(parseTime(lg.ptB.x)))
	        .attr("y2", y2(lg.ptB.y))
            .attr("id","dotted2");

  // Add the valueline2 path.
  svgLineGraph.append("path")
      .data([newData])
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", line2)
    .attr('pointer-events', 'none')
      .attr("id", "path2")
      .transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);

  // Add the Y2 Axis
  svgLineGraph.append("g")
      .attr("class", "axisRed")
      .attr("transform", "translate( " + (width + margin.right) + ", 0 )")
    .attr("id", "rightaxis")
      .call(d3.axisRight(y2));
    
  }
  //Case for when line separation is toggled    
  else {
      // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
  y2.domain([d3.min(data, function(d) {return Math.min(d.t);}), d3.max(data, function(d) {return Math.max(d.t); })]);
   
  // Handles new domain for line/axis (gives it separation look)         
  var ydomainLow = y2.domain()[0];
  var ydomainHigh = y2.domain()[1];
  var ydomainLength = ydomainHigh - ydomainLow;
  var yaddVal = ydomainLength / 2;   
  y2.domain([(ydomainLow), (ydomainHigh + (3 *yaddVal))]);   
  
  // Linear regression calculation      
  var lg = calcLinear2(newData, "x", "y", 1978, 2017, d3.max(newData, function(d){ return d.t}), d3.max(newData, function(d){ return d.t}));
    
    // Draws regression line on screen
    svgLineGraph.append("line")
	        .attr("class", "regression")
            .attr("x1", x(parseTime(lg.ptA.x)))
	        .attr("y1", y2(lg.ptA.y))
            .attr("x2", x(parseTime(lg.ptB.x)))
	        .attr("y2", y2(lg.ptB.y))
            .attr("id","dotted2");

  // Add the valueline2 path.
  svgLineGraph.append("path")
      .data([newData])
      .attr("class", "line")
      .style("stroke", "red")
      .attr("d", line2)
    .attr('pointer-events', 'none')
      .attr("id", "path2")
      .transition()
        .duration(2000)
        .attrTween("stroke-dasharray", tweenDash);

  // Add the Y2 Axis
  svgLineGraph.append("g")
      .attr("class", "axisRed")
      .attr("transform", "translate( " + (width + margin.right) + ", 0 )")
    .attr("id", "rightaxis")
      .call(d3.axisRight(y2));
    
  }    
});
};



       
        
    


 

