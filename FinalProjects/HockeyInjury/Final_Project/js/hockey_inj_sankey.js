var sankey = (function(){
var node_rects;
var csv = "Final_Project/data/AggregateInjuries(1).csv";
var json = "Final_Project/data/sankey.json";
var json = "Final_Project/data/sankey.json";
var units = "injuries";
    
var isSelected = false;
var highlightedNodes = [...Array(21).keys()]; 
var yOffset = 30; //500:275
var xOffset = 50; //500:150

//color scale data
var colorRange = ['#a50f15', '#de2d26', '#fb6a4a', '#fcae91', '#fee5d9', '#8dd3c7', '#b3de69', '#bebada', '#80b1d3'];

// set the dimensions and margins of the graph
var margin = {top: 30, right: 50, bottom: 10, left: 50},
    width = 1200 -50 - margin.left - margin.right,
    height = 600 -25- margin.top - margin.bottom;

// format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory20);
    
// append the svg object to the body of the page
var svg = d3.select(".sankey").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

var div = d3.select(".sankey").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);    
    
var node_width = 75;
// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(node_width)
    .size([width, height]);

var path = sankey.link();

var translation = ["15","13","12","10","7", //based on sev_scale
                   "Forward","Goalie","Defense",
                   "Lower body", "Upper body","Leg", "Head", "Foot", "Hand", "Groin", "Shoulder", "Back", "Face", "Torso", "Arm", "Neck"]
  
// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {  
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
    });
};

function getInjuryCSV(csv){
    return new Promise(function(resolve, reject){
        d3.csv(csv, function(error,data){
            if(error){
                reject(error);
            } 
            data.forEach(function(d,i) {
                d.injuries_d=+d.injuries_d;
                d.injuries_f=+d.injuries_f;
                d.injuries_g=+d.injuries_g;
                d.type = d.injury_type;
                d.number = +d.num_injuries;
                d.severity = +d.total_severity / +d.num_injuries;
            });
            resolve(data);
        });
    });
}
function getSankeyJSON(json){
    return new Promise(function(resolve,reject){
        d3.json(json, function(error, data){
            if(error){
                reject(error);
            }
            
            resolve(data); 
        });
    });
}
function formatData(data,graph){
    for (var i = 0; i < data.length; i++) {
        var type = data[i].type;
        var node_num = translation.indexOf(type);
        //console.log(type, node_num);
        var sev_node_num = sev_scale(data[i].severity);
        var num_injuries = data[i].number;
        var num_f = data[i].injuries_f;
        var num_g = data[i].injuries_g;
        var num_d = data[i].injuries_d;

        for(var j = 0; j < graph.links.length; j++){
            if( graph.links[j].source==node_num){
                if( graph.links[j].target==5){
                    graph.links[j].value=num_f;
                }else if( graph.links[j].target==6){
                    graph.links[j].value=num_g;
                }else if( graph.links[j].target==7){
                    graph.links[j].value=num_d;
                }
            }else if(graph.links[j].target==node_num){
                if( graph.links[j].source==sev_node_num){
                    graph.links[j].value = num_injuries;
                }
            }
        }
    }
    
    return graph; 
}

function init(dispatcher){
    //source: 
    //-https://bl.ocks.org/d3noob/013054e8d7807dff76247b81b0e29030
    //TODO: 
    //  -node color
    //  -ribbon color
    //  -do something when a node is clicked
    
    //all the same variables are still availbe to you, they're
    // just global to the module now. 
    //load csv data
    
    
    d3.csv(csv, function(error, data) {

        data.forEach(function(d,i) {
            d.injuries_d=+d.injuries_d;
            d.injuries_f=+d.injuries_f;
            d.injuries_g=+d.injuries_g;
            d.type = d.injury_type;
            d.number = +d.num_injuries;
            d.severity = +d.total_severity / +d.num_injuries;
        });
        
        console.log(data);
        // load the json data
        d3.json(json, function(error, graph) {
            /*graph.nodes.forEach(function(d,i){
               console.log(d); 
            });*/
            for (var i = 0; i < data.length; i++) {
                var type = data[i].type;
                var node_num = translation.indexOf(type);
                //console.log(type, node_num);
                var sev_node_num = sev_scale(data[i].severity);
                var num_injuries = data[i].number;
                var num_f = data[i].injuries_f;
                var num_g = data[i].injuries_g;
                var num_d = data[i].injuries_d;

                for(var j = 0; j < graph.links.length; j++){
                    if( graph.links[j].source==node_num){
                        if( graph.links[j].target==5){
                            graph.links[j].value=num_f;
                            //console.log( graph.links[j]);
                        }else if( graph.links[j].target==6){
                            graph.links[j].value=num_g;
                            //console.log( graph.links[j]);
                        }else if( graph.links[j].target==7){
                            graph.links[j].value=num_d;
                            //console.log( graph.links[j]);
                        }
                    }else if(graph.links[j].target==node_num){
                        if( graph.links[j].source==sev_node_num){
                            graph.links[j].value = num_injuries;
                            //console.log(graph.links[j]);
                        }
                    }
                }
            }

        sankey
            .nodes(graph.nodes)
            .links(graph.links)
            .layout(0);

        // add in the links
        var link = svg.append("g").selectAll(".link")
            .data(graph.links)
        .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .attr("id", function(d) {
                return "link"+ d.source.node+"_"+d.target.node;
            })
            .style("stroke-width", function(d) { return Math.max(0, d.dy); });
            

        // add the link mouseover
        link.on("mouseover", function(d) {
                target_node_num = translation.indexOf(d.target.name);
                source_node_num = translation.indexOf(d.source.name);
            
                var linkID = "#link"+source_node_num+"_"+target_node_num;
                
                if( !isSelected){
                    d3.select(linkID) // I think something is misssing here
                        .style("stroke-opacity", .5);
                }
                //console.log(highlightedNodes.indexOf(source_node_num), highlightedNodes.indexOf(target_node_num), highlightedNodes.indexOf(target_node_num)>=0 && highlightedNodes.indexOf(source_node_num)>=0)
                if(highlightedNodes.indexOf(target_node_num)>=0 && highlightedNodes.indexOf(source_node_num)>=0){
                    //console.log("mouseover for link btwn ", d.source.name, " and ",d.target.name, "   val: ", format(d.value));
                    //console.log(d);
                    div.transition()
                        .duration(200)
                        .style("opacity", .95);

                    var mouseover_div = div;
                    
                
                    //console.log( target_node_num, source_node_num, "  are in ", highlightedNodes);
                    //console.log(d3.mouse(this));
                    if( translation.indexOf(d.source.name) <5){
                        //console.log("<<<<<<<<<<<<[[",translation.indexOf(d.source.name),"]]")
                        var current_severity = 0;
                        //console.log(d)
                        data.forEach(function(x){ if(d.target.name == x.type){current_severity=x.severity;}})
                        mouseover_div.html( "<b>"+ format(d.value)+" "+ d.target.name +" injuries<br>"+
                                            "Average number of games missed: "+current_severity.toFixed(2)+"</b>")
                                     .style("top", (d3.mouse(this)[1]) + "px")
                                     .style("left", (d3.mouse(this)[0]) + "px");
                    }else{
                        //console.log(">>>>>>>>>>>>[[",translation.indexOf(d.source.name),"]]")
                        mouseover_div.html( "<b>"+ format(d.value)+" "+ d.source.name +" injuries</b>"
                                          )
                                     .style("top", (d3.mouse(this)[1]) + "px")
                                     .style("left", (d3.mouse(this)[0]) + "px");
                    }
                }//////////////////////////
                                        
                
                    
            })
            .on("mouseout", function(d) {
                target_node_num = translation.indexOf(d.target.name);
                source_node_num = translation.indexOf(d.source.name);
            
                var linkID = "#link"+source_node_num+"_"+target_node_num;
                if( !isSelected){
                    d3.select(linkID)
                        .style("stroke-opacity", .2);
                }
            
                div.transition()
                   .duration(500)
                   .style("opacity", 0);
            })/*.append("title")
            .text(function(d) {
                return d.source.name + " → " + 
                    d.target.name + "\n" + format(d.value); });*/

        // add in the nodes
        var node = svg.append("g").selectAll(".node")
            .data(graph.nodes)
        .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")"; });


        // add the rectangles for the nodes
        var node_rects = node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .attr("id", function(d) {return "node"+ d.node;})
            .style("fill", function(d) { return d.color = get_color(d.node);})
            .on("mouseover", function(d) {

                //console.log("mouseover for ", d.name, d.value, d3.mouse(this))

                div.transition()
                    .duration(200)
                    .style("opacity", .95);
                //console.log(d3.event)
                var mouseover_div = div.style("left", (d3.event.layerX-xOffset) + "px")
                                        .style("top", (d3.event.layerY-yOffset) + "px");
                if( translation.indexOf(d.name) <5){

                    //console.log(d.name, " is a severity", translation.indexOf(d.name));
                    mouseover_div.html( "<b>Total injuries of this severity level: "+format(d.value))
                        //"<b><p>Severity: "+d.name+"</p>"+
                         //format(d.value)+"</b>")
                }else if( translation.indexOf(d.name) <8){
                    //console.log(d.name, " is a position")
                    mouseover_div.html( "<b>Total "+d.name+" injuries: "+ format(d.value))
                        //"<b>Position: "+d.name+""+
                         //"</br>"+ format(d.value)+"</b>")

                }else{
                    //console.log(d.name, " is a body part")
                    mouseover_div.html( "<b>Total "+d.name+" injuries: "+ format(d.value))
                        //"<b><center>Body Part: "+d.name+"</center>"+
                         //"</br>"+ format(d.value)+"</b>")
                }
                
                    
            })
            .on("mouseout", function(d) {
                div.transition()
                   .duration(500)
                   .style("opacity", 0);
            })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(2); });
            //.on("click", color_selected_node)
            
        dispatcher.on('click',function(body_part){
            if(body_part !== 'all'){
                var find = {};
                var filtered = node_rects.filter(function(d){
                    if(d.name === body_part){
                        find['node'] = d.node;
                    }
                    return d.name === body_part;
                });

                color_selected_node(find, filtered);
            } else {
                colorAllNodes();
            }
            
        })

        // add in the title for the nodes
        node.append("text")
          .attr("x", -6)
          .attr("y", function(d) { return d.dy / 2; })
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");

        var col_label_height = -10
        //add the column labels
        svg.append("text")
            .attr("x", node_width/2)
            .attr("y", col_label_height)
            .text("Severity")
            .attr("text-anchor", "middle");
        svg.append("text")
            .attr("x", width/2)
            .attr("y", col_label_height)
            .text("Body Part")
            .attr("text-anchor", "middle");
        svg.append("text")
            .attr("x", width - node_width/2)
            .attr("y", col_label_height)
            .text("Position")
            .attr("text-anchor", "middle");


        function color_selected_node(d,filtered){
            //coloring connected nodes and links based on what we clicked
            console.log(graph.links[0].value)
            if(d.node>=8){ // body part nodes
                [...Array(21).keys()].forEach( function(d){ //remove color from all nodes
                        d3.select("#node"+d)
                                .style("fill", "#d9d9d9");
                    })
                var debug_color = "#bc80bd"
                filtered
                    .style("fill", get_color(d.node));


                var unselected_nodes = [...Array(21).keys()]
                unselected_nodes.splice(d.node,1); //removing self 
                for(var j = 0; j < graph.links.length; j++){
                    if( graph.links[j].source.node==d.node && graph.links[j].value !=0){
                        //right half of the sankey
                        var dest =graph.links[j].target.node
                        if( dest == 6){
                           console.log("goalie injuries: "+graph.links[j].value);
                        }
                        var linkID = "#link"+d.node+"_"+dest
                        d3.select(linkID)
                            .style("stroke", get_color(dest))
                            .style("stroke-opacity", 1)
                            .moveToFront();
                        d3.select("#node"+dest)
                            .style("fill", get_color(dest));
                        unselected_nodes.splice(unselected_nodes.indexOf(dest), 1)
                    }else if(graph.links[j].target.node==d.node && graph.links[j].value !=0){
                        //left half of the sankey
                        var src =graph.links[j].source.node
                        var linkID = "#link"+src+"_"+d.node
                        d3.select(linkID)
                            .style("stroke", get_color(src))
                            .style("stroke-opacity", 1)
                            .moveToFront();
                        d3.select("#node"+src)
                            .style("fill", get_color(src));
                        unselected_nodes.splice(unselected_nodes.indexOf(src), 1)
                    }else{
                        //grey out links
                        var src =graph.links[j].source.node;
                        var dest =graph.links[j].target.node;
                        var linkID = "#link"+src+"_"+dest;
                        d3.select(linkID)
                            .style("stroke", "#000")
                            .style("stroke-opacity", .05);
                        /*d3.select("#node"+src)
                            .style("fill", "#d9d9d9");
                        d3.select("#node"+dest)
                            .style("fill", "#d9d9d9");*/



                    }
                }

                console.log(unselected_nodes);
                highlightedNodes = [...Array(21).keys()];
                unselected_nodes.forEach(function(d){
                    highlightedNodes.splice(highlightedNodes.indexOf(d),1);
                });
                console.log(highlightedNodes);
                isSelected = true;
            } // end if bodypart node
        } // end of function 
            
        function colorAllNodes(){
            [...Array(21).keys()].forEach( function(d){ //color all nodes
                d3.select("#node"+d)
                        .style("fill", get_color(d));
            })
            
            for(var j = 0; j < graph.links.length; j++){
                var src =graph.links[j].source.node;
                var dest =graph.links[j].target.node;
                var linkID = "#link"+src+"_"+dest;
                d3.select(linkID) // I think something is misssing here
                    .style("fill", "none")
                    .style("stroke", "#000")
                    .style("stroke-opacity", .2);
            }
            
            isSelected = false;
            highlightedNodes = [...Array(21).keys()]; 
        }
            
        });
    });

    

    function get_color(num){
        if( num <= 8){ //for severity and position colors
            return colorRange[num]
        }else{ //for body part colors
            return "#80b1d3"
        }
    }
}
function sev_scale(num){
    if( num < 7){
        return 4;
    }else if( num < 10){
        return 3;
    }else if( num < 12){
        return 2;
    }else if( num < 13){
        return 1;
    }else{
        return 0
    }
}
return {
    init: init,
}; 
})()

//sources used:
// http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
// https://bl.ocks.org/d3noob/013054e8d7807dff76247b81b0e29030