import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary:'#0D7377',primaryMid:'#14919B',primaryLight:'#E6F7F7',accent:'#14FFEC',
  dark:'#111827',gray:'#6B7280',grayLight:'#9CA3AF',border:'#E5E7EB',borderLight:'#F3F4F6',
  bg:'#F8FFFE',card:'#FFFFFF',income:'#0D7377',incomeLight:'#E6F7F7',
  expense:'#EF4444',expenseLight:'#FEF2F2',
};

const ICON_CAT = {
  Salaire:'briefcase',Alimentation:'restaurant',Transport:'car',Freelance:'laptop-outline',
  Loisirs:'game-controller',Logement:'home',Ventes:'cash',Santé:'medical',Autre:'ellipsis-horizontal',
};

const TRANSACTIONS = [
  { id:1, titre:'Salaire Octobre',  montant:850000, type:'revenu',  cat:'Salaire',      date:'01/10/24' },
  { id:2, titre:'Courses Auchan',   montant:45000,  type:'depense', cat:'Alimentation', date:'02/10/24' },
  { id:3, titre:'Essence voiture',  montant:25000,  type:'depense', cat:'Transport',    date:'03/10/24' },
  { id:4, titre:'Freelance client', montant:150000, type:'revenu',  cat:'Freelance',    date:'05/10/24' },
  { id:5, titre:'Cinéma',           montant:5000,   type:'depense', cat:'Loisirs',      date:'06/10/24' },
  { id:6, titre:'Restaurant midi',  montant:18000,  type:'depense', cat:'Alimentation', date:'08/10/24' },
  { id:7, titre:'Vente téléphone',  montant:75000,  type:'revenu',  cat:'Ventes',       date:'10/10/24' },
  { id:8, titre:'Facture eau',      montant:12000,  type:'depense', cat:'Logement',     date:'12/10/24' },
  { id:9, titre:'Consultation Dr',  montant:15000,  type:'depense', cat:'Santé',        date:'14/10/24' },
  { id:10,titre:'Prime performance',montant:100000, type:'revenu',  cat:'Salaire',      date:'15/10/24' },
];

const fmt = (n) => n.toLocaleString('fr-FR') + ' F';

const Historique = () => {
  const [filtre, setFiltre] = useState('tout');
  const [search, setSearch] = useState('');
  const [triDate, setTriDate] = useState('desc');
  const fade = useRef(new Animated.Value(1)).current;

  const filtered = TRANSACTIONS
    .filter(t => (filtre==='tout' || t.type===filtre)
      && (!search || t.titre.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => triDate==='desc' ? b.id - a.id : a.id - b.id);

  const totalRev = filtered.filter(t=>t.type==='revenu').reduce((s,t)=>s+t.montant,0);
  const totalDep = filtered.filter(t=>t.type==='depense').reduce((s,t)=>s+t.montant,0);
  const balance  = totalRev - totalDep;

  const switchFiltre = (f) => {
    Animated.sequence([
      Animated.timing(fade,{toValue:0.3,duration:100,useNativeDriver:true}),
      Animated.timing(fade,{toValue:1,duration:200,useNativeDriver:true}),
    ]).start();
    setFiltre(f);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco}/>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
          <View>
            <Text style={styles.headerTitle}>Historique</Text>
            <Text style={styles.headerSub}>{filtered.length} transactions · Octobre 2024</Text>
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={()=>setTriDate(v=>v==='desc'?'asc':'desc')}>
            <Ionicons name={triDate==='desc'?'arrow-down':'arrow-up'} size={14} color={C.primary}/>
            <Text style={styles.sortTxt}>{triDate==='desc'?'Plus récent':'Plus ancien'}</Text>
          </TouchableOpacity>
        </View>
        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={[styles.statVal,{color:C.accent}]}>+{fmt(totalRev)}</Text>
            <Text style={styles.statLbl}>Revenus</Text>
          </View>
          <View style={styles.statDiv}/>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={[styles.statVal,{color:'#FF8A80'}]}>-{fmt(totalDep)}</Text>
            <Text style={styles.statLbl}>Dépenses</Text>
          </View>
          <View style={styles.statDiv}/>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={[styles.statVal,{color:balance>=0?C.accent:'#FF8A80'}]}>
              {balance>=0?'+':''}{fmt(Math.abs(balance))}
            </Text>
            <Text style={styles.statLbl}>Balance</Text>
          </View>
        </View>
      </LinearGradient>

      {/* RECHERCHE */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={C.grayLight} style={{marginRight:8}}/>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une transaction..."
          placeholderTextColor={C.grayLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length>0 && (
          <TouchableOpacity onPress={()=>setSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.grayLight}/>
          </TouchableOpacity>
        )}
      </View>

      {/* FILTRES */}
      <View style={styles.filtresRow}>
        {[['tout','Tout'],['revenu','Revenus'],['depense','Dépenses']].map(([key,lbl])=>(
          <TouchableOpacity key={key} onPress={()=>switchFiltre(key)}
            style={[styles.filtreBtn, filtre===key && styles.filtreBtnActive]} activeOpacity={0.7}>
            {filtre===key
              ? <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.filtreBtnGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  <Text style={styles.filtreTxtActive}>{lbl}</Text>
                </LinearGradient>
              : <Text style={styles.filtreTxt}>{lbl}</Text>
            }
          </TouchableOpacity>
        ))}
        {/* Export */}
        <TouchableOpacity style={styles.exportBtn}>
          <Ionicons name="download-outline" size={14} color={C.primary}/>
          <Text style={styles.exportTxt}>CSV</Text>
        </TouchableOpacity>
      </View>

      {/* LISTE */}
      <Animated.ScrollView style={{opacity:fade}} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length===0 ? (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={C.border}/>
            <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
          </View>
        ) : filtered.map((tx,i) => {
          const isRev = tx.type==='revenu';
          const icon = ICON_CAT[tx.cat] || 'cash-outline';
          return (
            <TouchableOpacity key={tx.id} style={styles.txCard} activeOpacity={0.85}>
              <View style={[styles.txIcon,{backgroundColor:isRev?C.incomeLight:C.expenseLight}]}>
                <Ionicons name={icon} size={20} color={isRev?C.income:C.expense}/>
              </View>
              <View style={{flex:1,marginLeft:12}}>
                <Text style={styles.txTitle}>{tx.titre}</Text>
                <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:3}}>
                  <View style={[styles.catPill,{backgroundColor:isRev?C.incomeLight:C.expenseLight}]}>
                    <Text style={[styles.catTxt,{color:isRev?C.income:C.expense}]}>{tx.cat}</Text>
                  </View>
                  <Text style={{fontSize:11,color:C.grayLight}}>{tx.date}</Text>
                </View>
              </View>
              <View style={{alignItems:'flex-end',gap:5}}>
                <Text style={{fontSize:15,fontWeight:'800',color:isRev?C.income:C.expense}}>
                  {isRev?'+':'-'}{fmt(tx.montant)}
                </Text>
                <View style={[styles.dirIcon,{backgroundColor:isRev?C.incomeLight:C.expenseLight}]}>
                  <Ionicons name={isRev?'arrow-down':'arrow-up'} size={11} color={isRev?C.income:C.expense}/>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{height:100}}/>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:C.bg },
  header: { paddingTop:16, paddingBottom:24, paddingHorizontal:20, overflow:'hidden' },
  heroDeco: { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(20,255,236,0.07)', top:-80, right:-50 },
  headerTitle: { fontSize:26, fontWeight:'800', color:'#FFF', marginBottom:4 },
  headerSub: { fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:18 },
  sortBtn: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#FFF', borderRadius:20, paddingHorizontal:12, paddingVertical:7 },
  sortTxt: { fontSize:12, fontWeight:'700', color:C.primary },
  statsBar: { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:16, paddingVertical:14 },
  statVal: { fontSize:13, fontWeight:'800', color:'#FFF', marginBottom:3 },
  statLbl: { fontSize:11, color:'rgba(255,255,255,0.65)' },
  statDiv: { width:1, backgroundColor:'rgba(255,255,255,0.15)', marginVertical:4 },
  searchWrap: { flexDirection:'row', alignItems:'center', backgroundColor:C.card, marginHorizontal:20, marginTop:16, borderRadius:14, paddingHorizontal:14, height:48, borderWidth:1.5, borderColor:C.border },
  searchInput: { flex:1, fontSize:14, color:C.dark },
  filtresRow: { flexDirection:'row', alignItems:'center', paddingHorizontal:20, marginTop:12, marginBottom:4, gap:8 },
  filtreBtn: { borderRadius:20, overflow:'hidden', borderWidth:1.5, borderColor:C.border, backgroundColor:C.card },
  filtreBtnActive: { borderColor:'transparent' },
  filtreBtnGrad: { paddingHorizontal:14, paddingVertical:8 },
  filtreTxt: { paddingHorizontal:14, paddingVertical:8, fontSize:13, fontWeight:'600', color:C.gray },
  filtreTxtActive: { fontSize:13, fontWeight:'700', color:'#FFF' },
  exportBtn: { flexDirection:'row', alignItems:'center', gap:4, marginLeft:'auto', borderWidth:1.5, borderColor:C.primary, borderRadius:20, paddingHorizontal:12, paddingVertical:7 },
  exportTxt: { fontSize:12, fontWeight:'700', color:C.primary },
  list: { paddingHorizontal:20, paddingTop:12 },
  txCard: { flexDirection:'row', alignItems:'center', backgroundColor:C.card, borderRadius:16, padding:14, marginBottom:10, shadowColor:'#0D7377', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:8, elevation:2 },
  txIcon: { width:46, height:46, borderRadius:14, justifyContent:'center', alignItems:'center' },
  txTitle: { fontSize:14, fontWeight:'700', color:C.dark },
  catPill: { borderRadius:8, paddingHorizontal:8, paddingVertical:2 },
  catTxt: { fontSize:11, fontWeight:'600' },
  dirIcon: { width:20, height:20, borderRadius:6, justifyContent:'center', alignItems:'center' },
  empty: { alignItems:'center', paddingTop:60, gap:12 },
  emptyText: { fontSize:15, color:C.grayLight, fontWeight:'500' },
});

export default Historique;