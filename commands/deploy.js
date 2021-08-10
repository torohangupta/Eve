const fs = require('fs');

module.exports = {
     
    name: `deploy`,
    aliases: [`deploy`, `dep`, `d`],
    description: `Deploy all slash commands`,
    usage: ``,

    permissions: false,

    execute(message, args) {

        // create blank array for commands
        let commands = []
        const serverID = `604504583393378314`;

        const slash_commands = fs.readdirSync(`./interactions/slashcommands`).filter(file => file.endsWith(`.json`))

        for (file of slash_commands) {
            commands.push(require(`../interactions/slashcommands/${file}`));
        }

        message.client.guilds.cache.get(serverID).commands.set(commands)
        message.channel.send(`Slash commands loaded`)
    },
};