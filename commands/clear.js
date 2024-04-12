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
			name: "clear",
			description: "Clear a board's marked spots",
			options: [
				{
					name: 'board',
					description: "The board to clear",
					type: 3,
					required: true,
					autocomplete: true
				}
			],
			usage: [
				"[board] - Clears a given board"
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
				"Are you sure you want to clear this board?\n" +
				"This will completely remove any existing marks!"
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

		var m = board.current.split('/');
		var ch = await ctx.guild.channels.fetch(m[0]);
		var omsg = await ch.messages.fetch(m[1]);
		
		var msg = await ctx.followUp({
			content: `Board cleared!`,
			files: [omsg.attachments.first()],
			fetchReply: true
		});

		board.filled = [];
		board.current = `${msg.channel.id}/${msg.id}`;
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