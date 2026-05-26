var mqtt = require('mqtt')

var options = {
    host: 'b5c0a8076e584a1f8752f84df3478b74.s1.eu.hivemq.cloud',
    port: 8884,
    protocol: 'mqtts',
    username: 'aluno_etec',
    password: 'Senha123'
}

// initialize the MQTT client
var client = mqtt.connect(options);

// setup the callbacks
client.on('connect', function () {
    console.log('Connected');
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
});

// subscribe to topic 'my/test/topic'
client.subscribe('my/test/topic');

// publish message 'Hello' to topic 'my/test/topic'
client.publish('my/test/topic', 'Hello');