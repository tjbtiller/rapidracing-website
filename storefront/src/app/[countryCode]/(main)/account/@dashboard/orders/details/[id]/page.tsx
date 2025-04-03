import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { enrichLineItems } from '@lib/data/cart'
import { retrieveOrder } from '@lib/data/orders'
import { HttpTypes } from '@medusajs/types'
import OrderDetailsTemplate from '@modules/order/templates/order-details-template'

type Props = {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return
  }

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)

  return {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const order = await getOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params
  const order = await getOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderDetailsTemplate order={order} />
}
