import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ActivityType, CarbonSuggestion } from '@/types/carbon';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function SuggestionsScreen() {
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set());
  // Use green background for the whole page
  const backgroundColor = '#e6fcd9';
  const tintColor = '#b6ff4a';

  const suggestions: CarbonSuggestion[] = [
    // Transport
    {
      id: '1',
      title: 'Đi xe đạp thay vì xe máy',
      description: 'Đi xe đạp cho quãng đường dưới 5km có thể giảm 0.36kg CO₂ mỗi lần',
      category: 'transport',
      potentialSavings: 0.36,
      difficulty: 'medium',
      cost: 'low',
      impact: 'high',
    },
    {
      id: '2',
      title: 'Sử dụng xe buýt công cộng',
      description: 'Xe buýt thải ra ít CO₂ hơn xe máy và ô tô cá nhân',
      category: 'transport',
      potentialSavings: 0.1,
      difficulty: 'easy',
      cost: 'low',
      impact: 'medium',
    },
    {
      id: '3',
      title: 'Đi bộ cho quãng đường ngắn',
      description: 'Đi bộ không tạo ra CO₂ và tốt cho sức khỏe',
      category: 'transport',
      potentialSavings: 0.072,
      difficulty: 'easy',
      cost: 'free',
      impact: 'medium',
    },

    // Energy
    {
      id: '4',
      title: 'Tắt đèn khi không sử dụng',
      description: 'Tắt đèn có thể tiết kiệm 0.5kg CO₂ mỗi tháng',
      category: 'energy',
      potentialSavings: 0.5,
      difficulty: 'easy',
      cost: 'free',
      impact: 'low',
    },
    {
      id: '5',
      title: 'Sử dụng bóng đèn LED',
      description: 'Bóng đèn LED tiết kiệm 80% năng lượng so với bóng đèn thường',
      category: 'energy',
      potentialSavings: 2.0,
      difficulty: 'easy',
      cost: 'medium',
      impact: 'high',
    },
    {
      id: '6',
      title: 'Giảm nhiệt độ điều hòa',
      description: 'Tăng nhiệt độ điều hòa từ 22°C lên 26°C tiết kiệm 15% năng lượng',
      category: 'energy',
      potentialSavings: 1.5,
      difficulty: 'easy',
      cost: 'free',
      impact: 'medium',
    },

    // Food
    {
      id: '7',
      title: 'Ăn ít thịt hơn',
      description: 'Giảm 1 bữa thịt mỗi tuần có thể giảm 27kg CO₂ mỗi năm',
      category: 'food',
      potentialSavings: 0.52,
      difficulty: 'medium',
      cost: 'free',
      impact: 'high',
    },
    {
      id: '8',
      title: 'Mua thực phẩm địa phương',
      description: 'Thực phẩm địa phương giảm lượng CO₂ từ vận chuyển',
      category: 'food',
      potentialSavings: 0.3,
      difficulty: 'easy',
      cost: 'low',
      impact: 'medium',
    },
    {
      id: '9',
      title: 'Tránh lãng phí thức ăn',
      description: 'Lãng phí thức ăn tạo ra 8% lượng khí thải toàn cầu',
      category: 'food',
      potentialSavings: 0.4,
      difficulty: 'easy',
      cost: 'free',
      impact: 'high',
    },

    // Plastic
    {
      id: '10',
      title: 'Sử dụng túi vải thay túi nhựa',
      description: 'Mỗi túi vải có thể thay thế hàng trăm túi nhựa',
      category: 'plastic',
      potentialSavings: 0.1,
      difficulty: 'easy',
      cost: 'low',
      impact: 'medium',
    },
    {
      id: '11',
      title: 'Mang chai nước cá nhân',
      description: 'Tránh mua nước đóng chai giảm rác thải nhựa',
      category: 'plastic',
      potentialSavings: 0.2,
      difficulty: 'easy',
      cost: 'low',
      impact: 'medium',
    },
    {
      id: '12',
      title: 'Sử dụng ống hút kim loại',
      description: 'Ống hút kim loại có thể tái sử dụng nhiều lần',
      category: 'plastic',
      potentialSavings: 0.05,
      difficulty: 'easy',
      cost: 'low',
      impact: 'low',
    },

    // Water
    {
      id: '13',
      title: 'Tắm nhanh hơn',
      description: 'Giảm 2 phút tắm mỗi ngày tiết kiệm 0.1kg CO₂ mỗi tháng',
      category: 'water',
      potentialSavings: 0.1,
      difficulty: 'easy',
      cost: 'free',
      impact: 'low',
    },
    {
      id: '14',
      title: 'Sử dụng nước máy thay nước đóng chai',
      description: 'Nước máy có lượng CO₂ thấp hơn nước đóng chai',
      category: 'water',
      potentialSavings: 0.3,
      difficulty: 'easy',
      cost: 'free',
      impact: 'medium',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#666';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free': return '#4CAF50';
      case 'low': return '#8BC34A';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: ActivityType) => {
    const icons: Record<ActivityType, string> = {
      transport: 'car.fill',
      energy: 'bolt.fill',
      food: 'restaurant.fill',
      plastic: 'recycle.fill',
      water: 'water.fill',
    };
    return icons[category];
  };

  const getCategoryLabel = (category: ActivityType) => {
    const labels: Record<ActivityType, string> = {
      transport: 'Giao thông',
      energy: 'Năng lượng',
      food: 'Ăn uống',
      plastic: 'Nhựa',
      water: 'Nước',
    };
    return labels[category];
  };

  const handleToggleSuggestion = (id: string) => {
    setCompletedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalPotentialSavings = suggestions
    .filter(s => completedSuggestions.has(s.id))
    .reduce((sum, s) => sum + s.potentialSavings, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Gợi ý giảm CO₂</ThemedText>
        <ThemedText style={styles.subtitle}>
          Các hành động đơn giản để giảm dấu chân carbon
        </ThemedText>
      </ThemedView>

      {/* Summary */}
      <ThemedView style={styles.summaryCard}>
        <ThemedText type="subtitle" style={styles.summaryTitle}>
          Tiết kiệm tiềm năng
        </ThemedText>
        <ThemedText type="title" style={[styles.summaryValue, { color: tintColor }]}>
          {totalPotentialSavings.toFixed(1)}kg CO₂
        </ThemedText>
        <ThemedText style={styles.summarySubtext}>
          từ {completedSuggestions.size} hành động đã chọn
        </ThemedText>
      </ThemedView>

      {/* Suggestions */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Hành động giảm phát thải
        </ThemedText>
        
        {suggestions.map((suggestion) => {
          const isCompleted = completedSuggestions.has(suggestion.id);
          
          return (
            <TouchableOpacity
              key={suggestion.id}
              style={[
                styles.suggestionCard,
                isCompleted && styles.completedCard
              ]}
              onPress={() => handleToggleSuggestion(suggestion.id)}
            >
              <ThemedView style={styles.suggestionHeader}>
                <ThemedView style={styles.categoryInfo}>
                  <IconSymbol
                    name={getCategoryIcon(suggestion.category)}
                    size={20}
                    color={tintColor}
                  />
                  <ThemedText style={styles.categoryLabel}>
                    {getCategoryLabel(suggestion.category)}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.savingsBadge}>
                  <ThemedText style={[styles.savingsText, { color: tintColor }]}>
                    -{suggestion.potentialSavings}kg
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedText type="defaultSemiBold" style={styles.suggestionTitle}>
                {suggestion.title}
              </ThemedText>
              
              <ThemedText style={styles.suggestionDescription}>
                {suggestion.description}
              </ThemedText>

              <ThemedView style={styles.suggestionTags}>
                <ThemedView style={[styles.tag, { backgroundColor: getDifficultyColor(suggestion.difficulty) }]}>
                  <ThemedText style={styles.tagText}>
                    {suggestion.difficulty === 'easy' ? 'Dễ' : 
                     suggestion.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.tag, { backgroundColor: getCostColor(suggestion.cost) }]}>
                  <ThemedText style={styles.tagText}>
                    {suggestion.cost === 'free' ? 'Miễn phí' :
                     suggestion.cost === 'low' ? 'Chi phí thấp' :
                     suggestion.cost === 'medium' ? 'Chi phí trung bình' : 'Chi phí cao'}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.tag, { backgroundColor: getImpactColor(suggestion.impact) }]}>
                  <ThemedText style={styles.tagText}>
                    {suggestion.impact === 'low' ? 'Tác động thấp' :
                     suggestion.impact === 'medium' ? 'Tác động trung bình' : 'Tác động cao'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {isCompleted && (
                <ThemedView style={styles.completedIndicator}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                  <ThemedText style={styles.completedText}>Đã hoàn thành</ThemedText>
                </ThemedView>
              )}
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6fcd9',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  summaryTitle: {
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  summarySubtext: {
    marginTop: 4,
    opacity: 0.6,
  },
  section: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  suggestionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  savingsBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionTitle: {
    marginBottom: 8,
  },
  suggestionDescription: {
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 20,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
});
