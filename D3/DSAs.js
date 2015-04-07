//Width and height
var w = 1000;
var h = 650;

//array of colors to be used in chloropleth
var colors = d3.scale.category20c();


//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//zoom behavior
var maxZoomIn = 4,
	maxZoomOut = 1;

//define projections
var projection = d3.geo.mercator()
	.center([-93.38987619865907,41.957378893855285])
	.scale([8000])
	.translate([w/2,h/2]);

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

//Create SVG element
var svg = d3.select("#map")
	.append("svg")
	.attr("width", w)
	.attr("height", h);


//create a tool tip that will be invisble at page load
var toolTip = d3.select('#map').append('div')
	.style('position', 'absolute')
	.style('padding', '0 10 px')
	.style('background', 'white')
	.style('opacity', 0)


queue()
	.defer(d3.json, "DSA_data/ZCTAs.topojson")
	.defer(d3.json, "DSA_data/DSA40pct.topojson")
	.await(makeMap);


function makeMap(error,ZCTAs, DSAs){

			//Bind data and create one path per GeoJSON feature

	var ZCTAs = svg.append('g').attr("id","ZCTAs")
			.selectAll("path")
		   	.data(topojson.feature(ZCTAs, ZCTAs.objects.collection).features)//generate features from topoJSON
		   	.enter()
		   	.append("path")
		   	.attr("d", path)
		   	.attr("class","ZCTAs")
		 	.attr("fill", 'gray')
		   	.style("stroke-width","0.5px")
		   	.style("opacity", 0.95);
			//.on('mouseover', function(d){
			//	toolTip.transition()
			//		.style('opacity', 0.9)
			//	toolTip.html(d) //the data of each element created by the html
			//		.style('left',(d3.event.pageX - 20) + 'px') //find x position of mouse pointer
			//		.style('top',(d3.event.pageY - 30) + 'px') //find y position of mouse pointer
			//tempColor = this.style.fill;
			//	d3.select(this)
			//		.transition()
			//		.style('opacity', .5)
			//		.style('fill', 'blue')
			//})
			//.on('mouseout', function(d){
			//	toolTip.transition()
			//		.style('opacity', 0) //make tooltip go away when mouse out
			//	d3.select(this)
			//		.transition()
			//		.style('opacity', 1)
			//		.style('fill', tempColor) //set color back
			//});



		var DSAs = svg.append('g').attr("id","DSAs")
			.selectAll("path")
			.data(topojson.feature(DSAs, DSAs.objects.collection).features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class","DSAs")
			.attr('fill', function(){
		   		//randomly assign colors to DSAs from the color scale
		   		return colors(Math.round(Math.random()*20));
		   	})
			.style("stroke-width", "1.25px")
			.style("opacity", 0.95)
		   //.on("mouseover", function(d) {
				//	d3.select(this)
				//		.attr("fill", "gray");
			//create mouse over event
			.on('mouseover', function(d){
				toolTip.transition()
					.style('opacity', 0.9)
				//store color temporarily

				tempColor = this.style.fill
				d3.select(this)
					.transition()
					.style('opacity', 0.0)
					//.style('fill', 'yellow')

				})
			.on('mouseout', function(d){
				toolTip.transition()
					.style('opacity', 0)
				d3.select(this)
					.transition()
					.style('opacity', 0.95)
					.style('fill', tempColor) //restore original color using tempcolor variable
			});

};
function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  g.select(".ZCTAs").style("stroke-width", 0.5 / d3.event.scale + "px");
  g.select(".DSAs").style("stroke-width", 1.5 / d3.event.scale + "px");
}