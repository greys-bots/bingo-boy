const { Models: { SlashCommand } } = require('frame');
const { AttachmentBuilder } = require('discord.js');
const { MSG_PREFIX: PREFIX } = require('../constants');
const Jimp = require('jimp');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "view",
			description: "View the server bingo boards",
			options: [{
				name: 'board',
				description: "A specific board to view",
				type: 3,
				required: false,
				autocomplete: true
			}],
			usage: [
				"- Lists all available boards",
				"[board] - Views a specific board"
			],
			ephemeral: true,
			permissions: ['ManageMessages']
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var hid = ctx.options.getString('board')?.trim().toLowerCase();

		if(!hid) {
			var boards = await this.#stores.boards.getAll(ctx.guild.id);
			if(!boards?.length) return "No boards to view!";

			console.log(boards)
			var embeds = await this.#bot.utils.genEmbeds(
				this.#bot,
				boards,
				(b) => {
					return {
						name: b.name,
						value: (
							`**Original post:** ${PREFIX}/${ctx.guild.id}/${b.original}\n` +
							`**Latest post:** ${PREFIX}/${ctx.guild.id}/${b.latest}`
						)
					}
				},
				{
					title: "Boards",
					description: "Current bingo boards"
				}, 10
			);

			console.log(embeds[0].embed);
			if(!embeds[1]) return {
				embeds: [
					embeds[0].embed
				]
			}
			return embeds;
		}

		var board = await this.#stores.boards.get(ctx.guild.id, hid);
		if(!board?.id) return "Board not found!";

		var parts = board.latest.split('/');
		var ch = await ctx.guild.channels.fetch(parts[0]);
		var msg = await ch.messages.fetch(parts[1]);

		var att = msg.attachments.first();

		return {
			embeds: [{
				title: board.name,
				fields: [
					{
						name: "Original post",
						value: `${PREFIX}/${ctx.guild.id}/${board.original}`
					},
					{
						name: "Latest post",
						value: `${PREFIX}/${ctx.guild.id}/${board.latest}`
					}
				],
				image: {
					url: att.url
				}
			}]
		}
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