const {
  prefix,
  channel_for_hint_command,
  roles_admin,
} = require("../config.json");

module.exports = {
  name: "hint",
  description: "Requests help from a Top Agent",
  guildOnly: true, // Include if exclusive to server
  cooldown: 5,
  execute(message, args) {
    if (args.length != 0) {
      return message.reply(
        `Error: Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    let authorID = message.author.id;
    let guildRoles = message.guild.roles.cache;
    let authorRole = message.guild.members.cache.get(authorID).roles.highest;

    if (roles_admin.includes(authorRole.id)) {
      return message.reply(
        "You are a top agent, silly! You don't need to use this command :) Only for các em"
      );
    }

    message.guild.channels.cache
      .get(channel_for_hint_command)
      .send(`Đội <@&${authorRole.id}> has requested help`)
      .then((msg) => {
        message.reply("I have notified the top agents for help. Please wait.");
      });
  },
};
