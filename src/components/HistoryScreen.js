import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import HistoryService from '../services/historyService';

//Muda o visual por tipo de dado
const TYPE_CONFIG = {
    temp: { icon: 'thermometer', color: '#E74C3C', label: 'Temperatura', unit: '°C' },
    umid: { icon: 'water-percent', color: '#2C3E50', label: 'Umidade', unit: '%'  },
    luz:  { icon: 'lightbulb-on', color: '#F1C40F', label: 'Luz', unit: ''   },
};

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString('pt-BR');
}

function formatValue(type, value) {
    if (type === 'luz') return value === '1' || value === true ? 'Ligada' : 'Desligada';
    return `${parseFloat(value).toFixed(1)} ${TYPE_CONFIG[type]?.unit ?? ''}`;
}

export default function HistoryScreen({ onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        const data = await HistoryService.loadHistory();
        setHistory(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    const handleClear = () => {
        Alert.alert( 'Limpar Histórico', 'Deseja apagar todo o histórico salvo no dispositivo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: async () => {
                    await HistoryService.clearHistory();
                        setHistory([]);
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => {
        const cfg = TYPE_CONFIG[item.type] ?? { icon: 'help', color: '#888', label: item.type, unit: '' };
        return (
            <View style={styles.item}>
                <View style={[styles.iconBox, { backgroundColor: cfg.color + '22' }]}>
                    <Icon name={cfg.icon} size={24} color={cfg.color} />
                </View>
                <View style={styles.itemContent}>
                    <Text style={styles.itemLabel}>{cfg.label}</Text>
                    <Text style={styles.itemValue}>{formatValue(item.type, item.value)}</Text>
                    <Text style={styles.itemTime}>{formatDate(item.timestamp)}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Icon name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Histórico Local</Text>
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <Icon name="trash-can-outline" size={22} color="#E74C3C" />
                </TouchableOpacity>
            </View>

            <Text style={styles.counter}>{history.length} registro(s) salvos no dispositivo</Text>

            {loading ? (
                <ActivityIndicator color="#27AE60" style={{ marginTop: 40 }} />
            ) : history.length === 0 ? (
                <View style={styles.empty}>
                    <Icon name="database-off-outline" size={60} color="#444" />
                    <Text style={styles.emptyText}>Nenhum dado salvo ainda.</Text>
                    <Text style={styles.emptySubtext}>
                        Aguarde mensagens MQTT para que sejam persistidas aqui.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    closeBtn: {
        padding: 4
    },
    title: {
        flex: 1,
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    clearBtn: {
        padding: 4
    },
    counter: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 10
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 24
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14
    },
    itemContent: {
        flex: 1
    },
    itemLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 2
    },
    itemValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    itemTime: {
        color: '#555',
        fontSize: 11,
        marginTop: 2
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 16,
        fontWeight: 'bold'
    },
    emptySubtext: {
        color: '#444',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8
    }
});