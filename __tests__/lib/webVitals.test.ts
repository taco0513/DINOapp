import { reportWebVitals } from '@/lib/webVitals';

// Mock web-vitals functions
const mockGetCLS = jest.fn();
const mockGetFID = jest.fn();
const mockGetFCP = jest.fn();
const mockGetLCP = jest.fn();
const mockGetTTFB = jest.fn();

jest.mock('web-vitals', () => ({
  getCLS: mockGetCLS,
  getFID: mockGetFID,
  getFCP: mockGetFCP,
  getLCP: mockGetLCP,
  getTTFB: mockGetTTFB,
}));

describe('webVitals', () => {
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('reportWebVitals', () => {
    it('should initialize all web vitals collection', () => {
      reportWebVitals();

      expect(mockGetCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(mockGetFID).toHaveBeenCalledWith(expect.any(Function));
      expect(mockGetFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockGetLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockGetTTFB).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should log metrics when received', () => {
      reportWebVitals();

      // Get the callback function passed to getCLS
      const clsCallback = mockGetCLS.mock.calls[0][0];

      // Simulate receiving a CLS metric
      const mockMetric = {
        name: 'CLS',
        value: 0.1,
        rating: 'good',
        delta: 0.1,
        id: 'test-id',
      };

      clsCallback(mockMetric);

      expect(mockConsoleLog).toHaveBeenCalledWith('[Web Vitals]', mockMetric);
    });

    it('should handle different metric types', () => {
      reportWebVitals();

      const metrics = [
        { name: 'CLS', value: 0.1, rating: 'good', delta: 0.1, id: 'cls-id' },
        { name: 'FID', value: 80, rating: 'good', delta: 80, id: 'fid-id' },
        { name: 'FCP', value: 1200, rating: 'good', delta: 1200, id: 'fcp-id' },
        { name: 'LCP', value: 2000, rating: 'good', delta: 2000, id: 'lcp-id' },
        { name: 'TTFB', value: 500, rating: 'good', delta: 500, id: 'ttfb-id' },
      ];

      // Test each metric callback
      const callbacks = [
        (getCLS as jest.Mock).mock.calls[0][0],
        (getFID as jest.Mock).mock.calls[0][0],
        (getFCP as jest.Mock).mock.calls[0][0],
        (getLCP as jest.Mock).mock.calls[0][0],
        (getTTFB as jest.Mock).mock.calls[0][0],
      ];

      metrics.forEach((metric, index) => {
        callbacks[index](metric);
        expect(mockConsoleLog).toHaveBeenCalledWith('[Web Vitals]', metric);
      });
    });

    it('should handle analytics reporting if available', () => {
      // Mock gtag
      const mockGtag = jest.fn();
      (global as any).gtag = mockGtag;

      reportWebVitals();

      const callback = (getCLS as jest.Mock).mock.calls[0][0];
      const mockMetric = {
        name: 'CLS',
        value: 0.1,
        rating: 'good',
        delta: 0.1,
        id: 'test-id',
      };

      callback(mockMetric);

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
        event_category: 'performance',
        event_label: 'CLS',
        value: Math.round(0.1 * 1000), // CLS is multiplied by 1000
        non_interaction: true,
      });

      // Cleanup
      delete (global as any).gtag;
    });

    it('should handle FID metric value correctly for analytics', () => {
      const mockGtag = jest.fn();
      (global as any).gtag = mockGtag;

      reportWebVitals();

      const callback = (getFID as jest.Mock).mock.calls[0][0];
      const mockMetric = {
        name: 'FID',
        value: 85.5,
        rating: 'good',
        delta: 85.5,
        id: 'fid-id',
      };

      callback(mockMetric);

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vitals', {
        event_category: 'performance',
        event_label: 'FID',
        value: Math.round(85.5), // FID is rounded
        non_interaction: true,
      });

      delete (global as any).gtag;
    });

    it('should handle errors gracefully', () => {
      // Mock getCLS to throw an error
      (getCLS as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Web Vitals error');
      });

      // Should not throw
      expect(() => reportWebVitals()).not.toThrow();
    });

    it('should work when web-vitals functions are not available', () => {
      // Mock functions to be undefined
      (getCLS as jest.Mock)
        .mockImplementationOnce(undefined)(getFID as jest.Mock)
        .mockImplementationOnce(undefined)(getFCP as jest.Mock)
        .mockImplementationOnce(undefined)(getLCP as jest.Mock)
        .mockImplementationOnce(undefined)(getTTFB as jest.Mock)
        .mockImplementationOnce(undefined);

      expect(() => reportWebVitals()).not.toThrow();
    });

    it('should handle metrics with poor ratings', () => {
      reportWebVitals();

      const callback = (getLCP as jest.Mock).mock.calls[0][0];
      const poorMetric = {
        name: 'LCP',
        value: 4500, // Poor LCP value
        rating: 'poor',
        delta: 4500,
        id: 'lcp-poor-id',
      };

      callback(poorMetric);

      expect(mockConsoleLog).toHaveBeenCalledWith('[Web Vitals]', poorMetric);
    });

    it('should handle metrics with needs-improvement ratings', () => {
      reportWebVitals();

      const callback = (getFCP as jest.Mock).mock.calls[0][0];
      const needsImprovementMetric = {
        name: 'FCP',
        value: 2500, // Needs improvement FCP value
        rating: 'needs-improvement',
        delta: 2500,
        id: 'fcp-ni-id',
      };

      callback(needsImprovementMetric);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Web Vitals]',
        needsImprovementMetric
      );
    });
  });
});
