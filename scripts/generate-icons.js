const iconGen = require('icon-gen');
const path = require('path');
const fs = require('fs');

// --- 配置区域 ---
// 1. 设置你的源图片路径 (相对于项目根目录)
const relativeInputPath = 'build/logo.svg'; 

// 2. 设置输出目录路径
const relativeOutputPath = 'build/icons';

// --- 路径处理 ---
const inputPath = path.resolve(__dirname, '..', relativeInputPath);
const outputPath = path.resolve(__dirname, '..', relativeOutputPath);

// --- 1. 检查源文件 ---
if (!fs.existsSync(inputPath)) {
    console.error(`❌ 错误：找不到源图片文件！`);
    console.error(`   期望路径: ${inputPath}`);
    process.exit(1);
}

// --- 2. 核心逻辑：清空/新建输出目录 ---
console.log(`🧹 正在处理输出目录: ${outputPath}`);

try {
    if (fs.existsSync(outputPath)) {
        // 如果存在，递归删除整个目录 (包括子文件)
        // recursive: true 允许删除非空目录
        fs.rmSync(outputPath, { recursive: true, force: true });
        console.log('   🗑️ 旧目录已删除');
    }
    
    // 重新创建目录
    // recursive: true 确保父目录（如 'build'）也会一并创建
    fs.mkdirSync(outputPath, { recursive: true });
    console.log('   🆕 新目录已创建');

} catch (err) {
    console.error('❌ 目录操作失败:', err);
    process.exit(1);
}

// --- 3. 生成图标 ---
console.log('🚀 正在生成图标...');

(async () => {
    try {
        await iconGen(inputPath, outputPath, {
            platforms: ['windows', 'macos', 'android', 'ios', 'favicon'],
            report: true
        });
        console.log('✅ 所有图标生成完毕！');
    } catch (error) {
        console.error('❌ 生成过程出错:', error);
    }
})();