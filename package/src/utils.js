export const getParentByClassName = (element, className, findStopElement) => {
  // 如果没有指定停止元素，默认找到 document.body 为止
  findStopElement = findStopElement || document.body
  while (
    element &&
    (!element.classList || !element.classList.contains(className))
  ) {
    element = element.parentElement
    // 如果到达了停止元素，跳出循环
    if (element === findStopElement) {
      if (element.classList && element.classList.contains(className)) {
        return element
      }
      return null
    }
  }
  return element
}

// 生成随机字符串
export const generateRandomString = (length = 10) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters.charAt(randomIndex)
  }
  return randomString
}
