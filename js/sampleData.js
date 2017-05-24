//MAIN RADIAL GRAPHS, NUMBER FROM UN APPENDIX

const coreData = {
	Africa: {
		year: [1990,2014,2050],
		rural: [433064,682885,1054609],
		urban: [196923,455345,1338566],
		percent: [31,40,56],
		annual: 1.1,
		img: 'img/Africa.svg',
	},
	'Latin-America': {
		year: [1990,2014,2050],
		rural: [131327, 127565, 107935],
		urban: [313876, 495875, 673631],
		percent: [71, 80, 86],
		annual: 0.3,
		img: 'img/Latin-America.svg',
	},
	Asia: {
		year: [1990,2014,2050],
		rural: [2176877, 2278044, 1850638],
		urban: [1036237, 2064211, 3313424],
		percent: [32, 48, 64],
		annual: 1.5,
		img: 'img/Asia.svg',
	}
};

const allTotals=[];
const afrTotals=[];
const afrUrbDiffs=[];

function arrUpdate (coreData, bool) {

	for (areas in coreData){
		//0 index for opening transition from nothing
		 coreData[areas].year.unshift(0), coreData[areas].rural.unshift(0), coreData[areas].urban.unshift(0), coreData[areas].percent.unshift(0);

		let total1990 = +coreData[areas].rural[1] + +coreData[areas].urban[1];
		let total2014 = +coreData[areas].rural[2] + +coreData[areas].urban[2];
		let total2050 = +coreData[areas].rural[3] + +coreData[areas].urban[3];

		let urbDiff1990 = +coreData[areas].urban[1]- +coreData[areas].urban[1];
		let urbDiff2014 = +coreData[areas].urban[2]- +coreData[areas].urban[1];
		let urbDiff2050 = +coreData[areas].urban[3]- +coreData[areas].urban[1];

		coreData[areas].total = [0, total1990, total2014, total2050];

		if (bool) {allTotals.push(...coreData[areas].total)} else { afrTotals.push(...coreData[areas].total); afrUrbDiffs.push(...coreData[areas].urban) };
	};

};

arrUpdate(coreData, true);
arrUpdate(africaData);

const mapMax=Math.max(...allTotals), rMax=80, tranRad = rMax/mapMax;
const afrMax = Math.max(...afrTotals), afrUrbMax = Math.max(...afrUrbDiffs);



