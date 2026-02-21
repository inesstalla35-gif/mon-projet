/**
 * @file index.js
 * @description Middlewares Redux personnalisés .
 * 
 * Ce fichier peut contenir des middlewares personnalisés pour:
 * - Logging des actions
 * - Gestion centralisée des erreurs
 * - Analytics
 * - etc.
 * 
 * Pour une application simple, ces middlewares sont optionnels.
 * Le middleware thunk est déjà appliqué dans store.js.
 */

// ==================== LOGGER MIDDLEWARE ====================

/**
 * Middleware de logging pour le développement
 * Affiche chaque action et le nouvel état dans la console
 * 
 * @param {Store} store - Instance du store
 * @returns {Function} Middleware
 * 
 * @example
 * // Dans store.js
 * import { createLogger } from './middlewares';
 * const store = createStore(rootReducer, applyMiddleware(thunk, createLogger));
 */
export const createLogger = (store) => (next) => (action) => {
  console.log("🔄 Action:", action.type);
  console.log("📦 Payload:", action.payload);
  console.log("📊 État précédent:", store.getState());
  
  const result = next(action);
  
  console.log("✅ Nouvel état:", store.getState());
  return result;
};

// ==================== ERROR MIDDLEWARE ====================

/**
 * Middleware pour la gestion centralisée des erreurs
 * Capture les erreurs des actions thunk et les log
 * 
 * @param {Store} store - Instance du store
 * @returns {Function} Middleware
 */
export const errorMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error("❌ Erreur Redux:", error);
    return error;
  }
};

// ==================== ANALYTICS MIDDLEWARE ====================

/**
 * Middleware pour l'analytics
 * Envoie les actions à un service d'analytics
 * 
 * @param {Store} store - Instance du store
 * @returns {Function} Middleware
 */
export const analyticsMiddleware = (store) => (next) => (action) => {
  // Ne pas tracker les actions internes ou de loading
  const skipTracking = action.type.includes('REQUEST') || 
                       action.type.includes('FAIL') ||
                       action.type.includes('CLEAR');
  
  if (!skipTracking) {
    // Log pour démonstration - remplacer par votre service d'analytics
    console.log("📈 Analytics:", action.type);
    // Exemple: mixpanel.track(action.type, action.payload);
  }
  
  return next(action);
};

// NOTE: Le persistenceMiddleware a été temporairement désactivé car il peut
// causer des erreurs lors du rechargement de l'application.
// Si vous avez besoin de persister l'état, utilisez plutôt redux-persist:
// npm install redux-persist

