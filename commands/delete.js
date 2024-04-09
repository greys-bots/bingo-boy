const { Models: { SlashCommand } } = require('frame');
const { confBtns } = require('../extras');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "delete",
			description: "Delete bingo boards",
			options: [{
				name: 'board',
				description: "A specific board to delete",
				type: 3,
				required: false,
				autocomplete: true
			}],
			usage: [
				"- Deletes all registered boards",
				"[board] - Deletes a specific board"
			],
			permissions: ['ManageMessages']
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var hid = ctx.options.getString('board')?.trim().toLowerCase();

		var msg;
		if(!hid) {
			var boards = await this.#stores.boards.getAll(ctx.guild.id);
			if(!boards?.length) return "No boards to delete!";

			msg = await ctx.reply({
				content: (
					"Are you sure you want to delete **ALL** boards?\n" +
					"**This action can't be undone!**"
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

			await this.#stores.boards.deleteAll(ctx.guild.id);
			return "Boards deleted!"
		}

		var board = await this.#stores.boards.get(ctx.guild.id, hid);
		if(!board?.id) return "Board not found!";

		msg = await ctx.reply({
			content: (
				"Are you sure you want to delete this board?\n" +
				"**This action can't be undone!**"
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

		await board.delete();
		return "Board deleted!";
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