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

  var index, total = 0;
  for (index = 0; index < dataset.length; ++index) {
      total = total + dataset[index];
  }

  for (index = 0; index < dataset.length; ++index) {
      dataset[index] = (dataset[index] / total) * 100;
  }

jQuery(function($) {
 
    var w = 300,                        //width
    h = 250,                            //height
    r = 100,                            //radius
    color = d3.scale.category20c();     //builtin range of colors

    data = [];

    for (index = 0; index < dataset.length; ++index) {
      data.push({"label":dates[index], "value":dataset[index]});
    }
    
    var vis = d3.select(".chart")
        .append("svg:svg")
        .data([data])                   //associate our data with the document
            .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
            .attr("height", h)
        .append("svg:g")                //make a group to hold our pie chart
            .attr("transform", "translate(" + r + "," + r + ")");   //move the center of the pie chart from 0, 0 to radius, radius
 
    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(r)
        .innerRadius(r-50);
 
    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
 
    var arcOver = d3.svg.arc()
        .outerRadius(r + 10)
        .innerRadius(r - 40);

    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            .attr("class", "slice")    //allow us to style things in the slices (like text)
            .on("mouseover", function(d) {
                d3.select(this).select("path").transition()
                   .duration(1000)
                   .attr("d", arcOver);
            })
            .on("mouseout", function(d) {
                d3.select(this).select("path").transition()
                   .duration(1000)
                   .attr("d", arc);
            });
 
        arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
 
        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return data[i].label; });        //get the label from our original data array
}(jQuery));

})
.fail(function() {
    alert( "error retrieving data" );
});
