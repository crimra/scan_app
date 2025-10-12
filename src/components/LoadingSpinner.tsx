import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

interface Props {
  message?: string;
}

const LoadingSpinner: React.FC<Props> = ({ message = 'Chargement...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingSpinner;