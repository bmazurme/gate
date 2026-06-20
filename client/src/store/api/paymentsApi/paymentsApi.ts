import { baseApi } from '../baseApi/baseApi';
import type { Payment } from './types';

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentsBySubscription: builder.query<Payment[], string>({
      query: (subscriptionId) => `/payments/subscription/${subscriptionId}`,
      providesTags: (_result, _error, subscriptionId) => [
        { type: 'Payment', id: subscriptionId },
      ],
    }),
  }),
});

export const { useGetPaymentsBySubscriptionQuery } = paymentsApi;
