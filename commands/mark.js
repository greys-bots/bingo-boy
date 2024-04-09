const { Models: { SlashCommand } } = require('frame');
const {
	IMAGES,
	OFFSETS: { BOARD },
	LETTERS
} = require('../constants');
const Jimp = require('jimp');
const { AttachmentBuilder } = require('discord.js');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "mark",
			description: "Mark a spot on a given board",
			options: [
				{
					name: 'board',
					description: "The board to mark",
					type: 3,
					required: true,
					autocomplete: true
				},
				{
					name: 'coord',
					description: "Coordinates of the box to fill in, eg. B2",
					type: 3,
					required: true
				}
			],
			usage: [
				"[board] [coord] - Marks a spot on a given board"
			],
			permissions: ['ManageMessages']
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.deferReply();
		var bd = ctx.options.getString('board')?.trim().toLowerCase();
		var board = await this.#stores.boards.get(ctx.guild.id, bd);
		if(!board?.id) return "Board not found!";
		
		var coord = ctx.options.getString('coord')?.trim().toUpperCase();
		if(!coord?.length == 2) return "A coordinate should look like `B2`, `G3`, etc";
		var parts = coord.split("");
		parts[1] = parseInt(parts[1]);
		if(
			!LETTERS.includes(parts[0]) ||
			isNaN(parts[1]) ||
			(parts[1] > 5 || parts[0] < 1)
		) return "Invalid coordinate given!";

		var rn = BOARD[parts[0]][parts[1]];

		var m = board.latest.split('/');
		var ch = await ctx.guild.channels.fetch(m[0]);
		var msg = await ch.messages.fetch(m[1]);
		var tmp = await Jimp.read(msg.attachments.first().url);
		var st = IMAGES.STICKER;

		var placed = tmp.composite(st, rn.x, rn.y, {
			mode: Jimp.BLEND_SOURCE_OVER,
			opacitySource: 0.5,
			opacityDest: 1
		})

		var buff = await placed.getBufferAsync(Jimp.MIME_PNG);
		var att = new AttachmentBuilder(buff, { name: 'test.png' });
		msg = await ctx.followUp({
			content: `Mark placed at ${coord}!`,
			files: [att],
			fetchReply: true
		});

		board.filled.push(coord);
		board.latest = `${msg.channel.id}/${msg.id}`;
		await board.save()
		return;
	}

	async auto(ctx) {
		var boards = await this.#stores.boards.getAll(ctx.guild.id);
		var foc = ctx.options.getFocused();
		if(!foc) return boards.map(b => ({ name: b.name, value: b.hid }));
		foc = foc.toLowerCase()

		if(!boards?.length) return [];

		return boards.filter(b =>
			b.hid.includes(foc) ||
			b.name.toLowerCase().includes(foc)
		).map(b => ({
			name: b.name,
			value: b.hid
		}))
	}
}

module.exports = (bot, stores) => new Command(bot, stores);