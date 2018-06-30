/* Education and Voting Power of Hispanics in the US
** Jonathan Ortiz
** UCSC CMPS 165
*/

// Width and height
var w = 700;
var h = 700;
var padding = 20;

// for Pie chart
var height = 50;
var width = 50;


// Scale functions
var xScale = d3.scaleLinear()
    .domain([1980, 2015])
    .range([padding * 3, w - padding * 6]);

var yScale = d3.scaleLinear()
    .domain([0, 60000000])
    .range([h - padding * 3, padding]);

// Define X axis
var xAxis = d3.axisBottom()
    .scale(xScale)
    .tickFormat(function(d, i) {
      if(i==0 || i==2 || i==4 || i==6 || i==7){
          return d;
      } else {
          return null;
      }
    });

// Define Y axis
var yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(5);

// Line function
var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.value); });

// Create SVG element
var svg = d3.select(".middlecol")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

// Create X axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (padding * 2) + "," + (h - (padding * 3)) + ")")
    .call(xAxis);

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 5)
      .attr("x", 0 - (h/2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of People");

// Create Y axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (padding * 5) + ",0)")
    .call(yAxis);

svg.append("text")
      .attr("y", h - padding)
      .attr("x", (w/2) + padding)
      .attr("dx", "1em")
      .style("text-anchor", "middle")
      .text("Year");



// Read in the poppopulation data
d3.csv("pop_voting/population.csv",function(error, data){
    // Put data in container
    var pop = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {
                return {date: parseFloat(d.date),
                        value: parseFloat(d[id])};
            })
        };
    });

    console.log(pop);

    // Create a g element for each population
    var group = svg.selectAll(".group")
        .data(pop)
        .enter().append("g")
        .attr("class", "group");
    
    // Create path
    var path = group.append("path")
        .attr("class", "line")
        .attr("transform", "translate(" + (padding * 2) + ",0)")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return '#E1E5E2'; });
    
    // Append group name to end of path
    group.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.value) + ")"; })
        .attr("x", padding * 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d, i) { 
            if(i == 0){
                return; // "Total Population";
            }else if(i == 2) {
                return "US Born";
            }else {
                return "Foreign Born";
            }
        });
    
    // Animation
    var totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    
});

var rscale = d3.scaleLinear()
    .domain([13000000,57000000])
    .range([20,45]);

var radius = function (d) {
    // console.log(total);
    return rscale(total);
};
//var radius = Math.min(width,height)/2;
var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

var pie = d3.pie()
    .value(function (d) {
        return d.value;
    })
    .sort(null);


var color = d3.scaleOrdinal(d3.schemeCategory10);

// Read in the education data
d3.csv("pop_voting/education.csv",function(error, data){
    // Put data in container
    var edu = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {
                return {date: parseFloat(d.date),
                        value: parseFloat(d[id])};
            })
        };
    });
    console.log(edu);
    
    // Create a g element for each education
    var edugroup = svg.selectAll(".edugroup")
        .data(edu)
        .enter().append("g")
        .attr("class", "edugroup");
    
    // Create path
    var edupath = edugroup.append("path")
        .attr("class", "line")
        .attr("transform", "translate(" + (padding * 2) + ",0)")
        .attr("d", function(d) { return line(d.values); })
        //.style("stroke", function(d) { return '#1D8335'; });
        .style("stroke", function (d) { return color(d.id);});
    
    // Append group name to end of path
    edugroup.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.value) + ")"; })
        .attr("x", padding * 2)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d, i) { 
            if(i == 0){
                return "Less than 12th";
            }else if(i == 2) {
                return "2 Year College";
            }else if(i == 3) {
                return "4 Year College";
            }else {
                return "High School";
            }
        });
    
    // Animation
    var totalLength = edupath.node().getTotalLength();
    edupath
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    
});
var margin = { top: height-padding*2.5, right: 80, bottom: 30, left: width+padding*2.5 },
x = d3.scaleTime().range([padding * 3, w - padding * 10]),
y = d3.scaleLinear().range([h - padding * 3, padding-padding*2]);
// add the X gridlines
// svg.append("g")
//     .attr("class", "grid")
//     .attr("transform", "translate(" + margin.left + "," + (h - margin.top-60) + ")")
//     .call(d3.axisBottom(x)
//         .ticks(10)
//         .tickSize(-h)
//         .tickFormat("")
//     )

// // add the Y gridlines
// svg.append("g")
//     .attr("class", "grid")
//     .attr("transform", "translate(" + margin.left + "," + margin.top+ ")")
//     .call(d3.axisLeft(y)
//         .ticks(10)
//         .tickSize(-w+padding)
//         .tickFormat("")
//     )

var tooltip = d3.select("body").append("div")
    .attr("class", "toolTip");
d3.csv("pop_voting/education.csv", function (error, data_edu) 
{
    d3.csv("pop_voting/population.csv", function (error, data_pop)
    {
        var pieData = {};
        var totalData= {};
        //reorder data
        for (var elem of data_pop) 
            totalData[elem.date] = +elem.total;
        for (elem of data_edu)
        {
            pieData[elem.date] = [
                { label: "dropout", value: +elem.dropout, total: totalData[elem.date]},
                { label: "hs", value: +elem.hs, total: totalData[elem.date]},
                { label: "comm", value: +elem.comm, total: totalData[elem.date]},
                { label: "coll", value: +elem.coll, total: totalData[elem.date]}];
        }

        for (var key in pieData)
        {
            //create piegroup
            total = d3.sum(pieData[key],function(d){
                return d.value;
            })
            var piegroup = svg.selectAll(".piegroup" + key)
                .data(pie(pieData[key]))
                .enter()
                .append("g")
                .attr("class", "piegroup");
            piegroup
                .append('path')
                .attr('d', arc)
                .attr("transform", "translate(" + (xScale(key)+padding*2) + "," + yScale(totalData[key]) + ")")
                .attr('fill', function (d, i)
                {
                    return color(d.data.label);
                })
                .attr('fill-opacity',0.75)
                .on('mouseover', function (d,i) {
                    var label;
                    if (i == 0) {
                        label = "Less than 12th Grade";
                    } else if (i == 2) {
                        label= "2 Year College Graduates";
                    } else if (i == 3) {
                        label= "4 Year College Graduates";
                    } else {
                        label= "High School Graduates";
                    }
                    tooltip
                    .style("left", d3.event.pageX + 10 + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("display", "inline-block")
                    .html(
                        label + ": " + Math.round((d.data.value / d.data.total)*100)+ "%"
                    );
                })
                .on('mouseout', function (d) {
                    tooltip.style("display", "none");
                });
        }
    });
});

function render(currdataset){
    if (currdataset == "education.csv"){ //default is education.
        location.reload(); //reload page.
    }
    else
    {
        
        // Width and height
        var w = 700;
        var h = 700;
        var padding = 20;

        // for Pie chart
        var height = 50;
        var width = 50;


        // Scale functions
        var xScale = d3.scaleLinear()
            .domain([1988, 2012])
            .range([padding * 3, w - padding * 6]);

        var yScale = d3.scaleLinear()
            .domain([0, 25000000])
            .range([h - padding * 3, padding]);

        // Define X axis
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(function(d, i) {
            if(i==0 || i==2 || i==4 || i==6 || i==8 || i==10 || i==12){
                return d;
            } else {
                return null;
            }
            });

        // Define Y axis
        var yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

        // Line function
        var line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return xScale(d.date); })
            .y(function(d) { return yScale(d.value); });

        svg.remove();
        // Create SVG element
        svg = d3.select(".middlecol")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        // Create X axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (padding * 2) + "," + (h - (padding * 3)) + ")")
            .call(xAxis);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 5)
            .attr("x", 0 - (h/2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of People");

        // Create Y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (padding * 5) + ",0)")
            .call(yAxis);

        svg.append("text")
            .attr("y", h - padding)
            .attr("x", (w/2) + padding)
            .attr("dx", "1em")
            .style("text-anchor", "middle")
            .text("Year");



        // Read in the poppopulation data
        d3.csv("pop_voting/voting.csv",function(error, data){
            // Put data in container
            var pop = data.columns.slice(1).map(function(id) {
                return {
                    id: id,
                    values: data.map(function(d) {
                        return {date: parseFloat(d.date),
                                value: parseFloat(d[id])};
                    })
                };
            });

            console.log(pop);

            // Create a g element for each population
            var group = svg.selectAll(".group")
                .data(pop)
                .enter().append("g")
                .attr("class", "group");
            
            // Create path
            var path = group.append("path")
                .attr("class", "line")
                .attr("transform", "translate(" + (padding * 2) + ",0)")
                .attr("d", function (d) { console.log(d); return line(d.values); })
                .style("stroke", function(d) { 
                    if (d.id == 'total'){
                        return '#E1E5E2';
                    }else {
                    return color(d.id); 
                    }
                });
            
            // Append group name to end of path
            group.append("text")
                .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
                .attr("transform", function(d) { return "translate(" + xScale(d.value.date) + "," + yScale(d.value.value) + ")"; })
                .attr("x", padding * 3)
                .attr("dy", "0.35em")
                .style("font", "10px sans-serif")
                .text(function(d, i) { 
                    if(i == 0){
                        return "Voting";
                    }else if (i == 1) {
                        return "Non-voting";
                    }//else {
                    //    return "Eligible Voters"
                    //}
                });
            
            // Animation
            var totalLength = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", (totalLength+100) + " " + (totalLength+100))
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
});

var rscale = d3.scaleLinear()
    .domain([13000000,57000000])
    .range([20,45]);

var radius = function (d) {
    // console.log(total);
    return rscale(total);
};
//var radius = Math.min(width,height)/2;
var arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(0);

var pie = d3.pie()
    .value(function (d) {
        return d.value;
    })
    .sort(null);


var color = d3.scaleOrdinal(d3.schemeCategory10);


var margin = { top: height-padding*2.5, right: 80, bottom: 30, left: width+padding*2.5 },
x = d3.scaleTime().range([padding * 3, w - padding * 10]),
y = d3.scaleLinear().range([h - padding * 3, padding-padding*2]);
// add the X gridlines
// svg.append("g")
//     .attr("class", "grid")
//     .attr("transform", "translate(" + margin.left + "," + (h - margin.top-60) + ")")
//     .call(d3.axisBottom(x)
//         .ticks(10)
//         .tickSize(-h)
//         .tickFormat("")
//     )

// // add the Y gridlines
// svg.append("g")
//     .attr("class", "grid")
//     .attr("transform", "translate(" + margin.left + "," + margin.top+ ")")
//     .call(d3.axisLeft(y)
//         .ticks(10)
//         .tickSize(-w+padding)
//         .tickFormat("")
//     )

var tooltip = d3.select("body").append("div")
    .attr("class", "toolTip");
d3.csv("pop_voting/voting.csv", function (error, data_vote) 
{
    d3.csv("pop_voting/voting.csv", function (error, data_vote)
    {
        var pieData = {};
        var totalData= {};
        //reorder data
        for (var elem of data_vote) 
            //totalData[elem.date] = (+elem.voting + +elem.nonvoting);
             totalData[elem.date] = +elem.total;
        for (elem of data_vote)
        {
            pieData[elem.date] = [
                { label: "voting", value: +elem.voting, total: totalData[elem.date] },
                { label: "nonvoting", value: +elem.nonvoting, total: totalData[elem.date]}];
        }

        for (var key in pieData)
        {
            //create piegroup
            total = d3.sum(pieData[key],function(d){
                return d.value;
            })
            var piegroup = svg.selectAll(".piegroup" + key)
                .data(pie(pieData[key]))
                .enter()
                .append("g")
                .attr("class", "piegroup");
            piegroup
                .append('path')
                .attr('d', arc)
                .attr("transform", "translate(" + (xScale(key)+padding*2) + "," + yScale(totalData[key]) + ")")
                //.attr("transform", "translate(" + (xScale(key)+padding) + ")")
                .attr('fill', function (d, i)
                {
                    return color(d.data.label);
                })
                .attr('fill-opacity',0.75)
                .on('mouseover', function (d,i) {
                    var label;
                    if (i == 0) {
                        label = "Voting";
                    } else if (i == 1) {
                        label = "Non-voting";
                    }// else{
                    //    label = "Eligible Voters";
                    //}
                    tooltip
                    .style("left", d3.event.pageX + 10 + "px")
                    .style("top", d3.event.pageY + "px")
                    .style("display", "inline-block")
                    .html(
                        label +": "+Math.round((d.data.value / d.data.total )*100) + "%"
                    );
                })
                .on('mouseout', function (d) {
                    tooltip.style("display", "none");
                });
        }
    });
});
    }
    
}

function edudata(){
    var votingbutt = document.getElementById('bt3');
    votingbutt.style.display = "block";
    
    currdataset = "education.csv";
    render("education.csv");
}
function votingdata(){
    currdataset = "voting.csv";
    render("voting.csv");
}
