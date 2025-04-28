# Water Intake Tracker

## About
Water Intake Tracker app is used to track the amount of water the user consumes. It has features like giving recommendations based on user's height, weight, age, and gender. Another feature of the app includes a search functionality in which users can search for a brand of a water bottle and it gives results based on what the user searches. This search functionality goes through the open food facts api and displays the results based on the searches. When users select the water bottle it gets added to the total intake. Users can favorite certain water bottles, so that they can use it for later or they can just delete it if they dont want to. 

## Why It Was Built
This application was built so that users can limit their screen time, and encouraging healthier habits like tracking their water intake throughout the day. By focusing on hydration, it indirectly reduces screen time and builds more health conciousness.

## React Libraries and Frameworks

The normal react library has hooks that can be used to do various tasks. Our project used useState, and useEffect. We also used react router dom library for navigation between pages. Flask is being used to create a backend server for our app. We used flask for our backend because it acts as a middle layer between the react frontend and the external APIs that we used for the project. 

## How to Use This Project

### Using a Virtual Environment (Python Backend)

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install required backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the backend server**:
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Open a new terminal and navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the frontend server**:
   ```bash
   npm start
   ```

### Setting Up the Environment Variables (Backend)

- Install `python-dotenv`:
  ```bash
  pip install python-dotenv
  ```

- Create a `.env` file in the backend root:
  ```bash
  touch .env
  ```

- Add your OpenAI API key to `.env`:
  ```env
  KEY=your_api_key_here
  ```



---

## Demo

**Landing Page**:  
Users are greeted with a landing page.
![Landing Page](demoassets/image.png)

**Get Recommendation**:  
Users input their body stats and get a recommended daily water intake goal. They can add water manually or search for products.
![Get Recommendation](demoassets/image-2.png)

**Favorites**:  
Users automatically recieve favorite water products for quick reuse, visible under the progress bar.
![Favorites](demoassets/image-3.png)


---

## Contributions
 **Jacob**:
 Role: Frontend Developer
 Contributions: I worked on the initial backend design for communication to the front end. I also built and  polished the UI and made it more user friendly. Additionally, I helped implement some additional functions on the backend.

 **Sai**:
 Role: Backend Developer
 Contributions: I worked on implementing one of the data structures for our project which is Tries. I used Tries for the search functionality of the project. I was also helping with the frontend to make the UI more clean and user friendly. 