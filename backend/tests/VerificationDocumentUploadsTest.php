<?php

$controller = file_get_contents(__DIR__ . '/../app/Http/Controllers/UserController.php');
$model = file_get_contents(__DIR__ . '/../app/Models/User.php');
$profile = file_get_contents(__DIR__ . '/../../frontend/src/pages/member/Profile.jsx');
$admin = file_get_contents(__DIR__ . '/../../frontend/src/pages/admin/UserManagement.jsx');
$migrations = implode("\n", array_map('file_get_contents', glob(__DIR__ . '/../database/migrations/*.php')));

$expectations = [
    [$controller, "'coupon_id_image' => 'required|file|mimes:jpg,jpeg,png,webp,heic,heif,pdf|max:10240'", 'Backend should require coupon ID image upload.'],
    [$controller, "'coupon_id_image_path' => \$couponPath", 'Backend should persist coupon ID image path.'],
    [$controller, "'kebele_id' => [", 'Backend should not require typed kebele_id during verification.', false],
    [$controller, "'coupon_id' => 'required|string|max:255'", 'Backend should not require typed coupon_id during verification.', false],
    [$model, "'coupon_id_image_path'", 'User model should allow coupon ID image path assignment.'],
    [$migrations, "string('coupon_id_image_path')", 'Migration should add coupon_id_image_path.'],
    [$profile, 'name="coupon_id_image"', 'Verification form should include coupon image upload.'],
    [$profile, 'Kebele ID / Fayda ID', 'Verification form should relabel identity document upload.'],
    [$profile, 'name="kebele_id"', 'Verification form should remove typed Kebele ID field.', false],
    [$profile, 'name="coupon_id"', 'Verification form should remove typed Coupon ID field.', false],
    [$admin, 'selectedCouponImageUrl', 'Admin review should expose coupon image URL.'],
];

foreach ($expectations as $expectation) {
    [$contents, $needle, $message] = $expectation;
    $shouldContain = $expectation[3] ?? true;
    $contains = str_contains($contents, $needle);

    if ($shouldContain !== $contains) {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
}

echo "Verification document uploads are wired correctly." . PHP_EOL;