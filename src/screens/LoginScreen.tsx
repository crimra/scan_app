import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const handleLogin = () => {
    // TODO: Implémenter la logique d'authentification
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Connexion" subtitle="Application de pointage QR" />
        <Card.Content>
          <Text style={styles.description}>
            Connectez-vous pour accéder à l'application de pointage.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Se connecter
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 20,
  },
  description: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    flex: 1,
  },
});

export default LoginScreen;