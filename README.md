# Schmek
A multiplayer snake game, with a few upgradeable abilities

## Abilities
List of currently implemented abilities: 

- **Dig**
  - Activatable ability that allows you to dig under other snakes
  - Currently no upgrades
- **Scavenge**
  - Passive ability that allows you to eat the dead bodies of other snakes
  - Can be upgraded for better effeciency
- **Speed Boost**
  - Activatable ability that allows you to move faster
  - Can be upgraded to last longer, or go even faster
- **Reverse**
  - Activatable ability that allows you to reverse your snake, switching your head and tail
  - Can be upgraded to mose less of your snake upon use, or to have the lost snake become alive

## Setup
Guide to get the game up and running locally

### Prerequisites
- Docker Compose ([installation guide](https://docs.docker.com/compose/install/))

### Quick Start
- Single command that clones and launches game. Requires node and npm
  
  ```bash
  git clone https://github.com/EricL521/Schmek.git && cd Schmek && cp .env.example .env && docker compose up -d
  ```

### Installation & Usage
- Clone repository
  
  ```bash
  git clone https://github.com/EricL521/Schmek.git
  ```
- Enter newly created folder
  
  ```bash
  cd Schmek
  ```
- Copy [`.env.example`](/.env.example) and update to your values
  
  ```bash
  cp .env.example .env
  ```
- Start Docker container

  ```bash
  docker compose up -d
  ```
- To stop, run

  ```bash
  docker compose down
  ```
- To update, run

  ```bash
  docker compose build
  ```
### Testing
- For testing changes, instead of using docker and rebuilding every time, you can also run using npm
- Install npm packages
  
  ```bash
  npm install
  ```
- Run game
  
  ```bash
  npm run dev
  ```