module.exports = {
	shuffle(arr) {
		let array = arr.slice(0);
		
		for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		
		return array;
	},

	matrixArray(arr, rows, max) {
		let matrix = [ ];
		for(var i = 0; i < rows; i++) {
			matrix[i] = [ ]
		}
		
		let ind = 0;
		for(var i = 0; i < arr.length; i++) {
			if(i > 0 && i % max == 0) ind += 1;
			matrix[ind][i % max] = arr[i];
		}

		return matrix;
	},
	
}