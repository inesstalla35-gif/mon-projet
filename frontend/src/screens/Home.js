import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  BackHandler,
  Vibration,
  Keyboard,
  ToastAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Screens
import Dashboard from './Dashboard';
import Transaction from './Transaction';
import Objectifs from './Objectifs';
import AnalysePrediction from './AnalysePrediction';
import Historique from './Historique';
import ProfileScreen from './profile';
import CompteUtilisateur from './CompteUtilisateur';

const { width, height } = Dimensions.get('window');
const CENTER_BUTTON_SIZE = 56;

/* ================= COLORS ================= */
const COLORS = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  accent: '#14919B',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  overlay: 'rgba(0,0,0,0.5)',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState(['dashboard']); // Historique des pages
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const insets = useSafeAreaInsets();
  const backPressCount = useRef(0);
  
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const addMenuAnim = useRef(new Animated.Value(0)).current;

  // Gestion clavier
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  /* ================= BACK HANDLER AVEC HISTORIQUE ================= */
  useEffect(() => {
    const backAction = () => {
      // 1. Fermer menu si ouvert
      if (menuOpen) {
        closeMenu();
        return true;
      }
      
      // 2. Fermer menu ajout si ouvert
      if (showAddMenu) {
        toggleAddMenu();
        return true;
      }
      
      // 3. Revenir à la page précédente si historique > 1
      if (history.length > 1) {
        const newHistory = [...history];
        newHistory.pop(); // Retire page actuelle
        const previousTab = newHistory[newHistory.length - 1];
        
        setHistory(newHistory);
        setActiveTab(previousTab);
        backPressCount.current = 0;
        return true;
      }
      
      // 4. Si première page, double-tap pour quitter
      backPressCount.current += 1;
      if (backPressCount.current === 1) {
        ToastAndroid.show('Appuyez encore pour quitter', ToastAndroid.SHORT);
        setTimeout(() => backPressCount.current = 0, 2000);
        return true;
      }
      return false; // Quitter app
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [menuOpen, showAddMenu, history]);

  /* ================= NAVIGATION AVEC HISTORIQUE ================= */
  const switchTab = useCallback((tab) => {
    if (tab === activeTab) return;
    
    Vibration.vibrate(10);
    setActiveTab(tab);
    setHistory(prev => [...prev, tab]); // Ajoute à l'historique
    
    if (menuOpen) closeMenu();
  }, [activeTab, menuOpen]);

  const openMenu = () => {
    Vibration.vibrate(20);
    setMenuOpen(true);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, damping: 25, stiffness: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: -width * 0.75, damping: 25, stiffness: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  const toggleAddMenu = () => {
    if (!showAddMenu) {
      setShowAddMenu(true);
      Animated.spring(addMenuAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
    } else {
      Animated.timing(addMenuAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowAddMenu(false));
    }
  };

  /* ================= RENDER ================= */
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transaction />;
      case 'objectifs': return <Objectifs />;
      case 'analyse': return <AnalysePrediction />;
      case 'historique': return <Historique />;
      case 'profil': return <ProfileScreen />;
      case 'compte': return <CompteUtilisateur />;
      default: return <Dashboard />;
    }
  };

  const leftTabs = [
    { key: 'dashboard', label: 'Accueil', icon: 'home-outline', activeIcon: 'home' },
    { key: 'analyse', label: 'Analyse', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
  ];

  const rightTabs = [
    { key: 'objectifs', label: 'Objectifs', icon: 'flag-outline', activeIcon: 'flag' },
    { key: 'profil', label: 'Profil', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />
      
      {/* HEADER STANDARD (pas flottant, hauteur normale) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openMenu} style={styles.headerButton}>
          <Ionicons name="menu" size={26} color={COLORS.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>WisePocket</Text>
        
        <TouchableOpacity onPress={() => switchTab('profil')} style={styles.headerButton}>
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={20} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* BOTTOM NAVIGATION */}
      {!keyboardVisible && (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.tabBarBackground}>
            <View style={styles.sideContainer}>
              {leftTabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabButton}
                  onPress={() => switchTab(tab.key)}
                >
                  <Ionicons
                    name={activeTab === tab.key ? tab.activeIcon : tab.icon}
                    size={24}
                    color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.tabLabel,
                    { color: activeTab === tab.key ? COLORS.primary : COLORS.textSecondary }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ width: CENTER_BUTTON_SIZE }} />

            <View style={styles.sideContainer}>
              {rightTabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.tabButton}
                  onPress={() => switchTab(tab.key)}
                >
                  <Ionicons
                    name={activeTab === tab.key ? tab.activeIcon : tab.icon}
                    size={24}
                    color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[
                    styles.tabLabel,
                    { color: activeTab === tab.key ? COLORS.primary : COLORS.textSecondary }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BOUTON PLUS CENTRAL */}
          <View style={styles.centerButtonWrapper}>
            <TouchableOpacity
              style={styles.centerButton}
              onPress={toggleAddMenu}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Animated.View style={{ 
                  transform: [{ 
                    rotate: addMenuAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '45deg']
                    })
                  }] 
                }}>
                  <Ionicons name="add" size={30} color="#FFF" />
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu flottant + */}
      {showAddMenu && (
        <TouchableOpacity 
          style={styles.addMenuOverlay} 
          activeOpacity={1}
          onPress={toggleAddMenu}
        >
          <Animated.View style={[
            styles.addMenu,
            { 
              bottom: 90 + insets.bottom,
              opacity: addMenuAnim,
              transform: [{ 
                translateY: addMenuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}>
            <TouchableOpacity style={styles.addMenuItem} onPress={() => { toggleAddMenu(); switchTab('transactions'); }}>
              <View style={[styles.addMenuIcon, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="swap-vertical" size={20} color="#FFF" />
              </View>
              <Text style={styles.addMenuText}>Transaction</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addMenuItem} onPress={() => { toggleAddMenu(); switchTab('objectifs'); }}>
              <View style={[styles.addMenuIcon, { backgroundColor: COLORS.accent }]}>
                <Ionicons name="flag" size={20} color="#FFF" />
              </View>
              <Text style={styles.addMenuText}>Objectif</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* DRAWER */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
          <View style={styles.drawerHeader}>
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.drawerLogo}>
              <Ionicons name="wallet" size={32} color={COLORS.secondary} />
            </LinearGradient>
            <Text style={styles.drawerTitle}>WisePocket</Text>
            <Text style={styles.drawerSubtitle}>Mon compagnon financier</Text>
          </View>
          
          <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
            {[
              { key: 'dashboard', label: 'Tableau de bord', icon: 'home-outline' },
              { key: 'transactions', label: 'Transactions', icon: 'swap-horizontal-outline' },
              { key: 'objectifs', label: 'Mes Objectifs', icon: 'flag-outline' },
              { key: 'analyse', label: 'Analyses & Stats', icon: 'pie-chart-outline' },
              { key: 'historique', label: 'Historique', icon: 'time-outline' },
              { key: 'compte', label: 'Paramètres', icon: 'settings-outline' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.drawerItem, activeTab === item.key && styles.drawerItemActive]}
                onPress={() => switchTab(item.key)}
              >
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={activeTab === item.key ? COLORS.primary : COLORS.textSecondary} 
                />
                <Text style={[
                  styles.drawerText, 
                  activeTab === item.key && { color: COLORS.primary, fontWeight: '700' }
                ]}>
                  {item.label}
                </Text>
                {activeTab === item.key && (
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      {/* OVERLAY */}
      {menuOpen && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu}>
          <Animated.View style={[styles.overlayBg, { opacity: fadeAnim }]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // HEADER STANDARD (hauteur normale, pas flottant)
  header: {
    height: 56, // Hauteur standard comme la plupart des apps
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  
  content: {
    flex: 1,
  },
  
  // BOTTOM NAVIGATION
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  tabBarBackground: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    height: 64,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  sideContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  
  // BOUTON CENTRAL
  centerButtonWrapper: {
    position: 'absolute',
    left: '50%',
    top: -25,
    marginLeft: -CENTER_BUTTON_SIZE / 2,
    zIndex: 30,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
  },

  // MENU AJOUT
  addMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
  },
  addMenu: {
    position: 'absolute',
    left: '50%',
    marginLeft: -90,
    width: 180,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  addMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // DRAWER
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.75,
    backgroundColor: COLORS.card,
    zIndex: 40,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  drawerLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  drawerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  drawerScroll: {
    padding: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: `${COLORS.primary}10`,
  },
  drawerText: {
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  
  // OVERLAY
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 35,
  },
  overlayBg: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
});