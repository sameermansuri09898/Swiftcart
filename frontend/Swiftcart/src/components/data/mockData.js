export const partner = {
  name: 'Rohan Kumar',
  role: 'Delivery Partner',
  avatar: 'https://i.pravatar.cc/80?img=13',
  online: true,
}

export const todayStats = {
  deliveries: { done: 8, target: 12 },
  earnings: { total: 364, bonus: 48 },
  activeTime: '4h 32m',
  rating: { score: 4.8, count: 120 },
}

export const currentDelivery = {
  orderId: '#ORD-1024',
  status: 'Live',
  distanceKm: 1.2,
  etaMins: 5,
  items: 8,
  amount: 642,
  customer: {
    name: 'Amit Verma',
    phone: '+91 98765 43210',
    address: 'Flat 302, Sunrise Apartments, Sector 12, Noida - 201301',
  },
}

export const liveOrders = {
  ongoing: [
    {
      id: '#ORD-1024',
      status: 'Out for Delivery',
      eta: '5 mins',
      customer: 'Amit Verma',
      location: 'Sector 12, Noida',
      amount: 642,
      items: 8,
    },
  ],
  upcoming: [
    {
      id: '#ORD-1023',
      status: 'Picked Up',
      eta: '12 mins',
      customer: 'Neha Singh',
      location: 'Sector 15, Noida',
      amount: 389,
      items: 5,
    },
    {
      id: '#ORD-1022',
      status: 'Preparing',
      eta: '20 mins',
      customer: 'Rahul Mehta',
      location: 'Sector 18, Noida',
      amount: 521,
      items: 7,
    },
    {
      id: '#ORD-1021',
      status: 'Assigned',
      eta: '28 mins',
      customer: 'Pooja Sharma',
      location: 'Sector 22, Noida',
      amount: 736,
      items: 12,
    },
  ],
  completed: [
    {
      id: '#ORD-1019',
      status: 'Delivered',
      eta: '—',
      customer: 'Ishaan Kapoor',
      location: 'Sector 10, Noida',
      amount: 298,
      items: 4,
    },
    {
      id: '#ORD-1018',
      status: 'Delivered',
      eta: '—',
      customer: 'Divya Rao',
      location: 'Sector 9, Noida',
      amount: 455,
      items: 6,
    },
  ],
}

export const earningsOverview = {
  total: 364,
  breakdown: [
    { label: 'Delivery Earnings', value: 320 },
    { label: 'Bonus', value: 48 },
    { label: 'Incentives', value: 0 },
  ],
  chart: {
    labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
    values: [22, 38, 55, 30, 48, 62, 40],
  },
}

export const recentActivity = [
  { id: 1, text: 'Order #ORD-1024 picked up', time: '10:06 AM', amount: 48, type: 'pickup' },
  { id: 2, text: 'Reached customer location', time: '09:42 AM', amount: null, type: 'location' },
  { id: 3, text: 'Order #ORD-1023 delivered', time: '08:36 AM', amount: 32, type: 'delivered' },
  { id: 4, text: 'Order #ORD-1022 picked up', time: '07:58 AM', amount: 41, type: 'pickup' },
]

export const quickActions = [
  { id: 'orders', label: 'View All Orders' },
  { id: 'earnings', label: 'Check Earnings' },
  { id: 'availability', label: 'Update Availability' },
  { id: 'support', label: 'Support / Help' },
]
