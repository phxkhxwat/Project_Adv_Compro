import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Button, TextField, Stack, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ street: "", city: "", postal_code: "", country: "" });
  const [editMode, setEditMode] = useState(false);
  const [originalAddress, setOriginalAddress] = useState(null);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (!localUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(localUser);
    setUser(parsedUser);
    fetchAddresses(parsedUser.user_id);
  }, [router]);

  const fetchAddresses = async (user_id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/address/${user_id}`);
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      setAddresses(data);

      if (data.length > 0) {
        const addr = data[0];
        setNewAddress({
          street: addr.street,
          city: addr.city,
          postal_code: addr.postal_code,
          country: addr.country,
        });
        setOriginalAddress(addr);
        setEditMode(false); // always start in read-only
      } else {
        setEditMode(true); // new user: start in edit mode
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    if (originalAddress) {
      setNewAddress({
        street: originalAddress.street,
        city: originalAddress.city,
        postal_code: originalAddress.postal_code,
        country: originalAddress.country,
      });
      setEditMode(false);
    } else {
      // New user: clear fields
      setNewAddress({ street: "", city: "", postal_code: "", country: "" });
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!/^\d{5}$/.test(newAddress.postal_code)) {
        Swal.fire("Error", "Postal code must be exactly 5 digits", "error");
        return;
      }

      const payload = { ...newAddress, user_id: user.user_id };

      let res;
      if (originalAddress) {
        // Update existing
        res = await fetch(`http://localhost:8000/api/address/${user.user_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new address
        res = await fetch(`http://localhost:8000/api/address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save address");
      const updated = await res.json();
      setAddresses([updated]);
      setOriginalAddress(updated);
      setEditMode(false);
      Swal.fire("Success", "Address saved!", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  if (!user) return null;

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #F2EDD1 0%, #F9F1D3 100%)",
      px: 4
    }}>
      <Paper elevation={8} sx={{ width: "100%", maxWidth: 600, p: 6, borderRadius: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: 48, fontWeight: 700, color: "#280A3E" }}>
              PROFILE
            </Typography>
            <Box sx={{ height: 4, width: 80, bgcolor: "#280A3E", mt: 1, borderRadius: 2 }} />
          </Box>
          <IconButton
            onClick={() => router.push("/")}
            sx={{ color: "#280A3E", bgcolor: "#F9CB99", "&:hover": { bgcolor: "#e0b87a" } }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* Username */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Username</Typography>
        <Typography variant="h6" sx={{ mb: 4, color: "#280A3E", fontWeight: 600 }}>{user.email}</Typography>

        {/* Address Heading */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Address</Typography>

        {/* Address Form */}
        <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: "#FFF", mb: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Street"
              value={newAddress.street}
              onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
              fullWidth
              InputProps={{ readOnly: !editMode }}
              sx={{ "& .MuiInputLabel-root": { fontWeight: 600 }, "& .MuiOutlinedInput-root.Mui-focused": { borderColor: "#280A3E", boxShadow: "0 0 5px rgba(40,10,62,0.3)" } }}
            />
            <TextField
              label="City"
              value={newAddress.city}
              onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
              fullWidth
              InputProps={{ readOnly: !editMode }}
              sx={{ "& .MuiInputLabel-root": { fontWeight: 600 }, "& .MuiOutlinedInput-root.Mui-focused": { borderColor: "#280A3E", boxShadow: "0 0 5px rgba(40,10,62,0.3)" } }}
            />
            <TextField
              label="Postal Code"
              value={newAddress.postal_code}
              onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })}
              fullWidth
              InputProps={{ readOnly: !editMode }}
              sx={{ "& .MuiInputLabel-root": { fontWeight: 600 }, "& .MuiOutlinedInput-root.Mui-focused": { borderColor: "#280A3E", boxShadow: "0 0 5px rgba(40,10,62,0.3)" } }}
            />
            <TextField
              label="Country"
              value={newAddress.country}
              onChange={e => setNewAddress({ ...newAddress, country: e.target.value })}
              fullWidth
              InputProps={{ readOnly: !editMode }}
              sx={{ "& .MuiInputLabel-root": { fontWeight: 600 }, "& .MuiOutlinedInput-root.Mui-focused": { borderColor: "#280A3E", boxShadow: "0 0 5px rgba(40,10,62,0.3)" } }}
            />

            {/* Buttons */}
            <Stack direction="row" spacing={2} mt={2}>
              {!editMode && (
                <Button
                  variant="contained"
                  onClick={handleEdit}
                  sx={{ borderRadius: "30px", backgroundColor: "#280A3E", py: 1.5, fontSize: 16, fontWeight: 700, "&:hover": { backgroundColor: "#3b1160" } }}
                >
                  Edit
                </Button>
              )}
              {editMode && (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSaveAddress}
                    sx={{ borderRadius: "30px", backgroundColor: "#280A3E", py: 1.5, fontSize: 16, fontWeight: 700, "&:hover": { backgroundColor: "#3b1160" } }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    sx={{ borderRadius: "30px", py: 1.5, fontSize: 16, fontWeight: 700 }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Paper>
    </Box>
  );
}
