var map = L.map('map', {center: [42,-93.4],zoom: 8})
        .addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"));

    var colors = ['rgb(213,62,79)','rgb(253,174,97)','rgb(255,255,191)','rgb(171,221,164)','rgb(50,136,189)']
    var colorScale = d3.scale.quantize().domain([0,1]).range(colors)
    // we will be appending the SVG to the Leaflet map pane
    // g (group) element will be inside the svg
    var svg = d3.select(map.getPanes().overlayPane).append("svg");

    // if you don't include the leaflet-zoom-hide when a
    // user zooms in or out you will still see the phantom
    // original SVG
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");


    var toolTip = d3.select('body').append('div')
    .attr('class','tooltip')
    .style('position', 'absolute')
    .style('padding', '0 10 px')
    .style('background', 'white')
    .style('opacity', 0)
    .attr('position','absolute')
    //read in the GeoJSON. This function is asynchronous so
    // anything that needs the json file should be within

queue()
  .defer(d3.json,"data/DSA_data/ZCTAs.topojson")
  .defer(d3.json,"data/DSA_data/DSA40pct.topojson")
  .await(makeMap)

function makeMap(error, zctas, dsas){
//function drawZctas(){
  //d3.json("../DSA_data/ZCTAs.topojson", function(error, zctas){
    zctaCollection = topojson.feature(zctas, zctas.objects.collection);
    var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)
    var zctas = g.append('g').attr('id','zctas').selectAll("path")
      .data(zctaCollection.features)
      .enter().append('path')
      .attr('fill','#6e6e6e')
      .style('opacity', 0.25)
      .style('stroke','white');
    // when the user zooms in or out you need to reset
    // the view
    map.on("viewreset", reset);
    // this puts stuff on the map!
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
            zctas.attr("d",path);
        } // end reset
        function projectPoint(x,y){
          var point = map.latLngToLayerPoint(new L.LatLng(y,x));
          this.stream.point(point.x,point.y);
        }

  //});//end json callback
//};//end drawZctas function
function drawDSAs(){

  //d3.json("../DSA_data/DSA40pct.topojson", function(error, dsas){
    var dsaCollection = topojson.feature(dsas, dsas.objects.collection)

    var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)

      var dsas = g.append('g').attr('id','dsas').selectAll("path")
        .data(dsaCollection.features)
        //.data(zctas.features)
        .enter().append("path")
        .style('fill', function(d){
          loc = d.properties.SUM_Patients_In / d.properties.SUM_Patients_Total
          return colorScale(loc)
        })
        .style('stroke-width', "2px")
        .style('stroke','white')
        .style('opacity', 0.75)
        .on('mouseover', function(d){
          toolTip.transition()
            .style('opacity', 0.9)
          //store color temporarily
          d3.select('#loc').text('LOC: ' + d.properties.SUM_Patients_In/d.properties.SUM_Patients_Total)
          tempColor = this.style.fill
          d3.select(this)
           .transition()
           .style('opacity', 0.0)
        })
        .on('mouseout',function(d){
          toolTip.transition()
              .style('opacity',0)
          d3.select(this)
            .transition()
            .style('opacity',0.75)
            .style('fill',tempColor)
        });

        $(document).ready(function(){
          $('#button').click(function(){
            dsas.style('opacity', 0.0)
          })
        });

        // when the user zooms in or out you need to reset
        // the view
        map.on("viewreset", reset);

        // this puts stuff on the map!
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

            dsas.attr("d",path);

        } // end reset

        function projectPoint(x,y){
          var point = map.latLngToLayerPoint(new L.LatLng(y,x));
          this.stream.point(point.x,point.y);
        }//end projectPoint


    //}); //end json callback
//})//end of DSAs function
//}//end draw DSAs function
}//end makeMap function
var legendtip = d3.select('#legend');
legendTip.on('mouseover',function(){
    var id = d3.select(this).attr('id');
    console.log(legendTip)

      //create a tool tip that will be invisble at page load
     // var zctas = "data/DSA_data/ZCTAs.topojson",
      //    dsas = "data/DSA_data/DSA40pct.topojson";
      //$(window).load(function(){drawZctas()});
      //$(window).load(function(){drawDSAs()});