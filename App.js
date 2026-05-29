import React, { useState, useEffect, useRef } from 'react';
import { MQTT_HOST, MQTT_PORT, MQTT_PATH, MQTT_USER, MQTT_PASS } from '@env';
import { StyleSheet, View, Text } from 'react-native';
import MQTTService from './src/services/mqttService';
import Gauges from './src/components/Gauges';
import LightControl from './src/components/LightControl';
import StatusModal from './src/components/StatusModal';

export default function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isLightOn, setIsLightOn] = useState(false);
    const [temp, setTemp] = useState(0);
    const [hum, setHum] = useState(0);

    const mqttRef = useRef(new MQTTService());

    const mqttConfig = {
        host: MQTT_HOST,
        port: parseInt(MQTT_PORT),
        path: MQTT_PATH,
        user: MQTT_USER,
        pass: MQTT_PASS,
        clientId: 'RN_App_' + Math.random()
    };

    console.log('Config MQTT:', MQTT_HOST, MQTT_PORT, MQTT_PATH);

    useEffect(() => {
        startConnection();
    }, []);

    const startConnection = () => {
        setShowError(false);
        mqttRef.current.connect(
            mqttConfig,
            (topic, message) => {
                if (topic === 'casa/temp') setTemp(parseFloat(message));
                if (topic === 'casa/umid') setHum(parseFloat(message));
                if (topic === 'casa/luz') setIsLightOn(message === "1");
            },
            () => {
                setIsConnected(true);
                mqttRef.current.subscribe('casa/temp');
                mqttRef.current.subscribe('casa/umid');
                mqttRef.current.subscribe('casa/luz');
            },
            (err) => {
                console.log('MQTT erro:', err);
                setIsConnected(false);
                setShowError(true);
            }
        );
    };

    const toggleLight = () => {
        const newState = isLightOn ? "0" : "1";
        mqttRef.current.publish('casa/luz', newState);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Smart Home IoT</Text>

            <LightControl isLightOn={isLightOn} onToggle={toggleLight} />

            <Gauges temp={temp} hum={hum} />

            <StatusModal
                visible={showError}
                onRetry={startConnection}
                onLater={() => setShowError(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
        alignItems: 'center'
    },
    header: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginBottom: 20
    },
});