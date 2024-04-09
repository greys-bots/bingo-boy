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

let CONSTANTS = {
	IMAGES: { },

	LETTERS,
	OFFSETS: {
		...OFFSETS,
		BOARD: generateOffsets('matrix'),
		ARRAY: generateOffsets('array')
	},

	MSG_PREFIX: "https://discord.com/channels"
};

Jimp.read(`${__dirname}/assets/template.png`)
.then((img) => CONSTANTS.IMAGES.TEMPLATE = img);

Jimp.read(`${__dirname}/assets/sticker.png`)
.then((img) => CONSTANTS.IMAGES.STICKER = img);

module.exports = CONSTANTS;