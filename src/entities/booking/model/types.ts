export type BookingResponse = {
  available_days: string[];
  current_day: string;
  restaurant: Restaurant;
  tables: Table[];
};

export type Restaurant = {
  id: number;
  timezone: string;
  restaurant_name: string;
  opening_time: string;
  closing_time: string;
};

export type Table = {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  orders: Order[];
  reservations: Reservation[];
};

export type OrderStatus = 'New' | 'Bill' | 'Closed' | 'Banquet';

export type Order = {
  id: string;
  status: OrderStatus;
  start_time: string;
  end_time: string;
};

export type ReservationStatus =
  | 'Живая очередь'
  | 'Новая'
  | 'Заявка'
  | 'Открыт'
  | 'Закрыт'
  | 'Отменен'
  | 'Вызвана'
  | 'Занял место'
  | string;

export type Reservation = {
  id: number;
  name_for_reservation: string;
  phone_number: string;
  num_people: number;
  status: ReservationStatus;
  seating_time: string;
  end_time: string;
};

export type EventSource = 'order' | 'reservation';

export type StyleKey =
  | 'order-new'
  | 'order-bill'
  | 'order-closed'
  | 'order-banquet'
  | 'res-queue'
  | 'res-new'
  | 'res-app'
  | 'res-open'
  | 'res-closed'
  | 'res-unknown';

export type ScheduleEvent = {
  id: string;
  tableId: string;
  source: EventSource;
  title: string;
  badge?: string;
  name?: string;
  numPeople?: number;
  phoneTail?: string;
  start: Date;
  end: Date;
  rawStatus: string;
  styleKey: StyleKey;
};

export type LaidOutEvent = ScheduleEvent & {
  top: number;
  height: number;
  slotIndex: number;
  slotCount: number;
  depth: number;
  compressed: boolean;
  overlapIds: string[];
};
