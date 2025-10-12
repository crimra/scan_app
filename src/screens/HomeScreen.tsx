import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, AttendanceRecord } from '../types';
import { AttendanceService } from '../services/attendanceService';
import { formatTime } from '../utils/helpers';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le contexte d'authentification
      const userId = 'current-user-id';
      const records = await AttendanceService.getTodayAttendance(userId);
      setTodayAttendance(records);
    } catch (error) {
      console.error('Erreur lors du chargement du pointage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastCheckIn = () => {
    return todayAttendance.find(record => record.type === 'check-in');
  };

  const getLastCheckOut = () => {
    return todayAttendance.find(record => record.type === 'check-out');
  };

  const isCheckedIn = () => {
    const lastCheckIn = getLastCheckIn();
    const lastCheckOut = getLastCheckOut();
    
    if (!lastCheckIn) return false;
    if (!lastCheckOut) return true;
    
    return lastCheckIn.timestamp > lastCheckOut.timestamp;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.statusCard}>
          <Card.Title title="Statut actuel" />
          <Card.Content>
            <Text style={[styles.statusText, { color: isCheckedIn() ? '#4caf50' : '#f44336' }]}>
              {isCheckedIn() ? '✓ Présent' : '✗ Absent'}
            </Text>
            {getLastCheckIn() && (
              <Text style={styles.timeText}>
                Arrivée: {formatTime(getLastCheckIn()!.timestamp)}
              </Text>
            )}
            {getLastCheckOut() && (
              <Text style={styles.timeText}>
                Départ: {formatTime(getLastCheckOut()!.timestamp)}
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.actionCard}>
          <Card.Title title="Actions rapides" />
          <Card.Content>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('History')}
              style={styles.actionButton}
            >
              Voir l'historique
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Profile')}
              style={styles.actionButton}
            >
              Mon profil
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="qrcode-scan"
        label="Scanner"
        style={styles.fab}
        onPress={() => navigation.navigate('Scanner')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  actionCard: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionButton: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;