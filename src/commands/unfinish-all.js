const { prefix } = require("../config.json");

module.exports = {
  name: "unfinish-all",
  description: "Reset all Đội's time to 00:00:00 overall or particular leg",
  args: true, // Include if command requires args
  usage:
    `overall ex: ${prefix} ${this.name} overall\n` +
    `<leg number> ex: ${prefix} ${this.name} 1`, // Include if args is true
  guildOnly: true, // Include if exclusive to server
  admin_permissions: true,
  cooldown: 2,
  execute(message, args) {
    if (args.length != 1) {
      return message.reply(
        `Error: Please consult the usage by typing\n \`${prefix}help ${this.name}\` to get more info`
      );
    }

    // Check if number or overall
    if (args[0] === "overall") {
      // Show overall leaderboard
      return message.channel.send(
        message.client.scorekeeper.unfinishAll(message)
      );
    }

    let legNumber = parseInt(args[0]);

    if (isNaN(legNumber))
      return message.reply(
        `Error: Make sure you are following the usages. Send ${prefix}help ${this.name} for more information`
      );

    // 3 Legs
    if (legNumber < 1 || legNumber > 3) {
      return message.reply(
        `Error: There should only be 3 legs: 1, 2, 3.\n If this is incorrect contact one of the HTs.`
      );
    }

    return message.client.scorekeeper.unfinishAllLeg(message);
  },
};
