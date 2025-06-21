const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vc18')
    .setDescription('Restricts VC to 18+ users'),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: "אינך בוויס!", ephemeral: true });
    }

    if (!member.roles.cache.has(process.env.ROLE_18_ID)) {
      return interaction.reply({
        content: "אתה לא 18+, כדי להיבחן ל18+ : <#1386072655219920926>",
        ephemeral: true
      });
    }

    if (!member.roles.cache.has(process.env.ROOM_LEADER_ID)) {
      return interaction.reply({
        content: "!אינך מנהל החדר",
        ephemeral: true
      });
    }

    try {
      const everyoneOverwrite = voiceChannel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id);
      const role18Overwrite = voiceChannel.permissionOverwrites.cache.get(process.env.ROLE_18_ID);

      const everyoneCannotConnect = everyoneOverwrite?.deny.has(PermissionFlagsBits.Connect);
      const role18CanConnect = role18Overwrite?.allow.has(PermissionFlagsBits.Connect);

      if (everyoneCannotConnect && role18CanConnect) {
        return interaction.reply({
          content: "הוויס כבר מוגבל ל18+ בלבד!",
          ephemeral: true
        });
      }

      await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        Connect: false
      });

      await voiceChannel.permissionOverwrites.edit(process.env.ROLE_18_ID, {
        Connect: true
      });

      return interaction.reply({
        content: "הוויס מוגבל לחברי 18+ בלבד",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "אירעה שגיאה, בבקשה תפנה לצוות גבוה",
        ephemeral: true
      });
    }
  }
};
