# PERSONAL ACCOUNTING BACKEND

## USER INTERACTIONS
- Sign up
- Sign in
- Sign out
- Show (search) users in system
- Show user details
- Add credit / debit card
- List all owned cards
- Remove (deactivate) card
- Deposit funds to account from card
- Withdraw funds from account and order it to card
- Transfer funds to other user in system
- Show transactions and balance from chosen period

## FLOW LOGICS
#### MAIN FLOW
![main flow](./docs/mainFlow.svg)

#### OPERATION FLOW
![main flow](./docs/operationFlow.svg)

## TECHNOLOGIES
- Node.js
- Express
- JSON Web Token (JWT)
- Mongodb

## ENVIRONMENT VARIABLES
Variable          | Value       | Description
------------------|-------------|--------------
PORT              | 5000        | Server port
JWT_KEY           | ?           | JWT Secret Key
NODE_ENV          | development | Server configurations (in this case only database)
CRYPT_KEY         | ?           | Key for encryption data stored in database
DEV_DB            | ?           | Database URI for development configuration
TOO_LONG_REQUEST  | 20          | Normal time for response in seconds.

## SCRIPTS
- __start__ - runs the current state of the code. Real-time changes do not reflect automatically.
- __dev-__ - runs the current state of the code. Takes care of all real-time changes and visualizes them.
- __test__ - runs tests with Jest

## AUTHENTICATION METHOD
__Bearer token__
The client must send this token in the __Authorization__ header when making requests to protected resources:<br>__Bearer \<JWT\>__<br>_Example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJkNTQyMTY..._

## ENDPOINTS
* [User](#user-endpoints)
* [Card](#card-endpoints)
* [Operation](#operation-endpoints)
* [Reports](#reports-endpoints)

### USER ENDPOINTS

Address                     | Description                                     | Method  | Auth
----------------------------|-------------------------------------------------|---------|--------
/user/register              | Register new user                               | POST    | NO
/user/check                 | Check email exists in system                    | POST    | NO
/user/login                 | Login in system                                 | POST    | NO
/user/list                  | Get users list                                  | POST    | YES
/user/:_id                  | Get single user                                 | GET     | YES
/user/logout                | Logout from system                              | PUT     | YES

#### /user/register
- Register new user
- Method: POST
- Authentication: NO
```JSON5
// Example body
{
    "email": "pop@armenia.com",   // Required. Must be valid email address
    "password": "123456",         // Required. Must be string with min. 6 characters
    "firstName": "Златна",        // Required
    "lastName": "Пампорова"       // Required
}

// Success result
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDA0YzFjOTE5MDI3M2QyZmRiODBmYWEiLCJ0b2tlbkRhdGUiOiIyMDIzLTAzLTA1VDE2OjIxOjU3Ljc5MVoiLCJpYXQiOjE2NzgwMzMzNTN9.35MgLbqqR_AYpJ8kc9osihPZb1rw8rWgQwYo6-41ZZA",
    "user": {
        "email": "pop@armenia.com",
        "firstName": "Златна",
        "lastName": "Пампорова",
        "balance": 0,
        "tokenDate": "2023-03-05T16:21:57.791Z",
        "_id": "6404c1c9190273d2fdb80faa",
        "createdAt": "2023-03-05T16:22:33.620Z",
        "updatedAt": "2023-03-05T16:22:33.620Z",
        "id": "6404c1c9190273d2fdb80faa"
    }
}
```

#### /user/check
- Checking if in system already exists registered user with the searched email
- Method: POST
- Authentication: NO
```JSON5
// Example body
{
    "email": "pop@armenia.com"  // Required. Must be valid email address
}

// Result
{
    "success": true,
    "payload": {
        "emailExists": true // or false if user with this email don't exists
    }
}
```

#### /user/login
- Login in system
- Method: POST
- Authentication: NO
```JSON5
// Example body
{
    "email": "pop@armenia.com",     // Required. Must be valid email address
    "password": "123456"            // Required
}

// Success result
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NDA0NzE2MTljN2ZlNzRiMmNkNTQyMTYiLCJ0b2tlbkRhdGUiOiIyMDIzLTAzLTA1VDIwOjEyOjA2Ljg2NVoiLCJpYXQiOjE2NzgwNDcxMjZ9.wMIxAlvA0jx6Y8CUrNHGZb_l2pzsna_W8Q6V_LMc1PI",
    "user": {
        "_id": "640471619c7fe74b2cd54216",
        "email": "pop@armenia.com",
        "firstName": "Златна",
        "lastName": "Пампорова",
        "balance": 80,
        "tokenDate": "2023-03-05T20:12:06.865Z",
        "createdAt": "2023-03-05T10:39:29.893Z",
        "updatedAt": "2023-03-05T20:12:06.865Z",
        "id": "640471619c7fe74b2cd54216"
    }
}
```

#### /user/login
- Get paginated users list in system except user who invoke endpoint
- Method: POST
- Authentication: YES
```JSON5
// Example body
// Fields 'page' and 'limit' don't have effect if field 'paginate' is false
// Object sort can contain one or few fields by wanted priority sort and values 1 or 'asc' for ascending and -1 or 'desc' for descending
{
    "page": 1,                          // Not required. Page number from paginated list. Default is 1
    "limit": 10,                        // Not required. Number of users per page. Default is 10
    "pagination": true,                 // Not required. Use pagination. Default is true
    "sort": { "lastName": "desc" },     // Not required. Sort order. Must be object with fields for sort and values. Default is { "firstName": -1 }

    "email": "",                        // Not required. Search in field 'email'
    "name": ""                          // Not required. Search in field 'lastName'
}

// Example result
{
    "success": true,
    "payload": {
        "docs": [
            {
                "_id": "64047d97b64f8480832ab42e",
                "email": "elka@armenia.com",
                "firstName": "Елисавета",
                "lastName": "Петрова",
                "fullName": "Елисавета Петрова"
            },
            {
                "_id": "6404b880c98aca97feef1a12",
                "email": "test@yahoo.com",
                "firstName": "Петър",
                "lastName": "Андонов",
                "fullName": "Петър Андонов"
            }
        ],
        "totalDocs": 2,
        "limit": 10,
        "page": 1,
        "totalPages": 1,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null
    }
}
```

#### /user/:_id
- Get single user details by id
- Method: GET
- Authentication: YES
```JSON5
// Param :_id is user _id. Must be valid mongodb ID
// Example /user/640471619c7fe74b2cd54216

// Example result
{
    "success": true,
    "payload": {
        "_id": "640471619c7fe74b2cd54216",
        "email": "pop@armenia.com",
        "firstName": "Златна",
        "lastName": "Пампорова",
        "balance": 80                       // this field return only if user invoke him own profile
    }
}
```

#### /user/logout                
- Logout from system and make current user token expired
- Method: PUT
- Authentication: YES
```JSON5
// Endpoint don't have body or params

// Success result
{
    "success": true,
    "payload": {
        "message": "You have been logged out!"
    }
}
```

### CARD ENDPOINTS

Address                     | Description                                     | Method  | Auth
----------------------------|-------------------------------------------------|---------|--------
/card/add                   | Add new card to user                            | POST    | YES
/card/list                  | Get user all cards                              | POST    | YES
/card/:cardId               | Remove card                                     | DELETE  | YES

#### /card/add                
- Add new card to user
- Method: POST
- Authentication: YES
```JSON5
// Example body
{
    "number": "4444 3333 2222 9871",    // Required. Card number. Must be valid credit/debit card number
    "name": " Zlatna Pamporova",        // Required. Cardholder name. Must be string with two words
    "expMonth": 3,                      // Required. Card expire month. Must be string between 1 and 12
    "expYear": 2023,                    // Required. Card expire year. Must be valid year, min current
    "cvv": 111,                         // Required. Card security code. Number of digits depending from card brand
    "metadata": {}                      // Not required. Object for storing random metadata for user needs
}

// Success result
{
    "success": true,
    "payload": {
        "user": "640471619c7fe74b2cd54216",
        "name": "Zlatna Pamporova",
        "expMonth": 3,
        "expYear": 2023,
        "brand": "Visa",
        "last4": "8874",
        "_id": "6404fd66d65d4271e2cddd14",
        "createdAt": "2023-03-05T20:36:54.514Z",
        "id": "6404fd66d65d4271e2cddd14"
    }
}
```

#### /card/list                
- Get user all cards, only for user who invoke endpoint. Return only active cards
- Method: POST
- Authentication: YES
```JSON5
// Example body
// Fields 'page' and 'limit' don't have effect if field 'paginate' is false
{
    "page": 1,                          // Not required. Page number from paginated list. Default is 1
    "limit": 10,                        // Not required. Number of cards per page. Default is 10
    "pagination": true                  // Not required. Use pagination. Default is true
}

// Example result
{
    "success": true,
    "payload": {
        "docs": [
            {
                "_id": "6404fd66d65d4271e2cddd14",
                "user": "640471619c7fe74b2cd54216",
                "name": "Zlatna Pamporova",
                "expMonth": 3,
                "expYear": 2023,
                "brand": "Visa",
                "last4": "8874",
                "createdAt": "2023-03-05T20:36:54.514Z"
            },
            {
                "_id": "640471729c7fe74b2cd54219",
                "user": "640471619c7fe74b2cd54216",
                "name": "Zlatna Pamporova",
                "expMonth": 3,
                "expYear": 2023,
                "brand": "Visa",
                "last4": "9871",
                "createdAt": "2023-03-05T10:39:46.440Z"
            }
        ],
        "totalDocs": 2,
        "limit": 10,
        "page": 1,
        "totalPages": 1,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null
    }
}
```

#### /card/:cardId
- Remove card (make it inactive)
- Method: DELETE
- Authentication: YES
```JSON5
// Param :cardId is card _id. Must be valid mongodb ID
// Example /user/6404fc99d65d4271e2cddd10

// Success result
{
    "success": true,
    "payload": {
        "_id": "6404fc99d65d4271e2cddd10",
        "last4": "9871",
        "deletedAt": "2023-03-05T20:39:50.581Z"
    }
}
```

### OPERATION ENDPOINTS

Address                     | Description                                     | Method  | Auth
----------------------------|-------------------------------------------------|---------|--------
/operation/deposit          | Add funds to user account                       | POST    | YES
/operation/withdraw         | Withdraw funds from user account                | POST    | YES
/operation/transfer         | Transfer funds to other user account            | POST    | YES

#### /operation/deposit
- Add funds to user account from user card
- Method: POST
- Authentication: YES
```JSON5
// Example body
{    
    "card": "640471729c7fe74b2cd54219",     // Required. User card id
    "amount": 100,                          // Required. Deposit amount. Must be number bigger from zero
    "description": "none"                   // Required. Description about deposit
}

// Success result
{
    "success": true,
    "payload": {
        "type": "deposit",
        "user": {
            "_id": "640471619c7fe74b2cd54216",
            "firstName": "Златна",
            "lastName": "Пампорова",
            "id": "640471619c7fe74b2cd54216"
        },
        "card": {
            "_id": "640471729c7fe74b2cd54219",
            "expMonth": 3,
            "expYear": 2023,
            "brand": "Visa",
            "last4": "9871",
            "id": "640471729c7fe74b2cd54219"
        },
        "amount": 100,
        "description": "none",
        "recipient": null,
        "_id": "6404ff8dd65d4271e2cddd1c",
        "createdAt": "2023-03-05T20:46:05.525Z",
        "updatedAt": "2023-03-05T20:46:05.525Z",
        "__v": 0,
        "id": "6404ff8dd65d4271e2cddd1c",
        "updateBalance": 180                    // Current user balance after deposit
    }
}
```

#### /operation/withdraw
- Withdraw funds from user account to user card
- Method: POST
- Authentication: YES
```JSON5
{    
    "card": "640471729c7fe74b2cd54219",     // Required. User card id
    "amount": 100,                          // Required. Withdraw amount. Must be number bigger from zero
    "description": "none"                   // Required. Description about withdraw
}

// Success result
{
    "success": true,
    "payload": {
        "type": "withdraw",
        "user": {
            "_id": "640471619c7fe74b2cd54216",
            "firstName": "Златна",
            "lastName": "Пампорова",
            "id": "640471619c7fe74b2cd54216"
        },
        "card": {
            "_id": "640471729c7fe74b2cd54219",
            "expMonth": 3,
            "expYear": 2023,
            "brand": "Visa",
            "last4": "9871",
            "id": "640471729c7fe74b2cd54219"
        },
        "amount": 10,
        "description": "none",
        "recipient": null,
        "_id": "64050027d65d4271e2cddd24",
        "createdAt": "2023-03-05T20:48:39.345Z",
        "updatedAt": "2023-03-05T20:48:39.345Z",
        "__v": 0,
        "id": "64050027d65d4271e2cddd24",
        "updateBalance": 170                        // Current user balance after withdraw
    }
}
```

#### /operation/transfer
- Transfer funds to other user account in system
- Method: POST
- Authentication: YES
```JSON5
// Example body
{
    "recipient": "64047d97b64f8480832ab42e",    // Required. User who will receive transfer id
    "amount": 10,                               // Required. Transfer amount. Must be number bigger from zero
    "description": "none"                       // Required. Description about transfer
}

// Success result
{
    "success": true,
    "payload": {
        "type": "transfer",
        "user": {
            "_id": "640471619c7fe74b2cd54216",
            "firstName": "Златна",
            "lastName": "Пампорова",
            "id": "640471619c7fe74b2cd54216"
        },
        "card": null,
        "amount": 10,
        "description": "none",
        "recipient": {
            "_id": "64047d97b64f8480832ab42e",
            "firstName": "Елисавета",
            "lastName": "Петрова",
            "id": "64047d97b64f8480832ab42e"
        },
        "_id": "640500c5d65d4271e2cddd2c",
        "createdAt": "2023-03-05T20:51:17.962Z",
        "updatedAt": "2023-03-05T20:51:17.962Z",
        "__v": 0,
        "id": "640500c5d65d4271e2cddd2c",
        "updateBalance": 160                        // Current user balance after transfer
    }
}
```

### REPORTS ENDPOINTS

Address                     | Description                                     | Method  | Auth
----------------------------|-------------------------------------------------|---------|--------
/report/transactions        | Get user transactions for chosen period         | POST    | YES
/report/balance             | Get user balance for chosen period              | POST    | YES

#### /report/transactions
- Get user transactions for chosen period
- Method: POST
- Authentication: YES
```JSON5
// Example body
// All fields is optional
// Fields 'page' and 'limit' don't have effect if field 'paginate' is false
// Object sort can contain one or few fields by wanted priority sort and values 1 or 'asc' for ascending and -1 or 'desc' for descending
{
    "page": 1,                          // Page number from paginated list. Default is 1
    "limit": 10,                        // Number of transactions per page. Default is 10
    "pagination": false,                // Use pagination. Default is true
    "sort": { "amount": "desc" },       // Sort order. Must be object with fields for sort and values. Default is { "createdAt": -1 }

    "startDate": "2022-01-01",          // Period start date. Default is '1970-01-01'
    "endDate": "2024-01-01",            // Period end date. Default is current date

    "type": [],                         // Filter by one or many transaction type. Enum is ['deposit', 'withdraw', 'transfer']. Empty array is equal to missing filter
    "recipient": [],                    // Filter by one or many recipients. Array must include users ids. Empty array is equal to missing filter
    "card": [],                         // Filter by one or many cards used in transaction. Array must include cards ids. Empty array is equal to missing filter
    "description": "no",                // Search in field 'description'
    "amountMin": 0,                     // Filter by min transaction amount
    "amountMax": 0,                     // Filter by max transaction amount
    "direction": []                     // Filter by or many transactions direction. Enum is ['income', 'outcome']. Empty array is equal to missing filter
}

// Example result
{
    "success": true,
    "payload": {
        "docs": [
            {
                "_id": "6404ff8dd65d4271e2cddd1c",
                "type": "deposit",
                "user": {
                    "_id": "640471619c7fe74b2cd54216",
                    "firstName": "Златна",
                    "lastName": "Пампорова"
                },
                "amount": 100,
                "description": "none",
                "createdAt": "2023-03-05T20:46:05.525Z",
                "direction": "income",
                "card": {
                    "_id": "640471729c7fe74b2cd54219",
                    "name": "Zlatna Pamporova",
                    "expMonth": 3,
                    "expYear": 2023,
                    "brand": "Visa",
                    "last4": "9871",
                    "deletedAt": null
                },
                "recipient": null
            }
            {
                "_id": "6404ab264740381521046263",
                "type": "transfer",
                "user": {
                    "_id": "640471619c7fe74b2cd54216",
                    "firstName": "Златна",
                    "lastName": "Пампорова"
                },
                "amount": 10,
                "description": "none",
                "createdAt": "2023-03-05T14:45:58.207Z",
                "direction": "outcome",
                "card": null,
                "recipient": {
                    "_id": "64047d97b64f8480832ab42e",
                    "firstName": "Елисавета",
                    "lastName": "Петрова"
                }
            },
            {
                "_id": "6404ab32474038152104626f",
                "type": "transfer",
                "user": {
                    "_id": "64047d97b64f8480832ab42e",
                    "firstName": "Елисавета",
                    "lastName": "Петрова"
                },
                "amount": 10,
                "description": "none",
                "createdAt": "2023-03-05T14:46:10.220Z",
                "direction": "outcome",
                "card": null,
                "recipient": {
                    "_id": "640471619c7fe74b2cd54216",
                    "firstName": "Златна",
                    "lastName": "Пампорова"
                }
            },
            {
                "_id": "64050027d65d4271e2cddd24",
                "type": "withdraw",
                "user": {
                    "_id": "640471619c7fe74b2cd54216",
                    "firstName": "Златна",
                    "lastName": "Пампорова"
                },
                "amount": 10,
                "description": "none",
                "createdAt": "2023-03-05T20:48:39.345Z",
                "direction": "outcome",
                "card": {
                    "_id": "640471729c7fe74b2cd54219",
                    "name": "Zlatna Pamporova",
                    "expMonth": 3,
                    "expYear": 2023,
                    "brand": "Visa",
                    "last4": "9871",
                    "deletedAt": null
                },
                "recipient": null
            }
            
        ],
        "totalDocs": 4,
        "limit": 10,
        "page": 1,
        "totalPages": 1,
        "pagingCounter": 1,
        "hasPrevPage": false,
        "hasNextPage": false,
        "prevPage": null,
        "nextPage": null
    }
}
```

#### /report/balance
- Get user balance for chosen period
- Method: POST
- Authentication: YES
```JSON5
// Example body
{
    "startDate": "2023-03-01",      // Optional. Period start date. Default is '1970-01-01'
    "endDate": "2023-05-01"         // Optional. Period end date. Default is current date
}

// Example result
{
    "success": true,
    "payload": {
        "startBalance": 100,
        "endBalance": 160
    }
}
```