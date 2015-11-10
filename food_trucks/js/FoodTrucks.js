//Width and height
var aspect = 1.4;
var width = $("#map").width();
var height = width/ aspect;
//var colorScheme = [
//	{type: '#Leg0', selectCol: "rgba(56,56,56,0.95)",transColor: "rgba(56,56,56,0.60)"},
//	{type: '#Leg3', selectCol: "rgba(40,146,199,0.75)",transColor: "rgba(40,146,199,0.60)" },
//	{type: '#Leg4', selectCol: "rgba(160,194,155,0.75)",transColor: "rgba(160,194,155,0.60)"},
//	{type: '#Leg5', selectCol: "rgba(250,250,100,0.75)",transColor: "rgba(250,250,100,0.60)"},
//	{type: '#Leg6', selectCol: "rgba(250,141,52,0.75)",transColor: "rgba(250,141,52,0.60)"},
//	{type: '#Leg7', selectCol: "rgba(232,16,20,0.75)",transColor: "rgba(232,16,20,0.60)"}
//];
var colorScheme = {};
	colorScheme.Leg0 = ["rgba(56,56,56,0.95)","rgba(56,56,56,0.60)"];
	colorScheme.Leg3 = ["rgba(40,146,199,0.80)", "rgba(40,146,199,0.60)"];
	colorScheme.Leg4 = ["rgba(160,194,155,0.80)", "rgba(160,194,155,0.60)"];
	colorScheme.Leg5 = ["rgba(250,250,100,0.80)", "rgba(250,250,100,0.60)"];
	colorScheme.Leg6 = ["rgba(250,141,52,0.80)", "rgba(250,141,52,0.60)"];
	colorScheme.Leg7 = ["rgba(232,16,20,0.80)", "rgba(232,16,20,0.60)"];

//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//add BaseMap
var map = L.map('map', {center: [41.645,-91.530168],
	zoom: 13,
  	reuseTiles: true,
  	trackResize: true})
  	.addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));


//Attach empty SVG to the basemap
var svg = d3.select(map.getPanes().overlayPane).append("svg");

//hide phantom svg on zoom
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

svg.attr('width',width).attr('height',height)

//fill legend
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
			.attr('class', function(d){
				return "empClass" + d.properties.Classes
			})
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


		//add mouseover interactivity
		.on('mouseover',function(d){
			var id = d3.select(this).attr("class");
			d3.select(this).style('opacity', 0.75)
			id = "#Leg" + id.slice(-1)
			colorid = 'Leg' + id.slice(-1)
			d3.select('#legend').select(id).style('background-color',colorScheme[colorid][0])



		})

		.on('mouseout',function(d){
			var id = d3.select(this).attr("class");
			d3.select(this).style('opacity',0.50)
			id = "#Leg" + id.slice(-1)
			colorid = 'Leg' + id.slice(-1)
			d3.select('#legend').select(id).style('background-color',colorScheme[colorid][1])
		});

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
		   	.attr("class","empClass0")
		   	.style("opacity", 0.75)
		   	.style("fill", "rgb(56,56,56)")

    	//interactivity
    	opArea = d3.selectAll('.empClass0')

    	opArea.on('mouseover',function(d){
    		var opacity = d3.select(this).style('opacity',0.95);
    		console.log(opacity)
    		d3.select('#legend').select('#Leg0').style('background-color',colorScheme["Leg0"][0])
    	});
    	opArea.on('mouseover',function(d){
    		d3.select(this).style('opacity',0.75);
    		d3.select('#legend').select('#Leg0').style('background-color',colorScheme["Leg0"][1])
    	});

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

//create legend interactivity
///////////////////////////////////////
var legend = d3.select('#legendBlocks').selectAll('div')
legend.on('mouseover',function(){
	var area = d3.select(this).attr('id')
	tempclass = ".empClass"+area.slice(-1)

	var id = '#' + area;
	d3.select('#legend').select(id).style('background-color',colorScheme[area][0])
		.style('border',1)
		.style('border-color','white')

	//change opacities of the operation/employment areas
	if (tempclass ==='.empClass0'){
		d3.select(tempclass).style('opacity',.95);
	} else {
		d3.select(tempclass).style('opacity',.65);
	}
})
legend.on('mouseout',function(){
	var area = d3.select(this).attr('id')

	var id = '#' + area;
	d3.select('#legend').select(id).style('background-color',colorScheme[area][1])
		.style('border', 'none')

	//change opacities of operation/employment areas
	if(tempclass === '.empClass0'){
		d3.select(tempclass).style('opacity',0.75)
	} else {
	d3.select(tempclass).style('opacity',0.5)
}
})
$(document).ready(function(){
  drawEmp();
  drawOpArea();
});
