const tau = 2 * Math.PI; //for easy percentage conversions
const arc = d3.arc().startAngle(0);

const cardsSvg = $( ".svgPanes" ).toArray(); // basic addition of each svg graphic

cardsSvg.forEach((svgP) => { //add one visualization per 'card'

	let key=svgP.id.replace('Core', '');
	let data=coreData[key];
	let index0 = 0, index = 1;

	let hRel=330;
	let wRel=300;
	let halfRel=wRel/2;

	const offset=40;

	// Get the SVG container, and apply a transform such that the origin to arc center, keep labels at original location
	var svg = d3.select(`#${svgP.id}`),
			g = svg.append("g").attr("transform", "translate(" + halfRel + "," + hRel/2 + ")"),
			gLabel = svg.append("g"),
			mLabel = svg.append("g");

			mLabel.attr('id', key+'labels');

//------------------------------BASE GEOMETRY-------------------------------------

	//Add the background underlay, 50% white to reduce graphic impact of geography, change datum according to slider position
	var underlay = g.append("path")
		.datum({endAngle: tau, outerRadius: data.total[index0]*tranRad+offset, innerRadius: data.total[index0]*tranRad})
		.attr("class", "WhiteOp WhiteSt")
		.attr("d", arc);

	// Add the background arc in grey.
	var background = g.append("path")
		.datum({endAngle: tau, outerRadius: data.total[index0]*tranRad+offset, innerRadius: data.total[index0]*tranRad, label: (100 - data.percent[index0])})
		.attr("class", "Grey WhiteSt")
		.attr("d", arc)
		.on("mouseover", function(d){ mouseOverLabel(d, 'rural') })
		.on("mouseout", function(d){ mouseOutClear(d) });

	// Add the foreground arc in orange.
	var foreground = g.append("path")
		.datum({endAngle: tau, outerRadius: data.total[index0]*tranRad+offset, innerRadius: data.total[index0]*tranRad, label: (100 - data.percent[index0])})
		.attr("class", "Orange WhiteSt")
		.attr("d", arc)
		.on("mouseover", function(d){ mouseOverLabel(d, 'urban') })
		.on("mouseout", function(d){ mouseOutClear(d) });

//------------------------------BASE LABELS------------------------------------

	//non-transition labels for orientation
	let topLabel = gLabel.append("text")
		.text('total population, thousands')
		.attr("dy", hRel *.225)
		.attr("dx", halfRel)
		.attr('class', 'labelText Grey');

	let bottomLabel = gLabel.append("text")
		.text('urban population growth since 1990, thousands')
		.attr("dy", hRel *.985)
		.attr("dx", halfRel)
		.attr('class', 'labelText Grey');


	//transition labels for updated values, change datum according to slider position
	var topYear= gLabel.append("text")
			.datum({old: data.year[index0]})
			.text((d) => { return d.old })
			.attr('id', key+'topYear')
	  	.attr("dy", hRel *.075)
	  	.attr("dx", halfRel)
	  	.attr('class', 'labelH3 Grey');

	let bottomAdd = gLabel.append("text")
			.datum({old: data.urban[1]})
			.attr('id', key+'bottomAdd')
			.text('2050')
	  	.attr("dy", hRel *.95)
	  	.attr("dx", halfRel)
	  	.attr('class', 'labelH2 OrangeOrange');

	let centerPop= gLabel.append("text")
			.datum({old: data.total[index0]})
			.attr('id', key+'centerPop')
			.text('1,000,000')
	  	.attr("dy", hRel *.175)
	  	.attr("dx", halfRel)
	  	.attr('class', 'labelH1 OrangeOrange');

//----------------------initial transitions-------------------------
	update();

//-------------triggered transitions for year selections------------

	$(`#${key}year`).on( 'change', event=>{ //fullscale slider
			index0=index;
	 		index = +event.target.value; //shift index for update context

	 		update();

	});

	$(`.${key}altB`).on( 'click', event=>{ //mobile friendlier buttons
		let year=event.target.outerText;
		let adj = {'1990':1, '2014':2, '2050':3 };

			index0=index;
	 		index = +adj[year]; //shift index for update context

	 		console.log(index);
	 		update();

	});


//----------------------function holding all transitions-------------------------
	function update(){

		underlay.transition().duration(750)
				.attrTween("d", arcTween(tau, data.total[index]*tranRad+offset, null));

		background.transition().duration(750)
				.attrTween("d", arcTween(tau, data.total[index]*tranRad+offset, 100-data.percent[index]));

		foreground.transition().duration(750)
				.attrTween("d", arcTween(data.percent[index]/100 * tau, data.total[index]*tranRad+offset, data.percent[index]));

		topYear.transition().duration(750)
			.tween("text", textTween(data.year[index0], data.year[index], key+'topYear'));

		bottomAdd.transition().duration(750)
			.tween("text", textTween(data.urban[index0], (data.urban[index]-data.urban[1]), key+'bottomAdd'));

		centerPop.transition().duration(750)
			.tween("text", textTween(data.total[index0], data.total[index], key+'centerPop'));

	}

//----------------------functions for rescaling size and percentage on arcs-----------------------------
	function arcTween(newAngle, outerRadius, label) {

	  return function(d) {
		    var interpolate = d3.interpolate(d.endAngle, newAngle);
		    var inter = d3.interpolate(d.outerRadius, outerRadius);
		    var i = d3.interpolate(d.innerRadius, outerRadius-offset);
		    if (label) {var iLabel = d3.interpolate(d.label, label)};

	    return function(t) {
	      d.endAngle = interpolate(t);
	      d.outerRadius = inter(t);
	      d.innerRadius = i(t);
	      if (label){d.label=iLabel(t)};

	      return arc(d);
	    };
	  };
	}

	function textTween(oldText,newText,id) {

	  return function(d) {
		    var that = d3.select(`#${id}`),
		    	i = d3.interpolateNumber(oldText, newText);
		    if (id.includes('Year')){
					return function(t) { that.text(Math.floor(i(t))); };
				} else {
					return function(t) { that.text(Math.floor(i(t)).toLocaleString()); };
				}
				;
	  };
	}


//----------------------functions for mouseOver / mouseOut----------------------------
	function mouseOverLabel(d, type) {

		var labelM = d3.select(`#${key}labels`)
			.append("text")
			.text(Math.floor(d.label) + '% '+type)
			.attr('id', 'labelM')
			.attr("dy", hRel *.85)
			.attr("dx", halfRel)
			.attr('class', 'labelH1L OrangeOrange');
	}

	function mouseOutClear() {

		d3.select(`#labelM`).remove();
	}


})

