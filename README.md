# Task Priority Analyzer  
Singularium Internship Assignment 2025

A full-stack application that analyzes and prioritizes tasks using Django REST Framework (backend) and vanilla HTML/CSS/JavaScript (frontend).  
The tool evaluates tasks based on importance, difficulty, and deadline closeness, and provides sorted results using multiple strategies.

------------------------------------------------------------
# 1. Setup Instructions
------------------------------------------------------------

## Backend Setup (Django)

1. Navigate to backend:
   cd backend

2. Create and activate virtual environment:
   Windows:
       python -m venv venv
       venv\Scripts\activate
   Mac/Linux:
       python3 -m venv venv
       source venv/bin/activate

3. Install dependencies:
       pip install -r requirements.txt

4. Apply migrations:
       python manage.py migrate

5. Start server:
       python manage.py runserver

Backend will run at:
http://127.0.0.1:8000/


## Frontend Setup

No installation required.

Just open:
frontend/index.html
in Chrome OR right-click inside VSCode → “Open with Live Server”.

Frontend uses Fetch API to call backend.


------------------------------------------------------------
# 2. Algorithm Explanation (≈350 words)
------------------------------------------------------------

The priority algorithm is built to help users determine which tasks deserve immediate attention. Each task contains five fields: description, deadline, difficulty (1–3), importance (1–3), and estimated time. The algorithm evaluates tasks through a weighted scoring model designed to balance urgency, importance, and complexity.

The final priority score is computed in tasks/scoring.py using:

Priority Score =
(Importance × 0.5) +
(Difficulty × 0.3) +
(Deadline Closeness × 0.2)

The highest weight is assigned to importance because tasks that align with core objectives should naturally be prioritized. Difficulty receives moderate weight since tasks that are harder often require early planning. The deadline closeness factor contributes urgency without dominating the score.

Deadline closeness is calculated using simple bands:
• 3 → deadline today or tomorrow  
• 2 → deadline in 2–3 days  
• 1 → deadline more than 3 days away  

This prevents far deadlines from artificially decreasing priority.

The resulting score typically ranges from 1.0 to 3.0. Higher scores indicate higher priority.

On the frontend, four sorting strategies are available:

1. Fastest Wins: Sorts by estimated time (shortest tasks first).  
2. High Impact: Sorts by task importance, regardless of effort.  
3. Deadline Driven: Sorts by nearest deadlines.  
4. Smart Balance: Uses backend priority score (default).

This architecture separates “calculation” (backend responsibility) from “strategy selection” (frontend responsibility). It also mirrors how real productivity tools work: they compute a score but allow users to change how results are displayed.

The final design gives users a clear, interpretable breakdown of why each task is ranked where it is, including explanation text, urgency indication, and color-coded priority levels (High/Medium/Low).

------------------------------------------------------------
# 3. Design Decisions
------------------------------------------------------------

• Scoring logic isolated in scoring.py for readability and testability.  
• Django REST Framework chosen for simple JSON APIs.  
• No frontend frameworks (per assignment requirement).  
• Strategies handled on the frontend for instant re-sorting.  
• Tasks stored in SQLite using Django ORM.  
• UI uses semantic HTML + custom CSS for a polished look.  

------------------------------------------------------------
# 4. Time Breakdown
------------------------------------------------------------

• Backend models + API: 1.5 hours  
• Scoring algorithm + testing: 1 hour  
• Frontend UI + layout + styling: 3 hours  
• Bulk JSON support + strategy dropdown: 1.5 hours  
• Debugging + CORS + polishing: 1 hour  
• README + documentation + Git setup: 30 minutes  
Total: ~8 hours

------------------------------------------------------------
# 5. Bonus Challenges
------------------------------------------------------------

• Dependency Graph Visualization → Not attempted  
• Date Intelligence → Not attempted  
• Eisenhower Matrix → Not attempted  
• Learning System → Not attempted  
• Unit Tests → Completed (3 scoring tests)

------------------------------------------------------------
# 6. Future Improvements
------------------------------------------------------------

• Add user authentication and per-user task storage  
• Add Eisenhower Matrix 2×2 grid (Urgent vs Important)  
• Add calendar view and drag-and-drop kanban board  
• Use local storage to persist tasks without backend  
• Add charts for effort distribution  
• Introduce ML-based adaptive scoring  

------------------------------------------------------------
# 7. Running Unit Tests
------------------------------------------------------------

Inside backend directory:
    python manage.py test

Includes 3 required unit tests for scoring algorithm.

------------------------------------------------------------
# 8. Project Structure
------------------------------------------------------------

task-analyzer/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── task_analyzer/
│   └── tasks/
│       ├── models.py
│       ├── scoring.py
│       ├── serializers.py
│       ├── views.py
│       └── tests.py
│
└── frontend/
    ├── index.html
    ├── styles.css
    └── script.js

------------------------------------------------------------
# 9. Conclusion
------------------------------------------------------------

This repository includes all required backend logic, frontend interface, unit tests, documentation, and sorting strategies. It satisfies every submission requirement from the assignment brief.

Please run the backend and open the frontend HTML file to interact with the system.
