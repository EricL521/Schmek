# Schmek
A multiplayer snake game, with a few upgradeable abilities

## Abilities
List of currently implemented abilities: 

- **Dig**
  - Activateable ability that allows you to dig under other snakes
  - Currently no upgrades
- **Scavenge**
  - Passive ability that allows you to eat the dead bodies of other snakes
  - Can be upgraded for better effeciency
- **Speed Boost**
  - Activateable ability that allows you to move faster
  - Can be upgraded to last longer, or go even faster
- **Reverse**
  - Activateable ability that allows you to reverse your snake, switching your head and tail
  - Can be upgraded to mose less of your snake upon use, or to have the lost snake become alive

## Setup
Guide to get the game up and running locally

**Prerequisites**
- Node.js and npm ([installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))

**Installation & Usage**
- Clone repository
  ```bash
  git clone https://github.com/EricL521/Schmek.git
  ```
- Enter new folder
  ```bash
  cd Schmek
  ```
- Install Node.js packages
  ```bash
  npm install
  ```
- Build server
  ```bash
  npm run build
  ```
- Start server
  ```bash
  npm run start
  ```

**Quick Start**
- Single command that clones and launches game. Requires node and npm
```bash
git clone https://github.com/EricL521/Schmek.git && cd Schmek && npm i && npm run build && npm run start
```
