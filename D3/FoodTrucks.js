//Width and height
var width = 800;
var height = 650;

//array of colors to be used in chloropleth
var colors = d3.scale.category20c();


//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//zoom behavior
var maxZoomIn = 4,
	maxZoomOut = 1;

//Map projection
var projection = d3.geo.mercator()
    .scale(99508.0166324613)
    .center([-91.62715340944857,41.674729206640485]) //projection center
    .translate([width/2,height/2]) //translate to center the map in view

//zoom behavior
var zoom = d3.behavior.zoom()
  .translate(projection.translate())
  .scale(projection)
  .scaleExtent([maxZoomOut, maxZoomIn])
  .on("zoom", zoomed);


//Define default path generator
var path = d3.geo.path()
	.projection(projection);


//tooltip
var toolTip = d3.select('body').append('div')
	.style('position','absolute') //setting up of styling of tooltip
	.style('padding','0 10px')
	.style('background', 'white')
	.style('opacity', 0) //set opacity to zero so it doesn't show up on initial loading

//Create an SVG
var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

//Generate paths based on projection
var path = d3.geo.path()
    .projection(projection);


//Group for the map features
var features = svg.append("g")
    .attr("class","features");

//Create zoom/pan listener
//Change [1,Infinity] to adjust the min/max zoom scale
var zoom = d3.behavior.zoom()
    .scaleExtent([1, Infinity])
    .on("zoom",zoomed);

svg.call(zoom);

d3.json("FoodTrucks_data/ProhibitedArea.geojson",function(error,geodata) {
  if (error) return console.log(error); //unknown error, check the console

  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(geodata.features)
    .enter()
    .append("path")
    .attr("d",path)
    .on("click",clicked);

});

// Add optional onClick events for features here
// d.properties contains the attributes (e.g. d.properties.name, d.properties.population)
function clicked(d,i) {

}

//Update map on zoom/pan
function zoomed() {
  features.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
}
