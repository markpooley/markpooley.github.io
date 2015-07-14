//Width and height
var aspect = 1.5;
var width = $("#map").width();
var height = width/ aspect;



//set up the color scale
var colors = ['rgb(213,62,79)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,139)','rgb(255,255,191)','rgb(230,245,152)','rgb(171,221,164)','rgb(102,194,165)','rgb(50,136,189)']
var colLow = "#2892C7"
var colHigh = "#E81014"
var colorScale = d3.scale.quantize().domain([1800,2015]).range(colors)
//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//add BaseMap
var map = L.map('map', {center: [41.661128,-91.530168],
  zoom: 14,
  reuseTiles: true})
  .addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));

//Attach empty SVG to the basemap
var svg = d3.select(map.getPanes().overlayPane).append("svg");

//hide phantom svg on zoom
var g = svg.append("g").attr("class", "leaflet-zoom-hide");


//queue data so it loads better
queue()
  .defer(d3.json,"data/icbuildings_topo.topojson")
  //.defer(d3.json,'data/jcstreets.topojson')
  .await(makeMap);

function makeMap(error,buildings){
  //group variable to zoom behavior works correctly
  var collection = topojson.feature(buildings, buildings.objects.icbuildings_dissolve);
  var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)


  //Create a path for each map feature in the data
  var buildings = g.selectAll("path")
    //.data(buildings.features)
    .data(collection.features)
    //.data(topojson.feature(buildings,buildings.objects.Temp_ICBuildings).features)
    .enter()
    .append("path")
    .attr("d",path)
    .attr('fill', function(d){
      if (d.properties.BuildYear_ <= 0){
        color = 'rgb(224,224,224)'
      } else {
        color = colorScale(d.properties.BuildYear_)
      }
      return color
    })
    .style('opacity', 0.85)
    .on('mouseover',function(d){
      //grab the year
      yr = d.properties.BuildYear_
      if (yr  < 1800){
        //say build year is unknown
      d3.select("#buildyear").text("Build Year: unknown" )
      } else {
        //add build year
        d3.select("#buildyear").text("Build Year: " + yr)
      }
      //transition current mouseover
      d3.select(this).transition().style('opacity', 0.25)
    })
    .on('mouseout',function(){
      //transition text back
      d3.select("#buildyear").text("Build Year: ")
      //transition back to normal opacity
      d3.select(this).transition().style('opacity',0.85)
    });
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

};


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

var legendTable = d3.select("#legend")
//actually draw legend table
drawLegend(legendTable)

