var express     = require('express')(),
    path        = require('path'),
    http        = require('http'),
    server      = http.createServer(express),
    Ipc         = require('./ipc/server'),
    ipc         = new Ipc(server),
    settings     = require('./settings'),
    theme       = require('./theme').init(),
    zeroconf = require('./zeroconf'),
    appAddresses = settings.read('appAddresses'),
    osc = {},
    clients = {}

express.get('/', function(req, res){
    res.sendFile(path.resolve(__dirname + '/../client/index.html'))
})

express.get('*', function(req, res){
    if (req.path.indexOf('theme.css') != -1) {
        res.set('Content-Type', 'text/css')
        if (settings.read('theme')) {
            var str = theme.get(),
                buf = Buffer.from && Buffer.from !== Uint8Array.from ? Buffer.from(str) : new Buffer(str)
            res.send(buf)
        } else {
            res.send('')
        }
    } else if (/(assets|client)\//.test(req.path)){
        res.sendFile(path.resolve(__dirname + '/..' + req.path))
    } else {
        res.sendFile(path.resolve(req.path))
    }
})

server.listen(settings.read('httpPort'))

zeroconf.publish({
    name: settings.read('appName') + (settings.read('instanceName') ? ' (' + settings.read('instanceName') + ')' : ''),
    type: 'http',
    port: settings.read('httpPort')
}).on('error', (e)=>{
    console.error(`Error: Zeroconf: ${e.message}`)
})

var bindCallbacks = function(callbacks) {

    ipc.on('connection', function(client) {

        for (let name in callbacks) {
            client.on(name, (data)=>{
                if (osc.customModule) {
                    osc.customModuleEventEmitter.emit(name, data, client.id)
                }
                callbacks[name](data, client.id)
            })
        }

        client.on('close', function() {

            callbacks.removeClientWidgets(client.id)

        })

    })

}

console.log('App available at ' + appAddresses.join(' & '))

module.exports =  {
    ipc:ipc,
    bindCallbacks:bindCallbacks,
    clients:clients
}

osc = require('./osc').server
