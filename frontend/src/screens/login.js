import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, Dimensions, Alert, Keyboard, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../actions/authActions";

const { height } = Dimensions.get("window");

const LoginScreen = () => {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);
  const navigation  = useNavigation();
  const dispatch    = useDispatch();

  const { loading, error, token } = useSelector((state) => state.auth);

  // ── Quand le token arrive → succès → Home ──────────────────
  useEffect(() => {
    if (token) {
      Alert.alert("Connexion réussie ✅", "Heureux de vous revoir !", [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({ index: 0, routes: [{ name: "Home" }] }),
        },
      ]);
    }
  }, [token]);

  const handleLogin = () => {
    Keyboard.dismiss();
    if (!email.trim() || !password) {
      Alert.alert("Champs requis", "Veuillez remplir l'email et le mot de passe.");
      return;
    }
    dispatch(login(email.trim(), password));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D7377" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* HEADER */}
          <LinearGradient colors={["#0D7377", "#14919B"]} style={styles.header} start={{ x:0, y:0 }} end={{ x:1, y:1 }}>
            <View style={styles.logoWrap}>
              <Ionicons name="wallet" size={36} color="#14FFEC" />
            </View>
            <Text style={styles.brand}>WisePocket</Text>
            <Text style={styles.tagline}>Votre compagnon financier</Text>
          </LinearGradient>

          {/* FORMULAIRE */}
          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>Bienvenue 👋</Text>
            <Text style={styles.welcomeSub}>Connectez-vous pour gérer votre épargne</Text>

            {/* Erreur Redux */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="votre@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={() => setEmail("")} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Mot de passe */}
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top:10, bottom:10, left:10, right:10 }}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Bouton */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={["#0D7377", "#14919B"]} style={styles.loginGradient} start={{ x:0, y:0 }} end={{ x:1, y:0 }}>
                {loading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <><Ionicons name="log-in" size={20} color="#FFF" /><Text style={styles.loginBtnText}>SE CONNECTER</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>ou</Text>
              <View style={styles.sepLine} />
            </View>

            {/* Sociaux */}
            <View style={styles.socialRow}>
              {[
                { icon: "logo-google",   color: "#DB4437" },
                { icon: "logo-apple",    color: "#111827" },
                { icon: "logo-facebook", color: "#4267B2" },
              ].map(({ icon, color }) => (
                <TouchableOpacity key={icon} style={styles.socialBtn} activeOpacity={0.7}>
                  <Ionicons name={icon} size={22} color={color} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Lien inscription */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")} activeOpacity={0.7}>
                <Text style={styles.registerLink}>Créer un compte</Text>
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
  safe:   { flex: 1, backgroundColor: "#0D7377" },
  flex:   { flex: 1, backgroundColor: "#F8FFFE" },
  scroll: { flexGrow: 1, backgroundColor: "#F8FFFE" },

  header: {
    height: height * 0.28,
    justifyContent: "center", alignItems: "center",
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  logoWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(20,255,236,0.5)", marginBottom: 14,
  },
  brand:   { fontSize: 28, fontWeight: "800", color: "#FFF", letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 5 },

  card: {
    marginHorizontal: 20, marginTop: -24,
    backgroundColor: "#FFF", borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
  },
  welcomeTitle: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center", marginBottom: 4 },
  welcomeSub:   { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 24 },

  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", borderRadius: 10,
    padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: "#FECACA",
  },
  errorText: { flex: 1, fontSize: 13, color: "#EF4444", fontWeight: "500" },

  label:    { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8, marginLeft: 2 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F9FAFB", borderRadius: 14,
    paddingHorizontal: 14, height: 52, marginBottom: 16,
    borderWidth: 1.5, borderColor: "#E5E7EB",
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, color: "#111827", height: "100%", paddingVertical: 0 },

  forgotRow:  { alignSelf: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, color: "#0D7377", fontWeight: "600" },

  loginBtn: {
    borderRadius: 14, overflow: "hidden",
    shadowColor: "#0D7377", shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6, marginBottom: 22,
  },
  loginGradient: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", height: 52, gap: 10,
  },
  loginBtnText: { fontSize: 16, fontWeight: "800", color: "#FFF", letterSpacing: 0.8 },

  separator: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  sepLine:   { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  sepText:   { paddingHorizontal: 14, fontSize: 13, color: "#9CA3AF", fontWeight: "500" },

  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 22 },
  socialBtn: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: "#F9FAFB", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E5E7EB",
  },

  registerRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    paddingTop: 16, borderTopWidth: 1, borderTopColor: "#F3F4F6",
  },
  registerText: { fontSize: 14, color: "#6B7280" },
  registerLink: { fontSize: 14, fontWeight: "700", color: "#0D7377" },
});

export default LoginScreen;