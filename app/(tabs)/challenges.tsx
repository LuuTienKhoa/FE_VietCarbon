import { useFlashMessage } from '@/components/flash-message-provider';
import { Loading } from '@/components/loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService } from '@/services/api';
import { useChallengeStore } from '@/stores/challengeStore';
import React, { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function ChallengesScreen() {
  const { 
    challenges, 
    challengeProgresses, 
    isLoading, 
    error,
    setChallenges,
    setChallengeProgresses,
    addChallengeProgress,
    updateChallengeProgress,
    getActiveChallenges,
    getCompletedChallenges,
    getAvailableChallenges,
    getTotalPoints,
    loadChallenges,
    saveChallenges,
    setError 
  } = useChallengeStore();
  const { showMessage } = useFlashMessage();
  
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Load challenges on component mount
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const onRefresh = async () => {
    await loadChallenges();
  };

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      const response = await apiService.createChallengeProgress({
        userId: 1, // This should come from user context
        challengeId,
        progress: 0,
        isComplete: false,
        score: 0,
      });

      if (response.success) {
        addChallengeProgress(response.data!);
        await saveChallenges();
        showMessage({
          type: 'success',
          message: 'Đã tham gia thử thách!',
        });
      } else {
        showMessage({
          type: 'error',
          message: response.error || 'Không thể tham gia thử thách',
        });
      }
    } catch (err) {
      showMessage({
        type: 'error',
        message: 'Có lỗi xảy ra khi tham gia thử thách',
      });
    }
  };

  const handleCompleteChallenge = async (challengeId: number) => {
    try {
      // Find the progress for this challenge
      const progress = challengeProgresses.find(p => p.challengeId === challengeId);
      if (progress) {
        const response = await apiService.createChallengeProgress({
          ...progress,
          progress: 100,
          isComplete: true,
          finishDate: new Date().toISOString(),
          score: 100, // Or calculate based on challenge
        });

        if (response.success) {
          updateChallengeProgress(progress.id, {
            progress: 100,
            isComplete: true,
            finishDate: new Date().toISOString(),
            score: 100,
          });
          await saveChallenges();
          showMessage({
            type: 'success',
            message: 'Chúc mừng! Bạn đã hoàn thành thử thách!',
          });
        } else {
          showMessage({
            type: 'error',
            message: response.error || 'Không thể hoàn thành thử thách',
          });
        }
      }
    } catch (err) {
      showMessage({
        type: 'error',
        message: 'Có lỗi xảy ra khi hoàn thành thử thách',
      });
    }
  };

  const totalPoints = getTotalPoints();
  const activeChallenges = getActiveChallenges();
  const completedChallengesList = getCompletedChallenges();
  const availableChallenges = getAvailableChallenges();

  const getChallengeTypeIcon = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'calendar';
    if (diffDays <= 7) return 'calendar.badge.clock';
    return 'calendar.badge.plus';
  };

  const getChallengeTypeLabel = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Hàng ngày';
    if (diffDays <= 7) return 'Hàng tuần';
    return 'Hàng tháng';
  };

  if (isLoading && challenges.length === 0) {
    return <Loading message="Đang tải thử thách..." />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">Thử thách CO₂</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tham gia thử thách để giảm phát thải và kiếm điểm thưởng
        </ThemedText>
      </ThemedView>

      {/* Points Summary */}
      <ThemedView style={styles.pointsCard}>
        <ThemedView style={styles.pointsHeader}>
          <IconSymbol name="trophy.fill" size={24} color={tintColor} />
          <ThemedText type="subtitle" style={styles.pointsTitle}>
            Điểm thưởng
          </ThemedText>
        </ThemedView>
        <ThemedText type="title" style={[styles.pointsValue, { color: tintColor }]}>
          {totalPoints}
        </ThemedText>
        <ThemedText style={styles.pointsSubtext}>
          {completedChallengesList.length} thử thách đã hoàn thành
        </ThemedText>
      </ThemedView>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Thử thách đang tham gia
          </ThemedText>
          {activeChallenges.map((challenge) => (
            <ThemedView key={challenge.id} style={styles.challengeCard}>
              <ThemedView style={styles.challengeHeader}>
                <ThemedView style={styles.challengeType}>
                  <IconSymbol name={getChallengeTypeIcon(challenge.startDate, challenge.endDate)} size={16} color={tintColor} />
                  <ThemedText style={styles.challengeTypeLabel}>
                    {getChallengeTypeLabel(challenge.startDate, challenge.endDate)}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.rewardBadge}>
                  <ThemedText style={[styles.rewardText, { color: tintColor }]}>
                    +100 điểm
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedText type="defaultSemiBold" style={styles.challengeTitle}>
                {challenge.name || 'Thử thách'}
              </ThemedText>
              
              <ThemedText style={styles.challengeDescription}>
                {challenge.description || 'Mô tả thử thách'}
              </ThemedText>

              <ThemedView style={styles.challengeStats}>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Mục tiêu</ThemedText>
                  <ThemedText style={[styles.statValue, { color: tintColor }]}>
                    -5kg CO₂
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Tham gia</ThemedText>
                  <ThemedText style={styles.statValue}>
                    100
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <TouchableOpacity
                style={[styles.completeButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleCompleteChallenge(challenge.id)}
              >
                <ThemedText style={styles.completeButtonText}>
                  Hoàn thành thử thách
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {/* Available Challenges */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Thử thách có sẵn
        </ThemedText>
        
        {availableChallenges.map((challenge) => (
            <ThemedView key={challenge.id} style={styles.challengeCard}>
              <ThemedView style={styles.challengeHeader}>
                <ThemedView style={styles.challengeType}>
                  <IconSymbol name={getChallengeTypeIcon(challenge.startDate, challenge.endDate)} size={16} color={tintColor} />
                  <ThemedText style={styles.challengeTypeLabel}>
                    {getChallengeTypeLabel(challenge.startDate, challenge.endDate)}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.rewardBadge}>
                  <ThemedText style={[styles.rewardText, { color: tintColor }]}>
                    +100 điểm
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedText type="defaultSemiBold" style={styles.challengeTitle}>
                {challenge.name || 'Thử thách'}
              </ThemedText>
              
              <ThemedText style={styles.challengeDescription}>
                {challenge.description || 'Mô tả thử thách'}
              </ThemedText>

              <ThemedView style={styles.challengeStats}>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Mục tiêu</ThemedText>
                  <ThemedText style={[styles.statValue, { color: tintColor }]}>
                    -5kg CO₂
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>Tham gia</ThemedText>
                  <ThemedText style={styles.statValue}>
                    100
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: tintColor }]}
                onPress={() => handleJoinChallenge(challenge.id)}
              >
                <ThemedText style={styles.joinButtonText}>
                  Tham gia thử thách
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))}
      </ThemedView>

      {/* Completed Challenges */}
      {completedChallengesList.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Thử thách đã hoàn thành
          </ThemedText>
          {completedChallengesList.map((challenge) => (
              <ThemedView key={challenge.id} style={[styles.challengeCard, styles.completedCard]}>
                <ThemedView style={styles.challengeHeader}>
                  <ThemedView style={styles.challengeType}>
                    <IconSymbol name={getChallengeTypeIcon(challenge.startDate, challenge.endDate)} size={16} color="#4CAF50" />
                    <ThemedText style={[styles.challengeTypeLabel, { color: '#4CAF50' }]}>
                      {getChallengeTypeLabel(challenge.startDate, challenge.endDate)}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.completedBadge}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                    <ThemedText style={styles.completedText}>Hoàn thành</ThemedText>
                  </ThemedView>
                </ThemedView>

                <ThemedText type="defaultSemiBold" style={styles.challengeTitle}>
                  {challenge.name || 'Thử thách'}
                </ThemedText>
                
                <ThemedText style={styles.challengeDescription}>
                  {challenge.description || 'Mô tả thử thách'}
                </ThemedText>

                <ThemedView style={styles.challengeStats}>
                  <ThemedView style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>Điểm thưởng</ThemedText>
                    <ThemedText style={[styles.statValue, { color: '#4CAF50' }]}>
                      +100
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.statItem}>
                    <ThemedText style={styles.statLabel}>CO₂ tiết kiệm</ThemedText>
                    <ThemedText style={[styles.statValue, { color: '#4CAF50' }]}>
                      -5kg
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            ))}
        </ThemedView>
      )}
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
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  pointsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pointsTitle: {
    marginBottom: 0,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pointsSubtext: {
    opacity: 0.6,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#F1F8E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeTypeLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  rewardBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  challengeTitle: {
    marginBottom: 8,
  },
  challengeDescription: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  completeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
