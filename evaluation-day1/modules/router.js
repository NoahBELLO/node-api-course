const db = require("./db");
const { URL } = require("url");

async function getAllBooks() {
  try {
    const data = await db.readDB();
    return data.books || [];
  } catch (e) {
    console.error("Erreur lors de la lecture de la base de données :", e);
    return [];
  }
}

async function getBookById(id) {
  try {
    const data = await db.readDB();
    return data.books.find((b) => b.id === id);
  } catch (e) {
    console.error("Erreur lors de la lecture de la base de données :", e);
    return null;
  }
}

async function numberOfBooks() {
  try {
    const data = await db.readDB();
    return data.books.length || 0;
  } catch (e) {
    console.error("Erreur lors de la lecture de la base de données :", e);
    return 0;
  }
}

async function addBook(params) {
  try {
    const data = await db.readDB();
    const newBook = {
      id: data.books.length ? Math.max(...data.books.map((b) => b.id)) + 1 : 1,
      ...params,
      available: true,
    };

    data.books.push(newBook);
    await db.writeDB(data);
    return newBook;
  } catch (e) {
    console.error("Erreur lors de l'ajout du livre :", e);
    throw new Error("Impossible d'ajouter le livre");
  }
}

async function deleteBook(id) {
  try {
    const data = await db.readDB();
    const index = data.books.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error("Livre introuvable");
    }
    const deletedBook = data.books.splice(index, 1)[0];
    await db.writeDB(data);
    return deletedBook;
  } catch (e) {
    console.error("Erreur lors de la suppression du livre :", e);
    throw new Error("Livre introuvable");
  }
}

async function getBooksByAvailability(available) {
  try {
    const data = await db.readDB();
    return data.books.filter((b) => b.available === available);
  } catch (e) {
    console.error("Erreur lors de la lecture de la base de données :", e);
    return [];
  }
}

async function router(req, res) {
  const method = req.method;
  const myUrl = new URL(req.url, `http://${req.headers.host}`);
  const params = myUrl.pathname.split("/").filter(Boolean);
  const timestamp = new Date().toISOString();
  const query = Object.fromEntries(myUrl.searchParams.entries());

  try {
    if (myUrl.pathname === "/books" && method === "GET") {
      if (Object.keys(query).length > 0) {
        if (query.available === undefined) {
          console.log(
            `[${timestamp}] ${method} ${myUrl.pathname}?${new URLSearchParams(query).toString()} → 400`,
          );
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              success: false,
              error: "Paramètre 'available' manquant",
            }),
          );
        }

        if (query.available !== "true" && query.available !== "false") {
          console.log(
            `[${timestamp}] ${method} ${myUrl.pathname}?${new URLSearchParams(query).toString()} → 400`,
          );
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              success: false,
              error: "Paramètre 'available' doit être 'true' ou 'false'",
            }),
          );
        }

        const books = await getBooksByAvailability(query.available === "true");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            count: books.length,
            data: books,
          }),
        );
        console.log(
          `[${timestamp}] ${method} ${myUrl.pathname}?${new URLSearchParams(query).toString()} → 200`,
        );
      } else {
        const books = await getAllBooks();
        const numberBooks = await numberOfBooks();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            count: numberBooks,
            data: books,
          }),
        );
        console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 200`);
      }
    } else if (
      myUrl.pathname.startsWith("/books/") &&
      method === "GET" &&
      params[0] === "books" &&
      params[1]
    ) {
      const book = await getBookById(Number(params[1]));
      try {
        if (!book) throw new Error("Livre introuvable");
      } catch (e) {
        console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 404`);
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ success: false, error: e.message }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data: book }));
      console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 200`);
    } else if (myUrl.pathname === "/books" && method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        try {
          const parsed = JSON.parse(body);
          console.log("Données reçues :", parsed);

          if (!parsed.title || !parsed.author || !parsed.year) {
            throw new Error("Les champs title, author et year sont requis");
          }
          const newBook = await addBook(parsed);

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, data: newBook }));
          console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 201`);
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: e.message }));
          console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 400`);
        }
      });
    } else if (
      myUrl.pathname.startsWith("/books/") &&
      method === "DELETE" &&
      params[0] === "books" &&
      params[1]
    ) {
      try {
        const deletedBook = await deleteBook(Number(params[1]));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, data: deletedBook }));
        console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 200`);
      } catch (e) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: e.message }));
        console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 404`);
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Route non trouvée" }));
      console.log(`[${timestamp}] ${method} ${myUrl.pathname} → 404`);
    }
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Erreur interne" }));
    console.error(`[${timestamp}] ${method} ${myUrl.pathname} → 500`, e);
  }
}

module.exports = router;
