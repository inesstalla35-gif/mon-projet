import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, StyleSheet, Alert, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Animated, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useDispatch, useSelector } from "react-redux";
import { createObjective, updateObjective } from "../actions/objectiveActions";

const C = {
  primary:'#0D7377',primaryMid:'#14919B',primaryLight:'#E6F7F7',accent:'#14FFEC',
  dark:'#111827',dark2:'#1F2937',gray:'#6B7280',grayLight:'#9CA3AF',
  border:'#E5E7EB',borderLight:'#F3F4F6',bg:'#F8FFFE',card:'#FFFFFF',
  expense:'#EF4444',expenseLight:'#FEF2F2',warning:'#F59E0B',
  purple:'#8B5CF6',purpleLight:'#EDE9FE',
};

const CATEGORIES = [
  { id:"voyage",   label:"Voyage",   icon:"airplane",            color:"#4FC3F7" },
  { id:"etudes",   label:"Études",   icon:"school",              color:"#AB47BC" },
  { id:"famille",  label:"Famille",  icon:"people",              color:"#FF7043" },
  { id:"materiel", label:"Matériel", icon:"phone-portrait",      color:"#66BB6A" },
  { id:"business", label:"Business", icon:"briefcase",           color:"#FFA726" },
  { id:"sante",    label:"Santé",    icon:"medical",             color:"#EF5350" },
  { id:"logement", label:"Logement", icon:"home",                color:"#5C6BC0" },
  { id:"urgence",  label:"Urgence",  icon:"warning",             color:"#EC407A" },
  { id:"autre",    label:"Autre",    icon:"ellipsis-horizontal", color:"#78909C" },
];

const FREQUENCIES = [
  { id:"daily",   label:"Quotidien", icon:"sunny-outline",    sub:"Chaque jour" },
  { id:"weekly",  label:"Hebdo",     icon:"calendar-outline", sub:"Par semaine" },
  { id:"monthly", label:"Mensuel",   icon:"calendar",         sub:"Par mois"    },
];

const PRIORITIES = [
  { id:"low",    label:"Basse",   color:"#10B981", bg:"#D1FAE5" },
  { id:"normal", label:"Normale", color:C.warning, bg:"#FFFBEB" },
  { id:"high",   label:"Haute",   color:C.expense, bg:"#FEF2F2" },
];

const fmtCFA = (n) => (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";

// ─────────────────────────────────────────────────────────────────────────────
// Props :
//   navigation  — react-navigation
//   route.params.objective — si fourni, mode ÉDITION
// ─────────────────────────────────────────────────────────────────────────────
const CreateGoalScreen = ({ navigation, route }) => {
  const dispatch  = useDispatch();
  const isLoading = useSelector((state) => state.objective.isLoading);

  // Mode édition si un objectif est passé en paramètre
  const editObj   = route?.params?.objective || null;
  const isEdit    = !!editObj;

  // ── États du formulaire ───────────────────────────────────────────────────
  const [title,     setTitle]     = useState(editObj?.titre             || "");
  const [targetAmt, setTarget]    = useState(editObj?.montant_cible     ? String(editObj.montant_cible) : "");
  const [initialAmt,setInitial]   = useState(editObj?.montant_actuel    ? String(editObj.montant_actuel): "");
  const [deadline,  setDeadline]  = useState(editObj?.date_limite       ? new Date(editObj.date_limite) : new Date(Date.now() + 90 * 86400000));
  const [showDate,  setShowDate]  = useState(false);
  const [frequency, setFrequency] = useState(editObj?.frequence_epargne || "monthly");
  const [category,  setCategory]  = useState(editObj?.categorie         || "");
  const [priority,  setPriority]  = useState(editObj?.priorite          || "normal");
  const [note,      setNote]      = useState(editObj?.note              || "");
  const [calcs,     setCalcs]     = useState(null);
  const [step,      setStep]      = useState(1);

  const fade   = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue:1, duration:600, useNativeDriver:true }),
      Animated.spring(slideX,{ toValue:0, tension:60, friction:9, useNativeDriver:true }),
    ]).start();
  }, []);

  // ── Calculs automatiques ──────────────────────────────────────────────────
  useEffect(() => {
    const target    = parseFloat(targetAmt)  || 0;
    const initial   = parseFloat(initialAmt) || 0;
    const remaining = target - initial;
    if (target < 1000 || remaining <= 0) { setCalcs(null); return; }
    const days    = Math.max(1, Math.ceil((deadline - new Date()) / 86400000));
    const daily   = remaining / days;
    const weekly  = daily * 7;
    const monthly = daily * 30;
    const per     = frequency==='daily' ? daily : frequency==='weekly' ? weekly : monthly;
    const periods = frequency==='daily' ? days  : frequency==='weekly' ? Math.ceil(days/7) : Math.ceil(days/30);
    setCalcs({
      daily:Math.ceil(daily), weekly:Math.ceil(weekly), monthly:Math.ceil(monthly),
      per:Math.ceil(per), periods, days,
      isRealistic: monthly < 120000,
      pct: Math.round((initial / target) * 100),
    });
  }, [targetAmt, initialAmt, deadline, frequency]);

  const isStep1Valid = title.length > 2 && category !== "";
  const isStep2Valid = parseFloat(targetAmt) > 0;
  const isAllValid   = isStep1Valid && isStep2Valid;

  // ── Navigation entre étapes ───────────────────────────────────────────────
  const animStep = (fn) => {
    Animated.timing(fade, { toValue:0, duration:150, useNativeDriver:true }).start(() => {
      fn();
      Animated.timing(fade, { toValue:1, duration:300, useNativeDriver:true }).start();
    });
  };
  const goNext = () => animStep(() => setStep(s => s + 1));
  const goBack = () => animStep(() => setStep(s => s - 1));

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isAllValid) {
      Alert.alert("Champs incomplets", "Remplissez tous les champs obligatoires.");
      return;
    }

    const payload = {
      titre:             title,
      montant_cible:     parseFloat(targetAmt),
      montant_actuel:    parseFloat(initialAmt) || 0,
      date_de_debut:     new Date().toISOString(),
      date_limite:       deadline.toISOString(),
      categorie:         category,
      frequence_epargne: frequency,
      priorite:          priority,
      note,
    };

    let result;
    if (isEdit) {
      result = await dispatch(updateObjective(editObj._id, payload));
    } else {
      result = await dispatch(createObjective(payload));
    }

    if (result?.success) {
      Alert.alert(
        isEdit ? "✅ Objectif modifié !" : "🎉 Objectif créé !",
        calcs ? `Épargnez ${fmtCFA(calcs.per)} ${frequency==='daily'?'/ jour':frequency==='weekly'?'/ semaine':'/ mois'} pour l'atteindre.` : "",
        [{ text: "Voir mes objectifs", onPress: () => navigation?.navigate?.("ObjectifsScreen") },
         { text: "OK", style: "default" }]
      );
    } else {
      Alert.alert("Erreur", result?.error || "Une erreur est survenue.");
    }
  };

  const selectedCat = CATEGORIES.find(c => c.id === category);

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.container}>

      {/* ── HEADER ── */}
      <LinearGradient colors={[C.primary, C.primaryMid]} style={styles.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco}/>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => step > 1 ? goBack() : navigation?.goBack?.()}>
            <Ionicons name="arrow-back" size={22} color="#FFF"/>
          </TouchableOpacity>
          <View style={{flex:1, alignItems:'center'}}>
            <Text style={styles.headerTitle}>{isEdit ? "Modifier l'objectif" : "Nouvel Objectif"}</Text>
            <Text style={styles.headerSub}>Étape {step} sur 3</Text>
          </View>
          <View style={{width:38}}/>
        </View>

        {/* Stepper */}
        <View style={styles.stepperRow}>
          {[1,2,3].map(s => (
            <React.Fragment key={s}>
              <View style={[styles.stepCircle, s <= step && styles.stepCircleActive]}>
                {s < step
                  ? <Ionicons name="checkmark" size={14} color="#FFF"/>
                  : <Text style={[styles.stepNum, s===step && {color:'#FFF'}]}>{s}</Text>
                }
              </View>
              {s < 3 && <View style={[styles.stepLine, s < step && styles.stepLineActive]}/>}
            </React.Fragment>
          ))}
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:4}}>
          {['Projet','Finances','Rythme'].map((l,i) => (
            <Text key={i} style={{fontSize:10, color: i+1<=step ? C.accent : 'rgba(255,255,255,0.45)', fontWeight:'600'}}>{l}</Text>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{paddingBottom:100}} showsVerticalScrollIndicator={false}>
        <Animated.View style={{opacity:fade, transform:[{translateX:slideX}], padding:20, marginTop:8}}>

          {/* ════ ÉTAPE 1 : PROJET ════ */}
          {step === 1 && (
            <>
              <Text style={styles.stepTitle}>Quel est votre projet ?</Text>

              <View style={styles.card}>
                <Text style={styles.lbl}>Nom de l'objectif *</Text>
                <View style={styles.inputRow}>
                  <View style={[styles.inputIcon, {backgroundColor:C.primaryLight}]}>
                    <Ionicons name="flag" size={18} color={C.primary}/>
                  </View>
                  <TextInput
                    style={styles.textIn}
                    placeholder="Ex: Voyage à Paris, Nouveau PC..."
                    value={title} onChangeText={setTitle} maxLength={50} autoFocus
                  />
                  <Text style={styles.charCount}>{title.length}/50</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.lbl}>Catégorie *</Text>
                <View style={styles.catGrid}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat.id} onPress={() => setCategory(cat.id)}
                      style={[styles.catBtn, category===cat.id && {backgroundColor:cat.color+'22', borderColor:cat.color, borderWidth:2}]}
                      activeOpacity={0.75}>
                      <View style={[styles.catBtnIcon, {backgroundColor:cat.color}]}>
                        <Ionicons name={cat.icon} size={18} color="#FFF"/>
                      </View>
                      <Text style={[styles.catBtnLbl, category===cat.id && {color:cat.color, fontWeight:'700'}]}>{cat.label}</Text>
                      {category===cat.id && <View style={styles.catCheck}><Ionicons name="checkmark" size={10} color="#FFF"/></View>}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.lbl}>Description (optionnel)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Décrivez votre objectif, vos motivations..."
                  value={note} onChangeText={setNote}
                  multiline numberOfLines={3} textAlignVertical="top"
                  placeholderTextColor={C.grayLight}
                />
              </View>
            </>
          )}

          {/* ════ ÉTAPE 2 : FINANCES ════ */}
          {step === 2 && (
            <>
              <Text style={styles.stepTitle}>Les chiffres</Text>

              {selectedCat && (
                <View style={[styles.recapChip, {backgroundColor:selectedCat.color+'18'}]}>
                  <View style={[styles.recapChipIcon, {backgroundColor:selectedCat.color}]}>
                    <Ionicons name={selectedCat.icon} size={16} color="#FFF"/>
                  </View>
                  <Text style={{fontSize:14, fontWeight:'700', color:selectedCat.color, flex:1}}>{title || selectedCat.label}</Text>
                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text style={{fontSize:12, color:C.gray}}>Modifier →</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.card}>
                <Text style={styles.lbl}>Montant cible *</Text>
                <View style={styles.amountRow}>
                  <View style={[styles.currencyBadge, {backgroundColor:C.primaryLight}]}>
                    <Text style={[styles.currencyTxt, {color:C.primary}]}>FCFA</Text>
                  </View>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0" keyboardType="numeric"
                    value={targetAmt} onChangeText={t => setTarget(t.replace(/[^0-9]/g,''))}
                    autoFocus
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.lbl}>Déjà épargné</Text>
                <View style={styles.amountRow}>
                  <View style={[styles.currencyBadge, {backgroundColor:C.borderLight}]}>
                    <Text style={[styles.currencyTxt, {color:C.gray}]}>FCFA</Text>
                  </View>
                  <TextInput
                    style={[styles.amountInput, {color:C.gray}]}
                    placeholder="0" keyboardType="numeric"
                    value={initialAmt} onChangeText={t => setInitial(t.replace(/[^0-9]/g,''))}
                  />
                </View>
                {parseFloat(initialAmt) > 0 && (
                  <Text style={{fontSize:12, color:C.primary, marginTop:8, fontWeight:'600'}}>
                    ✅ Super ! Tu as déjà {fmtCFA(parseFloat(initialAmt))} de côté.
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.dateCard} onPress={() => setShowDate(true)}>
                <View style={[styles.dateIconWrap, {backgroundColor:C.primaryLight}]}>
                  <Ionicons name="calendar" size={22} color={C.primary}/>
                </View>
                <View style={{flex:1, marginLeft:12}}>
                  <Text style={styles.lbl}>Date limite *</Text>
                  <Text style={styles.dateVal}>
                    {deadline.toLocaleDateString('fr-FR', {weekday:'short', day:'numeric', month:'long', year:'numeric'})}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.grayLight}/>
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker value={deadline} mode="date" minimumDate={new Date()}
                  onChange={(e,d) => { setShowDate(false); if(d) setDeadline(d); }}/>
              )}

              {calcs && calcs.pct > 0 && (
                <View style={[styles.card, {backgroundColor:C.primaryLight}]}>
                  <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                    <Text style={{fontSize:13, fontWeight:'600', color:C.primary}}>Progression actuelle</Text>
                    <Text style={{fontSize:14, fontWeight:'800', color:C.primary}}>{calcs.pct}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, {width:Math.min(calcs.pct,100)+'%', backgroundColor:C.primary}]}/>
                  </View>
                </View>
              )}
            </>
          )}

          {/* ════ ÉTAPE 3 : RYTHME ════ */}
          {step === 3 && (
            <>
              <Text style={styles.stepTitle}>Votre rythme</Text>

              <View style={styles.card}>
                <Text style={styles.lbl}>Fréquence d'épargne</Text>
                <View style={{flexDirection:'row', gap:10, marginTop:4}}>
                  {FREQUENCIES.map(f => (
                    <TouchableOpacity key={f.id} onPress={() => setFrequency(f.id)}
                      style={[styles.freqCard, frequency===f.id && styles.freqCardActive]} activeOpacity={0.8}>
                      {frequency===f.id
                        ? <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.freqGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                            <Ionicons name={f.icon} size={22} color={C.accent}/>
                            <Text style={styles.freqLblActive}>{f.label}</Text>
                            <Text style={styles.freqSubActive}>{f.sub}</Text>
                          </LinearGradient>
                        : <View style={styles.freqGrad}>
                            <Ionicons name={f.icon} size={22} color={C.grayLight}/>
                            <Text style={styles.freqLbl}>{f.label}</Text>
                            <Text style={styles.freqSub}>{f.sub}</Text>
                          </View>
                      }
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.lbl}>Priorité</Text>
                <View style={{flexDirection:'row', gap:8, marginTop:4}}>
                  {PRIORITIES.map(p => (
                    <TouchableOpacity key={p.id} onPress={() => setPriority(p.id)}
                      style={[styles.prioBtn, {borderColor: priority===p.id ? p.color : C.border, backgroundColor: priority===p.id ? p.bg : C.card}]}>
                      <View style={[styles.prioDot, {backgroundColor:p.color}]}/>
                      <Text style={[styles.prioTxt, priority===p.id && {color:p.color, fontWeight:'700'}]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Résultat calcul */}
              {calcs ? (
                <LinearGradient
                  colors={calcs.isRealistic ? [C.primary,C.primaryMid] : [C.warning,'#D97706']}
                  style={styles.resultCard} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <View style={styles.resultDeco}/>
                  <View style={{flexDirection:'row', alignItems:'center', marginBottom:14, gap:10}}>
                    <Ionicons name={calcs.isRealistic?"checkmark-circle":"warning"} size={26} color={calcs.isRealistic?C.accent:"#FFF"}/>
                    <Text style={styles.resultTitle}>{calcs.isRealistic ? "Objectif réalisable !" : "Objectif ambitieux"}</Text>
                  </View>
                  <View style={styles.resultAmountBox}>
                    <Text style={{fontSize:12, color:'rgba(255,255,255,0.75)', marginBottom:4}}>
                      À épargner {frequency==='daily'?'chaque jour':frequency==='weekly'?'chaque semaine':'chaque mois'}
                    </Text>
                    <Text style={styles.resultAmount}>{fmtCFA(calcs.per)}</Text>
                  </View>
                  <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:16}}>
                    {[{lbl:'Jours',val:calcs.days},{lbl:'Versements',val:calcs.periods},{lbl:'Épargné',val:calcs.pct+'%'}].map((s,i) => (
                      <React.Fragment key={i}>
                        {i>0 && <View style={{width:1, backgroundColor:'rgba(255,255,255,0.2)'}}/>}
                        <View style={{flex:1, alignItems:'center', gap:3}}>
                          <Text style={{fontSize:18, fontWeight:'900', color:'#FFF'}}>{s.val}</Text>
                          <Text style={{fontSize:10, color:'rgba(255,255,255,0.65)'}}>{s.lbl}</Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                  {!calcs.isRealistic && (
                    <View style={styles.warnBox}>
                      <Ionicons name="alert-circle" size={16} color="#FFF"/>
                      <Text style={{flex:1, fontSize:12, color:'rgba(255,255,255,0.9)', lineHeight:17, marginLeft:8}}>
                        Ce montant dépasse 40% de revenus estimés. Allongez la durée ou réduisez l'objectif.
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              ) : (
                <View style={[styles.card, {alignItems:'center', paddingVertical:24, gap:8}]}>
                  <Ionicons name="calculator-outline" size={36} color={C.border}/>
                  <Text style={{fontSize:14, color:C.grayLight, fontWeight:'500'}}>Renseignez un montant cible</Text>
                  <TouchableOpacity onPress={() => setStep(2)}>
                    <Text style={{fontSize:13, color:C.primary, fontWeight:'700'}}>← Retour aux finances</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* ── Navigation étapes ── */}
          <View style={{flexDirection:'row', gap:12, marginTop:8}}>
            {step > 1 && (
              <TouchableOpacity style={styles.backStepBtn} onPress={goBack}>
                <Ionicons name="arrow-back" size={20} color={C.primary}/>
                <Text style={{fontSize:14, fontWeight:'700', color:C.primary}}>Retour</Text>
              </TouchableOpacity>
            )}
            {step < 3
              ? <TouchableOpacity style={[styles.nextBtn, {flex:1}]} onPress={() => {
                  if (step===1 && !isStep1Valid) { Alert.alert("Incomplet","Entrez un titre et choisissez une catégorie."); return; }
                  if (step===2 && !isStep2Valid) { Alert.alert("Incomplet","Entrez un montant cible."); return; }
                  goNext();
                }} activeOpacity={0.85}>
                  <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.nextGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                    <Text style={styles.nextTxt}>Continuer</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF"/>
                  </LinearGradient>
                </TouchableOpacity>
              : <TouchableOpacity
                  style={[styles.nextBtn, {flex:1, opacity: isAllValid && !isLoading ? 1 : 0.5}]}
                  onPress={handleSave}
                  disabled={!isAllValid || isLoading}
                  activeOpacity={0.85}>
                  <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.nextGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                    {isLoading
                      ? <ActivityIndicator size="small" color="#FFF"/>
                      : <>
                          <Ionicons name="flag" size={20} color="#FFF"/>
                          <Text style={styles.nextTxt}>{isEdit ? "Modifier" : "Créer mon objectif"}</Text>
                        </>
                    }
                  </LinearGradient>
                </TouchableOpacity>
            }
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  header: { paddingTop:50, paddingBottom:20, paddingHorizontal:20, overflow:'hidden' },
  heroDeco: { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(20,255,236,0.06)', top:-80, right:-50 },
  headerRow: { flexDirection:'row', alignItems:'center', marginBottom:20 },
  backBtn: { width:38, height:38, borderRadius:12, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  headerTitle: { fontSize:20, fontWeight:'800', color:'#FFF' },
  headerSub: { fontSize:12, color:'rgba(255,255,255,0.7)' },
  stepperRow: { flexDirection:'row', alignItems:'center', justifyContent:'center' },
  stepCircle: { width:30, height:30, borderRadius:15, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.3)' },
  stepCircleActive: { backgroundColor:C.primary, borderColor:C.accent },
  stepNum: { fontSize:13, fontWeight:'800', color:'rgba(255,255,255,0.5)' },
  stepLine: { flex:1, height:2, backgroundColor:'rgba(255,255,255,0.2)', maxWidth:60 },
  stepLineActive: { backgroundColor:C.accent },
  stepTitle: { fontSize:22, fontWeight:'800', color:C.dark, marginBottom:18 },
  card: { backgroundColor:C.card, borderRadius:18, padding:16, marginBottom:12, shadowColor:'#0D7377', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:10, elevation:2 },
  lbl: { fontSize:12, fontWeight:'700', color:C.grayLight, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 },
  inputRow: { flexDirection:'row', alignItems:'center', gap:10 },
  inputIcon: { width:38, height:38, borderRadius:10, justifyContent:'center', alignItems:'center' },
  textIn: { flex:1, fontSize:15, color:C.dark, fontWeight:'600', paddingVertical:4 },
  charCount: { fontSize:11, color:C.grayLight },
  textArea: { fontSize:14, color:C.dark, lineHeight:21, minHeight:70 },
  catGrid: { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:4 },
  catBtn: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.borderLight, borderRadius:22, paddingHorizontal:12, paddingVertical:8, borderWidth:1.5, borderColor:'transparent', position:'relative' },
  catBtnIcon: { width:28, height:28, borderRadius:9, justifyContent:'center', alignItems:'center' },
  catBtnLbl: { fontSize:13, fontWeight:'600', color:C.gray },
  catCheck: { position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:8, backgroundColor:C.primary, justifyContent:'center', alignItems:'center' },
  recapChip: { flexDirection:'row', alignItems:'center', gap:10, borderRadius:14, padding:12, marginBottom:12 },
  recapChipIcon: { width:34, height:34, borderRadius:10, justifyContent:'center', alignItems:'center' },
  amountRow: { flexDirection:'row', alignItems:'center', gap:12, marginTop:4 },
  currencyBadge: { paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  currencyTxt: { fontSize:13, fontWeight:'800' },
  amountInput: { flex:1, fontSize:34, fontWeight:'900', color:C.dark, padding:0 },
  dateCard: { flexDirection:'row', alignItems:'center', backgroundColor:C.card, borderRadius:18, padding:16, marginBottom:12, shadowColor:'#0D7377', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:10, elevation:2 },
  dateIconWrap: { width:48, height:48, borderRadius:14, justifyContent:'center', alignItems:'center' },
  dateVal: { fontSize:15, fontWeight:'700', color:C.dark, marginTop:4 },
  barBg: { height:8, backgroundColor:'rgba(13,115,119,0.15)', borderRadius:4, overflow:'hidden' },
  barFill: { height:'100%', borderRadius:4 },
  freqCard: { flex:1, borderRadius:16, overflow:'hidden', borderWidth:1.5, borderColor:C.border },
  freqCardActive: { borderColor:'transparent', shadowColor:C.primary, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8, elevation:5 },
  freqGrad: { alignItems:'center', paddingVertical:16, paddingHorizontal:8, gap:4 },
  freqLbl: { fontSize:13, fontWeight:'600', color:C.grayLight, marginTop:4 },
  freqLblActive: { fontSize:13, fontWeight:'700', color:'#FFF', marginTop:4 },
  freqSub: { fontSize:10, color:C.grayLight },
  freqSubActive: { fontSize:10, color:'rgba(255,255,255,0.6)' },
  prioBtn: { flex:1, flexDirection:'row', alignItems:'center', gap:6, borderRadius:14, borderWidth:1.5, padding:12, justifyContent:'center' },
  prioDot: { width:8, height:8, borderRadius:4 },
  prioTxt: { fontSize:13, fontWeight:'600', color:C.gray },
  resultCard: { borderRadius:20, padding:20, marginBottom:12, overflow:'hidden' },
  resultDeco: { position:'absolute', width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.06)', top:-70, right:-50 },
  resultTitle: { fontSize:18, fontWeight:'800', color:'#FFF' },
  resultAmountBox: { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:14, padding:14, alignItems:'center' },
  resultAmount: { fontSize:28, fontWeight:'900', color:'#FFF' },
  warnBox: { flexDirection:'row', alignItems:'flex-start', backgroundColor:'rgba(0,0,0,0.15)', borderRadius:12, padding:12, marginTop:14 },
  backStepBtn: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:C.card, borderRadius:14, paddingHorizontal:16, paddingVertical:14, borderWidth:1.5, borderColor:C.border },
  nextBtn: { borderRadius:14, overflow:'hidden' },
  nextGrad: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:16 },
  nextTxt: { fontSize:16, fontWeight:'800', color:'#FFF' },
});

export default CreateGoalScreen;