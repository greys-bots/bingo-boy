const { Models: { SlashCommand } } = require('frame');
const { AttachmentBuilder } = require('discord.js');
const { IMAGES: { TEMPLATE }, OFFSETS: { BOARD } } = require('../constants');
const Jimp = require('jimp');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "template",
			description: "View the bingo board template",
			usage: [
				"- Sends the bingo template"
			],
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		var att = new AttachmentBuilder(TEMPLATE.getBufferAsync(Jimp.MIME_PNG), {
			name: 'template.png'
		});

		return { files: [att] };
	}
}

module.exports = (bot, stores) => new Command(bot, stores);