module.exports = {
  config: {
    name: "love",
    version: "2.0",
    author: "I Don't Know",
    countDown: 5,
    role: 0,
    shortDescription: "All in one Fake Love Calculator",
    longDescription: "",
    category: "fun",
    guide: "{pn} @mention / reply to someone / {pn} help"
  },

  onStart: async function ({ message, event, api, args }) {

    // HELP SYSTEM
    if (args[0] === "help") {
      return message.reply(
`💘 FAKE LOVE CALCULATOR HELP 💘

📌 ব্যবহার করার নিয়ম:

1️⃣ কাউকে mention কর:
love @name

2️⃣ কারো message এ reply দিয়ে লিখ:
love

3️⃣ Help দেখতে:
love help

😈 Random percentage generate হবে!

***_Powered by Sourav Ahmed ⚡_***`
      );
    }

    let user1 = event.senderID;
    let user2;

    // যদি mention থাকে
    if (Object.keys(event.mentions).length > 0) {
      user2 = Object.keys(event.mentions)[0];
    }

    // যদি reply হয়
    else if (event.type === "message_reply") {
      user2 = event.messageReply.senderID;
    }

    // কেউ mention বা reply না করলে
    else {
      return message.reply("😒 কাউরে mention কর অথবা reply দে love calculate করতে!");
    }

    try {
      const info1 = await api.getUserInfo(user1);
      const info2 = await api.getUserInfo(user2);

      const name1 = info1[user1].name;
      const name2 = info2[user2].name;

      const percent = Math.floor(Math.random() * 101);

      let result;

      if (percent < 20) {
        result = "💀 এইটা love না, direct block list level 🤡";
      } 
      else if (percent < 50) {
        result = "🙂 Friendzone confirmed!";
      } 
      else if (percent < 80) {
        result = "😍 Crush level dangerous হচ্ছে!";
      } 
      else if (percent < 95) {
        result = "💖 True love vibes detected!";
      } 
      else {
        result = "🔥 Soulmate found! বিয়ের কার্ড ছাপাও 😈💍";
      }

      return message.reply(
`💘 LOVE CALCULATOR 💘

${name1} ❤️ ${name2}

Love Percentage: ${percent}% 💕

${result}

***_Powered by Sourav Ahmed ⚡_***`
      );

    } catch (err) {
      return message.reply("⚠️ Error হয়েছে! আবার try কর 😒");
    }
  }
};
