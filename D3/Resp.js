
var data =[{
	Job1: [{DataMangagement: 25, MapGeneration:25, SupportServices: 25, Scripting: 25 }],
	Job2: [{DataMangagement: 15, MapGeneration:55, Scripting:30}],
	Job3: [{Teaching: 65, Grading: 20, Students: 15}]
}]

for (i = 0; i < data.length;i++){
	console.log(data[i])
}

types = d3.select("#JobList").selectAll(".job").selectAll(".pie");
console.log(types)
types.on('click',function(){
	var temp = $(this).attr("id")
	console.log(temp)

})