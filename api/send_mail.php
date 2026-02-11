<?php
header('Content-Type: application/json');

// Charger la config
$config = require_once 'config.php';

// Fonction de réponse standard
function sendResponse($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method Not Allowed', 405);
}

// Récupérer les données JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    // Fallback pour form-data classique
    $input = $_POST;
}

// Validation des champs
$name = filter_var($input['name'] ?? '', FILTER_SANITIZE_STRING);
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$message = filter_var($input['message'] ?? '', FILTER_SANITIZE_STRING);
$recaptchaToken = $input['recaptcha_token'] ?? '';

if (!$name || !$email || !$message) {
    sendResponse(false, 'Veuillez remplir tous les champs obligatoires.', 400);
}

// Validation reCAPTCHA (Server-side)
if (!empty($config['recaptcha_secret']) && $config['recaptcha_secret'] !== 'YOUR_RECAPTCHA_SECRET_KEY') {
    if (!$recaptchaToken) {
        sendResponse(false, 'Validation captcha manquante.', 400);
    }

    $verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    $data = [
        'secret' => $config['recaptcha_secret'],
        'response' => $recaptchaToken
    ];

    $options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        ]
    ];

    $context = stream_context_create($options);
    $result = file_get_contents($verifyUrl, false, $context);
    $jsonResult = json_decode($result, true);

    if (!$jsonResult['success']) {
        sendResponse(false, 'Echec de la validation captcha.', 400);
    }
}

// Préparation de l'email
$subject = "Nouveau contact de $name - LogoLoom";
$body = "Nom: $name\nEmail: $email\n\nMessage:\n$message";
$headers = "From: " . $config['smtp_from'] . "\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Envoi
if (mail($config['recipient_email'], $subject, $body, $headers)) {
    sendResponse(true, 'Message envoyé avec succès.');
} else {
    sendResponse(false, 'Erreur lors de l\'envoi du message.', 500);
}
