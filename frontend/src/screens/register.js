import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, Dimensions, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../actions/authActions";

const { height } = Dimensions.get("window");

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const Register = ({ navigation }) => {
  const [nom,          setNom]        = useState("");
  const [prenom,       setPrenom]     = useState("");
  const [email,        setEmail]      = useState("");
  const [phone,        setPhone]      = useState("");
  const [mot_de_passe, setMotDePasse] = useState("");
  const [confirmer,    setConfirmer]  = useState("");
  const [showPwd,      setShowPwd]    = useState(false);
  const [showConfirm,  setShowConfirm]= useState(false);
  const [localError,   setLocalError] = useState("");

  const prenomRef  = useRef(null);
  const emailRef   = useRef(null);
  const phoneRef   = useRef(null);
  const pwdRef     = useRef(null);
  const confirmRef = useRef(null);

  const dispatch = useDispatch();

  // ✅ CORRIGÉ : isLoading (et non "loading") — correspond au reducer
  const { isLoading, error, token } = useSelector((state) => state.auth);

  // Succès → navigation vers Home
  useEffect(() => {
    if (token) {
      Alert.alert("Compte créé ✅", "Inscription réussie !", [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({ index: 0, routes: [{ name: "Home" }] }),
        },
      ]);
    }
  }, [token]);

  const handleRegister = () => {
    setLocalError("");
    dispatch(clearError());

    if (!nom.trim() || !prenom.trim() || !email.trim() || !mot_de_passe || !confirmer) {
      setLocalError("Tous les champs * sont obligatoires.");
      return;
    }
    if (mot_de_passe !== confirmer) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!passwordRegex.test(mot_de_passe)) {
      setLocalError("Le mot de passe doit contenir min. 8 caractères, 1 majuscule, 1 chiffre et 1 symbole.");
      return;
    }

    dispatch(register({
      nom:              nom.trim(),
      prenom:           prenom.trim(),
      email:            email.trim().toLowerCase(),
      mot_de_passe,
      numero_telephone: phone.trim(),
    }));
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D7377" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <LinearGradient colors={["#0D7377", "#14919B"]} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.logoWrap}>
              <Ionicons name="wallet" size={32} color="#14FFEC" />
            </View>
            <Text style={styles.brand}>WisePocket</Text>
            <Text style={styles.tagline}>Créer votre compte</Text>
          </LinearGradient>

          {/* FORMULAIRE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations personnelles</Text>

            {/* Nom & Prénom */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Nom *</Text>
                <View style={styles.inputRow}>
                  <MaterialIcons name="person" size={20} color="#9CA3AF" style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Dupont"
                    placeholderTextColor="#9CA3AF"
                    value={nom}
                    onChangeText={setNom}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => prenomRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Prénom *</Text>
                <View style={styles.inputRow}>
                  <MaterialIcons name="person-outline" size={20} color="#9CA3AF" style={styles.icon} />
                  <TextInput
                    ref={prenomRef}
                    style={styles.input}
                    placeholder="Jean"
                    placeholderTextColor="#9CA3AF"
                    value={prenom}
                    onChangeText={setPrenom}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Téléphone */}
            <Text style={styles.label}>Téléphone (optionnel)</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="phone" size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="6XX XXX XXX"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => pwdRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Mot de passe */}
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                ref={pwdRef}
                style={styles.input}
                placeholder="Min. 8 car., 1 maj, 1 chiffre, 1 symbole"
                placeholderTextColor="#9CA3AF"
                value={mot_de_passe}
                onChangeText={setMotDePasse}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
              />
              <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                <Ionicons name={showPwd ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Confirmer */}
            <Text style={styles.label}>Confirmer le mot de passe *</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock-outline" size={20} color="#9CA3AF" style={styles.icon} />
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={confirmer}
                onChangeText={setConfirmer}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Erreur */}
            {displayError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Bouton — ✅ CORRIGÉ : isLoading */}
            <TouchableOpacity
              style={[styles.btn, isLoading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#0D7377", "#14919B"]}
                style={styles.btnGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading
                  ? <ActivityIndicator color="#FFF" />
                  : (
                    <>
                      <Ionicons name="person-add" size={20} color="#FFF" />
                      <Text style={styles.btnText}>S'INSCRIRE</Text>
                    </>
                  )
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FFFE" },

  header: {
    height: height * 0.26,
    justifyContent: "center", alignItems: "center",
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  backBtn: {
    position: "absolute", top: 16, left: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  logoWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(20,255,236,0.45)", marginBottom: 10,
  },
  brand:   { fontSize: 24, fontWeight: "800", color: "#FFF" },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 },

  card: {
    backgroundColor: "#FFF", borderRadius: 24,
    margin: 20, padding: 22,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 18 },

  row:   { flexDirection: "row", gap: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },

  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F9FAFB", borderRadius: 12,
    paddingHorizontal: 12, height: 50, marginBottom: 14,
    borderWidth: 1.5, borderColor: "#E5E7EB",
  },
  icon:  { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: "#111827", height: "100%", paddingVertical: 0 },

  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderRadius: 10,
    padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 13, color: "#EF4444" },

  btn: {
    borderRadius: 14, overflow: "hidden", marginTop: 4,
    shadowColor: "#0D7377", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  btnGrad: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", height: 54, gap: 10,
  },
  btnText: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: 0.8 },

  loginRow: {
    flexDirection: "row", justifyContent: "center",
    marginTop: 18, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: "#F3F4F6",
  },
  loginText: { fontSize: 14, color: "#6B7280" },
  loginLink: { fontSize: 14, fontWeight: "700", color: "#0D7377" },
});

export default Register;