const { Component } = require('@neoxr/wb')
const { Instance } = new Component

exports.routes = {
   category: 'api',
   path: '/v1/text',
   method: 'post',
   parameter: ['number', 'text'],
   execution: async (req, res, next) => {
      try {
         const { number, text } = req.body
         const token = req.headers['x-neoxr-token']
         if (!token) return res.status(401).json({
            creator: global.creator,
            status: false,
            message: 'Unauthorized'
         })

         const client = Instance.getBotByHash(token)
         if (!client) return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Bot not found'
         })

         const check = (await client.onWhatsApp(String(number)))[0] || {}
         if (!check.exists) return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Number not register on WhastApp'
         })

         const msg = await client.reply(check.jid, String(text), null)
         res.json({
            creator: global.ceator,
            status: true,
            data: msg
         })
      } catch (e) {
         res.status(500).json({
            creator: global.creator,
            status: false,
            message: e.message
         })
      }
   },
   error: false
}
