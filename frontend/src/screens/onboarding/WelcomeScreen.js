import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  Dimensions 
} from 'react-native';
import { Colors } from '../../screens/constant/colors';
import OnboardingButton from '../../components/onboarding/OnboardingButton';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ onNext }) => {
  return (
    <View style={styles.container}>
      {/* Cercle décoratif vert */}
      <View style={styles.circleBackground} />
      
      {/* Illustration centrale */}
      <View style={styles.imageContainer}>
        <View style={styles.illustration}>
          {/* Remplace par ton image ou utilise une illustration */}
          <View style={styles.walletIcon}>
            <Text style={styles.walletEmoji}>👛</Text>
          </View>
          <View style={styles.coinsContainer}>
            <View style={[styles.coin, styles.coin1]}><Text>💰</Text></View>
            <View style={[styles.coin, styles.coin2]}><Text>💵</Text></View>
            <View style={[styles.coin, styles.coin3]}><Text>🪙</Text></View>
          </View>
        </View>
      </View>

      {/* Contenu textuel */}
      <View style={styles.content}>
        <Text style={styles.tagline}>WisePocket</Text>
        <Text style={styles.title}>
          Votre compagnon financier au quotidien
        </Text>
        <Text style={styles.description}>
          Épargnez intelligemment, gérez votre budget et atteignez vos objectifs financiers en toute simplicité.
        </Text>
      </View>

      {/* Bouton */}
      <View style={styles.footer}>
        <OnboardingButton 
          title="Commencer" 
          onPress={onNext}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  circleBackground: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: Colors.primaryLight,
    top: -width * 0.8,
    left: -width * 0.25,
    opacity: 0.5,
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  walletIcon: {
    width: 120,
    height: 120,
    backgroundColor: Colors.white,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  walletEmoji: {
    fontSize: 60,
  },
  coinsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  coin: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: Colors.white,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  coin1: {
    top: 20,
    right: 40,
    transform: [{ rotate: '15deg' }],
  },
  coin2: {
    bottom: 60,
    left: 30,
    transform: [{ rotate: '-10deg' }],
  },
  coin3: {
    bottom: 30,
    right: 60,
    transform: [{ rotate: '20deg' }],
  },
  content: {
    flex: 0.8,
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.black,
    lineHeight: 40,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.gray600,
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 40,
  },
});

export default WelcomeScreen;