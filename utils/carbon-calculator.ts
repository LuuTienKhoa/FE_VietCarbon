import { CARBON_EMISSION_FACTORS } from '@/constants/carbon-factors';
import { ActivityCategory, CarbonActivity } from '@/types/carbon';

export class CarbonCalculator {
  /**
   * Calculate CO2 emission for a specific activity
   */
  static calculateEmission(
    category: ActivityCategory,
    value: number
  ): number {
    const factor = CARBON_EMISSION_FACTORS.find(f => f.category === category);
    if (!factor) {
      throw new Error(`No emission factor found for category: ${category}`);
    }
    return value * factor.factor;
  }

  /**
   * Calculate total CO2 emission for multiple activities
   */
  static calculateTotalEmission(activities: CarbonActivity[]): number {
    return activities.reduce((total, activity) => total + activity.co2Emission, 0);
  }

  /**
   * Calculate daily average CO2 emission
   */
  static calculateDailyAverage(activities: CarbonActivity[], days: number = 1): number {
    const total = this.calculateTotalEmission(activities);
    return total / days;
  }

  /**
   * Calculate CO2 emission by category
   */
  static calculateByCategory(activities: CarbonActivity[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    activities.forEach(activity => {
      const category = activity.category;
      result[category] = (result[category] || 0) + activity.co2Emission;
    });
    
    return result;
  }

  /**
   * Calculate CO2 emission by type
   */
  static calculateByType(activities: CarbonActivity[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    activities.forEach(activity => {
      const type = activity.type;
      result[type] = (result[type] || 0) + activity.co2Emission;
    });
    
    return result;
  }

  /**
   * Get emission factor for a category
   */
  static getEmissionFactor(category: ActivityCategory) {
    return CARBON_EMISSION_FACTORS.find(f => f.category === category);
  }

  /**
   * Format CO2 value for display
   */
  static formatCO2(value: number): string {
    if (value < 1) {
      return `${(value * 1000).toFixed(0)}g CO₂`;
    }
    if (value < 10) {
      return `${value.toFixed(1)}kg CO₂`;
    }
    return `${value.toFixed(0)}kg CO₂`;
  }

  /**
   * Calculate percentage compared to Vietnam average
   */
  static calculatePercentageOfAverage(dailyEmission: number): number {
    const vietnamDaily = 2.3 * 1000 / 365; // Convert tons to kg and per day
    return (dailyEmission / vietnamDaily) * 100;
  }

  /**
   * Get environmental impact level
   */
  static getImpactLevel(dailyEmission: number): 'low' | 'medium' | 'high' {
    const percentage = this.calculatePercentageOfAverage(dailyEmission);
    
    if (percentage < 50) return 'low';
    if (percentage < 100) return 'medium';
    return 'high';
  }
}
