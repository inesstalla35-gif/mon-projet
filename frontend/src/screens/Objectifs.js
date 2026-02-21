import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");

/* ================== COULEURS WISEPOCKET ================== */
const COLORS = {
  primary: "#0D7377",      // Vert profond
  secondary: "#14FFEC",    // Vert néon
  accent: "#14919B",       // Vert moyen
  dark: "#212121",         // Noir
  background: "#F5F5F5",   // Blanc cassé
  card: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  success: "#0D7377",
  warning: "#FFA726",
  danger: "#EF5350",
};

/* ================== CATÉGORIES AVEC ICÔNES ================== */
const CATEGORIES = [
  { id: "voyage", label: "Voyage", icon: "airplane", color: "#4FC3F7" },
  { id: "etudes", label: "Études", icon: "school", color: "#AB47BC" },
  { id: "famille", label: "Famille", icon: "people", color: "#FF7043" },
  { id: "materiel", label: "Matériel", icon: "phone-portrait", color: "#66BB6A" },
  { id: "business", label: "Business", icon: "briefcase", color: "#FFA726" },
  { id: "sante", label: "Santé", icon: "medical", color: "#EF5350" },
  { id: "logement", label: "Logement", icon: "home", color: "#5C6BC0" },
  { id: "urgence", label: "Urgence", icon: "warning", color: "#EC407A" },
  { id: "autre", label: "Autre", icon: "ellipsis-horizontal", color: "#78909C" },
];

const FREQUENCIES = [
  { id: "daily", label: "Tous les jours", icon: "calendar", subtext: "Épargne quotidienne" },
  { id: "weekly", label: "Chaque semaine", icon: "calendar-outline", subtext: "7 jours" },
  { id: "monthly", label: "Chaque mois", icon: "calendar-number", subtext: "30 jours" },
];

const CreateGoalScreen = ({ navigation }) => {
  // States formulaire
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [deadline, setDeadline] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // +3 mois par défaut
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");
  const [note, setNote] = useState("");

  // States calculs
  const [calculations, setCalculations] = useState(null);
  const [isValid, setIsValid] = useState(false);
  
  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calcul automatique quand les données changent
  useEffect(() => {
    calculateSavings();
  }, [targetAmount, deadline, frequency, initialAmount]);

  const calculateSavings = () => {
    const target = parseFloat(targetAmount) || 0;
    const initial = parseFloat(initialAmount) || 0;
    const remaining = target - initial;
    
    if (target < 1000 || remaining <= 0) {
      setCalculations(null);
      setIsValid(false);
      return;
    }

    const daysLeft = Math.max(1, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)));
    
    let daily, weekly, monthly, perFrequency, periods;
    
    daily = remaining / daysLeft;
    weekly = daily * 7;
    monthly = daily * 30;
    
    // Calcul selon fréquence choisie
    switch(frequency) {
      case 'daily':
        perFrequency = daily;
        periods = daysLeft;
        break;
      case 'weekly':
        periods = Math.ceil(daysLeft / 7);
        perFrequency = weekly;
        break;
      case 'monthly':
        periods = Math.ceil(daysLeft / 30);
        perFrequency = monthly;
        break;
      default:
        perFrequency = monthly;
        periods = Math.ceil(daysLeft / 30);
    }

    // Validation réalisme (30% du revenu mensuel estimé à 300k FCFA)
    const monthlyIncome = 300000;
    const isRealistic = monthly < monthlyIncome * 0.4;
    
    setCalculations({
      daily: Math.ceil(daily),
      weekly: Math.ceil(weekly),
      monthly: Math.ceil(monthly),
      perFrequency: Math.ceil(perFrequency),
      periods,
      daysLeft,
      isRealistic,
      progress: initial > 0 ? (initial / target) * 100 : 0,
    });
    
    setIsValid(title.length > 2 && category !== "");
  };

  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  const handleSave = () => {
    if (!isValid || !calculations) {
      Alert.alert("Champs incomplets", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const goalData = {
      id: Date.now(),
      title,
      targetAmount: parseFloat(targetAmount),
      initialAmount: parseFloat(initialAmount) || 0,
      deadline,
      frequency,
      category,
      priority,
      note,
      calculations,
      createdAt: new Date(),
      progress: calculations.progress,
    };

    // Ici : appel API pour sauvegarder
    console.log("Objectif créé:", goalData);
    
    Alert.alert(
      "🎉 Objectif créé avec succès !",
      `Vous devez épargner ${formatCurrency(calculations.perFrequency)} ${frequency === 'daily' ? 'par jour' : frequency === 'weekly' ? 'par semaine' : 'par mois'} pour atteindre votre objectif.`,
      [
        { text: "Voir mes objectifs", onPress: () => navigation?.navigate("Objectifs") },
        { text: "OK", style: "default" }
      ]
    );
  };

  const getSelectedCategory = () => CATEGORIES.find(c => c.id === category);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ====== HEADER AVEC DÉGRADÉ ====== */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouvel Objectif</Text>
            <View style={{ width: 40 }} />
          </View>
          <Text style={styles.headerSubtitle}>
            Définissez votre projet d'épargne
          </Text>
        </LinearGradient>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          
          {/* ====== SECTION 1: IDENTITÉ ====== */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quel est votre projet ?</Text>
            
            {/* Titre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de l'objectif *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Voyage à Paris, Nouveau téléphone..."
                  value={title}
                  onChangeText={setTitle}
                  maxLength={50}
                />
                <Text style={styles.charCount}>{title.length}/50</Text>
              </View>
            </View>

            {/* Catégorie */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      category === cat.id && { 
                        backgroundColor: cat.color + "20",
                        borderColor: cat.color,
                      }
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                      <Ionicons name={cat.icon} size={16} color="#FFF" />
                    </View>
                    <Text style={[
                      styles.categoryText,
                      category === cat.id && { color: cat.color, fontWeight: '600' }
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Note optionnelle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (optionnel)</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Ajoutez des détails sur votre objectif..."
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* ====== SECTION 2: FINANCES ====== */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vos chiffres</Text>
            
            {/* Montant cible */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Montant cible *</Text>
              <View style={[styles.inputWrapper, styles.amountInput]}>
                <Text style={styles.currency}>FCFA</Text>
                <TextInput
                  style={[styles.input, styles.amountText]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={(text) => setTargetAmount(text.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>

            {/* Montant initial */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Montant déjà épargné</Text>
              <View style={[styles.inputWrapper, styles.amountInput]}>
                <Text style={styles.currency}>FCFA</Text>
                <TextInput
                  style={[styles.input, styles.amountText]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={initialAmount}
                  onChangeText={(text) => setInitialAmount(text.replace(/[^0-9]/g, ''))}
                />
              </View>
              {initialAmount > 0 && (
                <Text style={styles.helpText}>
                  Super ! Vous avez déjà commencé votre épargne.
                </Text>
              )}
            </View>

            {/* Date limite */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date limite *</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <View style={styles.dateIcon}>
                  <Ionicons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.dateContent}>
                  <Text style={styles.dateLabel}>À atteindre avant le</Text>
                  <Text style={styles.dateValue}>
                    {deadline.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={deadline}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDeadline(selectedDate);
                  }}
                />
              )}
            </View>
          </View>

          {/* ====== SECTION 3: RYTHME ====== */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre rythme d'épargne</Text>
            
            {/* Fréquence */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fréquence</Text>
              <View style={styles.frequencyContainer}>
                {FREQUENCIES.map((freq) => (
                  <TouchableOpacity
                    key={freq.id}
                    style={[
                      styles.freqCard,
                      frequency === freq.id && styles.freqCardActive
                    ]}
                    onPress={() => setFrequency(freq.id)}
                  >
                    <LinearGradient
                      colors={frequency === freq.id ? [COLORS.primary, COLORS.accent] : ['#F5F5F5', '#F5F5F5']}
                      style={styles.freqGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons 
                        name={freq.icon} 
                        size={24} 
                        color={frequency === freq.id ? COLORS.secondary : COLORS.textSecondary} 
                      />
                      <Text style={[
                        styles.freqLabel,
                        frequency === freq.id && styles.freqLabelActive
                      ]}>
                        {freq.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priorité */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priorité</Text>
              <View style={styles.priorityRow}>
                {['low', 'normal', 'high'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityChip,
                      priority === p && styles.priorityChipActive
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <View style={[
                      styles.priorityDot,
                      { backgroundColor: p === 'high' ? COLORS.danger : p === 'normal' ? COLORS.warning : COLORS.success }
                    ]} />
                    <Text style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextActive
                    ]}>
                      {p === 'high' ? 'Haute' : p === 'normal' ? 'Normale' : 'Basse'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* ====== SECTION 4: RÉSULTATS ====== */}
          {calculations && (
            <LinearGradient
              colors={calculations.isRealistic ? [COLORS.primary + "15", COLORS.secondary + "10"] : [COLORS.warning + "20", COLORS.warning + "10"]}
              style={styles.resultCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.resultHeader}>
                <Ionicons 
                  name={calculations.isRealistic ? "checkmark-circle" : "warning"} 
                  size={28} 
                  color={calculations.isRealistic ? COLORS.primary : COLORS.warning} 
                />
                <Text style={styles.resultTitle}>
                  {calculations.isRealistic ? "Objectif réalisable !" : "Objectif ambitieux"}
                </Text>
              </View>

              <View style={styles.resultAmount}>
                <Text style={styles.resultLabel}>À épargner {frequency === 'daily' ? 'chaque jour' : frequency === 'weekly' ? 'chaque semaine' : 'chaque mois'}</Text>
                <Text style={styles.resultValue}>{formatCurrency(calculations.perFrequency)}</Text>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Reste à épargner</Text>
                  <Text style={styles.resultItemValue}>
                    {formatCurrency(parseFloat(targetAmount) - parseFloat(initialAmount || 0))}
                  </Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Durée</Text>
                  <Text style={styles.resultItemValue}>{calculations.daysLeft} jours</Text>
                </View>
                <View style={styles.resultDivider} />
                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>Versements</Text>
                  <Text style={styles.resultItemValue}>{calculations.periods} fois</Text>
                </View>
              </View>

              {!calculations.isRealistic && (
                <View style={styles.warningBox}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.warning} />
                  <Text style={styles.warningText}>
                    Ce montant représente plus de 40% de revenus mensuels estimés. Envisagez d'allonger la durée ou de réduire l'objectif.
                  </Text>
                </View>
              )}
            </LinearGradient>
          )}

          {/* ====== BOUTON CRÉER ====== */}
          <TouchableOpacity
            style={[styles.createButton, !isValid && styles.createButtonDisabled]}
            onPress={handleSave}
            disabled={!isValid}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isValid ? [COLORS.primary, COLORS.accent] : [COLORS.textLight, COLORS.textLight]}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flag" size={24} color="#FFF" />
              <Text style={styles.createButtonText}>Créer mon objectif</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // HEADER
 header: {
    backgroundColor: COLORS.black,
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
 
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 50,
  },

  // FORMULAIRE
  formContainer: {
    padding: 20,
    marginTop: -10,
  },
  
  // SECTIONS
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },

  // INPUTS
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // CATÉGORIES
  categoryScroll: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // MONTANTS
  amountInput: {
    paddingHorizontal: 0,
    paddingLeft: 16,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 10,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 12,
    color: COLORS.success,
    marginTop: 6,
    marginLeft: 4,
  },

  // DATE
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 2,
  },

  // FRÉQUENCES
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freqCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  freqCardActive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  freqGradient: {
    alignItems: 'center',
    padding: 16,
  },
  freqLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  freqLabelActive: {
    color: '#FFF',
  },

  // PRIORITÉ
  priorityRow: {
    flexDirection: 'row',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priorityTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // RÉSULTATS
  resultCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 10,
  },
  resultAmount: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultItemLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  resultItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  resultDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    lineHeight: 18,
  },

  // BOUTON
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    shadowOpacity: 0,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});

export default CreateGoalScreen;