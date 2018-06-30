// Reference:
// - https://bl.ocks.org/mbostock/3886208

var d3;

var margin1 = {top: 20, right: 40, bottom: 60, left: 40},
    width = 530,
    height = 370;

var x = d3.scaleBand()
    .rangeRound([0, width-100])
    .paddingInner(0.50)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()
    .range(["#993333", "#a1bb00", "#e60000"]);


d3.csv("data/nutrients.csv", function(d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
},  function(error, data) {
        if (error) throw error;

        var bars = d3.select(".bar_chart")
            .append("svg")
            .attr("height", height + margin1.top + margin1.bottom)
            .attr("width", width + + margin1.left + margin1.right)
            .append("g")
            .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");
    
  
        var keys = data.columns.slice(1);

        data.sort(function(a, b) { return b.total - a.total; });
        x.domain(data.map(function(d) { return d.Diet; }));
        y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
        z.domain(keys);
    
        var stack = bars.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data))
            .enter().append("g")
            .attr("fill", function(d) { return z(d.key); })
            .selectAll("rect")
            .data(function(d) { return d; })
            .enter();
        
        stack.append("rect")
            .attr("fill-opacity", "0.6")
            .attr("x", function(d) { return x(d.data.Diet); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth());
        
        // Reference: https://stackoverflow.com/questions/20626150/display-text-on-rect-using-d3-js
        stack.append("text")
            .text(function(d) { return (d[1] - d[0]) + "%"})
            .attr("x", function(d) { return x(d.data.Diet) + 15; })
            .attr("y", function(d) { return (y(d[1]) + y(d[0])) / 2 + 6; })
            .style("fill", "black");
    
        // x-axis
        bars.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", 210)
            .attr("y", 34)
            .attr("fill", "#000")
            .attr("font-size", 14)
            .text("Diet Types");
    
        bars.append("g")
            .append("text")
            .attr("x", 0)
            .attr("y", 420)
            .attr("fill", "#000")
            .attr("font-size", 7)
            .text("Disclaimer: These values are approximated to the nearest value. The values are accurate for a healthy young adult male.");

        // y-axis
        bars.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", -250)
            .attr("y", 17)
            .attr("dy", "-3.32em")
            .attr("fill", "#000")
            .attr("font-size", 14)
            .attr("text-anchor", "start")
            .attr("transform", "rotate(-90)")
            .text("Percentage of Calorie Intake");

        var legend = bars.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 12)
                .attr("text-anchor", "end")
                .selectAll("g")
                .data(keys.slice().reverse())
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
                .attr("x", width - margin1.right -  6)
                .attr("width", 19)
                .attr("height", 19)
                .attr("fill", z)
                .attr("fill-opacity", "0.6");

        legend.append("text")
                .attr("x", width - margin1.right - 10)
                .attr("y", 9.5)
                .attr("dy", "0.32em")
                .text(function(d) { return d; });
});