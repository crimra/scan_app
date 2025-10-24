import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  RefreshControl 
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  List, 
  Divider,
  Portal,
  Dialog,
  Chip,
  IconButton
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Agent } from '../types';
import { simpleAgentService as agentService } from '../services/simpleAgentService';

type AdminManagementNavigationProp = StackNavigationProp<RootStackParamList, 'AdminManagement'>;

interface Props {
  navigation: AdminManagementNavigationProp;
}

const AdminManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour le dialogue de création/modification
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState({
    agentId: '',
    password: '',
    name: '',
  });
  const [passwordOptions, setPasswordOptions] = useState<string[]>([]);
  const [selectedPasswordIndex, setSelectedPasswordIndex] = useState<number | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      console.log('=== CHARGEMENT DES AGENTS ===');
      setLoading(true);
      const agentsList = await agentService.getAllAgents();
      console.log('Agents chargés:', agentsList);
      setAgents(agentsList);
      console.log('État mis à jour avec', agentsList.length, 'agents');
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des agents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAgents();
    setRefreshing(false);
  };

  const validateInput = (text: string): string => {
    return text.replace(/[^0-9]/g, '').slice(0, 4);
  };

  const resetForm = () => {
    setFormData({
      agentId: '',
      password: '',
      name: '',
    });
    setEditingAgent(null);
    setPasswordOptions([]);
    setSelectedPasswordIndex(null);
  };

  const handleCreateAgent = async () => {
    console.log('=== CRÉATION NOUVEL AGENT ===');
    resetForm();
    
    try {
      // Générer automatiquement un ID et des options de mots de passe
      const suggestedId = await agentService.generateUniqueAgentId();
      const passwordOpts = agentService.generatePasswordOptions(3);
      
      console.log('ID suggéré:', suggestedId);
      console.log('Mots de passe générés:', passwordOpts);
      
      // Mettre à jour le formulaire avec l'ID et le premier mot de passe
      setFormData(prev => ({ 
        ...prev, 
        agentId: suggestedId,
        password: passwordOpts.length > 0 ? passwordOpts[0] : ''
      }));
      setPasswordOptions(passwordOpts);
      setSelectedPasswordIndex(0); // Sélectionner le premier par défaut
      
      console.log('Formulaire initialisé pour création');
    } catch (error) {
      console.error('Erreur lors de la génération automatique:', error);
    }
    
    setDialogVisible(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      agentId: agent.agentId,
      password: '', // Ne pas afficher le mot de passe actuel
      name: agent.name,
    });
    setDialogVisible(true);
  };

  const handleGenerateId = async () => {
    try {
      // Génération séquentielle simple pour les contrôleurs
      const newId = await agentService.generateUniqueAgentId();
      setFormData({ ...formData, agentId: newId });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer un ID unique');
    }
  };

  const handleGeneratePasswords = () => {
    try {
      const newPasswordOptions = agentService.generatePasswordOptions(3);
      setPasswordOptions(newPasswordOptions);
      setSelectedPasswordIndex(0);
      
      if (newPasswordOptions.length > 0) {
        setFormData({ ...formData, password: newPasswordOptions[0] });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer des mots de passe');
    }
  };

  const handlePasswordSelect = (index: number) => {
    setSelectedPasswordIndex(index);
    setFormData({ ...formData, password: passwordOptions[index] });
  };

  // Cette fonction n'est plus nécessaire car on ne gère plus les départements

  const handleSaveAgent = async () => {
    console.log('=== DÉBUT CRÉATION CONTRÔLEUR ===');
    console.log('FormData:', formData);
    console.log('EditingAgent:', editingAgent);
    
    if (!formData.name.trim()) {
      console.log('Erreur: Nom manquant');
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }

    if (formData.agentId.length !== 4) {
      console.log('Erreur: ID agent invalide, longueur:', formData.agentId.length);
      Alert.alert('Erreur', 'L\'ID agent doit contenir exactement 4 chiffres');
      return;
    }

    if (!editingAgent && formData.password.length !== 4) {
      console.log('Erreur: Mot de passe invalide, longueur:', formData.password.length);
      Alert.alert('Erreur', 'Le mot de passe doit contenir exactement 4 chiffres');
      return;
    }

    if (editingAgent && formData.password && formData.password.length !== 4) {
      console.log('Erreur: Nouveau mot de passe invalide');
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir exactement 4 chiffres');
      return;
    }

    try {
      console.log('Début de la sauvegarde...');
      setLoading(true);

      if (editingAgent) {
        console.log('Mode modification');
        // Modification
        const updates: any = {
          name: formData.name,
        };
        
        if (formData.password) {
          updates.password = formData.password;
        }

        await agentService.updateAgent(editingAgent.agentId, updates);
        console.log('Agent modifié avec succès');
        Alert.alert('Succès', 'Agent modifié avec succès');
      } else {
        console.log('Mode création');
        console.log('Données à créer:', formData);
        
        const result = await agentService.createAgent(formData);
        console.log('Résultat création:', result);
        Alert.alert('Succès', 'Agent créé avec succès');
      }

      console.log('Fermeture du dialogue...');
      setDialogVisible(false);
      resetForm();
      
      console.log('Rechargement de la liste...');
      await loadAgents();
      console.log('=== FIN CRÉATION AGENT ===');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgent = (agent: Agent) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer l'agent ${agent.name} (${agent.agentId}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await agentService.deleteAgent(agent.agentId);
              Alert.alert('Succès', 'Agent supprimé avec succès');
              await loadAgents();
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'agent');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Title 
          title="Administration" 
          subtitle="Gestion des contrôleurs de vigiles"
          left={(props) => <IconButton {...props} icon="account-supervisor" />}
        />
        <Card.Actions>
          <Button 
            mode="contained" 
            onPress={handleCreateAgent}
            icon="account-plus"
          >
            Nouveau Contrôleur
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.goBack()}
            icon="arrow-left"
          >
            Retour
          </Button>
          {__DEV__ && (
            <Button 
              mode="text" 
              onPress={async () => {
                Alert.alert(
                  'Nettoyer les données',
                  'Supprimer tous les agents enregistrés ?',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { 
                      text: 'Supprimer', 
                      style: 'destructive',
                      onPress: async () => {
                        await agentService.clearAllData();
                        await loadAgents();
                        Alert.alert('Info', 'Données supprimées');
                      }
                    }
                  ]
                );
              }}
              icon="delete"
              textColor="#ff6b6b"
            >
              Debug
            </Button>
          )}
        </Card.Actions>
      </Card>

      {/* Liste des agents */}
      <Card style={styles.listCard}>
        <Card.Title title={`Contrôleurs (${agents.length})`} />
        <Card.Content>
          <ScrollView 
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {agents.map((agent, index) => (
              <View key={agent.id}>
                <List.Item
                  title={agent.name}
                  description={`Contrôleur ID: ${agent.agentId}`}
                  left={(props) => (
                    <List.Icon 
                      {...props} 
                      icon={agent.isActive ? "account-check" : "account-off"} 
                    />
                  )}
                  right={() => (
                    <View style={styles.actionButtons}>
                      <Chip 
                        compact
                        mode={agent.isActive ? "flat" : "outlined"}
                        style={[styles.statusChip, agent.isActive ? styles.activeChip : styles.inactiveChip]}
                      >
                        {agent.isActive ? 'Actif' : 'Inactif'}
                      </Chip>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditAgent(agent)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteAgent(agent)}
                      />
                    </View>
                  )}
                />
                {index < agents.length - 1 && <Divider />}
              </View>
            ))}
            
            {agents.length === 0 && !loading && (
              <Text style={styles.emptyText}>
                Aucun contrôleur enregistré
              </Text>
            )}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Dialog pour création/modification */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {editingAgent ? 'Modifier le contrôleur' : 'Nouveau contrôleur'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom complet du contrôleur"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Jean Dupont"
            />
            
            <View style={styles.idRow}>
              <TextInput
                label="ID Contrôleur"
                value={formData.agentId}
                onChangeText={(text) => setFormData({ ...formData, agentId: validateInput(text) })}
                keyboardType="numeric"
                maxLength={4}
                style={[styles.input, styles.idInput]}
                mode="outlined"
                placeholder="0000"
                disabled={!!editingAgent}
              />
              {!editingAgent && (
                <Button 
                  mode="outlined" 
                  onPress={handleGenerateId}
                  style={styles.generateButton}
                  compact
                  icon="refresh"
                >
                  Générer
                </Button>
              )}
            </View>
            
            {/* Section générateur de mots de passe */}
            <View style={styles.passwordSection}>
              <View style={styles.passwordHeader}>
                <Text style={styles.passwordLabel}>
                  {editingAgent ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={handleGeneratePasswords}
                  compact
                  icon="dice-multiple"
                  style={styles.generatePasswordButton}
                >
                  Générer
                </Button>
              </View>
              
              {passwordOptions.length > 0 && (
                <View style={styles.passwordOptions}>
                  <Text style={styles.optionsLabel}>Choisissez un mot de passe :</Text>
                  <View style={styles.passwordChips}>
                    {passwordOptions.map((password, index) => (
                      <Chip
                        key={index}
                        mode={selectedPasswordIndex === index ? "flat" : "outlined"}
                        selected={selectedPasswordIndex === index}
                        onPress={() => handlePasswordSelect(index)}
                        style={[
                          styles.passwordChip,
                          selectedPasswordIndex === index && styles.selectedPasswordChip
                        ]}
                      >
                        {password}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}
              
              <TextInput
                label="Ou saisissez manuellement"
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: validateInput(text) });
                  setSelectedPasswordIndex(null); // Désélectionner les options générées
                }}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                mode="outlined"
                placeholder="0000"
                right={
                  <TextInput.Icon
                    icon={isPasswordVisible ? "eye-off" : "eye"}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  />
                }
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Annuler</Button>
            <Button 
              mode="contained" 
              onPress={handleSaveAgent}
              loading={loading}
            >
              {editingAgent ? 'Modifier' : 'Créer'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    marginBottom: 16,
  },
  listCard: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: '#e8f5e8',
  },
  inactiveChip: {
    backgroundColor: '#ffeaea',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  idInput: {
    flex: 1,
    marginRight: 8,
  },
  generateButton: {
    marginBottom: 16,
  },
  passwordSection: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  generatePasswordButton: {
    
  },
  passwordOptions: {
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  passwordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  passwordChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPasswordChip: {
    backgroundColor: '#007bff',
  },
});

export default AdminManagementScreen;