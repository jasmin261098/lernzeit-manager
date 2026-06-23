# Datenmodell: Lernzeit-Manager

```
User (1) ──────────── (n) LearningGoal
    │                          │
    │ (1)                      │ (1)
    │                          │
    ├── (n) StudySession ──── (n)
    │
    ├── (n) LearningPlan
    │         │
    │         └── (1) MonthlyPlan (n)
    │
    └── (n) Reminder
```

### **Beziehungen (Relations)**

- **1:n (One-to-Many)** – Ein User hat viele Lernziele
- **1:1** – Ein User hat genau ein Profil.