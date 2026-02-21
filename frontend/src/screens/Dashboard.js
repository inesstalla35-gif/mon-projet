import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LineChart, PieChart, ProgressChart, BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/* ================== COULEURS WISEPOCKET ================== */
const COLORS = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  accent: '#14919B',
  dark: '#212121',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  success: '#0D7377',
  warning: '#F39C12',
  danger: '#E74C3C',
  income: '#0D7377',
  expense: '#E74C3C',
  chart: ['#0D7377', '#14FFEC', '#14919B', '#212121', '#F39C12', '#E74C3C'],
};

/* ================== DONNÉES MOCK (à remplacer par API) ================== */
const MOCK_DATA = {
  totalBalance: 1250000,
  totalIncome: 850000,
  totalExpense: 425000,
  savingsRate: 50,
  
  monthlyData: {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    income: [650000, 720000, 680000, 850000, 800000, 850000],
    expense: [450000, 520000, 480000, 380000, 420000, 425000],
  },
  
  expenseCategories: [
    { name: 'Alimentation', amount: 125000, color: '#0D7377', icon: 'restaurant' },
    { name: 'Transport', amount: 85000, color: '#14FFEC', icon: 'car' },
    { name: 'Logement', amount: 150000, color: '#14919B', icon: 'home' },
    { name: 'Loisirs', amount: 45000, color: '#F39C12', icon: 'game-controller' },
    { name: 'Autres', amount: 20000, color: '#212121', icon: 'ellipsis-horizontal' },
  ],
  
  goals: [
    { id: 1, title: 'Voyage Paris', target: 500000, current: 325000, deadline: '2024-12-01', icon: 'airplane' },
    { id: 2, title: 'Nouveau PC', target: 300000, current: 180000, deadline: '2024-08-15', icon: 'laptop' },
    { id: 3, title: 'Fonds urgence', target: 1000000, current: 250000, deadline: '2025-06-01', icon: 'shield' },
  ],
  
  recentTransactions: [
    { id: 1, title: 'Salaire Octobre', amount: 850000, type: 'income', date: '2024-10-01', category: 'salaire' },
    { id: 2, title: 'Courses supermarché', amount: -45000, type: 'expense', date: '2024-10-02', category: 'alimentation' },
    { id: 3, title: 'Essence voiture', amount: -25000, type: 'expense', date: '2024-10-03', category: 'transport' },
    { id: 4, title: 'Freelance client', amount: 150000, type: 'income', date: '2024-10-05', category: 'freelance' },
  ],
};

const Dashboardscreen = ({ navigation }) => {
  const [activePeriod, setActivePeriod] = useState('mois');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Calculs statistiques
  const getSavingsProgress = () => {
    const totalGoals = MOCK_DATA.goals.reduce((acc, g) => acc + g.target, 0);
    const totalSaved = MOCK_DATA.goals.reduce((acc, g) => acc + g.current, 0);
    return totalGoals > 0 ? totalSaved / totalGoals : 0;
  };

  const getMotivationalMessage = () => {
    const savingsRate = MOCK_DATA.savingsRate;
    if (savingsRate >= 50) return {
      icon: 'trophy',
      color: COLORS.success,
      title: 'Excellent travail !',
      message: `Tu as économisé ${savingsRate}% de tes revenus ce mois. Continue ainsi !`
    };
    if (savingsRate >= 30) return {
      icon: 'trending-up',
      color: COLORS.warning,
      title: 'Bonne progression',
      message: `Tu as épargné ${savingsRate}% de tes revenus. Objectif : atteindre 50% !`
    };
    return {
      icon: 'alert-circle',
      color: COLORS.danger,
      title: 'Attention',
      message: 'Tes dépenses dépassent tes habitudes. Essaie de réduire les loisirs ce mois.'
    };
  };

  const message = getMotivationalMessage();

  // Données pour graphiques
  const pieData = MOCK_DATA.expenseCategories.map(cat => ({
    name: cat.name,
    population: cat.amount,
    color: cat.color,
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(13, 115, 119, ${opacity})`,
    labelColor: () => COLORS.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: COLORS.primary },
  };

  const expenseChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
  };

  const renderQuickAction = (icon, label, color, onPress) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.quickActionIcon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={24} color="#FFF" />
      </LinearGradient>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ====== HEADER DÉGRADÉ ====== */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Bonjour, Ines 👋</Text>
              <Text style={styles.date}>Mardi 5 Novembre 2024</Text>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Solde principal */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Solde total</Text>
            <Text style={styles.balanceAmount}>
              {MOCK_DATA.totalBalance.toLocaleString('fr-FR')} FCFA
            </Text>
            
            {/* Période switcher */}
            <View style={styles.periodSwitcher}>
              {['semaine', 'mois', 'année'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, activePeriod === p && styles.periodBtnActive]}
                  onPress={() => setActivePeriod(p)}
                >
                  <Text style={[styles.periodText, activePeriod === p && styles.periodTextActive]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* ====== RÉSUMÉ REVENUS/DÉPENSES ====== */}
        <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.income + '15' }]}>
            <View style={styles.summaryIcon}>
              <Ionicons name="arrow-down" size={20} color={COLORS.income} />
            </View>
            <Text style={styles.summaryLabel}>Revenus</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
              +{MOCK_DATA.totalIncome.toLocaleString('fr-FR')}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: COLORS.expense + '15' }]}>
            <View style={[styles.summaryIcon, { backgroundColor: COLORS.expense + '20' }]}>
              <Ionicons name="arrow-up" size={20} color={COLORS.expense} />
            </View>
            <Text style={styles.summaryLabel}>Dépenses</Text>
            <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
              -{MOCK_DATA.totalExpense.toLocaleString('fr-FR')}
            </Text>
          </View>
        </Animated.View>

        {/* ====== MESSAGE MOTIVATIONNEL ====== */}
        <Animated.View style={[styles.messageCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={[message.color + '20', message.color + '05']}
            style={styles.messageGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={[styles.messageIcon, { backgroundColor: message.color }]}>
              <Ionicons name={message.icon} size={24} color="#FFF" />
            </View>
            <View style={styles.messageContent}>
              <Text style={[styles.messageTitle, { color: message.color }]}>{message.title}</Text>
              <Text style={styles.messageText}>{message.message}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ====== ACTIONS RAPIDES ====== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            {renderQuickAction('add-circle', 'Revenu', COLORS.income, () => navigation.navigate('Transaction', { type: 'revenu' }))}
            {renderQuickAction('remove-circle', 'Dépense', COLORS.expense, () => navigation.navigate('Transaction', { type: 'depense' }))}
            {renderQuickAction('flag', 'Objectif', COLORS.primary, () => navigation.navigate('Objectifs'))}
            {renderQuickAction('stats-chart', 'Analyse', COLORS.accent, () => navigation.navigate('Analyse'))}
          </View>
        </View>

        {/* ====== GRAPHIQUE ÉVOLUTION ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Évolution financière</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartCard}>
            <LineChart
              data={{
                labels: MOCK_DATA.monthlyData.labels,
                datasets: [
                  {
                    data: MOCK_DATA.monthlyData.income,
                    color: (opacity = 1) => `rgba(13, 115, 119, ${opacity})`,
                    strokeWidth: 3,
                  },
                  {
                    data: MOCK_DATA.monthlyData.expense,
                    color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                    strokeWidth: 3,
                  },
                ],
                legend: ['Revenus', 'Dépenses'],
              }}
              width={width - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withVerticalLines={false}
              withHorizontalLines={true}
              withDots={true}
              withShadow={false}
            />
          </View>
        </View>

        {/* ====== RÉPARTITION DÉPENSES ====== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition des dépenses</Text>
          
          <View style={styles.chartCard}>
            <PieChart
              data={pieData}
              width={width - 60}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            
            {/* Légende détaillée */}
            <View style={styles.expenseLegend}>
              {MOCK_DATA.expenseCategories.map((cat, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                  <Ionicons name={cat.icon} size={16} color={cat.color} />
                  <Text style={styles.legendLabel}>{cat.name}</Text>
                  <Text style={styles.legendAmount}>{cat.amount.toLocaleString('fr-FR')} FCFA</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ====== MES OBJECTIFS ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes objectifs d'épargne</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Objectifs')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {MOCK_DATA.goals.map((goal) => {
            const progress = goal.current / goal.target;
            const percentage = Math.round(progress * 100);
            const isCompleted = percentage >= 100;
            
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIcon, { backgroundColor: isCompleted ? COLORS.success + '20' : COLORS.primary + '20' }]}>
                    <Ionicons 
                      name={goal.icon} 
                      size={20} 
                      color={isCompleted ? COLORS.success : COLORS.primary} 
                    />
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalAmount}>
                      {goal.current.toLocaleString('fr-FR')} / {goal.target.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </View>
                  <View style={[styles.goalBadge, { backgroundColor: isCompleted ? COLORS.success : COLORS.primary }]}>
                    <Text style={styles.goalBadgeText}>{percentage}%</Text>
                  </View>
                </View>
                
                {/* Barre de progression */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <LinearGradient
                      colors={isCompleted ? [COLORS.success, '#27AE60'] : [COLORS.primary, COLORS.secondary]}
                      style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
                
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.completedText}>Objectif atteint ! 🎉</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ====== TRANSACTIONS RÉCENTES ====== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Historique</Text>
            </TouchableOpacity>
          </View>

          {MOCK_DATA.recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon, 
                { backgroundColor: tx.type === 'income' ? COLORS.income + '15' : COLORS.expense + '15' }
              ]}>
                <Ionicons 
                  name={tx.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                  size={18} 
                  color={tx.type === 'income' ? COLORS.income : COLORS.expense} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{tx.title}</Text>
                <Text style={styles.transactionDate}>{tx.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: tx.type === 'income' ? COLORS.income : COLORS.expense }
              ]}>
                {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} FCFA
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // HEADER
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  date: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.expense,
  },
  
  // SOLDE
  balanceContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  
  // PERIOD SWITCHER
  periodSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 4,
  },
  periodBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodBtnActive: {
    backgroundColor: '#FFF',
  },
  periodText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  periodTextActive: {
    color: COLORS.primary,
  },

  // RÉSUMÉ
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -50,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.income + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // MESSAGE MOTIVATIONNEL
  messageCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  messageIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // SECTIONS
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ACTIONS RAPIDES
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // GRAPHES
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
    marginLeft: -10,
  },

  // LÉGENDE DÉPENSES
  expenseLegend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // OBJECTIFS
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  goalAmount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  goalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  goalBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBackground: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completedText: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 6,
  },

  // TRANSACTIONS
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Dashboardscreen;