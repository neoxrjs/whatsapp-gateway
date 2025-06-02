const { models } = require('./models')
const init = new (require('./init'))

module.exports = m => {
   let user = global?.db?.users?.find(v => v.jid == m.sender)
   if (user) {
      init.execute(user, models.users, {
         name: m.pushName
      })
   } else {
      global.db.users.push({
         jid: m.sender,
         ...(init.getModel(models?.users || {}))
      })
   }

   let chat = global?.db?.chats?.find(v => v.jid == m.chat)
   if (chat) {
      init.execute(chat, models.chats)
   } else {
      global.db.chats.push({
         jid: m.chat,
         ...(init.getModel(models?.chats || {}))
      })
   }

   let setting = global?.db?.setting
   if (setting && Object.keys(setting).length < 1) {
      init.execute(setting, models.setting)
   } else {
      setting = {
         ...(init.getModel(models?.setting || {}))
      }
   }
}