//Width and height
var w = 1200;
var h = 780;

//array of colors to be used in chloropleth
var colors = d3.scale.category20c();
console.log ('length of color list ' + colors.length)

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
  .scaleExtent([maxZoomOut, maxZoomIn]);
  //.on("zoom", zoomed);

//Define default path generator
var path = d3.geo.path()
	.projection(projection);

//Create SVG element
var svg = d3.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h)
			.call(zoom);

//create a tool tip that will be invisble at page load
var toolTip = d3.select('body').append('div')
	.style('position', 'absolute')
	.style('padding', '0 10 px')
	.style('background', 'white')
	.style('opacity', 0)



//loading in DSA ZCTAs
d3.json("ZCTAs.topojson", function(error,geoData){

		//load in DSAs on top of the ZCTAs
		 d3.json("BaseDSAs.topojson", function(error,DSAs){
			if (error) console.log(error)

			svg.append('g').selectAll("path")
				.data(topojson.feature(DSAs, DSAs.objects.collection).features)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("fill", 'gray')
					.style("opacity", 0.85)
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
						.style('opacity', 1)
						.style('fill', tempColor) //restore original color using tempcolor variable
				})

			});

		if (error) return console.log(error)
			//Bind data and create one path per GeoJSON feature

		svg.append('g').selectAll("path")
		   	.data(topojson.feature(geoData, geoData.objects.collection).features)//generate features from topoJSON
		   	.enter()
		   	.append("path")
		   	.attr("d", path)
		   	.attr('fill', function(){
		   		//randomly assign colors to DSAs from the color scale
		   		return colors(Math.round(Math.random()*20));
		   	})
		   	.style("opacity", 0.85)
		    .on("mouseover", function(d) {
					var xPos = parseFloat(d3.select(this).attr("x"))
					var yPos = parseFloat(d3.select(this).attr("y"))

					d3.select("#tooltip")
						.style("left", xPos + "px")
						.style("top", yPos + "px")
						.select("#value")
						.text(d);

					d3.select("#tooltip").classed("hidden", false);
			})
			.on("mouseout", function(){
				d3.select("#tooltip").classed("hidden", true);
			})
				//		.attr("fill", "gray");
			//create mouse over event




		});
