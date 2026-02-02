/**
 * n8n Workflow Template Validator
 * Validates the structure and integrity of uploaded .json workflow files
 */

export interface N8nValidationResult {
    isValid: boolean;
    errors: string[];
    metadata?: {
        nodeCount: number;
        triggerNodes: string[];
        totalConnections: number;
    };
}

/**
 * Validates an n8n workflow JSON object
 */
export function validateN8nWorkflow(workflow: any): N8nValidationResult {
    const errors: string[] = [];

    // 1. Basic Structure Validation
    if (!workflow || typeof workflow !== 'object') {
        return { isValid: false, errors: ['Invalid JSON format'] };
    }

    if (!Array.isArray(workflow.nodes)) {
        errors.push('Missing "nodes" array');
    }

    if (workflow.connections && typeof workflow.connections !== 'object') {
        errors.push('Invalid "connections" object');
    }

    // If critical structural elements are missing, stop here
    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    // 2. Node Validation
    const nodeCount = workflow.nodes.length;
    if (nodeCount === 0) {
        errors.push('Workflow must contain at least one node');
    }

    const triggerNodes: string[] = [];
    const nodeNames = new Set<string>();

    workflow.nodes.forEach((node: any, index: number) => {
        if (!node.name) {
            errors.push(`Node at index ${index} is missing a name`);
        } else {
            if (nodeNames.has(node.name)) {
                errors.push(`Duplicate node name: ${node.name}`);
            }
            nodeNames.add(node.name);
        }

        if (!node.type) {
            errors.push(`Node at index ${index} (${node.name || 'unnamed'}) is missing a type`);
        }

        // Identify trigger nodes
        if (node.type.includes('Trigger') || node.type.includes('Webhook')) {
            triggerNodes.push(node.name || `unnamed-${index}`);
        }
    });

    // 3. Connection Validation (if connections exist)
    let totalConnections = 0;
    if (workflow.connections) {
        Object.keys(workflow.connections).forEach((sourceNodeName) => {
            if (!nodeNames.has(sourceNodeName)) {
                errors.push(`Connection references non-existent source node: ${sourceNodeName}`);
            }

            const sourceOutputs = workflow.connections[sourceNodeName];
            Object.keys(sourceOutputs).forEach((outputIndex) => {
                const connections = sourceOutputs[outputIndex];
                if (Array.isArray(connections)) {
                    totalConnections += connections.length;
                    connections.forEach((conn: any) => {
                        if (!nodeNames.has(conn.node)) {
                            errors.push(`Connection from ${sourceNodeName} references non-existent target node: ${conn.node}`);
                        }
                    });
                }
            });
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        metadata: {
            nodeCount,
            triggerNodes,
            totalConnections,
        },
    };
}

/**
 * Validates a stringified JSON workflow
 */
export function validateN8nWorkflowString(jsonString: string): N8nValidationResult {
    try {
        const workflow = JSON.parse(jsonString);
        return validateN8nWorkflow(workflow);
    } catch (error) {
        return {
            isValid: false,
            errors: [`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        };
    }
}
