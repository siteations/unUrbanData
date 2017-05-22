d3.text('js/africa.txt', (data)=>{

	let rows = data.split('\n');
	let master=[];

	rows.forEach(row=>{
		let dataObj={}

		const regex = /([a-zA-Z]*)/gi;
		var name = row.match(regex).filter(word=>{
			return word.trim().length>0;
		}).join(' ');

		dataObj.name = name;

		row=row.replace(name, '').trim();

		let rowArr = row.split(' ');
		dataObj.annual = rowArr.pop();
		let p3 = rowArr.pop(), p2 = rowArr.pop(), p1 = rowArr.pop();
		dataObj.percent = [p1, p2, p3];

		//easy, non-count conversions
		if (rowArr.length === 6) {
			dataObj.urban = [rowArr[0], rowArr[1], rowArr[2]];
			dataObj.rural = [rowArr[3], rowArr[4], rowArr[5]];
		} else if (rowArr.length === 12) {
			dataObj.urban = [rowArr[0]+rowArr[1], rowArr[2]+rowArr[3], rowArr[4]+rowArr[5]];
			dataObj.rural = [rowArr[6]+rowArr[7], rowArr[8]+rowArr[9], rowArr[10]+rowArr[11]];
		} else { //7, 8, 9, 10, 11 series... with 1 and 2 being the start of thousand +
			var	holderArr=[];

			for (let i=0; i<rowArr.length; i++){
				if (rowArr[i].length < 3){
					holderArr.push(rowArr[i]+rowArr[i+1]);
					i++
				} else {
					holderArr.push(rowArr[i])
				}
			}

			if (holderArr.length===6){
				dataObj.urban = [holderArr[0], holderArr[1], holderArr[2]];
				dataObj.rural = [holderArr[3], holderArr[4], holderArr[5]];
			} else if (holderArr.length===5){
				dataObj.urban = [holderArr[0], holderArr[1], holderArr[2]];
				dataObj.rural = [holderArr[3], holderArr[4].substring(0,2), holderArr[4].substring(2,2)];
			}


		}


			dataObj.year=[1990,2014,2050];
			master.push(dataObj);

	})

//catching blank row at end;
master.pop();

//output and save;
console.log(JSON.stringify(master));












})
