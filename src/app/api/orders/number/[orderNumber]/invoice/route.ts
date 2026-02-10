import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { orderService } from "@/lib/domain/orders/OrderService";
import { generateInvoicePDF } from "@/lib/invoice/invoiceGenerator";
export const GET = withAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        user: { userId: string },
        { params }: { params: Promise<{ orderNumber: string }> }
      ) => {
        const { orderNumber } = await params;

        // Get order details
        const result = await orderService.getOrderByNumber(
          user.userId,
          orderNumber
        );

        // Generate invoice PDF
        const pdfArray = generateInvoicePDF(result.order);
        const pdfBuffer = Buffer.from(pdfArray);

        // Return PDF response with attachment disposition to force download
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="invoice-${orderNumber}.pdf"`,
          },
        });
      }
    )
  )
);
