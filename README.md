# TypeBoost

A professional, high-performance typing game designed to help users improve their typing speed and accuracy with real-time analytics and a sleek, premium interface.

## 🚀 Features
- **Real-time WPM/Accuracy Tracking**: Monitor your speed and precision as you type.
- **Multiple Game Modes**: Choose from Words, Quotes, and Time-based challenges.
- **Admin Dashboard**: Manage game content and view user statistics.
- **Premium Aesthetics**: Smooth animations powered by Framer Motion and a modern Emerald/Deep Slate theme.
- **Detailed Analytics**: Visualize your progress with interactive charts via Chart.js.
- **Firebase Integration**: Secure authentication and cloud storage for game data.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Chart.js.
- **Backend/Services**: Node.js, Firebase (Firestore, Auth).
- **Icons**: Lucide React, React Icons.

## 📦 Installation

Step-by-step instructions to get the project running locally:

### 1. Clone the repository
```bash
git clone https://github.com/tamed29/typing-game.git
cd typing-game
```

### 2. Install dependencies
Install frontend dependencies:
```bash
cd frontend
npm install
```
Install backend dependencies:
```bash
cd ../backend
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend` and `frontend` directories and add your Firebase credentials.

### 4. Run locally
Start the frontend development server:
```bash
cd frontend
npm run dev
```

## 📂 Project Structure
- `frontend/`: React application with Vite, contains all UI components and game logic.
- `backend/`: Node.js services and Firebase configuration.
- `public/`: Static assets such as images and fonts.
- `docs/`: Project documentation and guides.

## 🤝 Contributing
Contributions are welcome! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
