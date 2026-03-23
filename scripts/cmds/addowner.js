module.exports = {
  config: {
    name: "addowner",
    version: "1.0",
    author: "অ্ঁপ্রি্ঁয়্ঁ আ্ঁরি্ঁফু্ঁল্ঁ",
    countDown: 5,
    role: 0,
    shortDescription: "Add bot owner to group",
    category: "group",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const ownerID = "61579497520002"; // Owner Facebook ID

    try {
      await api.addUserToGroup(ownerID, event.threadID);
      api.sendMessage(
        "✅ Bot Owner ke group e add kora holo.",
        event.threadID
      );
    } catch (e) {
      api.sendMessage(
        "❌ Owner ke add kora jay nai. Bot admin na hole add korte parbe na.",
        event.threadID
      );
    }
  }
};