//javascript for drawing the progress chart

var start = new Date('2015-06-01'),
	today = new Date();

var getDays = function(start,today){
	time = (today-start)/(24*60*60*1000);
	if (time < 0){
		time = 0;
	}
	return time;
}


//color variables
var colLow = "#FFFF00",
	colHi = "#FF0000";

//get number of days since start
var days = [getDays(start,today)]

//style and layout variables
var margin = {top: 30, right:30, bottom:40, left:50};

var aspect = 0.25,
    width = $("#timeCage").width() - margin.left - margin.right,
    height = (width* aspect) - margin.top - margin.bottom,
    barOffset = 5;

//Creation of SVG that will house the chart
var chart = d3.select("#timeCage").append("svg")
    .attr('width', width + margin.left + margin.right) //margins back in
    .attr('height',height + margin.top + margin.bottom) //margins back in
    	.append("g")
    .attr('transform', 'translate('+margin.left+','+margin.top+')') //move bar chart right and down


//Set the X scale and draw the guid on the bottom
var xScale = d3.scale.linear()
    .domain([0,365 ])
    .range([0,width])

//time scale
var x = d3.scale.ordinal()
	.domain(["0","3 mo","6 mo","9 mo"," 1 yr"])
	.rangePoints([0,width])

//scale arc positions to a color scale
var colorScale = d3.scale.linear().domain([0,365]).range([colLow,colHi])

var hAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')

var hGuide = d3.select('svg').append('g')
    hAxis(hGuide)
    hGuide.attr('transform','translate('+margin.left+ ','+(height + margin.top)+')')
    hGuide.selectAll('path')
        .style({'fill':'none', stroke:"#000"})
    hGuide.selectAll('line')
        .style({stroke: "#000"})

var progTitle = chart.append('text')
	.attr('id','progressStatus')
	.attr('x',width/2)
	.attr('y',0 + (margin.top * .75))
	.text('Time in the Cage : '+ Math.round(days) + ' days')
	.style('text-anchor','middle')
	.style('font-size','22px');


var d = [250];

function draw(d){

    //draw the bars and place them
    chart.selectAll("rect")
    	.data(d)
    	.enter()
        .append('rect')
        .attr("x", 0)
        .attr("y", 0 + margin.top)
        .attr('width', 0)
        .attr("height",(height- margin.bottom))
        .transition()
        	.attr('width',xScale(d[0]))
        	.attr("fill",function(d){return colorScale(d)})
        	.delay(2500)
        	.duration(2500)
        	.ease('linear')
        //add mouseover interactivity

};
//draw chart
$(document).ready(draw(days));