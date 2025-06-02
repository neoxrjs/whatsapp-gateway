exports.run = {
   usage: ['debug', 'multiprefix', 'noprefix', 'online', 'self'],
   use: 'on / off',
   category: 'owner',
   async: async (m, {
      client,
      args,
      command,
      setting: { system },
      Func
   }) => {
      const type = command.toLowerCase()
      if (!args || !args[0]) return client.reply(m.chat, `🚩 *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
      const option = args[0].toLowerCase()
      const optionList = ['on', 'off']
      if (!optionList.includes(option)) return client.reply(m.chat, `🚩 *Current status* : [ ${system[type] ? 'ON' : 'OFF'} ] (Enter *On* or *Off*)`, m)
      const status = option != 'on' ? false : true
      if (system[type] == status) return client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} previously.`), m)
      system[type] = status
      client.reply(m.chat, Func.texted('bold', `🚩 ${Func.ucword(command)} has been ${option == 'on' ? 'activated' : 'inactivated'} successfully.`), m)
   },
   owner: true,
   cache: true,
   location: __filename
}