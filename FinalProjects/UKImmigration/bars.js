//bars.js

var d3;
var Promise;
/* These are the regions we will draw, everything else gets summed to 'other' during the dataset construction
{count: 7789825, name: "Asia South"}
1
:
{count: 4726514, name: "Asia East"}
2
:
{count: 4500844, name: "Europe Other"}
3
:
{count: 3847396, name: "Africa Sub-Saharan"}
4
:
{count: 3429414, name: "Middle East"}
5
:
{count: 2235289, name: "Asia South East"}
*/
//Width and height
var w = 750;
var h = 450;

var margin = {left: 20, right: 200, top: 30, bottom: 50} // margin/positioning objects
var shift = {left: 600, top: 550}

var imgScale = d3.scaleSequential(d3.interpolateBlues) // Color scale for individuals, blue
//var stack = d3.stack()
//    .order(d3.stackOrderAscending);

var cStack = d3.stack()
    .order(d3.stackOrderAscending);

//var popLine = d3.line()
//    .x(d => {console.log(d); return d})
//    .y(d => {console.log(d); return d})
////Create SVG element
var svg = d3.select("body") // set up the canvas
    .append("svg")
    .attr("width", w + margin.left + margin.right)
.attr("height", h + margin.top + margin.bottom);

var stacked_bar = svg.append('g') // group for the map
    .attr('id', 'stacked-bar')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

//var legend = stacked_bar.append('g')
//    .attr('id', 'legend')
//    .attr('transform', `translate(${w + 50}, 0)`)

function draw_legend(categories, color) {
    let step = h / categories.length;
    console.log(step, h, categories.length);
    let ypos = 0;
    let v_pad = 3;
    categories.forEach((c, i) => {
        legend.append('rect')
            .attr('class', c)
            .attr('x', 0)
            .attr('y', ypos)
            .attr('width', 30)
            .attr('height', step - v_pad)
            .attr('fill', color[i]);
        legend.append('text')
            .attr('class', c)
            .text(c)
            .attr('x', 30)
            .attr('y', ypos + step/2)
            .attr('text-anchor', 'start')
            .attr('fill', 'black');
        ypos += step;
    });
    
}

var qMap = {
    Q1: '03',
    Q2: '06',
    Q3: '09',
    Q4: '12'
}

var parsedate = d3.timeParse('%Y-%m'); // time and date parsing and formatting
var fmtdate = d3.timeFormat('%b %d, %Y');

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);
var fetchAsText = Promise.promisify(d3.text);

//var L2$ = json ('britain.json') // promise which will resolve to the map json

function popTransform(row) {
    console.log(row);
    return row;
}

var quarterly$ = fetchAsText('visas_filtered_georegions.csv')
var pop$ = csv('britain_pop_projections.csv', popTransform)
Promise.all([quarterly$, pop$]).then(([quarterly, pop]) => {
    console.log(pop);
//quarterly$.then(quarterly => {
//    console.log(quarterly);
    let [columns, ...lines] = quarterly.split('\n');
    let regions = [];
    console.log(columns);
    [_, _, ...columns] = columns.split(',');
//    console.log(lines);
    let years = [];
    let totals = [];
    let index = 0;
    for (line of lines) { // crunch the csv file line by line
        let [time, region, ...values] = line.split(',');
        
        let year = /\d{4}/.exec(time)[0];
        let quarter = /Q\d/.exec(time)[0];
        
        let date = year + '-' + qMap[quarter];
        
//        console.log(date);
        if (!years[index]) {
            years[index] = {date: date};
            totals[index] = {date: date};
        } else if (years[index].date !== date) {
            index++;
            years[index] = {date: date};
            totals[index] = {date: date};
        }
        
        if (region === 'Total') {
            let tmp = {};
            for (let i = 0; i < columns.length; i++) {
                totals[index][columns[i]] = +values[i];
            }
            totals[index][region] = tmp;
//            totals[index][region]['total'] = values[0];
        }
    }
    console.log(totals);
//    let counts = {};
//    regions.forEach(r => counts[r] = 0);
//    years.forEach((q, i) => {
//        regions.forEach(r => counts[r] += q[r]['total'])
//    });
//    // pick the top 7 regions;
//    let top_regions = regions.map(r => {
//        return {count: counts[r], name: r};
//    });
//    top_regions.sort((a, b) => b.count - a.count);
//    console.log(top_regions);
//    
//    console.log(counts);
//    console.log(columns, regions)
//    console.log(totals);
    
    // this function just picks which column to draw for the area chart
    function setType(type) { // from the D3 book, ch16
        stack.keys(regions)
            .value((d, key) => d[key][type])
    }
//    setType(columns[0]); // set it to Totals
    
//    cStack.keys(columns)
//        .value((d, key) => {
//        console.log(d, key);
//        return d['Total'][key]
//    })
    
//    var foo = cStack(totals);
//    console.log(foo);
    
//    var series = stack(years);
//    console.log(series);
    
    xScale = d3.scaleTime()
               .domain([
                    d3.min(totals, function(d) { return parsedate(d.date); }),
                    d3.max(totals, function(d) { return parsedate(d.date); })
                ])
               .range([0, w]);
    console.log(xScale.domain());
    
    function setYScale(type) {
        console.log('a');
        yScale = d3.scaleLinear()
            .domain([
                0, 10000000
//                d3.max(years, (y) => {
//                    let sum = 0;
//                    for (let r of regions) {
//                        sum += +y[r][type]
//                    }
//                    return sum;
//                })
            ])
            .range([h, 0])
            .nice();
    }
    setYScale(columns[0]);
//    console.log(yScale.domain());

    //Define axes
    xAxis = d3.axisBottom()
               .scale(xScale)
               .ticks(10)
               .tickFormat(fmtdate);

    //Define Y axis
    yAxis = d3.axisRight()
               .scale(yScale)
               .ticks(5);

    //Define area generator
//    area = d3.area()
//                .x((d) => xScale(parsedate(d.data.date)))
//                .y0((d) => yScale(d[0]))
//                .y1((d) => yScale(d[1]));
    
    stacked_bar;
    
    let stacks_x = stacked_bar.append('g')
        .attr('transform', () => `translate(0, ${h})`)
        .attr('class', 'stacks x-axis')
        .call(xAxis)
        .selectAll('text')
        .attr('text-anchor', 'start')
        .attr('transform', 'rotate(30)');
    
    let stacks_y = stacked_bar.append('g')
        .attr('transform', () => `translate(${w}, 0)`)
        .attr('class', 'stacks y-axis')
        .call(yAxis);
    
//    draw_legend(regions, d3.schemeCategory20)
    
}).catch(error => {console.error(error)});
