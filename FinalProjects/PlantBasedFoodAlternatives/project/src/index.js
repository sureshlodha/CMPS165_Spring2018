const d3 = require("d3");
const $ = require("jquery");
import { TweenMax } from 'gsap'
import "./style.scss";

d3.sankey = function() {
  var sankey = {},
    nodeWidth = 24,
    nodePadding = 8,
    size = [1, 1],
    nodes = [],
    links = [];

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    computeLinkDepths();
    return sankey;
  };

  sankey.link = function() {
    var curvature = 0.5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
        x1 = d.target.x,
        xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature),
        y0 = d.source.y + d.sy + d.dy / 2,
        y1 = d.target.y + d.ty + d.dy / 2;
      return (
        "M" +
        x0 +
        "," +
        y0 +
        "C" +
        x2 +
        "," +
        y0 +
        " " +
        x3 +
        "," +
        y1 +
        " " +
        x1 +
        "," +
        y1
      );
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
        target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
      nextNodes,
      x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = nodeWidth;
        node.sourceLinks.forEach(function(link) {
          nextNodes.push(link.target);
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((width - nodeWidth) / (x - 1));
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x =
          d3.min(node.sourceLinks, function(d) {
            return d.target.x;
          }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3
      .nest()
      .key(function(d) {
        return d.x;
      })
      .sortKeys(d3.ascending)
      .entries(nodes)
      .map(function(d) {
        return d.values;
      });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft((alpha *= 0.99));
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = Math.abs(d3.min(nodesByBreadth, function(nodes) {
        return (
          (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value)
        );
      }));

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          node.dy = node.value * (ky || 0.01);
        });
      });

      links.forEach(function(link) {
        link.dy = link.value * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y =
              d3.sum(node.targetLinks, weightedSource) /
              d3.sum(node.targetLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth
        .slice()
        .reverse()
        .forEach(function(nodes) {
          nodes.forEach(function(node) {
            if (node.sourceLinks.length) {
              var y =
                d3.sum(node.sourceLinks, weightedTarget) /
                d3.sum(node.sourceLinks, value);
              node.y += (y - center(node)) * alpha;
            }
          });
        });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
          dy,
          y0 = 0,
          n = nodes.length,
          i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0,
        ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};

const state = {
  nutrient: "",
  animal: [],
  veg: []
};

$(".nutrients").change(() => {
  state.nutrient = $(".nutrients option:selected")[0].value;
  $(".food-list").empty();
  selectNutrient();
});


const slugify = s => s.replace(/\s/g, "-").toLowerCase();
const unslugify = s => s.replace(/\-/g, " ");
// const titleCase = s => unslugify(s).replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
const upper = s => s.charAt(0).toUpperCase() + s.substr(1);
const clear = () => svg.selectAll(`*`).remove();
const unit = n =>
  ({
    protein: "g",
    iron: "mg",
    vitb: "µg",
    calcium: "mg",
    omega: "g",
    vitd: "IU"
  }[n]);
  const dv = n => ({
    protein: 62,
    iron: 8,
    vitb: 6,
    calcium: 1000,
    omega: 300,
    vitd: 600
  }[n])
const createItem = (nutrient, type, name, serving, size) => {
  const item = $(
    ".food-list" + (type === "animal" ? ".animal" : ".veg")
  ).append(
    $("<div/>")
      .attr("id", slugify(name))
      .addClass("food-item")
      .html(
        `
      <img src="./assets/images/${slugify(name)}.png">
      <div>
        <h4>${name}</h4>
        <p>${upper(nutrient)}: ${serving} ${unit(nutrient)}<br>
           Serving Size: ${size}g
        </p>
      </div>
      `
      )
      .click(el => {
        el.currentTarget.parentNode.classList[1];
        if (
          el.currentTarget.parentNode.classList.contains("animal") &&
          !el.currentTarget.classList.contains("removed")
        ) {
          /* only 1 animal product can be selected:
           * state.animal = [];
           * [...$('.food-item')].forEach(el => el.classList.contains("removed") && el.classList.remove("removed"))
           */
          el.currentTarget.classList.add("removed");
          state.animal.push(el.currentTarget.id);
        } else {
          el.currentTarget.classList.remove("removed");
          state.animal = state.animal.filter(e => e !== el.currentTarget.id);
        }
        if (
          el.currentTarget.parentNode.classList.contains("veg") &&
          !el.currentTarget.classList.contains("substitute")
        ) {
          el.currentTarget.classList.add("substitute");
          state.veg.push(el.currentTarget.id);
        } else {
          el.currentTarget.classList.remove("substitute");
          state.veg = state.veg.filter(e => e !== el.currentTarget.id);
        }
        if (state.animal.length > 0 && state.veg.length > 0) {
          clear();
          $(".food-list-breakdown").empty();
          node(state.nutrient);
          state.animal.forEach(el => {
            graph.nodes.forEach(el3 => {
                if(el3.category === 'animal' && el === el3.name)
                    createBreakdown(state.nutrient, el3.nutrientAmt, el3)
            })
            TweenMax.fromTo('.food-list-breakdown', 0.4, { opacity: 0 }, { opacity: 1 })        
            state.veg.forEach(el2 => {
              let currLink = {
                source: el,
                target: el2,
                value: null
              }
              graph.nodes.forEach(el3 => {
                if (el3.category !== 'animal' && el2 === el3.name) 
                  currLink['value'] = el3.nutrientAmt
              })
              graph.links.push(currLink)
            })
          })
          draw(state.nutrient, graph);
          TweenMax.fromTo('#chart', 0.4, { opacity: 0 }, { opacity: 1 })        
        } else {
          $(".food-list-breakdown").empty();
          clear();
        }
      })
  );
};

const createBreakdown = (nutrient, amt, meat) => {
  const item = $(
    ".food-list-breakdown"
  ).append(
    $("<div/>")
      .attr("id", slugify(name))
      .addClass("food-item")
      .html(
        `
      
      <div>
        <p> You are currently supplementing for ${nutrient} with ${sumVeggies(meat.nutrientAmt)} servings of ${meat.name} with 1 serving of ${getList()}.
        </p>
      </div>
      `
      )
  );
};

function getList () {
    var myList = ""
    var i = 0;
    for(i = 0; i < state.veg.length; i++)
        if(state.veg.length === 1)
            return state.veg;
        else if(i === 0)
            myList = state.veg[i];
        else if(i === state.veg.length - 1)
            myList = myList + ", and " + state.veg[i];
        else
            myList = myList + ", " + state.veg[i];
    return myList;
    
}

function sumVeggies (nutTot) {
   var sum = 0;
    state.veg.forEach(el2 => {
        graph.nodes.forEach(el3 => {
            if(el3.category !== 'animal' && el2 === el3.name){
                sum += el3.nutrientAmt;
            }
        })
    })
    return Math.round((sum / nutTot)*10) / 10;
};

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("transform", "translateY(6px)");

var units;
const selectNutrient = () => {
  d3.csv(`./assets/data/${state.nutrient}.csv`, (error, data) => {
    data.forEach(el =>
      createItem(state.nutrient, el.category, el.food, el.nutrientAmt, el.size)
    );
  });
  $(".food-list-breakdown").empty();
  state.animal = [], state.veg = [];
  clear();
  graph = {};
  node(state.nutrient);
  units = unit(state.nutrient);
};


var margin = { top: 0, right: 21, bottom: 30, left: 0 },
  width = window.innerWidth / 3 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"), // zero decimal places
  format = function(d) {
    return d + units;
  },
  color = d3.scale.category20();

// append the svg canvas to the page
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3
  .sankey()
  .nodeWidth(36)
  .nodePadding(40)
  .size([width, height]);

var path = sankey.link();

let graph, data_graph;
const node = nutrient =>
  d3.csv(`assets/data/${nutrient}.csv`, function(error, data) {
    //set up graph in same style as original example but empty
    graph = { nodes: [], links: [] };

    data.forEach(d =>graph.nodes.push({
      name: slugify(d.food),
      prettyname: d.food,
      category: d.category,
      nutrientAmt: +d.nutrientAmt
    }));
    data_graph = graph;
  });
const draw = (nutrient, graph) =>
  d3.csv(`assets/data/${nutrient}.csv`, function(error, data) {
    // return only the distinct / unique nodes
    graph.nodes = d3.keys(
      d3
        .nest()
        .key(function(d) {
          return d.name;
        })
        .map(graph.nodes)
    );

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function(d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function(d, i) {
      graph.nodes[i] = { name: d };
    });

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(64);

    // add in the links
    var link = svg
      .append("g")
      .selectAll(".link")
      .data(graph.links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) {
        return Math.max(1, d.dy);
      })
      .sort(function(a, b) {
        return b.dy - a.dy;
      });

    // add the link titles
    // link.append("title").text(function(d) {
    //   return d.source.name + " ← " + d.target.name + "\n" + format(d.value);
    // });

    link.on('mouseover', d => {
      tooltip.transition()
        .duration(100)
        .style("opacity", 1)
        .style("transform", "translateY(0)");
      tooltip.html(d.source.name + " ← " + d.target.name + "\n" + format(d.value))
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 50) + "px");
    })
    link.on('mousemove', d => {
      tooltip
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 50) + "px");
    })
    link.on('mouseout', d => {
      tooltip.transition()
        .duration(100)
        .style("opacity", 0)
        .style("transform", "translateY(6px)");
    })

    // add in the nodes
    var node = svg
      .append("g")
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      // .call(
      //   d3.behavior
      //     .drag()
      //     .origin(function(d) {
      //       return d;
      //     })
      //     .on("dragstart", function() {
      //       this.parentNode.appendChild(this);
      //     })
      //     .on("drag", dragmove)
      // );

    // add overflow rectangles
    node
      .append("rect")
      .attr("height", function(d) {
        return data_graph.nodes.filter(el => el.name == d.name)[0].category == 'animal' ? d.dy : 0;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        return data_graph.nodes.filter(el => el.name == d.name)[0].category == 'animal' ? '#7be26e' : '#eaeaea';
      })
      .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2);
      })
      .on('mouseover', d => {
        tooltip.transition()
          .duration(100)
          .style("opacity", 1)
          .style("transform", "translateY(0)");
        tooltip.html("extra\n" + format(Math.round(Math.abs(d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt) * 100) / 100))
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 50) + "px");
      })
      .on('mousemove', d => {
        tooltip
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 50) + "px");
      })
      .on('mouseout', d => {
        tooltip.transition()
          .duration(100)
          .style("opacity", 0)
          .style("transform", "translateY(6px)");
      });

    
    // find amount of selected animals
    let animalCount = state.animal.length;
    let vegDivisions = (subsections) => {
      for(let i = 0; i < subsections; i++) {
        node
          .append("rect")
          .attr("height", function(d) {
            return data_graph.nodes.filter(el => el.name == d.name)[0].category == 'animal' ? 0 : d.dy/subsections;
          })
          .attr("y", function (d) {
            return i*(d.dy/subsections);
          })
          .attr("width", sankey.nodeWidth())
          .style("fill", function(d) {
            return '#eaeaea';
          })
          .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2);
          })
      }
    }
    vegDivisions(animalCount);
    // add the rectangles for the nodes
    node
      .append("rect")
      .attr("height", function(d) {
        return ((data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt / d.value) * d.dy) || d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        return d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt < 0 ? '#ff5f5f' : '#eaeaea';
      })
      .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2);
      })
      .on('mouseover', d => {
        if (d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt < 0) {
        tooltip.transition()
          .duration(100)
          .style("opacity", 1)
          .style("transform", "translateY(0)");
        tooltip.html("missing\n" + format(Math.abs(d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt)))
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 50) + "px");
        }
      })
      .on('mousemove', d => {
        if (d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt < 0)
        tooltip
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY - 50) + "px");
      })
      .on('mouseout', d => {
        if (d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt < 0)
        tooltip.transition()
          .duration(100)
          .style("opacity", 0)
          .style("transform", "translateY(6px)");
      });

      node
      .append("rect")
      .attr("height", function(d) {
        return (d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt) < 0 ? d.dy : 0;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        return '#eaeaea';
      })
      .style("stroke", function(d) {
        return d3.rgb(d.color).darker(2);
      })


    // add in the title for the nodes
    node
      .append("text")
      .attr("y", function(d) {
        return (d.dy / 2) - 10;
      })
      .attr("x", d => d.x < (width / 2) ? 6 + sankey.nodeWidth() : -6)
      .attr("dy", ".35em")
      .attr("text-anchor", d => d.x < (width / 2) ? "start" : "end")
      .attr("transform", null)
      .attr("font-size", 14)
      .text(function(d) {
        return d.value == 0 ? '' : d.name;
      })
      .append('svg:tspan')
      .attr('x', -6)
      .attr("text-anchor", "end")
      .attr("font-size", 12)
      .attr('dy', 19)
      .text(d => d.value == 0 ? '' : `${state.nutrient}: ${data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt}${unit(state.nutrient)}`)
      .filter(function(d) {
        return d.x < width / 2;
      })
      .attr('x', 6 + sankey.nodeWidth())
      .attr("text-anchor", "start")
      .attr('dy', 19)
      .append('svg:tspan')
      .attr('x', 6 + sankey.nodeWidth())
      .attr("text-anchor", "start")
      .attr("font-size", 12)
      .attr('dy', 13)
      .attr('fill', d => d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt > 0 ? '#0c6d00' : '#8e0000')
      .text(d => `${d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt > 0 ? 'extra:' : 'missing: '} ${Math.round(Math.abs(d.value - data_graph.nodes.filter(el => el.name == d.name)[0].nutrientAmt) * 100) / 100}${unit(state.nutrient)}`);
    
     // add legend rect gray
    // svg.append("rect")
    //   .attr("class", "legend")
    //   .attr("x", 20)
    //   .attr("y", 20)
    //   .attr("rx", "5px")
    //   .attr("width", 230)
    //   .attr("height", 80)
    //   .attr("stroke", "darkgray")
    //   .attr("fill", "white");
      
    svg.append("text")
      .attr("class", "legend_text")
      .attr("x", 60)
      .attr("y", 75)
      .text("Extra Portion");
      
    svg.append("rect")
      .attr("x", 35)
      .attr("y", 63)
      .attr("height", 15)
      .attr("width", 15)
      .style("fill", "rgb(123, 226, 110)")
      
    svg.append("text")
      .attr("class", "legend_text")
      .attr("x", 60)
      .attr("y", 47)
      .text("Unsupplemented Portion");

    svg.append("rect")
      .attr("x", 35)
      .attr("y", 35)
      .attr("height", 15)
      .attr("width", 15)
      .style("fill", "rgb(255, 95, 95)")
      
  });

// set default state 
state.nutrient = "protein";
selectNutrient();
clear();
node(state.nutrient);
setTimeout(() => {
  $("#salmon").click()}, 800)
setTimeout(() => {
  $("#chickpeas").click()}, 1100)
setTimeout(() => {
  $("#lentils").click()}, 1400)
