import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary:'#0D7377',primaryMid:'#14919B',primaryLight:'#E6F7F7',accent:'#14FFEC',
  dark:'#111827',gray:'#6B7280',grayLight:'#9CA3AF',border:'#E5E7EB',
  bg:'#F8FFFE',card:'#FFFFFF',expense:'#EF4444',warning:'#F59E0B',warningLight:'#FFFBEB',
};

const NOTIFS = [
  { id:1, type:'objectif',  titre:'Objectif 65% atteint ! 🎉',     msg:'Tu progresses bien vers ton objectif "Voyage à Paris". Plus que 175 000 F à épargner !', heure:'Il y a 5 min',  lu:false, icon:'trophy',         couleur:'#F59E0B' },
  { id:2, type:'alerte',    titre:'Budget Loisirs dépassé',          msg:'Tes dépenses Loisirs dépassent ton budget de 15 000 F ce mois. Attention à tes prochaines sorties.', heure:'Il y a 1h', lu:false, icon:'warning', couleur:C.expense },
  { id:3, type:'epargne',   titre:'Rappel épargne mensuel',           msg:"N'oublie pas ton versement de 50 000 F pour ton fond d'urgence. Échéance dans 3 jours.", heure:'Il y a 3h', lu:false, icon:'flag', couleur:C.primary },
  { id:4, type:'conseil',   titre:'Conseil du jour 💡',               msg:'Tu pourrais économiser 20 000 F/mois en réduisant tes sorties restaurant de 2 fois par semaine à 1.', heure:'Hier', lu:true, icon:'bulb', couleur:'#8B5CF6' },
  { id:5, type:'revenu',    titre:'Revenu reçu',                       msg:'Un revenu de 150 000 F (Freelance) a été enregistré avec succès dans ton compte.', heure:'Hier', lu:true, icon:'arrow-down-circle', couleur:C.primary },
  { id:6, type:'analyse',   titre:'Rapport mensuel prêt 📊',           msg:"Ton rapport d'Octobre est disponible. Tu as économisé 50% de tes revenus. Excellent résultat !", heure:'Il y a 2j', lu:true, icon:'bar-chart', couleur:'#14919B' },
  { id:7, type:'securite',  titre:'Connexion depuis un nouvel appareil', msg:'Une connexion a été détectée depuis un Samsung Galaxy S23. Si ce n\'est pas vous, changez votre mot de passe.', heure:'Il y a 3j', lu:true, icon:'shield-checkmark', couleur:C.expense },
];

const TYPE_LABELS = { objectif:'Objectif', alerte:'Alerte', epargne:'Épargne', conseil:'Conseil', revenu:'Revenu', analyse:'Analyse', securite:'Sécurité' };

const Notifications = () => {
  const [notifs, setNotifs] = useState(NOTIFS);
  const [activeTab, setActiveTab] = useState('tout');
  const unread = notifs.filter(n => !n.lu).length;

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, lu:true })));
  const markRead    = (id) => setNotifs(notifs.map(n => n.id===id ? {...n,lu:true} : n));
  const dismiss     = (id) => setNotifs(notifs.filter(n => n.id!==id));

  const tabs = ['tout','alerte','conseil','epargne'];
  const displayed = activeTab==='tout' ? notifs : notifs.filter(n => n.type===activeTab);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco}/>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>
              {unread>0 ? `${unread} non lue${unread>1?'s':''}` : 'Tout est à jour ✓'}
            </Text>
          </View>
          {unread>0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Ionicons name="checkmark-done" size={15} color={C.primary}/>
              <Text style={styles.markAllTxt}>Tout lire</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsBar}>
          {[
            {label:'Non lues', val:unread, icon:'mail-unread', color:C.accent},
            {label:'Alertes', val:notifs.filter(n=>n.type==='alerte').length, icon:'warning', color:'#FF8A80'},
            {label:'Conseils', val:notifs.filter(n=>n.type==='conseil').length, icon:'bulb', color:'#FFCF7A'},
          ].map((s,i) => (
            <React.Fragment key={i}>
              {i>0 && <View style={styles.statDiv}/>}
              <View style={{flex:1,alignItems:'center',gap:3}}>
                <Ionicons name={s.icon} size={16} color={s.color}/>
                <Text style={{fontSize:18,fontWeight:'800',color:'#FFF'}}>{s.val}</Text>
                <Text style={{fontSize:11,color:'rgba(255,255,255,0.65)'}}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* ONGLETS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabsContent}>
        {tabs.map(t => (
          <TouchableOpacity key={t} onPress={()=>setActiveTab(t)}
            style={[styles.tabBtn, activeTab===t && styles.tabBtnActive]} activeOpacity={0.7}>
            {activeTab===t
              ? <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.tabGrad} start={{x:0,y:0}} end={{x:1,y:0}}>
                  <Text style={styles.tabTxtActive}>{t==='tout'?'Tout':TYPE_LABELS[t]}</Text>
                </LinearGradient>
              : <Text style={styles.tabTxt}>{t==='tout'?'Tout':TYPE_LABELS[t]}</Text>
            }
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTE */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {unread===0 && activeTab==='tout' && (
          <View style={styles.allReadBanner}>
            <Ionicons name="checkmark-circle" size={18} color={C.primary}/>
            <Text style={styles.allReadTxt}>Toutes les notifications sont lues</Text>
          </View>
        )}

        {displayed.length===0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="notifications-off" size={36} color={C.grayLight}/></View>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptyMsg}>Les nouvelles alertes apparaîtront ici</Text>
          </View>
        ) : displayed.map(n => (
          <TouchableOpacity key={n.id} style={[styles.notifCard, !n.lu && styles.notifUnread]}
            onPress={()=>markRead(n.id)} activeOpacity={0.85}>
            {!n.lu && <View style={styles.unreadDot}/>}
            <View style={[styles.notifIcon,{backgroundColor:n.couleur+'18'}]}>
              <Ionicons name={n.icon} size={22} color={n.couleur}/>
            </View>
            <View style={{flex:1,marginLeft:12}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:6,marginBottom:4}}>
                <Text style={[styles.notifTitle, !n.lu && {color:C.dark}]}>{n.titre}</Text>
              </View>
              <Text style={styles.notifMsg}>{n.msg}</Text>
              <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:6}}>
                <View style={[styles.typePill,{backgroundColor:n.couleur+'15'}]}>
                  <Text style={[styles.typeTxt,{color:n.couleur}]}>{TYPE_LABELS[n.type]}</Text>
                </View>
                <Text style={styles.notifHeure}>{n.heure}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={()=>dismiss(n.id)} hitSlop={{top:10,bottom:10,left:10,right:10}} style={{paddingLeft:8,paddingTop:2}}>
              <Ionicons name="close" size={16} color={C.grayLight}/>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={{height:100}}/>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F8FFFE' },
  header: { paddingTop:16, paddingBottom:24, paddingHorizontal:20, overflow:'hidden' },
  heroDeco: { position:'absolute', width:180, height:180, borderRadius:90, backgroundColor:'rgba(20,255,236,0.07)', top:-70, right:-40 },
  headerTitle: { fontSize:26, fontWeight:'800', color:'#FFF', marginBottom:4 },
  headerSub: { fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:18 },
  markAllBtn: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#FFF', borderRadius:20, paddingHorizontal:14, paddingVertical:8 },
  markAllTxt: { fontSize:13, fontWeight:'700', color:C.primary },
  statsBar: { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:16, paddingVertical:14 },
  statDiv: { width:1, backgroundColor:'rgba(255,255,255,0.15)', marginVertical:4 },
  tabsWrap: { maxHeight:56 },
  tabsContent: { paddingHorizontal:20, paddingTop:14, paddingBottom:4, gap:8, flexDirection:'row' },
  tabBtn: { borderRadius:20, overflow:'hidden', borderWidth:1.5, borderColor:'#E5E7EB', backgroundColor:'#FFF' },
  tabBtnActive: { borderColor:'transparent' },
  tabGrad: { paddingHorizontal:16, paddingVertical:8 },
  tabTxt: { paddingHorizontal:16, paddingVertical:8, fontSize:13, fontWeight:'600', color:'#6B7280' },
  tabTxtActive: { fontSize:13, fontWeight:'700', color:'#FFF' },
  list: { paddingHorizontal:20, paddingTop:14 },
  allReadBanner: { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:C.primaryLight, borderRadius:12, padding:12, marginBottom:14 },
  allReadTxt: { fontSize:13, fontWeight:'600', color:C.primary },
  notifCard: { flexDirection:'row', alignItems:'flex-start', backgroundColor:'#FFF', borderRadius:16, padding:14, marginBottom:10, position:'relative', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.04, shadowRadius:8, elevation:2 },
  notifUnread: { borderLeftWidth:3, borderLeftColor:C.primary, backgroundColor:'#FAFFFE' },
  unreadDot: { position:'absolute', top:16, right:16, width:8, height:8, borderRadius:4, backgroundColor:C.primary },
  notifIcon: { width:46, height:46, borderRadius:14, justifyContent:'center', alignItems:'center', flexShrink:0 },
  notifTitle: { fontSize:14, fontWeight:'700', color:'#1F2937', flexShrink:1 },
  notifMsg: { fontSize:13, color:'#6B7280', lineHeight:19 },
  typePill: { borderRadius:8, paddingHorizontal:8, paddingVertical:2 },
  typeTxt: { fontSize:11, fontWeight:'600' },
  notifHeure: { fontSize:11, color:'#9CA3AF' },
  empty: { alignItems:'center', paddingTop:60, gap:10 },
  emptyIcon: { width:76, height:76, borderRadius:22, backgroundColor:'#F3F4F6', justifyContent:'center', alignItems:'center', marginBottom:6 },
  emptyTitle: { fontSize:17, fontWeight:'700', color:'#111827' },
  emptyMsg: { fontSize:14, color:'#9CA3AF' },
});

export default Notifications;