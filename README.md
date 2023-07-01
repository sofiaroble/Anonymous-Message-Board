# Anonymous Message Board

This is the boilerplate for the Anonymous Message Board project. Instructions for completing your project can be found at https://www.freecodecamp.org/learn/information-security/information-security-projects/anonymous-message-board
Build a full stack JavaScript app that is functionally similar to this: https://anonymous-message-board.freecodecamp.rocks/.

Set NODE_ENV to test without quotes when ready to write tests and DB to your databases connection string (in .env)
Recommended to create controllers/handlers and handle routing in routes/api.js
You will add any security features to server.js
Write the following tests in tests/2_functional-tests.js:

Creating a new thread: POST request to /api/threads/{board}
Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}
Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password
Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password
Reporting a thread: PUT request to /api/threads/{board}
Creating a new reply: POST request to /api/replies/{board}
Viewing a single thread with all replies: GET request to /api/replies/{board}
Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password
Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password
Reporting a reply: PUT request to /api/replies/{board}