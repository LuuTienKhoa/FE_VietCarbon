import { FoodCategory, PlasticCategory, TrafficCategory } from '@/services/api';
import { CarbonActivity } from '@/types/carbon';
import { ActivityConverter } from '@/utils/activity-converter';
import { describe, expect, it } from '@jest/globals';

describe('ActivityConverter', () => {
  describe('toBackendFormat', () => {
    it('should convert transport activity correctly', () => {
      const activity: CarbonActivity = {
        id: '1',
        type: 'transport',
        category: 'motorbike',
        value: 10,
        unit: 'km',
        co2Emission: 0.72,
        date: new Date(),
        description: 'Test ride',
      };

      const result = ActivityConverter.toBackendFormat(activity);

      expect(result).toEqual({
        trafficUsage: {
          distance: 10,
          trafficCategory: TrafficCategory.MOTORBIKE,
        },
      });
    });

    it('should convert food activity correctly', () => {
      const activity: CarbonActivity = {
        id: '2',
        type: 'food',
        category: 'meat',
        value: 2,
        unit: 'kg',
        co2Emission: 54,
        date: new Date(),
        description: 'Beef',
      };

      const result = ActivityConverter.toBackendFormat(activity);

      expect(result).toEqual({
        foodUsage: {
          foodItems: [
            {
              foodCategory: FoodCategory.MEAT,
              weight: 2,
            },
          ],
        },
      });
    });

    it('should convert plastic activity correctly', () => {
      const activity: CarbonActivity = {
        id: '3',
        type: 'plastic',
        category: 'single_use_plastic',
        value: 0.5,
        unit: 'kg',
        co2Emission: 1.75,
        date: new Date(),
        description: 'Plastic bags',
      };

      const result = ActivityConverter.toBackendFormat(activity);

      expect(result).toEqual({
        plasticUsage: {
          plasticItems: [
            {
              plasticCategory: PlasticCategory.SINGLE_USE_PLASTIC,
              weight: 0.5,
            },
          ],
        },
      });
    });

    it('should convert energy activity correctly', () => {
      const activity: CarbonActivity = {
        id: '4',
        type: 'energy',
        category: 'electricity',
        value: 100,
        unit: 'kWh',
        co2Emission: 0.05,
        date: new Date(),
        description: 'Monthly usage',
      };

      const result = ActivityConverter.toBackendFormat(activity);

      expect(result).toEqual({
        energyUsage: {
          electricityConsumption: 100,
        },
      });
    });

    it('should convert water activity to energy approximation', () => {
      const activity: CarbonActivity = {
        id: '5',
        type: 'water',
        category: 'tap_water',
        value: 1000,
        unit: 'L',
        co2Emission: 0.3,
        date: new Date(),
        description: 'Daily water usage',
      };

      const result = ActivityConverter.toBackendFormat(activity);

      expect(result).toEqual({
        energyUsage: {
          electricityConsumption: 1, // 1000 * 0.001
        },
      });
    });
  });

  describe('toBackendFormatBatch', () => {
    it('should convert multiple activities correctly', () => {
      const activities: CarbonActivity[] = [
        {
          id: '1',
          type: 'transport',
          category: 'motorbike',
          value: 10,
          unit: 'km',
          co2Emission: 0.72,
          date: new Date(),
        },
        {
          id: '2',
          type: 'food',
          category: 'meat',
          value: 1,
          unit: 'kg',
          co2Emission: 27,
          date: new Date(),
        },
        {
          id: '3',
          type: 'energy',
          category: 'electricity',
          value: 50,
          unit: 'kWh',
          co2Emission: 0.025,
          date: new Date(),
        },
      ];

      const result = ActivityConverter.toBackendFormatBatch(activities);

      expect(result).toEqual({
        trafficUsage: {
          distance: 10,
          trafficCategory: TrafficCategory.MOTORBIKE,
        },
        foodUsage: {
          foodItems: [
            {
              foodCategory: FoodCategory.MEAT,
              weight: 1,
            },
          ],
        },
        energyUsage: {
          electricityConsumption: 50,
        },
      });
    });

    it('should handle empty activities array', () => {
      const result = ActivityConverter.toBackendFormatBatch([]);
      expect(result).toEqual({});
    });
  });

  describe('getLocalCategory', () => {
    it('should convert traffic categories correctly', () => {
      expect(ActivityConverter.getLocalCategory('transport', TrafficCategory.MOTORBIKE)).toBe('motorbike');
      expect(ActivityConverter.getLocalCategory('transport', TrafficCategory.CAR)).toBe('car');
      expect(ActivityConverter.getLocalCategory('transport', TrafficCategory.BICYCLE)).toBe('bicycle');
    });

    it('should convert food categories correctly', () => {
      expect(ActivityConverter.getLocalCategory('food', FoodCategory.MEAT)).toBe('meat');
      expect(ActivityConverter.getLocalCategory('food', FoodCategory.VEGETABLES)).toBe('vegetarian');
    });

    it('should convert plastic categories correctly', () => {
      expect(ActivityConverter.getLocalCategory('plastic', PlasticCategory.SINGLE_USE_PLASTIC)).toBe('single_use_plastic');
      expect(ActivityConverter.getLocalCategory('plastic', PlasticCategory.BOTTLES)).toBe('bottles');
    });

    it('should return default categories for energy and water', () => {
      expect(ActivityConverter.getLocalCategory('energy', 1)).toBe('electricity');
      expect(ActivityConverter.getLocalCategory('water', 1)).toBe('tap_water');
    });
  });
});
