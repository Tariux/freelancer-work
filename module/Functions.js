var colors = require('@colors/colors');

class Functions {

    starterMessage() {
        console.log(`
FreeWorker Started!
Version: 2.1.6
- Please wait until the end of the receiving and sending process 
- Refer to the index.js folder to set the program`.bgGreen.white.bold);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };









}


module.exports = Functions;

