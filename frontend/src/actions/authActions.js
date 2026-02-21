/**
 * @file authActions.js
 * @description Actions Redux pour l'authentification utilisateur.
 * 
 * Ce fichier contient toutes les actions liées à:
 * - Inscription (register)
 * - Connexion (login)
 * - Déconnexion (logout)
 * - Récupération de l'utilisateur actuel
 * 
 * Ces actions interagissent avec l'API backend pour gérer le cycle
 * de vie de l'authentification.
 * 
 * @requires redux-thunk - Pour les actions asynchrones
 * @requires axios - Service API
 * @requires @react-native-async-storage/async-storage - Stockage du token
 */

import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import des types d'actions
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  GET_CURRENT_USER_REQUEST,
  GET_CURRENT_USER_SUCCESS,
  GET_CURRENT_USER_FAIL,
  LOGOUT,
  CLEAR_AUTH_ERROR,
} from "../types/authTypes";
import { BASE_URL } from "../utils/const";

// ==================== ACTION CREATORS ====================

/**
 * Action creator pour le début d'une tentative de connexion
 * @returns {Object} Action avec type LOGIN_REQUEST
 */
const loginRequest = () => ({
  type: LOGIN_REQUEST,
});

/**
 * Action creator pour une connexion réussie
 * @param {Object} data - Données de réponse (user + token)
 * @returns {Object} Action avec type LOGIN_SUCCESS et payload
 */
const loginSuccess = (data) => ({
  type: LOGIN_SUCCESS,
  payload: data,
});

/**
 * Action creator pour une connexion échouée
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type LOGIN_FAIL et payload
 */
const loginFail = (error) => ({
  type: LOGIN_FAIL,
  payload: error,
});

/**
 * Action creator pour le début d'une inscription
 * @returns {Object} Action avec type REGISTER_REQUEST
 */
const registerRequest = () => ({
  type: REGISTER_REQUEST,
});

/**
 * Action creator pour une inscription réussie
 * @param {Object} data - Données de réponse (user + token)
 * @returns {Object} Action avec type REGISTER_SUCCESS et payload
 */
const registerSuccess = (data) => ({
  type: REGISTER_SUCCESS,
  payload: data,
});

/**
 * Action creator pour une inscription échouée
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type REGISTER_FAIL et payload
 */
const registerFail = (error) => ({
  type: REGISTER_FAIL,
  payload: error,
});

/**
 * Action creator pour le début de la récupération de l'utilisateur actuel
 * @returns {Object} Action avec type GET_CURRENT_USER_REQUEST
 */
const getCurrentUserRequest = () => ({
  type: GET_CURRENT_USER_REQUEST,
});

/**
 * Action creator pour la récupération réussie de l'utilisateur
 * @param {Object} user - Données de l'utilisateur
 * @returns {Object} Action avec type GET_CURRENT_USER_SUCCESS et payload
 */
const getCurrentUserSuccess = (user) => ({
  type: GET_CURRENT_USER_SUCCESS,
  payload: user,
});

/**
 * Action creator pour l'échec de récupération de l'utilisateur
 * @param {string} error - Message d'erreur
 * @returns {Object} Action avec type GET_CURRENT_USER_FAIL et payload
 */
const getCurrentUserFail = (error) => ({
  type: GET_CURRENT_USER_FAIL,
  payload: error,
});

/**
 * Action creator pour la déconnexion
 * @returns {Object} Action avec type LOGOUT
 */
const logoutAction = () => ({
  type: LOGOUT,
});

/**
 * Action creator pour清除 les erreurs
 * @returns {Object} Action avec type CLEAR_AUTH_ERROR
 */
const clearAuthError = () => ({
  type: CLEAR_AUTH_ERROR,
});

// ==================== THUNK ACTIONS ====================

/**
 * Thunk action pour connecter un utilisateur
 * 
 * @param {string} email - Email de l'utilisateur
 * @param {string} mot_de_passe - Mot de passe de l'utilisateur
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(login('user@example.com', 'motdepasse123'))
 */
export const login = (email, mot_de_passe) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(loginRequest());

      // Appel API
      const { data } = await API.post(`${BASE_URL}/api/users/login`, {
        email,
        mot_de_passe,
      });

      console.log("data login for login::", data)

      // Stockage du token dans AsyncStorage
      await AsyncStorage.setItem("token", data.token);

      // Succès - dispatch de l'action de succès
      dispatch(loginSuccess(data));
    } catch (error) {
      // Erreur - extraction du message d'erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur de connexion";
      
      dispatch(loginFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour inscrire un nouvel utilisateur
 * 
 * @param {Object} userData - Données d'inscription
 * @param {string} userData.nom - Nom de l'utilisateur
 * @param {string} userData.prenom - Prénom de l'utilisateur
 * @param {string} userData.email - Email de l'utilisateur
 * @param {string} userData.mot_de_passe - Mot de passe
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(register({
 *   nom: 'Dupont',
 *   prenom: 'Jean',
 *   email: 'jean@example.com',
 *   mot_de_passe: 'motdepasse123'
 * }))
 */
export const register = (userData) => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(registerRequest());

      // Appel API
      const { data } = await API.post("/api/users/register", userData);

      // Stockage du token dans AsyncStorage
      await AsyncStorage.setItem("token", data.token);

      // Succès
      dispatch(registerSuccess(data));
    } catch (error) {
      // Erreur
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur d'inscription";
      
      dispatch(registerFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour récupérer l'utilisateur actuellement connecté
 * Utilisé pour vérifier et restaurer la session au démarrage de l'app
 * 
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(getCurrentUser())
 */
export const getCurrentUser = () => {
  return async (dispatch) => {
    try {
      // Début de la requête
      dispatch(getCurrentUserRequest());

      // Vérifier d'abord si un token existe
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        // Pas de token, pas d'utilisateur
        dispatch(getCurrentUserFail("Pas de session active"));
        return;
      }

      // Appel API pour récupérer l'utilisateur
      const { data } = await API.get("/api/users/current");

      // Succès - on merge les données avec le token
      dispatch(getCurrentUserSuccess({
        user: data.user || data,
        token,
      }));
    } catch (error) {
      // Erreur -清除 le token car il est invalide
      await AsyncStorage.removeItem("token");
      
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur de récupération de l'utilisateur";
      
      dispatch(getCurrentUserFail(errorMessage));
    }
  };
};

/**
 * Thunk action pour déconnecter l'utilisateur
 * Nettoie le token et réinitialise l'état Redux
 * 
 * @returns {Function} Fonction dispatch asynchrone
 * 
 * @example
 * dispatch(logout())
 */
export const logout = () => {
  return async (dispatch) => {
    try {
      // Suppression du token d'AsyncStorage
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.warn("Erreur lors de la suppression du token:", error);
    }
    
    // Dispatch de l'action de déconnexion
    dispatch(logoutAction());
  };
};

/**
 * Thunk action pour清除 les erreurs d'authentification
 * Utile après l'affichage d'une erreur à l'utilisateur
 * 
 * @returns {Function} Fonction dispatch synchrone
 * 
 * @example
 * dispatch(clearError())
 */
export const clearError = () => {
  return (dispatch) => {
    dispatch(clearAuthError());
  };
};

