require('dotenv').config();

const {
	Client,
	GatewayIntentBits: Intents,
	Partials,
	Options
} = require("discord.js");
const {
	FrameClient,
	Utilities,
	Handlers
} = require('frame');
const fs = require("fs");
const path = require("path");

const bot = new FrameClient({
	intents: [
		Intents.Guilds,
		Intents.GuildMessages
	],
	partials: [
		Partials.Message,
		Partials.User,
		Partials.Channel,
		Partials.GuildMember,
		Partials.Reaction
	]
}, {
	invite: process.env.INVITE,
	statuses: [
		(bot) => `/help | in ${bot.guilds.cache.size} guilds`,
		(bot) => `/help | serving ${bot.users.cache.size} users`
	]
});

async function setup() {
	var { db, stores } = await Handlers.DatabaseHandler(bot, __dirname + '/stores');
	bot.db = db;
	bot.stores = stores;

	bot.handlers = {};
	bot.handlers.interaction = Handlers.InteractionHandler(bot, __dirname + '/commands');
	// files = fs.readdirSync("./handlers");
	// for(var f of files) {
	// 	var n = f.slice(0, -3);
	// 	bot.handlers[n] = require("./handlers/"+f)(bot)
	// }

	bot.utils = Utilities;
	var ut = require('./utils');
	bot.utils = Object.assign(bot.utils, ut);
}

bot.on("ready", async ()=> {
	console.log(`Logged in as ${bot.user.tag} (${bot.user.id})`);
})

bot.on('error', (err)=> {
	console.error(`Error:\n${err.stack}`);
})

process.on("unhandledRejection", (e) => console.log(e));

setup()
.then(async () => {
	try {
		await bot.login(process.env.TOKEN);
	} catch(e) {
		console.error("Trouble connecting...\n"+e)
	}
})
.catch(e => console.error(e))