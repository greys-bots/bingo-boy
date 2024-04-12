const { Models: { SlashCommand } } = require('frame');
const {
	IMAGES,
	OFFSETS: { BOARD },
	LETTERS,
	WINS
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
			permissions: ['ManageMessages'],
			guildOnly: true
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
		if(board.filled?.includes(coord)) return "That space has already been filled!";
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

		// check for wins
		board.filled.push(coord);
		var m = `Mark placed at ${coord}!`;
		var nw = false;
		if(!board.bingos) board.bingos = [];
		for(var i = 0; i < WINS.length; i++) {
			if(board.bingos?.includes(i)) continue;
			var w = WINS[i];
			var bc = w.filter(x => board.filled.includes(x));
			if(bc?.length !== 5) continue;

			nw = true;
			board.bingos.push(i);
			var cd;
			var wimg;
			if(board.bingos.length == 12) {
				cd = { x: 0, y: 0 };

				wimg = IMAGES.FULL;
			} else if(i < 5) {
				var p = w[0].split('');
				cd = BOARD[p[0]][p[1]];

				wimg = IMAGES.VERT;
			} else if(i < 10) {
				var p = w[0].split('');
				cd = BOARD[p[0]][p[1]];

				wimg = IMAGES.HORT;
			} else if(i == 10) {
				cd = { x: 0, y: 0 };

				wimg = IMAGES.DIAG_TLBR;
			} else if(i == 11) {
				cd = { x: 0, y: 0 };

				wimg = IMAGES.DIAG_BLTR;
			}

			placed = placed.composite(wimg, cd.x, cd.y, {
				mode: Jimp.BLEND_SOURCE_OVER,
				opacitySource: 1,
				opacityDest: 1
			})
		}
		
		if(board.bingos?.length) {
			if(nw) {
				if(board.bingos.length == 12) m += `\n🎉 **This board is now totally full!** 🎉`;
				else m += `\n**New bingo made!**`;
			}
			m += `\nCurrent bingo count: ${board.bingos.length}`;
		}

		// send image and get new message
		var buff = await placed.getBufferAsync(Jimp.MIME_PNG);
		var att = new AttachmentBuilder(buff, { name: 'test.png' });
		msg = await ctx.followUp({
			content: m,
			files: [att],
			fetchReply: true
		});

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