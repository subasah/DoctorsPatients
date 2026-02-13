// ============================================================
// Recording Wave - Animated waveform visualization for recording
// ============================================================

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../theme';

interface RecordingWaveProps {
  isRecording: boolean;
  isPaused: boolean;
  barCount?: number;
  color?: string;
  height?: number;
}

export default function RecordingWave({
  isRecording,
  isPaused,
  barCount = 40,
  color = Colors.recordingRed,
  height = 100,
}: RecordingWaveProps) {
  const animValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.15))
  ).current;

  useEffect(() => {
    if (isRecording && !isPaused) {
      startAnimation();
    } else if (isPaused) {
      pauseAnimation();
    } else {
      resetAnimation();
    }
  }, [isRecording, isPaused]);

  const startAnimation = () => {
    const animations = animValues.map((anim, i) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.2 + Math.random() * 0.8,
            duration: 300 + Math.random() * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.1 + Math.random() * 0.3,
            duration: 300 + Math.random() * 400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
  };

  const pauseAnimation = () => {
    animValues.forEach((anim) => {
      Animated.timing(anim, {
        toValue: 0.15,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const resetAnimation = () => {
    animValues.forEach((anim) => {
      anim.setValue(0.15);
    });
  };

  return (
    <View style={[styles.container, { height }]}>
      {animValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, height],
              }),
              opacity: isRecording ? 0.8 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 16,
  },
  bar: {
    flex: 1,
    minWidth: 3,
    maxWidth: 6,
    borderRadius: 3,
  },
});
