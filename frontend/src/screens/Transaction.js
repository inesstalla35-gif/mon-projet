import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Switch,
  Animated,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";

/* ================== COULEURS WISEPOCKET ================== */
const COLORS = {
  primary: "#0D7377",
  secondary: "#14FFEC",
  accent: "#14919B",
  dark: "#212121",
  background: "#F5F5F5",
  card: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  success: "#0D7377",
  danger: "#E74C3C",
  warning: "#F39C12",
  income: "#0D7377",
  expense: "#E74C3C",
};

/* ================== CATÉGORIES ================== */
const CATEGORIES = {
  depense: [
    { id: "alimentation", label: "Alimentation", icon: "restaurant", color: "#FF6B6B" },
    { id: "transport", label: "Transport", icon: "car", color: "#4ECDC4" },
    { id: "logement", label: "Logement", icon: "home", color: "#45B7D1" },
    { id: "factures", label: "Factures", icon: "flash", color: "#F9CA24" },
    { id: "sante", label: "Santé", icon: "medical", color: "#6C5CE7" },
    { id: "education", label: "Éducation", icon: "school", color: "#A29BFE" },
    { id: "shopping", label: "Shopping", icon: "cart", color: "#FD79A8" },
    { id: "loisirs", label: "Loisirs", icon: "game-controller", color: "#00B894" },
    { id: "tontine", label: "Tontine/Epargne", icon: "people", color: "#E17055" },
    { id: "autres", label: "Autres", icon: "ellipsis-horizontal", color: "#B2BEC3" },
  ],
  revenu: [
    { id: "salaire", label: "Salaire", icon: "cash", color: "#00B894" },
    { id: "freelance", label: "Freelance", icon: "laptop", color: "#0984E3" },
    { id: "business", label: "Business", icon: "briefcase", color: "#6C5CE7" },
    { id: "vente", label: "Vente", icon: "pricetag", color: "#E84393" },
    { id: "dividendes", label: "Dividendes", icon: "trending-up", color: "#00CEC9" },
    { id: "transfert", label: "Transfert", icon: "swap-horizontal", color: "#FDCB6E" },
    { id: "remboursement", label: "Remboursement", icon: "return-down-back", color: "#74B9FF" },
    { id: "revenu_passif", label: "Revenu passif", icon: "wallet", color: "#A29BFE" },
    { id: "autres", label: "Autres", icon: "ellipsis-horizontal", color: "#B2BEC3" },
  ],
};

const TransactionScreen = ({ navigation }) => {
  // États principaux
  const [type, setType] = useState("depense");
  const [montant, setMontant] = useState("");
  const [categorie, setCategorie] = useState(null);
  const [sousCategorie, setSousCategorie] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [modePaiement, setModePaiement] = useState("especes");
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [frequenceRecurrence, setFrequenceRecurrence] = useState("mensuel");
  
  // États UI
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRecurrentModal, setShowRecurrentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [type]);

  const currentCategories = CATEGORIES[type];
  const currentCategory = currentCategories.find(c => c.id === categorie);

  const formatMontant = (text) => {
    const clean = text.replace(/[^0-9]/g, "");
    if (clean === "") {
      setMontant("");
      return;
    }
    const number = parseInt(clean);
    setMontant(number.toLocaleString("fr-FR"));
  };

  const handleSubmit = async () => {
    // Validation
    if (!montant || parseInt(montant.replace(/\s/g, "")) <= 0) {
      Alert.alert("Montant requis", "Veuillez entrer un montant valide.");
      return;
    }
    if (!categorie) {
      Alert.alert("Catégorie requise", "Veuillez choisir une catégorie.");
      return;
    }

    setIsSubmitting(true);

    const transactionData = {
      id: Date.now(),
      type,
      montant: parseInt(montant.replace(/\s/g, "")),
      categorie,
      sousCategorie,
      description,
      date,
      modePaiement,
      isRecurrent,
      frequenceRecurrence: isRecurrent ? frequenceRecurrence : null,
      createdAt: new Date(),
    };

    // Simulation API
    console.log("Transaction enregistrée:", transactionData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "✅ Transaction enregistrée",
        `${type === "depense" ? "Dépense" : "Revenu"} de ${montant} FCFA ajouté avec succès.`,
        [{ text: "OK", onPress: () => navigation?.goBack() }]
      );
    }, 500);
  };

  const getHeaderColors = () => {
    return type === "depense" 
      ? [COLORS.expense, "#C0392B"] 
      : [COLORS.income, COLORS.accent];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ====== HEADER DÉGRADÉ ====== */}
            <LinearGradient
              colors={getHeaderColors()}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation?.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.headerIcon}>
                <Ionicons
                  name={type === "depense" ? "arrow-down-circle" : "arrow-up-circle"}
                  size={48}
                  color="#FFF"
                />
              </View>

              <Text style={styles.headerTitle}>
                {type === "depense" ? "Nouvelle dépense" : "Nouveau revenu"}
              </Text>
              
              <Text style={styles.headerSubtitle}>
                {type === "depense" 
                  ? "Suivez vos dépenses pour mieux gérer votre budget" 
                  : "Enregistrez vos revenus pour suivre votre épargne"}
              </Text>
            </LinearGradient>

            {/* ====== SWITCH TYPE ====== */}
            <Animated.View style={[styles.typeSwitch, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <TouchableOpacity
                style={[styles.typeBtn, type === "depense" && styles.typeBtnActive]}
                onPress={() => setType("depense")}
              >
                <LinearGradient
                  colors={type === "depense" ? [COLORS.expense, "#C0392B"] : ["#F5F5F5", "#F5F5F5"]}
                  style={styles.typeGradient}
                >
                  <Ionicons name="arrow-down" size={20} color={type === "depense" ? "#FFF" : COLORS.textSecondary} />
                  <Text style={[styles.typeText, type === "depense" && styles.typeTextActive]}>
                    Dépense
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.typeBtn, type === "revenu" && styles.typeBtnActive]}
                onPress={() => setType("revenu")}
              >
                <LinearGradient
                  colors={type === "revenu" ? [COLORS.income, COLORS.accent] : ["#F5F5F5", "#F5F5F5"]}
                  style={styles.typeGradient}
                >
                  <Ionicons name="arrow-up" size={20} color={type === "revenu" ? "#FFF" : COLORS.textSecondary} />
                  <Text style={[styles.typeText, type === "revenu" && styles.typeTextActive]}>
                    Revenu
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* ====== FORMULAIRE ====== */}
            <View style={styles.formContainer}>
              
              {/* MONTANT */}
              <View style={styles.card}>
                <Text style={styles.label}>Montant *</Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currency}>FCFA</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textLight}
                    value={montant}
                    onChangeText={formatMontant}
                  />
                </View>
                {montant && (
                  <Text style={styles.amountPreview}>
                    = {montant} Francs CFA
                  </Text>
                )}
              </View>

              {/* CATÉGORIE */}
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={styles.cardRowLeft}>
                  <View style={[
                    styles.categoryIcon, 
                    { backgroundColor: currentCategory ? currentCategory.color + "20" : "#F5F5F5" }
                  ]}>
                    <Ionicons 
                      name={currentCategory ? currentCategory.icon : "grid"} 
                      size={24} 
                      color={currentCategory ? currentCategory.color : COLORS.textLight} 
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>Catégorie *</Text>
                    <Text style={[
                      styles.value, 
                      !currentCategory && styles.placeholder
                    ]}>
                      {currentCategory ? currentCategory.label : "Sélectionner une catégorie"}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* SOUS-CATÉGORIE (Optionnel) */}
              {type === "revenu" && (
                <View style={styles.card}>
                  <Text style={styles.label}>Source précise (optionnel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Client ABC, Projet X..."
                    value={sousCategorie}
                    onChangeText={setSousCategorie}
                  />
                </View>
              )}

              {/* DATE & MODE PAIEMENT */}
              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.card, styles.flex]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.label}>Date</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar" size={20} color={COLORS.primary} />
                    <Text style={styles.value}>
                      {date.toLocaleDateString("fr-FR", { 
                        day: "numeric", 
                        month: "short",
                        year: "numeric"
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.card, styles.flex]}
                  onPress={() => setShowPaymentModal(true)}
                >
                  <Text style={styles.label}>Paiement</Text>
                  <View style={styles.paymentRow}>
                    <Ionicons 
                      name={
                        modePaiement === "especes" ? "cash" : 
                        modePaiement === "carte" ? "card" : 
                        modePaiement === "mobile" ? "phone-portrait" : "swap-horizontal"
                      } 
                      size={20} 
                      color={COLORS.primary} 
                    />
                    <Text style={styles.value}>
                      {modePaiement === "especes" ? "Espèces" :
                       modePaiement === "carte" ? "Carte" :
                       modePaiement === "mobile" ? "Mobile Money" : "Transfert"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* RÉCURRENT */}
              <TouchableOpacity 
                style={styles.cardRow}
                onPress={() => setShowRecurrentModal(true)}
              >
                <View style={styles.cardRowLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: isRecurrent ? COLORS.primary + "20" : "#F5F5F5" }]}>
                    <Ionicons 
                      name={isRecurrent ? "repeat" : "repeat-outline"} 
                      size={24} 
                      color={isRecurrent ? COLORS.primary : COLORS.textLight} 
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>Transaction récurrente</Text>
                    <Text style={[styles.value, !isRecurrent && styles.placeholder]}>
                      {isRecurrent 
                        ? `Oui, ${frequenceRecurrence === "journalier" ? "tous les jours" : 
                           frequenceRecurrence === "hebdo" ? "chaque semaine" : "chaque mois"}`
                        : "Non, transaction unique"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isRecurrent}
                  onValueChange={setIsRecurrent}
                  trackColor={{ false: "#E0E0E0", true: COLORS.primary }}
                  thumbColor={isRecurrent ? COLORS.secondary : "#FFF"}
                />
              </TouchableOpacity>

              {/* DESCRIPTION */}
              <View style={styles.card}>
                <Text style={styles.label}>Description (optionnel)</Text>
                <TextInput
                  style={styles.textarea}
                  placeholder={type === "depense" 
                    ? "Ex: Courses hebdomadaires, Essence voiture..." 
                    : "Ex: Salaire Octobre 2024, Paiement client..."
                  }
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* RÉCAPITULATIF */}
              {montant && categorie && (
                <LinearGradient
                  colors={type === "depense" ? [COLORS.expense + "15", "#FFF"] : [COLORS.income + "15", "#FFF"]}
                  style={styles.summaryCard}
                >
                  <Text style={styles.summaryTitle}>Récapitulatif</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Type</Text>
                    <View style={[styles.badge, { backgroundColor: type === "depense" ? COLORS.expense : COLORS.income }]}>
                      <Text style={styles.badgeText}>{type === "depense" ? "DÉPENSE" : "REVENU"}</Text>
                    </View>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Montant</Text>
                    <Text style={[styles.summaryValue, { color: type === "depense" ? COLORS.expense : COLORS.income }]}>
                      {type === "depense" ? "-" : "+"}{montant} FCFA
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Catégorie</Text>
                    <Text style={styles.summaryValue}>{currentCategory?.label}</Text>
                  </View>
                </LinearGradient>
              )}

              {/* CONSEILS */}
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb" size={20} color={COLORS.warning} />
                  <Text style={styles.tipsTitle}>Conseil WisePocket</Text>
                </View>
                <Text style={styles.tipText}>
                  {type === "depense" 
                    ? "💡 Catégorisez bien vos dépenses pour avoir des statistiques précises. Une bonne gestion commence par un bon suivi !"
                    : "💡 Identifiez la source de vos revenus pour mieux comprendre votre situation financière et optimiser votre épargne."
                  }
                </Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* BOUTON ENREGISTRER */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!montant || !categorie) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!montant || !categorie || isSubmitting}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={getHeaderColors()}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <Text style={styles.submitText}>Enregistrement...</Text>
                ) : (
                  <>
                    <Ionicons 
                      name={type === "depense" ? "remove-circle" : "add-circle"} 
                      size={24} 
                      color="#FFF" 
                    />
                    <Text style={styles.submitText}>
                      ENREGISTRER {type === "depense" ? "LA DÉPENSE" : "LE REVENU"}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* MODAL CATÉGORIES */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {currentCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItem,
                    categorie === cat.id && styles.categoryItemActive
                  ]}
                  onPress={() => {
                    setCategorie(cat.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={[styles.categoryItemIcon, { backgroundColor: cat.color + "20" }]}>
                    <Ionicons name={cat.icon} size={24} color={cat.color} />
                  </View>
                  <Text style={[
                    styles.categoryItemText,
                    categorie === cat.id && styles.categoryItemTextActive
                  ]}>
                    {cat.label}
                  </Text>
                  {categorie === cat.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL MODE PAIEMENT */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mode de paiement</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {[
              { id: "especes", label: "Espèces", icon: "cash" },
              { id: "carte", label: "Carte bancaire", icon: "card" },
              { id: "mobile", label: "Mobile Money", icon: "phone-portrait" },
              { id: "virement", label: "Virement bancaire", icon: "swap-horizontal" },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.paymentItem,
                  modePaiement === mode.id && styles.paymentItemActive
                ]}
                onPress={() => {
                  setModePaiement(mode.id);
                  setShowPaymentModal(false);
                }}
              >
                <Ionicons name={mode.icon} size={24} color={modePaiement === mode.id ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[
                  styles.paymentItemText,
                  modePaiement === mode.id && styles.paymentItemTextActive
                ]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* MODAL FRÉQUENCE RÉCURRENCE */}
      <Modal
        visible={showRecurrentModal && isRecurrent}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Fréquence de récurrence</Text>
            {[
              { id: "journalier", label: "Tous les jours" },
              { id: "hebdo", label: "Chaque semaine" },
              { id: "mensuel", label: "Chaque mois" },
            ].map((freq) => (
              <TouchableOpacity
                key={freq.id}
                style={[
                  styles.freqItem,
                  frequenceRecurrence === freq.id && styles.freqItemActive
                ]}
                onPress={() => {
                  setFrequenceRecurrence(freq.id);
                  setShowRecurrentModal(false);
                }}
              >
                <Text style={[
                  styles.freqItemText,
                  frequenceRecurrence === freq.id && styles.freqItemTextActive
                ]}>
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // HEADER
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    alignItems: "center",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 5,
  },

  // SWITCH TYPE
  typeSwitch: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -25,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  typeBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  typeBtnActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  typeTextActive: {
    color: "#FFF",
  },

  // FORMULAIRE
  formContainer: {
    padding: 20,
    marginTop: 10,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  placeholder: {
    color: COLORS.textLight,
  },

  // MONTANT
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  currency: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
    marginRight: 12,
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    padding: 0,
  },
  amountPreview: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 8,
  },

  // ICÔNES
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  // ROW LAYOUT
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },

  // DATE & PAIEMENT
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },

  // INPUTS
  input: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 8,
    padding: 0,
  },
  textarea: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 8,
    minHeight: 80,
    lineHeight: 22,
  },

  // RÉCAPITULATIF
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },

  // CONSEILS
  tipsCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F57C00",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#E65100",
    lineHeight: 20,
  },

  // FOOTER & BOUTON
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },

  // CATÉGORIES MODAL
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary + "10",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  categoryItemTextActive: {
    fontWeight: "600",
    color: COLORS.primary,
  },

  // PAIEMENT MODAL
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  paymentItemActive: {
    backgroundColor: COLORS.primary + "10",
  },
  paymentItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  paymentItemTextActive: {
    fontWeight: "600",
    color: COLORS.primary,
  },

  // FRÉQUENCE MODAL
  freqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
  },
  freqItemActive: {
    backgroundColor: COLORS.primary,
  },
  freqItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  freqItemTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
});

export default TransactionScreen;