/* global d3 */
var width=960;
var height=600;
function draw_origin() {
	d3.select("svg").remove();

	var svg_canvas = d3.select("#visuals").append("svg")
		.attr("width", width)
		.attr("height", height);

	// Placeholder for visuals
	var projection = d3.geoNaturalEarth();
	var path = d3.geoPath()
			.projection(projection);

	// Load external data and boot
	d3.json('continents.json', function(error, json) {
		if (error) throw error;
		console.log(json)
		svg_canvas.selectAll("path")
			.data(json.features)
			.enter().append("path")
			.attr("d", path)
			.style("stroke", "grey");
	});
}

function draw_integration() {
	d3.select("svg").remove();

	var svg_canvas = d3.select("#visuals").append("svg")
		.attr("width", width)
		.attr("height", height);

	// Placeholder for visuals
	svg_canvas.append("text")
		.attr("x", 25)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("fill", "red")
		.text("INTEGRATION VISUALIZATION");
}

function draw_gdp() {
	d3.select("svg").remove();

	var svg_canvas = d3.select("#visuals").append("svg")
		.attr("width", width)
		.attr("height", height);

	// Placeholder for visuals
	svg_canvas.append("text")
		.attr("x", 25)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("fill", "red")
		.text("GDP VISUALIZATION");
}
