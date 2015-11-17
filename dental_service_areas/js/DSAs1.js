$(document).foundation();
// get width and establish height dynamically for map
var aspect = .65
var width = $('#map').width()
var height = width * aspect

//get height for chart and determine width. create chart SVG
var chartHeight = width/8; //chart width is same as map
var margin = { top: 30, right: 30, bottom: 40, left:30 } //margins for pushing chart around
var chartSVG = d3.select('#chart').append('svg')
    .attr('width',width)
    .attr('height',chartHeight)
    .append('g')

d3.select('#map').attr('style','height:' + height + 'px')

//determine bounds SW and NE bounds
var sw = L.latLng(40.581,-95.636),
    ne = L.latLng(43.520,-91.263),
    bounds = L.latLngBounds(sw,ne);

var map = L.map('map', {center: [42,-93.4],
      bounds: bounds,
      reuseTiles: true,
      trackResize: true})
      .addLayer(new L.TileLayer("http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {opacity: 0.85}));

//get the max zoom level
var boundsZoom = map.getBoundsZoom([bounds], 1);
map.fitBounds(bounds)

//colors to be used
var colors = ['rgb(213,62,79)','rgb(253,174,97)','rgb(229,229,172)','rgb(122,157,117)','rgb(50,136,189)']
var colorScale = d3.scale.quantize().domain([0, 0.25, 0.50, 0.75, 1]).range(colors)

var ids = ['leg0','leg1','leg2','leg3','leg4']
var idScale = d3.scale.quantize().domain([0,.20,.40,.60,.80,1]).range(ids)
// appending the SVG to the Leaflet map pane
// g (group) element will be inside the svg
var svg = d3.select(map.getPanes().overlayPane).append("svg");

// if you don't include the leaflet-zoom-hide when a
// user zooms in or out you will still see the phantom
// original SVG
var g = svg.append("g").attr("class", "leaflet-zoom-hide");

//get width of legend div and style legend table cells
var legendWidth = $('#legend').width();
d3.select("#legendTable").select("tr").selectAll("td")
  .style('width', legendWidth/5 + "px")
  .style('text-align','center')
  .style('font-size','large')

//get width of LOC div and style it
var locWidth = $("#locDiv").width();
var locHeight = $('locDiv').height()

d3.select("#locDiv").select("#locTable").select('tr').selectAll('td')
  .style("width",locWidth + "px")
  .style("text-align","center")
  .style('font-size','x-large')

//add some tooltip interactivity
d3.select('#locDiv').on('mouseover',function(){
  d3.select('#locTip').classed('hidden',false)
})
d3.select('#locDiv').on('mouseout',function(){
  d3.select('#locTip').classed('hidden',true)
})

queue()
  .defer(d3.json, 'data/ZCTAs.topojson')
  .defer(d3.json, 'data/DSA40pct.topojson')
  .await(makeMap);

function makeMap(error, zctas, dsas){

//draw base ZCTAs
  //d3.json("data/ZCTAs.topojson", function(error, zctas){

    zctaCollection = topojson.feature(zctas, zctas.objects.collection);
    console.log(zctaCollection)
    var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)

    var ZCTAs = g.append('g').attr('id','zctas').selectAll("path")
      .data(zctaCollection.features)
      .enter().append('path')
      .attr('fill',function(d){
          return colorScale(d.properties.LOC)
      })
      .style('opacity', 0.90)
      .style('stroke','white');
    // Reposition the SVG to cover the features.
    function zctareset() {
      var bounds = path.bounds(zctaCollection);
      var topLeft = bounds[0],
      bottomRight = bounds[1];
      svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
      g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
      ZCTAs.attr("d",path);
    } // end reset

    // when the user zooms in or out you need to reset
    // the view
    map.on("viewreset", zctareset);
    // this puts stuff on the map!
    zctareset();


    function projectPoint(x,y){
      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
      this.stream.point(point.x,point.y);
    }//end project point

  //});//end json callback


  //draw bar chart
  //d3.json("data/DSA40pct.topojson", function(error, dsas){
    var barDsas = topojson.feature(dsas, dsas.objects.collection).features;
    //var dsas = collection.features //
    var dsaArray = [];
    barDsas.forEach(function(d){
      dsaArray.push({
        key: String(d.properties.DSA_Revised_40_pct),
        patientIn: d.properties.SUM_Patients_In,
        patientTotal: d.properties.SUM_Patients_Total,
        value: d3.format("01g")(d.properties.SUM_Patients_In/d.properties.SUM_Patients_Total)
      })
    })//end dsas.forEach

    //sort the sucker (ascending)
    dsaArray.sort(function(a,b){return a.value - b.value})

  //scaling data to fit the svg height
  var yScale = d3.scale.linear()
        .domain([0.0, 1.0])
        .range([0, chartHeight]);

  //Scale for placing bars horizontally
  var xScale = d3.scale.ordinal()
        .domain(d3.range(0, dsaArray.length))
        .rangeBands([0, width - margin.left - margin.right])


  //create bar chart
  var barChart = chartSVG.attr('transform','translate(' + margin.left + ',0)')
    .attr('x', margin)
    .selectAll('rect').data(dsaArray)
    .enter().append('rect')
      .style('fill',function(d){
        return colorScale(d.value)
      })
      .attr('width', xScale.rangeBand())
      .attr('x',function(d,i){
        return xScale(i) + 0.5
      })
      .attr('height',0)
      .attr('y',chartHeight)
      .attr('id',function(d){ return "bar"+String(d.key)})// add an id for interactivity
      .attr('class',function(d){return idScale(d.value)})
      //add mouseover interactivity
      .on('mouseover',function(d) {
        tempColor = this.style.fill;
        //select dsa based on bar
        d3.select(this)
          .style('fill','#f04124')
          d3.select('#loc').text('LOC: ' + d3.format(".2g")(d.value)) //update LOC div
          d3.select('#patientIn').text('Patients In: '+d3.format(',d')(d.patientIn))
          d3.select('#patientTot').text('Patients Total: '+d3.format(',d')(d.patientTotal))
          d3.select("#dsa"+this.id.slice(3))
            .style('opacity',0) //adjust opacity of dsa selected

      })
      //mouseout interactivity
      .on('mouseout',function(d){
        d3.select(this)
          .style('opacity','1')
          .style('fill',tempColor)
        //change dsa back to orginal colour
        d3.select('#loc').text('LOC: 0.00')
        d3.select('#patientIn').text('Patients In: 0')
        d3.select('#patientTot').text('Patients Total: 0')
        d3.select("#dsa"+this.id.slice(3))//select geographic unit
          .style('opacity',1)
      })

    //add transition to make it more snazzy
    barChart.transition().attr('height',function(d){ return yScale(d.value)})
      .attr('y',function(d){
        return chartHeight - yScale(d.value)
      })
      .delay(function(d,i){
        return i*10;
      })
      .duration(1000)
      .delay(function(d,i){
        return 1000 + i*10
      })

      //set up vertical Axis Scale
      var vGuideScale = d3.scale.linear()
       .domain([0,1])
       .range([chartHeight,0])

      var vLeftAxis = d3.svg.axis()
       .scale(vGuideScale)
       .orient('left')
       .ticks(5).tickFormat(d3.format('%'))

      //add axis/left guide
      var vGuide = d3.select('#chart').select('svg').append('g')
        .attr('class','leftAxis')
        .attr('transform','translate('+margin.left + ",0)")
        .call(vLeftAxis)
        //.call(vRightAxis)

        //style left axis
        vGuide.selectAll('path').style({fill: 'none', stroke: "#000"})
        vGuide.selectAll('line').style({stroke: "#000"})
        vGuide.selectAll('text').style('font-size','10px')
        //remove 1 and 0 from axis
        vGuide.selectAll('.tick').each(function(d){
        if (d === 0 || d ===1){
          this.remove()
          }
          });// hide zero and 1
  //});//end d3.json callback
//};//end draw Chart Function


//};

//draw DSAs overtop the ZCTAs
//function drawDSAs(){

  //d3.json("data/DSA40pct.topojson", function(error, dsas){
    var dsaCollection = topojson.feature(dsas, dsas.objects.collection)
    console.log(dsaCollection)
    //transform for the leaflet basmap
    var transform = d3.geo.transform({point: projectPoint}),
              path = d3.geo.path().projection(transform)

    var DSAs = g.append('g').attr('id','dsas').selectAll("path")
      .data(dsaCollection.features)
      .enter().append("path")
      .style('fill', function(d){
        loc = d.properties.SUM_Patients_In / d.properties.SUM_Patients_Total
        return colorScale(loc)
      })
      .attr('id', function(d){ return 'dsa'+ d.properties.DSA_Revised_40_pct})
      .attr('class',function(d) {return idScale(d.properties.SUM_Patients_In / d.properties.SUM_Patients_Total)})
      .style('stroke-width', "2px")
      .style('stroke','#606060')
      .style('opacity', 1)

      //mouseover interactivity
      .on('mouseover', function(d){
        //store color temporarily
        tempColor = this.style.fill
        //update the patient and LOC table data
        d3.select('#loc').text('LOC: ' + d3.format(".2g")(d.properties.SUM_Patients_In/d.properties.SUM_Patients_Total))
        d3.select('#patientIn').text('Patients In: '+d3.format(',d')(d.properties.SUM_Patients_In))
        d3.select('#patientTot').text('Patients Total: '+d3.format(',d')(d.properties.SUM_Patients_Total))

        d3.select(this)
         .transition()
         .style('fill-opacity', 0)
         //.style('stroke-width', '5px')
         //.style('stroke', '#606060')
         DSAs.selectAll()

        //select corresponding bar on bar chart
        d3.select("#bar"+this.id.slice(3)).style('fill','#f04124')
      })

      //mouseout interactivity
      .on('mouseout',function(d){
        d3.select(this)
          .transition()
          .style('fill-opacity',0.95)
          .style('fill',tempColor)
        //reset patient and LOC data
        d3.select('#loc').text('LOC: 0.00')
        d3.select('#patientIn').text('Patients In: 0')
        d3.select('#patientTot').text('Patients Total: 0')
        //change bar back to original color
        d3.select('#bar'+this.id.slice(3)).style('fill',tempColor)
      });

      $(document).ready(function(){
        $('#button').click(function(){
          dsas.style('opacity', 0.0)
        })
      });

      // when the user zooms in or out you need to reset
      map.on("viewreset", dsareset);
      // this puts stuff on the map!
      dsareset();

      // Reposition the SVG to cover the features.
      function dsareset() {

          var bounds = path.bounds(dsaCollection);
          var topLeft = bounds[0],
          bottomRight = bounds[1];

          svg.attr("width", bottomRight[0] - topLeft[0])
              .attr("height", bottomRight[1] - topLeft[1])
              .style("left", topLeft[0] + "px")
              .style("top", topLeft[1] + "px");

          g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

          DSAs.attr("d",path);
      } // end reset

      //functi0n for reprojecting points on zoom
      function projectPoint(x,y){
        var point = map.latLngToLayerPoint(new L.LatLng(y,x));
        this.stream.point(point.x,point.y);
      }

  //}); //end d3.json callback
//};//end of Draw DSA function
};

d3.selectAll('.legendItem').on('mouseover',function(){
  var id = d3.select(this).attr('id');
  d3.select(this).style('opacity',.75);
  var dsaClass = '.'+ id;
  d3.select('#map').selectAll(dsaClass).style('opacity',0);
  d3.select('#chart').selectAll(dsaClass).style('opacity',0.75);



})
d3.selectAll('.legendItem').on('mouseout',function(){
  var id = d3.select(this).attr('id');
  d3.select(this).style('opacity',1);
  var dsaClass = '.'+ id;
  d3.select('#map').selectAll(dsaClass).style('opacity',1);
  d3.select('#chart').selectAll(dsaClass).style('opacity',1);
})

//lazy resonspiveness event listener
//$(window).resize(function(){
//  $
//  map.fitBounds([bounds]);
//  location.reload();
//})

//var zctas = "data/ZCTAs.topojson",
//    dsas = "data/DSA40pct.topojson";
//$(document).ready(function(){
//  makeMap();
//
//});

