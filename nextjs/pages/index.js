import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Avatar, Stack } from "@mui/material";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [priceFilter, setPriceFilter] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
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

  const drones = [
    { img: "https://api.builder.io/api/v1/image/assets/TEMP/a4d4412cbe5f6407f89bfbf0fc37d33acf39db9e?width=902", price: 4500 },
    { img: "https://api.builder.io/api/v1/image/assets/TEMP/dce2f6972858e67a77709b696a2b8113c2c8d18f?width=862", price: 6700 },
    { img: "https://api.builder.io/api/v1/image/assets/TEMP/5ca77a24b3d4bf36e7562d06014069221f0b523a?width=902", price: 12000 },
    { img: "https://api.builder.io/api/v1/image/assets/TEMP/86922d0b30fe3f7be8c8b158fb016b3f654c94bc?width=1110", price: 6900 },
    { img: "https://api.builder.io/api/v1/image/assets/TEMP/363785ff2a26a5f0abd52e62235acccc3a10e16f?width=1010", price: 7100 },
    { img: "https://api.builder.io/api/v1/image/assets/TEMP/812c73db96b92f555886b9f1c5d6ea8c706b866b?width=712", price: 6800 },
  ];

  const filteredDrones = drones.filter((d) => {
    if (!priceFilter) return true;
    if (priceFilter.min && d.price < priceFilter.min) return false;
    if (priceFilter.max && d.price > priceFilter.max) return false;
    return true;
  });

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

            {/*Feedback button */}
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

            {/* Login / Logout below price buttons */}
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
              <Box
                sx={{
                  height: 4,
                  width: 200,
                  backgroundColor: "#D55252",
                  borderRadius: "2px",
                }}
              />
            </Box>

            {/* Drone Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
              {filteredDrones.length === 0 && <Typography>No drones in this price range.</Typography>}
              {filteredDrones.map((drone, index) => (
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
                    "&:hover": { transform: "translateY(-10px)", boxShadow: "0 25px 35px rgba(0,0,0,0.3)" },
                  }}
                >
                  <Image
                    src={drone.img}
                    alt={`Drone ${index + 1}`}
                    width={400}
                    height={400}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
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
                    <Typography sx={{ color: "#FFF", fontWeight: 700, fontSize: "24px", fontFamily: "Inter, sans-serif" }}>
                      {drone.price.toLocaleString()} baht
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
