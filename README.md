# paul-leonard-video-platform
A bespoke video hosting platform for Paul Leonard
## Features
- User Signup
- User Login
- Video Navigation (Next/Previous)
- Admin Video Upload
- Password Reset

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/paul-leonard-video-platform.git
   cd paul-leonard-video-platform

2.  Install Dependancies
     npm install

To create a GitHub repository and follow Git flow practices, follow these steps:

### Step 1: Create a GitHub Account
1. Go to [GitHub](https://github.com/) and sign up for an account if you don’t already have one.

### Step 2: Create a New Repository
1. Log in to GitHub.
2. Click on the "+" icon at the top right corner and select "New repository".
3. Fill in the repository details:
   - **Repository name**: e.g., `paul-leonard-video-platform`
   - **Description**: e.g., `A bespoke video hosting platform for Paul Leonard`
   - **Public/Private**: Choose whether the repository should be public or private.
   - **Initialize this repository with a README**: Check this box.
4. Click the "Create repository" button.

### Step 3: Clone the Repository to Your Local Machine
1. Copy the repository URL (e.g., `https://github.com/your-username/paul-leonard-video-platform.git`).
2. Open your terminal and navigate to the directory where you want to clone the repository.
3. Run the following command to clone the repository:
   ```bash
   git clone https://github.com/your-username/paul-leonard-video-platform.git
   ```
4. Navigate into the repository:
   ```bash
   cd paul-leonard-video-platform
   ```

### Step 4: Initialize Your Project
1. Initialize your Node.js project:
   ```bash
   npm init -y
   ```
2. Install necessary dependencies:
   ```bash
   npm install express mongoose body-parser ejs express-session
   ```

### Step 5: Create Project Structure and Files
1. Create the necessary directories and files:
   ```bash
   mkdir views public public/css routes models controllers
   touch app.js views/index.ejs views/signup.ejs views/login.ejs views/video.ejs views/reset-password.ejs views/admin-upload.ejs public/css/style.css routes/index.js routes/users.js routes/videos.js models/User.js models/Video.js controllers/userController.js controllers/videoController.js
   ```
2. Copy the code snippets provided earlier into their respective files.

### Step 6: Commit and Push Your Code
1. Add all the files to the staging area:
   ```bash
   git add .
   ```
2. Commit your changes:
   ```bash
   git commit -m "Initial commit - setup project structure and basic functionality"
   ```
3. Push the changes to the GitHub repository:
   ```bash
   git push origin main
   ```

### Step 7: Implement Git Flow Practices
1. Create a new branch for each feature or fix:
   ```bash
   git checkout -b feature/add-user-authentication
   ```
2. Make your changes in the new branch.
3. Add, commit, and push your changes to the branch:
   ```bash
   git add .
   git commit -m "Add user authentication"
   git push origin feature/add-user-authentication
   ```
4. Create a pull request on GitHub from your branch to the `main` branch.
5. Once reviewed and approved, merge the pull request.

### Step 8: Update README.md
1. Open the `README.md` file and add detailed instructions on setting up the project, its purpose, and how to contribute. Here is an example template:

```markdown
# Paul Leonard's Video Platform

## Description
A bespoke video hosting platform for Paul Leonard. This platform allows users to sign up, log in, watch videos, and for the admin to upload videos with titles and descriptions.

## Features
- User Signup
- User Login
- Video Navigation (Next/Previous)
- Admin Video Upload
- Password Reset

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/paul-leonard-video-platform.git
   cd paul-leonard-video-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   node app.js
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

## License
[MIT](https://choosealicense.com/licenses/mit/)
```

### Step 9: Deploy the Application
1. Choose a hosting platform (e.g., Heroku, Vercel).
2. Follow the platform-specific instructions to deploy your application.
3. Update the `README.md` file with the deployed link.

### Example ER Diagram

Here is a simple representation of the ER diagram:

```
User
-----
- id (Primary Key)
- email
- password
- username

Video
-----
- id (Primary Key)
- title
- description
- url
```

You can create this ER diagram using [draw.io](https://draw.io) or any other diagram tool and include it in your repository.

Following these steps will help you create and manage a GitHub repository effectively for your project. If you need any further assistance, feel free to ask!
