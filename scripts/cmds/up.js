const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt", "up"],
    version: "1.0",
    author: "JARiF@Cock",
    role: 0,
    category: "𝗦𝗬𝗦𝗧𝗘𝗠",
    guide: {
      en: "Use {pn}info"
    }
  },
  onStart: async function ({ message }) {

    const uptime = process.uptime();
    const formattedUptime = formatMilliseconds(uptime * 1000);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const diskUsage = await getDiskUsage();

    const systemInfo = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
      loadAvg: os.loadavg()[0], // 1-minute load average
      botUptime: formattedUptime,
      systemUptime: formatUptime(os.uptime()),
      processMemory: prettyBytes(process.memoryUsage().rss)
    };

    const response = `𝐒𝐭𝐚𝐭𝐮𝐬\n`
      + '----------------------\n'
      + '⚙  𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ⎯༢ 𝗤͜͡𝗨𝗘𝗘⃟𝗡 ⊰🎀:\n'
      + `  𝐎𝐒: ${systemInfo.os}\n`
      + `  𝐀𝐫𝐜𝐡: ${systemInfo.arch}\n`
      + `  𝐂𝐏𝐔: ${systemInfo.cpu}\n`
      + `  𝐋𝐨𝐚𝐝 𝐀𝐯𝐠: ${systemInfo.loadAvg}%\n`
      + '----------------------\n'
      + `💾 𝐌𝐞𝐦𝐨𝐫𝐲 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:\n`
      + `  𝐌𝐞𝐦𝐨𝐫𝐲 𝐔𝐬𝐚𝐠𝐞: ${prettyBytes(usedMemory)} / Total ${prettyBytes(totalMemory)}\n`
      + `  𝐑𝐀𝐌 𝐔𝐬𝐚𝐠𝐞: ${prettyBytes(os.totalmem() - os.freemem())} / Total ${prettyBytes(totalMemory)}\n`
      + '----------------------\n'
      + `📀 𝐃𝐢𝐬𝐤 𝐒𝐩𝐚𝐜𝐞 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:\n`
      + `  𝐃𝐢𝐬𝐤 𝐒𝐩𝐚𝐜𝐞 𝐔𝐬𝐚𝐠𝐞: ${prettyBytes(diskUsage.used)} / Total ${prettyBytes(diskUsage.total)}\n`
      + '----------------------\n'
      + `🤖 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞: ${systemInfo.botUptime}\n`
      + `⚙ 𝐒𝐞𝐫𝐯𝐞𝐫 𝐔𝐩𝐭𝐢𝐦𝐞: ${systemInfo.systemUptime}\n`
      + `📊 𝐏𝐫𝐨𝐜𝐞𝐬𝐬 𝐌𝐞𝐦𝐨𝐫𝐲 𝐔𝐬𝐚𝐠𝐞: ${systemInfo.processMemory}\n`
      + '----------------------';

    message.reply(response);
  }
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemaining = seconds % 60;

  return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}

function formatMilliseconds(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

function prettyBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
        }