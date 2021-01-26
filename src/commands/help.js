const { prefix, roles_admin } = require("../config.json");

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command",
  guildOnly: true, // Include if exclusive to server
  aliases: ["?", "commands"], // Include if aliases are desired
  usage: "[command name]", // Include if args is true
  execute(message, args) {
    const data = [];
    const { commands } = message.client;

    // Check for permissions
    let guildMem = message.guild.members.cache.get(message.author.id);
    let guildMemRoles = guildMem.roles.cache;
    let isAdmin = false;

    // Check if guild member roles has any under admin
    guildMemRoles.each((role) => {
      if (roles_admin.includes(role.id)) {
        isAdmin = true;
      }
    });

    if (!args.length) {
      let commandList = commands
        .filter((command) => {
          return !command.admin_permissions;
        })
        .map((command) => command.name)
        .join(", ");

      // If admin, include list of every command
      if (isAdmin)
        commandList = commands.map((command) => command.name).join(", ");

      data.push("Here's a list of all my commands:");
      data.push(commandList);
      data.push(
        `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
      );

      return message.channel.send(data, { split: true }).catch((error) => {
        console.error(error);
        message.reply(
          "It seems like there was an unexpected error. Please contact a HT"
        );
      });
    }

    const name = args[0].toLowerCase();
    const command =
      commands.get(name) ||
      commands.find((c) => c.aliases && c.aliases.includes(name));

    // Don't recognize command unless you have right permissions
    if (!command || (!isAdmin && command.admin_permissions)) {
      return message.reply("that's not a valid command!");
    }

    data.push(`**Name:** ${command.name}`);
    if (command.aliases)
      data.push(`**Aliases:** ${command.aliases.join(", ")}`);
    if (command.description)
      data.push(`**Description:** ${command.description}`);
    if (command.usage) {
      let usages = command.usage.split(/ *\n */);
      if (usages.length > 1) {
        // Multiple usages
        data.push(`**Usage:**`);
        usages.forEach((usage) => {
          data.push(`\`${prefix}${command.name} ${usage}\``);
        });
      } else {
        data.push(`**Usage:** \`${prefix}${command.name} ${command.usage}\``);
      }
    }

    data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

    return message.channel.send(data, { split: true });
  },
};
