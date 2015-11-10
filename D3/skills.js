//data variables
var allData = [
    {Type:"Script", Color:"#00648C", Value: "Python", Level: 6.5},
    {Type:"Script", Color:"#00648C", Value: "HTML", Level: 5.5},
    {Type:"Script", Color:"#00648C", Value: "CSS", Level: 5},
    {Type:"Script", Color:"#00648C", Value: "JavaScript", Level: 4.5},
    {Type:"Script", Color:"#00648C", Value: "Data Driven Documents (D3)", Level: 5},
    {Type:"Script", Color:"#00648C", Value: "Foundation", Level: 5},
    {Type:"Script", Color:"#00648C", Value: "JQuery",Level: 3.5},
    {Type:"Software", Color: "#003A4D", Value: "ArcGIS", Level: 8},
    {Type:"Software", Color: "#003A4D", Value: "MS Office", Level: 8},
    {Type:"Software", Color: "#003A4D", Value: "Adobe InDesign", Level: 5},
    {Type:"Software", Color: "#003A4D", Value: "Adobe Photoshop", Level: 5},
    {Type:"Software", Color: "#003A4D", Value: "SPSS", Level:3},
    {Type:"Software", Color: "#003A4D", Value: "STELLA", Level:3},
    {Type:"Software", Color: "#003A4D", Value: "Git Version/GitHub", Level: 6},
    {Type:"Software", Color: "#003A4D", Value: "MapBox/TileMill", Level: 3},
    {Type:"Software", Color: "#003A4D", Value: "SketchUp", Level: 2},
    {Type:"Misc", Color: "#003040", Value:"WoodWorking", Level: 6},
    {Type:"Misc", Color: "#003040", Value:"Construction", Level: 7},
    {Type:"Misc", Color: "#003040", Value:"Landscaping", Level: 5.5},
    {Type:"Misc", Color: "#003040", Value:"Welding (Tig)", Level: 3},
    {Type:"Misc", Color: "#003040", Value:"Electrical (Residential)", Level: 6},
    {Type:"Misc", Color: "#003040", Value:"Bicycle Maintainence/Repair", Level: 8}
];
//Data to start with
currentType = "Script"
currentData = []

//pull current data for initial load
for (i = 0; i < allData.length; i++){
   if (allData[i].Type == currentType){
       currentData.push(allData[i]);
   }
}

//style and layout variables
var margin = {top: 30, right:30, bottom:40, left:50}

var aspect = 1.8,
    width = $("#Viz").width() - margin.left - margin.right,
    height = width/aspect - margin.top - margin.bottom,
    barOffset = 5,
    barHeight = height/currentData.length - (barOffset * currentData.length);

//Creation of SVG that will house the chart
var chart = d3.select("#Viz").append("svg")
    .attr('width', width + margin.left + margin.right) //margins back in
    .attr('height',height + margin.top + margin.bottom) //margins back in
    .append("g")
    .attr('transform', 'translate('+margin.left+','+margin.top+')') //move bar chart right and down

//set up tooltip
//var tooltip = d3.select("#Viz").append("div").attr('id',"tooltip")
//    .style('position','absolute') //allows to follow in relationship to page
//    .style('padding', '0 10px')
//    .style('background', 'white')
//    .style('opacity',0)
//
//Set the X scale and draw the guid on the bottom
var xScale = d3.scale.linear()
    .domain([0,10 ])
    .range([0,width])

var x = d3.scale.ordinal()
    .domain(["","Beginner","Familiar","Proficient","Expert","Master"])
    .rangePoints([0,width])

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

function draw(type){
    // empty data variable that will be filled
    var data = []

    //pull all or subset of data to draw bars
    if (type == 'all'){
        data = allData;
    } else{
        for (i = 0; i < allData.length; i++){
           if (allData[i].Type == type){
               data.push(allData[i]);
            }
        }
    }

    //define yScale for text and bar palcement
    //which is dependent on the number of elemetns in
    //the data array
    var yScale = d3.scale.ordinal()
        .domain(d3.range(0,data.length))
        .rangeBands([0,height], 0.1)

    //draw the bars and place them
    chart.selectAll("rect")
        .data(data)
        .enter()
        .append('rect')
        .attr("x", 0)
        .attr("y", function(d,i){
            return yScale(i);
        })
        .attr('width', 0)
        .attr("height",yScale.rangeBand)
        .attr("fill",function(d){
            return d.Color;
        })

        //add mouseover interactivity
        .on('mouseover',function(){
            d3.select(this)
                .transition()
                .style('opacity', 0.5)
        })
        .on('mouseout',function(){
            d3.select(this)
                .transition()
                .style('opacity', 1);
        })

        //add transition
        .transition()
            .attr("width",function(d){
                return xScale(d.Level);
            })
            .delay(function(d,i){
                return i * 250;
            })
            .duration(1000)
            .ease('linear')

    //add transition
    chart.selectAll("text")
        .data(data)
        .enter()
        .append('text')
        .text(function(d){
            return  d.Value
        })
        .style('fill','white')
        .attr("x", 30)
        .attr("y", function(d,i){
            if (type == 'all'){
                return yScale(i) + height/data.length/2 + 3;
            } else{
                return yScale(i) + height/data.length/2;
            }
        })
        .style("font-size", yScale.rangeBand + "px")
        .transition("animate")
            .delay(function(d,i){
                return i * 1000;
            })
            .duration(1000)
            .ease("linear")
}

draw(currentType);
types = d3.select("#Buttons").selectAll(".button");
// print array of types to console
//console.log(types)

types.on('click',function(){
    //grab the id of the button
    var temp = $(this).attr("id");

    if (temp != currentType){
        types.classed("active", false);
        d3.select(this).classed("active",true);
        currentType = temp
        //remove the drawn elements
        chart.selectAll('rect').remove()
        chart.selectAll('text').remove()
        draw(currentType)
    }
});