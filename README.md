# SDE-dockerlab1

## Project Overview

**SDE-dockerlab1** is a Docker-based application designed to facilitate the deployment and management of a MongoDB database and a Node.js application. This project utilizes Docker Compose to orchestrate multi-container applications, ensuring a seamless setup and execution process.

## Author

- **Author**: Jacopo Bennati and project group members: [Leonardo Luongo​], [Leonardo Collizzoli], [Lydia Bekele​], [Derin Gurman​]

## Prerequisites

Before running the project, ensure you have the following installed on your machine:

- **Docker**: [Get Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

If you are running the project on the downloaded VirtualBox image you should be ready to go.
In this case remember to run the commands as **superuser** (`sudo <command>`)

## Usage

### Exercise 1

To run the containers defined in `docker-compose_1.yaml`, execute the following command:

```bash
docker-compose -f docker-compose_1.yaml up --build
```

If you prefer to run the containers in detached mode, add the **`-d`** flag:

```bash
docker-compose -f docker-compose_1.yaml up --build -d
```

To stop the services, use:

```bash
docker-compose -f docker-compose_1.yaml down
```

### Exercise 2

For the second exercise, run the containers in detached mode with:

```bash
docker-compose -f docker-compose_2.yaml up --build -d
```

To view the server logs for the `my-app` service, use:

```bash
docker-compose -f docker-compose_2.yaml logs -f my-app
```

To stop the services, run:

```bash
docker-compose -f docker-compose_2.yaml down
```

## Additional Information

- **MongoDB Configuration**: The project uses MongoDB as the database service. Make sure to initialize your database with the required data if necessary.
- **Node.js Application**: The `my-app` service is built using Node.js and is configured to connect to the MongoDB instance.
- **Persistent Data**: The MongoDB service is configured to store data persistently using Docker volumes, ensuring that your data remains intact even when containers are stopped or removed.
