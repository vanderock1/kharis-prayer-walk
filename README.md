<div align="center">
    <img src="https://github.com/alexdavidpratt/kharis-prayer-walk/blob/main/assets/favicon.png" alt="Logo" width="80" height="80">

<h3 align="center">Kharis Prayer Walk App</h3>

  <p align="center">
    A mobile application to track and record prayer walks for the Kharis Church community.
    <br />
     <a href="https://github.com/alexdavidpratt/kharis-prayer-walk">github.com/alexdavidpratt/kharis-prayer-walk</a>
  </p>
</div>



## Table of Contents

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#architecture">Architecture</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

The Kharis Prayer Walk App is a mobile application designed for the Kharis Church community to track and record their prayer walks. It allows users to start and stop tracking, record location data, calculate distance and time, and save their prayer walks for future reference. The app also includes admin features to view all prayer walks and user profiles.

### Key Features

- **Prayer Walk Tracking:** Start and stop tracking prayer walks, recording location data, distance, and time.
- **Map Integration:** Display prayer walk paths on a map using `react-native-maps`.
- **User Authentication:** Secure user login and signup using Supabase.
- **Data Storage:** Store prayer walk data in a Supabase database.
- **Admin Features:** Admin users can view all prayer walks and user statistics.
- **Location Consent:** Explicit consent required for location data collection during signup.
- **Platform Support:** Supports both native mobile platforms (iOS and Android) and web.

## Architecture

![Architecture Diagram](https://github.com/user-attachments/assets/721b7fb3-e480-4809-9023-fd48b82b1f8c)

The Kharis Prayer Walk App is built using the following technologies:

- **Frontend:**
    - React Native: A framework for building native mobile apps using JavaScript and React.
    - Expo: A platform for building, deploying, and quickly iterating on React Native apps.
    - React Native Maps: Used for displaying maps and prayer walk paths.
    - React Native Reanimated: Used for smooth animations.
    - React Navigation: Used for handling navigation between different screens.
- **Backend:**
    - Supabase: A backend-as-a-service (BaaS) platform used for user authentication and data storage.
- **Utilities:**
    - `@react-native-async-storage/async-storage`: Used for persistent storage of authentication tokens.
    - `expo-location`: Used for accessing device location.
    - `expo-linear-gradient`: Used for creating gradient effects.

## Getting Started

### Prerequisites

- Node.js (>=16)
- npm or Yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account and project

### Installation

Instructions for setting up the project:

1.  Clone the repository:

    ```sh
    git clone https://github.com/alexdavidpratt/kharis-prayer-walk.git
    cd kharis-prayer-walk
    ```

2.  Install the dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

3.  Configure the environment variables:

    - Create a `.env` file (if needed) and add your Supabase URL and Anon Key.  However, the current code has the keys hardcoded in `utils/supabase.ts`.  It is highly recommended to use environment variables instead.

4.  Run the application:

    ```sh
    npx expo start
    ```

    This will start the Expo development server, and you can then run the app on your iOS or Android device using the Expo Go app, or in a web browser.

## Acknowledgments

- Special thanks to the Supabase team for providing a great backend-as-a-service platform and A0.dev for speeding up teh development process. 
