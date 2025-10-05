import { useState } from "react";
import { useRouter } from "next/router";
import { Container, TextField, Button, Typography, Stack, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      return Swal.fire({ title: "Error", text: "Email must contain @", icon: "error" });
    }

    if (form.password !== form.confirmPassword) {
      return Swal.fire({ title: "Error", text: "Passwords do not match", icon: "error" });
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Registration failed");

      await Swal.fire({ title: "Success!", text: `User ${data.email} registered.`, icon: "success" });
      setForm({ email: "", password: "", confirmPassword: "" });

      // Navigate to login page after registration
      router.push("/login");
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: "#F2EDD1",
        position: "relative",
      }}
    >
      {/* Top Bar */}
      <Box sx={{ width: "100%", height: 130, bgcolor: "#689B8A" }} />

      {/* X Button */}
      <IconButton
        onClick={() => router.push("/login")}
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          color: "#280A3E",
          bgcolor: "#F9CB99",
          "&:hover": { bgcolor: "#e0b87a" },
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>

      {/* Form Container */}
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "calc(100vh - 130px)",
        }}
      >
        <Typography variant="h3" sx={{ mb: 5, fontWeight: 700 }}>
          Register
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 500 }}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              helperText="Min 10 characters with at least 1 number"
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="contained" disabled={loading} sx={{ py: 2, fontSize: 18 }}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
}
