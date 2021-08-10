const axios = require('axios');

module.exports = {

    name: `insult`,

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const url = `https://evilinsult.com/generate_insult.php?lang=en&type=json`;
            const response = await axios.get(url);

            // reply to the interaction
            await interaction.editReply(`Hey, ${interaction.guild.members.cache.get(interaction.options._hoistedOptions[0].value)}: ${response.data.insult}`);
            
        } catch (err) {
            await interaction.editReply(`something broke man`);
        }

    },
};