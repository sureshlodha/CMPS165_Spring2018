// Noriaki Nakano
// nnakano@ucsc.edu
// 1418185

var japanese_key = {
  "number" : "番号",
  "prefecture": "都道府県",
  "density": "密度",
  "populationdensity": "人口密度",
  "population":"合計",
  "male":"男",
  "female":"女",

  /*
  "prefecture" : "prefecture",
  "1960" : "1960",
  "1965" : "1965",
  "1970" : "1970",
  "1975" : "1975",
  "1980" : "1980",
  "1985" : "1985",
  "1990" : "1990",
  "1995" : "1995",
  "2000" : "2000",
  */
};

  //Id conversion of geoJSON for Japan
var id_conversion = [
  23, 5, 2, 12, 38, 18, 40,
  7, 21, 10, 34, 1, 28, 8,
  17, 3, 37, 46, 14, 39, 43,
  26, 24, 4, 45, 20, 42, 29,
  15, 44, 33, 47, 27, 41, 11,
  25, 32, 22, 9, 36, 13, 31,
  16, 30, 6, 35, 19
];

var order_conversion = [
  "Hokkaido","Aomori","Iwate","Miyagi","Akita","Yamagata",
  "Fukushima","Ibaraki","Tochigi","Gunma","Saitama","Chiba",
  "Tokyo","Kanagawa","Niigata","Toyama","Ishikawa","Fukui",
  "Yamanashi","Nagano","Gifu","Shizuoka","Aichi","Mie","Shiga","Kyoto",
  "Osaka","Hyogo","Nara","Wakayama","Tottori","Shimane","Okayama",
  "Hiroshima","Yamaguchi","Tokushima","Kagawa","Ehime","Kōchi","Fukuoka",
  "Saga","Nagasaki","Kumamoto","Oita","Miyazaki","Kagoshima","Okinawa"
];


var ordinal = d3.scaleOrdinal()
  .domain(["0 Suicides Per 100,000 People", "15 Suicides Per 100,000 People", "20 Suicides Per 100,000 People", "25 Suicides Per 100,000 People", "30 Suicides Per 100,000 People"])
  .range([ "rgb(254,229,217)", "rgb(252,174,145)", "rgb(251,106,74)", "rgb(222,45,38)", "rgb(165,15,21)"]);

// scale from blue -> green -> red
var color_scale = d3.scaleLinear()
    .domain([0.0, 15.0, 20.0, 25.0, 30.0])
    .range([ "rgb(254,229,217)", "rgb(252,174,145)", "rgb(251,106,74)", "rgb(222,45,38)", "rgb(165,15,21)"]);

//define projection values
var projection = d3.geoMercator()
    .scale(1000)
    .rotate([0.0,0.0,0.0])
    .translate([-2000, 900]);

  //define path
var path = d3.geoPath()
    .projection(projection);

var data;

var year_key;

var year_data;

function declare_map()
{
  var w = 300, h = 50;

var svg = d3.select("svg");

svg.append("g")
  .attr("class", "legendOrdinal")
  .attr("transform", "translate(20,20)");

var legendOrdinal = d3.legendColor()
  .shape("path", d3.symbol().type(d3.symbolSquare).size(800)())
  .shapePadding(10)
  .scale(ordinal);

svg.select(".legendOrdinal")
  .call(legendOrdinal);
          
    
  //Define Margin
  var margin = {left: 80, right: 80, top: 50, bottom: 50 },
      width = 960 - margin.left -margin.right,
      height = 960 - margin.top - margin.bottom;

    
  d3.csv("src/suicide_rate_prefecture.csv", (e, d) => {
    data = d;       
    console.log(d);
	   year_key = {};

    data.forEach((d, i) => {
      year_key[d.year] = i;
    });

   year_data = new Array();
      
    for(var i = 0; i < order_conversion.length; i++)
    {
        var temp = 0;
        for(var j = 2007; j < 2018; j++)
        {
            temp = parseFloat(data[year_key[j]][order_conversion[i]]) + parseFloat(temp);
        }
        temp = (temp/11);
        year_data.push(temp);
    }

      
   console.log(year_data);
	 // set up min, pivot, and max
    var min =  d3.min(year_data.map((v) => {
        return parseFloat(v);
    }));
   
    var mean = d3.mean(year_data.map((v) => {
        return parseFloat(v);
    }));
   
    var max = d3.max(year_data.map((v) => {
        return parseFloat(v);
    }));
   
    // set color scale domain
      /*
    color_scale.domain([
        min,
        mean,
        max   
    ]);
    */
        //Define Tooltip here
    var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);
	
	d3.json("src/japan.json", (e, d) => {// load JSON file
   
        // draw GeoJSON
        viz_1.selectAll("path")
            .data(d.features)
            .enter()
            .append("path")
            .attr("d", (v)=> {return path(v);}) // send path value to append
            .attr("fill", (v, i) => color_scale(year_data[id_conversion[i] - 1]))
            .attr("stroke", "#222")
            .on("mouseover", (d,i)=> {
                div.transition()    
                  .duration(100)    
                  .style("opacity", .9);    
                div.html(
                    order_conversion[id_conversion[i] - 1] + " Prefecture<br/>" +
                    "Suicide rate: " + Math.round(year_data[id_conversion[i] - 1] * 10)/10
                  ) 
                  .style("left", (d3.event.pageX) + "px")   
                  .style("top", (d3.event.pageY - 28) + "px");  
            }).on("mouseout", function(d) {   
                div.transition()    
                  .duration(250)    
                  .style("opacity", 0); 
            });
    });
	//draw_map(1960);
  });

  viz_1.append("text")
      .attr("dx", 400)
      .attr("dy", 450)
      .attr("text-anchor", "middle")
      .attr("id","japan_map")
      .text("Suicides by Prefecture: " + "2007 to 2017")

}

function draw_map(year, max)
{// get CSV data and draw geoJSON
   year_data = new Array();

    if (year == max)
    {
        var temp = 0;
        for(var i = 0; i < order_conversion.length; i++)
        {
            temp = parseFloat(data[year_key[year]][order_conversion[i]]) + parseFloat(temp);
        }  
          year_data.push(temp);  
            
    }
    else 
        {
    for(var i = 0; i < order_conversion.length; i++)
    {
        var temp = 0;
        console.log(max);
        for(var j = year; j < parseFloat(max); j++)
        {
            temp = parseFloat(data[year_key[j]][order_conversion[i]]) + parseFloat(temp);
        }
        console.log(temp);
        temp = (temp/(max - year));
        year_data.push(temp);
    }
        }
	viz_1.selectAll("path")
		.transition().duration(100)             // set how long our transitions take to complete
        .delay(function(d,i) { return 100;})
		.attr("fill", (d,i) => color_scale(year_data[id_conversion[i] - 1]));

    viz_1.select("text#japan_map")
    .text("Suicides by Prefecture: " + year + " to " +max);   
   
}// End draw   

function change_data()
{// called when the selection gets changed
    draw(document.getElementById("data_select").value);
}// End change_data

