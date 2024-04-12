const { Models: { DataStore, DataObject } } = require('frame');

const KEYS = {
	id: { },
	hid: { },
	server_id: { },
	name: { patch: true },
	original: { },
	latest: { patch: true },
	filled: { patch: true },
	bingos: { patch: true }
}

class Board extends DataObject {	
	constructor(store, keys, data) {
		super(store, keys, data);
	}
}

class BoardStore extends DataStore {
	constructor(bot, db) {
		super(bot, db)
	}

	async init() {
		await this.db.query(`CREATE TABLE IF NOT EXISTS boards (
			id 					SERIAL PRIMARY KEY,
			hid 				TEXT default find_unique('boards'),
			server_id 			TEXT,
			name				TEXT,
			original 			TEXT,
			latest 				TEXT,
			filled 				TEXT[],
			bingos				INTEGER[]
		)`)
	}

	async create(data = {}) {
		try {
			var c = await this.db.query(`INSERT INTO boards (
				server_id,
				name,
				original,
				latest,
				filled,
				bingos
			) VALUES ($1,$2,$3,$4,$5,$6)
			RETURNING id`,
			[data.server_id, data.name, data.original, data.latest, data.filled, data.bingos]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return await this.getID(c.rows[0].id);
	}

	async index(server, data = {}) {
		try {
			await this.db.query(`INSERT INTO boards (
				server_id,
				name,
				original,
				latest,
				filled,
				bingos
			) VALUES ($1,$2,$3,$4,$5,$6)
			RETURNING id`,
			[data.server_id, data.name, data.original, data.latest, data.filled, data.bingos]);
		} catch(e) {
			console.log(e);
	 		return Promise.reject(e.message);
		}
		
		return;
	}

	async get(server, hid) {
		try {
			var data = await this.db.query(`SELECT * FROM boards WHERE server_id = $1 AND hid = $2`,[server, hid]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Board(this, KEYS, data.rows[0]);
		} else return new Board(this, KEYS, {server_id: server});
	}

	async getID(id) {
		try {
			var data = await this.db.query(`SELECT * FROM boards WHERE id = $1`,[id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return new Board(this, KEYS, data.rows[0]);
		} else return new Board(this, KEYS, {});
	}

	async getAll(server) {
		try {
			var data = await this.db.query(`SELECT * FROM boards WHERE server_id = $1`,[server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		if(data.rows?.[0]) {
			return data.rows.map(b => new Board(this, KEYS, b));
		} else return [];
	}

	async update(id, data = {}) {
		try {
			await this.db.query(`UPDATE boards SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async deleteAll(server) {
		try {
			var data = await this.db.query(`DELETE FROM boards WHERE server_id = $1`,[server]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async delete(id) {
		try {
			await this.db.query(`DELETE FROM boards WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}
}

module.exports = (bot, db) => new BoardStore(bot, db);