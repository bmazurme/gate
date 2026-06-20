import { baseApi } from '../baseApi/baseApi';
import type { PlanDefinition, Subscription, SubscriptionPlan } from './types';

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<PlanDefinition[], void>({
      query: () => '/subscriptions/plans',
      providesTags: ['Plan'],
    }),
    getPlan: builder.query<PlanDefinition, SubscriptionPlan>({
      query: (plan) => `/subscriptions/plans/${plan}`,
      providesTags: (_result, _error, plan) => [{ type: 'Plan', id: plan }],
    }),
    updatePlan: builder.mutation<PlanDefinition, { plan: SubscriptionPlan; price: number }>({
      query: ({ plan, price }) => ({
        url: `/subscriptions/plans/${plan}`,
        method: 'PATCH',
        body: { price },
      }),
      invalidatesTags: (_result, _error, { plan }) => [{ type: 'Plan', id: plan }, 'Plan'],
    }),
    getMySubscriptions: builder.query<Subscription[], void>({
      query: () => '/subscriptions/me',
      providesTags: ['Subscription'],
    }),
    getMyActiveSubscription: builder.query<Subscription | null, void>({
      query: () => '/subscriptions/me/active',
      providesTags: ['Subscription'],
    }),
    getSubscription: builder.query<Subscription, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Subscription', id }],
    }),
    subscribe: builder.mutation<Subscription, { plan: SubscriptionPlan }>({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['Subscription'],
    }),
    cancelSubscription: builder.mutation<Subscription, string>({
      query: (id) => ({ url: `/subscriptions/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Subscription'],
    }),
    updateSubscription: builder.mutation<Subscription, { id: string; price: number }>({
      query: ({ id, price }) => ({ url: `/subscriptions/${id}`, method: 'PATCH', body: { price } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Subscription', id }, 'Subscription'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetPlanQuery,
  useUpdatePlanMutation,
  useGetMySubscriptionsQuery,
  useGetMyActiveSubscriptionQuery,
  useGetSubscriptionQuery,
  useSubscribeMutation,
  useCancelSubscriptionMutation,
  useUpdateSubscriptionMutation,
} = subscriptionsApi;
