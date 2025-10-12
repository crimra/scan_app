import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { AttendanceRecord } from '../types';
import { formatDateTime } from '../utils/helpers';

interface Props {
  record: AttendanceRecord;
}

const AttendanceCard: React.FC<Props> = ({ record }) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.dateText}>
            {formatDateTime(record.timestamp)}
          </Text>
          <Chip
            mode="outlined"
            style={[
              styles.typeChip,
              { backgroundColor: record.type === 'check-in' ? '#e8f5e8' : '#ffe8e8' }
            ]}
          >
            {record.type === 'check-in' ? 'Arrivée' : 'Départ'}
          </Chip>
        </View>
        
        {record.qrCodeData && (
          <Text style={styles.locationText}>
            📍 QR Code scanné
          </Text>
        )}
        
        {record.location && (
          <Text style={styles.coordsText}>
            📍 Position: {record.location.latitude.toFixed(6)}, {record.location.longitude.toFixed(6)}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
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
});

export default AttendanceCard;