import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const user = localStorage.getItem("user"); // simple login tracking
    if (user) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  const drones = [
    {
      img: "https://api.builder.io/api/v1/image/assets/TEMP/a4d4412cbe5f6407f89bfbf0fc37d33acf39db9e?width=902",
      price: "6,700 baht",
    },
    {
      img: "https://api.builder.io/api/v1/image/assets/TEMP/dce2f6972858e67a77709b696a2b8113c2c8d18f?width=862",
      price: "6,700 baht",
    },
    {
      img: "https://api.builder.io/api/v1/image/assets/TEMP/5ca77a24b3d4bf36e7562d06014069221f0b523a?width=902",
      price: "6,900 baht",
    },
    {
      img: "https://api.builder.io/api/v1/image/assets/TEMP/86922d0b30fe3f7be8c8b158fb016b3f654c94bc?width=1110",
      price: "6,900 baht",
    },
    {
      img: "https://api.builder.io/api/v1/image/assets/TEMP/363785ff2a26a5f0abd52e62235acccc3a10e16f?width=1010",
      price: "7,100 baht",
    },
    {
      img: "https://api.builder.io/api/v1/image/assets/TEMP/812c73db96b92f555886b9f1c5d6ea8c706b866b?width=712",
      price: "6,800 baht",
    },
  ];

  return (
    <>
      <Head>
        <title>Drone Shop</title>
        <meta name="description" content="Welcome to the Drone Shop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ minHeight: "100vh", backgroundColor: "#F2EDD1" }}>
        {/* Left Panel */}
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            width: { xs: "60px", sm: "300px" },
            height: "100vh",
            backgroundColor: "#689B8A",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
            zIndex: 10,
          }}
        >
          {!isLoggedIn ? (
            <Link href="/login" passHref>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FFF",
                  color: "#689B8A",
                  fontWeight: 700,
                  borderRadius: "20px",
                  mb: 2,
                  px: 3,
                  py: 2,
                  fontSize: 20, // bigger button
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
                borderRadius: "20px",
                mb: 2,
                px: 3,
                py: 2,
                fontSize: 20,
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              Logout
            </Button>
          )}
        </Box>

        {/* Main Content */}
        <Box sx={{ ml: { xs: "60px", sm: "200px" }, py: 5 }}>
          <Container maxWidth="lg">
            {/* Header */}
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
              <Box
                sx={{
                  height: 4,
                  width: 200,
                  backgroundColor: "#D55252",
                  borderRadius: "2px",
                }}
              />
            </Box>

            {/* Drone Grid 2 columns x 3 rows */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 6,
              }}
            >
              {drones.map((drone, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 450,
                    borderRadius: "30px",
                    overflow: "hidden",
                    backgroundColor: "#F9CB99",
                    boxShadow: "0 15px 25px rgba(0,0,0,0.2)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: "0 25px 35px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <Image
                    src={drone.img}
                    alt={`Drone ${index + 1}`}
                    width={400}
                    height={400}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Price Overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: 60,
                      backgroundColor: "#D55252",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderBottomLeftRadius: "30px",
                      borderBottomRightRadius: "30px",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#FFF",
                        fontWeight: 700,
                        fontSize: "24px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {drone.price}
                    </Typography>
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
