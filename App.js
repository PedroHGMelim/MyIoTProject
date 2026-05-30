import React, { useState, useEffect, useRef } from 'react';
import { MQTT_HOST, MQTT_PORT, MQTT_PATH, MQTT_USER, MQTT_PASS } from '@env';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import MQTTService from './src/services/mqttService';
import HistoryService from './src/services/historyService';
import Gauges from './src/components/Gauges';
import HistoryScreen from './src/components/HistoryScreen';
import LightControl from './src/components/LightControl';
import StatusModal from './src/components/StatusModal';

export default function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isLightOn, setIsLightOn] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
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
            async (topic, message) => {
                if (topic === 'casa/temp') {
                    const value = parseFloat(message);
                    setTemp(value);
                    await HistoryService.addEntry('temp', value);
                }
                if (topic === 'casa/umid') {
                    const value = parseFloat(message);
                    setHum(value);
                    await HistoryService.addEntry('umid', value);
                }
                if (topic === 'casa/luz') {
                    const isOn = message === '1';
                    setIsLightOn(isOn);
                    await HistoryService.addEntry('luz', message);
                }
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

    if (showHistory) {
        return <HistoryScreen onClose={() => setShowHistory(false)} />;
    }

    return (
        <View style={styles.container}>
 
            <View style={styles.topBar}>
                <Text style={styles.header}>Smart Home IoT</Text>
                <TouchableOpacity
                    style={styles.historyBtn}
                    onPress={() => setShowHistory(true)}
                >
                    <Icon name="history" size={26} color="#27AE60" />
                </TouchableOpacity>
            </View>
 
            <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: isConnected ? '#27AE60' : '#E74C3C' }]} />
                <Text style={styles.statusText}>
                    {isConnected ? 'Conectado ao Broker' : 'Desconectado'}
                </Text>
            </View>
 
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
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 40,
        marginBottom: 8,
    },
    header: {
        flex: 1,
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    historyBtn: {
        padding: 8,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    statusText: {
        color: '#888',
        fontSize: 13,
    },
});