import { ActivityCategory } from '@/types/carbon';
import { CarbonCalculator } from '@/utils/carbon-calculator';
import { describe, expect, it } from '@jest/globals';

describe('CarbonCalculator', () => {
  describe('calculateEmission', () => {
    it('should calculate CO2 emission for motorbike correctly', () => {
      const emission = CarbonCalculator.calculateEmission('motorbike', 10);
      expect(emission).toBe(0.72); // 10 * 0.072
    });

    it('should calculate CO2 emission for car correctly', () => {
      const emission = CarbonCalculator.calculateEmission('car', 5);
      expect(emission).toBe(0.96); // 5 * 0.192
    });

    it('should return 0 for bicycle', () => {
      const emission = CarbonCalculator.calculateEmission('bicycle', 10);
      expect(emission).toBe(0);
    });

    it('should return 0 for walking', () => {
      const emission = CarbonCalculator.calculateEmission('walking', 5);
      expect(emission).toBe(0);
    });

    it('should throw error for invalid category', () => {
      expect(() => {
        CarbonCalculator.calculateEmission('invalid' as ActivityCategory, 10);
      }).toThrow('No emission factor found for category: invalid');
    });
  });

  describe('formatCO2', () => {
    it('should format small values in grams', () => {
      expect(CarbonCalculator.formatCO2(0.5)).toBe('500g CO₂');
      expect(CarbonCalculator.formatCO2(0.001)).toBe('1g CO₂');
    });

    it('should format large values in kilograms', () => {
      expect(CarbonCalculator.formatCO2(1.5)).toBe('1.50kg CO₂');
      expect(CarbonCalculator.formatCO2(10)).toBe('10.00kg CO₂');
    });
  });

  describe('calculateTotalEmission', () => {
    it('should calculate total emission from activities', () => {
      const activities = [
        {
          id: '1',
          type: 'transport' as const,
          category: 'motorbike' as ActivityCategory,
          value: 10,
          unit: 'km',
          co2Emission: 0.72,
          date: new Date(),
        },
        {
          id: '2',
          type: 'transport' as const,
          category: 'car' as ActivityCategory,
          value: 5,
          unit: 'km',
          co2Emission: 0.96,
          date: new Date(),
        },
      ];

      const total = CarbonCalculator.calculateTotalEmission(activities);
      expect(total).toBe(1.68); // 0.72 + 0.96
    });

    it('should return 0 for empty activities array', () => {
      const total = CarbonCalculator.calculateTotalEmission([]);
      expect(total).toBe(0);
    });
  });

  describe('calculatePercentageOfAverage', () => {
    it('should calculate percentage correctly', () => {
      const vietnamDaily = 2.3 * 1000 / 365; // ~6.3 kg/day
      const percentage = CarbonCalculator.calculatePercentageOfAverage(vietnamDaily);
      expect(percentage).toBeCloseTo(100, 1);
    });

    it('should return 0 for zero emission', () => {
      const percentage = CarbonCalculator.calculatePercentageOfAverage(0);
      expect(percentage).toBe(0);
    });
  });

  describe('getImpactLevel', () => {
    it('should return low for emissions below 50% of average', () => {
      const vietnamDaily = 2.3 * 1000 / 365;
      const lowEmission = vietnamDaily * 0.3; // 30% of average
      const level = CarbonCalculator.getImpactLevel(lowEmission);
      expect(level).toBe('low');
    });

    it('should return medium for emissions between 50-100% of average', () => {
      const vietnamDaily = 2.3 * 1000 / 365;
      const mediumEmission = vietnamDaily * 0.75; // 75% of average
      const level = CarbonCalculator.getImpactLevel(mediumEmission);
      expect(level).toBe('medium');
    });

    it('should return high for emissions above 100% of average', () => {
      const vietnamDaily = 2.3 * 1000 / 365;
      const highEmission = vietnamDaily * 1.5; // 150% of average
      const level = CarbonCalculator.getImpactLevel(highEmission);
      expect(level).toBe('high');
    });
  });
});
