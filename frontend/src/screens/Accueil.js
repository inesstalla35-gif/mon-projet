import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import { getTransactions }  from '../actions/Transactionactions';
import { getObjectives }    from '../actions/objectiveActions';
import {
  selectBalance, selectTotalIncome, selectTotalExpense, selectTransactions,
} from '../reducers/Transactionreducer';
import {
  selectInProgressObjectives,
} from '../reducers/objectiveReducer';

const { width } = Dimensions.get('window');

const C = {
  primary:'#0D7377', primaryMid:'#14919B', primaryLight:'#E6F7F7', accent:'#14FFEC',
  dark:'#111827', dark2:'#1F2937', gray:'#6B7280', grayLight:'#9CA3AF',
  border:'#E5E7EB', borderLight:'#F3F4F6', bg:'#F8FFFE', card:'#FFFFFF',
  income:'#0D7377', incomeLight:'#E6F7F7',
  expense:'#EF4444', expenseLight:'#FEF2F2',
  purple:'#8B5CF6', purpleLight:'#EDE9FE',
};

const GREETINGS = (h) =>
  h < 12 ? { text: 'Bonjour',       icon: 'sunny'         }
: h < 18 ? { text: 'Bon après-midi',icon: 'partly-sunny'  }
:          { text: 'Bonsoir',       icon: 'moon'          };

const QUOTES = [
  "Chaque franc épargné est une brique vers ta liberté. 🧱",
  "Une petite discipline aujourd'hui, une grande liberté demain. 🌅",
  "Ton futur toi te remercie pour chaque effort financier. 💪",
  "L'épargne, c'est te payer toi-même en premier. ✨",
];

const fmt = (n) => {
  if (!n && n !== 0) return '0 F';
  return Math.abs(n).toLocaleString('fr-FR') + ' F';
};

const ICON_BY_CAT = {
  salaire:'briefcase', alimentation:'restaurant', transport:'car',
  freelance:'laptop-outline', loisirs:'game-controller', sante:'medkit',
  logement:'home', épargne:'save', default:'swap-horizontal',
};

const iconForTx = (tx) => {
  const cat = (tx.categorie || tx.category || '').toLowerCase();
  return ICON_BY_CAT[cat] || (tx.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle');
};

const dateFr = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString())     return "Auj.";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  return date.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
};

// ─────────────────────────────────────────────────────────────────────────────

const Accueil = ({ onNavigate }) => {
  const dispatch = useDispatch();

  // ── Redux ──────────────────────────────────────────────────────────────────
  const { user }       = useSelector(s => s.auth);
  const balance        = useSelector(selectBalance);
  const totalIncome    = useSelector(selectTotalIncome);
  const totalExpense   = useSelector(selectTotalExpense);
  const allTx          = useSelector(selectTransactions);
  const objectives     = useSelector(selectInProgressObjectives);
  const txLoading      = useSelector(s => s.transaction.isLoading);
  const objLoading     = useSelector(s => s.objective.isLoading);

  const loading = txLoading || objLoading;

  // 5 dernières transactions
  const recentTx = [...allTx]
    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
    .slice(0, 5);

  // Transactions du jour
  const today = new Date().toDateString();
  const todayIncome  = allTx.filter(t => t.type === 'income'  && new Date(t.date || t.createdAt).toDateString() === today).reduce((s, t) => s + (t.amount || 0), 0);
  const todayExpense = allTx.filter(t => t.type === 'expense' && new Date(t.date || t.createdAt).toDateString() === today).reduce((s, t) => s + (t.amount || 0), 0);

  // Nom utilisateur
  const prenom = user?.prenom || user?.name?.split(' ')[0] || 'vous';

  const now   = new Date();
  const greet = GREETINGS(now.getHours());
  const quote = QUOTES[now.getDay() % QUOTES.length];

  // ── Animations ────────────────────────────────────────────────────────────
  const fade   = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getObjectives());
    Animated.parallel([
      Animated.timing(fade,   { toValue:1, duration:600, useNativeDriver:true }),
      Animated.spring(slideY, { toValue:0, tension:55, friction:8, useNativeDriver:true }),
    ]).start();
  }, []);

  const onRefresh = () => {
    dispatch(getTransactions());
    dispatch(getObjectives());
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={C.primary}/>
      }
    >

      {/* ── HERO ── */}
      <LinearGradient colors={[C.dark2, C.dark]} style={styles.hero} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco1}/><View style={styles.heroDeco2}/>

        {/* Salutation */}
        <View style={styles.heroTop}>
          <View>
            <View style={{flexDirection:'row', alignItems:'center', gap:6, marginBottom:3}}>
              <Ionicons name={greet.icon} size={17} color={C.accent}/>
              <Text style={styles.greetTxt}>{greet.text}, {prenom} 👋</Text>
            </View>
            <Text style={styles.dateTxt}>
              {now.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}
            </Text>
          </View>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot}/>
            <Text style={styles.onlineTxt}>En ligne</Text>
          </View>
        </View>

        {/* Solde */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLbl}>Solde disponible</Text>
          <Text style={styles.balanceNum}>
            {loading ? '...' : fmt(balance)}
          </Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Ionicons name="arrow-down-circle" size={14} color={C.accent}/>
              <Text style={styles.balanceStatTxt}>+{fmt(totalIncome)}</Text>
            </View>
            <View style={[styles.balanceStat, {marginLeft:16}]}>
              <Ionicons name="arrow-up-circle" size={14} color="#FF8A80"/>
              <Text style={[styles.balanceStatTxt, {color:'#FF8A80'}]}>-{fmt(totalExpense)}</Text>
            </View>
          </View>
        </View>

        {/* Citation */}
        <View style={styles.quoteWrap}>
          <Ionicons name="sparkles" size={13} color={C.accent}/>
          <Text style={styles.quoteTxt} numberOfLines={2}>{quote}</Text>
        </View>
      </LinearGradient>

      <Animated.View style={{opacity:fade, transform:[{translateY:slideY}]}}>

        {/* ── RÉSUMÉ DU JOUR ── */}
        <View style={styles.section}>
          <LinearGradient colors={[C.primary, C.primaryMid]} style={styles.todayCard} start={{x:0,y:0}} end={{x:1,y:1}}>
            <View style={styles.todayDeco}/>
            <Text style={styles.todayTitle}>Aujourd'hui</Text>
            <View style={{flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
              <View style={{alignItems:'center', gap:4}}>
                <Ionicons name="arrow-down-circle" size={22} color={C.accent}/>
                <Text style={{fontSize:15, fontWeight:'800', color:'#FFF'}}>{todayIncome > 0 ? '+'+fmt(todayIncome) : '--'}</Text>
                <Text style={{fontSize:11, color:'rgba(255,255,255,0.6)'}}>Entré</Text>
              </View>
              <Text style={{color:'rgba(255,255,255,0.25)', fontSize:24, fontWeight:'200'}}>|</Text>
              <View style={{alignItems:'center', gap:4}}>
                <Ionicons name="arrow-up-circle" size={22} color="#FF8A80"/>
                <Text style={{fontSize:15, fontWeight:'800', color:'#FFF'}}>{todayExpense > 0 ? '-'+fmt(todayExpense) : '--'}</Text>
                <Text style={{fontSize:11, color:'rgba(255,255,255,0.6)'}}>Sorti</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── ACTIONS RAPIDES ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Actions rapides</Text>
        </View>
        <View style={styles.actionsRow}>
          {[
            { icon:'add-circle',    label:'Revenu',    color:C.income,  bg:C.incomeLight,  nav:'transaction' },
            { icon:'remove-circle', label:'Dépense',   color:C.expense, bg:C.expenseLight, nav:'transaction' },
            { icon:'flag',          label:'Objectif',  color:C.purple,  bg:C.purpleLight,  nav:'newGoal'     },
            { icon:'pie-chart',     label:'Analyses',  color:C.primary, bg:C.primaryLight, nav:'analyse'     },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionBtn} onPress={() => onNavigate?.(a.nav)} activeOpacity={0.7}>
              <View style={[styles.actionIcon, {backgroundColor:a.bg}]}>
                <Ionicons name={a.icon} size={26} color={a.color}/>
              </View>
              <Text style={styles.actionLbl}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── OBJECTIFS EN COURS ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Objectifs actifs</Text>
          <TouchableOpacity onPress={() => onNavigate?.('objectifs')}>
            <Text style={styles.secLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {objLoading ? (
          <ActivityIndicator color={C.primary} style={{marginVertical:20}}/>
        ) : objectives.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => onNavigate?.('newGoal')} activeOpacity={0.8}>
            <Ionicons name="flag-outline" size={32} color={C.grayLight}/>
            <Text style={{fontSize:14, color:C.grayLight, marginTop:8}}>Aucun objectif en cours</Text>
            <Text style={{fontSize:13, color:C.primary, fontWeight:'700', marginTop:4}}>+ Créer un objectif</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:20, gap:12}}>
            {objectives.slice(0, 5).map(obj => {
              const actuel = obj.montant_actuel || 0;
              const cible  = obj.montant_cible  || 1;
              const pct    = Math.min(Math.round((actuel / cible) * 100), 100);
              const color  = obj.couleur || C.primary;
              return (
                <TouchableOpacity key={obj._id} style={styles.objCard} activeOpacity={0.85} onPress={() => onNavigate?.('objectifs')}>
                  <View style={[styles.objIconWrap, {backgroundColor: color+'22'}]}>
                    <Ionicons name={obj.icone || 'flag'} size={22} color={color}/>
                  </View>
                  <Text style={styles.objTitle} numberOfLines={1}>{obj.titre || obj.nom}</Text>
                  {obj.date_echeance && (
                    <Text style={{fontSize:11, color:C.grayLight, marginBottom:8}}>
                      📅 {new Date(obj.date_echeance).toLocaleDateString('fr-FR', {month:'short', year:'numeric'})}
                    </Text>
                  )}
                  <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:6}}>
                    <Text style={{fontSize:11, color:C.gray}}>{(actuel/1000).toFixed(0)}K / {(cible/1000).toFixed(0)}K F</Text>
                    <Text style={{fontSize:12, fontWeight:'800', color}}>{pct}%</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, {width:pct+'%', backgroundColor:color}]}/>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.objAdd} onPress={() => onNavigate?.('newGoal')}>
              <Ionicons name="add" size={28} color={C.primary}/>
              <Text style={{fontSize:12, fontWeight:'700', color:C.primary, textAlign:'center'}}>Nouvel{'\n'}objectif</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── DERNIÈRES TRANSACTIONS ── */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Dernières transactions</Text>
        </View>

        {txLoading ? (
          <ActivityIndicator color={C.primary} style={{marginVertical:20}}/>
        ) : recentTx.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => onNavigate?.('transaction')} activeOpacity={0.8}>
            <Ionicons name="swap-horizontal-outline" size={32} color={C.grayLight}/>
            <Text style={{fontSize:14, color:C.grayLight, marginTop:8}}>Aucune transaction</Text>
            <Text style={{fontSize:13, color:C.primary, fontWeight:'700', marginTop:4}}>+ Ajouter une transaction</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.card, {marginHorizontal:20}]}>
            {recentTx.map((tx, i) => (
              <View key={tx._id || i} style={[styles.txRow, i < recentTx.length-1 && styles.txBorder]}>
                <View style={[styles.txIcon, {backgroundColor: tx.type==='income' ? C.incomeLight : C.expenseLight}]}>
                  <Ionicons name={iconForTx(tx)} size={18} color={tx.type==='income' ? C.income : C.expense}/>
                </View>
                <View style={{flex:1, marginLeft:12}}>
                  <Text style={{fontSize:14, fontWeight:'700', color:C.dark}} numberOfLines={1}>
                    {tx.description || tx.titre || tx.title || (tx.type==='income' ? 'Revenu' : 'Dépense')}
                  </Text>
                  <Text style={{fontSize:12, color:C.grayLight}}>
                    {tx.categorie || tx.category || ''}{tx.categorie || tx.category ? ' · ' : ''}{dateFr(tx.date || tx.createdAt)}
                  </Text>
                </View>
                <Text style={{fontSize:14, fontWeight:'800', color: tx.type==='income' ? C.income : C.expense}}>
                  {tx.type==='income' ? '+' : '-'}{fmt(tx.amount || tx.montant || 0)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── CTA ANALYSES ── */}
        <View style={{marginHorizontal:20, marginTop:20}}>
          <TouchableOpacity onPress={() => onNavigate?.('analyse')} activeOpacity={0.85}>
            <LinearGradient colors={[C.dark, C.dark2]} style={styles.ctaCard} start={{x:0,y:0}} end={{x:1,y:1}}>
              <View style={styles.ctaDeco}/>
              <View style={{flex:1}}>
                <Text style={styles.ctaTitle}>📊 Tableau de bord complet</Text>
                <Text style={styles.ctaSub}>Analyses, prédictions et statistiques détaillées</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={36} color={C.accent}/>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },

  // Hero
  hero: { paddingTop:16, paddingBottom:22, paddingHorizontal:20, overflow:'hidden' },
  heroDeco1: { position:'absolute', width:250, height:250, borderRadius:125, backgroundColor:'rgba(20,255,236,0.04)', top:-100, right:-80 },
  heroDeco2: { position:'absolute', width:120, height:120, borderRadius:60,  backgroundColor:'rgba(255,255,255,0.02)', bottom:-30, left:-20 },
  heroTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 },
  greetTxt: { fontSize:16, fontWeight:'700', color:'#FFF' },
  dateTxt:  { fontSize:11, color:'rgba(255,255,255,0.45)', textTransform:'capitalize', marginTop:2 },
  onlineBadge: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(20,255,236,0.12)', borderRadius:20, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'rgba(20,255,236,0.25)' },
  onlineDot:   { width:6, height:6, borderRadius:3, backgroundColor:C.accent },
  onlineTxt:   { fontSize:11, fontWeight:'700', color:C.accent },

  balanceCard: { backgroundColor:'rgba(255,255,255,0.07)', borderRadius:18, padding:16, marginBottom:14 },
  balanceLbl:  { fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:6 },
  balanceNum:  { fontSize:30, fontWeight:'900', color:'#FFF', letterSpacing:-0.5, marginBottom:10 },
  balanceRow:  { flexDirection:'row' },
  balanceStat: { flexDirection:'row', alignItems:'center', gap:5 },
  balanceStatTxt: { fontSize:13, fontWeight:'700', color:C.accent },

  quoteWrap: { flexDirection:'row', alignItems:'flex-start', gap:7, backgroundColor:'rgba(255,255,255,0.05)', borderRadius:12, padding:12, borderWidth:1, borderColor:'rgba(20,255,236,0.15)' },
  quoteTxt:  { flex:1, fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:18, fontStyle:'italic' },

  // Sections
  section:  { paddingHorizontal:20, marginTop:16 },
  secHead:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, marginTop:22, marginBottom:12 },
  secTitle: { fontSize:17, fontWeight:'700', color:C.dark },
  secLink:  { fontSize:13, color:C.primary, fontWeight:'600' },

  // Today card
  todayCard:  { borderRadius:20, padding:18, overflow:'hidden' },
  todayDeco:  { position:'absolute', width:150, height:150, borderRadius:75, backgroundColor:'rgba(20,255,236,0.07)', top:-60, right:-40 },
  todayTitle: { fontSize:13, fontWeight:'700', color:'rgba(255,255,255,0.7)', marginBottom:14 },

  // Actions
  actionsRow: { flexDirection:'row', justifyContent:'space-between', paddingHorizontal:20 },
  actionBtn:  { alignItems:'center', flex:1 },
  actionIcon: { width:56, height:56, borderRadius:18, justifyContent:'center', alignItems:'center', marginBottom:7, elevation:2 },
  actionLbl:  { fontSize:12, fontWeight:'600', color:C.gray },

  // Objectifs
  objCard:    { width:175, backgroundColor:C.card, borderRadius:20, padding:14, shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.07, shadowRadius:10, elevation:3 },
  objIconWrap:{ width:44, height:44, borderRadius:13, justifyContent:'center', alignItems:'center', marginBottom:10 },
  objTitle:   { fontSize:14, fontWeight:'700', color:C.dark, marginBottom:4 },
  objAdd:     { width:120, borderRadius:20, borderWidth:2, borderColor:C.border, borderStyle:'dashed', justifyContent:'center', alignItems:'center', paddingVertical:30, gap:8 },

  barBg:   { height:6, backgroundColor:C.borderLight, borderRadius:3, overflow:'hidden' },
  barFill: { height:'100%', borderRadius:3 },

  // Transactions
  card:   { backgroundColor:C.card, borderRadius:20, padding:14, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:10, elevation:2 },
  txRow:  { flexDirection:'row', alignItems:'center', paddingVertical:12 },
  txBorder:{ borderBottomWidth:1, borderBottomColor:C.borderLight },
  txIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },

  // Empty state
  emptyCard: { marginHorizontal:20, backgroundColor:C.card, borderRadius:20, padding:24, alignItems:'center', borderWidth:1.5, borderColor:C.border, borderStyle:'dashed' },

  // CTA
  ctaCard:  { borderRadius:20, padding:18, flexDirection:'row', alignItems:'center', gap:14, overflow:'hidden' },
  ctaDeco:  { position:'absolute', width:180, height:180, borderRadius:90, backgroundColor:'rgba(20,255,236,0.05)', top:-80, left:-40 },
  ctaTitle: { fontSize:16, fontWeight:'800', color:'#FFF', marginBottom:4 },
  ctaSub:   { fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:18 },
});

export default Accueil;