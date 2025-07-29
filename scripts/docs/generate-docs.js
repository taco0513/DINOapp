#!/usr/bin/env node

/**
 * DINO 코드 문서화 자동 생성 스크립트
 * TypeScript 코드에서 JSDoc 주석을 추출하여 마크다운 문서를 생성합니다.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 설정
const CONFIG = {
  // 스캔할 디렉토리들
  scanDirs: [
    'app',
    'components', 
    'lib',
    'types'
  ],
  // 제외할 패턴들
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '__tests__',
    '*.test.ts',
    '*.test.tsx',
    '*.spec.ts',
    '*.spec.tsx'
  ],
  // 출력 디렉토리
  outputDir: 'docs/code',
  // 지원하는 파일 확장자
  supportedExtensions: ['.ts', '.tsx', '.js', '.jsx']
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🔄 DINO 코드 문서화 생성 시작...\n')

  try {
    // 1. 출력 디렉토리 준비
    await prepareOutputDirectory()
    
    // 2. TypeScript 코드 스캔
    const files = await scanSourceFiles()
    console.log(`📁 발견된 파일: ${files.length}개\n`)
    
    // 3. 각 파일 분석 및 문서 생성
    const documentation = await analyzeFiles(files)
    
    // 4. 마크다운 문서 생성
    await generateMarkdownDocs(documentation)
    
    // 5. 인덱스 파일 생성
    await generateIndexFile(documentation)
    
    // 6. TypeDoc 생성 (가능한 경우)
    await generateTypeDoc()
    
    console.log('\n✅ 코드 문서화 생성 완료!')
    console.log(`📚 문서 위치: ${CONFIG.outputDir}/`)
    
  } catch (error) {
    console.error('❌ 문서 생성 실패:', error.message)
    process.exit(1)
  }
}

/**
 * 출력 디렉토리 준비
 */
async function prepareOutputDirectory() {
  console.log('📁 출력 디렉토리 준비...')
  
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true })
  }
  
  // 기존 자동 생성 파일들 정리
  const existingFiles = fs.readdirSync(CONFIG.outputDir)
  for (const file of existingFiles) {
    if (file.startsWith('auto-') || file === 'index.md') {
      fs.unlinkSync(path.join(CONFIG.outputDir, file))
    }
  }
}

/**
 * 소스 파일 스캔
 */
async function scanSourceFiles() {
  console.log('🔍 소스 파일 스캔...')
  
  const files = []
  
  for (const dir of CONFIG.scanDirs) {
    if (fs.existsSync(dir)) {
      const dirFiles = scanDirectory(dir)
      files.push(...dirFiles)
    }
  }
  
  return files.filter(file => {
    const ext = path.extname(file)
    return CONFIG.supportedExtensions.includes(ext) && 
           !CONFIG.excludePatterns.some(pattern => file.includes(pattern))
  })
}

/**
 * 디렉토리 재귀 스캔
 */
function scanDirectory(dir) {
  const files = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      files.push(...scanDirectory(fullPath))
    } else {
      files.push(fullPath)
    }
  }
  
  return files
}

/**
 * 파일들 분석
 */
async function analyzeFiles(files) {
  console.log('🔬 파일 분석 중...')
  
  const documentation = {
    components: [],
    hooks: [],
    utilities: [],
    types: [],
    apis: [],
    misc: []
  }
  
  for (const file of files) {
    console.log(`  📄 분석 중: ${file}`)
    
    try {
      const content = fs.readFileSync(file, 'utf8')
      const analysis = analyzeFile(file, content)
      
      if (analysis) {
        // 파일 타입에 따라 분류
        const category = categorizeFile(file, analysis)
        documentation[category].push(analysis)
      }
    } catch (error) {
      console.warn(`  ⚠️  ${file} 분석 실패: ${error.message}`)
    }
  }
  
  return documentation
}

/**
 * 개별 파일 분석
 */
function analyzeFile(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath)
  const fileName = path.basename(filePath)
  
  // JSDoc 주석 추출
  const jsdocComments = extractJSDocComments(content)
  
  // 함수/클래스/타입 추출
  const functions = extractFunctions(content)
  const classes = extractClasses(content)
  const types = extractTypes(content)
  const interfaces = extractInterfaces(content)
  const exports = extractExports(content)
  
  // 최상위 파일 설명 추출
  const fileDescription = extractFileDescription(content)
  
  return {
    file: relativePath,
    fileName,
    description: fileDescription,
    functions,
    classes,
    types,
    interfaces,
    exports,
    jsdocComments,
    size: content.length,
    lines: content.split('\n').length
  }
}

/**
 * JSDoc 주석 추출
 */
function extractJSDocComments(content) {
  const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g
  const comments = []
  let match
  
  while ((match = jsdocRegex.exec(content)) !== null) {
    const comment = match[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim()
    
    if (comment) {
      comments.push(comment)
    }
  }
  
  return comments
}

/**
 * 함수 추출
 */
function extractFunctions(content) {
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
  const functions = []
  let match
  
  while ((match = functionRegex.exec(content)) !== null) {
    const name = match[1] || match[2]
    if (name) {
      // 함수 위의 JSDoc 찾기
      const functionStart = match.index
      const beforeFunction = content.substring(0, functionStart)
      const jsdocMatch = beforeFunction.match(/\/\*\*([\s\S]*?)\*\/\s*$/)
      
      functions.push({
        name,
        documentation: jsdocMatch ? jsdocMatch[1].replace(/^\s*\*\s?/gm, '').trim() : null,
        isExported: match[0].includes('export'),
        isAsync: match[0].includes('async')
      })
    }
  }
  
  return functions
}

/**
 * 클래스 추출
 */
function extractClasses(content) {
  const classRegex = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?/g
  const classes = []
  let match
  
  while ((match = classRegex.exec(content)) !== null) {
    const name = match[1]
    
    // 클래스 위의 JSDoc 찾기
    const classStart = match.index
    const beforeClass = content.substring(0, classStart)
    const jsdocMatch = beforeClass.match(/\/\*\*([\s\S]*?)\*\/\s*$/)
    
    classes.push({
      name,
      documentation: jsdocMatch ? jsdocMatch[1].replace(/^\s*\*\s?/gm, '').trim() : null,
      isExported: match[0].includes('export')
    })
  }
  
  return classes
}

/**
 * 타입 추출
 */
function extractTypes(content) {
  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=/g
  const types = []
  let match
  
  while ((match = typeRegex.exec(content)) !== null) {
    const name = match[1]
    
    types.push({
      name,
      isExported: match[0].includes('export')
    })
  }
  
  return types
}

/**
 * 인터페이스 추출
 */
function extractInterfaces(content) {
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g
  const interfaces = []
  let match
  
  while ((match = interfaceRegex.exec(content)) !== null) {
    const name = match[1]
    
    // 인터페이스 위의 JSDoc 찾기
    const interfaceStart = match.index
    const beforeInterface = content.substring(0, interfaceStart)
    const jsdocMatch = beforeInterface.match(/\/\*\*([\s\S]*?)\*\/\s*$/)
    
    interfaces.push({
      name,
      documentation: jsdocMatch ? jsdocMatch[1].replace(/^\s*\*\s?/gm, '').trim() : null,
      isExported: match[0].includes('export')
    })
  }
  
  return interfaces
}

/**
 * 익스포트 추출
 */
function extractExports(content) {
  const exportRegex = /export\s+(?:default\s+)?(?:const\s+|let\s+|var\s+|function\s+|class\s+|interface\s+|type\s+)?(\w+)/g
  const exports = []
  let match
  
  while ((match = exportRegex.exec(content)) !== null) {
    const name = match[1]
    if (name && !exports.includes(name)) {
      exports.push(name)
    }
  }
  
  return exports
}

/**
 * 파일 설명 추출
 */
function extractFileDescription(content) {
  // 파일 최상단 주석 찾기
  const topCommentRegex = /^(?:\s*\/\*\*([\s\S]*?)\*\/|\/\/\s*(.*?)(?:\n|$))/
  const match = content.match(topCommentRegex)
  
  if (match) {
    return match[1] 
      ? match[1].replace(/^\s*\*\s?/gm, '').trim()
      : match[2].trim()
  }
  
  return null
}

/**
 * 파일 분류
 */
function categorizeFile(filePath, analysis) {
  const path_lower = filePath.toLowerCase()
  
  if (path_lower.includes('component') || path_lower.includes('/components/')) {
    return 'components'
  }
  if (path_lower.includes('hook') || path_lower.includes('/hooks/')) {
    return 'hooks'
  }
  if (path_lower.includes('/api/') || path_lower.includes('api.ts')) {
    return 'apis'
  }
  if (path_lower.includes('/types/') || path_lower.includes('types.ts')) {
    return 'types'
  }
  if (path_lower.includes('/lib/') || path_lower.includes('/utils/')) {
    return 'utilities'
  }
  
  return 'misc'
}

/**
 * 마크다운 문서 생성
 */
async function generateMarkdownDocs(documentation) {
  console.log('📝 마크다운 문서 생성...')
  
  for (const [category, items] of Object.entries(documentation)) {
    if (items.length > 0) {
      const markdown = generateCategoryMarkdown(category, items)
      const filename = `auto-${category}.md`
      
      fs.writeFileSync(
        path.join(CONFIG.outputDir, filename), 
        markdown, 
        'utf8'
      )
      
      console.log(`  ✅ ${filename} 생성 완료 (${items.length}개 항목)`)
    }
  }
}

/**
 * 카테고리별 마크다운 생성
 */
function generateCategoryMarkdown(category, items) {
  const categoryTitles = {
    components: '🧩 Components',
    hooks: '🎣 Custom Hooks',
    utilities: '🛠️ Utilities',
    types: '📋 Types & Interfaces',
    apis: '🌐 API Endpoints',
    misc: '📦 Miscellaneous'
  }
  
  let markdown = `# ${categoryTitles[category] || category}\n\n`
  markdown += `> 🤖 이 문서는 자동으로 생성되었습니다. 수정 시 다음 생성에서 덮어쓰여집니다.\n\n`
  
  // 목차 생성
  markdown += `## 📚 목차\n\n`
  for (const item of items) {
    markdown += `- [${item.fileName}](#${item.fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`
  }
  markdown += '\n'
  
  // 각 파일별 문서 생성
  for (const item of items) {
    markdown += generateFileMarkdown(item)
  }
  
  markdown += `\n---\n\n`
  markdown += `*📅 생성일: ${new Date().toLocaleString('ko-KR')}*\n`
  markdown += `*📊 총 ${items.length}개 파일 문서화*\n`
  
  return markdown
}

/**
 * 개별 파일 마크다운 생성
 */
function generateFileMarkdown(item) {
  let markdown = `\n## ${item.fileName}\n\n`
  markdown += `**파일 경로:** \`${item.file}\`\n\n`
  
  if (item.description) {
    markdown += `**설명:** ${item.description}\n\n`
  }
  
  // 통계 정보
  markdown += `**파일 정보:**\n`
  markdown += `- 📏 크기: ${item.size} bytes\n`
  markdown += `- 📄 라인 수: ${item.lines}\n`
  markdown += `- 🔧 함수: ${item.functions.length}개\n`
  markdown += `- 📦 클래스: ${item.classes.length}개\n`
  markdown += `- 🏷️ 타입: ${item.types.length}개\n`
  markdown += `- 🔗 인터페이스: ${item.interfaces.length}개\n\n`
  
  // 익스포트 목록
  if (item.exports.length > 0) {
    markdown += `**Exports:**\n`
    for (const exp of item.exports) {
      markdown += `- \`${exp}\`\n`
    }
    markdown += '\n'
  }
  
  // 함수 목록
  if (item.functions.length > 0) {
    markdown += `### 🔧 Functions\n\n`
    for (const func of item.functions) {
      markdown += `#### \`${func.name}\`\n\n`
      if (func.documentation) {
        markdown += `${func.documentation}\n\n`
      }
      
      const badges = []
      if (func.isExported) badges.push('exported')
      if (func.isAsync) badges.push('async')
      
      if (badges.length > 0) {
        markdown += `**특성:** ${badges.map(b => `\`${b}\``).join(', ')}\n\n`
      }
    }
  }
  
  // 클래스 목록
  if (item.classes.length > 0) {
    markdown += `### 📦 Classes\n\n`
    for (const cls of item.classes) {
      markdown += `#### \`${cls.name}\`\n\n`
      if (cls.documentation) {
        markdown += `${cls.documentation}\n\n`
      }
      if (cls.isExported) {
        markdown += `**특성:** \`exported\`\n\n`
      }
    }
  }
  
  // 인터페이스 목록
  if (item.interfaces.length > 0) {
    markdown += `### 🔗 Interfaces\n\n`
    for (const iface of item.interfaces) {
      markdown += `#### \`${iface.name}\`\n\n`
      if (iface.documentation) {
        markdown += `${iface.documentation}\n\n`
      }
      if (iface.isExported) {
        markdown += `**특성:** \`exported\`\n\n`
      }
    }
  }
  
  // 타입 목록
  if (item.types.length > 0) {
    markdown += `### 🏷️ Types\n\n`
    for (const type of item.types) {
      markdown += `- \`${type.name}\`${type.isExported ? ' (exported)' : ''}\n`
    }
    markdown += '\n'
  }
  
  return markdown
}

/**
 * 인덱스 파일 생성
 */
async function generateIndexFile(documentation) {
  console.log('📋 인덱스 파일 생성...')
  
  let markdown = `# 📚 DINO 코드 문서화\n\n`
  markdown += `> 🤖 이 문서는 자동으로 생성되었습니다.\n\n`
  
  // 통계 요약
  const totalFiles = Object.values(documentation).reduce((sum, items) => sum + items.length, 0)
  const totalFunctions = Object.values(documentation).reduce(
    (sum, items) => sum + items.reduce((subSum, item) => subSum + item.functions.length, 0), 0
  )
  const totalClasses = Object.values(documentation).reduce(
    (sum, items) => sum + items.reduce((subSum, item) => subSum + item.classes.length, 0), 0
  )
  
  markdown += `## 📊 문서화 통계\n\n`
  markdown += `- 📁 총 파일: ${totalFiles}개\n`
  markdown += `- 🔧 총 함수: ${totalFunctions}개\n`
  markdown += `- 📦 총 클래스: ${totalClasses}개\n`
  markdown += `- 📅 생성일: ${new Date().toLocaleString('ko-KR')}\n\n`
  
  // 카테고리별 목록
  markdown += `## 📂 카테고리별 문서\n\n`
  
  const categoryTitles = {
    components: '🧩 Components',
    hooks: '🎣 Custom Hooks', 
    utilities: '🛠️ Utilities',
    types: '📋 Types & Interfaces',
    apis: '🌐 API Endpoints',
    misc: '📦 Miscellaneous'
  }
  
  for (const [category, items] of Object.entries(documentation)) {
    if (items.length > 0) {
      const title = categoryTitles[category] || category
      markdown += `### [${title}](./auto-${category}.md)\n\n`
      markdown += `${items.length}개 파일 문서화\n\n`
      
      // 주요 파일들 나열
      const topFiles = items.slice(0, 5)
      for (const item of topFiles) {
        markdown += `- [\`${item.fileName}\`](./auto-${category}.md#${item.fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')})\n`
      }
      if (items.length > 5) {
        markdown += `- ... 및 ${items.length - 5}개 추가 파일\n`
      }
      markdown += '\n'
    }
  }
  
  // 빠른 탐색
  markdown += `## 🔍 빠른 탐색\n\n`
  markdown += `### 주요 컴포넌트\n\n`
  
  const components = documentation.components || []
  const mainComponents = components.filter(c => 
    c.functions.length > 0 || c.classes.length > 0
  ).slice(0, 10)
  
  for (const comp of mainComponents) {
    markdown += `- [\`${comp.fileName}\`](./auto-components.md#${comp.fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}) - ${comp.functions.length + comp.classes.length}개 정의\n`
  }
  
  if (mainComponents.length === 0) {
    markdown += `*주요 컴포넌트가 아직 문서화되지 않았습니다.*\n`
  }
  
  markdown += `\n### 유틸리티 함수\n\n`
  
  const utilities = documentation.utilities || []
  const mainUtilities = utilities.filter(u => u.functions.length > 0).slice(0, 10)
  
  for (const util of mainUtilities) {
    markdown += `- [\`${util.fileName}\`](./auto-utilities.md#${util.fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}) - ${util.functions.length}개 함수\n`
  }
  
  if (mainUtilities.length === 0) {
    markdown += `*유틸리티 함수가 아직 문서화되지 않았습니다.*\n`
  }
  
  markdown += `\n---\n\n`
  markdown += `## 🛠️ 문서 생성 정보\n\n`
  markdown += `이 문서는 \`scripts/docs/generate-docs.js\` 스크립트에 의해 자동 생성됩니다.\n\n`
  markdown += `**재생성 명령:**\n\`\`\`bash\nnpm run docs:generate\n\`\`\`\n\n`
  markdown += `**스캔 디렉토리:** ${CONFIG.scanDirs.join(', ')}\n\n`
  markdown += `**지원 확장자:** ${CONFIG.supportedExtensions.join(', ')}\n`
  
  fs.writeFileSync(path.join(CONFIG.outputDir, 'index.md'), markdown, 'utf8')
  console.log('  ✅ index.md 생성 완료')
}

/**
 * TypeDoc 생성 시도
 */
async function generateTypeDoc() {
  console.log('📖 TypeDoc 생성 시도...')
  
  try {
    // TypeDoc가 설치되어 있는지 확인
    execSync('npx typedoc --version', { stdio: 'ignore' })
    
    // TypeDoc 설정 생성
    const typedocConfig = {
      entryPoints: ['./lib', './types', './components'],
      out: `${CONFIG.outputDir}/typedoc`,
      theme: 'default',
      readme: 'README.md',
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/node_modules/**'
      ],
      excludePrivate: true,
      excludeProtected: false,
      excludeInternal: true,
      categorizeByGroup: true,
      categoryOrder: [
        'Components',
        'Hooks',
        'Utilities',
        'Types',
        'API',
        '*'
      ]
    }
    
    fs.writeFileSync(
      'typedoc.json', 
      JSON.stringify(typedocConfig, null, 2), 
      'utf8'
    )
    
    // TypeDoc 실행
    execSync('npx typedoc --options typedoc.json', { stdio: 'inherit' })
    console.log('  ✅ TypeDoc 생성 완료')
    
  } catch (error) {
    console.log('  ℹ️  TypeDoc 생성 건너뜀 (설치되지 않음)')
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = {
  main,
  CONFIG
}