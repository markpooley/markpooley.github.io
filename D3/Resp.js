
var data =[{
	job1: [{DataMangagement: 25, MapGeneration:25, SupportServices: 25, Scripting: 25 }],
	job2: [{DataMangagement: 15, MapGeneration:55, Scripting:30}],
	job3: [{Teaching: 65, Grading: 20, Students: 15}]
}]

//
//for (i = 0; i < data.length;i++){
//	console.log(data[i])
//}
width = $(".pie").width()
height = width
rad = height/2

var pies = d3.select('#JobList').selectAll('.pie').append('svg')
	.attr('width',width)
	.attr('height',height)
	.style('background-color',"blue")
	.style('opacity', 0.5)


var circles = pies.selectAll('circle').append('circle')

circles.attr('cx', width/2)
		.attr('cy',height/2)
		.attr('r', height/2)
		.attr('fill',"black");


var types = d3.select("#JobList").selectAll('.job')

//console.log(types)
types.on('click',function(){


	var id = $(this).attr("id")
	id = '#pie-'+ id
	console.log("ID of temp: " + id)
	width = $(id).width()
	height = $(id).height()
	rad = height/2

	var pie = d3.select(id).transition()
		.delay(250)
		.duration(1000)
		.selectAll('circle')
		.append('circle')

	console.log(pie)
});