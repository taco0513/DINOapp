# iOS 스타일 구현 가이드

## 옵션 1: Konsta UI 사용 (추천)

### 설치

```bash
npm install konsta
```

### 설정

```js
// tailwind.config.js
const konstaConfig = require('konsta/config');

module.exports = konstaConfig({
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // 기존 Tailwind 설정 확장
});
```

### 사용 예시

```jsx
import { App, Page, Navbar, Block, Button, List, ListItem } from 'konsta/react';

export default function MyApp() {
  return (
    <App theme='ios'>
      <Page>
        <Navbar title='DINO' />
        <Block>
          <Button>iOS 스타일 버튼</Button>
        </Block>
        <List>
          <ListItem title='여행 기록' link='/trips' />
          <ListItem title='셰겐 계산기' link='/schengen' />
        </List>
      </Page>
    </App>
  );
}
```

## 옵션 2: 직접 구현 (현재 적용)

이미 만든 `/styles/ios-components.css`를 사용:

### 1. 글로벌 CSS에 추가

```css
/* app/globals.css */
@import '../styles/ios-components.css';
```

### 2. 컴포넌트 예시

#### iOS 버튼

```jsx
<button className="ios-button">
  시작하기
</button>

<button className="ios-button ios-button-secondary">
  더 알아보기
</button>

<button className="ios-button ios-button-destructive">
  삭제
</button>
```

#### iOS 리스트

```jsx
<div className='ios-list'>
  <div className='ios-list-item'>
    <span>대시보드</span>
    <span>→</span>
  </div>
  <div className='ios-list-item'>
    <span>여행 기록</span>
    <span>→</span>
  </div>
</div>
```

#### iOS 스위치

```jsx
<div className='ios-switch' onClick={toggle}>
  <div className='ios-switch-thumb' />
</div>
```

#### iOS 세그먼트 컨트롤

```jsx
<div className='ios-segment'>
  <div className='ios-segment-item active'>전체</div>
  <div className='ios-segment-item'>예정</div>
  <div className='ios-segment-item'>완료</div>
</div>
```

#### iOS 탭 바

```jsx
<div className='ios-tabbar'>
  <div className='ios-tab-item active'>
    <div className='ios-tab-icon'>🏠</div>
    <div className='ios-tab-label'>홈</div>
  </div>
  <div className='ios-tab-item'>
    <div className='ios-tab-icon'>✈️</div>
    <div className='ios-tab-label'>여행</div>
  </div>
</div>
```

## 옵션 3: React Native for Web

웹에서 React Native 컴포넌트 사용:

```bash
npm install react-native-web
```

하지만 이는 더 복잡하고 번들 크기가 커집니다.

## 추천 방향

1. **빠른 구현**: Konsta UI 사용
2. **최적화된 구현**: 직접 구현한 iOS 컴포넌트 사용
3. **완전한 iOS 경험**: Framework7 사용 (무겁지만 완벽함)

현재 프로젝트의 미니멀한 디자인 철학과 맞추려면 직접 구현한 CSS를 사용하거나, 가벼운 Konsta UI를 추천합니다.
