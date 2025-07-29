# DINO App System Architecture

This document provides visual architecture diagrams for the DINO travel management application, illustrating system components, data flow, and integrations.

## 🏗️ Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React Components]
        State[State Management]
        Forms[Form Validation]
    end
    
    subgraph "API Gateway"
        Auth[NextAuth.js]
        Routes[API Routes]
        Middleware[Middleware]
    end
    
    subgraph "Business Logic"
        TripLogic[Trip Management]
        SchengenCalc[Schengen Calculator]
        Validation[Data Validation]
    end
    
    subgraph "External APIs"
        Google[Google OAuth]
        Calendar[Google Calendar]
        Gmail[Gmail API]
    end
    
    subgraph "Data Layer"
        Prisma[Prisma ORM]
        DB[(PostgreSQL)]
        Cache[Redis Cache]
    end
    
    subgraph "Infrastructure"
        Vercel[Vercel Hosting]
        Edge[Edge Functions]
        CDN[Global CDN]
    end

    UI --> State
    State --> Forms
    Forms --> Routes
    Routes --> Auth
    Auth --> Google
    Routes --> TripLogic
    TripLogic --> SchengenCalc
    SchengenCalc --> Validation
    Validation --> Prisma
    Prisma --> DB
    Routes --> Cache
    Calendar --> Routes
    Gmail --> Routes
    Routes --> Edge
    Edge --> Vercel
    Vercel --> CDN

    classDef client fill:#e1f5fe
    classDef api fill:#f3e5f5
    classDef business fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef data fill:#fce4ec
    classDef infra fill:#f1f8e9

    class UI,State,Forms client
    class Auth,Routes,Middleware api
    class TripLogic,SchengenCalc,Validation business
    class Google,Calendar,Gmail external
    class Prisma,DB,Cache data
    class Vercel,Edge,CDN infra
```

## 🗄️ Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        string image
        datetime emailVerified
        datetime createdAt
        datetime updatedAt
    }
    
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string refresh_token
        string access_token
        int expires_at
        string token_type
        string scope
        string id_token
        string session_state
    }
    
    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }
    
    CountryVisit {
        string id PK
        string userId FK
        string countryCode
        datetime entryDate
        datetime exitDate
        string purpose
        string status
        boolean isSchengenArea
        string notes
        datetime createdAt
        datetime updatedAt
    }
    
    NotificationSettings {
        string id PK
        string userId FK
        boolean emailNotifications
        boolean schengenAlerts
        boolean reminderDays
        datetime createdAt
        datetime updatedAt
    }

    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ CountryVisit : "creates"
    User ||--|| NotificationSettings : "configures"
```

## 🔄 Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Frontend"
        Comp[React Component]
        Hook[Custom Hook]
        State[Local State]
    end
    
    subgraph "API Layer"
        Route[API Route]
        Auth[Auth Check]
        Valid[Validation]
    end
    
    subgraph "Business Layer"
        Service[Service Function]
        Calc[Calculations]
        Rules[Business Rules]
    end
    
    subgraph "Data Layer"
        ORM[Prisma ORM]
        DB[(Database)]
        Cache[(Cache)]
    end

    Comp --> Hook
    Hook --> Route
    Route --> Auth
    Auth --> Valid
    Valid --> Service
    Service --> Calc
    Calc --> Rules
    Rules --> ORM
    ORM --> DB
    ORM --> Cache
    
    Cache -.-> ORM
    ORM -.-> Rules
    Rules -.-> Calc
    Calc -.-> Service
    Service -.-> Valid
    Valid -.-> Route
    Route -.-> Hook
    Hook -.-> Comp

    classDef frontend fill:#e3f2fd
    classDef api fill:#f3e5f5
    classDef business fill:#e8f5e8
    classDef data fill:#fff3e0

    class Comp,Hook,State frontend
    class Route,Auth,Valid api
    class Service,Calc,Rules business
    class ORM,DB,Cache data
```

## 🧩 Component Architecture

```mermaid
graph TD
    subgraph "Pages"
        Home[Home Page]
        Trips[Trips Page]
        Schengen[Schengen Page]
        Profile[Profile Page]
    end
    
    subgraph "Layout Components"
        Layout[App Layout]
        Nav[Navigation]
        Sidebar[Sidebar]
        Footer[Footer]
    end
    
    subgraph "Feature Components"
        TripList[Trip List]
        TripForm[Trip Form]
        SchengenCalc[Schengen Calculator]
        Dashboard[Dashboard]
    end
    
    subgraph "UI Components"
        Button[Button]
        Input[Input]
        Card[Card]
        Modal[Modal]
        Alert[Alert]
    end
    
    subgraph "Custom Hooks"
        useTrips[useTrips]
        useSchengen[useSchengen]
        useAuth[useAuth]
    end

    Home --> Layout
    Trips --> Layout
    Schengen --> Layout
    Profile --> Layout
    
    Layout --> Nav
    Layout --> Sidebar
    Layout --> Footer
    
    Trips --> TripList
    Trips --> TripForm
    Schengen --> SchengenCalc
    Home --> Dashboard
    
    TripList --> Card
    TripForm --> Input
    TripForm --> Button
    SchengenCalc --> Alert
    Dashboard --> Card
    
    TripList --> useTrips
    SchengenCalc --> useSchengen
    Layout --> useAuth

    classDef page fill:#e1f5fe
    classDef layout fill:#f3e5f5
    classDef feature fill:#e8f5e8
    classDef ui fill:#fff3e0
    classDef hook fill:#fce4ec

    class Home,Trips,Schengen,Profile page
    class Layout,Nav,Sidebar,Footer layout
    class TripList,TripForm,SchengenCalc,Dashboard feature
    class Button,Input,Card,Modal,Alert ui
    class useTrips,useSchengen,useAuth hook
```

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant NextAuth
    participant Google
    participant Database

    User->>App: Click "Sign In"
    App->>NextAuth: Redirect to auth
    NextAuth->>Google: OAuth request
    Google->>User: Login prompt
    User->>Google: Enter credentials
    Google->>NextAuth: Authorization code
    NextAuth->>Google: Exchange for tokens
    Google->>NextAuth: Access & ID tokens
    NextAuth->>Database: Store/update user
    Database->>NextAuth: User record
    NextAuth->>App: Create session
    App->>User: Redirect to dashboard

    Note over User,Database: User is now authenticated
    
    User->>App: Access protected route
    App->>NextAuth: Check session
    NextAuth->>Database: Validate session
    Database->>NextAuth: Session valid
    NextAuth->>App: User authorized
    App->>User: Show protected content
```

## 📊 Schengen Calculation Flow

```mermaid
flowchart TD
    Start([User Request]) --> GetTrips[Get User Trips]
    GetTrips --> FilterSchengen[Filter Schengen Trips]
    FilterSchengen --> SortByDate[Sort by Entry Date]
    SortByDate --> InitCalc[Initialize Calculation]
    
    InitCalc --> LoopTrips{For Each Trip}
    LoopTrips --> CalcDays[Calculate Stay Days]
    CalcDays --> Check180[Check 180-day Window]
    Check180 --> Check90{Days > 90?}
    
    Check90 -->|Yes| AddViolation[Add Violation]
    Check90 -->|No| Continue[Continue]
    AddViolation --> Continue
    
    Continue --> MoreTrips{More Trips?}
    MoreTrips -->|Yes| LoopTrips
    MoreTrips -->|No| CalcRemaining[Calculate Remaining Days]
    
    CalcRemaining --> CalcNextEntry[Calculate Next Entry Date]
    CalcNextEntry --> FormatResults[Format Results]
    FormatResults --> End([Return Calculation])

    classDef process fill:#e3f2fd
    classDef decision fill:#fff3e0
    classDef data fill:#e8f5e8
    classDef result fill:#f3e5f5

    class GetTrips,FilterSchengen,SortByDate,InitCalc,CalcDays,Check180,AddViolation,Continue,CalcRemaining,CalcNextEntry,FormatResults process
    class LoopTrips,Check90,MoreTrips decision
    class Start,End result
```

## 🌐 API Architecture

```mermaid
graph TB
    subgraph "Client Requests"
        WebApp[Web App]
        Mobile[Mobile App]
        External[External API]
    end
    
    subgraph "API Gateway"
        CORS[CORS Handler]
        RateLimit[Rate Limiting]
        Auth[Authentication]
    end
    
    subgraph "API Routes"
        TripsAPI[/api/trips]
        SchengenAPI[/api/schengen]
        UserAPI[/api/user]
        AuthAPI[/api/auth]
    end
    
    subgraph "Middleware"
        Validation[Request Validation]
        Logging[Request Logging]
        Error[Error Handling]
    end
    
    subgraph "Services"
        TripService[Trip Service]
        SchengenService[Schengen Service]
        UserService[User Service]
    end
    
    subgraph "Data Access"
        Prisma[Prisma Client]
        Cache[Redis Cache]
        DB[(PostgreSQL)]
    end

    WebApp --> CORS
    Mobile --> CORS
    External --> CORS
    
    CORS --> RateLimit
    RateLimit --> Auth
    
    Auth --> TripsAPI
    Auth --> SchengenAPI
    Auth --> UserAPI
    Auth --> AuthAPI
    
    TripsAPI --> Validation
    SchengenAPI --> Validation
    UserAPI --> Validation
    
    Validation --> TripService
    Validation --> SchengenService
    Validation --> UserService
    
    TripService --> Prisma
    SchengenService --> Prisma
    UserService --> Prisma
    
    Prisma --> Cache
    Prisma --> DB
    
    Validation --> Logging
    Logging --> Error

    classDef client fill:#e1f5fe
    classDef gateway fill:#f3e5f5
    classDef routes fill:#e8f5e8
    classDef middleware fill:#fff3e0
    classDef services fill:#fce4ec
    classDef data fill:#f1f8e9

    class WebApp,Mobile,External client
    class CORS,RateLimit,Auth gateway
    class TripsAPI,SchengenAPI,UserAPI,AuthAPI routes
    class Validation,Logging,Error middleware
    class TripService,SchengenService,UserService services
    class Prisma,Cache,DB data
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Local Development]
        Tests[Automated Tests]
        Lint[Code Quality]
    end
    
    subgraph "CI/CD Pipeline"
        GitHub[GitHub Repository]
        Actions[GitHub Actions]
        Build[Build Process]
        Deploy[Deployment]
    end
    
    subgraph "Vercel Platform"
        Edge[Edge Functions]
        Static[Static Assets]
        Preview[Preview Deployments]
        Prod[Production]
    end
    
    subgraph "External Services"
        Supabase[(Supabase DB)]
        Redis[(Redis Cloud)]
        Analytics[Vercel Analytics]
        Monitoring[Error Tracking]
    end
    
    subgraph "CDN & Edge"
        CDN[Global CDN]
        EdgeCache[Edge Caching]
        DNS[DNS Management]
    end

    Dev --> Tests
    Tests --> Lint
    Lint --> GitHub
    
    GitHub --> Actions
    Actions --> Build
    Build --> Deploy
    
    Deploy --> Preview
    Deploy --> Prod
    
    Prod --> Edge
    Prod --> Static
    
    Edge --> Supabase
    Edge --> Redis
    
    Prod --> Analytics
    Prod --> Monitoring
    
    Static --> CDN
    CDN --> EdgeCache
    CDN --> DNS

    classDef dev fill:#e3f2fd
    classDef ci fill:#f3e5f5
    classDef platform fill:#e8f5e8
    classDef external fill:#fff3e0
    classDef cdn fill:#fce4ec

    class Dev,Tests,Lint dev
    class GitHub,Actions,Build,Deploy ci
    class Edge,Static,Preview,Prod platform
    class Supabase,Redis,Analytics,Monitoring external
    class CDN,EdgeCache,DNS cdn
```

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Success : Data loaded
    Loading --> Error : Failed to load
    
    Success --> Updating : User action
    Success --> Refreshing : Refresh request
    
    Updating --> Success : Update successful
    Updating --> Error : Update failed
    
    Refreshing --> Success : Refresh successful
    Refreshing --> Error : Refresh failed
    
    Error --> Loading : Retry
    Error --> Success : Manual fix
    
    Success --> [*] : Component unmount
    Error --> [*] : Component unmount
    
    note right of Success
        Data is cached and 
        available for use
    end note
    
    note right of Error
        Show error message
        with retry option
    end note
```

## 📱 Responsive Design Architecture

```mermaid
graph LR
    subgraph "Breakpoints"
        Mobile["Mobile\n< 640px"]
        Tablet["Tablet\n640px - 1024px"]
        Desktop["Desktop\n> 1024px"]
    end
    
    subgraph "Layout Patterns"
        Stack["Stack Layout\n(Mobile)"]
        Grid2["2-Column Grid\n(Tablet)"]
        Grid3["3-Column Grid\n(Desktop)"]
    end
    
    subgraph "Navigation"
        MobileNav["Hamburger Menu"]
        TabletNav["Tab Navigation"]
        DesktopNav["Sidebar Navigation"]
    end
    
    subgraph "Components"
        Cards["Responsive Cards"]
        Forms["Adaptive Forms"]
        Tables["Mobile-first Tables"]
    end

    Mobile --> Stack
    Mobile --> MobileNav
    
    Tablet --> Grid2
    Tablet --> TabletNav
    
    Desktop --> Grid3
    Desktop --> DesktopNav
    
    Stack --> Cards
    Grid2 --> Cards
    Grid3 --> Cards
    
    Stack --> Forms
    Grid2 --> Forms
    Grid3 --> Forms
    
    MobileNav --> Tables
    TabletNav --> Tables
    DesktopNav --> Tables

    classDef breakpoint fill:#e3f2fd
    classDef layout fill:#f3e5f5
    classDef nav fill:#e8f5e8
    classDef component fill:#fff3e0

    class Mobile,Tablet,Desktop breakpoint
    class Stack,Grid2,Grid3 layout
    class MobileNav,TabletNav,DesktopNav nav
    class Cards,Forms,Tables component
```

---

These architecture diagrams provide a comprehensive visual overview of the DINO application's:

- ✅ **System Architecture**: Overall component relationships and data flow
- ✅ **Database Schema**: Entity relationships and data structure
- ✅ **Component Hierarchy**: React component organization
- ✅ **Authentication Flow**: OAuth and session management
- ✅ **Business Logic**: Schengen calculation process
- ✅ **API Design**: RESTful endpoint architecture
- ✅ **Deployment Pipeline**: CI/CD and hosting infrastructure
- ✅ **State Management**: Application state flow
- ✅ **Responsive Design**: Multi-device layout patterns

Each diagram uses Mermaid syntax for easy rendering and maintenance within the documentation system.