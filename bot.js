const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const weather = require('weather-js')
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const request = require('request');
const snekfetch = require('snekfetch');
const queue = new Map();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');




var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);


//----SAYAÇ-----\\
client.on("guildMemberAdd", async member => {
  let SayacSayı = await db.fetch(`SayaçSayı_${member.guild.id}`);
  let SayacKanal = await db.fetch(`SayaçKanal_${member.guild.id}`);
  if (!SayacSayı || !SayacKanal) return;
  let sonuç = SayacSayı - member.guild.memberCount;
  client.channels
    .get(SayacKanal) .send(`<a:blobjoining:741794350479966208> :inbox_tray:  ${member}, Hoşgeldin Dostum! \`${SayacSayı}\` Kişiye  \`${sonuç}\` Kaldı  \`${member.guild.memberCount}\` Kişiyiz!` );
});
client.on("guildMemberRemove", async member => {
  let frenzysayı = await db.fetch(`SayaçSayı_${member.guild.id}`);
  let frenzykanal = await db.fetch(`SayaçKanal_${member.guild.id}`);
  if (!frenzysayı || !frenzykanal) return;
  let sonuç = frenzysayı - member.guild.memberCount;

  client.channels
    .get(frenzykanal).send( `<a:ablobleaving:741794355261603920> :outbox_tray:  ${member}, Görüşürüz Dostum! \`${frenzysayı}\` Kişiye   \`${sonuç}\`  Kaldı   \`${member.guild.memberCount}\` Kişiyiz!`);
});

//otoorol
client.on("guildMemberAdd", async member => {
let rolisim = await db.fetch(`otorolisim_${member.guild.id}`);
let frenzy_ibrahim = await db.fetch(`rol_${member.guild.id}`) 
let frenzykanal = await db.fetch(`kanal_${member.guild.id}`)
if(!frenzy_ibrahim || !frenzykanal) return
member.addRole(frenzy_ibrahim)
client.channels.get(frenzykanal).send(
new Discord.RichEmbed()
  .setDescription(`Sunucumuza Yeni Üye Olan **${member}**  \`${rolisim}\` Adlı Rölü Başarıyla Verildi! <a:685083475509772337:741794147630972998>`)
)

});

//hgbb////////
client.on('guildMemberAdd', async member => {
  let kanal = await db.fetch(`hgbb_${member.guild.id}`)
  let kanal2 = client.channels.get(kanal)
  if(!kanal2) return
  kanal2.send(` <a:685939906295496746:741793868567150633> | Kimleri Görüyorum ${member} Sunucuya Katıldı!`)
})
client.on('guildMemberRemove', async member => {
  let kanal = await db.fetch(`hgbb_${member.guild.id}`)
  let kanal2 = client.channels.get(kanal)
  if(!kanal2) return
  kanal2.send(`<a:701365480652275742:741793885352624219> | Seni özleyeceğiz ${member.user.username} Sunucudan Ayrıldı!`)
})




//küfür
client.on("message", async msg => {
  
  
  let a = await db.fetch(`kufur_${msg.guild.id}`)
    if (a == 'acik') {
      const küfür = ["mk", "amk", "aq", "orospu", "oruspu", "oç", "sikerim", "yarrak", "piç", "amq", "sik", "amcık", "çocu", "sex", "seks", "amına", "orospu çocuğu", "sg", "siktir git", "ananı bacını", "ananı avradını"];
        if (küfür.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.hasPermission("MANAGE_GUILD")) {
                  msg.delete();
                          
                    return msg.channel.send(`${msg.author} Bu Sunucuda Küfür Edemezsin!`).then(msg => msg.delete(10000));
            }              
                } catch(err) {
                  console.log(err);
                }
              }
          }
          if (!a) return;
          });




//sa-as
client.on("message", async msg => {
  let saas = await db.fetch(`saas_${msg.guild.id}`);
  if (saas == 'kapali') return;
  if (saas == 'acik') {
  if (msg.content.toLowerCase() === 'sa') {
    msg.reply('Aleyküm Selam Kardeşim **Hoşgeldin!** <a:702070260546797678:737064168942993449>');
  }
  }
});

//mrb
client.on("message", async msg => {
  let saas = await db.fetch(`saas_${msg.guild.id}`);
  if (saas == 'kapali') return;
  if (saas == 'acik') {
  if (msg.content.toLowerCase() === 'merhaba') {
    msg.reply('Sanada Merhaba! ');
  }
  }
});


client.on("guildMemberRemove", async member => {
  let kanal = await db.fetch(`davetkanal_${member.guild.id}`);
  if (!kanal) return;
  let veri = await db.fetch(`rol1_${member.guild.id}`);
  let veri12 = await db.fetch(`roldavet1_${member.guild.id}`);
  let veri21 = await db.fetch(`roldavet2_${member.guild.id}`);
  let veri2 = await db.fetch(`rol2_${member.guild.id}`);
  let d = await db.fetch(`bunudavet_${member.id}`);
  const sa = client.users.get(d);
  const sasad = member.guild.members.get(d);
  let sayı2 = await db.fetch(`davet_${d}_${member.guild.id}`);
  db.add(`davet_${d}_${member.guild.id}`, -1);

  if (!d) {
    const aa = new Discord.RichEmbed()
      .setColor("BLUE")
      .setDescription(
        `\`\`${member.user.tag}\`\` **adlı şahıs aramızdan ayrıldı.\nŞahsı davet eden:** \`\`Bulunamadı!\`\``
      )
      .setFooter(client.user.username, client.user.avatarURL);
    client.channels.get(kanal).send(aa);
    return;
  } else {
    const aa = new Discord.RichEmbed()
      .setColor("BLUE")
      .setDescription(
        `\`\`${member.user.tag}\`\` **adlı şahıs aramızdan ayrıldı.\nŞahsı davet eden:** \`\`${sa.tag}\`\``
      )
      .setFooter(client.user.username, client.user.avatarURL);
    client.channels.get(kanal).send(aa);

    if (!veri) return;

    if (sasad.roles.has(veri)) {
      if (sayı2 <= veri12) {
        sasad.removeRole(veri);
        return;
      }
    }
    if (sasad.roles.has(veri2)) {
      if (!veri2) return;
      if (sayı2 <= veri21) {
        sasad.removeRole(veri2);
        return;
      }
    }
  }
});

client.on("guildMemberAdd", async member => {
  member.guild.fetchInvites().then(async guildInvites => {
    let veri = await db.fetch(`rol1_${member.guild.id}`);
    let veri12 = await db.fetch(`roldavet1_${member.guild.id}`);
    let veri21 = await db.fetch(`roldavet2_${member.guild.id}`);
    let veri2 = await db.fetch(`rol2_${member.guild.id}`);
    let kanal = await db.fetch(`davetkanal_${member.guild.id}`);
    if (!kanal) return;
    const ei = invites[member.guild.id];

    invites[member.guild.id] = guildInvites;

    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    const sasad = member.guild.members.get(invite.inviter.id);
    const davetçi = client.users.get(invite.inviter.id);

    db.add(`davet_${invite.inviter.id}_${member.guild.id}`, +1);
    db.set(`bunudavet_${member.id}`, invite.inviter.id);
    let sayı = await db.fetch(`davet_${invite.inviter.id}_${member.guild.id}`);

    let sayı2;
    if (!sayı) {
      sayı2 = 0;
    } else {
      sayı2 = await db.fetch(`davet_${invite.inviter.id}_${member.guild.id}`);
    }

    const aa = new Discord.RichEmbed()
      .setColor("BLUE")
      .setDescription(
        `\`\`${member.user.tag}\`\` **adlı şahıs sunucuya katıldı.\nŞahsı davet eden:** \`\`${davetçi.tag}\`\`\n**Toplam \`\`${sayı2}\`\` daveti oldu!**`
      )
      .setFooter(client.user.username, client.user.avatarURL);
    client.channels.get(kanal).send(aa);
    if (!veri) return;

    if (!sasad.roles.has(veri)) {
      if (sayı2 => veri12) {
        sasad.addRole(veri);
        return;
      }
    } else {
      if (!veri2) return;
      if (sayı2 => veri21) {
        sasad.addRole(veri2);
        return;
      }
    }
  });
});
//////////////////////////////////////////////////////////////////////////////


//seivye-sistemi
client.on("message", async message => {
  let prefix = ayarlar.prefix;

  var id = message.author.id;
  var gid = message.guild.id;

  let hm = await db.fetch(`seviyeacik_${gid}`);
  let kanal = await db.fetch(`svlog_${gid}`);
  let xps = await db.fetch(`verilecekxp_${gid}`);
  let seviyerol = await db.fetch(`svrol_${gid}`);
  let rollvl = await db.fetch(`rollevel_${gid}`);

  if (!hm) return;
  if (message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  var xp = await db.fetch(`xp_${id}_${gid}`);
  var lvl = await db.fetch(`lvl_${id}_${gid}`);
  var xpToLvl = await db.fetch(`xpToLvl_${id}_${gid}`);

  if (!lvl) {
    if (xps) {
      db.set(`xp_${id}_${gid}`, xps);
    }
    db.set(`xp_${id}_${gid}`, 4);
    db.set(`lvl_${id}_${gid}`, 1);
    db.set(`xpToLvl_${id}_${gid}`, 100);
  } else {
    if (xps) {
      db.add(`xp_${id}_${gid}`, xps);
    }
    db.add(`xp_${id}_${gid}`, 4);

    if (xp > xpToLvl) {
      db.add(`lvl_${id}_${gid}`, 1);
      db.add(
        `xpToLvl_${id}_${gid}`,
        (await db.fetch(`lvl_${id}_${gid}`)) * 100
      );
      if (kanal) {
	const embed1 = new Discord.RichEmbed()
	.setAuthor(message.author.username , message.author.avatarURL)
	.setDescription(message.member.user.username +
              "** | Seviye Atladı! Yeni seviyesi `" +
              lvl +
              "` Tebrikler! :tada: **")
        client.channels
          .get(kanal.id)
          .send(embed1);

      }
    }
  }

});

//-----YAZILI-HG-BB-----\\
client.on('guildMemberAdd', async member => {
  let fc = await db.fetch(`FrenzyResimsizHGBB_${member.guild.id}`)
  let frenzychannel = client.channels.get(fc)
  if(!frenzychannel) return
  frenzychannel.send(new Discord.RichEmbed().setDescription(`:inbox_tray:  Kimleri Görüyorum ${member} Sunucuya Katıldı!`))
})
client.on('guildMemberRemove', async member => {
  let fc = await db.fetch(`FrenzyResimsizHGBB_${member.guild.id}`)
  let frenzychannel = client.channels.get(fc)
  if(!frenzychannel) return
  frenzychannel.send(new Discord.RichEmbed().setDescription(`:outbox_tray:  Seni özleyeceğiz ${member} Sunucudan Ayrıldı!`))
})



client.on("guildMemberAdd", member => {
  let guild = member.guild;

  const channel = member.guild.channels.find("name", "👋│gelen");
  if (!channel) return;
  const embed = new Discord.RichEmbed()
    .setColor("0x00cc44")
    .setAuthor(client.user.username, client.user.avatarURL)
    .setThumbnail(member.user.avatarURL)
    .setTitle(`:inbox_tray: ${member.user.username} Sunucuya katıldı.`)
    .setTimestamp();
  channel.sendEmbed(embed);
});

client.on("guildMemberRemove", member => {
  const channel = member.guild.channels.find("name", "👋│giden");
  if (!channel) return;
  const embed = new Discord.RichEmbed()
    .setColor("0xff1a1a")
    .setAuthor(client.user.username, client.user.avatarURL)
    .setThumbnail(member.user.avatarURL)
    .setTitle(`:outbox_tray: ${member.user.username} Sunucudan ayrıldı.`)
    .setTimestamp();
  channel.sendEmbed(embed);
});



//-----YAZILI-HG-BB-----\\
client.on('guildMemberAdd', async member => {
  let fc = await db.fetch(`FrenzyResimsizHGBB_${member.guild.id}`)
  let frenzychannel = client.channels.get(fc)
  if(!frenzychannel) return
  frenzychannel.send(new Discord.RichEmbed().setDescription(`:inbox_tray:  Kimleri Görüyorum ${member} Sunucuya Katıldı!`))
})
client.on('guildMemberRemove', async member => {
  let fc = await db.fetch(`FrenzyResimsizHGBB_${member.guild.id}`)
  let frenzychannel = client.channels.get(fc)
  if(!frenzychannel) return
  frenzychannel.send(new Discord.RichEmbed().setDescription(`:outbox_tray:  Seni özleyeceğiz ${member} Sunucudan Ayrıldı!`))
})


const botadi = "Merlyn"

client.on('messageDelete', message => {
  let modlogs = db.get(`modlogkanaly_${message.guild.id}`)
  const modlogkanal = message.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    if (message.content.length > 1024) {
      modlogkanal.send({embed: {
    color: 3447003,
    author: {
      name: `${message.author.tag} tarafından gönderilen bir mesaj silindi`,
      icon_url: message.author.DisplayAvatarURL
    },
    fields: [{
        name: `Silinen mesaj 1024 karakterden fazla mesajı gösteremem`,
        value: `\`\`\`Bilinmiyor...\`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      icon_url: message.author.DisplayAvatarURL,
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
});
    } else {
      modlogkanal.send({embed: {
    color: 3447003,
    author: {
      name: `${message.author.tag} kullanıcısının mesajı silindi\n`,
      icon_url: message.author.DisplayAvatarURL
    },
    fields: [{
        name: `Silinen mesaj:`,
        value: `\`\`\` ${message.content} \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      icon_url: message.author.DisplayAvatarURL,
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
});
    }
  }
})


client.on('guildBanAdd', async (guild, user) => {
  let modlogs = db.get(`modlogkanaly_${guild.id}`)
  const modlogkanal = guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    let embed = new Discord.RichEmbed()
    .setColor("3447003")
    .setAuthor("Bir kişi sunucudan yasaklandı")
    .setThumbnail(user.avatarURL||user.defaultAvatarURL)
    .addField(`Yasaklanan kişi`, `\`\`\` ${user.tag} \`\`\` `)
    .setFooter(`${botadi} | Mod-Log Sistemi`)
    .setTimestamp()
    modlogkanal.send(embed)
  }
});

client.on('guildBanRemove', async (guild, user) => {
  let modlogs = db.get(`modlogkanaly_${guild.id}`)
  const modlogkanal = guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    let embed = new Discord.RichEmbed()
    .setColor("3447003")
    .setAuthor("Bir kişinin yasağı kaldırıldı")
    .setThumbnail(user.avatarURL||user.defaultAvatarURL)
    .addField(`Yasağı kaldırılan kişi`, `\`\`\` ${user.tag} \`\`\` `)
    .setFooter(`${botadi} | Mod-Log Sistemi`)
    .setTimestamp()
    modlogkanal.send(embed)
  }
});

client.on('channelCreate', async channel => {
  let modlogs = db.get(`modlogkanaly_${channel.guild.id}`)
  const modlogkanal = channel.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    if (channel.type === "text") {
      modlogkanal.send({embed: {
      color: 3447003,
      fields: [{
          name: `Bir Kanal Oluşturuldu. \nOluşturulan Kanalin İsmi:`,
          value: `\`\`\` ${channel.name} \`\`\``
        },
        {
          name: `Oluşturulan Kanalin Türü`,
          value: `\`\`\` Metin Kanalı \`\`\``
        }
      ],
      timestamp: new Date(),
      footer: {
        text: `${botadi} | Mod-Log Sistemi`
      }
     }});
    } else {
      if (channel.type === "voice") {
       modlogkanal.send({embed: {
    color: 3447003,
    fields: [{
        name: `Bir Kanal Oluşturuldu. \nOluşturulan Kanalin İsmi:`,
        value: `\`\`\` ${channel.name} \`\`\``
      },
      {
        name: `Oluşturulan Kanalin Türü`,
        value: `\`\`\` Ses Kanalı \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
}); 
      }
    }
  }
});

client.on('channelDelete', async channel => {
  let modlogs = db.get(`modlogkanaly_${channel.guild.id}`)
  const modlogkanal = channel.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    if (channel.type === "text") {
      modlogkanal.send({embed: {
      color: 3447003,
    fields: [{
        name: `Bir Kanal Silindi. \nSilinen Kanalin İsmi:`,
        value: `\`\`\` ${channel.name} \`\`\``
      },
      {
        name: `Silinen Kanalin Türü`,
        value: `\`\`\` Ses Kanalı \`\`\``
      }
      ],
      timestamp: new Date(),
      footer: {
        text: `${botadi} | Mod-Log Sistemi`
      }
     }});
    } else {
      if (channel.type === "voice") {
       modlogkanal.send({embed: {
    color: 3447003,
    fields: [{
        name: `Bir Kanal Silindi. \nSilinen Kanalin İsmi:`,
        value: `\`\`\` ${channel.name} \`\`\``
      },
      {
        name: `Silinen Kanalin Türü`,
        value: `\`\`\` Ses Kanalı \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
}); 
      }
    }
  }
});

client.on('roleDelete', async role => {
  let modlogs = db.get(`modlogkanaly_${role.guild.id}`)
  const modlogkanal = role.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    modlogkanal.send({embed: {
    color: 3447003,
    fields: [{
        name: `Bir Rol Silindi. \nSilinen Rolun İsmi:`,
        value: `\`\`\` ${role.name} \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
});
  }
});

client.on('emojiDelete', async emoji => {
  let modlogs = db.get(`modlogkanaly_${emoji.guild.id}`)
  const modlogkanal = emoji.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    modlogkanal.send({embed: {
    color: 3447003,
    fields: [{
        name: `Bir Emoji Silindi. \nSilinen Emojinin İsmi:`,
        value: `\`\`\` ${emoji.name} \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
});
  
  }
});


client.on('roleCreate', async role => {
  let modlogs = db.get(`modlogkanaly_${role.guild.id}`)
  const modlogkanal = role.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
     modlogkanal.send({embed: {
    color: 3447003,
    fields: [{
        name: `Yeni Bir Rol Oluşturuldu. \nOluşturulan Rolun İsmi:`,
        value: `\`\`\` ${role.name} \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      text: `${botadi} | Mod-Log Sistemi`
    }
  }
});
  }
});


client.on('messageUpdate', async (oldMessage, newMessage) => {
  let modlogs = db.get(`modlogkanaly_${oldMessage.guild.id}`)
  const modlogkanal = oldMessage.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    if (oldMessage.author.bot) {
        return false;
    }

    if (!oldMessage.guild) {
        return false;
    }

    if (oldMessage.content == newMessage.content) {
        return false;
    }
    modlogkanal.send({embed: {
      color: 3447003,
      author: {
      name: `${oldMessage.author.tag} mesajını düzenledi:\n`,
      icon_url: oldMessage.author.DisplayAvatarURL
      },
      fields: [{
        name: `Eski mesaj:`,
        value: `\`\`\` ${oldMessage.content} \`\`\``
      },
      {
        name: `Yeni Mesaj:`,
        value: `\`\`\` ${newMessage.content} \`\`\``
      }
      ],
      timestamp: new Date(),
      footer: {
      icon_url: oldMessage.author.DisplayAvatarURL,
      text: `${botadi} | Mod-Log Sistemi`
      }
    }
    });
  }
});


client.on('emojiCreate', async emoji => {
  let modlogs = db.get(`modlogkanaly_${emoji.guild.id}`)
  const modlogkanal = emoji.guild.channels.find(kanal => kanal.id === modlogs);
  if(!modlogs) return;
  if(modlogs) {
    modlogkanal.send({embed: {
    color: 3447003,
    fields: [{
        name: `Bir emoji eklendi. \nEklenen Emojinin İsmi:`,
        value: `\`\`\` ${emoji.name} \`\`\``
      }
    ],
    timestamp: new Date(),
    footer: {
      text: `${botadi} | Mod-Log Sistemi`
    } 
   } 
});
  }
});



		  
		  
//reklam
client.on("message", async msg => {
  
  
  let a = await db.fetch(`reklam.${msg.guild.id}`)
    if (a == 'acık') {
      
      const küfür = ["discord.gg"];
        if (küfür.some(word => msg.content.includes(word))) {
          try {
            if (!msg.member.hasPermission("MANAGE_GUILD")) {
                  msg.delete();
               msg.channel.send(`:duck:  | ${msg.author} Bu sunucuda **REKLAM** engelleme aktif`).then(msg => msg.delete(10000));
              let log = await db.fetch(`reklam-log.${msg.guild.id}`)
              if(!log) return;
                   let kanal = msg.guild.channels.get(log)
                   kanal.send(`:beginner: ${msg.author} adlı kullanıcı | **${msg.content}** | davet linki gönderdi ve davet linki kaldırıldı`)
            }              
                } catch(err) {
                  console.log(err);
                }
              }
          }
          });
		  
		  //sunucu-paneli
client.on("message", async (msg) => {
  let ever = msg.guild.roles.find(c => c.name === "@everyone")
	let sistem = await db.fetch(`panell_${msg.guild.id}`);
	if(sistem == "açık") {
		let kategori = msg.guild.channels.find(c => c.name.startsWith(msg.guild.name));
		if(!kategori) {
			msg.guild.createChannel(`${msg.guild.name} | Sunucu Paneli`, {
				type: 'category',
				permissionOverwrites: [{
					id: msg.guild.id,
					deny: ['CONNECT']
				}]
			}).then(parent => {
        setTimeout(async function() {
          let eo = msg.guild.roles.find(r => r.name == "@everyone")
          parent.overwritePermissions(eo, {
            CONNECT: false
          })
          setTimeout(async function() {
            parent.setPosition(0);
          })
          db.set(`panelParentID_${msg.guild.id}`, parent.id);
          let toplamUye = msg.guild.channels.find(c => c.name.startsWith('Toplam Üye •'));
          if(!toplamUye) {
            try {
              let s = msg.guild.memberCount;
              msg.guild.createChannel(`Toplam Üye • ${s}`, {
                type: 'voice'
              }).then(ch => {
                setTimeout(function() {
                  ch.overwritePermissions(ever, {
                    CONNECT: false
                  })
                  db.set(`toplamID_${msg.guild.id}`, ch.id)
                  ch.setParent(parent);
                  ch.setPosition(1);
                }, 120)
              })
            } catch (err) {

            }
          }
        let uyesayısı = msg.guild.channels.find(c => c.name.startsWith('Üye Sayısı •'));
        if(!uyesayısı) {
          try {
            let uyesayı = msg.guild.members.filter(m => !m.user.bot).size;
            msg.guild.createChannel(`Üye Sayısı • ${uyesayı}`, {
              type: 'voice'
            }).then(ch => {
              let ever = msg.guild.roles.find(role => role.name === "@everyone")
                setTimeout(function() {
                ch.overwritePermissions(ever, {
                  CONNECT: false
                })
                ch.setParent(parent);
                ch.setPosition(2);
                db.set(`uyeSayıID_${msg.guild.id}`, ch.id);
              }, 120)
            })
          } catch (err) {

          }
          let botsayı = msg.guild.members.filter(m => m.user.bot).size;
          try {
            msg.guild.createChannel(`Bot Sayısı • ${botsayı}`, {
              type: 'voice'
            }).then(ch => {
              let ever = msg.guild.roles.find(role => role.name === "@everyone")
              setTimeout(function() {
                ch.overwritePermissions(ever, {
                  CONNECT: false
                })
                ch.setParent(parent);
                ch.setPosition(3);
                db.set(`botSayıID_${msg.guild.id}`, ch.id);
              }, 120)
            })
          } catch (err) {

          }
          let onl = msg.guild.members.filter(m => m.presence.status != "offline" && !m.user.bot).size;
          try {
            msg.guild.createChannel(`Çevrimiçi Üye • ${onl}`, {
              type: 'voice'
            }).then(ch => {
              let ever = msg.guild.roles.find(role => role.name === "@everyone");
              setTimeout(function() {
                ch.setParent(parent);
                ch.setPosition(4);
                db.set(`onlSayıID_${msg.guild.id}`, ch.id);
                ch.overwritePermissions(ever, {
                  CONNECT: false
                })
              }, 120)
          })
        } catch (err) {
          
        }
      }
        }, 50)
			})
		} else {
      let parent = msg.guild.channels.find(c => c.name == `${msg.guild.name} | Sunucu Paneli`)
      if(msg.content.includes('panel kapat')) return false;
      let toplamuye = msg.guild.channels.find(c => c.name.startsWith(`Toplam Üye •`));
      toplamuye.setParent(parent);
      toplamuye.setName(`Toplam Üye • ${msg.guild.memberCount}`);
      let uyesayı = msg.guild.channels.find(c => c.name.startsWith(`Üye Sayısı •`));
      uyesayı.setParent(parent);
      uyesayı.setName(`Üye Sayısı • ${msg.guild.members.filter(m => !m.user.bot).size}`);
      let botuye = msg.guild.channels.find(c => c.name.startsWith(`Bot Sayısı •`));
      botuye.setParent(parent);
      botuye.setName(`Bot Sayısı • ${msg.guild.members.filter(m => m.user.bot).size}`);
      let onl = msg.guild.channels.find(c => c.name.startsWith('Çevrimiçi Üye •'));
      onl.setParent(parent);
      onl.setName(`Çevrimiçi Üye • ${msg.guild.members.filter(m => m.presence.status != "offline" && !m.user.bot).size}`);
		}
	} else {

	}
})  

client.on("guildCreate", guild => {  // sunucuya eklendim ve atıldım
let add = client.channels.get("742777660555526245")//doldurulacak yer
const eklendim = new Discord.RichEmbed()

.setTitle(`<:kalp:704829222455083028> | Sevgili Kullanıcılarımız Beni Ekledi`)
.setFooter("BOT İSMİ • Sizin Sayenizde Güzelleşiyorum...", client.user.avatarURL)
.setColor("#F0F2F3")
.setThumbnail(guild.iconURL)
.addField(`<:discord:728311595335286845> **Sunucu İsmi**`,guild.name)//emojileri değiştirebilirsiniz
.addField(`<:discord:728311595335286845> **Sunucu İD**`, guild.id)//emojileri değiştirebilirsiniz
.addField(`<:discord:728311595335286845> **Kurucu**`,guild.owner.user.tag)//emojileri değiştirebilirsiniz
.addField(`<:discord:728311595335286845> **Kurucu İD**`,guild.owner.user.id)//emojileri değiştirebilirsiniz
.addField(`👥 **Üye Sayısı**`,guild.memberCount)//emojileri değiştirebilirsiniz

add.send(eklendim)

});

client.on("guildDelete", guild => {
let remove = client.channels.get("742777660555526245")//doldurulacak yer
const atildim = new Discord.RichEmbed()

.setTitle(`<:x:> | Sevgili Kullanıcılarım Beni Çıkarttı`)
.setFooter("Merlyn • Sizin Sayenizde Güzelleşiyorum...", client.user.avatarURL)
.setColor("#F0F2F3")
.setThumbnail(guild.iconURL)
.addField(`<:discord:728311595335286845> **Sunucu İsmi**`,guild.name)//emojileri değiştirebilirsiniz
.addField(`<:discord:728311595335286845> **Sunucu İd**`, guild.id)//emojileri değiştirebilirsiniz
.addField(`<:discord:728311595335286845> **Kurucu**`,guild.owner.user.tag)//emojileri değiştirebilirsiniz
.addField(`<:discord:728311595335286845> **Kurucu İd**`,guild.owner.user.id)//emojileri değiştirebilirsiniz
.addField(`👥 **Üye Sayısı**`,guild.memberCount)//emojileri değiştirebilirsiniz

remove.send(atildim)

});


client.on("message" , async msg => {
  if(msg.content.startsWith(ayarlar.prefix+"afk")) return;
 
  let afk = msg.mentions.users.first()
 
  const kisi = db.fetch(`afkid_${msg.author.id}_${msg.guild.id}`)
 
  const isim = db.fetch(`afkAd_${msg.author.id}_${msg.guild.id}`)
 if(afk){
   const sebep = db.fetch(`afkSebep_${afk.id}_${msg.guild.id}`)
   const kisi3 = db.fetch(`afkid_${afk.id}_${msg.guild.id}`)
   if(msg.content.includes(kisi3)){
 
       msg.reply(`Etiketlediğiniz Kişi Afk \n Sebep : ${sebep}`)
   }
 }
  if(msg.author.id === kisi){
 
       msg.reply(`Afk'lıktan Çıktınız`)
  db.delete(`afkSebep_${msg.author.id}_${msg.guild.id}`)
  db.delete(`afkid_${msg.author.id}_${msg.guild.id}`)
  db.delete(`afkAd_${msg.author.id}_${msg.guild.id}`)
   msg.member.setNickname(isim)
   
 }
 
});

client.on("guildMemberAdd", async member => {
  let rol = await db.fetch(`ototag_${member.guild.id}`);
  let kanal = await db.fetch(`ototagk_${member.guild.id}`);
  let msj = await db.fetch(`ototagmsj_${member.guild.id}`);
  if (!rol) return;
  if (!kanal) return;

  if (!msj) {
    member.setNickname(`${rol} | ${member.user.username}`);
    const embed = new Discord.RichEmbed()
      .setColor("BLUE")
      .setDescription(
        `✅ **@${member.user.tag}** adlı şahsa tag verildi!`
      )
      .setFooter(client.user.username, client.user.avatarURL);
    client.channels.get(kanal).send(embed);
    return;
  } else {
    var msj2 = msj
      .replace(`-uye-`, `${member.user.username}`)
      .replace(`-tag-`, `${rol}`);
    member.setNickname(msj2);
    const embed = new Discord.RichEmbed()
      .setColor("BLUE")
      .setDescription(
        `✅ **@${member.user.tag}** adlı şahsa tag verildi!`
      )
      .setFooter(client.user.username, client.user.avatarURL);
    client.channels.get(kanal).send(embed);
    return;
  }
});


client.on("message", async message => {
  let uyarisayisi = await db.fetch(`reklamuyari_${message.author.id}`);
  let reklamkick = await db.fetch(`kufur_${message.guild.id}`);
  let kullanici = message.member;
  if (!reklamkick) return;
  if (reklamkick == "Açık") {
    const reklam = [
      "discord.app",
      "discord.gg",
      ".com",
      ".net",
      ".xyz",
      ".tk",
      ".pw",
      ".io",
      ".me",
      ".gg",
      "www.",
      "https",
      "http",
      ".gl",
      ".org",
      ".com.tr",
      ".biz",
      ".party",
      ".rf.gd",
      ".az"
    ];
    if (reklam.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("BAN_MEMBERS")) {
        message.delete();
        db.add(`reklamuyari_${message.author.id}`, 1); //uyarı puanı ekleme
        if (uyarisayisi === null) {
          let uyari = new Discord.RichEmbed()
            .setColor("BLUE")
            .setTitle("Merlyn Reklam-Engel!")
            .setDescription(
              `<@${message.author.id}> reklam yapmayı kes! bu ilk uyarın! (1/3)`
            )
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp();
          message.channel.send(uyari);
        }
        if (uyarisayisi === 1) {
          let uyari = new Discord.RichEmbed()
            .setColor("BLUE")
            .setTitle("Merlyn Reklam-Engel!")
            .setDescription(
              `<@${message.author.id}> reklam yapmayı kes! bu ikinci uyarın! (2/3)`
            )
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp();
          message.channel.send(uyari);
        }
        if (uyarisayisi === 2) {
          message.delete();
          await kullanici.kick({
            reason: `Reklam-Engel sistemi!`
          });
          let uyari = new Discord.RichEmbed()
            .setColor("BLUE")
            .setTitle("Merlyn Reklam-Engel!")
            .setDescription(
              `<@${message.author.id}> üç kere reklam yaptığı için sunucudan atıldı!`
            )
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp();
          message.channel.send(uyari);
        }
        if (uyarisayisi === 3) {
          message.delete();
          await kullanici.ban({
            reason: `Merlyn Reklam-Engel sistemi!`
          });
          db.delete(`reklamuyari_${message.author.id}`);
          let uyari = new Discord.RichEmbed()
            .setColor("BLUE")
            .setTitle("Merlyn Reklam kick sistemi")
            .setDescription(
              `<@${message.author.id}> atıldıktan sonra tekrar reklam yaptığı için sunucudan yasaklandı!`
            )
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp();
          message.channel.send(uyari);
        }
      }
    }
  }
});


//güvenlik

const useful = require('useful-tools') // modulu indirmelisin !
client.on("guildMemberAdd" , async member => {
	let kanal1 = await db.fetch(`gvn-log.${member.guild.id}`)
	if(!kanal1) return;
let kanal = member.guild.channels.get(kanal1)
let u = member.user
let zaman = u.createdAt
let zaman1 = useful.tarih(zaman)
const embed = new Discord.RichEmbed()
.setDescription(`**
Kullanıcı : ${member}

Hesap Kuruluş Tarihi : ${zaman1}
**`)
.setThumbnail(member.user.avatarURL)
kanal.send(embed)
})

