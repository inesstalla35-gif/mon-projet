import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
} from "react-native";
import { LineChart, PieChart, BarChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Palette de couleurs : Vert, Blanc, Noir
const COLORS = {
  primary: "#10B981", // Vert émeraude
  primaryDark: "#059669", // Vert foncé
  primaryLight: "#D1FAE5", // Vert clair
  black: "#111827", // Noir doux
  white: "#FFFFFF",
  gray: "#6B7280",
  lightGray: "#F3F4F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const BudgetAnalysisScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month"); // 'week' | 'month'
  const [animatedValue] = useState(new Animated.Value(0));

  // Données simulées (à remplacer par vos vraies données)
  const [financialData, setFinancialData] = useState({
    score: 78,
    totalIncome: 3500,
    totalExpenses: 2800,
    savingsCapacity: 700,
    categories: [
      { name: "Logement", amount: 1200, color: "#10B981", icon: "home" },
      { name: "Alimentation", amount: 600, color: "#059669", icon: "food" },
      { name: "Transport", amount: 400, color: "#34D399", icon: "car" },
      {
        name: "Loisirs",
        amount: 350,
        color: "#6EE7B7",
        icon: "gamepad-variant",
      },
      { name: "Santé", amount: 150, color: "#A7F3D0", icon: "medical-bag" },
      {
        name: "Autres",
        amount: 100,
        color: "#D1FAE5",
        icon: "dots-horizontal",
      },
    ],
    weeklyHistory: [650, 720, 580, 800, 620, 700, 750],
    predictions: {
      weeklySavings: 175,
      monthlySavings: 700,
      goalMonths: 4,
      goalAmount: 15000,
      currentSavings: 8500,
    },
  });

  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: "success",
      icon: "trending-up",
      message:
        "Si tu continues ainsi, tu atteindras ton objectif maison dans 4 mois.",
      action: "Voir les détails",
    },
    {
      id: 2,
      type: "warning",
      icon: "alert-circle",
      message:
        "Tes dépenses loisirs sont trop élevées, essaie de réduire de 10% cette semaine.",
      action: "Ajuster le budget",
    },
    {
      id: 3,
      type: "info",
      icon: "lightbulb",
      message:
        "Tu pourrais économiser 50€/mois en réduisant tes abonnements streaming.",
      action: "Optimiser",
    },
  ]);

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simuler le rafraîchissement des données
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Calcul du pourcentage de dépenses par catégorie
  const getCategoryPercentage = (amount) => {
    return ((amount / financialData.totalExpenses) * 100).toFixed(1);
  };

  // Configuration des graphiques
  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(17, 24, 39, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
  };

  const pieData = financialData.categories.map((cat) => ({
    name: cat.name,
    population: cat.amount,
    color: cat.color,
    legendFontColor: COLORS.black,
    legendFontSize: 12,
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bon";
    if (score >= 40) return "Moyen";
    return "À améliorer";
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analyse Financière</Text>
        <Text style={styles.headerSubtitle}>
          Comprends et optimise tes finances
        </Text>
      </View>

      {/* Sélecteur de période */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "week" && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod("week")}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === "week" && styles.periodButtonTextActive,
            ]}
          >
            Cette semaine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "month" && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod("month")}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === "month" && styles.periodButtonTextActive,
            ]}
          >
            Ce mois
          </Text>
        </TouchableOpacity>
      </View>

      {/* Score de discipline financière */}
      <Animated.View
        style={[styles.scoreCard, { transform: [{ scale: animatedValue }] }]}
      >
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTitle}>Score de Discipline</Text>
          <Icon name="shield-check" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.scoreContent}>
          <Progress.Circle
            size={160}
            progress={financialData.score / 100}
            thickness={12}
            color={getScoreColor(financialData.score)}
            unfilledColor={COLORS.lightGray}
            borderWidth={0}
            showsText={true}
            formatText={() => `${financialData.score}%`}
            textStyle={{ fontSize: 18, fontWeight: "bold" }}
          />

          <View style={styles.scoreDetails}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>
                {financialData.totalIncome}€
              </Text>
              <Text style={styles.scoreLabel}>Revenus</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>
                {financialData.totalExpenses}€
              </Text>
              <Text style={styles.scoreLabel}>Dépenses</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreValue, { color: COLORS.primary }]}>
                {financialData.savingsCapacity}€
              </Text>
              <Text style={styles.scoreLabel}>Épargne</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Prédictions et Objectifs */}
      <View style={styles.predictionCard}>
        <View style={styles.predictionHeader}>
          <Icon name="crystal-ball" size={24} color={COLORS.primary} />
          <Text style={styles.predictionTitle}>Prédictions</Text>
        </View>

        <View style={styles.predictionGrid}>
          <View style={styles.predictionItem}>
            <Icon name="calendar-week" size={28} color={COLORS.primary} />
            <Text style={styles.predictionValue}>
              {financialData.predictions.weeklySavings}€
            </Text>
            <Text style={styles.predictionLabel}>par semaine</Text>
          </View>
          <View style={styles.predictionItem}>
            <Icon name="calendar-month" size={28} color={COLORS.primary} />
            <Text style={styles.predictionValue}>
              {financialData.predictions.monthlySavings}€
            </Text>
            <Text style={styles.predictionLabel}>par mois</Text>
          </View>
          <View style={styles.predictionItem}>
            <Icon name="flag-checkered" size={28} color={COLORS.primary} />
            <Text style={styles.predictionValue}>
              {financialData.predictions.goalMonths} mois
            </Text>
            <Text style={styles.predictionLabel}>objectif maison</Text>
          </View>
        </View>

        {/* Barre de progression objectif */}
        <View style={styles.goalProgress}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalText}>Progression objectif maison</Text>
            <Text style={styles.goalAmount}>
              {financialData.predictions.currentSavings}€ /{" "}
              {financialData.predictions.goalAmount}€
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(financialData.predictions.currentSavings / financialData.predictions.goalAmount) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {(
              (financialData.predictions.currentSavings /
                financialData.predictions.goalAmount) *
              100
            ).toFixed(1)}
            % atteint
          </Text>
        </View>
      </View>

      {/* Graphique des dépenses par catégorie */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Répartition des dépenses</Text>
        <PieChart
          data={pieData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      {/* Graphique d'évolution */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Évolution des dépenses (7 derniers jours)
        </Text>
        <LineChart
          data={{
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
            datasets: [
              {
                data: financialData.weeklyHistory,
              },
            ],
          }}
          width={width - 40}
          height={220}
          chartConfig={{
            ...chartConfig,
            fillShadowGradient: COLORS.primaryLight,
            fillShadowGradientOpacity: 0.3,
          }}
          bezier
          style={styles.lineChart}
        />
      </View>

      {/* Liste des catégories détaillées */}
      <View style={styles.categoriesCard}>
        <Text style={styles.chartTitle}>Détails par catégorie</Text>
        {financialData.categories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color + "20" },
              ]}
            >
              <Icon name={category.icon} size={20} color={category.color} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryFill,
                    {
                      width: `${getCategoryPercentage(category.amount)}%`,
                      backgroundColor: category.color,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.categoryAmount}>
              <Text style={styles.categoryValue}>{category.amount}€</Text>
              <Text style={styles.categoryPercent}>
                {getCategoryPercentage(category.amount)}%
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recommandations */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.recommendationsTitle}>
          Recommandations personnalisées
        </Text>
        {recommendations.map((rec) => (
          <TouchableOpacity
            key={rec.id}
            style={[
              styles.recommendationCard,
              rec.type === "success" && styles.recommendationSuccess,
              rec.type === "warning" && styles.recommendationWarning,
              rec.type === "info" && styles.recommendationInfo,
            ]}
          >
            <View style={styles.recommendationIcon}>
              <Icon
                name={rec.icon}
                size={24}
                color={
                  rec.type === "success"
                    ? COLORS.success
                    : rec.type === "warning"
                      ? COLORS.warning
                      : COLORS.primary
                }
              />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationText}>{rec.message}</Text>
              <TouchableOpacity style={styles.recommendationAction}>
                <Text
                  style={[
                    styles.recommendationActionText,
                    rec.type === "success" && { color: COLORS.success },
                    rec.type === "warning" && { color: COLORS.warning },
                    rec.type === "info" && { color: COLORS.primary },
                  ]}
                >
                  {rec.action} →
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton d'action */}
      <TouchableOpacity style={styles.actionButton}>
        <Icon name="file-export" size={20} color={COLORS.white} />
        <Text style={styles.actionButtonText}>Exporter mon analyse</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.black,
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  periodSelector: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  scoreContent: {
    alignItems: "center",
  },
  scoreDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  scoreDivider: {
    width: 1,
    backgroundColor: COLORS.lightGray,
  },
  predictionCard: {
    backgroundColor: COLORS.black,
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    marginLeft: 10,
  },
  predictionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  predictionItem: {
    alignItems: "center",
    flex: 1,
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.white,
    marginTop: 8,
  },
  predictionLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  goalProgress: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
  },
  goalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  goalText: {
    color: COLORS.white,
    fontSize: 14,
  },
  goalAmount: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 8,
    textAlign: "right",
  },
  chartCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  lineChart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  categoriesCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    marginTop: 0,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 6,
  },
  categoryBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryAmount: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
  },
  categoryPercent: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  recommendationsSection: {
    margin: 20,
    marginTop: 0,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  recommendationSuccess: {
    borderLeftColor: COLORS.success,
  },
  recommendationWarning: {
    borderLeftColor: COLORS.warning,
  },
  recommendationInfo: {
    borderLeftColor: COLORS.primary,
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationAction: {
    alignSelf: "flex-start",
  },
  recommendationActionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    margin: 20,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default BudgetAnalysisScreen;
