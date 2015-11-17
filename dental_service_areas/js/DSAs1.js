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

//queue()
//  .defer(d3.json, 'data/ZCTAs.topojson')
//  .defer(d3.json, 'data/DSA40pct.topojson')
//  .await(makeMap);

function makeMap(){

//draw base ZCTAs
  d3.json("data/ZCTAs.topojson", function(error, zctas){
    console.log(zctas)
    collection = topojson.feature(zctas, zctas.objects.collection);
    console.log(collection)
    var transform = d3.geo.transform({point: projectPoint}),
      path = d3.geo.path().projection(transform)

    var ZCTAs = g.append('g').attr('id','zctas').selectAll("path")
      .data(collection.features)
      .enter().append('path')
      .attr('fill',function(d){
          return colorScale(d.properties.LOC)
      })
      .style('opacity', 0.65)
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
            ZCTAs.attr("d",path);
    } // end reset

    function projectPoint(x,y){
      var point = map.latLngToLayerPoint(new L.LatLng(y,x));
      this.stream.point(point.x,point.y);
    }//end project point

  });//end json callback


  //draw bar chart
  d3.json("data/DSA40pct.topojson", function(error, dsas){
    var dsas = topojson.feature(dsas, dsas.objects.collection).features;
    //var dsas = collection.features //
  var dsaArray = [];
    dsas.forEach(function(d){
      dsaArray.push({
        key: String(d.properties.DSA_Revised_40_pct),
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

      //add mouseover interactivity
      .on('mouseover',function(d) {
        tempColor = this.style.fill;
        //select dsa based on bar
        d3.select(this)
          .style('fill','#f04124')
          d3.select('#loc').text('LOC: ' + d3.format(".2g")(d.value)) //update LOC div
          d3.select("#dsa"+this.id.slice(3))
            .style('opacity',0) //adjust opacity of dsa selected

      })
      //mouseout interactivity
      .on('mouseout',function(d){
        d3.select(this)
          .style('opacity','1')
          .style('fill',tempColor)
        //change dsa back to orginal colour
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
      .duration(2000)
      .delay(function(d,i){
        return 2000 + i*10
      })

      //set up vertical Axis Scale
      var vGuideScale = d3.scale.linear()
       .domain([0,1])
       .range([chartHeight,0])

      var vLeftAxis = d3.svg.axis()
       .scale(vGuideScale)
       .orient('left')
       .ticks(5)

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
  });//end d3.json callback
//};//end draw Chart Function


//};

//draw DSAs overtop the ZCTAs
//function drawDSAs(){

  d3.json("data/DSA40pct.topojson", function(error, dsas){
    var collection = topojson.feature(dsas, dsas.objects.collection)
    console.log(collection)
    //transform for the leaflet basmap
    var transform = d3.geo.transform({point: projectPoint}),
              path = d3.geo.path().projection(transform)

    var DSAs = g.append('g').attr('id','dsas').selectAll("path")
      .data(collection.features)
      .enter().append("path")
      .style('fill', function(d){
        loc = d.properties.SUM_Patients_In / d.properties.SUM_Patients_Total
        return colorScale(loc)
      })
      .attr('id', function(d){ return 'dsa'+ d.properties.DSA_Revised_40_pct})
      .style('stroke-width', "1.5px")
      .style('stroke','white')
      .style('opacity', 1)

      //mouseover interactivity
      .on('mouseover', function(d){
        //store color temporarily
        d3.select('#loc').text('LOC: ' + d3.format(".2g")(d.properties.SUM_Patients_In/d.properties.SUM_Patients_Total))
        tempColor = this.style.fill
        d3.select(this)
         .transition()
         .style('opacity', 0)

        //select corresponding bar on bar chart
        d3.select("#bar"+this.id.slice(3)).style('fill','#f04124')
      })

      //mouseout interactivity
      .on('mouseout',function(d){
        d3.select(this)
          .transition()
          .style('opacity',1)

          .style('fill',tempColor)
        //change bar back to original color
        d3.select('#bar'+this.id.slice(3)).style('fill',tempColor)
      });

      $(document).ready(function(){
        $('#button').click(function(){
          dsas.style('opacity', 0.0)
        })
      });

      // when the user zooms in or out you need to reset
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

          DSAs.attr("d",path);
      } // end reset

      //functi0n for reprojecting points on zoom
      function projectPoint(x,y){
        var point = map.latLngToLayerPoint(new L.LatLng(y,x));
        this.stream.point(point.x,point.y);
      }

  }); //end d3.json callback
//};//end of Draw DSA function
};



//lazy resonspiveness event listener
$(window).resize(function(){
  $
  map.fitBounds([bounds]);
  location.reload();
})

var zctas = "data/ZCTAs.topojson",
    dsas = "data/DSA40pct.topojson";
$(document).ready(function(){
  makeMap();

});

