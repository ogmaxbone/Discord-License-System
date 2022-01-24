const Discord = require("discord.js");
const bot = new Discord.Client();
const fetch = require("node-fetch");
const fs = require("fs");
const settings = JSON.parse(fs.readFileSync("settings.json"));
const botToken = settings["botToken"];
const botID = settings["botID"];
const serverID = settings["serverID"];
const site = settings['siteBase']

bot.on("message", (message) => {
  if (message.content.startsWith("!generate")) {
    const user = bot.users.cache.get(message.author.id);
    if (message.channel.type === "dm") {
      var split = message.content.split(" ")[1];
      var date = new Date();
      var payload = {
        password: split,
        client: message.author.id,
        date: date.toLocaleDateString(),
      };
      fetch(site + "/key/generate/lifetime", {
        headers: {
          "content-type": "application/json",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(payload),
        method: "POST",
        mode: "cors",
      }).then((response) => {
        response.json().then(function (json) {
          if (json["status"] === "Generated") {
            user.send("Successfully generated key!");
          }
        });
      });
    }
  }
  if (message.content.startsWith("!bind")) {
    const user = bot.users.cache.get(message.author.id);
    let server = bot.guilds.cache.get(serverID);
    var memberRole = server.roles.cache.find((role) => role.name === "member");
    let member = server.members.cache.get(message.author.id);
    if (message.channel.type === "dm") {
      var split = message.content.split(" ")[1];
      var date = new Date();
      var payload = {
        user: split,
        client: message.author.id,
        avatar: user["avatar"],
        date: date.toLocaleDateString(),
      };
      fetch(site + "/user/key/bind", {
        headers: {
          "content-type": "application/json",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(payload),
        method: "POST",
        mode: "cors",
      }).then((response) => {
        response.json().then(function (json) {
          if (json["status"] === "binded") {
            user.send("Welcome to Montes");
            member.roles.add(memberRole);
          }
        });
      });
    }
  }
  if (message.content === "!status") {
    const user = bot.users.cache.get(message.author.id);
    if (message.channel.type === "dm") {
      var split = message.content.split(" ")[1];
      var date = new Date();
      var payload = {
        user: split,
        client: message.author.id, //D
        date: date.toLocaleDateString(),
      };
      fetch(site + "/user/key/status", {
        headers: {
          "content-type": "application/json",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(payload),
        method: "POST",

        mode: "cors",
      }).then((response) => {
        response.json().then(function (json) {
          if (response.status === 200) {
            const exampleEmbed = new Discord.MessageEmbed()
              .setColor("#585858")
              .setTitle("Key Status")
              .addFields(
                { name: "Key", value: json["key"][0]["key"] },
                { name: "Type", value: json["key"][0]["type"] },
                { name: "Created", value: json["key"][0]["created"] }
              );
            user.send(exampleEmbed);
          }
        });
      });
    }
  }
  if (message.content.startsWith("!unbind")) {
    const user = bot.users.cache.get(message.author.id);
    if (message.channel.type === "dm") {
      var split = message.content.split(" ")[1];
      var date = new Date();
      var payload = {
        user: split,
        client: message.author.id,
        date: date.toLocaleDateString(),
      };
      fetch(site + "/user/key/unbind", {
        headers: {
          "content-type": "application/json",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(payload),
        method: "POST",
        mode: "cors",
      }).then((response) => {
        response.json().then(function (json) {
          if (json["status"] === "unbinded") {
            user.send("Key unbound");
          } else {
          }
        });
      });
    }
  }
  if (message.content.startsWith("!purge")) {
    var string = message.content;
    var split = message.content.split(" ")[1];
    if (message.member.roles.cache.some((role) => role.name === "owner")) {
      message.channel
        .bulkDelete(split)
        .then((messages) =>
          console.log(`Bulk deleted ${messages.size} messages`)
        )
        .catch(console.error);
    }
  }
  if (message.content.startsWith("!commands")) {
    if (message.member.roles.cache.some((role) => role.name === "owner")) {
      const commands = new Discord.MessageEmbed()
        .setColor("#585858")
        .addFields({
          name: "To gain access:",
          value: `DM <@${botID}> "!bind <key goes here>"`,
        });
      message.channel.send(commands);
    }
  }
  if (message.content.startsWith("!reset")) {
    const user = bot.users.cache.get(message.author.id);
    if (message.channel.type === "dm") {
      var split = message.content.split(" ")[1];
      var date = new Date();
      var payload = {
        user: split,
        client: message.author.id,
        avatar: user["avatar"], //D
        date: date.toLocaleDateString(),
      };
      fetch(site + "/user/key/reset", {
        headers: {
          "content-type": "application/json",
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify(payload),
        method: "POST",

        mode: "cors",
      }).then((response) => {
        response.json().then(function (json) {
          if (json["status"] === "reset") {
            user.send("Key reset");
          }
        });
      });
    }
  }
});

bot.login(botToken);
