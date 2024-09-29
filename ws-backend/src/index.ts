import WebSocket from 'ws'
import { GameManager } from './GameManager'

const wss = new WebSocket.Server({ port: 8080 })
const gameManager = new GameManager()

wss.on('connection', (ws) => {

    gameManager.addUser(ws)

    ws.on('close', () => {
        gameManager.removeUser(ws)
    })

    ws.on('error', (err) => {
        console.log('Error: ', err)
    })

    ws.on('message', (data) => {
        console.log('Received: %s', data)  
    })

    ws.send('Hello! Message From Server!!')
})