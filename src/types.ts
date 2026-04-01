export type JSONSchema = {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
    [key: string]: unknown;
};

export type AgentTool = {
    source: string;
    serverId: string;
    enabledTools: string[];
};

export type CreateAgentRequest = {
    /** Model stack ID - can be an alias (e.g., 'anthropic/default') or a concrete stack ID (e.g., 'anthropic/sonnet37-haiku35-20250722') */
    modelStackId: string;
    goalPrompt: string;
    inputSchema: JSONSchema;
    tools: AgentTool[];
    resultType: string;
    customPlanningInstructions?: string;
};

export type UpdateAgentRequest = {
    /** Model stack ID - can be an alias (e.g., 'anthropic/default') or a concrete stack ID (e.g., 'anthropic/sonnet37-haiku35-20250722') */
    modelStackId?: string;
    goalPrompt?: string;
    inputSchema?: JSONSchema;
    tools?: AgentTool[];
    resultType?: string;
    customPlanningInstructions?: string;
};

export type Agent = {
    id: string;
    modelStackId: string;
    goalPrompt: string;
    inputSchema: JSONSchema;
    tools: AgentTool[];
    resultType: string;
    customPlanningInstructions?: string;
    createdAt: string;
    updatedAt: string;
};

export type AgentRun = {
    id: string;
    agentId: string;
    status: 'pending' | 'running' | 'done' | 'error';
    input: Record<string, unknown>;
    resultData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
};

type BaseAgentRunEvent = {
    id: string;
    runId: string;
    startedAt: string;
    finishedAt: string | null;
};

export type AgentRunPlanningEvent = BaseAgentRunEvent & {
    type: 'planning';
    data: {
        content: string;
    };
};

export type AgentRunNarrationEvent = BaseAgentRunEvent & {
    type: 'narration';
    data: {
        content: string;
    };
};

export type AgentRunReasoningEvent = BaseAgentRunEvent & {
    type: 'reasoning';
    data: {
        content: string;
    };
};

export type AgentRunToolCallEvent = BaseAgentRunEvent & {
    type: 'tool_call';
    data: {
        id: string;
        name: string;
        input: Record<string, unknown>;
        output?: Record<string, unknown>;
    };
};

export type AgentRunContextCompressionEvent = BaseAgentRunEvent & {
    type: 'context_compression';
    data: Record<string, unknown>;
};

export type AgentRunEvent =
    | AgentRunPlanningEvent
    | AgentRunNarrationEvent
    | AgentRunReasoningEvent
    | AgentRunToolCallEvent
    | AgentRunContextCompressionEvent;

export type CreateAgentRunRequest = Record<string, unknown>;

export type ListResponse<T> = {
    items: T[];
    total: number;
    page?: number;
    pageSize?: number;
};

export type ApiError = {
    error: string;
    message: string;
    statusCode: number;
};
