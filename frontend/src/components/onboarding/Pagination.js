import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../../screens/constant/colors';

const Pagination = ({ data, currentIndex }) => {
  return (
    <View style={styles.container}>
      {data.map((_, index) => {
        const isActive = index === currentIndex;
        
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive && styles.activeDot
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray300,
    marginHorizontal: 4,
    transition: 'all 0.3s',
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary,
  },
});

export default Pagination;