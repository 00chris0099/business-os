import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// Trigger an n8n workflow
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { trigger_data = {} } = body;

        // Get workflow details
        const workflowResult = await query(
            `SELECT * FROM automation.workflows WHERE id = $1`,
            [id]
        );

        if (!workflowResult.rows.length) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        const workflow = workflowResult.rows[0];

        // Create run record
        const runResult = await query(
            `INSERT INTO automation.workflow_runs (company_id, workflow_id, status, trigger_data)
       VALUES ($1, $2, 'running', $3)
       RETURNING *`,
            [workflow.company_id, id, JSON.stringify(trigger_data)]
        );

        const run = runResult.rows[0];

        // Trigger n8n if configured
        if (workflow.n8n_workflow_id && process.env.N8N_BASE_URL) {
            try {
                const n8nResponse = await fetch(
                    `${process.env.N8N_BASE_URL}/api/v1/workflows/${workflow.n8n_workflow_id}/run`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-N8N-API-KEY": process.env.N8N_API_KEY || "",
                        },
                        body: JSON.stringify({ triggerData: trigger_data }),
                    }
                );

                if (n8nResponse.ok) {
                    const n8nData = await n8nResponse.json();
                    await query(
                        `UPDATE automation.workflow_runs SET n8n_execution_id = $1 WHERE id = $2`,
                        [n8nData.executionId, run.id]
                    );
                }
            } catch (n8nError) {
                console.error("n8n trigger error:", n8nError);
            }
        }

        // Update workflow stats
        await query(
            `UPDATE automation.workflows SET total_runs = total_runs + 1, last_run_at = NOW() WHERE id = $1`,
            [id]
        );

        return NextResponse.json({ data: run, message: "Workflow triggered successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to trigger workflow" }, { status: 500 });
    }
}
