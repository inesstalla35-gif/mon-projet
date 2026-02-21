/**
 * @file incomeTypes.js
 * @description Définit les constantes de types d'actions pour la gestion des revenus.
 * 
 * Ce fichier centralise tous les types d'actions liées aux revenus:
 * - Récupération de la liste des revenus
 * - Ajout d'un nouveau revenu
 * - Suppression d'un revenu (optionnel)
 * 
 * @example
 * import { GET_INCOMES_REQUEST } from '../types/incomeTypes';
 * dispatch({ type: GET_INCOMES_REQUEST });
 */

// ==================== GET INCOMES TYPES ====================

/**
 * Action déclenchée au début de la récupération des revenus
 * Signale que la requête est en cours
 */
export const GET_INCOMES_REQUEST = "income/GET_INCOMES_REQUEST";

/**
 * Action déclenchée lors de la récupération réussie des revenus
 * Contient le tableau des revenus
 */
export const GET_INCOMES_SUCCESS = "income/GET_INCOMES_SUCCESS";

/**
 * Action déclenchée en cas d'échec de récupération des revenus
 * Contient le message d'erreur
 */
export const GET_INCOMES_FAIL = "income/GET_INCOMES_FAIL";

// ==================== ADD INCOME TYPES ====================

/**
 * Action déclenchée au début de l'ajout d'un revenu
 * Signale que la requête est en cours
 */
export const ADD_INCOME_REQUEST = "income/ADD_INCOME_REQUEST";

/**
 * Action déclenchée lors de l'ajout réussi d'un revenu
 * Contient le nouveau revenu créé
 */
export const ADD_INCOME_SUCCESS = "income/ADD_INCOME_SUCCESS";

/**
 * Action déclenchée en cas d'échec de l'ajout d'un revenu
 * Contient le message d'erreur
 */
export const ADD_INCOME_FAIL = "income/ADD_INCOME_FAIL";

// ==================== DELETE INCOME TYPES (Optionnel) ====================

/**
 * Action déclenchée au début de la suppression d'un revenu
 */
export const DELETE_INCOME_REQUEST = "income/DELETE_INCOME_REQUEST";

/**
 * Action déclenchée lors de la suppression réussie d'un revenu
 * Contient l'ID du revenu supprimé
 */
export const DELETE_INCOME_SUCCESS = "income/DELETE_INCOME_SUCCESS";

/**
 * Action déclenchée en cas d'échec de la suppression d'un revenu
 */
export const DELETE_INCOME_FAIL = "income/DELETE_INCOME_FAIL";

// ==================== CLEAR INCOME ERROR TYPE ====================

/**
 * Action pour清除 les erreurs liées aux revenus
 */
export const CLEAR_INCOME_ERROR = "income/CLEAR_ERROR";

// ==================== RESET INCOME STATE TYPE ====================

/**
 * Action pour réinitialiser complètement l'état des revenus
 * Utile lors de la déconnexion
 */
export const RESET_INCOME_STATE = "income/RESET_STATE";

