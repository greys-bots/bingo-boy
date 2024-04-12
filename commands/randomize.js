const { Models: { SlashCommand } } = require('frame');
const {
	OFFSETS,
	LETTERS
} = require('../constants');
const Jimp = require('jimp');
const { AttachmentBuilder } = require('discord.js');
const { confBtns } = require('../extras')

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "randomize",
			description: "Randomize a board's spots",
			options: [
				{
					name: 'board',
					description: "The board to randomize",
					type: 3,
					required: true,
					autocomplete: true
				}
			],
			usage: [
				"[board] - Randomizes a given board"
			],
			permissions: ['ManageMessages'],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var bd = ctx.options.getString('board')?.trim().toLowerCase();
		var board = await this.#stores.boards.get(ctx.guild.id, bd);
		if(!board?.id) return "Board not found!";

		var msg = await ctx.reply({
			content: (
				"Are you sure you want to randomize this board?\n" +
				"This will completely clear any existing marks " +
				"and can't be undone without uploading the original board!"
			),
			components: [{
				type: 1,
				components: confBtns
			}],
			fetchReply: true
		})
		var conf = await this.#bot.utils.getConfirmation(
			this.#bot,
			msg,
			ctx.user
		)
		if(conf.msg) return conf.msg;
		else await ctx.followUp(
			"Okay, I'll randomize it!\n" +
			"(This might take a bit...)"
		);

		var m = board.original.split('/');
		var ch = await ctx.guild.channels.fetch(m[0]);
		var msg = await ch.messages.fetch(m[1]);
		var tmp = await Jimp.read(msg.attachments.first().url);

		var squares = [ ];
		var middle;
		for(var i = 0; i < OFFSETS.ARRAY.length; i++) {
			var o = OFFSETS.ARRAY[i];
			var t = tmp.clone();
			var c = await t.crop(o.x, o.y, 512, 512);
			if(i == 12) {
				middle = c;
				squares.push('skip');
			} else squares.push(c);
		}

		var sh = this.#bot.utils.shuffle(squares)
		var placed = tmp.clone();
		var skipped = OFFSETS.ARRAY[sh.indexOf('skip')];
		for(var i = 0; i < OFFSETS.ARRAY.length; i++) {
			var cd = OFFSETS.ARRAY[i]
			if(sh[i] == 'skip' && i !== 12) continue;
			if(i == 12) {
				placed = await placed.composite(middle, cd.x, cd.y, {
					mode: Jimp.BLEND_SOURCE_OVER,
					opacitySource: 1,
					opacityDest: 1
				});
				if(sh[i] !== 'skip') {
					placed = await placed.composite(sh[i], skipped.x, skipped.y, {
						mode: Jimp.BLEND_SOURCE_OVER,
						opacitySource: 1,
						opacityDest: 1
					});
				}
				continue;
			}
			
			placed = await placed.composite(sh[i], cd.x, cd.y, {
				mode: Jimp.BLEND_SOURCE_OVER,
				opacitySource: 1,
				opacityDest: 1
			});
		}
		
		var buff = await placed.getBufferAsync(Jimp.MIME_PNG);
		var att = new AttachmentBuilder(buff, { name: 'test.png' });
		msg = await ctx.followUp({
			content: `Here's your new board!`,
			files: [att],
			fetchReply: true
		});

		board.filled = [];
		board.original = `${msg.channel.id}/${msg.id}`;
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