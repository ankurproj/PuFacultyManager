import React, { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import Layout from "./Layout";
import { getApiUrl } from '../config/api';
import { useComponentRefresh } from "../hooks/useDataRefresh";
function Books() {
  const [books, setBooks] = useState({
    // Books
    books: [
      {
        title: "",
        authors: "",
        publisher: "",
        year: "",
        isbn: "",
      },
    ],
    // Chapters in Books
    chapters_in_books: [
      {
        chapter_title: "",
        authors: "",
        book_title: "",
        publisher: "",
        year: "",
        isbn: "",
      },
    ],
    // Edited Books
    edited_books: [
      {
        title: "",
        authors: "",
        publisher: "",
        year: "",
        isbn: "",
        chapter_titles: "",
      },
    ],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setBooks((prev) => ({
          ...prev,
          name: decoded.name || "",
          email: decoded.email || "",
        }));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }

    fetchBooks();
  }, []);

  const fetchBooks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      console.log('🔄 Fetching books data...');
      const response = await fetch(
        getApiUrl("/api/professor/books"),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📚 Books API Response:', data);
        console.log('Books Count:', data.books?.length || 0);
        console.log('Chapters Count:', data.chapters_in_books?.length || 0);
        setBooks(data);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  }, []);

  // Register this component for automatic refresh
  useComponentRefresh('books', fetchBooks);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        return;
      }

      // Send books data directly to backend for immediate saving
      const response = await fetch(getApiUrl("/api/professor/books"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(books)
      });

      if (response.ok) {
        const data = await response.json();
        alert("Books updated successfully!");
        console.log("Books saved:", data.books);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error updating books");
      }
    } catch (error) {
      console.error("Error saving books:", error);
      alert("Error saving books. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setBooks((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setBooks((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addArrayItem = (arrayName) => {
    const defaultItems = {
      books: {
        title: "",
        authors: "",
        publisher: "",
        year: "",
        isbn: "",
      },
      chapters_in_books: {
        chapter_title: "",
        authors: "",
        book_title: "",
        publisher: "",
        year: "",
        isbn: "",
      },
      edited_books: {
        title: "",
        authors: "",
        publisher: "",
        year: "",
        isbn: "",
        chapter_titles: "",
      },
    };

    setBooks((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItems[arrayName] || {}],
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setBooks((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  return (
    <Layout>
      <div
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            padding: "10px 30px 30px",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              marginBottom: "10px",
              marginTop: "0px",
            }}
          >
            Books & Publications
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              marginBottom: "30px",
              marginTop: "0px",
              opacity: 0.8
            }}
          >
            Update your book publications, chapters, and edited books
          </p>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: "#fff",
                padding: "40px",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                marginBottom: "30px",
              }}
            >
              {/* Books Section */}
              <div style={{ marginTop: "0px" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    marginTop: "0px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Books
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                      <th style={{ width: "250px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Book</th>
                      <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                      <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Publisher</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                      <th style={{ width: "140px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>ISBN No.</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.books.map((book, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.title}
                            onChange={(e) => handleArrayChange("books", idx, "title", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Book Title"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.authors}
                            onChange={(e) => handleArrayChange("books", idx, "authors", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Authors"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.publisher}
                            onChange={(e) => handleArrayChange("books", idx, "publisher", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Publisher"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="number"
                            value={book.year}
                            onChange={(e) => handleArrayChange("books", idx, "year", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Year"
                            min="1900"
                            max="2030"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.isbn}
                            onChange={(e) => handleArrayChange("books", idx, "isbn", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="ISBN"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("books", idx)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "0.7rem",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addArrayItem("books")}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  + Add Book
                </button>
              </div>

              {/* Chapters in Books Section */}
              <div style={{ marginTop: "40px" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Chapters in Books
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                      <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Chapter</th>
                      <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                      <th style={{ width: "200px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Book</th>
                      <th style={{ width: "160px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Publisher</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                      <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>ISBN No.</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.chapters_in_books.map((chapter, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={chapter.chapter_title}
                            onChange={(e) => handleArrayChange("chapters_in_books", idx, "chapter_title", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Chapter Title"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={chapter.authors}
                            onChange={(e) => handleArrayChange("chapters_in_books", idx, "authors", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Authors"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={chapter.book_title}
                            onChange={(e) => handleArrayChange("chapters_in_books", idx, "book_title", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Book Title"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="text"
                            value={chapter.publisher}
                            onChange={(e) => handleArrayChange("chapters_in_books", idx, "publisher", e.target.value)}
                            style={{ width: "90%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Publisher"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="number"
                            value={chapter.year}
                            onChange={(e) => handleArrayChange("chapters_in_books", idx, "year", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Year"
                            min="1900"
                            max="2030"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={chapter.isbn}
                            onChange={(e) => handleArrayChange("chapters_in_books", idx, "isbn", e.target.value)}
                            style={{
                              width: "80%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="ISBN"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("chapters_in_books", idx)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "0.7rem",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addArrayItem("chapters_in_books")}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  + Add Chapter
                </button>
              </div>

              {/* Edited Books Section */}
              <div style={{ marginTop: "40px" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: "#2d3748",
                    marginBottom: "25px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  Edited Books
                </h2>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "10px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f1f5f9" }}>
                      <th style={{ width: "40px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>S.No</th>
                      <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Book</th>
                      <th style={{ width: "180px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Title of the Chapters</th>
                      <th style={{ width: "150px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Authors</th>
                      <th style={{ width: "130px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Publisher</th>
                      <th style={{ width: "70px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>Year</th>
                      <th style={{ width: "120px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}>ISBN No.</th>
                      <th style={{ width: "80px", padding: "10px", border: "1px solid #e2e8f0", fontWeight: 600 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.edited_books.map((book, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>{idx + 1}</td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.title}
                            onChange={(e) => handleArrayChange("edited_books", idx, "title", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Book Title"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.chapter_titles}
                            onChange={(e) => handleArrayChange("edited_books", idx, "chapter_titles", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Title of the Chapters"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.authors}
                            onChange={(e) => handleArrayChange("edited_books", idx, "authors", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Authors"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.publisher}
                            onChange={(e) => handleArrayChange("edited_books", idx, "publisher", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="Publisher"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <input
                            type="number"
                            value={book.year}
                            onChange={(e) => handleArrayChange("edited_books", idx, "year", e.target.value)}
                            style={{ width: "80%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.9rem" }}
                            placeholder="Year"
                            min="1900"
                            max="2030"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                          <textarea
                            value={book.isbn}
                            onChange={(e) => handleArrayChange("edited_books", idx, "isbn", e.target.value)}
                            style={{
                              width: "90%",
                              height: "60px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              overflow: "auto",
                              fontFamily: "inherit"
                            }}
                            placeholder="ISBN"
                          />
                        </td>
                        <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => removeArrayItem("edited_books", idx)}
                            style={{
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "0.7rem",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  onClick={() => addArrayItem("edited_books")}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  + Add Edited Book
                </button>
              </div>

              {/* Submit Button */}
              <div
                style={{
                  marginTop: "50px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  type="submit"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 40px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 12px 35px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Books;