import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Avatar, Stack, TextField } from "@mui/material";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

// LOCAL DATA MAP: Map your stock_id to an image and name
const DRONE_VISUAL_MAP = {
  // Use the exact stock_id returned by your backend for the key
  1: { name: "Lightweight drone", img: "https://api.builder.io/api/v1/image/assets/TEMP/a4d4412cbe5f6407f89bfbf0fc37d33acf39db9e?width=902" }, 
  2: { name: "Camera drone", img: "https://api.builder.io/api/v1/image/assets/TEMP/dce2f6972858e67a77709b696a2b8113c2c8d18f?width=862" },    
  3: { name: "Racing drone", img: "https://api.builder.io/api/v1/image/assets/TEMP/5ca77a24b3d4bf36e7562d06014069221f0b523a?width=902" },      
  4: { name: "Tello drone", img: "https://api.builder.io/api/v1/image/assets/TEMP/86922d0b30fe3f7be8c8b158fb016b3f654c94bc?width=1110" },      
  5: { name: "Gold drone", img: "https://api.builder.io/api/v1/image/assets/TEMP/363785ff2a26a5f0abd52e62235acccc3a10e16f?width=1010" },       
  6: { name: "Mam Fav drone", img: "https://api.builder.io/api/v1/image/assets/TEMP/812c73db96b92f555886b9f1c5d6ea8c706b866b?width=712" },    
};

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [priceFilter, setPriceFilter] = useState(null);
  const [cart, setCart] = useState([]);
  const [drones, setDrones] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);

    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));

    // FETCH DATA AND MERGE WITH LOCAL IMAGE/NAME MAP
    fetch("http://localhost:8000/stock")
      .then(res => res.json())
      .then(data => {
        const mergedDrones = data.map(stockItem => {
          const visualData = DRONE_VISUAL_MAP[stockItem.stock_id];
          if (visualData) {
            return {
              ...stockItem,
              ...visualData, // Adds 'name' and 'img' to the drone object
            };
          }
          return null;
        }).filter(Boolean);
        
        setDrones(mergedDrones);
      })
      .catch(err => console.error("Failed to fetch stock:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  const handleProfileClick = () => {
    const user = localStorage.getItem("user");
    if (!user) router.push("/login");
    else router.push("/profile");
  };

  const filteredDrones = drones.filter((d) => {
    if (!priceFilter) return true;
    if (priceFilter.min && d.price < priceFilter.min) return false;
    if (priceFilter.max && d.price > priceFilter.max) return false;
    return true;
  });

  const handleAddToCart = (drone, qty) => {
    if (!qty || qty < 1) {
      Swal.fire("Error", "Please enter a valid quantity", "error");
      return;
    }
    if (qty > drone.quantity) {
      Swal.fire("Oops!", `Only ${drone.quantity} left in stock.`, "warning");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.stock_id === drone.stock_id);
      let updatedCart;
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > drone.quantity) {
          Swal.fire("Oops!", `Cannot add more than ${drone.quantity}`, "warning");
          return prev;
        }
        updatedCart = prev.map((item) =>
          item.stock_id === drone.stock_id ? { ...item, quantity: newQty } : item
        );
      } else {
        updatedCart = [...prev, { ...drone, quantity: qty }];
      }
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      Swal.fire("Added!", `${qty} item(s) added to cart`, "success");
      return updatedCart;
    });
  };

  return (
    <>
      <Head>
        <title>Drone Shop</title>
        <meta name="description" content="Welcome to the Drone Shop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ minHeight: "100vh", backgroundColor: "#F2EDD1" }}>
        {/* Left Panel - (No changes) */}
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            width: { xs: "60px", sm: "220px" },
            height: "100vh",
            backgroundColor: "#689B8A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 15,
            px: 2,
            zIndex: 10,
          }}
        >
          {/* Profile Circle */}
          <Avatar
            onClick={handleProfileClick}
            src="/profile-logo.png"
            alt="Profile"
            sx={{
              width: 100,
              height: 100,
              mb: 3,
              cursor: "pointer",
              border: "3px solid #FFF",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              },
              transition: "all 0.3s ease",
            }}
          />

          {/* Price Filter Buttons */}
          <Stack spacing={2} mt={3} width="100%">
            <Button
              variant="contained"
              onClick={() => setPriceFilter({ max: 6000 })}
              sx={{
                backgroundColor: "#D55252",
                fontWeight: 700,
                py: 1.5,
                fontSize: 16,
                borderRadius: "25px",
                "&:hover": { backgroundColor: "#b03f3f" },
              }}
            >
              Less than 6,000
            </Button>
            <Button
              variant="contained"
              onClick={() => setPriceFilter({ min: 6001, max: 8000 })}
              sx={{
                backgroundColor: "#D55252",
                fontWeight: 700,
                py: 1.5,
                fontSize: 16,
                borderRadius: "25px",
                "&:hover": { backgroundColor: "#b03f3f" },
              }}
            >
              6,001 - 8,000
            </Button>
            <Button
              variant="contained"
              onClick={() => setPriceFilter({ min: 8001 })}
              sx={{
                backgroundColor: "#D55252",
                fontWeight: 700,
                py: 1.5,
                fontSize: 16,
                borderRadius: "25px",
                "&:hover": { backgroundColor: "#b03f3f" },
              }}
            >
              More than 8,000
            </Button>
            <Button
              variant="outlined"
              onClick={() => setPriceFilter(null)}
              sx={{
                color: "#FFF",
                borderColor: "#FFF",
                fontWeight: 700,
                py: 1.5,
                fontSize: 16,
                borderRadius: "25px",
                "&:hover": { borderColor: "#FFF" },
              }}
            >
              Show All
            </Button>

            {/* Feedback Button */}
            <Button
              onClick={() => router.push("/feedback")}
              variant="contained"
              sx={{
                backgroundColor: "#FFD700",
                fontWeight: 700,
                py: 1.5,
                fontSize: 16,
                borderRadius: "25px",
                mt: 5,
                width: "100%",
                "&:hover": { backgroundColor: "#e6c200" },
              }}
            >
              Feedback
            </Button>

            {/* Checkout Button */}
            <Button
              onClick={() => router.push("/checkout")}
              variant="contained"
              sx={{
                backgroundColor: "#4CAF50",
                fontWeight: 700,
                py: 1.5,
                fontSize: 16,
                borderRadius: "25px",
                mt: 3,
                width: "100%",
                "&:hover": { backgroundColor: "#45a049" },
              }}
            >
              Checkout
            </Button>

            {/* Login / Logout */}
            {!isLoggedIn ? (
              <Link href="/login" passHref>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#FFF",
                    color: "#689B8A",
                    fontWeight: 700,
                    py: 1.5,
                    fontSize: 16,
                    borderRadius: "25px",
                    mt: 3,
                    width: "100%",
                    "&:hover": { backgroundColor: "#e0e0e0" },
                  }}
                >
                  Login
                </Button>
              </Link>
            ) : (
              <Button
                onClick={handleLogout}
                variant="contained"
                sx={{
                  backgroundColor: "#FFF",
                  color: "#689B8A",
                  fontWeight: 700,
                  py: 1.5,
                  fontSize: 16,
                  borderRadius: "25px",
                  mt: 3,
                  width: "100%",
                  "&:hover": { backgroundColor: "#e0e0e0" },
                }}
              >
                Logout
              </Button>
            )}
          </Stack>
        </Box>

        {/* Main Content */}
        <Box sx={{ ml: { xs: "60px", sm: "220px" }, py: 5 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "left", mb: 8 }}>
              <Typography
                variant="h2"
                sx={{
                  color: "#D55252",
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  letterSpacing: "-2px",
                  mb: 2,
                }}
              >
                WELCOME TO THE DRONE SHOP
              </Typography>
              <Box sx={{ height: 4, width: 200, backgroundColor: "#D55252", borderRadius: "2px" }} />
            </Box>

            {/* Drone Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {filteredDrones.length === 0 && <Typography>No drones in this price range.</Typography>}
              {filteredDrones.map((drone) => (
                <Box
                  key={drone.stock_id}
                  sx={{
                    position: "relative",
                    width: "100%",
                    // Reduced total height slightly as content is more compact
                    height: 460, 
                    borderRadius: "30px",
                    overflow: "hidden",
                    backgroundColor: "#F9CB99",
                    boxShadow: "0 15px 25px rgba(0,0,0,0.2)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": { transform: "translateY(-10px)", boxShadow: "0 25px 35px rgba(0,0,0,0.3)" },
                  }}
                >
                  {/* Image Display Area (300px height) */}
                  <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
                    <Image
                        src={drone.img || "/placeholder.png"} 
                        alt={`Drone ${drone.name || drone.stock_id}`}
                        fill 
                        style={{ objectFit: "cover" }}
                    />
                  </Box>

                  {/* Info Box - Content now compact */}
                  <Box 
                      sx={{ 
                          p: 2, 
                          // Removed fixed height to allow flexible content
                          display: 'flex', 
                          flexDirection: 'column', 
                      }}
                  >
                    
                    {/* Name and Price */}
                    <Box sx={{ mb: 1 }}> {/* Reduced margin-bottom */}
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', lineHeight: 1.2 }}>
                            {drone.name || `Drone ID: ${drone.stock_id}`}
                        </Typography>
                        <Typography sx={{ fontWeight: 700, fontSize: 22, color: '#D55252', mt: 0.5 }}>
                            {drone.price.toLocaleString()} baht
                        </Typography>
                    </Box>

                    {/* Stock and Add to Cart - MOVED UPPER */}
                    <Box> 
                      <Typography sx={{ fontSize: 15, color: "#689B8A", mb: 1 }}> {/* mb: 1 (8px) */}
                          In Stock: {drone.quantity}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          type="number"
                          size="small"
                          label="Qty"
                          defaultValue={1}
                          sx={{ width: 80, '& input': { p: '6px 8px' } }}
                          inputProps={{ min: 1, max: drone.quantity }}
                          id={`qty-${drone.stock_id}`}
                        />
                        <Button
                          variant="contained"
                          onClick={() => {
                            const qty = parseInt(document.getElementById(`qty-${drone.stock_id}`).value);
                            handleAddToCart(drone, qty);
                          }}
                          sx={{ 
                              backgroundColor: "#D55252", 
                              "&:hover": { backgroundColor: "#b03f3f" },
                              py: 1, 
                              px: 2, 
                              fontSize: 14 
                          }}
                        >
                          ADD TO CART
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}