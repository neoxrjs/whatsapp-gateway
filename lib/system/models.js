const models = {
   users: {
      lastseen: -1,
      ban_temporary: -1,
      ban_times: -1,
      banned: false
   },
   chats: {
      chat: 0,
      lastchat: -1
   },
   setting: {
      debug: false,
      self: true,
      error: [],
      hidden: ['main'],
      pluginDisable: [],
      multiprefix: true,
      prefix: ['.', '#', '!', '/'],
      noprefix: false,
      online: false,
      onlyprefix: '`',
      owners: []
   }
}

module.exports = { models }