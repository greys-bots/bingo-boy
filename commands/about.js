const { Models: { SlashCommand } } = require('frame');

class Command extends SlashCommand {
	#bot;
	#stores;

	constructor(bot, stores) {
		super({
			name: "about",
			description: "Info about the bot",
			usage: [
				"- Gives info about the bot"
			],
			ephemeral: true
		})
		this.#bot = bot;
		this.#stores = stores;
	}

	async execute(ctx) {
		return {embeds: [{
			title: '**About**',
			description: "Hello! I'm Bingo Boy! I help people manage server-wide bingo boards here on Discord!",
			fields:[
				{name: "Creators", value: "[greysdawn](https://github.com/greysdawn) | (GS)#6969"},
				{name: "Invite", value: `[Clicky!](https://discord.com/oauth2/authorize?client_id=1228357712581234714)`,inline: true},
				{name: "Support Server", value: "[Clicky!](https://discord.gg/EvDmXGt)", inline: true},
				{name: "Other Links", value: "[Repo](https://github.com/greys-bots/bingo-boy)"},
				{name: "Stats", value: `Guilds: ${this.#bot.guilds.cache.size} | Users: ${this.#bot.users.cache.size}`},
				{name: "Support my creators!", value: "[Ko-Fi](https://ko-fi.com/greysdawn) | [Patreon](https://patreon.com/greysdawn)"}
			]
		}]}
	}
}

module.exports = (bot, stores) => new Command(bot, stores);