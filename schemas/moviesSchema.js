const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error:
      "El título de la película deben ser létras válidas (excluyendo simbolos)",
    required_error: "El título de la película es requerido",
  }),
  year: z.number().int().positive().min(1900).max(2024),
  director: z.string(),
  duration: z.number().positive().int(),
  rate: z.number().min(0).max(10).default(0),
  poster: z
    .string()
    .url({ message: "El poster debe ser una dirección URL válida" }), //.endsWith("jpg"),
  genre: z.array(
    z.enum([
      "Action",
      "Aventura",
      "Comedia",
      "Drama",
      "Fantasía",
      "Horror",
      "Thriller",
      "Sci-Fi",
      "Crime",
    ]),
    {
      required_error: "El género de la película es requerido",
      invalid_type_error:
        "El genero de la película debe ser un array de enum Genre",
    }
  ),
});

function validateMovie(input) {
  return movieSchema.safeParse(input); // Se puede usar safeParseAsy cuando se trabaja en un caso real con DBs para evitar el bloqueo mientras se espera respuesta de DB
}

function validatePartialMovie(input) {
  return movieSchema.partial().safeParse(input);
} // Con .partial() puedes tomar el esquema de validación del movieSchema de manera parcial, así básicamente solo va validar los datos que se introduzcan en vez de todos.

module.exports = { validateMovie, validatePartialMovie };
