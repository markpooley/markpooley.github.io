//Width and height
var width = 800;
var height = 650;

//array of colors to be used in chloropleth
var colors = d3.scale.category20c();


//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//zoom behavior
var maxZoomIn = 6,
	maxZoomOut = 1;

//Map projection
var projection = d3.geo.mercator()
    .scale(297838.7704891906)
    .center([-91.53614830925925,41.65676282716673]) //projection center
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
var toolTip = d3.select('#map').append('div')
	.style('position','absolute') //setting up of styling of tooltip
	.style('padding','0 10px')
	.style('background', 'white')
	.style('opacity', 0) //set opacity to zero so it doesn't show up on initial loading

//Create an SVG and append to #map div
var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

//Generate paths based on projection
var path = d3.geo.path().projection(projection);


//Group for the map features
var features = svg.append("g")
    .attr("class","features");

//Create choropleth scale
var color = d3.scale.quantize()
    .domain([2,7])
    .range(d3.range(6).map(function(i) { return "q" + i + "-6"; }));

//Create zoom/pan listener
var zoom = d3.behavior.zoom().scaleExtent([1, 4]).on("zoom",zoomed);

svg.call(zoom);

queue()
	.defer(d3.json, "FoodTrucks_data/Employment.topojson")
	.defer(d3.json, "FoodTrucks_data/OpArea.topojson")
	.await(makeMap);

function makeMap(error, Emp, OpArea){
	var group = svg.append('g')
		.attr('id','mapzoom')

	var Emp = group.append('g').attr("id","Emp")
		.selectAll("path")
	   	.data(topojson.feature(Emp, Emp.objects.collection).features)//generate features from topoJSON
	   	.enter()
	   	.append("path")
	   	.attr("d", path)
	   	.attr("class","Emp")
	 	.attr("fill", function(d){
	 		if (d.properties.Classes <= 3) {
	 			color = '#2892C7'
	 		} else if (d.properties.Classes == 4){
	 			color = '#A0C29B'
	 		} else if (d.properties.Classes == 5){
	 			color = '#FAFA64'
	 		} else if (d.properties.Classes == 6){
	 			color = '#FA8D34'
	 		} else {
	 			color = '#E81014'
	 		}
	 		return color
	 	})
	   	.style("stroke-width","0.5px")
	   	.style("opacity", 0.70);

	var OpArea = group.append('g').attr("id","OpArea")
		.selectAll("path")
	   	.data(topojson.feature(OpArea, OpArea.objects.collection).features)//generate features from topoJSON
	   	.enter()
	   	.append("path")
	   	.attr("d", path)
	   	.attr("class","OpArea")
	 	.attr("fill", 'rgb(78,78,78)')
	   	.style("stroke-width","0.5px")
	   	.style("opacity", 0.85);


};

function clicked(d,i) {
}

//Update map on zoom/pan
function zoomed() {
 d3.select('#mapzoom').attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
}