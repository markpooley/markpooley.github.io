//Width and height
var aspect = 1.5;
var width = $("#map").width();
var height = width/ aspect;

var margin = {
  top: 20,
  left: 35,
  bottom: 20,
  right: 50
}

//set up the color scale
var colors = ['rgb(213,62,79)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(255,255,191)','rgb(230,245,152)','rgb(171,221,164)','rgb(102,194,165)','rgb(50,136,189)']
var colLow = "#2892C7"
var colHigh = "#E81014"
var colorScale = d3.scale.quantize().domain([1800,2015]).range(colors)
//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//graph pane at bottom
var graphHeight = height*.10;
var graphWidth = width - margin.left - margin.right
var graph = d3.select('#graph').append('svg')
  .attr('width', width)
  .attr('height',graphHeight)

graph = graph.append('g')
  .attr('transform','translate('+margin.left+','+margin.top+')')

//append year text to graph element
graph.append('text')
  .attr('transform','translate('+(graphWidth/2)+',0)')
  .attr('id','buildyear')
  .attr('text-anchor','left')
  .style('fill','white')
  .text('Year: ')

//append an animate rect to graph element
var animate = graph.append('g')
  .attr('transform','translate('+(margin.left*1.1)+','+-margin.top+')')
  //.attr('x',margin.left*1.1)
  //.attr('y',-margin.top)
animate.append('rect')
  .attr('width',margin.left*2)
  .attr('height',margin.top)
  .attr('id','animate')
  .attr('fill',colLow)

animate.append('text')
  .attr('x',margin.left)
  .attr('y',margin.top*.75)
  .attr('id','animate')
  .attr('text-anchor','middle')
  .style('fill','white')
  .text('Animate')


//draw legened
//*************************
var legendTable = d3.select("#legend")

//generate legend svg
function drawLegend(table){
  d3.selectAll(".legend")
    .style('background-color', function(d){
      //grab the text
      text = d3.select(this).text()
      if (text == 'No Data'){
        color = 'rgb(224,224,224)'
      } else {
        color = colorScale(text)
      }
      return color
    })
    .style('opacity', 0.85)

};
//actually draw legend table
drawLegend(legendTable)


//add BaseMap
var map = L.map('map', {center: [41.651128,-91.530168],
  zoom: 14,
  reuseTiles: true})
  .addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));

//Attach empty SVG to the basemap
var svg = d3.select(map.getPanes().overlayPane).append("svg");

//hide phantom svg on zoom
var g = svg.append("g").attr("class", "leaflet-zoom-hide");


//queue data so it loads better
//queue()
//  .defer(d3.json,"data/icbuildings_topo.topojson")
//  //.defer(d3.json,'data/jcstreets.topojson')
//  .await(makeMap);

function makeMap(){
  //group variable to zoom behavior works correctly
  d3.json('data/icbuildings.topojson', function(error, buildings){
  var collection = topojson.feature(buildings, buildings.objects.collection);
  var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)

  //get min and max build year for the structures
  var minYear = d3.min(collection.features,function(d){
      return d.properties.YearBuilt
    })
  if (minYear < 1750) {
    minYear = 1800;
  }
  var maxYear = d3.max(collection.features,function(d){
      return d.properties.YearBuilt
    })
  var buildCount = collection.features.length;

  //set up graph axes
  //*****************************************
  //setup x scale and  axis
  var xScale = d3.scale.linear()
    .domain([minYear,maxYear])
    .range([0,(graphWidth-margin.left-margin.right)])
    .nice()


  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .tickFormat(d3.format(""))

   //set up yAxis
   var yScale = d3.scale.linear()
    .domain([0,d3.max(collection.features, function(d){
      return d.properties.COUNT_Year
    })])
    .range([(graphHeight-margin.top-margin.bottom),0])
    .nice()


    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(4)

    graph.append('g')
      .attr('class','axis')
      .attr('transform','translate('+ margin.left +',' + (graphHeight-(margin.bottom + margin.top)) +')')
      .call(xAxis)
        //.style('fill','white')
        //.style('stroke','white')

    graph.append('g')
      .attr('class','axis')
      .attr('transform','translate('+margin.left+',0)')
      .call(yAxis)
  //add bars to the chart
  var barData = collection.features

  var bars = graph.selectAll('rect')
    .data(barData)
    .enter()
    .append('rect')
    .attr('id',function(d){
      return 'yr'+d.properties.YearBuilt
    })
    .attr('fill',function(d){
      return colorScale(d.properties.YearBuilt)
    })
    .attr('x',function(d){
      return xScale(d.properties.YearBuilt)
    })
    .attr('height',function(d){
      return graphHeight-margin.top-margin.bottom - yScale(d.properties.COUNT_Year)
    })
    .attr('width',2.5)
    .attr('y',function(d){
      return yScale(d.properties.COUNT_Year)
    })


  //Create a path for each map feature in the data
  var buildings = g.selectAll("path")
    //.data(buildings.features)
    .data(collection.features)
    //.data(topojson.feature(buildings,buildings.objects.Temp_ICBuildings).features)
    .enter()
    .append("path")
    .attr("d",path)
    .attr('class','buildings')
    .attr('id',function(d){
      return 'YearBuilt' + d.properties.YearBuilt
    })
    .attr('fill', function(d){
      if (d.properties.YearBuilt <= 0){
        color = 'rgb(224,224,224)'
      } else {
        color = colorScale(d.properties.YearBuilt)
      }
      return color
    })
    .style('opacity', 0.85)

    //building mouserover interactivity
    //**********************************
    buildings.on('mouseover',function(d){
      //grab the year
      var yr = d.properties.YearBuilt;
      var barID = '#yr'+yr;
      if (yr  < 1800){
        //say build year is unknown
      d3.select("#buildyear").text("Year: unknown" )
      } else {
        //add build year
        d3.select("#buildyear").text("Year: " + yr)
        d3.select(barID).attr('fill','red')
          .attr('width',5)
      }
      //transition current mouseover
    })
    .on('mouseout',function(d){
      //transition text back
      d3.select("#buildyear").text("Year: ")
      var barID = '#yr'+d.properties.YearBuilt;
      d3.select(barID)
        .attr('fill',function(d){
        return colorScale(d.properties.YearBuilt)
      })
        .attr('width',2.5)
      //transition back to normal opacity
      d3.select(this).transition().style('opacity',0.85)
    });

    //bar chart interactivity
    //***************************
    bars.on('mouseover',function(d){
      var yr = d.properties.YearBuilt
      var buildID = '#YearBuilt' + yr;
      d3.select('#buildyear').text('Year: '+ yr + ', Count: ' +d.properties.COUNT_Year)
      d3.select(buildID)
        .attr('fill','red')

    })
    bars.on('mouseout',function(d){
      var yr = d.properties.YearBuilt;
      var buildID = '#YearBuilt' + yr;
      d3.select('#buildyear').text('Year: ')
      d3.select(buildID)
        .attr('fill',function(d){
          return colorScale(d.properties.YearBuilt)
        })
    })

    //animate all the stuff!
    //***********************
    $('#animate').on('click', function(){
      buildings.style('opacity', .10)
      bars.style('opacity',0)
      var tempBuidlings = d3.selectAll('.buildings').data();

      //animate function
      function animate(data,index){

        var year = data[index].properties.YearBuilt
        var selector = '#YearBuilt'+ year;
        var barSelector = '#yr' + year;
        var buildCount = data[index].properties.COUNT_Year
        if (year <= 2014){
          setTimeout(function(){

            d3.select(selector).style('opacity',0.85);
            d3.select('#buildyear').text('Year: ' + year + ', Count: ' + buildCount);
            d3.select(barSelector).style('opacity',1)

            animate(data, ++index);
          },500)
        }

      }
      animate(tempBuidlings,0)

      }) //end of animate call back

    //when user zooms, view needs to be reset
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

        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

        buildings.attr("d",path);

    } // end reset

    function projectPoint(x,y){
      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
      this.stream.point(point.x,point.y);
    }
  })//end d3 json callback

};//end makeMap function


$(document).ready(function(){
  makeMap();
});