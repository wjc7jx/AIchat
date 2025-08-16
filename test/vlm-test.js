// VLM 功能测试脚本
import { buildVLMMessage } from '../src/utils/imageUtils.js'

// 模拟一个图片文件
const mockImageFile = {
  name: 'test.jpg',
  type: 'image/jpeg',
  size: 1024 * 1024 // 1MB
}

// 模拟 FileReader 的行为
global.FileReader = class FileReader {
  constructor() {
    this.onload = null
    this.onerror = null
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({
          target: {
            result: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8B'
          }
        })
      }
    }, 100)
  }
}

// 测试函数
async function testVLMMessage() {
  try {
    const textContent = "请描述这张图片"
    const imageFiles = [mockImageFile]
    const detail = "high"
    
    const message = await buildVLMMessage(textContent, imageFiles, detail)
    
    console.log('生成的VLM消息格式:')
    console.log(JSON.stringify(message, null, 2))
    
    // 验证格式是否正确
    if (message.role === 'user' && 
        Array.isArray(message.content) &&
        message.content.some(item => item.type === 'image_url') &&
        message.content.some(item => item.type === 'text')) {
      console.log('✅ VLM消息格式正确')
    } else {
      console.log('❌ VLM消息格式错误')
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 运行测试
testVLMMessage()
