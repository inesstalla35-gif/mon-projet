/**
 * @file api.js
 * @description Service API centralisé pour toutes les requêtes HTTP.
 * 
 * Ce fichier configure et exporte une instance axios pré-configurée avec:
 * - URL de base pour le backend
 * - Intercepteurs pour l'authentification automatique
 * - Gestion centralisée des erreurs
 * 
 * Utilisation:
 * - Requêtes simples: API.get('/users'), API.post('/login', data)
 * - Avec token auto: API.get('/protected-route')
 * 
 * @requires axios
 * @requires @react-native-async-storage/async-storage
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../utils/const";

// Configuration de l'URL de base
// À modifier selon votre environnement:
// - Développement local: 'http://192.168.1.182:3000'
// - Production: 'https://votre-api.com'

/**
 * Instance axios pré-configurée
 * Inclut les intercepteurs pour:
 * - Ajout automatique du token dans les headers
 * - Gestion centralisée des erreurs
 */
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 100000, // 10 secondes max par requête
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== INTERCEPTEUR DE REQUÊTE ====================

/**
 * Intercepteur appelé avant chaque requête
 * Ajoute automatiquement le token JWT dans les headers Authorization
 * 
 * @param {Object} config - Configuration de la requête axios
 * @returns {Object} Configuration modifiée avec le token
 */
API.interceptors.request.use(
  async (config) => {
    try {
      // Récupération du token depuis AsyncStorage
      const token = await AsyncStorage.getItem("token");
      
      // Si un token existe, l'ajouter aux headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      // En cas d'erreur, retourner la config originale
      console.warn("Erreur lors de la récupération du token:", error);
      return config;
    }
  },
  (error) => {
    // Erreur au niveau de la configuration de la requête
    return Promise.reject(error);
  }
);

// ==================== INTERCEPTEUR DE RÉPONSE ====================

/**
 * Intercepteur appelé après chaque réponse
 * Gère les erreurs de manière centralisée
 * 
 * @param {Object} response - Réponse HTTP
 * @returns {Object} Réponse ou erreur
 */
API.interceptors.response.use(
  (response) => {
    // Réponse réussie, la retourner directement
    return response;
  },
  async (error) => {
    // Erreur de réponse
    const originalRequest = error.config;
    
    // Gestion du token expiré (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentative de rafraîchissement du token (optionnel)
        // À implémenter si votre backend supporte le refresh token
        // await refreshToken();
        
        // Alternative: déconnexion forcée
        await AsyncStorage.removeItem("token");
        
        // Vous pouvez dispatcher une action de déconnexion ici
        // si vous avez accès au store
        
        return Promise.reject(error);
      } catch (refreshError) {
        // Échec du rafraîchissement
        return Promise.reject(refreshError);
      }
    }
    
    // Renvoyer l'erreur avec un message plus descriptif
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Une erreur est survenue";
    
    return Promise.reject(new Error(errorMessage));
  }
);

// ==================== METHODES UTILITAIRES ====================

/**
 * Effectue une requête GET
 * @param {string} url - URL de la requête
 * @param {Object} params - Paramètres de requête (optionnel)
 * @returns {Promise} Réponse de l'API
 */
API.get = (url, params) => {
  return axios.get(url, { params });
};

/**
 * Effectue une requête POST
 * @param {string} url - URL de la requête
 * @param {Object} data - Données à envoyer
 * @returns {Promise} Réponse de l'API
 */
API.post = (url, data) => {
  console.log("the post response is:", axios.post(url, data))
  return axios.post(url, data);
};

/**
 * Effectue une requête PUT
 * @param {string} url - URL de la requête
 * @param {Object} data - Données à envoyer
 * @returns {Promise} Réponse de l'API
 */
API.put = (url, data) => {
  return axios.put(url, data);
};

/**
 * Effectue une requête PATCH
 * @param {string} url - URL de la requête
 * @param {Object} data - Données à envoyer
 * @returns {Promise} Réponse de l'API
 */
API.patch = (url, data) => {
  return axios.patch(url, data);
};

/**
 * Effectue une requête DELETE
 * @param {string} url - URL de la requête
 * @returns {Promise} Réponse de l'API
 */
API.delete = (url) => {
  return axios.delete(url);
};

// Export par défaut de l'instance API configurée
export default API;

