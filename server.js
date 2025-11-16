require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require("helmet"); 
const cookieParser = require("cookie-parser");
const chartRoutes = require('./routes/chartRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const pageRoutes = require('./routes/pageRoutes');
const authRoutes = require('./routes/authRoutes');
const accessControlRoutes = require('./routes/accessControlRoutes');

app.use(helmet());
app.use(express.json());
app.use(cookieParser());    
app.use(
    cors({
        origin: "http://localhost:3000",       
        credentials: true,                     
    })
);

app.use('/api/chart', chartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/access-control', accessControlRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
