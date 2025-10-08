import { Loading } from '@/components/loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useActivityStore } from '@/stores/activityStore';
import { CarbonCalculator } from '@/utils/carbon-calculator';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  const { activities, isLoading, loadActivities } = useActivityStore();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const router = useRouter();

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Compute today's activities and metrics
  const todayActivities = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return activities.filter((a) => a.date >= start && a.date <= end);
  }, [activities]);

  const totalCO2 = CarbonCalculator.calculateTotalEmission(todayActivities);
  const dailyAverage = totalCO2; // Already a daily slice
  const percentageOfAverage = CarbonCalculator.calculatePercentageOfAverage(dailyAverage);
  const impactLevel = CarbonCalculator.getImpactLevel(dailyAverage);

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  const getImpactText = (level: string) => {
    switch (level) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      default: return 'Không xác định';
    }
  };

  const quickActions: {
    title: string;
    subtitle: string;
    icon: IconSymbolName;
    color: string;
    route: string;
    accessibilityLabel: string;
  }[] = [
    {
      title: 'Thêm hoạt động',
      subtitle: 'Ghi lại hoạt động mới',
      icon: 'plus.circle.fill',
      color: '#4CAF50',
      route: '/(tabs)/track',
      accessibilityLabel: 'Thêm hoạt động mới',
    },
    {
      title: 'Xem gợi ý',
      subtitle: 'Cách giảm phát thải',
      icon: 'lightbulb.fill',
      color: '#FF9800',
      route: '/(tabs)/suggestions',
      accessibilityLabel: 'Xem gợi ý giảm phát thải',
    },
    {
      title: 'Thử thách',
      subtitle: 'Tham gia thử thách',
      icon: 'trophy.fill',
      color: '#9C27B0',
      route: '/(tabs)/challenges',
      accessibilityLabel: 'Xem thử thách',
    },
    {
      title: 'Thống kê',
      subtitle: 'Xem biểu đồ chi tiết',
      icon: 'chart.bar.fill',
      color: '#2196F3',
      route: '/(tabs)/index',
      accessibilityLabel: 'Xem thống kê',
    },
  ];

  if (isLoading && activities.length === 0) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.greeting}>
          <ThemedText type="title">Xin chào!</ThemedText>
          <ThemedText style={styles.subtitle}>
            Hôm nay bạn đã thải ra bao nhiêu CO₂?
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Main CO2 Card */}
      <ThemedView style={styles.mainCard}>
        <ThemedView style={styles.co2Display}>
          <ThemedText type="title" style={[styles.co2Value, { color: tintColor }]}>
            {CarbonCalculator.formatCO2(totalCO2)}
          </ThemedText>
          <ThemedText style={styles.co2Label}>Tổng CO₂ hôm nay</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.comparison}>
          <ThemedView style={styles.comparisonItem}>
            <ThemedText style={styles.comparisonLabel}>So với trung bình VN</ThemedText>
            <ThemedText style={[styles.comparisonValue, { color: tintColor }]}>
              {percentageOfAverage.toFixed(0)}%
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.comparisonItem}>
            <ThemedText style={styles.comparisonLabel}>Mức tác động</ThemedText>
            <ThemedText style={[styles.comparisonValue, { color: getImpactColor(impactLevel) }]}>
              {getImpactText(impactLevel)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Hành động nhanh
        </ThemedText>
        <ThemedView style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickAction}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              onPress={() => router.push(action.route as any)}
            >
              <ThemedView style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <IconSymbol name={action.icon} size={24} color="white" />
              </ThemedView>
              <ThemedText style={styles.quickActionTitle}>{action.title}</ThemedText>
              <ThemedText style={styles.quickActionSubtitle}>{action.subtitle}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Today's Activities */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Hoạt động hôm nay
        </ThemedText>
        {activities.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="leaf.fill" size={48} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              Chưa có hoạt động nào được ghi lại
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Bắt đầu theo dõi dấu chân carbon của bạn
            </ThemedText>
          </ThemedView>
        ) : (
          activities.map((activity) => (
            <ThemedView key={activity.id} style={styles.activityItem}>
              <ThemedView style={styles.activityIcon}>
                <IconSymbol name="car.fill" size={20} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.activityInfo}>
                <ThemedText style={styles.activityTitle}>
                  {activity.description || 'Hoạt động'}
                </ThemedText>
                <ThemedText style={styles.activityDetails}>
                  {activity.value} {activity.unit}
                </ThemedText>
              </ThemedView>
              <ThemedText style={[styles.activityCO2, { color: tintColor }]}>
                {CarbonCalculator.formatCO2(activity.co2Emission)}
              </ThemedText>
            </ThemedView>
          ))
       ) }
      </ThemedView>

      {/* Tips */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Mẹo giảm CO₂
        </ThemedText>
        <ThemedView style={styles.tipCard}>
          <IconSymbol name="lightbulb.fill" size={24} color="#FF9800" />
          <ThemedView style={styles.tipContent}>
            <ThemedText style={styles.tipTitle}>
              Đi xe đạp thay vì xe máy
            </ThemedText>
            <ThemedText style={styles.tipDescription}>
              Đi xe đạp cho quãng đường dưới 5km có thể giảm 0.36kg CO₂ mỗi lần
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  mainCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  co2Display: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  co2Value: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  co2Label: {
    fontSize: 16,
    opacity: 0.7,
  },
  comparison: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 14,
    opacity: 0.6,
  },
  activityCO2: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
