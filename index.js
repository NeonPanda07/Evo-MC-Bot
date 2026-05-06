const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

let prefix = '!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // 🔧 PREFIX CHANGE
  if (cmd === 'prefix') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply('No permission');

    prefix = args[0];
    message.reply(`Prefix set to: ${prefix}`);
  }

  // 📢 SAY COMMAND
  if (cmd === 'say') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return;

    const text = args.join(' ');
    message.delete();
    message.channel.send(text); // emojis (including animated) work here
  }

  // 🔨 KICK
  if (cmd === 'kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply('No permission');

    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention user');

    await member.kick();
    message.reply(`${member.user.tag} kicked`);
  }

  // 🔨 BAN
  if (cmd === 'ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply('No permission');

    const member = message.mentions.members.first();
    if (!member) return message.reply('Mention user');

    await member.ban();
    message.reply(`${member.user.tag} banned`);
  }

  // ⏳ TIMEOUT
  if (cmd === 'timeout') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply('No permission');

    const member = message.mentions.members.first();
    const time = args[1] * 1000; // seconds
    if (!member || !time) return message.reply('Usage: !timeout @user 60');

    await member.timeout(time);
    message.reply(`${member.user.tag} timed out`);
  }

  // 🎫 CREATE TICKET PANEL
  if (cmd === 'panel') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return;

    message.channel.send('🎫 React with 🎟️ to create ticket');

    const msg = await message.channel.send('🎟️');
    await msg.react('🎟️');

    const filter = (reaction, user) => reaction.emoji.name === '🎟️' && !user.bot;
    const collector = msg.createReactionCollector({ filter });

    collector.on('collect', async (reaction, user) => {
      const guild = message.guild;
      const member = guild.members.cache.get(user.id);

      const channel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: ['ViewChannel']
          },
          {
            id: user.id,
            allow: ['ViewChannel', 'SendMessages']
          }
        ]
