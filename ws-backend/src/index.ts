import WebSocket from 'ws'
import { GameManager } from './GameManager'
const PORT = process.env.PORT || 8080; // @ts-ignore
const wss = new WebSocket.Server({ port: PORT })
const gameManager = GameManager.getInstance();

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

class Singleton {
    private static instance: Singleton | null = null;

    private constructor() {
        console.log('Singleton instance created');
    }

    public static getInstance(): Singleton {
        if (!this.instance) {
            this.instance = new Singleton(); 
        }
        return this.instance;
    }
}