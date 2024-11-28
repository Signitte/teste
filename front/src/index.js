const express=require('express')
const path = require('path');

const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, "/public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "/views"));

app.get("/", function(req, res){
  res.render("quill");
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});