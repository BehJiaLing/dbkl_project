const express = require('express');
const app = express();
const chartRoutes = require('./routes/chartRoutes');

app.use(express.json());

// Use chart routes
app.use('/api', chartRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
