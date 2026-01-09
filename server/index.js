import express from 'express';

const app = express();
app.use(express.json());

const PORT = 3000;

const list = [
  {
    id: 1,
    title: "Assignments",
    status: "pending"
  },
  {
    id: 2,
    title: "Daily Chores",
    status: "pending"
  }
]

const items = [
  {
    id: 1,
    list_id: 1,
    description: "Programming",
    status: "pending"
  },
  {
    id: 2,
    list_id: 1,
    description: "Web Dev",
    status: "pending"
  },
  {
    id: 3,
    list_id: 2,
    description: "Wash Dish",
    status: "pending"
  },
  {
    id: 4,
    list_id: 2,
    description: "Clean the room",
    status: "pending"
  } 
]

app.get('/get-list', (req, res) => {
  res.status(200).json({ success: true, list });
});

app.post('/add-list', (req, res) => {
  const { listTitle } = req.body;

  list.push({
    id: list.length + 1,
    title: listTitle,
    status: "pending"
  })

  
  res.status(200).json({  success: true, list , message: "Message Succesfully Added"});
});

app.get('/edit-list', (req, res) => {
  res.send('Edit list');
});

app.get('/delete-list', (req, res) => {
  res.send('Delete list');
});


app.get('/get-items/:id', (req, res) => {

  const listId = req.params.id;

  const filtered = items.filter(
    item => item.list_id == listId
  );

  if(filtered.length === 0) {
  res.status(200).json({
    success: false,
    message: "List not found"
  });
}

  res.status(200).json({ success: true, items: filtered});
});


app.get('/add-items', (req, res) => {
  res.send('Add items');
});

app.get('/edit-items', (req, res) => {
  res.send('Edit items');
});

app.get('/delete-items', (req, res) => {
  res.send('Delete items');
});



app.listen(PORT, () => {
    console.log('Server listening on port ${PORT}');
});