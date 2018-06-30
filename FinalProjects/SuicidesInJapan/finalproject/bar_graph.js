/*global d3*/
/* ----------------------------------------------------------------------------
File: BarGraphSample.js
Contructs the Bar Graph using D3
80 characters perline, avoid tabs. Indet at 4 spaces. See google style guide on
JavaScript if needed.
-----------------------------------------------------------------------------*/



// Search "D3 Margin Convention" on Google to understand margins.
// This defines a margin object that contains a child object containing the
// size of the margin for each of the 4 sides of the canvas.
// The margin object also contains dimensions for the SVG canvas object.
var margin = {top: 10, right: 40, bottom: 150, left: 100},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* --------------------------------------------------------------------
SCALE and AXIS are two different methods of D3. See D3 API Refrence and
look up SVG AXIS and SCALES. See D3 API Reference to understand the
difference between Ordinal vs Linear scale.
----------------------------------------------------------------------*/

/**** Define X and Y SCALE. ****/
// constructs a band scale, sets range, sets padding
// band scales are used to map a discrete domain to a continuous output range
// in this case, domain is the set of countries, while the range is the continuous values on an x-axis
var xBandScale = d3.scaleBand()         // constructs a null band scale
               .rangeRound([0, width])  // sets range to [0, width]
               .padding(0.2);           //sets padding to 0.1

// creates a new linear scale with range of [height, 0]
var yScale = d3.scaleLinear().range([height, 0]);

// creates a new linear scale with range of [255, 80]
var colorScale = d3.scaleThreshold()
                   .range(['#fee5d9','#fcae91','#fb6a4a','#de2d26','#a50f15']);
// Define X and Y AXIS
// Creates an xAxis using the axisBottom function
var xAxis = d3.axisBottom(xBandScale);  // this axis operates on the xBandScale defined above

// this axis operates on the yScale defined above
// Define tick marks on the y-axis as shown on the output with an interval of 5 and $ sign
var yAxis = d3.axisLeft(yScale).ticks(5).tickFormat( function(d) { return d });

var suicideLabelOffsetY = -3;
var suicideLabelOffsetX = 30;

/* --------------------------------------------------------------------
To understand how to import data. See D3 API refrence on CSV. Understand
the difference between .csv, .tsv and .json files. To import a .tsv or
.json file use d3.tsv() or d3.json(), respectively.
----------------------------------------------------------------------*/

// data.csv contains the age name(age) and its suicide_rate(suicide_rate)
// d.age and d.suicide_rate are very important commands
// You must provide comments here to demonstrate your understanding of these commands
// captures the file "suicide_rate2016TrillionUSDollars.csv" as data as an argument to an anonymous function

var year_array;
var year_index = 0;

var myData;
var year_key_reason = {};
var variables = ["household","health","economy","workplace","relationship","education","other"];



function declare_bargraph()
{
	d3.csv("src/transpose_reason.csv",function(error, data){
		var year_array = data.columns.slice(1);
		//console.log(year_array);
		var years = data.columns.slice(1).map(function(id) {
			return {
				id: id,
				values: data.map(function(d) {
					var check = d[id].split("-");
					return {reason: d.reason, total:+check[0], male:+check[1], female:+check[2]};
				})
			};
		});
		
		data.forEach((d, i) => {
			year_key_reason[d.year] = i;
		});

		myData = data;
		//console.log(data);
		year = year_array[year_index];
		
		// Return X and Y SCALES (domain). See Chapter 7:Scales (Scott M.)
		// creates an ordinal domain for x-axis
		xBandScale.domain(data.map(function(d){ return d.reason; }));
		
        var range_totals = new Array();
        for( var i = 0; i < 7; i++){
            var add = 0;
            for( var j = 2007; j <= 2017; j++){
                add += years[j-2007].values[i].total;
            }
            range_totals.push(add);
        }        
		// creates a linear domain for y-axis, from 0 to the maximum suicide_rate value in data
		yScale.domain([0, d3.max(range_totals)]);
        		
		// sets the domain for our color scale in the same way as yScale
		var color_max = d3.max(range_totals);
		var color_min = d3.min(range_totals);
		colorScale.domain([ color_min, 10000, 20000, 70000, color_max ]);
		
		//console.log(data);	
		// Creating rectangular bars to represent the data.
		viz_2.selectAll("rect")                          // select all rectangles in our canvas
			.data(data)                                  // capture the data parsed from our .csv
			.enter()                                     // instantiate empty rectangles
			.append("rect")            /*                // append these empty rectangles to the DOM
			.transition().duration(1000)                 // set how long our transitions take to complete
			.delay(function(d,i) { return i * 200;})*/   // begin each transition .2 seconds after the last
			.attr("x", function(d) {                     // set x coord for each rectangle
				return xBandScale(d.reason);             // map d.age to range specified by xBandScale
			})
			.attr("y", function(d) {                     // set y coord for each rectangle
                total = reason_total(d, 2007, 2017);     // hard coded default values
                return yScale(total);                    // map d.suicide_rate to range specified by yScale
			})
			.attr("width", xBandScale.bandwidth())      // set the width of each rectangle
			.attr("height", function(d) {               // set the height of each rectangle
                total = reason_total(d, 2007, 2017);    // hard coded default values
				return height - yScale(total);          // translate height into canvas coordinate system
			})
			.attr("fill", function(d) {     // use colorScale to set each rectangle fill relative to suicide_rate
                total = reason_total(d, 2007, 2017);
				return colorScale(total)
			});

		// Label the data suicide_rates(d.suicide_rate)
		viz_2.selectAll("text")
			.data(data)
			.enter()
			.append("text")
			.text(function(d){
				return reason_total(d, 2007, 2017);
			})
			.attr("x", function(d){                                     // place each suicide_rate value at regular intervals
				return xBandScale(d.reason)+(xBandScale.bandwidth())/2; // along the x axis
			})
			.attr("y", function(d){                                     // place each suicide_rate value at the top of its
                total = reason_total(d, 2007, 2017);
				return yScale(total) + suicideLabelOffsetY;             // corresponding rectangle
			})
            .attr("id", "label")
            .attr("color", "black")
			.attr("text-anchor", "middle")
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
            .attr("font-weight", "bold")
			.attr("fill", "black");

		// Draw xAxis and position the label at -60 degrees as shown on the output
		viz_2.append("g")                       // select an uninitialized svg element "g"
			.attr("class", "x axis")            // set g's class attribute
			.attr("transform", "translate(0," + height + ")")   //translate g
			.call(xAxis)                        // call our xAxis function (the svg to append)
			.selectAll("text")                  // select uninitialized text element in g
			.attr("dy", ".7em")                 // set y coord
			.style("text-anchor", "middle")     // set text-anchor of text element
			.attr("font-size", "10px");         // set font-size of text element

		// Draw yAxis and add tick marks along y-axis at interval of 5 with a $ sign
		viz_2.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(0, 0)")
			.call(yAxis)
			.selectAll("text")
			.attr("dx", "-.8em")
			.attr("dy", ".25em")
			.style("text-anchor", "end")
			.attr("font-size", "10px");
		
		// place .text() at (dx,dy), rotate by 90 degrees
		viz_2.append("text")
			.attr("dx", -175)
			.attr("dy", -65)
			.attr("transform", "rotate(-90)")
			.attr("text-anchor", "middle")
			.text("Total Suicides");

		viz_2.append("text")
			.attr("dx", 300)
			.attr("dy", 400)
			.attr("text-anchor", "middle")
			.attr("id","bar_graph")
			.text("Suicide by Reason: " + 2007 + " to " + 2017)
			
		
	});
}

var svg = d3.select("viz_2");



var ordinal = d3.scaleOrdinal()
  .domain(["0 Suicides Per 100,000 People", "15 Suicides Per 100,000 People", "20 Suicides Per 100,000 People", "25 Suicides Per 100,000 People", "30 Suicides Per 100,000 People"])
  .range([ "rgb(254,229,217)", "rgb(252,174,145)", "rgb(251,106,74)", "rgb(222,45,38)", "rgb(165,15,21)"]);




var total;

function draw_slider(year_min, year_max)
{
    //year = this.value.toString();
    year = year_min;
    //total = 0;
    
    // update rectangular bars to represent the data.
    viz_2.selectAll("rect")                      // select all rectangles in our canvas
        .transition().duration(100)              // set how long our transitions take to complete
        .delay(function(d,i) { return 100;})     // begin each transition .2 seconds after the last
        .attr("x", function(d) {                 // set x coord for each rectangle
            return xBandScale(d.reason);         // map d.age to range specified by xBandScale
        })
        .attr("y", function(d) {                 // set y coord for each rectangle
            total = reason_total(d, year_min, year_max);
            return yScale(total);    // map d.suicide_rate to range specified by yScale
        })
        .attr( "width", xBandScale.bandwidth() )    // set the width of each rectangle
        .attr("height", function(d) {               // set the height of each rectangle
            total = reason_total(d, year_min, year_max);
            return height - yScale(total);    // translate height into canvas coordinate system
        })
        .attr("fill", function(d) {     // use colorScale to set each rectangle fill relative to suicide_rate
            total = reason_total(d, year_min, year_max);
            return colorScale(total)
        });
    
    // Label the data
    viz_2.selectAll("#label")
        .transition().duration(100)             // set how long our transitions take to complete
        .delay(function(d,i) { return 100;})    // begin each transition .2 seconds after the last
        .text(function(d){
            return reason_total(d, year_min, year_max);
        })
        .attr("x", function(d){                                    // place each suicide_rate value at regular intervals
            return xBandScale(d.reason)+(xBandScale.bandwidth())/2;   // along the x axis
        })
        .attr("y", function(d){                             // place each suicide_rate value at the top of its
            total = reason_total(d, year_min, year_max);    // corresponding rectangle
            return yScale(total)+suicideLabelOffsetY;
        })
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "black");


 	viz_2.select("text#bar_graph")
 		.text("Suicide by Reason: " + year_min + " to " + year_max);   
}

function reason_total(d, year_min, year_max){
    var my_total = 0;
    for( var i = year_min; i <= year_max; i++){
        my_total += +d[i].split("-")[gender_index];
    }
    return my_total;
}
