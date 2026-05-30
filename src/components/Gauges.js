import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

function GaugeCircle({ value, max = 100, color, title, unit }) {
    const radius = 54;
    const stroke = 10;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value / max, 0), 1);
    const dash = circumference * progress;

    return (
        <View style={styles.gaugeBox}>
            <Svg width={130} height={130} viewBox="0 0 130 130">
                {/* Trilha cinza */}
                <Circle
                    cx="65" cy="65" r={radius}
                    stroke="#2C3E50"
                    strokeWidth={stroke}
                    fill="none"
                />
                {/* Progresso colorido */}
                <Circle
                    cx="65" cy="65" r={radius}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={`${dash} ${circumference}`}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="65, 65"
                />
            </Svg>
            {/* Valor no centro */}
            <View style={styles.valueBox}>
                <Text style={[styles.value, { color }]}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                </Text>
                <Text style={styles.unit}>{unit}</Text>
            </View>
            <Text style={styles.label}>{title}</Text>
        </View>
    );
}

export default function Gauges({ temp, hum }) {
    return (
        <View style={styles.row}>
            <GaugeCircle value={temp} max={50} color="#E74C3C" title="Temperatura" unit="°C" />
            <GaugeCircle value={hum} max={100} color="#3498DB" title="Umidade" unit="%" />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    gaugeBox: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        alignItems: 'center',
        width: '48%',
        paddingVertical: 15,
    },
    valueBox: {
        position: 'absolute',
        top: 40,
        alignItems: 'center',
    },
    value: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    unit: {
        color: '#AAA',
        fontSize: 12,
    },
    label: {
        color: '#AAA',
        marginTop: 8,
        fontSize: 14,
    },
});