const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ 𝐒 𝐀𝐘 𝐄𝐌 ]";

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "S AY EM",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName ",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╭━━〔 🌟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧 🌟 〕━━╮\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭─❖ 『 ${category.toUpperCase()} 』`;

          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 2).map((item) => `➤ ${item}`);
            msg += `\n│ ${cmds.join("    ")}`;
          }

          msg += `\n╰───────────────✦`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n╭─❖ 『 𝗜𝗡𝗙𝗢 』`;
      msg += `\n│ 📊 Total Commands: ${totalCommands}`;
      msg += `\n│ 📝 Type: ${prefix}help <cmd>`;
      msg += `\n│ 🔎 To view command details`;
      msg += `\n╰───────────────✦`;

      msg += `\n\n╭─❖ 『 𝗢𝗪𝗡𝗘𝗥 』`;
      msg += `\n│ 👑 𝐀𝐑𝐈𝐅𝐔𝐋`;
      msg += `\n│ 🌐 https://m.me/aesthetich.ariful`;
      msg += `\n╰───────────────✦`;

      await message.reply({
        body: msg,
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`❌ Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
          : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody
          .replace(/{p}/g, prefix)
          .replace(/{n}/g, configCommand.name);

        const response = `
╭━━━〔 🌟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗗𝗘𝗧𝗔𝗜𝗟𝗦 🌟 〕━━━╮
│ 🧩 Name      : ${configCommand.name}
│ 🔖 Version   : ${configCommand.version || "1.0"}
│ 👤 Author    : ${author}
│ 📜 Info      : ${longDescription}
│ 🔐 Role      : ${roleText}
│ ⏱️ Cooldown  : ${configCommand.countDown || 1}s
│ 🔁 Aliases   : ${
          configCommand.aliases
            ? configCommand.aliases.join(", ")
            : "None"
        }
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 ⚡ 𝗨𝗦𝗔𝗚𝗘 ⚡ 〕━━━╮
│ ${usage}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━〔 ℹ️ 𝗡𝗢𝗧𝗘 〕━━━╮
│ • <text> = you can change it
│ • [a|b|c] = choose one
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group admins)";
    case 2:
      return "2 (Bot admin)";
    default:
      return "Unknown role";
  }
}