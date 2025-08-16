/**
 * 图片处理工具函数
 * 用于VLM（视觉语言模型）的图片上传和处理
 */

/**
 * 将图片文件转换为base64格式
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 返回base64编码的字符串
 */
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target.result
      // 提取base64部分（去掉data:image/xxx;base64,前缀）
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    
    reader.onerror = () => {
      reject(new Error('图片读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 将图片文件转换为WebP格式的base64
 * 这是API文档中推荐的格式
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 返回WebP格式的base64编码
 */
export const convertImageToWebPBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    img.onload = () => {
      // 设置canvas尺寸
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制图片到canvas
      ctx.drawImage(img, 0, 0)
      
      // 转换为WebP格式的base64
      const webpDataUrl = canvas.toDataURL('image/webp', 0.8)
      const base64 = webpDataUrl.split(',')[1]
      resolve(base64)
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    // 创建图片URL
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 验证文件是否为支持的图片格式
 * @param {File} file - 文件对象
 * @returns {boolean} - 是否为支持的图片格式
 */
export const isValidImageFormat = (file) => {
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return supportedFormats.includes(file.type)
}

/**
 * 检查图片文件大小是否合适
 * @param {File} file - 图片文件
 * @param {number} maxSizeMB - 最大文件大小（MB）
 * @returns {boolean} - 文件大小是否合适
 */
export const checkImageSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * 构建VLM API所需的消息格式
 * @param {string} textContent - 文本内容
 * @param {Array<File>} imageFiles - 图片文件数组
 * @param {string} detail - 图片细节参数 ('low', 'high', 'auto')
 * @returns {Promise<Object>} - 构建好的消息对象
 */
export const buildVLMMessage = async (textContent, imageFiles = [], detail = 'high') => {
  const content = []
  
  // 添加图片内容（建议放在文本前面，特别是InternVL系列模型）
  for (const file of imageFiles) {
    if (!isValidImageFormat(file)) {
      throw new Error(`不支持的图片格式: ${file.type}`)
    }
    
    if (!checkImageSize(file)) {
      throw new Error(`图片文件过大: ${file.name}`)
    }
    
    try {
      const base64 = await convertImageToBase64(file)
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:${file.type};base64,${base64}`,
          detail: detail
        }
      })
    } catch (error) {
      throw new Error(`图片处理失败: ${file.name} - ${error.message}`)
    }
  }
  
  // 添加文本内容（建议放在图片后面）
  if (textContent && textContent.trim()) {
    content.push({
      type: 'text',
      text: textContent
    })
  }
  
  return {
    role: 'user',
    content: content
  }
}

/**
 * 获取图片的预览URL
 * @param {File} file - 图片文件
 * @returns {string} - 预览URL
 */
export const getImagePreviewUrl = (file) => {
  return URL.createObjectURL(file)
}

/**
 * 释放图片预览URL的内存
 * @param {string} url - 预览URL
 */
export const revokeImagePreviewUrl = (url) => {
  URL.revokeObjectURL(url)
}
