const { readFileSync: read } = require('fs')
exports.run = {
   usage: ['restore'],
   category: 'operator',
   async: async (m, {
      client,
      database,
      Func
   }) => {
      try {
         if (m.quoted && /document/.test(m.quoted.mtype) && /json/.test(m.quoted.fileName)) {
            const fn = await Func.getFile(await m.quoted.download())
            if (!fn.status) return m.reply(Func.texted('bold', '🚩 File cannot be downloaded.'))
            global.db = JSON.parse(read(fn.file, 'utf-8'))
            m.reply('✅ Database was successfully restored.').then(async () => {
               await database.save(JSON.parse(read(fn.file, 'utf-8')))
            })
         } else m.reply(Func.texted('bold', '🚩 Reply to the backup file first then reply with this feature.'))
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true,
   cache: true,
   location: __filename
}