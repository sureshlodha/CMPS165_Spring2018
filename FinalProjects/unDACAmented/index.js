$(document).ready(function() {
	var first_subtitle = "Under then President Barack Obama in 2012, DACA - Deferred Actions for Childhood Arrival, saved more than 800,000 undocumented youth from deportation, and gave us an opportunity to pursue the American dream."
	var second_subtitle = "What makes us American is not a question of what we look like, or where our names come from, or the way we pray. What makes us American is our fidelity to a set of ideals -- that all of us are created equal. - Barack Obama"
	var third_subtitle = "DACA population has a substantial impact on US economy. If you care about DACA recipients - your neighbors, friends, and family - please register to vote and push for policies that benefit America as a whole."

    var origin_height = $(window).height()*0.6;
	draw_origin(origin_height);
	var selected_btn_class = "btn-floating waves-effect waves-light blue";
	var btn_ids = ['#Origin_Btn', '#GDP_Btn', '#Integration_Btn'];
	var label_ids = ['#Origin_Label', '#GDP_Label', '#Integration_Label'];
	var div_ids = [''];

	function reset_selected() {
		for (var i = 0; i < 3; i++)
		{
			$( btn_ids[i] ).removeClass('blue');
			$( btn_ids[i] ).addClass('grey');
			$( label_ids[i] ).removeClass('label_selected');
			$( label_ids[i] ).addClass('labels');
		}
	}


	$( "#Origin_Btn" ).click(function() {
		if ($( this ).attr('class') != selected_btn_class) {
			reset_selected();
			$( this ).removeClass('grey');
			$( this ).addClass('blue');
			$( '#Origin_Label' ).removeClass('labels');
			$( '#Origin_Label' ).addClass('label_selected');
			$(".subtitle").text(first_subtitle);
			draw_origin(origin_height);
		}
	});

	$( "#Integration_Btn" ).click(function() {
		$(".subtitle").text(second_subtitle);
		if ($( this ).attr('class') != selected_btn_class) {
			reset_selected();
			$( this ).removeClass('grey');
			$( this ).addClass('blue');
			$( '#Integration_Label' ).removeClass('labels');
			$( '#Integration_Label' ).addClass('label_selected');
			draw_integration();
		}
	});

	$( "#GDP_Btn" ).click(function() {
		if ($( this ).attr('class') != selected_btn_class) {
			reset_selected();
			$( this ).removeClass('grey');
			$( this ).addClass('blue');
			$( '#GDP_Label' ).removeClass('labels');
			$( '#GDP_Label' ).addClass('label_selected');
			$(".subtitle").text(third_subtitle);
			console.log("gdp btn clicked");
			$("#visuals").toggle();
			$("#gdp_visuals").toggle();
			draw_gdp();
		}
	});

});
