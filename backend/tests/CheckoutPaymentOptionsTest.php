<?php

$paymentController = file_get_contents(__DIR__ . '/../app/Http/Controllers/PaymentController.php');
$routes = file_get_contents(__DIR__ . '/../routes/api.php');
$checkout = file_get_contents(__DIR__ . '/../../frontend/src/utils/checkout.js');
$drawer = file_get_contents(__DIR__ . '/../../frontend/src/components/CartDrawer.jsx');
$orderManagement = file_get_contents(__DIR__ . '/../../frontend/src/pages/manager/OrderManagement.jsx');
$orderDetailModal = file_get_contents(__DIR__ . '/../../frontend/src/components/OrderDetailModal.jsx');

$expectations = [
    [$paymentController, 'public function createInPerson', 'PaymentController should create pending in-person payments.'],
    [$paymentController, "'provider' => 'in_person'", 'In-person payments should store provider metadata.'],
    [$paymentController, 'public function updateStatus', 'PaymentController should allow manager/admin payment status updates.'],
    [$paymentController, "Only in-person payments can be updated manually", 'Manual status updates should be limited to in-person payments.'],
    [$routes, "Route::post('/payments/in-person'", 'API should expose in-person payment creation.'],
    [$routes, "Route::put('/payments/{payment}/status'", 'API should expose manager/admin payment status update.'],
    [$checkout, 'checkoutWithPaymentMethod', 'Frontend checkout helper should support payment method choices.'],
    [$checkout, "paymentMethod === 'wallet'", 'Checkout helper should support wallet payments.'],
    [$checkout, "paymentMethod === 'in_person'", 'Checkout helper should support in-person payments.'],
    [$drawer, 'paymentMethod', 'Cart drawer should render payment method choices.'],
    [$drawer, 'Pay with wallet', 'Cart drawer should offer wallet payment.'],
    [$drawer, 'Pay with Chapa', 'Cart drawer should offer Chapa payment.'],
    [$drawer, 'Pay in person', 'Cart drawer should offer in-person payment.'],
    [$orderManagement, 'updatePaymentStatus', 'Manager order page should update payment status.'],
    [$orderDetailModal, 'Mark paid', 'Order detail modal should let managers mark in-person payment as paid.'],
];

foreach ($expectations as [$contents, $needle, $message]) {
    if (!str_contains($contents, $needle)) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Checkout payment options wiring is present." . PHP_EOL;
