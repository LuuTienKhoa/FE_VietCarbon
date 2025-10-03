import {
    FoodCategory,
    PlasticCategory,
    TrafficCategory,
    UserActivitiesInputModel
} from '@/services/api';
import { ActivityCategory, ActivityType, CarbonActivity } from '@/types/carbon';

export class ActivityConverter {
  /**
   * Convert local CarbonActivity to backend UserActivitiesInputModel
   */
  static toBackendFormat(activity: CarbonActivity): UserActivitiesInputModel {
    const input: UserActivitiesInputModel = {};

    switch (activity.type) {
      case 'transport':
        input.trafficUsage = {
          distance: activity.value,
          trafficCategory: this.getTrafficCategory(activity.category),
        };
        break;

      case 'food':
        input.foodUsage = {
          foodItems: [{
            foodCategory: this.getFoodCategory(activity.category),
            weight: activity.value,
          }],
        };
        break;

      case 'plastic':
        input.plasticUsage = {
          plasticItems: [{
            plasticCategory: this.getPlasticCategory(activity.category),
            weight: activity.value,
          }],
        };
        break;

      case 'energy':
        input.energyUsage = {
          electricityConsumption: activity.value,
        };
        break;

      case 'water':
        // Water is not directly supported by backend, we'll treat it as energy
        input.energyUsage = {
          electricityConsumption: activity.value * 0.001, // Convert to kWh approximation
        };
        break;
    }

    return input;
  }

  /**
   * Convert multiple activities to a single UserActivitiesInputModel
   */
  static toBackendFormatBatch(activities: CarbonActivity[]): UserActivitiesInputModel {
    const input: UserActivitiesInputModel = {};

    // Group activities by type
    const transportActivities = activities.filter(a => a.type === 'transport');
    const foodActivities = activities.filter(a => a.type === 'food');
    const plasticActivities = activities.filter(a => a.type === 'plastic');
    const energyActivities = activities.filter(a => a.type === 'energy' || a.type === 'water');

    // Handle transport (take the first one for now, could be enhanced)
    if (transportActivities.length > 0) {
      const activity = transportActivities[0];
      input.trafficUsage = {
        distance: activity.value,
        trafficCategory: this.getTrafficCategory(activity.category),
      };
    }

    // Handle food
    if (foodActivities.length > 0) {
      input.foodUsage = {
        foodItems: foodActivities.map(activity => ({
          foodCategory: this.getFoodCategory(activity.category),
          weight: activity.value,
        })),
      };
    }

    // Handle plastic
    if (plasticActivities.length > 0) {
      input.plasticUsage = {
        plasticItems: plasticActivities.map(activity => ({
          plasticCategory: this.getPlasticCategory(activity.category),
          weight: activity.value,
        })),
      };
    }

    // Handle energy
    if (energyActivities.length > 0) {
      const totalEnergy = energyActivities.reduce((sum, activity) => {
        if (activity.type === 'water') {
          return sum + (activity.value * 0.001); // Convert water to energy approximation
        }
        return sum + activity.value;
      }, 0);

      input.energyUsage = {
        electricityConsumption: totalEnergy,
      };
    }

    return input;
  }

  /**
   * Get traffic category enum from local category
   */
  private static getTrafficCategory(category: ActivityCategory): number {
    const mapping: Record<string, number> = {
      'motorbike': TrafficCategory.MOTORBIKE,
      'car': TrafficCategory.CAR,
      'bus': TrafficCategory.BUS,
      'train': TrafficCategory.TRAIN,
      'plane': TrafficCategory.PLANE,
      'bicycle': TrafficCategory.BICYCLE,
      'walking': TrafficCategory.WALKING,
    };
    return mapping[category] || TrafficCategory.MOTORBIKE;
  }

  /**
   * Get food category enum from local category
   */
  private static getFoodCategory(category: ActivityCategory): number {
    const mapping: Record<string, number> = {
      'meat': FoodCategory.MEAT,
      'vegetarian': FoodCategory.VEGETABLES,
      'vegan': FoodCategory.VEGETABLES,
      'mixed_diet': FoodCategory.MEAT,
    };
    return mapping[category] || FoodCategory.OTHER;
  }

  /**
   * Get plastic category enum from local category
   */
  private static getPlasticCategory(category: ActivityCategory): number {
    const mapping: Record<string, number> = {
      'single_use_plastic': PlasticCategory.SINGLE_USE_PLASTIC,
      'packaging': PlasticCategory.PACKAGING,
      'bottles': PlasticCategory.BOTTLES,
      'bags': PlasticCategory.BAGS,
    };
    return mapping[category] || PlasticCategory.OTHER;
  }

  /**
   * Get local category from backend enum
   */
  static getLocalCategory(type: ActivityType, backendCategory: number): ActivityCategory {
    switch (type) {
      case 'transport':
        const trafficMapping: Record<number, ActivityCategory> = {
          [TrafficCategory.MOTORBIKE]: 'motorbike',
          [TrafficCategory.CAR]: 'car',
          [TrafficCategory.BUS]: 'bus',
          [TrafficCategory.TRAIN]: 'train',
          [TrafficCategory.PLANE]: 'plane',
          [TrafficCategory.BICYCLE]: 'bicycle',
          [TrafficCategory.WALKING]: 'walking',
        };
        return trafficMapping[backendCategory] || 'motorbike';

      case 'food':
        const foodMapping: Record<number, ActivityCategory> = {
          [FoodCategory.MEAT]: 'meat',
          [FoodCategory.VEGETABLES]: 'vegetarian',
          [FoodCategory.FRUITS]: 'vegetarian',
          [FoodCategory.GRAINS]: 'vegetarian',
        };
        return foodMapping[backendCategory] || 'mixed_diet';

      case 'plastic':
        const plasticMapping: Record<number, ActivityCategory> = {
          [PlasticCategory.SINGLE_USE_PLASTIC]: 'single_use_plastic',
          [PlasticCategory.PACKAGING]: 'packaging',
          [PlasticCategory.BOTTLES]: 'bottles',
          [PlasticCategory.BAGS]: 'bags',
        };
        return plasticMapping[backendCategory] || 'single_use_plastic';

      case 'energy':
        return 'electricity';

      case 'water':
        return 'tap_water';

      default:
        return 'motorbike';
    }
  }
}
