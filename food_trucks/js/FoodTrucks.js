//Width and height
var aspect = 1.4;
var width = $("#map").width();
var height = width/ aspect;

//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

var sw = L.LatLng(41.589128, -91.613188),
	ne = L.latLng(41.693552, -91.486115),
	bounds = L.latLngBounds(sw,ne);

//add BaseMap
var map = L.map('map', {center: [41.645,-91.530168],
	bounds: bounds,
  	zoom: 13,
  	reuseTiles: true,
  	trackResize: true})
  	.addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));


//Attach empty SVG to the basemap
var svg = d3.select(map.getPanes().overlayPane).append("svg");

//hide phantom svg on zoom
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

svg.attr('width',width).attr('height',height)

//queue()
//	.defer(d3.json, "data/Employment.topojson")
//	.defer(d3.json, "data/OpArea.topojson")
//	.await(makeMap);
//
function drawEmp(){
	d3.json('data/Employment.topojson', function(error, employment){
		var collection = topojson.feature(employment,employment.objects.collection);
		var transform = d3.geo.transform({point: projectPoint}),
			path = d3.geo.path().projection(transform)

		var employment = g.append('g').attr('id','employment').selectAll("path")
			.data(collection.features)
			.enter()
			.append('path')
			.attr("d", path)
			.attr('fill', function(d){
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
			.style('opacity', 0.5)


		map.on('viewreset', reset);
    	//this will put stuff on the map
    	reset();
	    // Reposition the SVG to cover the features.
	    function reset() {

	        var bounds = path.bounds(collection);

	        var topLeft = bounds[0],
	        bottomRight = bounds[1];

	        svg.attr("width", bottomRight[0] - topLeft[0])
	            .attr("height", bottomRight[1] - topLeft[1])
	            .style("left", topLeft[0] + "px")
	            .style("top", topLeft[1] + "px");

	        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

	        employment.attr("d",path);
	    } // end reset

	    function projectPoint(x,y){
	      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
	      this.stream.point(point.x,point.y);
	    }// end projectPoint function

	});//end d3 callback
};// end drawEmp

function drawOpArea(){
	d3.json('data/OpArea.topojson', function(error, OpArea){

		var collection = topojson.feature(OpArea,OpArea.objects.collection);
		var transform = d3.geo.transform({point: projectPoint}),
			path = d3.geo.path().projection(transform)

		var opArea = g.append('g').attr('id','opArea').selectAll("path")
		   	.data(collection.features)//generate features from topoJSON
		   	.enter()
		   	.append("path")
		   	.attr("d", path)
		   	.attr("class","OpArea")
		   	.style("opacity", 0.80)
		   	.style("fill", "rgb(32,32,32)");

		map.on('viewreset', reset);
    	//this will put stuff on the map
    	reset();
	    // Reposition the SVG to cover the features.
	    function reset() {

	        var bounds = path.bounds(collection);

	        var topLeft = bounds[0],
	        bottomRight = bounds[1];

	        svg.attr("width", bottomRight[0] - topLeft[0])
	            .attr("height", bottomRight[1] - topLeft[1])
	            .style("left", topLeft[0] + "px")
	            .style("top", topLeft[1] + "px");

	        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

	        opArea.attr("d",path);
	    } // end reset

	    function projectPoint(x,y){
	      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
	      this.stream.point(point.x,point.y);
	    }// end projectPoint function
	})//end json callback
}; //end drawOpArea function

$(document).ready(function(){
  drawEmp();
  drawOpArea();
});

	//function drawOpArea(error, opArea){
	//};//end drawOpArea


    //drawEmployment(employment);
    //drawOpArea(opArea);

// end of MakeMap function
////Define path generator
//var path = d3.geo.path()
//	.projection(projection);
//
////Create an SVG and append to #map div
//var svg = d3.select("#map").append("svg")
//    .attr("width", width)
//    .attr("height", height);
//
////Generate paths based on projection
//var path = d3.geo.path().projection(projection);
//
//
////Group for the map features
//var features = svg.append("g")
//    .attr("class","features");
//
////Create zoom/pan listener
//var zoom = d3.behavior.zoom().scaleExtent([1, 4]).on("zoom",zoomed);
//
//svg.call(zoom);
//
////queue data so it loads better
//queue()
//	.defer(d3.json, "data/Employment.topojson")
//	.defer(d3.json, "data/OpArea.topojson")
//	.await(makeMap);
//
////D3 callback for generating the actualy map features and appending them to the features goup
//function makeMap(error, Emp, OpArea){
//	var EmpCollection = topojson.feature(Emp, Emp.objects.collection);
// 	var EmpTransform = d3.geo.transform({point: projectPoint}),
//      path = d3.geo.path().projection(EmpTransform)
//
//    var OpCollection = topojson.feature(OpArea, OpArea.objects.collection);
//    var OpTransform = d3.geo.transform({point: projectPoint}),
//    	path = d3.geo.path().projection(EmpTransform)
//
//	//group variable to zoom behavior works correctly
//	var group = svg.append('g')
//		.attr('id','mapzoom')
//
//	var Emp = group.append('g').attr("id","Emp")
//		.selectAll("path")
//	   	.data(Empcollection.features)//generate features from topoJSON
//	   	.enter()
//	   	.append("path")
//	   	.attr("d", path)
//	   	.attr("class","Emp")
//	 	.attr("fill", function(d){
//	 		if (d.properties.Classes <= 3) {
//	 			color = '#2892C7'
//	 		} else if (d.properties.Classes == 4){
//	 			color = '#A0C29B'
//	 		} else if (d.properties.Classes == 5){
//	 			color = '#FAFA64'
//	 		} else if (d.properties.Classes == 6){
//	 			color = '#FA8D34'
//	 		} else {
//	 			color = '#E81014'
//	 		}
//	 		return color
//	 	})
//	   	.style("stroke-width","0.5px")
//	   	.style("opacity", 0.70);
//
//	var OpArea = group.append('g').attr("id","OpArea")
//		.selectAll("path")
//	   	.data(OpCollection.features)//generate features from topoJSON
//	   	.enter()
//	   	.append("path")
//	   	.attr("d", path)
//	   	.attr("class","OpArea")
//	 	.attr("fill", 'rgb(78,78,78)')
//	   	.style("stroke-width","0.5px")
//	   	.style("opacity", 0.85);
//
//   	//when user zooms, view needs to be reset
//    map.on('viewreset', reset);
//    //this will put stuff on the map
//    reset();
//
//    // Reposition the SVG to cover the features.
//    function reset() {
//
//        var bounds = path.bounds(collection);
//
//
//        var topLeft = bounds[0],
//        bottomRight = bounds[1];
//
//        svg.attr("width", bottomRight[0] - topLeft[0])
//            .attr("height", bottomRight[1] - topLeft[1])
//            .style("left", topLeft[0] + "px")
//            .style("top", topLeft[1] + "px");
//
//        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
//
//        buildings.attr("d",path);
//
//    } // end reset
//
//    function projectPoint(x,y){
//      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
//      this.stream.point(point.x,point.y);
//    }
//};

//Update map on zoom/pan
//function zoomed() {
// d3.select('#mapzoom').attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
//      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
//}