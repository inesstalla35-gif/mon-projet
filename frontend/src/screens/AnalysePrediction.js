import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getTransactions } from '../actions/Transactionactions';
import { getObjectives }   from '../actions/objectiveActions';
import { selectTransactions, selectBalance, selectTotalIncome, selectTotalExpense } from '../reducers/Transactionreducer';

const { width } = Dimensions.get('window');
const C = {
  primary:'#0D7377', primaryMid:'#14919B', primaryLight:'#E6F7F7', accent:'#14FFEC',
  dark:'#111827', dark2:'#1F2937', gray:'#6B7280', grayLight:'#9CA3AF',
  border:'#E5E7EB', borderLight:'#F3F4F6', bg:'#F8FFFE', card:'#FFFFFF',
  income:'#0D7377', incomeLight:'#E6F7F7',
  expense:'#EF4444', expenseLight:'#FEF2F2',
  purple:'#8B5CF6', purpleLight:'#EDE9FE',
  orange:'#F59E0B', orangeLight:'#FFFBEB',
  blue:'#3B82F6',
};
const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const fmt  = (n) => Math.abs(n||0).toLocaleString('fr-FR') + ' F';
const fmtK = (n) => { const v = Math.abs(n||0); return v>=1000000?(v/1000000).toFixed(1)+'M F':v>=1000?(v/1000).toFixed(0)+'K F':v+' F'; };

// ══════════════════════════════════════════════════════════════
// MOTEUR D'ANALYSE — calculs purs JS
// ══════════════════════════════════════════════════════════════

/** Données mensuelles sur N mois glissants */
const getMonthlyData = (transactions, nMonths = 6) => {
  const now = new Date();
  const result = [];
  for (let i = nMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTHS_FR[d.getMonth()];
    const monthTx = transactions.filter(tx => {
      const txD = new Date(tx.date || tx.createdAt);
      return txD.getMonth() === d.getMonth() && txD.getFullYear() === d.getFullYear();
    });
    const income  = monthTx.filter(t => t.type==='income') .reduce((s,t)=>s+(t.amount||0),0);
    const expense = monthTx.filter(t => t.type==='expense').reduce((s,t)=>s+(t.amount||0),0);
    result.push({ label, income, expense, saving: income - expense, month: d.getMonth(), year: d.getFullYear() });
  }
  return result;
};

/** Régression linéaire simple y = a*x + b */
const linearRegression = (values) => {
  const n = values.length;
  if (n < 2) return { a:0, b:values[0]||0, predict:(x)=>values[0]||0 };
  const sumX  = values.reduce((_,__,i)=>_+i, 0);
  const sumY  = values.reduce((s,v)=>s+v, 0);
  const sumXY = values.reduce((s,v,i)=>s+i*v, 0);
  const sumX2 = values.reduce((s,_,i)=>s+i*i, 0);
  const a = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
  const b = (sumY - a*sumX) / n;
  return { a, b, predict: (x) => Math.max(0, a*x + b) };
};

/** Score de discipline financière 0–100 */
const calcScore = (totalIncome, totalExpense, monthlyData, objectives) => {
  if (totalIncome === 0) return 0;
  let score = 0;
  // Taux d'épargne (40 pts)
  const savingRate = (totalIncome - totalExpense) / totalIncome;
  score += Math.min(40, Math.max(0, savingRate * 80));
  // Régularité revenus (20 pts) — faible variance = bon
  const incomes = monthlyData.map(m => m.income).filter(v=>v>0);
  if (incomes.length > 1) {
    const mean = incomes.reduce((a,b)=>a+b,0)/incomes.length;
    const variance = incomes.reduce((s,v)=>s+(v-mean)**2,0)/incomes.length;
    const cv = mean > 0 ? Math.sqrt(variance)/mean : 1;
    score += Math.max(0, 20 - cv*20);
  }
  // Tendance épargne (20 pts) — si épargne croît
  const savings = monthlyData.map(m => m.saving);
  const reg = linearRegression(savings);
  if (reg.a > 0) score += Math.min(20, (reg.a / (totalIncome/6)) * 40);
  // Objectifs actifs (20 pts)
  if (objectives.length > 0) score += Math.min(20, objectives.length * 5);
  return Math.round(Math.min(100, Math.max(0, score)));
};

/** Prédiction : dans combien de mois atteindre un montant cible */
const predictMonthsToGoal = (currentAmount, targetAmount, monthlySaving) => {
  if (monthlySaving <= 0) return null;
  return Math.ceil((targetAmount - currentAmount) / monthlySaving);
};

/** Répartition dépenses par catégorie */
const getCatBreakdown = (transactions) => {
  const map = {};
  const totalExp = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+(t.amount||0),0);
  transactions.filter(t=>t.type==='expense').forEach(tx => {
    const cat = tx.categorie || tx.category || 'Autre';
    map[cat] = (map[cat]||0) + (tx.amount||0);
  });
  return Object.entries(map)
    .sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([nom,montant]) => ({ nom, montant, pct: totalExp>0?Math.round((montant/totalExp)*100):0 }));
};

const CAT_ICONS = { logement:'home', alimentation:'restaurant', transport:'car', loisirs:'game-controller', sante:'medkit', salaire:'briefcase', autre:'ellipsis-horizontal' };
const catIcon = (nom) => CAT_ICONS[(nom||'').toLowerCase()] || 'ellipsis-horizontal';
const CAT_COLORS = [C.primary,'#14919B',C.purple,C.orange,C.blue,'#10B981'];

// ══════════════════════════════════════════════════════════════

const AnalysePrediction = () => {
  const dispatch    = useDispatch();
  const [periode, setPeriode] = useState(6);
  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  const transactions  = useSelector(selectTransactions);
  const balance       = useSelector(selectBalance);
  const totalIncome   = useSelector(selectTotalIncome);
  const totalExpense  = useSelector(selectTotalExpense);
  const allObjectives = useSelector(s => s.objective.objectives);
  const loading       = useSelector(s => s.transaction.isLoading || s.objective.isLoading);

  const objectives = useMemo(
    () => allObjectives.filter(o=>(o.montant_actuel||0)<(o.montant_cible||1)),
    [allObjectives]
  );

  useEffect(()=>{
    dispatch(getTransactions());
    dispatch(getObjectives());
    Animated.parallel([
      Animated.timing(fade,   { toValue:1, duration:600, useNativeDriver:true }),
      Animated.spring(slideY, { toValue:0, tension:55, friction:8, useNativeDriver:true }),
    ]).start();
  },[]);

  const onRefresh = () => { dispatch(getTransactions()); dispatch(getObjectives()); };

  // ── Calculs mémorisés ──────────────────────────────────────
  const monthlyData  = useMemo(()=>getMonthlyData(transactions, periode), [transactions, periode]);
  const catBreakdown = useMemo(()=>getCatBreakdown(transactions), [transactions]);

  const incomeReg  = useMemo(()=>linearRegression(monthlyData.map(m=>m.income)),  [monthlyData]);
  const expenseReg = useMemo(()=>linearRegression(monthlyData.map(m=>m.expense)), [monthlyData]);
  const savingReg  = useMemo(()=>linearRegression(monthlyData.map(m=>m.saving)),  [monthlyData]);

  // Prédictions mois prochain
  const nextMonthIncome  = Math.round(incomeReg.predict(periode));
  const nextMonthExpense = Math.round(expenseReg.predict(periode));
  const nextMonthSaving  = Math.max(0, nextMonthIncome - nextMonthExpense);

  // Moyenne mensuelle d'épargne (sur les mois avec revenus)
  const activeMths = monthlyData.filter(m=>m.income>0);
  const avgMonthlySaving = activeMths.length>0
    ? activeMths.reduce((s,m)=>s+m.saving,0)/activeMths.length : 0;

  const score      = useMemo(()=>calcScore(totalIncome,totalExpense,monthlyData,objectives),[totalIncome,totalExpense,monthlyData,objectives]);
  const scoreColor = score>=80?C.income:score>=60?C.orange:C.expense;
  const scoreLbl   = score>=80?'Excellent 🏆':score>=60?'Bon 👍':score>=40?'Moyen ⚠️':'À améliorer 🔴';
  const savingRate = totalIncome>0?Math.round(((totalIncome-totalExpense)/totalIncome)*100):0;

  // Tendances
  const incomeTrend  = incomeReg.a > 500  ? 'hausse' : incomeReg.a < -500  ? 'baisse' : 'stable';
  const expenseTrend = expenseReg.a > 500 ? 'hausse' : expenseReg.a < -500 ? 'baisse' : 'stable';

  // Recommandations dynamiques
  const recommendations = useMemo(()=>{
    const recs = [];
    const ratio = totalIncome>0?totalExpense/totalIncome:0;
    if (ratio>0.8) recs.push({ icon:'warning', color:C.expense, bg:C.expenseLight, titre:'Dépenses trop élevées', msg:`Tu dépenses ${Math.round(ratio*100)}% de tes revenus. Objectif : passer sous 70% pour épargner davantage.` });
    else if (ratio<0.5&&totalIncome>0) recs.push({ icon:'trending-up', color:C.income, bg:C.incomeLight, titre:'Excellent taux d\'épargne !', msg:`Tu épargnes ${100-Math.round(ratio*100)}% de tes revenus. Continue, tu es sur la bonne voie.` });
    if (incomeTrend==='hausse') recs.push({ icon:'arrow-up-circle', color:C.income, bg:C.incomeLight, titre:'Revenus en progression', msg:`Tes revenus augmentent d'environ ${fmtK(incomeReg.a)} par mois. Profite-en pour épargner plus.` });
    if (expenseTrend==='hausse') recs.push({ icon:'alert-circle', color:C.orange, bg:C.orangeLight, titre:'Dépenses en hausse', msg:`Tes dépenses augmentent d'environ ${fmtK(expenseReg.a)} par mois. Surveille tes postes les plus importants.` });
    if (catBreakdown.length>0&&catBreakdown[0].pct>40) recs.push({ icon:'pie-chart', color:C.purple, bg:C.purpleLight, titre:`${catBreakdown[0].nom} domine`, msg:`${catBreakdown[0].pct}% de tes dépenses vont en ${catBreakdown[0].nom}. Essaie de diversifier.` });
    if (objectives.length===0&&totalIncome>0) recs.push({ icon:'flag', color:C.blue, bg:'#EFF6FF', titre:'Définis un objectif', msg:'Tu n\'as aucun objectif d\'épargne. Fixe-toi un but pour rester motivé.' });
    objectives.forEach(o=>{
      const months = predictMonthsToGoal(o.montant_actuel||0, o.montant_cible||1, avgMonthlySaving);
      if (months!==null&&months>0&&months<24) recs.push({ icon:'flag-outline', color:C.primary, bg:C.primaryLight, titre:`Objectif "${o.titre||o.nom}"`, msg:`À ce rythme, tu l'atteindras dans environ ${months} mois${months<=6?' 🎯':''}.` });
    });
    if (recs.length===0) recs.push({ icon:'checkmark-circle', color:C.income, bg:C.incomeLight, titre:'Finances saines', msg:'Tes finances sont bien équilibrées. Continue à suivre tes dépenses régulièrement !' });
    return recs.slice(0,4);
  },[totalIncome,totalExpense,incomeTrend,expenseTrend,catBreakdown,objectives,avgMonthlySaving]);

  const maxBar = Math.max(...monthlyData.map(m=>Math.max(m.income,m.expense,1)));

  // ─────────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.root} contentContainerStyle={{paddingBottom:110}}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={C.primary}/>}
    >
      {/* HEADER */}
      <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco1}/><View style={styles.heroDeco2}/>
        <Text style={styles.heroTitle}>Analyses & Prédictions</Text>
        <Text style={styles.heroSub}>Basées sur tes vraies données</Text>
        <View style={styles.periodRow}>
          {[{v:3,l:'3 mois'},{v:6,l:'6 mois'},{v:12,l:'12 mois'}].map(p=>(
            <TouchableOpacity key={p.v} style={[styles.periodBtn,periode===p.v&&styles.periodBtnActive]} onPress={()=>setPeriode(p.v)}>
              <Text style={[styles.periodTxt,periode===p.v&&styles.periodTxtActive]}>{p.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <Animated.View style={{opacity:fade,transform:[{translateY:slideY}]}}>

        {/* ── SCORE DE DISCIPLINE ── */}
        <View style={[styles.card,{marginTop:16}]}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <Text style={styles.cardTitle}>Score de discipline</Text>
            <View style={[styles.badge,{backgroundColor:scoreColor+'18'}]}>
              <Text style={[styles.badgeTxt,{color:scoreColor}]}>{scoreLbl}</Text>
            </View>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:20}}>
            {/* Cercle */}
            <View style={[styles.scoreRing,{borderColor:scoreColor+'30'}]}>
              <View style={[styles.scoreInner,{borderColor:scoreColor}]}>
                <Text style={[styles.scoreNum,{color:scoreColor}]}>{score}</Text>
                <Text style={[styles.scoreSub,{color:scoreColor}]}>/100</Text>
              </View>
            </View>
            <View style={{flex:1,gap:10}}>
              {[
                {lbl:'Taux d\'épargne', val:savingRate+'%',        color:savingRate>=30?C.income:C.expense},
                {lbl:'Revenus totaux',  val:fmtK(totalIncome),     color:C.income},
                {lbl:'Dépenses totales',val:fmtK(totalExpense),    color:C.expense},
                {lbl:'Solde net',       val:fmtK(balance),         color:balance>=0?C.income:C.expense},
              ].map((s,i)=>(
                <View key={i} style={{flexDirection:'row',justifyContent:'space-between'}}>
                  <Text style={{fontSize:12,color:C.gray}}>{s.lbl}</Text>
                  <Text style={{fontSize:13,fontWeight:'800',color:s.color}}>{s.val}</Text>
                </View>
              ))}
            </View>
          </View>
          {/* Barre de score */}
          <View style={[styles.barBg,{marginTop:16,height:8}]}>
            <LinearGradient
              colors={score>=80?[C.income,C.accent]:score>=60?[C.orange,'#FCD34D']:[C.expense,'#FCA5A5']}
              style={[styles.barFill,{width:score+'%',height:'100%'}]}
              start={{x:0,y:0}} end={{x:1,y:0}}
            />
          </View>
        </View>

        {/* ── ÉVOLUTION MENSUELLE ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Évolution sur {periode} mois</Text>
        </View>
        <View style={styles.card}>
          {/* Légende */}
          <View style={{flexDirection:'row',gap:16,marginBottom:14}}>
            {[{color:C.income,lbl:'Revenus'},{color:C.expense,lbl:'Dépenses'},{color:C.purple,lbl:'Épargne'}].map((l,i)=>(
              <View key={i} style={{flexDirection:'row',alignItems:'center',gap:5}}>
                <View style={{width:10,height:10,borderRadius:3,backgroundColor:l.color}}/>
                <Text style={{fontSize:11,color:C.gray,fontWeight:'600'}}>{l.lbl}</Text>
              </View>
            ))}
          </View>
          {/* Barres par mois */}
          {monthlyData.map((m,i)=>(
            <View key={i} style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8}}>
              <Text style={{fontSize:11,color:C.grayLight,width:28}}>{m.label}</Text>
              <View style={{flex:1,gap:3}}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill,{width:maxBar>0?(m.income/maxBar*100)+'%':'0%',backgroundColor:C.income}]}/>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill,{width:maxBar>0?(m.expense/maxBar*100)+'%':'0%',backgroundColor:C.expense}]}/>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill,{width:maxBar>0?(Math.max(0,m.saving)/maxBar*100)+'%':'0%',backgroundColor:C.purple}]}/>
                </View>
              </View>
              <Text style={{fontSize:10,color:m.saving>=0?C.income:C.expense,width:54,textAlign:'right',fontWeight:'700'}}>
                {m.saving>=0?'+':''}{fmtK(m.saving)}
              </Text>
            </View>
          ))}
          {/* Totaux période */}
          <View style={[styles.totalRow,{marginTop:12}]}>
            {[
              {lbl:'Total revenus', val:fmtK(monthlyData.reduce((s,m)=>s+m.income,0)),  color:C.income},
              {lbl:'Total dépenses',val:fmtK(monthlyData.reduce((s,m)=>s+m.expense,0)), color:C.expense},
              {lbl:'Total épargne', val:fmtK(monthlyData.reduce((s,m)=>s+m.saving,0)),  color:C.purple},
            ].map((t,i)=>(
              <View key={i} style={styles.totalItem}>
                <Text style={{fontSize:11,color:C.grayLight,marginBottom:3}}>{t.lbl}</Text>
                <Text style={{fontSize:13,fontWeight:'800',color:t.color}}>{t.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TENDANCES & PRÉDICTIONS ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Prédictions mois prochain</Text>
          <View style={styles.aiBadge}><Text style={styles.aiBadgeTxt}>📈 Régression linéaire</Text></View>
        </View>
        <LinearGradient colors={[C.dark2,C.dark]} style={[styles.card,{gap:0}]} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={styles.predDeco}/>

          {/* Tendances */}
          <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
            {[
              { lbl:'Tendance revenus',  val:incomeTrend,  icon:incomeTrend==='hausse'?'trending-up':incomeTrend==='baisse'?'trending-down':'remove', color:incomeTrend==='hausse'?C.income:incomeTrend==='baisse'?C.expense:C.grayLight },
              { lbl:'Tendance dépenses', val:expenseTrend, icon:expenseTrend==='hausse'?'trending-up':expenseTrend==='baisse'?'trending-down':'remove', color:expenseTrend==='hausse'?C.expense:expenseTrend==='baisse'?C.income:C.grayLight },
            ].map((t,i)=>(
              <View key={i} style={styles.trendCard}>
                <Ionicons name={t.icon} size={20} color={t.color}/>
                <Text style={[styles.trendVal,{color:t.color}]}>{t.val.charAt(0).toUpperCase()+t.val.slice(1)}</Text>
                <Text style={styles.trendLbl}>{t.lbl}</Text>
              </View>
            ))}
          </View>

          {/* Prédictions chiffrées */}
          <View style={{flexDirection:'row',gap:8}}>
            {[
              {lbl:'Revenus estimés',  val:fmtK(nextMonthIncome),  color:C.accent, icon:'arrow-down-circle'},
              {lbl:'Dépenses estimées',val:fmtK(nextMonthExpense), color:'#FF8A80', icon:'arrow-up-circle'},
              {lbl:'Épargne estimée',  val:fmtK(nextMonthSaving),  color:C.accent, icon:'save'},
            ].map((p,i)=>(
              <View key={i} style={styles.predCard}>
                <Ionicons name={p.icon} size={18} color={p.color}/>
                <Text style={[styles.predVal,{color:p.color}]}>{p.val}</Text>
                <Text style={styles.predLbl}>{p.lbl}</Text>
              </View>
            ))}
          </View>

          {/* Note */}
          <Text style={{color:'rgba(255,255,255,0.3)',fontSize:10,marginTop:12,textAlign:'center'}}>
            Basé sur la tendance des {periode} derniers mois · Pas une garantie financière
          </Text>
        </LinearGradient>

        {/* ── PRÉDICTIONS OBJECTIFS ── */}
        {objectives.length>0 && (
          <>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Date d'atteinte estimée</Text>
            </View>
            <View style={[styles.card,{gap:10}]}>
              {objectives.map((obj,i)=>{
                const actuel  = obj.montant_actuel||0;
                const cible   = obj.montant_cible||1;
                const pct     = Math.min(Math.round((actuel/cible)*100),100);
                const reste   = Math.max(0,cible-actuel);
                const months  = avgMonthlySaving>0?predictMonthsToGoal(actuel,cible,avgMonthlySaving):null;
                const color   = CAT_COLORS[i%CAT_COLORS.length];
                const dateEst = months!=null ? (() => {
                  const d = new Date(); d.setMonth(d.getMonth()+months);
                  return d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
                })() : null;
                return (
                  <View key={obj._id||i} style={[styles.objRow, i<objectives.length-1&&{borderBottomWidth:1,borderBottomColor:C.borderLight}]}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:8}}>
                      <View style={[styles.objDot,{backgroundColor:color+'22'}]}>
                        <Ionicons name={obj.icone||'flag'} size={16} color={color}/>
                      </View>
                      <Text style={{flex:1,fontSize:14,fontWeight:'700',color:C.dark}}>{obj.titre||obj.nom}</Text>
                      <Text style={{fontSize:14,fontWeight:'900',color}}>{pct}%</Text>
                    </View>
                    <View style={styles.barBg}>
                      <LinearGradient colors={[color,color+'77']} style={[styles.barFill,{width:pct+'%',height:'100%'}]} start={{x:0,y:0}} end={{x:1,y:0}}/>
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:6}}>
                      <Text style={{fontSize:11,color:C.grayLight}}>{fmtK(actuel)} / {fmtK(cible)}</Text>
                      {dateEst ? (
                        <Text style={{fontSize:11,color,fontWeight:'700'}}>🎯 ~{dateEst}</Text>
                      ) : (
                        <Text style={{fontSize:11,color:C.grayLight}}>Épargne {fmtK(reste)} restant</Text>
                      )}
                    </View>
                    {avgMonthlySaving>0&&months!=null&&(
                      <Text style={{fontSize:11,color:C.grayLight,marginTop:3}}>
                        À {fmtK(avgMonthlySaving)}/mois · encore {months} mois
                      </Text>
                    )}
                  </View>
                );
              })}
              {avgMonthlySaving<=0&&(
                <Text style={{fontSize:12,color:C.grayLight,textAlign:'center',padding:8}}>
                  Commence à épargner pour voir tes prédictions 💡
                </Text>
              )}
            </View>
          </>
        )}

        {/* ── RÉPARTITION DÉPENSES ── */}
        {catBreakdown.length>0&&(
          <>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Répartition des dépenses</Text>
            </View>
            <View style={styles.card}>
              {catBreakdown.map((cat,i)=>(
                <View key={i} style={[styles.catRow, i<catBreakdown.length-1&&{borderBottomWidth:1,borderBottomColor:C.borderLight}]}>
                  <View style={[styles.catIcon,{backgroundColor:CAT_COLORS[i]+'18'}]}>
                    <Ionicons name={catIcon(cat.nom)} size={18} color={CAT_COLORS[i]}/>
                  </View>
                  <View style={{flex:1,marginLeft:12}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
                      <Text style={{fontSize:14,fontWeight:'600',color:C.dark}}>{cat.nom}</Text>
                      <View style={{alignItems:'flex-end'}}>
                        <Text style={{fontSize:13,fontWeight:'800',color:CAT_COLORS[i]}}>{fmtK(cat.montant)}</Text>
                        <Text style={{fontSize:10,color:C.grayLight}}>{cat.pct}% des dépenses</Text>
                      </View>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill,{width:cat.pct+'%',backgroundColor:CAT_COLORS[i]}]}/>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── RECOMMANDATIONS ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Recommandations</Text>
          <Text style={{fontSize:11,color:C.grayLight}}>Basées sur tes données</Text>
        </View>
        <View style={{paddingHorizontal:20,gap:10}}>
          {recommendations.map((r,i)=>(
            <View key={i} style={[styles.recCard,{borderLeftColor:r.color}]}>
              <View style={[styles.recIcon,{backgroundColor:r.bg}]}>
                <Ionicons name={r.icon} size={20} color={r.color}/>
              </View>
              <View style={{flex:1}}>
                <Text style={{fontSize:14,fontWeight:'800',color:C.dark,marginBottom:3}}>{r.titre}</Text>
                <Text style={{fontSize:13,color:C.gray,lineHeight:19}}>{r.msg}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── CTA OPTION B ── */}
        <View style={{marginHorizontal:20,marginTop:20}}>
          <LinearGradient colors={[C.dark,C.dark2]} style={styles.ctaCard} start={{x:0,y:0}} end={{x:1,y:1}}>
            <View style={styles.ctaDeco}/>
            <Ionicons name="sparkles" size={28} color={C.accent}/>
            <View style={{flex:1}}>
              <Text style={styles.ctaTitle}>Analyse IA avancée</Text>
              <Text style={styles.ctaSub}>Bientôt : recommandations personnalisées par Claude AI</Text>
            </View>
          </LinearGradient>
        </View>

      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
  hero: { paddingTop:16,paddingBottom:28,paddingHorizontal:20,overflow:'hidden' },
  heroDeco1: { position:'absolute',width:220,height:220,borderRadius:110,backgroundColor:'rgba(20,255,236,0.06)',top:-80,right:-60 },
  heroDeco2: { position:'absolute',width:140,height:140,borderRadius:70,backgroundColor:'rgba(255,255,255,0.04)',bottom:-40,left:-20 },
  heroTitle: { fontSize:24,fontWeight:'900',color:'#FFF',marginBottom:4 },
  heroSub:   { fontSize:13,color:'rgba(255,255,255,0.7)',marginBottom:20 },
  periodRow: { flexDirection:'row',backgroundColor:'rgba(255,255,255,0.15)',borderRadius:20,padding:3,alignSelf:'flex-start' },
  periodBtn: { paddingHorizontal:14,paddingVertical:7,borderRadius:17 },
  periodBtnActive: { backgroundColor:'#FFF' },
  periodTxt: { fontSize:12,fontWeight:'600',color:'rgba(255,255,255,0.8)' },
  periodTxtActive: { color:C.primary },
  card: { backgroundColor:C.card,marginHorizontal:20,borderRadius:20,padding:16,marginBottom:12,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:10,elevation:2 },
  cardTitle: { fontSize:17,fontWeight:'700',color:C.dark },
  badge:    { borderRadius:10,paddingHorizontal:10,paddingVertical:4 },
  badgeTxt: { fontSize:12,fontWeight:'700' },
  scoreRing:  { width:100,height:100,borderRadius:50,borderWidth:8,justifyContent:'center',alignItems:'center' },
  scoreInner: { width:76,height:76,borderRadius:38,borderWidth:4,justifyContent:'center',alignItems:'center' },
  scoreNum: { fontSize:26,fontWeight:'900' },
  scoreSub: { fontSize:11,fontWeight:'700',marginTop:-2 },
  barBg:   { height:6,backgroundColor:C.borderLight,borderRadius:3,overflow:'hidden' },
  barFill: { height:'100%',borderRadius:3 },
  secHead:  { flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,marginTop:20,marginBottom:12 },
  secTitle: { fontSize:17,fontWeight:'700',color:C.dark },
  totalRow: { flexDirection:'row',backgroundColor:C.borderLight,borderRadius:12,padding:12,gap:4 },
  totalItem:{ flex:1,alignItems:'center' },
  aiBadge:  { backgroundColor:C.primaryLight,borderRadius:10,paddingHorizontal:8,paddingVertical:3 },
  aiBadgeTxt:{ fontSize:10,fontWeight:'700',color:C.primary },
  predDeco: { position:'absolute',width:150,height:150,borderRadius:75,backgroundColor:'rgba(20,255,236,0.05)',top:-50,right:-40 },
  trendCard:{ flex:1,backgroundColor:'rgba(255,255,255,0.07)',borderRadius:14,padding:12,alignItems:'center',gap:4 },
  trendVal: { fontSize:14,fontWeight:'800' },
  trendLbl: { fontSize:10,color:'rgba(255,255,255,0.5)',textAlign:'center' },
  predCard: { flex:1,backgroundColor:'rgba(255,255,255,0.07)',borderRadius:14,padding:12,alignItems:'center',gap:4 },
  predVal:  { fontSize:13,fontWeight:'800',textAlign:'center' },
  predLbl:  { fontSize:10,color:'rgba(255,255,255,0.45)',textAlign:'center' },
  objRow:   { paddingVertical:12 },
  objDot:   { width:34,height:34,borderRadius:10,justifyContent:'center',alignItems:'center' },
  catRow:   { flexDirection:'row',alignItems:'flex-start',paddingVertical:12 },
  catIcon:  { width:42,height:42,borderRadius:13,justifyContent:'center',alignItems:'center',marginTop:2 },
  recCard:  { backgroundColor:C.card,borderRadius:16,padding:14,flexDirection:'row',gap:12,borderLeftWidth:4,elevation:2 },
  recIcon:  { width:40,height:40,borderRadius:12,justifyContent:'center',alignItems:'center' },
  ctaCard:  { borderRadius:20,padding:18,flexDirection:'row',alignItems:'center',gap:14,overflow:'hidden',marginBottom:4 },
  ctaDeco:  { position:'absolute',width:180,height:180,borderRadius:90,backgroundColor:'rgba(20,255,236,0.05)',top:-80,left:-40 },
  ctaTitle: { fontSize:16,fontWeight:'800',color:'#FFF',marginBottom:4 },
  ctaSub:   { fontSize:12,color:'rgba(255,255,255,0.55)',lineHeight:17 },
});

export default AnalysePrediction;