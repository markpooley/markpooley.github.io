//dimensions
var aspect = .75;
var width = $("#cageGauge").width();
var height = width * aspect
var arcOuterRadius = width / 2,
	arcInnerRadius =  arcOuterRadius *.55;

//color variables for the arc gauges
var colLow = "#FFFF00",
	colHi = "#FF0000";

//Gauge arc dimension determination generation
var textX = $('#arc').width()/ 2
var textY = $('#cageGauge').height()

//set up variables for drawing cage Gague
var start = 0 - Math.PI/2; //Starting point of arc gauge
var p = Math.PI/2; //ending point of arc on gauge
var intervals = [0,20,40,60,80,100]; //intervals for Cage Guage animation
var watched = 0, //count of watched
	total = 0; //total count of entries
var font = 'Lato';

///variables for determining time spent in the cage
var yrstart = new Date('2015-06-01'),
	today = new Date();

//get number of days in the cage
var getDays = function(start,today){
	time = (today-start)/(24*60*60*1000);
	if (time < 0){
		time = 0;
	}
	if (time > 365){
		time = 365;
	}
	return time;
}
//get number of days since start
var days = [getDays(yrstart,today)]


//create the SVGS immediately
var killSVG = d3.select('#cageKills').append('svg')
	.attr('width', width)
	.attr('height',height)
	.attr('id','cageKills')

killSVG.append('text')
	.text('Cage')
	//.attr('class', 'svgText')
	.attr('opacity', 0.30)
	.attr('x',width / 2)
	.attr('y',height*.65)
	.style('text-anchor','middle')
killSVG.append('text')
	.text('Kills')
	//.attr('class', 'svgText')
	.attr('opacity', 0.30)
	.attr('x',width / 2)
	.attr('y',height * .95 )
	.style('text-anchor','middle')

//create freak svg
var freakSVG = 	d3.select('#cageFreakouts').append('svg')
	.attr('width',width)
	.attr('height',height)
	.attr('id','cageFreaks')

freakSVG.append('text')
	.text('Cage')
	//.attr('class', 'svgText')
	.attr('opacity', 0.30)
	.attr('x',width / 2)
	.attr('y',height*.65)
	.style('text-anchor','middle')
freakSVG.append('text')
	.text('Freakouts')
	//.attr('class', 'svgText')
	.attr('opacity', 0.30)
	.attr('x',width / 2)
	.attr('y',height * .95 )
	.style('text-anchor','middle')


//get number of elements watched and unwatched
var unwatched = d3.selectAll('.unwatched')[0].length
var watched = d3.selectAll('.watched')[0].length

//calculate the pct done
var pctDone = function(watched,unwatched){
	total = watched + unwatched;
	if (watched == 0){
		done = 0
	} else {
		done = watched/total * 100
	}
	return done
}
pctWatched = pctDone(watched,unwatched)

//set up the arcs for the gauges
var arc = d3.svg.arc()
	.innerRadius(arcInnerRadius)
	.outerRadius(arcOuterRadius)
	.startAngle(start);

//color scales and linear scaling of percent to radians for arc drawing
//on time and cage gauge
var arcScale = d3.scale.linear().domain([0,100]).range([0-Math.PI/2,Math.PI/2]);

//scale arc positions to a color scale
var colorScale = d3.scale.linear().domain([start,p]).range([colLow,colHi])

//scale status intervals to the range of possible input values
var statusScale = d3.scale.quantize()
	.domain([0,100])
	.range(['The bunny is in the box','Lowrider, Donny',"Finding some friggin' rockets!","I'm a vampire!","Not The Bees!","'Deadfall' freaking out scene"])

//
// Creation of svg, background and foreground arcs for the Cage Gauge.
var svg = d3.select("#cageGauge").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('id','gaugeSVG')
    .append('g')
    	.attr("transform", "translate(" + width / 2 + "," + height *.90 + ")");
svg.append('text')
	.attr('x', 0 )
	.attr('y',-height *.75)
	//.attr('class','svgText')
	.attr('text-anchor','middle')
	.text('The Cage Gauge')
$('#cageGauge').css('font-size',height*.15 + 'px').css('font-weight','bold')

//Add popover/interactive Tooltip when Cage Guage is moused over
//
var gaugeTipWidth = $('#gaugeTip').width();
d3.select('#gaugeTip').style('top',(height*.15) + 'px').style('left',(width - gaugeTipWidth)/2 + 'px')
d3.select('#cageGauge').on('mouseover',function(){
	svg.selectAll('path').style('opacity',0.5)
	d3.select('#gaugeTip').classed('hidden',false)
})
d3.select('#cageGauge').on('mouseout',function(){
	svg.selectAll('path').style('opacity',1)
	d3.select('#gaugeTip').classed('hidden',true)
})
//status label for Cage Gauge
var statusLabel = svg.append('text').attr('id','statusLabel')
	.attr('x', 0)
	.attr('y',0)
	.style('text-anchor','middle')
	.style('font-size','40px')

//background creation for cague guage
var background = svg.append('path')
    .datum({endAngle:(Math.PI/2)})
    .style('fill','#ddd')
    .attr('d',arc)
    .attr('id','arc')
    .attr('x',width/2);

//foreground for cage gauge
var foreground = svg.append('path')
	.datum({endAngle: start})
	.style('fill',function(d){
		return colorScale(d.endAngle);
	})
	.style('opacity', 1.0)
	.attr('arc',arc)

//current status label that will be updated on the cage gauge
var text = svg.append('text').attr('id','status')


//creation svg, background and foreground for the time gauge
// Add SVG to time gauge
var timeSVG = d3.select('#timeCage').append('svg')
	.attr("width",width)
	.attr('height',height)
	.attr('id','timeGauge')
	.append('g')
		.attr("transform", "translate(" + width / 2 + "," + height*.90 + ")")

timeSVG.append('text')
	.attr('x', 0 )
	.attr('y',-height *.75)
	//.attr('class','svgText')
	.attr('text-anchor','middle')
	.text('Days in the Cage')
$('#timeCage').css('font-size',height*.15 + 'px').css('font-weight','bold')
//add background to time svg

var timeBackground = timeSVG.append('path')
	.datum({endAngle:(Math.PI/2)})
	.style('fill','#ddd')
	.attr('d',arc)
	.attr('id','timeArc')
	.attr('x',width/2);

//foreground for time gauge
var timeForeground = timeSVG.append('path')
	.datum({endAngle: start})
	.style('fill',function(d){
		return colorScale(d.endAngle);
	})
	.style('opacity',1)
	.attr('arc',arc)

//great svg text element for time gauge
var daysText = timeSVG.append('text').attr('id','daysLabel')
	.attr('x',0)
	.attr('y',0)
	.style('text-anchor','middle')
	.style('font-size','40px')

//select the SVG text elements and add Zeros to all of them intially
//
//days label
d3.select('#daysLabel')
	.attr('x',textX)
	.attr('y', 0)
	.text(0)
	.attr('text-anchor', 'middle')
$('#daysLabel').css('font-size',height*.25 + 'px').css('font-weight','bold').css('font-family','Helvetica')

//status label
d3.select('#statusLabel')
	.transition()
	.attr('x',textX)
	.attr('y',0)
	.text(0)
	.attr('text-anchor', 'middle')
$('#statusLabel').css('font-size',height*.25 + 'px').css('font-weight','bold').css('font-family','Helvetica')

//
//Add Time in the Cage mouseover interactivity
var timeTipWidth = $('#timeTip').width();
d3.select('#timeTip').style('top',(height*.15) + 'px').style('left',(width - timeTipWidth)/2 + 'px')

d3.select('#timeCage').on('mouseover',function(){
	d3.select('#timeCage').selectAll('path').style('opacity',0.5)
	d3.select('#timeTip').classed('hidden',false)
})
d3.select('#timeCage').on('mouseout',function(){
	d3.select('#timeCage').selectAll('path').style('opacity',1)
	d3.select('#timeTip').classed('hidden',true)
})


//add Zero to Kills SVG text element
killSVG.append('text')
	.text(0)
	.attr('id','kills')
	.attr('x',width / 2)
	.attr('y',height*.30)
	.style('text-anchor','middle')

//scale the svg text to fit the container
$('#kills').css('font-size',(height/3.5) + 'px').css('font-weight','heavy')
$('#cageKills').css('font-size',(height/3.5) + 'px').css('font-weight','bold')

//add zero to the freaks SVG
freakSVG.append('text')
	.text(0)
	.attr('id','freaks')
	.attr('x',width / 2)
	.attr('y',height*.30)
	.style('text-anchor','middle')

//scale the svg text to fit the container
$('#freaks').css('font-size',(height/3.5) + 'px').css('font-weight','bold')
$('#cageFreakouts').css('font-size',(height/3.5) + 'px').css('font-weight','bold')

//pull data from csv for aggregate freakouts and cage kills
//append data to counters and use tween function to count up
//from zero to current aggregate draw the arcs for the days in the cage
//and cage gauge all in one callback.

function drawViz(){
	d3.csv('Data/CageData.csv', function(data){
	dataset = data;
	cageArray = []
	var kills = 0,
		freaks = 0;
	data.forEach(function(d){
		kills = kills + parseInt(+d.Kills)
		freaks = freaks + parseInt(+d.Freakouts)
		cageArray.push({
			Title: d.Title,
			Kills: d.Kills,
			Freaks: d.Freakouts
		})
	})

	//draw the number days spent in the cage
	var pctDays = days/365 *100;
	timeForeground.transition()
		.delay(500)
		.duration(3000)
		.ease('linear')
		.call(arcTween,arcScale(pctDays))
	.style('fill',function(){
		return colorScale(arcScale(pctDays));
	})

	//tweentext/animate the Days in the Cage text
	d3.select('#daysLabel').transition()
			.delay(500)
			.duration(3000)
			.tween('text',tweenText(days));


	//draw Cage Gauge, which is the pct of movies watched
	var delay = 3500; //delay the the bottom counters

	foreground.transition()
		.delay(500)
		.duration(3000)//250*pctWatched)
		.ease('linear')
		.call(arcTween,arcScale(pctWatched))
	.style('fill',function(){
		return colorScale(arcScale(pctWatched));
	})

	//tweentext/transition the Cage Gauge numbers
	d3.select('#statusLabel').transition()
			.delay(500)
			.duration(3000)
			.tween('text',tweenText(pctWatched));


	//animate counter for kills
	killSVG.select('#kills').transition()
			.delay(delay)
			.duration(3000)
			.tween('text',tweenText(kills));

	//animate counter for freakouts
	freakSVG.select('#freaks').transition()
			.delay(delay)
			.duration(3000)
			.tween('text',tweenText(freaks));

	//edit avg kills number in tooltip
	var avgKills = kills/watched;
	//d3.select('#tipkills').text(d3.round(avgKills,1))

	//edit the frakouts number in tooltip
	var avgFreaks = freaks/watched;
	//d3.select('#tipFreaks').text(d3.round(avgFreaks,1))

	//function for animating the counting of numbers
	function tweenText(newVal){
		return function(){
			var currentVal =+ this.textContent;
			var i = d3.interpolateRound(currentVal, newVal);

			return function(t){
				this.textContent = i(t);
			};
		};
	};

	//function to draw new arcs from the the previous one
	function arcTween(transition, newAngle) {
	transition.attrTween('d',function(d){
		var interpolate = d3.interpolate(d.endAngle, newAngle);
		return function(t) {
			d.endAngle = interpolate(t);
			return arc(d)
		};
	});
};
	var killTipWidth = $('#killTip').width();
	var killWidth = $('#cageKills').width();
	d3.select('#killTip').style('top',(height*.15) + 'px').style('left',(killWidth - killTipWidth)/2 + 'px')

	d3.select('#cageKills').on('mouseover',function(){
		avgKills = d3.round(avgKills,2)
		d3.select('#tipkills').transition()
			.delay(100)
			.duration(500)
			.tween('text',tweenText(avgKills))
		d3.select('#killTip').classed('hidden',false)
	})

	d3.select('#cageKills').on('mouseout',function(){
		d3.select('#tipKills').transition().text('0')
		d3.select('#killTip').classed('hidden',true)
	})
	var freakTipWidth = $('#freakTip').width();
	var freakWidth = $('#cageFreakouts').width();

	//freakout tooltip mouseover interactivity
	d3.select('#freakTip').style('top',(height*.15) + 'px').style('left',(freakWidth - freakTipWidth)/2 + 'px')
	d3.select('#cageFreakouts').on('mouseover',function(){
		d3.select('#tipFreaks').transition()
			.delay(100)
			.duration(500)
			.tween('text',tweenText(avgFreaks))
		d3.select('#freakTip').classed('hidden',false)
	})
	d3.select('#cageFreakouts').on('mouseout',function(){
		d3.select('#freakTip').classed('hidden',true)
	})
	//Change the overflow once the visulization has run
	$('body').css('overflow','auto')
}); //end of d3 callback
};//end drawViz function

//wait until the page has fully loaded to run the drawViz function
//this prevents jumpiness/jerky visualizations.
$(window).load(function(){
	drawViz();

})

//event listener to activate viz generations on the modal divs
//$(document).ready(function(){
//	$("#posters").click(function(event){
//		 id = event.target.title;
//		 split = id.indexOf('(') - 1
//		 title = id.slice(0,split)
//		 console.log(title)
//
//
//	});
//});

//draw gauges
