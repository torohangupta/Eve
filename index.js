const fs = require('fs');
const Discord = require('discord.js');
const { prefix, userIDs } = require('./resources/config.json');
const { permsChecker, logCommandRun, logCommandError, recievedDM } = require(`./dependencies/runtime.js`);

// create new discord client with proper intents
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES', `GUILD_VOICE_STATES`, `GUILD_MESSAGE_REACTIONS`, `DIRECT_MESSAGES`, `GUILD_PRESENCES`], partials: ['CHANNEL'] });
client.commands = new Discord.Collection();
client.buttons = new Discord.Collection();
client.slashCommands = new Discord.Collection();


// load all commands
const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith(`.js`));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// load all events
const eventFiles = fs.readdirSync(`./events`).filter(file => file.endsWith(`.js`));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    event.once ? client.once(event.name, (...args) => event.execute(...args, client)) : client.on(event.name, (...args) => event.execute(...args, client));
}

// Command handling
client.on('messageCreate', message => {

    // logs any DM that is sent to Wall-E that isn't a command
    if (message.channel.type === 'DM' && !message.content.startsWith(prefix) && message.author.id != userIDs.walle) {
        return recievedDM(message);
    }

    // if a message does not contain the prefix for the bot OR is from another bot, ignore the message
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // if the message is a command, remove the prefix & split messaage by spaces & store in args. shifts all index values down and stores zeroth in commandName
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check all command names & aliases for commandName & stop if message isn't a command
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // check to make sure that the user has all the required permissions
    if (!permsChecker(command, message, args)) return;

    try {
        command.execute(message, args);
        logCommandRun(client, command, message);

    } catch (error) {
        console.error(error);
        logCommandError(client, command, message, error);
    }

});

// interaction handler (slash commands)
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const slashCommand = client.slashCommands.get(interaction.commandName);
    if (!slashCommand) {
        interaction.reply({ content: `That doesn't work currently. If you think this is a mistake, please submit a bug report on my GitHub!\nhttps://github.com/torohangupta/Wall-E`, ephemeral: true });
        return console.log(`${interaction.member.user.username} used a broken slash command!`);
    }

	await slashCommand.execute(interaction);
});

// login to Discord with bot token
client.login(process.env.TOKEN);