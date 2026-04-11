import React, { useEffect, useState } from "react";
import openFetch from "@hamdymohamedak/openfetch";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    openFetch
      .get("https://api.escuelajs.co/api/v1/products")
      .then((res) => {
        // API returns products as a direct array
        if (Array.isArray(res)) {
          setProducts(res);
        } else if (res && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Error fetching products");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Products</h1>
      {products.length === 0 && <p>No products found.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((product) => (
          <li
            key={product.id}
            style={{
              border: "1px solid #eee",
              margin: "20px 0",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <h2>{product.title}</h2>
            <p>
              <b>Price:</b> ${product.price}
            </p>
            <p>{product.description}</p>

            {/* The 'images' field in API is always an array of URLs */}
            {product.images &&
              Array.isArray(product.images) &&
              product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  style={{ maxWidth: "300px", borderRadius: "6px" }}
                />
              )}

            <div style={{ marginTop: "10px" }}>
              <b>Category:</b> {product.category?.name}
              {product.category?.image && (
                <img
                  src={product.category.image}
                  alt={product.category.name}
                  style={{
                    maxWidth: "60px",
                    marginLeft: "10px",
                    verticalAlign: "middle",
                    borderRadius: "4px",
                  }}
                />
              )}
            </div>
            {/* Extra debug: show ids, category ids, etc., if needed:
                <pre>{JSON.stringify(product, null, 2)}</pre>
            */}
          </li>
        ))}
      </ul>
    </div>
  );
}
