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

  for(var key in counters){
      dataset.push(counters[key]);
      dates.push(key);
  }
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

  /* step 4 */
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
 
 
}(jQuery));

})
.fail(function() {
    alert( "error retrieving data" );
});