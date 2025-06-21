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
      return interaction.reply({ content: "You're not in a voice!", ephemeral: true });
    }

    if (!member.roles.cache.has(process.env.ROLE_18_ID)) {
      return interaction.reply({
        content: "You don't have that role!",
        ephemeral: true
      });
    }

    if (!member.roles.cache.has(process.env.ROOM_LEADER_ID)) {
      return interaction.reply({
        content: "You are not the room's creator!",
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
          content: "This voice is already limited to this role only!",
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
        content: "Voice has been restricted.",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "Error",
        ephemeral: true
      });
    }
  }
};
