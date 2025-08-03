# 크로스 플랫폼 디자인

## 개요

Web, iOS, Android 플랫폼에서 일관된 사용자 경험을 제공하면서도 각 플랫폼의 고유한 특성을 존중하는 디자인 시스템을 구축합니다. Claude가 플랫폼별 최적화된 컴포넌트를 자동 생성할 수 있도록 합니다.

## 플랫폼 통합 전략

### 디자인 토큰 통합 접근법

```typescript
// 플랫폼 간 토큰 매핑 시스템
interface CrossPlatformTokenSystem {
  // 공통 디자인 토큰 (모든 플랫폼 공유)
  universal: {
    colors: {
      primary: '#4F46E5',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32
    },
    typography: {
      fontSizes: [12, 14, 16, 18, 20, 24, 30, 36],
      fontWeights: [300, 400, 500, 600, 700]
    }
  };

  // 플랫폼별 토큰 매핑
  platform: {
    web: {
      colors: {
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem'
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    },

    ios: {
      colors: {
        primary: 'UIColor(named: "PrimaryColor")',
        primaryHover: 'UIColor(named: "PrimaryColorPressed")'
      },
      spacing: {
        xs: '4',
        sm: '8',
        md: '16'
      },
      typography: {
        fontFamily: '.SF UI Text'
      }
    },

    android: {
      colors: {
        primary: '@color/primary',
        primaryHover: '@color/primary_pressed'
      },
      spacing: {
        xs: '4dp',
        sm: '8dp',
        md: '16dp'
      },
      typography: {
        fontFamily: 'Roboto'
      }
    }
  };
}
```

### 플랫폼별 디자인 언어 매핑

```typescript
// 플랫폼 디자인 언어 자동 매핑
class PlatformDesignMapper {
  mapDesignLanguage(component: Component, targetPlatform: Platform): PlatformComponent {
    const mappings = {
      // 버튼 컴포넌트 매핑
      Button: {
        web: {
          element: 'button',
          baseStyles: 'px-4 py-2 rounded-lg font-medium transition-colors',
          variants: {
            primary: 'bg-blue-600 text-white hover:bg-blue-700',
            secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }
        },

        ios: {
          element: 'UIButton',
          baseStyles: {
            cornerRadius: 8,
            titleLabelFont: '.systemFont(ofSize: 16, weight: .medium)'
          },
          variants: {
            primary: {
              backgroundColor: 'UIColor.systemBlue',
              titleColor: 'UIColor.white'
            },
            secondary: {
              backgroundColor: 'UIColor.systemGray5',
              titleColor: 'UIColor.label'
            }
          }
        },

        android: {
          element: 'MaterialButton',
          baseStyles: {
            cornerRadius: '8dp',
            textSize: '16sp',
            textStyle: 'bold'
          },
          variants: {
            primary: {
              backgroundTint: '@color/primary',
              textColor: '@color/onPrimary'
            },
            secondary: {
              style: '@style/Widget.MaterialComponents.Button.OutlinedButton',
              strokeColor: '@color/primary'
            }
          }
        }
      },

      // Input 컴포넌트 매핑
      Input: {
        web: {
          element: 'input',
          baseStyles: 'px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500'
        },

        ios: {
          element: 'UITextField',
          baseStyles: {
            borderStyle: '.roundedRect',
            font: '.systemFont(ofSize: 16)'
          }
        },

        android: {
          element: 'TextInputLayout + TextInputEditText',
          baseStyles: {
            style: '@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox',
            textSize: '16sp'
          }
        }
      }
    };

    return mappings[component.type]?.[targetPlatform];
  }
}
```

## Web 플랫폼 최적화

### 반응형 브레이크포인트 시스템

```css
/* Web 플랫폼 반응형 토큰 */
:root {
  /* 브레이크포인트 */
  --bp-mobile: 320px;
  --bp-mobile-lg: 480px;
  --bp-tablet: 768px;
  --bp-tablet-lg: 1024px;
  --bp-desktop: 1200px;
  --bp-desktop-lg: 1440px;
  --bp-desktop-xl: 1920px;

  /* 컨테이너 크기 */
  --container-mobile: 100%;
  --container-tablet: 768px;
  --container-desktop: 1200px;
  --container-max: 1440px;

  /* 플루이드 타이포그래피 */
  --text-fluid-sm: clamp(0.875rem, 2vw, 1rem);
  --text-fluid-base: clamp(1rem, 2.5vw, 1.125rem);
  --text-fluid-lg: clamp(1.125rem, 3vw, 1.25rem);
  --text-fluid-xl: clamp(1.25rem, 4vw, 1.5rem);
  --text-fluid-2xl: clamp(1.5rem, 5vw, 2rem);
}

/* 반응형 그리드 시스템 */
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg);
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--space-xl);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: var(--space-2xl);
  }
}
```

### Web 접근성 최적화

```typescript
// 접근성 중심 웹 컴포넌트
const AccessibleWebComponents = {
  Button: `
    <button
      type="button"
      className="btn btn-primary"
      aria-describedby={helpTextId}
      aria-pressed={isPressed}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {loading && <span aria-hidden="true" className="spinner" />}
      <span className={loading ? 'sr-only' : undefined}>
        {loading ? 'Loading...' : children}
      </span>
    </button>
  `,

  Input: `
    <div className="input-group">
      <label htmlFor={inputId} className="input-label">
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        className="input"
        aria-describedby={errorId}
        aria-invalid={hasError}
        aria-required={required}
        value={value}
        onChange={onChange}
      />
      {error && (
        <div id={errorId} role="alert" className="input-error">
          {error}
        </div>
      )}
    </div>
  `,

  Modal: `
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            className="modal-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div id={descriptionId} className="modal-body">
          {children}
        </div>
      </div>
    </div>
  `
};
```

### 웹 성능 최적화

```typescript
// 성능 최적화된 웹 컴포넌트 패턴
const PerformantWebPatterns = {
  // 지연 로딩 이미지
  LazyImage: `
    const LazyImage = ({ src, alt, className, ...props }) => {
      const [imageSrc, setImageSrc] = useState('');
      const [imageRef, isIntersecting] = useIntersectionObserver();

      useEffect(() => {
        if (isIntersecting && src) {
          setImageSrc(src);
        }
      }, [isIntersecting, src]);

      return (
        <div ref={imageRef} className={className}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={alt}
              loading="lazy"
              decoding="async"
              {...props}
            />
          ) : (
            <div className="image-placeholder" />
          )}
        </div>
      );
    };
  `,

  // 가상화된 리스트
  VirtualizedList: `
    const VirtualizedList = ({ items, renderItem, itemHeight = 50 }) => {
      const [scrollTop, setScrollTop] = useState(0);
      const containerHeight = 400; // 컨테이너 높이
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      const visibleItems = items.slice(startIndex, endIndex);

      return (
        <div
          className="virtual-list-container"
          style={{ height: containerHeight, overflow: 'auto' }}
          onScroll={(e) => setScrollTop(e.target.scrollTop)}
        >
          <div style={{ height: items.length * itemHeight, position: 'relative' }}>
            {visibleItems.map((item, index) => (
              <div
                key={startIndex + index}
                style={{
                  position: 'absolute',
                  top: (startIndex + index) * itemHeight,
                  height: itemHeight,
                  width: '100%'
                }}
              >
                {renderItem(item, startIndex + index)}
              </div>
            ))}
          </div>
        </div>
      );
    };
  `
};
```

## iOS 플랫폼 최적화

### SwiftUI 디자인 시스템

```swift
// iOS 디자인 시스템 토큰
struct iOSDesignTokens {
    // 색상 시스템
    struct Colors {
        static let primary = Color("PrimaryBlue")
        static let primaryVariant = Color("PrimaryBlueDark")
        static let secondary = Color("SecondaryGray")
        static let surface = Color("SurfaceWhite")
        static let background = Color(UIColor.systemBackground)
        static let onSurface = Color(UIColor.label)
        static let onBackground = Color(UIColor.label)

        // 시맨틱 컬러
        static let success = Color("SuccessGreen")
        static let warning = Color("WarningOrange")
        static let error = Color("ErrorRed")
        static let info = Color("InfoBlue")
    }

    // 타이포그래피
    struct Typography {
        static let largeTitle = Font.largeTitle.weight(.bold)
        static let title1 = Font.title.weight(.semibold)
        static let title2 = Font.title2.weight(.semibold)
        static let title3 = Font.title3.weight(.medium)
        static let headline = Font.headline.weight(.semibold)
        static let body = Font.body
        static let callout = Font.callout
        static let subheadline = Font.subheadline
        static let footnote = Font.footnote
        static let caption1 = Font.caption
        static let caption2 = Font.caption2
    }

    // 간격 시스템
    struct Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    // 반지름
    struct Radius {
        static let sm: CGFloat = 4
        static let md: CGFloat = 8
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
        static let full: CGFloat = 1000
    }
}

// iOS 컴포넌트 라이브러리
struct iOSButton: View {
    let title: String
    let variant: ButtonVariant
    let size: ButtonSize
    let action: () -> Void

    enum ButtonVariant {
        case primary, secondary, tertiary, destructive
    }

    enum ButtonSize {
        case small, medium, large
    }

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(fontForSize)
                .fontWeight(.medium)
                .foregroundColor(textColor)
                .padding(.horizontal, horizontalPadding)
                .padding(.vertical, verticalPadding)
                .background(backgroundColor)
                .cornerRadius(iOSDesignTokens.Radius.md)
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(.easeInOut(duration: 0.1), value: isPressed)
    }

    private var fontForSize: Font {
        switch size {
        case .small: return .footnote
        case .medium: return .body
        case .large: return .headline
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary: return iOSDesignTokens.Colors.primary
        case .secondary: return iOSDesignTokens.Colors.secondary
        case .tertiary: return Color.clear
        case .destructive: return iOSDesignTokens.Colors.error
        }
    }

    private var textColor: Color {
        switch variant {
        case .primary, .destructive: return .white
        case .secondary: return iOSDesignTokens.Colors.onSurface
        case .tertiary: return iOSDesignTokens.Colors.primary
        }
    }
}

// iOS 입력 필드
struct iOSTextField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    let errorMessage: String?

    var body: some View {
        VStack(alignment: .leading, spacing: iOSDesignTokens.Spacing.sm) {
            Text(title)
                .font(iOSDesignTokens.Typography.footnote)
                .fontWeight(.medium)
                .foregroundColor(iOSDesignTokens.Colors.onSurface)

            TextField(placeholder, text: $text)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .padding(.horizontal, iOSDesignTokens.Spacing.md)
                .padding(.vertical, iOSDesignTokens.Spacing.sm)
                .background(iOSDesignTokens.Colors.surface)
                .cornerRadius(iOSDesignTokens.Radius.md)
                .overlay(
                    RoundedRectangle(cornerRadius: iOSDesignTokens.Radius.md)
                        .stroke(borderColor, lineWidth: 1)
                )

            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .font(iOSDesignTokens.Typography.caption1)
                    .foregroundColor(iOSDesignTokens.Colors.error)
            }
        }
    }

    private var borderColor: Color {
        if errorMessage != nil {
            return iOSDesignTokens.Colors.error
        }
        return Color(.systemGray4)
    }
}
```

### iOS Human Interface Guidelines 준수

```swift
// HIG 준수를 위한 iOS 컴포넌트 패턴
struct HIGCompliantPatterns {
    // 네비게이션 패턴
    struct NavigationPattern: View {
        let title: String
        let leadingButton: (() -> Void)?
        let trailingButton: (() -> Void)?

        var body: some View {
            NavigationView {
                ContentView()
                    .navigationTitle(title)
                    .navigationBarTitleDisplayMode(.large)
                    .toolbar {
                        if let leadingAction = leadingButton {
                            ToolbarItem(placement: .navigationBarLeading) {
                                Button("Cancel", action: leadingAction)
                            }
                        }

                        if let trailingAction = trailingButton {
                            ToolbarItem(placement: .navigationBarTrailing) {
                                Button("Done", action: trailingAction)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
            }
        }
    }

    // 리스트 패턴
    struct ListPattern: View {
        let items: [ListItem]

        var body: some View {
            List(items) { item in
                HStack {
                    AsyncImage(url: item.imageURL) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color(.systemGray5))
                    }
                    .frame(width: 44, height: 44)
                    .clipShape(RoundedRectangle(cornerRadius: 8))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.title)
                            .font(.headline)
                            .foregroundColor(.primary)

                        Text(item.subtitle)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .lineLimit(2)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
            }
            .listStyle(PlainListStyle())
        }
    }

    // 모달 패턴
    struct ModalPattern: View {
        @Binding var isPresented: Bool
        let title: String
        let content: AnyView

        var body: some View {
            NavigationView {
                content
                    .navigationTitle(title)
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .navigationBarLeading) {
                            Button("Cancel") {
                                isPresented = false
                            }
                        }

                        ToolbarItem(placement: .navigationBarTrailing) {
                            Button("Done") {
                                // Handle save action
                                isPresented = false
                            }
                            .fontWeight(.semibold)
                        }
                    }
            }
        }
    }
}
```

## Android 플랫폼 최적화

### Jetpack Compose Material 3 시스템

```kotlin
// Android Material 3 디자인 시스템
object AndroidDesignTokens {
    // Material 3 색상 스킴
    val LightColorScheme = lightColorScheme(
        primary = Color(0xFF4F46E5),
        onPrimary = Color.White,
        primaryContainer = Color(0xFFE0E7FF),
        onPrimaryContainer = Color(0xFF1E1B4B),
        secondary = Color(0xFF64748B),
        onSecondary = Color.White,
        secondaryContainer = Color(0xFFE2E8F0),
        onSecondaryContainer = Color(0xFF1E293B),
        tertiary = Color(0xFF10B981),
        onTertiary = Color.White,
        tertiaryContainer = Color(0xFFECFDF5),
        onTertiaryContainer = Color(0xFF064E3B),
        error = Color(0xFFEF4444),
        onError = Color.White,
        errorContainer = Color(0xFFFEF2F2),
        onErrorContainer = Color(0xFF7F1D1D),
        surface = Color(0xFFFFFBFE),
        onSurface = Color(0xFF1C1B1F),
        surfaceVariant = Color(0xFFF3F4F6),
        onSurfaceVariant = Color(0xFF6B7280),
        outline = Color(0xFFD1D5DB),
        background = Color(0xFFFFFBFE),
        onBackground = Color(0xFF1C1B1F)
    )

    val DarkColorScheme = darkColorScheme(
        primary = Color(0xFF6366F1),
        onPrimary = Color(0xFF1E1B4B),
        primaryContainer = Color(0xFF312E81),
        onPrimaryContainer = Color(0xFFE0E7FF),
        secondary = Color(0xFF94A3B8),
        onSecondary = Color(0xFF1E293B),
        secondaryContainer = Color(0xFF334155),
        onSecondaryContainer = Color(0xFFE2E8F0),
        surface = Color(0xFF1C1B1F),
        onSurface = Color(0xFFE6E1E5),
        background = Color(0xFF111827),
        onBackground = Color(0xFFE6E1E5)
    )

    // 타이포그래피
    val Typography = Typography(
        displayLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Bold,
            fontSize = 57.sp,
            lineHeight = 64.sp
        ),
        displayMedium = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Bold,
            fontSize = 45.sp,
            lineHeight = 52.sp
        ),
        displaySmall = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Bold,
            fontSize = 36.sp,
            lineHeight = 44.sp
        ),
        headlineLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.SemiBold,
            fontSize = 32.sp,
            lineHeight = 40.sp
        ),
        headlineMedium = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.SemiBold,
            fontSize = 28.sp,
            lineHeight = 36.sp
        ),
        headlineSmall = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.SemiBold,
            fontSize = 24.sp,
            lineHeight = 32.sp
        ),
        titleLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 22.sp,
            lineHeight = 28.sp
        ),
        titleMedium = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 16.sp,
            lineHeight = 24.sp
        ),
        titleSmall = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            lineHeight = 20.sp
        ),
        bodyLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 16.sp,
            lineHeight = 24.sp
        ),
        bodyMedium = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 14.sp,
            lineHeight = 20.sp
        ),
        bodySmall = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Normal,
            fontSize = 12.sp,
            lineHeight = 16.sp
        ),
        labelLarge = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            lineHeight = 20.sp
        ),
        labelMedium = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 12.sp,
            lineHeight = 16.sp
        ),
        labelSmall = TextStyle(
            fontFamily = FontFamily.Default,
            fontWeight = FontWeight.Medium,
            fontSize = 11.sp,
            lineHeight = 16.sp
        )
    )

    // 간격
    object Spacing {
        val xs = 4.dp
        val sm = 8.dp
        val md = 16.dp
        val lg = 24.dp
        val xl = 32.dp
        val xxl = 48.dp
    }

    // 모양
    val Shapes = Shapes(
        small = RoundedCornerShape(4.dp),
        medium = RoundedCornerShape(8.dp),
        large = RoundedCornerShape(12.dp)
    )
}

// Android 컴포넌트 라이브러리
@Composable
fun AndroidButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: ButtonVariant = ButtonVariant.Primary,
    size: ButtonSize = ButtonSize.Medium,
    enabled: Boolean = true,
    loading: Boolean = false,
    startIcon: @Composable (() -> Unit)? = null,
    endIcon: @Composable (() -> Unit)? = null
) {
    val colors = when (variant) {
        ButtonVariant.Primary -> ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary
        )
        ButtonVariant.Secondary -> ButtonDefaults.outlinedButtonColors(
            contentColor = MaterialTheme.colorScheme.primary
        )
        ButtonVariant.Tertiary -> ButtonDefaults.textButtonColors(
            contentColor = MaterialTheme.colorScheme.primary
        )
    }

    val contentPadding = when (size) {
        ButtonSize.Small -> PaddingValues(horizontal = 12.dp, vertical = 6.dp)
        ButtonSize.Medium -> PaddingValues(horizontal = 16.dp, vertical = 8.dp)
        ButtonSize.Large -> PaddingValues(horizontal = 20.dp, vertical = 12.dp)
    }

    val buttonComposable: @Composable () -> Unit = {
        Button(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled && !loading,
            colors = colors,
            contentPadding = contentPadding
        ) {
            if (loading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            } else {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    startIcon?.invoke()
                    Text(text = text)
                    endIcon?.invoke()
                }
            }
        }
    }

    when (variant) {
        ButtonVariant.Primary -> buttonComposable()
        ButtonVariant.Secondary -> OutlinedButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled && !loading,
            colors = colors,
            contentPadding = contentPadding
        ) {
            // Same content as above
        }
        ButtonVariant.Tertiary -> TextButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled && !loading,
            colors = colors,
            contentPadding = contentPadding
        ) {
            // Same content as above
        }
    }
}

@Composable
fun AndroidTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String? = null,
    error: String? = null,
    enabled: Boolean = true,
    readOnly: Boolean = false,
    singleLine: Boolean = true,
    maxLines: Int = Int.MAX_VALUE,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    keyboardActions: KeyboardActions = KeyboardActions.Default
) {
    Column(modifier = modifier) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = { Text(label) },
            placeholder = placeholder?.let { { Text(it) } },
            leadingIcon = leadingIcon,
            trailingIcon = trailingIcon,
            isError = error != null,
            enabled = enabled,
            readOnly = readOnly,
            singleLine = singleLine,
            maxLines = maxLines,
            keyboardOptions = keyboardOptions,
            keyboardActions = keyboardActions,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                errorBorderColor = MaterialTheme.colorScheme.error,
                focusedLabelColor = MaterialTheme.colorScheme.primary,
                unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                errorLabelColor = MaterialTheme.colorScheme.error
            ),
            modifier = Modifier.fillMaxWidth()
        )

        if (error != null) {
            Text(
                text = error,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(start = 16.dp, top = 4.dp)
            )
        }
    }
}

enum class ButtonVariant {
    Primary, Secondary, Tertiary
}

enum class ButtonSize {
    Small, Medium, Large
}
```

## 자동 토큰 변환 시스템

### Style Dictionary 크로스 플랫폼 설정

```javascript
// style-dictionary.config.js - 크로스 플랫폼 토큰 생성
const StyleDictionary = require('style-dictionary');

// Web CSS 변수 생성
StyleDictionary.registerFormat({
  name: 'css/variables',
  formatter: function(dictionary) {
    return `:root {\n${dictionary.allTokens
      .map(token => `  --${token.name}: ${token.value};`)
      .join('\n')}\n}`;
  }
});

// iOS Swift 상수 생성
StyleDictionary.registerFormat({
  name: 'ios/swift/class',
  formatter: function(dictionary) {
    const tokens = dictionary.allTokens
      .map(token => {
        const value = token.type === 'color'
          ? `Color("${token.name}")`
          : `${token.value}`;
        return `    static let ${token.name} = ${value}`;
      })
      .join('\n');

    return `import SwiftUI\n\nstruct DesignTokens {\n${tokens}\n}`;
  }
});

// Android XML 리소스 생성
StyleDictionary.registerFormat({
  name: 'android/xml',
  formatter: function(dictionary) {
    const colorTokens = dictionary.allTokens
      .filter(token => token.type === 'color')
      .map(token => `    <color name="${token.name}">${token.value}</color>`)
      .join('\n');

    const dimenTokens = dictionary.allTokens
      .filter(token => token.type === 'dimension')
      .map(token => `    <dimen name="${token.name}">${token.value}dp</dimen>`)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<resources>\n${colorTokens}\n${dimenTokens}\n</resources>`;
  }
});

// Kotlin Compose 상수 생성
StyleDictionary.registerFormat({
  name: 'android/compose/tokens',
  formatter: function(dictionary) {
    const colorTokens = dictionary.allTokens
      .filter(token => token.type === 'color')
      .map(token => `    val ${token.name} = Color(${token.value.replace('#', '0xFF')})`)
      .join('\n');

    const spacingTokens = dictionary.allTokens
      .filter(token => token.type === 'dimension')
      .map(token => `    val ${token.name} = ${token.value}.dp`)
      .join('\n');

    return `package com.example.designsystem\n\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.unit.dp\n\nobject DesignTokens {\n${colorTokens}\n${spacingTokens}\n}`;
  }
});

module.exports = {
  source: ['tokens/**/*.json'],
  platforms: {
    web: {
      transformGroup: 'web',
      buildPath: 'dist/web/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables'
      }]
    },
    ios: {
      transformGroup: 'ios',
      buildPath: 'dist/ios/',
      files: [{
        destination: 'DesignTokens.swift',
        format: 'ios/swift/class'
      }]
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
    },
    compose: {
      transformGroup: 'compose',
      buildPath: 'dist/android/compose/',
      files: [{
        destination: 'DesignTokens.kt',
        format: 'android/compose/tokens'
      }]
    }
  }
};
```

## SuperClaude 크로스 플랫폼 명령어

### 플랫폼별 컴포넌트 생성

```bash
# 멀티 플랫폼 컴포넌트 생성
/create component Button --platforms "web,ios,android" --variants "primary,secondary,ghost" --sync-tokens

# 플랫폼 특화 컴포넌트 생성
/create component Navigation --platform web --pattern "responsive-navbar" --mobile-menu
/create component Navigation --platform ios --pattern "navigation-controller" --large-title
/create component Navigation --platform android --pattern "bottom-navigation" --material3

# 토큰 동기화
/sync-tokens --platforms "web,ios,android" --format "css,swift,xml,compose"

# 플랫폼 간 일관성 검증
/validate cross-platform --consistency --design-tokens --component-behavior

# 반응형 레이아웃 생성
/create layout --pattern "responsive-grid" --breakpoints "mobile,tablet,desktop" --platform web

# 적응형 레이아웃 생성 (iOS)
/create layout --pattern "adaptive-split" --size-classes "compact,regular" --platform ios

# 다양한 화면 크기 대응 (Android)
/create layout --pattern "flexible-grid" --screen-sizes "small,normal,large,xlarge" --platform android
```

### 플랫폼 최적화 명령어

```bash
# 웹 성능 최적화
/optimize web --lazy-loading --code-splitting --compression --accessibility

# iOS 최적화
/optimize ios --memory-management --smooth-scrolling --hig-compliance --dark-mode

# Android 최적화
/optimize android --material-theming --gesture-navigation --battery-optimization --accessibility

# 크로스 플랫폼 테스트
/test cross-platform --visual-regression --behavior-consistency --performance
```

이러한 크로스 플랫폼 디자인 시스템을 통해 모든 플랫폼에서 일관된 사용자 경험을 제공하면서도 각 플랫폼의 특성을 살릴 수 있습니다.