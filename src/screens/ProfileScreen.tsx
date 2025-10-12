import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  // TODO: Récupérer les données utilisateur depuis le contexte d'authentification
  const user = {
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Développement',
    role: 'employee' as 'employee' | 'admin',
  };

  const handleLogout = () => {
    // TODO: Implémenter la logique de déconnexion
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user.name.split(' ').map(n => n[0]).join('')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Title title="Informations" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Département:</Text>
            <Text style={styles.infoValue}>{user.department}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rôle:</Text>
            <Text style={styles.infoValue}>
              {user.role === 'admin' ? 'Administrateur' : 'Employé'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.actionsCard}>
        <Card.Title title="Actions" />
        <Card.Content>
          <Button
            mode="outlined"
            onPress={() => {/* TODO: Ouvrir les paramètres */}}
            style={styles.actionButton}
          >
            Paramètres
          </Button>
          <Button
            mode="outlined"
            onPress={() => {/* TODO: Afficher l'aide */}}
            style={styles.actionButton}
          >
            Aide
          </Button>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
            buttonColor="#f44336"
          >
            Se déconnecter
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;