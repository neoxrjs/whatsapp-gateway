const { Component } = require('@neoxr/wb')
const { Instance, Function: Func } = new Component

exports.routes = {
   category: 'api',
   path: '/v1/file',
   method: 'post',
   parameter: ['number', 'filename', 'url'],
   execution: async (req, res, next) => {
      try {
         const { number, url, filename, caption } = req.body
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

         if (!Func.isUrl(url)) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'File must be a valid url'
         })

         const msg = await client.sendFile(check.jid, url, filename, String(caption || ''), null, { document: true })
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
