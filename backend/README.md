# Professional Inventory Management Backend API

This is a modern, professional RESTful API for an Inventory Management System built using Node.js, Express, and MongoDB.

## Features
- **Authentication**: JWT-based secure authentication. Role-based access control (Admin, Manager).
- **Security**: Hardened and configured with Helmet and CORS, password hashing via Bcrypt.
- **Error Handling**: Custom robust global exception handling.
- **Database**: MongoDB integrated with Mongoose.
- **Performance**: Asynchronous error handling wrapping routes.

## Prerequisites
- Node.js installed (v16+)
- MongoDB daemon running locally or a MongoDB Atlas URI string

## Getting Started

1. Set up your environment variables. 
   There is a `.env` file at the root. Be sure it has:
   ```
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/inventory_management
   JWT_SECRET=supersecretjwtkey_for_inventory_management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   # Development mode (uses nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## Postman / Request Testing

**Headers needed for Private routes:**
```
Authorization: Bearer <Your_JWT_Token>
```

---

## API Endpoint Guide & Examples

Below is a detailed guide of available endpoints, access levels, and JSON body examples for testing.

### 1. Users API

#### Register a New User
- **URL**: `POST /api/users`
- **Access**: Public
- **Example Payload**:
  ```json
  {
    "username": "johndoe",
    "password": "secretpassword",
    "role": "manager",
    "department": "IT"
  }
  ```
  *(Note: `department` is strictly required if the role is "manager")*

#### Login an Existing User
- **URL**: `POST /api/users/login`
- **Access**: Public
- **Example Payload**:
  ```json
  {
    "username": "johndoe",
    "password": "secretpassword"
  }
  ```
  *(Response returns your JWT Token for accessing protected routes)*

#### Get Your Own Profile
- **URL**: `GET /api/users/profile`
- **Access**: Private (Requires Token)

#### Get All Users List
- **URL**: `GET /api/users`
- **Access**: Private **(Admin Only)**

#### Update a Manager's Profile
- **URL**: `PUT /api/users/:id` *(Replace `:id` with User ID)*
- **Access**: Private **(Admin Only)**
- **Description**: Allows an admin to alter a manager's role, change their assigned department, or temporarily block them.
- **Example Payload**:
  ```json
  {
    "isActive": false,
    "role": "manager",
    "department": "Logistics"
  }
  ```

---

### 2. Equipment API

#### Create Equipment
- **URL**: `POST /api/equipment`
- **Access**: Private (Manager or Admin)
- **Example Payload**:
  ```json
  {
    "name": "Dell XPS 15",
    "category": "Laptops",
    "quantity": 10,
    "department": "IT"
  }
  ```
  *(Note: If a Manager makes this request, the equipment is forcefully attached to the Manager's own department)*

#### Get All Equipment
- **URL**: `GET /api/equipment`
- **Access**: Private (Manager or Admin)
- *(Note: Returns ALL equipment for Admins, butONLY department-specific equipment for Managers)*

#### Get a Specific Equipment
- **URL**: `GET /api/equipment/:id`
- **Access**: Private (Manager or Admin)

#### Update Equipment
- **URL**: `PUT /api/equipment/:id`
- **Access**: Private (Manager or Admin)
- **Example Payload**:
  ```json
  {
    "name": "Dell XPS 17",
    "quantity": 25
  }
  ```
  *(Note: Managers can only update equipment currently in their department)*

#### Delete Equipment
- **URL**: `DELETE /api/equipment/:id`
- **Access**: Private (Manager or Admin)
