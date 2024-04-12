const { Models: { SlashCommand } } = require('frame');
const { AttachmentBuilder: ATT } = require('discord.js');
const { IMAGES, OFFSETS } = require('../constants');
const Jimp = require('jimp');

const { confBtns } = require('../extras');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "register",
			description: "Register a new bingo board",
			options: [
				{
					name: 'name',
					description: "The name of the board",
					type: 3,
					required: true
				},
				{
					name: 'board',
					description: "The board image to use",
					type: 11,
					required: true
				}
			],
			usage: [
				"[name] [board] - Registers a bingo board"
			],
			permissions: ['ManageMessages'],
			guildOnly: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		await ctx.deferReply()
		var name = ctx.options.getString('name').trim();
		var att = ctx.options.getAttachment('board');
		if(att.width !== OFFSETS.W || att.height != OFFSETS.H)
			return (
				"Please use my template for boards! " +
				"You can view and save it with `/template`"
			)
		var img = await Jimp.read(att.attachment);
		var buff = await img.getBufferAsync(Jimp.MIME_PNG);

		var msg = await ctx.followUp({
			content: (
				"Are you sure you want to set this as your board?\n" +
				"NOTE: If this board isn't the same as my template, " +
				"it may not work!"
			),
			files: [new ATT(buff, { name: 'board.png' })],
			components: [{
				type: 1,
				components: confBtns
			}],
			fetchReply: true
		})
		var conf = await this.#bot.utils.getConfirmation(this.#bot, msg, ctx.user);
		if(conf.msg) return conf.msg;

		var bd = await this.#stores.boards.create({
			server_id: ctx.guild.id,
			name,
			original: `${msg.channel.id}/${msg.id}`,
			latest: `${msg.channel.id}/${msg.id}`,
			filled: [ ]
		})
		
		return `Board created! ID: ${bd.hid}`
	}
}

module.exports = (bot, stores) => new Command(bot, stores);