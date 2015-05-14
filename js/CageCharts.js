//dimensions
var aspect = 1.8;
var width = $("#chart").width();
var height = width/ aspect;
radius = height/2-10

//Create an SVG and append to #map div
var watched = 0;
var dataset;
d3.csv('Data/CageData.csv', function(data){
	dataset = data
	for (var i = 0; i < dataset.length; i++) {
		if (dataset[i].Status == "Unwatched"){
			watched ++
		}
	}
});
console.log(watched)

var width = 960,
    height = 500,
    τ = 2 * Math.PI; // http://tauday.com/tau-manifesto

// An arc function with all values bound except the endAngle. So, to compute an
// SVG path string for a given angle, we pass an object with an endAngle
// property to the `arc` function, and it will return the corresponding string.
var arc = d3.svg.arc()
    .innerRadius(180)
    .outerRadius(240)
    .startAngle(0);

// Create the SVG container, and apply a transform such that the origin is the
// center of the canvas. This way, we don't need to position arcs individually.
var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

// Add the background arc, from 0 to 100% (τ).
var background = svg.append("path")
    .datum({endAngle: τ})
    .style("fill", "#ddd")
    .attr("d", arc);

// Add the foreground arc in orange, currently showing 12.7%.
var foreground = svg.append("path")
    .datum({endAngle: .127 * τ})
    .style("fill", "orange")
    .attr("d", arc);

// Every so often, start a transition to a new random angle. Use transition.call
// (identical to selection.call) so that we can encapsulate the logic for
// tweening the arc in a separate function below.
setInterval(function() {
  foreground.transition()
      .duration(750)
      .call(arcTween, Math.random() * τ);
}, 1500);

// Creates a tween on the specified transition's "d" attribute, transitioning
// any selected arcs from their current angle to the specified new angle.
function arcTween(transition, newAngle) {

  // The function passed to attrTween is invoked for each selected element when
  // the transition starts, and for each element returns the interpolator to use
  // over the course of transition. This function is thus responsible for
  // determining the starting angle of the transition (which is pulled from the
  // element's bound datum, d.endAngle), and the ending angle (simply the
  // newAngle argument to the enclosing function).
  transition.attrTween("d", function(d) {

    // To interpolate between the two angles, we use the default d3.interpolate.
    // (Internally, this maps to d3.interpolateNumber, since both of the
    // arguments to d3.interpolate are numbers.) The returned function takes a
    // single argument t and returns a number between the starting angle and the
    // ending angle. When t = 0, it returns d.endAngle; when t = 1, it returns
    // newAngle; and for 0 < t < 1 it returns an angle in-between.
    var interpolate = d3.interpolate(d.endAngle, newAngle);

    // The return value of the attrTween is also a function: the function that
    // we want to run for each tick of the transition. Because we used
    // attrTween("d"), the return value of this last function will be set to the
    // "d" attribute at every tick. (It's also possible to use transition.tween
    // to run arbitrary code for every tick, say if you want to set multiple
    // attributes from a single function.) The argument t ranges from 0, at the
    // start of the transition, to 1, at the end.
    return function(t) {

      // Calculate the current arc angle based on the transition time, t. Since
      // the t for the transition and the t for the interpolate both range from
      // 0 to 1, we can pass t directly to the interpolator.
      //
      // Note that the interpolated angle is written into the element's bound
      // data object! This is important: it means that if the transition were
      // interrupted, the data bound to the element would still be consistent
      // with its appearance. Whenever we start a new arc transition, the
      // correct starting angle can be inferred from the data.
      d.endAngle = interpolate(t);

      // Lastly, compute the arc path given the updated data! In effect, this
      // transition uses data-space interpolation: the data is interpolated
      // (that is, the end angle) rather than the path string itself.
      // Interpolating the angles in polar coordinates, rather than the raw path
      // string, produces valid intermediate arcs during the transition.
      return arc(d);
    };
  });
}
//var chart = c3.generate({
//	bindto: '#chart',
//	padding: {
//		top: 50,
//		bottom: 50
//	},
//	data:{
//		columns:[
//		['data', 37]
//
//		],
//		type: 'gauge'
//	},
//	size:{
//		height: height
//	},
//	transition: {
//		duration: 500
//	}
	//color: {
		//pattern: ['#FF000','#F97600','#F6c00','#60B044'],
		//threshold:{
		//	values: [25,50,75,100]

	//	}
	//}
//});
//chart.load({
//});