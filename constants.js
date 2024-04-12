const Jimp = require('jimp');

const OFFSETS = {
	X: 220,
	Y: 1040,
	W: 3000,
	H: 3700
}

const LETTERS = [ 'B', 'I', 'N', 'G', 'O' ];

function generateOffsets(type) {
	let o;
	switch(type) {
		case 'matrix':
			o = { };
			for(var l = 0; l < LETTERS.length; l++) {
				var lx = LETTERS[l];
				o[lx] = [ ];
				for(var i = 1; i < 6; i++) {
					o[lx][i] = {
						x: OFFSETS.X + (512 * l),
						y: OFFSETS.Y + (512 * (i - 1))
					}
				}
			}
			break;
		case 'array':
			o = [ ];
			for(var l = 0; l < LETTERS.length; l++) {
				for(var i = 1; i < 6; i++) {
					o.push({
						x: OFFSETS.X + (512 * l),
						y: OFFSETS.Y + (512 * (i - 1))
					})
				}
			}
			break;
	}

	return o;
}

function generateWins() {
	var Vwins = [ ];
	for(var l = 0; l < LETTERS.length; l++) {
		Vwins[l] = [ ];
		for(var i = 1; i < 6; i++) {
			Vwins[l].push(`${LETTERS[l]}${i}`);
		}
	}

	var Hwins = [ ];
	for(var i = 1; i < 6; i++) {
		Hwins[i - 1] = [ ];
		for(var l = 0; l < LETTERS.length; l++) {
			Hwins[i - 1].push(`${LETTERS[l]}${i}`);
		}
	}

	var wins = [
		...Vwins,
		...Hwins,
		['B1', 'I2', 'N3', 'G4', 'O5'],
		['B5', 'I4', 'N3', 'G2', 'O1']
	]

	console.log(wins);
	return wins;
}

let CONSTANTS = {
	IMAGES: { },

	LETTERS,
	OFFSETS: {
		...OFFSETS,
		BOARD: generateOffsets('matrix'),
		ARRAY: generateOffsets('array')
	},
	WINS: generateWins(),

	MSG_PREFIX: "https://discord.com/channels"
};

Jimp.read(`${__dirname}/assets/template.png`)
.then((img) => CONSTANTS.IMAGES.TEMPLATE = img);

Jimp.read(`${__dirname}/assets/sticker.png`)
.then((img) => CONSTANTS.IMAGES.STICKER = img);

Jimp.read(`${__dirname}/assets/diag_bltr.png`)
.then((img) => CONSTANTS.IMAGES.DIAG_BLTR = img);

Jimp.read(`${__dirname}/assets/diag_tlbr.png`)
.then((img) => CONSTANTS.IMAGES.DIAG_TLBR = img);

Jimp.read(`${__dirname}/assets/hort.png`)
.then((img) => CONSTANTS.IMAGES.HORT = img);

Jimp.read(`${__dirname}/assets/vert.png`)
.then((img) => CONSTANTS.IMAGES.VERT = img);

Jimp.read(`${__dirname}/assets/blackout.png`)
.then((img) => CONSTANTS.IMAGES.FULL = img);

module.exports = CONSTANTS;