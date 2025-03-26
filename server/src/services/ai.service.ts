import { CoreMessage, CoreSystemMessage, generateObject, generateText, streamObject, streamText } from 'ai';
import { AIConfig } from '../constants/ai.const';
import { AIServiceProviderInterface, ObjectMethodConfig, TextMethodConfig } from '../types/ai.types';
import { AILogger } from '../loggers/ai.logger';

class AIServiceProvider implements AIServiceProviderInterface {
    async generateText(
        prompt: string,
        { saveOutputToFile, systemMessages }: TextMethodConfig = {
            systemMessages: [],
            saveOutputToFile: false,
        }
    ) {
        try {
            const start = new Date().getTime();
            const configMessages = (AIConfig.generateText.messages ?? []) as CoreMessage[];
            const userMessage: CoreMessage = { role: 'user', content: prompt };
            const messages: CoreMessage[] = systemMessages
                ? [...configMessages, ...systemMessages, userMessage]
                : [...configMessages, userMessage];

            const { text, finishReason } = await generateText({
                ...AIConfig.generateText,
                messages,
            });

            const end = new Date().getTime();

            if (saveOutputToFile) {
                AILogger.saveTextMethodOutputToFile('generateText', {
                    responseText: text,
                    messages,
                    prompt,
                    finishReason,
                    execution: { start, end },
                });
            }

            return text;
        } catch (error) {
            console.log('Error Trying To Generate Text From AI Model', error);
            throw error;
        }
    }

    async streamText(
        prompt: string,
        { saveOutputToFile, systemMessages }: TextMethodConfig = {
            systemMessages: [],
            saveOutputToFile: false,
        }
    ) {
        try {
            const start = new Date().getTime();

            const configMessages = (AIConfig.generateText.messages ?? []) as CoreMessage[];
            const userMessage: CoreMessage = { role: 'user', content: prompt };
            const messages: CoreMessage[] = systemMessages
                ? [...configMessages, ...systemMessages, userMessage]
                : [...configMessages, userMessage];

            const { text, finishReason } = streamText({
                ...AIConfig.generateText,
                messages,
            });

            if (saveOutputToFile) {
                const end = new Date().getTime();
                AILogger.saveTextMethodOutputToFile('streamText', {
                    responseText: await text,
                    messages,
                    prompt,
                    finishReason: await finishReason,
                    execution: { start, end },
                });
            }

            return await text;
        } catch (error) {
            console.log('Error Trying Streaming Text From AI Model', error);
            throw error;
        }
    }

    async generateObject<T>(
        prompt: string,
        { schema, schemaName, schemaDescription, saveOutputToFile = false, systemMessages = [] }: ObjectMethodConfig<T>
    ) {
        try {
            const start = new Date().getTime();
            const configMessages = (AIConfig.generateObject.messages ?? []) as CoreMessage[];
            const userMessage: CoreMessage = { role: 'user', content: prompt };

            const messages: CoreMessage[] = [...configMessages, ...systemMessages, userMessage];

            const { object, finishReason } = await generateObject({
                ...AIConfig.generateObject,
                schema,
                schemaName,
                schemaDescription: schemaDescription ?? schema._def.description,
                messages,
            });

            const end = new Date().getTime();

            if (saveOutputToFile) {
                AILogger.saveObjectMethodOutputToFile('generateObject', {
                    messages,
                    schema,
                    prompt,
                    object,
                    finishReason,
                    execution: { start, end },
                });
            }

            return object;
        } catch (error) {
            console.log('Error Trying To Generate Text From AI Model', error);
            throw error;
        }
    }

    async streamObject<T>(
        prompt: string,
        { schema, schemaName, schemaDescription, saveOutputToFile = false }: ObjectMethodConfig<T>,
        systemMessages: CoreSystemMessage[] = []
    ) {
        try {
            const start = new Date().getTime();

            const configMessages = (AIConfig.generateObject.messages ?? []) as CoreMessage[];
            const userMessage: CoreMessage = { role: 'user', content: prompt };

            const messages: CoreMessage[] = [...configMessages, ...systemMessages, userMessage];

            const { object } = streamObject({
                ...AIConfig.streamObject,
                schema,
                schemaName: schemaName ?? schema._def.description,
                schemaDescription: schemaDescription ?? schema._def.description,
                messages,
            });

            if (saveOutputToFile) {
                const end = new Date().getTime();
                AILogger.saveObjectMethodOutputToFile('streamObject', {
                    messages,
                    prompt,
                    schema,
                    object: await object,
                    execution: { start, end },
                });
            }

            return await object;
        } catch (error) {
            console.log('Error Trying To Generate Text From AI Model', error);
            throw error;
        }
    }

    static create() {
        return new AIServiceProvider();
    }
}

export const AIService = AIServiceProvider.create();
