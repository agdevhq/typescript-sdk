import type {
    Agent,
    AgentRun,
    AgentRunEvent,
    ApiError,
    CreateAgentRequest,
    CreateAgentRunRequest,
    ListResponse,
    UpdateAgentRequest,
} from './types.js';

export class Client {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor(apiKey: string, baseUrl = 'https://api.ag.dev') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    private async request<T>(
        endpoint: string,
        options: {
            method?: string;
            body?: unknown;
            headers?: Record<string, string>;
        } = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const { method = 'GET', body, headers = {} } = options;

        const requestHeaders: Record<string, string> = {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
            ...headers,
        };

        const requestInit: RequestInit = {
            method,
            headers: requestHeaders,
        };

        if (
            body &&
            (method === 'POST' || method === 'PATCH' || method === 'PUT')
        ) {
            requestInit.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, requestInit);

            if (!response.ok) {
                let errorData: ApiError;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = {
                        error: 'HTTP_ERROR',
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        statusCode: response.status,
                    };
                }
                throw new Error(
                    `API Error: ${errorData.message || errorData.error}`
                );
            }

            // Handle empty responses
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return {} as T;
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Network error: ${String(error)}`);
        }
    }

    // Agent management methods

    /**
     * List all agents
     */
    async listAgents(): Promise<ListResponse<Agent>> {
        return this.request<ListResponse<Agent>>('/v0.1/agents/');
    }

    /**
     * Get a specific agent by ID
     */
    async getAgent(agentId: string): Promise<Agent> {
        return this.request<Agent>(`/v0.1/agents/${agentId}`);
    }

    /**
     * Create a new agent
     */
    async createAgent(agentData: CreateAgentRequest): Promise<Agent> {
        return this.request<Agent>('/v0.1/agents', {
            method: 'POST',
            body: agentData,
        });
    }

    /**
     * Update an existing agent
     */
    async updateAgent(
        agentId: string,
        updates: UpdateAgentRequest
    ): Promise<Agent> {
        return this.request<Agent>(`/v0.1/agents/${agentId}`, {
            method: 'PATCH',
            body: updates,
        });
    }

    /**
     * Delete an agent
     */
    async deleteAgent(agentId: string): Promise<void> {
        return this.request<void>(`/v0.1/agents/${agentId}`, {
            method: 'DELETE',
        });
    }

    // Agent run methods

    /**
     * Create a new agent run
     */
    async createAgentRun(
        agentId: string,
        input: CreateAgentRunRequest
    ): Promise<AgentRun> {
        return this.request<AgentRun>(`/v0.1/agents/${agentId}/runs`, {
            method: 'POST',
            body: input,
        });
    }

    /**
     * List all runs for a specific agent
     */
    async listAgentRuns(agentId: string): Promise<ListResponse<AgentRun>> {
        return this.request<ListResponse<AgentRun>>(
            `/v0.1/agents/${agentId}/runs/`
        );
    }

    /**
     * Get a specific agent run
     */
    async getAgentRun(agentId: string, runId: string): Promise<AgentRun> {
        return this.request<AgentRun>(`/v0.1/agents/${agentId}/runs/${runId}`);
    }

    /**
     * Get events for a specific agent run
     */
    async getAgentRunEvents(
        agentId: string,
        runId: string
    ): Promise<ListResponse<AgentRunEvent>> {
        return this.request<ListResponse<AgentRunEvent>>(
            `/v0.1/agents/${agentId}/runs/${runId}/events`
        );
    }

    /**
     * Wait for an agent run to complete
     */
    async waitForAgentRun(
        agentId: string,
        runId: string,
        options: {
            pollInterval?: number;
            timeout?: number;
        } = {}
    ): Promise<AgentRun> {
        const { pollInterval = 1000, timeout = 0 } = options;
        const startTime = Date.now();

        while (timeout === 0 || Date.now() - startTime < timeout) {
            const run = await this.getAgentRun(agentId, runId);

            if (run.status === 'done' || run.status === 'error') {
                return run;
            }

            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }

        throw new Error(
            `Agent run ${runId} did not complete within ${timeout}ms`
        );
    }
}
