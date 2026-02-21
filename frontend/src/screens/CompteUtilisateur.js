import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const Dashboard = () => {
  // Données fictives
  const soldeActuel = 145000;
  const depensesMois = 72500;
  const epargneActuelle = 48000;
  const alerte = { type: 'alert', text: "⚠️ Attention, tes dépenses de loisirs dépassent ton budget habituel cette semaine." };

  const repartitions = [
    { categorie: "Loisirs", pourcentage: 35, couleur: 'red' },
    { categorie: "Transport", pourcentage: 25, couleur: 'yellow' },
    { categorie: "Nourriture", pourcentage: 40, couleur: 'purple' },
  ];

  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Vue d'Ensemble</Text>

      {/* Message Motivateur / Alerte */}
      <View style={[styles.alert, alerte.type === 'alert' ? styles.alertRed : styles.alertBlue]}>
        <Text style={alerte.type === 'alert' ? styles.alertTextRed : styles.alertTextBlue}>
          {alerte.text}
        </Text>
      </View>

      {/* Cartes des Totaux */}
      <View style={styles.cardsContainer}>
        <Card title="Solde Actuel" value={`${soldeActuel.toLocaleString()} FCFA`} icon="money-bill-wave" color="#4f46e5" />
        <Card title="Dépenses ce Mois" value={`${depensesMois.toLocaleString()} FCFA`} icon="chart-pie" color="#ef4444" />
        <Card title="Épargne Globale" value={`${epargneActuelle.toLocaleString()} FCFA`} icon="running" color="#22c55e" />
      </View>

      {/* Répartition des Dépenses */}
      <View style={styles.repartitionContainer}>
        <Text style={styles.sectionTitle}>Mes Dépenses</Text>
        <View style={styles.graphPlaceholder}>
          <Text>Graphique placeholder</Text>
        </View>
        <View style={styles.repartitionLegend}>
          {repartitions.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.couleur }]} />
              <Text>{item.categorie} ({item.pourcentage}%)</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Objectif principal */}
      <View style={styles.repartitionContainer}>
        <Text style={styles.sectionTitle}>Objectif principal : Voyage à Dubaï</Text>
        <ProgressBar progression={30} target={500000} current={150000} />
      </View>

      {/* Mode hors ligne */}
      <Text style={styles.offlineText}>🔄 3 transactions en attente de synchronisation.</Text>
    </View>
  );
};

const Card = ({ title, value, icon, color }) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <FontAwesome5 name={icon} size={24} color="white" />
    </View>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const ProgressBar = ({ progression, target, current }) => (
  <View>
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${progression}%` }]} />
    </View>
    <View style={styles.progressBarLabels}>
      <Text>{current.toLocaleString()} FCFA</Text>
      <Text>{progression}%</Text>
      <Text>Cible: {target.toLocaleString()} FCFA</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9fafb', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  alert: { padding: 12, borderRadius: 8, marginBottom: 12 },
  alertRed: { backgroundColor: '#fee2e2' },
  alertBlue: { backgroundColor: '#e0e7ff' },
  alertTextRed: { color: '#b91c1c', fontWeight: '500' },
  alertTextBlue: { color: '#4338ca', fontWeight: '500' },
  cardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { padding: 20, borderRadius: 12, width: '30%' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 14, color: 'white', opacity: 0.8 },
  cardValue: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 8 },
  repartitionContainer: { padding: 16, backgroundColor: 'white', borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  graphPlaceholder: { height: 160, backgroundColor: '#e5e7eb', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  repartitionLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendColor: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  progressBarBackground: { width: '100%', height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 4 },
  progressBarFill: { height: 8, borderRadius: 4, backgroundColor: '#4f46e5' },
  progressBarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  offlineText: { textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 16 },
});

export default Dashboard;
