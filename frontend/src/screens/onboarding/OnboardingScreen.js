import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import WelcomeScreen from './WelcomeScreen';
import FeaturesScreen from './FeaturesScreen';
import HowItWorksScreen from './HowItWorksScreen';
import ReadyScreen from './ReadyScreen';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const dotAnims = [0, 1, 2, 3].map(() => useRef(new Animated.Value(0)).current);

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
      // Anime le dot actif
      dotAnims.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: i === index ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      });
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

  const renderItem = ({ item, index }) => {
    const Component = item.component;
    const isLast = index === screens.length - 1;

    const props = {
      onNext: isLast ? undefined : handleNext,
      onBack: index > 0 ? handleBack : undefined,
    };

    // Le dernier écran (ReadyScreen) a besoin de navigation
    if (isLast) {
      props.navigation = navigation;
      props.onBack = handleBack;
    }

    return (
      <View style={styles.screenContainer}>
        <Component {...props} />
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
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
        scrollEnabled={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* Pagination dots custom */}
      <View style={styles.dotsContainer}>
        {screens.map((_, i) => {
          const dotWidth = dotAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [8, 24],
          });
          const dotOpacity = dotAnims[i].interpolate({
            inputRange: [0, 1],
            outputRange: [0.35, 1],
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === currentIndex ? 24 : 8,
                  opacity: i === currentIndex ? 1 : 0.35,
                  backgroundColor: i === currentIndex ? '#0D7377' : '#0D7377',
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFE' },
  screenContainer: { width, flex: 1 },
  dotsContainer: {
    position: 'absolute',
    bottom: 108,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D7377',
  },
});

export default OnboardingScreen;