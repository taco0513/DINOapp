/**
 * DINO v2.0 - Gmail Parsing Metrics
 * Track parsing performance and accuracy
 */

export interface ParsingMetrics {
  totalEmails: number;
  flightEmailsFound: number;
  flightsExtracted: number;
  unknownAirlines: number;
  unknownAirports: number;
  highConfidenceFlights: number;
  lowConfidenceFlights: number;
  parsingErrors: number;
  averageConfidence: number;
  processingTimeMs: number;
}

export class MetricsCollector {
  private metrics: ParsingMetrics = {
    totalEmails: 0,
    flightEmailsFound: 0,
    flightsExtracted: 0,
    unknownAirlines: 0,
    unknownAirports: 0,
    highConfidenceFlights: 0,
    lowConfidenceFlights: 0,
    parsingErrors: 0,
    averageConfidence: 0,
    processingTimeMs: 0,
  };

  private confidenceScores: number[] = [];
  private startTime: number = Date.now();

  recordEmail() {
    this.metrics.totalEmails++;
  }

  recordFlightEmail() {
    this.metrics.flightEmailsFound++;
  }

  recordFlight(confidence: number, airline: string, departureAirport: string, arrivalAirport: string) {
    this.metrics.flightsExtracted++;
    this.confidenceScores.push(confidence);

    if (airline === 'Unknown Airline' || airline === 'UNKNOWN') {
      this.metrics.unknownAirlines++;
    }

    if (departureAirport === 'UNKNOWN' || arrivalAirport === 'UNKNOWN') {
      this.metrics.unknownAirports++;
    }

    if (confidence >= 0.8) {
      this.metrics.highConfidenceFlights++;
    } else if (confidence < 0.5) {
      this.metrics.lowConfidenceFlights++;
    }
  }

  recordError() {
    this.metrics.parsingErrors++;
  }

  finalize(): ParsingMetrics {
    this.metrics.processingTimeMs = Date.now() - this.startTime;
    
    if (this.confidenceScores.length > 0) {
      this.metrics.averageConfidence = 
        this.confidenceScores.reduce((sum, score) => sum + score, 0) / this.confidenceScores.length;
    }

    return this.metrics;
  }

  getReport(): string {
    const metrics = this.finalize();
    const recognitionRate = metrics.flightsExtracted > 0 
      ? ((metrics.flightsExtracted - metrics.unknownAirlines) / metrics.flightsExtracted * 100).toFixed(1)
      : '0';

    return `
📊 Gmail Sync Performance Report
================================
📧 Emails processed: ${metrics.totalEmails}
✈️ Flight emails found: ${metrics.flightEmailsFound} (${(metrics.flightEmailsFound / metrics.totalEmails * 100).toFixed(1)}%)
🎯 Flights extracted: ${metrics.flightsExtracted}

Recognition Rates:
- Airline recognition: ${recognitionRate}%
- Unknown airlines: ${metrics.unknownAirlines}
- Unknown airports: ${metrics.unknownAirports}

Confidence Levels:
- High confidence (≥80%): ${metrics.highConfidenceFlights}
- Low confidence (<50%): ${metrics.lowConfidenceFlights}
- Average confidence: ${(metrics.averageConfidence * 100).toFixed(1)}%

Performance:
- Processing time: ${(metrics.processingTimeMs / 1000).toFixed(2)}s
- Parsing errors: ${metrics.parsingErrors}
`;
  }
}

export function createMetricsCollector(): MetricsCollector {
  return new MetricsCollector();
}