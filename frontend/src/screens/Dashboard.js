import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';

import { getTransactions } from '../actions/Transactionactions';
import { getObjectives }   from '../actions/objectiveActions';
import {
  selectTransactions, selectBalance,
  selectTotalIncome, selectTotalExpense,
} from '../reducers/Transactionreducer';

const { width } = Dimensions.get('window');
const CHART_W   = width - 40;

const C = {
  primary:'#0D7377', primaryMid:'#14919B', primaryLight:'#E6F7F7', accent:'#14FFEC',
  dark:'#111827', dark2:'#1F2937', gray:'#6B7280', grayLight:'#9CA3AF',
  border:'#E5E7EB', borderLight:'#F3F4F6', bg:'#F8FFFE', card:'#FFFFFF',
  income:'#0D7377', expense:'#EF4444',
  purple:'#8B5CF6', orange:'#F59E0B', blue:'#3B82F6',
};

const MONTHS_FR  = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const PIE_COLORS = ['#0D7377','#14919B','#8B5CF6','#F59E0B','#EF4444','#3B82F6','#10B981','#F97316'];
// Couleurs hex pour ProgressChart (pas de rgba)
const PROG_COLORS = ['#0D7377','#8B5CF6','#F59E0B','#3B82F6'];

const fmt = (n) => {
  if (!n && n !== 0) return '0';
  if (n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if (n >= 1000)    return (n/1000).toFixed(0)+'K';
  return Math.abs(n).toString();
};
const fmtFull = (n) => Math.abs(n||0).toLocaleString('fr-FR')+' F';

const getLast6Months = (transactions) => {
  const now = new Date();
  const labels = [], incomes = [], expenses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    labels.push(MONTHS_FR[d.getMonth()]);
    const month = transactions.filter(tx => {
      const txD = new Date(tx.date || tx.createdAt);
      return txD.getMonth()===d.getMonth() && txD.getFullYear()===d.getFullYear();
    });
    incomes.push(month.filter(t=>t.type==='income').reduce((s,t)=>s+(t.amount||0),0));
    expenses.push(month.filter(t=>t.type==='expense').reduce((s,t)=>s+(t.amount||0),0));
  }
  return { labels, incomes, expenses };
};

const getCategoryData = (transactions) => {
  const map = {};
  transactions.filter(t=>t.type==='expense').forEach(tx => {
    const cat = tx.categorie || tx.category || 'Autre';
    map[cat] = (map[cat]||0) + (tx.amount||0);
  });
  return Object.entries(map)
    .sort((a,b)=>b[1]-a[1]).slice(0,6)
    .map(([name,amount],i) => ({
      name, amount,
      color: PIE_COLORS[i % PIE_COLORS.length],
      legendFontColor: C.gray, legendFontSize: 12,
    }));
};

const getRecommendations = (balance, totalIncome, totalExpense, objectives, catData) => {
  const recs = [];
  const ratio = totalIncome > 0 ? totalExpense/totalIncome : 0;
  if (ratio > 0.8)
    recs.push({ icon:'warning',         color:C.expense, title:'Dépenses élevées',       text:`Tu dépenses ${Math.round(ratio*100)}% de tes revenus. Essaie de réduire à moins de 70%.` });
  else if (ratio < 0.5 && totalIncome > 0)
    recs.push({ icon:'trending-up',     color:C.income,  title:"Excellent taux d'épargne !", text:`Tu épargnes ${Math.round((1-ratio)*100)}% de tes revenus. Continue ainsi !` });
  if (balance < 0)
    recs.push({ icon:'alert-circle',    color:C.expense, title:'Solde négatif',           text:"Évite les dépenses non essentielles jusqu'au prochain revenu." });
  if (objectives.length > 0) {
    const slow = objectives.filter(o => {
      const pct = (o.montant_actuel||0)/(o.montant_cible||1);
      if (!o.date_echeance) return false;
      const daysLeft = Math.max(0,(new Date(o.date_echeance)-new Date())/86400000);
      return pct < 0.3 && daysLeft < 90;
    });
    if (slow.length > 0)
      recs.push({ icon:'flag',          color:C.orange,  title:'Objectifs en retard',     text:`${slow.length} objectif(s) risquent de ne pas être atteints.` });
  }
  if (catData.length > 0) {
    const top = catData[0];
    const pct = totalExpense>0 ? Math.round((top.amount/totalExpense)*100) : 0;
    if (pct > 40)
      recs.push({ icon:'pie-chart',     color:C.purple,  title:`${top.name} domine`,      text:`${pct}% de tes dépenses vont en ${top.name}.` });
  }
  if (objectives.length === 0 && totalIncome > 0)
    recs.push({ icon:'flag-outline',    color:C.blue,    title:"Pas encore d'objectif",   text:"Crée un objectif d'épargne pour donner un sens à tes finances !" });
  if (recs.length === 0)
    recs.push({ icon:'checkmark-circle',color:C.income,  title:'Finances équilibrées',    text:"Tes finances sont saines. Continue à suivre tes dépenses !" });
  return recs;
};

// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('evolution');

  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(20)).current;

  const transactions = useSelector(selectTransactions);
  const balance      = useSelector(selectBalance);
  const totalIncome  = useSelector(selectTotalIncome);
  const totalExpense = useSelector(selectTotalExpense);
  const txLoading    = useSelector(s => s.transaction.isLoading);
  const objLoading   = useSelector(s => s.objective.isLoading);
  const loading      = txLoading || objLoading;

  // ── Sélecteur mémorisé pour éviter le warning re-render ──────────────────
  const allObjectives = useSelector(s => s.objective.objectives);
  const objectives    = useMemo(
    () => allObjectives.filter(o => (o.montant_actuel||0) < (o.montant_cible||1)),
    [allObjectives]
  );

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getObjectives());
    Animated.parallel([
      Animated.timing(fade,   { toValue:1, duration:600, useNativeDriver:true }),
      Animated.spring(slideY, { toValue:0, tension:55, friction:8, useNativeDriver:true }),
    ]).start();
  }, []);

  const onRefresh = () => { dispatch(getTransactions()); dispatch(getObjectives()); };

  // ── Données calculées (mémorisées) ───────────────────────────────────────
  const { labels, incomes, expenses } = useMemo(
    () => getLast6Months(transactions), [transactions]
  );
  const catData = useMemo(() => getCategoryData(transactions), [transactions]);
  const recs    = useMemo(
    () => getRecommendations(balance, totalIncome, totalExpense, objectives, catData),
    [balance, totalIncome, totalExpense, objectives, catData]
  );

  const savingRate = totalIncome > 0
    ? Math.max(0, Math.min(1, (totalIncome-totalExpense)/totalIncome)) : 0;

  // ── ProgressChart — données sécurisées ───────────────────────────────────
  const progObjectives = objectives.slice(0, 4);
  const progData = useMemo(() => ({
    labels: progObjectives.map(o => ((o.titre||o.nom||'').slice(0,5) || '?')),
    data:   progObjectives.map(o => {
      const v = (o.montant_actuel||0) / (o.montant_cible||1);
      return Math.min(1, Math.max(0.01, v)); // jamais 0 ni > 1
    }),
  }), [progObjectives]);

  const chartConfig = {
    backgroundGradientFrom: C.card,
    backgroundGradientTo:   C.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(13,115,119,${opacity})`,
    labelColor: () => C.gray,
    style: { borderRadius:16 },
    propsForDots: { r:'4', strokeWidth:'2', stroke:C.primary },
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom:110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={C.primary}/>}
    >
      {/* HEADER */}
      <LinearGradient colors={[C.dark2,C.dark]} style={styles.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.headerDeco}/>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <Text style={styles.headerSub}>Analyse complète de vos finances</Text>

        <View style={styles.kpiRow}>
          {[
            { icon:'wallet',          label:'Solde',    val:fmt(balance)+' F',      color:C.accent     },
            { icon:'arrow-down-circle',label:'Revenus', val:'+'+fmt(totalIncome)+' F', color:'#4ade80' },
            { icon:'arrow-up-circle', label:'Dépenses', val:'-'+fmt(totalExpense)+' F',color:'#FF8A80' },
          ].map((k,i) => (
            <View key={i} style={styles.kpiCard}>
              <Ionicons name={k.icon} size={17} color={k.color}/>
              <Text style={[styles.kpiVal,{color:k.color}]}>{k.val}</Text>
              <Text style={styles.kpiLbl}>{k.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.savingRow}>
          <Text style={styles.savingLbl}>Taux d'épargne</Text>
          <Text style={styles.savingPct}>{Math.round(savingRate*100)}%</Text>
        </View>
        <View style={styles.savingBarBg}>
          <LinearGradient
            colors={savingRate>0.3 ? [C.accent,'#0D7377'] : ['#FF8A80',C.expense]}
            style={[styles.savingBarFill,{width:(savingRate*100)+'%'}]}
            start={{x:0,y:0}} end={{x:1,y:0}}
          />
        </View>
      </LinearGradient>

      <Animated.View style={{opacity:fade,transform:[{translateY:slideY}]}}>

        {/* TABS */}
        <View style={styles.tabRow}>
          {[
            { key:'evolution',  label:'Évolution',  icon:'trending-up' },
            { key:'categories', label:'Catégories', icon:'pie-chart'   },
            { key:'objectifs',  label:'Objectifs',  icon:'flag'        },
          ].map(t => (
            <TouchableOpacity key={t.key} style={[styles.tabBtn, tab===t.key&&styles.tabBtnActive]}
              onPress={()=>setTab(t.key)} activeOpacity={0.7}>
              <Ionicons name={t.icon} size={14} color={tab===t.key?C.primary:C.grayLight}/>
              <Text style={[styles.tabLbl, tab===t.key&&styles.tabLblActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ══════════ ÉVOLUTION ══════════ */}
        {tab==='evolution' && (
          <View>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Revenus vs Dépenses</Text>
              <Text style={styles.secSub}>6 derniers mois</Text>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="bar-chart-outline" size={40} color={C.grayLight}/>
                <Text style={styles.emptyTxt}>Pas encore de données</Text>
              </View>
            ) : (
              <View style={styles.chartCard}>
                <LineChart
                  data={{
                    labels,
                    datasets: [
                      { data:incomes.map(v=>v||0),  color:()=>C.income,  strokeWidth:2 },
                      { data:expenses.map(v=>v||0), color:()=>C.expense, strokeWidth:2 },
                    ],
                    legend:['Revenus','Dépenses'],
                  }}
                  width={CHART_W-32} height={200}
                  chartConfig={chartConfig} bezier
                  style={{borderRadius:12}}
                  withInnerLines={false}
                  formatYLabel={v=>fmt(parseFloat(v))}
                />
                <View style={styles.legendRow}>
                  {[{color:C.income,label:'Revenus'},{color:C.expense,label:'Dépenses'}].map((l,i)=>(
                    <View key={i} style={styles.legendItem}>
                      <View style={[styles.legendDot,{backgroundColor:l.color}]}/>
                      <Text style={styles.legendTxt}>{l.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Épargne mensuelle</Text>
              <Text style={styles.secSub}>Revenus – Dépenses</Text>
            </View>

            {transactions.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="stats-chart-outline" size={40} color={C.grayLight}/>
                <Text style={styles.emptyTxt}>Pas encore de données</Text>
              </View>
            ) : (
              <View style={styles.chartCard}>
                <BarChart
                  data={{
                    labels,
                    datasets:[{ data:incomes.map((v,i)=>Math.max(0,v-(expenses[i]||0))) }],
                  }}
                  width={CHART_W-32} height={180}
                  chartConfig={{...chartConfig, color:(opacity=1)=>`rgba(13,115,119,${opacity})`}}
                  style={{borderRadius:12}}
                  showValuesOnTopOfBars
                  formatYLabel={v=>fmt(parseFloat(v))}
                  withInnerLines={false}
                />
                <Text style={styles.chartNote}>Montant épargné par mois</Text>
              </View>
            )}

            <View style={styles.miniStatsRow}>
              {[
                {
                  label:'Mois le + rentable',
                  value: (() => {
                    const vals = incomes.map((v,i)=>v-(expenses[i]||0));
                    const max  = Math.max(...vals);
                    return max > 0 ? labels[vals.indexOf(max)] : '--';
                  })(),
                  icon:'trending-up', color:C.income,
                },
                { label:'Moy. revenus/mois',  value:fmt(incomes.reduce((a,b)=>a+b,0)/6)+' F',  icon:'arrow-down-circle', color:C.income  },
                { label:'Moy. dépenses/mois', value:fmt(expenses.reduce((a,b)=>a+b,0)/6)+' F', icon:'arrow-up-circle',   color:C.expense },
              ].map((s,i)=>(
                <View key={i} style={styles.miniStat}>
                  <Ionicons name={s.icon} size={18} color={s.color}/>
                  <Text style={[styles.miniStatVal,{color:s.color}]}>{s.value}</Text>
                  <Text style={styles.miniStatLbl}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════ CATÉGORIES ══════════ */}
        {tab==='categories' && (
          <View>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Répartition des dépenses</Text>
            </View>

            {catData.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="pie-chart-outline" size={40} color={C.grayLight}/>
                <Text style={styles.emptyTxt}>Aucune dépense enregistrée</Text>
              </View>
            ) : (
              <>
                <View style={styles.chartCard}>
                  <PieChart
                    data={catData.map(d=>({...d,population:d.amount}))}
                    width={CHART_W-32} height={200}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="16"
                    hasLegend={false}
                  />
                  <View style={styles.pieLegend}>
                    {catData.map((d,i)=>(
                      <View key={i} style={styles.pieLegendItem}>
                        <View style={[styles.pieLegendDot,{backgroundColor:d.color}]}/>
                        <Text style={styles.pieLegendName} numberOfLines={1}>{d.name}</Text>
                        <Text style={styles.pieLegendPct}>
                          {totalExpense>0 ? Math.round((d.amount/totalExpense)*100) : 0}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.secHead}>
                  <Text style={styles.secTitle}>Détail par catégorie</Text>
                </View>
                <View style={[styles.card,{marginHorizontal:20}]}>
                  {catData.map((d,i)=>{
                    const pct = totalExpense>0 ? (d.amount/totalExpense)*100 : 0;
                    return (
                      <View key={i} style={[styles.catRow, i<catData.length-1&&{borderBottomWidth:1,borderBottomColor:C.borderLight}]}>
                        <View style={[styles.catDot,{backgroundColor:d.color}]}/>
                        <View style={{flex:1}}>
                          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:5}}>
                            <Text style={{fontSize:14,fontWeight:'600',color:C.dark}}>{d.name}</Text>
                            <Text style={{fontSize:13,fontWeight:'800',color:d.color}}>{fmtFull(d.amount)}</Text>
                          </View>
                          <View style={styles.catBarBg}>
                            <View style={[styles.catBarFill,{width:pct+'%',backgroundColor:d.color}]}/>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}

        {/* ══════════ OBJECTIFS ══════════ */}
        {tab==='objectifs' && (
          <View>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Progression des objectifs</Text>
            </View>

            {objectives.length === 0 ? (
              <View style={styles.emptyChart}>
                <Ionicons name="flag-outline" size={40} color={C.grayLight}/>
                <Text style={styles.emptyTxt}>Aucun objectif en cours</Text>
              </View>
            ) : (
              <>
                {/* ProgressChart — sécurisé sans rgba */}
                {progObjectives.length > 0 && (
                  <View style={styles.chartCard}>
                    <Text style={{fontSize:13,color:C.gray,marginBottom:12,fontWeight:'600'}}>Vue d'ensemble</Text>
                    <ProgressChart
                      data={progData}
                      width={CHART_W-32}
                      height={180}
                      strokeWidth={10}
                      radius={28}
                      chartConfig={{
                        ...chartConfig,
                        // ✅ Retourne directement une couleur hex — pas de rgba
                        color: (opacity, index) => PROG_COLORS[(index ?? 0) % PROG_COLORS.length],
                      }}
                      hideLegend={false}
                      style={{borderRadius:12}}
                    />
                  </View>
                )}

                {/* Détail chaque objectif */}
                {objectives.map((obj,i)=>{
                  const actuel   = obj.montant_actuel||0;
                  const cible    = obj.montant_cible||1;
                  const pct      = Math.min(Math.round((actuel/cible)*100),100);
                  const color    = obj.couleur || PIE_COLORS[i%PIE_COLORS.length];
                  const reste    = Math.max(0,cible-actuel);
                  const daysLeft = obj.date_echeance
                    ? Math.max(0,Math.round((new Date(obj.date_echeance)-new Date())/86400000)) : null;
                  const perDay   = daysLeft>0 ? Math.ceil(reste/daysLeft) : null;

                  return (
                    <View key={obj._id||i} style={[styles.card,{marginHorizontal:20,marginBottom:12}]}>
                      <View style={{flexDirection:'row',alignItems:'center',marginBottom:12}}>
                        <View style={[styles.objIcon,{backgroundColor:color+'22'}]}>
                          <Ionicons name={obj.icone||'flag'} size={20} color={color}/>
                        </View>
                        <View style={{flex:1,marginLeft:12}}>
                          <Text style={{fontSize:15,fontWeight:'800',color:C.dark}}>{obj.titre||obj.nom}</Text>
                          {obj.date_echeance && (
                            <Text style={{fontSize:12,color:C.grayLight}}>
                              📅 {new Date(obj.date_echeance).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
                            </Text>
                          )}
                        </View>
                        <Text style={{fontSize:18,fontWeight:'900',color}}>{pct}%</Text>
                      </View>

                      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                        <Text style={{fontSize:13,color:C.gray}}>Épargné : <Text style={{fontWeight:'700',color:C.dark}}>{fmtFull(actuel)}</Text></Text>
                        <Text style={{fontSize:13,color:C.gray}}>Cible : <Text style={{fontWeight:'700',color:C.dark}}>{fmtFull(cible)}</Text></Text>
                      </View>

                      <View style={styles.objBarBg}>
                        <LinearGradient
                          colors={[color,color+'99']}
                          style={[styles.objBarFill,{width:pct+'%'}]}
                          start={{x:0,y:0}} end={{x:1,y:0}}
                        />
                      </View>

                      <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:10}}>
                        <View style={styles.objStat}>
                          <Ionicons name="hourglass-outline" size={13} color={C.grayLight}/>
                          <Text style={styles.objStatTxt}>{daysLeft!==null?`${daysLeft} jours restants`:'Pas de deadline'}</Text>
                        </View>
                        <View style={styles.objStat}>
                          <Ionicons name="trending-up" size={13} color={color}/>
                          <Text style={[styles.objStatTxt,{color}]}>
                            {perDay ? `${fmt(perDay)} F/jour` : `Reste ${fmtFull(reste)}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {/* ── RECOMMANDATIONS ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>🤖 Recommandations</Text>
          <Text style={styles.secSub}>Basées sur vos données</Text>
        </View>
        <View style={{paddingHorizontal:20,gap:10}}>
          {recs.map((r,i)=>(
            <View key={i} style={[styles.recCard,{borderLeftColor:r.color}]}>
              <View style={[styles.recIcon,{backgroundColor:r.color+'18'}]}>
                <Ionicons name={r.icon} size={20} color={r.color}/>
              </View>
              <View style={{flex:1}}>
                <Text style={{fontSize:14,fontWeight:'800',color:C.dark,marginBottom:3}}>{r.title}</Text>
                <Text style={{fontSize:13,color:C.gray,lineHeight:19}}>{r.text}</Text>
              </View>
            </View>
          ))}
        </View>

      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
  header: { paddingTop:20,paddingBottom:24,paddingHorizontal:20,overflow:'hidden' },
  headerDeco: { position:'absolute',width:300,height:300,borderRadius:150,backgroundColor:'rgba(20,255,236,0.04)',top:-120,right:-80 },
  headerTitle: { fontSize:24,fontWeight:'900',color:'#FFF',marginBottom:4 },
  headerSub:   { fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:20 },
  kpiRow:  { flexDirection:'row',gap:10,marginBottom:20 },
  kpiCard: { flex:1,backgroundColor:'rgba(255,255,255,0.07)',borderRadius:14,padding:12,alignItems:'center',gap:4,borderWidth:1,borderColor:'rgba(20,255,236,0.15)' },
  kpiVal:  { fontSize:13,fontWeight:'800',color:'#FFF',textAlign:'center' },
  kpiLbl:  { fontSize:10,color:'rgba(255,255,255,0.45)',fontWeight:'600' },
  savingRow:    { flexDirection:'row',justifyContent:'space-between',marginBottom:8 },
  savingLbl:    { fontSize:12,color:'rgba(255,255,255,0.55)',fontWeight:'600' },
  savingPct:    { fontSize:12,fontWeight:'800',color:C.accent },
  savingBarBg:  { height:6,backgroundColor:'rgba(255,255,255,0.1)',borderRadius:3,overflow:'hidden' },
  savingBarFill:{ height:'100%',borderRadius:3 },
  tabRow:      { flexDirection:'row',marginHorizontal:20,marginTop:20,marginBottom:4,backgroundColor:C.card,borderRadius:16,padding:4,elevation:2 },
  tabBtn:      { flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:12 },
  tabBtnActive:{ backgroundColor:C.primaryLight },
  tabLbl:      { fontSize:12,fontWeight:'600',color:C.grayLight },
  tabLblActive:{ color:C.primary,fontWeight:'800' },
  secHead:  { flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,marginTop:20,marginBottom:12 },
  secTitle: { fontSize:17,fontWeight:'700',color:C.dark },
  secSub:   { fontSize:12,color:C.grayLight },
  chartCard:{ marginHorizontal:20,backgroundColor:C.card,borderRadius:20,padding:16,shadowColor:'#000',shadowOffset:{width:0,height:3},shadowOpacity:0.07,shadowRadius:10,elevation:3 },
  chartNote:{ fontSize:11,color:C.grayLight,textAlign:'center',marginTop:6 },
  emptyChart:{ marginHorizontal:20,backgroundColor:C.card,borderRadius:20,padding:32,alignItems:'center',borderWidth:1.5,borderColor:C.border,borderStyle:'dashed',gap:8 },
  emptyTxt: { fontSize:14,color:C.grayLight },
  legendRow: { flexDirection:'row',justifyContent:'center',gap:20,marginTop:12 },
  legendItem:{ flexDirection:'row',alignItems:'center',gap:6 },
  legendDot: { width:10,height:10,borderRadius:5 },
  legendTxt: { fontSize:12,color:C.gray,fontWeight:'600' },
  miniStatsRow:{ flexDirection:'row',paddingHorizontal:20,gap:10,marginTop:16 },
  miniStat:    { flex:1,backgroundColor:C.card,borderRadius:14,padding:12,alignItems:'center',gap:4,elevation:2 },
  miniStatVal: { fontSize:13,fontWeight:'800',textAlign:'center' },
  miniStatLbl: { fontSize:10,color:C.grayLight,textAlign:'center',fontWeight:'500' },
  pieLegend:    { marginTop:12,gap:6 },
  pieLegendItem:{ flexDirection:'row',alignItems:'center',gap:8 },
  pieLegendDot: { width:10,height:10,borderRadius:5 },
  pieLegendName:{ flex:1,fontSize:13,color:C.gray },
  pieLegendPct: { fontSize:13,fontWeight:'800',color:C.dark },
  card:     { backgroundColor:C.card,borderRadius:20,padding:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:10,elevation:2 },
  catRow:   { paddingVertical:12,flexDirection:'row',alignItems:'center',gap:10 },
  catDot:   { width:10,height:10,borderRadius:5 },
  catBarBg: { height:5,backgroundColor:C.borderLight,borderRadius:3,overflow:'hidden' },
  catBarFill:{ height:'100%',borderRadius:3 },
  objIcon:   { width:42,height:42,borderRadius:12,justifyContent:'center',alignItems:'center' },
  objBarBg:  { height:8,backgroundColor:C.borderLight,borderRadius:4,overflow:'hidden' },
  objBarFill:{ height:'100%',borderRadius:4 },
  objStat:   { flexDirection:'row',alignItems:'center',gap:4 },
  objStatTxt:{ fontSize:11,color:C.grayLight,fontWeight:'600' },
  recCard:{ backgroundColor:C.card,borderRadius:16,padding:14,flexDirection:'row',gap:12,borderLeftWidth:4,elevation:2 },
  recIcon:{ width:40,height:40,borderRadius:12,justifyContent:'center',alignItems:'center' },
});

export default Dashboard;