import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary:'#0D7377',primaryMid:'#14919B',primaryLight:'#E6F7F7',accent:'#14FFEC',
  dark:'#111827',dark2:'#1F2937',gray:'#6B7280',grayLight:'#9CA3AF',
  border:'#E5E7EB',borderLight:'#F3F4F6',bg:'#F8FFFE',card:'#FFFFFF',
  expense:'#EF4444',expenseLight:'#FEF2F2',warning:'#F59E0B',
};

const MENU_SECTIONS = [
  {
    titre: 'Mon compte',
    items: [
      { icon:'person-outline', label:'Informations personnelles', color:C.primary, bg:C.primaryLight, screen:'profil' },
      { icon:'card-outline', label:'Mes objectifs d\'épargne', color:'#8B5CF6', bg:'#EDE9FE', screen:'objectifs' },
      { icon:'notifications-outline', label:'Notifications', color:C.warning, bg:'#FFFBEB', screen:'notifications' },
    ]
  },
  {
    titre: 'Finances',
    items: [
      { icon:'swap-horizontal-outline', label:'Mes transactions', color:C.primary, bg:C.primaryLight, screen:'transactions' },
      { icon:'time-outline', label:'Historique complet', color:'#14919B', bg:'#E0F7FA', screen:'historique' },
      { icon:'pie-chart-outline', label:'Analyses & prédictions', color:'#8B5CF6', bg:'#EDE9FE', screen:'analyse' },
    ]
  },
  {
    titre: 'Préférences',
    items: [
      { icon:'shield-checkmark-outline', label:'Sécurité & confidentialité', color:C.primary, bg:C.primaryLight },
      { icon:'language-outline', label:'Langue de l\'application', color:C.warning, bg:'#FFFBEB', sublabel:'Français' },
      { icon:'moon-outline', label:'Mode sombre', color:'#1F2937', bg:'#F3F4F6', isToggle:true, toggleKey:'darkMode' },
      { icon:'finger-print-outline', label:'Authentification biométrique', color:C.primary, bg:C.primaryLight, isToggle:true, toggleKey:'biometric' },
    ]
  },
  {
    titre: 'Support',
    items: [
      { icon:'help-circle-outline', label:'Centre d\'aide', color:'#14919B', bg:'#E0F7FA' },
      { icon:'chatbubble-outline', label:'Contacter le support', color:C.primary, bg:C.primaryLight },
      { icon:'star-outline', label:'Donner un avis', color:C.warning, bg:'#FFFBEB' },
      { icon:'information-circle-outline', label:'À propos de WisePocket', color:C.gray, bg:C.borderLight },
    ]
  },
];

const CompteUtilisateur = ({ navigation }) => {
  const [toggles, setToggles] = useState({ darkMode:false, biometric:true, notifs:true });
  const toggle = (key) => setToggles(p => ({...p,[key]:!p[key]}));

  const handleItem = (item) => {
    if (item.screen && navigation) navigation.navigate?.(item.screen);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion','Êtes-vous sûr de vouloir vous déconnecter ?',
      [{text:'Annuler',style:'cancel'},{text:'Déconnexion',style:'destructive',onPress:()=>{}}]);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={[C.primary,C.primaryMid]} style={styles.header} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.heroDeco}/>

        {/* Avatar + infos */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <LinearGradient colors={['rgba(255,255,255,0.3)','rgba(255,255,255,0.1)']} style={styles.avatar}>
              <Text style={styles.avatarInitials}>IN</Text>
            </LinearGradient>
            <View style={styles.avatarEdit}>
              <Ionicons name="camera" size={12} color="#FFF"/>
            </View>
          </View>
          <View style={{flex:1}}>
            <Text style={styles.profileName}>Ines Nguemo</Text>
            <Text style={styles.profileEmail}>ines.nguemo@email.cm</Text>
            <View style={styles.planBadge}>
              <Ionicons name="star" size={12} color={C.accent}/>
              <Text style={styles.planTxt}>Plan Gratuit</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.9)"/>
          </TouchableOpacity>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsBar}>
          {[
            {val:'1 250 000 F', lbl:'Solde', icon:'wallet'},
            {val:'3', lbl:'Objectifs', icon:'flag'},
            {val:'50%', lbl:'Épargne', icon:'trending-up'},
          ].map((s,i) => (
            <React.Fragment key={i}>
              {i>0 && <View style={styles.statDiv}/>}
              <View style={{flex:1,alignItems:'center',gap:3}}>
                <Ionicons name={s.icon} size={15} color={C.accent}/>
                <Text style={{fontSize:14,fontWeight:'800',color:'#FFF'}}>{s.val}</Text>
                <Text style={{fontSize:11,color:'rgba(255,255,255,0.65)'}}>{s.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* MENU */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Upgrade banner */}
        <LinearGradient colors={[C.dark,'#1F2937']} style={styles.upgradeBanner} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={styles.upgradeLeft}>
            <Text style={styles.upgradeTitre}>Passe à Premium ✨</Text>
            <Text style={styles.upgradeSub}>Analyses avancées, budgets illimités, export PDF</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnTxt}>Essayer</Text>
          </TouchableOpacity>
        </LinearGradient>

        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={{marginTop:24}}>
            <Text style={styles.sectionTitre}>{section.titre}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuItem, ii<section.items.length-1 && styles.menuItemBorder]}
                  onPress={() => handleItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIcon,{backgroundColor:item.bg}]}>
                    <Ionicons name={item.icon} size={20} color={item.color}/>
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.sublabel && <Text style={styles.menuSublabel}>{item.sublabel}</Text>}
                  {item.isToggle
                    ? <Switch
                        value={toggles[item.toggleKey]}
                        onValueChange={()=>toggle(item.toggleKey)}
                        trackColor={{false:C.border, true:C.primary+'80'}}
                        thumbColor={toggles[item.toggleKey]?C.primary:'#FFF'}
                        style={{transform:[{scaleX:0.85},{scaleY:0.85}]}}
                      />
                    : <Ionicons name="chevron-forward" size={18} color={C.grayLight}/>
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={styles.logoutIcon}><Ionicons name="log-out-outline" size={20} color={C.expense}/></View>
          <Text style={styles.logoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={styles.version}>WisePocket v1.0.0 · Made in 🇨🇲 Cameroun</Text>
        <View style={{height:80}}/>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F8FFFE' },
  header: { paddingTop:16, paddingBottom:24, paddingHorizontal:20, overflow:'hidden' },
  heroDeco: { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(20,255,236,0.07)', top:-80, right:-50 },
  profileRow: { flexDirection:'row', alignItems:'center', gap:14, marginBottom:20 },
  avatarWrap: { position:'relative' },
  avatar: { width:70, height:70, borderRadius:22, justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.3)' },
  avatarInitials: { fontSize:24, fontWeight:'800', color:'#FFF' },
  avatarEdit: { position:'absolute', bottom:-2, right:-2, width:22, height:22, borderRadius:8, backgroundColor:C.primary, justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'#FFF' },
  profileName: { fontSize:19, fontWeight:'800', color:'#FFF', marginBottom:3 },
  profileEmail: { fontSize:13, color:'rgba(255,255,255,0.75)', marginBottom:7 },
  planBadge: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'rgba(20,255,236,0.15)', borderRadius:10, paddingHorizontal:10, paddingVertical:3, alignSelf:'flex-start', borderWidth:1, borderColor:'rgba(20,255,236,0.3)' },
  planTxt: { fontSize:12, fontWeight:'700', color:C.accent },
  editBtn: { padding:8 },
  statsBar: { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:16, paddingVertical:14 },
  statDiv: { width:1, backgroundColor:'rgba(255,255,255,0.15)', marginVertical:4 },
  scroll: { paddingHorizontal:20, paddingTop:16 },
  upgradeBanner: { borderRadius:20, padding:18, flexDirection:'row', alignItems:'center', gap:12, overflow:'hidden' },
  upgradeLeft: { flex:1 },
  upgradeTitre: { fontSize:16, fontWeight:'800', color:'#FFF', marginBottom:4 },
  upgradeSub: { fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:18 },
  upgradeBtn: { backgroundColor:'rgba(20,255,236,0.2)', borderRadius:14, paddingHorizontal:16, paddingVertical:10, borderWidth:1, borderColor:'rgba(20,255,236,0.4)' },
  upgradeBtnTxt: { fontSize:14, fontWeight:'800', color:C.accent },
  sectionTitre: { fontSize:13, fontWeight:'700', color:C.grayLight, letterSpacing:0.5, textTransform:'uppercase', marginBottom:10, marginLeft:4 },
  sectionCard: { backgroundColor:C.card, borderRadius:20, overflow:'hidden', shadowColor:'#0D7377', shadowOffset:{width:0,height:2}, shadowOpacity:0.06, shadowRadius:10, elevation:2 },
  menuItem: { flexDirection:'row', alignItems:'center', paddingVertical:14, paddingHorizontal:16, gap:12 },
  menuItemBorder: { borderBottomWidth:1, borderBottomColor:C.borderLight },
  menuIcon: { width:40, height:40, borderRadius:12, justifyContent:'center', alignItems:'center' },
  menuLabel: { flex:1, fontSize:15, fontWeight:'600', color:C.dark },
  menuSublabel: { fontSize:13, color:C.grayLight, marginRight:4 },
  logoutBtn: { flexDirection:'row', alignItems:'center', backgroundColor:C.card, borderRadius:20, padding:16, marginTop:24, gap:12, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.04, shadowRadius:8, elevation:2 },
  logoutIcon: { width:40, height:40, borderRadius:12, backgroundColor:'#FEF2F2', justifyContent:'center', alignItems:'center' },
  logoutTxt: { fontSize:15, fontWeight:'700', color:C.expense },
  version: { textAlign:'center', fontSize:12, color:C.grayLight, marginTop:20, fontWeight:'500' },
});

export default CompteUtilisateur;