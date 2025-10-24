import AsyncStorage from '@react-native-async-storage/async-storage';

// Service simplifié pour les agents (version de test avec persistence)
export class SimpleAgentService {
  private agents: any[] = []; // Stockage temporaire
  private readonly STORAGE_KEY = 'agents_data';
  private initialized = false;

    // Méthode publique pour forcer l'initialisation (pour les tests)
  async forceInit(): Promise<void> {
    this.initialized = false; // Forcer la réinitialisation
    await this.init();
  }



  // Méthode publique pour obtenir le statut d'initialisation
  isInitialized(): boolean {
    return this.initialized;
  }

    // Initialisation du service - charge les données depuis AsyncStorage
  private async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    console.log('🚀 Initialisation du service...');
    
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (storedData) {
        this.agents = JSON.parse(storedData);
        console.log('✅ Données chargées depuis AsyncStorage:', this.agents.length, 'agents');
        
        // Log détaillé des agents chargés
        if (this.agents.length > 0) {
          console.log('📋 Agents trouvés:');
          this.agents.forEach((agent, index) => {
            console.log(`  ${index + 1}. ID: ${agent.agentId} | Nom: ${agent.name} | Actif: ${agent.isActive}`);
          });
        }
      } else {
        console.log('📄 Aucune donnée persistée trouvée, démarrage à vide');
        this.agents = [];
      }
      
      this.initialized = true;
      console.log('✅ Service initialisé avec', this.agents.length, 'agents');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      this.agents = [];
      this.initialized = true;
    }
  }

  // Sauvegarder les données dans AsyncStorage
  private async saveData(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.agents));
      console.log('Données sauvegardées dans AsyncStorage');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  // Fonction simple de hachage pour les mots de passe (même que agentService)
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

  // Authentification réelle avec vérification des contrôleurs enregistrés
  async authenticateAgent(agentId: string, password: string): Promise<boolean> {
    try {
      await this.init();
      
      console.log('=== DÉBUT AUTHENTIFICATION ===');
      console.log('🔍 ID demandé:', agentId);
      console.log('🔍 Mot de passe:', password.replace(/./g, '*'));
      console.log('📊 Contrôleurs en base:', this.agents.length);
      
      // Validation des paramètres d'entrée
      if (!agentId || !password) {
        console.log('❌ Paramètres manquants');
        return false;
      }
      
      // Vérifier que l'ID et le mot de passe sont à 4 chiffres
      if (agentId.length !== 4 || password.length !== 4) {
        console.log('❌ Format incorrect - ID:', agentId.length, 'caractères, MDP:', password.length, 'caractères');
        return false;
      }
      
      // Vérifier que ce sont bien des chiffres
      if (!/^\d{4}$/.test(agentId) || !/^\d{4}$/.test(password)) {
        console.log('❌ Format non numérique détecté');
        return false;
      }
      
      // Log de tous les contrôleurs pour debug
      console.log('📋 Liste des contrôleurs:');
      this.agents.forEach((agent, index) => {
        console.log(`  ${index + 1}. ID: ${agent.agentId} | Nom: ${agent.name} | Actif: ${agent.isActive}`);
      });
      
      // Chercher le contrôleur avec cet ID
      const agent = this.agents.find(agent => 
        agent.agentId === agentId && agent.isActive === true
      );
      
      if (!agent) {
        console.log('❌ Aucun contrôleur actif trouvé avec l\'ID:', agentId);
        
        // Vérifier s'il existe mais est inactif
        const inactiveAgent = this.agents.find(a => a.agentId === agentId);
        if (inactiveAgent) {
          console.log('⚠️  Contrôleur trouvé mais INACTIF:', inactiveAgent.name);
        }
        
        return false;
      }
      
      console.log('✅ Contrôleur trouvé:', agent.name, '(ID:', agent.agentId, ')');
      
      // Vérifier le mot de passe (comparaison avec le hash)
      const hashedPassword = this.hashPassword(password);
      const isPasswordValid = agent.password === hashedPassword;
      
      console.log('🔐 Hash du mot de passe saisi:', hashedPassword);
      console.log('🔐 Hash stocké:', agent.password);
      console.log('🔐 Mots de passe correspondent:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('🎉 ==> CONNEXION RÉUSSIE <==');
        console.log('👤 Bienvenue:', agent.name);
        return true;
      } else {
        console.log('🔒 ==> CONNEXION REFUSÉE <==');
        console.log('❌ Mot de passe incorrect pour', agent.name);
        return false;
      }
      
    } catch (error) {
      console.error('💥 ERREUR LORS DE L\'AUTHENTIFICATION:', error);
      return false;
    } finally {
      console.log('=== FIN AUTHENTIFICATION ===\n');
    }
  }

  // Méthode de diagnostic pour le débogage
  async getDiagnosticInfo(): Promise<{
    isInitialized: boolean;
    agentCount: number;
    agents: any[];
    storageKey: string;
  }> {
    await this.init();
    
    return {
      isInitialized: this.initialized,
      agentCount: this.agents.length,
      agents: this.agents.map(agent => ({
        agentId: agent.agentId,
        name: agent.name,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
        hasPassword: !!agent.password
      })),
      storageKey: this.STORAGE_KEY
    };
  }

  // Méthode pour vérifier si un contrôleur existe
  async checkAgentExists(agentId: string): Promise<{
    exists: boolean;
    isActive?: boolean;
    name?: string;
  }> {
    await this.init();
    
    const agent = this.agents.find(a => a.agentId === agentId);
    
    if (!agent) {
      return { exists: false };
    }
    
    return {
      exists: true,
      isActive: agent.isActive,
      name: agent.name
    };
  }

  // Créer un agent
  async createAgent(data: any): Promise<string> {
    await this.init();
    
    console.log('=== SERVICE: CRÉATION AGENT ===');
    console.log('Données reçues:', data);
    console.log('État avant création - Nombre d\'agents:', this.agents.length);
    
    // Vérifier que l'ID n'existe pas déjà
    const existingAgent = this.agents.find(a => a.agentId === data.agentId);
    if (existingAgent) {
      console.log('❌ ERREUR: ID déjà existant:', data.agentId);
      throw new Error(`L'ID ${data.agentId} existe déjà`);
    }
    
    const agent = {
      id: Date.now().toString(),
      ...data,
      password: this.hashPassword(data.password), // ⚡ HACHER LE MOT DE PASSE !
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Agent à créer:', {
      id: agent.id,
      agentId: agent.agentId,
      name: agent.name,
      passwordHash: agent.password,
      isActive: agent.isActive
    });
    
    this.agents.push(agent);
    console.log('📝 Agent ajouté au tableau local. Total:', this.agents.length);
    
    // Sauvegarder immédiatement avec vérification
    try {
      await this.saveData();
      console.log('💾 Sauvegarde réussie !');
      
      // Vérification immédiate
      const verification = await AsyncStorage.getItem(this.STORAGE_KEY);
      const savedData = verification ? JSON.parse(verification) : [];
      console.log('🔍 Vérification post-sauvegarde:', savedData.length, 'agents stockés');
      
      // Vérifier que notre agent est bien là
      const ourAgent = savedData.find((a: any) => a.agentId === agent.agentId);
      if (ourAgent) {
        console.log('✅ Agent confirmé dans le stockage:', ourAgent.agentId, '-', ourAgent.name);
      } else {
        console.log('❌ PROBLÈME: Agent non trouvé après sauvegarde !');
      }
      
    } catch (error) {
      console.log('❌ ERREUR de sauvegarde:', error);
      throw error;
    }
    
    return agent.id;
  }

  // Récupérer tous les agents
  async getAllAgents(): Promise<any[]> {
    await this.init();
    
    console.log('=== SERVICE: RÉCUPÉRATION AGENTS ===');
    console.log('Nombre d\'agents:', this.agents.length);
    console.log('Agents:', this.agents);
    
    // Convertir les dates string en objets Date pour la compatibilité
    return this.agents.map(agent => ({
      ...agent,
      createdAt: new Date(agent.createdAt)
    }));
  }

  // Générer un ID unique simple
  async generateUniqueAgentId(): Promise<string> {
    await this.init();
    
    const existingIds = this.agents.map(agent => parseInt(agent.agentId)).filter(id => !isNaN(id));
    
    if (existingIds.length === 0) {
      return '1001';
    }

    const maxId = Math.max(...existingIds);
    const nextId = maxId + 1;
    
    return nextId.toString().padStart(4, '0');
  }

  // Générer un mot de passe sécurisé
  generateSecurePassword(): string {
    const avoidPatterns = ['0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999', '1234', '4321'];
    
    let password: string;
    do {
      password = '';
      for (let i = 0; i < 4; i++) {
        password += Math.floor(Math.random() * 10).toString();
      }
    } while (avoidPatterns.includes(password));
    
    return password;
  }

  // Générer plusieurs options de mots de passe
  generatePasswordOptions(count: number = 3): string[] {
    const passwords: string[] = [];
    const usedPasswords = new Set<string>();
    
    while (passwords.length < count) {
      const password = this.generateSecurePassword();
      if (!usedPasswords.has(password)) {
        passwords.push(password);
        usedPasswords.add(password);
      }
    }
    
    return passwords;
  }

  // Suggérer un ID basé sur le département
  async suggestIdByDepartment(department: string): Promise<string> {
    await this.init();
    
    const departmentMap: { [key: string]: number } = {
      'it': 1000,
      'informatique': 1000,
      'rh': 2000,
      'ressources humaines': 2000,
      'finance': 3000,
      'comptabilité': 3000,
      'production': 4000,
      'commercial': 5000,
      'marketing': 6000,
      'direction': 9000
    };
    
    const baseId = departmentMap[department.toLowerCase()] || 1000;
    const existingIds = this.agents.map(agent => parseInt(agent.agentId)).filter(id => !isNaN(id));
    
    let nextId = Math.max(baseId + 1, 1001);
    
    while (existingIds.includes(nextId) && nextId <= 9999) {
      nextId++;
    }
    
    return nextId.toString().padStart(4, '0');
  }

  // Mettre à jour un agent
  async updateAgent(agentId: string, updates: any): Promise<void> {
    await this.init();
    
    const index = this.agents.findIndex(agent => agent.agentId === agentId);
    if (index !== -1) {
      this.agents[index] = { ...this.agents[index], ...updates };
      await this.saveData(); // Sauvegarder après modification
    }
  }

  // Supprimer un agent
  async deleteAgent(agentId: string): Promise<void> {
    await this.updateAgent(agentId, { isActive: false });
  }

  // Méthode pour recréer les agents avec les bons hashs
  async fixPasswordHashing(): Promise<void> {
    await this.init();
    
    console.log('🔧 Correction du hachage des mots de passe...');
    
    // Si des agents existent avec des mots de passe non hachés
    let fixed = 0;
    this.agents.forEach(agent => {
      // Vérifier si le mot de passe semble être en clair (4 chiffres uniquement)
      if (/^\d{4}$/.test(agent.password)) {
        console.log(`🔧 Correction du hash pour ${agent.name} (ID: ${agent.agentId})`);
        const oldPassword = agent.password;
        agent.password = this.hashPassword(agent.password);
        console.log(`   Ancien: ${oldPassword} → Nouveau: ${agent.password}`);
        fixed++;
      }
    });
    
    if (fixed > 0) {
      await this.saveData();
      console.log(`✅ ${fixed} mot(s) de passe corrigé(s) et sauvegardé(s)`);
    } else {
      console.log('ℹ️ Aucune correction nécessaire - tous les mots de passe sont déjà hachés');
    }
  }

  // Méthode pour nettoyer les données (utile pour les tests)
  async clearAllData(): Promise<void> {
    this.agents = [];
    await AsyncStorage.removeItem(this.STORAGE_KEY);
    console.log('Toutes les données ont été supprimées');
  }
}

export const simpleAgentService = new SimpleAgentService();