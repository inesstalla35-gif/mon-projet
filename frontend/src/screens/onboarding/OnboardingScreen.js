import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  Dimensions 
} from 'react-native';
import { Colors } from '../../screens/constant/colors';
import Pagination from '../../components/onboarding/Pagination';

import WelcomeScreen from './WelcomeScreen';
import FeaturesScreen from './FeaturesScreen';
import HowItWorksScreen from './HowItWorksScreen';
import ReadyScreen from './ReadyScreen';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const screens = [
    { id: 'welcome', component: WelcomeScreen },
    { id: 'features', component: FeaturesScreen },
    { id: 'howitworks', component: HowItWorksScreen },
    { id: 'ready', component: ReadyScreen },
  ];

  const scrollToIndex = (index) => {
    if (index >= 0 && index < screens.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < screens.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    // Navigation vers l'écran d'inscription/connexion
    navigation.replace('Auth');
  };

  const renderItem = ({ item, index }) => {
    const Component = item.component;
    
    const props = {
      onNext: index === screens.length - 1 ? handleFinish : handleNext,
      onBack: handleBack,
      onFinish: handleFinish,
    };

    return (
      <View style={styles.screenContainer}>
        <Component {...props} />
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} // Désactive le scroll manuel, navigation par boutons
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      
      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        <Pagination data={screens} currentIndex={currentIndex} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  screenContainer: {
    width: width,
    flex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
});

export default OnboardingScreen;