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

const WelcomeScreen = ({ onNext }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrée principale
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    // Flottement des bulles
    const floatBubble = (anim, delay, distance = 10) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -distance, duration: 2000 + delay, useNativeDriver: true }),
          Animated.timing(anim, { toValue: distance, duration: 2000 + delay, useNativeDriver: true }),
        ])
      ).start();

    floatBubble(float1, 0, 12);
    floatBubble(float2, 300, 8);
    floatBubble(float3, 600, 10);
  }, []);

  return (
    <View style={styles.container}>
      {/* Fond dégradé */}
      <LinearGradient
        colors={['#0D7377', '#14919B', '#0a5a5e']}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Bulles flottantes décoratives */}
      <Animated.View style={[styles.bubble, styles.bubble1, { transform: [{ translateY: float1 }] }]} />
      <Animated.View style={[styles.bubble, styles.bubble2, { transform: [{ translateY: float2 }] }]} />
      <Animated.View style={[styles.bubble, styles.bubble3, { transform: [{ translateY: float3 }] }]} />

      {/* Illustration centrale */}
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.mainCircle}>
          <LinearGradient
            colors={['#14FFEC', '#0D7377']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="wallet" size={52} color="#FFF" />
          </LinearGradient>
        </View>

        {/* Badges flottants autour */}
        <Animated.View style={[styles.badge, styles.badge1, { transform: [{ translateY: float1 }] }]}>
          <Text style={styles.badgeEmoji}>📈</Text>
          <Text style={styles.badgeText}>+24%</Text>
        </Animated.View>

        <Animated.View style={[styles.badge, styles.badge2, { transform: [{ translateY: float2 }] }]}>
          <Text style={styles.badgeEmoji}>🎯</Text>
          <Text style={styles.badgeText}>Objectif</Text>
        </Animated.View>

        <Animated.View style={[styles.badge, styles.badge3, { transform: [{ translateY: float3 }] }]}>
          <Text style={styles.badgeEmoji}>💰</Text>
          <Text style={styles.badgeText}>Épargne</Text>
        </Animated.View>
      </Animated.View>

      {/* Contenu texte */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.tagContainer}>
          <View style={styles.tagPill}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>GESTION FINANCIÈRE</Text>
          </View>
        </View>

        <Text style={styles.title}>
          Prenez le contrôle de{' '}
          <Text style={styles.titleAccent}>votre argent</Text>
        </Text>

        <Text style={styles.description}>
          Épargnez intelligemment, suivez vos objectifs et construisez votre avenir financier — conçu pour vous au Cameroun.
        </Text>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          {[
            { value: '10K+', label: 'Utilisateurs' },
            { value: '95%', label: 'Satisfaction' },
            { value: '🇨🇲', label: 'Made in CM' },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bouton */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.btn}>
          <LinearGradient
            colors={['#14FFEC', '#0D9FA5']}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>Commencer</Text>
            <Ionicons name="arrow-forward" size={20} color="#0D7377" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFE' },
  topGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.52,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(20, 255, 236, 0.08)',
  },
  bubble1: { width: 180, height: 180, top: -40, right: -50 },
  bubble2: { width: 120, height: 120, top: 60, left: -30 },
  bubble3: { width: 80, height: 80, top: height * 0.3, right: 20 },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.07,
    height: height * 0.32,
    position: 'relative',
  },
  mainCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(20,255,236,0.4)',
  },
  iconGradient: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#0D7377',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    gap: 6,
  },
  badge1: { top: 10, right: 10 },
  badge2: { bottom: 30, left: 10 },
  badge3: { bottom: 10, right: 20 },
  badgeEmoji: { fontSize: 16 },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#0D7377' },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  tagContainer: { marginBottom: 14 },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(13,115,119,0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 6,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D7377' },
  tagText: { fontSize: 11, fontWeight: '700', color: '#0D7377', letterSpacing: 1.5 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 38,
    marginBottom: 12,
  },
  titleAccent: { color: '#0D7377' },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0D7377' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  footer: { paddingHorizontal: 28, paddingBottom: 40 },
  btn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0D7377',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  btnText: { fontSize: 17, fontWeight: '800', color: '#0D4C4F', letterSpacing: 0.3 },
});

export default WelcomeScreen;