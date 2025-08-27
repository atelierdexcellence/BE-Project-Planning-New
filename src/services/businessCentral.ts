// Business Central integration stub
export interface BCOrder {
  orderNumber: string;
  customerName: string;
  customerCode: string;
  orderDate: string;
  deliveryDate: string;
  totalAmount: number;
  status: string;
}

export class BusinessCentralService {
  private baseUrl = import.meta.env.VITE_REACT_APP_BC_API_URL || 'https://api.businesscentral.dynamics.com';
  private apiKey = import.meta.env.VITE_REACT_APP_BC_API_KEY || 'mock-api-key';

  async fetchOrderByNumber(orderNumber: string): Promise<BCOrder | null> {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders: BCOrder[] = [
        {
          orderNumber: 'BC001',
          customerName: 'Client A',
          customerCode: 'CA001',
          orderDate: '2024-01-15',
          deliveryDate: '2024-04-30',
          totalAmount: 15000,
          status: 'In Progress'
        },
        {
          orderNumber: 'BC002',
          customerName: 'Client B',
          customerCode: 'CB001',
          orderDate: '2024-01-20',
          deliveryDate: '2024-05-15',
          totalAmount: 22000,
          status: 'At Risk'
        }
      ];

      return mockOrders.find(order => order.orderNumber === orderNumber) || null;
    } catch (error) {
      console.error('Error fetching BC order:', error);
      return null;
    }
  }

  async fetchCustomers(): Promise<any[]> {
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        { code: 'CA001', name: 'Client A' },
        { code: 'CB001', name: 'Client B' },
        { code: 'CC001', name: 'Client C' }
      ];
    } catch (error) {
      console.error('Error fetching BC customers:', error);
      return [];
    }
  }
}

export const bcService = new BusinessCentralService();