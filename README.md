# GitHub Repository Reporter

This application provides a comprehensive overview and rating of GitHub repositories within a specified organization. It rates repositories based on criteria such as the presence and quality of a README, existence of a description, number of stale branches, and the number of old pull requests.

## Features

*   **Repository Listing**: Fetches and displays all repositories for a given GitHub organization.
*   **Customizable Rating**: Rates repositories based on:
    *   **README File**: Good if it has more than 100 lines.
    *   **Description**: Presence of a repository description.
    *   **Stale Branches**: Number of merged branches still "hanging around" (not ahead of the default branch).
    *   **Old Pull Requests**: Number of open pull requests older than 3 weeks.
*   **Filterable List**: Allows filtering repositories by name on the frontend.
*   **User-friendly Interface**: Built with React and Material-UI.
*   **Secure Authentication**: Uses GitHub Personal Access Tokens (PAT) for API access.

## Architecture

The application is structured as a monorepo with two main parts:

*   **`server`**: A Node.js (Express.js) backend written in TypeScript. It handles all interactions with the GitHub API, processes repository data, and calculates ratings.
*   **`client`**: A React application written in TypeScript (created with Vite) that provides the user interface for inputting credentials, displaying the repository list, and filtering results.

## Setup and Installation

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd githubreporter
```

### 2. Backend Setup

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

### 3. Frontend Setup

Navigate to the `client` directory and install dependencies:

```bash
cd ../client
npm install
```

## Running the Application

### 1. Start the Backend Server

From the `server` directory, run:

```bash
npm start
```

The backend server will start on `http://localhost:3001`.

### 2. Start the Frontend Development Server

From the `client` directory, run:

```bash
npm run dev
```

The frontend application will typically open in your browser at `http://localhost:5173` (or another available port).

## Running with Docker

Alternatively, you can run the entire application using Docker.

### Prerequisites

*   Docker
*   Docker Compose

### Build and Run

From the root of the project, run:

```bash
docker-compose up --build
```

This command will build the Docker images for both the client and the server and start the containers.
The frontend will be accessible at `http://localhost:8080`.

## Usage

1.  **Obtain a GitHub Personal Access Token (PAT)**:
    *   Go to your GitHub settings.
    *   Navigate to "Developer settings" > "Personal access tokens" > "Tokens (classic)".
    *   Click "Generate new token (classic)".
    *   Give your token a descriptive name.
    *   Crucially, grant the token the `repo` scope to allow access to repository data.
    *   Generate the token and **copy it immediately** as you won't be able to see it again.

2.  **Enter Details in the Application**:
    *   In the running frontend application (usually `http://localhost:5173`), enter your GitHub Personal Access Token in the designated field.
    *   Enter the GitHub Organization Name you wish to analyze.

3.  **Get Repositories**:
    *   Click the "Get Repositories" button.
    *   The application will fetch the repositories, calculate their ratings, and display them in a table.

4.  **Filter Results**:
    *   Use the "Filter by Repository Name" input field to dynamically narrow down the list of displayed repositories.

## Rating Criteria Details

*   **Rating Scale**: 1-10.
*   **Good README**: A README file is considered "good" and contributes to a higher score if it has more than 100 lines of content.
*   **Repository Description**: Repositories with a description receive a positive contribution to their score.
*   **Stale Branches**: Branches are considered "stale" if they have been merged into the default branch but still exist. The rating penalizes repositories with more than 5 such stale branches.
*   **Old Pull Requests**: The rating penalizes repositories with more than 10 open pull requests that are older than 3 weeks.

---

Feel free to contribute or suggest improvements!
