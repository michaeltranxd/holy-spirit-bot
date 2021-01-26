const { prefix } = require("../config.json");

module.exports = {
  name: "remove",
  description: "Removes Đội from the list",
  args: true, // Include if command requires args
  usage: `<@doi-role> ex: ${prefix} ${this.name} @Doi1`, // Include if args is true
  guildOnly: true, // Include if exclusive to server
  admin_permissions: true,
  cooldown: 2,
  execute(message, args) {
    if (args.length != 1) {
      return message.reply(
        `Error: Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Check if args[0] is a doi by checking the roles
    let roleMatch = args[0].match(/[0-9]+/);
    if (!roleMatch) {
      return message.reply(
        `Error: Make sure you link the role by using @<role>! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    let roleId = roleMatch[0];
    let guildRoles = message.guild.roles.cache;
    let role = guildRoles.get(roleId);

    if (!role) {
      return message.reply(`Error: Does this role exist?`);
    }

    message.client.scorekeeper.removeDoi(message, role);
    console.log(args);
  },
};
