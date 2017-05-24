$('.modal-btn').on('click', event => { //would filter if workings with all three datasets, instead of one
	if (event.target.id === 'Africamodal-btn'){
		//basic reformating of generic modal
		$('#futureModalLabel')[0].innerHTML = "<span class='OrangeOrange'>Country-by-Country Urban Growth in Africa</span>";
		$('.modal-header').find( "h6" )[0].innerText = '';
		let mWidth = $(this).innerWidth(), sq, sqw, sqh;

		if (mWidth>768){
		 		sq=Math.floor(mWidth*.7*.6), sqw = sq/2, sqh = sqw;
		 } else if (mWidth<768 && mWidth>480){
		 		sq=Math.floor(mWidth*.7*.95), sqw=sq, sqh=sqw;
		 } else if (mWidth<480){
		 		sq=Math.floor(mWidth*.9), sqw=sq, sqh=sq*.66;
		 }
		 console.log(mWidth, sq, sqw, sqh);

		$('.modal-body')[0].innerHTML = `<div class="row">
			<div class="col-lg-8 text-center">${slider('AfricaAll')}</div>
				<div class="col-lg-4 text-center Grey">
					<h4>Urban Population, % of Total</h4>
					<p><small> mouse-over for country stats ; click for summary at side</small></p>
					<!--show: <button class="datatype btn btn-default btn-sm" value="total">total pop.</button>
					<button class="datatype btn btn-default btn-sm" value="urban">urban pop.</button>
					<button class="datatype btn btn-default btn-sm" value="percent">% urban</button>-->
				</div>
			</div>
			<div class="row">
				<div class="col-lg-8 text-center" >

					<svg id='AfricaMap' width=${sq} height=${sq} viewBox="0 0 ${sq} ${sq}"></svg>
				</div>
				<div class="col-lg-4 text-center">
					<p class="Grey"><small>responsive 'mobile' map to be optimized, best on screens>768px wide</small></p>
					<h2 class="OrangeOrange" id="countryname"></h2>
					<svg id='AfricaCirc' width=${sqw} height=${sqh} viewBox="0 0 ${sqw} ${sqh}"></svg>
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
		gGeo = svgGeo.append('g').attr('id','gGeo'),
		gGeoLabel = svgGeo.append('g'),
		gOutline = svgGeo.append('g').attr('id','gOut'),

		w = svgGeo.attr('width'),
		h = w,
		labelpos = [20,h*.95, h*.85, h*.91];

		var category = 'percent'; //add buttons to shift categories

		//[40, 5] at fullscreen 604 or  [80+,-10] at mobile or 360, so 604-378=244
		let relW = (244-(w-378))/244;
		let lat = 40 + (40*relW), long = 5 - (18*relW);

		var projection = d3.geoEquirectangular()
		  .center([lat, long]) // the question is how to set this in ratio to window size, responsive sticking pt.
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
			//console.log(yrVal);

			gGeo.selectAll("path")
				  .data(africaPaths)
				  .enter()
				  .append("path")
				  .attr("d", path)
				  .attr('id', (d,i)=>`path${africaData[i].name.split(' ')[0]}`)
				  .attr("fill", (d,i)=>colorVar(d,i,category,yrVal))
				  .attr('class', 'WhiteSt')
				  .on("mouseover", (d,i)=>mouseOn(d,i,gGeoLabel, category, yrVal, labelpos))
				  .on("mouseout", (d,i)=>mouseOff(gGeoLabel))
				  .on('click', function(d,i){ return clickSideBar(d,i)});


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
  			var t = +africaData[i][category][yrVal]/afrMax+.2;
  		} else {
  			var t = (+africaData[i][category][yrVal] - +africaData[i][category][1])/afrUrbMax + .2;
  		};
  		return d3.interpolateYlOrRd(t);
}

function mouseOn(d,i,layer, category, yrVal, labelpos){
	let txt;
	let val;
	if (category==='percent'){
		txt = 'percent urban population';
		val = africaData[i][category][yrVal]+ ' %';
	} else if (category==='total'){
		txt = 'total population, thousands';
		val = africaData[i][category][yrVal].toLocaleString();
	} else {
		txt = 'total increase in urban populations since 1990, thousands';
		val = (+africaData[i][category][yrVal] - +africaData[i][category][1]).toLocaleString();
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
		.text(val) //country specific
		.attr('class', 'OrangeOrange H2 text-left')
		.attr('id', 'spectext')
		.attr('x', labelpos[0])
		.attr('y', labelpos[3]);
}

function mouseOff(layer){
	layer.selectAll('text').remove();
}


function clickSideBar(d,i){
	var row=africaData[i];
	var site = 'AfricaCirc';
	var index0 = 0, index = $('#AfricaAllyear')[0].value;
	var key2 ='AfricaAll';
	$('#countryname')[0].innerText = africaData[i].name;

	d3.select('#path2').remove();
	let pathway = d3.select(`#path${africaData[i].name.split(' ')[0]}`).attr('d');
	d3.select('#gOut').append('path').attr('d', pathway).attr('fill','none').attr('class', 'WhiteStselect').attr('id', 'path2');
	//correct for selection with names with spaces... add a hook.

	if ($('#AfricaCirc')[0].clientWidth<300){
		var sizes2= {
			hRel:($('#AfricaCirc')[0].clientHeight-40)/2*1.25,
			wRel:$('#AfricaCirc')[0].clientWidth-40,
			halfRel:$('#AfricaCirc')[0].clientWidth/2,
			offset: 20,
		}
	} else {
		var sizes2= {
			hRel:($('#AfricaCirc')[0].clientHeight-40),
			wRel:($('#AfricaCirc')[0].clientWidth-40)/2,
			halfRel:$('#AfricaCirc')[0].clientWidth/2,
			offset: 20,
		}
	}

	const rMax2=sizes2.wRel/2-10, tranRad2 = rMax2/afrMax;

	let children = $('#AfricaCirc').empty();

	addArcs(site, key2, row, index0, index, sizes2, null, tranRad2);



}
