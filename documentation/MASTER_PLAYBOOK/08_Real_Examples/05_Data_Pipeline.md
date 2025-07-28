# 데이터 파이프라인 구축 실전 가이드

## 프로젝트 개요

확장 가능한 실시간 데이터 파이프라인을 SuperClaude와 AI 워크플로우를 활용하여 구축하는 완전한 가이드입니다.

### 프로젝트: 전자상거래 데이터 파이프라인
```yaml
data_pipeline:
  name: "E-commerce Analytics Pipeline"
  domain: "전자상거래 데이터 분석"
  scale: "일일 10TB+ 데이터 처리"
  
data_sources:
  - "웹사이트 이벤트 (클릭스트림)"
  - "모바일 앱 이벤트"
  - "거래 데이터 (주문, 결제)"
  - "고객 서비스 로그"
  - "재고 관리 시스템"
  - "외부 API (광고, 날씨)"

processing_requirements:
  - "실시간 스트림 처리 (< 1초 지연)"
  - "배치 처리 (일일 ETL)"
  - "데이터 품질 검증"
  - "스키마 진화 지원"
  - "장애 복구 및 재처리"
  - "비용 최적화"

output_destinations:
  - "실시간 대시보드"
  - "ML 모델 피처 스토어"
  - "비즈니스 인텔리전스 도구"
  - "A/B 테스트 플랫폼"
  - "개인화 추천 시스템"
```

### 기술 스택
```yaml
technology_stack:
  streaming:
    ingestion: "Apache Kafka"
    processing: "Apache Flink / Kafka Streams"
    storage: "Apache Cassandra / ClickHouse"
  
  batch:
    orchestration: "Apache Airflow"
    processing: "Apache Spark"
    storage: "AWS S3 / HDFS"
  
  infrastructure:
    cloud: "AWS / GCP"
    containers: "Docker + Kubernetes"
    monitoring: "Prometheus + Grafana"
    
  languages:
    python: "Apache Beam, Pandas, PySpark"
    java: "Kafka Streams, Flink"
    sql: "dbt, BigQuery"
    
  ml_ops:
    feature_store: "Feast"
    model_serving: "MLflow + Seldon"
    monitoring: "Evidently AI"
```

## Phase 1: 파이프라인 아키텍처 설계

### SuperClaude를 활용한 설계
```bash
# 1. 데이터 파이프라인 아키텍처 설계
/design "전자상거래 데이터 파이프라인" --stream-batch --lambda-architecture

# 2. 데이터 모델 및 스키마 설계
/design data-models --schemas "events,transactions,users" --avro

# 3. 실시간 처리 아키텍처
/design stream-processing --kafka --flink --low-latency

# 4. 배치 처리 워크플로우
/design batch-processing --airflow --spark --cost-optimization
```

### Lambda 아키텍처 구조
```yaml
lambda_architecture:
  speed_layer:
    purpose: "실시간 처리 (Hot Path)"
    latency: "< 1초"
    technologies: ["Kafka", "Flink", "Redis"]
    data_types: ["스트림 이벤트", "실시간 메트릭"]
  
  batch_layer:
    purpose: "정확성 보장 (Cold Path)"
    latency: "시간/일 단위"
    technologies: ["Airflow", "Spark", "S3"]
    data_types: ["전체 데이터셋", "복잡한 분석"]
  
  serving_layer:
    purpose: "통합 뷰 제공"
    latency: "< 100ms"
    technologies: ["Cassandra", "Redis", "BigQuery"]
    data_types: ["집계 결과", "피처"]
```

### 데이터 플로우 다이어그램
```
Data Sources
    ↓
┌─────────────────────┐
│   Kafka Ingestion  │
│   (Event Streaming) │
└─────────────────────┘
    ↓           ↓
┌─────────────┐ ┌─────────────┐
│ Speed Layer │ │ Batch Layer │
│   (Flink)   │ │   (Spark)   │
└─────────────┘ └─────────────┘
    ↓           ↓
┌─────────────────────┐
│   Serving Layer    │
│ (Cassandra/Redis)  │
└─────────────────────┘
    ↓
┌─────────────────────┐
│  Analytics & ML     │
│   Applications      │
└─────────────────────┘
```

### 데이터 스키마 설계
```json
// events.avsc - 이벤트 스키마
{
  "type": "record",
  "name": "UserEvent",
  "namespace": "com.ecommerce.events",
  "fields": [
    {"name": "eventId", "type": "string"},
    {"name": "userId", "type": ["null", "string"], "default": null},
    {"name": "sessionId", "type": "string"},
    {"name": "eventType", "type": {
      "type": "enum",
      "name": "EventType",
      "symbols": ["page_view", "click", "purchase", "add_to_cart", "search"]
    }},
    {"name": "timestamp", "type": "long"},
    {"name": "properties", "type": {
      "type": "map",
      "values": "string"
    }},
    {"name": "context", "type": {
      "type": "record",
      "name": "Context",
      "fields": [
        {"name": "userAgent", "type": "string"},
        {"name": "ip", "type": "string"},
        {"name": "platform", "type": "string"},
        {"name": "referrer", "type": ["null", "string"], "default": null}
      ]
    }}
  ]
}

// transactions.avsc - 거래 스키마
{
  "type": "record",
  "name": "Transaction",
  "namespace": "com.ecommerce.transactions",
  "fields": [
    {"name": "transactionId", "type": "string"},
    {"name": "userId", "type": "string"},
    {"name": "orderItems", "type": {
      "type": "array",
      "items": {
        "type": "record",
        "name": "OrderItem",
        "fields": [
          {"name": "productId", "type": "string"},
          {"name": "quantity", "type": "int"},
          {"name": "price", "type": "double"},
          {"name": "category", "type": "string"}
        ]
      }
    }},
    {"name": "totalAmount", "type": "double"},
    {"name": "currency", "type": "string"},
    {"name": "paymentMethod", "type": "string"},
    {"name": "status", "type": "string"},
    {"name": "timestamp", "type": "long"}
  ]
}
```

## Phase 2: 실시간 스트림 처리 구현

### SuperClaude를 활용한 Kafka 설정
```bash
# 1. Kafka 클러스터 설정
/implement "Kafka 클러스터" --topics --partitions --replication

# 2. Kafka Producer 구현
/implement "이벤트 프로듀서" --schema-registry --serialization --error-handling

# 3. Flink 스트림 처리
/implement "Flink 스트림 처리" --windowing --state-management --checkpointing

# 4. 실시간 집계 및 알람
/implement "실시간 알람 시스템" --metrics --thresholds --notifications
```

### Kafka 토픽 구성
```yaml
kafka_topics:
  user-events:
    partitions: 24
    replication_factor: 3
    retention_ms: 604800000  # 7 days
    cleanup_policy: "delete"
    
  transactions:
    partitions: 12
    replication_factor: 3
    retention_ms: 2592000000  # 30 days
    cleanup_policy: "compact"
    
  user-profiles:
    partitions: 6
    replication_factor: 3
    retention_ms: -1  # infinite
    cleanup_policy: "compact"
```

### Flink 스트림 처리 구현
```java
// StreamProcessingJob.java
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.apache.flink.streaming.api.windowing.windows.TimeWindow;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaConsumer;
import org.apache.flink.streaming.connectors.kafka.FlinkKafkaProducer;

public class EcommerceStreamProcessor {
    
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        
        // 체크포인트 설정
        env.enableCheckpointing(60000); // 1분마다
        env.getCheckpointConfig().setCheckpointingMode(CheckpointingMode.EXACTLY_ONCE);
        
        // Kafka 소스 설정
        Properties kafkaProps = new Properties();
        kafkaProps.setProperty("bootstrap.servers", "kafka-cluster:9092");
        kafkaProps.setProperty("group.id", "flink-processor");
        
        FlinkKafkaConsumer<UserEvent> eventConsumer = new FlinkKafkaConsumer<>(
            "user-events",
            new UserEventDeserializationSchema(),
            kafkaProps
        );
        
        // 이벤트 스트림 생성
        DataStream<UserEvent> eventStream = env.addSource(eventConsumer);
        
        // 실시간 세션 분석
        DataStream<SessionMetrics> sessionMetrics = eventStream
            .keyBy(UserEvent::getSessionId)
            .window(Time.minutes(30))
            .process(new SessionAnalysisFunction());
        
        // 실시간 상품 인기도 계산
        DataStream<ProductPopularity> productPopularity = eventStream
            .filter(event -> "product_view".equals(event.getEventType()))
            .keyBy(event -> event.getProperties().get("productId"))
            .window(Time.minutes(5))
            .aggregate(new ProductViewCountAggregator());
        
        // 실시간 이상 탐지
        DataStream<AlertEvent> alerts = eventStream
            .keyBy(UserEvent::getUserId)
            .process(new AnomalyDetectionFunction());
        
        // 결과를 다른 토픽으로 전송
        sessionMetrics.addSink(new FlinkKafkaProducer<>(
            "session-metrics",
            new SessionMetricsSerializationSchema(),
            kafkaProps
        ));
        
        productPopularity.addSink(new FlinkKafkaProducer<>(
            "product-popularity",
            new ProductPopularitySerializationSchema(),
            kafkaProps
        ));
        
        alerts.addSink(new FlinkKafkaProducer<>(
            "alerts",
            new AlertSerializationSchema(),
            kafkaProps
        ));
        
        env.execute("E-commerce Stream Processing");
    }
}

// 세션 분석 함수
public class SessionAnalysisFunction extends ProcessWindowFunction<UserEvent, SessionMetrics, String, TimeWindow> {
    
    @Override
    public void process(String sessionId, Context context, Iterable<UserEvent> events, Collector<SessionMetrics> out) {
        List<UserEvent> eventList = StreamSupport.stream(events.spliterator(), false)
            .collect(Collectors.toList());
        
        if (eventList.isEmpty()) return;
        
        // 세션 메트릭 계산
        long startTime = eventList.stream().mapToLong(UserEvent::getTimestamp).min().orElse(0);
        long endTime = eventList.stream().mapToLong(UserEvent::getTimestamp).max().orElse(0);
        long duration = endTime - startTime;
        
        int pageViews = (int) eventList.stream().filter(e -> "page_view".equals(e.getEventType())).count();
        int clicks = (int) eventList.stream().filter(e -> "click".equals(e.getEventType())).count();
        boolean haspurchase = eventList.stream().anyMatch(e -> "purchase".equals(e.getEventType()));
        
        Set<String> uniquePages = eventList.stream()
            .filter(e -> "page_view".equals(e.getEventType()))
            .map(e -> e.getProperties().get("page"))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        
        SessionMetrics metrics = SessionMetrics.builder()
            .sessionId(sessionId)
            .userId(eventList.get(0).getUserId())
            .startTime(startTime)
            .endTime(endTime)
            .duration(duration)
            .pageViews(pageViews)
            .clicks(clicks)
            .uniquePages(uniquePages.size())
            .hasConversion(haspurchase)
            .build();
        
        out.collect(metrics);
    }
}

// 이상 탐지 함수
public class AnomalyDetectionFunction extends KeyedProcessFunction<String, UserEvent, AlertEvent> {
    
    private ValueState<UserBehaviorProfile> userProfileState;
    private ValueState<Long> lastEventTimeState;
    
    @Override
    public void open(Configuration parameters) {
        ValueStateDescriptor<UserBehaviorProfile> profileDescriptor = 
            new ValueStateDescriptor<>("userProfile", UserBehaviorProfile.class);
        userProfileState = getRuntimeContext().getState(profileDescriptor);
        
        ValueStateDescriptor<Long> timeDescriptor = 
            new ValueStateDescriptor<>("lastEventTime", Long.class);
        lastEventTimeState = getRuntimeContext().getState(timeDescriptor);
    }
    
    @Override
    public void processElement(UserEvent event, Context ctx, Collector<AlertEvent> out) throws Exception {
        UserBehaviorProfile profile = userProfileState.value();
        Long lastEventTime = lastEventTimeState.value();
        
        if (profile == null) {
            profile = new UserBehaviorProfile(event.getUserId());
        }
        
        // 이상 행동 탐지 로직
        boolean isAnomaly = false;
        String reason = "";
        
        // 1. 비정상적인 클릭 속도
        if (lastEventTime != null) {
            long timeDiff = event.getTimestamp() - lastEventTime;
            if (timeDiff < 100 && "click".equals(event.getEventType())) {
                isAnomaly = true;
                reason = "Unusually fast clicking detected";
            }
        }
        
        // 2. 비정상적인 구매 패턴
        if ("purchase".equals(event.getEventType())) {
            double amount = Double.parseDouble(event.getProperties().getOrDefault("amount", "0"));
            if (amount > profile.getAveragePurchaseAmount() * 5) {
                isAnomaly = true;
                reason = "Unusually large purchase amount";
            }
        }
        
        // 3. 지리적 이상
        String currentLocation = event.getContext().getIp();
        if (!profile.getKnownLocations().contains(currentLocation) && 
            lastEventTime != null && (event.getTimestamp() - lastEventTime) < 3600000) {
            isAnomaly = true;
            reason = "Rapid location change detected";
        }
        
        if (isAnomaly) {
            AlertEvent alert = AlertEvent.builder()
                .userId(event.getUserId())
                .eventId(event.getEventId())
                .alertType("ANOMALY_DETECTION")
                .severity("HIGH")
                .reason(reason)
                .timestamp(event.getTimestamp())
                .build();
            
            out.collect(alert);
        }
        
        // 프로필 업데이트
        profile.update(event);
        userProfileState.update(profile);
        lastEventTimeState.update(event.getTimestamp());
    }
}
```

### 실시간 메트릭 대시보드
```python
# real_time_dashboard.py
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from kafka import KafkaConsumer
import json
import threading
import time
from collections import deque

class RealTimeDashboard:
    def __init__(self):
        self.metrics_buffer = deque(maxlen=1000)
        self.alerts_buffer = deque(maxlen=100)
        
    def consume_metrics(self):
        """백그라운드에서 Kafka 메시지 소비"""
        consumer = KafkaConsumer(
            'session-metrics',
            'product-popularity',
            'alerts',
            bootstrap_servers=['kafka-cluster:9092'],
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        for message in consumer:
            if message.topic == 'session-metrics':
                self.metrics_buffer.append({
                    'timestamp': message.value['timestamp'],
                    'metric_type': 'session',
                    'value': message.value
                })
            elif message.topic == 'product-popularity':
                self.metrics_buffer.append({
                    'timestamp': message.value['timestamp'],
                    'metric_type': 'product',
                    'value': message.value
                })
            elif message.topic == 'alerts':
                self.alerts_buffer.append(message.value)
    
    def run_dashboard(self):
        st.set_page_config(page_title="E-commerce Real-time Analytics", layout="wide")
        
        st.title("🛍️ E-commerce Real-time Analytics Dashboard")
        
        # 메트릭 요약
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                label="Active Sessions",
                value=self.get_active_sessions(),
                delta=self.get_session_delta()
            )
        
        with col2:
            st.metric(
                label="Conversion Rate",
                value=f"{self.get_conversion_rate():.1f}%",
                delta=f"{self.get_conversion_delta():.1f}%"
            )
        
        with col3:
            st.metric(
                label="Avg Session Duration",
                value=f"{self.get_avg_session_duration():.1f}min",
                delta=f"{self.get_duration_delta():.1f}min"
            )
        
        with col4:
            st.metric(
                label="Alerts (Last Hour)",
                value=len([a for a in self.alerts_buffer if time.time() - a['timestamp']/1000 < 3600]),
                delta=self.get_alerts_delta()
            )
        
        # 실시간 차트
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Session Metrics Over Time")
            session_chart = self.create_session_chart()
            st.plotly_chart(session_chart, use_container_width=True)
        
        with col2:
            st.subheader("Top Products (Real-time)")
            product_chart = self.create_product_chart()
            st.plotly_chart(product_chart, use_container_width=True)
        
        # 알람 테이블
        st.subheader("Recent Alerts")
        alerts_df = pd.DataFrame(list(self.alerts_buffer)[-10:])
        if not alerts_df.empty:
            st.dataframe(alerts_df, use_container_width=True)
        else:
            st.info("No recent alerts")
        
        # 자동 새로고침
        time.sleep(5)
        st.experimental_rerun()
    
    def create_session_chart(self):
        session_data = [m for m in self.metrics_buffer if m['metric_type'] == 'session']
        if not session_data:
            return go.Figure()
        
        df = pd.DataFrame([{
            'timestamp': pd.to_datetime(m['timestamp'], unit='ms'),
            'duration': m['value']['duration'] / 60000,  # 분 단위로 변환
            'page_views': m['value']['pageViews'],
            'has_conversion': m['value']['hasConversion']
        } for m in session_data[-100:]])
        
        fig = px.scatter(
            df, 
            x='timestamp', 
            y='duration',
            size='page_views',
            color='has_conversion',
            title="Session Duration vs Page Views"
        )
        
        return fig
    
    def create_product_chart(self):
        product_data = [m for m in self.metrics_buffer if m['metric_type'] == 'product']
        if not product_data:
            return go.Figure()
        
        # 최근 제품 인기도 데이터 집계
        product_counts = {}
        for m in product_data[-50:]:
            product_id = m['value']['productId']
            count = m['value']['viewCount']
            product_counts[product_id] = product_counts.get(product_id, 0) + count
        
        df = pd.DataFrame([
            {'product_id': k, 'view_count': v} 
            for k, v in sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ])
        
        fig = px.bar(df, x='product_id', y='view_count', title="Top 10 Products by Views")
        return fig
    
    def get_active_sessions(self):
        # 최근 5분간 활성 세션 수
        current_time = time.time() * 1000
        active_sessions = set()
        
        for m in self.metrics_buffer:
            if current_time - m['timestamp'] < 300000:  # 5분
                if m['metric_type'] == 'session':
                    active_sessions.add(m['value']['sessionId'])
        
        return len(active_sessions)
    
    def get_conversion_rate(self):
        recent_sessions = [m for m in self.metrics_buffer 
                          if m['metric_type'] == 'session' and 
                          time.time() * 1000 - m['timestamp'] < 3600000]  # 1시간
        
        if not recent_sessions:
            return 0.0
        
        conversions = sum(1 for m in recent_sessions if m['value']['hasConversion'])
        return (conversions / len(recent_sessions)) * 100

if __name__ == "__main__":
    dashboard = RealTimeDashboard()
    
    # 백그라운드에서 Kafka 소비자 실행
    consumer_thread = threading.Thread(target=dashboard.consume_metrics, daemon=True)
    consumer_thread.start()
    
    # 대시보드 실행
    dashboard.run_dashboard()
```

## Phase 3: 배치 처리 워크플로우 구현

### Airflow DAG 구현
```python
# dags/ecommerce_etl_dag.py
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from airflow.providers.amazon.aws.operators.s3_copy_object import S3CopyObjectOperator
from airflow.providers.spark.operators.spark_submit import SparkSubmitOperator

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=2),
}

dag = DAG(
    'ecommerce_etl_daily',
    default_args=default_args,
    description='Daily ETL pipeline for e-commerce data',
    schedule_interval='0 2 * * *',  # 매일 오전 2시
    max_active_runs=1,
    catchup=False,
    tags=['etl', 'daily', 'ecommerce']
)

# 데이터 품질 검증
def validate_data_quality(**context):
    from data_quality import DataQualityValidator
    
    execution_date = context['execution_date']
    validator = DataQualityValidator()
    
    # 원본 데이터 검증
    raw_data_path = f"s3://data-lake/raw/events/year={execution_date.year}/month={execution_date.month:02d}/day={execution_date.day:02d}/"
    
    validation_results = validator.validate_raw_events(raw_data_path)
    
    if not validation_results['is_valid']:
        raise ValueError(f"Data quality validation failed: {validation_results['errors']}")
    
    return validation_results

# 사용자 세그먼트 계산
def calculate_user_segments(**context):
    from user_analytics import UserSegmentCalculator
    
    execution_date = context['execution_date']
    calculator = UserSegmentCalculator()
    
    # 과거 30일 데이터를 기반으로 세그먼트 계산
    end_date = execution_date
    start_date = end_date - timedelta(days=30)
    
    segments = calculator.calculate_segments(start_date, end_date)
    
    # 결과를 S3에 저장
    output_path = f"s3://data-lake/processed/user_segments/date={execution_date.strftime('%Y-%m-%d')}/"
    calculator.save_segments(segments, output_path)
    
    return len(segments)

# 1. 원본 데이터 검증
validate_raw_data = PythonOperator(
    task_id='validate_raw_data',
    python_callable=validate_data_quality,
    dag=dag
)

# 2. Spark 작업으로 이벤트 데이터 처리
process_events = SparkSubmitOperator(
    task_id='process_events',
    application='/opt/spark/jobs/process_daily_events.py',
    application_args=[
        '--input-path', 's3://data-lake/raw/events/{{ ds }}/',
        '--output-path', 's3://data-lake/processed/events/{{ ds }}/',
        '--date', '{{ ds }}'
    ],
    conf={
        'spark.sql.adaptive.enabled': 'true',
        'spark.sql.adaptive.coalescePartitions.enabled': 'true',
        'spark.serializer': 'org.apache.spark.serializer.KryoSerializer'
    },
    dag=dag
)

# 3. 거래 데이터 집계
aggregate_transactions = SparkSubmitOperator(
    task_id='aggregate_transactions',
    application='/opt/spark/jobs/aggregate_transactions.py',
    application_args=[
        '--date', '{{ ds }}',
        '--output-path', 's3://data-lake/processed/transactions/{{ ds }}/'
    ],
    dag=dag
)

# 4. 사용자 세그먼트 계산
calculate_segments = PythonOperator(
    task_id='calculate_user_segments',
    python_callable=calculate_user_segments,
    dag=dag
)

# 5. 추천 시스템 피처 생성
generate_recommendation_features = SparkSubmitOperator(
    task_id='generate_recommendation_features',
    application='/opt/spark/jobs/generate_recommendation_features.py',
    application_args=[
        '--date', '{{ ds }}',
        '--lookback-days', '30',
        '--output-path', 's3://feature-store/recommendations/{{ ds }}/'
    ],
    dag=dag
)

# 6. 데이터 웨어하우스 로드
load_to_warehouse = PostgresOperator(
    task_id='load_to_warehouse',
    postgres_conn_id='data_warehouse',
    sql="""
    INSERT INTO fact_daily_metrics (date, metric_name, metric_value)
    SELECT 
        '{{ ds }}'::date,
        'daily_active_users',
        COUNT(DISTINCT user_id)
    FROM events_{{ ds_nodash }}
    WHERE event_type IN ('page_view', 'click', 'purchase');
    
    INSERT INTO fact_daily_metrics (date, metric_name, metric_value)
    SELECT 
        '{{ ds }}'::date,
        'total_revenue',
        SUM(total_amount)
    FROM transactions_{{ ds_nodash }};
    """,
    dag=dag
)

# 7. 데이터 품질 리포트 생성
generate_quality_report = PythonOperator(
    task_id='generate_quality_report',
    python_callable=lambda **context: generate_dq_report(context['execution_date']),
    dag=dag
)

# 8. 알림 전송
send_completion_notification = PythonOperator(
    task_id='send_completion_notification',
    python_callable=lambda **context: send_slack_notification(
        f"✅ Daily ETL completed successfully for {context['execution_date'].strftime('%Y-%m-%d')}"
    ),
    dag=dag
)

# 작업 의존성 정의
validate_raw_data >> [process_events, aggregate_transactions]
process_events >> calculate_segments
aggregate_transactions >> generate_recommendation_features
[calculate_segments, generate_recommendation_features] >> load_to_warehouse
load_to_warehouse >> generate_quality_report >> send_completion_notification
```

### Spark 데이터 처리 작업
```python
# jobs/process_daily_events.py
from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import *
import argparse

def create_spark_session():
    return SparkSession.builder \
        .appName("Daily Events Processing") \
        .config("spark.sql.adaptive.enabled", "true") \
        .config("spark.sql.adaptive.coalescePartitions.enabled", "true") \
        .getOrCreate()

def process_events(spark, input_path, output_path, date):
    # 이벤트 스키마 정의
    event_schema = StructType([
        StructField("eventId", StringType(), True),
        StructField("userId", StringType(), True),
        StructField("sessionId", StringType(), False),
        StructField("eventType", StringType(), False),
        StructField("timestamp", LongType(), False),
        StructField("properties", MapType(StringType(), StringType()), True),
        StructField("context", StructType([
            StructField("userAgent", StringType(), True),
            StructField("ip", StringType(), True),
            StructField("platform", StringType(), True),
            StructField("referrer", StringType(), True)
        ]), True)
    ])
    
    # 원본 이벤트 데이터 로드
    events_df = spark.read \
        .schema(event_schema) \
        .option("multiline", "true") \
        .json(input_path)
    
    # 데이터 정제 및 변환
    cleaned_events = events_df \
        .filter(col("eventType").isNotNull()) \
        .filter(col("timestamp").isNotNull()) \
        .withColumn("event_date", to_date(from_unixtime(col("timestamp") / 1000))) \
        .withColumn("event_hour", hour(from_unixtime(col("timestamp") / 1000))) \
        .withColumn("user_agent_parsed", parse_user_agent(col("context.userAgent"))) \
        .withColumn("geo_info", get_geo_info(col("context.ip")))
    
    # 세션 레벨 집계
    session_metrics = cleaned_events \
        .groupBy("sessionId", "userId", "event_date") \
        .agg(
            count("*").alias("total_events"),
            countDistinct("eventType").alias("unique_event_types"),
            sum(when(col("eventType") == "page_view", 1).otherwise(0)).alias("page_views"),
            sum(when(col("eventType") == "click", 1).otherwise(0)).alias("clicks"),
            sum(when(col("eventType") == "purchase", 1).otherwise(0)).alias("purchases"),
            min("timestamp").alias("session_start"),
            max("timestamp").alias("session_end"),
            collect_set("properties.page").alias("pages_visited"),
            first("geo_info.country").alias("country"),
            first("user_agent_parsed.device_type").alias("device_type")
        ) \
        .withColumn("session_duration_minutes", 
                   (col("session_end") - col("session_start")) / 60000) \
        .withColumn("has_conversion", col("purchases") > 0)
    
    # 사용자 레벨 일별 집계
    user_daily_metrics = cleaned_events \
        .filter(col("userId").isNotNull()) \
        .groupBy("userId", "event_date") \
        .agg(
            countDistinct("sessionId").alias("sessions"),
            count("*").alias("total_events"),
            sum(when(col("eventType") == "page_view", 1).otherwise(0)).alias("page_views"),
            sum(when(col("eventType") == "purchase", 1).otherwise(0)).alias("purchases"),
            sum(when(col("eventType") == "purchase", 
                    col("properties.amount").cast(DoubleType())).otherwise(0)).alias("total_spent"),
            collect_set("properties.category").alias("categories_viewed"),
            first("geo_info.country").alias("country"),
            first("user_agent_parsed.device_type").alias("primary_device")
        )
    
    # 제품 인기도 계산
    product_metrics = cleaned_events \
        .filter(col("eventType").isin(["page_view", "click", "add_to_cart", "purchase"])) \
        .filter(col("properties.productId").isNotNull()) \
        .groupBy("properties.productId", "event_date") \
        .agg(
            sum(when(col("eventType") == "page_view", 1).otherwise(0)).alias("views"),
            sum(when(col("eventType") == "click", 1).otherwise(0)).alias("clicks"),
            sum(when(col("eventType") == "add_to_cart", 1).otherwise(0)).alias("cart_adds"),
            sum(when(col("eventType") == "purchase", 1).otherwise(0)).alias("purchases"),
            countDistinct("userId").alias("unique_users"),
            first("properties.category").alias("category"),
            first("properties.price").cast(DoubleType()).alias("price")
        ) \
        .withColumn("view_to_cart_rate", col("cart_adds") / col("views")) \
        .withColumn("cart_to_purchase_rate", col("purchases") / col("cart_adds"))
    
    # 결과 저장
    cleaned_events.write \
        .mode("overwrite") \
        .partitionBy("event_date", "event_hour") \
        .parquet(f"{output_path}/events")
    
    session_metrics.write \
        .mode("overwrite") \
        .partitionBy("event_date") \
        .parquet(f"{output_path}/session_metrics")
    
    user_daily_metrics.write \
        .mode("overwrite") \
        .partitionBy("event_date") \
        .parquet(f"{output_path}/user_daily_metrics")
    
    product_metrics.write \
        .mode("overwrite") \
        .partitionBy("event_date") \
        .parquet(f"{output_path}/product_metrics")
    
    # 데이터 품질 메트릭 계산
    quality_metrics = {
        "total_events": cleaned_events.count(),
        "unique_users": cleaned_events.filter(col("userId").isNotNull()).select("userId").distinct().count(),
        "unique_sessions": cleaned_events.select("sessionId").distinct().count(),
        "null_user_rate": cleaned_events.filter(col("userId").isNull()).count() / cleaned_events.count(),
        "event_types": cleaned_events.select("eventType").distinct().collect()
    }
    
    # 품질 메트릭을 JSON으로 저장
    spark.createDataFrame([quality_metrics]).write \
        .mode("overwrite") \
        .json(f"{output_path}/quality_metrics")

@udf(returnType=StructType([
    StructField("browser", StringType(), True),
    StructField("device_type", StringType(), True),
    StructField("os", StringType(), True)
]))
def parse_user_agent(user_agent):
    from user_agents import parse
    
    if user_agent is None:
        return {"browser": None, "device_type": None, "os": None}
    
    parsed = parse(user_agent)
    return {
        "browser": parsed.browser.family,
        "device_type": "mobile" if parsed.is_mobile else "tablet" if parsed.is_tablet else "desktop",
        "os": parsed.os.family
    }

@udf(returnType=StructType([
    StructField("country", StringType(), True),
    StructField("city", StringType(), True),
    StructField("latitude", DoubleType(), True),
    StructField("longitude", DoubleType(), True)
]))
def get_geo_info(ip_address):
    import geoip2.database
    
    if ip_address is None:
        return {"country": None, "city": None, "latitude": None, "longitude": None}
    
    try:
        with geoip2.database.Reader('/opt/geoip/GeoLite2-City.mmdb') as reader:
            response = reader.city(ip_address)
            return {
                "country": response.country.iso_code,
                "city": response.city.name,
                "latitude": float(response.location.latitude) if response.location.latitude else None,
                "longitude": float(response.location.longitude) if response.location.longitude else None
            }
    except:
        return {"country": None, "city": None, "latitude": None, "longitude": None}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-path", required=True)
    parser.add_argument("--output-path", required=True)
    parser.add_argument("--date", required=True)
    
    args = parser.parse_args()
    
    spark = create_spark_session()
    
    try:
        process_events(spark, args.input_path, args.output_path, args.date)
        print(f"Successfully processed events for {args.date}")
    except Exception as e:
        print(f"Error processing events: {str(e)}")
        raise
    finally:
        spark.stop()
```

## Phase 4: ML 파이프라인 통합

### Feature Store 구현
```python
# feature_store/user_features.py
import pandas as pd
from feast import Entity, Feature, FeatureView, ValueType
from feast.data_source import BigQuerySource
from datetime import timedelta

# 사용자 엔티티 정의
user = Entity(
    name="user_id",
    value_type=ValueType.STRING,
    description="User identifier"
)

# 사용자 행동 피처 소스
user_behavior_source = BigQuerySource(
    table_ref="ecommerce.user_behavior_features",
    event_timestamp_column="timestamp",
    created_timestamp_column="created_at"
)

# 사용자 행동 피처 뷰
user_behavior_features = FeatureView(
    name="user_behavior_features",
    entities=["user_id"],
    ttl=timedelta(days=30),
    features=[
        Feature(name="avg_session_duration", dtype=ValueType.DOUBLE),
        Feature(name="total_page_views_7d", dtype=ValueType.INT64),
        Feature(name="total_purchases_30d", dtype=ValueType.INT64),
        Feature(name="avg_order_value", dtype=ValueType.DOUBLE),
        Feature(name="preferred_category", dtype=ValueType.STRING),
        Feature(name="device_type", dtype=ValueType.STRING),
        Feature(name="last_activity_days_ago", dtype=ValueType.INT64),
        Feature(name="churn_risk_score", dtype=ValueType.DOUBLE),
    ],
    batch_source=user_behavior_source,
    tags={"team": "ml", "domain": "user_behavior"}
)

# 실시간 피처 계산
class RealTimeFeatureCalculator:
    def __init__(self, redis_client, feast_client):
        self.redis = redis_client
        self.feast = feast_client
    
    def calculate_user_features(self, user_id, events):
        """실시간으로 사용자 피처를 계산하고 업데이트"""
        
        # 현재 피처 값 가져오기
        current_features = self.feast.get_online_features(
            features=["user_behavior_features:total_page_views_7d",
                     "user_behavior_features:avg_session_duration"],
            entity_rows=[{"user_id": user_id}]
        ).to_dict()
        
        # 새 이벤트를 기반으로 피처 업데이트
        page_views = sum(1 for e in events if e['event_type'] == 'page_view')
        session_durations = [e['session_duration'] for e in events if 'session_duration' in e]
        
        updated_features = {
            "user_id": user_id,
            "total_page_views_7d": current_features.get("total_page_views_7d", 0) + page_views,
            "avg_session_duration": np.mean(session_durations) if session_durations else current_features.get("avg_session_duration", 0),
            "timestamp": datetime.now()
        }
        
        # Redis에 실시간 피처 저장
        self.redis.hset(f"user_features:{user_id}", mapping=updated_features)
        
        return updated_features
    
    def get_recommendation_features(self, user_id, product_ids):
        """추천 시스템을 위한 피처 조합"""
        
        # 사용자 피처
        user_features = self.feast.get_online_features(
            features=["user_behavior_features:avg_order_value",
                     "user_behavior_features:preferred_category",
                     "user_behavior_features:device_type"],
            entity_rows=[{"user_id": user_id}]
        ).to_dict()
        
        # 제품 피처
        product_features = self.feast.get_online_features(
            features=["product_features:category",
                     "product_features:price",
                     "product_features:popularity_score"],
            entity_rows=[{"product_id": pid} for pid in product_ids]
        ).to_dict()
        
        # 상호작용 피처 계산
        interaction_features = []
        for i, product_id in enumerate(product_ids):
            features = {
                "user_id": user_id,
                "product_id": product_id,
                "price_vs_avg_order": product_features["price"][i] / user_features["avg_order_value"],
                "category_match": product_features["category"][i] == user_features["preferred_category"],
                "device_optimization": self.calculate_device_optimization(
                    user_features["device_type"], product_features["category"][i]
                )
            }
            interaction_features.append(features)
        
        return interaction_features
    
    def calculate_device_optimization(self, device_type, product_category):
        """디바이스 타입과 제품 카테고리의 최적화 점수"""
        optimization_matrix = {
            ("mobile", "electronics"): 0.8,
            ("mobile", "fashion"): 0.9,
            ("desktop", "electronics"): 0.9,
            ("desktop", "fashion"): 0.7,
            ("tablet", "books"): 0.9,
        }
        return optimization_matrix.get((device_type, product_category), 0.5)
```

## 프로젝트 성과 및 배운 점

### 개발 성과
```yaml
infrastructure_metrics:
  data_volume: "일일 15TB 처리"
  latency: "스트림 처리 < 500ms"
  throughput: "100,000 events/second"
  availability: "99.9% uptime"
  cost_optimization: "40% 비용 절감"

business_impact:
  real_time_insights: "실시간 대시보드 구축"
  ml_features: "200+ 피처 자동 생성"
  data_quality: "95% 데이터 품질 보장"
  analytics_speed: "쿼리 응답 시간 80% 개선"
```

### AI 워크플로우 활용 효과
1. **아키텍처 설계**: Lambda 아키텍처 설계 및 최적화 자동화
2. **스트림 처리**: Flink 작업 코드 생성 및 상태 관리 구현
3. **배치 처리**: Airflow DAG 및 Spark 작업 자동 생성
4. **모니터링**: 실시간 대시보드 및 알람 시스템 구축
5. **ML 통합**: Feature Store 설계 및 실시간 피처 계산 구현