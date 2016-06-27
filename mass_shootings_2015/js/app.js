//Width and height
var aspect = 2.65;
var width = $("#map").width();
var height = width/ aspect;
var scale = width/ 1.25;
var graphHeight = (height *.25);
var textRatio = height *.025 + 'px'

//margins for graph
var margin = {
  top: 20,
  left: 35,
  bottom: 25,
  right: 50
}

//temporary empty color that will be used for mouseover and mouseout events
var tempColor;

//graph pane at bottom
var graphWidth = width - margin.left - margin.right

//mouseover booleans
var mouseBool = true;

//tooltip variable
var tooltip = d3.select('.tooltip');
var tooltipOffset = {x: 5, y: -25};


//Map projection
var projection = d3.geo.albersUsa()
  .scale(scale)
  .translate([width/2,height/2.0]) //translate to center the map in view


//Create an SVG
var svg = d3.select("#map").append("svg")
  .attr("width", width)
  .attr("height", height);

//Group for the map features
var features = svg.append("g")
  .attr("class","features");

//create legend SVG to be in makeMap function
var legend = svg.append('g');

//zoom behavior
//var zoom = d3.behavior.zoom()
//    .scaleExtent([1, Infinity])
//    .on("zoom",zoomed);
//
//
//features.call(zoom)
//append graph SVG
var graphContainer = d3.select('#map').append('svg')
  .attr('width',width)
  .attr('height',graphHeight)
  .attr('class','graph')

var incidentGraph = graphContainer.append('g')
    .attr('class','incidents')

var tallyWidth = width*.15;
var tallyHeight = height*.80;
var tallySVG = svg.append('g')
    .attr('width',tallyWidth)
    .attr('height',tallyHeight)
    .attr('transform','translate('+width*.80+','+(height*.15)+')')
    .attr('class','tallySVG')

//append SVG text to main SVG
svg.append('g')
  .append('text')
  .attr('x',width/2)
  .attr('y',height*.025)
  .attr('text-anchor','middle')
  .text('Mouseover states, incidents, or bars for more info')
    .style('fill','white')
    .style('font-size',textRatio )

var textX = width*.05
var textY = height*.80
var numText = svg.append('g')
  .append('text')
  .attr('x',textX)
  .attr('y',height*.675)
  .attr('id','NumText')
  .text('Incidents to Date:')
    .style('fill','white')
    .style('font-size',textRatio)

var dateText = svg.append('g')
  .append('text')
  .attr('x',textX)
  .attr('y',height*.70)
  .attr('id','DateText')
  .text('Incident Date:')
    .style('fill','white')
    .style('font-size',textRatio)

var killText = svg.append('g')
  .append('text')
  .attr('x',textX)
  .attr('y',height*.725)
  .attr('id','killText')
    .text('# Killed:')
    .style('fill','white')
    .style('font-size',textRatio)

var injText = svg.append('g')
  .append('text')
  .attr('x',textX)
  .attr('y',height*.75)
  .attr('id','injText')
    .text('# Injured:')
    .style('fill','white')
    .style('font-size',textRatio)

var addText = svg.append('g')
  .append('text')
  .attr('x',textX)
  .attr('y',height*.775)
  .attr('id','locText')
  .text('Address:')
    .style('fill','white')
    .style('font-size',textRatio)

var LocText = svg.append('g')
  .append('text')
  .attr('x',textX)
  .attr('y',textY)
  .attr('id','locText')
  .text('Location:')
    .style('fill','white')
    .style('font-size',textRatio)


/***************
*
*   Functions
*
/***************/
//merge aggregated shooting data to state JSON
var mergData = function(shootingData,states){
  //loop through shootingData
  for (var i = 0; i < shootingData.length; i++){
    var state = shootingData[i].key
    //loop through JSON
    for (var j = 0; j < states.length; j++){
      var stateName = states[j].properties.NAME
      if (state == stateName){
        states[j].properties.incidents = shootingData[i].values.incidents,
        states[j].properties.killed = shootingData[i].values.killed;
        states[j].properties.injured = shootingData[i].values.injured;
        break;
      }
    }
  }
  return states;
}
//feed radius into function for location
//it's conditional statement I didn't want to retype...
var radiusFunction = function(r){
   var rad;
   if (r == 0){
    rad = 1
   } else {
    rad = r
   }
   return rad
};

//draw legened
//*************************
var legendTable = d3.select("#legend")
//queue the suckers so they load in the correct order.
queue()
  .defer(d3.json, 'data/us-states.topojson')
  .defer(d3.json, 'data/mass_shootings_2015.topojson')
  .await(makeMap);

function makeMap(error, states, shootings){

  //states variable that will have shooting aggregate data attached to it later
  var states_collection = topojson.feature(states, states.objects.collection);
  var states = {}


  //shooting data
  var shootings_collection = topojson.feature(shootings, shootings.objects.collection);
  var shooting_data = shootings_collection.features
  var maxKilled = d3.max(shootings_collection.features,function(d){
    return d.properties.F__Killed
  });
  var maxVictims = d3.max(shootings_collection.features, function(d){
    return (d.properties.F__Killed + d.properties.F__Injured)
  })
  var totalKilled = d3.sum(shootings_collection.features,function(d){
    return d.properties.F__Killed
  })
  var totalIjured = d3.sum(shootings_collection.features, function(d){
    return d.properties.F__Injured
  })
  //sort the events by date
  function sortData(a,b){
    return new Date(a.properties.Incident_D) - new Date(b.properties.Incident_D)
  }
  shooting_data = shooting_data.sort(sortData)

  //stack the bar data for a stacked bar chart
  var stackedData = [
    {
    type: 'killed',
    values: []
    },
    {
      type: 'injured',
      values: []
    }
  ]
  shooting_data.forEach(function(d){
    stackedData[0].values.push({
      count: d.properties.F__Killed, date: d.properties.Incident_D
    })
    stackedData[1].values.push({
      count: d.properties.F__Injured, date: d.properties.Incident_D
    })
  })

  var stack = d3.layout.stack()
    .values(function(d){return d.values;})
    .x(function(d){return d.date })
    .y(function(d){return d.count})

  var stacked = stack(stackedData)


  //aggregate totals to merge into state JSON
  var stateShootings = d3.nest()
    .key(function(d){ return d.properties.State})
    .rollup(function(d){return {
      incidents: d.length,
      killed: d3.sum(d,function(j) {return j.properties.F__Killed}),
      injured: d3.sum(d,function(j){return j.properties.F__Injured})
    };})
    .entries(shooting_data)

  //bind state aggregate data to the state json data
  states = mergData(stateShootings,states_collection.features)

  //stack data for bar chart
  var categories = {
    'killed':'#fd8d3c',
    'injured': '#4682B4',
    'total': '#333333'
  }
  //update svg text on right side of map
  numText.text('Incidents To Date: ' + shooting_data.length)
  killText.text('# Killed: ')
  injText.text('# injured: ')

  //get max incident count
  var stateMax = d3.max(states, function(d){
    return d.properties.incidents
  })

  //shooting data related to scale of dots
  var maxR = width* .004
  var shooting_Domain = [0,maxKilled*.25,maxKilled*.5,maxKilled*.75,maxKilled]
  var shooting_Range = [0,maxR]
  var shootScale = d3.scale.linear()
    .domain(shooting_Domain)
    .range(shooting_Range)

  //shooting data related to colour
  var state_colors= ['#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c'];
  var state_domain = [1,stateMax*.25,stateMax*.50,stateMax*.75,stateMax];
  var colorScale = d3.scale.linear()
    .domain(state_domain)
    .range(state_colors)

  //Generate paths based on projection
  var path = d3.geo.path()
    .projection(projection)

  //append one last rect to legend for no Incidents
  var legRectHeight = height*.086
  var legRectWidth = legRectHeight * .67

  //create legend svg
  legend
    //.attr('height',state_colors.length*10)
    //.attr('width', stateMax * 4)
    .attr('class','legend')
    .attr('transform','translate('+(width*.05)+','+(height*.05)+')')

  //creat the "no incidents" legend part
  legend.append('rect')
    .attr('x',0)
    .attr('y',state_colors.length*legRectHeight + legRectHeight*.10)
    .attr('width',legRectWidth * 3)
    .attr('height',legRectHeight/2)
    .style('fill','#595959')
    .style('stroke','#595959')

  legend.append('text')
    .attr('x', legRectWidth * 1.5)
    .attr('y',state_colors.length*legRectHeight+legRectHeight/3 + legRectHeight*.10)
    .attr('text-anchor','middle')
    .text('No Incidents')
    .style('fill','white')
    .style('font-size',textRatio)


  //loop arrays to create legend
   for (var i = 0; i < state_colors.length; i++) {
      var y = i*legRectHeight
      legend.append('rect')
        .attr('x',0)
        .attr('y',y)
        .attr('width',legRectWidth)
        .attr('height',legRectHeight)
        .attr('fill',function(){
          return state_colors[i]
        })

      legend.append('text')
        .attr('x',legRectWidth/2)
        .attr('y',(y+legRectHeight/2)+ legRectHeight*.08)
        .attr('text-anchor','middle')
        .text(state_domain[i])
        .style('font-size',textRatio)
        //.style('fill','#595959')

      var cy = i * legRectHeight + (legRectHeight/2);
      var cx = legRectWidth * 2
      legend.append('circle')
        .attr('cx', cx)
        .attr('cy',cy)
        .attr('r',function(){
          var r;
          if (i == 0){
            r = 1.5
          } else {
            r = shooting_Domain[i]
          }
          return shootScale(r)
        })
        .style('fill', '#333333')
        .style('opacity',0.75)
        .style('stroke', 'white')

      legend.append('text')
        .attr('x',cx)
        .attr('y',function(){
          var loc;
          if (i == 0 ){
            loc = cy * 1.75
          } else if (i == 1){
            loc = cy + (cy*.25)
          }  else {
            loc = (y+legRectHeight/2)+ legRectHeight*.08
          }
          return loc
         })
        .attr('text-anchor','middle')
        .text(shooting_Domain[i])
        .style('fill','white')
        .style('font-size',textRatio)
   }
   legend.append('text')
    .attr('x',0)
    .attr('y',0)
    .text('Shooting Incidents in State')
    .attr('text-anchor','middle')
    .attr('transform','translate(-5,'+legRectHeight*state_colors.length/2+') rotate(270)')
    .style('fill','white')
    .style('font-size',textRatio)

 legend.append('text')
    .attr('x',0)
    .attr('y',0)
    .text('# Victims Killed')
    .attr('text-anchor','middle')
    .attr('transform','translate('+(legRectWidth*3+5)+','+legRectHeight*state_colors.length/2+') rotate(90)')
    .style('fill','white')
    .style('font-size',textRatio)
   /***********************
   *
   * Create scales for charts
   *
   *************************/
  var dateFormat = d3.time.format('%B %d, %Y')
  var firstIncident = d3.min(shooting_data,function(d){
    return dateFormat.parse(d.properties.Incident_D)
   })
  var lastIncident = d3.max(shooting_data,function(d){
    return dateFormat.parse(d.properties.Incident_D)
  })
  var scaleWidth = width - margin.left - margin.right;
  var yScaleHeight = graphHeight-margin.top-margin.bottom;
  var timeScaleFormat = d3.time.format("%b")

  var timeScale = d3.time.scale()
    .domain([firstIncident,lastIncident])
    .range([0,scaleWidth]);

  var xAxis = d3.svg.axis()
    .scale(timeScale)
    .orient('bottom')
    .tickFormat(timeScaleFormat)

  var timeY = d3.scale.linear()
    .range([yScaleHeight,0])
    .domain([0,36])


  var yAxis = d3.svg.axis()
    .scale(timeY)
    .orient('left')
    .tickValues([0,9,18,27,36])

  incidentGraph.append('g')
    .attr('class','axis')
    .attr('id','xAxis')
    .attr('transform','translate('+margin.left+','+(graphHeight-margin.bottom)+')')
    .call(xAxis)

  //translate the x Labels to centered inbetween the ticks
  var xTrans = scaleWidth/12/2
  var xLabels = d3.selectAll('#xAxis').selectAll('text')
    .attr('transform','translate('+xTrans+')')

  incidentGraph.append('g')
    .attr('class','axis')
    .attr('transform','translate('+margin.left+','+margin.top+')')
    .call(yAxis)

  //scale axis labels
 d3.selectAll('g.tick')
  .selectAll('text')
  .style('font-size',textRatio)


  var barWidth = scaleWidth/shooting_data.length

  /************************************
  *
  *Create total bars
  **************************************/
  var tallyIDs = ['killed','injured','total']
  var totals = [totalKilled,totalIjured,(totalKilled+totalIjured)]
  var tallyBars = tallyWidth/4
  var tallyScale = d3.scale.linear()
    .range([tallyHeight,0])
    .domain([0,(totalIjured+totalKilled)])

  for (var i = 0;i < tallyIDs.length; i++) {
    var category = tallyIDs[i]
    var tallyRect = tallySVG.append('rect')
      .attr('x',tallyBars*i)
      .attr('y',tallyScale(totals[i]))
      .attr('width',tallyBars)
      .attr('class','tallyBar')
      .attr('id','barTotal'+tallyIDs[i])
      .attr('height',tallyHeight - tallyScale(totals[i]))
      .style('fill', categories[category])
      .style('opacity',0.75)

    tallySVG.append('text')
      .attr('x',tallyBars*i + tallyBars/2)
      .attr('y',tallyHeight*1.03)
      .attr('text-anchor','middle')
      .text(tallyIDs[i])
      .style('fill','white')
      .style('font-size',textRatio)

    tallySVG.append('text')
      .attr('x',tallyBars*i + tallyBars/2)
      .attr('y',tallyScale([totals[i]]) - 5)
      .attr('id','textTotal'+tallyIDs[i])
      .attr('class','barTotals')
      .attr('text-anchor','middle')
      .text(totals[i])
      .style('fill','white')
      .style('font-size',textRatio)
  }

  //append color key for stacked bars on bar graph
  var barKey = incidentGraph.append('g')
  barKey.append('rect')
    .attr('x', margin.left*1.5)
    .attr('y',margin.top)
    .attr('height', barWidth*2)
    .attr('width',barWidth*4)
    .style('fill',categories.killed)
    .style('opacity',0.5)
  barKey.append('text')
    .attr('x',margin.left*1.5+barWidth*4.25)
    .attr('y',margin.top + barWidth*2)
    .text('Killed')
    .style('fill','white')
    .style('font-size',textRatio)
  barKey.append('rect')
    .attr('x', margin.left*1.5)
    .attr('y',margin.top + barWidth*2.5)
    .attr('height', barWidth*2)
    .attr('width',barWidth*4)
    .style('fill',categories.injured)
      .style('opacity',0.75)
  barKey.append('text')
    .attr('x',margin.left*1.5+barWidth*4.25)
    .attr('y',margin.top + barWidth*2.5 + barWidth*2)
    .text('Injured')
    .style('fill','white')
    .style('font-size',textRatio)


  var layers = incidentGraph.selectAll('g.layer')
    .data(stacked,function(d){return d.type})
    .enter()
    .append('g')
    .attr('class','layer')
    .attr('fill',function(d){
      return categories[d.type]
    })
    .style('opacity',.75)


  var bars = layers.selectAll('rect')
    .data(function(d){return d.values})
    .enter()
    .append('rect')
    .attr('id',function(d,i){
      return 'bar'+i
    })
    .attr('x',function(d){
      return timeScale(dateFormat.parse(d.date)) + margin.left
    })
    .attr('width',barWidth)
    .attr('y',function(d){
      return timeY(d.y0 +d.y) + margin.top
    });

  bars.transition()
      .duration(250)
      .delay(function(d,i){
        return i * 5
      })
      .attr('height',function(d){
        return yScaleHeight - timeY(d.y)
      })
      .style('opacity',0.75);

  layers.selectAll('rect').on('mouseover',function(d,i){
      if (mouseBool === true){
        var selector = '#bar'+i;
        var incident = '#event'+i
        numText.text('Incidents To Date: ' + (i+1))
        dateText.text('Incident Date: ' + d.date)
        killText.text('# Killed: ' + shooting_data[i].properties.F__Killed)
        injText.text('# injured: ' + shooting_data[i].properties.F__Injured)
        LocText.text('Location: '+ shooting_data[i].properties.City_Or_Co)
        addText.text('Address: '+shooting_data[i].properties.Address)
        d3.select(incident).transition()
          .style('opacity',1)
          .attr('r',shootScale(maxKilled))
        d3.selectAll(selector).style('opacity',1)
          .transition()
            .attr('width',barWidth*2)
      }
    })
    .on('mouseout',function(d,i){
      if (mouseBool === true) {
        var selector = '#bar'+i
        var incident = '#event'+i
        numText.text('Incidents To Date: ' + shooting_data.length)
        dateText.text('Incident Date: ')
        killText.text('# Killed: ')
        injText.text('# injured: ')
        LocText.text('Location: ')
        addText.text('Address: ')
        d3.selectAll(selector)
          .style('opacity',0.75)
          .transition()
            .attr('width',barWidth)

        d3.select(incident).transition()
          .style('opacity',0.75)
          .attr('r',function(d){
            return shootScale(radiusFunction(d.properties.F__Killed));
          })
      }
    })

  features.selectAll('path')
    .data(states)
    .enter()
    .append('path')
    .attr('d',path)
    .style('stroke','white')
    .style('fill',function(d){
      if (d.properties.incidents >= 0){
        return colorScale(d.properties.incidents)
      } else {
        return '#595959'
      }
    })
    .on("mouseover",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip)


  var incidents = svg.selectAll('circle')
    .data(shooting_data)
    .enter()
    .append('circle')
    .attr('class','events')
    .attr('id',function(d,i){
      return 'event' + (i)
    })
    .attr('cx', function(d){return projection(d.geometry.coordinates)[0]})
    .attr('cy', function(d){return projection(d.geometry.coordinates)[1]})
    .style('fill', '#333333')
    .style('opacity',0.75)
    .style('stroke', 'white')
    .on('mouseover',function(d,i){
      if (mouseBool === true) {
        var bar = '#bar'+ i;
        d3.selectAll(bar)
          .style('opacity',1)
          .transition()
          .attr('width',barWidth*2)
        numText.text('Incidents To Date: ' + (i+1))
        dateText.text('Incident Date: ' + d.properties.Incident_D)
        killText.text('# Killed: ' + d.properties.F__Killed)
        injText.text('# injured: ' + d.properties.F__Injured)
        LocText.text('Location: '+ d.properties.City_Or_Co)
        addText.text('Address: '+d.properties.Address)
        //transition color
        d3.select(this).transition()
          .style('opacity',1)
      }
    })
    .on('mouseout',function(d,i){
      if (mouseBool === true){
        var bar = '#bar'+i
        numText.text('Incidents To Date: ' + shooting_data.length)
        dateText.text('Incident Date: ')
        killText.text('# Killed: ')
        injText.text('# injured: ')
        LocText.text('Location: ')
        addText.text('Address: ')
        d3.selectAll(bar)
          .style('opacity',0.75)
          .transition()
            .attr('width',barWidth)

        d3.select(this).transition()
          .style('fill','#333333')
          .style('opacity',0.75)
    }
    })
   incidents.transition()
      .duration(250)
      .delay(function(d,i){
        return i * 5
      })
      .attr('r',function(d){
      return shootScale(radiusFunction(d.properties.F__Killed));
    });


/***************************
*Animation Function
****************************/
$('#animate').on('click',function(){
  incidents.transition().ease('linear').duration(500).attr('r',0)
  bars.transition().ease('linear').duration(500).style('opacity',0)
  var tallyBars = tallySVG.selectAll('rect').transition()
    .attr('y',tallyHeight)
    .attr('height', 0)
  tallySVG.selectAll('.barTotals').transition()
    .attr('y',tallyHeight)
    .text('')

  console.log(bars)
  mouseBool = false;
  var killed = 0,
    injured = 0,
    total= 0;
  function animate(data,index){
    var shooting = '#event'+(index+5);
    var bar = '#bar'+ index;
    d3.select('#animate').classed('disabled', true)

    killed += data[index].properties.F__Killed;
    injured +=data[index].properties.F__Injured;
    total += data[index].properties.F__Killed+data[index].properties.F__Injured;


     if (index < data.length){
      var timer = setTimeout(function(){
        //update bar Totals
        tallySVG.select('rect#barTotalkilled').transition()
          .attr('y',tallyScale(killed))
          .attr('height',tallyHeight - tallyScale(killed))

        d3.select('#textTotalkilled').transition()
          .attr('y',tallyScale(killed)- 5)
          .text(killed)

        tallySVG.select('rect#barTotalinjured').transition()
          .attr('y',tallyScale(injured))
          .attr('height',tallyHeight - tallyScale(injured))

        d3.select('#textTotalinjured').transition()
          .attr('y',tallyScale(injured)- 5)
          .text(injured)

        tallySVG.select('rect#barTotaltotal').transition()
          .attr('y',tallyScale(total))
          .attr('height',tallyHeight - tallyScale(total))

        d3.select('#textTotaltotal').transition()
          .attr('y',tallyScale(total)- 5)
          .text(total)


        numText.text('Incidents To Date: ' + (index+1))
        dateText.text('Incident Date: ' + data[index].properties.Incident_D)
        killText.text('# Killed: ' + data[index].properties.F__Killed)
        injText.text('# injured: ' + data[index].properties.F__Injured)
        LocText.text('Location: '+ data[index].properties.City_Or_Co)
        addText.text('Address: '+data[index].properties.Address)
        d3.selectAll(bar).transition().style('opacity',0.95);
        d3.select(shooting)
          .transition()
          .duration(500)
          .attr('r',function(d){
          return shootScale(maxKilled*2)
          })
          .style('fill','none')
          .transition()
            .duration(500)
            .attr('r',function(d){
              return shootScale(radiusFunction(d.properties.F__Killed));
            })
            .style('fill','#333333')
          .transition().duration(500)
            .style('opacity',.75)

        animate(data, ++index);
      },300)
    }
    if (index == data.length - 1) {
      d3.select('#animate').classed('disabled', false)
      dateText.text('Incident Date: ' )
      killText.text('# Killed: ')
      injText.text('# injured: ')
      LocText.text('Location: ')
      addText.text('Address: ')
      clearTimeout(timer)
      mouseBool = true;

    }

  }
  animate(shooting_data,0);
}); //end animate callback


//Create a tooltip, hidden at the start
function showTooltip(d) {
  moveTooltip();

  tooltip.style("display","block")

      d3.select('.StateName').text(function(){return d.properties.NAME})
      d3.select('.incidents').text(function(){return d.properties.incidents})
      d3.select('.killed').text(function(){return d.properties.killed})
      d3.select('.injured').text(function(){return d.properties.injured})
      d3.select('.col-total').text(function(){return d.properties.Total})

}

//Move the tooltip to track the mouse
function moveTooltip() {
  tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
      .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
  tooltip.style("display","none");
}

};//end makeMap function
//Update map on zoom/pan
//function zoomed() {
//  features.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
//      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
//}


$(document).ready(function(){
  makeMap();
/*
  $(window).bind('resizeEnd', function() {
    makeMap()
});
   $(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 250);
    });
*/
});