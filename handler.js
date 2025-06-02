const { Component } = require('@neoxr/wb')
const { Function: Func, Cooldown, Spam, Config: env } = new Component
const cooldown = new Cooldown(env.cooldown)
const spam = new Spam({
   RESET_TIMER: env.cooldown,
   NOTIFY_THRESHOLD: env.notify_threshold
})

module.exports = async (client, ctx) => {
   const { store, m, body, prefix, plugins, commands, args, command, text, prefixes, core, database } = ctx
   try {
      require('./lib/system/schema')(m)
      let chats = global.db.chats.find(v => v.jid === m.chat)
      let users = global.db.users.find(v => v.jid === m.sender)
      let instance = global.db.instance?.find(v => v.jid === client.decodeJid(client.user.id))
      let setting = global.db.setting
      let isOwner = [client.decodeJid(client.user.id).replace(/@.+/, ''), env.owner, ...setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      let groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      let participants = m.isGroup ? client.lidParser(groupMetadata?.participants) : [] || []
      let adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      let isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      let isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:`[0]) + '@s.whatsapp.net') : false
      let blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const isSpam = spam.detection(client, m, {
         command, commands, users, cooldown,
         show: 'all'
      })

      if (!setting.multiprefix) setting.noprefix = false
      if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) {
         client.sendPresenceUpdate('available', m.chat)
         await client.readMessages([m.key])
      }

      if (!m.isGroup && m.fromMe && !m.isBot && chats) chats.lastreply = new Date() * 1
      if (chats) {
         chats.chat += 1
         chats.lastchat = new Date * 1
      } else {
         global.db.chats.push({
            jid: m.chat,
            chat: 1,
            lastchat: new Date * 1
         })
      }

      if (isSpam && /NOTIFY/.test(isSpam.state)) return
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !setting.silent)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }

      const usePrefix = body && prefix && commands.includes(command)
         || body && !prefix && commands.includes(command) && setting.noprefix
         || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)

      if (usePrefix) {
         if (setting.error.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (let name in is_commands) {
            const cmd = is_commands[name].run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue
            if (m.isBot || m.chat.endsWith('broadcast') || /edit/.test(m.mtype) || isSpam.state === 'IS_HOLD') continue
            if (setting.self && !isOwner && !m.fromMe) continue
            if (setting.silent && m.isGroup) continue
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, setting, instance, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, store, database, Func })
            break
         }
      } else {
         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         for (let name in is_events) {
            let event = is_events[name].run
            if ((m.isBot && m.fromMe) || (m.isBot && isOwner) || m.chat.endsWith('broadcast') || /pollUpdate/.test(m.mtype)) continue
            if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !isOwner && !m.fromMe) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, setting, instance, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, store, database, Func })
         }
      }
   } catch (e) {
      console.error(e)
   }
   Func.reload(require.resolve(__filename))
}