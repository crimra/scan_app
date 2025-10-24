import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card, TextInput, Divider, Snackbar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { simpleAgentService } from '../services/simpleAgentService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Initialisation du service et comptage des contrôleurs
  useEffect(() => {
    // Plus besoin d'initialisation spéciale - simplifié
  }, []);

  // Fonction pour afficher les messages Snackbar
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Validation stricte des entrées à 4 chiffres
  const validateInput = (text: string): string => {
    // Supprimer tous les caractères non-numériques
    const numericOnly = text.replace(/[^0-9]/g, '');
    // Limiter à 4 caractères maximum
    return numericOnly.slice(0, 4);
  };

  // Validation complète avant tentative de connexion
  const validateLoginData = (): { isValid: boolean; errorMessage?: string } => {
    console.log('🔍 Validation des données de connexion...');
    
    if (!agentId || agentId.trim() === '') {
      return { isValid: false, errorMessage: 'L\'ID contrôleur est requis' };
    }
    
    if (!password || password.trim() === '') {
      return { isValid: false, errorMessage: 'Le mot de passe est requis' };
    }
    
    if (agentId.length !== 4) {
      return { isValid: false, errorMessage: 'L\'ID doit contenir exactement 4 chiffres' };
    }
    
    if (password.length !== 4) {
      return { isValid: false, errorMessage: 'Le mot de passe doit contenir exactement 4 chiffres' };
    }
    
    console.log('✅ Données de connexion valides');
    return { isValid: true };
  };

  const handleAgentLogin = async () => {
    console.log('🚀 Début de la tentative de connexion...');
    console.log('📋 ID:', agentId, '| Mot de passe:', password.replace(/./g, '*'));
    
    // Validation préalable
    const validation = validateLoginData();
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.errorMessage);
      Alert.alert('Erreur de validation', validation.errorMessage);
      return;
    }

    setIsLoading(true);
    showSnackbar('Vérification des identifiants...');
    
    try {
      console.log('🔐 Appel de l\'authentification...');
      
      // Authentification avec timeout de 10 secondes
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000);
      });
      
      const authPromise = simpleAgentService.authenticateAgent(agentId, password);
      
      const isValid = await Promise.race([authPromise, timeoutPromise]);
      
      console.log('🎯 Résultat authentification:', isValid);
      
      if (isValid) {
        console.log('🎉 CONNEXION RÉUSSIE !');
        showSnackbar('Connexion réussie ! Redirection...');
        
        // Petit délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          navigation.replace('Home');
        }, 1500);
      } else {
        console.log('🔒 CONNEXION REFUSÉE');
        Alert.alert(
          'Connexion refusée', 
          'ID contrôleur ou mot de passe incorrect.\n\nVérifiez vos identifiants ou contactez l\'administrateur.',
          [{ text: 'OK', onPress: () => console.log('Utilisateur a confirmé l\'échec') }]
        );
      }
      
    } catch (error: any) {
      console.log('💥 ERREUR LORS DE LA CONNEXION:', error);
      
      let errorMessage = 'Erreur de connexion inconnue';
      
      if (error.message === 'Timeout') {
        errorMessage = 'Délai d\'attente dépassé. Vérifiez votre connexion.';
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      Alert.alert(
        'Erreur de connexion', 
        errorMessage + '\n\nVeuillez réessayer ou contacter l\'administrateur.',
        [{ text: 'OK', onPress: () => console.log('Utilisateur a confirmé l\'erreur') }]
      );
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Fin de la tentative de connexion');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Connexion Contrôleur" />
        <Card.Content>
          <Text style={styles.description}>
            Saisissez votre ID contrôleur et mot de passe
          </Text>
          
          <TextInput
            label="ID Contrôleur"
            value={agentId}
            onChangeText={(text) => setAgentId(validateInput(text))}
            keyboardType="numeric"
            maxLength={4}
            style={styles.input}
            mode="outlined"
            placeholder="0000"
            autoCapitalize="none"
            autoCorrect={false}
            error={agentId.length > 0 && agentId.length < 4}
          />
          
          <TextInput
            label="Mot de passe"
            value={password}
            onChangeText={(text) => setPassword(validateInput(text))}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={!isPasswordVisible}
            style={styles.input}
            mode="outlined"
            placeholder="0000"
            autoCapitalize="none"
            autoCorrect={false}
            error={password.length > 0 && password.length < 4}
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? "eye-off" : "eye"}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            }
          />
        </Card.Content>
        
        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handleAgentLogin} 
            style={styles.button}
            loading={isLoading}
            disabled={isLoading || agentId.length !== 4 || password.length !== 4}
          >
            Se connecter
          </Button>
        </Card.Actions>
      </Card>
      
      {/* Snackbar pour les notifications */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
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
  input: {
    marginBottom: 15,
  },
  actions: {
    marginTop: 10,
  },
  button: {
    flex: 1,
  },
  snackbar: {
    backgroundColor: '#4CAF50',
  },
});

export default LoginScreen;