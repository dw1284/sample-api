SampleApi
==========

Introduction
------------

This is a barebones API for node.js including the following features:

  - Users and authentication
  - Hashed/salted passwords
  - User roles
  - Routes for basic CRUD operations
  - Routes for search operations
  - Unit testing for individual functions
  - Integration testing for routes

**Note:** This is a personal project to help me learn my way around. It may contain inefficient code and/or be full of bad practices. I am just learning after-all.

Technologies Used
-----------------

##### Http Routing
  - node.js
  - express
##### Database
  - postgresql
  - sequelize
##### Authentication
  - jwt-simple (json-web-tokens)
##### Testing
  - mocha
  - chai
  - chai-http
  
Dependencies
------------
Required installs:
  - node.js
  - postgresql
  
Once you have installed postgresql, open the terminal and create the database and user:

1. You will need to create a database called **sample_api**:

```
createdb sample_api
```

2. Next, start up psql and connect to the **sample_api** database:

```
psql sample_api
```

3. Create a user and grant access to sample_api database:

```
CREATE USER svc_sampleapi_dev WITH PASSWORD 'P6zIAwuvuNWo';
GRANT ALL PRIVILEGES ON DATABASE "sample_api" to svc_sampleapi_dev;
```

You should now be able to run **npm install** and then **npm start**. Sequelize will produce all of your database tables on startup.

Running Tests
-------------

From the terminal:

1. Unit tests only

```
npm run unitTest
```

2. Integration tests only

```
npm run integrationTest
```