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

// 📂 cria banco se não existir
if (!fs.existsSync("dados.json")) {
  fs.writeFileSync(
    "dados.json",
    JSON.stringify({ users: {}, canaisBanco: {} }, null, 2)
  );
}

const prefix = "!";

// 🌐 servidor web (Render precisa disso)
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("CoinVault online 🚀"));

app.listen(PORT, () => {
  console.log("🌐 Web ok");
});

// 🔍 DEBUG GLOBAL
process.on("unhandledRejection", (err) => {
  console.error("❌ ERRO GLOBAL:", err);
});

client.on("error", (err) => {
  console.error("❌ ERRO DO CLIENT:", err);
});

// 🤖 pronto (evento atualizado)
client.once("clientReady", () => {
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
    try {
      comandos[cmd](message, args, dados);
      fs.writeFileSync("dados.json", JSON.stringify(dados, null, 2));
    } catch (err) {
      console.error("❌ Erro no comando:", err);
      message.reply("❌ Erro ao executar comando.");
    }
  } else {
    message.reply("❌ Comando não encontrado.");
  }
});

// 🚀 LOGIN COM DELAY (melhor pro Render)
const startBot = async () => {
  try {
    console.log("🔑 TOKEN:", process.env.TOKEN ? "OK" : "NÃO ENCONTRADO");

    if (!process.env.TOKEN) {
      throw new Error("TOKEN não definido!");
    }

    console.log("⏳ Aguardando 5s...");
    await new Promise(res => setTimeout(res, 5000));

    console.log("🔄 Tentando logar...");
    await client.login(process.env.TOKEN);

    console.log("✅ Login iniciado!");
  } catch (err) {
    console.error("❌ ERRO AO LOGAR:", err);
  }
};

startBot();