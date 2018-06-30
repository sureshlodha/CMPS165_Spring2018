var bar_chart = (function(){
function init(dispatcher){
    /*
    TODO:
    1 - can select bars to grey out other bars
    2 - 2 modes, stacked bar and severity
    */
    //define the margins
    var margin = {top: 10, right: 40, bottom: 150, left: 70},
        width = 760 - margin.left - margin.right,
        height = 510 - margin.top - margin.bottom;
    //define the svg
    var svg = d3.select(".bar-chart").append("svg") //will need to change body to something else
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //color scale data
    var colorRange = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'];
    var colorDomain = [];
    
    var selection = [];

    //scales
    var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    var yScale = d3.scaleLinear().range([height, 0]);
    var cScale = d3.scaleThreshold().range(colorRange);
    var lScale = d3.scaleLinear().domain([5, 15]).range([0, 240]);

    //create the x and y axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale); //.ticks .tickformat
    var lAxis = d3.axisBottom(lScale)
        .tickSize(13)
        .tickValues(cScale.domain())
        .tickFormat(function(d) { return d3.format(".0f")(d); });



    d3.csv("Final_Project/data/AggregateInjuries(1).csv", function(error, data) {
        data.forEach(function(d) {
            d.type = d.injury_type;
            d.number = +d.num_injuries;
            d.severity = +d.total_severity / +d.num_injuries;
            d.selected = false;
        });

        //block for color scale domain
        cMax = d3.max(data, function(d) { return d.severity; });
        cMin = d3.min(data, function(d) { return d.severity; }); //maybe try 0 to see impact

        d = (cMax - cMin)/5;

        colorDomain = [7, 10, 12, 13, 15];

        //update the domains of the scales with the data
        xScale.domain(data.map(function(d) { return d.type; }));
        yScale.domain([0, 1.05*d3.max(data, function(d) { return d.number; })]);
        cScale.domain(colorDomain);
        lAxis.tickValues(cScale.domain());
        
        var reset_colors = function() {
            bars.style("fill", function(d) {
                return cScale(d.severity);
            })
            labels.style("fill", "#000000");
        }
        

        //draw the bars
        var bars = svg.selectAll("rect")
            .append('g')
            .attr('class','bars')
            .data(data)
            .enter()
            .append("rect")
            .attr("y", height)
            .attr("height", 0)
            .attr("width", xScale.bandwidth())
            .attr("x", function(d) {
                return xScale(d.type);
            })
//            .on("click", function(d, i) {
//                var dat = d;
//                var greyBars = bars.filter(function(d, i) {
//                    return dat.type != d.type;
//                })
//                var colorBar = bars.filter(function(d, i) {
//                    return dat.type == d.type;
//                })
//                var unselectedText = labels.filter(function(d, i) {
//                    return dat.type != d.type;
//                })
//                var selectedText = labels.filter(function(d, i) {
//                    return dat.type == d.type;
//                })
//                unselectedText.style("fill", "#ffffff");
//                selectedText.style("fill", "#000000");
//                colorBar.style("fill", function(d) {
//                        return(cScale(d.severity));
//                    })
//                greyBars
//                    .style("fill", "#d3d3d3");
//            })
            .attr("y", function(d) {
                return yScale(d.number);
            })
            .attr("height", function(d) {
                return height - yScale(d.number);
            })
            .attr("fill", function(d) {
                return(cScale(d.severity));
            });
       
       dispatcher.on('click.player', function(first){
           if(first !== 'all'){
                var greyBars = bars.filter(function(d, i) {
                    return first != d.type;
                })
                var colorBar = bars.filter(function(d, i) {
                    return first == d.type;
                })
                var unselectedText = labels.filter(function(d, i) {
                    return first != d.type;
                })
                var selectedText = labels.filter(function(d, i) {
                    return first == d.type;
                })
                unselectedText.style("fill", "#ffffff");
                selectedText.style("fill", "#000000");
                colorBar.style("fill", function(d) {
                        return(cScale(d.severity));
                    })
                greyBars
                    .style("fill", "#d3d3d3");
            } else {
                reset_colors();
                d3.select('td.severity').style('background-color', 'gray');
            }   
            
       });
        
       
        
        var labels = svg.selectAll("text")
            .data(data)
            .enter().append("text")
            .attr("text-anchor", "middle")
            .attr("x", function(d) { return xScale(d.type) + 20; })
            .attr("y", function(d) { return yScale(d.number) - 5; })
            .style("font-size", "10px")
            .text(function(d) { return d.number; });
        

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

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -1*margin.left)
            .attr("x", -1*(height/2))
            .attr("dy", "1.5em")
            .style("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .text("Number of Injuries");

        
        var g = svg.append("g")
            .attr("transform", "translate(400, 20)")
            .call(lAxis);
        
        g.select(".domain")
            .remove();
        
        g.selectAll("rect")
            .data(cScale.range().map(function(color) {
                var d = cScale.invertExtent(color);
                if(d[0]==null) d[0]=lScale.domain()[0];
                if(d[1]==null) d[1]=lScale.domain()[1];
                return d;
            }))
            .enter().insert("rect", ".tick")
                .attr("height", 8)
                .attr("x", function(d) { return lScale(d[0]); })
                .attr("width", function(d) { return lScale(d[1]) - lScale(d[0]); })
                .attr("fill", function(d) { return cScale(d[0]); });
        
        g.append("text")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .attr("y", -5)
            .text("Injury Severity (Number of Games Missed)");
        
        var selected_bar;
        d3.selectAll('.body-point').on('click.tooltip', function(){
            var classes = d3.select(this).attr('class').split(/\s/);
            var body_part = classes.length > 2 ? 
                classes[1] + " " + classes[2] : classes[1];
            var bar = bars.filter(function(d,i){
               return d.type == body_part;
            });
            
            d3.select('td.severity').style('background-color', function(){
               return bar.attr('fill');
           });
            selected_bar = bar;
        });
        
        d3.selectAll('.body-point').on('mouseenter.tooltip', function(){
            var classes = d3.select(this).attr('class').split(/\s/);
            var body_part = classes.length > 2 ? 
                classes[1] + " " + classes[2] : classes[1];
            var bar = bars.filter(function(d,i){
               return d.type == body_part;
            });
            
            d3.select('td.severity').style('background-color', function(){
               return bar.attr('fill');
           });
        });
        
        d3.selectAll('.body-point').on('mouseleave.tooltip', function(){
            if(selected_bar){
              d3.select('td.severity').style('background-color', function(){
                   return selected_bar.attr('fill');
               });  
            }
        });
        
            
    });
}
    return {
        init: init,
    }
})()
