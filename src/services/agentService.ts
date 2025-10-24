import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Agent } from '../types';

// Service pour gérer les agents
class AgentService {
  private readonly collectionName = 'agents';

  // Fonction simple de hachage pour les mots de passe (à améliorer en production)
  private hashPassword(password: string): string {
    // En production, utilisez bcrypt ou une autre bibliothèque sécurisée
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en entier 32 bits
    }
    return Math.abs(hash).toString();
  }

  // Vérifier si un ID agent existe déjà
  async isAgentIdExists(agentId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('agentId', '==', agentId)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'ID agent:', error);
      throw new Error('Erreur lors de la vérification de l\'ID agent');
    }
  }

  // Créer un nouveau contrôleur
  async createAgent(agentData: {
    agentId: string;
    password: string;
    name: string;
  }): Promise<string> {
    try {
      // Vérifier que l'ID et le mot de passe sont à 4 chiffres
      if (!/^\d{4}$/.test(agentData.agentId) || !/^\d{4}$/.test(agentData.password)) {
        throw new Error('L\'ID et le mot de passe doivent contenir exactement 4 chiffres');
      }

      // Vérifier si l'ID existe déjà
      const exists = await this.isAgentIdExists(agentData.agentId);
      if (exists) {
        throw new Error('Cet ID agent existe déjà');
      }

      const agent: Omit<Agent, 'id'> = {
        agentId: agentData.agentId,
        password: this.hashPassword(agentData.password),
        name: agentData.name,
        isActive: true,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...agent,
        createdAt: Timestamp.fromDate(agent.createdAt),
      });

      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'agent:', error);
      throw error;
    }
  }

  // Authentifier un agent
  async authenticateAgent(agentId: string, password: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('agentId', '==', agentId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return false;
      }

      const agentDoc = querySnapshot.docs[0];
      const agentData = agentDoc.data();
      
      return agentData.password === this.hashPassword(password);
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      return false;
    }
  }

  // Récupérer tous les agents
  async getAllAgents(): Promise<Agent[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const agents: Agent[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        agents.push({
          id: doc.id,
          agentId: data.agentId,
          password: data.password,
          name: data.name,
          isActive: data.isActive,
          createdAt: data.createdAt.toDate(),
        });
      });

      return agents.sort((a, b) => a.agentId.localeCompare(b.agentId));
    } catch (error) {
      console.error('Erreur lors de la récupération des agents:', error);
      throw new Error('Erreur lors de la récupération des agents');
    }
  }

  // Mettre à jour un agent
  async updateAgent(agentId: string, updates: Partial<Omit<Agent, 'id' | 'agentId' | 'createdAt'>>): Promise<void> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('agentId', '==', agentId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Agent non trouvé');
      }

      const agentDoc = querySnapshot.docs[0];
      const updateData: any = { ...updates };

      // Hacher le mot de passe s'il est modifié
      if (updates.password) {
        if (!/^\d{4}$/.test(updates.password)) {
          throw new Error('Le mot de passe doit contenir exactement 4 chiffres');
        }
        updateData.password = this.hashPassword(updates.password);
      }

      await updateDoc(doc(db, this.collectionName, agentDoc.id), updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'agent:', error);
      throw error;
    }
  }

  // Supprimer un agent (désactivation)
  async deleteAgent(agentId: string): Promise<void> {
    try {
      await this.updateAgent(agentId, { isActive: false });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'agent:', error);
      throw error;
    }
  }

  // Générer un ID agent unique avec logique séquentielle intelligente
  async generateUniqueAgentId(): Promise<string> {
    try {
      // Récupérer tous les agents existants
      const agents = await this.getAllAgents();
      const existingIds = agents.map(agent => parseInt(agent.agentId)).filter(id => !isNaN(id));
      
      if (existingIds.length === 0) {
        // Premier agent : commencer à 1001
        return '1001';
      }

      // Trier les IDs existants
      existingIds.sort((a, b) => a - b);
      
      // Chercher le prochain ID disponible dans la séquence
      let nextId = Math.max(...existingIds) + 1;
      
      // Si on dépasse 9999, chercher un trou dans la séquence
      if (nextId > 9999) {
        for (let i = 1001; i <= 9999; i++) {
          if (!existingIds.includes(i)) {
            nextId = i;
            break;
          }
        }
      }
      
      // Vérifier qu'on reste dans la plage 4 chiffres
      if (nextId > 9999) {
        throw new Error('Tous les IDs agents sont utilisés (1001-9999)');
      }
      
      return nextId.toString().padStart(4, '0');
    } catch (error) {
      console.error('Erreur lors de la génération de l\'ID agent:', error);
      throw new Error('Impossible de générer un ID agent unique');
    }
  }

  // Générer un mot de passe sécurisé à 4 chiffres
  generateSecurePassword(): string {
    // Éviter les motifs simples et prévisibles
    const avoidPatterns = [
      '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
      '1234', '4321', '0123', '3210', '1357', '2468', '0000', '1212', '1010'
    ];
    
    let password: string;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      // Générer 4 chiffres aléatoirement
      password = '';
      for (let i = 0; i < 4; i++) {
        password += Math.floor(Math.random() * 10).toString();
      }
      attempts++;
    } while (avoidPatterns.includes(password) && attempts < maxAttempts);
    
    return password;
  }

  // Générer plusieurs options de mots de passe
  generatePasswordOptions(count: number = 3): string[] {
    const passwords: string[] = [];
    const usedPasswords = new Set<string>();
    
    while (passwords.length < count && passwords.length < 50) {
      const password = this.generateSecurePassword();
      if (!usedPasswords.has(password)) {
        passwords.push(password);
        usedPasswords.add(password);
      }
    }
    
    return passwords;
  }

  // Suggérer le prochain ID (plus de département, génération séquentielle simple)
  async suggestIdByDepartment(department: string): Promise<string> {
    // Rediriger vers la génération normale d'ID
    return await this.generateUniqueAgentId();
  }

  // Obtenir l'ID de base pour un département
  private getDepartmentBaseId(department: string): number {
    const departmentMap: { [key: string]: number } = {
      'it': 1000,
      'informatique': 1000,
      'rh': 2000,
      'ressources humaines': 2000,
      'finance': 3000,
      'comptabilité': 3000,
      'production': 4000,
      'fabrication': 4000,
      'commercial': 5000,
      'vente': 5000,
      'marketing': 6000,
      'communication': 6000,
      'direction': 9000,
      'management': 9000
    };
    
    const key = department.toLowerCase();
    return departmentMap[key] || 1000;
  }

  // Obtenir le prochain ID disponible à partir d'un nombre de base
  private async getNextAvailableId(baseId: number): Promise<string> {
    const agents = await this.getAllAgents();
    const existingIds = agents.map(agent => parseInt(agent.agentId)).filter(id => !isNaN(id));
    
    let nextId = Math.max(baseId, 1001);
    
    while (existingIds.includes(nextId) && nextId <= 9999) {
      nextId++;
    }
    
    if (nextId > 9999) {
      // Fallback sur la génération normale
      return await this.generateUniqueAgentId();
    }
    
    return nextId.toString().padStart(4, '0');
  }
}

export const agentService = new AgentService();