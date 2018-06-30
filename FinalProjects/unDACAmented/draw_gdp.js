function draw_gdp() {
	var width=$(window).width();
	var height=$(window).height()*0.6;
	var togData = false;
	d3.select("#visuals").remove();
	d3.select("svg").remove();
	d3.select(".timeline").append("div")
		.attr("id", "visuals")
		.attr("class", "col s12")
		.transition().duration(200);

	var svg_canvas = d3.select("#visuals").append("svg")
		.attr("width", "100%")
		.attr("height", height - 100)
		.attr("class", "gdp_canvas card");

	var tooltip = d3.select("#visuals").append("div")
			.attr("class", "tooltip card")
			.style("width", width/5)
			.style("border", "1px solid black")
			.style("opacity", 0)
			.style("position", "absolute")
			.style("bottom", "9%")
			.style("left", "4%")
			.style("margin", "10px")
			.style("padding", "10px")
						.style("padding-top", "0px")
						.style("padding-bottom", "0px");

	tooltip.append("p").attr("class", "state_name")
		.style("font-weight", "bolder")
				.style("margin-bottom", "2px");

		var tt_gdp_row = tooltip.append("div")
			.attr("class", "row")
			.style("margin-bottom", "0px");

		var tt_gdp_label = tt_gdp_row.append("div")
			.attr("class", "col s7")
			.style("padding-right", "0px")
				.append("p")
            .attr("class", "gdp_p_label")
			.text("GDP Contributed")
			.style("text-align", "left");

		tt_gdp_row.append("div")
			.attr("class", "col s1")
			.append("p").text(":");

	tt_gdp_row.append("div")
			.attr("class", "col s3")
			.style("padding-left", "0px")
			.style("padding-right", "0px")
				.append("p")
			.attr("class", "money_loss")
			.style("text-align", "right")
			.style("margin-right", "2px");

	tt_gdp_row.append("div")
			.attr("class", "col s3")
			.style("padding-left", "0px")
			.style("padding-right", "0px")
				.append("p")
			.attr("class", "money_gain")
			.style("text-align", "right")
			.style("margin-right", "2px");


		var tt_pop_row = tooltip.append("div")
			.attr("class", "row")
			.style("margin-top", "0px")
			.style("margin-bottom", "10px");

		var tt_pop_label = tt_pop_row.append("div")
			.attr("class", "col s7")
			.style("padding-right", "0px")
				.append("p")
			.text("DACA Population")
			.style("text-align", "left");

		tt_pop_row.append("div")
			.attr("class", "col s1")
			.append("p").text(":");

	tt_pop_row.append("div")
			.attr("class", "col s3")
			.style("padding-left", "0px")
			.style("padding-right", "0px")
				.append("p")
			.attr("class", "population")
			.style("text-align", "right")
			.style("margin-right", "2px");

	var checkTog = function() {
		if(togData == false) {
			d3.select(".money_loss").style("display", "block");
			d3.select(".money_gain").style("display", "none");
		} else {
			d3.select(".money_loss").style("display", "none");
			d3.select(".money_gain").style("display", "block");
		}
	}

	var naturalized_daca_btn = d3.select("#visuals").append("button")
			.attr("class", "toggleBtnGain btn")
			.style("background", "#3e86bd")
						.style("position", "absolute")
						.style("bottom", "15%")
						.style("right", "8%")
			.style("margin", "10px")
			.style("width", "15%")
			.text("Naturalized DACA *")
			// .attr("transform", "translate(" + width / 2+ ", 800)");

	//Define map projection
	var projection = d3.geoAlbersUsa()
	.translate([width / 2, (height / 2) - 100])
	.scale([width / 1.5]);

	// color scale using user defined domain
	var gdp_current_color = d3.scaleQuantile()
		.domain([1000000, 100000000, 500000000, 1000000000, 5000000000, 14000000000])
		.range(["#ccece6", "#66c2a4", "#41ae76", "#238b45", "#005824"]);

	var gdp_gain_color = d3.scaleQuantile()
		.domain([1000000, 100000000, 500000000, 1000000000, 5000000000, 14000000000])
		.range(["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"]);


	svg_canvas.append("g")
	.attr("class", "gdp_legend")
	.attr("transform", "translate(" + (width - (width / 4))  + ", " + height/4 + ")");

	var us_map = svg_canvas.append("g")
	.attr("class", "us_map")
	.attr("transform", "translate(0, 0)");

	var gdp_loss_legend = d3.scaleQuantile()
		.domain([1000000, 100000000, 500000000, 1000000000, 5000000000, 14000000000])
		.range(["#ccece6", "#66c2a4", "#41ae76", "#238b45", "#005824"]);

	var gdp_gain_legend = d3.scaleQuantile()
		.domain([1000000, 100000000, 500000000, 1000000000, 5000000000, 14000000000])
		.range(["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"]);

	var legend_loss = d3.legendColor()
	// .shapeWidth(25)
	.orient("vertical")
	.shapePadding(-2).shapeHeight(30)
	// .style("border-bottom", "1px solid black !important")
	.labelFormat(d3.format(".2s"))
	.scale(gdp_loss_legend)
	.title("GDP contribution in dollars annually")
	.titleWidth(400);


	var legend_gain = d3.legendColor()
	// .shapeWidth(25)
	.shapePadding(-2).shapeHeight(30)
	.orient("vertical")
	.labelFormat(d3.format(".2s"))
	.scale(gdp_gain_legend)
	.title("GDP Gain in millions annually")
	.titleWidth(400);

	svg_canvas.select(".gdp_legend").call(legend_loss);

	// Define path generator
	var path = d3.geoPath().projection(projection);
	var total_loss = 0;
	var total_gain = 0;

	d3.csv("data/DACA_data_1.csv", function(data) {
		d3.json("us-states.json", function(json) {
			for (var i = 0; i < data.length; i++) {
				// grab state name
				var dataState = data[i].State;

				// grab GDP loss and GDP Gain
				var gdp_loss = parseInt(data[i]["GDP Loss"])
				var gdp_gain = parseInt(data[i]["GDP Gain Education"])

				var daca_pop = parseInt(data[i]["DACA Population"])
				var code = data[i].code;


				total_loss += parseInt(data[i]["GDP Loss"]);
				if(data[i]["GDP Gain Education"]) {
					total_gain += parseInt(data[i]["GDP Gain Education"]);
				}
				//Find the corresponding state inside the GeoJSON
				for (var j = 0; j < json.features.length; j++) {
					var jsonState = json.features[j].properties.name;
					if(dataState == jsonState) {
						//Copy the data value into the JSON
						json.features[j].properties.gdp_loss = gdp_loss;
						json.features[j].properties.gdp_gain = gdp_gain;
						json.features[j].properties.daca_pop = daca_pop;
						json.features[j].properties.code = code;
						//Stop looking through the JSON
						break;
					} // END IF
				} // END JSON FOR LOOP
			} // END CSV FOR LOOP

			// total_loss
			var loss = d3.format(".2s")(total_loss).replace(/G/,"B");
			var gain = d3.format(".2s")(total_gain).replace(/G/,"B");
			//Bind data and create one path per GeoJSON feature
			//Default map(the view on page load) will be productivity data
			// d3.select("svg").append("circle")


			var circle = svg_canvas.append("g");
			circle.append("circle")
						.attr("cx", width / 8)
						.attr("cy", height/5)
			.attr("r", 75)
			.attr("id", "total")
			.attr("class", "total_dollars")
			.style("fill", "#52a26b");

			// var rectangle = svg_canvas.append("g");
			// rectangle.append("rectangle")
			// 			.attr("x", width / 2)
			// 			.attr("y", )
			// var total_dollars_circle = svg_canvas

			circle.append("text")
			// .style("stroke", "white")
							.style("font-weight", "bolder")
							.attr("class", "total_dollars_text")
							.attr("position", "relative")
							.attr("text-anchor", "middle")
							.style("transform", "translate(" + width/8 + "px," + height/5 + "px)")
							.style("fill", "white")
							.text("$" + loss);

						circle.append("text")
							.style("font-weight", "bolder")
							.attr("class", "total_dollars_text_curr")
							.attr("position", "relative")
							.attr("text-anchor", "middle")
							.style("transform", "translate(" + width/8 + "px," + ((height/5) + 20) + "px)")
							.style("fill", "white")
							.text("Contributed");



			d3.select(".total_dollars").append("i").attr("class", "fas fa-angle-double-down")
			.style("transform", "translate(160px, 150px)")
			// .style("positon", "absolute")
			// .style("top", "0")
			// .style("left", "0");
			// circle.append("text")
			// .text("\uf103")
			// .style("fill", "black")
			// .style("transform", "translate(160px, 180px)")
			// .style("font-family", "Font Awesome\ 5 Free");
			// .style("transform", "translate(250px, 175px)");

			us_map.selectAll("path")
				 .data(json.features)
				 .enter()
				 .append("path")
				 .attr("d", path).attr("class", "feature")
				 .attr("stroke","#fff").attr("stroke-width","0.4").style("opacity", "0.8").style("stroke-opacity", "1")
				 .style("fill", function(d) {
							//Get data value
							var value = d.properties.gdp_loss;
							if (value) {
									return gdp_current_color(value);
							} else {
									//If value is undefined…
									return "#fff";
							}
				 })
				 .on('mouseover', function(d) {
						 d3.select(this).style("fill-opacity", .75);
						 tooltip.transition()
							 .duration(200)
							 .style('opacity', .9);
						d3.select(".money_loss").text("$" + d3.format(".2s")(parseInt(d.properties.gdp_loss)).replace(/G/,"B"));
						d3.select(".money_gain").text(function() {
													if(parseInt(d.properties.gdp_gain)) {
														return "$" + d3.format(".2s")(parseInt(d.properties.gdp_gain)).replace(/G/,"B");
													}
													else {
														return "No Data"
													}
												});

						d3.select(".state_name").text(d.properties.name);
						d3.select(".population").text(d3.format(".2s")(parseInt(d.properties.daca_pop)).replace(/G/,"B"));
						checkTog();

						 // tooltip.html(
							//  "<strong>" + d.properties.name + "</strong>" +
							//  "<br><span class='money'>GDP Contributed: $" + d3.format(".2s")(parseInt(d.properties.gdp_loss)).replace(/G/,"B") + "</span>" +
							//  "<br>Daca Population: " + d3.format(".2s")(parseInt(d.properties.daca_pop)).replace(/G/,"B")
						 // )
						tooltip
							.attr("position", "absolute")
							.attr("top", "50%")
							.attr("left", "20%");
					 })
								 .on('mouseout', function() {
										 d3.select(this).style("fill-opacity", 1);
										 tooltip.transition()
												 .duration(400)
												 .style('opacity', 0);
								 });

				// ADD LABELS FOR EACH STATE

				us_map.selectAll("text")
					.data(json.features)
					.enter()
					.append("text")
					.attr("class", "state-labels")
					.text(function(d) {
						if (d.properties.code == "RI" || d.properties.code == "DE"){
							return "";
						}
						return d.properties.code;
					})
					.attr("x", function(d) {
						return path.centroid(d)[0];
					})
					.attr("y", function(d) {
						return path.centroid(d)[1];
					})
					.attr("dy", function(d) {
						function dy(n) {
							return (n * projection.translate()[1]) / height;
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
				 .attr('font-size','6pt');
				// Defining Button Interactivity

				d3.select(".toggleBtnGain")
					.on("click", function(){
						// Determine if current line is visible
						togData=!togData;
						if (togData == false){
							svg_canvas.selectAll("path")
								.transition().duration(1000)
								.style("fill", function(d) {
									var value = d.properties.gdp_loss;
									if (value) {
										return gdp_current_color(value);
									} else {
										return "#ccc";
									}
								});
								svg_canvas.select(".gdp_legend").call(legend_loss);
								checkTog();
								d3.select(".total_dollars").transition().duration(1000).style("fill", "#52a26b");
								d3.select(".total_dollars_text").transition().duration(1000).text("$" + loss);
								d3.select(".total_dollars_text_curr").text("Contributed");
								d3.select(this).style("background", "#3e86bd").text("Naturalized Daca *")
								title.text("DACA Workers' GDP Contribution, 2017");
                                d3.select(".gdp_p_label").text("GDP Contributed");
								format_label();
							} else {
								svg_canvas.selectAll("path")
									.transition().duration(1000)
									.style("fill", function(d) {
										var value = d.properties.gdp_gain;
										if (value) {
											return gdp_gain_color(value);
										} else {
											return "#ccc";
										}
									});
									svg_canvas.select(".gdp_legend").call(legend_gain).transition().duration(1000);
									checkTog();
									d3.select(".total_dollars").transition().duration(1000).style("fill", "#3e86bd");
									d3.select(".total_dollars_text").transition().duration(1000).text("$" + gain);
									d3.select(".total_dollars_text_curr").text("Gained *");
									d3.select(this).style("background", "#52a26b").text("Current DACA");
									title.text("Economic Benefits of Naturalizing DACA Recipients 2017");
                                    d3.select(".gdp_p_label").text("GDP Gained");
									format_label();
							}
						});
		}) // END D3.JSON
	}) // END D3.CSV
	var format_label = function() {
			$('.label').each( function(){
				var string = $(this).text();
				string = string.replace(/G/,"B");
				string = string.replace(/G/,"B");
				$(this).html(string);
			})
	}

	format_label();

// );
	// Placeholder for visuals
	var title = svg_canvas.append("text")
		 .attr("class", "canvas_title")
		.attr("x", "50%")
		.attr("y", 50)
		.attr("fill", "#000")
		.attr("text-anchor", "middle")
		.attr("font-size", "20px")
		.attr("font-weight", "bold")
	 .text("DACA Workers' GDP Contribution, 2017")

	var footnote = d3.select("#visuals").append("p")
	.attr("class", "footnote")
	// .attr("x", "50%")
	// .attr("y", height - 100)
	.style("fill", "#000")
	// .attr("text-anchor", "middle")
	// .attr("font-size", "20px")
	// .attr("font-weight", "bold")
	 .text("* In this projection, the Center for American Progress is estimating a scenario in which we assume that half of those eligible for the Dream Act obtain LPR status through the educational pathway by gaining either an associate’s degree or two years toward a bachelor’s degree. With a greater number of workers now having higher levels of education, their total productivity—and their economic contributions—increase.")


}
