require("dotenv").config();

const fs = require("fs");
const express = require("express");
const app = express();

const { Client, GatewayIntentBits } = require("discord.js");
const comandos = require("./comandos");

// 🤖 Cliente Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 📂 banco
if (!fs.existsSync("dados.json")) {
  fs.writeFileSync(
    "dados.json",
    JSON.stringify({ users: {}, canaisBanco: {} }, null, 2)
  );
}

const prefix = "!";

// 🌐 servidor web
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("CoinVault online 🚀"));
app.listen(PORT, () => console.log("🌐 Web ok"));

// 🤖 pronto
client.once("ready", () => {
  console.log(`✅ Logado como ${client.user.tag}`);
});

// 📩 comandos
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  if (!message.guild) return;

  const dados = JSON.parse(fs.readFileSync("dados.json"));

  const canalPermitido = dados.canaisBanco?.[message.guild.id];
  if (canalPermitido && message.channel.id !== canalPermitido) return;

  const args = message.content.slice(prefix.length).split(" ");
  const cmd = args.shift().toLowerCase();

  if (comandos[cmd]) {
    comandos[cmd](message, args, dados);
    fs.writeFileSync("dados.json", JSON.stringify(dados, null, 2));
  } else {
    message.reply("❌ Comando não encontrado.");
  }
});

// 🚀 login
client.login(process.env.TOKEN);