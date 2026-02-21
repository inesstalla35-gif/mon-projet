import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView 
} from 'react-native';
import { Colors } from '../../screens/constant/colors';
import OnboardingButton from '../../components/onboarding/OnboardingButton';

const steps = [
  {
    number: '01',
    title: 'Créez votre profil',
    description: 'Indiquez vos revenus, dépenses régulières et objectifs financiers.',
  },
  {
    number: '02',
    title: 'Suivez vos dépenses',
    description: 'Enregistrez vos dépenses quotidiennes et catégorisez-les automatiquement.',
  },
  {
    number: '03',
    title: 'Épargnez intelligemment',
    description: 'Recevez des suggestions personnalisées et atteignez vos objectifs.',
  },
];

const StepItem = ({ number, title, description, isLast }) => (
  <View style={styles.stepContainer}>
    <View style={styles.timeline}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      {!isLast && <View style={styles.line} />}
    </View>
    <View style={styles.content}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const HowItWorksScreen = ({ onNext, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Comment ça marche ?</Text>
      <Text style={styles.headerSubtitle}>
        Trois étapes simples pour prendre le contrôle de vos finances
      </Text>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {steps.map((step, index) => (
          <StepItem 
            key={step.number}
            {...step}
            isLast={index === steps.length - 1}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <OnboardingButton 
          title="J'ai compris" 
          onPress={onNext}
        />
        <Text style={styles.backText} onPress={onBack}>
          Retour
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray600,
    lineHeight: 24,
    marginBottom: 40,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 20,
  },
  numberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.primaryLight,
    marginVertical: 8,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: Colors.gray600,
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  backText: {
    textAlign: 'center',
    marginTop: 16,
    color: Colors.gray500,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HowItWorksScreen;