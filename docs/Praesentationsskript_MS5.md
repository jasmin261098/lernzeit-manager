Projekt Software Engineering: Lernzeit-Manager

Ergebnispräsentation - Script
Vanessa Künzel & Jasmin Hundt


Folie 1 – Titelfolie
Sprecherin: Jasmin | ca. 1 Minute

Guten Tag und herzlich willkommen. Mein Name ist Jasmin Hundt, und das ist meine Kommilitonin Vanessa Künzel. Wir präsentieren heute die Ergebnisse unseres Softwareprojekts im Rahmen des Moduls Software Engineering.

Wir haben den Lernzeit-Manager entwickelt – eine Webanwendung, die Studierende dabei unterstützt, ihre Lernzeiten zu planen, zu erfassen und ihren Fortschritt nachzuverfolgen. Die Idee dahinter ist einfach: Viele Studierende – besonders berufsbegleitend Studierende – haben Schwierigkeiten, ihren Lernaufwand realistisch einzuschätzen und strukturiert zu verwalten. Der Lernzeit-Manager soll genau hier helfen.

In den nächsten 20 Minuten zeigen wir Ihnen, wie das Projekt verlaufen ist, was wir technisch umgesetzt haben, wie wir die Qualität gesichert haben, und schließlich eine kurze Live-Demo der Anwendung.

Folie 2 – Projektablauf & Meilensteine
Sprecherin: Jasmin | ca. 3 Minuten

Das Projekt lief von Mitte Mai bis Ende Juli 2026 – insgesamt rund zehn Wochen. Wir haben es in sieben Meilensteine gegliedert.

MS0 – Projektstart & Planung (17.–24. Mai): Wir haben das Team aufgestellt, das Thema bestätigt und eine erste grobe Planung erstellt. In dieser Phase haben wir auch unsere Arbeitsweise festgelegt: wöchentliche Sprint-Meetings jeden Sonntag, Aufgabenverwaltung über Redmine, Quellcode auf GitHub.

MS1 – Projektkonfiguration (bis 31. Mai): Wir haben die Projektvision formuliert, Rollen verteilt, Anforderungen erfasst und einen vollständigen Meilensteinplan erstellt. Vanessa hat die User Stories übernommen, ich die Anforderungsliste und das Backlog. Zusätzlich haben wir Risiken identifiziert und Gegenmaßnahmen definiert – zum Beispiel für Zeitmangel und unterschätzten Aufwand.

MS2 – Konzeptvalidierung (bis 7. Juni): Wir haben Anforderungsdokument, Architekturkonzept und Datenmodell fertiggestellt und in einem kurzen Projektvideo vorgestellt. Das war ein wichtiger Meilenstein, weil wir uns hier auf eine konkrete Architektur festgelegt haben: React-Frontend, Node.js-Backend, SQLite-Datenbank, alles in Docker.

MS3 – Entwicklungs- & Qualitätskonfiguration (bis 21. Juni): In dieser Phase haben wir die Softwareentwicklungskonfiguration dokumentiert, die Teststrategie festgelegt und mit der eigentlichen Implementierung begonnen. Beide haben gleichzeitig in ihren Bereichen gearbeitet – Vanessa am Frontend, ich am Backend.

MS4 – Implementierung & Dokumentation (bis 5. Juli): Das war die intensivste Phase. Alle Features wurden implementiert, Unit-Tests geschrieben, die Anwendung in Docker deployed und das Benutzerhandbuch sowie die Testdokumentation erstellt.

MS5 – Ergebnispräsentation (bis 12. Juli): Diese Präsentation hier.

Folie 3 – Liefergegenstände & Reflexion
Sprecherinnen: Jasmin & Vanessa | ca. 2 Minuten

Jasmin: Alle geplanten Liefergegenstände wurden fristgerecht abgeliefert: Projektkonfiguration, Anforderungsdokument, Architekturkonzept und Datenmodell zu MS2 – der implementierte Prototyp und die Testdokumentation zu MS4 – und Benutzerhandbuch sowie Projektdokumentation zu MS5.

Kurz zur Reflexion: Die Projektkonfiguration hat uns sehr geholfen, von Anfang an ein gemeinsames Verständnis zu entwickeln. Was wir im Nachhinein anders machen würden: die Technologieentscheidungen früher final festlegen. In der Konfiguration hatten wir noch NestJS als Backend-Framework vorgesehen – im Verlauf haben wir uns dann bewusst für einfaches Express.js entschieden, weil es für einen Prototyp this Größenordnung schlanker und direkter war. Das war die richtige Entscheidung, hätte aber früher getroffen werden sollen.

Vanessa: Das Benutzerhandbuch war aufwändiger als ursprünglich geschätzt, weil wir fachliche Prozesse, technische Dokumentation und Betriebsanleitung in einem Dokument zusammengeführt haben. Das Ergebnis ist dafür aber vollständig und direkt nutzbar.

Die Testdokumentation hat uns gezwungen, die Qualität der Backend-Implementierung nochmals systematisch zu überprüfen. Die 32 Unit-Tests, die dabei entstanden sind, haben tatsächlich zwei kleinere Logikfehler in der Fortschrittsberechnung aufgedeckt, die wir dann behoben haben.

Folie 4 – Technischer Überblick: Architektur
Sprecherin: Jasmin | ca. 2 Minuten

Kommen wir zur Technik. Der Lernzeit-Manager folgt einer klassischen Client-Server-Architektur mit drei Schichten.

Das Frontend ist eine Single-Page-Application auf Basis von React 19 mit TypeScript und Vite. Es enthält sechs Hauptbereiche: Dashboard, Lernziele, Planung, Timer, Benachrichtigungen und Authentifizierung. Der gesamte HTTP-Verkehr läuft über ein Vite-Proxy-Setup, das alle API-Requests an das Backend weiterleitet – der Browser kommuniziert also nie direkt mit Port 3000.

Das Backend ist ein Express.js REST-API-Server in TypeScript. Es gibt sechs Route-Gruppen: Auth, Goals, Plans, Sessions, Reminders und Dashboard. Alle Routen außer Login und Registrierung sind durch eine JWT-Middleware geschützt. Zusätzlich läuft ein Cronjob, der jede Minute fällige Erinnerungen verarbeitet.

Die Datenbank ist SQLite, verwaltet über Prisma ORM. SQLite war für diesen Prototyp die richtige Wahl: kein separater Datenbankserver, einfaches Deployment, und Prisma gibt uns typsicheren Datenbankzugriff.

Die gesamte Anwendung wird über Docker Compose orchestriert. Ein docker compose up --build reicht aus, um das komplette System zu starten – kein lokales Node.js erforderlich.

Folie 5 – Technischer Überblick: Datenmodell & API
Sprecherin: Vanessa | ca. 2 Minuten

Das Datenmodell besteht aus sechs Entitäten, die alle am zentralen User hängen.

Ein User hat beliebig viele LearningGoals – also Lernziele mit Titel, Stundenziel, Zeitraum und Status. Dieser Status durchläuft die Übergänge: offen → in Bearbeitung → abgeschlossen.

StudySessions sind die einzelnen gemessenen Lerneinheiten. Sie haben eine Startzeit, eine Endzeit und eine Dauer in Minuten. Eine Session kann optional einem Lernziel zugeordnet werden – nur dann fließt die Zeit in den Fortschrittsbalken ein. Wichtig: Es kann immer nur eine aktive Session pro Nutzer geben.

Ein LearningPlan ist eine Grobplanung mit bis zu sechs MonthlyPlans. Beim Löschen eines Lernplans werden die Monatspläne automatisch mitgelöscht – Cascade Delete.

Reminders sind einfache Einträge mit Nachricht und Zeitpunkt. Der serverseitige Cronjob prüft jede Minute, ob welche fällig sind, und markiert sie als gesendet. Zusätzlich gibt es eine Inaktivitäts-Warnung, wenn die letzte Session mehr als drei Tage zurückliegt.

Die REST-API umfasst insgesamt 18 Endpunkte. Alle Zugriffe auf eigene Ressourcen – Ziele, Pläne, Sessions, Erinnerungen – sind auf den jeweils authentifizierten Nutzer beschränkt.

Folie 6 – Testabschlussbericht
Sprecherin: Jasmin | ca. 2 Minuten

Zur Qualitätssicherung: Wir haben Backend-Unit-Tests mit Vitest geschrieben.

Das Ergebnis: 32 von 32 Testfällen bestanden, 0 fehlgeschlagen, Laufzeit 256 Millisekunden. Die Tests wurden am 5. Juli 2026 ausgeführt.

Abgedeckt sind fünf Controller-Bereiche:

Die Auth-Middleware prüft fehlendes oder ungültiges Bearer-Token – vier Testfälle.

Der Auth-Controller testet Registrierung und Login vollständig: fehlende Pflichtfelder, doppelte E-Mail-Adressen, falsche Passwörter und die Erfolgsfälle – sieben Testfälle.

Der Goal-Controller deckt den kompletten CRUD-Zyklus ab, inklusive der drei Statuswerte open, in_progress und done sowie dem Fehlerfall bei ungültigem Status – zehn Testfälle.

Der Session-Controller prüft insbesondere die Geschäftsregel, dass keine zweite Session gestartet werden kann, solange eine aktive läuft – sechs Testfälle.

Der Dashboard-Controller validiert die Berechnungslogik: Gesamtstunden, Zielfortschritt in Prozent und die Begrenzung auf 100% auch wenn die geleistete Zeit das Ziel überschreitet – fünf Testfälle.

Alle Tests arbeiten mit gemockten Abhängigkeiten, also ohne echte Datenbank oder Dateisystem. Das hält die Tests schnell und isoliert.

Ergänzend haben wir manuelle Tests auf Desktop und Mobilgeräten durchgeführt, um Responsivität und Antwortzeiten unter zwei Sekunden zu verifizieren.

Folie 7 – Live-Demo
Sprecherin: Vanessa, Demonstration: Jasmin | ca. 7 Minuten
(Jasmin  teilt den Bildschirm, Browser geöffnet auf http://localhost:5173)

[1. Login mit Demo-Account – ca. 30 Sekunden]

Ich zeige Ihnen die Anwendung jetzt direkt. Wir starten beim Login. Die Anwendung hat beim ersten Start automatisch einen Demo-Account angelegt – E-Mail demo@lernzeit.de, Passwort demo1234. Nach dem Login werden wir direkt zum Dashboard weitergeleitet.

[2. Dashboard – ca. 1 Minute]

Das ist das zentrale Dashboard. Es zeigt auf einen Blick: die Gesamtstunden aller Lernsessions, die durchschnittliche Zielerreichung in Prozent, die Anzahl abgeschlossener Ziele sowie für jedes Lernziel einen eigenen Fortschrittsbalken mit geleisteten versus geplanten Stunden.

Der Demo-Account hat fünf abgeschlossene Sessions und drei Lernziele, sodass Sie hier bereits aussagekräftige Daten sehen.

[3. Lernziele – ca. 1 Minute]

Hier in der Zielverwaltung sehen wir die drei Demo-Ziele. Ich zeige kurz, wie ein neues Ziel angelegt wird: Titel eingeben, Stundenziel und Zeitraum setzen. Das Ziel startet mit Status „offen". Sobald ich erste Sessions diesem Ziel zuordne, berechnet das System den Fortschritt automatisch.

(Neues Ziel anlegen und speichern)

Den Status kann ich manuell weiterschalten – von offen auf in Bearbeitung, und schließlich auf abgeschlossen.

[4. Lernplanung – ca. 1 Minute]

In der Planungsansicht gibt es die Grobplanung. Der Demo-Account hat bereits einen Lernplan mit sechs Monatsplänen von Januar bis Juni. Ich kann für jeden Monat die geplanten Stunden und Notizen hinterlegen und die Ansicht nach Monat filtern.

[5. Timer / Zeiterfassung – ca. 1,5 Minuten]

Der Fokus-Timer ist das Herzstück der Zeiterfassung. Ich gebe ein Thema ein, ordne optional ein Lernziel zu – und starte den Timer. Die Session wird sofort in der Datenbank mit Startzeit angelegt. Den Timer kann ich pausieren und fortsetzen – das läuft client-seitig, damit kurze Unterbrechungen nicht als Lernzeit zählen. Wenn ich stoppe, werden Endzeit und Dauer gespeichert.

(Timer starten, kurz laufen lassen, stoppen)

Jetzt erscheint die Session in der Verlaufsanzeige darunter, und das Dashboard würde die Gesamtstunden entsprechend aktualisieren.

[6. Erinnerungen – ca. 1 Minute]

Im Benachrichtigungsbereich kann ich Erinnerungen anlegen: eine Nachricht und einen Zeitpunkt. Der Backend-Cronjob prüft jede Minute, ob eine Erinnerung fällig ist. Wenn ja, erscheint sie in der Benachrichtigungsglocke oben rechts. Außerdem gibt es die automatische Inaktivitäts-Warnung – wenn die letzte Session mehr als drei Tage zurückliegt, erscheint dort ein entsprechender Hinweis.

[7. Registrierung – ca. 30 Sekunden]

Abschließend kurz zur Registrierung. Über den Registrieren-Button kann sich jeder einen eigenen Account anlegen. E-Mail-Adresse und Passwort mit mindestens acht Zeichen – nach der Registrierung wird man automatisch eingeloggt und zum Dashboard weitergeleitet.

Das war die Demo. Die gesamte Anwendung läuft lokal in Docker, kein externer Server, keine Cloud.

Folie 8 – Lessons Learned
Sprecherinnen: Jasmin & Vanessa | ca. 2 Minuten

Vanessa: Die wichtigste Erkenntnis aus dem Frontend: TypeScript hat sich gelohnt. Der Overhead am Anfang durch Typdefinitionen war spürbar, hat uns aber vor mehreren Laufzeitfehlern bewahrt, die sonst erst in der manuellen Testphase aufgefallen wären. Für das nächste Projekt würden wir TypeScript von Beginn an noch konsequenter nutzen.

Eine zweite Erkenntnis: Docker Compose als Entwicklungsumgebung war eine sehr gute Entscheidung. Beide haben auf unterschiedlichen Betriebssystemen gearbeitet – durch Docker gab es kein klassisches „bei mir läuft's"-Problem.

Jasmin: Aus Backend-Sicht: Die Entscheidung, von NestJS auf Express umzusteigen, war richtig für die Projektgröße – NestJS hätte mehr Boilerplate erfordert als Mehrwert gebracht. Die Lektion daraus: Technologieentscheidungen sollten am tatsächlichen Projektumfang gemessen werden, nicht an theoretischen Skalierungsszenarien.

Außerdem: Prisma als ORM hat sich sehr bewährt. Typsicherer Datenbankzugriff, einfache Schemadefinition, und das automatische Cascade Delete hat uns explizite Löschlogik gespart.

Was wir beim nächsten Mal anders machen würden: Frontend-Tests früher und systematischer aufsetzen. Die Backend-Unit-Tests haben uns viel Sicherheit gegeben – das gleiche Niveau hätten wir gern auch für die Frontend-Komponenten gehabt.

Folie 9 – Abschluss
Sprecherin: Jasmin | ca. 30 Sekunden

Damit kommen wir zum Ende unserer Präsentation.

Der Lernzeit-Manager ist eine vollständig funktionsfähige Webanwendung, die alle definierten Anforderungen umsetzt – von der Benutzerverwaltung über Lernziele und Zeitplanung bis hin zu Timer, Dashboard und Erinnerungen. Alle 32 Backend-Unit-Tests bestanden, alle Liefergegenstände wurden fristgerecht abgegeben.

Das Repository mit vollständigem Quellcode, README und allen Dokumenten ist öffentlich unter https://github.com/jasmin261098/lernzeit-manager verfügbar.

Wir bedanken uns für Ihre Aufmerksamkeit.
