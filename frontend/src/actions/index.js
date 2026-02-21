/**
 * @file index.js
 * @description Point d'export centralisé pour toutes les actions Redux.
 * 
 * Ce fichier rassemble et exporte toutes les actions des différents
 * modules de l'application pour faciliter les imports.
 * 
 * Utilisation:
 * - Import complet: import * as Actions from '../actions';
 * - Import spécifique: import { login } from '../actions';
 * 
 * @module actions
 */

// Export des actions d'authentification
export * from './authActions';

// Export des actions de revenus
export * from './incomeActions';

// Export des actions d'objectifs
export * from './objectiveActions';

// Export des actions de profil
export * from './profileActions';

