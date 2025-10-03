import { CarbonActivityForm } from '@/components/carbon-activity-form';
import { useFlashMessage } from '@/components/flash-message-provider';
import { Loading } from '@/components/loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useActivityStore } from '@/stores/activityStore';
import { ActivityType, CarbonActivity } from '@/types/carbon';
import { CarbonCalculator } from '@/utils/carbon-calculator';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';


export default function TrackScreen() {
  const [showForm, setShowForm] = useState(false);
  const { 
    activities, 
    isLoading, 
    error, 
    addActivity, 
    loadActivities, 
    saveActivities,
    setError 
  } = useActivityStore();
  const { showMessage } = useFlashMessage();

  // Custom colors for the new design
  const backgroundColor = '#e6fcd9'; // light green
  const cardColor = '#f8f9fa';
  const accentGreen = '#b6ff4a';
  const accentOrange = '#ffb84a';
  const accentRed = '#ff4a4a';
  const accentDark = '#222';

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleAddActivity = async (activity: CarbonActivity) => {
    try {
      addActivity(activity);
      await saveActivities();
      setShowForm(false);
      showMessage({
        type: 'success',
        message: 'Đã thêm hoạt động mới!',
      });
    } catch (error) {
      showMessage({
        type: 'error',
        message: 'Có lỗi xảy ra khi lưu hoạt động',
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleError = (error: string) => {
    setError(error);
    showMessage({
      type: 'error',
      message: error,
    });
  };

  const onRefresh = async () => {
    await loadActivities();
  };

  if (isLoading && activities.length === 0) {
    return <Loading message="Đang tải hoạt động..." />;
  }

  const totalCO2 = CarbonCalculator.calculateTotalEmission(activities);
  const byType = CarbonCalculator.calculateByType(activities);

  const activityTypes: { type: ActivityType; label: string; icon: string }[] = [
    { type: 'transport', label: 'Giao thông', icon: 'car.fill' },
    { type: 'energy', label: 'Năng lượng', icon: 'bolt.fill' },
    { type: 'food', label: 'Ăn uống', icon: 'restaurant.fill' },
    { type: 'plastic', label: 'Nhựa', icon: 'recycle.fill' },
    { type: 'water', label: 'Nước', icon: 'water.fill' },
  ];

  if (showForm) {
    return (
      <CarbonActivityForm
        onSubmit={handleAddActivity}
        onCancel={handleCancelForm}
        onError={handleError}
      />
    );
  }

  // Gauge color logic
  let gaugeColor = accentGreen;
  if (totalCO2 > 6) gaugeColor = accentRed;
  else if (totalCO2 > 3) gaugeColor = accentOrange;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Greeting and menu */}
      <ThemedView style={styles.greetingRow}>
        <ThemedText style={styles.greetingText}>
          Hello, Tuan Anh !
        </ThemedText>
        <IconSymbol name="line.3.horizontal" size={28} color={accentDark} />
      </ThemedView>
      <ThemedText style={styles.greetingSubtext}>
        {activities.length === 0 ? 'No data entered for today.' : 'Great job tracking your activities!'}
      </ThemedText>

      {/* Gauge Card */}
      <ThemedView style={styles.gaugeCard}>
        <ThemedText style={styles.gaugeTitle}>Today's CO₂ Emissions</ThemedText>
        <ThemedText style={styles.gaugeSubtitle}>Every little counts.</ThemedText>
        <ThemedView style={styles.gaugeWrapper}>
          {/* Simple gauge arc using a colored View as placeholder */}
          <ThemedView style={[styles.gaugeArc, { backgroundColor: gaugeColor }]} />
          <ThemedText style={styles.gaugeValueText}>
            {CarbonCalculator.formatCO2(totalCO2)}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.gaugeDesc}>
          {totalCO2} kg of CO₂ has been emitted based on your activities today.
        </ThemedText>
      </ThemedView>


      {/* Measurement Buttons with icons */}
      <ThemedView style={styles.measurementSection}>
        <ThemedText style={styles.measurementTitle}>Measurement</ThemedText>
        <ThemedView style={styles.measurementList}>
          {activityTypes.map(({ type, label, icon }) => (
            <TouchableOpacity
              key={type}
              style={styles.measurementButton}
              onPress={() => setShowForm(true)}
            >
              <IconSymbol name={icon as any} size={20} color={accentGreen} style={{ marginRight: 6 }} />
              <ThemedText style={styles.measurementButtonText}>{label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>


      {/* Recent Activities - full list with icons */}
      <ThemedView style={styles.activitiesSection}>
        <ThemedText style={styles.activitiesTitle}>Recent Activities</ThemedText>
        {activities.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="leaf.fill" size={48} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              No activities recorded yet
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tap "Measurement" to add your first activity
            </ThemedText>
          </ThemedView>
        ) : (
          activities.map((activity) => {
            const typeInfo = activityTypes.find(t => t.type === activity.type);
            return (
              <ThemedView key={activity.id} style={styles.activityItem}>
                <ThemedView style={styles.activityIconWrap}>
                  <IconSymbol name={(typeInfo?.icon || 'leaf.fill') as any} size={22} color={accentGreen} />
                </ThemedView>
                <ThemedView style={styles.activityContent}>
                  <ThemedText style={styles.activityType}>{typeInfo?.label || activity.type}</ThemedText>
                  <ThemedText style={styles.activityDetails}>
                    {activity.value} {activity.unit}
                    {activity.description && ` • ${activity.description}`}
                  </ThemedText>
                  <ThemedText style={styles.activityTime}>
                    {activity.date.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={[styles.activityCO2, { color: accentGreen }]}> 
                  {CarbonCalculator.formatCO2(activity.co2Emission)}
                </ThemedText>
              </ThemedView>
            );
          })
        )}
      </ThemedView>

      {/* Summary Cards with gradient */}
      <ThemedView style={styles.summaryRow}>
        <ThemedView style={[styles.summaryCard, styles.gradientOrange]}>
          <ThemedText style={styles.summaryLabel}>CO₂ Emitted (total)</ThemedText>
          <ThemedText style={styles.summaryValue}>{CarbonCalculator.formatCO2(totalCO2)}</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.summaryCard, styles.gradientGreen]}>
          <ThemedText style={styles.summaryLabel}>Vehicle Type</ThemedText>
          <ThemedText style={styles.summaryValue}>Bicycle</ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 0,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#888',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  gaugeCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gaugeTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  gaugeSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  gaugeWrapper: {
    width: 120,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  gaugeArc: {
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    backgroundColor: '#b6ff4a',
    marginBottom: -24,
  },
  gaugeValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 8,
  },
  gaugeDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  measurementSection: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  measurementTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    color: '#222',
  },
  measurementList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  measurementButton: {
    backgroundColor: '#e6fcd9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
    marginRight: 8,
    marginTop: 4,
    minWidth: 120,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#b6ff4a',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  measurementButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  activitiesSection: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  activitiesTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6fcd9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  activityCO2: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    marginTop: 4,
    opacity: 0.6,
    textAlign: 'center',
  },
  activityDetails: {
    opacity: 0.7,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.5,
  },
  gradientOrange: {
    backgroundColor: 'linear-gradient(90deg, #ffb84a 0%, #ffe7b3 100%)',
  },
  gradientGreen: {
    backgroundColor: 'linear-gradient(90deg, #b6ff4a 0%, #e6fcd9 100%)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
