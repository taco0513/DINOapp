# 모바일 앱 개발 실전 가이드

## 프로젝트 개요

React Native와 Expo를 활용하여 크로스플랫폼 모바일 앱을 SuperClaude AI 워크플로우로 구축하는 완전한 가이드입니다.

### 앱 컨셉: 피트니스 트래커
```yaml
app_concept:
  name: "FitTrack Pro"
  category: "건강 및 피트니스"
  target_users: "운동 애호가, 건강 관리자"
  
core_features:
  - "운동 기록 및 추적"
  - "개인화된 운동 계획"
  - "진행 상황 시각화"
  - "소셜 기능 (친구와 경쟁)"
  - "웨어러블 디바이스 연동"
  - "오프라인 모드 지원"

technical_requirements:
  platforms: ["iOS", "Android"]
  offline_support: true
  push_notifications: true
  device_sensors: ["GPS", "가속도계", "자이로스코프"]
  integrations: ["Apple Health", "Google Fit", "Strava"]
```

### 기술 스택
```yaml
technology_stack:
  framework: "React Native + Expo"
  language: "TypeScript"
  navigation: "React Navigation 6"
  state_management: "Redux Toolkit + RTK Query"
  ui_library: "React Native Elements + NativeBase"
  animations: "React Native Reanimated 3"
  
backend:
  runtime: "Node.js + TypeScript"
  framework: "Express.js"
  database: "MongoDB + Redis"
  auth: "Firebase Auth"
  storage: "Firebase Storage"
  push: "Firebase Cloud Messaging"
  
development_tools:
  testing: "Jest + Detox"
  code_quality: "ESLint + Prettier"
  ci_cd: "GitHub Actions + EAS Build"
  analytics: "Firebase Analytics"
  crash_reporting: "Sentry"
```

## Phase 1: 프로젝트 설정 및 아키텍처

### SuperClaude를 활용한 초기 설정
```bash
# 1. React Native 프로젝트 설정
/build "fittrack-mobile" --framework react-native --expo --typescript

# 2. 앱 아키텍처 설계
/design "피트니스 앱 아키텍처" --offline-first --state-management --navigation

# 3. 데이터 모델 설계
/design data-models --entities "user,workout,exercise,progress" --mongodb

# 4. API 설계
/design mobile-api --rest --realtime --offline-sync
```

### 프로젝트 구조
```
fittrack-mobile/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── screens/            # 화면 컴포넌트
│   ├── navigation/         # 네비게이션 설정
│   ├── store/             # Redux 스토어
│   ├── services/          # API 및 외부 서비스
│   ├── hooks/             # 커스텀 훅
│   ├── utils/             # 유틸리티 함수
│   ├── types/             # TypeScript 타입 정의
│   └── constants/         # 상수 정의
├── assets/                # 이미지, 폰트 등
├── app.config.js         # Expo 설정
└── package.json
```

### 데이터 모델 설계
```typescript
// types/models.ts
export interface User {
  id: string;
  email: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    birthDate: Date;
    height: number; // cm
    weight: number; // kg
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    goals: string[];
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: {
      workoutReminders: boolean;
      achievements: boolean;
      social: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'sports';
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string[];
  images: string[];
  videoUrl?: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  exercises: WorkoutExercise[];
  duration: number; // minutes
  caloriesBurned?: number;
  date: Date;
  notes?: string;
  isTemplate: boolean;
  createdAt: Date;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: ExerciseSet[];
  restTime: number; // seconds
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds for time-based exercises
  distance?: number; // meters for cardio
  completed: boolean;
}

export interface Progress {
  id: string;
  userId: string;
  date: Date;
  metrics: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    measurements?: {
      chest?: number;
      waist?: number;
      arms?: number;
      thighs?: number;
    };
  };
  photos?: string[];
}
```

## Phase 2: 핵심 기능 구현

### SuperClaude를 활용한 컴포넌트 개발
```bash
# 1. 인증 플로우 구현
/implement "Firebase 인증 플로우" --react-native --biometric --social-login

# 2. 운동 기록 화면
/implement "운동 기록 화면" --timer --sets-reps --progress-tracking

# 3. 운동 플랜 생성
/implement "AI 운동 플랜 생성" --personalization --difficulty-adjustment

# 4. 진행 상황 차트
/implement "진행 상황 시각화" --charts --animations --gesture-handling
```

### 인증 시스템 구현
```typescript
// services/auth.service.ts
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  constructor() {
    this.configureGoogleSignIn();
  }

  private configureGoogleSignIn() {
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
    });
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      await this.saveUserSession(userCredential.user);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signUpWithEmail(email: string, password: string, userData: any) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // 사용자 프로필 업데이트
      await userCredential.user.updateProfile({
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Firestore에 추가 사용자 정보 저장
      await this.createUserProfile(userCredential.user.uid, userData);
      
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      await this.saveUserSession(userCredential.user);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signInWithFacebook() {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw new Error('사용자가 로그인을 취소했습니다');
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Facebook 액세스 토큰을 가져올 수 없습니다');
      }

      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await auth().signInWithCredential(facebookCredential);
      
      await this.saveUserSession(userCredential.user);
      return userCredential.user;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  async signOut() {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('userSession');
      
      // 소셜 로그인 세션도 정리
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut();
      }
      
      LoginManager.logOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  private async saveUserSession(user: any) {
    const session = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem('userSession', JSON.stringify(session));
  }

  private handleAuthError(error: any) {
    const errorMessages = {
      'auth/user-not-found': '등록되지 않은 이메일입니다',
      'auth/wrong-password': '비밀번호가 올바르지 않습니다',
      'auth/email-already-in-use': '이미 사용 중인 이메일입니다',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다',
      'auth/invalid-email': '유효하지 않은 이메일 형식입니다',
    };
    
    return new Error(errorMessages[error.code] || '인증 오류가 발생했습니다');
  }
}

export const authService = new AuthService();
```

### 운동 기록 화면 구현
```typescript
// screens/WorkoutScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Input } from 'react-native-elements';
import { CountdownTimer } from '../components/CountdownTimer';
import { ExerciseCard } from '../components/ExerciseCard';
import { workoutActions } from '../store/slices/workoutSlice';

export const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { workout } = route.params as { workout: Workout };
  const { currentWorkout, isRecording } = useSelector((state: RootState) => state.workout);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!isRecording) {
      startWorkout();
    }
  }, []);

  const startWorkout = () => {
    const startTime = new Date();
    setWorkoutStartTime(startTime);
    dispatch(workoutActions.startWorkout({ workout, startTime }));
  };

  const completeSet = (exerciseIndex: number, setIndex: number, setData: Partial<ExerciseSet>) => {
    dispatch(workoutActions.completeSet({
      exerciseIndex,
      setIndex,
      setData: { ...setData, completed: true },
    }));

    const exercise = currentWorkout.exercises[exerciseIndex];
    const isLastSet = setIndex === exercise.sets.length - 1;
    const isLastExercise = exerciseIndex === currentWorkout.exercises.length - 1;

    if (isLastSet && isLastExercise) {
      // 운동 완료
      finishWorkout();
    } else if (isLastSet) {
      // 다음 운동으로
      setCurrentExerciseIndex(exerciseIndex + 1);
      setCurrentSetIndex(0);
      startRestTimer(exercise.restTime);
    } else {
      // 다음 세트로
      setCurrentSetIndex(setIndex + 1);
      startRestTimer(exercise.restTime);
    }
  };

  const startRestTimer = (restTime: number) => {
    if (restTime > 0) {
      setIsResting(true);
      setRestTimer(restTime);
    }
  };

  const onRestComplete = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const finishWorkout = async () => {
    const endTime = new Date();
    const duration = workoutStartTime 
      ? Math.round((endTime.getTime() - workoutStartTime.getTime()) / 1000 / 60)
      : 0;

    const completedWorkout = {
      ...currentWorkout,
      duration,
      completedAt: endTime,
    };

    try {
      await dispatch(workoutActions.saveWorkout(completedWorkout)).unwrap();
      
      Alert.alert(
        '운동 완료!',
        `훌륭합니다! ${duration}분 동안 운동하셨습니다.`,
        [
          { text: '확인', onPress: () => navigation.navigate('WorkoutSummary', { workout: completedWorkout }) }
        ]
      );
    } catch (error) {
      Alert.alert('오류', '운동 저장 중 오류가 발생했습니다.');
    }
  };

  const pauseWorkout = () => {
    dispatch(workoutActions.pauseWorkout());
  };

  const resumeWorkout = () => {
    dispatch(workoutActions.resumeWorkout());
  };

  const currentExercise = currentWorkout?.exercises[currentExerciseIndex];
  const currentSet = currentExercise?.sets[currentSetIndex];

  if (!currentWorkout || !currentExercise) {
    return (
      <View style={styles.container}>
        <Text>운동을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.workoutTitle}>{currentWorkout.name}</Text>
        <Text style={styles.progress}>
          {currentExerciseIndex + 1} / {currentWorkout.exercises.length}
        </Text>
      </View>

      {/* 휴식 타이머 */}
      {isResting && (
        <Card containerStyle={styles.restCard}>
          <Text style={styles.restTitle}>휴식 시간</Text>
          <CountdownTimer
            duration={restTimer}
            onComplete={onRestComplete}
            size="large"
          />
          <Button
            title="휴식 건너뛰기"
            type="outline"
            onPress={onRestComplete}
            containerStyle={styles.skipButton}
          />
        </Card>
      )}

      {/* 현재 운동 */}
      <ExerciseCard
        exercise={currentExercise.exercise}
        currentSet={currentSet}
        setIndex={currentSetIndex}
        totalSets={currentExercise.sets.length}
        onSetComplete={(setData) => completeSet(currentExerciseIndex, currentSetIndex, setData)}
        isActive={!isResting}
      />

      {/* 다음 운동 미리보기 */}
      {currentExerciseIndex < currentWorkout.exercises.length - 1 && (
        <Card containerStyle={styles.nextExerciseCard}>
          <Text style={styles.nextExerciseTitle}>다음 운동</Text>
          <Text style={styles.nextExerciseName}>
            {currentWorkout.exercises[currentExerciseIndex + 1].exercise.name}
          </Text>
        </Card>
      )}

      {/* 운동 제어 버튼 */}
      <View style={styles.controls}>
        <Button
          title="일시정지"
          type="outline"
          onPress={pauseWorkout}
          containerStyle={styles.controlButton}
        />
        <Button
          title="운동 종료"
          buttonStyle={styles.finishButton}
          onPress={() => {
            Alert.alert(
              '운동 종료',
              '정말로 운동을 종료하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                { text: '종료', onPress: finishWorkout }
              ]
            );
          }}
          containerStyle={styles.controlButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  progress: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  restCard: {
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#ff9800',
  },
  restTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  skipButton: {
    marginTop: 20,
  },
  nextExerciseCard: {
    margin: 16,
    borderRadius: 8,
  },
  nextExerciseTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  nextExerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  controlButton: {
    flex: 1,
  },
  finishButton: {
    backgroundColor: '#4caf50',
  },
});
```

### 진행 상황 차트 구현
```typescript
// components/ProgressChart.tsx
import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { Card } from 'react-native-elements';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

interface ProgressChartProps {
  data: any[];
  type: 'line' | 'bar' | 'progress';
  title: string;
  unit?: string;
  color?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  type,
  title,
  unit = '',
  color = '#6200ee'
}) => {
  const animatedValue = useSharedValue(0);

  React.useEffect(() => {
    animatedValue.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [data]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
    transform: [{ scale: animatedValue.value }],
  }));

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: color,
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={{
              labels: data.map(item => item.label),
              datasets: [{
                data: data.map(item => item.value),
              }],
            }}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );

      case 'bar':
        return (
          <BarChart
            data={{
              labels: data.map(item => item.label),
              datasets: [{
                data: data.map(item => item.value),
              }],
            }}
            width={screenWidth - 60}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );

      case 'progress':
        const progressData = data.map(item => ({
          name: item.label,
          population: item.value,
          color: item.color || color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));

        return (
          <ProgressChart
            data={progressData}
            width={screenWidth - 60}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
            style={styles.chart}
          />
        );

      default:
        return null;
    }
  };

  const getLatestValue = () => {
    if (data.length === 0) return 0;
    return data[data.length - 1].value;
  };

  const getChange = () => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    return latest - previous;
  };

  const changePercent = data.length >= 2 
    ? ((getChange() / data[data.length - 2].value) * 100)
    : 0;

  return (
    <Card containerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.stats}>
          <Text style={styles.currentValue}>
            {getLatestValue()}{unit}
          </Text>
          {changePercent !== 0 && (
            <Text style={[
              styles.change,
              changePercent > 0 ? styles.positive : styles.negative
            ]}>
              {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </Text>
          )}
        </View>
      </View>
      
      <Animated.View style={animatedStyle}>
        {renderChart()}
      </Animated.View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stats: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#4caf50',
  },
  negative: {
    color: '#f44336',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
```

## Phase 3: 오프라인 지원 및 동기화

### 오프라인 데이터 관리
```typescript
// services/offline.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { syncActions } from '../store/slices/syncSlice';

class OfflineService {
  private isOnline = true;
  private syncQueue: any[] = [];
  
  constructor() {
    this.initializeNetworkListener();
    this.loadSyncQueue();
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOffline && this.isOnline) {
        // 온라인 복구 시 동기화 실행
        this.processSyncQueue();
      }
    });
  }

  async saveOfflineData(key: string, data: any) {
    try {
      const timestamp = new Date().toISOString();
      const offlineData = {
        data,
        timestamp,
        synced: false,
      };
      
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
      
      // 동기화 큐에 추가
      if (!this.isOnline) {
        this.addToSyncQueue('save', key, data);
      }
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  async getOfflineData(key: string) {
    try {
      const offlineData = await AsyncStorage.getItem(`offline_${key}`);
      if (offlineData) {
        return JSON.parse(offlineData);
      }
      return null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  async addToSyncQueue(action: string, key: string, data: any) {
    const syncItem = {
      id: `${Date.now()}_${Math.random()}`,
      action,
      key,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    
    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();
  }

  private async loadSyncQueue() {
    try {
      const queueData = await AsyncStorage.getItem('sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  private async saveSyncQueue() {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const failedItems: any[] = [];

    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
        console.log(`Synced item: ${item.key}`);
      } catch (error) {
        console.error(`Failed to sync item: ${item.key}`, error);
        item.retryCount++;
        
        // 3회 재시도 후 실패 처리
        if (item.retryCount < 3) {
          failedItems.push(item);
        } else {
          console.error(`Permanently failed to sync: ${item.key}`);
        }
      }
    }

    this.syncQueue = failedItems;
    await this.saveSyncQueue();
  }

  private async syncItem(item: any) {
    switch (item.action) {
      case 'save':
        await this.uploadData(item.key, item.data);
        break;
      case 'delete':
        await this.deleteData(item.key);
        break;
      default:
        throw new Error(`Unknown sync action: ${item.action}`);
    }
  }

  private async uploadData(key: string, data: any) {
    // API 호출로 데이터 업로드
    const response = await fetch(`${API_BASE_URL}/sync/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    // 동기화 완료 후 로컬 데이터 업데이트
    await this.markAsSynced(key);
  }

  private async deleteData(key: string) {
    const response = await fetch(`${API_BASE_URL}/sync/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Delete sync failed: ${response.statusText}`);
    }

    await AsyncStorage.removeItem(`offline_${key}`);
  }

  private async markAsSynced(key: string) {
    const offlineData = await this.getOfflineData(key);
    if (offlineData) {
      offlineData.synced = true;
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
    }
  }

  private async getAuthToken() {
    const userSession = await AsyncStorage.getItem('userSession');
    if (userSession) {
      const session = JSON.parse(userSession);
      return session.accessToken;
    }
    throw new Error('No auth token available');
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingSyncItems: this.syncQueue.length,
      lastSyncAttempt: this.syncQueue.length > 0 
        ? this.syncQueue[this.syncQueue.length - 1].timestamp 
        : null,
    };
  }
}

export const offlineService = new OfflineService();
```

## Phase 4: 배포 및 앱 스토어 출시

### EAS Build 설정
```javascript
// eas.json
{
  "cli": {
    "version": ">= 2.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "autoIncrement": true
      },
      "android": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEF1234"
      },
      "android": {
        "serviceAccountKeyPath": "../path/to/api-key.json",
        "track": "internal"
      }
    }
  }
}
```

### 앱 스토어 메타데이터
```yaml
app_store_listing:
  ios:
    app_name: "FitTrack Pro"
    subtitle: "개인 맞춤 피트니스 트래커"
    description: |
      FitTrack Pro는 당신의 피트니스 여정을 완벽하게 추적하고 관리하는 올인원 솔루션입니다.
      
      ■ 주요 기능
      • 개인 맞춤 운동 플랜 생성
      • 실시간 운동 기록 및 추적
      • 상세한 진행 상황 분석
      • 친구들과 함께하는 소셜 기능
      • Apple Health 및 웨어러블 기기 연동
      • 오프라인 모드 지원
    
    keywords: "피트니스,운동,헬스,트래커,다이어트,건강"
    category: "건강 및 피트니스"
    content_rating: "4+"
    
  android:
    app_name: "FitTrack Pro"
    short_description: "개인 맞춤 피트니스 트래커로 건강한 라이프스타일을 시작하세요"
    full_description: |
      🏋️‍♂️ FitTrack Pro - 당신만의 피트니스 코치
      
      개인화된 운동 계획부터 상세한 진행 상황 추적까지, 
      건강한 라이프스타일을 위한 모든 것이 하나의 앱에!
      
      ✨ 핵심 기능
      🎯 AI 기반 개인 맞춤 운동 플랜
      📊 실시간 운동 데이터 추적
      📈 시각적 진행 상황 분석
      👥 친구들과 함께하는 챌린지
      ⌚ 웨어러블 기기 완벽 연동
      📱 오프라인에서도 모든 기능 사용 가능
    
    category: "HEALTH_AND_FITNESS"
    content_rating: "Everyone"
```

### SuperClaude를 활용한 배포 자동화
```bash
# 1. 앱 스토어 자산 생성
/generate app-store-assets --screenshots --descriptions --keywords

# 2. CI/CD 파이프라인 설정
/implement ci-cd --eas-build --auto-testing --store-deployment

# 3. 성능 모니터링 설정
/implement app-monitoring --crashes --performance --user-analytics

# 4. A/B 테스트 설정
/implement ab-testing --feature-flags --user-segmentation
```

## 프로젝트 성과 및 학습 포인트

### 개발 성과
```yaml
development_metrics:
  development_time: "16주 → 12주 (25% 단축)"
  code_quality: "85% 테스트 커버리지"
  performance: "60fps 부드러운 애니메이션"
  app_size: "iOS: 45MB, Android: 38MB"
  crash_rate: "< 0.1%"

app_store_performance:
  ios_approval: "첫 제출에 승인"
  android_approval: "자동 승인"
  user_rating: "4.6/5.0 (iOS), 4.4/5.0 (Android)"
  download_growth: "월 25% 증가"
  retention_rate: "D7: 65%, D30: 35%"
```

### AI 워크플로우 활용 효과
1. **크로스플랫폼 개발**: React Native 설정 및 최적화 자동화
2. **UI/UX 구현**: 컴포넌트 디자인 시스템 빠른 구축
3. **오프라인 기능**: 복잡한 동기화 로직 구현 지원
4. **성능 최적화**: 메모리 누수 및 렌더링 최적화 자동 탐지
5. **앱 스토어 최적화**: 메타데이터 및 키워드 최적화로 다운로드 증가