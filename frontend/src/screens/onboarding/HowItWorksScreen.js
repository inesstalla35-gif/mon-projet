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

const steps = [
  {
    number: '01',
    icon: 'person-add',
    color: '#0D7377',
    bg: '#E6F7F7',
    title: 'Créez votre profil',
    description: 'Indiquez vos revenus et vos objectifs financiers en quelques minutes. Rapide et sécurisé.',
    time: '2 minutes',
  },
  {
    number: '02',
    icon: 'receipt',
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'Suivez vos dépenses',
    description: 'Enregistrez revenus et dépenses quotidiens. L\'app catégorise et analyse tout automatiquement.',
    time: 'Quotidien',
  },
  {
    number: '03',
    icon: 'trophy',
    color: '#10B981',
    bg: '#D1FAE5',
    title: 'Épargnez & gagnez',
    description: 'Atteignez vos objectifs avec des conseils personnalisés et regardez votre épargne croître.',
    time: 'À votre rythme',
  },
];

const HowItWorksScreen = ({ onNext, onBack }) => {
  const anims = steps.map(() => useRef(new Animated.Value(0)).current);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.stagger(200,
        anims.map(anim =>
          Animated.spring(anim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true })
        )
      ),
      Animated.timing(progressAnim, { toValue: 1, duration: 1000, delay: 400, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header décoratif */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0D7377" />
        </TouchableOpacity>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>GUIDE RAPIDE</Text>
        </View>
        <Text style={styles.headerTitle}>Comment ça{'\n'}marche ?</Text>
        <Text style={styles.headerSub}>3 étapes simples pour démarrer</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepRow,
              {
                opacity: anims[index],
                transform: [
                  { translateY: anims[index].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                ],
              },
            ]}
          >
            {/* Ligne de connexion verticale */}
            <View style={styles.timeline}>
              <LinearGradient
                colors={[step.color, step.color + '55']}
                style={styles.numberCircle}
              >
                <Text style={styles.numberText}>{step.number}</Text>
              </LinearGradient>
              {index < steps.length - 1 && (
                <View style={styles.verticalLine} />
              )}
            </View>

            {/* Contenu */}
            <View style={[styles.stepCard, { borderLeftColor: step.color }]}>
              <View style={styles.stepCardHeader}>
                <View style={[styles.stepIconWrap, { backgroundColor: step.bg }]}>
                  <Ionicons name={step.icon} size={20} color={step.color} />
                </View>
                <View style={[styles.timePill, { backgroundColor: step.bg }]}>
                  <Ionicons name="time-outline" size={12} color={step.color} />
                  <Text style={[styles.timeText, { color: step.color }]}>{step.time}</Text>
                </View>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </Animated.View>
        ))}

        {/* Garantie */}
        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={22} color="#0D7377" />
          <Text style={styles.guaranteeText}>
            Vos données sont <Text style={{ fontWeight: '700', color: '#0D7377' }}>100% sécurisées</Text> et ne sont jamais partagées.
          </Text>
        </View>
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
            <Text style={styles.btnText}>J'ai compris !</Text>
            <Ionicons name="checkmark-circle" size={20} color="#14FFEC" />
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
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E6F7F7',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6F7F7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  headerBadgeText: { fontSize: 10, fontWeight: '700', color: '#0D7377', letterSpacing: 1.2 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827', lineHeight: 36, marginBottom: 6 },
  headerSub: { fontSize: 14, color: '#6B7280' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 10 },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 16,
  },
  timeline: { alignItems: 'center', width: 44 },
  numberCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  numberText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  verticalLine: {
    width: 2, flex: 1, minHeight: 20,
    backgroundColor: '#E5E7EB',
    marginVertical: 4, borderRadius: 2,
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  timePill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, gap: 4,
  },
  timeText: { fontSize: 11, fontWeight: '600' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  stepDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  guaranteeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E6F7F7',
    borderRadius: 14, padding: 14, gap: 10, marginTop: 4,
  },
  guaranteeText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 20 },
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

export default HowItWorksScreen;