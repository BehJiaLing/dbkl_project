const express = require('express');
const app = express();
const cors = require('cors');
const chartRoutes = require('./routes/chartRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/chart', chartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/login', loginRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
