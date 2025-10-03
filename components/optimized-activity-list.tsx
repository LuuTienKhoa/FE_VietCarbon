import { CarbonActivity } from '@/types/carbon';
import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, ListRenderItem, ViewToken } from 'react-native';
import { ActivityItem } from './activity-item';

interface OptimizedActivityListProps {
  activities: CarbonActivity[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onLoadMore?: () => void;
  tintColor: string;
}

// Memoized activity item component
const MemoizedActivityItem = memo(ActivityItem);

// Key extractor for FlatList
const keyExtractor = (item: CarbonActivity) => item.id;

// Empty component
const EmptyComponent = memo(() => (
  <ActivityItem
    activity={{
      id: 'empty',
      type: 'transport',
      category: 'motorbike',
      value: 0,
      unit: 'km',
      co2Emission: 0,
      date: new Date(),
      description: 'Chưa có hoạt động nào',
    }}
    tintColor="#ccc"
  />
));

export const OptimizedActivityList = memo<OptimizedActivityListProps>(({
  activities,
  onRefresh,
  refreshing = false,
  onLoadMore,
  tintColor,
}) => {
  // Memoized render item
  const renderItem: ListRenderItem<CarbonActivity> = useCallback(({ item }) => (
    <MemoizedActivityItem activity={item} tintColor={tintColor} />
  ), [tintColor]);

  // Memoized viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 50,
  }), []);

  // Memoized onViewableItemsChanged
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Track which items are visible for analytics
    const visibleIds = viewableItems.map(item => item.item?.id).filter(Boolean);
    if (visibleIds.length > 0) {
      console.log('Visible activities:', visibleIds);
    }
  }, []);

  // Memoized getItemLayout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 80, // Approximate height of each item
    offset: 80 * index,
    index,
  }), []);

  // Memoized list footer
  const ListFooterComponent = useMemo(() => {
    if (activities.length === 0) return null;
    
    return (
      <MemoizedActivityItem
        activity={{
          id: 'footer',
          type: 'transport',
          category: 'motorbike',
          value: 0,
          unit: 'km',
          co2Emission: 0,
          date: new Date(),
          description: 'Đã hiển thị tất cả hoạt động',
        }}
        tintColor="#ccc"
      />
    );
  }, [activities.length]);

  return (
    <FlatList
      data={activities}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      ListEmptyComponent={EmptyComponent}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
    />
  );
});

OptimizedActivityList.displayName = 'OptimizedActivityList';
