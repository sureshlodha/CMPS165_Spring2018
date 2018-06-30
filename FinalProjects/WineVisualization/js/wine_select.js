// CHART CODE HERE
$(document).ready(function() {
    var margin = { top: 20, right: 80, bottom: 30, left: 50 },
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    var parseTime = d3.timeParse('%Y');

    var circles;

    var x = d3.scaleLinear().range([0, width]);

    var y = d3.scaleTime().range([0, height]);

    var r = d3.scaleSqrt().range([2, 10]);

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3.axisLeft().scale(y);

    // var color = d3.scaleOrdinal(d3.schemeCategory20);
    var symbols = d3.scaleOrdinal(d3.symbols);

    // creates a generator for symbols
    var symbol = d3.symbol().size(100);

    var chartsvg = d3
        .select('.graph')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var tooltip = d3
        .select('.graph')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    var colors = {
        //Parent
        Fruity: '#4b0082',
        //Children
        'Tree Fruit': '#61258f',
        Berry: '#763f9b',
        Citrus: '#8a59a7',
        'Dried Fruit': '#9e72b3',
        Tropical: '#b28bc0',
        'Fresh (F)': '#c5a4cc',
        //Wines
        Rochiloli: '#d8bfd8',
        Kuyam: '#d8bfd8',
        Schloss: '#d8bfd8',
        Roth: '#d8bfd8',
        Firesteed: '#d8bfd8',
        Simonnet: '#d8bfd8',
        Avidagos: '#d8bfd8',
        Graff: '#d8bfd8',
        Vignelaure: '#d8bfd8',
        Caillou: '#d8bfd8',
        Damilano: '#d8bfd8',
        Calstar: '#d8bfd8',
        Penfolds: '#d8bfd8',
        'Line 39': '#d8bfd8',
        Manos: '#d8bfd8',
        Bernhard: '#d8bfd8',
        Magnolia: '#d8bfd8',
        Presuses: '#d8bfd8',
        'De Silva': '#d8bfd8',
        Rochioli: '#d8bfd8',

        Woody: '#cb181d',
        Cedar: '#ef3b2c',
        Coffee: '#fb6a4a',
        Vanilla: '#fc9272',
        Oak: '#fcbba1',
        Kirkland: '#fee0d2',
        'Le Vigne': '#fee0d2',
        Petirrojo: '#fee0d2',
        Bink: '#fee0d2',
        Bodega: '#fee0d2',
        Peltier: '#fee0d2',
        Casarena: '#fee0d2',
        Raimat: '#fee0d2',
        Crossbarn: '#fee0d2',
        Tilia: '#fee0d2',
        Parallel: '#fee0d2',
        Ferrari: '#fee0d2',
        Tarara: '#fee0d2',
        //"":"",
        Herbal: '#31a354 ',
        'Fresh (H)': '#c7e9c0',
        Cooked: '#a1d99b',
        Dried: '#74c476',
        Collier: '#bae4b3',
        Puelles: '#bae4b3',
        Babcock: '#bae4b3',
        Islands: '#bae4b3',

        Biological: '#feb24c',
        Lactic: '#fff7bc',
        Yeasty: '#fee391',
        'Pet Nat': '#ffffb2',
        Chakana: '#ffffb2',
        Alorna: '#ffffb2',

        Earthy: '#f768a1',
        Dusty: '#fbb4b9',
        Ceretto: '#feebe2',
        Well: '#feebe2',
        Caramel: '#d95f0e',
        Molasses: '#fe9929',
        Belles: '#fec44f',
        Avignonsi: '#fec44f',

        Pungent: '#969696',
        Menthol: '#bdbdbd',
        Viberti: '#d9d9d9',

        Chemical: '#4292c6',
        Diesel: '#6baed6',
        Tar: '#3685b0',
        Amayna: '#9ecae1',
        Fattoria: '#9ecae1'
    };

    d3.csv('WineDataSet.csv', function(error, data) {
        data.forEach(function(d) {
            d.title = d.title;
            d.points = +d.points;
            d.year1 = d.year;
            d.price = d.price;
            d.year = parseTime(d.year);
        });

        x
            .domain(
                d3.extent(data, function(d) {
                    return d.points;
                })
            )
            .nice();

        y.domain(
            d3.extent(data, function(d) {
                return d.year;
            })
        );

        r
            .domain(
                d3.extent(data, function(d) {
                    return d.year;
                })
            )
            .nice();

        chartsvg
            .append('g')
            .attr('transform', 'translate(-1,' + (height - 45) + ')')
            .attr('class', 'x axis')
            .call(xAxis);

        chartsvg
            .append('g')
            .attr('transform', 'translate(-7,0)')
            .attr('class', 'y axis')
            .call(yAxis);

        chartsvg
            .append('text')
            .attr('x', 10)
            .attr('y', 10)
            .attr('class', 'label')
            .text('Vintage Year');

        chartsvg
            .append('text')
            .attr('x', 550)
            .attr('y', height - 50)
            .attr('text-anchor', 'end')
            .attr('class', 'label')
            .text('Taste Rating');

        // we use the ordinal scale symbols to generate symbols
        // such as d3.symbolCross, etc..
        // -> symbol.type(d3.symbolCross)()
        circles = chartsvg
            .selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', function(d) {
                return 7;
            })
            .attr('cx', function(d) {
                return x(d.points);
            })
            .attr('cy', function(d) {
                return y(d.year);
            })
            .style('fill', function(d) {
                return colors[d.secondary];
            })
            .on('mouseover', function(d) {
                tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip
                    .html(
                        d.title.bold() +
                            '<hr style="text-algin: left; margin: 0px; padding: 0px"><p style="text-algin: left; margin: 0px; padding: 0px" >Vintage' + '<span style="position: absolute; left: 50%;" >'+':'+'</span> '+'<span style="float: right" >'+d.year1+'</span></p> ' +
                            '<hr style="text-algin: left; margin: 0px; padding: 0px"><p style="text-algin: left; margin: 0px; padding: 0px" >Price' + '<span style="position: absolute; left: 50%;" >'+':'+'</span> '+'<span style="float: right" >'+d.variety+'</span></p> ' +
                            '<hr style="text-algin: left; margin: 0px; padding: 0px"><p style="text-algin: left; margin: 0px; padding: 0px" >Variety' + '<span style="position: absolute; left: 50%;" >'+':'+'</span> '+'<span style="float: right" >'+d.country+'</span></p> ' +
                            '<hr style="text-algin: left; margin: 0px; padding: 0px"><p style="text-algin: left; margin: 0px; padding: 0px" >Origin' + '<span style="position: absolute; left: 50%;" >'+':'+'</span> '+'<span style="float: right" >'+d.province+'</span></p> ' +
                            '<hr style="text-algin: left; margin: 0px; padding: 0px"><p style="text-algin: left; margin: 0px; padding: 0px" >Rating' + '<span style="position: absolute; left: 50%;" >'+':'+'</span> '+'<span style="float: right" >'+d.points+'</span></p> ' +
                            '<hr style="text-algin: left; margin: 0px; padding: 0px"><p style="text-algin: left; margin: 0px; padding: 0px" >Pairings' + '<span style="position: absolute; left: 50%;" >'+':'+'</span> '+'<span style="float: right" >'+d.pair+'</span></p> '
                    )
                    .style('left', d3.event.pageX - 230 + 'px')
                    .style('top', d3.event.pageY + 'px');
            })
            .on('mouseout', function(d) {
                tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0);
            });

        var tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
        var clicked = '';
    });

    // SUNBURST CODE HERE

    // Variables
    var allNodes;
    var width = 700;
    var height = 600;
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);
    var color2 = d3.scaleOrdinal(d3.schemeCategory20b);
    d3.selectAll('button').style('background-color', color2());
    // Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
    var g = d3
        .select('.chart')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    // Create our sunburst data structure and size it.
    var partition = d3.partition().size([2 * Math.PI, radius]);
    // Get the data from our JSON file
    d3.json('sunburst.json', function(error, nodeData) {
        if (error) throw error;
        allNodes = nodeData;
        var showNodes = JSON.parse(JSON.stringify(nodeData));
        drawSunburst(allNodes);
    });
    function drawSunburst(data) {
        // Find the root node, calculate the node.value, and sort our nodes by node.value
        root = d3
            .hierarchy(data)
            .sum(function(d) {
                return d.size;
            })
            .sort(function(a, b) {
                return b.value - a.value;
            });
        // Calculate the size of each arc; save the initial angles for tweening.
        partition(root);
        arc = d3
            .arc()
            .startAngle(function(d) {
                d.x0s = d.x0;
                return d.x0;
            })
            .endAngle(function(d) {
                d.x1s = d.x1;
                return d.x1;
            })
            .innerRadius(function(d) {
                return d.y0;
            })
            .outerRadius(function(d) {
                return d.y1;
            });
        // Add a <g> element for each node; create the slice variable since we'll refer to this selection many times
        slice = g.selectAll('g.node').data(root.descendants(), function(d) {
            return d.data.name;
        }); // .enter().append('g').attr("class", "node");
        newSlice = slice
            .enter()
            .append('g')
            .attr('class', 'node')
            .merge(slice);
        slice.exit().remove();
        // TRY 1: ID selection that's has been drawn previously... (requires us to set "drawn" down below)
        //newSlice.filter ( function(d) { return !d.drawn; }).append('path')
        //    .attr("display", function (d) { return d.depth ? null : "none"; }).style('stroke', '#fff');
        // TRY 2: Only create paths on "first run"
        //if (firstRun) {
        //    newSlice.append('path').attr("display", function (d) { return d.depth ? null : "none"; }).style('stroke', '#fff');
        //}
        // TRY 1&2: Set path-d and color always. But this isn't using new arc...?
        //newSlice.selectAll('path').attr("d", arc).style("fill", function (d) { return color((d.children ? d : d.parent).data.name); });
        // Append <path> elements and draw lines based on the arc calculations. Last, color the lines and the slices.
        slice.selectAll('path').remove();
        newSlice
            .append('path')
            .attr('display', function(d) {
                return d.depth ? null : 'none';
            })
            .attr('d', arc)
            .style('stroke', '#fff')
            .style('fill', function(d) {
                return colors[d.data.name];
            });
        // .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); });
        // Populate the <text> elements with our data-driven titles.
        slice.selectAll('text').remove();
        newSlice
            .append('text')
            .attr('transform', function(d) {
                return (
                    'translate(' +
                    arc.centroid(d) +
                    ')rotate(' +
                    computeTextRotation(d) +
                    ')'
                );
            })
            .attr('dx', '-30')
            .attr('dy', '.4em')
            .style('font-size', '13px')
            .text(function(d) {
                return d.parent ? d.data.name : '';
            });
        newSlice.on('click', highlightSelectedSlice);
        root.count();
        root.sort(function(a, b) {
            return b.value - a.value;
        });
        partition(root);
        newSlice
            .selectAll('path')
            .transition()
            .duration(750)
            .attrTween('d', arcTweenPath);
        newSlice
            .selectAll('text')
            .transition()
            .duration(750)
            .attrTween('transform', arcTweenText);
        g.append("svg:image")
        .attr('x', -35)
        .attr('y', -35)
        .attr('width', 70)
        .attr('height', 70)
        .attr("xlink:href", "grape.png")
    }
    // d3.selectAll(".showSelect").on("click", showTopTopics);
    // d3.selectAll(".sizeSelect").on("click", sliceSizer);
    // Redraw the Sunburst Based on User Input
    function highlightSelectedSlice(c, i) {
        clicked = c;
        console.log(clicked);
        var rootPath = clicked.path(root).reverse();
        rootPath.shift(); // remove root node from the array
        newSlice.style('opacity', 0.4);
        // console.log(rootPath)
        circles.style('visibility', 'hidden');
        newSlice
            .filter(function(d) {
                if (d == clicked && d.prevClicked) {
                    d.prevClicked = false;
                    newSlice.style('opacity', 1);
                    circles.style('visibility', 'visible');
                    return true;
                } else if (d == clicked) {
                    d.prevClicked = true;
                    // THIS IS WHERE WE FILTER INDIVIDUAL DOTS
                    circles.each(function() {
                        var cur = d3.select(this);
                        console.log(d.data.name);
                        console.log(cur.data()[0].primary);
                        console.log(
                            d.data.name.includes(cur.data()[0].primary)
                        );
                        console.log('---');

                        if (d.data.name == cur.data()[0].primary) {
                            cur.style('visibility', 'visible');
                        } else if (
                            d.data.name == cur.data()[0].secondary &&
                            d.parent.data.name == cur.data()[0].primary
                        ) {
                            cur.style('visibility', 'visible');
                        } else if (d.data.fullname == cur.data()[0].title) {
                            cur.style('visibility', 'visible');
                        }
                    });
                    // HERE
                    return true;
                } else {
                    d.prevClicked = false;
                    return rootPath.indexOf(d) >= 0;
                }
            })
            .style('opacity', 1);
        //d3.select("#sidebar").text("another!");
    }
    // Redraw the Sunburst Based on User Input
    function sliceSizer(r, i) {
        // Determine how to size the slices.
        if (this.value === 'size') {
            // root.sum(function(d) { return d.size; });
            console.log('one');
        } else {
            root.count();
            console.log('two');
        }

        root.sort(function(a, b) {
            return b.value - a.value;
        });
        partition(root);
        newSlice
            .selectAll('path')
            .transition()
            .duration(750)
            .attrTween('d', arcTweenPath);
        newSlice
            .selectAll('text')
            .transition()
            .duration(750)
            .attrTween('transform', arcTweenText);
    }
    // Redraw the Sunburst Based on User Input
    function showTopTopics(r, i) {
        //alert(this.value);
        var showCount;
        // Determine how to size the slices.
        if (this.value === 'top3') {
            showCount = 3;
        } else if (this.value === 'top6') {
            showCount = 6;
        } else {
            showCount = 100;
        }
        var showNodes = JSON.parse(JSON.stringify(allNodes));
        showNodes.children.splice(
            showCount,
            showNodes.children.length - showCount
        );
        drawSunburst(showNodes);
    }

    /**
     * When switching data: interpolate the arcs in data space.
     * @param {Node} a
     * @param {Number} i
     * @return {Number}
     */
    function arcTweenPath(a, i) {
        var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
        function tween(t) {
            var b = oi(t);
            a.x0s = b.x0;
            a.x1s = b.x1;
            return arc(b);
        }
        return tween;
    }
    /**
     * When switching data: interpolate the text centroids and rotation.
     * @param {Node} a
     * @param {Number} i
     * @return {Number}
     */
    function arcTweenText(a, i) {
        var oi = d3.interpolate({ x0: a.x0s, x1: a.x1s }, a);
        function tween(t) {
            var b = oi(t);
            return (
                'translate(' +
                arc.centroid(b) +
                ')rotate(' +
                computeTextRotation(b) +
                ')'
            );
        }
        return tween;
    }
    /**
     * Calculate the correct distance to rotate each label based on its location in the sunburst.
     * @param {Node} d
     * @return {Number}
     */
    function computeTextRotation(d) {
        var angle = (d.x0 + d.x1) / Math.PI * 90;
        // Avoid upside-down labels
        angle < 120 || angle > 270 ? angle : angle + 180;
        //return angle + 90// labels as rims
        return angle < 180 ? angle - 90 : angle + 90; // labels as spokes
    }
});
