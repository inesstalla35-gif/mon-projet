import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import API from "../services/api";

const { width, height } = Dimensions.get("window");

const Register = ({ navigation }) => {
  // States conservés
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mot_de_passe, setMotDePasse] = useState("");
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  // Refs conservés
  const prenomRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Logique métier conservée exactement
  const handleRegister = async () => {
    setMessage("");

    if (!nom || !prenom || !email || !mot_de_passe || !confirmerMotDePasse) {
      setMessage("Tous les champs sont obligatoires");
      return;
    }

    if (mot_de_passe !== confirmerMotDePasse) {
      setMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (mot_de_passe.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nom,
        prenom,
        numero_telephone: phone,
        email,
        mot_de_passe,
      };

      const response = await API.post("/api/users/register", payload);
      await AsyncStorage.setItem("token", response.data.token);

      Alert.alert("Succès", response.data.message || "Inscription réussie !", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Welcome", {
              userId: response.data._id,
              token: response.data.token,
              nom: response.data.nom,
              prenom: response.data.prenom,
            });
          },
        },
      ]);
    } catch (error) {
      console.log(error.response?.data);
      setMessage(
        error.response?.data?.message || "Erreur lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Composant Input optimisé et stable
  const WiseInput = ({
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    secureTextEntry = false,
    showToggle = false,
    toggleValue = false,
    onToggle = null,
    inputRef = null,
    nextRef = null,
    fieldName,
    returnKeyType = "next",
    onSubmitEditing = null,
  }) => (
    <View style={styles.inputWrapper}>
      <View
        style={[
          styles.inputContainer,
          focusedField === fieldName && styles.inputContainerFocused,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={22}
          color={focusedField === fieldName ? "#0D7377" : "#999"}
          style={styles.inputIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.inputText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={fieldName === "email" ? "none" : "words"}
          returnKeyType={returnKeyType}
          onFocus={() => setFocusedField(fieldName)}
          onBlur={() => setFocusedField(null)}
          onSubmitEditing={
            onSubmitEditing || (nextRef ? () => nextRef.current?.focus() : Keyboard.dismiss)
          }
          blurOnSubmit={false}
          // Empêche le texte de se couper
          allowFontScaling={false}
          textAlignVertical="center"
        />
        {value.length > 0 && !showToggle && (
          <TouchableOpacity 
            onPress={() => onChangeText("")} 
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
        {showToggle && (
          <TouchableOpacity 
            onPress={onToggle}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={toggleValue ? "eye-off" : "eye"}
              size={22}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header fixe sans animation problématique */}
        <LinearGradient
          colors={["#0D7377", "#14919B", "#1a5f5f"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoCircle}>
              <Ionicons name="wallet" size={32} color="#14FFEC" />
            </View>
            <Text style={styles.brandName}>WisePocket</Text>
            <Text style={styles.tagline}>Créer votre compte d'épargne</Text>
          </View>
        </LinearGradient>

        {/* Formulaire avec gestion clavier optimisée */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View style={styles.formCard}>
                {/* Ligne Nom & Prénom */}
                <View style={styles.row}>
                  <View style={styles.col}>
                    <WiseInput
                      icon="person"
                      value={nom}
                      onChangeText={setNom}
                      placeholder="Nom"
                      fieldName="nom"
                      nextRef={prenomRef}
                    />
                  </View>
                  <View style={styles.col}>
                    <WiseInput
                      icon="person-outline"
                      value={prenom}
                      onChangeText={setPrenom}
                      placeholder="Prénom"
                      inputRef={prenomRef}
                      fieldName="prenom"
                      nextRef={emailRef}
                    />
                  </View>
                </View>

                {/* Email */}
                <WiseInput
                  icon="email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Adresse email"
                  keyboardType="email-address"
                  inputRef={emailRef}
                  fieldName="email"
                  nextRef={phoneRef}
                />

                {/* Téléphone */}
                <WiseInput
                  icon="phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Téléphone Mobile"
                  keyboardType="phone-pad"
                  inputRef={phoneRef}
                  fieldName="phone"
                  nextRef={passwordRef}
                />
                <Text style={styles.helperText}>Format: 6XX XXX XXX</Text>

                {/* Mot de passe */}
                <WiseInput
                  icon="lock"
                  value={mot_de_passe}
                  onChangeText={setMotDePasse}
                  placeholder="Mot de passe"
                  secureTextEntry={!showPassword}
                  showToggle={true}
                  toggleValue={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  inputRef={passwordRef}
                  fieldName="password"
                  nextRef={confirmPasswordRef}
                />

                {/* Confirmation */}
                <WiseInput
                  icon="lock-outline"
                  value={confirmerMotDePasse}
                  onChangeText={setConfirmerMotDePasse}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry={!showConfirmPassword}
                  showToggle={true}
                  toggleValue={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  inputRef={confirmPasswordRef}
                  fieldName="confirmPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />

                {/* Message d'erreur */}
                {message ? (
                  <View
                    style={[
                      styles.messageBox,
                      message.includes("réussi")
                        ? styles.successBox
                        : styles.errorBox,
                    ]}
                  >
                    <Ionicons
                      name={message.includes("réussi") ? "checkmark-circle" : "alert-circle"}
                      size={20}
                      color={message.includes("réussi") ? "#0D7377" : "#E74C3C"}
                    />
                    <Text
                      style={[
                        styles.messageText,
                        message.includes("réussi") ? styles.successText : styles.errorText,
                      ]}
                      numberOfLines={2}
                    >
                      {message}
                    </Text>
                  </View>
                ) : null}

                {/* Bouton stable sans mouvement */}
                <TouchableOpacity
                  style={[styles.registerButton, isLoading && styles.disabledButton]}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isLoading ? ["#7fb3b3", "#7fb3b3"] : ["#0D7377", "#14FFEC"]}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContent}>
                        <ActivityIndicator color="#FFF" size="small" />
                        <Text style={styles.loadingText}>Inscription en cours...</Text>
                      </View>
                    ) : (
                      <Text style={styles.buttonText}>S'INSCRIRE</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Lien Login stable */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Déjà un compte? </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate("Login")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.linkText}>Se connecter</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Espace bas pour scroll */}
              <View style={{ height: 30 }} />
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerGradient: {
    height: height * 0.28,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 1,
  },
  headerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#14FFEC",
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52, // Hauteur fixe suffisante
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  inputContainerFocused: {
    borderColor: "#0D7377",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 10,
    width: 24,
    alignItems: "center",
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    height: "100%",
    paddingVertical: 0, // Important pour Android
    textAlignVertical: "center", // Centrage vertical
    includeFontPadding: false, // Évite les coupures de texte sur Android
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#0D7377",
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
    fontStyle: "italic",
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successBox: {
    backgroundColor: "rgba(13, 115, 119, 0.1)",
  },
  errorBox: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  successText: {
    color: "#0D7377",
    fontWeight: "500",
  },
  errorText: {
    color: "#E74C3C",
    fontWeight: "500",
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0D7377",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
  },
  footerText: {
    color: "#666",
    fontSize: 15,
  },
  linkText: {
    color: "#0D7377",
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default Register;