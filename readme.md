# Apex Update Detector

A discord bot which checks for [Apex Legends](https://www.ea.com/games/apex-legends) updates on [Steam](https://steamcommunity.com/). The application uses [Discord.js](https://discord.js.org) for sending messages over discord, and [steam-user](https://github.com/DoctorMcKay/node-steam-user) for checking if there are updates.

## Setup guide
To get started, clone the repository using:

    git clone https://github.com/EastArctica/apex-update-detector.git

Next, run the following command to enter the directory, and install the required NPM packages:

    cd apex-update-detector
    npm i

Next, copy the example config file and fill it in with the required Discord token:

    cp config.example.json config.json

Finally, run the following to execute the program:

    node index.js

## License
Apex Update Detector is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).