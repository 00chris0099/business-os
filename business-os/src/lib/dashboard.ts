import { query } from './db';

export interface DashboardStats {
    totalClients: number;
    newLeads: number;
    totalRevenue: number;
    activeAgents: number;
    workflowRuns: number;
    openOpportunities: number;
    revenueGrowth: number;
    conversionRate: number;
}

export async function getDashboardStats(companyId: string): Promise<DashboardStats> {
    try {
        const [clients, leads, revenue, agents, workflows, opportunities] = await Promise.all([
            query(`SELECT COUNT(*) as count FROM crm.clients WHERE company_id = $1`, [companyId]),
            query(`SELECT COUNT(*) as count FROM crm.leads WHERE company_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`, [companyId]),
            query(`SELECT COALESCE(SUM(total), 0) as total FROM erp.invoices WHERE company_id = $1 AND status = 'paid'`, [companyId]),
            query(`SELECT COUNT(*) as count FROM ai.ai_agents WHERE company_id = $1 AND is_active = true`, [companyId]),
            query(`SELECT COUNT(*) as count FROM automation.workflow_runs WHERE company_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`, [companyId]),
            query(`SELECT COUNT(*) as count FROM crm.opportunities WHERE company_id = $1 AND stage NOT IN ('closed_won', 'closed_lost')`, [companyId]),
        ]);

        return {
            totalClients: parseInt(clients.rows[0]?.count || '0'),
            newLeads: parseInt(leads.rows[0]?.count || '0'),
            totalRevenue: parseFloat(revenue.rows[0]?.total || '0'),
            activeAgents: parseInt(agents.rows[0]?.count || '0'),
            workflowRuns: parseInt(workflows.rows[0]?.count || '0'),
            openOpportunities: parseInt(opportunities.rows[0]?.count || '0'),
            revenueGrowth: 12.5,
            conversionRate: 23.8,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalClients: 0,
            newLeads: 0,
            totalRevenue: 0,
            activeAgents: 0,
            workflowRuns: 0,
            openOpportunities: 0,
            revenueGrowth: 0,
            conversionRate: 0,
        };
    }
}

export async function getRevenueChartData(companyId: string) {
    try {
        const result = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(total) as revenue
      FROM erp.invoices 
      WHERE company_id = $1 AND status = 'paid'
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `, [companyId]);
        return result.rows;
    } catch {
        return [];
    }
}

export async function getLeadsFunnelData(companyId: string) {
    try {
        const result = await query(`
      SELECT status, COUNT(*) as count
      FROM crm.leads
      WHERE company_id = $1
      GROUP BY status
      ORDER BY count DESC
    `, [companyId]);
        return result.rows;
    } catch {
        return [];
    }
}
