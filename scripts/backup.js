const fs = require('fs');
const zip = require('bestzip');
const rmrf = require('rimraf');

async function backup(server, backupFolder) {
    let dateStr = (new Date()).toISOString().split('T')[0].replace(/([T:])/g, '-');

    // Ensure the backup folder exists
    if (!fs.existsSync(`${backupFolder}/`)) fs.mkdirSync(`${backupFolder}/`);

    // if that folder already exists delete it.
    if (fs.existsSync(`${backupFolder}/${dateStr}.zip`)) rmrf.sync(`${backupFolder}/${dateStr}.zip`);

    await zip({
        source: [
            `${server}/world/*`,
            `${server}/world_nether/*`,
            `${server}/world_the_end/*`,
            `${server}/server.properties`,
        ],
        destination: `${backupFolder}/${dateStr}.zip`,
    });
}

function deleteOld(backupFolder, numberToKeep) {
    return new Promise((resolve) => {
        // Get all of the files in the backup folder
        let fileNames = (fs.readdirSync(backupFolder)).sort();
        // If we have more than we're supposed to
        if (fileNames.length > numberToKeep) {
            let numberOfFilesToDelete = fileNames.length - numberToKeep;
            // Isolate the files to delete then delete them
            let fileNamesToDelete = fileNames.splice(0, numberOfFilesToDelete);
            fileNamesToDelete.forEach((fileName) => {
                rmrf.sync(`${backupFolder}/${fileName}`);
            });

            resolve();
        }
    });
}


module.exports = async function(serverFolder, backupFolder, numberToKeep) {
    await backup(serverFolder, backupFolder);
    await deleteOld(backupFolder, numberToKeep);
    console.log('just did backup.');
};

