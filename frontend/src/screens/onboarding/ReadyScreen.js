import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  Dimensions,
  TouchableOpacity // Ajoute ceci
} from 'react-native';
import { Colors } from '../../screens/constant/colors';
import OnboardingButton from '../../components/onboarding/OnboardingButton';

const { width } = Dimensions.get('window');

// Modifie les props pour recevoir navigation
const ReadyScreen = ({ navigation }) => {
  
  // Fonction pour aller à l'inscription
  const goToRegister = () => {
    navigation.navigate('Register');
  };

  // Fonction pour aller à la connexion
  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Background décoratif */}
      <View style={styles.greenBackground} />
      
      {/* Contenu central */}
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        
        <Text style={styles.title}>Vous êtes prêt !</Text>
        <Text style={styles.description}>
          Commencez dès maintenant votre voyage vers une meilleure gestion financière. Votre avenir commence aujourd'hui.
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={styles.benefitText}>Sécurisé & confidentiel</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🇨🇲</Text>
            <Text style={styles.benefitText}>Adapté au Cameroun</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎉</Text>
            <Text style={styles.benefitText}>Gratuit à vie</Text>
          </View>
        </View>
      </View>

      {/* Boutons */}
      <View style={styles.footer}>
        {/* Bouton Créer mon compte */}
        <OnboardingButton 
          title="Créer mon compte" 
          onPress={goToRegister} // Connecté à Register
        />
        
        {/* Bouton Se connecter */}
        <TouchableOpacity onPress={goToLogin} style={styles.loginButton}>
          <Text style={styles.loginText}>
            Déjà un compte ? <Text style={styles.loginLink}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  greenBackground: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: Colors.primary,
    top: -width * 0.6,
    left: -width * 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  checkmark: {
    fontSize: 48,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  benefits: {
    width: '100%',
    backgroundColor: Colors.gray50,
    borderRadius: 20,
    padding: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.gray700,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: Colors.white,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 10, // Zone cliquable plus grande
  },
  loginText: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.gray600,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default ReadyScreen;