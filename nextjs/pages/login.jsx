import { useState, useEffect } from "react";
import { Box, TextField, Button, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      Swal.fire({
        title: "Already Logged In",
        text: "You are already logged in!",
        icon: "info",
      }).then(() => router.push("/profile"));
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.detail || "Login failed");

      // Store user info
      localStorage.setItem(
        "user",
        JSON.stringify({ email: result.email, user_id: result.user_id })
      );

      await Swal.fire({ title: "Success!", text: result.message, icon: "success" });

      router.push("/profile");
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const goToRegister = () => router.push("/register");

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#F2EDD1", position: "relative" }}>
      {/* Close Button */}
      <IconButton
        onClick={() => router.push("/")}
        sx={{
          position: "absolute", top: 20, right: 20,
          color: "#280A3E", bgcolor: "#F9CB99",
          "&:hover": { bgcolor: "#e0b87a" }, zIndex: 10
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>

      {/* Left Panel */}
      <Box sx={{ flex: 1, px: 8, py: 10, position: "relative" }}>
        <Typography variant="h1" sx={{ fontSize: 64, fontWeight: 700, color: "#280A3E", mb: 8 }}>
          LOG IN
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>USERNAME</Typography>
          <TextField
            fullWidth
            placeholder="Enter Username"
            name="email"
            value={form.email}
            onChange={handleChange}
            sx={{
              borderRadius: "15px",
              "& .MuiOutlinedInput-root": { height: 85, padding: "0 10px", fontSize: 36, fontWeight: 700, color: "#000" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#7F7C7C", borderWidth: 2 },
              "& .MuiInputBase-input::placeholder": { color: "#7F7C7C", opacity: 1 }
            }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>PASSWORD</Typography>
          <TextField
            fullWidth
            placeholder="Enter Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            sx={{
              borderRadius: "15px",
              "& .MuiOutlinedInput-root": { height: 86, padding: "0 10px", fontSize: 36, fontWeight: 700, color: "#000" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#7F7C7C", borderWidth: 2 },
              "& .MuiInputBase-input::placeholder": { color: "#7F7C7C", opacity: 1 }
            }}
          />
        </Box>

        <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#7F7C7C", mb: 6 }}>
          forgot password ?
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4, width: 404 }}>
          <Button onClick={handleSubmit} sx={{ borderRadius: "30px", backgroundColor: "#280A3E", py: 3, fontSize: 36, fontWeight: 700, "&:hover": { backgroundColor: "#3b1160" } }}>
            LOGIN
          </Button>
          <Button onClick={goToRegister} sx={{ borderRadius: "30px", backgroundColor: "#280A3E", py: 3, fontSize: 36, fontWeight: 700, "&:hover": { backgroundColor: "#3b1160" } }}>
            REGISTER
          </Button>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box sx={{ flex: 1, position: "relative", backgroundColor: "#689B8A" }}>
        <Image
          src="https://api.builder.io/api/v1/image/assets/TEMP/b17055f8d6e30a30a812f1b290b7f3576570d2f5?width=1334"
          alt="Drone"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </Box>
    </Box>
  );
}
