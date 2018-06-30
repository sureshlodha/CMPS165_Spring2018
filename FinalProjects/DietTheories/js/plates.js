// References: 
// - https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
// - http://jsfiddle.net/5acQ4/15/
// - https://stackoverflow.com/questions/22456235/force-layout-nodes-filled-with-images

var d3, document;

var colors = [
    {
        type: "grains",
        color: "#ffba00"
    },
    {
        type: "vegetables",
        color: "#a1bb00"
    },
    {
        type: "fruits",
        color: "#ed3030"
    },
    {
        type: "meat",
        color: "#b2907c"
    },
    {
        type: "dairy",
        color: "#8acbe3"
    },
    {
        type: "oil",
        color: "#ff8c00"
    },
]

//Define Tooltip here
var tooltip = d3.select("body").append("div").attr("class", "toolTip");


// Reference:
// - https://bl.ocks.org/mbostock/1014829
d3.xml("plate.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    document.getElementById("Paleo_Plate").appendChild(xml.documentElement);
   
    d3.select("#Paleo_Plate")
         .append("text")
        .text("The Paleo diet is modeled after what our prehistoric ancestors ate. No processes or farmed foods. Eat whatever is found naturally in nature.")
         .style("text-anchor", "middle");
    
    //Define SVG
    var svg = d3.select("#Paleo_Plate")
        .select("svg")
        .append("g")
        .attr("transform", "translate(" + 150 + "," + 200 + ")")
        .attr("class", "force_layout");

    d3.json("data/foods.json", function(error, data) {
        if (error) throw error;
       
        // Imported data for Paleo
        var foods = {
            nodes: data.filter(function(d) { return d.category == "Paleo"}),
        }

        // Append a "g" tag that represents each node. Each node "g" tag will have transformation for dragging
        var node = svg.selectAll("g")
            .data(foods.nodes)
            .enter().append("svg:g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

            // Reference: 
            // - https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
            // - https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
            .on("mouseenter", function(d){
                console.log(d);
                tooltip
                  .style("left", d3.event.pageX  + "px")
                  .style("top", d3.event.pageY  + "px")
                  .style("display", "inline-block")
                  .html("<b>" + d.name + "</b>" + "<br>" + 
                        "Protein: " + d.protein + "<br>" + 
                        "Carbs: " + d.carbohydrate + "<br>" +
                        "Fat: " + d.fat);
            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});

        node.append("circle")
            .attr("r", 90)
            .attr("fill", function(d) {
                for (var i = 0; i < colors.length; i++) {
                    if (colors[i].type == d.type) { return colors[i].color };
                }
            })
            .style('fill-opacity', "0.6");

        // For each node, append a food image
        node.append("svg:image")
            .attr("xlink:href",  function(d) { 
                if (d.category == "Paleo"){ return "images/" + d.category.toLowerCase() + "/paleo_" + d.food + ".png";} 
            })
            .attr("x", function(d) { return -85;})
            .attr("y", function(d) { return -85;})
            .attr("height", 170)
            .attr("width", 170)
            .attr("pointer-events", "none");

        var ticked = function() {
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        }  

        // Create force simulation with collision and charge
        var simulation = d3.forceSimulation()
            .force("collision",d3.forceCollide().radius(90))
            .force("charge", d3.forceManyBody().strength(-15))
            .force("center", d3.forceCenter(width / 2 - 25, height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0))
        
        // Start up the simulation
        simulation
            .nodes(foods.nodes)
            .on("tick", ticked);

        // Drag Functions
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            tooltip.style("display", "none");
            d.fx = d3.event.x;
            d.fy = d3.event.y;

        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        } 
    });
});


d3.xml("plate.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    document.getElementById("Zone_Plate").appendChild(xml.documentElement);

    d3.select("#Zone_Plate")
         .append("text")
        .text("The Zone diet focuses on a diet where everything is balanced but it states that we should consume less grains and focus more on meat and vegetables.")
         .style("text-anchor", "middle");

    //Define SVG
    var svg = d3.select("#Zone_Plate")
        .select("svg")
        .append("g")
        .attr("transform", "translate(" + 150 + "," + 200 + ")")
        .attr("class", "force_layout");

    d3.json("data/foods.json", function(error, data) {
        if (error) throw error;
       
        // Imported data for Zone
        var foods = {
            nodes: data.filter(function(d) { return d.category == "Zone"}),
        }

        // Append a "g" tag that represents each node. Each node "g" tag will have transformation for dragging
        var node = svg.selectAll("g")
            .data(foods.nodes)
            .enter().append("svg:g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

            // Reference: 
            // - https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
            // - https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
            .on("mouseenter", function(d){
                tooltip
                  .style("left", d3.event.pageX  + "px")
                  .style("top", d3.event.pageY  + "px")
                  .style("display", "inline-block")
                  .html("<b>" + d.name + "</b>" + "<br>" + 
                        "Protein: " + d.protein + "<br>" + 
                        "Carbs: " + d.carbohydrate + "<br>" +
                        "Fat: " + d.fat);
            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});

        node.append("circle")
            .attr("r", 90)
            .attr("fill", function(d) {
                for (var i = 0; i < colors.length; i++) {
                    if (colors[i].type == d.type) { return colors[i].color };
                }
            })
            .style('fill-opacity', "0.6");
    
        // For each node, append a food image
        node.append("svg:image")
            .attr("xlink:href",  function(d) { 
                if (d.category == "Zone"){ return "images/" + d.category.toLowerCase() + "/zone_" + d.food + ".png";} 
            })
            .attr("x", function(d) { return -85;})
            .attr("y", function(d) { return -85;})
            .attr("height", 170)
            .attr("width", 170)
            .attr("pointer-events", "none");

        var ticked = function() {
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        }  

        // Create force simulation with collision and charge
        var simulation = d3.forceSimulation()
            .force("collision",d3.forceCollide().radius(90))
            .force("charge", d3.forceManyBody().strength(-15))
            .force("center", d3.forceCenter(width / 2 - 25, height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0))
        
        // Start up the simulation
        simulation
            .nodes(foods.nodes)
            .on("tick", ticked);

        // Drag Functions
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            tooltip.style("display", "none");
            d.fx = d3.event.x;
            d.fy = d3.event.y;

        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        } 
    });
});


d3.xml("plate.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    document.getElementById("Vegan_Plate").appendChild(xml.documentElement); 
    
    d3.select("#Vegan_Plate")
         .append("text")
        .text("The Vegan diet focuses on the consumptions of naturally grown foods. No meat or any form of animal products are eaten.")
         .style("text-anchor", "middle");

    //Define SVG
    var svg = d3.select("#Vegan_Plate")
        .select("svg")
        .append("g")
        .attr("transform", "translate(" + 150 + "," + 200 + ")")
        .attr("class", "force_layout");

    d3.json("data/foods.json", function(error, data) {
        if (error) throw error;
       
        // Imported data for Vegan
        var foods = {
            nodes: data.filter(function(d) { return d.category == "Vegan"}),
        }

        // Append a "g" tag that represents each node. Each node "g" tag will have transformation for dragging
        var node = svg.selectAll("g")
            .data(foods.nodes)
            .enter().append("svg:g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

            // Reference: 
            // - https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
            // - https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
            .on("mouseenter", function(d){
                tooltip
                  .style("left", d3.event.pageX  + "px")
                  .style("top", d3.event.pageY  + "px")
                  .style("display", "inline-block")
                  .html("<b>" + d.name + "</b>" + "<br>" + 
                        "Protein: " + d.protein + "<br>" + 
                        "Carbs: " + d.carbohydrate + "<br>" +
                        "Fat: " + d.fat);
            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});

        node.append("circle")
            .attr("r", 90)
            .attr("fill", function(d) {
                for (var i = 0; i < colors.length; i++) {
                    if (colors[i].type == d.type) { return colors[i].color };
                }
            })
            .style('fill-opacity', "0.6");
    

        // For each node, append a food image
        node.append("svg:image")
            .attr("xlink:href",  function(d) { 
                if (d.category == "Vegan"){ return "images/" + d.category.toLowerCase() + "/vegan_" + d.food + ".png";} 
            })
            .attr("x", function(d) { return -85;})
            .attr("y", function(d) { return -85;})
            .attr("height", 170)
            .attr("width", 170)
            .attr("pointer-events", "none");


        var ticked = function() {
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        }  

        // Create force simulation with collision and charge
        var simulation = d3.forceSimulation()
            .force("collision",d3.forceCollide().radius(90))
            .force("charge", d3.forceManyBody().strength(-15))
            .force("center", d3.forceCenter(width / 2 - 25, height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0))
        
        // Start up the simulation
        simulation
            .nodes(foods.nodes)
            .on("tick", ticked);

        // Drag Functions
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            tooltip.style("display", "none");
            d.fx = d3.event.x;
            d.fy = d3.event.y;

        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        } 
    });
});


d3.xml("plate.svg").mimeType("image/svg+xml").get(function(error, xml) {
    if (error) throw error;
    document.getElementById("USDA_Plate").appendChild(xml.documentElement);
    
    d3.select("#USDA_Plate")
         .append("text")
        .text("The regular USDA diet is the recommended amount of food that the USA believes a healty adult should be consuming every day.")
         .style("text-anchor", "middle");
    
    //Define SVG
    var svg = d3.select("#USDA_Plate")
        .select("svg")
        .append("g")
        .attr("transform", "translate(" + 150 + "," + 200 + ")")
        .attr("class", "force_layout");

    d3.json("data/foods.json", function(error, data) {
        if (error) throw error;
       
        // Imported data for USDA
        var foods = {
            nodes: data.filter(function(d) { return d.category == "USDA"}),
        }

        // Append a "g" tag that represents each node. Each node "g" tag will have transformation for dragging
        var node = svg.selectAll("g")
            .data(foods.nodes)
            .enter().append("svg:g")
            .attr("class", "node")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
        
            // Reference: 
            // - https://bl.ocks.org/alandunning/274bf248fd0f362d64674920e85c1eb7
            // - https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
            .on("mouseenter", function(d){
                console.log(d);

                tooltip
                  .style("left", d3.event.pageX  + "px")
                  .style("top", d3.event.pageY  + "px")
                  .style("display", "inline-block")
                  .html("<b>" + d.name + "</b>" + "<br>" + 
                        "Protein: " + d.protein + "<br>" + 
                        "Carbs: " + d.carbohydrate + "<br>" +
                        "Fat: " + d.fat);
            })
            .on("mouseout", function(d){ tooltip.style("display", "none");});

        node.append("circle")
            .attr("r", 90)
            .attr("fill", function(d) {
                for (var i = 0; i < colors.length; i++) {
                    if (colors[i].type == d.type) { return colors[i].color };
                }
            })
            .style('fill-opacity', "0.6");
    

        // For each node, append a food image
        node.append("svg:image")
            .attr("xlink:href",  function(d) { 
                if (d.category == "USDA"){ return "images/" + d.category.toLowerCase() + "/usda_" + d.food + ".png";} 
            })
            .attr("x", function(d) { return -85;})
            .attr("y", function(d) { return -85;})
            .attr("height", 170)
            .attr("width", 170)
            .attr("pointer-events", "none");

        var ticked = function() {
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        }  

        // Create force simulation with collision and charge
        var simulation = d3.forceSimulation()
            .force("collision",d3.forceCollide().radius(90))
            .force("charge", d3.forceManyBody().strength(-15))
            .force("center", d3.forceCenter(width / 2 - 25, height / 2))
            .force("y", d3.forceY(0))
            .force("x", d3.forceX(0))
        
        // Start up the simulation
        simulation
            .nodes(foods.nodes)
            .on("tick", ticked);

        // Drag Functions
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            tooltip.style("display", "none");
            d.fx = d3.event.x;
            d.fy = d3.event.y;

        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        } 
    });
});
