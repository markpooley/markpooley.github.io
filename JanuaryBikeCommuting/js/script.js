//Width and height
var aspect = 2.5;
var width = $("#map").width();
var height = width/ aspect;
var infoWidth = $('#infoPane').width()*.25;

var margin = {
	top: 20,
	left: 35,
	bottom: 20,
	right: 50
}

//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//add BaseMap
var map = L.map('map', {center: [41.6480,-91.530168],
	zoom: 14,
  	reuseTiles: true,
  	trackResize: true})
  	.addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));

var infoLoc = width - (width*.20)



//Attach empty SVG to the basemap
var svg = d3.select(map.getPanes().overlayPane).append("svg");
svg.attr('width',width).attr('height',height)

//hide phantom svg on zoom
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

var infoLeft = width - (width*.25);
var graphHeight = height*.25;
var infoHeight = height*.75
var infoLeft = width - infoWidth;
var graphW = width - margin.left - margin.right;
var graphH = graphHeight - margin.top - margin.bottom;

//d3.select('#infoPane').append('svg')
//	.attr('width',infoWidth)
//	.attr('height',infoHeight)
//	.attr('transform','translate('+infoLeft+',0)')

//place graph svg
var graph = d3.select('#graph').append('svg')
	.attr('width', width)
	.attr('height',graphHeight)

graph = graph.append('g')
	.attr('transform','translate('+margin.left+','+margin.top+')')



var infoPane = d3.select('#infoPane').append('svg')
	.append('g')
		.attr('width',infoWidth)
		.attr('height',height)

var dateTime = d3.time.format('%Y-%m-%d %H:%M:%S')
var timeISO = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ")
var format = d3.time.format('%a, %b %d')
var timeFormat = d3.time.format('%I:%M ')
//var tempTime = d3.time.hour('15:32')

var hr = '15:32:00'
hr = d3.time.format('%I:%M:%L').parse(hr)
var hrFormat = d3.time.format('%I:%M %p')
hr = hrFormat(hr)

console.log(hr)
Start = ('2014-01-09T15:22:00.000Z')
projectStart = timeISO.parse(Start)
var hour = d3.time.format('%I:%M %p').parse('15:32')
console.log(projectStart,hour)

function drawData(){
	d3.json('data/JanuaryTrips.topojson', function(error, trips){
		var collection = topojson.feature(trips,trips.objects.collection);
		var transform = d3.geo.transform({point: projectPoint}),
			path = d3.geo.path().projection(transform)

		var min = d3.min(collection.features,function(d){
			return d.properties.Length
		})

		var max = d3.max(collection.features, function(d){
			return d.properties.Length
		})

		var mileTotal = d3.round(d3.sum(collection.features,function(d){ return d.properties.Length}),2)
		d3.selectAll('#Distance').text('Distance (Miles): ' + mileTotal)
		d3.selectAll('#tripCount').text('Trips: '+ collection.features.length)

		var colorScale = d3.scale.linear()
			.domain([min,max])
			.range(["#2892C7",'#A0C29B','#FAFA64',"#FF0000"])

		//sort the trips by date andd time
		function sortTrips(a,b){
			console.log()
			return new Date(a.properties.DateTime) - new Date(b.properties.DateTime)
		}
		data = collection.features
		data = data.sort(sortTrips)
		console.log(data[0],data[137])
		//update infoPane data
		d3.select('#totalDist').text(d3.round(mileTotal,2))
		d3.select('#totalTrips').text(data.length)
		var day1 = new Date(data[0].properties.Name)
		var day30 = new Date(data[data.length-1].Name)

		//xScale.domain([day1, day30])
		//	.ticks(d3.time.days,1)
		//	.tickFormat(d3.time.format('%a'))
//
		//graph.select('.xAxis')
		//	.call(xAxis)

		//**************************************
		//setup graph scales and axes.
		//**************************************
		var begin = timeISO.parse(data[0].properties.Name)
		var end = timeISO.parse(data[data.length - 1].properties.Name)
		//var end = d3.time.day.offset(timeISO.parse(data[data.length - 1].properties.Name),-2)
		var utcRange = d3.time.day.range(begin,end)
		console.log(utcRange)
		console.log(begin,end)

		var xScale = d3.time.scale.utc()
			.domain([begin,end])
			.range([0,graphW])
			.nice()


		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient('bottom')
			.ticks(d3.time.days.utc)
			.tickFormat(d3.time.format('%a'))
			.tickSize(5)

			//.ticks(16)
			.tickPadding(5)
		//var xTimeAxis = d3.svg.axis()
		//	.scale(xScale)
		//	.orient('bottom')
		//	.ticks(d3.time.hours,4)
		//	.tickFormat(d3.time.format('%I:%M %p'))
		//	.ticks(15)

		var yScale = d3.scale.linear()
			.domain([0,12])
			.range([graphH,0])

		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left')
			.ticks(4)

		graph.append('g')
			.attr('class','axis')
			.attr('transform','translate(0,'+ graphH +')')
			.call(xAxis)
				.style('fill','white')
				//.style('stroke','white')
				//.style('stroke-width','1.0px')
			//.call(xTimeAxis)

		graph.append('g')
			.attr('class','axis')
			.call(yAxis)
				.style('fill','white')
				//.style('stroke','white')
				//.style('stroke-width','1.0px')
		graph.append('text')
			.attr('text-anchor','middle')
			.attr('transform','translate('+(-margin.left/1.5)+','+(graphH/2)+')rotate(-90)')
			.style('fill','white')
			.text('Miles')
		graph.append('text')
			.attr('text-anchor','middle')
			.attr('transform','translate('+(graphW/2)+','+margin.top+')')
			.style('fill','white')
			.style('font-size','1.5em')
			.text('Hover over trips on the map or bars on the chart for specific trip information')

		//Add trips to the map
		var trips = g.append('g').attr('id','trip').selectAll("path")
			.data(data)
			.enter()
			.append('path')
			.attr("d", path)
			.attr('fill', 'none')
			.attr('id',function(d,i){
				return 'tripRoute' + (i+1)
			})
			.style('opacity', 0.5)
			.style('stroke-width', 2)
			.style('stroke','#2892C7')


		//Draw bars on the bar graph
		var bars = graph.selectAll('rect')
			.data(data)
			.enter()
			.append('rect')
			.attr('id',function(d,i){
				return 'Trip'+ (i+1)
			})
			.attr('x',function(d){
				return xScale(timeISO.parse(d.properties.Name))
			})
			.attr('y',function(d){
				return yScale(d.properties.Length)
			})
			.attr('height',function(d){
				return graphH - yScale(d.properties.Length)
			})
			.attr('width',10)
			.style('fill','#2892C7')
			.style('opacity',0.90)

		//bar interactivity
		bars.on('mouseover',function(d,i){
			var length = d3.round(d.properties.Length,2);
			var date = new Date(d.properties.DateTime.split(' ')[0]);
			var startTime = d.properties.DateTime.split(' ')[1];

			var date = format(date);
			var tripNo = i+1;
			var time = d3.time.format('%I:%M').parse(startTime)
			time = hrFormat(time)

			d3.select(this)
				.style('fill','#FA8D34')
			var tripRoute = '#tripRoute'+(i+1)
			d3.select(tripRoute)
				.style('opacity',1)
				.style('stroke','#FA8D34')
				.style('stroke-width',7)
			d3.select('#tripTime').text(time)
			d3.select('#tripNo').text(tripNo)
			d3.select('#tripDist').text(length)
			d3.select('#tripDate').text(date)
		})

		bars.on('mouseout',function(d,i){
			d3.select(this)
				.style('fill','#2892C7')
						var tripRoute = '#tripRoute'+(i+1)
			d3.select(tripRoute)
				.style('opacity',0.50)
				.style('stroke','#2892C7')
				.style('stroke-width',2)
			d3.select('#tripTime').text('00:00')
			d3.select('#TripNo').text(0)
			d3.select('#tripDist').text('00.00')
			d3.select('#tripDate').text('Jan 9, 2014 - Feb, 9 2014')
		})

		//Trip Animation
		d3.select('#play').on('click',function(d,i){
			trips.style('opacity',0)
			bars.style('opacity',0)

			//bar updating with animation
			bars.transition().ease('linear').duration(300).delay(function(d,i){
				return (i+1) * 500
			})
				.style('opacity',1)
				.style('fill','#FA8D34')
			.transition().ease('linear').duration(50).delay(function(d,i){
				return (i+1) * 500 + 350
			})
				.style('opacity', 0.9)
				.style('fill','#2892C7')

			trips.transition().ease('linear').duration(300).delay(function(d){
				index = data.indexOf(data[d.properties.OBJECTID])
				return index * 500
			})
				.style('opacity',1)
				.style('stroke','#FA8D34')
				.style('stroke-width', 7)
			.transition().ease('linear').duration(50).delay(function(d){
				return data.indexOf(data[d.properties.OBJECTID]) * 500 + 350
			})
				.style('opacity', 0.5)
				.style('stroke-width', 2)
				.style('stroke','#2892C7')
				//d3.select('#Date').text('Date: ' + d.properties.DateTime.split(' ')[0])

			//update trip infoPane with the animation
			for(i = 0; i < data.length; i++){

				var delay = (i+1) * 500 + 300;
				var duration = 50;
				var date = new Date(d[i].properties.DateTime.split(' ')[0]);
				var startTime = d.properties.DateTime.split(' ')[1];
				startTime = d3.time.format('%I:%M').parse(startTime);
				startTime = hrFormat(startTime)
				date = format(date)
				d3.selectAll('#tripDate')
					.transition()
					.duration(duration)
					.delay(delay)
					.text(date)
				d3.selectAll('#tripTime')
					.transition()
					.duration(duration)
					.delay(delay)
					.text(startTime)
				d3.selectAll('#tripDist')
					.transition()
					.duration(duration)
					.delay(delay)
					.text(d3.round(data[i].properties.Length,2))
				d3.selectAll('#tripNo')
					.transition()
					.duration(duration)
					.delay(delay)
					.text( (i+1) + ' of ' + data.length)
				}

		})//end animate/transition button

		//trip interactivity
		trips.on('mouseover',function(d,i){

			d3.select(this)
				.style('stroke-width',7)
				.style('opacity',1)
				.style('stroke','#FA8D34')
			var time = d.properties.DateTime.split(' ')[1];
			var startTime = d3.time.format('%I:%M').parse(time);
			startTime = hrFormat(startTime)

			var date = new Date(d.properties.DateTime.split(' ')[0])
			date = format(date)

			var tripNum = data.indexOf(data[d.properties.OBJECTID]);

			d3.select('#tripNo').text(tripNum)
			d3.selectAll('#tripTime').text(startTime)

			var datInfo = d3.selectAll('#tripDate').text(date)
			var length = d3.round(d.properties.Length,2)
			d3.selectAll('#tripDist').text(length)
			trip = '#Trip' + (i+1)
			d3.select(trip).style('fill','#FA8D34').style('opacity',1)
		})
		trips.on('mouseout',function(d,i){
			d3.select(this)
				.style('stroke-width',1.75)
				.style('opacity',0.5)
				.style('stroke',function(d){
					return '#2892C7'
				})
			var datInfo = d3.selectAll('#tripDate').text(" Jan 9, 2014 - Feb 9, 2014")
			d3.select('#tripTime').text('00:00')
			d3.select('#tripDist').text('00.00')
			d3.select('#tripNo').text('0')
			//d3.select('#tripCount').text('Trip #: ' + data.length)
			trip = '#Trip' + (i+1)
			d3.select(trip).style('fill','#2892C7').style('opacity',.90)

		})

		//map zoom/rest functionality
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

	        trips.attr("d",path);
	    } // end reset

	    function projectPoint(x,y){
	      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
	      this.stream.point(point.x,point.y);
	    }// end projectPoint function

	});//end d3 callback
};// end drawEmp




$(document).ready(function(){
  drawData();

});
