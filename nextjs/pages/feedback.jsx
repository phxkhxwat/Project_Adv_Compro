import Head from "next/head";
import { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Avatar, Stack, TextField, Rating, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

export default function Feedback() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({ rating: 0, comment: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/feedback/"); // FastAPI endpoint
      const data = await res.json();
      console.log("Fetched feedbacks:", data);

      if (Array.isArray(data)) {
        // Shuffle and keep only 7 feedbacks
        const shuffled = data.sort(() => 0.5 - Math.random());
        setFeedbacks(shuffled.slice(0, 7));
      } else {
        setFeedbacks([]);
      }
    } catch (error) {
      console.error(error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      router.push("/login");
      return;
    }
    if (!newFeedback.rating) {
      alert("Please give a rating before submitting.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, ...newFeedback }),
      });
      if (!res.ok) throw new Error("Failed to submit feedback");

      setNewFeedback({ rating: 0, comment: "" });

      // Refresh feedbacks including names and randomize 7
      fetchFeedbacks();
    } catch (error) {
      console.error(error);
      alert("Error submitting feedback.");
    }
  };

  return (
    <>
      <Head>
        <title>Feedback - Drone Shop</title>
        <meta name="description" content="User feedback for Drone Shop" />
      </Head>

      <Box sx={{ minHeight: "100vh", backgroundColor: "#C7EFCF" }}>
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
          <Avatar
            onClick={() => router.push("/profile")}
            src="/profile-logo.png"
            alt="Profile"
            sx={{
              width: 100,
              height: 100,
              mb: 3,
              cursor: "pointer",
              border: "3px solid #FFF",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              "&:hover": { transform: "scale(1.1)", boxShadow: "0 8px 20px rgba(0,0,0,0.4)" },
              transition: "all 0.3s ease",
            }}
          />
          <Stack spacing={2} mt={3} width="100%">
            <Button
              onClick={() => router.push("/")}
              variant="contained"
              sx={{ backgroundColor: "#FFD700", fontWeight: 700, py: 1.5, fontSize: 16, borderRadius: "25px", "&:hover": { backgroundColor: "#e6c200" } }}
            >
              Home
            </Button>
            {!isLoggedIn ? (
              <Button
                onClick={() => router.push("/login")}
                variant="contained"
                sx={{ backgroundColor: "#FFF", color: "#689B8A", fontWeight: 700, py: 1.5, fontSize: 16, borderRadius: "25px", width: "100%", "&:hover": { backgroundColor: "#e0e0e0" } }}
              >
                Login
              </Button>
            ) : (
              <Button
                onClick={() => { localStorage.removeItem("user"); router.push("/"); }}
                variant="contained"
                sx={{ backgroundColor: "#FFF", color: "#689B8A", fontWeight: 700, py: 1.5, fontSize: 16, borderRadius: "25px", width: "100%", "&:hover": { backgroundColor: "#e0e0e0" } }}
              >
                Logout
              </Button>
            )}
          </Stack>
        </Box>

        {/* Main Content */}
        <Box sx={{ ml: { xs: "60px", sm: "220px" }, py: 5 }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: "left", mb: 5 }}>
              <Typography variant="h3" sx={{ color: "#FFD700", fontWeight: 700, mb: 2 }}>User Feedback</Typography>
              <Box sx={{ height: 4, width: 150, backgroundColor: "#689B8A", borderRadius: "2px" }} />
            </Box>

            {/* Feedback List */}
            <Stack spacing={3} mb={5}>
              {loading && <CircularProgress />}
              {!loading && feedbacks.length === 0 && <Typography>No feedback yet.</Typography>}
              {Array.isArray(feedbacks) && feedbacks.map((fb) => (
                <Box key={fb.feedback_id} sx={{ backgroundColor: "#FFF", p: 3, borderRadius: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{fb.name || `User ${fb.user_id}`}</Typography>
                  <Rating value={Number(fb.rating)} readOnly />
                  <Typography sx={{ mt: 1 }}>{fb.comment}</Typography>
                  <Typography sx={{ fontSize: 12, color: "#666", mt: 1 }}>{new Date(fb.created_at).toLocaleString()}</Typography>
                </Box>
              ))}
            </Stack>

            {/* Add Feedback */}
            {isLoggedIn && (
              <Box sx={{ mb: 10 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Add Your Feedback</Typography>
                <Rating
                  value={newFeedback.rating}
                  onChange={(e, newValue) => setNewFeedback({ ...newFeedback, rating: newValue })}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Write your comment..."
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                  sx={{ mt: 2 }}
                />
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: "#689B8A", "&:hover": { backgroundColor: "#507b6a" } }}
                >
                  Submit Feedback
                </Button>
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
}
