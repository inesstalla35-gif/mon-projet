import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../actions/authActions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { height } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const dispatch = useDispatch();
  const { loading, error, token } = useSelector((state) => state.auth || {});
  const navigation = useNavigation();

  useEffect(() => {
    if (token) {
      Alert.alert("Succès", "Heureux de vous revoir !", [
        {
          text: "OK",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          },
        },
      ]);
    }
  }, [token, navigation]);

  const handleLogin = () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    dispatch(login(email, password));
  };

  const WiseInput = ({ 
    icon, 
    value, 
    onChangeText, 
    placeholder, 
    secureTextEntry = false,
    showToggle = false,
    toggleValue = false,
    onToggle = null,
    isFocused,
    setIsFocused,
    keyboardType = "default",
    onSubmitEditing = null,
    returnKeyType = "next",
    blurOnSubmit = false,
    inputRef = null,
  }) => (
    <View style={[
      styles.inputContainer,
      isFocused && styles.inputContainerFocused
    ]}>
      <MaterialIcons 
        name={icon} 
        size={22} 
        color={isFocused ? '#0D7377' : '#999'} 
        style={styles.inputIcon}
      />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        underlineColorAndroid="transparent"
        selectionColor="#0D7377"
        // Désactive toutes les suggestions et autocorrections
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        textContentType="none"
        importantForAutofill="no"
        autoFill="off"
      />
      {value && value.length > 0 && !showToggle && (
        <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.eyeButton}>
          <Ionicons name={toggleValue ? "eye-off" : "eye"} size={22} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardOpeningTime={0}
          extraScrollHeight={Platform.OS === 'ios' ? 120 : 140}
          extraHeight={Platform.OS === 'ios' ? 120 : 140}
          viewIsInsideTabBar={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={["#0D7377", "#14919B"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="wallet" size={32} color="#14FFEC" />
            </View>
            <Text style={styles.brandName}>WisePocket</Text>
            <Text style={styles.tagline}>Connexion sécurisée</Text>
          </LinearGradient>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.welcomeText}>Bienvenue</Text>
              <Text style={styles.subtitle}>Connectez-vous pour gérer votre épargne</Text>

              <WiseInput
                icon="email"
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                isFocused={emailFocused}
                setIsFocused={setEmailFocused}
                keyboardType="email-address"
                inputRef={emailInputRef}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <WiseInput
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="Mot de passe"
                secureTextEntry={!showPassword}
                showToggle={true}
                toggleValue={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                isFocused={passwordFocused}
                setIsFocused={setPasswordFocused}
                inputRef={passwordInputRef}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#0D7377", "#14FFEC"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "CONNEXION..." : "SE CONNECTER"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.separator}>
                <View style={styles.line} />
                <Text style={styles.orText}>Ou avec</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-apple" size={24} color="#000" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                </TouchableOpacity>
              </View>

              <View style={styles.registerContainer}>
                <Text style={styles.noAccountText}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")} activeOpacity={0.7}>
                  <Text style={styles.registerLink}>Créer un compte</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    height: height * 0.28,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    marginBottom: 10,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
  },
  inputContainerFocused: {
    borderColor: "#0D7377",
    backgroundColor: "#FFF",
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 0,
  },
  clearButton: {
    padding: 4,
  },
  eyeButton: {
    padding: 4,
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#0D7377",
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#0D7377",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gradientButton: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  orText: {
    color: "#999",
    paddingHorizontal: 15,
    fontSize: 13,
    fontWeight: "500",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 25,
  },
  socialButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  noAccountText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#0D7377",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default LoginScreen;