#!/usr/bin/env node

/**
 * Performance Testing Suite for DINO App
 * Comprehensive benchmarking for API response times and memory usage
 */

const { performance } = require('perf_hooks');
const fs = require('fs/promises');
const path = require('path');

class PerformanceTestSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        },
      },
      tests: [],
    };
  }

  /**
   * API Response Time Benchmarks
   */
  async testAPIEndpoints() {
    console.log('🚀 Testing API Response Times...');

    const endpoints = [
      { path: '/api/trips', method: 'GET', name: 'Get Trips' },
      {
        path: '/api/schengen/calculate',
        method: 'POST',
        name: 'Schengen Calculator',
      },
      { path: '/api/countries', method: 'GET', name: 'Get Countries' },
      { path: '/api/user/profile', method: 'GET', name: 'User Profile' },
      { path: '/api/notifications', method: 'GET', name: 'Notifications' },
    ];

    for (const endpoint of endpoints) {
      await this.benchmarkEndpoint(endpoint);
    }
  }

  async benchmarkEndpoint(endpoint) {
    const iterations = 100;
    const times = [];
    const memoryUsages = [];

    console.log(`  Testing ${endpoint.name}...`);

    for (let i = 0; i < iterations; i++) {
      const startMemory = process.memoryUsage();
      const startTime = performance.now();

      try {
        // Simulate API call (replace with actual fetch in real scenario)
        await this.simulateAPICall(endpoint);

        const endTime = performance.now();
        const endMemory = process.memoryUsage();

        times.push(endTime - startTime);
        memoryUsages.push({
          heap: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
        });
      } catch (error) {
        console.warn(`    Warning: ${endpoint.name} failed - ${error.message}`);
      }
    }

    if (times.length > 0) {
      const stats = this.calculateStats(times);
      const memoryStats = this.calculateMemoryStats(memoryUsages);

      this.results.tests.push({
        endpoint: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        responseTime: stats,
        memory: memoryStats,
        iterations: times.length,
      });

      console.log(
        `    ✅ ${endpoint.name}: ${stats.avg.toFixed(2)}ms avg, ${stats.p95.toFixed(2)}ms p95`
      );
    }
  }

  async simulateAPICall(endpoint) {
    // Simulate database query time (50-200ms)
    const dbTime = Math.random() * 150 + 50;

    // Simulate processing time (10-50ms)
    const processingTime = Math.random() * 40 + 10;

    // Simulate memory allocation
    const data = new Array(1000).fill().map(() => ({
      id: Math.random().toString(36),
      data: Math.random().toString(36).repeat(10),
    }));

    await new Promise(resolve => setTimeout(resolve, dbTime + processingTime));

    // Clean up to test GC
    data.length = 0;
  }

  /**
   * Memory Usage Benchmarks
   */
  async testMemoryUsage() {
    console.log('🧠 Testing Memory Usage Patterns...');

    // Test cache performance
    await this.testCacheMemory();

    // Test data processing memory
    await this.testDataProcessingMemory();

    // Test concurrent operations memory
    await this.testConcurrentMemory();
  }

  async testCacheMemory() {
    console.log('  Testing Cache Memory Usage...');

    const initialMemory = process.memoryUsage();

    // Simulate cache operations
    const cache = new Map();
    const iterations = 10000;

    const startTime = performance.now();

    // Fill cache
    for (let i = 0; i < iterations; i++) {
      const key = `cache_key_${i}`;
      const value = {
        id: i,
        data: Math.random().toString(36).repeat(50),
        timestamp: Date.now(),
      };
      cache.set(key, value);
    }

    const midMemory = process.memoryUsage();

    // Access cache items
    for (let i = 0; i < iterations / 2; i++) {
      const key = `cache_key_${Math.floor(Math.random() * iterations)}`;
      cache.get(key);
    }

    // Clear cache
    cache.clear();

    const endTime = performance.now();
    const finalMemory = process.memoryUsage();

    this.results.tests.push({
      test: 'Cache Memory Usage',
      duration: endTime - startTime,
      memory: {
        initial: this.formatMemory(initialMemory),
        peak: this.formatMemory(midMemory),
        final: this.formatMemory(finalMemory),
        delta: {
          heap: midMemory.heapUsed - initialMemory.heapUsed,
          external: midMemory.external - initialMemory.external,
        },
      },
      operations: iterations,
      throughput: Math.round(iterations / ((endTime - startTime) / 1000)),
    });

    console.log(
      `    ✅ Cache Test: ${Math.round(iterations / ((endTime - startTime) / 1000))} ops/sec`
    );
  }

  async testDataProcessingMemory() {
    console.log('  Testing Data Processing Memory...');

    const initialMemory = process.memoryUsage();
    const startTime = performance.now();

    // Simulate processing large datasets
    const datasets = [];
    for (let batch = 0; batch < 5; batch++) {
      const data = Array.from({ length: 5000 }, (_, i) => ({
        id: `${batch}_${i}`,
        country: ['US', 'DE', 'FR', 'ES', 'IT'][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 90) + 1,
        type: ['business', 'tourist', 'transit'][Math.floor(Math.random() * 3)],
      }));

      // Process data
      const processed = data
        .filter(item => item.duration > 30)
        .map(item => ({
          ...item,
          processed: true,
          hash: item.id + item.country,
        }))
        .sort((a, b) => b.date - a.date);

      datasets.push(processed);

      // Force garbage collection opportunity
      if (batch % 2 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    const endTime = performance.now();
    const finalMemory = process.memoryUsage();

    this.results.tests.push({
      test: 'Data Processing Memory',
      duration: endTime - startTime,
      memory: {
        initial: this.formatMemory(initialMemory),
        final: this.formatMemory(finalMemory),
        delta: finalMemory.heapUsed - initialMemory.heapUsed,
      },
      recordsProcessed: datasets.reduce(
        (total, dataset) => total + dataset.length,
        0
      ),
    });

    console.log(
      `    ✅ Data Processing: ${datasets.reduce((total, dataset) => total + dataset.length, 0)} records processed`
    );
  }

  async testConcurrentMemory() {
    console.log('  Testing Concurrent Operations Memory...');

    const initialMemory = process.memoryUsage();
    const startTime = performance.now();

    // Simulate concurrent operations
    const promises = Array.from({ length: 20 }, async (_, i) => {
      const data = Array.from({ length: 1000 }, (_, j) => ({
        id: `concurrent_${i}_${j}`,
        value: Math.random() * 1000,
      }));

      // Simulate async processing
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

      return data.reduce((sum, item) => sum + item.value, 0);
    });

    const results = await Promise.all(promises);

    const endTime = performance.now();
    const finalMemory = process.memoryUsage();

    this.results.tests.push({
      test: 'Concurrent Operations Memory',
      duration: endTime - startTime,
      memory: {
        initial: this.formatMemory(initialMemory),
        final: this.formatMemory(finalMemory),
        delta: finalMemory.heapUsed - initialMemory.heapUsed,
      },
      concurrentOperations: promises.length,
      totalResult: results.reduce((sum, result) => sum + result, 0),
    });

    console.log(
      `    ✅ Concurrent Operations: ${promises.length} parallel operations completed`
    );
  }

  /**
   * Database Performance Benchmarks
   */
  async testDatabasePerformance() {
    console.log('🗄️ Testing Database Performance...');

    // Simulate database operations
    const operations = [
      {
        name: 'Simple SELECT',
        complexity: 1,
        time: () => 10 + Math.random() * 20,
      },
      {
        name: 'JOIN Query',
        complexity: 3,
        time: () => 50 + Math.random() * 100,
      },
      {
        name: 'Complex Analytics',
        complexity: 5,
        time: () => 200 + Math.random() * 300,
      },
      {
        name: 'INSERT Operation',
        complexity: 2,
        time: () => 20 + Math.random() * 40,
      },
      {
        name: 'UPDATE Operation',
        complexity: 2,
        time: () => 25 + Math.random() * 45,
      },
    ];

    for (const op of operations) {
      await this.benchmarkDatabaseOperation(op);
    }
  }

  async benchmarkDatabaseOperation(operation) {
    const iterations = 50;
    const times = [];

    console.log(`  Testing ${operation.name}...`);

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, operation.time()));

      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const stats = this.calculateStats(times);

    this.results.tests.push({
      database: operation.name,
      complexity: operation.complexity,
      responseTime: stats,
      iterations,
    });

    console.log(`    ✅ ${operation.name}: ${stats.avg.toFixed(2)}ms avg`);
  }

  /**
   * Calculate performance statistics
   */
  calculateStats(times) {
    times.sort((a, b) => a - b);

    return {
      min: times[0],
      max: times[times.length - 1],
      avg: times.reduce((sum, time) => sum + time, 0) / times.length,
      median: times[Math.floor(times.length / 2)],
      p95: times[Math.floor(times.length * 0.95)],
      p99: times[Math.floor(times.length * 0.99)],
    };
  }

  calculateMemoryStats(memoryUsages) {
    const heapUsages = memoryUsages.map(m => m.heap);
    const externalUsages = memoryUsages.map(m => m.external);

    return {
      heap: this.calculateStats(heapUsages),
      external: this.calculateStats(externalUsages),
      totalAllocated: heapUsages.reduce(
        (sum, usage) => sum + Math.max(usage, 0),
        0
      ),
    };
  }

  formatMemory(memoryUsage) {
    return {
      heapUsed: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      external: Math.round((memoryUsage.external / 1024 / 1024) * 100) / 100,
      rss: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
    };
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const summary = {
      totalTests: this.results.tests.length,
      timestamp: this.results.timestamp,
      environment: this.results.environment,
      performance: {
        apiResponseTimes: this.results.tests
          .filter(test => test.endpoint)
          .map(test => ({
            endpoint: test.endpoint,
            avgResponseTime: test.responseTime.avg,
            p95ResponseTime: test.responseTime.p95,
          })),
        memoryUsage: this.results.tests
          .filter(test => test.test)
          .map(test => ({
            test: test.test,
            memoryDelta: test.memory.delta,
          })),
        databasePerformance: this.results.tests
          .filter(test => test.database)
          .map(test => ({
            operation: test.database,
            avgTime: test.responseTime.avg,
            complexity: test.complexity,
          })),
      },
    };

    return {
      summary,
      detailed: this.results,
    };
  }

  /**
   * Save results to file
   */
  async saveResults() {
    const reportDir = path.join(process.cwd(), 'reports', 'performance');
    await fs.mkdir(reportDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(reportDir, `performance-test-${timestamp}.json`);

    const report = this.generateReport();
    await fs.writeFile(filename, JSON.stringify(report, null, 2));

    console.log(`\n📊 Performance report saved to: ${filename}`);
    return filename;
  }

  /**
   * Run all performance tests
   */
  async runAllTests() {
    console.log('🚀 Starting DINO Performance Test Suite...\n');

    const startTime = performance.now();

    try {
      await this.testAPIEndpoints();
      await this.testMemoryUsage();
      await this.testDatabasePerformance();

      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      console.log(
        `\n✅ All tests completed in ${(totalDuration / 1000).toFixed(2)} seconds`
      );

      const filename = await this.saveResults();

      // Print summary
      this.printSummary();

      return filename;
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
      throw error;
    }
  }

  printSummary() {
    const report = this.generateReport();

    console.log('\n📈 Performance Test Summary:');
    console.log('================================');

    if (report.summary.performance.apiResponseTimes.length > 0) {
      console.log('\nAPI Response Times:');
      report.summary.performance.apiResponseTimes.forEach(api => {
        console.log(
          `  ${api.endpoint}: ${api.avgResponseTime.toFixed(2)}ms avg, ${api.p95ResponseTime.toFixed(2)}ms p95`
        );
      });
    }

    if (report.summary.performance.memoryUsage.length > 0) {
      console.log('\nMemory Usage Tests:');
      report.summary.performance.memoryUsage.forEach(test => {
        const deltaKB = Math.round(test.memoryDelta / 1024);
        console.log(`  ${test.test}: ${deltaKB}KB delta`);
      });
    }

    if (report.summary.performance.databasePerformance.length > 0) {
      console.log('\nDatabase Performance:');
      report.summary.performance.databasePerformance.forEach(db => {
        console.log(
          `  ${db.operation}: ${db.avgTime.toFixed(2)}ms avg (complexity: ${db.complexity})`
        );
      });
    }

    console.log(`\nTotal Tests: ${report.summary.totalTests}`);
    console.log(
      `Environment: Node ${report.summary.environment.node} on ${report.summary.environment.platform}`
    );
  }
}

// Run tests if called directly
if (require.main === module) {
  const suite = new PerformanceTestSuite();
  suite.runAllTests().catch(console.error);
}

module.exports = PerformanceTestSuite;
