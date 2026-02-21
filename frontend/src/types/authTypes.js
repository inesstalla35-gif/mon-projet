/**
 * @file authTypes.js
 * @description Définit les constantes de types d'actions pour l'authentification.
 * 
 * Ce fichier centralise tous les types d'actions liées à l'authentification
 * (connexion, inscription, déconnexion, récupération de l'utilisateur actuel).
 * 
 * Utilisation:
 * - IMPORT_TYPE: Pour importer un type spécifique
 * - case IMPORT_TYPE: dans le reducer
 * 
 * @example
 * import { LOGIN_REQUEST } from '../types/authTypes';
 * dispatch({ type: LOGIN_REQUEST });
 */

// ==================== AUTH TYPES ====================

/**
 * Action déclenchée au début d'une tentative de connexion
 * Signale que la requête est en cours
 */
export const LOGIN_REQUEST = "auth/LOGIN_REQUEST";

/**
 * Action déclenchée lors d'une connexion réussie
 * Contient les données de l'utilisateur et le token
 */
export const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";

/**
 * Action déclenchée en cas d'échec de connexion
 * Contient le message d'erreur
 */
export const LOGIN_FAIL = "auth/LOGIN_FAIL";

// ==================== REGISTER TYPES ====================

/**
 * Action déclenchée au début d'une tentative d'inscription
 * Signale que la requête est en cours
 */
export const REGISTER_REQUEST = "auth/REGISTER_REQUEST";

/**
 * Action déclenchée lors d'une inscription réussie
 * Contient les données de l'utilisateur et le token
 */
export const REGISTER_SUCCESS = "auth/REGISTER_SUCCESS";

/**
 * Action déclenchée en cas d'échec d'inscription
 * Contient le message d'erreur
 */
export const REGISTER_FAIL = "auth/REGISTER_FAIL";

// ==================== USER TYPES ====================

/**
 * Action déclenchée lors de la récupération de l'utilisateur actuel
 * Utilisé pour vérifier et restaurer la session au démarrage
 */
export const GET_CURRENT_USER_REQUEST = "auth/GET_CURRENT_USER_REQUEST";

/**
 * Action déclenchée lors de la récupération réussie de l'utilisateur actuel
 * Contient les données de l'utilisateur
 */
export const GET_CURRENT_USER_SUCCESS = "auth/GET_CURRENT_USER_SUCCESS";

/**
 * Action déclenchée en cas d'échec de récupération de l'utilisateur
 */
export const GET_CURRENT_USER_FAIL = "auth/GET_CURRENT_USER_FAIL";

// ==================== LOGOUT TYPE ====================

/**
 * Action déclenchée lors de la déconnexion de l'utilisateur
 * Réinitialise complètement l'état d'authentification
 */
export const LOGOUT = "auth/LOGOUT";

// ==================== CLEAR ERROR TYPE ====================

/**
 * Action pour清除 les erreurs d'authentification
 * Utile pour nettoyer l'état après l'affichage d'une erreur
 */
export const CLEAR_AUTH_ERROR = "auth/CLEAR_ERROR";

