var year = 1990;
//Width and height
var margin = {left: 40, right: 40, top: 10, bottom: 30 }, 
    w = 500 - margin.left -margin.right,
    h = 300 - margin.top - margin.bottom;
//			var w = 500;
//			var h = 300;

			//Define map projection
			var projection = d3.geoAlbersUsa()
								   .translate([w/2, h/2])
								   .scale([500]);

			//Define path generator
			var path = d3.geoPath()
							 .projection(projection);
							 
			//Define quantize scale to sort data values into buckets of color
			var color_1 = d3.scaleSqrt()
                                .domain([20,750, 1500, 3000])
                                .range(d3.schemeReds[5]);
            var color_2 = d3.scaleLinear()
                                .domain([.04, .08, .12, .16])
                                .range(d3.schemeBlues[5]);
								

            //var div = d3.select("body").append("div").attr("align", "right");
			//Create SVG element
			var svg = d3.select(".maps")
                        .append("svg")
                        .attr("class", "map1")
//                        .attr("align", "bottom right")
						.attr("width", w)
						.attr("height", h);
            
            var svg_2 = d3.select(".maps")
                          .append("svg")
                          .attr("class", "map2")
//                          .attr("align", "bottom left")
                          .attr("width", w)
                          .attr("height", h);

            //Load in GeoJSON data
			d3.json("us-regions.json", function(json) {
                var numRegionsSelected = 0;
                
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
                            //console.log(opacity)
                            if (opacity != 0.1) {
                                tempvaluecircleselection++;
                            }
                        }
                        //console.log(elt.attr("opacity") > 0)
                    });
                    return (tempvaluecircleselection != 0);
                };
                /* //add a toggle variable and a selection id
                for(var i = 0; i < json.features.length; i++){
                    json.features[i].properties.selected = 0;
                }*/
                //console.log(json)

			     //Bind data and create one path per GeoJSON feature
				 svg.selectAll("path")
				    .data(json.features)
					.enter()
					.append("path")
					.attr("d", path)
                    .attr("id", function(d){
                        return "1_" + d.properties.region; 
                    })
                    .attr("stroke", "#222")
//                    .attr("id", "temp")
                    .attr("stroke-width", 0.04)
                    .attr("class", "mass mapregion")
					.style("fill", "rgb(237,237,237)")
                    .attr("clicked", 0)
                    .on("mouseover", function(d){
                        var dot_id = "1" + this.id.substr(1, this.id.length);
                        var dot_elt = document.getElementById(dot_id);                
                        d3.select(dot_elt)
                            .style("opacity", .6);                            
                    })   
                    .on("mouseout", function(d){                        
                        var dot_id = "1" + this.id.substr(1, this.id.length);                        
                        var dot_elt = document.getElementById(dot_id);                                                
                        d3.select(dot_elt)
                            .style("opacity", 1)                                                      
                    })                           
                    .on("click", function(d){
                        //var circleSelected = ;
                        //console.log(circleSelected())
                        var id = "2" + this.id.substr(1, this.id.length);
                        var elt = document.getElementById(id);
                        clicked = (d3.select(this).attr("clicked") == 0) && (d3.select(elt).attr("clicked") == 0);
                        if(!clicked){
                            numRegionsSelected--;
                            d3.select(this).attr("clicked", 0);
                            d3.select(elt).attr("clicked", 0);
                            d3.select(this).style("fill", "rgb(237,237,237)");
                            d3.select(elt).style("fill", "rgb(237,237,237)");
                            d3.selectAll(".dot[region='" + this.id.substr(2, this.id.length) + "']")
                             .style("opacity", 0.1);
                            if (!circleSelected2())
                            {
                                d3.selectAll(".dot")
                                    .style("opacity", 0.7);
                            }
                            var region_class = this.id.substr(2,this.id.length);
                            //console.log(region_class);
                            var test_1 = ".msa1." + region_class;
                            //console.log(test_1);
                           d3.selectAll(test_1).style("fill", function(d){
                                console.log(d);
                                var value_1 = d.properties["Density " + year];
                                return color_1(value_1);
                            });
                            var test_2 = ".msa2." + region_class;
                           d3.selectAll(test_2).style("fill", function(d){
                                console.log(d);
                                var value_2 = d.properties["Pollutant " + year];
                                return color_2(value_2);
                            });
                            return;
                        }
                        d3.select(this).style("fill", "rgb(211,211,211)");
                        d3.select(elt).style("fill", "rgb(211,211,211)");
                        if (!circleSelected())
                        {
                            d3.selectAll(".dot")
                                .style("opacity", 0.1);                                
                        }
                         d3.selectAll(".dot[region='" + this.id.substr(2, this.id.length) + "']")
                             .style("opacity", 1);
                         d3.select(this).attr("clicked", 1);
                         d3.select(elt).attr("clicked", 1);
                         numRegionsSelected++;
                    })
                    .append("title")
                    .text(function (d) {
                        return d.properties.region; 
                    });
                
                //Bind data and create one path per GeoJSON feature
				 svg_2.selectAll("path")
				    .data(json.features)
					.enter()
					.append("path")
					.attr("d", path)
                    .attr("id", function(d) {
                        return "2_" + d.properties.region; 
                    })
                    .attr("stroke", "#222")
                    .attr("stroke-width", 0.04)
                    .attr("class", "mass mapregion")
                    .on("mouseover", function(d){                        
                        var dot_id = "2" + this.id.substr(1, this.id.length);
                        var dot_elt = document.getElementById(dot_id);                        
                        d3.select(dot_elt)
                            .style("opacity", .6);                            
                            })   
                     .on("mouseout", function(d){
                        var dot_id = "2" + this.id.substr(1, this.id.length);
                        var dot_elt = document.getElementById(dot_id);
                        d3.select(dot_elt)
                            .style("opacity", 1)                                                      
                            })   
					.style("fill", "rgb(237,237,237)")
                    .attr("clicked", 0)
                    .on("click", function(d){
                        var id = "1" + this.id.substr(1, this.id.length);
                        var elt = document.getElementById(id);
                        clicked = (d3.select(this).attr("clicked") == 0) && (d3.select(elt).attr("clicked") == 0);
                        if(!clicked){
                            numRegionsSelected--;
                            d3.select(this).attr("clicked", 0);
                            d3.select(elt).attr("clicked", 0);
                            d3.select(this).style("fill", "rgb(237,237,237)");
                            d3.select(elt).style("fill", "rgb(237,237,237)");
                            d3.selectAll(".dot[region='" + this.id.substr(2, this.id.length) + "']")
                             .style("opacity", 0.1);
                            if (!circleSelected2())
                            {
                                d3.selectAll(".dot")
                                    .style("opacity", 0.7);                 
                            }
                            else {
                                d3.selectAll(".dot[region='" + this.id.substr(2, this.id.length) + "']")
                                    .style("opacity", 0.1);
                            }
                            
                            var region_class = this.id.substr(2,this.id.length);
                            //console.log(region_class);
                            var test_1 = ".msa1." + region_class;
                            //console.log(test_1);
                           d3.selectAll(test_1).style("fill", function(d){
                                console.log(d);
                                var value_1 = d.properties["Density " + year];
                                return color_1(value_1);
                            });
                            var test_2 = ".msa2." + region_class;
                           d3.selectAll(test_2).style("fill", function(d){
                                console.log(d);
                                var value_2 = d.properties["Pollutant " + year];
                                return color_2(value_2);
                            });
                            return;
                        }
                        d3.select(this).style("fill", "rgb(211,211,211)");
                        d3.select(elt).style("fill", "rgb(211,211,211)");
                        if (!circleSelected()) //(numRegionsSelected == 0 && !circleSelected())
                        {
                            d3.selectAll(".dot")
                                .style("opacity", 0.1);                                
                        }
                        d3.selectAll(".dot[region='" + this.id.substr(2, this.id.length) + "']")
                             .style("opacity", 1);
                            d3.select(this).attr("clicked", 1);
                            d3.select(elt).attr("clicked", 1);
                        numRegionsSelected++;
                    })
                    .append("title")
                    .text(function(d) {
                        return d.properties.region;
                    });
			
				
                    //Load in GeoJSON data
				    d3.json("cb_2013_us_cbsa_5m(2).json", function(json_2) {
                        //console.log(json_2)
                        
                        for(var k = 0; k < json_2.features.length; k++){
                            json_2.features[k].properties.selected = false;
                        }
                        
					   //Bind data and create one path per GeoJSON feature
					   svg.selectAll("path")
					       .data(json_2.features)
					       .enter()
					       .append("path")
					       .attr("d", path)
                           .attr("id", function(d) {
                                return "1_" + d.properties.name;
                           })
                            .attr("clicked", 0)
                            .attr("stroke", "#222")
                            .attr("stroke-width", 0.05)
                            //.attr("clicked", 0)
                           //.attr("class", "mass")
                           .attr("class", function(d) {
                              //Get data value
					   		  //var value = d.properties.value;
                              return "mass msa1 " +d.properties.region})
					       .style("fill", function(d) {
					   		  var value_1 = d.properties["Density " + year];
                              return color_1(value_1);
                           })

                           .on("click", function(d){
                                //console.log(d);

                                if (!circleSelected()){
                                    d3.selectAll(".dot")
                                        .style("opacity", 0.1);
                                }
                                var dot_id = "d_" + d.properties.geoid;
                                var dot_elt = document.getElementById(dot_id);
                                //console.log(dot_elt);
                                
                                d.properties.selected = !d.properties.selected;
                           
                                //help from https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
                                var id = "2" + this.id.substr(1, this.id.length);
                                //console.log(id);
                                //id[0] = '2';
                                //console.log(id);
                                var elt = document.getElementById(id);
                                //console.log(elt);
                           
                                if(d.properties.selected){
                                    d3.select(this).style("fill", "yellow");
                                    //console.log(this.id);
                                    
                                    d3.select(elt).style("fill", "yellow");
                                    
                                    d3.select(dot_elt).style("opacity", 1);
                                } else{
                                    d3.select(this).style("fill", function(d){
                                        var value_1 = d.properties["Density " + year];
                                        return color_1(value_1);
                                    });
                                    d3.select(elt).style("fill", function(d){
                                        var value_2 = d.properties["Pollutant " + year];
                                        return color_2(value_2);
                                    });
                                    
                                    d3.select(dot_elt).style("opacity", 0.1);
                                }
                           
                                if (!circleSelected2()){
                                d3.selectAll(".dot")
                                    .style("opacity", 0.7);              
                                }
                                
                                
                            })
                            .append("title")
                            .text(function(d) {
                                return d.properties.name;
                            });
                
                
                        //Bind data and create one path per GeoJSON feature
					   svg_2.selectAll("path")
					       .data(json_2.features)
					       .enter()
					       .append("path")
					       .attr("d", path)
                           .attr("id", function(d) {
                                return "2_" + d.properties.name;
                           })
                            .attr("clicked", 0)
                            .attr("stroke", "#222")
                            .attr("stroke-width", 0.05)
                            //.attr("clicked", 0)
                           //.attr("class", "mass")
                           .attr("class", function(d) {
                              //Get data value
					   		  //var value = d.properties.value;
                              return "mass msa2 " +d.properties.region})
					       .style("fill", function(d) {
					   		  var value_2 = d.properties["Pollutant " + year];
                              return color_2(value_2);
                           })
                           .on("click", function(d){
                                //console.log(d);

                                if (!circleSelected()){
                                    d3.selectAll(".dot")
                                        .style("opacity", 0.1);
                                }
                                var dot_id = "d_" + d.properties.geoid;
                                var dot_elt = document.getElementById(dot_id);
                                //console.log(dot_elt);
                                
                                d.properties.selected = !d.properties.selected;
                           
                                //console.log(this.id);
                                //help from https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
                                var id = "1" + this.id.substr(1, this.id.length);
                                //console.log(id);
                                //id[0] = '2';
                                //console.log(id);
                                var elt = document.getElementById(id);
                                //console.log(elt);
                           
                                if(d.properties.selected){
                                    d3.select(this).style("fill", "yellow");
                                    d3.select(elt).style("fill", "yellow");
                                    d3.select(dot_elt).style("opacity", 1);
                                } else{
                                    d3.select(this).style("fill", function(d){
                                        var value_2 = d.properties["Pollutant " + year];
                                        return color_2(value_2);
                                    });
                                    d3.select(elt).style("fill", function(d){
                                        var value_1 = d.properties["Density " + year];
                                        return color_1(value_1);
                                    });
                                    d3.select(dot_elt).style("opacity", 0.1);
                                }
                                
                                if (!circleSelected2()){
                                d3.selectAll(".dot")
                                    .style("opacity", 0.7);              
                                }
                            })
                            .append("title")
                            .text(function(d) {
                                return d.properties.name;
                            });
                        
                            /*svg.append("text")
                                .attr("align", "center")
                                .text("1990 Pollution");
                        
                            svg_2.append("text")
                                    .attr("align", "center")
                                    .text("1990 Population");*/
                        
                    });			
				});
            
            //pan and zoom code derived from bl.ocks.org/mbostock/3892919 and http://www.puzzlr.org/zoom-in-d3v4-minimal-example/ and especially https://bl.ocks.org/rutgerhofste/5bd5b06f7817f0ff3ba1daa64dee629d
            //define behaviour and link to scroll wheel
            var zoom_1 = d3.zoom()
                .scaleExtent([1, 10])
                .on("zoom", zoomed_1);

            var zoom_2 = d3.zoom()
                .scaleExtent([1, 10])
                .on("zoom", zoomed_2);
            
            //apply behaviour to svg
            zoom_1(svg);
            zoom_2(svg_2);
            
            function zoomed_1() {
                //zoom on details
                svg.selectAll(".mass").attr("transform", d3.event.transform);
            }

            function zoomed_2() {
                //zoom on details
                svg_2.selectAll(".mass").attr("transform", d3.event.transform);
            }