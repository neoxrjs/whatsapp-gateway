exports.run = {
   usage: ['token'],
   category: 'owner',
   async: async (m, {
      instance,
      Func
   }) => {
      try {
         m.reply(instance.hash)
      } catch (e) {
         m.reply(Func.jsonFormat(e))
      }
   },
   owner: true,
   private: true
}