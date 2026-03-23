module.exports = {
  config: {
    name: "pending",
    version: "2.0",
    author: "S AY EM",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Approve or cancel pending groups"
    },
    longDescription: {
      en: "View, approve or cancel pending group requests"
    },
    category: "Admin"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "✅ Refused %1 thread(s)!",
      approveSuccess: "✅ Approved %1 thread(s)!",
      cantGetPendingList: "❌ Can't get pending list!",
      returnListPending:
        "» [ PENDING LIST ] «\nTotal: %1 thread(s)\n\n%2\nReply with number to approve\nReply with c<number> to cancel",
      returnListClean: "✅ No pending threads"
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];

      const list = [...spam, ...pending].filter(
        g => g.isSubscribed && g.isGroup
      );

      if (!list.length)
        return api.sendMessage(
          getLang("returnListClean"),
          threadID,
          messageID
        );

      for (const group of list) {
        msg += `${index++}/ ${group.name || "Unnamed Group"} (${group.threadID})\n`;
      }

      return api.sendMessage(
        getLang("returnListPending", list.length, msg),
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: senderID,
            pending: list
          });
        },
        messageID
      );

    } catch (e) {
      console.log(e);
      return api.sendMessage(
        getLang("cantGetPendingList"),
        threadID,
        messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body, threadID, messageID } = event;
    let count = 0;

    const input = body.trim().toLowerCase();

    // ---------------- CANCEL SYSTEM ----------------
    if (input.startsWith("c")) {

      const numbers = input.replace(/[^0-9 ]/g, "").split(/\s+/);

      for (const num of numbers) {
        if (!num) continue;

        if (isNaN(num) || num <= 0 || num > Reply.pending.length)
          return api.sendMessage(
            getLang("invaildNumber", num),
            threadID,
            messageID
          );

        const targetThread = Reply.pending[num - 1].threadID;

        try {
          await api.handleMessageRequest(targetThread, false);
          count++;
        } catch (err) {
          console.log("Cancel error:", err);
        }
      }

      return api.sendMessage(
        getLang("cancelSuccess", count),
        threadID,
        messageID
      );
    }

    // ---------------- APPROVE SYSTEM ----------------
    else {

      const numbers = input.split(/\s+/);

      for (const num of numbers) {
        if (!num) continue;

        if (isNaN(num) || num <= 0 || num > Reply.pending.length)
          return api.sendMessage(
            getLang("invaildNumber", num),
            threadID,
            messageID
          );

        const targetThread = Reply.pending[num - 1].threadID;

        try {
          // ✅ REAL APPROVE
          await api.handleMessageRequest(targetThread, true);

          // Wait for Facebook to confirm approve
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Send message after approve
          await api.sendMessage(
            "✅ 𝐆𝐑𝐎𝐔𝐏 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐈𝐎𝐍  𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋!\n\n𝐎𝐖𝐍𝐄𝐑 : 𝐀𝐑𝐈𝐅𝐔𝐋 𝐈𝐒𝐋𝐀𝐌\n𝐅𝐕𝐑𝐓 𝐒𝐎𝐍𝐆 : 𝐒𝐀𝐉𝐃𝐄\n𝐒𝐓𝐀𝐓𝐔𝐒 : 𝐈𝐒𝐋𝐀𝐌\n\n𝐓𝐇𝐀𝐍𝐊 𝐘𝐎𝐔 𝐅𝐎𝐑 𝐀𝐃𝐃𝐈𝐍𝐆 𝐌𝐄..",
            targetThread
          );

          count++;

        } catch (err) {
          console.log("Approve error:", err);
        }
      }

      return api.sendMessage(
        getLang("approveSuccess", count),
        threadID,
        messageID
      );
    }
  }
};