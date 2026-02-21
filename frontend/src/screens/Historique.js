import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const transactionsFictives = [
  { id: 1, date: '2025-12-09', type: 'depense', montant: 15000, categorie: 'Loisirs', description: 'Cinéma et Restaurant' },
  { id: 2, date: '2025-12-08', type: 'revenu', montant: 50000, categorie: 'Salaire', description: 'Avance sur Salaire' },
  { id: 3, date: '2025-12-08', type: 'depense', montant: 7500, categorie: 'Transport', description: 'Essence moto' },
  { id: 4, date: '2025-12-07', type: 'depense', montant: 3000, categorie: 'Nourriture', description: 'Repas midi' },
];

const Historique = () => {
  const [filtreType, setFiltreType] = useState('tout');
  const [filtreCategorie, setFiltreCategorie] = useState('tout');
  const [exportMessage, setExportMessage] = useState(null);

  const categories = ['Loisirs', 'Salaire', 'Transport', 'Nourriture'];

  const transactionsFiltrees = transactionsFictives.filter(t => {
    const typeMatch = filtreType === 'tout' || t.type === filtreType;
    const catMatch = filtreCategorie === 'tout' || t.categorie === filtreCategorie;
    return typeMatch && catMatch;
  });

  const handleExport = () => {
    setExportMessage("Export réussi !");
    setTimeout(() => setExportMessage(null), 3000);
  };

  return (
    <ScrollView style={styles.container}>

      {/* Titre */}
      <View style={styles.header}>
        <FontAwesome name="history" size={24} color="#4f46e5" />
        <Text style={styles.headerText}>Historique des Transactions</Text>
      </View>

      {/* Message d'export */}
      {exportMessage && (
        <View style={styles.exportMessage}>
          <Text style={styles.exportText}>{exportMessage}</Text>
        </View>
      )}

      {/* Filtres */}
      <View style={styles.filtresContainer}>
        <View style={styles.filterHeader}>
          <FontAwesome name="filter" size={18} color="#555" />
          <Text style={styles.filterHeaderText}>Filtres</Text>
        </View>

        <Text style={styles.label}>Type :</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filtreType}
            onValueChange={v => setFiltreType(v)}
          >
            <Picker.Item label="Tout" value="tout" />
            <Picker.Item label="Revenu" value="revenu" />
            <Picker.Item label="Dépense" value="depense" />
          </Picker>
        </View>

        <Text style={styles.label}>Catégorie :</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filtreCategorie}
            onValueChange={v => setFiltreCategorie(v)}
          >
            <Picker.Item label="Toutes" value="tout" />
            {categories.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <FontAwesome name="download" size={18} color="#fff" />
          <Text style={styles.exportButtonText}>Exporter CSV / PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <View style={styles.listContainer}>
        {transactionsFiltrees.length > 0 ? (
          transactionsFiltrees.map(t => <TransactionItem key={t.id} {...t} />)
        ) : (
          <Text style={styles.noTransaction}>Aucune transaction trouvée.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const TransactionItem = ({ date, type, montant, categorie, description }) => {
  const isDepense = type === 'depense';
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <View style={[styles.iconWrapper, { backgroundColor: isDepense ? '#fee2e2' : '#d1fae5' }]}>
          <FontAwesome name={isDepense ? 'arrow-down' : 'arrow-up'} size={20} color={isDepense ? 'red' : 'green'} />
        </View>
        <View>
          <Text style={styles.transactionCategory}>{categorie}</Text>
          <Text style={styles.transactionDesc}>{description} – {date}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: isDepense ? '#dc2626' : '#16a34a' }]}>
        {isDepense ? '-' : '+'} {montant.toLocaleString()} FCFA
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9fafb', flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginLeft: 8 },
  exportMessage: { padding: 12, backgroundColor: '#d1fae5', borderRadius: 8, marginBottom: 12 },
  exportText: { color: '#047857' },
  filtresContainer: { padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  filterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  filterHeaderText: { fontWeight: '600', marginLeft: 4, fontSize: 16, color: '#374151' },
  label: { fontSize: 14, fontWeight: '500', marginTop: 8, marginBottom: 4, color: '#374151' },
  pickerWrapper: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, marginBottom: 8 },
  exportButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', padding: 12, borderRadius: 8, marginTop: 8 },
  exportButtonText: { color: '#fff', marginLeft: 4, fontWeight: '600' },
  listContainer: { marginTop: 8 },
  noTransaction: { textAlign: 'center', padding: 16, fontStyle: 'italic', color: '#6b7280' },
  transactionItem: { padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  transactionInfo: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { padding: 8, borderRadius: 50, marginRight: 8 },
  transactionCategory: { fontWeight: '600', color: '#1f2937' },
  transactionDesc: { fontSize: 12, color: '#6b7280' },
  transactionAmount: { fontWeight: '700', fontSize: 16 },
});

export default Historique;
