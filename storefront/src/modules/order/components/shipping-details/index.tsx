'use client'

import React from 'react'

import useToggleState from '@lib/hooks/use-toggle-state'
import compareAddresses from '@lib/util/addresses'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@medusajs/ui'
import { Box } from '@modules/common/components/box'

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const { state: sameAsShipping } = useToggleState(
    order.shipping_address && order.billing_address
      ? compareAddresses(order.billing_address, order.shipping_address)
      : true
  )

  return (
    <Box className="bg-primary p-2">
      <Box className="p-4">
        <Text size="large">Shipping address</Text>
        <Text size="base" className="text-secondary">
          {`${order.shipping_address.first_name} ${order.shipping_address.last_name}`}
        </Text>
        <Text size="base" className="text-secondary">
          {`${order.shipping_address.company ? `${order.shipping_address.company}, ` : ''}${order.shipping_address.address_1} ${order.shipping_address.address_2}`}
        </Text>
        <Text size="base" className="text-secondary">
          {`${order.shipping_address.postal_code} ${order.shipping_address.city}, ${order.shipping_address.country_code.toUpperCase()}`}
        </Text>
        <Text size="base" className="text-secondary">
          {`${order.email}, ${order.shipping_address.phone}`}
        </Text>
      </Box>
      <Box className="p-4">
        <Text size="large">Billing address</Text>
        {sameAsShipping ? (
          <Text size="base" className="text-secondary">
            Same as shipping address
          </Text>
        ) : (
          <>
            <Text size="base" className="text-secondary">
              {`${order.billing_address.first_name} ${order.billing_address.last_name}`}
            </Text>
            <Text size="base" className="text-secondary">
              {`${order.billing_address.company ? `${order.billing_address.company}, ` : ''}${order.billing_address.address_1} ${order.billing_address.address_2}`}
            </Text>
            <Text size="base" className="text-secondary">
              {`${order.billing_address.postal_code} ${order.billing_address.city}, ${order.billing_address.country_code.toUpperCase()}`}
            </Text>
            <Text size="base" className="text-secondary">
              {`${order.email}, ${order.billing_address.phone}`}
            </Text>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ShippingDetails
