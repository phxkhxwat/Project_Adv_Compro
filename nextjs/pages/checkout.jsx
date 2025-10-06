import { useState, useEffect } from "react";
import { Box, Button, Typography, IconButton, Stack, TextField, Paper, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { useRouter } from "next/router";

// Helper component for a modern cart item card
const CartItemCard = ({ item, handleDeleteItem, handleQtyChange }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2,
      mb: 1.5,
      backgroundColor: '#FFF',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    }}
  >
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
        {item.name || `Drone ID: ${item.stock_id}`}
      </Typography>
      <Typography variant="body2" sx={{ color: '#689B8A' }}>
        Price: {item.price.toLocaleString()} baht
      </Typography>
    </Box>

    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        type="number"
        value={item.quantity}
        onChange={e => handleQtyChange(item.stock_id, parseInt(e.target.value))}
        size="small"
        sx={{ width: 70 }}
        inputProps={{ min: 1, style: { padding: '4px 8px' } }}
      />
      <Box sx={{ minWidth: 100, textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 700, color: '#D55252' }}>
          {(item.price * item.quantity).toLocaleString()} baht
        </Typography>
      </Box>
      <IconButton 
        onClick={() => handleDeleteItem(item.stock_id)} 
        size="small"
        sx={{ color: '#D55252', '&:hover': { bgcolor: 'rgba(213, 82, 82, 0.1)' } }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  </Box>
);

export default function Checkout() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const total_price = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    // Ensure that if a name is missing, we use a placeholder for the UI
    const cartWithNames = storedCart.map(item => ({
        ...item,
        name: item.name || `Drone Stock ${item.stock_id}`
    }));
    setCart(cartWithNames);

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Fetch address from backend if user exists
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      fetch(`http://localhost:8000/api/address/${userObj.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) setAddress(data[0]); // Use first address
        })
        .catch(err => console.error(err));
    }
  }, []);

  const handleDeleteItem = (stock_id) => {
    const updatedCart = cart.filter(item => item.stock_id !== stock_id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleQtyChange = (stock_id, qty) => {
    if (qty < 1 || isNaN(qty)) return;
    const updatedCart = cart.map(item => item.stock_id === stock_id ? { ...item, quantity: qty } : item);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleCheckout = async () => {
    if (!user) {
      Swal.fire({ title: "Login Required", text: "Please log in to complete your order.", icon: "warning" });
      router.push("/login");
      return;
    }
    if (!address) {
        Swal.fire({ title: "Address Required", text: "Please set your delivery address in your profile.", icon: "warning" });
        router.push("/profile");
        return;
    }

    if (cart.length === 0) {
      Swal.fire({ title: "Error", text: "Cart is empty!", icon: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          address_id: address.id,
          total_price,
          items: cart.map(item => ({
            stock_id: item.stock_id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || "Checkout failed");

      // Clear cart
      localStorage.removeItem("cart");
      setCart([]);
      setOrderSuccess(true);
      setOrderId(result.order_id);

    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 1. Order Success View (Centered)
  if (orderSuccess) {
    return (
      <Box sx={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center", textAlign: "center", backgroundColor: "#F2EDD1" }}>
        <Box sx={{ p: 5, backgroundColor: '#FFF', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <Typography variant="h2" sx={{ fontWeight: 700, color: "#D55252", mb: 4 }}>Order Confirmed!</Typography>
          <Typography variant="h5" sx={{ mb: 6, color: "#280A3E" }}>Your Order ID: **{orderId}**</Typography>
          <Button 
            onClick={() => router.push("/")} 
            variant="contained"
            sx={{ 
                borderRadius: "30px", 
                backgroundColor: "#280A3E", 
                py: 2, 
                px: 5, 
                fontSize: 20, 
                fontWeight: 700, 
                "&:hover": { backgroundColor: "#3b1160" } 
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    );
  }

  // 2. Main Checkout View (Centered)
  return (
    <Box 
        sx={{ 
            display: "flex", 
            height: "100vh", 
            width: '100vw',
            justifyContent: "center", 
            alignItems: "center", 
            backgroundColor: "#F2EDD1" 
        }}
    >
      <IconButton 
        onClick={() => router.push("/")} 
        sx={{ 
            position: "absolute", 
            top: 30, 
            right: 30, 
            color: "#280A3E", 
            bgcolor: "#F9CB99", 
            "&:hover": { bgcolor: "#e0b87a" }, 
            zIndex: 10 
        }}
      >
        <CloseIcon fontSize="large" />
      </IconButton>

      <Paper elevation={10} 
        sx={{ 
            width: '90%', 
            maxWidth: 1000, 
            p: { xs: 3, sm: 6 }, 
            borderRadius: '20px', 
            backgroundColor: '#FFF',
            maxHeight: '90vh',
            overflowY: 'auto',
        }}
      >
        <Typography 
            variant="h2" 
            sx={{ 
                fontSize: { xs: 40, sm: 56 }, 
                fontWeight: 800, 
                color: "#280A3E", 
                mb: 4, 
                textAlign: 'center' 
            }}
        >
            CONFIRM YOUR ORDER
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* User and Address Info Section */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mb={4}>
            {/* User Status */}
            <Box sx={{ flex: 1, p: 3, bgcolor: '#F9F9F9', borderRadius: '10px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#689B8A' }}>
                    Customer
                </Typography>
                {user ? (
                    <Typography>{user.name} ({user.email})</Typography>
                ) : (
                    <Typography color="error">Not logged in. Please <a href="/login">login</a>.</Typography>
                )}
            </Box>

            {/* Delivery Address */}
            <Box sx={{ flex: 1, p: 3, bgcolor: '#F9F9F9', borderRadius: '10px' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#689B8A' }}>
                    Delivery Address
                </Typography>
                {address ? (
                    <Typography>
                        {address.address_line_1}, {address.city}, {address.postal_code}
                    </Typography>
                ) : (
                    <Typography color="error">No address found. Please set it in your <a href="/profile">profile</a>.</Typography>
                )}
            </Box>
        </Stack>

        {/* Cart Items Section */}
        {cart.length === 0 ? (
          <Typography variant="h5" sx={{ textAlign: 'center', py: 5 }}>Your cart is empty.</Typography>
        ) : (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#280A3E", mb: 2 }}>
                Items ({cart.length})
            </Typography>
            {cart.map(item => (
              <CartItemCard 
                key={item.stock_id}
                item={item}
                handleDeleteItem={handleDeleteItem}
                handleQtyChange={handleQtyChange}
              />
            ))}

            <Divider sx={{ my: 3 }} />

            {/* Total and Checkout Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#280A3E' }}>
                    TOTAL:
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#D55252' }}>
                    {total_price.toLocaleString()} baht
                </Typography>
            </Box>

            <Button
                onClick={handleCheckout}
                variant="contained"
                fullWidth
                sx={{ 
                    borderRadius: "30px", 
                    backgroundColor: "#D55252", 
                    py: 2, 
                    mt: 3,
                    fontSize: 24, 
                    fontWeight: 700, 
                    "&:hover": { backgroundColor: "#b03f3f" } 
                }}
                disabled={loading || !user || !address || cart.length === 0}
            >
                {loading ? "Processing Order..." : "CONFIRM & PAY"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}