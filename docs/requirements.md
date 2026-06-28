# Anforderungsdokument: Lernzeit-Manager

## 1. Projektüberblick

Der Lernzeit-Manager ist eine Webanwendung, die Studierende – insbesondere berufsbegleitend Studierende – bei der Planung, Nachverfolgung und Einhaltung ihrer Lernzeiten und Lernziele unterstützt. Das Studium erfordert ein hohes Maß an Zeitmanagement; die Anwendung hilft dabei, Lernzeiten gemäß dem vorgesehenen Workload aus den Modulhandbüchern einzuplanen, die Einhaltung zu überprüfen und die Planung bei Bedarf anzupassen.

---

## 2. Funktionale Anforderungen

### 2.1 Benutzerverwaltung

| ID    | Anforderung |
|-------|-------------|
| FA-01 | ✅ Neue Benutzer können sich mit E-Mail und Passwort registrieren. |
| FA-02 | ✅ Registrierte Benutzer können sich anmelden (Login). |
| FA-03 | ✅ Angemeldete Benutzer können sich abmelden (Logout). |

### 2.2 Lernziele

| ID    | Anforderung |
|-------|-------------|
| FA-04 | ✅ Benutzer können individuelle Lernziele anlegen (z. B. Modul abschließen, Klausur bestehen, Projektbericht einreichen). |
| FA-05 | ✅ Bestehende Lernziele können bearbeitet werden. |
| FA-06 | ✅ Lernziele können gelöscht werden. |
| FA-07 | ✅ Der Bearbeitungsstatus eines Lernziels (offen / in Bearbeitung / abgeschlossen) kann verwaltet werden. |

### 2.3 Lernzeitplanung

| ID    | Anforderung |
|-------|-------------|
| FA-08 | ✅ Benutzer können eine Grobplanung der Lernzeiten für einen Zeitraum von bis zu sechs Monaten erstellen. |
| FA-09 | ✅ Benutzer können Monatspläne mit Detailplanung von Lernzeiten und Zwischenzielen erstellen. |
| FA-10 | ✅ Einzelne Lernblöcke können innerhalb der Monats- und Grobplanung angelegt, bearbeitet und gelöscht werden. |

### 2.4 Zeiterfassung

| ID    | Anforderung |
|-------|-------------|
| FA-11 | ✅ Benutzer können einen Timer starten, um die ungestörte Lernzeit zu messen. |
| FA-12 | ✅ Der laufende Timer kann pausiert werden. |
| FA-13 | ✅ Der laufende Timer kann gestoppt werden; die erfasste Zeit wird gespeichert. |
| FA-14 | ✅ Erfasste Lernzeiten werden dauerhaft persistiert und sind abrufbar. |

### 2.5 Fortschrittsverfolgung

| ID    | Anforderung |
|-------|-------------|
| FA-15 | ✅ Benutzer können erreichte Lernziele als abgeschlossen markieren und dokumentieren. |
| FA-16 | ✅ Benutzer können ihre bisher investierten Gesamtlernstunden einsehen. |
| FA-17 | ✅ Der aktuelle Fortschritt in Bezug auf Lernzeit und Zielerreichung wird visualisiert. |

### 2.6 Benachrichtigungen und Erinnerungen

| ID    | Anforderung |
|-------|-------------|
| FA-18 | ✅ Das System versendet Erinnerungen für geplante Lernzeiten. |
| FA-19 | ✅ Das System benachrichtigt Benutzer bei längerer, ungeplanter Lernzeitinaktivität. |

### 2.7 Dashboard

| ID    | Anforderung |
|-------|-------------|
| FA-20 | ✅ Ein zentrales Dashboard stellt die wichtigsten Informationen auf einen Blick bereit. |
| FA-21 | ✅ Das Dashboard visualisiert die investierten Lernzeiten (z. B. als Diagramm). |
| FA-22 | ✅ Das Dashboard zeigt eine Übersicht zur Zielerreichung. |
| FA-23 | ✅ Das Dashboard stellt statistische Auswertungen zur Lernaktivität bereit. |

---

## 3. Qualitätsanforderungen

| ID    | Kategorie        | Anforderung |
|-------|------------------|-------------|
| QA-01 | Responsivität    | ✅ Die Anwendung ist als responsive Webanwendung umgesetzt und auf Desktop- und mobilen Endgeräten vollständig nutzbar. |
| QA-02 | Usability        | ✅ Die Bedienung ist intuitiv gestaltet; neue Benutzer können ohne umfangreiche Einarbeitung mit der Anwendung arbeiten. |
| QA-03 | Performance      | ✅ Antwortzeiten liegen im Regelfall unter zwei Sekunden. |
| QA-04 | Sicherheit       | ✅ Die Authentifizierung erfolgt sicher (z. B. Passwort-Hashing, geschützte API-Endpunkte). |
| QA-05 | Wartbarkeit      | ✅ Der Quellcode ist nachvollziehbar dokumentiert, wartbar strukturiert und erweiterbar. |

---

## 4. Randbedingungen

| ID    | Bedingung |
|-------|-----------|
| RB-01 | Die Entwicklung erfolgt im Rahmen eines Studienprojekts durch ein Team von zwei Personen. |
| RB-02 | Das Ergebnis ist eine prototypische Umsetzung der definierten Anforderungen. |
| RB-03 | Die Anwendung wird mit Docker Compose bereitgestellt und ausgeführt. |
| RB-04 | Versionsverwaltung und Zusammenarbeit erfolgen über GitHub. |