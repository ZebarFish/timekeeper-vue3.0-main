/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {

    ecmaVersion: 'latest'
  },
  rules: {
    // 可能需要禁用 'vue/no-multiple-template-root' 规则  
    'vue/no-multiple-template-root': 'off',
    // ...  
  }
}
