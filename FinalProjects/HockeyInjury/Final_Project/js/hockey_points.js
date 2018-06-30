var hockey_player = (function(){
var dispatcher = d3.dispatch('click', 'hover');
var csv = 'Final_Project/data/AggregateInjuries(1).csv';  
var svg;
var body_locations = [
    {type: 'Head', left: 119, top: 18},
    {type: 'Upper body', left: 215, top: 85},
    {type: 'Lower body', left: 272, top: 243},
    {type: 'Leg', left: 189, top: 312},
    {type: 'Foot', left: 170, top: 386},
    {type: 'Hand', left: 255, top: 151},
    {type: 'Groin', left: 230, top: 199},
    {type: 'Shoulder', left: 210, top: 33},
    {type: 'Back', left: 241, top: 111},
    {type: 'Face', left: 139, top: 50},
    {type: 'Neck', left: 166, top: 78},
    {type: 'Torso', left: 205, top: 144},
    {type: 'Arm', left: 149, top: 142}
];

function drawSelectAll(){
    var square = 
        svg.append("g")
            .attr('class', 'button')
            .style("pointer-events","visible");
    
    square.append('rect')
        .attr('width', 80)
        .attr('height', 30)
        .attr('fill', 'none')
        .attr("stroke",'black')
        .attr('stroke-width', 2);
    
    square.append("text")
        .text("select all")
        .attr('y', 20)
        .attr('x', 10);
        
    
}


function getInjuryData(csv){
    return new Promise(function(resolve,reject){
        d3.csv(csv, function(error, data){
            if(error){
                reject(error);
            }
            resolve(data); 
        });
    }); 
}
function mergeCSVandPoints(data){   
    //merges csv data and the manually set body coords
    data.forEach(function(point){
        var found = body_locations.find(function(element){
            return element.type === point.injury_type;
        });
        if(found) {
            point['left'] = found.left,
            point['top'] = found.top;
        }
    });
    return data;
}
function printXY(){
    d3.select('.hockey-player-svg-elem').on('click', function(){
       var top_off = d3.select(this).node().getBoundingClientRect().top,
           left_off = d3.select(this).node().getBoundingClientRect().left;
        
        console.log("left: " + (d3.event.offsetX - 10) + ", top: " + (d3.event.offsetY - 20));
      console.log(d3.event);
    });
}

function bindOnClickPoints(data){
    function num_to_percent(num){
        return (num*100).toFixed(2) + "%";
    }
    
    function writeTextToToolTip (body_part, found){
        var golie_injuries = (found.injuries_g/found.num_injuries),
            defense_injuries = (found.injuries_d/found.num_injuries),
            forward_injuries = (found.injuries_f/found.num_injuries);

        d3.select('.injury-type').text(body_part);
        
        d3.select('.severity').text((found.total_severity / found.num_injuries).toFixed(2))
        .style('color', 'black')
        .style('font-size', '2rem')
        .style('font-weight', 'bold');

        d3.select('.inj-list').text(found.notes);

        d3.select(".golie-inj-percentage").text(num_to_percent(golie_injuries));

        d3.select(".defense-inj-percentage").text(num_to_percent(defense_injuries));

        d3.select(".forward-inj-percentage").text(num_to_percent(forward_injuries));
    }
    
    // initialize the first selection on load
    //****************************************
    var lastSelection, // create a closure to save the value of the element somewhere
        firstSelected = 'all', // cannot set to Upper or Lower Body
        selected,
        button = d3.select('.button'),
        last_selected_color,
        current_selected_color, 
        button_selected = false;
    
//    lastSelection = d3.select("." + firstSelected);
//    lastSelection.attr('fill','#ad1313');
//    var first_found = data.find(function(element){
//        return firstSelected === element.injury_type;
//    });
//    if(first_found){
//        writeTextToToolTip(firstSelected, first_found);
//        selected = lastSelection;
//    }
    //****************************************
        
    //set up initial state
    button.select('rect').attr('fill', 'red');
    button_selected = true;
    showHideToolTip(true);

    d3.selectAll('.body-point').on('click', function(){
            
        if(lastSelection !== d3.select(this) && lastSelection !== undefined){
            lastSelection.attr('fill', 'none');
        }
        var currentSelection = d3.select(this),
            classes = currentSelection.attr('class').split(/\s/),
            
            body_part = classes.length > 2 ? 
            classes[1] + " " + classes[2] : classes[1],
            
            found = data.find(function(element){
                return body_part === element.injury_type;
            });

        if(found) {
            writeTextToToolTip(body_part, found);
            selected = currentSelection;
            showHideToolTip(false);
            d3.select('.button').select('rect')
                .attr('fill', 'none');
            button_selected = false;
            dispatcher.call('click', this, body_part);
        }
        currentSelection.attr('fill','#ad1313');
        lastSelection = d3.select(this);
    });
    
    d3.selectAll('.body-point').on('mouseenter', function(){
        var currentSelection = d3.select(this),
            classes = currentSelection.attr('class').split(/\s/),
            
            body_part = classes.length > 2 ? 
            classes[1] + " " + classes[2] : classes[1],
            
            found = data.find(function(element){
                return body_part === element.injury_type;
            });

        if(found) {
            writeTextToToolTip(body_part, found); 
            showHideToolTip(false);
        }
        currentSelection.attr('fill','#ff7f7f');
    });
    
    d3.selectAll('.body-point').on('mouseleave', function(){
        
        d3.select(this).attr('fill', 'none');

        if(selected){
            selected.attr('fill', '#ad1313');
        }
        if(lastSelection){
            var classes = lastSelection.attr('class').split(/\s/),
            
            body_part = classes.length > 2 ? 
                classes[1] + " " + classes[2] : classes[1],
            
            found = data.find(function(element){
                return body_part === element.injury_type;
            });

            if(found) {
                writeTextToToolTip(body_part, found);
            }
        }
        if(button_selected){
            showHideToolTip(true);
        }
        
    });
    
   
    

    button.on('click', function(){
        var square = d3.select(this).select('rect');
        if(!button_selected){
            square
                .attr('fill', 'red');

            d3.select('.body-points-group')
                .selectAll('.body-point')
                .attr('fill','none');
            showHideToolTip(true);
            lastSelection = undefined;
            firstSelected = 'all';
            selected = undefined;
            button_selected = true;
        } 

        dispatcher.call('click', this, 'all');
    });
    
}

function showHideToolTip(hide){
    var tooltip = d3.select('.tool-tip');
    if(hide){
        tooltip
            .style('display', 'none');
    } else {
        tooltip.style('display', 'block');
    }
}
function drawCircles(data){
    svg
        .append('g')
        .attr('class', 'body-points-group')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', function(d){ return 'body-point' + " " + d.injury_type; })
		.attr('cx', function (d) { return d.left; })
		.attr('cy', function (d) { return d.top; })
        .attr('r', function(d){return 7;})
        .attr('stroke', '#ad1313')
        .attr('stroke-width', 2)
        .style("pointer-events","visible")
        .attr('fill', 'none')
    
}

function drawBodyPoints(){
    var margin = {left: 10, right: 10, bottom: 20, top: 20};
    var width = 320 - (margin.left + margin.right);
    var height = 443 - (margin.top + margin.bottom);
    var img_width = 300, img_height = 423; 
    
    svg = d3.select('.hockey-player')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + ',' + margin.top + ")")
        .attr("class", "hockey-player-svg-elem");
    
    var imgs = svg.append("svg:image")
                .attr("xlink:href", "Final_Project/img/hockey-icon.png")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", img_width)
                .attr("height", img_height);
    
    getInjuryData(csv).then(mergeCSVandPoints).then(function(data){
        drawCircles(data);
        drawSelectAll();
        bindOnClickPoints(data);
        bar_chart.init(dispatcher);
        sankey.init(dispatcher);
        
    })
    
     
    
}

return {
    printXY: printXY,
    draw: drawBodyPoints,
    dispatcher: dispatcher,
     
}
})()
hockey_player.draw();

