// const express = require('express')
// const dotenv = require('dotenv')
// const cors = require('cors')
// const bodyParser = require('body-parser');
// const db = require('./src/db/db');
// const apis = require('./src/routes/routes');
// const socketio = require('socket.io');
// const http = require('http');

// const parking = require('./src/schema/parkingSchema');

// const ip = "192.168.64.12";

// const app = express()
// dotenv.config({ path: '.env' })
// const PORT = process.env.PORT || 3000;
// app.use(cors({origin: '*' }))
// app.use(bodyParser.json())
// app.use('/', apis);

// // app.listen(PORT, ip, ()=>{
// //     console.log("server started")
// // })


// const server = http.createServer(app);
// const io = socketio(server,{
//   cors: {
//     origin: '*',
//   }
// });


// io.on('connection', (socket) => {
//     console.log('A user connected');   
//     // Handle events from the client
//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//         // Broadcast the message to all connected clients
//         io.emit('chat message', msg);
//     });

//     // Handle disconnection
//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

// server.listen(PORT, ip, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// exports.updatepark = (data) => {io.emit('hello', data);}

/////////////////////////////////////////////////////
const express = require('express');
const expressWs = require('express-ws');
const dotenv = require('dotenv')
const cors = require('cors')
const bodyParser = require('body-parser');
const db = require('./src/db/db');
const apis = require('./src/routes/routes');
const parking = require('./src/schema/parkingSchema');

const app = express();
const appWs = expressWs(app);

dotenv.config({ path: '.env' })
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: '*' }))
app.use(bodyParser.json())
app.use('/', apis);


let wsConnections = []; // Array to store WebSocket connections

// WebSocket Endpoint Setup
app.ws('/echo', ws => {
    // Add new WebSocket connection to the array
    wsConnections.push(ws);

    ws.on('message', async (msg) => {

        console.log(msg, "tttttttttttt")

        const data = JSON.parse(msg);
        if (data.event == "sensor_update") {
            console.log('sensor_update event, updating data in database');
            const pData = await parking.findByIdAndUpdate({ "_id": "65d738cb6f3620f15d6ccdc6" }, data.data, { new: true })
            wsConnections.forEach(connection => {
                connection.send("{\"event\": \"parking updated\", \"data\":" + JSON.stringify(pData) + "}");
            });
        } else if (data.event == "gate") {
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        } else if (data.event=="gate_open_command"){ 
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        } else if (data.event=="gate_open_exit_command"){ 
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        } else if (data.event=="gate_open_front"){ 
            console.log("hhhhh")
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        }else if (data.event=="gate_close_front"){ 
            console.log("hhhhh")
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        }else if (data.event=="gate_open_back"){ 
            console.log("hhhhh")
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        }else if (data.event=="gate_close_back"){ 
            console.log("hhhhh")
            wsConnections.forEach(connection => {
                connection.send(msg);
            });
        }

    });

    // Handle WebSocket close event to remove closed connections from the array
    ws.on('close', () => {
        wsConnections = wsConnections.filter(connection => connection !== ws);
    });
});

app.post('/updateParking', async (req, res) => {


    const pData = await parking.findByIdAndUpdate({ "_id": "65d738cb6f3620f15d6ccdc6" }, req.body, { new: true })
    wsConnections.forEach(connection => {
        connection.send("{\"event\": \"parking updated\", \"data\":" + JSON.stringify(pData) + "}");
    });
 

    res.json({ message: "success", data: pData });
});


const ip = "192.168.163.12";
app.listen(PORT, ip, () => console.log('Server has been started'));


module.exports.wsConnections = wsConnections;
module.exports.appWs = appWs;
