import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/AuthContext';
import "../css/GroceryList.css";

const GroceryList = () => {
    const [users, setUsers] = useState([]);
    const [paymentLoading, setPaymentLoading] = useState({});
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);
    // Track locally paid items to maintain state
    const [locallyPaidItems, setLocallyPaidItems] = useState(new Set());
    
    // Get both isAdmin and currentUser from Auth context
    const { isAdmin, currentUser } = useAuth();

    useEffect(() => {
        console.log("Component mounted with admin status:", isAdmin);
        console.log("Current user:", currentUser);
        
        // Fetch grocery items - no need to wait for admin check
        fetchGroceryItems();
        
        // Fetch user's payment history if logged in
        if (currentUser) {
            fetchPaymentHistory();
        }
    }, [isAdmin, currentUser]); // Watch for changes in both isAdmin and currentUser

    const fetchGroceryItems = () => {
        axios.get('http://localhost:3001')
            .then(result => {
                console.log("Data received:", result.data);
                setUsers(result.data);
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                alert("Error loading grocery items");
            });
    };

    const fetchPaymentHistory = async () => {
        // Use authToken consistently as in your AuthContext
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:3001/api/payment-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 8000 // 8 second timeout
            });
            
            if (response.data.success) {
                setPaymentHistory(response.data.payments);
                console.log("Payment history fetched:", response.data.payments);
                
                // Update locally paid items based on backend data
                const paidItemIds = new Set();
                response.data.payments.forEach(payment => {
                    if (payment.status === 'completed') {
                        const itemId = payment.item_id?._id || payment.item_id;
                        if (itemId) {
                            paidItemIds.add(itemId.toString());
                        }
                    }
                });
                setLocallyPaidItems(paidItemIds);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            // Don't show error to user - they can still see their local payment status
            if (error.code === 'ECONNABORTED') {
                console.log('Payment history fetch timed out');
            }
        }
    };

    const handleDelete = (id) => {
        // Use authToken consistently
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Please login to perform this action');
            return;
        }

        if (window.confirm('Are you sure you want to delete this item?')) {
            axios.delete('http://localhost:3001/deleteItem/' + id, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    console.log(res);
                    fetchGroceryItems(); // Refresh the list instead of reloading page
                })
                .catch(err => {
                    console.error(err);
                    if (err.response?.status === 403) {
                        alert('You are not authorized to delete items');
                    } else {
                        alert('Error deleting item');
                    }
                });
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayNow = async (item) => {
        setPaymentLoading(prev => ({ ...prev, [item._id]: true }));

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setPaymentLoading(prev => ({ ...prev, [item._id]: false }));
            return;
        }

        const totalAmount = item.price * item.quantity;
        
        const options = {
            key: 'rzp_test_FSW72bhFCYhm4D', // Replace with your actual Razorpay key
            amount: totalAmount * 100, // Razorpay expects amount in paisa
            currency: 'INR',
            name: 'Monthly Provision',
            description: `Payment for ${item.name}`,
            image: 'https://example.com/your_logo', // Optional
            handler: async function (response) {
                // Payment successful
                console.log('Payment Success:', response);
                
                // IMMEDIATELY mark item as paid locally (this persists)
                setLocallyPaidItems(prev => {
                    const newSet = new Set(prev);
                    newSet.add(item._id.toString());
                    console.log('Item marked as locally paid:', item._id);
                    return newSet;
                });
                
                // Create a new payment record for payment history
                const newPayment = {
                    _id: `temp_${Date.now()}`, // Unique temporary ID
                    item_id: item._id,
                    item_name: item.name,
                    amount: totalAmount,
                    payment_id: response.razorpay_payment_id,
                    status: 'completed',
                    timestamp: new Date().toISOString()
                };
                
                // Update payment history for the history table
                setPaymentHistory(prevHistory => [...prevHistory, newPayment]);
                
                // Show success message
                alert(`✅ Payment successful!\nPayment ID: ${response.razorpay_payment_id}\nAmount: ₹${totalAmount.toFixed(2)}`);
                
                // Reset loading state
                setPaymentLoading(prev => ({ ...prev, [item._id]: false }));
                
                // Save to backend in background (don't affect UI state)
                savePaymentToBackend(item, response)
                    .then(() => {
                        console.log('Payment saved to backend successfully');
                        // Optional: Refresh payment history after successful save
                        // But don't remove the locally paid status
                        setTimeout(() => {
                            fetchPaymentHistoryQuietly();
                        }, 2000);
                    })
                    .catch(error => {
                        console.error('Error saving to backend:', error);
                        // Payment is still marked as paid locally
                        console.log('Backend save failed, but item remains marked as paid locally');
                    });
            },
            prefill: {
                name: currentUser?.name || 'Customer',
                email: currentUser?.email || 'customer@example.com',
                contact: '9999999999',
            },
            notes: {
                item_id: item._id,
                item_name: item.name
            },
            theme: {
                color: '#3399cc',
            },
            modal: {
                ondismiss: function () {
                    console.log('Payment modal closed');
                    setPaymentLoading(prev => ({ ...prev, [item._id]: false }));
                },
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
            alert(`❌ Payment failed!\nError: ${response.error.description}`);
            console.error('Payment failed:', response.error);
            setPaymentLoading(prev => ({ ...prev, [item._id]: false }));
        });
        
        paymentObject.open();
    };

    // Fetch payment history without affecting locally paid items
    const fetchPaymentHistoryQuietly = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:3001/api/payment-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 8000
            });
            
            if (response.data.success) {
                setPaymentHistory(response.data.payments);
                console.log("Payment history quietly updated");
            }
        } catch (error) {
            console.error('Error quietly fetching payment history:', error);
        }
    };

    const savePaymentToBackend = async (item, paymentResponse) => {
        // Consistently use authToken
        const token = localStorage.getItem('authToken');
        
        try {
            const response = await axios.post('http://localhost:3001/api/save-payment', {
                item_id: item._id,
                payment_id: paymentResponse.razorpay_payment_id,
                amount: item.price * item.quantity,
                item_name: item.name,
                quantity: item.quantity,
                timestamp: new Date(),
                status: 'completed'
            }, {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {},
                timeout: 10000 // 10 second timeout
            });
            
            console.log('Payment details saved to backend successfully');
            return response;
        } catch (error) {
            console.error('Error saving payment details:', error);
            // Don't throw the error - let the UI update succeed regardless
            if (error.code === 'ECONNABORTED') {
                console.log('Backend request timed out, but payment is recorded locally');
            } else if (error.response) {
                console.log('Backend responded with error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.log('No response from backend, but payment is recorded locally');
            }
            return null; // Return null instead of throwing
        }
    };

    // Check if item is paid (combining backend data and local state)
    const isItemPaid = (itemId) => {
        const itemIdString = itemId.toString();
        
        // First check if it's locally marked as paid (this takes precedence)
        if (locallyPaidItems.has(itemIdString)) {
            console.log(`Item ${itemIdString} is locally marked as paid`);
            return true;
        }
        
        // Then check backend payment history
        const isPaidInHistory = paymentHistory.some(payment => {
            const paymentItemId = payment.item_id?._id || payment.item_id;
            const paymentItemIdString = paymentItemId?.toString();
            
            const matches = paymentItemIdString === itemIdString && payment.status === 'completed';
            return matches;
        });
        
        console.log(`Checking payment for item ${itemIdString}: locally=${locallyPaidItems.has(itemIdString)}, backend=${isPaidInHistory}`);
        
        return isPaidInHistory;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const togglePaymentHistory = () => {
        setShowPaymentHistory(!showPaymentHistory);
    };

    // Debug admin status in render
    console.log("Rendering with isAdmin:", isAdmin);
    console.log("Payment history length:", paymentHistory.length);
    console.log("Locally paid items:", Array.from(locallyPaidItems));  

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Monthly Provision List</h3>
                <div>
                    {/* Debug message - remove in production */}
                    <div className="small text-muted mb-2">
                        {isAdmin ? "Admin mode active" : "Regular user mode"}
                    </div>
                    
                    {!isAdmin && currentUser && (
                        <button 
                            className="btn btn-info me-2" 
                            onClick={togglePaymentHistory}
                        >
                            {showPaymentHistory ? 'Hide' : 'Show'} Payment History
                        </button>
                    )}
                    {isAdmin && (
                        <Link to="/contribute/grocery/create" className="btn btn-success">
                            Add New Item +
                        </Link>
                    )}
                </div>
            </div>

            {/* Payment History Section */}
            {showPaymentHistory && !isAdmin && currentUser && (
                <div className="card mb-4">
                    <div className="card-header">
                        <h5>Your Payment History</h5>
                    </div>
                    <div className="card-body">
                        {paymentHistory.length === 0 ? (
                            <p className="text-muted">No payments made yet.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Item</th>
                                            <th>Amount</th>
                                            <th>Payment ID</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentHistory.map(payment => (
                                            <tr key={payment._id}>
                                                <td>{formatDate(payment.timestamp || payment.created_at)}</td>
                                                <td>{payment.item_name}</td>
                                                <td>₹{payment.amount.toFixed(2)}</td>
                                                <td>
                                                    <small className="text-muted">
                                                        {payment.payment_id}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        payment.status === 'completed' ? 'bg-success' :
                                                        payment.status === 'failed' ? 'bg-danger' :
                                                        'bg-warning'
                                                    }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grocery Items Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className='table table-striped'>
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading grocery items...</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => {
                                        const totalPrice = user.price * user.quantity;
                                        const isPaid = isItemPaid(user._id);
                                        
                                        console.log(`Rendering item ${user._id} (${user.name})`);
                                        console.log(`isPaid result: ${isPaid}`);
                                        
                                        return (
                                            <tr key={user._id}>
                                                <td>{index + 1}</td>
                                                <td>{user.name}</td>
                                                <td>₹{user.price}</td>
                                                <td>{user.quantity}</td>
                                                <td>₹{totalPrice.toFixed(2)}</td>
                                                <td>
                                                    {isPaid ? (
                                                        <span className="badge bg-success">✓ Paid</span>
                                                    ) : (
                                                        <span className="badge bg-warning">Pending</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {isAdmin ? (
                                                        <div className="btn-group" role="group">
                                                            <Link 
                                                                to={`/contribute/grocery/update/${user._id}`} 
                                                                className='btn btn-success btn-sm'
                                                            >
                                                                Update
                                                            </Link>
                                                            <button 
                                                                className='btn btn-danger btn-sm' 
                                                                onClick={() => handleDelete(user._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        isPaid ? (
                                                            <span className="text-success fw-bold">✓ Payment Complete</span>
                                                        ) : (
                                                            <button 
                                                                className='btn btn-primary btn-sm' 
                                                                onClick={() => handlePayNow(user)}
                                                                disabled={paymentLoading[user._id]}
                                                            >
                                                                {paymentLoading[user._id] ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                        Processing...
                                                                    </>
                                                                ) : (
                                                                    'Pay Now'
                                                                )}
                                                            </button>
                                                        )
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            {users.length > 0 && (
                <div className="card mt-4">
                    <div className="card-body">
                        <h5 className="card-title">Summary</h5>
                        <div className="row">
                            <div className="col-md-3">
                                <p><strong>Total Items:</strong> {users.length}</p>
                            </div>
                            <div className="col-md-3">
                                <p><strong>Total Amount:</strong> ₹{users.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
                            </div>
                            {!isAdmin && currentUser && (
                                <>
                                    <div className="col-md-3">
                                        <p><strong>Paid Items:</strong> {users.filter(item => isItemPaid(item._id)).length}</p>
                                    </div>
                                    <div className="col-md-3">
                                        <p><strong>Amount Paid:</strong> ₹{users.filter(item => isItemPaid(item._id)).reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroceryList;