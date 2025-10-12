import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AttendanceRecord } from '../types';
import { AttendanceService } from '../services/attendanceService';
import { formatDateTime } from '../utils/helpers';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le contexte d'authentification
      const userId = 'current-user-id';
      const history = await AttendanceService.getUserAttendanceHistory(userId);
      setAttendanceHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>
            {formatDateTime(item.timestamp)}
          </Text>
          <Chip
            mode="outlined"
            style={[
              styles.typeChip,
              { backgroundColor: item.type === 'check-in' ? '#e8f5e8' : '#ffe8e8' }
            ]}
          >
            {item.type === 'check-in' ? 'Arrivée' : 'Départ'}
          </Chip>
        </View>
        
        {item.qrCodeData && (
          <Text style={styles.locationText}>
            📍 Lieu de pointage scanné
          </Text>
        )}
        
        {item.location && (
          <Text style={styles.coordsText}>
            📍 Lat: {item.location.latitude.toFixed(6)}, 
            Lng: {item.location.longitude.toFixed(6)}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Chargement de l'historique...</Text>
      </View>
    );
  }

  if (attendanceHistory.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Aucun pointage enregistré pour le moment.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={attendanceHistory}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  typeChip: {
    marginLeft: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  coordsText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default HistoryScreen;