const fs = require('fs');
const config = require('./config.json');

const Discord = require('discord.js');
const discordClient = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS]
});

function sendUpdateMsg(updates) {
    // Check if the client is ready, if it isn't wait for it to be ready
    if (!discordClient.isReady()) {
        setTimeout(() => {
            sendUpdateMsg(updates);
        }, 1000);
        return;
    }

    // Loop through all servers and channels and look for a channel named "apex-updates"
    discordClient.guilds.cache.forEach(guild => {
        guild.channels.cache.forEach(channel => {
            if (channel.name === 'apex-updates' && channel.type === 'GUILD_TEXT') {
                // Build the message with the updates
                let msg = {
                    embeds: [],
                    content: ''
                };
                for (let i = 0; i < updates.length; i++) {
                    const update = updates[i];
                    msg.embeds.push({
                        title: `${update.branch} has been updated!`,
                        description: `branch: ${update.branch}\n` +
                            `buildid: ${update.buildid}\n` +
                            `timeupdated: ${new Date(update.timeupdated * 1000).toISOString()}\n` +
                            `pwdrequired: ${update.pwdrequired == '1' ? 'Yes' : 'No'}\n` +
                            `${update.description ? `description: ${update.description}` : ''}`,
                        color: 0x58B9FF
                    });
                    
                    // Check if the server has roles related to the branch
                    if (guild.roles.cache.find(role => role.name === `apex-${update.branch}`)) {
                        // If it does, add the role to the message
                        msg.content += `<@&${guild.roles.cache.find(role => role.name === `apex-${update.branch}`).id}> `;
                    }
                }
                channel.send(msg);
            }
        });
    });
}

discordClient.once('ready', () => {
	console.log(`Discord bot logged in as ${discordClient.user.tag}!`);
});

discordClient.login(config.token);

// Initialize files if they don't exist
if (!fs.existsSync('./updateChecks.json')) {
    fs.writeFileSync('./updateChecks.json', '{}');
}

let interval;
let updateChecks = JSON.parse(fs.readFileSync('./updateChecks.json', 'utf8'));

const SteamUser = require('steam-user');
const steamClient = new SteamUser();

steamClient.on('loggedOn', async (details) => {
    console.log(`Steam client logged in as ${steamClient.steamID.steam3()}`);

    interval = setInterval(async () => {
        let result = await steamClient.getProductInfo([1172470], [], true);
        let updates = [];

        for (let branch in result.apps['1172470'].appinfo.depots.branches) {
            let branchInfo = result.apps['1172470'].appinfo.depots.branches[branch];
            if (branchInfo.timeupdated !== updateChecks[branch]) {
                console.log(`${branch} has been updated!`);
                updateChecks[branch] = branchInfo.timeupdated;
                fs.writeFileSync('./updateChecks.json', JSON.stringify(updateChecks));

                updates.push({
                    branch: branch,
                    buildid: branchInfo.buildid,
                    timeupdated: branchInfo.timeupdated,
                    pwdrequired: branchInfo.pwdrequired,
                    description: branchInfo.description
                });
            }
        }

        if (updates.length > 0) {
            sendUpdateMsg(updates)
        }
    }, 1000);
});

steamClient.on('disconnected', () => {
    if (interval)
        clearInterval(interval);

    // We don't want to be entirely abusive of steam, so we'll wait a bit before reconnecting
    setTimeout(steamClient.logOn, 10 * 1000);
});

steamClient.logOn();
