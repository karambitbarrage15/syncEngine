import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { WorkflowStatus } from "@/generated/prisma";


export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: "Missing workflowId" },
        { status: 400 }
      );
    }

    // ✅ Validate workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { status: true },
    });

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 }
      );
    }

    if (workflow.status !== WorkflowStatus.PUBLISHED) {
      return NextResponse.json(
        { success: false, error: "Workflow not published" },
        { status: 400 }
      );
    }

    // ✅ Parse Google Form payload
    const body = await request.json();

    // ✅ OLD STYLE: explicit formData object
    const stripeData = {
      //event meatdata
      eventId:body.id,
      eventType:body.type,
      timestamp:body.created,
      livemode:body.livemode,
      raw:body.data?.object,
    };

    // ✅ Trigger workflow execution
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe:stripeData,
      },
    });

    // ✅ REQUIRED response
    return NextResponse.json({ success: true },{
      status:200
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process Stripe Event submission" },
      { status: 500 }
    );
  }
}
