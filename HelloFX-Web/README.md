# GroceryNotes – Web Version

React + Flask conversion of the original JavaFX desktop app.

## Structure

```
HelloFX-Web/
├── backend/          # Python Flask REST API
│   ├── app.py
│   └── requirements.txt
└── frontend/         # React app
    ├── public/
    └── src/
        ├── pages/
        │   ├── Home.js
        │   ├── CreateList.js
        │   ├── LoadList.js
        │   └── RecipeSearcher.js
        ├── App.js
        └── App.css
```

## Running the app

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API runs on http://localhost:5000

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The React app runs on http://localhost:3000

## Features

| Page | Description |
|------|-------------|
| Home | Main menu with navigation |
| Create List | Save a grocery list to SQLite |
| Load List | View and delete saved lists |
| Recipe Searcher | Upload a food image for AI classification |

The AI prediction route (`/api/predict`) calls `NewImageAI.predict_image()` from the
original Python code. Make sure `checkpoint.pth` exists in the project root.
