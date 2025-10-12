import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CameraView, Camera } from 'expo-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AttendanceService } from '../services/attendanceService';
import { parseQRCode, isValidQRCode } from '../utils/helpers';

type ScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Scanner'>;

interface Props {
  navigation: ScannerScreenNavigationProp;
}

const ScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);

    try {
      // Vérifier que le QR code est valide
      if (!isValidQRCode(data)) {
        Alert.alert(
          'QR Code invalide',
          'Ce QR code ne correspond pas à un point de pointage valide.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      const qrData = parseQRCode(data);
      if (!qrData) {
        Alert.alert(
          'Erreur',
          'Impossible de lire les données du QR code.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      // TODO: Déterminer automatiquement le type (check-in/check-out) basé sur le dernier pointage
      // Pour l'instant, on demande à l'utilisateur
      Alert.alert(
        'Type de pointage',
        `Lieu: ${qrData.locationName}\n\nQuel type de pointage ?`,
        [
          {
            text: 'Arrivée',
            onPress: () => recordAttendance('check-in', data)
          },
          {
            text: 'Départ',
            onPress: () => recordAttendance('check-out', data)
          },
          {
            text: 'Annuler',
            onPress: () => setScanned(false),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du traitement du QR code.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const recordAttendance = async (type: 'check-in' | 'check-out', qrCodeData: string) => {
    try {
      // TODO: Récupérer l'ID utilisateur depuis le contexte d'authentification
      const userId = 'current-user-id';
      
      await AttendanceService.recordAttendance(userId, type, qrCodeData);
      
      Alert.alert(
        'Pointage enregistré',
        `${type === 'check-in' ? 'Arrivée' : 'Départ'} enregistré avec succès !`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'enregistrer le pointage. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Demande d'autorisation pour utiliser la caméra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          L'autorisation d'accès à la caméra est nécessaire pour scanner les QR codes.
        </Text>
        <Button mode="contained" onPress={() => Camera.requestCameraPermissionsAsync()}>
          Demander l'autorisation
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <Text style={styles.instruction}>
          Placez le QR code dans le cadre pour le scanner
        </Text>
        {scanned && (
          <Button
            mode="contained"
            onPress={() => setScanned(false)}
            style={styles.rescanButton}
          >
            Scanner à nouveau
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  instruction: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 50,
  },
});

export default ScannerScreen;