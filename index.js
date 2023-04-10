const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// app.use(cors());
app.use(express.static("frontend"));
app.use(express.json());

morgan.token("content", function (req, res) {
  if (req.method == "POST") return JSON.stringify(req.body);
  return null;
});

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

const PORT = process.env.PORT || 3001;

let entries = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  let num;
  num = Math.floor(Math.random() * 9999);
  while (entries.find((entry) => entry.id === num)) {
    num = Math.floor(Math.random() * 9999);
  }
  return num;
};

app.get("/api/persons", (request, response) => {
  response.status(200).json(entries).end();
});

app.get("/info", (request, response) => {
  response
    .status(200)
    .send(
      `<p>Phonebook has info for ${entries.length} people</p><p>${Date()}</p>`
    )
    .end();
});

app.get("/api/persons/:id", (request, response) => {
  const found = entries.find((entry) => entry.id === Number(request.params.id));

  if (found) response.status(200).json(found).end();
  else response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const found = entries.find((entry) => entry.id === id);
  entries = entries.filter((entry) => entry.id !== id);

  if (found) response.status(204).end();
  else response.status(404).end();
});

app.post("/api/persons", (request, response) => {
  const data = request.body;
  if (!data.name || !data.number) {
    response.status(400).json({ error: "Missing name or number field" }).end();
    return;
  }

  const nameExists = entries.find((entry) => entry.name === data.name);
  if (nameExists) {
    response.status(400).json({ error: "Name must be unique" }).end();
    return;
  }

  let entry = {
    ...data,
    id: generateId(),
  };
  entries = entries.concat(entry);

  response.json(entry).end();
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
