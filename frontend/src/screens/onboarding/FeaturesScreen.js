import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const features = [
  {
    icon: 'flag',
    color: '#0D7377',
    bg: '#E6F7F7',
    title: 'Objectifs personnalisés',
    description: 'Voyage, logement, urgence… Définissez vos projets et suivez votre progression en temps réel.',
    tag: 'POPULAIRE',
  },
  {
    icon: 'pie-chart',
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'Suivi intelligent',
    description: 'Visualisez vos dépenses par catégorie et identifiez les fuites financières automatiquement.',
    tag: null,
  },
  {
    icon: 'bulb',
    color: '#8B5CF6',
    bg: '#EDE9FE',
    title: 'Conseils personnalisés',
    description: 'Recevez des recommandations basées sur vos habitudes pour maximiser votre épargne.',
    tag: 'NOUVEAU',
  },
];

const FeaturesScreen = ({ onNext, onBack }) => {
  const anims = features.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(150,
      anims.map(anim =>
        Animated.spring(anim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true })
      )
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0D7377', '#14919B']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Ce que vous{'\n'}pouvez faire</Text>
          <Text style={styles.headerSub}>3 outils puissants pour votre budget</Text>
        </View>
        <View style={styles.headerDeco}>
          <Ionicons name="rocket" size={60} color="rgba(20,255,236,0.15)" />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            style={[
              styles.card,
              {
                opacity: anims[index],
                transform: [
                  { translateX: anims[index].interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.cardLeft}>
              <View style={[styles.iconWrap, { backgroundColor: feature.bg }]}>
                <Ionicons name={feature.icon} size={26} color={feature.color} />
              </View>
              <View style={styles.connector} />
            </View>
            <View style={styles.cardContent}>
              {feature.tag && (
                <View style={[styles.tagPill, { backgroundColor: feature.color + '18' }]}>
                  <Text style={[styles.tagText, { color: feature.color }]}>{feature.tag}</Text>
                </View>
              )}
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardDesc}>{feature.description}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Boutons */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.btn}>
          <LinearGradient
            colors={['#0D7377', '#14919B']}
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFE' },
  header: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', lineHeight: 36, marginBottom: 8 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  headerDeco: { position: 'absolute', right: -10, bottom: -10 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 14, paddingBottom: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0D7377',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  cardLeft: { alignItems: 'center' },
  iconWrap: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  connector: { flex: 1, width: 2, backgroundColor: '#F0F0F0', marginTop: 8, borderRadius: 2 },
  cardContent: { flex: 1 },
  tagPill: {
    alignSelf: 'flex-start', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  tagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingBottom: 40, gap: 12 },
  btn: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#0D7377', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 7,
  },
  btnGradient: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 18, gap: 10,
  },
  btnText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  backLink: { alignItems: 'center', paddingVertical: 6 },
  backLinkText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
});

export default FeaturesScreen;