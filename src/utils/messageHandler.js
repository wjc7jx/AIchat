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
     * @param {Object} options - 处理选项，这里传入处理消息和token使用量的回调函数。（使用对象提高可读性和可维护性）
        * @param {Function} options.updateMessage - 更新消息内容的回调
        * @param {Function} options.updateTokenCount - 更新token使用量的回调
     */
    async processStreamResponse(response, { updateMessage, updateTokenCount }) {
        try {
            let fullResponse = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            // 1.读取流数据
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log('流式响应完成');
                    break;
                }
                //2.解码数据块
                const chunk = decoder.decode(value);  //这里每一个chunk是一个可能包含多个数组
                //3.处理解码后的数据，先拆分为行（数组），再转换为json字符串，再转换为js对象，提取出对象中content内容，更新message、更新token使用量
                
                // 3.1 拆分为行
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                for (const line of lines) {
                    if (line.includes('data: ')) {
                // 3.2 转换为json字符串
                        const jsonStr = line.replace('data: ', '');
                        // 检查是否结束
                        if (jsonStr === '[DONE]') {
                            console.log('流式响应完成，读取完毕');
                            continue;
                        }
                // 3.3 转换为js对象
                        try {
                            const jsData = JSON.parse(jsonStr);
                            if (jsData.choices[0].delta.content) {
                                const content = jsData.choices[0].delta.content;
                //3.4 提取出对象中content内容，更新message
                                fullResponse += content;

                                updateMessage(fullResponse);
                            }

                // 3.5更新token使用量
                            if (jsData.usage) {
                                updateTokenCount(jsData.usage);
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
            return {
                content,
                usage: response.usage || null
            };
        } catch (error) {
            console.error('同步响应处理错误:', error);
            throw error;
        }
    }
}; 