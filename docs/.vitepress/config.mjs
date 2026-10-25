import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: 'BIS Compliance Engine',
    description: 'AI & Regulatory RAG Platform for BIS Scheme-I & AIS Homologation.',
    appearance: 'dark',
    base: '/',
    themeConfig: {
      nav: [
        { text: 'Guide', link: '/00a-project-analysis' },
        { text: 'Features', link: '/01-features' },
        { text: 'API Reference', link: '/03-api-reference' },
        { text: 'Comparisons', link: '/04-tech-comparisons' },
        { text: 'System Design', link: '/system-design/' },
        { text: 'Interview Q&A', link: '/09-interview-qa' },
        { text: 'Checklist (275)', link: '/13-master-checklist' },
        { text: 'Say It Out Loud', link: '/14-say-it-out-loud' }
      ],
      sidebar: [
        {
          text: 'Project Overview',
          items: [
            { text: 'Project Type Classification', link: '/00-project-type' },
            { text: 'Full Project Analysis', link: '/00a-project-analysis' },
            { text: 'Project Pitch (30s & 2m)', link: '/00b-project-pitch' },
            { text: 'Repository Map', link: '/00-project-map' }
          ]
        },
        {
          text: 'Features & Implementation',
          items: [
            { text: 'Feature Inventory', link: '/01-features' },
            { text: 'F1: Standard Identification RAG', link: '/features/F1-standard-identification-rag' },
            { text: 'F2: Regulatory Guardrail', link: '/features/F2-regulatory-guardrail' },
            { text: 'F3: Factory Readiness Gap Engine', link: '/features/F3-factory-readiness-gap-engine' },
            { text: 'F4: Statutory Audit Pack Export', link: '/features/F4-statutory-audit-pack-export' },
            { text: 'F5: Conversational Officer', link: '/features/F5-conversational-compliance-officer' },
            { text: 'Build Order Manual', link: '/02-build-order' },
            { text: 'API Reference', link: '/03-api-reference' },
            { text: 'Tech Choice Comparisons', link: '/04-tech-comparisons' }
          ]
        },
        {
          text: 'Architecture & Security',
          items: [
            { text: 'Architecture & System Design', link: '/05-architecture' },
            { text: 'Security Audit & OWASP', link: '/06-security' },
            { text: 'AI & Local RAG Deep Dive', link: '/07-ai-integration' },
            { text: 'Quality, Ops & DevOps', link: '/08-quality-and-ops' }
          ]
        },
        {
          text: 'Distributed System Design',
          items: [
            { text: 'System Design Overview', link: '/system-design/' },
            { text: '14.1 Capacity Estimation', link: '/system-design/14.1-requirements-and-estimation' },
            { text: '14.2 Architecture Styles', link: '/system-design/14.2-architecture-styles' },
            { text: '14.3 Networking & Communication', link: '/system-design/14.3-networking-and-communication' },
            { text: '14.4 Load Balancing & Scaling', link: '/system-design/14.4-load-balancing-and-scaling' },
            { text: '14.5 Databases & Storage (CAP)', link: '/system-design/14.5-databases-and-storage' },
            { text: '14.6 Caching & Vector Cache', link: '/system-design/14.6-caching' },
            { text: '14.7 Messaging & Queues', link: '/system-design/14.7-messaging-and-queues' },
            { text: '14.8 Concurrency & GIL', link: '/system-design/14.8-consistency-and-concurrency' },
            { text: '14.9 Reliability & Resilience', link: '/system-design/14.9-reliability-and-resilience' },
            { text: '14.10 API Design & Rate Limiting', link: '/system-design/14.10-api-design-and-rate-limiting' },
            { text: '14.11 Security & Air-Gap Defense', link: '/system-design/14.11-security-architecture' },
            { text: '14.12 Search & AI Architecture', link: '/system-design/14.12-search-and-ai-architecture' },
            { text: '14.13 Real-Time Systems & Push', link: '/system-design/14.13-real-time-systems' },
            { text: '14.14 Observability & Metrics', link: '/system-design/14.14-observability-and-operations' },
            { text: '14.15 Performance & Profiling', link: '/system-design/14.15-performance-engineering' },
            { text: '14.16 Cost Analysis & TCO', link: '/system-design/14.16-cost-and-trade-offs' },
            { text: '14.17 Classic System Designs', link: '/system-design/14.17-classic-system-design' },
            { text: '14.18 Architecture Decisions (ADR)', link: '/system-design/decisions' }
          ]
        },
        {
          text: 'Interview Mastery & Checklists',
          items: [
            { text: 'Interview Q&A (150+)', link: '/09-interview-qa' },
            { text: 'Gaps & Improvements', link: '/10-gaps-and-improvements' },
            { text: 'Technical Glossary', link: '/11-glossary' },
            { text: 'Confirm List', link: '/12-confirm-list' },
            { text: 'Master Checklist (275 Items)', link: '/13-master-checklist' },
            { text: 'Say It Out Loud Scripts', link: '/14-say-it-out-loud' }
          ]
        }
      ],
      search: {
        provider: 'local'
      },
      outline: [2, 3]
    },
    mermaid: {
      theme: 'dark'
    },
    vite: {
      optimizeDeps: {
        include: ['mermaid', 'fastdom', 'fastdom/extensions/fastdom-promised.js']
      },
      ssr: {
        noExternal: ['mermaid', 'vitepress-plugin-mermaid', 'fastdom']
      }
    }
  })
);
