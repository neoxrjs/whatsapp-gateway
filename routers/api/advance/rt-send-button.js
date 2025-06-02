const { Component } = require('@neoxr/wb')
const { Instance, Function: Func } = new Component

exports.routes = {
   category: 'api',
   path: '/v1/button',
   method: 'post',
   parameter: ['number', 'text', 'button'],
   execution: async (req, res, next) => {
      try {
         const { number, media, text, button } = req.body
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

         const isBusiness = await client.getBusinessProfile(Func.noSuffix(client.user.id))
         if (isBusiness) return res.status(403).json({
            creator: global.creator,
            status: false,
            message: 'WhatsApp business can\'t send button message'
         })

         const check = (await client.onWhatsApp(String(number)))[0] || {}
         if (!check.exists) return res.status(404).json({
            creator: global.creator,
            status: false,
            message: 'Number not register on WhastApp'
         })

         if (media && !Func.isUrl(media)) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Media must be a valid url'
         })

         const buttons = JSON.parse(button)
         if (buttons.length > 2) return res.status(400).json({
            creator: global.creator,
            status: false,
            message: 'Maximum 2 buttons'
         })

         const msg = await client.replyButton(check.jid, buttons, null, {
            text,
            footer: global.footer,
            media
         })

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
