console.clear(), require('dotenv').config(), require('rootpath')()
const { spawn: spawn } = require('child_process'), path = require('path'), CFonts = require('cfonts')

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err.message)
	console.error(err.stack)
})

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection:', reason)
})

function start() {
	let args = [path.join(__dirname, 'client.js'), ...process.argv.slice(2)]
	let p = spawn(process.argv[0], args, {
		stdio: ['inherit', 'inherit', 'inherit', 'ipc']
	})
		.on('message', data => {
			if (data == 'reset') {
				console.log('Restarting...')
				p.kill()
				delete p
			}
		})
		.on('exit', code => {
			console.error('Exited with code:', code)
			start()
		})
}

CFonts.say('NEOXR BOT', {
	font: 'tiny',
	align: 'center',
	colors: ['system']
}), CFonts.say('Github : https://github.com/neoxrjs/whatsapp-gateway', {
	colors: ['system'],
	font: 'console',
	align: 'center'
}), start()