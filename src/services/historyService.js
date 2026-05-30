import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'mqtt_history';
const MAX_ENTRIES = 100; //limite de dados para não lotar o storage

const HistoryService = {

    async addEntry(type, value) {
        try {
            const existing = await this.loadHistory();

            const newEntry = {
                id: Date.now().toString(), //Id 
                type, //tipo de dado que vai ser salvo
                value, //valor dos dados
                timestamp: new Date().toISOString(), //momento que ele entrou no banco de dados
            };

            //Adiciona o dado mais recente no inicio do histórico
            const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);

            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
            return [];
        }
    },

    //Lê o histórico caso não tenha retorna um array vazio
    async loadHistory() {
        try {
            const raw = await AsyncStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            return [];
        }
    },

    //Apaga o histórico do dispositivo.
    async clearHistory() {
        try {
            await AsyncStorage.removeItem(HISTORY_KEY);
        } catch (error) {
            console.error('Erro ao limpar histórico:', error);
        }
    }
};

export default HistoryService