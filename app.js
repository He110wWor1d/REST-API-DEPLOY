const express = require("express");
const movies = require("./movies.json"); // biblioteca nativa de express que permite crear UUIDs únicas. Ver línea 44
const crypto = require("node:crypto");
const cors = require("cors");
const {
  validateMovie,
  validatePartialMovie,
} = require("./schemas/moviesSchema");

const app = express();
app.use(express.json()); // MiddleWare incluído en express para poder extraer información del body de una request POST
app.use(cors());
app.disable("x-powered-by");

// Uso de query en al URL para identificar una solicitud específica, por género
app.get("/movies", (req, res) => {
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter(
      //el filter crea un nuevo array basado en los elementos que resultan true del algoritmo de abajo
      (movie) =>
        movie.genre.some(
          (elemento) => elemento.toLowerCase() === genre.toLowerCase() //En el some() esto retorna true si hace match cada elemento
        )
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

//Todos los recursos que sean MOVIES se identifica con /movies
/*app.get("/movies", (req, res) => {
  res.json(movies);
});*/

// Uso de params en al URL para identificar una solicitud específica, por ID
app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) {
    return res.json(movie);
  }
  res.status(404).json({ message: "Película no encontrada :(" });
});

//Para crear un recurso usamos el mismo recurso, en este caso "movie"
app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    //Se podría usar el status code 422
    res.status(400).json({ error: JSON.parse(result.error.message) });
  }
  const newMovie = {
    id: crypto.randomUUID(), //Crea un UUId v4 (Universal Unique Identifier)
    ...result.data,
  };

  movies.push(newMovie); // Recordar que esto se hace para ejemplo al no tener un DB. Pero hacer esto quita lo REST
  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    //FindIndex retorna -1 cuando no hay coincidencias en el array
    return res.status(404).json({ message: "Movie not found :(" });
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

const PORT = process.env.PORT ?? 1234; //Las variables de entorno siempre son en mayus (PORT)

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
