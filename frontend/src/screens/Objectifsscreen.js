import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { getObjectives, deleteObjective, updateObjective } from "../actions/objectiveActions";

const C = {
  primary:'#0D7377', primaryMid:'#14919B', primaryLight:'#E6F7F7', accent:'#14FFEC',
  dark:'#111827',    dark2:'#1F2937',       gray:'#6B7280',          grayLight:'#9CA3AF',
  border:'#E5E7EB',  borderLight:'#F3F4F6', bg:'#F8FFFE',            card:'#FFFFFF',
  expense:'#EF4444', expenseLight:'#FEF2F2',warning:'#F59E0B',
  purple:'#8B5CF6',  pink:'#EC407A',
};

const CATEGORIES = {
  voyage:   { label:"Voyage",   icon:"airplane",            color:"#4FC3F7" },
  etudes:   { label:"Études",   icon:"school",              color:"#AB47BC" },
  famille:  { label:"Famille",  icon:"people",              color:"#FF7043" },
  materiel: { label:"Matériel", icon:"phone-portrait",      color:"#66BB6A" },
  business: { label:"Business", icon:"briefcase",           color:"#FFA726" },
  sante:    { label:"Santé",    icon:"medical",             color:"#EF5350" },
  logement: { label:"Logement", icon:"home",                color:"#5C6BC0" },
  urgence:  { label:"Urgence",  icon:"warning",             color:"#EC407A" },
  autre:    { label:"Autre",    icon:"ellipsis-horizontal", color:"#78909C" },
};

const FREQ_LABELS = {
  daily:"/ jour", weekly:"/ semaine", monthly:"/ mois",
};

const PRIORITY_COLORS = {
  low:"#10B981", normal:C.warning, high:C.expense,
};

const fmtCFA = (n) => (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";

const getDaysLeft = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
};

// ── Carte objectif ─────────────────────────────────────────────────────────
const ObjectiveCard = ({ objective, onEdit, onDelete, onAddFunds }) => {
  const cat      = CATEGORIES[objective.categorie] || CATEGORIES.autre;
  const pct      = Math.min(100, Math.round(((objective.montant_actuel||0) / objective.montant_cible) * 100));
  const daysLeft = getDaysLeft(objective.date_limite);
  const isTermine= objective.status === "terminé" || pct >= 100;
  const priColor = PRIORITY_COLORS[objective.priorite] || C.warning;

  return (
    <View style={[styles.objCard, isTermine && {opacity:0.75}]}>
      {/* Header carte */}
      <View style={styles.objCardHead}>
        <View style={[styles.objCatIcon, {backgroundColor: cat.color + "20"}]}>
          <Ionicons name={cat.icon} size={22} color={cat.color}/>
        </View>
        <View style={{flex:1, marginLeft:12}}>
          <Text style={styles.objTitle} numberOfLines={1}>{objective.titre}</Text>
          <View style={{flexDirection:'row', alignItems:'center', gap:6, marginTop:3}}>
            <Text style={{fontSize:11, color:C.grayLight}}>{cat.label}</Text>
            <View style={[styles.prioBadge, {backgroundColor: priColor + '18', borderColor: priColor}]}>
              <Text style={{fontSize:10, color:priColor, fontWeight:'700'}}>
                {objective.priorite === 'high' ? 'Haute' : objective.priorite === 'low' ? 'Basse' : 'Normale'}
              </Text>
            </View>
            {isTermine && (
              <View style={[styles.prioBadge, {backgroundColor:'#D1FAE5', borderColor:'#10B981'}]}>
                <Text style={{fontSize:10, color:'#10B981', fontWeight:'700'}}>✅ Terminé</Text>
              </View>
            )}
          </View>
        </View>
        {/* Actions */}
        <View style={{flexDirection:'row', gap:6}}>
          <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
            <Ionicons name="pencil" size={16} color={C.primary}/>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, {backgroundColor:C.expenseLight}]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={C.expense}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Montants */}
      <View style={styles.objAmounts}>
        <View>
          <Text style={styles.objAmtLabel}>Épargné</Text>
          <Text style={[styles.objAmtVal, {color:C.primary}]}>{fmtCFA(objective.montant_actuel)}</Text>
        </View>
        <View style={{alignItems:'center'}}>
          <Text style={styles.objAmtLabel}>Progression</Text>
          <Text style={[styles.objAmtVal, {color: pct>=100 ? '#10B981' : C.dark}]}>{pct}%</Text>
        </View>
        <View style={{alignItems:'flex-end'}}>
          <Text style={styles.objAmtLabel}>Objectif</Text>
          <Text style={styles.objAmtVal}>{fmtCFA(objective.montant_cible)}</Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, {
          width: pct + '%',
          backgroundColor: pct >= 100 ? '#10B981' : cat.color,
        }]}/>
      </View>

      {/* Footer */}
      <View style={styles.objFooter}>
        <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
          <Ionicons name="calendar-outline" size={13} color={daysLeft < 30 ? C.expense : C.grayLight}/>
          <Text style={{fontSize:12, color: daysLeft < 30 ? C.expense : C.grayLight, fontWeight:'600'}}>
            {daysLeft === 0 ? 'Échéance aujourd\'hui' : `${daysLeft} jour${daysLeft>1?'s':''} restant${daysLeft>1?'s':''}`}
          </Text>
        </View>
        <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
          <Ionicons name="refresh-outline" size={13} color={C.grayLight}/>
          <Text style={{fontSize:12, color:C.grayLight}}>
            {FREQ_LABELS[objective.frequence_epargne] || '/ mois'}
          </Text>
        </View>
      </View>

      {/* Bouton ajouter des fonds */}
      {!isTermine && (
        <TouchableOpacity style={styles.addFundsBtn} onPress={onAddFunds}>
          <Ionicons name="add-circle-outline" size={16} color={C.primary}/>
          <Text style={{fontSize:13, fontWeight:'700', color:C.primary}}>Ajouter des fonds</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const ObjectifsScreen = ({ navigation }) => {
  const dispatch    = useDispatch();
  const objectives  = useSelector((state) => state.objective.objectives);
  const isLoading   = useSelector((state) => state.objective.isLoading);
  const error       = useSelector((state) => state.objective.error);
  const fade        = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(getObjectives());
    Animated.timing(fade, { toValue:1, duration:500, useNativeDriver:true }).start();
  }, []);

  // ── Stats globales ────────────────────────────────────────────────────────
  const totalCible   = objectives.reduce((s,o) => s + (o.montant_cible   || 0), 0);
  const totalEpargne = objectives.reduce((s,o) => s + (o.montant_actuel  || 0), 0);
  const totalPct     = totalCible > 0 ? Math.round((totalEpargne / totalCible) * 100) : 0;
  const actifs       = objectives.filter(o => o.status === 'actif').length;

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = (obj) => {
    Alert.alert(
      "Supprimer l'objectif",
      `Voulez-vous supprimer "${obj.titre}" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer", style: "destructive",
          onPress: async () => {
            const result = await dispatch(deleteObjective(obj._id));
            if (!result?.success) {
              Alert.alert("Erreur", result?.error || "Impossible de supprimer.");
            }
          },
        },
      ]
    );
  };

  // ── Ajouter des fonds ────────────────────────────────────────────────────
  const handleAddFunds = (obj) => {
    Alert.prompt(
      "Ajouter des fonds",
      `Montant à ajouter à "${obj.titre}" (FCFA)`,
      async (value) => {
        const amount = parseFloat(value);
        if (!amount || amount <= 0) {
          Alert.alert("Montant invalide", "Entrez un montant positif.");
          return;
        }
        const newMontant = (obj.montant_actuel || 0) + amount;
        const result = await dispatch(updateObjective(obj._id, { montant_actuel: newMontant }));
        if (result?.success) {
          const pct = Math.round((newMontant / obj.montant_cible) * 100);
          if (pct >= 100) {
            Alert.alert("🎉 Félicitations !", `Vous avez atteint votre objectif "${obj.titre}" !`);
          } else {
            Alert.alert("✅ Fonds ajoutés", `${fmtCFA(amount)} ajoutés. Progression : ${pct}%`);
          }
        } else {
          Alert.alert("Erreur", result?.error || "Impossible d'ajouter les fonds.");
        }
      },
      "plain-text",
      "",
      "numeric"
    );
  };

  // ── Éditer ────────────────────────────────────────────────────────────────
  const handleEdit = (obj) => {
    // On passe l'objectif à éditer via navigate avec un 2e paramètre
    navigation?.navigate?.("newGoal", { objective: obj });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <LinearGradient colors={[C.dark2, C.dark]} style={styles.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco}/>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
            <Ionicons name="arrow-back" size={22} color="#FFF"/>
          </TouchableOpacity>
          <View style={{flex:1, alignItems:'center'}}>
            <Text style={styles.headerTitle}>Mes Objectifs</Text>
            <Text style={styles.headerSub}>{actifs} objectif{actifs>1?'s':''} actif{actifs>1?'s':''}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation?.navigate?.("newGoal")}>
            <Ionicons name="add" size={22} color="#FFF"/>
          </TouchableOpacity>
        </View>

        {/* Stats globales */}
        <View style={styles.statsRow}>
          {[
            { icon:'trending-up', label:'Total épargné',  val: fmtCFA(totalEpargne), color:C.accent },
            { icon:'flag',        label:'Objectif total', val: fmtCFA(totalCible),   color:'rgba(255,255,255,0.9)' },
            { icon:'pie-chart',   label:'Progression',    val: totalPct + '%',        color: totalPct >= 50 ? C.accent : C.warning },
          ].map((s,i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={{width:1, backgroundColor:'rgba(255,255,255,0.12)', marginVertical:4}}/>}
              <View style={{flex:1, alignItems:'center', gap:3}}>
                <Ionicons name={s.icon} size={14} color={s.color}/>
                <Text style={{fontSize:13, fontWeight:'800', color:s.color}}>{s.val}</Text>
                <Text style={{fontSize:10, color:'rgba(255,255,255,0.5)'}}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* CONTENU */}
      <Animated.ScrollView style={{opacity:fade}} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Erreur */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={C.expense}/>
            <Text style={{marginLeft:8, fontSize:13, color:C.expense, flex:1}}>{error}</Text>
          </View>
        )}

        {/* Loading */}
        {isLoading && (
          <View style={{alignItems:'center', paddingVertical:40}}>
            <ActivityIndicator size="large" color={C.primary}/>
            <Text style={{marginTop:12, fontSize:14, color:C.grayLight}}>Chargement...</Text>
          </View>
        )}

        {/* Liste vide */}
        {!isLoading && objectives.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="flag-outline" size={48} color={C.border}/>
            </View>
            <Text style={styles.emptyTitle}>Aucun objectif</Text>
            <Text style={styles.emptyDesc}>Créez votre premier objectif financier pour commencer à épargner.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation?.navigate?.("newGoal")}>
              <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.emptyBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                <Ionicons name="add-circle" size={20} color="#FFF"/>
                <Text style={{fontSize:15, fontWeight:'700', color:'#FFF'}}>Créer un objectif</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Cards objectifs */}
        {!isLoading && objectives.map(obj => (
          <ObjectiveCard
            key={obj._id}
            objective={obj}
            onEdit={() => handleEdit(obj)}
            onDelete={() => handleDelete(obj)}
            onAddFunds={() => handleAddFunds(obj)}
          />
        ))}

        {/* Bouton créer (si déjà des objectifs) */}
        {!isLoading && objectives.length > 0 && objectives.length < 5 && (
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation?.navigate?.("newGoal")} activeOpacity={0.85}>
            <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.createBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
              <Ionicons name="add-circle" size={22} color="#FFF"/>
              <Text style={{fontSize:15, fontWeight:'800', color:'#FFF'}}>Nouvel objectif</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Limite atteinte */}
        {!isLoading && objectives.filter(o => o.status==='actif').length >= 5 && (
          <View style={styles.limitBanner}>
            <Ionicons name="information-circle" size={18} color={C.warning}/>
            <Text style={{flex:1, marginLeft:8, fontSize:13, color:C.warning, fontWeight:'600'}}>
              Limite de 5 objectifs actifs atteinte. Terminez ou archivez un objectif pour en créer un nouveau.
            </Text>
          </View>
        )}

        <View style={{height:30}}/>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  header: { paddingTop:50, paddingBottom:16, paddingHorizontal:20, overflow:'hidden' },
  heroDeco: { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(20,255,236,0.04)', top:-80, right:-50 },
  headerRow: { flexDirection:'row', alignItems:'center', marginBottom:18 },
  backBtn: { width:38, height:38, borderRadius:12, backgroundColor:'rgba(255,255,255,0.15)', justifyContent:'center', alignItems:'center' },
  addBtn:  { width:38, height:38, borderRadius:12, backgroundColor:C.primary, justifyContent:'center', alignItems:'center' },
  headerTitle: { fontSize:20, fontWeight:'900', color:'#FFF' },
  headerSub: { fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:2 },
  statsRow: { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.08)', borderRadius:16, paddingVertical:12 },
  scroll: { padding:16 },
  errorBanner: { flexDirection:'row', alignItems:'center', backgroundColor:C.expenseLight, borderRadius:12, padding:12, marginBottom:12 },

  // CARD
  objCard: { backgroundColor:C.card, borderRadius:20, padding:16, marginBottom:12, shadowColor:'#0D7377', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:12, elevation:3 },
  objCardHead: { flexDirection:'row', alignItems:'center', marginBottom:14 },
  objCatIcon: { width:46, height:46, borderRadius:14, justifyContent:'center', alignItems:'center' },
  objTitle: { fontSize:15, fontWeight:'800', color:C.dark },
  prioBadge: { paddingHorizontal:7, paddingVertical:2, borderRadius:6, borderWidth:1 },
  iconBtn: { width:34, height:34, borderRadius:10, backgroundColor:C.primaryLight, justifyContent:'center', alignItems:'center' },
  objAmounts: { flexDirection:'row', justifyContent:'space-between', marginBottom:10 },
  objAmtLabel: { fontSize:11, color:C.grayLight, fontWeight:'600', marginBottom:3 },
  objAmtVal: { fontSize:14, fontWeight:'800', color:C.dark },
  progressBg: { height:8, backgroundColor:C.borderLight, borderRadius:4, overflow:'hidden', marginBottom:12 },
  progressFill: { height:'100%', borderRadius:4 },
  objFooter: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  addFundsBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor:C.primaryLight, borderRadius:12, paddingVertical:10, borderWidth:1.5, borderColor:C.primary },

  // EMPTY
  emptyState: { alignItems:'center', paddingVertical:60, paddingHorizontal:30 },
  emptyIcon: { width:100, height:100, borderRadius:30, backgroundColor:C.borderLight, justifyContent:'center', alignItems:'center', marginBottom:20 },
  emptyTitle: { fontSize:20, fontWeight:'800', color:C.dark, marginBottom:10 },
  emptyDesc: { fontSize:14, color:C.grayLight, textAlign:'center', lineHeight:21, marginBottom:28 },
  emptyBtn: { borderRadius:14, overflow:'hidden', width:'100%' },
  emptyBtnGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:15 },

  // CREATE BTN
  createBtn: { borderRadius:14, overflow:'hidden', marginTop:4, shadowColor:C.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.25, shadowRadius:10, elevation:4 },
  createBtnGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:16 },

  // LIMIT
  limitBanner: { flexDirection:'row', alignItems:'flex-start', backgroundColor:'#FFFBEB', borderRadius:14, padding:14, marginTop:4, borderWidth:1, borderColor:'#FDE68A' },
});

export default ObjectifsScreen;