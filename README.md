
# Project Setup Guide

This README provides a step-by-step guide for setting up and running the project.

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js** (latest version)
- **Python** (3.x version)
- **pip** (Python package installer)

## Setup Instructions

### 1. Install Dependencies

#### Frontend
1. Navigate to the `frontend` folder.
2. Run the following command to install the necessary modules:
   ```bash
   npm install
   ```

#### Backend
1. Navigate to the `backend` folder.
2. Run the following command to install the necessary modules:
   ```bash
   npm install
   ```

#### Python Requirements
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

### 2. Running the Application

#### Start the Backend
1. Open a terminal and navigate to the `backend` folder.
2. Start the backend server:
   ```bash
   npm start
   ```

#### Start the Frontend
1. Open another terminal and navigate to the `frontend` folder.
2. Start the frontend application:
   ```bash
   npm start
   ```

### 3. Access the Application

Once both the backend and frontend are running, open your browser and navigate to the application. You should see the login page.

## Additional Notes

- Ensure that the backend and frontend are running simultaneously for the application to function correctly.
- For any issues, check the logs in the terminal for potential error messages.

Enjoy using the application!
