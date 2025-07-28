# 디자인 시스템 자동화

## 개요

디자인 시스템의 생성, 유지보수, 업데이트를 자동화하여 일관성을 보장하고 개발 효율성을 극대화합니다. CI/CD 파이프라인과 통합하여 디자인 토큰 변경부터 컴포넌트 배포까지 전체 프로세스를 자동화합니다.

## 자동화 아키텍처

### 디자인 시스템 자동화 파이프라인

```yaml
# .github/workflows/design-system.yml
name: Design System Pipeline

on:
  push:
    paths:
      - 'design-tokens/**'
      - 'components/**'
      - 'packages/design-system/**'
  pull_request:
    paths:
      - 'design-tokens/**' 
      - 'components/**'
      - 'packages/design-system/**'

jobs:
  # 1. 토큰 변경 감지 및 검증
  validate-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate design tokens
        run: |
          npm run tokens:validate
          npm run tokens:lint
      
      - name: Check token schema
        run: npm run tokens:schema-check
      
      - name: Generate token diff
        run: |
          npm run tokens:diff
          echo "Token changes detected"
  
  # 2. 크로스 플랫폼 토큰 생성
  generate-tokens:
    needs: validate-tokens
    runs-on: ubuntu-latest
    strategy:
      matrix:
        platform: [web, ios, android, flutter]
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate tokens for ${{ matrix.platform }}
        run: npm run tokens:build:${{ matrix.platform }}
      
      - name: Upload tokens artifacts
        uses: actions/upload-artifact@v3
        with:
          name: tokens-${{ matrix.platform }}
          path: dist/${{ matrix.platform }}/
  
  # 3. 컴포넌트 빌드 및 테스트
  build-components:
    needs: generate-tokens
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download token artifacts
        uses: actions/download-artifact@v3
        with:
          name: tokens-web
          path: dist/web/
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build components
        run: npm run build:components
      
      - name: Run component tests
        run: npm run test:components
      
      - name: Run visual regression tests
        run: npm run test:visual
      
      - name: Generate component documentation
        run: npm run docs:generate
  
  # 4. Storybook 배포
  deploy-storybook:
    needs: build-components
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build Storybook
        run: npm run storybook:build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
  
  # 5. NPM 패키지 배포
  publish-package:
    needs: [build-components, deploy-storybook]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build package
        run: npm run build:package
      
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ steps.package-version.outputs.version }}
          release_name: Design System v${{ steps.package-version.outputs.version }}
          draft: false
          prerelease: false
```

### 토큰 자동 생성 시스템

```javascript
// scripts/build-tokens.js - 자동화된 토큰 빌드 시스템
const StyleDictionary = require('style-dictionary');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');

class DesignTokenBuilder {
  constructor(config) {
    this.config = config;
    this.setupTransforms();
    this.setupFormats();
  }
  
  setupTransforms() {
    // 색상 변환
    StyleDictionary.registerTransform({
      name: 'color/css-var',
      type: 'value',
      matcher: (token) => token.type === 'color',
      transformer: (token) => `var(--${token.name})`
    });
    
    // 간격 변환
    StyleDictionary.registerTransform({
      name: 'size/px',
      type: 'value',
      matcher: (token) => token.type === 'dimension',
      transformer: (token) => {
        if (typeof token.original.value === 'number') {
          return `${token.original.value}px`;
        }
        return token.original.value;
      }
    });
    
    // iOS 색상 변환
    StyleDictionary.registerTransform({
      name: 'color/ios-swift',
      type: 'value',
      matcher: (token) => token.type === 'color',
      transformer: (token) => {
        const hex = token.value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        return `Color(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)})`;
      }
    });
  }
  
  setupFormats() {
    // CSS 사용자 정의 속성
    StyleDictionary.registerFormat({
      name: 'css/custom-properties',
      formatter: function(dictionary, config) {
        const tokens = dictionary.allTokens
          .map(token => `  --${token.name}: ${token.value};`)
          .join('\n');
        
        return `:root {\n${tokens}\n}\n\n/* Dark theme overrides */\n[data-theme="dark"] {\n  /* Add dark theme tokens here */\n}`;
      }
    });
    
    // TypeScript 인터페이스
    StyleDictionary.registerFormat({
      name: 'typescript/interfaces',
      formatter: function(dictionary, config) {
        const tokenTypes = [...new Set(dictionary.allTokens.map(t => t.type))];
        
        const interfaces = tokenTypes.map(type => {
          const tokens = dictionary.allTokens.filter(t => t.type === type);
          const properties = tokens.map(t => `  ${t.name}: string;`).join('\n');
          
          return `export interface ${type.charAt(0).toUpperCase() + type.slice(1)}Tokens {\n${properties}\n}`;
        }).join('\n\n');
        
        const allTokens = dictionary.allTokens
          .map(t => `  ${t.name}: '${t.value}'`)
          .join(',\n');
        
        return `${interfaces}\n\nexport const tokens = {\n${allTokens}\n} as const;\n\nexport type TokenName = keyof typeof tokens;`;
      }
    });
    
    // React 테마 provider
    StyleDictionary.registerFormat({
      name: 'react/theme-provider',
      formatter: function(dictionary, config) {
        const tokens = dictionary.allTokens
          .map(token => `  ${token.name}: '${token.value}'`)
          .join(',\n');
        
        return `import React, { createContext, useContext } from 'react';

export const theme = {
${tokens}
};

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={theme}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};`;
      }
    });
  }
  
  async buildAllPlatforms() {
    const platforms = ['web', 'ios', 'android', 'react-native'];
    
    for (const platform of platforms) {
      console.log(`Building tokens for ${platform}...`);
      await this.buildPlatform(platform);
    }
    
    console.log('✅ All platforms built successfully');
  }
  
  async buildPlatform(platform) {
    const config = {
      source: ['design-tokens/**/*.json'],
      platforms: {
        [platform]: this.getPlatformConfig(platform)
      }
    };
    
    const styleDictionary = StyleDictionary.extend(config);
    return styleDictionary.buildPlatform(platform);
  }
  
  getPlatformConfig(platform) {
    const configs = {
      web: {
        transformGroup: 'web',
        buildPath: 'dist/web/',
        files: [
          {
            destination: 'tokens.css',
            format: 'css/custom-properties'
          },
          {
            destination: 'tokens.js',
            format: 'javascript/module'
          },
          {
            destination: 'tokens.d.ts',
            format: 'typescript/interfaces'
          }
        ]
      },
      
      react: {
        transformGroup: 'js',
        buildPath: 'dist/react/',
        files: [
          {
            destination: 'theme.ts',
            format: 'react/theme-provider'
          }
        ]
      },
      
      ios: {
        transformGroup: 'ios',
        buildPath: 'dist/ios/',
        files: [
          {
            destination: 'DesignTokens.swift',
            format: 'ios/swift/class'
          }
        ]
      },
      
      android: {
        transformGroup: 'android',
        buildPath: 'dist/android/res/values/',
        files: [
          {
            destination: 'colors.xml',
            format: 'android/xml',
            filter: token => token.type === 'color'
          },
          {
            destination: 'dimens.xml',
            format: 'android/xml',
            filter: token => token.type === 'dimension'
          }
        ]
      }
    };
    
    return configs[platform];
  }
  
  // 파일 감시 및 자동 재빌드
  watch() {
    console.log('👀 Watching for token changes...');
    
    const watcher = chokidar.watch('design-tokens/**/*.json', {
      ignored: /node_modules/,
      persistent: true
    });
    
    watcher.on('change', async (path) => {
      console.log(`📝 Token file changed: ${path}`);
      try {
        await this.buildAllPlatforms();
        console.log('🔄 Tokens rebuilt successfully');
      } catch (error) {
        console.error('❌ Build failed:', error);
      }
    });
  }
}

// CLI 인터페이스
if (require.main === module) {
  const builder = new DesignTokenBuilder();
  const command = process.argv[2];
  
  switch (command) {
    case 'build':
      builder.buildAllPlatforms();
      break;
    case 'watch':
      builder.watch();
      break;
    case 'build-platform':
      const platform = process.argv[3];
      if (platform) {
        builder.buildPlatform(platform);
      } else {
        console.error('Please specify a platform: web, ios, android, react-native');
      }
      break;
    default:
      console.log('Usage: node build-tokens.js [build|watch|build-platform <platform>]');
  }
}

module.exports = DesignTokenBuilder;
```

## 컴포넌트 자동 생성

### AI 기반 컴포넌트 스캐폴딩

```javascript
// scripts/generate-component.js - AI 기반 컴포넌트 자동 생성
const fs = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');

class ComponentGenerator {
  constructor() {
    this.setupTemplates();
  }
  
  setupTemplates() {
    // React 컴포넌트 템플릿
    this.templates = {
      react: {
        component: `
import React from 'react';
import { tokens } from '../tokens';
import './{{componentName}}.css';

export interface {{componentName}}Props {
  variant?: {{#each variants}}'{{this}}'{{#unless @last}} | {{/unless}}{{/each}};
  size?: {{#each sizes}}'{{this}}'{{#unless @last}} | {{/unless}}{{/each}};
  children?: React.ReactNode;
  className?: string;
  {{#each props}}
  {{name}}?: {{type}};
  {{/each}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  variant = '{{defaultVariant}}',
  size = '{{defaultSize}}',
  children,
  className = '',
  {{#each props}}
  {{name}},
  {{/each}}
  ...props
}) => {
  const baseClasses = '{{baseClasses}}';
  const variantClasses = {
    {{#each variants}}
    {{this}}: '{{this}}-variant',
    {{/each}}
  };
  const sizeClasses = {
    {{#each sizes}}
    {{this}}: '{{this}}-size',
    {{/each}}
  };
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <{{element}} className={combinedClasses} {...props}>
      {children}
    </{{element}}>
  );
};

export default {{componentName}};
        `,
        
        styles: `
.{{cssClass}} {
  /* Base styles */
  {{#each baseStyles}}
  {{property}}: {{value}};
  {{/each}}
}

{{#each variants}}
.{{../cssClass}}.{{this}}-variant {
  /* {{this}} variant styles */
  {{#each styles}}
  {{property}}: {{value}};
  {{/each}}
}
{{/each}}

{{#each sizes}}
.{{../cssClass}}.{{this}}-size {
  /* {{this}} size styles */
  {{#each styles}}
  {{property}}: {{value}};
  {{/each}}
}
{{/each}}
        `,
        
        stories: `
import type { Meta, StoryObj } from '@storybook/react';
import { {{componentName}} } from './{{componentName}}';

const meta: Meta<typeof {{componentName}}> = {
  title: '{{category}}/{{componentName}}',
  component: {{componentName}},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [{{#each variants}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
    },
    size: {
      control: { type: 'select' },
      options: [{{#each sizes}}'{{this}}'{{#unless @last}}, {{/unless}}{{/each}}],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

{{#each variants}}
export const {{pascalCase this}}: Story = {
  args: {
    variant: '{{this}}',
    children: '{{../componentName}} {{this}}',
  },
};

{{/each}}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {{#each sizes}}
      <{{../componentName}} size="{{this}}">{{this}}</{{../componentName}}>
      {{/each}}
    </div>
  ),
};
        `,
        
        test: `
import { render, screen } from '@testing-library/react';
import { {{componentName}} } from './{{componentName}}';

describe('{{componentName}}', () => {
  it('renders with default props', () => {
    render(<{{componentName}}>Test content</{{componentName}}>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  {{#each variants}}
  it('renders {{this}} variant correctly', () => {
    render(<{{../componentName}} variant="{{this}}">Test</{{../componentName}}>);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('{{this}}-variant');
  });

  {{/each}}

  {{#each sizes}}
  it('renders {{this}} size correctly', () => {
    render(<{{../componentName}} size="{{this}}">Test</{{../componentName}}>);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('{{this}}-size');
  });

  {{/each}}

  it('accepts custom className', () => {
    render(<{{../componentName}} className="custom-class">Test</{{../componentName}}>);
    const element = screen.getByText('Test');
    expect(element).toHaveClass('custom-class');
  });
});
        `
      }
    };
    
    // Handlebars 헬퍼 등록
    handlebars.registerHelper('pascalCase', function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
  }
  
  async generateComponent(config) {
    const {
      name,
      type = 'react',
      category = 'Components',
      variants = ['primary'],
      sizes = ['md'],
      element = 'div',
      baseClasses = `${name.toLowerCase()}`,
      props = []
    } = config;
    
    const componentDir = path.join('src/components', name);
    await fs.ensureDir(componentDir);
    
    const templateData = {
      componentName: name,
      cssClass: name.toLowerCase(),
      category,
      variants,
      sizes,
      element,
      baseClasses,
      props,
      defaultVariant: variants[0],
      defaultSize: sizes[0],
      baseStyles: this.generateBaseStyles(config),
      variantStyles: this.generateVariantStyles(config),
      sizeStyles: this.generateSizeStyles(config)
    };
    
    // 컴포넌트 파일들 생성
    const files = {
      [`${name}.tsx`]: this.templates[type].component,
      [`${name}.css`]: this.templates[type].styles,
      [`${name}.stories.tsx`]: this.templates[type].stories,
      [`${name}.test.tsx`]: this.templates[type].test,
      'index.ts': `export { ${name} } from './${name}';`
    };
    
    for (const [filename, template] of Object.entries(files)) {
      const content = handlebars.compile(template)(templateData);
      await fs.writeFile(path.join(componentDir, filename), content);
    }
    
    // 인덱스 파일 업데이트
    await this.updateIndexFile(name);
    
    console.log(`✅ Component '${name}' generated successfully`);
  }
  
  generateBaseStyles(config) {
    const baseStyles = [
      { property: 'display', value: 'inline-flex' },
      { property: 'align-items', value: 'center' },
      { property: 'justify-content', value: 'center' },
      { property: 'border', value: 'none' },
      { property: 'cursor', value: 'pointer' },
      { property: 'transition', value: 'all 0.2s ease' }
    ];
    
    if (config.baseStyles) {
      baseStyles.push(...config.baseStyles);
    }
    
    return baseStyles;
  }
  
  generateVariantStyles(config) {
    const variantMap = {
      primary: [
        { property: 'background-color', value: 'var(--color-primary)' },
        { property: 'color', value: 'var(--color-on-primary)' }
      ],
      secondary: [
        { property: 'background-color', value: 'var(--color-secondary)' },
        { property: 'color', value: 'var(--color-on-secondary)' }
      ],
      ghost: [
        { property: 'background-color', value: 'transparent' },
        { property: 'color', value: 'var(--color-primary)' }
      ]
    };
    
    return config.variants.map(variant => ({
      name: variant,
      styles: variantMap[variant] || []
    }));
  }
  
  generateSizeStyles(config) {
    const sizeMap = {
      sm: [
        { property: 'padding', value: 'var(--space-sm) var(--space-md)' },
        { property: 'font-size', value: 'var(--text-sm)' }
      ],
      md: [
        { property: 'padding', value: 'var(--space-md) var(--space-lg)' },
        { property: 'font-size', value: 'var(--text-base)' }
      ],
      lg: [
        { property: 'padding', value: 'var(--space-lg) var(--space-xl)' },
        { property: 'font-size', value: 'var(--text-lg)' }
      ]
    };
    
    return config.sizes.map(size => ({
      name: size,
      styles: sizeMap[size] || []
    }));
  }
  
  async updateIndexFile(componentName) {
    const indexPath = 'src/components/index.ts';
    let content = '';
    
    try {
      content = await fs.readFile(indexPath, 'utf8');
    } catch (error) {
      // 파일이 없으면 새로 생성
    }
    
    const exportLine = `export { ${componentName} } from './${componentName}';`;
    
    if (!content.includes(exportLine)) {
      content += `${exportLine}\n`;
      await fs.writeFile(indexPath, content);
    }
  }
}

// CLI 인터페이스
if (require.main === module) {
  const generator = new ComponentGenerator();
  const config = JSON.parse(process.argv[2] || '{}');
  
  if (!config.name) {
    console.error('Please provide component name: node generate-component.js \'{"name": "Button"}\'');
    process.exit(1);
  }
  
  generator.generateComponent(config);
}

module.exports = ComponentGenerator;
```

## 자동 문서화

### 컴포넌트 문서 자동 생성

```javascript
// scripts/generate-docs.js - 자동 문서 생성
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

class DocumentationGenerator {
  constructor() {
    this.outputDir = 'docs/components';
  }
  
  async generateAllDocs() {
    // 컴포넌트 파일 찾기
    const componentFiles = glob.sync('src/components/**/index.ts');
    
    for (const file of componentFiles) {
      const componentDir = path.dirname(file);
      const componentName = path.basename(componentDir);
      
      await this.generateComponentDoc(componentName, componentDir);
    }
    
    // 인덱스 문서 생성
    await this.generateIndexDoc(componentFiles);
  }
  
  async generateComponentDoc(name, componentDir) {
    const componentFile = path.join(componentDir, `${name}.tsx`);
    const storyFile = path.join(componentDir, `${name}.stories.tsx`);
    
    if (!await fs.pathExists(componentFile)) {
      return;
    }
    
    const componentSource = await fs.readFile(componentFile, 'utf8');
    const propsInterface = this.extractPropsInterface(componentSource);
    const examples = await this.extractExamples(storyFile);
    
    const docContent = this.generateMarkdown({
      name,
      props: propsInterface,
      examples,
      usage: this.generateUsageExamples(name, propsInterface)
    });
    
    const docPath = path.join(this.outputDir, `${name}.md`);
    await fs.ensureDir(path.dirname(docPath));
    await fs.writeFile(docPath, docContent);
  }
  
  extractPropsInterface(source) {
    const interfaceMatch = source.match(/export interface (\w+Props) \{([\s\S]*?)\}/);
    if (!interfaceMatch) return [];
    
    const interfaceBody = interfaceMatch[2];
    const propMatches = interfaceBody.match(/(\w+)\??: ([^;]+);/g) || [];
    
    return propMatches.map(match => {
      const [, name, type] = match.match(/(\w+)\??: ([^;]+);/) || [];
      const optional = match.includes('?:');
      
      return {
        name,
        type: type.trim(),
        optional,
        description: this.extractPropDescription(source, name)
      };
    });
  }
  
  extractPropDescription(source, propName) {
    // JSDoc 코멘트에서 설명 추출
    const commentMatch = source.match(new RegExp(`/\\*\\*[\\s\\S]*?\\* @param ${propName} ([^\\n]+)`));
    return commentMatch ? commentMatch[1].trim() : '';
  }
  
  async extractExamples(storyFile) {
    if (!await fs.pathExists(storyFile)) {
      return [];
    }
    
    const storySource = await fs.readFile(storyFile, 'utf8');
    const exportMatches = storySource.match(/export const (\w+): Story = \{([\s\S]*?)\};/g) || [];
    
    return exportMatches.map(match => {
      const [, name] = match.match(/export const (\w+):/) || [];
      const argsMatch = match.match(/args: \{([\s\S]*?)\}/);
      
      return {
        name,
        args: argsMatch ? argsMatch[1] : '',
        code: this.generateExampleCode(name, argsMatch)
      };
    });
  }
  
  generateExampleCode(storyName, argsMatch) {
    if (!argsMatch) return '';
    
    const args = argsMatch[1]
      .split(',')
      .map(line => line.trim())
      .filter(line => line)
      .map(line => {
        const [key, value] = line.split(':').map(s => s.trim());
        return `${key}=${value}`;
      })
      .join(' ');
    
    return `<ComponentName ${args}>Content</ComponentName>`;
  }
  
  generateUsageExamples(name, props) {
    const requiredProps = props.filter(p => !p.optional);
    const optionalProps = props.filter(p => p.optional);
    
    const examples = [];
    
    // 기본 사용법
    examples.push({
      title: 'Basic Usage',
      code: `import { ${name} } from '@design-system/components';

<${name}>
  Default ${name}
</${name}>`
    });
    
    // Props와 함께 사용
    if (props.length > 0) {
      const propExamples = requiredProps.slice(0, 2)
        .concat(optionalProps.slice(0, 2))
        .map(p => {
          const exampleValue = this.getExampleValue(p.type);
          return `${p.name}=${exampleValue}`;
        })
        .join(' ');
      
      examples.push({
        title: 'With Props',
        code: `<${name} ${propExamples}>
  ${name} with props
</${name}>`
      });
    }
    
    return examples;
  }
  
  getExampleValue(type) {
    const typeMap = {
      'string': '"example"',
      'boolean': '{true}',
      'number': '{42}',
      'React.ReactNode': '{<span>Content</span>}',
      'function': '{() => console.log("clicked")}'
    };
    
    // Union type 처리 (예: 'primary' | 'secondary')
    if (type.includes('|')) {
      const firstOption = type.split('|')[0].trim().replace(/'/g, '');
      return `"${firstOption}"`;
    }
    
    return typeMap[type] || '{}';
  }
  
  generateMarkdown({ name, props, examples, usage }) {
    let markdown = `# ${name}

## Overview

${name} component provides...

## Installation

\`\`\`bash
npm install @design-system/components
\`\`\`

## Usage

${usage.map(example => `
### ${example.title}

\`\`\`jsx
${example.code}
\`\`\`
`).join('')}

## Props

| Name | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
${props.map(prop => 
  `| ${prop.name} | \`${prop.type}\` | - | ${prop.optional ? 'No' : 'Yes'} | ${prop.description} |`
).join('\n')}

## Examples

${examples.map(example => `
### ${example.name}

\`\`\`jsx
${example.code}
\`\`\`
`).join('')}

## Accessibility

- Follows WCAG 2.1 AA guidelines
- Supports keyboard navigation
- Includes proper ARIA attributes

## Related Components

- [Button](./Button.md)
- [Input](./Input.md)
`;

    return markdown;
  }
  
  async generateIndexDoc(componentFiles) {
    const components = componentFiles.map(file => {
      const componentDir = path.dirname(file);
      const componentName = path.basename(componentDir);
      return componentName;
    }).sort();
    
    const indexContent = `# Component Library

## Available Components

${components.map(name => `- [${name}](./${name}.md)`).join('\n')}

## Getting Started

\`\`\`bash
npm install @design-system/components
\`\`\`

\`\`\`jsx
import { Button, Input, Card } from '@design-system/components';
import '@design-system/components/dist/styles.css';

function App() {
  return (
    <Card>
      <Input placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
\`\`\`

## Design Tokens

Our components are built using design tokens for consistency:

- [Colors](../tokens/colors.md)
- [Typography](../tokens/typography.md)
- [Spacing](../tokens/spacing.md)
- [Shadows](../tokens/shadows.md)
`;

    const indexPath = path.join(this.outputDir, 'README.md');
    await fs.ensureDir(path.dirname(indexPath));
    await fs.writeFile(indexPath, indexContent);
  }
}

// CLI 실행
if (require.main === module) {
  const generator = new DocumentationGenerator();
  generator.generateAllDocs()
    .then(() => console.log('✅ Documentation generated successfully'))
    .catch(error => console.error('❌ Documentation generation failed:', error));
}

module.exports = DocumentationGenerator;
```

## SuperClaude 자동화 명령어

### 자동화 설정 및 실행

```bash
# 자동화 파이프라인 설정
/setup automation --platforms "web,ios,android" --ci-cd github-actions --storybook --npm-publish

# 토큰 자동 빌드 설정
/setup token-build --watch --platforms "web,ios,android" --style-dictionary

# 컴포넌트 자동 생성
/generate component Button --variants "primary,secondary,ghost" --sizes "sm,md,lg" --auto-docs --auto-tests

# 전체 문서 자동 생성
/generate docs --components --tokens --patterns --storybook

# 자동화 파이프라인 실행
/run automation --build-tokens --test-components --deploy-storybook --publish-package

# 시각적 회귀 테스트 설정
/setup visual-testing --chromatic --percy --auto-approve-threshold 95

# 성능 모니터링 설정
/setup performance-monitoring --bundle-size --lighthouse --web-vitals

# 접근성 자동 검증 설정
/setup accessibility-testing --axe --wcag-level AA --auto-fix

# CI/CD 파이프라인 최적화
/optimize ci-cd --parallel-builds --cache-dependencies --fail-fast
```

### 품질 보증 자동화

```bash
# 코드 품질 자동 검사
/setup quality-gates --eslint --prettier --typescript --commitlint

# 자동 업데이트 시스템
/setup auto-updates --dependabot --renovate --security-updates

# 릴리스 자동화
/setup release-automation --semantic-release --changelog --github-releases --npm-publish

# 모니터링 및 알림
/setup monitoring --slack-notifications --email-alerts --error-tracking --performance-alerts
```

이러한 자동화 시스템을 통해 디자인 시스템의 일관성과 품질을 유지하면서 개발 효율성을 극대화할 수 있습니다.