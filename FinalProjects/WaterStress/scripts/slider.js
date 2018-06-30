import * as utils from "./index";
import {width, height, slider_height, slider_width, years, padding, current_year_global} from "./variables";
import {updateMap, futureOptions, bau, optimistic, pessimistic} from "./map";

export function createSlider() {

    const data3 =
        d3.range(0, Object.keys(years).length).map(function (d) {
            return new Date(Object.keys(years)[d], 10, 3);
        });

    const slider3 = d3.sliderHorizontal()
        .min(d3.min(data3))
        .max(d3.max(data3))
        .width(400)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(data3)
        .on('onchange', val => {
            d3.select('svg').select('#key').remove();
            let keys = Object.keys(years);
            let current_year = years[keys.reverse().find(e => e <= utils.formatTime(val))];
            if(current_year === "2020" || current_year === "2030" || current_year === "2040"){
                d3.select('svg')
                    .select('#slider')
                    .select('.slider')
                    .select('.parameter-value')
                    .select('path')
                    .style('fill', '#8b0000');
                
                document.getElementById("bau").disabled=false;
                document.getElementById("optimistic").disabled=false;
                document.getElementById("pessimistic").disabled=false;
                
                current_year_global.year = current_year;
                
                updateMap(utils.water_stress_levels_bau.get(current_year), current_year);
                
                bau(utils.water_stress_levels_bau.get(current_year), current_year);
                optimistic(utils.water_stress_levels_opt.get(current_year), current_year);
                pessimistic(utils.water_stress_levels_pst.get(current_year), current_year);
                
            
                
            }
            else{
                d3.select('svg')
                    .select('#slider')
                    .select('.slider')
                    .select('.parameter-value')
                    .select('path')
                    .style('fill', 'white');
                
                document.getElementById("bau").disabled=true;
                document.getElementById("optimistic").disabled=true;
                document.getElementById("pessimistic").disabled=true;
                current_year_global.year = current_year;
                
                updateMap(utils.water_stress_levels.get(current_year), current_year);
                
            }
        });


    utils.svg.append('g')
        .attr('id', 'slider')
        .attr("transform", "translate(480" + ", " + (height) + ")")
        .attr('width', slider_width)
        .attr('height', slider_height)
        .call(slider3);
    
    utils.svg.append('g').append("text")
        .attr("class", "predictedSliderLabel")
        .attr("x", 739)
        .attr("y", 580)
        .text("Predicted");
    
    utils.svg.append('g').append("line")
        .attr("class", "predictedSlider")
        .attr("x1", 739)
        .attr("x2", 739)
        .attr("y1", 620)
        .attr("y2", 580);

    
}

