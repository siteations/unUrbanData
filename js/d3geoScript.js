$('.modal-btn').on('click', event => { //would filter if workings with all three datasets, instead of one
	if (event.target.id === 'Africamodal-btn'){
		//basic reformating of generic modal
		$('#futureModalLabel')[0].innerHTML = "<span class='OrangeOrange'>Country-by-Country Urban Growth in Africa</span>";
		$('.modal-header').find( "h6" )[0].innerText = '';

		//modal ratio 10:7 on full screen, on mobile 1:2...
		let mWidth = Math.floor(this.innerWidth*.7), sq,sqw, sqh;
		 if (mWidth>768){
		 		sq=Math.floor(.55*mWidth), sqw = sq/2, sqh = sq;
		 } else if (mWidth<768){
		 		sq=Math.floor(mWidth/.7*.8), sqw=sq, sqh=sq/2;
		 }

		$('.modal-body')[0].innerHTML = `<div class="row">
			<div class="col-sm-8 col-xs-12 text-center">${slider('AfricaAll')}</div>
				<div class="col-xs-4 col-xs-12 text-center Grey">
					show: <button class="datatype btn btn-default btn-sm" value="total">total pop.</button>
					<button class="datatype btn btn-default btn-sm" value="urban">urban pop.</button>
					<button class="datatype btn btn-default btn-sm" value="percent">% urban</button>
				</div>
			</div>
			<div class="row">
				<div class="col-sm-8 col-xs-12 text-center">

					<svg id='AfricaMap' width=${sq} height=${sq} viewBox = "0 0 ${sq} ${sq}"></svg>
				</div>
				<div class="col-xs-4 col-xs-12 text-center">
					<p>likely need a different color scale for totals/population vs. percentages<p>
					<p>stacked donut charts here in next step, triggered on click on country</p>
					<svg id='AfricaCirc' width=${sqw} height=${sqh} viewBox = "0 0 ${sqw} ${sqh}"></svg>
				</div>
			</div>`;

		addMap();

	} else { // not required once full data is in play, then do nothing;
		$('#futureModalLabel')[0].innerText = 'Country-by-Country Urban Growth'; //incase following
		$('.modal-header').find( "h6" )[0].innerHTML =  '<em>So this falls outside initial 4hr exercise, but I might add this in a second folder.</em>';
		$('.modal-body')[0].innerHTML = '<p>Chloropleth geographies here in future variation; data matched by country to a geojson from natural earth.</p><p>See Africa for initial example.</p>';
	}

})

//d3geographies in following functions
function addMap(){

	var svgGeo = d3.select('#AfricaMap'),
		gGeo = svgGeo.append('g'),
		gGeoLabel = svgGeo.append('g'),

		w = svgGeo.attr('width'),
		h = w,
		labelpos = [20,h*.95, h*.85, h*.91];

		var category = 'percent'; //add buttons to shift categories

		var projection = d3.geoEquirectangular()
		  .center([50, 5]) // the question is how to set this in ratio to window size, responsive sticking pt.
		  .scale(w*.73);

  	var path = d3.geoPath().projection(projection);

		//basics establish, UN data already loaded, load geojson/projections and join for master dataset
		d3.json ("js/ne_countries.json", countries => {

			const afrCountries = africaData.map(each=>each.name);

			const africanGeo = countries.features.filter(country=> {
				let cond = afrCountries.indexOf(country.properties.name_long) !== -1;
				if (cond) {afrCountries.splice(afrCountries.indexOf(country.properties.name_long), 1)};

				return cond;
			});

			//geometries ordered in parallel array

			const africaPaths = africaData.map(each=>{

				africanGeo.forEach(entry=>{
					if (entry.properties.name_long===each.name){
						each.geometry=entry.geometry;
					}
				});
				return each.geometry;
			});

			//joined and ready for visualization
			var yrVal = $('#AfricaAllyear')[0].value; //add update function at end for change there

			gGeo.selectAll("path")
				  .data(africaPaths)
				  .enter()
				  .append("path")
				  .attr("d", path)
				  .attr("fill", (d,i)=>colorVar(d,i,category,yrVal))
				  .attr('class', 'WhiteSt')
				  .on("mouseover", (d,i)=>mouseOn(d,i,gGeoLabel, category, yrVal, labelpos))
				  .on("mouseout", (d,i)=>mouseOff(gGeoLabel));


//-------------triggered transitions for year/category selections------------

			$(`#AfricaAllyear`).on( 'change', event=>{ //fullscale slider
			 		yrVal = +event.target.value; //shift index for update context

			 		updateGeo(yrVal,category);

			});

			$(`.AfricaAllaltB`).on( 'click', event=>{ //mobile friendlier buttons
				let year=event.target.outerText;
				let adj = {'1990':1, '2014':2, '2050':3 };

			 		yrVal = +adj[year]; //shift index for update context

			 		updateGeo(yrVal,category);

			});

			$(`.datatype`).on( 'click', event=>{ //fullscale slider
			 		category = event.target.value; //shift index for update context
			 		updateGeo(yrVal,category);

			});


//-------------function updates---------------------------
				function updateGeo(yrVal,category){

					gGeo.selectAll("path").transition().duration(750)
						.attr("fill", (d,i)=>colorVar(d,i,category,yrVal))
				}


		});



}


//---------------general reuse structures-----------------------

function colorVar(d,i,category,yrVal){
	if (category==='percent'){
  			var t = +africaData[i][category][yrVal]/100;
  		} else if (category==='total'){
  			var t = +africaData[i][category][yrVal]/afrMax;
  		} else {
  			var t = +africaData[i][category][yrVal]/afrUrbMax;
  		};
  		return d3.interpolateYlOrRd(t);
}

function mouseOn(d,i,layer, category, yrVal, labelpos){
	let txt;
	if (category==='percent'){
		txt = 'percent urban population';
	} else if (category==='total'){
		txt = 'total population, thousands';
	} else {
		txt = 'total urban population, thousands';
	};

	layer.selectAll('text').remove();

	layer.append("text")
		.text(africaData[i].name) //large title
		.attr('class', 'Grey H2 text-left')
		.attr('id', 'nametext')
		.attr('x', labelpos[0])
		.attr('y', labelpos[2]);

	layer.append("text")
		.text(txt) //subtitle title
		.attr('class', 'Grey text-left')
		.attr('id', 'typetext')
		.attr('x', labelpos[0])
		.attr('y', labelpos[1]);

	layer.append("text")
		.text(africaData[i][category][yrVal]) //country specific
		.attr('class', 'OrangeOrange H2 text-left')
		.attr('id', 'spectext')
		.attr('x', labelpos[0])
		.attr('y', labelpos[3]);
}

function mouseOff(layer){
	layer.selectAll('text').remove();
}
