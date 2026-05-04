export type JSONSchema = {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
    [key: string]: unknown;
};

export type AgentTool =
    | {
          source: 'builtin';
          type:
              | 'searchWeb'
              | 'searchNews'
              | 'browseWebsite'
              | 'codeInterpreter';
      }
    | {
          source: 'mcp';
          serverId: string;
          enabledTools: string[];
      };

export type ResultType = 'document' | 'json' | null;

export type NotificationTarget = {
    type: 'webhook' | 'email';
    target: string;
};

export type Agent = {
    id: string;
    organizationId: string;
    metadata: {
        name: string | null;
        description: string | null;
    };
    config: {
        /** Model stack ID - can be an alias (e.g., 'anthropic/default') or a concrete stack ID (e.g., 'anthropic/sonnet37-haiku35-20250722') */
        modelStackId: string;
        goalPrompt: string;
        inputSchema: JSONSchema;
        tools: AgentTool[];
        drives: Array<{ driveId: string }>;
        customPlanningInstructions: string | null;
        customToolCallInstructions: string | null;
        customResultInstructions: string | null;
        enableReplanning: boolean;
    } & (
        | {
              resultType: 'document';
              resultSchema: null;
          }
        | {
              resultType: 'json';
              resultSchema: JSONSchema;
          }
        | {
              resultType: null;
              resultSchema: null;
          }
    );
    /**
     * Notification targets are agent-scoped, not part of the revisioned
     * config. Editing them does not create a new revision; this matches the
     * operational reality of rotating webhooks/email recipients.
     */
    notificationTargets: NotificationTarget[];
    createdAt: string;
    latestRevisionId: string;
    latestRevisionCreatedAt: string;
    publishedRevisionId: string | null;
    lastPublishedAt: string | null;
};

export type CreateAgentRequest = {
    metadata?: Partial<Agent['metadata']>;
    config: Agent['config'];
    notificationTargets?: NotificationTarget[];
};

export type UpdateAgentRequest = {
    metadata?: Partial<Agent['metadata']>;
    config?: Partial<Agent['config']>;
    notificationTargets?: NotificationTarget[];
};

export type AgentListItem = Omit<Agent, 'config' | 'notificationTargets'>;

export type AgentRevision = {
    id: string;
    createdAt: string;
    isPublished: boolean;
    config: Agent['config'];
};

export type AgentRevisionListItem = {
    id: string;
    createdAt: string;
    isPublished: boolean;
};

type AgentPublicationState = Pick<
    Agent,
    'latestRevisionId' | 'publishedRevisionId'
>;

export function hasPublishedRevision(agent: AgentPublicationState): boolean {
    return agent.publishedRevisionId !== null;
}

export function hasUnpublishedRevisions(agent: AgentPublicationState): boolean {
    return agent.latestRevisionId !== agent.publishedRevisionId;
}

export type AgentRun = {
    id: string;
    agentId: string;
    status: 'pending' | 'running' | 'done' | 'error';
    input: Record<string, unknown>;
    resultType?: ResultType;
    resultData?: Record<string, unknown> | null;
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

export type PublishRevisionRequest = {
    revisionId?: string;
};

export type RevisionDiff = {
    from: Agent['config'];
    to: Agent['config'];
    diff: Record<string, { from: unknown; to: unknown }>;
};

export type PaginationMeta = {
    limit: number;
    offset: number;
    total: number;
};

export type ListResponse<T> = {
    data: T[];
    pagination: PaginationMeta;
};

export type ApiError = {
    error: string;
    message: string;
    statusCode: number;
};
