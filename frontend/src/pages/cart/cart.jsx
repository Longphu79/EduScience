import { useCart } from "../../features/cart/state/cartContext";
import { Link } from "react-router-dom";

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotalPrice } =
        useCart();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

            {cartItems.length === 0 ? (
                <div className="bg-white p-10 rounded-xl shadow text-center">
                    <p className="text-gray-500 mb-6 text-lg">
                        Your cart is empty.
                    </p>

                    <Link
                        to="/"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Continue Learning
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow p-6 space-y-6">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center border-b pb-4"
                            >
                                <div>
                                    <h2 className="font-semibold text-lg">
                                        {item.title}
                                    </h2>
                                    <p className="text-gray-500">
                                        {item.price.toLocaleString()} VND
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const value = Number(
                                                e.target.value,
                                            );
                                            if (value >= 1) {
                                                updateQuantity(item.id, value);
                                            }
                                        }}
                                        className="w-16 border rounded px-2 py-1 text-center appearance-none"
                                    />

                                    {/* Icon Remove */}
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-black hover:text-red-600 transition text-xl font-bold"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow p-6 h-fit">
                        <h2 className="text-xl font-semibold mb-6">
                            Order Summary
                        </h2>

                        <div className="flex justify-between mb-4">
                            <span>Total:</span>
                            <span className="font-bold text-lg">
                                {getTotalPrice().toLocaleString()} VND
                            </span>
                        </div>

                        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
