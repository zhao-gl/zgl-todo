import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 解除 any 类型限制的相关规则
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型
      '@typescript-eslint/no-unused-vars': 'off', // 暂时关闭未使用变量检查
      // 允许 useEffect 依赖数组为空
      'react-hooks/exhaustive-deps': 'off', // 关闭依赖检查，允许空数组
    },
  },
)
