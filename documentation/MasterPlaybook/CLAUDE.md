# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the AI Workflow Playbook repository containing comprehensive guides for different AI-assisted development methodologies:

1. **SuperClaude** - An intelligent development framework integrating Claude Code's advanced features
2. **Context7** - A vibe coding approach leveraging MCP servers for official library documentation
3. **BMAD Method** - A systematic Business-Model-API-Design workflow for structured app development

## Key Concepts

### SuperClaude Framework

- **Wave System**: Multi-stage command execution with compound intelligence (auto-activates on complexity ≥0.7 + files >20 + operation_types >2)
- **Persona System**: 11 specialized AI personalities that auto-activate based on context
- **MCP Integration**: Context7 (always active for dev tasks), Sequential, Magic, Playwright servers
- **Command Categories**: Development, Analysis, Quality, Testing, Documentation, Version Control, Meta

### Vibe Coding Philosophy

- Natural language first approach - no technical jargon required
- Conversational development style with immediate feedback
- Iterative improvement until satisfied
- Focus on describing what you want, not how to implement it

### BMAD Method Structure

1. **B (Business Logic)**: Core functionality without UI
2. **M (Mockup)**: Working prototype with basic UI
3. **A (API Integration)**: Backend connection and data flow
4. **D (Design Polish)**: Production-ready UI/UX

## Common Development Tasks

### Initialize a New Project

**🚀 빠른 시작 (추천)**:

```
새 프로젝트에 AI Workflow Playbook 적용하기:

1. cp -r MASTER_PLAYBOOK ./
2. @MASTER_PLAYBOOK/00_Getting_Started/00_Installation_Guide.md 의 학습 프롬프트 사용
3. 30분 프로토타입부터 시작
```

**기존 방식**:

```bash
# SuperClaude approach
/design "project description" --think-hard
/build "project name" --type new --framework [nextjs|react|vue]

# Context7 approach (for framework-specific projects)
"Create a React/Vue/Angular project with TypeScript and [specific libraries]"

# BMAD approach
1. Start with business requirements document
2. Implement core logic in console/test files
3. Create HTML/JS mockup
4. Add API layer
5. Polish with UI framework
```

### Analyze and Understand Code

```bash
# SuperClaude commands
/analyze --think                    # Standard analysis (~4K tokens)
/analyze --think-hard              # Deep analysis (~10K tokens)
/analyze --ultrathink              # Architecture analysis (~32K tokens)
/analyze --focus [performance|security|quality|mobile]

# With delegation for large codebases
/analyze --delegate folders --concurrency 10
```

### Implement Features

```bash
# SuperClaude
/implement "feature description" --type [component|api|auth|feature|database]
/implement "UI component" --magic   # For UI components

# Context7 (automatic activation)
"Implement [feature] using [specific framework/library]"
```

### Improve Code Quality

```bash
# SuperClaude iterative improvement
/improve --loop                     # 3 iterations by default
/improve --loop --iterations 5      # Custom iterations
/improve --focus [performance|security|quality|accessibility]

# Wave mode for comprehensive improvements
/improve --wave-mode force --wave-strategy systematic
```

### Testing

```bash
# Generate tests
/test unit                          # Unit tests
/test integration                   # Integration tests
/test e2e                          # End-to-end tests

# With Playwright
/test e2e --play                   # Browser automation tests
```

### Troubleshooting

```bash
/troubleshoot --auto-fix --explain  # Automatic error resolution
/troubleshoot --think              # Analyze complex issues
```

## Architecture and Structure

### Document Organization

```
_Documents/
├── SUPERCLAUSE_VIBE_CODING_GUIDE.md      # Korean guide for zero-to-MVP development
├── SUPERCLAUSE_COMMAND_REFERENCE.md      # Complete command and flag reference
├── CONTEXT7_VIBE_CODING_PLAYBOOK.md      # Library-focused development guide
└── BMAD_METHOD_WORKFLOW_PLAYBOOK.md      # Systematic workflow methodology
```

### Key Architectural Patterns

1. **Command-Based Development** (SuperClaude)
   - Slash commands for specific operations
   - Flags for behavior modification
   - Personas for domain expertise
   - MCP servers for external capabilities

2. **Natural Language Development** (Vibe Coding)
   - Describe intentions in plain language
   - Let AI handle technical implementation
   - Focus on outcomes over process

3. **Phase-Based Development** (BMAD)
   - Separate concerns by development phase
   - Test each phase independently
   - Build incrementally with clear milestones

## Important Notes

- **Package Manager**: Use Bun when available (up to 30x faster than npm), with automatic fallback to npm/yarn/pnpm
- **MCP Servers**: Context7 is always active for development tasks to provide accurate library documentation
- **Wave Mode**: Automatically activates for complex operations (can force with `--wave-mode force`)
- **Token Efficiency**: Use `--uc` flag for compressed output when needed
- **Personas**: Auto-activate based on task context, or manually specify with `--persona-[name]`

## Tips for Development

1. **Start Small**: Use natural language to describe what you want
2. **Be Specific**: Provide clear examples and edge cases
3. **Iterate**: Use `--loop` flags for progressive improvements
4. **Leverage MCP**: Context7 for docs, Sequential for analysis, Magic for UI, Playwright for testing
5. **Follow Patterns**: Each guide demonstrates proven workflows - adapt them to your needs

## Korean Language Support

Many documents in this repository are written in Korean (한국어). The guides include:

- Step-by-step tutorials for beginners
- Natural language examples in Korean
- Culturally adapted explanations

Use `--persona-scribe=ko` for Korean language documentation generation.
