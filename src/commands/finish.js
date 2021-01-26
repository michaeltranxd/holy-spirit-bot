const { prefix } = require("../config.json");

module.exports = {
  name: "finish",
  description: "Update the Đội's time for a particular leg",
  args: true, // Include if command requires args
  usage: `<@doi-role> <leg number> <time formatted hr:min:sec> ex: ${prefix}${this.name} @Doi1 1 12:47:27`, // Include if args is true
  guildOnly: true, // Include if exclusive to server
  admin_permissions: true,
  cooldown: 1,
  execute(message, args) {
    if (args.length != 3) {
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

    // Check validity of leg number
    let legNumber = +args[1];

    if (isNaN(legNumber)) {
      return message.reply(
        `Error: Make sure that the leg number is a valid number!`
      );
    }

    // 3 Legs
    if (legNumber < 1 || legNumber > 3) {
      return message.reply(
        `Error: There should only be 3 legs: 1, 2, 3.\n If this is incorrect contact one of the HTs.`
      );
    }

    // Parse time
    let timeMatch = args[2].match(/^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$/);

    if (!timeMatch) {
      return message.reply(
        `Error: Make sure you format the time correctly! Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    let timeString = timeMatch[0];

    message.client.scorekeeper.finishDoi(message, role, legNumber, timeString);
    console.log(args);
  },
};
