const { prefix } = require("../config.json");

module.exports = {
  name: "remove-all",
  description: "Removes all Đội from the list",
  guildOnly: true, // Include if exclusive to server
  admin_permissions: true,
  cooldown: 2,
  execute(message, args) {
    if (args.length != 0) {
      return message.reply(
        `Error: Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    message.client.scorekeeper.removeAll(message);
    console.log(args);
  },
};
