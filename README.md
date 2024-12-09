# MeetFlow Backend

This is an Express.js project that uses a MySQL database.

## Prerequisites

- Node.js
- MySQL
- npm, pnpm, or yarn

## Setup Instructions

1. **Create MySQL Database**

   First, sign in to MySQL from the command line and create a database named `scheduler`:

   ```sql
   CREATE DATABASE scheduler;
   ```

## Create .env File

Copy the env.example file in the root directory to create a .env file:

```shell
cp env.example .env
```
Update the .env file with your database credentials and other environment variables.

## Install Packages

Install the required packages using npm, pnpm, or yarn:

```shell
# Using npm
npm install

# Using pnpm
pnpm install

# Using yarn
yarn install
```
The server will be running on http://localhost:3300

## License
This project is licensed under the ISC License.


