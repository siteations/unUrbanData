//Normally, I'd use react to deal with sub-components, but for a single page (no larger report)
//jQuery works well enough for iterative component generation and cuts down on the need for webpack, babel, extra transition modules, etc.

//It's not the nicest thing on the eyes through...

const area = ['Africa', 'Latin-America', 'Asia'];

const cards = $( ".cardOut" ).toArray();

const slider = (Areas) => {

	return `<div class="hidden-sm hidden-xs">
				<div class="slider">
					<div class="col-xs-4 text-left npadding"><small>1990</small></div>
					<div class="col-xs-4 text-center npadding"><small>2014</small></div>
					<div class="col-xs-4 text-right npadding"><small>2050</small></div>
					<input type="range" class="slider" id="${Areas}year" max="3" min="1" step="1" list="steplist" value="1" />
						<datalist id="steplist">
						    <option>1</option>
						    <option>2</option>
						    <option>3</option>
						</datalist>
				</div>
		</div>
		<div class="hidden-md hidden-lg">
			<div class="slider">
					<div class="col-xs-4 text-left npadding btn btn-default btn-sm ${Areas}altB">1990</div>
					<div class="col-xs-4 text-center npadding btn btn-default btn-sm ${Areas}altB">2014</div>
					<div class="col-xs-4 text-right npadding btn btn-default btn-sm ${Areas}altB">2050</div>
			</div>
		</div>`
};

cards.forEach((card, i) => {
	let img = coreData[area[i]].img;

	let content =`<div class="card smShadow" id="${area[i]}">
		<h2 class="OrangeOrange">${area[i]}</h2>`

	let svgArea = `<svg id="${area[i]}Core" class="svgPanes inShadow" viewBox="0 0 300 330">
			<rect stroke="lightgrey" fill="black" fill-opacity=".02" x="0" y="0" width="300" height="330" />
			<image xlink:href="${img}" x="0" y="15" width="300" height="300" />
		</svg>
		<p><small>mouse-over for <span class="OrangeText">urban</span> & <span class="Grey">rural</span> percentages</small></p>
		<button type="button" class="btn btn-default btn-sm modal-btn" id="${area[i]}modal-btn" data-toggle="modal" data-target="#detailModal" data-whatever="${area[i]}">Click for Country-Level Details</button>
	</div>`;

	card.innerHTML = content+slider(area[i])+svgArea;

})

