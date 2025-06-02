exports.run = {
   usage: ['menu'],
   category: 'main',
   async: async (m, {
      client,
      isPrefix,
      setting,
      plugins,
      Func
   }) => {
      try {
         let cmd = Object.entries(plugins).filter(([_, v]) => v.run.usage && v.run.category === 'owner' && !setting.hidden.includes(v.run.category.toLowerCase()))
         let usage = Object.keys(Object.fromEntries(cmd))
         if (usage.length == 0) return
         let commands = []
         cmd.map(([_, v]) => {
            switch (v.run.usage.constructor.name) {
               case 'Array':
                  v.run.usage.map(x => commands.push({
                     usage: x,
                     use: v.run.use ? Func.texted('bold', v.run.use) : ''
                  }))
                  break
               case 'String':
                  commands.push({
                     usage: v.run.usage,
                     use: v.run.use ? Func.texted('bold', v.run.use) : ''
                  })
            }
         })
         let print = commands.sort((a, b) => a.usage.localeCompare(b.usage)).map((v, i) => {
            if (i == 0) {
               return `┌  ◦  ${isPrefix + v.usage} ${v.use}`
            } else if (i == commands.sort((a, b) => a.usage.localeCompare(b.usage)).length - 1) {
               return `└  ◦  ${isPrefix + v.usage} ${v.use}`
            } else {
               return `│  ◦  ${isPrefix + v.usage} ${v.use}`
            }
         }).join('\n')
         m.reply(print)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   owner: true,
   location: __filename
}