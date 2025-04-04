'use client'

import React, { useState } from 'react'

import { isManual, isPaypal, isStripe } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import { Spinner } from '@modules/common/icons'
import { OnApproveActions, OnApproveData } from '@paypal/paypal-js'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

import ErrorMessage from '../error-message'

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  'data-testid': string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  'data-testid': dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  // TODO: Add this once gift cards are implemented
  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // if (paidByGiftcard) {
  //   return <GiftCardPaymentButton />
  // }

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          providerId={paymentSession?.provider_id}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

// const GiftCardPaymentButton = () => {
//   const [submitting, setSubmitting] = useState(false)

//   const handleOrder = async () => {
//     setSubmitting(true)
//     await placeOrder()
//   }

//   return (
//     <Button
//       onClick={handleOrder}
//       isLoading={submitting}
//       data-testid="submit-order-button"
//     >
//       Place order
//     </Button>
//   )
// }

const StripePaymentButton = ({
  cart,
  providerId,
  notReady,
  'data-testid': dataTestId,
}: {
  cart: HttpTypes.StoreCart
  providerId: string
  notReady: boolean
  'data-testid'?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === 'pending'
  )

  const disabled = !stripe || !elements ? true : false
  const clientSecret = session.data.client_secret as string

  const handlePayment = async () => {
    setSubmitting(true)

    const card = elements?.getElement('card')

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    if (providerId === 'pp_stripe_stripe') {
      await stripe
        .confirmCardPayment(session?.data.client_secret as string, {
          payment_method: {
            card: card,
            billing_details: {
              name:
                cart.billing_address?.first_name +
                ' ' +
                cart.billing_address?.last_name,
              address: {
                city: cart.billing_address?.city ?? undefined,
                country: cart.billing_address?.country_code ?? undefined,
                line1: cart.billing_address?.address_1 ?? undefined,
                line2: cart.billing_address?.address_2 ?? undefined,
                postal_code: cart.billing_address?.postal_code ?? undefined,
                state: cart.billing_address?.province ?? undefined,
              },
              email: cart.email,
              phone: cart.billing_address?.phone ?? undefined,
            },
          },
        })
        .then(({ error, paymentIntent }) => {
          if (error) {
            const pi = error.payment_intent

            if (
              (pi && pi.status === 'requires_capture') ||
              (pi && pi.status === 'succeeded')
            ) {
              onPaymentCompleted()
            }

            setErrorMessage(error.message || null)
            return
          }

          if (
            (paymentIntent && paymentIntent.status === 'requires_capture') ||
            paymentIntent.status === 'succeeded'
          ) {
            return onPaymentCompleted()
          }

          return
        })
    } else {
      // TODO: Adjust for another Stripe methods
      const countryCode = cart.shipping_address?.country_code

      await stripe
        .confirmPayment({
          clientSecret,
          elements,
          redirect: 'if_required',
          confirmParams: {
            return_url: `${window.location.origin}/${countryCode}/order/confirmed/${cart.id}`,
          },
        })
        .then(async ({ error }) => {
          if (error) {
            setErrorMessage(error.message || null)
            return
          }
          onPaymentCompleted()
        })
    }
  }

  return (
    <>
      {clientSecret && providerId !== 'pp_stripe_stripe' && (
        <PaymentElement key={clientSecret} />
      )}
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const PayPalPaymentButton = ({
  cart,
  notReady,
  'data-testid': dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  'data-testid'?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === 'pending'
  )

  const handlePayment = async (
    _data: OnApproveData,
    actions: OnApproveActions
  ) => {
    actions?.order
      ?.authorize()
      .then((authorization) => {
        if (authorization.status !== 'COMPLETED') {
          setErrorMessage(`An error occurred, status: ${authorization.status}`)
          return
        }
        onPaymentCompleted()
      })
      .catch(() => {
        setErrorMessage(`An unknown error occurred, please try again.`)
        setSubmitting(false)
      })
  }

  const [{ isPending, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return <Spinner />
  }

  if (isResolved) {
    return (
      <>
        <PayPalButtons
          style={{ layout: 'horizontal' }}
          createOrder={async () => session?.data.id as string}
          onApprove={handlePayment}
          disabled={notReady || submitting || isPending}
          data-testid={dataTestId}
        />
        <ErrorMessage
          error={errorMessage}
          data-testid="paypal-payment-error-message"
        />
      </>
    )
  }
}

const ManualTestPaymentButton = ({ notReady }: { notReady: boolean }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
