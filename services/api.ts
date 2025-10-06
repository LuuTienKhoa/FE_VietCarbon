// import { getApiUrl } from '@/config/api';

// // API Configuration
// const API_BASE_URL = getApiUrl();

// // API Response Types
// export interface ApiResponse<T> {
//   data?: T;
//   error?: string;
//   success: boolean;
// }

// // Enhanced API Error
// export class ApiError extends Error {
//   constructor(
//     message: string,
//     public status?: number,
//     public code?: string
//   ) {
//     super(message);
//     this.name = 'ApiError';
//   }
// }

// // Retry configuration
// const RETRY_CONFIG = {
//   maxRetries: 3,
//   retryDelay: 1000,
//   retryCondition: (error: any) => {
//     // Retry on network errors or 5xx status codes
//     return !error.status || error.status >= 500;
//   },
// };

// // Auth Types (matching OpenAPI spec)
// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface RegisterRequest {
//   username: string;
//   email: string;
//   password: string;
//   phoneNumber?: string;
// }

// export interface UpgradeRequest {
//   plan: UpgradePlan;
//   returnUrl?: string;
//   cancelUrl?: string;
// }

// export interface User {
//   id: number;
//   userName?: string;
//   email?: string;
//   passwordHash?: string;
//   phoneNumber?: string;
//   role: UserRole;
//   dateOfBirth: string;
//   subscriptionType: SubscriptionType;
//   userActivities?: UserActivities[];
//   challengeProgresses?: ChallengeProgress[];
// }

// // Enums (matching OpenAPI spec)
// export enum UserRole {
//   USER = 1,
//   ADMIN = 2,
//   MODERATOR = 3,
// }

// export enum SubscriptionType {
//   FREE = 1,
//   PREMIUM = 2,
//   ENTERPRISE = 3,
// }

// export enum UpgradePlan {
//   PREMIUM = 1,
//   ENTERPRISE = 2,
// }

// // Transaction enums from OpenAPI
// export enum TransactionStatus {
//   PENDING = 0,
//   COMPLETED = 1,
//   FAILED = 2,
//   CANCELLED = 3,
// }

// // Activity Types (matching OpenAPI spec)
// export interface TrafficUsageInputModel {
//   distance: number;
//   trafficCategory: TrafficCategory;
// }

// export interface FoodItemInputModel {
//   foodCategory: FoodCategory;
//   weight: number;
// }

// export interface FoodUsageInputModel {
//   foodItems?: FoodItemInputModel[];
// }

// export interface PlasticItemInputModel {
//   plasticCategory: PlasticCategory;
//   weight: number;
// }

// export interface PlasticUsageInputModel {
//   plasticItems?: PlasticItemInputModel[];
// }

// export interface EnergyUsageInputModel {
//   electricityConsumption: number;
// }

// export interface UserActivitiesInputModel {
//   plasticUsage?: PlasticUsageInputModel;
//   trafficUsage?: TrafficUsageInputModel;
//   foodUsage?: FoodUsageInputModel;
//   energyUsage?: EnergyUsageInputModel;
// }

// // Response Models (matching OpenAPI spec)
// export interface TrafficUsage {
//   id: number;
//   activityId: number;
//   date: string;
//   distance: number;
//   trafficCategory: TrafficCategory;
//   cO2emission: number;
// }

// export interface TrafficUsageDto {
//   id: number;
//   date: string;
//   cO2Emission: number;
// }

// export interface FoodItem {
//   id: number;
//   foodCategory: FoodCategory;
//   weight: number;
//   foodUsageId: number;
// }

// export interface FoodUsage {
//   id: number;
//   activityId: number;
//   date: string;
//   cO2emission: number;
//   score: number;
//   foodItems?: FoodItem[];
// }

// export interface FoodItemDto {
//   id: number;
//   foodCategory?: string;
//   weight: number;
// }

// export interface FoodUsageDto {
//   id: number;
//   date: string;
//   cO2Emission: number;
//   score: number;
//   foodItems?: FoodItemDto[];
// }

// export interface PlasticItem {
//   id: number;
//   plasticCategory: PlasticCategory;
//   weight: number;
//   plasticUsageId: number;
// }

// export interface PlasticUsage {
//   id: number;
//   activityId: number;
//   date: string;
//   cO2emission: number;
//   plasticItems?: PlasticItem[];
// }

// export interface PlasticItemDto {
//   id: number;
//   plasticCategory?: string;
//   weight: number;
// }

// export interface PlasticUsageDto {
//   id: number;
//   date: string;
//   cO2Emission: number;
//   plasticItems?: PlasticItemDto[];
// }

// export interface EnergyUsage {
//   id: number;
//   activityId: number;
//   date: string;
//   electricityconsumption: number;
//   cO2emission: number;
// }

// export interface EnergyUsageDto {
//   id: number;
//   date: string;
//   electricityConsumption: number;
//   cO2Emission: number;
// }

// export interface UserActivities {
//   id: number;
//   userId: number;
//   date: string;
//   totalCO2Emission: number;
//   plasticUsageId?: number;
//   trafficUsageId?: number;
//   foodUsageId?: number;
//   energyUsageId?: number;
//   plasticUsage?: PlasticUsage;
//   trafficUsage?: TrafficUsage;
//   foodUsage?: FoodUsage;
//   energyUsage?: EnergyUsage;
//   user?: User;
// }

// export interface UserActivitiesDto {
//   id: number;
//   userId: number;
//   date: string;
//   totalCO2Emission: number;
//   plasticUsage?: PlasticUsageDto;
//   trafficUsage?: TrafficUsageDto;
//   foodUsage?: FoodUsageDto;
//   energyUsage?: EnergyUsageDto;
// }

// // Challenge Types (matching OpenAPI spec)
// export interface Challenge {
//   id: number;
//   name?: string;
//   description?: string;
//   startDate: string;
//   endDate?: string;
//   isComplete: boolean;
// }

// export interface ChallengeRequest {
//   name?: string;
//   description?: string;
//   startDate: string;
//   endDate: string;
// }

// export interface ChallengeProgress {
//   id: number;
//   userId: number;
//   challengeId: number;
//   progress: number;
//   description?: string;
//   finishDate: string;
//   isComplete: boolean;
//   score: number;
//   user?: User;
//   challenge?: Challenge;
// }

// // Additional DTOs for Users/Transactions per OpenAPI
// export interface ChangePasswordRequest {
//   currentPassword: string;
//   newPassword: string;
// }

// export interface UpdateUserRequest {
//   userName?: string;
//   phoneNumber?: string;
//   dateOfBirth?: string;
// }

// export interface UpdateUserRoleRequest {
//   role: UserRole;
// }

// export interface CreateTransactionRequest {
//   userId: number;
//   amount: number;
//   reason: string;
//   status?: TransactionStatus;
// }

// export interface UpdateTransactionRequest {
//   status?: TransactionStatus;
//   reason?: string;
// }

// // Notification Types (matching OpenAPI spec)
// export enum NotifyReason {
//   ACTIVITY_REMINDER = 1,
//   CHALLENGE_UPDATE = 2,
//   ACHIEVEMENT_UNLOCKED = 3,
//   GOAL_COMPLETED = 4,
//   WEEKLY_REPORT = 5,
//   MONTHLY_REPORT = 6,
//   SYSTEM_UPDATE = 7,
//   MAINTENANCE = 8,
//   PROMOTION = 9,
//   SECURITY_ALERT = 10,
// }

// export interface NotifyRequest {
//   title?: string;
//   content?: string;
//   reason: NotifyReason;
// }

// export interface NotifyUpdateRequest {
//   title?: string;
//   content?: string;
//   reason: NotifyReason;
//   isActive: boolean;
// }

// // Webhook Types (matching OpenAPI spec)
// export interface WebhookData {
//   orderCode: number;
//   amount: number;
//   description?: string;
//   accountNumber?: string;
//   reference?: string;
//   transactionDateTime?: string;
//   currency?: string;
//   paymentLinkId?: string;
//   code?: string;
//   desc?: string;
//   counterAccountBankId?: string;
//   counterAccountBankName?: string;
//   counterAccountName?: string;
//   counterAccountNumber?: string;
//   virtualAccountName?: string;
//   virtualAccountNumber?: string;
// }

// export interface WebhookType {
//   code?: string;
//   desc?: string;
//   success: boolean;
//   data: WebhookData;
//   signature?: string;
// }

// // API Service Class
// class ApiService {
//   private baseURL: string;
//   private token: string | null = null;

//   constructor(baseURL: string) {
//     this.baseURL = baseURL;
//     this.loadToken();
//   }

//   setToken(token: string | null) {
//     this.token = token;
//   }

//   private loadToken() {
//     // Load token from secure storage
//     // For now, we'll use a simple approach
//     this.token = null; // Will be set after login
//   }

//   private async delay(ms: number): Promise<void> {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   private async requestWithRetry<T>(
//     endpoint: string,
//     options: RequestInit = {},
//     retryCount = 0
//   ): Promise<ApiResponse<T>> {
//     const url = `${this.baseURL}${endpoint}`;
    
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       ...(options.headers as Record<string, string>),
//     };

//     if (this.token) {
//       headers.Authorization = `Bearer ${this.token}`;
//     }

//     // Log request details
//     console.log('API Request:', {
//       method: options.method || 'GET',
//       url,
//       headers,
//       body: options.body ? JSON.parse(options.body as string) : undefined,
//       retryCount,
//     });

//     try {
//       // Cross-platform timeout using AbortController (AbortSignal.timeout is not supported on RN)
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000);

//       const response = await fetch(url, {
//         ...options,
//         headers,
//         signal: controller.signal,
//       });
//       clearTimeout(timeoutId);

//       console.log('📡 API Response:', {
//         status: response.status,
//         statusText: response.statusText,
//         url: response.url,
//         headers: response.headers,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('API Error Response:', {
//           status: response.status,
//           statusText: response.statusText,
//           body: errorText,
//         });
        
//         const error = new ApiError(
//           `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
//           response.status
//         );

//         // Retry logic
//         if (
//           retryCount < RETRY_CONFIG.maxRetries &&
//           RETRY_CONFIG.retryCondition(error)
//         ) {
//           console.log(`🔄 Retrying request (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
//           await this.delay(RETRY_CONFIG.retryDelay * (retryCount + 1));
//           return this.requestWithRetry(endpoint, options, retryCount + 1);
//         }

//         return {
//           success: false,
//           error: error.message,
//         };
//       }

//       const data = await response.json();
//       console.log('✅ API Success:', data);
//       return { data, success: true };
//     } catch (error) {
//       const apiError = error instanceof ApiError ? error : new ApiError(
//         error instanceof Error ? error.message : 'Network error'
//       );

//       console.error('API Request Failed:', {
//         error: apiError.message,
//         url,
//         method: options.method || 'GET',
//         retryCount,
//         stack: apiError.stack,
//       });

//       // Retry logic for network errors
//       if (
//         retryCount < RETRY_CONFIG.maxRetries &&
//         RETRY_CONFIG.retryCondition(apiError)
//       ) {
//         console.log(`🔄 Retrying request (${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
//         await this.delay(RETRY_CONFIG.retryDelay * (retryCount + 1));
//         return this.requestWithRetry(endpoint, options, retryCount + 1);
//       }
      
//       return {
//         error: apiError.message,
//         success: false,
//       };
//     }
//   }

//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<ApiResponse<T>> {
//     return this.requestWithRetry<T>(endpoint, options);
//   }

//   // Auth Methods
//   async login(credentials: LoginRequest): Promise<ApiResponse<{ token: string; user: User }>> {
//     const response = await this.request<{ token: string; user: User }>('/User/login', {
//       method: 'POST',
//       body: JSON.stringify(credentials),
//     });

//     if (response.success && response.data?.token) {
//       this.token = response.data.token;
//       // Store token securely
//       // await SecureStore.setItemAsync('auth_token', response.data.token);
//     }

//     return response;
//   }

//   async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
//     return this.request<User>('/User/register', {
//       method: 'POST',
//       body: JSON.stringify(userData),
//     });
//   }

//   async getCurrentUser(): Promise<ApiResponse<User>> {
//     return this.request<User>('/User/me');
//   }

//   async upgradeUser(upgradeData: UpgradeRequest): Promise<ApiResponse<any>> {
//     return this.request<any>('/User/upgrade', {
//       method: 'POST',
//       body: JSON.stringify(upgradeData),
//     });
//   }

//   async logout() {
//     this.token = null;
//     // await SecureStore.deleteItemAsync('auth_token');
//   }

//   // User Activities Methods
//   async createUserActivity(activity: UserActivitiesInputModel): Promise<ApiResponse<UserActivities>> {
//     return this.request<UserActivities>('/UserActivities', {
//       method: 'POST',
//       body: JSON.stringify(activity),
//     });
//   }

//   async getUserActivities(): Promise<ApiResponse<UserActivities[]>> {
//     return this.request<UserActivities[]>('/UserActivities');
//   }

//   async deleteUserActivity(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/UserActivities?id=${id}`, {
//       method: 'DELETE',
//     });
//   }

//   async getLeaderBoard(): Promise<ApiResponse<any[]>> {
//     return this.request<any[]>('/UserActivities/LeaderBoard');
//   }

//   // Challenge Methods
//   async getChallenges(): Promise<ApiResponse<Challenge[]>> {
//     return this.request<Challenge[]>('/Challenge');
//   }

//   async createChallenge(challenge: ChallengeRequest): Promise<ApiResponse<Challenge>> {
//     return this.request<Challenge>('/Challenge', {
//       method: 'POST',
//       body: JSON.stringify(challenge),
//     });
//   }

//   async getChallenge(id: number): Promise<ApiResponse<Challenge>> {
//     return this.request<Challenge>(`/Challenge/${id}`);
//   }

//   async updateChallenge(id: number, challenge: Challenge): Promise<ApiResponse<Challenge>> {
//     return this.request<Challenge>(`/Challenge/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(challenge),
//     });
//   }

//   async deleteChallenge(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/Challenge/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   // Challenge Progress Methods
//   async getChallengeProgresses(): Promise<ApiResponse<ChallengeProgress[]>> {
//     return this.request<ChallengeProgress[]>('/ChallengeProgress');
//   }

//   async createChallengeProgress(progress: Omit<ChallengeProgress, 'id'>): Promise<ApiResponse<ChallengeProgress>> {
//     return this.request<ChallengeProgress>('/ChallengeProgress', {
//       method: 'POST',
//       body: JSON.stringify(progress),
//     });
//   }

//   async getChallengeProgress(id: number): Promise<ApiResponse<ChallengeProgress>> {
//     return this.request<ChallengeProgress>(`/ChallengeProgress/${id}`);
//   }

//   async updateChallengeProgress(id: number, progress: ChallengeProgress): Promise<ApiResponse<ChallengeProgress>> {
//     return this.request<ChallengeProgress>(`/ChallengeProgress/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(progress),
//     });
//   }

//   async deleteChallengeProgress(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/ChallengeProgress/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   // Energy Usage Methods
//   async getEnergyUsage(): Promise<ApiResponse<EnergyUsage[]>> {
//     return this.request<EnergyUsage[]>('/EnergyUsage');
//   }

//   async createEnergyUsage(energyUsage: EnergyUsageDto): Promise<ApiResponse<EnergyUsage>> {
//     return this.request<EnergyUsage>('/EnergyUsage', {
//       method: 'POST',
//       body: JSON.stringify(energyUsage),
//     });
//   }

//   async getEnergyUsageById(id: number): Promise<ApiResponse<EnergyUsage>> {
//     return this.request<EnergyUsage>(`/EnergyUsage/${id}`);
//   }

//   async updateEnergyUsage(id: number, energyUsage: EnergyUsageDto): Promise<ApiResponse<EnergyUsage>> {
//     return this.request<EnergyUsage>(`/EnergyUsage/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(energyUsage),
//     });
//   }

//   async deleteEnergyUsage(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/EnergyUsage/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   async getEnergyUsageByUser(userId: number): Promise<ApiResponse<EnergyUsage[]>> {
//     return this.request<EnergyUsage[]>(`/EnergyUsage/user/${userId}`);
//   }

//   // Food Usage Methods
//   async getFoodUsage(id?: number): Promise<ApiResponse<FoodUsage[]>> {
//     const endpoint = id ? `/FoodUsage?id=${id}` : '/FoodUsage';
//     return this.request<FoodUsage[]>(endpoint);
//   }

//   async createFoodUsage(foodUsage: FoodUsageDto): Promise<ApiResponse<FoodUsage>> {
//     return this.request<FoodUsage>('/FoodUsage', {
//       method: 'POST',
//       body: JSON.stringify(foodUsage),
//     });
//   }

//   async getFoodUsageByUser(userId: number): Promise<ApiResponse<FoodUsage[]>> {
//     return this.request<FoodUsage[]>(`/FoodUsage/${userId}`);
//   }

//   async updateFoodUsage(id: number, foodUsage: FoodUsageDto): Promise<ApiResponse<FoodUsage>> {
//     return this.request<FoodUsage>(`/FoodUsage/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(foodUsage),
//     });
//   }

//   async deleteFoodUsage(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/FoodUsage/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   // Plastic Usage Methods
//   async createPlasticUsage(plasticUsage: PlasticUsageDto): Promise<ApiResponse<PlasticUsage>> {
//     return this.request<PlasticUsage>('/PlasticUsage', {
//       method: 'POST',
//       body: JSON.stringify(plasticUsage),
//     });
//   }

//   async getPlasticUsageById(id: number): Promise<ApiResponse<PlasticUsage>> {
//     return this.request<PlasticUsage>(`/PlasticUsage/${id}`);
//   }

//   async updatePlasticUsage(id: number, plasticUsage: PlasticUsageDto): Promise<ApiResponse<PlasticUsage>> {
//     return this.request<PlasticUsage>(`/PlasticUsage/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(plasticUsage),
//     });
//   }

//   async deletePlasticUsage(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/PlasticUsage/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   async getPlasticUsageByUser(userId: number): Promise<ApiResponse<PlasticUsage[]>> {
//     return this.request<PlasticUsage[]>(`/PlasticUsage/user/${userId}`);
//   }

//   // Traffic Usage Methods
//   async createTrafficUsage(trafficUsage: TrafficUsageDto): Promise<ApiResponse<TrafficUsage>> {
//     return this.request<TrafficUsage>('/TrafficUsage', {
//       method: 'POST',
//       body: JSON.stringify(trafficUsage),
//     });
//   }

//   async getTrafficUsageById(id: number): Promise<ApiResponse<TrafficUsage>> {
//     return this.request<TrafficUsage>(`/TrafficUsage/${id}`);
//   }

//   async updateTrafficUsage(id: number, trafficUsage: TrafficUsageDto): Promise<ApiResponse<TrafficUsage>> {
//     return this.request<TrafficUsage>(`/TrafficUsage/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(trafficUsage),
//     });
//   }

//   async deleteTrafficUsage(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/TrafficUsage/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   async getTrafficUsageByUser(userId: number): Promise<ApiResponse<TrafficUsage[]>> {
//     return this.request<TrafficUsage[]>(`/TrafficUsage/user/${userId}`);
//   }

//   // User Activities Methods
//   async getUserActivitiesByUserId(userId: number): Promise<ApiResponse<UserActivities[]>> {
//     return this.request<UserActivities[]>(`/UserActivities/UserId?userId=${userId}`);
//   }

//   // Notification Methods
//   async createNotification(notification: NotifyRequest): Promise<ApiResponse<any>> {
//     return this.request<any>('/Notify', {
//       method: 'POST',
//       body: JSON.stringify(notification),
//     });
//   }

//   async getNotifications(): Promise<ApiResponse<any[]>> {
//     return this.request<any[]>('/Notify');
//   }

//   async getNotification(id: number): Promise<ApiResponse<any>> {
//     return this.request<any>(`/Notify/${id}`);
//   }

//   async updateNotification(id: number, notification: NotifyUpdateRequest): Promise<ApiResponse<any>> {
//     return this.request<any>(`/Notify/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(notification),
//     });
//   }

//   async deleteNotification(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/Notify/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   async getActiveNotifications(): Promise<ApiResponse<any[]>> {
//     return this.request<any[]>('/Notify/active');
//   }

//   async getNotificationsByReason(reason: NotifyReason): Promise<ApiResponse<any[]>> {
//     return this.request<any[]>(`/Notify/reason/${reason}`);
//   }

//   async getNotificationsPaged(page: number = 1, pageSize: number = 10): Promise<ApiResponse<any>> {
//     return this.request<any>(`/Notify/paged?page=${page}&pageSize=${pageSize}`);
//   }

//   async deactivateNotification(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/Notify/${id}/deactivate`, {
//       method: 'PATCH',
//     });
//   }

//   async getNotificationReasons(): Promise<ApiResponse<any>> {
//     return this.request<any>('/Notify/reasons');
//   }

//   // Recommendation Methods
//   async getRecommend(userActivityId: number): Promise<ApiResponse<any>> {
//     return this.request<any>(`/Recommend/${userActivityId}`);
//   }

//   // Transactions Methods
//   async createTransaction(payload: CreateTransactionRequest): Promise<ApiResponse<any>> {
//     return this.request<any>('/Transaction', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     });
//   }

//   async getTransactions(params?: {
//     UserId?: number;
//     Status?: TransactionStatus;
//     MinAmount?: number;
//     MaxAmount?: number;
//     StartDate?: string;
//     EndDate?: string;
//     Page?: number;
//     PageSize?: number;
//   }): Promise<ApiResponse<any[]>> {
//     const qs = params
//       ? '?' + new URLSearchParams(
//           Object.keys(params).reduce((acc, k) => {
//             const v = params[k as keyof typeof params];
//             if (v !== undefined && v !== null) {
//               acc[k] = String(v);
//             }
//             return acc;
//           }, {} as Record<string, string>)
//         ).toString()
//       : '';
//     return this.request<any[]>(`/Transaction${qs}`);
//   }

//   async getTransaction(id: number): Promise<ApiResponse<any>> {
//     return this.request<any>(`/Transaction/${id}`);
//   }

//   async updateTransaction(id: number, payload: UpdateTransactionRequest): Promise<ApiResponse<any>> {
//     return this.request<any>(`/Transaction/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(payload),
//     });
//   }

//   async deleteTransaction(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/Transaction/${id}`, { method: 'DELETE' });
//   }

//   async getTransactionsByUser(userId: number): Promise<ApiResponse<any[]>> {
//     return this.request<any[]>(`/Transaction/user/${userId}`);
//   }

//   // Users Methods
//   async listUsers(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<User[]>> {
//     const qs = params ? `?${new URLSearchParams({
//       ...(params.page ? { page: String(params.page) } : {}),
//       ...(params.pageSize ? { pageSize: String(params.pageSize) } : {}),
//     }).toString()}` : '';
//     return this.request<User[]>(`/User${qs}`);
//   }

//   async getUser(id: number): Promise<ApiResponse<User>> {
//     return this.request<User>(`/User/${id}`);
//   }

//   async updateUser(id: number, payload: UpdateUserRequest): Promise<ApiResponse<User>> {
//     return this.request<User>(`/User/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(payload),
//     });
//   }

//   async deleteUser(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/User/${id}`, { method: 'DELETE' });
//   }

//   async changePassword(payload: ChangePasswordRequest): Promise<ApiResponse<void>> {
//     return this.request<void>('/User/change-password', {
//       method: 'POST',
//       body: JSON.stringify(payload),
//     });
//   }

//   async updateUserRole(id: number, payload: UpdateUserRoleRequest): Promise<ApiResponse<void>> {
//     return this.request<void>(`/User/${id}/role`, {
//       method: 'PUT',
//       body: JSON.stringify(payload),
//     });
//   }

//   // Transaction/Webhook Methods
//   async handlePaymentReturn(webhookData: WebhookType): Promise<ApiResponse<any>> {
//     return this.request<any>('/Transaction/payment-return', {
//       method: 'POST',
//       body: JSON.stringify(webhookData),
//     });
//   }

//   // Utility Methods
//   isAuthenticated(): boolean {
//     return !!this.token;
//   }

//   getToken(): string | null {
//     return this.token;
//   }
// }

// // Create and export API instance
// export const apiService = new ApiService(API_BASE_URL);

// // Category Enums (matching OpenAPI spec)
// export enum TrafficCategory {
//   MOTORBIKE = 1,
//   CAR = 2,
//   BUS = 3,
//   TRAIN = 4,
//   PLANE = 5,
//   BICYCLE = 6,
//   WALKING = 7,
// }

// export enum FoodCategory {
//   MEAT = 1,
//   FISH = 2,
//   DAIRY = 3,
//   EGGS = 4,
//   VEGETABLES = 5,
//   FRUITS = 6,
//   GRAINS = 7,
//   NUTS = 8,
//   OTHER = 9,
// }

// export enum PlasticCategory {
//   SINGLE_USE_PLASTIC = 1,
//   PACKAGING = 2,
//   BOTTLES = 3,
//   BAGS = 4,
//   STRAWS = 5,
//   OTHER = 6,
// }
