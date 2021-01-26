module.exports = {
  name: "listroles",
  description: "insert description",
  guildOnly: true, // Include if exclusive to server
  cooldown: 5,
  admin_permissions: true,
  execute(message, args) {
    console.log("how'd they know");
    let roleString = "\n";

    let rolesCollection = message.guild.roles.cache;
    let roles = rolesCollection.array();
    roles.forEach((role) => {
      roleString += `${role.name} - ${role.id}\n`;
    });

    console.log(message.author.id);
    console.log(message.guild.members.cache);

    message.reply(roleString);
  },
};
