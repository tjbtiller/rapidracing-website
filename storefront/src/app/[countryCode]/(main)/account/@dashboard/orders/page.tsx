import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { listOrders } from '@lib/data/orders'
import OrderOverview, {
  OrderType,
} from '@modules/account/components/order-overview'

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Overview of your previous orders.',
}

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

export const ORDERS_LIMIT = 2

export default async function Orders(props: Props) {
  const searchParams = await props.searchParams
  const { page } = searchParams
  const currentPage = page ? parseInt(page) : 1

  const orders = await listOrders(
    (currentPage - 1) * ORDERS_LIMIT,
    ORDERS_LIMIT
  )

  if (!orders) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <OrderOverview orders={orders as unknown as OrderType[]} page={page} />
    </div>
  )
}
