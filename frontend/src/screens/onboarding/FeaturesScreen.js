import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Dimensions 
} from 'react-native';
import { Colors } from '../../screens/constant/colors';
import OnboardingButton from '../../components/onboarding/OnboardingButton';

const { width } = Dimensions.get('window');

const features = [
  {
    id: '1',
    icon: '🎯',
    title: 'Objectifs personnalisés',
    description: 'Définissez vos projets (voyage, maison, urgence) et suivez votre progression en temps réel.',
  },
  {
    id: '2',
    icon: '📊',
    title: 'Suivi intelligent',
    description: 'Visualisez vos dépenses par catégorie et identifiez les fuites financières.',
  },
  {
    id: '3',
    icon: '🤖',
    title: 'Conseils IA',
    description: 'Recevez des recommandations personnalisées basées sur vos habitudes financières.',
  },
];

const FeatureCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{item.icon}</Text>
    </View>
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardDescription}>{item.description}</Text>
  </View>
);

const FeaturesScreen = ({ onNext, onBack }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ce que vous pouvez faire</Text>
      <Text style={styles.headerSubtitle}>
        Découvrez les fonctionnalités conçues pour vous aider à mieux gérer votre argent
      </Text>

      <FlatList
        data={features}
        renderItem={({ item }) => <FeatureCard item={item} />}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <OnboardingButton 
          title="Continuer" 
          onPress={onNext}
        />
        <Text style={styles.skipText} onPress={onBack}>
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
    marginBottom: 32,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.gray50,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 22,
  },
  footer: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  skipText: {
    textAlign: 'center',
    marginTop: 16,
    color: Colors.gray500,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FeaturesScreen;