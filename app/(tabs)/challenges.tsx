import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Challenge, ChallengeProgress, apiService } from '@/services/api';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progresses, setProgresses] = useState<Record<number, ChallengeProgress>>({});
  const [loading, setLoading] = useState(true);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    const fetchChallenges = async () => {
      setLoading(true);
      // Lấy danh sách challenge
      const res = await apiService.challenge.list();
      if (res.success && res.data) {
        setChallenges(res.data);

        // Lấy progress cho user hiện tại (giả sử userId = 1)
        const progressRes = await apiService.challengeProgress.list({ userId: 1 });
        if (progressRes.success && progressRes.data) {
          const map: Record<number, ChallengeProgress> = {};
          progressRes.data.forEach(p => { map[p.challengeId] = p; });
          setProgresses(map);
        }
      }
      setLoading(false);
    };

    fetchChallenges();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={styles.loadingText}>Đang tải thử thách...</ThemedText>
      </ThemedView>
    );
  }

  const renderItem = ({ item }: { item: Challenge }) => {
    const progress = progresses[item.id]?.progress ?? 0;
    const isCompleted = item.isComplete || progress >= 100;
    
    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: cardBackground }]}>
        <View style={styles.cardHeader}>
          <View style={styles.challengeIcon}>
            <IconSymbol 
              name={isCompleted ? "checkmark.circle.fill" : "trophy.fill"} 
              size={24} 
              color={isCompleted ? "#4CAF50" : tintColor} 
            />
          </View>
          <View style={styles.challengeInfo}>
            <ThemedText style={[styles.title, { color: textColor }]}>{item.name}</ThemedText>
            <ThemedText style={styles.desc}>{item.description}</ThemedText>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: isCompleted ? "#4CAF50" : tintColor
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>{progress}%</ThemedText>
        </View>
        
        <View style={styles.statusContainer}>
          <ThemedText style={[
            styles.statusText,
            { color: isCompleted ? "#4CAF50" : "#FF9800" }
          ]}>
            {isCompleted ? 'Hoàn thành ✅' : 'Đang thực hiện 🔄'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>
          Thử Thách
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Hoàn thành thử thách để nhận điểm thưởng
        </ThemedText>
      </View>
      
      <FlatList
        data={challenges}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  challengeInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
