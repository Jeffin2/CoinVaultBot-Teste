function getUser(dados, id) {
  if (!dados.users[id]) {
    dados.users[id] = {
      carteira: 0,
      banco: 0,
      divida: 0,
      extrato: []
    };
  }
  return dados.users[id];
}

function addExtrato(user, texto) {
  user.extrato.push(texto);

  // limita a 50 registros
  if (user.extrato.length > 50) {
    user.extrato.shift();
  }
}

module.exports = {

  ajuda: (msg) => {
    msg.reply(`
📜 Comandos:
!saldo
!trabalhar
!depositar <valor>
!depositartudo
!sacar <valor>
!sacartudo
!emprestimo <valor>
!pagar <valor>
!extrato
!roubar @user
!setcanal
    `);
  },

  saldo: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);

    msg.reply(`💰 Carteira: ${u.carteira} | Banco: ${u.banco} | Dívida: ${u.divida}`);
  },

  trabalhar: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);

    const ganho = Math.floor(Math.random() * 200) + 50;
    u.carteira += ganho;

    addExtrato(u, `+${ganho} (trabalhar)`);

    msg.reply(`💼 Você ganhou ${ganho}`);
  },

  depositar: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);
    const valor = parseInt(args[0]);

    if (!valor) return msg.reply("❌ Valor inválido");
    if (u.carteira < valor) return msg.reply("❌ Sem dinheiro");

    u.carteira -= valor;
    u.banco += valor;

    addExtrato(u, `-${valor} (deposito)`);

    msg.reply(`🏦 Depositou ${valor}`);
  },

  depositartudo: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);

    if (u.carteira <= 0) return msg.reply("❌ Nada para depositar");

    addExtrato(u, `-${u.carteira} (deposito total)`);

    u.banco += u.carteira;
    u.carteira = 0;

    msg.reply("🏦 Depositou tudo");
  },

  sacar: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);
    const valor = parseInt(args[0]);

    if (!valor) return msg.reply("❌ Valor inválido");
    if (u.banco < valor) return msg.reply("❌ Sem saldo");

    u.banco -= valor;
    u.carteira += valor;

    addExtrato(u, `+${valor} (saque)`);

    msg.reply(`💸 Sacou ${valor}`);
  },

  sacartudo: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);

    if (u.banco <= 0) return msg.reply("❌ Nada para sacar");

    addExtrato(u, `+${u.banco} (saque total)`);

    u.carteira += u.banco;
    u.banco = 0;

    msg.reply("💸 Sacou tudo");
  },

  emprestimo: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);
    const valor = parseInt(args[0]);

    if (!valor) return msg.reply("❌ Valor inválido");

    const divida = Math.floor(valor * 1.2);

    u.carteira += valor;
    u.divida += divida;

    addExtrato(u, `+${valor} (emprestimo)`);

    msg.reply(`💳 Pegou ${valor} (dívida: ${divida})`);
  },

  pagar: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);
    const valor = parseInt(args[0]);

    if (!valor) return msg.reply("❌ Valor inválido");
    if (u.carteira < valor) return msg.reply("❌ Sem dinheiro");

    u.carteira -= valor;
    u.divida -= valor;

    if (u.divida < 0) u.divida = 0;

    addExtrato(u, `-${valor} (pagamento)`);

    msg.reply(`💸 Pagou ${valor}`);
  },

  extrato: (msg, args, dados) => {
    const u = getUser(dados, msg.author.id);

    if (!u.extrato || u.extrato.length === 0) {
      return msg.reply("📄 Sem histórico ainda.");
    }

    const ultimos = u.extrato.slice(-10).join("\n");

    msg.reply(`📄 Últimas transações:\n${ultimos}`);
  },

  roubar: (msg, args, dados) => {
    const alvo = msg.mentions.users.first();
    if (!alvo) return msg.reply("❌ Marque alguém");

    const ladrao = getUser(dados, msg.author.id);
    const vitima = getUser(dados, alvo.id);

    if (vitima.carteira <= 0) return msg.reply("❌ Sem dinheiro");

    if (Math.random() < 0.25) {
      const valor = Math.floor(Math.random() * vitima.carteira);

      vitima.carteira -= valor;
      ladrao.carteira += valor;

      addExtrato(ladrao, `+${valor} (roubo)`);
      addExtrato(vitima, `-${valor} (roubado)`);

      msg.reply(`🤑 Roubou ${valor}`);
    } else {
      ladrao.carteira = Math.max(0, ladrao.carteira - 100);

      addExtrato(ladrao, `-100 (multa roubo)`);

      msg.reply("🚔 Falhou e pagou multa");
    }
  },

  setcanal: (msg, args, dados) => {
    dados.canaisBanco[msg.guild.id] = msg.channel.id;
    msg.reply("📌 Canal definido");
  }

};