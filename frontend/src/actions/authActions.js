import API from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const loginRequest        = ()      => ({ type: LOGIN_REQUEST });
const loginSuccess        = (data)  => ({ type: LOGIN_SUCCESS,            payload: data });
const loginFail           = (error) => ({ type: LOGIN_FAIL,               payload: error });
const registerRequest     = ()      => ({ type: REGISTER_REQUEST });
const registerSuccess     = (data)  => ({ type: REGISTER_SUCCESS,         payload: data });
const registerFail        = (error) => ({ type: REGISTER_FAIL,            payload: error });
const getCurrentUserReq   = ()      => ({ type: GET_CURRENT_USER_REQUEST });
const getCurrentUserOk    = (data)  => ({ type: GET_CURRENT_USER_SUCCESS, payload: data });
const getCurrentUserFail  = (error) => ({ type: GET_CURRENT_USER_FAIL,    payload: error });
const logoutAction        = ()      => ({ type: LOGOUT });
const clearAuthError      = ()      => ({ type: CLEAR_AUTH_ERROR });

// ==================== THUNK ACTIONS ====================

/**
 * Connexion — récupère user + token, stocke le token
 */
export const login = (email, mot_de_passe) => async (dispatch) => {
  try {
    dispatch(loginRequest());

    const { data } = await API.post(`${BASE_URL}/api/users/login`, {
      email,
      mot_de_passe,
    });

    console.log("login response::", data);

    await AsyncStorage.setItem("token", data.token);

    // On s'assure que user et token sont bien dans le payload
    dispatch(loginSuccess({
      token: data.token,
      user:  data.user || data,
    }));

  } catch (error) {
    dispatch(loginFail(
      error.response?.data?.message || error.message || "Erreur de connexion"
    ));
  }
};

/**
 * Inscription — enregistre l'utilisateur, récupère ses infos
 * exactement comme le login (token + user complet)
 */
export const register = (userData) => async (dispatch) => {
  try {
    dispatch(registerRequest());

    // 1️⃣ Appel inscription
    const { data } = await API.post(`${BASE_URL}/api/users/register`, userData);

    console.log("register response::", data);

    // 2️⃣ Stockage du token
    await AsyncStorage.setItem("token", data.token);

    // 3️⃣ Récupération des infos complètes de l'utilisateur
    //    (comme getCurrentUser mais ici on a déjà le token frais)
    let user = data.user || null;

    if (!user) {
      // Si le backend ne renvoie pas l'objet user directement,
      // on le récupère via l'endpoint /current
      try {
        const { data: currentData } = await API.get(`${BASE_URL}/api/users/current`);
        user = currentData.user || currentData;
      } catch (e) {
        console.warn("Impossible de récupérer le profil après inscription:", e);
        // On utilise ce que le backend a renvoyé à minima
        user = {
          nom:    userData.nom,
          prenom: userData.prenom,
          email:  userData.email,
        };
      }
    }

    // 4️⃣ Dispatch succès avec token + user (même structure que login)
    dispatch(registerSuccess({
      token: data.token,
      user,
    }));

  } catch (error) {
    dispatch(registerFail(
      error.response?.data?.message || error.message || "Erreur d'inscription"
    ));
  }
};

/**
 * Récupération de l'utilisateur courant (au démarrage de l'app)
 */
export const getCurrentUser = () => async (dispatch) => {
  try {
    dispatch(getCurrentUserReq());

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      dispatch(getCurrentUserFail("Pas de session active"));
      return;
    }

    const { data } = await API.get(`${BASE_URL}/api/users/current`);

    dispatch(getCurrentUserOk({
      token,
      user: data.user || data,
    }));

  } catch (error) {
    await AsyncStorage.removeItem("token");
    dispatch(getCurrentUserFail(
      error.response?.data?.message || error.message || "Session expirée"
    ));
  }
};

/**
 * Déconnexion — supprime le token et réinitialise Redux
 */
export const logout = () => async (dispatch) => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (error) {
    console.warn("Erreur suppression token:", error);
  }
  dispatch(logoutAction());
};

/**
 * Effacer les erreurs d'auth
 */
export const clearError = () => (dispatch) => {
  dispatch(clearAuthError());
};