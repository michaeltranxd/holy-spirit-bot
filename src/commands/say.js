const { prefix } = require("../config.json");

module.exports = {
  name: "say",
  description: "The bot will parrot whatever you say in a channel :)",
  args: true, // Include if command requires args
  usage: `<channel-id> <message> ex: ${prefix}${this.name} 742243914164994089 Amen!`, // Include if args is true
  guildOnly: true, // Include if exclusive to server
  cooldown: 3,
  execute(message, args) {
    if (args.length < 2) {
      return message.reply(
        `Error: Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Find if channel id is valid
    let guildChannels = message.guild.channels.cache;
    let channel = guildChannels.get(args[0]);

    if (!channel) {
      return message.reply(`Error: Channel does not exist?`);
    }

    // Combine args into one string
    let personalMessage = args.slice(args.indexOf(args[1])).join(" ");

    console.log(personalMessage);

    // Send message to that channel
    channel.send(personalMessage);
  },
};
