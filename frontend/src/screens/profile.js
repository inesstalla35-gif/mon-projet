import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, Platform, Image, Animated, Switch, Modal, ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";
import { getProfile, updateProfile, deleteProfile } from "../actions/profileActions";

const C = {
  primary:'#0D7377', primaryMid:'#14919B', primaryLight:'#E6F7F7', accent:'#14FFEC',
  dark:'#111827',    dark2:'#1F2937',       gray:'#6B7280',          grayLight:'#9CA3AF',
  border:'#E5E7EB',  borderLight:'#F3F4F6', bg:'#F8FFFE',            card:'#FFFFFF',
  income:'#0D7377',  incomeLight:'#E6F7F7', expense:'#EF4444',       expenseLight:'#FEF2F2',
  warning:'#F59E0B', warningLight:'#FFFBEB',purple:'#8B5CF6',        purpleLight:'#EDE9FE',
  pink:'#EC407A',    teal:'#14919B',        blue:'#4FC3F7',
};

const REVENUE_OPTS = [
  { key:"salaire_fixe",   label:"Salaire fixe",  icon:"briefcase",    desc:"Revenu mensuel régulier",  color:C.primary },
  { key:"freelance",      label:"Freelance",      icon:"laptop-outline",desc:"Missions & projets",      color:C.purple  },
  { key:"mixte",          label:"Mixte",          icon:"bar-chart",    desc:"Salaire + commissions",    color:C.warning },
  { key:"passifs",        label:"Revenus passifs",icon:"home-outline", desc:"Loyers, dividendes",       color:C.teal    },
  { key:"business",       label:"Business",       icon:"storefront",   desc:"Activité propre",          color:"#FF7043" },
  { key:"autres",         label:"Autres",         icon:"cash-outline", desc:"Aides, remboursements",    color:C.gray    },
];

const FREQ_OPTS = [
  { key:"quotidienne",  label:"Quotidien",  icon:"sunny-outline"     },
  { key:"hebdomadaire", label:"Hebdo",      icon:"calendar-outline"  },
  { key:"mensuelle",    label:"Mensuel",    icon:"calendar"          },
  { key:"variable",     label:"Variable",   icon:"shuffle"           },
];

const PRIORITY_OPTS = [
  { key:"loisirs",   label:"Loisirs",       icon:"game-controller",  desc:"Sorties, divertissements", color:C.pink    },
  { key:"etudes",    label:"Études",        icon:"school",           desc:"Formation, matériel",       color:C.purple  },
  { key:"business",  label:"Business",      icon:"rocket",           desc:"Projets professionnels",    color:C.warning },
  { key:"projet",    label:"Projet perso",  icon:"flag",             desc:"Voyage, équipement",        color:C.blue    },
  { key:"epargne",   label:"Sécurité",      icon:"shield-checkmark", desc:"Fond d'urgence",            color:C.primary },
  { key:"sante",     label:"Santé",         icon:"medical",          desc:"Soins, médicaments",        color:"#EF5350" },
  { key:"famille",   label:"Famille",       icon:"people",           desc:"Charges familiales",        color:"#FF7043" },
];

const MONNAIES = ["FCFA (XAF)","FCFA (XOF)","EUR (€)","USD ($)"];
const LANGUES  = ["Français","English","Portugais"];

const getInitials = (nom = '', prenom = '') => {
  const p = (prenom?.[0] || '').toUpperCase();
  const n = (nom?.[0]    || '').toUpperCase();
  return (p + n) || '?';
};

const getFullName = (user) => {
  if (!user) return 'Utilisateur';
  if (user.prenom && user.nom) return `${user.prenom} ${user.nom}`;
  if (user.name)               return user.name;
  if (user.nom)                return user.nom;
  return 'Utilisateur';
};

// ─── Section accordéon ────────────────────────────────────────────────────────
const Section = ({ id, icon, color, title, badge, activeSection, setActiveSection, children }) => {
  const isOpen = activeSection === id;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rot, { toValue:isOpen?1:0, duration:200, useNativeDriver:true }).start();
  }, [isOpen]);

  const rotDeg = rot.interpolate({ inputRange:[0,1], outputRange:['0deg','180deg'] });

  return (
    <View style={styles.sectionWrap}>
      <TouchableOpacity style={styles.sectionHead}
        onPress={()=>setActiveSection(isOpen?null:id)} activeOpacity={0.8}>
        <View style={[styles.sectionHeadIcon,{backgroundColor:color+'18'}]}>
          <Ionicons name={icon} size={20} color={color}/>
        </View>
        <Text style={styles.sectionHeadTxt}>{title}</Text>
        {badge!=null && badge>0 && (
          <View style={[styles.sectionBadge,{backgroundColor:color}]}>
            <Text style={styles.sectionBadgeTxt}>{badge}</Text>
          </View>
        )}
        <Animated.View style={{transform:[{rotate:rotDeg}],marginLeft:4}}>
          <Ionicons name="chevron-down" size={18} color={C.grayLight}/>
        </Animated.View>
      </TouchableOpacity>
      {isOpen && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

const Field = ({ label, icon, iconColor, children, optional }) => (
  <View style={styles.field}>
    <View style={styles.fieldLabel}>
      {icon && <Ionicons name={icon} size={13} color={iconColor||C.grayLight} style={{marginRight:5}}/>}
      <Text style={styles.lbl}>{label}</Text>
      {optional && <Text style={styles.optional}> · optionnel</Text>}
    </View>
    {children}
  </View>
);

// ═════════════════════════════════════════════════════════════════════════════
const ProfileScreen = () => {
  const dispatch   = useDispatch();
  const { user }   = useSelector((state) => state.auth);
  const profile    = useSelector((state) => state.profile.profile);
  const isLoading  = useSelector((state) => state.profile.isLoading);
  const reduxError = useSelector((state) => state.profile.error);

  // ── Identité ──────────────────────────────────────────────────────────────
  const [avatar, setAvatar]         = useState(null);
  const [nom, setNom]               = useState("");
  const [prenom, setPrenom]         = useState("");
  const [telephone, setTelephone]   = useState("");
  const [email, setEmail]           = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio]               = useState("");
  const [dateNaissance, setDOB]     = useState(new Date(1995, 0, 1));
  const [showDate, setShowDate]     = useState(false);
  const [ville, setVille]           = useState("");

  // ── Finances ──────────────────────────────────────────────────────────────
  const [revenusSelected, setRevSel]    = useState([]);
  const [prioritesSelected, setPrioSel] = useState([]);

  // ── Préférences ───────────────────────────────────────────────────────────
  const [monnaie, setMonnaie]           = useState("FCFA (XAF)");
  const [langue, setLangue]             = useState("Français");
  const [showMonnaieModal, setShowMonnaie] = useState(false);
  const [showLangueModal, setShowLangue]   = useState(false);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifGlobal,    setNotifGlobal]  = useState(true);
  const [notifBudget,    setNotifBudget]  = useState(true);
  const [notifObjectifs, setNotifObj]     = useState(true);
  const [notifConseils,  setNotifCons]    = useState(false);
  const [notifRapports,  setNotifRap]     = useState(true);

  // ── Sécurité ──────────────────────────────────────────────────────────────
  const [biometrie,  setBiometrie]  = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [autoLock,   setAutoLock]   = useState("5min");

  // ── UI ────────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState("identite");
  const fade = useRef(new Animated.Value(0)).current;

  // ── Chargement du profil au montage ───────────────────────────────────────
  useEffect(() => {
    dispatch(getProfile());
    Animated.timing(fade, { toValue:1, duration:600, useNativeDriver:true }).start();
  }, []);

  // ── Hydratation des états locaux quand Redux reçoit le profil ─────────────
  useEffect(() => {
    if (!profile) return;

    setNom(profile.nom || "");
    setPrenom(profile.prenom || "");
    setEmail(profile.email || "");
    setTelephone(profile.telephone || "");
    setProfession(profile.profession || "");
    setBio(profile.bio || "");
    setVille(profile.ville || "");
    setAvatar(profile.avatar || null);
    if (profile.dateNaissance) setDOB(new Date(profile.dateNaissance));

    if (Array.isArray(profile.revenus))   setRevSel(profile.revenus.map(r => ({
      ...r, montant: String(r.montant || ""), pctEpargne: String(r.pctEpargne ?? "10")
    })));
    if (Array.isArray(profile.priorites)) setPrioSel(profile.priorites.map(p => ({
      ...p, montant: String(p.montant || "")
    })));

    setMonnaie(profile.monnaie || "FCFA (XAF)");
    setLangue(profile.langue || "Français");

    if (profile.notifications) {
      setNotifGlobal(profile.notifications.global    ?? true);
      setNotifBudget(profile.notifications.budget    ?? true);
      setNotifObj(profile.notifications.objectifs    ?? true);
      setNotifCons(profile.notifications.conseils    ?? false);
      setNotifRap(profile.notifications.rapports     ?? true);
    }

    if (profile.securite) {
      setBiometrie(profile.securite.biometrie  ?? false);
      setPinEnabled(profile.securite.pinEnabled ?? false);
      setAutoLock(profile.securite.autoLock     || "5min");
    }
  }, [profile]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const initials  = getInitials(nom, prenom);
  const fullName  = getFullName({ nom, prenom });
  const avatarUrl = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D7377&color=fff&size=256`;

  const totalRev = revenusSelected.reduce((s,r) => s + (parseFloat(r.montant)||0), 0);
  const epargPot = revenusSelected.reduce((s,r) => s + ((parseFloat(r.montant)||0)*(parseFloat(r.pctEpargne)||10)/100), 0);

  const profileCompleteness = [
    prenom, nom, telephone, profession,
    revenusSelected.length>0, prioritesSelected.length>0
  ].filter(Boolean).length;
  const completePct = Math.round((profileCompleteness / 6) * 100);

  // ── Avatar picker ─────────────────────────────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission requise','Accès galerie nécessaire.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect:[1,1], quality:0.85
    });
    if (!res.canceled) setAvatar(res.assets[0].uri);
  };

  // ── Revenus helpers ───────────────────────────────────────────────────────
  const toggleRevenu = (opt) => {
    const exists = revenusSelected.find(r => r.key === opt.key);
    if (exists) setRevSel(revenusSelected.filter(r => r.key !== opt.key));
    else setRevSel([...revenusSelected, { key:opt.key, label:opt.label, montant:"", frequency:"mensuelle", pctEpargne:"10" }]);
  };
  const updRev = (key, field, val) => setRevSel(revenusSelected.map(r => r.key===key ? {...r,[field]:val} : r));

  // ── Priorités helpers ────────────────────────────────────────────────────
  const togglePrio = (opt) => {
    const exists = prioritesSelected.find(p => p.key === opt.key);
    if (exists) setPrioSel(prioritesSelected.filter(p => p.key !== opt.key));
    else setPrioSel([...prioritesSelected, { key:opt.key, label:opt.label, montant:"", urgent:false }]);
  };
  const updPrio = (key, field, val) => setPrioSel(prioritesSelected.map(p => p.key===key ? {...p,[field]:val} : p));

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!prenom || !nom || !profession) {
      Alert.alert("Champs requis", "Prénom, nom et profession sont obligatoires.");
      return;
    }

    // Prépare le payload complet à envoyer au backend
    const profileData = {
      // Identité
      nom,
      prenom,
      email,
      telephone,
      profession,
      bio,
      dateNaissance: dateNaissance.toISOString(),
      ville,
      avatar: avatar || "",
      // Finances — on convertit les montants en nombres
      revenus: revenusSelected.map(r => ({
        key:        r.key,
        label:      r.label,
        montant:    parseFloat(r.montant)    || 0,
        pctEpargne: parseFloat(r.pctEpargne) || 10,
        frequency:  r.frequency || "mensuelle",
      })),
      priorites: prioritesSelected.map(p => ({
        key:     p.key,
        label:   p.label,
        montant: parseFloat(p.montant) || 0,
        urgent:  p.urgent || false,
      })),
      // Préférences
      monnaie,
      langue,
      // Notifications
      notifications: {
        global:    notifGlobal,
        budget:    notifBudget,
        objectifs: notifObjectifs,
        conseils:  notifConseils,
        rapports:  notifRapports,
      },
      // Sécurité
      securite: {
        biometrie,
        pinEnabled,
        autoLock,
      },
    };

    const result = await dispatch(updateProfile(profileData));

    if (result?.success) {
      Alert.alert("✅ Profil enregistré !", "Toutes vos informations ont été sauvegardées avec succès.");
    } else {
      Alert.alert("Erreur", result?.error || "Une erreur est survenue lors de la sauvegarde.");
    }
  };

  // ── Suppression du profil ─────────────────────────────────────────────────
  const handleDeleteProfile = () => {
    Alert.alert(
      "Supprimer le profil",
      "Êtes-vous sûr de vouloir supprimer définitivement votre profil et tout votre historique ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            const result = await dispatch(deleteProfile());
            if (result?.success) {
              Alert.alert("Profil supprimé", "Votre profil a été supprimé avec succès.");
            } else {
              Alert.alert("Erreur", result?.error || "Impossible de supprimer le profil.");
            }
          },
        },
      ]
    );
  };

  // ── Picker modal réutilisable ─────────────────────────────────────────────
  const PickerModal = ({ visible, onClose, title, options, selected, onSelect }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle}/>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={C.gray}/></TouchableOpacity>
          </View>
          <ScrollView>
            {options.map(opt => (
              <TouchableOpacity key={opt} style={[styles.modalItem, selected===opt&&styles.modalItemActive]}
                onPress={() => { onSelect(opt); onClose(); }}>
                <Text style={[styles.modalItemTxt, selected===opt&&{color:C.primary,fontWeight:'700'}]}>{opt}</Text>
                {selected===opt && <Ionicons name="checkmark-circle" size={20} color={C.primary}/>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ═════════════════════════════════════════════════════════════════════════
  return (
    <View style={styles.container}>

      {/* ──────────── HERO HEADER ──────────── */}
      <LinearGradient colors={[C.dark2, C.dark]} style={styles.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco1}/><View style={styles.heroDeco2}/>

        <View style={styles.completionBar}>
          <View style={{flex:1}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
              <Text style={{fontSize:12,color:'rgba(255,255,255,0.65)',fontWeight:'600'}}>Profil complété</Text>
              <Text style={{fontSize:12,color:C.accent,fontWeight:'800'}}>{completePct}%</Text>
            </View>
            <View style={styles.completionBg}>
              <LinearGradient colors={[C.primary,C.accent]} style={[styles.completionFill,{width:completePct+'%'}]} start={{x:0,y:0}} end={{x:1,y:0}}/>
            </View>
          </View>
        </View>

        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap} activeOpacity={0.85}>
            <Image source={{uri: avatarUrl}} style={styles.avatar}/>
            <View style={styles.avatarEditBtn}>
              <Ionicons name="camera" size={13} color="#FFF"/>
            </View>
          </TouchableOpacity>
          <View style={{flex:1,marginLeft:16}}>
            <Text style={styles.heroName}>{fullName}</Text>
            <Text style={styles.heroProfession}>{profession||"Profession non renseignée"}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:5,marginTop:6}}>
              <View style={styles.heroPlan}>
                <Ionicons name="star" size={10} color={C.accent}/>
                <Text style={{fontSize:11,fontWeight:'700',color:C.accent}}>Gratuit</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroStats}>
          {[
            {icon:'trending-up', label:'Épargne/mois', val:epargPot>0?Math.round(epargPot).toLocaleString('fr-FR')+' F':'—', color:C.accent},
            {icon:'wallet',      label:'Revenus',       val:totalRev>0?totalRev.toLocaleString('fr-FR')+' F':'—',              color:'rgba(255,255,255,0.9)'},
          ].map((s,i) => (
            <React.Fragment key={i}>
              {i>0 && <View style={{width:1,backgroundColor:'rgba(255,255,255,0.12)',marginVertical:4}}/>}
              <View style={{flex:1,alignItems:'center',gap:3}}>
                <Ionicons name={s.icon} size={14} color={s.color}/>
                <Text style={{fontSize:13,fontWeight:'800',color:s.color}}>{s.val}</Text>
                <Text style={{fontSize:10,color:'rgba(255,255,255,0.5)'}}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* ──────────── SCROLL CONTENT ──────────── */}
      <Animated.ScrollView style={{opacity:fade}} contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* Indicateur de chargement Redux */}
        {isLoading && (
          <View style={styles.loadingBanner}>
            <ActivityIndicator size="small" color={C.primary}/>
            <Text style={{marginLeft:8,fontSize:13,color:C.primary,fontWeight:'600'}}>Chargement...</Text>
          </View>
        )}

        {/* Bannière d'erreur Redux */}
        {reduxError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={C.expense}/>
            <Text style={{marginLeft:8,fontSize:13,color:C.expense,flex:1}}>{reduxError}</Text>
          </View>
        )}

        {/* ══ IDENTITÉ ══ */}
        <Section id="identite" icon="person" color={C.primary} title="Informations personnelles"
          badge={null} activeSection={activeSection} setActiveSection={setActiveSection}>

          <View style={{flexDirection:'row',gap:10}}>
            <View style={{flex:1}}>
              <Field label="Prénom *" icon="person-outline">
                <TextInput style={styles.input} value={prenom} onChangeText={setPrenom}
                  placeholder="Jean" placeholderTextColor={C.grayLight}/>
              </Field>
            </View>
            <View style={{flex:1}}>
              <Field label="Nom *" icon="person-outline">
                <TextInput style={styles.input} value={nom} onChangeText={setNom}
                  placeholder="Dupont" placeholderTextColor={C.grayLight}/>
              </Field>
            </View>
          </View>

          <Field label="Email" icon="mail-outline" optional>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="jean@email.com" keyboardType="email-address" autoCapitalize="none"
              placeholderTextColor={C.grayLight}/>
          </Field>

          <Field label="Téléphone" icon="call-outline" optional>
            <TextInput style={styles.input} value={telephone} onChangeText={setTelephone}
              placeholder="+237 6XX XXX XXX" keyboardType="phone-pad"
              placeholderTextColor={C.grayLight}/>
          </Field>

          <View style={{flexDirection:'row',gap:10}}>
            <View style={{flex:1}}>
              <Field label="Date de naissance">
                <TouchableOpacity style={styles.selectBtn} onPress={()=>setShowDate(true)}>
                  <Ionicons name="calendar-outline" size={16} color={C.primary}/>
                  <Text style={styles.selectBtnTxt}>
                    {dateNaissance.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}
                  </Text>
                </TouchableOpacity>
              </Field>
            </View>
            <View style={{flex:1}}>
              <Field label="Ville" icon="map-outline" optional>
                <TextInput style={styles.input} value={ville} onChangeText={setVille}
                  placeholder="Yaoundé, Douala..." placeholderTextColor={C.grayLight}/>
              </Field>
            </View>
          </View>

          <Field label="Profession *" icon="briefcase-outline">
            <TextInput style={styles.input} value={profession} onChangeText={setProfession}
              placeholder="Développeur" placeholderTextColor={C.grayLight}/>
          </Field>

          <Field label="Bio" icon="chatbubble-outline" optional>
            <TextInput style={[styles.input,{height:80,textAlignVertical:'top',paddingTop:12}]}
              value={bio} onChangeText={setBio} multiline numberOfLines={3}
              placeholder="Partagez vos ambitions financières..."
              placeholderTextColor={C.grayLight}/>
          </Field>
        </Section>

        {/* ══ SOURCES DE REVENUS ══ */}
        <Section id="revenus" icon="wallet" color={C.warning} title="Sources de revenus"
          badge={revenusSelected.length||null} activeSection={activeSection} setActiveSection={setActiveSection}>

          <Text style={styles.sectionDesc}>Sélectionnez et détaillez vos sources de revenus pour des analyses précises.</Text>

          <View style={{gap:8,marginBottom:12}}>
            {REVENUE_OPTS.map(opt=>{
              const sel  = revenusSelected.some(r=>r.key===opt.key);
              const data = revenusSelected.find(r=>r.key===opt.key);
              return (
                <View key={opt.key} style={[styles.revCard, sel&&{borderColor:opt.color,borderWidth:2}]}>
                  <TouchableOpacity style={styles.revCardHead} onPress={()=>toggleRevenu(opt)} activeOpacity={0.8}>
                    <View style={[styles.revIcon,{backgroundColor:opt.color+'18'}]}>
                      <Ionicons name={opt.icon} size={20} color={opt.color}/>
                    </View>
                    <View style={{flex:1,marginLeft:12}}>
                      <Text style={[styles.revLbl, sel&&{color:opt.color}]}>{opt.label}</Text>
                      <Text style={styles.revDesc2}>{opt.desc}</Text>
                    </View>
                    <View style={[styles.checkbox, sel&&{backgroundColor:opt.color,borderColor:opt.color}]}>
                      {sel&&<Ionicons name="checkmark" size={14} color="#FFF"/>}
                    </View>
                  </TouchableOpacity>

                  {sel&&data&&(
                    <View style={styles.revDetail}>
                      <View style={{flexDirection:'row',gap:10,marginBottom:10}}>
                        <View style={{flex:2}}>
                          <Text style={styles.lbl}>Montant estimé (F)</Text>
                          <TextInput style={styles.input} value={data.montant}
                            onChangeText={v=>updRev(opt.key,'montant',v.replace(/[^0-9]/g,''))}
                            keyboardType="numeric" placeholder="0" placeholderTextColor={C.grayLight}/>
                        </View>
                        <View style={{flex:1}}>
                          <Text style={styles.lbl}>% Épargne</Text>
                          <View style={styles.pctInputWrap}>
                            <TextInput style={[styles.input,{paddingRight:24,textAlign:'center'}]}
                              value={data.pctEpargne}
                              onChangeText={v=>updRev(opt.key,'pctEpargne',v.replace(/[^0-9]/g,''))}
                              keyboardType="numeric" placeholder="10" placeholderTextColor={C.grayLight}/>
                            <Text style={styles.pctSign}>%</Text>
                          </View>
                        </View>
                      </View>
                      {parseFloat(data.montant)>0 && parseFloat(data.pctEpargne)>0 && (
                        <View style={[styles.revCalcChip,{backgroundColor:opt.color+'12'}]}>
                          <Ionicons name="arrow-up-circle" size={14} color={opt.color}/>
                          <Text style={{fontSize:12,color:opt.color,fontWeight:'600'}}>
                            Épargne : {Math.round(parseFloat(data.montant)*parseFloat(data.pctEpargne)/100).toLocaleString('fr-FR')} F / période
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.lbl,{marginTop:10}]}>Fréquence de réception</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:6}}>
                        {FREQ_OPTS.map(f=>(
                          <TouchableOpacity key={f.key} onPress={()=>updRev(opt.key,'frequency',f.key)}
                            style={[styles.freqChip, data.frequency===f.key&&{backgroundColor:opt.color,borderColor:opt.color}]}>
                            <Ionicons name={f.icon} size={12} color={data.frequency===f.key?'#FFF':opt.color}/>
                            <Text style={[styles.freqChipTxt, data.frequency===f.key&&{color:'#FFF'}]}>{f.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {revenusSelected.length>0 && (
            <LinearGradient colors={[C.dark,C.dark2]} style={styles.revSummary} start={{x:0,y:0}} end={{x:1,y:0}}>
              <View style={styles.revSummaryDeco}/>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                <Text style={{color:'rgba(255,255,255,0.65)',fontSize:13}}>Total mensuel estimé</Text>
                <Text style={{color:'#FFF',fontWeight:'800',fontSize:14}}>{totalRev.toLocaleString('fr-FR')} F</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <Text style={{color:'rgba(255,255,255,0.65)',fontSize:13}}>Épargne potentielle</Text>
                <Text style={{color:C.accent,fontWeight:'900',fontSize:16}}>{Math.round(epargPot).toLocaleString('fr-FR')} F</Text>
              </View>
              {totalRev>0 && (
                <View style={{marginTop:10}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
                    <Text style={{fontSize:11,color:'rgba(255,255,255,0.45)'}}>Taux d'épargne global</Text>
                    <Text style={{fontSize:11,color:C.accent,fontWeight:'700'}}>{Math.round(epargPot/totalRev*100)}%</Text>
                  </View>
                  <View style={{height:4,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}>
                    <View style={{width:`${Math.round(epargPot/totalRev*100)}%`,height:'100%',backgroundColor:C.accent,borderRadius:2}}/>
                  </View>
                </View>
              )}
            </LinearGradient>
          )}
        </Section>

        {/* ══ PRIORITÉS BUDGÉTAIRES ══ */}
        <Section id="priorites" icon="star" color={C.pink} title="Priorités budgétaires"
          badge={prioritesSelected.length||null} activeSection={activeSection} setActiveSection={setActiveSection}>

          <Text style={styles.sectionDesc}>Définissez vos postes de dépenses prioritaires pour un suivi budgétaire adapté.</Text>

          <View style={{gap:8,marginBottom:12}}>
            {PRIORITY_OPTS.map(opt=>{
              const sel  = prioritesSelected.some(p=>p.key===opt.key);
              const data = prioritesSelected.find(p=>p.key===opt.key);
              return (
                <View key={opt.key} style={[styles.revCard, sel&&{borderColor:opt.color,borderWidth:2}]}>
                  <TouchableOpacity style={styles.revCardHead} onPress={()=>togglePrio(opt)} activeOpacity={0.8}>
                    <View style={[styles.revIcon,{backgroundColor:opt.color+'18'}]}>
                      <Ionicons name={opt.icon} size={20} color={opt.color}/>
                    </View>
                    <View style={{flex:1,marginLeft:12}}>
                      <Text style={[styles.revLbl, sel&&{color:opt.color}]}>{opt.label}</Text>
                      <Text style={styles.revDesc2}>{opt.desc}</Text>
                    </View>
                    <View style={[styles.checkbox, sel&&{backgroundColor:opt.color,borderColor:opt.color}]}>
                      {sel&&<Ionicons name="checkmark" size={14} color="#FFF"/>}
                    </View>
                  </TouchableOpacity>
                  {sel&&data&&(
                    <View style={styles.revDetail}>
                      <View style={{flexDirection:'row',gap:10,alignItems:'flex-end'}}>
                        <View style={{flex:1}}>
                          <Text style={styles.lbl}>Budget mensuel (F)</Text>
                          <TextInput style={styles.input} value={data.montant}
                            onChangeText={v=>updPrio(opt.key,'montant',v.replace(/[^0-9]/g,''))}
                            keyboardType="numeric" placeholder="0" placeholderTextColor={C.grayLight}/>
                        </View>
                        <TouchableOpacity onPress={()=>updPrio(opt.key,'urgent',!data.urgent)}
                          style={[styles.urgentBtn, data.urgent&&{backgroundColor:C.expenseLight,borderColor:C.expense}]}>
                          <Ionicons name={data.urgent?"alert-circle":"alert-circle-outline"} size={18}
                            color={data.urgent?C.expense:C.grayLight}/>
                          <Text style={[styles.urgentTxt, data.urgent&&{color:C.expense,fontWeight:'700'}]}>Urgent</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Section>

        {/* ══ NOTIFICATIONS ══ */}
        <Section id="notifs" icon="notifications" color="#4FC3F7" title="Notifications"
          badge={null} activeSection={activeSection} setActiveSection={setActiveSection}>

          <View style={[styles.toggleRow, {borderBottomWidth:1,borderBottomColor:C.borderLight,paddingBottom:14,marginBottom:10}]}>
            <View style={[styles.toggleIcon,{backgroundColor:'#E0F7FA'}]}>
              <Ionicons name="notifications" size={18} color="#0097A7"/>
            </View>
            <View style={{flex:1,marginLeft:12}}>
              <Text style={styles.toggleLbl}>Activer les notifications</Text>
              <Text style={styles.toggleDesc}>Maître principal des alertes</Text>
            </View>
            <Switch value={notifGlobal} onValueChange={setNotifGlobal}
              trackColor={{false:C.border,true:C.primary+'80'}} thumbColor={notifGlobal?C.primary:'#FFF'}/>
          </View>

          {[
            {val:notifBudget,    set:setNotifBudget, icon:'wallet-outline',        bg:'#E6F7F7',     color:C.primary, lbl:'Alertes budget',        desc:'Dépassements de budget'},
            {val:notifObjectifs, set:setNotifObj,    icon:'flag-outline',           bg:C.purpleLight, color:C.purple,  lbl:'Objectifs',             desc:'Progression & échéances'},
            {val:notifConseils,  set:setNotifCons,   icon:'bulb-outline',           bg:'#FFFBEB',     color:C.warning, lbl:'Conseils personnalisés', desc:"Tips d'épargne & optimisation"},
            {val:notifRapports,  set:setNotifRap,    icon:'document-text-outline',  bg:'#F3E5F5',     color:C.purple,  lbl:'Rapports mensuels',     desc:'Bilan financier mensuel'},
          ].map((n,i)=>(
            <View key={i} style={[styles.toggleRow, i<3&&{borderBottomWidth:1,borderBottomColor:C.borderLight,paddingBottom:12,marginBottom:12}]}>
              <View style={[styles.toggleIcon,{backgroundColor:n.bg}]}>
                <Ionicons name={n.icon} size={18} color={n.color}/>
              </View>
              <View style={{flex:1,marginLeft:12}}>
                <Text style={[styles.toggleLbl,!notifGlobal&&{color:C.grayLight}]}>{n.lbl}</Text>
                <Text style={styles.toggleDesc}>{n.desc}</Text>
              </View>
              <Switch value={notifGlobal&&n.val} onValueChange={notifGlobal?n.set:undefined}
                trackColor={{false:C.border,true:n.color+'80'}} thumbColor={notifGlobal&&n.val?n.color:'#FFF'}
                disabled={!notifGlobal}/>
            </View>
          ))}
        </Section>

        {/* ══ PRÉFÉRENCES ══ */}
        <Section id="prefs" icon="settings" color={C.teal} title="Préférences de l'application"
          badge={null} activeSection={activeSection} setActiveSection={setActiveSection}>

          <Field label="Devise" icon="cash-outline">
            <TouchableOpacity style={styles.selectBtn} onPress={()=>setShowMonnaie(true)}>
              <Ionicons name="cash-outline" size={16} color={C.primary}/>
              <Text style={styles.selectBtnTxt}>{monnaie}</Text>
              <Ionicons name="chevron-down" size={14} color={C.grayLight}/>
            </TouchableOpacity>
          </Field>

          <Field label="Langue de l'interface" icon="language-outline">
            <TouchableOpacity style={styles.selectBtn} onPress={()=>setShowLangue(true)}>
              <Ionicons name="language-outline" size={16} color={C.primary}/>
              <Text style={styles.selectBtnTxt}>{langue}</Text>
              <Ionicons name="chevron-down" size={14} color={C.grayLight}/>
            </TouchableOpacity>
          </Field>

          <View style={styles.prefNote}>
            <Ionicons name="information-circle" size={16} color={C.primary}/>
            <Text style={{fontSize:12,color:C.primary,flex:1,lineHeight:18,marginLeft:8}}>
              Les préférences de devise affecteront l'affichage dans toute l'application.
            </Text>
          </View>
        </Section>

        {/* ══ SÉCURITÉ ══ */}
        <Section id="securite" icon="shield-checkmark" color={C.expense} title="Sécurité & Confidentialité"
          badge={null} activeSection={activeSection} setActiveSection={setActiveSection}>

          {[
            {val:biometrie,  set:setBiometrie,  icon:'finger-print', bg:'#FEF2F2',  color:C.expense, lbl:'Authentification biométrique', desc:'Empreinte digitale ou Face ID'},
            {val:pinEnabled, set:setPinEnabled, icon:'keypad',        bg:'#FFF3E0',  color:C.warning, lbl:'Code PIN',                     desc:"Protéger l'accès par un code 4 chiffres"},
          ].map((s,i)=>(
            <View key={i} style={[styles.toggleRow, i===0&&{borderBottomWidth:1,borderBottomColor:C.borderLight,paddingBottom:14,marginBottom:14}]}>
              <View style={[styles.toggleIcon,{backgroundColor:s.bg}]}>
                <Ionicons name={s.icon} size={18} color={s.color}/>
              </View>
              <View style={{flex:1,marginLeft:12}}>
                <Text style={styles.toggleLbl}>{s.lbl}</Text>
                <Text style={styles.toggleDesc}>{s.desc}</Text>
              </View>
              <Switch value={s.val} onValueChange={s.set}
                trackColor={{false:C.border,true:s.color+'80'}} thumbColor={s.val?s.color:'#FFF'}/>
            </View>
          ))}

          <Field label="Verrouillage automatique" icon="lock-closed-outline">
            <View style={{flexDirection:'row',gap:8,marginTop:4}}>
              {['1min','5min','15min','Jamais'].map(t=>(
                <TouchableOpacity key={t} onPress={()=>setAutoLock(t)}
                  style={[styles.lockChip, autoLock===t&&{backgroundColor:C.expense,borderColor:C.expense}]}>
                  <Text style={[styles.lockChipTxt, autoLock===t&&{color:'#FFF',fontWeight:'700'}]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          {/* Bouton suppression — appelle maintenant handleDeleteProfile */}
          <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteProfile}>
            <Ionicons name="trash-outline" size={18} color={C.expense}/>
            <View style={{flex:1,marginLeft:10}}>
              <Text style={{fontSize:14,fontWeight:'700',color:C.expense}}>Supprimer mes données</Text>
              <Text style={{fontSize:12,color:C.grayLight}}>Effacer définitivement le profil et l'historique</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.grayLight}/>
          </TouchableOpacity>
        </Section>

        {/* ══ BOUTON SAUVEGARDER ══ */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85} disabled={isLoading}>
          <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.saveGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
            {isLoading
              ? <ActivityIndicator size="small" color="#FFF"/>
              : <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF"/>
                  <Text style={styles.saveTxt}>Sauvegarder le profil</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        <Text style={{textAlign:'center',fontSize:12,color:C.grayLight,marginBottom:36,marginTop:4}}>
          🔒 WisePocket · Vos données sont chiffrées et sécurisées
        </Text>
      </Animated.ScrollView>

      {/* ── Date Picker ── */}
      {showDate && (
        <DateTimePicker value={dateNaissance} mode="date"
          display={Platform.OS==='ios'?'spinner':'default'} maximumDate={new Date()}
          onChange={(e,d)=>{ setShowDate(false); if(d) setDOB(d); }}/>
      )}

      {/* ── Modaux picker ── */}
      <PickerModal visible={showMonnaieModal} onClose={()=>setShowMonnaie(false)} title="Devise"
        options={MONNAIES} selected={monnaie} onSelect={setMonnaie}/>
      <PickerModal visible={showLangueModal} onClose={()=>setShowLangue(false)} title="Langue"
        options={LANGUES} selected={langue} onSelect={setLangue}/>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },

  // HERO
  hero: { paddingTop:50, paddingHorizontal:20, paddingBottom:0, overflow:'hidden' },
  heroDeco1: { position:'absolute', width:240, height:240, borderRadius:120, backgroundColor:'rgba(20,255,236,0.04)', top:-100, right:-80 },
  heroDeco2: { position:'absolute', width:140, height:140, borderRadius:70, backgroundColor:'rgba(255,255,255,0.02)', bottom:-40, left:-30 },
  completionBar: { marginBottom:18 },
  completionBg: { height:6, backgroundColor:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' },
  completionFill: { height:'100%', borderRadius:3 },
  avatarRow: { flexDirection:'row', alignItems:'center', marginBottom:20 },
  avatarWrap: { position:'relative' },
  avatar: { width:80, height:80, borderRadius:24, borderWidth:3, borderColor:'rgba(255,255,255,0.3)' },
  avatarEditBtn: { position:'absolute', bottom:-2, right:-2, backgroundColor:C.primary, width:26, height:26, borderRadius:9, justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'#FFF' },
  heroName: { fontSize:20, fontWeight:'900', color:'#FFF', marginBottom:3 },
  heroProfession: { fontSize:13, color:'rgba(255,255,255,0.65)', marginBottom:6 },
  heroPlan: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(20,255,236,0.12)', borderRadius:8, paddingHorizontal:8, paddingVertical:3, borderWidth:1, borderColor:'rgba(20,255,236,0.25)' },
  heroStats: { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.08)', borderRadius:16, paddingVertical:12, marginBottom:-1 },

  // SCROLL
  scroll: { padding:16, paddingTop:18 },

  // LOADING / ERROR BANNERS
  loadingBanner: { flexDirection:'row', alignItems:'center', backgroundColor:C.primaryLight, borderRadius:12, padding:12, marginBottom:10 },
  errorBanner:   { flexDirection:'row', alignItems:'center', backgroundColor:C.expenseLight, borderRadius:12, padding:12, marginBottom:10 },

  // SECTION
  sectionWrap: { backgroundColor:C.card, borderRadius:20, marginBottom:10, overflow:'hidden', shadowColor:'#0D7377', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:10, elevation:2 },
  sectionHead: { flexDirection:'row', alignItems:'center', padding:16, gap:10 },
  sectionHeadIcon: { width:42, height:42, borderRadius:13, justifyContent:'center', alignItems:'center' },
  sectionHeadTxt: { flex:1, fontSize:16, fontWeight:'700', color:C.dark },
  sectionBadge: { width:20, height:20, borderRadius:10, justifyContent:'center', alignItems:'center', marginRight:4 },
  sectionBadgeTxt: { fontSize:11, fontWeight:'800', color:'#FFF' },
  sectionBody: { paddingHorizontal:16, paddingBottom:16 },
  sectionDesc: { fontSize:13, color:C.gray, lineHeight:19, marginBottom:14, borderLeftWidth:3, borderLeftColor:C.borderLight, paddingLeft:10 },

  // FIELDS
  field: { marginBottom:12 },
  fieldLabel: { flexDirection:'row', alignItems:'center', marginBottom:6 },
  lbl: { fontSize:11, fontWeight:'700', color:C.grayLight, textTransform:'uppercase', letterSpacing:0.5 },
  optional: { fontSize:10, color:C.grayLight, fontStyle:'italic' },
  input: { borderWidth:1.5, borderColor:C.border, borderRadius:12, paddingHorizontal:14, paddingVertical:11, fontSize:14, color:C.dark, backgroundColor:C.bg },
  selectBtn: { flexDirection:'row', alignItems:'center', gap:8, borderWidth:1.5, borderColor:C.border, borderRadius:12, paddingHorizontal:14, paddingVertical:11, backgroundColor:C.bg },
  selectBtnTxt: { flex:1, fontSize:14, color:C.dark, fontWeight:'600' },

  // REV CARDS
  revCard: { backgroundColor:C.bg, borderRadius:16, borderWidth:1.5, borderColor:C.border, overflow:'hidden' },
  revCardHead: { flexDirection:'row', alignItems:'center', padding:14 },
  revIcon: { width:44, height:44, borderRadius:13, justifyContent:'center', alignItems:'center' },
  revLbl: { fontSize:14, fontWeight:'700', color:C.dark },
  revDesc2: { fontSize:12, color:C.grayLight, marginTop:2 },
  checkbox: { width:24, height:24, borderRadius:12, borderWidth:2, borderColor:C.border, justifyContent:'center', alignItems:'center' },
  revDetail: { backgroundColor:C.borderLight, padding:14 },
  pctInputWrap: { position:'relative' },
  pctSign: { position:'absolute', right:12, top:12, fontSize:14, color:C.grayLight, fontWeight:'700' },
  revCalcChip: { flexDirection:'row', alignItems:'center', gap:6, borderRadius:10, padding:8, marginBottom:8 },
  freqChip: { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:7, borderRadius:20, borderWidth:1.5, borderColor:C.primary, marginRight:8, backgroundColor:C.card },
  freqChipTxt: { fontSize:12, fontWeight:'600', color:C.primary },

  // REV SUMMARY
  revSummary: { borderRadius:16, padding:16, overflow:'hidden' },
  revSummaryDeco: { position:'absolute', width:120, height:120, borderRadius:60, backgroundColor:'rgba(20,255,236,0.05)', top:-40, right:-30 },

  // URGENT
  urgentBtn: { flexDirection:'row', alignItems:'center', gap:5, borderWidth:1.5, borderColor:C.border, borderRadius:12, paddingHorizontal:12, paddingVertical:11, backgroundColor:C.card },
  urgentTxt: { fontSize:12, fontWeight:'600', color:C.grayLight },

  // TOGGLES
  toggleRow: { flexDirection:'row', alignItems:'center' },
  toggleIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },
  toggleLbl: { fontSize:14, fontWeight:'700', color:C.dark },
  toggleDesc: { fontSize:12, color:C.grayLight, marginTop:1 },

  // PREF
  prefNote: { flexDirection:'row', alignItems:'flex-start', backgroundColor:C.primaryLight, borderRadius:12, padding:12, marginTop:4 },

  // SECURITY
  lockChip: { paddingHorizontal:12, paddingVertical:8, borderRadius:10, borderWidth:1.5, borderColor:C.border, backgroundColor:C.bg },
  lockChipTxt: { fontSize:12, fontWeight:'600', color:C.gray },
  dangerBtn: { flexDirection:'row', alignItems:'center', marginTop:14, borderWidth:1.5, borderColor:'#FECACA', borderRadius:14, padding:14, backgroundColor:'#FFF5F5' },

  // SAVE
  saveBtn: { borderRadius:16, overflow:'hidden', marginTop:6, marginBottom:14, shadowColor:C.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:10, elevation:5 },
  saveGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:17 },
  saveTxt: { fontSize:16, fontWeight:'800', color:'#FFF' },

  // MODAL
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalSheet: { backgroundColor:C.card, borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:Platform.OS==='ios'?40:20, maxHeight:'60%' },
  modalHandle: { width:40, height:4, borderRadius:2, backgroundColor:C.border, alignSelf:'center', marginBottom:16 },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  modalTitle: { fontSize:19, fontWeight:'800', color:C.dark },
  modalItem: { flexDirection:'row', alignItems:'center', padding:14, borderRadius:12, marginBottom:6, backgroundColor:C.bg },
  modalItemActive: { backgroundColor:C.primaryLight, borderWidth:1.5, borderColor:C.primary },
  modalItemTxt: { flex:1, fontSize:15, color:C.dark, fontWeight:'500' },
});

export default ProfileScreen;