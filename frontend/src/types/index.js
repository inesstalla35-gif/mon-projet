/**
 * @file index.js
 * @description Point d'export centralisé pour tous les types d'actions Redux.
 * 
 * Ce fichier rassemble et exporte tous les types d'actions des différents
 * modules de l'application pour faciliter les imports.
 * 
 * Utilisation:
 * - Import complet: import * as Types from '../types';
 * - Import spécifique: import { LOGIN_REQUEST } from '../types';
 * 
 * @module types
 */

// Export des types d'authentification
export * from './authTypes';

// Export des types de revenus
export * from './incomeTypes';

// Export des types d'objectifs
export * from './objectiveTypes';

// Export des types de profil
export * from './profileTypes';

