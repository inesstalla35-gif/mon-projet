import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const benefits = [
  { icon: 'shield-checkmark', label: 'Sécurisé & confidentiel', color: '#0D7377' },
  { icon: 'flag', label: 'Adapté au Cameroun', color: '#F59E0B' },
  { icon: 'gift', label: 'Gratuit à vie', color: '#10B981' },
];

// navigation est passé via OnboardingScreen (le dernier écran reçoit navigation comme prop)
const ReadyScreen = ({ navigation, onBack }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const badgeAnims = benefits.map(() => useRef(new Animated.Value(0)).current);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start(() => {
      // Badges apparaissent après
      Animated.stagger(150,
        badgeAnims.map(anim =>
          Animated.spring(anim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true })
        )
      ).start();

      // Pulsation du cercle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  // Navigation : vers Register (créer compte) ou Login (connexion)
  const goToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    }
  };

  const goToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Fond décoratif */}
      <LinearGradient
        colors={['#0D7377', '#14919B']}
        style={styles.topBlob}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.bottomBlob} />

      {/* Icône succès animée */}
      <Animated.View
        style={[
          styles.successSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.innerRing}>
            <LinearGradient
              colors={['#14FFEC', '#0D7377']}
              style={styles.successCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark" size={52} color="#FFF" />
              </Animated.View>
            </LinearGradient>
          </View>
        </Animated.View>

        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Vous êtes prêt !</Text>
        <Text style={styles.subtitle}>
          Votre avenir financier commence maintenant. Rejoignez des milliers de Camerounais qui gèrent mieux leur argent avec WisePocket.
        </Text>
      </Animated.View>

      {/* Avantages */}
      <Animated.View style={[styles.benefitsCard, { opacity: fadeAnim }]}>
        {benefits.map((b, i) => (
          <Animated.View
            key={i}
            style={[
              styles.benefitRow,
              i < benefits.length - 1 && styles.benefitBorder,
              {
                opacity: badgeAnims[i],
                transform: [
                  { translateX: badgeAnims[i].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                ],
              },
            ]}
          >
            <View style={[styles.benefitIcon, { backgroundColor: b.color + '18' }]}>
              <Ionicons name={b.icon} size={20} color={b.color} />
            </View>
            <Text style={styles.benefitText}>{b.label}</Text>
            <Ionicons name="checkmark-circle" size={20} color={b.color} />
          </Animated.View>
        ))}
      </Animated.View>

      {/* Boutons de navigation */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        {/* CTA principal : Créer mon compte → Register */}
        <TouchableOpacity onPress={goToRegister} activeOpacity={0.85} style={styles.registerBtn}>
          <LinearGradient
            colors={['#0D7377', '#14919B']}
            style={styles.registerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="person-add" size={20} color="#FFF" />
            <Text style={styles.registerText}>Créer mon compte</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondaire : Se connecter → Login */}
        <TouchableOpacity onPress={goToLogin} style={styles.loginBtn} activeOpacity={0.7}>
          <Text style={styles.loginText}>
            Déjà un compte ?{' '}
            <Text style={styles.loginLink}>Se connecter</Text>
          </Text>
        </TouchableOpacity>

        {/* Retour */}
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backLink}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFE', alignItems: 'center' },
  topBlob: {
    position: 'absolute',
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    top: -width * 0.85,
    alignSelf: 'center',
  },
  bottomBlob: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(13,115,119,0.05)',
    bottom: -50, right: -50,
  },
  successSection: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingHorizontal: 28,
    marginBottom: 20,
  },
  outerRing: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(20,255,236,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  innerRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(20,255,236,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  successCircle: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  emoji: { fontSize: 32, marginBottom: 12 },
  title: {
    fontSize: 30, fontWeight: '800', color: '#111827',
    textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    fontSize: 15, color: '#6B7280', textAlign: 'center',
    lineHeight: 24,
  },
  benefitsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginHorizontal: 24,
    paddingHorizontal: 20,
    shadowColor: '#0D7377',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  benefitRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, gap: 14,
  },
  benefitBorder: {
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  benefitText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#374151' },
  footer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginTop: 20,
    gap: 12,
  },
  registerBtn: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#0D7377',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  registerGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18, gap: 10,
  },
  registerText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  loginBtn: { alignItems: 'center', paddingVertical: 8 },
  loginText: { fontSize: 15, color: '#6B7280' },
  loginLink: { color: '#0D7377', fontWeight: '700' },
  backLink: { alignItems: 'center', paddingVertical: 4 },
  backText: { fontSize: 13, color: '#9CA3AF' },
});

export default ReadyScreen;