import { Badge } from '../ui/Badge';
import type { OrderStatus, TicketStatus } from '../../types';

const orderColors: Record<OrderStatus, 'muted' | 'blue' | 'warning' | 'success' | 'danger' | 'navy'> = {
  Pending:    'muted',
  Confirmed:  'blue',
  Processing: 'warning',
  Shipped:    'navy',
  Delivered:  'success',
  Cancelled:  'danger',
};

const orderLabels: Record<OrderStatus, string> = {
  Pending:    'Ожидает',
  Confirmed:  'Подтверждён',
  Processing: 'Обрабатывается',
  Shipped:    'Отправлен',
  Delivered:  'Доставлен',
  Cancelled:  'Отменён',
};

const ticketColors: Record<TicketStatus, 'muted' | 'blue' | 'warning' | 'success' | 'danger' | 'navy' | 'xlight'> = {
  WaitingForMaster: 'muted',
  Diagnosis:        'blue',
  PriceApproval:    'warning',
  InRepair:         'navy',
  WaitingForParts:  'warning',
  ReadyForPickup:   'success',
  Completed:        'success',
  Cancelled:        'danger',
};

const ticketLabels: Record<TicketStatus, string> = {
  WaitingForMaster: 'Ожидает мастера',
  Diagnosis:        'Диагностика',
  PriceApproval:    'Согласование цены',
  InRepair:         'В ремонте',
  WaitingForParts:  'Ожидание запчастей',
  ReadyForPickup:   'Готово к выдаче',
  Completed:        'Завершён',
  Cancelled:        'Отменён',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderColors[status]}>{orderLabels[status]}</Badge>;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={ticketColors[status]}>{ticketLabels[status]}</Badge>;
}
