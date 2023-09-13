# Vert Finance Backend

## Welcome

Hi thanks for taking a look at the Vert Finance Backend. Vert Finance is a web-based decentralized application that lets you convert almost any cryptocurrency to fiat in your bank account. It's currently built to support only cryptocurrency to the Nigerian Naira conversions. Check out this piece to find out more about Vert Finance.

This is the Backend Repo. You can also have a look at the [frontend](https://github.com/nonseodion/vert-ui) and [smartcontract](https://github.com/nonseodion/vert-router) repos.

### [Frontend](https://github.com/nonseodion/vert-ui)

### [Smart Contract](https://github.com/nonseodion/vert-router)

## Architecture
![Frame 6](https://github.com/nonseodion/vert-backend/assets/38128301/446654f7-2651-4eec-91fc-8e1371a86e57)

From the architecture diagram above, the backend receives the transaction details from the frontend, verifies its authenticity and instructs an exchange to send money to the user's bank account if the transaction is valid. It records the transaction details in a database for historical purposes and future transaction verification.
Vert Finance already has fiat liquidity on the exchange to enable fiat transactions. This improves the user experience since the user does not have to wait for his crypto to be converted to fiat before he receives it.

## Structure

The backend is built using Expressjs, Typescript, and Viem. Its structure consists of services for interacting with external services, REST APIs for frontend to fetch data, Websockets to improve user experience by providing a bi-directional communciation channel between frontend and backend and models for interacting with databases.

### Services

There are two services found in the [/services](./src/services/) folder. Bank and blockchain services. 
The blockchain service provides methods for interacting with the blockchain for transaction verification and monitoring (watching transaction confirmations).
The bank service provides methods for getting account name, exchange balance, fiat to dollar exchange rate, sending naira to the user through the exchange and exchange transaction status.

### REST API

The REST API is done using Expressjs. It is in the [routes folder](./src/routes)

| Endpoint         | Parameters                | Description                                                                                                                   |
|------------------|---------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| GET /list        |             -             | Returns details of all supported banks.                                                                                       |
| GET /accountname | account_number, bank_code | Returns bank account name. It uses Paystack to resolve the account name.                                                      |
| GET /liquidity   |             -             | Returns the amount of money available as liquidity on the exchange. The liquidity is VertFinance deposit held on the exchange. |

### Websocket API
This API was created with socket.io . It is in the [sockets folder](./src/sockets)

| Endpoint      | Events                                                                                 | Description                                                              |
|---------------|----------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| /rates        |                                          rates                                         | Emits a signed USD/NGN exchange rate at 2-minute intervals.                                           |
| /transactions | argValidity, swapValidity, txConfirmations, txConfirmtionsStatus, exchangeStatus, swap | Used to initiate a transaction to send NGN to the user's bank account after the swap transaction is done on the blockchain. It emits events to the frontend to monitor the progress of transactions on the backend. |

### Models
The models can be found in the [models](./src//model/) folder. There are two models:

#### Bank Model

Used to interact with a JSON file that stores details about supported banks. It provides methods to get all banks and their shortcodes.

#### Transaction Model

Used to interact with a MongoDb database that stores details about transactions completed on the backend. The transactions 

## Transaction Flow

1. The swap event on the transactions endpoint of the WebSocket is used to send the blockchain transaction hash, signed rate and bank details to the backend. This initiates the transaction on the backend.

2. The transaction is verified by checking if the blockchain transaction is valid, has already been processed, and if the rate received is valid and within a time limit to prevent an attack that sends an old but valid exchange rate.

3. If the transaction is valid, it is monitored until it gets the required block confirmations. It tries to handle reeorgs (not tested well).

4. After it gets the required block confirmations, the exchange is prompted to send the Naira amount to the user's account.

5. When the transaction completes, it is recorded in the database. 

At each stage of processing the transaction, the transaction Websocket connection informs the frontend. This enables the frontend to deliver a good user experience.


## How to Setup Locally

1. Clone this github repository with `git clone https://github.com/nonseodion/vert-backend.git`.
2. Change the current directory of the terminal to vert-backend directory with `cd vert-backend`.
3. Make sure you have yarn installed and then install all the dependencies with `npm install`.
4. Create a `.env` file and use the `.env.example` file in this repository to fill the .env file with the environment variables. The `.env.example` has comments to explain each environment variable.
5. Startup the server with `npm run start`.
