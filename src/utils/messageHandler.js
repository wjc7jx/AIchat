export const messageHandler = {
    formatMessage(role, content) {
        return {
            id: Date.now(),
            role,
            content,
            loading: false,
        };
    },

    /**
     * 处理流式响应
     * @param {Response} response - 响应对象
     * @param {Object} options - 处理选项
     * @param {Function} options.updateMessage - 更新消息内容的回调
     * @param {Function} options.updateTokenCount - 更新token使用量的回调
     */
    async processStreamResponse(response, { updateMessage, updateTokenCount }) {
        try {
            let fullResponse = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('流式响应完成');
                    break;
                }

                // 解码二进制数据
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    if (line.includes('data: ')) {
                        const jsonStr = line.replace('data: ', '');
                        
                        // 检查是否结束
                        if (jsonStr === '[DONE]') {
                            console.log('流式响应完成');
                            continue;
                        }

                        try {
                            const jsonData = JSON.parse(jsonStr);
                            // 处理消息内容
                            if (jsonData.choices[0].delta.content) {
                                const content = jsonData.choices[0].delta.content;
                                fullResponse += content;
                                updateMessage(fullResponse);
                            }

                            // 处理token使用量
                            if (jsonData.usage) {
                                updateTokenCount(jsonData.usage);
                            }
                        } catch (e) {
                            console.error('解析JSON失败:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('流处理错误:', error);
            throw error;
        }
    },

    async processSyncResponse(response, onUpdate) {
        try {
            if (!response || !response.choices) {
                throw new Error('无效的响应格式');
            }

            const content = response.choices[0]?.message?.content || '';
            onUpdate(content);

            // 处理token使用量
            if (response.usage) {
                return {
                    content,
                    usage: response.usage
                };
            }

            return { content };
        } catch (error) {
            console.error('同步响应处理错误:', error);
            throw error;
        }
    }
}; 