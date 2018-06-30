
// when the html document is ready 
var viz_1;
var viz_2;
var tooltip;
var tooltip_2;

var slider;
var slider_text;
var gender_index = 0;
var year = 2007;
// called when body is loaded 
function main()
{	
	//load the containers
	viz_1 = d3.select("svg#viz_1").append("g");
	viz_2 = d3.select("svg#viz_2").append("g")
		.attr("transform", "translate(100, 50)");
	tooltip = d3.select("svg#tooltip");		
	tooltip_2 = d3.select("svg#tooltip_2");		

	//load the slider 
	slider = document.getElementById("year_slider");
	slider_text = document.getElementById("year");
	
	
	document.gender_form.gender.forEach((d) => {
       
		d.onclick = (val) => {
			console.log(val);
			var min = document.getElementById("price-min").value;
        	var max = document.getElementById("price-max").value;
			if(val.srcElement.value == "total")
				gender_index = 0;
			else if (val.srcElement.value == "male")
				gender_index = 1;
			else
				gender_index = 2;
			draw_slider(+min, +max);
		};
	});

	//call creation function 
	create_tooltip();
	declare_map();
	declare_bargraph();
}

