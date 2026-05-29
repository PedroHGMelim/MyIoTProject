import mqtt from 'mqtt';

export default class MQTTService {
    constructor() {
        this.client = null;
    }

    connect(config, onMessage, onConnect, onFailure) {
        const { host, port, path, user, pass, clientId } = config;

        const url = `wss://${host}:${port}${path}`;

        this.client = mqtt.connect(url, {
            username: user,
            password: pass,
            clientId: clientId,
            keepalive: 60,
            reconnectPeriod: 0,
        });

        this.client.on('connect', () => {
            console.log('MQTT conectado');
            onConnect()
        });

        this.client.on('message', (topic, message) => onMessage(topic, message.toString()));

        this.client.on('error', (err) => {
            console.log('MQTT error event:', err);
            onFailure(err)
        });

        this.client.on('close', () => {
            console.log('MQTT conexão fechada');
        });

        this.client.on('offline', () => {
            console.log('MQTT offline');
            onFailure(new Error('offline'));
        });
    }

    subscribe(topic) {
        if (this.client) this.client.subscribe(topic);
    }

    publish(topic, message) {
        if (this.client) this.client.publish(topic, message);
    }

    disconnect() {
        if (this.client) this.client.end();
    }
}