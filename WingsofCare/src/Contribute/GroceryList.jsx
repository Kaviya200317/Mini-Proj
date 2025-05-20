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
    const { isAdmin, checkAdminStatus } = useAuth();

    useEffect(() => {
        // Check admin status
        const verifyAdminStatus = async () => {
            try {
                await checkAdminStatus();
            } catch (err) {
                console.error("Error verifying admin status:", err);
            }
        };
        
        verifyAdminStatus();
        
        // Fetch grocery items
        fetchGroceryItems();
        
        // Fetch user's payment history if logged in
        const token = localStorage.getItem('token');
        if (token) {
            fetchPaymentHistory();
        }
    }, [checkAdminStatus]);

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
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:3001/api/payment-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setPaymentHistory(response.data.payments);
                console.log("Payment history fetched:", response.data.payments); // Debug log
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
        }
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');
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
                
                try {
                    // Save payment info to backend first
                    await savePaymentToBackend(item, response);
                    
                    // Then refresh payment history to get updated status
                    await fetchPaymentHistory();
                    
                    // Show success message
                    alert(`✅ Payment successful!\nPayment ID: ${response.razorpay_payment_id}\nAmount: ₹${totalAmount.toFixed(2)}`);
                    
                    // Force re-render by updating the users state to trigger re-evaluation
                    setUsers(prevUsers => [...prevUsers]);
                    
                } catch (error) {
                    console.error('Error processing payment:', error);
                    alert('Payment completed but there was an issue updating the status. Please refresh the page.');
                } finally {
                    setPaymentLoading(prev => ({ ...prev, [item._id]: false }));
                }
            },
            prefill: {
                name: 'Customer',
                email: 'customer@example.com',
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

    const savePaymentToBackend = async (item, paymentResponse) => {
        const token = localStorage.getItem('token');
        
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
                } : {}
            });
            
            console.log('Payment details saved to backend successfully');
            return response;
        } catch (error) {
            console.error('Error saving payment details:', error);
            throw error;
        }
    };

    // FIXED: Check if item is already paid by current user
    const isItemPaid = (itemId) => {
        const isPaid = paymentHistory.some(payment => {
            // Convert both to string for comparison
            const paymentItemId = payment.item_id?._id || payment.item_id;
            const itemIdString = itemId.toString();
            const paymentItemIdString = paymentItemId?.toString();
            
            console.log('Comparing:', { paymentItemIdString, itemIdString, status: payment.status }); // Debug log
            
            return paymentItemIdString === itemIdString && payment.status === 'completed';
        });
        
        console.log(`Item ${itemId} is paid:`, isPaid); // Debug log
        return isPaid;
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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Monthly Provision List</h3>
                <div>
                    {!isAdmin && (
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
            {showPaymentHistory && !isAdmin && (
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
                                        return (
                                            <tr key={user._id}>
                                                <td>{index + 1}</td>
                                                <td>{user.name}</td>
                                                <td>{user.price}</td>
                                                <td>{user.quantity}</td>
                                                <td>{totalPrice.toFixed(2)}</td>
                                                <td>
                                                    {isPaid ? (
                                                        <span className="badge bg-success">Paid</span>
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
                                                            <span className="text-success fw-bold">✓ Paid</span>
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
                            {!isAdmin && (
                                <>
                                    <div className="col-md-3">
                                        <p><strong>Paid Items:</strong> {paymentHistory.filter(p => p.status === 'completed').length}</p>
                                    </div>
                                    <div className="col-md-3">
                                        <p><strong>Amount Paid:</strong> ₹{paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</p>
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