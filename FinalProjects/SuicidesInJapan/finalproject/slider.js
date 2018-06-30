
// indexes the zone which each year corresponds to 
var slider_zone = {
	"1960_1989": 0, // shouwa era
	"1989_2017": 1, // heisei era
	"1986_1992": 2, // bubble economy
	"1989" : 3, // shouwa era to heisei era 
	"1993" : 4 // bubble end 
}

// each index has information displayed to each year 
var zone = [
	{}, {}, {}, {}, {}
];

// when the value of the changed 
function year_changed()
{
    var min = document.getElementById("price-min").value;
    var max = document.getElementById("price-max").value;

	//slider_text.innerHTML = min;
	draw_map(+min, +max);
	draw_slider(+min, +max);
}

