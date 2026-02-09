<?php
// src/api/send_mail.php

// Prevent direct access/output
header('Content-Type: application/json');

// Configuration
$RECAPTCHA_SECRET = "6Le5G2AsAAAAAL9rWT-m0l9tE-omevzdcL2drJ1w"; // From user screenshot
$TO_EMAIL = "Montano.mickael@gmail.com"; // From user screenshot
$FROM_EMAIL = "no-reply@logoloom.fr";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

// 1. Verify Recaptcha
$recaptcha_response = $_POST['g-recaptcha-response'] ?? '';
if (empty($recaptcha_response)) {
    // For development/preview, we can't test this easily without a valid key pair.
    // If testing locally without captcha, remove this block.
    // But for production, this is required.
    echo json_encode(["success" => false, "message" => "Veuillez valider le captcha."]);
    exit;
}

$verify_url = "https://www.google.com/recaptcha/api/siteverify";
$data = [
    'secret' => $RECAPTCHA_SECRET,
    'response' => $recaptcha_response
];

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($data)
    ]
];
$context = stream_context_create($options);
$result = file_get_contents($verify_url, false, $context);
$json = json_decode($result);

if (!$json->success) {
    echo json_encode(["success" => false, "message" => "Echec validation Captcha."]);
    exit;
}

// 2. Sanitize Inputs
$name = strip_tags(trim($_POST["name"] ?? ''));
$email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
$service = strip_tags(trim($_POST["service"] ?? ''));
$message = strip_tags(trim($_POST["message"] ?? ''));

if (empty($name) || empty($email) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Champs invalides."]);
    exit;
}

// 3. Handle File Uploads & Build Multipart Email
$boundary = md5(time());
$subject = "Contact LogoLoom : $service - $name";

// Headers
$headers = "From: $FROM_EMAIL\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

// Body (Text)
$body = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$body .= "Nom: $name\n";
$body .= "Email: $email\n";
$body .= "Sujet: $service\n\n";
$body .= "Message:\n$message\n\n";

// Attachments
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $file_tmp = $_FILES['file']['tmp_name'];
    $file_name = $_FILES['file']['name'];
    $file_size = $_FILES['file']['size'];
    $file_type = $_FILES['file']['type'];

    // Max 5MB
    if ($file_size > 5 * 1024 * 1024) {
        echo json_encode(["success" => false, "message" => "Fichier trop lourd (Max 5MB)."]);
        exit;
    }

    // Check allowed extensions
    $allowed = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        echo json_encode(["success" => false, "message" => "Format de fichier non supporté ($ext)."]);
        exit;
    }

    $content = file_get_contents($file_tmp);
    $content = chunk_split(base64_encode($content));

    $body .= "--$boundary\r\n";
    $body .= "Content-Type: application/octet-stream; name=\"$file_name\"\r\n";
    $body .= "Content-Disposition: attachment; filename=\"$file_name\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= $content . "\r\n";
}

$body .= "--$boundary--";

// 4. Send
if (mail($TO_EMAIL, $subject, $body, $headers)) {
    echo json_encode(["success" => true, "message" => "Email envoyé."]);
} else {
    echo json_encode(["success" => false, "message" => "Erreur technique lors de l'envoi."]);
}
?>
