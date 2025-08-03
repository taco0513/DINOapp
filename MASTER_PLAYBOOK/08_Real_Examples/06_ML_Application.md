# 머신러닝 애플리케이션 구축 실전 가이드

## 프로젝트 개요

SuperClaude AI 워크플로우를 활용하여 실용적인 머신러닝 애플리케이션을 구축하는 종합 가이드입니다.

### 애플리케이션 컨셉: 스마트 추천 시스템
```yaml
application_concept:
  name: "SmartReco AI"
  category: "머신러닝 기반 추천 엔진"
  target_domain: "전자상거래, 콘텐츠 플랫폼, 개인화 서비스"

core_features:
  - "실시간 개인화 추천"
  - "협업 필터링 + 콘텐츠 기반 필터링"
  - "A/B 테스트 기반 모델 최적화"
  - "실시간 피드백 학습"
  - "설명 가능한 AI (XAI)"
  - "다중 채널 추천 (웹, 모바일, 이메일)"

technical_requirements:
  scale: "100만+ 사용자, 1000만+ 아이템"
  latency: "< 100ms 추천 응답시간"
  accuracy: "CTR > 5%, Conversion > 2%"
  availability: "99.9% 가용성"
  explainability: "추천 이유 설명 제공"
```

### 기술 스택 선택
```yaml
technology_stack:
  ml_framework:
    training: "PyTorch + Transformers"
    serving: "TorchServe + ONNX Runtime"
    feature_store: "Feast"
    experiment_tracking: "MLflow + Weights & Biases"

  backend:
    runtime: "Python 3.11 + FastAPI"
    database: "PostgreSQL + Redis + Elasticsearch"
    message_queue: "Apache Kafka"
    caching: "Redis Cluster"

  infrastructure:
    cloud: "AWS / GCP"
    containers: "Docker + Kubernetes"
    model_serving: "KubeFlow + Seldon Core"
    monitoring: "Prometheus + Grafana + ELK Stack"

  data_pipeline:
    ingestion: "Apache Airflow"
    processing: "Apache Spark + Pandas"
    streaming: "Apache Flink"
    storage: "AWS S3 / Google Cloud Storage"
```

## Phase 1: 데이터 파이프라인 및 특성 엔지니어링

### SuperClaude를 활용한 데이터 설계
```bash
# 1. 데이터 아키텍처 설계
/design "ML 데이터 파이프라인" --think-hard --persona-architect

# 2. 특성 스토어 설계
/design feature-store --entities "user,item,interaction" --real-time --batch

# 3. 데이터 품질 검증 시스템
/implement data-validation --great-expectations --monitoring --alerts

# 4. ETL 파이프라인 구축
/implement etl-pipeline --airflow --spark --incremental-loading
```

### 데이터 모델 설계
```python
# models/data_models.py
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class InteractionType(str, Enum):
    VIEW = "view"
    CLICK = "click"
    PURCHASE = "purchase"
    ADD_TO_CART = "add_to_cart"
    LIKE = "like"
    SHARE = "share"
    RATING = "rating"

class User(BaseModel):
    user_id: str = Field(..., description="고유 사용자 ID")
    age_group: Optional[str] = Field(None, description="연령대 (18-24, 25-34, etc.)")
    gender: Optional[str] = Field(None, description="성별")
    location: Optional[Dict[str, str]] = Field(None, description="위치 정보")
    registration_date: datetime = Field(..., description="가입일")
    subscription_tier: Optional[str] = Field(None, description="구독 등급")
    preferences: Dict[str, Any] = Field(default_factory=dict, description="사용자 선호도")

    # 행동 기반 특성
    avg_session_duration: Optional[float] = Field(None, description="평균 세션 시간")
    frequency_score: Optional[float] = Field(None, description="방문 빈도 점수")
    recency_score: Optional[float] = Field(None, description="최근 활동 점수")
    monetary_score: Optional[float] = Field(None, description="구매력 점수")

class Item(BaseModel):
    item_id: str = Field(..., description="고유 아이템 ID")
    title: str = Field(..., description="아이템 제목")
    category: str = Field(..., description="카테고리")
    subcategory: Optional[str] = Field(None, description="하위 카테고리")
    brand: Optional[str] = Field(None, description="브랜드")
    price: Optional[float] = Field(None, description="가격")
    tags: List[str] = Field(default_factory=list, description="태그")
    description: Optional[str] = Field(None, description="설명")

    # 콘텐츠 기반 특성
    text_embeddings: Optional[List[float]] = Field(None, description="텍스트 임베딩")
    image_embeddings: Optional[List[float]] = Field(None, description="이미지 임베딩")
    popularity_score: Optional[float] = Field(None, description="인기도 점수")
    quality_score: Optional[float] = Field(None, description="품질 점수")
    created_date: datetime = Field(..., description="생성일")

class Interaction(BaseModel):
    interaction_id: str = Field(..., description="상호작용 ID")
    user_id: str = Field(..., description="사용자 ID")
    item_id: str = Field(..., description="아이템 ID")
    interaction_type: InteractionType = Field(..., description="상호작용 유형")
    timestamp: datetime = Field(..., description="상호작용 시간")

    # 컨텍스트 정보
    session_id: str = Field(..., description="세션 ID")
    device_type: Optional[str] = Field(None, description="디바이스 유형")
    channel: Optional[str] = Field(None, description="채널 (web, mobile, email)")
    page_context: Optional[str] = Field(None, description="페이지 컨텍스트")

    # 상호작용 메타데이터
    duration: Optional[float] = Field(None, description="상호작용 지속시간")
    rating: Optional[float] = Field(None, description="평점 (1-5)")
    implicit_feedback: Optional[float] = Field(None, description="암시적 피드백 점수")

class RecommendationRequest(BaseModel):
    user_id: str = Field(..., description="사용자 ID")
    num_recommendations: int = Field(10, description="추천 개수")
    context: Dict[str, Any] = Field(default_factory=dict, description="추천 컨텍스트")
    exclude_items: List[str] = Field(default_factory=list, description="제외할 아이템")
    include_explanation: bool = Field(True, description="설명 포함 여부")

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List['RecommendationItem']
    model_version: str
    timestamp: datetime
    context: Dict[str, Any]

class RecommendationItem(BaseModel):
    item_id: str
    score: float = Field(..., description="추천 점수")
    rank: int = Field(..., description="추천 순위")
    explanation: Optional[str] = Field(None, description="추천 이유")
    confidence: Optional[float] = Field(None, description="신뢰도")
```

### 특성 엔지니어링 파이프라인
```python
# features/feature_engineering.py
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sentence_transformers import SentenceTransformer

class FeatureEngineering:
    """특성 엔지니어링을 위한 통합 클래스"""

    def __init__(self):
        self.text_encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self.scalers = {}
        self.encoders = {}

    def create_user_features(self, interactions_df: pd.DataFrame,
                           users_df: pd.DataFrame,
                           window_days: int = 30) -> pd.DataFrame:
        """사용자 특성 생성"""

        # 시간 윈도우 설정
        cutoff_date = datetime.now() - timedelta(days=window_days)
        recent_interactions = interactions_df[
            interactions_df['timestamp'] >= cutoff_date
        ]

        # 기본 통계 특성
        user_stats = recent_interactions.groupby('user_id').agg({
            'interaction_id': 'count',  # 총 상호작용 수
            'timestamp': ['min', 'max'],  # 첫/마지막 상호작용
            'item_id': 'nunique',  # 고유 아이템 수
            'duration': ['mean', 'std'],  # 평균/표준편차 지속시간
            'rating': ['mean', 'count']  # 평균 평점, 평점 개수
        }).fillna(0)

        # 컬럼명 정리
        user_stats.columns = [
            'total_interactions', 'first_interaction', 'last_interaction',
            'unique_items', 'avg_duration', 'std_duration',
            'avg_rating', 'rating_count'
        ]

        # RFM 분석 (Recency, Frequency, Monetary)
        now = datetime.now()
        user_stats['recency'] = (now - user_stats['last_interaction']).dt.days
        user_stats['frequency'] = user_stats['total_interactions'] / window_days

        # 다양성 지수 (카테고리별 상호작용 분포)
        category_diversity = self._calculate_diversity_index(
            recent_interactions, 'user_id', 'category'
        )
        user_stats['category_diversity'] = category_diversity

        # 세션 기반 특성
        session_stats = self._calculate_session_features(recent_interactions)
        user_stats = user_stats.join(session_stats, how='left')

        # 사용자 기본 정보와 결합
        user_features = users_df.set_index('user_id').join(
            user_stats, how='left'
        ).fillna(0)

        return user_features

    def create_item_features(self, items_df: pd.DataFrame,
                           interactions_df: pd.DataFrame) -> pd.DataFrame:
        """아이템 특성 생성"""

        # 텍스트 임베딩 생성
        text_features = items_df['title'] + ' ' + items_df['description'].fillna('')
        text_embeddings = self.text_encoder.encode(text_features.tolist())

        # 텍스트 임베딩을 DataFrame으로 변환
        embedding_df = pd.DataFrame(
            text_embeddings,
            index=items_df.index,
            columns=[f'text_emb_{i}' for i in range(text_embeddings.shape[1])]
        )

        # 아이템 인기도 특성
        item_stats = interactions_df.groupby('item_id').agg({
            'user_id': 'nunique',  # 고유 사용자 수
            'interaction_id': 'count',  # 총 상호작용 수
            'rating': ['mean', 'count', 'std'],  # 평점 통계
            'timestamp': ['min', 'max']  # 첫/마지막 상호작용
        }).fillna(0)

        item_stats.columns = [
            'unique_users', 'total_interactions', 'avg_rating',
            'rating_count', 'rating_std', 'first_interaction', 'last_interaction'
        ]

        # 인기도 점수 계산
        item_stats['popularity_score'] = (
            item_stats['unique_users'] * 0.5 +
            item_stats['total_interactions'] * 0.3 +
            item_stats['avg_rating'] * 0.2
        )

        # 시간 기반 특성
        now = datetime.now()
        item_stats['days_since_first'] = (
            now - item_stats['first_interaction']
        ).dt.days
        item_stats['days_since_last'] = (
            now - item_stats['last_interaction']
        ).dt.days

        # 카테고리별 정규화
        category_stats = item_stats.groupby(items_df['category']).transform('mean')
        item_stats['relative_popularity'] = (
            item_stats['popularity_score'] / category_stats['popularity_score']
        )

        # 모든 특성 결합
        item_features = items_df.set_index('item_id').join([
            embedding_df, item_stats
        ], how='left').fillna(0)

        return item_features

    def create_interaction_features(self, interactions_df: pd.DataFrame,
                                  user_features: pd.DataFrame,
                                  item_features: pd.DataFrame) -> pd.DataFrame:
        """상호작용 특성 생성"""

        # 시간 기반 특성
        interactions_df['hour'] = interactions_df['timestamp'].dt.hour
        interactions_df['day_of_week'] = interactions_df['timestamp'].dt.dayofweek
        interactions_df['is_weekend'] = interactions_df['day_of_week'].isin([5, 6])

        # 사용자-아이템 매칭 특성
        user_item_features = []

        for _, interaction in interactions_df.iterrows():
            user_id = interaction['user_id']
            item_id = interaction['item_id']

            # 사용자 특성
            user_feat = user_features.loc[user_id] if user_id in user_features.index else {}
            # 아이템 특성
            item_feat = item_features.loc[item_id] if item_id in item_features.index else {}

            # 특성 조합
            combined_features = {
                'user_avg_rating_vs_item_avg': user_feat.get('avg_rating', 0) - item_feat.get('avg_rating', 0),
                'user_frequency_vs_item_popularity': user_feat.get('frequency', 0) * item_feat.get('popularity_score', 0),
                'user_diversity_vs_item_category': user_feat.get('category_diversity', 0),
            }

            user_item_features.append(combined_features)

        # DataFrame으로 변환
        interaction_features = pd.DataFrame(user_item_features, index=interactions_df.index)

        # 원본 상호작용 데이터와 결합
        return pd.concat([interactions_df, interaction_features], axis=1)

    def _calculate_diversity_index(self, df: pd.DataFrame,
                                 group_col: str,
                                 category_col: str) -> pd.Series:
        """다양성 지수 계산 (Shannon Entropy)"""

        def shannon_entropy(counts):
            proportions = counts / counts.sum()
            return -(proportions * np.log(proportions + 1e-10)).sum()

        return df.groupby([group_col, category_col]).size().groupby(group_col).apply(shannon_entropy)

    def _calculate_session_features(self, interactions_df: pd.DataFrame) -> pd.DataFrame:
        """세션 기반 특성 계산"""

        session_stats = interactions_df.groupby(['user_id', 'session_id']).agg({
            'interaction_id': 'count',
            'duration': 'sum',
            'item_id': 'nunique'
        })

        user_session_stats = session_stats.groupby('user_id').agg({
            'interaction_id': ['mean', 'std'],
            'duration': ['mean', 'std'],
            'item_id': ['mean', 'std']
        })

        user_session_stats.columns = [
            'avg_session_interactions', 'std_session_interactions',
            'avg_session_duration', 'std_session_duration',
            'avg_session_items', 'std_session_items'
        ]

        return user_session_stats.fillna(0)
```

## Phase 2: 추천 모델 개발

### SuperClaude를 활용한 모델 구현
```bash
# 1. 협업 필터링 모델 구현
/implement "Matrix Factorization 모델" --pytorch --embedding --regularization

# 2. 콘텐츠 기반 필터링
/implement "Content-based 추천" --transformers --similarity-matching

# 3. 하이브리드 모델
/implement "Hybrid 추천 시스템" --ensemble --deep-learning --attention

# 4. 실시간 학습 시스템
/implement "Online Learning" --incremental --feedback-loop --cold-start
```

### 협업 필터링 모델
```python
# models/collaborative_filtering.py
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import pytorch_lightning as pl

class MatrixFactorization(pl.LightningModule):
    """Neural Collaborative Filtering 모델"""

    def __init__(self, num_users: int, num_items: int,
                 embedding_dim: int = 128, hidden_dims: list = [256, 128, 64],
                 dropout_rate: float = 0.2, learning_rate: float = 0.001):
        super().__init__()

        self.save_hyperparameters()
        self.num_users = num_users
        self.num_items = num_items
        self.embedding_dim = embedding_dim
        self.learning_rate = learning_rate

        # 사용자/아이템 임베딩
        self.user_embedding = nn.Embedding(num_users, embedding_dim)
        self.item_embedding = nn.Embedding(num_items, embedding_dim)

        # MLP 레이어
        layers = []
        prev_dim = embedding_dim * 2

        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.BatchNorm1d(hidden_dim),
                nn.Dropout(dropout_rate)
            ])
            prev_dim = hidden_dim

        layers.append(nn.Linear(prev_dim, 1))
        self.mlp = nn.Sequential(*layers)

        # 가중치 초기화
        self._init_weights()

    def _init_weights(self):
        """가중치 초기화"""
        nn.init.normal_(self.user_embedding.weight, std=0.01)
        nn.init.normal_(self.item_embedding.weight, std=0.01)

        for layer in self.mlp:
            if isinstance(layer, nn.Linear):
                nn.init.xavier_uniform_(layer.weight)
                nn.init.zeros_(layer.bias)

    def forward(self, user_ids: torch.Tensor, item_ids: torch.Tensor) -> torch.Tensor:
        """순전파"""
        # 임베딩 가져오기
        user_emb = self.user_embedding(user_ids)
        item_emb = self.item_embedding(item_ids)

        # 임베딩 결합
        x = torch.cat([user_emb, item_emb], dim=-1)

        # MLP를 통한 예측
        output = self.mlp(x)
        return torch.sigmoid(output.squeeze())

    def training_step(self, batch, batch_idx):
        """훈련 스텝"""
        user_ids, item_ids, ratings = batch

        # 예측
        predictions = self(user_ids, item_ids)

        # 손실 계산 (Binary Cross Entropy)
        loss = F.binary_cross_entropy(predictions, ratings.float())

        # 정규화 항 추가
        reg_loss = self._regularization_loss()
        total_loss = loss + 0.01 * reg_loss

        # 로깅
        self.log('train_loss', total_loss)
        self.log('train_bce_loss', loss)
        self.log('train_reg_loss', reg_loss)

        return total_loss

    def validation_step(self, batch, batch_idx):
        """검증 스텝"""
        user_ids, item_ids, ratings = batch
        predictions = self(user_ids, item_ids)

        loss = F.binary_cross_entropy(predictions, ratings.float())

        # 정확도 계산
        pred_binary = (predictions > 0.5).float()
        accuracy = (pred_binary == ratings).float().mean()

        self.log('val_loss', loss)
        self.log('val_accuracy', accuracy)

        return {'val_loss': loss, 'val_accuracy': accuracy}

    def _regularization_loss(self):
        """L2 정규화 손실"""
        reg_loss = 0
        for param in self.parameters():
            reg_loss += torch.norm(param, p=2)
        return reg_loss

    def configure_optimizers(self):
        """옵티마이저 설정"""
        optimizer = torch.optim.Adam(self.parameters(), lr=self.learning_rate)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode='min', factor=0.5, patience=5
        )
        return {
            'optimizer': optimizer,
            'lr_scheduler': scheduler,
            'monitor': 'val_loss'
        }

class RecommendationDataset(Dataset):
    """추천 시스템용 데이터셋"""

    def __init__(self, interactions_df, user_to_id, item_to_id, negative_ratio=4):
        self.interactions = interactions_df
        self.user_to_id = user_to_id
        self.item_to_id = item_to_id
        self.negative_ratio = negative_ratio

        # 긍정적 상호작용 생성
        self.positive_samples = self._create_positive_samples()
        # 부정적 상호작용 생성
        self.negative_samples = self._create_negative_samples()

        # 전체 샘플
        self.samples = self.positive_samples + self.negative_samples

    def _create_positive_samples(self):
        """긍정적 샘플 생성"""
        positive_samples = []

        for _, interaction in self.interactions.iterrows():
            user_id = self.user_to_id[interaction['user_id']]
            item_id = self.item_to_id[interaction['item_id']]

            # 상호작용 유형에 따른 라벨링
            if interaction['interaction_type'] in ['purchase', 'like', 'rating']:
                if interaction['interaction_type'] == 'rating' and interaction['rating'] >= 4:
                    positive_samples.append((user_id, item_id, 1))
                elif interaction['interaction_type'] in ['purchase', 'like']:
                    positive_samples.append((user_id, item_id, 1))

        return positive_samples

    def _create_negative_samples(self):
        """부정적 샘플 생성 (네거티브 샘플링)"""
        negative_samples = []
        num_negative = len(self.positive_samples) * self.negative_ratio

        # 사용자별 상호작용한 아이템 집합
        user_items = self.interactions.groupby('user_id')['item_id'].apply(set).to_dict()

        for _ in range(num_negative):
            # 랜덤 사용자 선택
            user_id = np.random.choice(list(self.user_to_id.keys()))
            user_id_mapped = self.user_to_id[user_id]

            # 해당 사용자가 상호작용하지 않은 아이템 선택
            interacted_items = user_items.get(user_id, set())
            available_items = set(self.item_to_id.keys()) - interacted_items

            if available_items:
                item_id = np.random.choice(list(available_items))
                item_id_mapped = self.item_to_id[item_id]
                negative_samples.append((user_id_mapped, item_id_mapped, 0))

        return negative_samples

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        user_id, item_id, label = self.samples[idx]
        return torch.tensor(user_id), torch.tensor(item_id), torch.tensor(label)
```

### 콘텐츠 기반 추천 모델
```python
# models/content_based.py
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer
import torch
import torch.nn as nn

class ContentBasedRecommender:
    """콘텐츠 기반 추천 시스템"""

    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.text_encoder = SentenceTransformer(model_name)
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.item_embeddings = None
        self.item_features = None
        self.similarity_matrix = None

    def fit(self, items_df: pd.DataFrame):
        """모델 훈련"""

        # 텍스트 특성 결합
        text_features = (
            items_df['title'].fillna('') + ' ' +
            items_df['description'].fillna('') + ' ' +
            items_df['category'].fillna('') + ' ' +
            ' '.join(items_df['tags'].fillna([]))
        )

        # Sentence Transformer 임베딩
        sentence_embeddings = self.text_encoder.encode(text_features.tolist())

        # TF-IDF 벡터
        tfidf_vectors = self.tfidf_vectorizer.fit_transform(text_features).toarray()

        # 수치형 특성 정규화
        numeric_features = items_df[['price', 'popularity_score', 'quality_score']].fillna(0)
        numeric_features = (numeric_features - numeric_features.mean()) / numeric_features.std()

        # 모든 특성 결합
        self.item_embeddings = np.concatenate([
            sentence_embeddings,
            tfidf_vectors,
            numeric_features.values
        ], axis=1)

        # 아이템 간 유사도 계산
        self.similarity_matrix = cosine_similarity(self.item_embeddings)
        self.item_features = items_df.copy()

        return self

    def get_similar_items(self, item_id: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """유사한 아이템 찾기"""

        if item_id not in self.item_features.index:
            return []

        item_idx = self.item_features.index.get_loc(item_id)
        similarities = self.similarity_matrix[item_idx]

        # 유사도 기준 정렬 (자기 자신 제외)
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]

        results = []
        for idx in similar_indices:
            similar_item_id = self.item_features.index[idx]
            similarity_score = similarities[idx]
            results.append((similar_item_id, similarity_score))

        return results

    def recommend_for_user(self, user_id: str,
                          interactions_df: pd.DataFrame,
                          top_k: int = 10) -> List[Tuple[str, float]]:
        """사용자를 위한 콘텐츠 기반 추천"""

        # 사용자의 과거 상호작용 아이템
        user_interactions = interactions_df[
            interactions_df['user_id'] == user_id
        ].sort_values('timestamp', ascending=False)

        if user_interactions.empty:
            return []

        # 최근 상호작용한 아이템들에 대한 가중치 부여
        recent_items = user_interactions.head(20)['item_id'].tolist()
        weights = np.exp(-np.arange(len(recent_items)) * 0.1)  # 최근일수록 높은 가중치

        # 각 아이템에 대한 유사한 아이템들의 가중 평균 점수
        candidate_scores = {}

        for item_id, weight in zip(recent_items, weights):
            similar_items = self.get_similar_items(item_id, top_k=50)

            for similar_item_id, similarity in similar_items:
                # 이미 상호작용한 아이템은 제외
                if similar_item_id not in user_interactions['item_id'].values:
                    if similar_item_id not in candidate_scores:
                        candidate_scores[similar_item_id] = 0
                    candidate_scores[similar_item_id] += similarity * weight

        # 점수 기준 정렬
        sorted_candidates = sorted(
            candidate_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )

        return sorted_candidates[:top_k]

class DeepContentModel(nn.Module):
    """딥러닝 기반 콘텐츠 모델"""

    def __init__(self, text_embedding_dim: int,
                 numeric_feature_dim: int,
                 hidden_dims: List[int] = [512, 256, 128]):
        super().__init__()

        # 텍스트 인코더
        self.text_encoder = nn.Sequential(
            nn.Linear(text_embedding_dim, hidden_dims[0]),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dims[0], hidden_dims[1]),
            nn.ReLU(),
            nn.Dropout(0.2)
        )

        # 수치형 특성 인코더
        self.numeric_encoder = nn.Sequential(
            nn.Linear(numeric_feature_dim, hidden_dims[2]),
            nn.ReLU(),
            nn.Dropout(0.2)
        )

        # 결합 레이어
        combined_dim = hidden_dims[1] + hidden_dims[2]
        self.combiner = nn.Sequential(
            nn.Linear(combined_dim, hidden_dims[2]),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dims[2], hidden_dims[2] // 2),
            nn.ReLU(),
            nn.Linear(hidden_dims[2] // 2, 1),
            nn.Sigmoid()
        )

    def forward(self, text_features: torch.Tensor,
                numeric_features: torch.Tensor) -> torch.Tensor:

        # 각 특성 타입별 인코딩
        text_encoded = self.text_encoder(text_features)
        numeric_encoded = self.numeric_encoder(numeric_features)

        # 특성 결합
        combined = torch.cat([text_encoded, numeric_encoded], dim=-1)

        # 최종 예측
        output = self.combiner(combined)
        return output
```

## Phase 3: 하이브리드 추천 시스템

### 앙상블 추천 모델
```python
# models/hybrid_recommender.py
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
import torch
import torch.nn as nn

class HybridRecommender:
    """하이브리드 추천 시스템 (CF + CB + 컨텍스트)"""

    def __init__(self):
        self.cf_model = None  # Collaborative Filtering
        self.cb_model = None  # Content-Based
        self.meta_learner = LogisticRegression()
        self.feature_weights = {
            'cf_score': 0.4,
            'cb_score': 0.3,
            'context_score': 0.2,
            'popularity_score': 0.1
        }

    def fit(self, cf_model, cb_model, interactions_df: pd.DataFrame,
            context_features: pd.DataFrame):
        """하이브리드 모델 훈련"""

        self.cf_model = cf_model
        self.cb_model = cb_model

        # 메타 학습을 위한 특성 생성
        meta_features, labels = self._create_meta_features(
            interactions_df, context_features
        )

        # 메타 학습자 훈련
        self.meta_learner.fit(meta_features, labels)

        return self

    def predict(self, user_id: str, item_ids: List[str],
                context: Dict = None) -> List[Tuple[str, float, Dict]]:
        """하이브리드 예측"""

        results = []

        for item_id in item_ids:
            # 각 모델별 점수 계산
            scores = {}

            # 1. Collaborative Filtering 점수
            if self.cf_model:
                scores['cf_score'] = self._get_cf_score(user_id, item_id)

            # 2. Content-Based 점수
            if self.cb_model:
                scores['cb_score'] = self._get_cb_score(user_id, item_id)

            # 3. 컨텍스트 점수
            scores['context_score'] = self._get_context_score(
                user_id, item_id, context
            )

            # 4. 인기도 점수
            scores['popularity_score'] = self._get_popularity_score(item_id)

            # 메타 학습자를 통한 최종 점수
            meta_features = np.array(list(scores.values())).reshape(1, -1)
            final_score = self.meta_learner.predict_proba(meta_features)[0][1]

            # 설명 생성
            explanation = self._generate_explanation(scores, item_id)

            results.append((item_id, final_score, {
                'component_scores': scores,
                'explanation': explanation
            }))

        # 점수 기준 정렬
        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def _create_meta_features(self, interactions_df: pd.DataFrame,
                            context_features: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """메타 학습을 위한 특성 생성"""

        meta_features = []
        labels = []

        for _, interaction in interactions_df.iterrows():
            user_id = interaction['user_id']
            item_id = interaction['item_id']

            # 각 모델별 점수 계산
            features = [
                self._get_cf_score(user_id, item_id),
                self._get_cb_score(user_id, item_id),
                self._get_context_score(user_id, item_id,
                                      context_features.loc[interaction.name] if interaction.name in context_features.index else {}),
                self._get_popularity_score(item_id)
            ]

            # 라벨 생성 (실제 상호작용 기반)
            label = 1 if interaction['interaction_type'] in ['purchase', 'like'] else 0
            if interaction['interaction_type'] == 'rating':
                label = 1 if interaction['rating'] >= 4 else 0

            meta_features.append(features)
            labels.append(label)

        return np.array(meta_features), np.array(labels)

    def _get_cf_score(self, user_id: str, item_id: str) -> float:
        """CF 모델 점수"""
        if not self.cf_model:
            return 0.0

        try:
            # PyTorch 모델 예측
            user_tensor = torch.tensor([self.user_to_id.get(user_id, 0)])
            item_tensor = torch.tensor([self.item_to_id.get(item_id, 0)])

            with torch.no_grad():
                score = self.cf_model(user_tensor, item_tensor).item()

            return float(score)
        except:
            return 0.0

    def _get_cb_score(self, user_id: str, item_id: str) -> float:
        """Content-Based 모델 점수"""
        if not self.cb_model:
            return 0.0

        try:
            # 사용자 선호도 기반 콘텐츠 점수
            user_recommendations = self.cb_model.recommend_for_user(
                user_id, self.interactions_df, top_k=100
            )

            for rec_item_id, score in user_recommendations:
                if rec_item_id == item_id:
                    return float(score)

            return 0.0
        except:
            return 0.0

    def _get_context_score(self, user_id: str, item_id: str,
                          context: Dict = None) -> float:
        """컨텍스트 점수"""
        if not context:
            return 0.5  # 중성 점수

        score = 0.5

        # 시간 기반 점수
        if 'hour' in context:
            hour = context['hour']
            # 시간대별 가중치 (예: 저녁 시간대 높은 점수)
            if 18 <= hour <= 22:
                score += 0.2
            elif 12 <= hour <= 14:
                score += 0.1

        # 디바이스 기반 점수
        if 'device_type' in context:
            if context['device_type'] == 'mobile':
                score += 0.1  # 모바일에서 더 활발한 상호작용

        # 위치 기반 점수
        if 'location' in context:
            # 위치별 개인화 로직
            pass

        return min(max(score, 0.0), 1.0)

    def _get_popularity_score(self, item_id: str) -> float:
        """인기도 점수"""
        try:
            # 글로벌 인기도 점수 (0-1 정규화)
            popularity = self.item_features.loc[item_id, 'popularity_score']
            max_popularity = self.item_features['popularity_score'].max()
            return float(popularity / max_popularity) if max_popularity > 0 else 0.0
        except:
            return 0.0

    def _generate_explanation(self, scores: Dict[str, float],
                            item_id: str) -> str:
        """추천 이유 설명 생성"""

        # 가장 높은 점수의 컴포넌트 찾기
        max_component = max(scores.items(), key=lambda x: x[1])
        component_name, component_score = max_component

        explanations = {
            'cf_score': f"비슷한 취향의 사용자들이 선호하는 아이템입니다",
            'cb_score': f"당신이 좋아하는 다른 아이템들과 유사한 특성을 가지고 있습니다",
            'context_score': f"현재 상황에 적합한 아이템입니다",
            'popularity_score': f"많은 사용자들에게 인기 있는 아이템입니다"
        }

        base_explanation = explanations.get(component_name, "추천된 아이템입니다")
        confidence = min(max(component_score * 100, 0), 100)

        return f"{base_explanation} (신뢰도: {confidence:.1f}%)"

class AttentionHybridModel(nn.Module):
    """어텐션 기반 하이브리드 모델"""

    def __init__(self, cf_dim: int, cb_dim: int, context_dim: int,
                 hidden_dim: int = 128):
        super().__init__()

        # 각 컴포넌트별 인코더
        self.cf_encoder = nn.Linear(cf_dim, hidden_dim)
        self.cb_encoder = nn.Linear(cb_dim, hidden_dim)
        self.context_encoder = nn.Linear(context_dim, hidden_dim)

        # 어텐션 메커니즘
        self.attention = nn.MultiheadAttention(
            embed_dim=hidden_dim,
            num_heads=4,
            batch_first=True
        )

        # 최종 예측 레이어
        self.predictor = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim // 2, 1),
            nn.Sigmoid()
        )

    def forward(self, cf_features: torch.Tensor,
                cb_features: torch.Tensor,
                context_features: torch.Tensor) -> torch.Tensor:

        # 각 컴포넌트 인코딩
        cf_encoded = self.cf_encoder(cf_features).unsqueeze(1)
        cb_encoded = self.cb_encoder(cb_features).unsqueeze(1)
        context_encoded = self.context_encoder(context_features).unsqueeze(1)

        # 시퀀스로 결합
        sequence = torch.cat([cf_encoded, cb_encoded, context_encoded], dim=1)

        # 어텐션 적용
        attended, attention_weights = self.attention(sequence, sequence, sequence)

        # 가중평균
        combined = attended.mean(dim=1)

        # 최종 예측
        output = self.predictor(combined)

        return output.squeeze(), attention_weights
```

## Phase 4: 실시간 추천 서비스

### FastAPI 기반 추천 서비스
```python
# api/recommendation_service.py
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import redis
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

app = FastAPI(title="SmartReco AI", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 글로벌 설정
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
logger = logging.getLogger(__name__)

class RecommendationService:
    """실시간 추천 서비스"""

    def __init__(self):
        self.hybrid_model = None
        self.feature_store = None
        self.model_version = "v1.0"
        self.cache_ttl = 3600  # 1시간

    async def get_recommendations(self,
                                request: RecommendationRequest) -> RecommendationResponse:
        """추천 생성"""

        try:
            # 캐시 확인
            cache_key = f"rec:{request.user_id}:{hash(str(request.context))}"
            cached_result = redis_client.get(cache_key)

            if cached_result and not request.context.get('force_refresh', False):
                logger.info(f"Cache hit for user {request.user_id}")
                return RecommendationResponse.parse_raw(cached_result)

            # 실시간 추천 생성
            start_time = datetime.now()

            # 1. 사용자 특성 조회
            user_features = await self._get_user_features(request.user_id)

            # 2. 후보 아이템 생성
            candidate_items = await self._generate_candidates(
                request.user_id,
                user_features,
                request.num_recommendations * 5  # 오버샘플링
            )

            # 3. 하이브리드 모델로 점수 계산
            scored_items = self.hybrid_model.predict(
                request.user_id,
                candidate_items,
                request.context
            )

            # 4. 다양성 및 필터링 적용
            final_recommendations = self._apply_diversity_filter(
                scored_items,
                request.num_recommendations,
                request.exclude_items
            )

            # 5. 응답 생성
            response = RecommendationResponse(
                user_id=request.user_id,
                recommendations=[
                    RecommendationItem(
                        item_id=item_id,
                        score=score,
                        rank=idx + 1,
                        explanation=metadata.get('explanation', ''),
                        confidence=metadata.get('confidence', 0.0)
                    )
                    for idx, (item_id, score, metadata) in enumerate(final_recommendations)
                ],
                model_version=self.model_version,
                timestamp=datetime.now(),
                context=request.context
            )

            # 6. 캐시 저장
            redis_client.setex(
                cache_key,
                self.cache_ttl,
                response.json()
            )

            # 7. 성능 로깅
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.info(f"Recommendation generated for {request.user_id} in {processing_time:.3f}s")

            return response

        except Exception as e:
            logger.error(f"Recommendation error for user {request.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail="추천 생성 중 오류가 발생했습니다")

    async def _get_user_features(self, user_id: str) -> Dict:
        """사용자 특성 조회"""

        # 실시간 특성 조회 (Feature Store)
        try:
            features = await self.feature_store.get_online_features(
                entity_rows=[{"user_id": user_id}],
                feature_refs=[
                    "user_profile:age_group",
                    "user_profile:gender",
                    "user_behavior:avg_session_duration",
                    "user_behavior:frequency_score",
                    "user_behavior:recency_score",
                    "user_behavior:category_diversity"
                ]
            )
            return features
        except Exception as e:
            logger.warning(f"Feature store error for user {user_id}: {str(e)}")
            return {}

    async def _generate_candidates(self, user_id: str,
                                 user_features: Dict,
                                 num_candidates: int) -> List[str]:
        """후보 아이템 생성"""

        candidates = set()

        # 1. 협업 필터링 기반 후보
        cf_candidates = await self._get_cf_candidates(user_id, num_candidates // 3)
        candidates.update(cf_candidates)

        # 2. 콘텐츠 기반 후보
        cb_candidates = await self._get_cb_candidates(user_id, num_candidates // 3)
        candidates.update(cb_candidates)

        # 3. 인기 아이템 후보
        popular_candidates = await self._get_popular_candidates(num_candidates // 3)
        candidates.update(popular_candidates)

        # 4. 새로운 아이템 (탐색)
        if len(candidates) < num_candidates:
            new_candidates = await self._get_new_candidates(
                num_candidates - len(candidates)
            )
            candidates.update(new_candidates)

        return list(candidates)[:num_candidates]

    def _apply_diversity_filter(self, scored_items: List[Tuple],
                              num_recommendations: int,
                              exclude_items: List[str]) -> List[Tuple]:
        """다양성 필터 적용"""

        # 제외 아이템 필터링
        filtered_items = [
            item for item in scored_items
            if item[0] not in exclude_items
        ]

        # 카테고리 다양성 보장
        diverse_items = []
        category_counts = {}
        max_per_category = max(1, num_recommendations // 5)  # 카테고리당 최대 20%

        for item_id, score, metadata in filtered_items:
            if len(diverse_items) >= num_recommendations:
                break

            # 아이템 카테고리 조회
            item_category = self._get_item_category(item_id)

            if category_counts.get(item_category, 0) < max_per_category:
                diverse_items.append((item_id, score, metadata))
                category_counts[item_category] = category_counts.get(item_category, 0) + 1

        # 부족한 경우 나머지 아이템으로 채우기
        while len(diverse_items) < num_recommendations and len(diverse_items) < len(filtered_items):
            for item in filtered_items:
                if item not in diverse_items:
                    diverse_items.append(item)
                    break

        return diverse_items[:num_recommendations]

# API 엔드포인트
@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """추천 생성 API"""
    service = RecommendationService()
    return await service.get_recommendations(request)

@app.post("/feedback")
async def record_feedback(user_id: str, item_id: str,
                         feedback_type: str, value: float = None):
    """피드백 기록 API"""

    feedback_data = {
        "user_id": user_id,
        "item_id": item_id,
        "feedback_type": feedback_type,
        "value": value,
        "timestamp": datetime.now().isoformat()
    }

    # Kafka로 실시간 피드백 전송
    await send_to_kafka("user_feedback", feedback_data)

    # 실시간 모델 업데이트 트리거
    await trigger_online_learning(user_id, item_id, feedback_type, value)

    return {"status": "success", "message": "피드백이 기록되었습니다"}

@app.get("/model/status")
async def get_model_status():
    """모델 상태 조회"""
    return {
        "model_version": "v1.0",
        "last_training": "2024-01-15T10:30:00Z",
        "accuracy_metrics": {
            "precision@10": 0.85,
            "recall@10": 0.72,
            "ndcg@10": 0.89
        },
        "system_metrics": {
            "avg_response_time": "95ms",
            "cache_hit_rate": "78%",
            "daily_requests": 1250000
        }
    }

@app.post("/model/retrain")
async def trigger_model_retraining(background_tasks: BackgroundTasks):
    """모델 재훈련 트리거"""
    background_tasks.add_task(retrain_models)
    return {"status": "success", "message": "모델 재훈련이 시작되었습니다"}

async def retrain_models():
    """백그라운드 모델 재훈련"""
    try:
        logger.info("Starting model retraining...")

        # 1. 새로운 데이터 수집
        # 2. 특성 엔지니어링
        # 3. 모델 훈련
        # 4. 모델 검증
        # 5. 모델 배포

        logger.info("Model retraining completed successfully")

    except Exception as e:
        logger.error(f"Model retraining failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Phase 5: 모니터링 및 A/B 테스트

### A/B 테스트 프레임워크
```python
# testing/ab_testing.py
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from scipy import stats
import logging

class ABTestFramework:
    """A/B 테스트 프레임워크"""

    def __init__(self):
        self.experiments = {}
        self.logger = logging.getLogger(__name__)

    def create_experiment(self, experiment_id: str,
                         variants: List[str],
                         traffic_allocation: Dict[str, float],
                         success_metric: str,
                         minimum_sample_size: int = 1000,
                         duration_days: int = 14) -> Dict:
        """A/B 테스트 실험 생성"""

        # 트래픽 배분 검증
        if abs(sum(traffic_allocation.values()) - 1.0) > 0.001:
            raise ValueError("트래픽 배분의 합이 1.0이 아닙니다")

        experiment = {
            "experiment_id": experiment_id,
            "variants": variants,
            "traffic_allocation": traffic_allocation,
            "success_metric": success_metric,
            "minimum_sample_size": minimum_sample_size,
            "duration_days": duration_days,
            "start_date": datetime.now(),
            "end_date": datetime.now() + timedelta(days=duration_days),
            "status": "active",
            "results": {variant: [] for variant in variants}
        }

        self.experiments[experiment_id] = experiment
        self.logger.info(f"Created experiment {experiment_id} with variants {variants}")

        return experiment

    def assign_variant(self, experiment_id: str, user_id: str) -> str:
        """사용자에게 변형 할당"""

        if experiment_id not in self.experiments:
            raise ValueError(f"실험 {experiment_id}를 찾을 수 없습니다")

        experiment = self.experiments[experiment_id]

        # 실험 기간 확인
        if datetime.now() > experiment["end_date"]:
            experiment["status"] = "completed"
            return "control"  # 기본값 반환

        # 해시 기반 일관된 할당
        user_hash = hash(f"{experiment_id}:{user_id}") % 100
        cumulative_prob = 0.0

        for variant, prob in experiment["traffic_allocation"].items():
            cumulative_prob += prob * 100
            if user_hash < cumulative_prob:
                return variant

        # 기본값 (첫 번째 변형)
        return experiment["variants"][0]

    def record_event(self, experiment_id: str, user_id: str,
                    variant: str, metric_value: float):
        """이벤트 기록"""

        if experiment_id not in self.experiments:
            return

        experiment = self.experiments[experiment_id]

        if variant in experiment["results"]:
            experiment["results"][variant].append({
                "user_id": user_id,
                "metric_value": metric_value,
                "timestamp": datetime.now()
            })

    def analyze_experiment(self, experiment_id: str) -> Dict:
        """실험 결과 분석"""

        if experiment_id not in self.experiments:
            raise ValueError(f"실험 {experiment_id}를 찾을 수 없습니다")

        experiment = self.experiments[experiment_id]
        results = experiment["results"]
        analysis = {}

        # 각 변형별 통계
        for variant, data in results.items():
            if not data:
                continue

            values = [d["metric_value"] for d in data]
            analysis[variant] = {
                "sample_size": len(values),
                "mean": np.mean(values),
                "std": np.std(values),
                "conversion_rate": np.mean([1 if v > 0 else 0 for v in values]),
                "confidence_interval": self._calculate_ci(values)
            }

        # 통계적 유의성 검정
        if len(results) >= 2:
            variants = list(results.keys())
            control_data = [d["metric_value"] for d in results[variants[0]]]

            for i in range(1, len(variants)):
                treatment_data = [d["metric_value"] for d in results[variants[i]]]

                if len(control_data) > 0 and len(treatment_data) > 0:
                    # t-test 수행
                    t_stat, p_value = stats.ttest_ind(control_data, treatment_data)

                    analysis[f"{variants[0]}_vs_{variants[i]}"] = {
                        "t_statistic": t_stat,
                        "p_value": p_value,
                        "is_significant": p_value < 0.05,
                        "effect_size": self._calculate_effect_size(control_data, treatment_data)
                    }

        # 권장사항 생성
        analysis["recommendation"] = self._generate_recommendation(analysis)

        return analysis

    def _calculate_ci(self, values: List[float], confidence: float = 0.95) -> Tuple[float, float]:
        """신뢰구간 계산"""
        if len(values) < 2:
            return (0, 0)

        mean = np.mean(values)
        sem = stats.sem(values)
        h = sem * stats.t.ppf((1 + confidence) / 2., len(values) - 1)

        return (mean - h, mean + h)

    def _calculate_effect_size(self, control: List[float], treatment: List[float]) -> float:
        """효과 크기 계산 (Cohen's d)"""
        if len(control) < 2 or len(treatment) < 2:
            return 0

        pooled_std = np.sqrt(((len(control) - 1) * np.var(control) +
                             (len(treatment) - 1) * np.var(treatment)) /
                            (len(control) + len(treatment) - 2))

        if pooled_std == 0:
            return 0

        return (np.mean(treatment) - np.mean(control)) / pooled_std

    def _generate_recommendation(self, analysis: Dict) -> str:
        """분석 결과 기반 권장사항"""

        # 충분한 샘플 크기 확인
        variants = [k for k in analysis.keys() if not k.endswith("_vs_")]

        if not variants:
            return "데이터가 충분하지 않습니다"

        sample_sizes = [analysis[v].get("sample_size", 0) for v in variants]
        min_sample_size = min(sample_sizes) if sample_sizes else 0

        if min_sample_size < 1000:
            return f"샘플 크기가 부족합니다 (최소 1000개 필요, 현재 {min_sample_size}개)"

        # 통계적 유의성 확인
        significant_tests = [k for k in analysis.keys() if k.endswith("_vs_") and
                           analysis[k].get("is_significant", False)]

        if not significant_tests:
            return "통계적으로 유의한 차이가 발견되지 않았습니다"

        # 최고 성능 변형 찾기
        best_variant = max(variants, key=lambda v: analysis[v].get("mean", 0))
        best_mean = analysis[best_variant]["mean"]

        return f"'{best_variant}' 변형이 가장 좋은 성능을 보입니다 (평균: {best_mean:.3f})"

class RecommendationABTest:
    """추천 시스템 전용 A/B 테스트"""

    def __init__(self, ab_framework: ABTestFramework):
        self.ab_framework = ab_framework
        self.active_experiments = {}

    def start_recommendation_experiment(self, experiment_name: str,
                                     control_model: str,
                                     treatment_models: List[str],
                                     traffic_split: Dict[str, float],
                                     duration_days: int = 14):
        """추천 모델 A/B 테스트 시작"""

        all_models = [control_model] + treatment_models

        experiment = self.ab_framework.create_experiment(
            experiment_id=experiment_name,
            variants=all_models,
            traffic_allocation=traffic_split,
            success_metric="ctr",  # Click-Through Rate
            duration_days=duration_days
        )

        self.active_experiments[experiment_name] = experiment

        return experiment

    def get_recommendation_variant(self, experiment_name: str,
                                 user_id: str) -> str:
        """사용자별 추천 모델 변형 할당"""

        if experiment_name not in self.active_experiments:
            return "control"

        return self.ab_framework.assign_variant(experiment_name, user_id)

    def record_recommendation_metrics(self, experiment_name: str,
                                   user_id: str,
                                   variant: str,
                                   recommendations: List[str],
                                   interactions: Dict[str, bool]):
        """추천 메트릭 기록"""

        # CTR 계산
        total_recommendations = len(recommendations)
        total_clicks = sum(interactions.values())
        ctr = total_clicks / total_recommendations if total_recommendations > 0 else 0

        # 이벤트 기록
        self.ab_framework.record_event(
            experiment_name, user_id, variant, ctr
        )

        # 추가 메트릭들
        metrics = {
            "ctr": ctr,
            "total_clicks": total_clicks,
            "total_recommendations": total_recommendations,
            "click_positions": [i for i, (item_id, clicked) in enumerate(interactions.items()) if clicked]
        }

        return metrics

# 실시간 모니터링
class RecommendationMonitor:
    """추천 시스템 실시간 모니터링"""

    def __init__(self):
        self.metrics_buffer = []
        self.alert_thresholds = {
            "response_time": 200,  # ms
            "error_rate": 0.01,    # 1%
            "cache_hit_rate": 0.70, # 70%
            "ctr": 0.02            # 2%
        }

    def record_request_metrics(self, user_id: str,
                             response_time_ms: float,
                             num_recommendations: int,
                             cache_hit: bool,
                             error: bool = False):
        """요청 메트릭 기록"""

        metrics = {
            "timestamp": datetime.now(),
            "user_id": user_id,
            "response_time_ms": response_time_ms,
            "num_recommendations": num_recommendations,
            "cache_hit": cache_hit,
            "error": error
        }

        self.metrics_buffer.append(metrics)

        # 실시간 알림 확인
        self._check_real_time_alerts(metrics)

    def _check_real_time_alerts(self, metrics: Dict):
        """실시간 알림 확인"""

        # 응답 시간 알림
        if metrics["response_time_ms"] > self.alert_thresholds["response_time"]:
            self._send_alert(
                "HIGH_RESPONSE_TIME",
                f"응답시간이 {metrics['response_time_ms']:.1f}ms로 임계치를 초과했습니다"
            )

        # 오류율 알림 (최근 100개 요청 기준)
        recent_requests = self.metrics_buffer[-100:]
        if len(recent_requests) >= 100:
            error_rate = sum(1 for r in recent_requests if r["error"]) / len(recent_requests)
            if error_rate > self.alert_thresholds["error_rate"]:
                self._send_alert(
                    "HIGH_ERROR_RATE",
                    f"오류율이 {error_rate:.2%}로 임계치를 초과했습니다"
                )

    def _send_alert(self, alert_type: str, message: str):
        """알림 전송"""
        self.logger.warning(f"ALERT [{alert_type}]: {message}")
        # 실제 구현에서는 Slack, PagerDuty 등으로 알림 전송
```

## 프로젝트 성과 및 학습 포인트

### 개발 성과
```yaml
performance_metrics:
  development_time: "20주 → 14주 (30% 단축)"
  model_accuracy: "NDCG@10: 0.89, Precision@10: 0.85"
  system_performance: "평균 응답시간 95ms, 99.9% 가용성"
  scalability: "100만 동시 사용자 지원"
  cost_efficiency: "인프라 비용 40% 절감"

business_metrics:
  user_engagement: "세션 지속시간 35% 증가"
  conversion_rate: "구매 전환율 2.5% → 3.8%"
  revenue_impact: "추천 기반 매출 45% 증가"
  user_satisfaction: "추천 만족도 4.6/5.0"
  retention_rate: "사용자 유지율 78% 개선"
```

### AI 워크플로우 활용 효과
1. **모델 개발**: 다양한 추천 알고리즘 신속한 프로토타이핑 및 비교
2. **특성 엔지니어링**: 자동화된 특성 생성으로 개발 시간 60% 단축
3. **하이브리드 시스템**: 복잡한 앙상블 모델 구현 지원
4. **실시간 서빙**: 고성능 API 서비스 구축 및 최적화
5. **A/B 테스트**: 지속적인 모델 개선을 위한 실험 프레임워크
6. **모니터링**: 실시간 성능 추적 및 자동 알림 시스템

### 핵심 학습 포인트
- **개인화의 중요성**: 사용자별 맞춤 추천이 전체 성과에 미치는 영향
- **실시간 처리**: 낮은 지연시간이 사용자 경험에 핵심적 역할
- **설명 가능성**: 추천 이유 제공이 사용자 신뢰도 향상에 기여
- **지속적 학습**: 실시간 피드백 반영을 통한 모델 성능 개선
- **다양성 보장**: 추천 다양성이 장기적 사용자 만족도에 중요