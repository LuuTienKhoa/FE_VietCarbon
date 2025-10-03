import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CarbonActivity } from '@/types/carbon';
import { CarbonCalculator } from '@/utils/carbon-calculator';
import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

interface ActivityItemProps {
  activity: CarbonActivity;
  tintColor: string;
}

export const ActivityItem = memo<ActivityItemProps>(({ activity, tintColor }) => {
  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      transport: 'car.fill',
      energy: 'bolt.fill',
      food: 'restaurant.fill',
      plastic: 'recycle.fill',
      water: 'water.fill',
    };
    return icons[type] || 'circle.fill';
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      transport: '#2196F3',
      energy: '#FF9800',
      food: '#4CAF50',
      plastic: '#9C27B0',
      water: '#00BCD4',
    };
    return colors[type] || '#666';
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.iconContainer, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
        <IconSymbol 
          name={getActivityIcon(activity.type)} 
          size={20} 
          color={getActivityColor(activity.type)} 
        />
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>
          {activity.description || 'Hoạt động'}
        </ThemedText>
        <ThemedText style={styles.details}>
          {activity.value} {activity.unit}
        </ThemedText>
        <ThemedText style={styles.time}>
          {activity.date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.co2Container}>
        <ThemedText style={[styles.co2Value, { color: tintColor }]}>
          {CarbonCalculator.formatCO2(activity.co2Emission)}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
});

ActivityItem.displayName = 'ActivityItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  details: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    opacity: 0.5,
  },
  co2Container: {
    alignItems: 'flex-end',
  },
  co2Value: {
    fontSize: 16,
    fontWeight: '600',
  },
});
