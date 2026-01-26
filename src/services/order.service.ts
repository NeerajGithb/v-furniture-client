import { connectDB } from "@/lib/dbConnect";
import Order from "@/models/Order";

export class OrderService {
  static async getOrdersCount(userId: string): Promise<number> {
    try {
      await connectDB();
      
      // Count orders that are not completed, cancelled, returned, or overdue
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await Order.countDocuments({
        userId,
        orderStatus: { 
          $nin: ['delivered', 'cancelled', 'returned'] 
        },
        $or: [
          { expectedDeliveryDate: { $exists: false } },
          { expectedDeliveryDate: null },
          { expectedDeliveryDate: { $gte: today } }
        ]
      });
    } catch (error) {
      console.error("[OrderService] getOrdersCount error:", error);
      return 0;
    }
  }

  static async getOrders(userId: string, limit: number = 100) {
    try {
      await connectDB();

      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return {
        orders,
        totalOrders: orders.length,
      };
    } catch (error) {
      console.error("[OrderService] getOrders error:", error);
      return { orders: [], totalOrders: 0 };
    }
  }

  static async getOrderById(userId: string, orderId: string) {
    try {
      await connectDB();

      return await Order.findOne({
        _id: orderId,
        userId,
      }).lean();
    } catch (error) {
      console.error("[OrderService] getOrderById error:", error);
      return null;
    }
  }
}