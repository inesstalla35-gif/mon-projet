import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet,
  ScrollView, StatusBar, BackHandler, Vibration, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../actions/authActions';

// ── Screens ──────────────────────────────────────────────────────
import Accueil           from './Accueil';
import Dashboard         from './Dashboard';
import Notifications     from './Notifications';
import CompteUtilisateur from './CompteUtilisateur';
import Transaction       from './Transaction';
import CreateGoalScreen  from './CreateGoalScreen';
import ObjectifsScreen   from './Objectifsscreen';
import AnalysePrediction from './AnalysePrediction';
import ProfileScreen     from './profile';

const { width } = Dimensions.get('window');

const C = {
  primary:'#0D7377', primaryMid:'#14919B', primaryLight:'#E6F7F7', accent:'#14FFEC',
  dark:'#111827', dark2:'#1F2937', gray:'#6B7280', grayLight:'#9CA3AF',
  border:'#E5E7EB', bg:'#F8FFFE', card:'#FFFFFF', expense:'#EF4444',
};

// 3 onglets : Accueil | Objectifs | [FAB] | Analyse
const NAV_TABS = [
  { key:'accueil',   label:'Accueil',  icon:'home-outline',      activeIcon:'home'      },
  { key:'objectifs', label:'Objectifs',icon:'flag-outline',      activeIcon:'flag'      },
  { key:'analyse',   label:'Analyse',  icon:'pie-chart-outline', activeIcon:'pie-chart' },
];

const DRAWER_ITEMS = [
  { key:'accueil',       label:'Accueil',              icon:'home-outline',            section:null     },
  { key:'dashboard',     label:'Tableau de bord',      icon:'grid-outline',            section:null     },
  { key:'transaction',   label:'Nouvelle transaction', icon:'swap-horizontal-outline', section:null     },
  { key:'objectifs',     label:'Mes objectifs',        icon:'flag-outline',            section:null     },
  { key:'newGoal',       label:'Créer un objectif',    icon:'add-circle-outline',      section:null     },
  { key:'analyse',       label:'Analyses & Stats',     icon:'pie-chart-outline',       section:null     },
  { key:'notifications', label:'Notifications',        icon:'notifications-outline',   section:null     },
  { key:'profil',        label:'Mon profil',           icon:'person-circle-outline',   section:'compte' },
  { key:'compte',        label:'Paramètres',           icon:'settings-outline',        section:'compte' },
];

const HEADER_TITLES = {
  accueil:'WisePocket', dashboard:'Tableau de bord', transaction:'Transaction',
  objectifs:'Mes objectifs', newGoal:'Nouvel objectif',
  analyse:'Analyses', notifications:'Notifications',
  profil:'Mon profil', compte:'Paramètres',
};

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

export default function Home() {
  const [activeTab,       setActiveTab]    = useState('accueil');
  const [history,         setHistory]      = useState(['accueil']);
  const [tabParams,       setTabParams]    = useState({});
  const [menuOpen,        setMenuOpen]     = useState(false);
  const [addMenuOpen,     setAddMenuOpen]  = useState(false);
  const [keyboardVisible, setKb]           = useState(false);
  const [notifCount]                       = useState(3);

  const insets   = useSafeAreaInsets();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const initials  = getInitials(user?.nom, user?.prenom);
  const fullName  = getFullName(user);
  const userEmail = user?.email || '';

  const backCount    = useRef(0);
  const slideAnim    = useRef(new Animated.Value(-width * 0.8)).current;
  const overlayAnim  = useRef(new Animated.Value(0)).current;
  const addAnim      = useRef(new Animated.Value(0)).current;
  const addRotAnim   = useRef(new Animated.Value(0)).current;
  const tabScaleAnim = useRef(
    NAV_TABS.reduce((a, t) => ({ ...a, [t.key]: new Animated.Value(1) }), {})
  ).current;

  useEffect(() => {
    const s = Keyboard.addListener('keyboardDidShow', () => setKb(true));
    const h = Keyboard.addListener('keyboardDidHide', () => setKb(false));
    return () => { s.remove(); h.remove(); };
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen)    { closeMenu();    return true; }
      if (addMenuOpen) { closeAddMenu(); return true; }
      if (history.length > 1) {
        const h = [...history]; h.pop();
        setHistory(h);
        setActiveTab(h[h.length - 1]);
        backCount.current = 0;
        return true;
      }
      backCount.current++;
      if (backCount.current === 1) { setTimeout(() => backCount.current = 0, 2000); return true; }
      return false;
    });
    return () => handler.remove();
  }, [menuOpen, addMenuOpen, history]);

  const switchTab = useCallback((tab, params = {}) => {
    Vibration.vibrate(8);
    if (tabScaleAnim[tab]) {
      Animated.sequence([
        Animated.spring(tabScaleAnim[tab], { toValue:1.2, useNativeDriver:true, tension:120 }),
        Animated.spring(tabScaleAnim[tab], { toValue:1,   useNativeDriver:true, tension:80  }),
      ]).start();
    }
    setTabParams(prev => ({ ...prev, [tab]: params }));
    setActiveTab(tab);
    setHistory(p => [...p, tab]);
    if (menuOpen)    closeMenu();
    if (addMenuOpen) closeAddMenu();
  }, [menuOpen, addMenuOpen]);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue:0, damping:20, stiffness:120, useNativeDriver:true }),
      Animated.timing(overlayAnim, { toValue:1, duration:250, useNativeDriver:true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue:-width*0.8, damping:20, stiffness:120, useNativeDriver:true }),
      Animated.timing(overlayAnim, { toValue:0, duration:200, useNativeDriver:true }),
    ]).start(() => setMenuOpen(false));
  };

  const openAddMenu = () => {
    setAddMenuOpen(true);
    Animated.parallel([
      Animated.spring(addAnim,    { toValue:1, friction:7, useNativeDriver:true }),
      Animated.timing(addRotAnim, { toValue:1, duration:220, useNativeDriver:true }),
    ]).start();
  };

  const closeAddMenu = () => {
    Animated.parallel([
      Animated.timing(addAnim,    { toValue:0, duration:180, useNativeDriver:true }),
      Animated.timing(addRotAnim, { toValue:0, duration:180, useNativeDriver:true }),
    ]).start(() => setAddMenuOpen(false));
  };

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
  };

  const makeNav = (backTab = 'accueil') => ({
    goBack:   () => switchTab(backTab),
    navigate: (tab, params) => switchTab(tab, params || {}),
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'accueil':       return <Accueil onNavigate={switchTab}/>;
      case 'dashboard':     return <Dashboard/>;
      case 'notifications': return <Notifications/>;
      case 'compte':        return <CompteUtilisateur/>;
      case 'transaction':   return <Transaction navigation={makeNav('accueil')}/>;
      case 'objectifs':     return <ObjectifsScreen navigation={makeNav('accueil')} route={{ params: tabParams['objectifs'] || {} }}/>;
      case 'newGoal':       return <CreateGoalScreen navigation={makeNav('objectifs')} route={{ params: tabParams['newGoal'] || {} }}/>;
      case 'analyse':       return <AnalysePrediction/>;
      case 'profil':        return <ProfileScreen/>;
      default:              return <Accueil onNavigate={switchTab}/>;
    }
  };

  const addRot = addRotAnim.interpolate({ inputRange:[0,1], outputRange:['0deg','45deg'] });

  // Avec 3 onglets : 1 à gauche du FAB, 2 à droite
  const leftTabs  = NAV_TABS.slice(0, 1);  // Accueil
  const rightTabs = NAV_TABS.slice(1, 3);  // Objectifs + Analyse

  const QUICK_ADD = [
    { icon:'add-circle',    label:'Revenu',            color:C.primary, bg:C.primaryLight, tab:'transaction' },
    { icon:'remove-circle', label:'Dépense',           color:C.expense, bg:'#FEF2F2',      tab:'transaction' },
    { icon:'flag',          label:'Créer un objectif', color:'#8B5CF6', bg:'#EDE9FE',      tab:'newGoal'     },
    { icon:'bar-chart',     label:'Tableau de bord',   color:'#14919B', bg:C.primaryLight, tab:'dashboard'   },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary}/>

      {/* HEADER */}
      <LinearGradient colors={[C.primary,C.primaryMid]} style={[styles.header,{paddingTop:insets.top}]} start={{x:0,y:0}} end={{x:1,y:1}}>
        <View style={styles.headerDeco}/>
        <TouchableOpacity style={styles.headerBtn} onPress={openMenu}>
          <Ionicons name="menu" size={24} color="#FFF"/>
        </TouchableOpacity>

        <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
          <View style={styles.logoWrap}>
            <Ionicons name="wallet" size={18} color={C.accent}/>
          </View>
          <Text style={styles.headerTitle}>{HEADER_TITLES[activeTab]||'WisePocket'}</Text>
        </View>

        <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
          <TouchableOpacity style={styles.headerBtn} onPress={()=>switchTab('notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#FFF"/>
            {notifCount>0 && (
              <View style={styles.notifBadge}>
                <Text style={{fontSize:9,fontWeight:'800',color:'#FFF'}}>{notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarHeaderBtn} onPress={()=>switchTab('profil')} activeOpacity={0.85}>
            <LinearGradient colors={['rgba(255,255,255,0.25)','rgba(255,255,255,0.1)']} style={styles.avatarHeaderGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={styles.avatarHeaderInitials}>{initials}</Text>
            </LinearGradient>
            {activeTab==='profil' && <View style={styles.avatarActiveDot}/>}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* CONTENU */}
      <View style={styles.content}>{renderContent()}</View>

      {/* BARRE DE NAVIGATION */}
      {!keyboardVisible && (
        <View style={[styles.bottomWrap,{paddingBottom:Math.max(insets.bottom,8)}]}>
          <View style={styles.tabBar}>
            {/* Gauche : Accueil */}
            <View style={styles.side}>
              {leftTabs.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <Animated.View key={tab.key} style={{flex:1,transform:[{scale:tabScaleAnim[tab.key]||1}]}}>
                    <TouchableOpacity style={styles.tabBtn} onPress={()=>switchTab(tab.key)}>
                      <View style={[styles.tabPill, isActive && styles.tabPillActive]}>
                        <Ionicons name={isActive?tab.activeIcon:tab.icon} size={22} color={isActive?C.primary:C.grayLight}/>
                      </View>
                      <Text style={[styles.tabLbl, isActive && styles.tabLblActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            <View style={{width:68}}/>

            {/* Droite : Objectifs + Analyse */}
            <View style={styles.side}>
              {rightTabs.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <Animated.View key={tab.key} style={{flex:1,transform:[{scale:tabScaleAnim[tab.key]||1}]}}>
                    <TouchableOpacity style={styles.tabBtn} onPress={()=>switchTab(tab.key)}>
                      <View style={[styles.tabPill, isActive && styles.tabPillActive]}>
                        <Ionicons name={isActive?tab.activeIcon:tab.icon} size={22} color={isActive?C.primary:C.grayLight}/>
                      </View>
                      <Text style={[styles.tabLbl, isActive && styles.tabLblActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>

          {/* FAB central */}
          <View style={styles.fabWrap}>
            <TouchableOpacity onPress={()=>addMenuOpen?closeAddMenu():openAddMenu()} activeOpacity={0.9} style={styles.fab}>
              <LinearGradient colors={[C.dark,C.dark2]} style={styles.fabGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Animated.View style={{transform:[{rotate:addRot}]}}>
                  <Ionicons name="add" size={30} color={C.accent}/>
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MENU RAPIDE */}
      {addMenuOpen && (
        <Animated.View style={[styles.quickMenu,{
          bottom:90+Math.max(insets.bottom,8),
          opacity:addAnim,
          transform:[{translateY:addAnim.interpolate({inputRange:[0,1],outputRange:[20,0]})}],
        }]}>
          <Text style={styles.quickMenuTitle}>Que voulez-vous faire ?</Text>
          {QUICK_ADD.map((a,i)=>(
            <TouchableOpacity key={i} style={styles.quickMenuItem} onPress={()=>{closeAddMenu();switchTab(a.tab);}}>
              <View style={[styles.quickMenuIcon,{backgroundColor:a.bg}]}>
                <Ionicons name={a.icon} size={22} color={a.color}/>
              </View>
              <Text style={styles.quickMenuLbl}>{a.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.grayLight}/>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* DRAWER */}
      <Animated.View style={[styles.drawer,{transform:[{translateX:slideAnim}]}]}>
        <LinearGradient colors={[C.primary,C.primaryMid]} style={[styles.drawerHero,{paddingTop:insets.top+16}]} start={{x:0,y:0}} end={{x:1,y:1}}>
          <View style={styles.drawerDeco}/>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarTxt}>{initials}</Text>
          </View>
          <Text style={styles.drawerName}>{fullName}</Text>
          <Text style={styles.drawerEmail}>{userEmail}</Text>
          <View style={styles.drawerPlan}>
            <Ionicons name="star" size={11} color={C.accent}/>
            <Text style={styles.drawerPlanTxt}>Plan Gratuit</Text>
          </View>
        </LinearGradient>

        <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
          <View style={{paddingVertical:10}}>
            {DRAWER_ITEMS.map((item,i) => {
              const isActive  = activeTab === item.key;
              const isSection = i > 0 && DRAWER_ITEMS[i-1].section !== item.section && item.section;
              return (
                <React.Fragment key={item.key}>
                  {isSection && (
                    <View style={styles.drawerDivider}>
                      <Text style={styles.drawerDividerTxt}>{item.section?.toUpperCase()}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={[styles.drawerItem, isActive&&styles.drawerItemActive]} onPress={()=>switchTab(item.key)}>
                    <View style={[styles.drawerItemIcon,{backgroundColor:isActive?C.primaryLight:'transparent'}]}>
                      <Ionicons name={item.icon} size={20} color={isActive?C.primary:C.gray}/>
                    </View>
                    <Text style={[styles.drawerItemTxt, isActive&&{color:C.primary,fontWeight:'700'}]}>{item.label}</Text>
                    {isActive && <Ionicons name="chevron-forward" size={14} color={C.primary}/>}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>

          <View style={styles.drawerFooter}>
            <TouchableOpacity style={styles.drawerLogout} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={C.expense}/>
              <Text style={{fontSize:14,fontWeight:'700',color:C.expense}}>Déconnexion</Text>
            </TouchableOpacity>
            <Text style={{textAlign:'center',fontSize:11,color:C.grayLight,marginTop:10}}>
              WisePocket v1.0.0 · 🇨🇲
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {menuOpen && (
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={closeMenu}>
          <Animated.View style={[styles.overlay,{opacity:overlayAnim}]}/>
        </TouchableOpacity>
      )}
      {addMenuOpen && (
        <TouchableOpacity style={[StyleSheet.absoluteFillObject,{bottom:90}]} activeOpacity={1} onPress={closeAddMenu}/>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex:1, backgroundColor:C.bg },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingBottom:14, overflow:'hidden' },
  headerDeco: { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(20,255,236,0.05)', top:-100, right:-80 },
  headerBtn: { width:42, height:42, borderRadius:13, backgroundColor:'rgba(255,255,255,0.15)', justifyContent:'center', alignItems:'center' },
  logoWrap: { width:34, height:34, borderRadius:10, backgroundColor:'rgba(20,255,236,0.15)', justifyContent:'center', alignItems:'center' },
  headerTitle: { fontSize:17, fontWeight:'800', color:'#FFF' },
  notifBadge: { position:'absolute', top:7, right:7, width:15, height:15, borderRadius:8, backgroundColor:C.expense, justifyContent:'center', alignItems:'center' },
  avatarHeaderBtn: { position:'relative' },
  avatarHeaderGrad: { width:38, height:38, borderRadius:12, justifyContent:'center', alignItems:'center', borderWidth:1.5, borderColor:'rgba(255,255,255,0.25)' },
  avatarHeaderInitials: { fontSize:13, fontWeight:'900', color:'#FFF', letterSpacing:0.5 },
  avatarActiveDot: { position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:5, backgroundColor:C.accent, borderWidth:2, borderColor:C.primary },
  content: { flex:1 },
  bottomWrap: { position:'absolute', bottom:0, left:0, right:0, zIndex:20 },
  tabBar: { flexDirection:'row', backgroundColor:C.card, borderTopLeftRadius:24, borderTopRightRadius:24, height:70, alignItems:'center', shadowColor:'#000', shadowOffset:{width:0,height:-4}, shadowOpacity:0.10, shadowRadius:14, elevation:14 },
  side: { flexDirection:'row', flex:1, justifyContent:'space-around' },
  tabBtn: { alignItems:'center', justifyContent:'center', flex:1, paddingTop:8, paddingBottom:6 },
  tabPill: { width:44, height:32, borderRadius:16, justifyContent:'center', alignItems:'center', backgroundColor:'transparent', marginBottom:2 },
  tabPillActive: { backgroundColor:C.primaryLight },
  tabLbl: { fontSize:10, fontWeight:'600', color:C.grayLight },
  tabLblActive: { color:C.primary, fontWeight:'800' },
  fabWrap: { position:'absolute', left:'50%', marginLeft:-33, top:-26, zIndex:30 },
  fab: { width:66, height:66, borderRadius:33 },
  fabGrad: { flex:1, borderRadius:33, justifyContent:'center', alignItems:'center', borderWidth:4, borderColor:C.bg, shadowColor:C.dark, shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:10, elevation:10 },
  quickMenu: { position:'absolute', right:20, left:20, backgroundColor:C.card, borderRadius:22, padding:12, shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.15, shadowRadius:20, elevation:16, zIndex:100 },
  quickMenuTitle: { fontSize:12, fontWeight:'800', color:C.grayLight, letterSpacing:0.8, textTransform:'uppercase', marginBottom:8, marginLeft:4 },
  quickMenuItem: { flexDirection:'row', alignItems:'center', padding:12, borderRadius:14, gap:12, marginBottom:4 },
  quickMenuIcon: { width:44, height:44, borderRadius:13, justifyContent:'center', alignItems:'center' },
  quickMenuLbl: { flex:1, fontSize:15, fontWeight:'600', color:C.dark },
  drawer: { position:'absolute', top:0, bottom:0, left:0, width:width*0.8, backgroundColor:C.card, zIndex:50, shadowColor:'#000', shadowOffset:{width:6,height:0}, shadowOpacity:0.15, shadowRadius:20, elevation:20 },
  drawerHero: { paddingHorizontal:20, paddingBottom:24, overflow:'hidden' },
  drawerDeco: { position:'absolute', width:200, height:200, borderRadius:100, backgroundColor:'rgba(20,255,236,0.06)', top:-80, right:-60 },
  drawerAvatar: { width:60, height:60, borderRadius:19, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.3)', marginBottom:10 },
  drawerAvatarTxt: { fontSize:20, fontWeight:'900', color:'#FFF' },
  drawerName: { fontSize:17, fontWeight:'800', color:'#FFF', marginBottom:3 },
  drawerEmail: { fontSize:12, color:'rgba(255,255,255,0.7)', marginBottom:8 },
  drawerPlan: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'rgba(20,255,236,0.15)', borderRadius:10, paddingHorizontal:10, paddingVertical:4, alignSelf:'flex-start', borderWidth:1, borderColor:'rgba(20,255,236,0.3)' },
  drawerPlanTxt: { fontSize:11, fontWeight:'700', color:C.accent },
  drawerDivider: { paddingHorizontal:16, paddingTop:14, paddingBottom:6 },
  drawerDividerTxt: { fontSize:10, fontWeight:'800', color:C.grayLight, letterSpacing:1 },
  drawerItem: { flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:12, borderRadius:14, marginHorizontal:8, marginBottom:2, gap:10 },
  drawerItemActive: { backgroundColor:C.primaryLight },
  drawerItemIcon: { width:36, height:36, borderRadius:10, justifyContent:'center', alignItems:'center' },
  drawerItemTxt: { flex:1, fontSize:14, fontWeight:'600', color:C.gray },
  drawerFooter: { paddingHorizontal:16, paddingBottom:30, paddingTop:10 },
  drawerLogout: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#FEF2F2', borderRadius:14, padding:14 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.45)' },
});