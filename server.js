const dotenv = require('dotenv');
const morgan = require('morgan');



mongoose
.connect(process.env.DB_URI)
.then((conn) => {
  console.log(`Database Connected: ${conn.connection.host}`);
})
.catch((err) => {
  console.error(`Database Error: ${err}`);
  process.exit(1);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});