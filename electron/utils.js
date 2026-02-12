/**
 * 通用接口返回模版
 * @param data {any} 数据
 * @param code {number} 状态码
 * @param message {string} 错误信息
 * @returns {{code: number, message: string, data: null}}
 */
function responseTemplate(data, code = 200, message = 'success') {
  return {
    data: data || null,
    code: code,
    message: message
  }
}


module.exports = {
  responseTemplate
}
