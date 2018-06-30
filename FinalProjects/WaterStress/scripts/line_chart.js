import * as utils from "./index";
import {width, height, margin, display_country, country_contents} from "./variables";

const zoom = d3.zoom().scaleExtent([1 / 4, 9]).on('zoom', zoomFunction);

//Add in the
const color_asia = d3.scaleThreshold()
    .domain([0, 100, 200, 300, 400, 500, 600])
    .range(d3.schemeReds[5]);

const color_north_america = d3.scaleThreshold()
    .domain([0, 100, 200, 300, 400, 500, 600])
    .range(d3.schemeBlues[5]);

const color__south_america = d3.scaleThreshold()
    .domain([0, 100, 200, 300, 400, 500, 600])
    .range(d3.schemeGreens[5]);

const color_africa = d3.scaleThreshold()
    .domain([0, 100, 200, 300, 400, 500, 600])
    .range(d3.schemePurples[5]);

const color_eurpoe = d3.scaleThreshold()
    .domain([0, 100, 200, 300, 400, 500, 600])
    .range(d3.schemeOranges[5]);

const color_ocina = d3.scaleThreshold()
    .domain([0, 100, 200, 300, 400, 500, 600])
    .range(d3.schemePurples[5]);


function get_colour_scheme_for_country(country) {
    let region = country_contents[country];
    if (region === 'Asia')
        return color_asia;
    else if (region === 'Europe')
        return color_eurpoe;
    else if (region === 'Oceania')
        return color_ocina;
    else if (region === 'North America')
        return color_north_america;
    else if (region === 'South America')
        return color__south_america;
    else if (region === 'Africa')
        return color_africa;
}


//Sets axis scales
const x = d3.scaleTime().range([0, width - 100]),
    y = d3.scaleLog().base(Math.E).domain([0.0015, 1000]).range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

//Define Axis
const xAxis = d3.axisBottom(x).tickPadding(2);
const yAxis = d3.axisLeft(y).tickFormat(d3.format(",.2f")).tickValues([0.00001, 0.0078125, 0.015625, 0.03125, 0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32, 64, 128, 256, 500]);

const formatDecimal = d3.format(".3f"),
    bisectDate = d3.bisector(function (d) {
        return d.date;
    }).left;

// Legend vars for line chart
var countries_showing = [];
var colors_for_countries = [];
var ordinal = d3.scaleOrdinal()
  .domain(countries_showing)
  .range(colors_for_countries);

var linechart_legend;
var legendOrdinal;
var dont_show_these_countries = [];




function zoomFunction() {
    //Returns a copy of the continuous scales x and y whose domain is transformed.
    const new_xScale = d3.event.transform.rescaleX(x);
    const new_yScale = d3.event.transform.rescaleY(y);
    //Gets the x and y axis elements in the DOM and invokes a callback function by calling .scale
    d3.select('g').select('.y-axis').call(yAxis.scale(new_yScale));
    d3.select('g').select('.x-axis').call(xAxis.scale(new_xScale));
    //Gets all of the circles on the DOM excluding ones in the key
    d3.select('g').selectAll('.country').attr('transform', d3.event.transform)
    d3.select('g').selectAll('.predictedLabel').attr('x', new_xScale(utils.parseTime(2017)))
    d3.select('g').selectAll('.predicted').attr('x1', new_xScale(utils.parseTime(2017))).attr('x2', new_xScale(utils.parseTime(2017)))
    d3.select('g').selectAll('circle').filter('.dot').attr('r', (4 / d3.event.transform.k))
}


//Line generator, where the lives are curved
const line = d3.line()
    .x(function (d) {
        return x(new Date(d.date))
    })
    .y(function (d) {
        if (d.value === undefined)
            return -1;
        else
            return y(d.value)
    });

// Define the div for the tooltip
const div = d3.select("body").append("div")
    .attr("class", "tooltip1")
    .style("opacity", 0);


function tweenDashoffsetOn() {
    const l = this.getTotalLength(),
        i = d3.interpolateString('' + l, '0');
    return function (t) {
        return i(t)
    }
}


function drawLines(g, countries, key) {
    const country = g.selectAll(key)
        .data(countries)
        .enter().append('g')
        .attr('class', 'country')
        .attr('id', function (d) {
            return d.id.split(' ').join('_')
        }).on("mouseover", function (data) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            const circleUnderMouse = this;
            d3.selectAll('.country').style('opacity', function () {
                return (this.id === circleUnderMouse.id) ? 1.0 : 0.2;
            });
            d3.selectAll('.country').select('.line')
                .style('stroke-width', '1px')
                .filter(function (d) {
                    return d.id === circleUnderMouse.id
                })
                .style('stroke-width', '2px')
        }).on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            d3.selectAll('.country').style('opacity', '1');
            d3.selectAll('.country').select('.line').style('stroke-width', '1px')

        }).on("mousemove", function (data) {
            div.html('<b>Country: </b>' +data.id + '<br/>' +
                '<b>Year:</b> ' + utils.formatTime(x.invert(d3.mouse(this)[0])) + '<br/>' +
                '<b>Water Stress:</b> ' + formatDecimal(y.invert(d3.mouse(this)[1] - 2)) + '<br/>'
            )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .style('pointer-events', 'none');


    country.append('path')
        .attr('class', 'line')
        .attr('d', function (d) {
            return line(d.values)
        })
        .attr('fill', 'none')
        .style('stroke', function (d) {
            //console.log(d);
            countries_showing.push(d.id);
            colors_for_countries.push(z(d.id));
            return z(d.id)
        });

    country.append('path')
        .attr('class', 'fat_line')
        .attr('d', function (d) {
            return line(d.values)
        })
        .style('stroke-width', 25);


    country.selectAll(".dot")
        .data(function (d) {
            return d.values
        })
        .enter()
        .append("circle")
        .attr("r", 4)
        .attr("cx", function (d, i) {
            return x(new Date(d.date));
        })
        .attr("cy", function (d) {
            return y(d.value);
        })
        .attr("fill", function (d) {
            return z(d3.select(this.parentNode).datum().id);
        })
        .attr("date", function (d) {
            return (d.date)
        })
        .attr("val", function (d) {
            return (d.value)
        })
        .style('opacity', '0')
        .filter(function (d) { //Only shows the circles for selected countries
            return display_country[d3.select(this.parentNode).datum().id].display
        })
        .style('opacity', '1');


    const paths = country.select('path')
        .each(function () {
            d3.select(this)
                .attr('stroke-dasharray', this.getTotalLength() + ',' + this.getTotalLength())
                .attr('stroke-dashoffset', '' + this.getTotalLength())

        });
    paths.filter(function (d) { // only shows the lines for selected countries
        return display_country[d.id].display
    })
        .transition()
        .duration(2000)
        .attrTween('stroke-dashoffset', tweenDashoffsetOn)


}

function drawAxis(g) {

    //x-axis
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .append('text')
        .attr('transform', 'translate(' + (width - 60) + ',' + (30) + ')')
        .attr('fill', '#000')
        .attr('font-size', '12px')
        .text('Year');

    //Y-axis
    g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('dy', '0.80em')
        .attr('fill', '#000');


    g.append("text")
        .attr("class", "predictedLabel")
        .attr("x", x(utils.parseTime(2017)) - 25)
        .text("Predicted");

    g.append("line")
        .attr("class", "predicted")
        .attr("x1", x(utils.parseTime(2017)))
        .attr("x2", x(utils.parseTime(2017)))
        .attr("y1", 0)
        .attr("y2", height);

}

function create_domains(data) {
    x.domain([utils.parseTime('1982'), utils.parseTime('2040')]);
    y.domain([
        d3.min(data, function (c) {
            return d3.min(c.values, function (d) {
                return d.value
            })
        }),
        d3.max(data, function (c) {
            return d3.max(c.values, function (d) {
                return d.value
            })
        })
    ]);
    z.domain(data.map(function (c) {
        return c.id
    }))

}

export function updateChart(close) {
    dont_show_these_countries = [];
    Object.keys(display_country).forEach(function (key) {
        const g = d3.selectAll('#' + key);
//        console.log(display_country[key]);
//        console.log("country");
//        console.log(key);
        if(close){
            g.style('pointer-events', 'auto');
        }
        else {
            if (display_country[key].display) {
                g.select('text')
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
                g.select('path').style('opacity', '1');
                g.select('path').transition()
                    .duration(2000)
                    .attrTween('stroke-dashoffset', tweenDashoffsetOn);

                g.select('circle').transition()
                    .duration(2000)
                    .attrTween('stroke-dashoffset', tweenDashoffsetOn);

                g.selectAll('circle').style('opacity', '1').style('pointer-events', 'auto');
                g.style('pointer-events', 'auto');
            } else {
                g.selectAll('circle').style('opacity', '0').style('pointer-events', 'none');
                g.style('pointer-events', 'none');
                g.select('text').style('opacity', '0');
                g.select('path').style('opacity', '0');
                
                dont_show_these_countries.push(key);
                
            }
            /*if (display_country[key].display) {
                g.select('text')
                    .transition()
                    .duration(1000)
                    .style('opacity', 1);
                g.select('path').style('opacity', '1');
                g.select('path').transition()
                    .duration(2000)
                    .attrTween('stroke-dashoffset', tweenDashoffsetOn);

                g.select('circle').transition()
                    .duration(2000)
                    .attrTween('stroke-dashoffset', tweenDashoffsetOn);

                g.selectAll('circle').style('opacity', '1').style('pointer-events', 'auto');
                g.style('pointer-events', 'auto');
                // d3.select('#line_chart').style('pointer-events', 'auto');
            } else {
                g.selectAll('circle').style('opacity', '0');
                g.style('pointer-events', 'none');

                d3.select('#line_chart').style('pointer-events', 'none');
                d3.select('#line_chart').select('.back2Map_button').style('pointer-events', 'auto');
                g.select('text').style('opacity', '0');
                g.select('path').style('opacity', '0');
            }*/
        }
        
    });
    ordinal.domain(countries_showing).range(colors_for_countries);
    legendOrdinal = d3.legendColor()
                        .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
                        .shapePadding(10)
                        //use cellFilter to hide the "e" cell
                        .cellFilter(function(d){ 
                                        //console.log(d.label);
                                        //return d.label !== "Mexico" && d.label !== "US";
                                        for(let i = 0; i < dont_show_these_countries.length; i++){
                                            if(!(d.label != dont_show_these_countries[i]) ){
                                                return false;
                                            }
                                        }
                                        return true;
                        })
                        .scale(ordinal);
    linechart_legend.call(legendOrdinal);
    console.log("updateChart Called");
}


export function renderLineChart() {

    const g = utils.svg.append('g')
        .attr('id', 'line_chart')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr("hidden", true);
    // .call(zoom);

    g.append("rect")
        .attr("class", "back2Map_button")
        .attr("transform", "translate(" + 1150 + "," + 0 + ")")
        .attr('width', 100)
        .attr('height', 50)
        .attr('fill', 'lightgrey')
        .on('click', function () {
            // toggle visibility
            d3.select('svg').select('.predictedSliderLabel').attr("visibility", "visible");
            d3.select('svg').select('.predictedSlider').attr("visibility", "visible");
            d3.select('#root').attr("display", "hidden");
            Object.keys(display_country).forEach(function (key) {
                display_country[key].display = false
            });
            updateChart(true);
            utils.showMap();
        });

    g.append("text")
        .attr("id", "back_button_text")
        .attr("transform", "translate(" + 1185 + "," + 30 + ")")
        .text("Back");
    
    // Legend
    linechart_legend = g.append('g')
                        .attr("class", "legendOrdinal")
                        .attr("transform", "translate(1120,100)");
    legendOrdinal = d3.legendColor()
                        .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
                        .shapePadding(10)
                        //use cellFilter to hide the "e" cell
                        //.cellFilter(function(d){ return d.label !== "e" })
                        .scale(ordinal);
    linechart_legend.call(legendOrdinal);

    create_domains(utils.water_stress);
    drawAxis(g);
    drawLines(g, utils.water_stress, '.country');
    drawLines(g, utils.water_stress_bau, '.country_bau');
    drawLines(g, utils.water_stress_opt, '.country_opt');
    drawLines(g, utils.water_stress_pst, '.country_pst');
    updateChart();
}


