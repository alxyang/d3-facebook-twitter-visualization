var dateArray = [];
var dateregex = /\w+\s(\w+)\s(\d+)\s\S+\s\S+\s(\d+)/;

$.get( "/twitterd3", function( data ) {
    $.each(data, function( index, value ) {
      var tmpstring = value.time;
      var finaldate = tmpstring.replace(dateregex, function(match, $1, $2, $3){
          return $1 + " " + $2 + " " + $3;
      });
      dateArray.push(finaldate);
  });
}) 
.done(function() {

  //count number of posts on each date by counting occurrences of same date
  var counters = {};
  $.each(dateArray, function(i, date) {
     counters[date] = counters[date] ? counters[date] + 1 : 1;
  });

  var dataset = [];
  var dates = [];
  var obj = {};

  for(var key in counters){
      dataset.push(counters[key]);
      dates.push(key);
      obj[key] = counters[key];
  }

  var sorteddataset = [];

  for(var date in obj) {
    sorteddataset.push([date, obj[date]]);
  }
  sorteddataset.sort(function(a, b) {return a[1] - b[1]})

  var sortedvalues = [];
  var sorteddates = [];

  var x;
  for(x = 0; x < sorteddataset.length; x++) {
    sortedvalues.push(sorteddataset[x][1]);
    sorteddates.push(sorteddataset[x][0]);
  }

  console.log(sortedvalues);
  console.log(sorteddates);

jQuery(function($) {

  var chart;
  var width = 500;
  var bar_height = 20;
  var gap = 2;
  var height = (bar_height + gap) * dates.length;
 
  var x, y;
 
  x = d3.scale.linear()
     .domain([0, d3.max(dataset)])
     .range([0, width]);
  var yRangeBand = bar_height + gap;
  y = function(i) { return yRangeBand * i; };

  var left_width = 100;
 
  chart = d3.select(".chart")
    .append('svg')
    .attr('class', 'chart')
    .attr('width', left_width + width)
    .attr('height', height);
 
  chart.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("x", left_width)
    .attr("y", function(d, i) { return y(i);})
    .attr("width", x)
    .attr("height", bar_height);
 
  chart.selectAll("text.score")
    .data(dataset)
    .enter().append("text")
    .attr("x", function(d) { return x(d) + left_width; })
    .attr("y", function(d, i) { return y(i) + bar_height / 2;})
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', 'score')
    .text(String);
 
  chart.selectAll("text.name")
    .data(dates)
    .enter().append("text")
    .attr("x", left_width / 2)
    .attr("y", function(d, i){ return y(i) +bar_height/2; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "middle")
    .attr('class', 'name')
    .text(String);

d3.select("#sort").on("click", sortBars);
d3.select("#reset").on("click", reset);

function sortBars() {

  chart.selectAll("rect")
    .data([])
    .exit()
    .remove();

  chart.selectAll("text.score")
    .data([])
    .exit()
    .remove();

  chart.selectAll("text.name")
    .data([])
    .exit()
    .remove();

  chart.selectAll("rect")
    .data(sortedvalues)
    .enter().append("rect")
    .attr("x", left_width)
    .attr("y", function(d, i) { return y(i);})
    .attr("width", x)
    .attr("height", bar_height);
 
  chart.selectAll("text.score")
    .data(sortedvalues)
    .enter().append("text")
    .attr("x", function(d) { return x(d) + left_width; })
    .attr("y", function(d, i) { return y(i) + bar_height / 2;})
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', 'score')
    .text(String);
 
  chart.selectAll("text.name")
    .data(sorteddates)
    .enter().append("text")
    .attr("x", left_width / 2)
    .attr("y", function(d, i){ return y(i) +bar_height/2; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "middle")
    .attr('class', 'name')
    .text(String);
};

function reset() {

  chart.selectAll("rect")
    .data([])
    .exit()
    .remove();

  chart.selectAll("text.score")
    .data([])
    .exit()
    .remove();

  chart.selectAll("text.name")
    .data([])
    .exit()
    .remove();

  chart.selectAll("rect")
    .data(dataset)
    .enter().append("rect")
    .attr("x", left_width)
    .attr("y", function(d, i) { return y(i);})
    .attr("width", x)
    .attr("height", bar_height);
 
  chart.selectAll("text.score")
    .data(dataset)
    .enter().append("text")
    .attr("x", function(d) { return x(d) + left_width; })
    .attr("y", function(d, i) { return y(i) + bar_height / 2;})
    .attr("dx", -5)
    .attr("dy", ".36em")
    .attr("text-anchor", "end")
    .attr('class', 'score')
    .text(String);
 
  chart.selectAll("text.name")
    .data(dates)
    .enter().append("text")
    .attr("x", left_width / 2)
    .attr("y", function(d, i){ return y(i) +bar_height/2; } )
    .attr("dy", ".36em")
    .attr("text-anchor", "middle")
    .attr('class', 'name')
    .text(String);
};
 
}(jQuery));

})

.fail(function() {
    alert( "error retrieving data" );
});