const { prefix } = require("../config.json");

module.exports = {
  name: "leaderboard",
  description: "Displays current leaderboard for each Đội",
  args: true, // Include if command requires args
  usage: "overall\n" + "<leg number>", // Include if args is true
  guildOnly: true, // Include if exclusive to server
  cooldown: 5,
  execute(message, args) {
    console.log(args);
    if (args.length === 1) {
      // Check if number or overall
      if (args[0] === "overall") {
        // Show overall leaderboard
        return message.channel.send(
          message.client.scorekeeper.getLeaderboardOverall(message)
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

      // Show leg # leaderboard
      return message.channel.send(
        message.client.scorekeeper.getLeaderboardForLeg(message, args[0])
      );
    } else {
      return message.reply(
        `Error: Make sure you are following the usages. Send ${prefix}help ${this.name} for more information`
      );
      // invalid
    }
  },
};
