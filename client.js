"use strict"
require('events').EventEmitter.defaultMaxListeners = 100
const { Component } = require('@neoxr/wb')
const { Baileys, Function: Func, Config: env } = new Component
require('./lib/system/config'), require('./lib/system/baileys'), require('./lib/system/functions')
const path = require('path')
const fs = require('fs')
const colors = require('@colors/colors')
const { platform } = require('os')

const connect = async () => {
   // Documentation : https://github.com/neoxr/session
   const session = process?.env?.DATABASE_URL ? /mongo/.test(process.env.DATABASE_URL)
      ? require('@session/mongo').useMongoAuthState
      : /postgres/.test(process.env.DATABASE_URL)
         ? require('@session/postgres').usePostgresAuthState
         : require('@session/sqlite').useSQLiteAuthState
      : require('@session/sqlite').useSQLiteAuthState

   // Documentation : https://github.com/neoxr/database
   const database = await (process?.env?.DATABASE_URL ? /mongo/.test(process.env.DATABASE_URL)
      ? require('@database/mongo').createDatabase(process.env.DATABASE_URL, env.database, 'database')
      : /postgres/.test(process.env.DATABASE_URL)
         ? require('@database/postgres').createDatabase(process.env.DATABASE_URL, env.database)
         : require('@database/sqlite').createDatabase(env.database)
      : require('@database/sqlite').createDatabase(env.database))

   const client = new Baileys({
      type: '--neoxr-v1',
      plugsdir: 'plugins',
      session: session ? /useSQLiteAuthState/.test(session.name) ? session('./session.db') : session(process.env.DATABASE_URL) : 'session',
      online: true,
      bypass_disappearing: true,
      bot: id => {
         return id && ((id.startsWith('3EB0') && id.length === 40) || id.startsWith('BAE') || /[-]/.test(id))
      },
      server: { host: '127.0.0.1' },
      version: env.pairing.version
   }, {
      shouldIgnoreJid: jid => {
         return jid && /(newsletter|bot)/.test(jid)
      }
   })

   /* starting to connect */
   client.once('connect', async res => {
      /* load database */
      global.db = { users: [], chats: [], setting: {}, instance: [], ...(await database.fetch() || {}) }
      /* save database */
      await database.save(global.db)
      /* write connection log */
      if (res && typeof res === 'object' && res.message) Func.logFile(res.message)
   })

   /* print error */
   client.register('error', async error => {
      console.log(colors.red(error.message))
      if (error && typeof error === 'object' && error.message) Func.logFile(error.message)
   })

   /* bot is connected */
   client.once('ready', async () => {
      /* auto restart if ram usage is over */
      const ramCheck = setInterval(() => {
         var ramUsage = process.memoryUsage().rss
         if (ramUsage >= require('bytes')(env.ram_limit)) {
            clearInterval(ramCheck)
            process.send('reset')
         }
      }, 60 * 1000)

      /* create temp directory if doesn't exists */
      if (!fs.existsSync('./temp')) fs.mkdirSync('./temp')

      /* clear temp folder every 10 minutes */
      setInterval(async () => {
         try {
            const tmpFiles = fs.readdirSync('./temp')
            if (tmpFiles.length > 0) {
               tmpFiles.filter(v => !v.endsWith('.file')).map(v => fs.unlinkSync('./temp/' + v))
            }

            const TIME = 1000 * 60 * 60
            const filename = []
            const files = fs.readdirSync('./session')
            for (const file of files) {
               if (file != 'creds.json') filename.push(path.join('./session', file))
            }

            await Promise.allSettled(filename.map((file) => {
               const stat = fs.statSync(file)
               if (stat.isFile() && (Date.now() - stat.mtimeMs >= TIME)) {
                  if (platform() === 'win32') {
                     let fileHandle
                     try {
                        fileHandle = fs.openSync(file, 'r+')
                     } catch (e) { } finally {
                        fileHandle.close()
                     }
                  }
                  fs.unlinkSync(file)
               }
            }))
         } catch { }
      }, 60 * 1000 * 10)

      /* save database every 5 minutes */
      setInterval(async () => {
         if (global.db) await database.save(global.db)
      }, 60 * 1000 * 5)
   })

   /* print all message object */
   client.register('message', ctx => require('./handler')(client.sock, { ...ctx, database }))

   /* call blocking */
   client.register('caller', ctx => {
      if (typeof ctx === 'boolean') return
      client.sock.updateBlockStatus(ctx.jid, 'block')
   })
}

connect().catch(() => connect())