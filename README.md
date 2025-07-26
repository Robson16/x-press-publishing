# X-Press Publishing

## Project Overview

This capstone project implements all routing and database logic for an internal tool for the comic book publishing company, X-Press Publishing. This project is part of Codecademy's **"Create a Back-End App with JavaScript Skill Path."** 

The X-Press Publishing internal tool allows users to:
- Create, view, and update artists
- Create, view, update, and delete comic book series
- Create, view, update, and delete issues of a specific comic book series

All of this functionality can be seen in the video below:

<video width="100%" height="100%" controls>
  <source src="https://s3.amazonaws.com/codecademy-content/programs/build-apis/solution-videos/XPressPublishing480.mov" type="video/mp4">
 The markdown processor does not support the video tag.
</video>

## Project Setup

To get the X-Press Publishing up and running on your local machine, follow these steps:

1.  **Clone the Repository:**
    * Open your terminal.
    * Clone the project from GitHub: `git clone https://github.com/Robson16/x-press-publishing.git`
    * Navigate into the project directory: `cd x-press-publishing`

2.  **Install Dependencies:**
    * In the project's root directory, run `npm install` to install all necessary project dependencies (including testing libraries and front-end build tools).

3.  **Start the Server:**
    * After installation, you can start the server in two ways:
      * For development with hot-reloading, run `npm run dev`. This will automatically restart the server when you make changes to **server.js** or files in the **api/** folder.
      * For production or a standard start, run `npm run start`.
      * You'll see `Server listening on port 4000` in your terminal, indicating the server is active.
      * To stop the server, use `Ctrl + C`.

4.  **Access the Application:**
    * To view the front-end application (which consumes this API), simply open **index.html** in your preferred web browser. Google Chrome (v60+) or Firefox (v55+) are recommended.

## Implementation Details

The database tables and API routes were created according to the specifications below. The project uses `npm` to manage dependencies such as `express`. The testing suite and provided front-end were used to verify functionality. The **seed.js** file can be run to populate the database with sample data, and table creation logic was implemented in **migration.js**.

To ensure compatibility with the tests and front-end:
- The Express app is created and exported from a root-level file called **server.js**
- The server listens on a port specified by `process.env.PORT`, defaulting to `4000` if not set
- All Express route files use the database file specified by `process.env.TEST_DATABASE`, or default to the root-level **database.sqlite**
- The database is always loaded with `new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')`

### Database Table Properties

* **Artist**
  - id - Integer, primary key, required
  - name - Text, required
  - date_of_birth - Text, required
  - biography - Text, required
  - is_currently_employed - Integer, defaults to `1`

* **Series**
  - id - Integer, primary key, required
  - name - Text, required
  - description - Text, required

* **Issue**
  - id - Integer, primary key, required
  - name - Text, required
  - issue_number - Text, required
  - publication_date - Text, required
  - artist_id - Integer, foreign key, required
  - series_id - Integer, foreign key, required

### Route Paths and Functionality

**/api/artists**
- GET: Returns all currently-employed artists (`is_currently_employed` is `1`) on the `artists` property of the response body (200)
- POST: Creates a new artist from the `artist` property of the request body and returns it on the `artist` property of the response body (201). Returns 400 if required fields are missing.

**/api/artists/:artistId**
- GET: Returns the artist with the supplied artist ID on the `artist` property of the response body (200). Returns 404 if not found.
- PUT: Updates the artist with the specified ID using the `artist` property of the request body and returns the updated artist (200). Returns 400 if required fields are missing, 404 if not found.
- DELETE: Updates the artist to be unemployed (`is_currently_employed` set to `0`) and returns 200. Returns 404 if not found.

**/api/series**
- GET: Returns all series on the `series` property of the response body (200)
- POST: Creates a new series from the `series` property of the request body and returns it (201). Returns 400 if required fields are missing.

**/api/series/:seriesId**
- GET: Returns the series with the supplied ID on the `series` property of the response body (200). Returns 404 if not found.
- PUT: Updates the series with the specified ID using the `series` property of the request body and returns the updated series (200). Returns 400 if required fields are missing, 404 if not found.
- DELETE: Deletes the series if it has no related issues (204). Returns 400 if related issues exist, 404 if not found.

**/api/series/:seriesId/issues**
- GET: Returns all issues related to the series with the supplied ID on the `issues` property of the response body (200). Returns 404 if the series does not exist.
- POST: Creates a new issue related to the series with the supplied ID using the `issue` property of the request body and returns it (201). Returns 400 if required fields are missing or the artist does not exist, 404 if the series does not exist.

**/api/series/:seriesId/issues/:issueId**
- PUT: Updates the issue with the specified ID using the `issue` property of the request body and returns the updated issue (200). Returns 400 if required fields are missing, 404 if the series or issue does not exist.
- DELETE: Deletes the issue with the supplied ID (204). Returns 404 if the series or issue does not exist.

## Testing

A comprehensive testing suite was used to verify all essential functionality and edge cases.

To run the tests, `npm install` was used to install dependencies, followed by `npm test` to execute the tests. The output provided information about passing and failing tests, helping to ensure correct implementation and to identify edge cases.

---

## License

This project is licensed under the MIT License.
Developed by Robson16.