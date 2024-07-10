import { Button } from '@agiflowai/frontend-web-ui';
import { useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { apiClient } from '@/libs/api';

const pricing = [
  {
    name: 'Professional',
    price: {
      monthly: '$19/month',
    },
    popular: true,
    features: ['3 Environments / Project', '1 Projects', '50,000 Logs / Month', '2 Team Members', 'Business Support'],
    button: {
      text: 'Use this plan',
      variant: 'default',
    },
    price_key: 'standard_professional_monthly',
  },
  {
    name: 'Startups',
    price: {
      monthly: '$199/month',
    },
    popular: true,
    features: ['4 Environments / Project', '3 Projects', '500,000 Logs / Month', '5 Team Members', 'On-demand Support'],
    button: {
      text: 'Use this plan',
      variant: 'outline',
    },
    price_key: 'standard_startup_monthly',
  },
];

interface SubscribeProps {
  name: string;
}
export const Subscribe = ({ name }: SubscribeProps) => {
  const params = useParams({
    from: '/dashboard/organization/$organizationId',
  });

  const mutate = useMutation({
    mutationFn: (payload: { priceKey: string }) => {
      return apiClient.POST('/organizations/{organizationId}/subscriptions', {
        params: {
          path: params,
        },
        body: payload,
      });
    },
    onSuccess: data => {
      if (data?.data?.redirectUrl) {
        window.location.href = data?.data?.redirectUrl;
      }
    },
  });

  return (
    <div className='mt-6 flex w-full flex-col items-center p-4'>
      <div className='w-full max-w-[900px]'>
        <h3>Hi {name}, thanks for using Agiflow</h3>
        <p>Please choose the pricing plan that suits. We offer 14-days free trial; you can choose to cancel anytime!</p>
        <div className='mx-auto my-12 grid max-w-screen-2xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {pricing.map(plan => (
            <div
              key={plan.price_key}
              className='order-first flex w-full flex-col justify-between rounded-md border-2 border-border px-6 py-5 lg:order-none'
            >
              <div>
                <div className='text-center'>
                  <h4 className='text-lg font-medium text-mono-light'>{plan.name}</h4>
                  <p className='mt-3 text-h5 font-bold text-text md:text-h4'>
                    {plan.price && typeof plan.price === 'object' ? plan.price.monthly : plan.price}
                  </p>
                </div>
                <ul className='mt-8 grid gap-y-4 text-left'>
                  {plan.features.map(item => (
                    <li className='flex items-start gap-3 text-text' key={item}>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='mt-8 flex'>
                <Button
                  className='w-full'
                  variant={plan.button.variant as any}
                  onClick={() => mutate.mutate({ priceKey: plan.price_key })}
                >
                  {plan.button.text}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
