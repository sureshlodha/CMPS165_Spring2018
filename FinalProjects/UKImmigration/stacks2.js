// Stacks redone
var d3;
var Promise;
/* These are the regions we will draw, everything else gets summed to 'other' during the dataset construction, 
*/
//Width and height
var w = 600;
var h = 520;

var margin = {left: 40, right: 210, top: 30, bottom: 50} // margin/positioning objects
//var shift = {left: 600, top: 550}

//Create SVG element
var svg_area = d3.select("#stack_area_div") // set up the canvas
    .append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom);

var stacked_area = svg_area.append('g') // group for the map
    .attr('id', 'stacked-area')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var legend = stacked_area.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${w + 60}, 0)`)

var yScale = d3.scaleLinear()
    .range([h, 0])
    .nice();
function setYScale() {
    console.log('Set the y scale');
    yScale.domain([0, d3.max(series, (r) => d3.max(r, q => q[1]))]);
}

var xScale = d3.scaleTime()
    .range([0, w]);

var areaColor = d3.scaleOrdinal()
    .domain(["UK",       "South Asia", "East Asia", "Europe (non-EU)", "Sub-Saharan Africa", "Middle East", "South East Asia", "Other"])
    .range( [ "#00247D", '#ff4242',    '#d13a3a',   '#5041f4',         '#f4a742',            '#7228a3',     '#f96b52',         '#aaaaaa'])

var imgScale = d3.scaleSequential(d3.interpolateBlues) // Color scale for individuals, blue
var stack = d3.stack()
    .order(d3.stackOrderNone);

//Define area generator
area = d3.area()
    .x((d) => xScale(d.data.date))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));

//Define axes
xAxis = d3.axisBottom()
   .scale(xScale)
   .ticks(10)
   .tickFormat(fmtdate);

//Define Y axis
yAxis = d3.axisRight()
    .scale(yScale)
    .ticks(5);

let stacks_x = stacked_area.append('g')
    .attr('transform', () => `translate(0, ${h})`)
    .attr('class', 'stacks x-axis');

let stacks_y = stacked_area.append('g')
    .attr('transform', () => `translate(${w}, 0)`)
    .attr('class', 'stacks y-axis');
stacks_y.append('text')
    .attr('transform', `translate(-15, 10)`)
    .text('Total visas granted')
    .attr('text-anchor', 'end')
    .attr('fill','black');

// this function just picks which column to draw for the area chart
function setType(type) { // from the D3 book, ch16
    console.log('Set the type to ' + type);
    stack.keys(regions)
        .value((d, key) => {
        return d[key][type];
    });
    series = stack(to_stack);
}

var regions = ["South Asia", "East Asia", "Europe (non-EU)", "Sub-Saharan Africa", "Middle East", "South East Asia", "Other"];
var others = [];
var types = []; // will contain the columns

var type_filter = d3.select('#stack_area_type')
    .on('change', () => {
        type = types[d3.event.target.value];
        console.log(d3.event.target.value);
        setType(type);
        setYScale();
        draw_chart();
    });

function build_filter() {
    types.forEach((key, value) => {
        type_filter.append('option')
            .attr('value', value)
            .html(key)
    })
}

var popLine = d3.line()
    .x(d => {console.log(d); return d})
    .y(d => {console.log(d); return d})

function draw_legend(color) {
    let categories = color.domain();
    let step = h / categories.length;
    let v_pad = 3;
    var legendQuant = d3.legendColor()
        .shapeWidth(30)
        .shapeHeight(step - v_pad)
        .cells(color.length)
        .orient('vertical')
        .labels(categories)
        .scale(color);
    legend.call(legendQuant);
    console.log(step, h, categories.length);
//    let ypos = h - (step + v_pad);
//    categories.forEach((c, i) => {
//        legend.append('rect')
//            .attr('class', c)
//            .attr('x', 10)
//            .attr('y', ypos)
//            .attr('width', 40)
//            .attr('height', step - v_pad)
//            .attr('fill', color(categories[i]));
//        legend.append('text')
//            .attr('class', c)
//            .text(c)
//            .attr('x',50)
//            .attr('y', ypos + step/2)
//            .attr('text-anchor', 'start')
//            .attr('fill', 'black');
//        ypos -= step;
//    });
    
}
function draw_chart() {
    console.log('draw chart', series);
    stacks_y.call(yAxis);
    stacked_area.selectAll('.visa').remove();
    stacked_area.selectAll('.visa')
        .data(series)
        .enter()
        .append('path')
        .attr('class', 'visa')
        .attr('id', (d) => d.key)
        .attr('d', area)
        .attr('fill', (d,i) => areaColor(d.key))
        .append("title")  //Make tooltip
        .text(d => d.key);
}
var qMap = {
    Q1: '03',
    Q2: '06',
    Q3: '09',
    Q4: '12'
}

var parsedate = d3.timeParse('%Y'); // time and date parsing and formatting
var fmtdate = d3.timeFormat('%b %d, %Y');

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);
var fetchAsText = Promise.promisify(d3.text);

var yearly$ = csv('visas_yearly_regions.csv', (row, i, keys) => {
    row['date'] = parsedate(row.Year);
    var [_, _, ...cols] = keys;
    cols.forEach(col => {
        row[col] = +row[col];
    })
    return row;
})
//var pop$ = csv('britain_pop_projections.csv', popTransform)
var series, to_stack;
yearly$.then((yearly) => {
    console.log(yearly);
    let other = {};
    var [_, _, ...cols] = yearly.columns;
    types = cols;
    console.log(types);
    to_stack = [];
    let index = -1;
    let old_date = '';
    yearly.forEach(d => {
        console.log(d);
        if (d.Region === 'Total') return;
//        console.log(old_date, d.Year)
        if (old_date !== d.Year) {
            index++;
            old_date = d.Year;
            to_stack[index] = {date: d.date};
            to_stack[index]['Other'] = {};
        }
        if (d.Region === 'Other') {
            to_stack[index].Other = d;
            return;
        }
        if (regions.indexOf(d.Region) < 0) {
            if (others.indexOf(d.Region) < 0) {
                others.push(d.Region);
            }
            types.forEach(col => {
                to_stack[index].Other[col] += d[col];
//                other[col] += d[col]
            });
            return;
        }
//        console.log(to_stack, index);
//        to_stack[index][d.Region] = d;
        to_stack[index][d.Region] = d;
        return;
    })
    build_filter();
    console.log(others);
    console.log(to_stack);
    console.log('that one');
    console.log(types, regions)
    
    setType(types[0]); // set it to totals
//    stack.keys(types);
    
//    var series = stack(no_totals);
    series = stack(to_stack)
    console.log(series);
    
    xScale.domain(d3.extent(yearly, d => d.date));
    console.log(xScale.domain());
    
    setYScale(types[0]);
    console.log(yScale.domain());
    
    draw_chart();
//    
//    stacked_area.selectAll('#pop')
//        .data(pop)
//        .enter()
//        .append('path')
//        .attr('id', 'pop')
//        .attr('d', popLine)
    
    stacks_x.call(xAxis)
        .call(xAxis)
        .selectAll('text')
        .attr('text-anchor', 'start')
        .attr('transform', 'rotate(30)');
    
    draw_legend(areaColor)
    
}).catch(error => {console.error(error)});
