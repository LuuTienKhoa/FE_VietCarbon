import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CARBON_EMISSION_FACTORS } from '@/constants/carbon-factors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { apiService } from '@/services/api';
import { ActivityCategory, ActivityType, CarbonActivity } from '@/types/carbon';
import { ActivityConverter } from '@/utils/activity-converter';
import { CarbonCalculator } from '@/utils/carbon-calculator';
import { activitySchema } from '@/utils/validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface CarbonActivityFormProps {
  onSubmit: (activity: CarbonActivity) => void;
  onCancel: () => void;
  onError?: (error: string) => void;
}

interface FormData {
  type: ActivityType;
  category: string;
  value: number;
  description?: string;
}

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'transport', label: 'Giao thông' },
  { value: 'energy', label: 'Năng lượng' },
  { value: 'food', label: 'Ăn uống' },
  { value: 'plastic', label: 'Nhựa' },
  { value: 'water', label: 'Nước' },
];

export function CarbonActivityForm({ onSubmit, onCancel, onError }: CarbonActivityFormProps) {
  const [loading, setLoading] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(activitySchema as any),
    defaultValues: {
      type: 'transport',
      category: 'motorbike',
      value: 0,
      description: '',
    },
    mode: 'onChange',
  });

  const selectedType = watch('type');
  const selectedCategory = watch('category');
  const value = watch('value');

  // Get categories based on selected type
  const getCategoriesForType = (type: ActivityType): ActivityCategory[] => {
    const categories: Record<ActivityType, ActivityCategory[]> = {
      transport: ['motorbike', 'car', 'bus', 'train', 'plane', 'bicycle', 'walking'],
      energy: ['electricity', 'gas', 'heating'],
      food: ['meat', 'vegetarian', 'vegan', 'mixed_diet'],
      plastic: ['single_use_plastic', 'packaging', 'bottles', 'bags'],
      water: ['tap_water', 'bottled_water'],
    };
    return categories[type];
  };

  const availableCategories = getCategoriesForType(selectedType);
  const selectedFactor = CARBON_EMISSION_FACTORS.find(f => f.category === selectedCategory);

  const onFormSubmit: SubmitHandler<FormData> = async (data) => {
    if (!isValid) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    const numericValue = data.value;
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      const errorMessage = 'Giá trị không hợp lệ';
      onError?.(errorMessage);
      Alert.alert('Lỗi', errorMessage);
      return;
    }

    let co2Emission = 0;
    try {
      // Zero-emission categories
      if (selectedCategory === 'bicycle' || selectedCategory === 'walking') {
        co2Emission = 0;
      } else {
        co2Emission = CarbonCalculator.calculateEmission(selectedCategory as ActivityCategory, numericValue);
      }
    } catch (e) {
      onError?.('Không tìm thấy hệ số phát thải cho danh mục đã chọn');
      Alert.alert('Lỗi', 'Không tìm thấy hệ số phát thải cho danh mục đã chọn');
      return;
    }

    const activity: CarbonActivity = {
      id: Date.now().toString(),
      type: data.type,
      category: data.category as ActivityCategory,
      value: numericValue,
      unit: selectedFactor?.unit || '',
      co2Emission,
      date: new Date(),
      description: (data.description ?? '').trim() || undefined,
    };

    setLoading(true);

    try {
      // Convert to backend format and send to API
      const backendFormat = ActivityConverter.toBackendFormat(activity);
      const response = await apiService.createUserActivity(backendFormat);

      if (response.success) {
        onSubmit(activity);
      } else {
        const errorMessage = response.error || 'Có lỗi xảy ra khi lưu hoạt động';
        onError?.(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      }
    } catch (error) {
      const errorMessage = 'Có lỗi xảy ra khi kết nối với server';
      onError?.(errorMessage);
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Thêm hoạt động
      </ThemedText>

      {/* Activity Type */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Loại hoạt động</ThemedText>
        <ThemedView style={[styles.pickerContainer, { borderColor }]}>
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => {
                  onChange(itemValue);
                  // Reset category when type changes
                  const newCategories = getCategoriesForType(itemValue);
                  setValue('category', newCategories[0]);
                }}
                style={{ color: textColor }}
              >
                {ACTIVITY_TYPES.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            )}
          />
        </ThemedView>
        {errors.type && (
          <ThemedText style={styles.errorText}>{errors.type.message}</ThemedText>
        )}
      </ThemedView>

      {/* Category */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Danh mục</ThemedText>
        <ThemedView style={[styles.pickerContainer, { borderColor }]}>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={{ color: textColor }}
              >
                {availableCategories.map((category) => {
                  const factor = CARBON_EMISSION_FACTORS.find(f => f.category === category);
                  return (
                    <Picker.Item 
                      key={category} 
                      label={factor?.description || category} 
                      value={category} 
                    />
                  );
                })}
              </Picker>
            )}
          />
        </ThemedView>
        {errors.category && (
          <ThemedText style={styles.errorText}>{errors.category.message}</ThemedText>
        )}
      </ThemedView>

      {/* Value Input */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">
          Số lượng ({selectedFactor?.unit})
        </ThemedText>
        <Controller
          control={control}
          name="value"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Nhập số lượng"
              placeholderTextColor="#888"
              value={value ? String(value) : ''}
              onChangeText={(text) => onChange(text === '' ? 0 : Number(text))}
              keyboardType="numeric"
            />
          )}
        />
        {errors.value && (
          <ThemedText style={styles.errorText}>{errors.value.message}</ThemedText>
        )}
      </ThemedView>

      {/* Description */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Mô tả (tùy chọn)</ThemedText>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea, { color: textColor, borderColor }]}
              placeholder="Mô tả thêm về hoạt động"
              placeholderTextColor="#888"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
            />
          )}
        />
        {errors.description && (
          <ThemedText style={styles.errorText}>{errors.description.message}</ThemedText>
        )}
      </ThemedView>

      {/* CO2 Preview */}
      {typeof value === 'number' && value > 0 && (
        <ThemedView style={styles.preview}>
          <ThemedText type="defaultSemiBold">
            Ước tính: {CarbonCalculator.formatCO2(
              CarbonCalculator.calculateEmission(selectedCategory as ActivityCategory, value)
            )}
          </ThemedText>
        </ThemedView>
      )}

      {/* Buttons */}
      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <ThemedText style={styles.cancelButtonText}>Hủy</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.button, 
            styles.submitButton, 
            (!isValid || loading) && styles.disabledButton
          ]} 
          onPress={handleSubmit(onFormSubmit)}
          disabled={!isValid || loading}
        >
          <ThemedText style={styles.submitButtonText}>
            {loading ? 'Đang lưu...' : 'Thêm'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  preview: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
});
