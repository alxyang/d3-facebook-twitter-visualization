var $loading = $('#loading-div').hide();
$(document)
  .ajaxStart(function () {
    $loading.show();
  })
  .ajaxStop(function () {
    $loading.hide();
  });

var graph = {};
//pass in facebook api data from back end
$.get( "/facebookd3", function( data ) {
  graph.nodes = data.nodes;
  graph.edges = data.edges;
}) 
.done(function() {

  var friendships = graph.edges.reduce(function(acc, x) {
      if (!Object.prototype.hasOwnProperty.call(acc, x.source)) {
          acc[x.source] = [];
      }
      if (!Object.prototype.hasOwnProperty.call(acc, x.target)) {
          acc[x.target] = [];
      }
      if (!~acc[x.source].indexOf(x.target)) {
          acc[x.source].push(x.target);
      }
      if (!~acc[x.target].indexOf(x.source)) {
          acc[x.target].push(x.source);
      }

      return acc;
  }, {});

  var lerp = function(a, b, t) {
    return a + (b - a) * t;
  };

  // Compute the maximum links from a node.
  var maxFriends = Math.max.apply(Math, Object.keys(friendships).map(function(k) {
      return friendships[k].length;
  }));

  // Compute the size for a node.
  var sizeForNode = function(i) {
      return Math.round(lerp(2, 10, (friendships[i] || [-1]).length / maxFriends));
  };

  //create svg
  var svg = d3.select('#graph')
      .append('svg')
      .attr('class', '.gdimensions');

  // zoom functionality
  var g = svg.append('g');
  svg.call(d3.behavior.zoom().on('zoom', function() {
      g.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
  }));

  // Create a force layout to display nodes.
  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(40)
      .size([800, 400])
      .nodes(graph.nodes)
      .links(graph.edges);

  var paused = false;

  d3.select('#pause').on('click', function() {
      paused = !paused;
      if (paused) {
          force.stop();
      } else {
          force.resume();
      }
  })

  // Add the edges to the SVG.
  var edge = g.selectAll('line.edge')
      .data(graph.edges)
      .enter().append('line')
      .attr('class', 'edge')
      .style('stroke', '#9BC4E2')
      .style('stroke-width', 0.5);

  // Add the nodes to the SVG.
  var node = g.selectAll('circle.node')
      .data(graph.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', function(d, i) {
          return sizeForNode(i);
      })
      .style('stroke', 'rgba(100, 100, 100, 0.2)')
      .style('fill', '#3B5998')
      .style('cursor', 'pointer')
      .on('mouseover', function(d, i) {
          d3.select(this)
              .attr('r', sizeForNode(i))
              .style('fill', 'blue');
          var name = d3.select(this).data()[0].name;
          d3.select('#who').text(name);
      })
      .on('mouseout', function(d, i) {
          d3.select(this)
              .attr('r', sizeForNode(i))
              .style('fill', '#3B5998');
          d3.select('#who').text('N/A');
      })
      .call(force.drag);

  // Hook up some events to D3.js.
  force.on('tick', function() {
      node.attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });

      edge.attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });
  });

  // Start the simulation.
  force.start();
})
.fail(function() {
    alert( "error retrieving data" );
});
