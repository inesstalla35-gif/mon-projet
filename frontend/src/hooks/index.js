/**
 * @file hooks.js
 * @description Hooks Redux personnalisés pour simplifier l'utilisation de Redux.
 * 
 * Ces hooks fournissent une interface simple et type-safe pour:
 * - Accéder à l'état global
 * - Dispatcher des actions
 * - Selectors communs
 * 
 * Utilise les hooks natifs de React-Redux (useSelector, useDispatch)
 * 
 * @requires react-redux - Hooks useSelector, useDispatch
 */

import { useSelector, useDispatch } from "react-redux";

// Import des actions thunk
import { login, register, logout, getCurrentUser, clearError as clearAuthError } from "../actions/authActions";
import { getIncomes, addIncome, deleteIncome, clearError as clearIncomeError } from "../actions/incomeActions";
import { getObjectives, createObjective, updateObjective, deleteObjective, clearError as clearObjectiveError } from "../actions/objectiveActions";
import { getProfile, updateProfile, createProfile, clearError as clearProfileError } from "../actions/profileActions";

// ==================== AUTH HOOKS ====================

/**
 * Hook pour accéder aux données d'authentification
 * 
 * @returns {Object} { user, token, isLoading, error, isAuthenticated }
 * 
 * @example
 * const { user, isAuthenticated } = useAuth();
 * if (isAuthenticated) {
 *   console.log(`Bienvenue ${user.nom}`);
 * }
 */
export const useAuth = () => {
  const { user, token, isLoading, error } = useSelector((state) => state.auth);
  
  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
  };
};

/**
 * Hook pour dispatcher des actions d'authentification
 * 
 * @returns {Object} { login, register, logout, getCurrentUser, clearError }
 * 
 * @example
 * const { login } = useAuthDispatch();
 * login('email@example.com', 'motdepasse');
 */
export const useAuthDispatch = () => {
  const dispatch = useDispatch();
  
  return {
    login: (email, mot_de_passe) => dispatch(login(email, mot_de_passe)),
    register: (userData) => dispatch(register(userData)),
    logout: () => dispatch(logout()),
    getCurrentUser: () => dispatch(getCurrentUser()),
    clearError: () => dispatch(clearAuthError()),
  };
};

// ==================== INCOME HOOKS ====================

/**
 * Hook pour accéder aux données des revenus
 * 
 * @returns {Object} { incomes, isLoading, error, totalIncome }
 * 
 * @example
 * const { incomes, totalIncome } = useIncomes();
 * console.log(`Total des revenus: ${totalIncome}€`);
 */
export const useIncomes = () => {
  const { incomes, isLoading, error } = useSelector((state) => state.income);
  
  const totalIncome = incomes.reduce(
    (sum, income) => sum + (income.montant || 0),
    0
  );
  
  return {
    incomes,
    isLoading,
    error,
    totalIncome,
  };
};

/**
 * Hook pour dispatcher des actions sur les revenus
 * 
 * @returns {Object} { getIncomes, addIncome, deleteIncome, clearError }
 * 
 * @example
 * const { addIncome } = useIncomesDispatch();
 * addIncome({ montant: 1000, source: 'Salaire' });
 */
export const useIncomesDispatch = () => {
  const dispatch = useDispatch();
  
  return {
    getIncomes: () => dispatch(getIncomes()),
    addIncome: (data) => dispatch(addIncome(data)),
    deleteIncome: (id) => dispatch(deleteIncome(id)),
    clearError: () => dispatch(clearIncomeError()),
  };
};

// ==================== OBJECTIVE HOOKS ====================

/**
 * Hook pour accéder aux données des objectifs
 * 
 * @returns {Object} { objectives, isLoading, error, totalSaved, totalTarget }
 * 
 * @example
 * const { objectives, totalSaved } = useObjectives();
 * console.log(`Total économisé: ${totalSaved}€`);
 */
export const useObjectives = () => {
  const { objectives, isLoading, error } = useSelector((state) => state.objective);
  
  const totalSaved = objectives.reduce(
    (sum, obj) => sum + (obj.montant_actuel || 0),
    0
  );
  
  const totalTarget = objectives.reduce(
    (sum, obj) => sum + (obj.montant_cible || 0),
    0
  );
  
  return {
    objectives,
    isLoading,
    error,
    totalSaved,
    totalTarget,
  };
};

/**
 * Hook pour dispatcher des actions sur les objectifs
 * 
 * @returns {Object} { getObjectives, createObjective, updateObjective, deleteObjective, clearError }
 * 
 * @example
 * const { createObjective } = useObjectivesDispatch();
 * createObjective({ nom: 'Vacances', montant_cible: 3000 });
 */
export const useObjectivesDispatch = () => {
  const dispatch = useDispatch();
  
  return {
    getObjectives: () => dispatch(getObjectives()),
    createObjective: (data) => dispatch(createObjective(data)),
    updateObjective: (id, data) => dispatch(updateObjective(id, data)),
    deleteObjective: (id) => dispatch(deleteObjective(id)),
    clearError: () => dispatch(clearObjectiveError()),
  };
};

// ==================== PROFILE HOOKS ====================

/**
 * Hook pour accéder aux données du profil
 * 
 * @returns {Object} { profile, isLoading, error, hasProfile }
 * 
 * @example
 * const { profile, hasProfile } = useProfile();
 * if (hasProfile) {
 *   console.log(`Profil de ${profile.nom}`);
 * }
 */
export const useProfile = () => {
  const { profile, isLoading, error } = useSelector((state) => state.profile);
  
  return {
    profile,
    isLoading,
    error,
    hasProfile: !!profile,
  };
};

/**
 * Hook pour dispatcher des actions sur le profil
 * 
 * @returns {Object} { getProfile, updateProfile, createProfile, clearError }
 * 
 * @example
 * const { updateProfile } = useProfileDispatch();
 * updateProfile({ nom: 'Nouveau Nom' });
 */
export const useProfileDispatch = () => {
  const dispatch = useDispatch();
  
  return {
    getProfile: () => dispatch(getProfile()),
    updateProfile: (data) => dispatch(updateProfile(data)),
    createProfile: (data) => dispatch(createProfile(data)),
    clearError: () => dispatch(clearProfileError()),
  };
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook générique pour accéder à une partie de l'état
 * 
 * @param {string} slice - Nom de la partie de l'état (auth, income, etc.)
 * @returns {Object} La partie de l'état demandée
 * 
 * @example
 * const authState = useSelectorSlice('auth');
 */
export const useSelectorSlice = (slice) => {
  return useSelector((state) => state[slice]);
};

/**
 * Hook pour dispatcher n'importe quelle action
 * 
 * @returns {Function} Fonction dispatch
 * 
 * @example
 * const dispatch = useDispatch();
 * dispatch({ type: 'CUSTOM_ACTION', payload: data });
 */
export const useAppDispatch = () => useDispatch();

