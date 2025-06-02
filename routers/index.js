exports.routes = {
   category: 'main',
   path: '/',
   method: 'get',
   execution: async (req, res, next) => {
      try {
         res.json({
            creator: global.creator,
            status: true,
            message: 'Server Online!'
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
