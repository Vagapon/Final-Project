# Database Design - ERD Diagram

```mermaid
erDiagram
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : assigned_to
    User {
        string id PK
        string name
        string email UK
        string password
        string firebaseUid
        string provider
        string phone_number UK
        string avatar
        string address
        date created_date
        date updated_date
    }
    Role {
        string id PK
        string name
        string code UK
        date created_date
    }
    UserRole {
        string id PK
        string user_id FK
        string role_id FK
    }

    User ||--o| Team : manages
    Team ||--o{ TeamMember : has
    Team ||--o{ TeamMatch : participates
    Team {
        string id PK
        string name UK
        string shortName
        string description
        string managerId FK
        string avatar
        date createdAt
        date updatedAt
    }
    TeamMember {
        string id PK
        string teamId FK
        string avatar
        string nameMember
        int number
        boolean isCaptain
        date createdAt
        date updatedAt
    }
    TeamMatch {
        string id PK
        string matchId FK
        string teamId FK
    }

    Season ||--o{ Event : contains
    SportType ||--o{ Event : categorizes
    SportType ||--o{ Field : categorizes
    User ||--o{ Event : creates
    Event ||--o{ EventRegistration : receives
    Event ||--o{ Match : has
    Event ||--o{ Ranking : tracks
    Team ||--o{ EventRegistration : registers
    Team ||--o{ Match : plays
    Team ||--o{ Ranking : ranked_in
    Season ||--o{ Ranking : belongs_to
    
    Season {
        string id PK
        string name UK
        date startDate
        date endDate
        string status
        string backgroundImage
        date createdAt
        date updatedAt
    }
    SportType {
        string id PK
        string name
        string code
        string description
        string rules
        date createdAt
        date updatedAt
    }
    Event {
        string id PK
        string name UK
        string description
        string sportTypeId FK
        string seasonId FK
        string createdBy FK
        int maxTeams
        date startDate
        date endDate
        string address
        string location
        int numberOfMatch
        string status
        string avatar
        date createdAt
        date updatedAt
    }
    EventRegistration {
        string id PK
        string teamId FK
        string eventId FK
        string adminId FK
        string status
        date createdAt
        date updatedAt
    }
    Match {
        string id PK
        string team1Id FK
        string team2Id FK
        string fieldId FK
        string eventId FK
        date matchDate
        string matchTime
        int duration
        string round
        int matchNumber
        string address
        string location
        string status
        object score
        date createdAt
        date updatedAt
    }
    Ranking {
        string id PK
        string eventId FK
        string teamId FK
        string seasonId FK
        int win
        int loss
        int draw
        int gf
        int ga
        int gd
        int point
        date updatedAt
    }

    User ||--o{ Field : manages
    Field ||--o{ TimeSlot : has
    Field ||--o{ Match : hosts
    Field ||--o{ Booking : booked
    User ||--o{ Booking : makes
    Team ||--o{ Booking : books_for
    TimeSlot ||--o{ Booking : used_in
    Booking ||--o| Payment : has
    
    Field {
        string id PK
        string name
        string fieldNumber
        string address
        string location
        string sportTypeId FK
        string purpose
        float pricePerHour
        object openingHours
        string status
        string managedBy FK
        array images
        string description
        date createdAt
        date updatedAt
    }
    TimeSlot {
        string id PK
        string fieldId FK
        string startTime
        string endTime
        string timeType
        float multiplier
        string status
        string description
        date createdAt
    }
    Booking {
        string id PK
        string userId FK
        string fieldId FK
        string timeSlotId FK
        string teamId FK
        date startTime
        date endTime
        float duration
        float totalPrice
        string status
        string paymentStatus
        string paymentMethod
        string paymentId
        string notes
        date createdAt
        date updatedAt
    }
    Payment {
        string id PK
        string bookingId FK
        string userId FK
        float amount
        string paymentMethod
        string paymentStatus
        string transactionId
        string paymentId
        string bankCode
        string accountNumber
        object webhookData
        date paidAt
        date createdAt
        date updatedAt
    }

    User ||--o{ Blog : writes
    Blog ||--o{ Comment : has
    User ||--o{ Comment : writes
    Comment ||--o{ Comment : replies_to
    
    Blog {
        string id PK
        string userId FK
        string title
        string content
        string sport
        string location
        string imageUrl
        int likes
        int comments
        int shares
        date createdAt
        date updatedAt
    }
    Comment {
        string id PK
        string userId FK
        string blogId FK
        string parentId FK
        string content
        date createdAt
        date updatedAt
    }

    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Notification : sends
    User ||--o{ Notification : receives
    Team ||--o{ Message : related_to
    Team ||--o{ Notification : related_to
    Event ||--o{ Notification : related_to
    Booking ||--o{ Notification : related_to
    
    Message {
        string id PK
        string senderId FK
        string receiveId FK
        string teamId FK
        string content
        string type
        boolean isRead
        date createdAt
        date updatedAt
    }
    Notification {
        string id PK
        string senderId FK
        string receiveId FK
        string teamId FK
        string eventId FK
        string bookingId FK
        string type
        string content
        boolean isRead
        date createdAt
        date updatedAt
    }
```

## Key Relationships Summary

### User & Authentication
- **User** ↔ **UserRole** ↔ **Role**: Many-to-many relationship for role-based access control

### Team Management
- **User** (manager) → **Team** (1:1, unique constraint)
- **Team** → **TeamMember** (1:many)
- **Team** ↔ **TeamMatch** ↔ **Match** (many-to-many participation)

### Event Management
- **Season** → **Event** (1:many)
- **SportType** → **Event** (1:many)
- **SportType** → **Field** (1:many)
- **User** (admin) → **Event** (1:many, createdBy)
- **Event** ↔ **EventRegistration** ↔ **Team** (many-to-many registration)
- **Event** → **Match** (1:many)
- **Event** → **Ranking** (1:many)
- **Season** → **Ranking** (1:many)

### Field & Booking
- **User** (admin/staff) → **Field** (1:many, managedBy)
- **Field** → **TimeSlot** (1:many)
- **User** → **Booking** (1:many)
- **Field** → **Booking** (1:many)
- **TimeSlot** → **Booking** (1:many)
- **Team** → **Booking** (1:many, optional)
- **Booking** → **Payment** (1:1)

### Social Features
- **User** → **Blog** (1:many)
- **Blog** → **Comment** (1:many)
- **User** → **Comment** (1:many)
- **Comment** → **Comment** (self-referential, parentId for replies)

### Communication
- **User** ↔ **Message** (many-to-many, senderId/receiveId)
- **User** ↔ **Notification** (many-to-many, senderId/receiveId)
- **Team**, **Event**, **Booking** can be referenced in notifications

