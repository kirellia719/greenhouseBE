const mongoose = require('mongoose');
const url = 'mongodb+srv://greenhouse:daichiendoandanganh@cluster0.pvkar.mongodb.net/GreenHouse?retryWrites=true&w=majority'
async function connect() {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database Connected');
    } catch (error) {
        console.log("Can't connect to database: " + error.message);
    }
}

module.exports = { connect };
