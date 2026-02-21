import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
  Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import API from "../services/api";

/* ================= OPTIONS ================= */

const revenueOptions = [
  { 
    key: "salaire_fixe", 
    label: "Salaire fixe",
    icon: "briefcase",
    desc: "Revenu régulier tous les mois"
  },
  { 
    key: "freelance", 
    label: "Freelance",
    icon: "laptop-code",
    desc: "Revenus basés sur missions/projets"
  },
  { 
    key: "revenus_mixtes", 
    label: "Revenus mixtes",
    icon: "chart-line",
    desc: "Salaire fixe + commissions/bonus"
  },
  { 
    key: "revenus_passifs", 
    label: "Revenus passifs",
    icon: "building",
    desc: "Loyers, dividendes, intérêts"
  },
  { 
    key: "autres", 
    label: "Autres revenus",
    icon: "ellipsis-h",
    desc: "Jobs occasionnels, ventes, aides"
  },
];

const frequencyOptions = [
  { key: "quotidienne", label: "Quotidienne", icon: "calendar-day" },
  { key: "hebdomadaire", label: "Hebdomadaire", icon: "calendar-week" },
  { key: "mensuelle", label: "Mensuelle", icon: "calendar-alt" },
  { key: "variable", label: "Variable", icon: "random" },
];

const priorityOptions = [
  { 
    key: "loisirs", 
    label: "Loisirs & Sorties",
    icon: "glass-cheers",
    desc: "Restaurants, cinéma, divertissements"
  },
  { 
    key: "etudes", 
    label: "Études & Formation",
    icon: "graduation-cap",
    desc: "Cours, matériel, frais scolaires"
  },
  { 
    key: "fondation", 
    label: "Fondation d'entreprise",
    icon: "rocket",
    desc: "Investir dans un projet pro"
  },
  { 
    key: "projet", 
    label: "Projet personnel",
    icon: "bullseye",
    desc: "Voyage, équipement, maison"
  },
  { 
    key: "epargne", 
    label: "Épargne de sécurité",
    icon: "shield-alt",
    desc: "Fond d'urgence et imprévus"
  },
];

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Wise+Pocket&background=0D7377&color=fff&size=256";

/* ================= SCREEN ================= */

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  // États existants
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [dateNaissance, setDateNaissance] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profession, setProfession] = useState("");
  const [revenusSelected, setRevenusSelected] = useState([]);
  const [prioritesSelected, setPrioritesSelected] = useState([]);

  // NOUVEAUX CHAMPS ajoutés
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [bio, setBio] = useState("");
  const [objectifEpargne, setObjectifEpargne] = useState("");
  const [dejaEpargne, setDejaEpargne] = useState("");
  const [niveauRisque, setNiveauRisque] = useState("modere"); // faible, modere, eleve
  const [notificationActive, setNotificationActive] = useState(true);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const res = await API.get("/api/profile/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.profile) {
          const p = res.data.profile;
          setProfileExists(true);
          setAvatar(p.avatar || DEFAULT_AVATAR);
          setDateNaissance(new Date(p.date_naissance));
          setProfession(p.profession || "");
          setRevenusSelected(p.revenus || []);
          setPrioritesSelected(p.priorites || []);
          
          // Nouveaux champs
          setNom(p.nom || "");
          setPrenom(p.prenom || "");
          setTelephone(p.telephone || "");
          setBio(p.bio || "");
          setObjectifEpargne(p.objectif_epargne?.toString() || "");
          setDejaEpargne(p.deja_epargne?.toString() || "");
          setNiveauRisque(p.niveau_risque || "modere");
          setNotificationActive(p.notifications !== false);
        }
      } catch (e) {
        console.log("Profil non existant");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* ================= PHOTO UPLOAD ================= */

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à la galerie.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  /* ================= REVENUS ================= */

  const toggleRevenue = (opt) => {
    const exists = revenusSelected.find((r) => r.key === opt.key);
    if (exists) {
      setRevenusSelected(revenusSelected.filter((r) => r.key !== opt.key));
    } else {
      setRevenusSelected([
        ...revenusSelected,
        { 
          key: opt.key, 
          label: opt.label, 
          montant: "", 
          frequency: "",
          pourcentageEpargne: "10" // Par défaut 10% d'épargne sur ce revenu
        },
      ]);
    }
  };

  const updateRevenue = (key, field, value) => {
    setRevenusSelected(
      revenusSelected.map((r) =>
        r.key === key ? { ...r, [field]: value } : r
      )
    );
  };

  /* ================= PRIORITÉS ================= */

  const togglePriority = (opt) => {
    const exists = prioritesSelected.find((p) => p.key === opt.key);
    if (exists) {
      setPrioritesSelected(prioritesSelected.filter((p) => p.key !== opt.key));
    } else {
      setPrioritesSelected([
        ...prioritesSelected,
        { 
          key: opt.key, 
          label: opt.label, 
          montant: "",
          urgent: false
        },
      ]);
    }
  };

  const updatePriority = (key, field, value) => {
    setPrioritesSelected(
      prioritesSelected.map((p) =>
        p.key === key ? { ...p, [field]: value } : p
      )
    );
  };

  /* ================= CALCULS ================= */

  const calculateTotalRevenus = () => {
    return revenusSelected.reduce((total, r) => {
      const montant = parseFloat(r.montant) || 0;
      return total + montant;
    }, 0);
  };

  const calculateEpargnePotentielle = () => {
    return revenusSelected.reduce((total, r) => {
      const montant = parseFloat(r.montant) || 0;
      const pourcentage = parseFloat(r.pourcentageEpargne) || 10;
      return total + (montant * pourcentage / 100);
    }, 0);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!prenom || !nom || !profession) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (revenusSelected.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins un type de revenu.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const payload = {
        avatar,
        nom,
        prenom,
        telephone,
        bio,
        date_naissance: dateNaissance.toISOString(),
        profession,
        objectif_epargne: Number(objectifEpargne) || 0,
        deja_epargne: Number(dejaEpargne) || 0,
        niveau_risque: niveauRisque,
        notifications: notificationActive,
        revenus: revenusSelected.map((r) => ({
          ...r,
          montant: Number(r.montant),
          pourcentageEpargne: Number(r.pourcentageEpargne) || 10
        })),
        priorites: prioritesSelected.map((p) => ({
          ...p,
          montant: Number(p.montant || 0),
        })),
      };

      await API.post("/api/profile/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert(
        "Succès",
        profileExists ? "Profil mis à jour avec succès !" : "Profil créé avec succès !"
      );
      setProfileExists(true);
    } catch (e) {
      Alert.alert("Erreur", "Impossible d'enregistrer le profil. Vérifiez votre connexion.");
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={{ uri: DEFAULT_AVATAR }} 
          style={[styles.loadingLogo, { opacity: 0.3 }]} 
        />
        <Text style={styles.loadingText}>Chargement de votre profil...</Text>
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.safeArea}>
      {/* Header flottant */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
        <Text style={styles.floatingHeaderText}>Mon Profil</Text>
      </Animated.View>

      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête avec gradient */}
        <View style={styles.header}>
          <LinearGradient
            colors={["#0D7377", "#14FFEC"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Profil WisePocket</Text>
              <Text style={styles.headerSubtitle}>Gérez votre épargne intelligemment</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={24} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Appuyez pour changer la photo</Text>
        </View>

        {/* Informations Personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#0D7377" />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Jean"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={nom}
                onChangeText={setNom}
                placeholder="Dupont"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={telephone}
              onChangeText={setTelephone}
              placeholder="+237 6XX XXX XXX"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date de naissance</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#0D7377" />
                <Text style={styles.dateText}>
                  {dateNaissance.toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Profession *</Text>
              <TextInput
                style={styles.input}
                value={profession}
                onChangeText={setProfession}
                placeholder="Développeur"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Parlez-nous de vos objectifs financiers..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Objectifs d'épargne */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="savings" size={24} color="#0D7377" />
            <Text style={styles.sectionTitle}>Objectifs d'épargne</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Objectif total (FCFA)</Text>
              <TextInput
                style={styles.input}
                value={objectifEpargne}
                onChangeText={setObjectifEpargne}
                placeholder="1 000 000"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Déjà épargné (FCFA)</Text>
              <TextInput
                style={styles.input}
                value={dejaEpargne}
                onChangeText={setDejaEpargne}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Barre de progression visuelle */}
          {objectifEpargne && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min((parseFloat(dejaEpargne) || 0) / (parseFloat(objectifEpargne) || 1) * 100, 100)}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((parseFloat(dejaEpargne) || 0) / (parseFloat(objectifEpargne) || 1) * 100)}% atteint
              </Text>
            </View>
          )}

          <Text style={styles.label}>Tolérance au risque</Text>
          <View style={styles.riskContainer}>
            {['faible', 'modere', 'eleve'].map((risque) => (
              <TouchableOpacity
                key={risque}
                style={[
                  styles.riskBtn,
                  niveauRisque === risque && styles.riskBtnActive
                ]}
                onPress={() => setNiveauRisque(risque)}
              >
                <View style={[
                  styles.riskIndicator,
                  { 
                    backgroundColor: 
                      risque === 'faible' ? '#4CAF50' : 
                      risque === 'modere' ? '#FF9800' : '#F44336'
                  }
                ]} />
                <Text style={[
                  styles.riskText,
                  niveauRisque === risque && styles.riskTextActive
                ]}>
                  {risque === 'faible' ? 'Faible' : 
                   risque === 'modere' ? 'Modéré' : 'Élevé'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Revenus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#0D7377" />
            <Text style={styles.sectionTitle}>Sources de revenus</Text>
            <Text style={styles.sectionSubtitle}>Sélectionnez vos types de revenus</Text>
          </View>

          <View style={styles.optionsGrid}>
            {revenueOptions.map((opt) => {
              const selected = revenusSelected.some((r) => r.key === opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionCard,
                    selected && styles.optionCardSelected
                  ]}
                  onPress={() => toggleRevenue(opt)}
                >
                  <FontAwesome5 
                    name={opt.icon} 
                    size={20} 
                    color={selected ? '#FFF' : '#0D7377'} 
                  />
                  <Text style={[
                    styles.optionCardText,
                    selected && styles.optionCardTextSelected
                  ]}>
                    {opt.label}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={20} color="#14FFEC" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Détails des revenus sélectionnés */}
          {revenusSelected.map((rev) => (
            <View key={rev.key} style={styles.revenueDetailCard}>
              <View style={styles.revenueDetailHeader}>
                <Text style={styles.revenueDetailTitle}>{rev.label}</Text>
                <TouchableOpacity onPress={() => toggleRevenue(rev)}>
                  <Ionicons name="close-circle" size={24} color="#999" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                  <Text style={styles.label}>Montant (FCFA)</Text>
                  <TextInput
                    style={styles.input}
                    value={rev.montant}
                    onChangeText={(v) => updateRevenue(rev.key, "montant", v)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                  <Text style={styles.label}>% Épargne</Text>
                  <TextInput
                    style={styles.input}
                    value={rev.pourcentageEpargne}
                    onChangeText={(v) => updateRevenue(rev.key, "pourcentageEpargne", v)}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <Text style={styles.label}>Fréquence</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {frequencyOptions.map((freq) => (
                  <TouchableOpacity
                    key={freq.key}
                    style={[
                      styles.freqChip,
                      rev.frequency === freq.key && styles.freqChipActive
                    ]}
                    onPress={() => updateRevenue(rev.key, "frequency", freq.key)}
                  >
                    <FontAwesome5 
                      name={freq.icon} 
                      size={12} 
                      color={rev.frequency === freq.key ? '#FFF' : '#0D7377'} 
                      style={{ marginRight: 5 }}
                    />
                    <Text style={[
                      styles.freqChipText,
                      rev.frequency === freq.key && styles.freqChipTextActive
                    ]}>
                      {freq.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}

          {/* Résumé des revenus */}
          {revenusSelected.length > 0 && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total mensuel estimé:</Text>
                <Text style={styles.summaryValue}>
                  {calculateTotalRevenus().toLocaleString()} FCFA
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Épargne potentielle:</Text>
                <Text style={[styles.summaryValue, { color: '#0D7377' }]}>
                  {calculateEpargnePotentielle().toLocaleString()} FCFA
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Priorités */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="stars" size={24} color="#0D7377" />
            <Text style={styles.sectionTitle}>Priorités budgétaires</Text>
            <Text style={styles.sectionSubtitle}>Quelles sont vos priorités ?</Text>
          </View>

          <View style={styles.priorityList}>
            {priorityOptions.map((opt) => {
              const selected = prioritesSelected.some((p) => p.key === opt.key);
              const data = prioritesSelected.find((p) => p.key === opt.key);

              return (
                <View key={opt.key}>
                  <TouchableOpacity
                    style={[
                      styles.priorityItem,
                      selected && styles.priorityItemSelected
                    ]}
                    onPress={() => togglePriority(opt)}
                  >
                    <View style={styles.priorityIconContainer}>
                      <FontAwesome5 
                        name={opt.icon} 
                        size={18} 
                        color={selected ? '#FFF' : '#0D7377'} 
                      />
                    </View>
                    <View style={styles.priorityContent}>
                      <Text style={[
                        styles.priorityTitle,
                        selected && styles.priorityTitleSelected
                      ]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.priorityDesc}>{opt.desc}</Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      selected && styles.checkboxActive
                    ]}>
                      {selected && <Ionicons name="checkmark" size={16} color="#FFF" />}
                    </View>
                  </TouchableOpacity>

                  {selected && (
                    <View style={styles.priorityDetail}>
                      <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                          <Text style={styles.label}>Budget mensuel (FCFA)</Text>
                          <TextInput
                            style={styles.input}
                            value={data.montant}
                            onChangeText={(v) => updatePriority(opt.key, "montant", v)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#999"
                          />
                        </View>
                        <View style={{ marginLeft: 15, justifyContent: 'center' }}>
                          <TouchableOpacity 
                            style={[
                              styles.urgentToggle,
                              data.urgent && styles.urgentToggleActive
                            ]}
                            onPress={() => updatePriority(opt.key, "urgent", !data.urgent)}
                          >
                            <Ionicons 
                              name={data.urgent ? "notifications" : "notifications-outline"} 
                              size={20} 
                              color={data.urgent ? '#F44336' : '#999'} 
                            />
                            <Text style={[
                              styles.urgentText,
                              data.urgent && styles.urgentTextActive
                            ]}>
                              Urgent
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.notificationRow}>
            <View style={styles.notificationContent}>
              <MaterialIcons name="notifications-active" size={24} color="#0D7377" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.notificationTitle}>Notifications</Text>
                <Text style={styles.notificationDesc}>Alertes et rappels d'épargne</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[
                styles.toggle,
                notificationActive && styles.toggleActive
              ]}
              onPress={() => setNotificationActive(!notificationActive)}
            >
              <View style={[
                styles.toggleCircle,
                notificationActive && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bouton Submit */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#0D7377", "#14FFEC"]}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.submitButtonText}>
              {profileExists ? "Mettre à jour le profil" : "Créer mon profil"}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 10 }} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Espace en bas */}
        <View style={{ height: 40 }} />
      </Animated.ScrollView>

      {/* DatePicker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={dateNaissance}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) setDateNaissance(d);
          }}
        />
      )}
    </View>
  );
};

export default ProfileScreen;

/* ================= STYLES ================= */

import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  loadingLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  loadingText: {
    marginTop: 20,
    color: "#0D7377",
    fontSize: 16,
    fontWeight: "600",
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
  },
  scrollContent: {
    backgroundColor: "#FFF",
  },
  header: {
    height: 200,
  },
  headerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: -50,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(13,115,119,0.8)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changePhotoText: {
    marginTop: 10,
    color: "#0D7377",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginLeft: 34,
    marginTop: -10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 15,
  },
  halfWidth: {
    width: "48%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: "#212121",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  dateText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#212121",
  },
  progressContainer: {
    marginVertical: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D7377',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#0D7377',
    fontWeight: '700',
  },
  riskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  riskBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  riskBtnActive: {
    borderColor: "#0D7377",
    backgroundColor: "rgba(13,115,119,0.1)",
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  riskText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  riskTextActive: {
    color: "#0D7377",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  optionCardSelected: {
    backgroundColor: "#0D7377",
    borderColor: "#0D7377",
  },
  optionCardText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#212121",
  },
  optionCardTextSelected: {
    color: "#FFF",
  },
  revenueDetailCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#0D7377",
  },
  revenueDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  revenueDetailTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  freqChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0D7377",
    marginRight: 8,
    backgroundColor: "#FFF",
  },
  freqChipActive: {
    backgroundColor: "#0D7377",
    borderColor: "#0D7377",
  },
  freqChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D7377",
  },
  freqChipTextActive: {
    color: "#FFF",
  },
  summaryCard: {
    backgroundColor: "#0D7377",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  priorityList: {
    marginTop: 10,
  },
  priorityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  priorityItemSelected: {
    backgroundColor: "#0D7377",
    borderColor: "#0D7377",
  },
  priorityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(13,115,119,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  priorityContent: {
    flex: 1,
  },
  priorityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 2,
  },
  priorityTitleSelected: {
    color: "#FFF",
  },
  priorityDesc: {
    fontSize: 12,
    color: "#666",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#0D7377",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#14FFEC",
    borderColor: "#14FFEC",
  },
  priorityDetail: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
    marginTop: -5,
    marginBottom: 15,
    marginLeft: 5,
    marginRight: 5,
  },
  urgentToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  urgentToggleActive: {
    backgroundColor: "#FFEBEE",
  },
  urgentText: {
    marginLeft: 5,
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  urgentTextActive: {
    color: "#F44336",
  },
  notificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
  },
  notificationDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#0D7377",
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#0D7377",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});