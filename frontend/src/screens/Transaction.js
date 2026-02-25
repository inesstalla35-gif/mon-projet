import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Platform, KeyboardAvoidingView,
  Keyboard, TouchableWithoutFeedback, Switch, Animated,
  Alert, Vibration, ActivityIndicator, FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactions, createTransaction, updateTransaction,
  deleteTransaction, importProfileRevenues,
} from "../actions/Transactionactions";

// ═══════════════════════════════════════════════════════ THEME ═══
const C = {
  bg:"#F8FAFC", bg2:"#FFFFFF", card:"#FFFFFF", cardAlt:"#F1F5F9",
  border:"#E2E8F0", borderMid:"#CBD5E1",
  primary:"#0D7377", primaryMid:"#14919B", primaryLight:"#E6F7F7", accent:"#14FFEC",
  success:"#10B981", successLight:"#D1FAE5",
  danger:"#EF4444",  dangerLight:"#FEE2E2",
  warning:"#F59E0B", warningLight:"#FEF3C7",
  info:"#06B6D4",    infoLight:"#CFFAFE",
  text:"#1E293B", textSec:"#64748B", textMuted:"#94A3B8",
  shadow:"rgba(0,0,0,0.06)",
};

const CATS = {
  expense:[
    {id:"alimentation",label:"Alimentation",icon:"restaurant",         color:"#F97316"},
    {id:"transport",   label:"Transport",   icon:"car-outline",        color:"#3B82F6"},
    {id:"logement",    label:"Logement",    icon:"home-outline",       color:"#8B5CF6"},
    {id:"factures",    label:"Factures",    icon:"flash-outline",      color:"#EAB308"},
    {id:"sante",       label:"Santé",       icon:"medical-outline",    color:"#EF4444"},
    {id:"education",   label:"Éducation",   icon:"school-outline",     color:"#06B6D4"},
    {id:"shopping",    label:"Shopping",    icon:"bag-outline",        color:"#EC4899"},
    {id:"loisirs",     label:"Loisirs",     icon:"game-controller-outline",color:"#10B981"},
    {id:"tontine",     label:"Tontine",     icon:"people-outline",     color:"#F97316"},
    {id:"restaurant",  label:"Restaurant",  icon:"pizza-outline",      color:"#F59E0B"},
    {id:"carburant",   label:"Carburant",   icon:"flame-outline",      color:"#EE5A24"},
    {id:"autres",      label:"Autres",      icon:"ellipsis-horizontal",color:"#64748B"},
  ],
  income:[
    {id:"salaire",      label:"Salaire",       icon:"cash-outline",          color:"#10B981"},
    {id:"freelance",    label:"Freelance",      icon:"laptop-outline",        color:"#3B82F6"},
    {id:"business",     label:"Business",       icon:"briefcase-outline",     color:"#8B5CF6"},
    {id:"vente",        label:"Vente",          icon:"pricetag-outline",      color:"#F97316"},
    {id:"dividendes",   label:"Dividendes",     icon:"trending-up",           color:"#06B6D4"},
    {id:"mobile_money", label:"Mobile Money",   icon:"phone-portrait-outline",color:"#F59E0B"},
    {id:"remboursement",label:"Remboursement",  icon:"return-down-back",      color:"#3B82F6"},
    {id:"revenu_passif",label:"Revenu passif",  icon:"wallet-outline",        color:"#8B5CF6"},
    {id:"cadeau",       label:"Cadeau",         icon:"gift-outline",          color:"#EC4899"},
    {id:"autres",       label:"Autres",         icon:"ellipsis-horizontal",   color:"#64748B"},
  ],
};

const MODES = [
  {id:"especes", label:"Espèces",       icon:"cash-outline",      desc:"Argent liquide"},
  {id:"carte",   label:"Carte bancaire",icon:"card-outline",      desc:"Visa, Mastercard..."},
  {id:"mobile",  label:"Mobile Money",  icon:"phone-portrait",    desc:"MTN, Orange, Wave..."},
  {id:"virement",label:"Virement",      icon:"swap-horizontal",   desc:"Banque à banque"},
  {id:"cheque",  label:"Chèque",        icon:"newspaper-outline", desc:"Chèque bancaire"},
];

const TAGS_LIST = [
  {id:"perso",    label:"Personnel",    color:"#3B82F6"},
  {id:"pro",      label:"Professionnel",color:"#8B5CF6"},
  {id:"urgent",   label:"Urgent",       color:"#EF4444"},
  {id:"planifie", label:"Planifié",     color:"#F59E0B"},
  {id:"famille",  label:"Famille",      color:"#F97316"},
];

const QUICK = [5000,10000,25000,50000,100000,250000];

const fmtNum = n => (n||0).toLocaleString("fr-FR");
const parseMt = s => parseInt((s||"0").replace(/[\s\u202F,]/g,""))||0;
const fmtDate = d => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});

const getCat  = (type, id) => CATS[type==="income"?"income":"expense"].find(c=>c.id===id)||{icon:"ellipsis-horizontal",color:C.textMuted,label:id||"—"};

// ══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════
const TransactionScreen = ({ navigation }) => {
  const dispatch    = useDispatch();
  const { transactions, isLoading, error } = useSelector(s => s.transaction);

  // ── Onglet actif : "liste" | "form"
  const [view,      setView]    = useState("liste");
  const [filterTab, setFilter]  = useState("all"); // all | income | expense
  const [editTx,    setEditTx]  = useState(null);  // transaction en édition

  // ── Formulaire
  const [txType,     setTxType]  = useState("expense");
  const [montant,    setMontant] = useState("");
  const [categorie,  setCat]     = useState(null);
  const [description,setDesc]    = useState("");
  const [beneficiaire,setBenef]  = useState("");
  const [date,       setDate]    = useState(new Date());
  const [modePay,    setMode]    = useState("especes");
  const [isRec,      setRec]     = useState(false);
  const [frequence,  setFreq]    = useState("mensuel");
  const [selTags,    setSelTags] = useState([]);
  const [submitting, setSub]     = useState(false);

  // Modals
  const [showDate,   setShowDate]   = useState(false);
  const [showCatMod, setShowCat]    = useState(false);
  const [showPayMod, setShowPay]    = useState(false);
  const [showDelMod, setShowDel]    = useState(null); // tx à supprimer

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(importProfileRevenues());
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {toValue:1, duration:400, useNativeDriver:true}),
      Animated.spring(slideAnim,{toValue:0, friction:8,  useNativeDriver:true}),
    ]).start();
  }, [view]);

  // Ouvrir formulaire création
  const openCreate = (defaultType = "expense") => {
    setEditTx(null);
    setTxType(defaultType);
    resetForm();
    setView("form");
  };

  // Ouvrir formulaire édition
  const openEdit = (tx) => {
    setEditTx(tx);
    setTxType(tx.type === "income" ? "income" : "expense");
    setMontant(fmtNum(tx.amount));
    setCat(tx.category);
    setDesc(tx.description || "");
    setBenef(tx.beneficiaire || "");
    setDate(tx.date ? new Date(tx.date) : new Date());
    setMode(tx.modePaiement || "especes");
    setRec(tx.isRecurring || false);
    setFreq(tx.period || "mensuel");
    setSelTags(tx.tags || []);
    setView("form");
  };

  const resetForm = () => {
    setMontant(""); setCat(null); setDesc(""); setBenef("");
    setDate(new Date()); setMode("especes"); setRec(false);
    setFreq("mensuel"); setSelTags([]);
  };

  const montantNum = parseMt(montant);
  const isExpense  = txType === "expense";
  const typeColor  = isExpense ? C.danger : C.success;
  const cats       = CATS[isExpense ? "expense" : "income"];
  const currentCat = cats.find(c=>c.id===categorie);
  const currentPay = MODES.find(m=>m.id===modePay);

  const fmtInput = txt => {
    const c = txt.replace(/[^0-9]/g,"");
    if(!c) {setMontant(""); return;}
    setMontant(parseInt(c).toLocaleString("fr-FR"));
  };

  const toggleTag = id => {
    setSelTags(p => p.includes(id) ? p.filter(t=>t!==id) : [...p,id]);
    Vibration.vibrate(5);
  };

  // ── SOUMETTRE ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!montantNum || montantNum <= 0) { Alert.alert("Montant requis","Entrez un montant valide."); return; }
    if (!categorie)                     { Alert.alert("Catégorie requise","Choisissez une catégorie."); return; }

    setSub(true);
    const payload = {
      amount:       montantNum,
      category:     categorie,
      description:  description,
      beneficiaire: beneficiaire,
      date:         date.toISOString(),
      modePaiement: modePay,
      tags:         selTags,
      isRecurring:  isRec,
      period:       isRec ? frequence : "none",
    };

    let result;
    if (editTx) {
      result = await dispatch(updateTransaction(editTx.type, editTx._id, payload));
    } else {
      result = await dispatch(createTransaction(txType === "income" ? "income" : "expense", payload));
    }
    setSub(false);

    if (result?.success) {
      Alert.alert(
        editTx ? "✅ Modifié !" : isExpense ? "✅ Dépense enregistrée" : "✅ Revenu enregistré",
        `${fmtNum(montantNum)} FCFA ${editTx ? "mis à jour" : "enregistré"} avec succès.`,
        [{text:"Voir la liste", onPress:()=>{resetForm(); setView("liste");}},
         {text:"Nouvelle transaction", onPress:()=>{resetForm(); setEditTx(null);}}]
      );
    } else {
      Alert.alert("Erreur", result?.error || "Une erreur est survenue.");
    }
  };

  // ── SUPPRIMER ─────────────────────────────────────────────────────
  const confirmDelete = async (tx) => {
    const result = await dispatch(deleteTransaction(tx.type, tx._id));
    setShowDel(null);
    if (!result?.success) Alert.alert("Erreur", result?.error || "Impossible de supprimer.");
  };

  // ── Filtres liste ────────────────────────────────────────────────
  const filtered = transactions.filter(t => {
    if (filterTab === "income")  return t.type === "income";
    if (filterTab === "expense") return t.type === "expense";
    return true;
  });

  const totalIncome  = transactions.filter(t=>t.type==="income").reduce((a,t)=>a+(t.amount||0),0);
  const totalExpense = transactions.filter(t=>t.type==="expense").reduce((a,t)=>a+(t.amount||0),0);
  const balance      = totalIncome - totalExpense;

  // ══════════════════════════════════════════════════════════════════
  return (
    <View style={st.root}>
      {/* ── HEADER ── */}
      <LinearGradient colors={[C.primary,C.primaryMid]} style={st.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={st.headerDeco}/>
        <View style={st.headerRow}>
          <TouchableOpacity style={st.headerBtn} onPress={()=> view==="form" ? setView("liste") : navigation?.goBack?.()}>
            <Ionicons name={view==="form"?"close":"arrow-back"} size={22} color="#FFF"/>
          </TouchableOpacity>
          <View style={{flex:1, alignItems:"center"}}>
            <Text style={st.headerTitle}>{view==="form" ? (editTx?"Modifier":"Nouvelle transaction") : "Transactions"}</Text>
            <Text style={st.headerSub}>{view==="liste" ? `${transactions.length} transaction${transactions.length>1?"s":""}` : (isExpense?"Dépense":"Revenu")}</Text>
          </View>
          {view==="liste" ? (
            <TouchableOpacity style={[st.headerBtn,{backgroundColor:"rgba(255,255,255,0.25)"}]} onPress={()=>openCreate()}>
              <Ionicons name="add" size={24} color="#FFF"/>
            </TouchableOpacity>
          ) : <View style={{width:42}}/>}
        </View>

        {/* Stats (seulement en vue liste) */}
        {view==="liste" && (
          <View style={st.statsRow}>
            {[
              {label:"Revenus",  val:fmtNum(totalIncome),  color:C.accent, icon:"trending-up"},
              {label:"Dépenses", val:fmtNum(totalExpense), color:"#FFB3B3",icon:"trending-down"},
              {label:"Balance",  val:fmtNum(Math.abs(balance)), color: balance>=0?C.accent:"#FFB3B3", icon:"wallet"},
            ].map((s,i)=>(
              <React.Fragment key={i}>
                {i>0 && <View style={{width:1, backgroundColor:"rgba(255,255,255,0.2)", marginVertical:4}}/>}
                <View style={{flex:1, alignItems:"center", gap:2}}>
                  <Ionicons name={s.icon} size={13} color={s.color}/>
                  <Text style={{fontSize:13, fontWeight:"800", color:s.color}}>{s.val} F</Text>
                  <Text style={{fontSize:10, color:"rgba(255,255,255,0.55)"}}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* ══════════════════ VUE LISTE ══════════════════ */}
      {view === "liste" && (
        <View style={{flex:1}}>
          {/* Filtres */}
          <View style={st.filterRow}>
            {[["all","Tout","list"],["income","Revenus","trending-up"],["expense","Dépenses","trending-down"]].map(([key,lbl,icon])=>(
              <TouchableOpacity key={key} style={[st.filterBtn, filterTab===key && st.filterBtnActive]} onPress={()=>setFilter(key)}>
                <Ionicons name={icon} size={15} color={filterTab===key ? C.primary : C.textMuted}/>
                <Text style={[st.filterTxt, filterTab===key && {color:C.primary, fontWeight:"700"}]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Erreur */}
          {error && (
            <View style={st.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={C.danger}/>
              <Text style={{flex:1, marginLeft:8, fontSize:13, color:C.danger}}>{error}</Text>
            </View>
          )}

          {/* Loading */}
          {isLoading && (
            <View style={{alignItems:"center", paddingVertical:40}}>
              <ActivityIndicator size="large" color={C.primary}/>
              <Text style={{marginTop:12, color:C.textMuted, fontSize:14}}>Chargement...</Text>
            </View>
          )}

          {/* Liste vide */}
          {!isLoading && filtered.length === 0 && (
            <View style={st.emptyState}>
              <View style={st.emptyIcon}>
                <Ionicons name="receipt-outline" size={48} color={C.border}/>
              </View>
              <Text style={st.emptyTitle}>Aucune transaction</Text>
              <Text style={st.emptyDesc}>Enregistrez votre première transaction pour commencer le suivi.</Text>
              <View style={{flexDirection:"row", gap:10, marginTop:20}}>
                <TouchableOpacity style={[st.emptyBtn,{backgroundColor:C.dangerLight,borderColor:C.danger}]} onPress={()=>openCreate("expense")}>
                  <Ionicons name="remove-circle" size={18} color={C.danger}/>
                  <Text style={{fontSize:14,fontWeight:"700",color:C.danger}}>Dépense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[st.emptyBtn,{backgroundColor:C.successLight,borderColor:C.success}]} onPress={()=>openCreate("income")}>
                  <Ionicons name="add-circle" size={18} color={C.success}/>
                  <Text style={{fontSize:14,fontWeight:"700",color:C.success}}>Revenu</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ✅ CORRIGÉ : paddingBottom augmenté pour dépasser la navbar */}
          <FlatList
            data={filtered}
            keyExtractor={t=>t._id}
            contentContainerStyle={{paddingHorizontal:16, paddingBottom:170, paddingTop:8}}
            showsVerticalScrollIndicator={false}
            renderItem={({item:tx}) => {
              const cat    = getCat(tx.type, tx.category);
              const isInc  = tx.type === "income";
              return (
                <View style={st.txCard}>
                  <View style={[st.txCatIcon, {backgroundColor: cat.color+"18"}]}>
                    <Ionicons name={cat.icon} size={22} color={cat.color}/>
                  </View>
                  <View style={{flex:1, marginLeft:12}}>
                    <View style={{flexDirection:"row", alignItems:"center", gap:6}}>
                      <Text style={st.txTitle} numberOfLines={1}>{cat.label}</Text>
                      {tx.source==="profile" && (
                        <View style={st.profileBadge}>
                          <Text style={{fontSize:9, fontWeight:"700", color:C.primary}}>PROFIL</Text>
                        </View>
                      )}
                      {tx.isRecurring && (
                        <Ionicons name="repeat" size={12} color={C.textMuted}/>
                      )}
                    </View>
                    {tx.description ? (
                      <Text style={st.txDesc} numberOfLines={1}>{tx.description}</Text>
                    ) : tx.beneficiaire ? (
                      <Text style={st.txDesc} numberOfLines={1}>{isInc?"De: ":"Pour: "}{tx.beneficiaire}</Text>
                    ) : null}
                    <Text style={st.txDate}>{fmtDate(tx.date)}</Text>
                  </View>
                  <View style={{alignItems:"flex-end", gap:4}}>
                    <Text style={[st.txAmount, {color: isInc ? C.success : C.danger}]}>
                      {isInc?"+":"-"}{fmtNum(tx.amount)} F
                    </Text>
                    <View style={{flexDirection:"row", gap:6}}>
                      <TouchableOpacity style={[st.txIconBtn,{backgroundColor:C.primaryLight}]} onPress={()=>openEdit(tx)}>
                        <Ionicons name="pencil" size={13} color={C.primary}/>
                      </TouchableOpacity>
                      <TouchableOpacity style={[st.txIconBtn,{backgroundColor:C.dangerLight}]} onPress={()=>setShowDel(tx)}>
                        <Ionicons name="trash-outline" size={13} color={C.danger}/>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />

          {/* ✅ CORRIGÉ : paddingBottom augmenté pour être au-dessus de la navbar */}
          {!isLoading && (
            <View style={st.fabsRow}>
              <TouchableOpacity style={[st.fab, {backgroundColor:C.danger}]} onPress={()=>openCreate("expense")} activeOpacity={0.85}>
                <Ionicons name="remove-circle" size={20} color="#FFF"/>
                <Text style={st.fabTxt}>Dépense</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.fab, {backgroundColor:C.success}]} onPress={()=>openCreate("income")} activeOpacity={0.85}>
                <Ionicons name="add-circle" size={20} color="#FFF"/>
                <Text style={st.fabTxt}>Revenu</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ══════════════════ VUE FORMULAIRE ══════════════════ */}
      {view === "form" && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{flex:1}}>
            <ScrollView
              contentContainerStyle={st.formScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View style={{opacity:fadeAnim, transform:[{translateY:slideAnim}]}}>

                {/* ─ TYPE SWITCH ─ */}
                {!editTx && (
                  <View style={st.typeRow}>
                    <TouchableOpacity
                      style={[st.typeBtn, isExpense && {backgroundColor:C.danger, borderColor:C.danger}]}
                      onPress={()=>{setTxType("expense"); setCat(null);}}>
                      <Ionicons name="remove-circle" size={20} color={isExpense?"#FFF":C.danger}/>
                      <Text style={[st.typeTxt, isExpense && {color:"#FFF"}]}>Dépense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[st.typeBtn, !isExpense && {backgroundColor:C.success, borderColor:C.success}]}
                      onPress={()=>{setTxType("income"); setCat(null);}}>
                      <Ionicons name="add-circle" size={20} color={!isExpense?"#FFF":C.success}/>
                      <Text style={[st.typeTxt, !isExpense && {color:"#FFF"}]}>Revenu</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* ─ MONTANT ─ */}
                <View style={st.amountCard}>
                  <Text style={st.sectionLbl}>Montant (FCFA)</Text>
                  <View style={{flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8}}>
                    <Text style={[st.amountSign, {color:typeColor}]}>{isExpense?"-":"+"}</Text>
                    <TextInput
                      style={[st.amountInput, {color:typeColor}]}
                      placeholder="0"
                      placeholderTextColor={C.textMuted}
                      keyboardType="numeric"
                      value={montant}
                      onChangeText={fmtInput}
                      autoFocus={!editTx}
                    />
                  </View>
                  {montantNum > 0 && (
                    <Text style={[st.amountWords, {color:typeColor}]}>
                      {montantNum>=1000000 ? `${(montantNum/1000000).toFixed(1)} million(s)`
                       : montantNum>=1000  ? `${(montantNum/1000).toFixed(0)} mille`
                       : `${montantNum}`} FCFA
                    </Text>
                  )}
                  {/* Montants rapides */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:14}}>
                    {QUICK.map(q=>(
                      <TouchableOpacity key={q}
                        style={[st.quickBtn, montantNum===q && {backgroundColor:typeColor, borderColor:typeColor}]}
                        onPress={()=>{setMontant(q.toLocaleString("fr-FR")); Vibration.vibrate(6);}}>
                        <Text style={[st.quickTxt, montantNum===q && {color:"#FFF"}]}>
                          {q>=1000000?`${q/1000000}M`:q>=1000?`${q/1000}k`:q} F
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* ─ CATÉGORIE ─ */}
                <TouchableOpacity
                  style={[st.fieldCard, currentCat && {borderColor:currentCat.color+"60", backgroundColor:currentCat.color+"06"}]}
                  onPress={()=>setShowCat(true)}>
                  <View style={[st.fieldIcon, {backgroundColor:currentCat?currentCat.color+"15":C.primaryLight}]}>
                    <Ionicons name={currentCat?.icon||"grid-outline"} size={22} color={currentCat?.color||C.primary}/>
                  </View>
                  <View style={st.fieldContent}>
                    <Text style={st.fieldLbl}>Catégorie *</Text>
                    <Text style={[st.fieldVal, !currentCat && {color:C.textMuted}]}>
                      {currentCat?.label||"Sélectionner..."}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={C.textMuted}/>
                </TouchableOpacity>

                {/* ─ BÉNÉFICIAIRE ─ */}
                <View style={st.fieldCard}>
                  <View style={[st.fieldIcon, {backgroundColor:C.primaryLight}]}>
                    <Ionicons name={isExpense?"person-outline":"person-add-outline"} size={22} color={C.primary}/>
                  </View>
                  <TextInput
                    style={st.fieldInput}
                    placeholder={isExpense?"Payé à (optionnel)":"Reçu de (optionnel)"}
                    placeholderTextColor={C.textMuted}
                    value={beneficiaire}
                    onChangeText={setBenef}
                  />
                  {beneficiaire ? (
                    <TouchableOpacity onPress={()=>setBenef("")}>
                      <Ionicons name="close-circle" size={20} color={C.textMuted}/>
                    </TouchableOpacity>
                  ):null}
                </View>

                {/* ─ DATE + MODE ─ */}
                <View style={st.rowGap}>
                  <TouchableOpacity style={[st.fieldCard,{flex:1}]} onPress={()=>setShowDate(true)}>
                    <View style={[st.fieldIcon,{backgroundColor:C.warningLight}]}>
                      <Ionicons name="calendar-outline" size={20} color={C.warning}/>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={st.fieldLbl}>Date</Text>
                      <Text style={st.fieldValSm} numberOfLines={1}>{date.toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={[st.fieldCard,{flex:1}]} onPress={()=>setShowPay(true)}>
                    <View style={[st.fieldIcon,{backgroundColor:C.successLight}]}>
                      <Ionicons name={currentPay?.icon||"wallet-outline"} size={20} color={C.success}/>
                    </View>
                    <View style={{flex:1}}>
                      <Text style={st.fieldLbl}>Paiement</Text>
                      <Text style={st.fieldValSm} numberOfLines={1}>{currentPay?.label||"Espèces"}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* ─ TAGS ─ */}
                <View style={st.fieldCard}>
                  <View style={[st.fieldIcon,{backgroundColor:C.infoLight}]}>
                    <Ionicons name="pricetag-outline" size={22} color={C.info}/>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={st.fieldLbl}>Tags</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:6}}>
                      {TAGS_LIST.map(tag=>(
                        <TouchableOpacity key={tag.id}
                          style={[st.tag, selTags.includes(tag.id) && {backgroundColor:tag.color+"15",borderColor:tag.color}]}
                          onPress={()=>toggleTag(tag.id)}>
                          {selTags.includes(tag.id) && <View style={[st.tagDot,{backgroundColor:tag.color}]}/>}
                          <Text style={[st.tagTxt, selTags.includes(tag.id) && {color:tag.color,fontWeight:"700"}]}>{tag.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* ─ DESCRIPTION ─ */}
                <View style={[st.fieldCard,{alignItems:"flex-start"}]}>
                  <View style={[st.fieldIcon,{backgroundColor:C.primaryLight,marginTop:2}]}>
                    <Ionicons name="create-outline" size={22} color={C.primary}/>
                  </View>
                  <TextInput
                    style={[st.fieldInput,{minHeight:72, textAlignVertical:"top"}]}
                    placeholder={isExpense?"Détails, facture, contexte...":"Source, projet, référence..."}
                    placeholderTextColor={C.textMuted}
                    multiline numberOfLines={3}
                    value={description}
                    onChangeText={setDesc}
                  />
                </View>

                {/* ─ RÉCURRENT ─ */}
                <View style={st.fieldCard}>
                  <View style={[st.fieldIcon,{backgroundColor:isRec?C.primaryLight:C.cardAlt}]}>
                    <Ionicons name="repeat" size={22} color={isRec?C.primary:C.textMuted}/>
                  </View>
                  <View style={st.fieldContent}>
                    <Text style={[st.fieldLbl,isRec&&{color:C.primary}]}>Récurrent</Text>
                    <Text style={st.fieldValSm}>{isRec?`Tous les ${frequence==="mensuel"?"mois":frequence==="hebdo"?"semaines":"jours"}`:"Non"}</Text>
                  </View>
                  <Switch value={isRec} onValueChange={v=>{setRec(v);Vibration.vibrate(6);}}
                    trackColor={{false:C.border,true:C.primaryLight}}
                    thumbColor={isRec?C.primary:"#FFF"}/>
                </View>

                {isRec && (
                  <View style={st.rowGap}>
                    {[["journalier","Quotidien","sunny-outline"],["hebdo","Hebdo","calendar-outline"],["mensuel","Mensuel","calendar"]].map(([k,lbl,ico])=>(
                      <TouchableOpacity key={k}
                        style={[st.freqBtn, frequence===k && {backgroundColor:C.primaryLight,borderColor:C.primary}]}
                        onPress={()=>setFreq(k)}>
                        <Ionicons name={ico} size={14} color={frequence===k?C.primary:C.textMuted}/>
                        <Text style={[st.freqTxt, frequence===k && {color:C.primary,fontWeight:"700"}]}>{lbl}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* ─ RECAP ─ */}
                {montantNum > 0 && categorie && (
                  <View style={[st.recapCard,{borderColor:typeColor+"30"}]}>
                    <LinearGradient colors={isExpense?[C.dangerLight,C.bg2]:[C.successLight,C.bg2]} style={st.recapGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                      <Text style={[st.recapTitle,{color:typeColor}]}>Récapitulatif</Text>
                      <View style={{flexDirection:"row",alignItems:"baseline",justifyContent:"center",gap:6,marginBottom:14}}>
                        <Text style={[{fontSize:28,fontWeight:"600",color:typeColor}]}>{isExpense?"-":"+"}</Text>
                        <Text style={[{fontSize:36,fontWeight:"900",color:typeColor}]}>{montant}</Text>
                        <Text style={[{fontSize:16,fontWeight:"700",color:typeColor}]}>F</Text>
                      </View>
                      <View style={{height:1,backgroundColor:C.border,marginBottom:12}}/>
                      {[
                        ["Catégorie", currentCat?.label],
                        ["Date",      date.toLocaleDateString("fr-FR")],
                        ["Mode",      currentPay?.label],
                        beneficiaire ? [isExpense?"Payé à":"Reçu de", beneficiaire] : null,
                        selTags.length>0 ? ["Tags", selTags.map(t=>TAGS_LIST.find(x=>x.id===t)?.label).join(", ")] : null,
                      ].filter(Boolean).map(([k,v],i)=>(
                        <View key={i} style={{flexDirection:"row",justifyContent:"space-between",marginBottom:6}}>
                          <Text style={{fontSize:13,color:C.textSec}}>{k}</Text>
                          <Text style={{fontSize:13,fontWeight:"700",color:C.text,maxWidth:"60%",textAlign:"right"}}>{v}</Text>
                        </View>
                      ))}
                    </LinearGradient>
                  </View>
                )}

                {/* ✅ CORRIGÉ : espace suffisant pour dépasser footer + navbar */}
                <View style={{height:200}}/>
              </Animated.View>
            </ScrollView>

            {/* ─ FOOTER BOUTON ENREGISTRER ─ */}
            {/* ✅ CORRIGÉ : paddingBottom augmenté pour être au-dessus de la navbar Home */}
            <View style={st.footer}>
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <Text style={{fontSize:12,color:C.textSec,fontWeight:"600"}}>
                  {montantNum>0 && categorie ? `${isExpense?"Dépense":"Revenu"} prêt`
                   : montantNum>0 ? "Choisissez une catégorie" : "Entrez un montant"}
                </Text>
                {montantNum>0 && (
                  <Text style={{fontSize:15,fontWeight:"900",color:typeColor}}>
                    {isExpense?"-":"+"} {montant} F
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[st.submitBtn, (!montantNum||!categorie||submitting) && {opacity:0.45}]}
                onPress={handleSubmit}
                disabled={!montantNum||!categorie||submitting}
                activeOpacity={0.85}>
                <LinearGradient
                  colors={isExpense?[C.danger,"#DC2626"]:[C.success,"#059669"]}
                  style={st.submitGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  {submitting
                    ? <ActivityIndicator size="small" color="#FFF"/>
                    : <>
                        <Ionicons name={isExpense?"remove-circle":"add-circle"} size={24} color="#FFF"/>
                        <Text style={st.submitTxt}>
                          {editTx ? "MODIFIER" : isExpense ? "ENREGISTRER LA DÉPENSE" : "ENREGISTRER LE REVENU"}
                        </Text>
                      </>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      )}

      {/* ══════ MODAL CATÉGORIES ══════ */}
      <Modal visible={showCatMod} transparent animationType="slide" onRequestClose={()=>setShowCat(false)}>
        <View style={md.overlay}>
          <View style={md.sheet}>
            <View style={md.handle}/>
            <View style={md.header}>
              <View>
                <Text style={md.title}>Catégorie</Text>
                <Text style={md.sub}>{isExpense?"Où est allé cet argent ?":"D'où vient cet argent ?"}</Text>
              </View>
              <TouchableOpacity onPress={()=>setShowCat(false)} style={md.closeBtn}>
                <Ionicons name="close" size={24} color={C.text}/>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={md.grid}>
                {cats.map(cat=>{
                  const isAct = categorie===cat.id;
                  return (
                    <TouchableOpacity key={cat.id}
                      style={[md.catBtn, isAct && {backgroundColor:cat.color+"12",borderColor:cat.color}]}
                      onPress={()=>{setCat(cat.id); setShowCat(false); Vibration.vibrate(8);}}>
                      <View style={[md.catIco,{backgroundColor:cat.color+(isAct?"22":"12")}]}>
                        <Ionicons name={cat.icon} size={24} color={cat.color}/>
                      </View>
                      <Text style={[md.catLbl, isAct && {color:cat.color,fontWeight:"700"}]}>{cat.label}</Text>
                      {isAct && <View style={[md.check,{backgroundColor:cat.color}]}><Ionicons name="checkmark" size={12} color="#FFF"/></View>}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={{height:30}}/>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ══════ MODAL MODE PAIEMENT ══════ */}
      <Modal visible={showPayMod} transparent animationType="slide" onRequestClose={()=>setShowPay(false)}>
        <View style={md.overlay}>
          <View style={md.sheet}>
            <View style={md.handle}/>
            <View style={md.header}>
              <Text style={md.title}>Mode de paiement</Text>
              <TouchableOpacity onPress={()=>setShowPay(false)} style={md.closeBtn}>
                <Ionicons name="close" size={24} color={C.text}/>
              </TouchableOpacity>
            </View>
            {MODES.map(mode=>{
              const isAct = modePay===mode.id;
              return (
                <TouchableOpacity key={mode.id}
                  style={[md.payRow, isAct && {backgroundColor:C.primaryLight,borderColor:C.primary}]}
                  onPress={()=>{setMode(mode.id); setShowPay(false); Vibration.vibrate(8);}}>
                  <View style={[md.payIco,{backgroundColor:isAct?C.primary+"15":C.cardAlt}]}>
                    <Ionicons name={mode.icon} size={24} color={isAct?C.primary:C.textMuted}/>
                  </View>
                  <View style={{flex:1,marginLeft:12}}>
                    <Text style={[md.payLbl,isAct&&{color:C.primary,fontWeight:"700"}]}>{mode.label}</Text>
                    <Text style={md.payDesc}>{mode.desc}</Text>
                  </View>
                  {isAct && <Ionicons name="checkmark-circle" size={24} color={C.primary}/>}
                </TouchableOpacity>
              );
            })}
            <View style={{height:20}}/>
          </View>
        </View>
      </Modal>

      {/* ══════ MODAL SUPPRESSION ══════ */}
      <Modal visible={!!showDelMod} transparent animationType="fade" onRequestClose={()=>setShowDel(null)}>
        <View style={md.overlay}>
          <View style={md.confirmSheet}>
            <View style={[md.confirmIco,{backgroundColor:C.dangerLight}]}>
              <Ionicons name="trash" size={32} color={C.danger}/>
            </View>
            <Text style={md.confirmTitle}>Supprimer cette transaction ?</Text>
            <Text style={md.confirmDesc}>
              {showDelMod?.type==="income"?"Revenu":"Dépense"} de{" "}
              <Text style={{fontWeight:"900", color:showDelMod?.type==="income"?C.success:C.danger}}>
                {fmtNum(showDelMod?.amount)} FCFA
              </Text>
              {"\n"}{getCat(showDelMod?.type||"expense", showDelMod?.category)?.label}
              {" — "}{showDelMod?.date ? fmtDate(showDelMod.date) : ""}
            </Text>
            <View style={{flexDirection:"row",gap:12,marginTop:24}}>
              <TouchableOpacity style={[md.confirmBtn,{backgroundColor:C.cardAlt,borderColor:C.border}]} onPress={()=>setShowDel(null)}>
                <Text style={{fontSize:15,fontWeight:"700",color:C.text}}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[md.confirmBtn,{backgroundColor:C.danger,borderColor:C.danger}]} onPress={()=>confirmDelete(showDelMod)}>
                <Text style={{fontSize:15,fontWeight:"700",color:"#FFF"}}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DATE PICKER */}
      {showDate && (
        <DateTimePicker value={date} mode="date" display={Platform.OS==="ios"?"spinner":"default"}
          maximumDate={new Date()}
          onChange={(e,d)=>{setShowDate(false); if(d) setDate(d);}}/>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════ STYLES ═══
const st = StyleSheet.create({
  root: {flex:1, backgroundColor:C.bg},

  // Header
  header: {paddingTop:Platform.OS==="ios"?50:16, paddingBottom:16, paddingHorizontal:16, overflow:"hidden"},
  headerDeco: {position:"absolute",width:220,height:220,borderRadius:110,backgroundColor:"rgba(20,255,236,0.05)",top:-90,right:-60},
  headerRow: {flexDirection:"row",alignItems:"center",marginBottom:16},
  headerBtn: {width:42,height:42,borderRadius:13,backgroundColor:"rgba(255,255,255,0.18)",justifyContent:"center",alignItems:"center"},
  headerTitle: {fontSize:19,fontWeight:"900",color:"#FFF"},
  headerSub: {fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:2},
  statsRow: {flexDirection:"row",backgroundColor:"rgba(255,255,255,0.1)",borderRadius:16,paddingVertical:12},

  // Filtres
  filterRow: {flexDirection:"row",backgroundColor:C.bg2,paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.border,gap:8},
  filterBtn: {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5,paddingVertical:8,borderRadius:12,backgroundColor:C.cardAlt,borderWidth:1.5,borderColor:"transparent"},
  filterBtnActive: {backgroundColor:C.primaryLight,borderColor:C.primary},
  filterTxt: {fontSize:12,fontWeight:"600",color:C.textMuted},

  // Error
  errorBanner: {flexDirection:"row",alignItems:"center",backgroundColor:C.dangerLight,margin:16,borderRadius:12,padding:12},

  // Empty
  emptyState: {flex:1,alignItems:"center",justifyContent:"center",paddingHorizontal:40,paddingVertical:60},
  emptyIcon: {width:100,height:100,borderRadius:30,backgroundColor:C.cardAlt,justifyContent:"center",alignItems:"center",marginBottom:20},
  emptyTitle: {fontSize:20,fontWeight:"800",color:C.text,marginBottom:8},
  emptyDesc: {fontSize:14,color:C.textMuted,textAlign:"center",lineHeight:21},
  emptyBtn: {flexDirection:"row",alignItems:"center",gap:8,paddingHorizontal:20,paddingVertical:12,borderRadius:14,borderWidth:1.5},

  // Transaction card
  txCard: {flexDirection:"row",alignItems:"center",backgroundColor:C.bg2,borderRadius:16,padding:14,marginBottom:8,borderWidth:1,borderColor:C.border,shadowColor:C.shadow,shadowOffset:{width:0,height:2},shadowOpacity:1,shadowRadius:6,elevation:2},
  txCatIcon: {width:46,height:46,borderRadius:14,justifyContent:"center",alignItems:"center"},
  txTitle: {fontSize:14,fontWeight:"700",color:C.text},
  txDesc: {fontSize:12,color:C.textMuted,marginTop:2},
  txDate: {fontSize:11,color:C.textMuted,marginTop:3},
  txAmount: {fontSize:15,fontWeight:"900"},
  txIconBtn: {width:28,height:28,borderRadius:8,justifyContent:"center",alignItems:"center"},
  profileBadge: {backgroundColor:C.primaryLight,borderRadius:5,paddingHorizontal:5,paddingVertical:1,borderWidth:1,borderColor:C.primary},

  // ✅ CORRIGÉ : FABs remontés au-dessus de la navbar (bottom + paddingBottom augmentés)
  fabsRow: {
    position:"absolute", bottom:0, left:0, right:0,
    flexDirection:"row", gap:10,
    paddingHorizontal:16, paddingTop:12,
    paddingBottom: Platform.OS==="ios" ? 110 : 90,
    backgroundColor:C.bg2,
    borderTopWidth:1, borderTopColor:C.border,
  },
  fab: {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,paddingVertical:14,borderRadius:14,shadowColor:"#000",shadowOffset:{width:0,height:4},shadowOpacity:0.2,shadowRadius:8,elevation:5},
  fabTxt: {fontSize:15,fontWeight:"800",color:"#FFF"},

  // Form
  formScroll: {padding:16, gap:10},
  typeRow: {flexDirection:"row",gap:12,marginBottom:4},
  typeBtn: {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,paddingVertical:14,borderRadius:14,backgroundColor:C.bg2,borderWidth:2,borderColor:C.border},
  typeTxt: {fontSize:15,fontWeight:"700",color:C.text},
  amountCard: {backgroundColor:C.bg2,borderRadius:20,padding:20,borderWidth:1.5,borderColor:C.border,alignItems:"center",shadowColor:C.shadow,shadowOffset:{width:0,height:2},shadowOpacity:1,shadowRadius:8,elevation:2},
  sectionLbl: {fontSize:11,fontWeight:"700",color:C.textSec,textTransform:"uppercase",letterSpacing:1,marginBottom:8},
  amountSign: {fontSize:32,fontWeight:"300"},
  amountInput: {fontSize:46,fontWeight:"800",minWidth:160,textAlign:"center"},
  amountWords: {fontSize:13,fontWeight:"600",marginTop:8},
  quickBtn: {paddingHorizontal:14,paddingVertical:7,borderRadius:18,backgroundColor:C.cardAlt,borderWidth:1.5,borderColor:C.border,marginRight:8},
  quickTxt: {fontSize:12,fontWeight:"700",color:C.textSec},
  fieldCard: {flexDirection:"row",alignItems:"center",backgroundColor:C.bg2,borderRadius:16,padding:14,borderWidth:1.5,borderColor:C.border,gap:12},
  fieldIcon: {width:44,height:44,borderRadius:12,justifyContent:"center",alignItems:"center"},
  fieldContent: {flex:1},
  fieldLbl: {fontSize:11,fontWeight:"700",color:C.textSec,marginBottom:2,textTransform:"uppercase",letterSpacing:0.5},
  fieldVal: {fontSize:15,fontWeight:"700",color:C.text},
  fieldValSm: {fontSize:13,fontWeight:"600",color:C.text},
  fieldInput: {flex:1,fontSize:15,fontWeight:"600",color:C.text,padding:0},
  rowGap: {flexDirection:"row",gap:10},
  tag: {flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:11,paddingVertical:5,borderRadius:14,backgroundColor:C.cardAlt,borderWidth:1.5,borderColor:C.border,marginRight:7},
  tagDot: {width:6,height:6,borderRadius:3},
  tagTxt: {fontSize:12,fontWeight:"600",color:C.textSec},
  freqBtn: {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5,paddingVertical:10,borderRadius:12,backgroundColor:C.cardAlt,borderWidth:1.5,borderColor:C.border},
  freqTxt: {fontSize:12,fontWeight:"600",color:C.textSec},
  recapCard: {borderRadius:20,overflow:"hidden",borderWidth:1.5,marginTop:4},
  recapGrad: {padding:18},
  recapTitle: {fontSize:11,fontWeight:"800",textTransform:"uppercase",letterSpacing:1,marginBottom:12},

  // ✅ CORRIGÉ : footer remonté au-dessus de la navbar Home
  footer: {
    position:"absolute", bottom:0, left:0, right:0,
    backgroundColor:C.bg2,
    paddingHorizontal:16, paddingTop:12,
    paddingBottom: Platform.OS==="ios" ? 110 : 90,
    borderTopWidth:1, borderTopColor:C.border,
    shadowColor:"#000", shadowOffset:{width:0,height:-4},
    shadowOpacity:0.08, shadowRadius:12, elevation:10,
  },
  submitBtn: {borderRadius:16,overflow:"hidden",shadowColor:"#000",shadowOffset:{width:0,height:6},shadowOpacity:0.2,shadowRadius:12,elevation:8},
  submitGrad: {flexDirection:"row",alignItems:"center",justifyContent:"center",gap:10,paddingVertical:17},
  submitTxt: {color:"#FFF",fontSize:16,fontWeight:"800",letterSpacing:0.5},
});

const md = StyleSheet.create({
  overlay: {flex:1,backgroundColor:"rgba(0,0,0,0.42)",justifyContent:"flex-end"},
  sheet: {backgroundColor:C.bg2,borderTopLeftRadius:28,borderTopRightRadius:28,padding:20,paddingBottom:Platform.OS==="ios"?40:20,maxHeight:"85%"},
  handle: {width:40,height:4,borderRadius:2,backgroundColor:C.borderMid,alignSelf:"center",marginBottom:16},
  header: {flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16},
  title: {fontSize:22,fontWeight:"800",color:C.text},
  sub: {fontSize:14,color:C.textSec,marginTop:4},
  closeBtn: {width:36,height:36,borderRadius:10,backgroundColor:C.cardAlt,justifyContent:"center",alignItems:"center"},
  grid: {flexDirection:"row",flexWrap:"wrap",gap:10},
  catBtn: {width:"47%",flexDirection:"row",alignItems:"center",gap:10,backgroundColor:C.card,borderRadius:16,padding:12,borderWidth:1.5,borderColor:C.border},
  catIco: {width:44,height:44,borderRadius:12,justifyContent:"center",alignItems:"center"},
  catLbl: {flex:1,fontSize:13,fontWeight:"600",color:C.text},
  check: {width:22,height:22,borderRadius:11,justifyContent:"center",alignItems:"center"},
  payRow: {flexDirection:"row",alignItems:"center",padding:14,borderRadius:14,marginBottom:10,borderWidth:1.5,borderColor:C.border,backgroundColor:C.card},
  payIco: {width:48,height:48,borderRadius:12,justifyContent:"center",alignItems:"center"},
  payLbl: {fontSize:15,fontWeight:"700",color:C.text,marginBottom:2},
  payDesc: {fontSize:13,color:C.textSec},
  confirmSheet: {backgroundColor:C.bg2,borderRadius:24,margin:20,padding:28,alignItems:"center",shadowColor:"#000",shadowOffset:{width:0,height:10},shadowOpacity:0.2,shadowRadius:20,elevation:20},
  confirmIco: {width:72,height:72,borderRadius:22,justifyContent:"center",alignItems:"center",marginBottom:16},
  confirmTitle: {fontSize:20,fontWeight:"800",color:C.text,marginBottom:10,textAlign:"center"},
  confirmDesc: {fontSize:14,color:C.textSec,textAlign:"center",lineHeight:22},
  confirmBtn: {flex:1,paddingVertical:14,borderRadius:14,borderWidth:1.5,alignItems:"center"},
});

export default TransactionScreen;