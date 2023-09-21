<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use DateTime, DateTimeZone, DateInterval;
/*use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;*/

class AuthController extends AbstractController
{
    private $entityManager;
    private $passwordEncoder;
    private $JWTManager;
    private $JWTEncoder;

    public function __construct(EntityManagerInterface $entityManager, UserPasswordEncoderInterface $passwordEncoder, JWTTokenManagerInterface $JWTManager, JWTEncoderInterface $JWTEncoder/*, MailerInterface $mailer*/) {
        $this->entityManager = $entityManager;
        $this->passwordEncoder = $passwordEncoder;
        $this->JWTManager = $JWTManager;
        $this->JWTEncoder = $JWTEncoder;
        //$this->mailer = $mailer;
    }

    /**
     * @Route("/api/login", name="api_login", methods={"POST"})
     */
    public function login(Request $request): JsonResponse
    {
        try {
            if(isset($request) && $request->isMethod('POST')) {
                $requestContent = $request->getContent();
                $requestData = json_decode($requestContent, true);
                if(isset($requestData['login']) && isset($requestData['password']) && isset($requestData['currentToken']) && isset($requestData['rememberMe'])) {
                    if(is_string($requestData['login']) && is_string($requestData['password']) && is_string($requestData['currentToken']) && is_bool($requestData['rememberMe'])) {
                        $login = trim($requestData['login']);
                        $password = trim($requestData['password']);
                        $currentToken = trim($requestData['currentToken']);
                        if(strlen($login) > 0 && strlen($password) > 0 && strlen($currentToken) > 0) {
                            if(strlen($password) >= 8 && strlen($password) <= 16) {
                                if(preg_match('/^[a-zA-Z0-9!@#$%^&*_.\-]+$/', $login)) {
                                    if(preg_match_all('/[!@#$%^&*_\-]/', $password) >= 2) {
                                        if(preg_match('/^[a-zA-Z0-9!@#$%^&*_\-]+$/', $password)) {
                                            if(preg_match_all('/[A-Z]/', $password) >= 1) {
                                                if($currentToken === 'undefined') {
                                                    $login = filter_var($login, FILTER_SANITIZE_STRING);
                                                    $password = filter_var($password, FILTER_SANITIZE_STRING);
                                                    $user = $this->entityManager->getRepository(User::class)->findOneBy(['login' => $login]);
                                                    if($this->passwordEncoder->isPasswordValid($user, $password)) {
                                                        if($requestData['rememberMe']) {
                                                            $payload = [
                                                                'login' => $login,
                                                                'password' => $password,
                                                                'exp' => time() + (30 * 24 * 60 * 60)
                                                            ];
                                                        } else {
                                                            $payload = [
                                                                'login' => $login,
                                                                'password' => $password,
                                                                'exp' => time() + (24 * 60 * 60)
                                                            ];
                                                        }
                                                        $token = $this->JWTManager->createFromPayload($user, $payload);
                                                        return new JsonResponse(['requestResponse' => true, 'token' => $token, 'message' => 'VALID_LOGIN']);
                                                    } else {
                                                        return new JsonResponse(['requestResponse' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
                                                    }
                                                } else {
                                                    return new JsonResponse(['requestResponse' => false, 'message' => 'LOGIN_TOKEN_ALREADY_EXISTS']);
                                                }
                                            } else {
                                                return new JsonResponse(['requestResponse' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
                                            }
                                        } else {
                                            return new JsonResponse(['requestResponse' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
                                        }
                                    } else {
                                        return new JsonResponse(['requestResponse' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
                                    }
                                } else {
                                    return new JsonResponse(['requestResponse' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
                                }
                            } else {
                                return new JsonResponse(['requestResponse' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
                            }
                        } else {
                            return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                        }
                    } else {
                        return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                    }
                } else {
                    return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                }
            } else {
                return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
            }
        } catch(\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()]);
        }
    }

    /**
     * @Route("/api/login/check-token", name="api_login_check_token", methods={"POST"})
     */
    public function checkToken(Request $request): JsonResponse
    {
        try {
            if(isset($request) && $request->isMethod('POST')) {
                $requestContent = $request->getContent();
                if(isset($requestContent) && strlen($requestContent) > 0 && $requestContent != 'undefined') {
                    if($this->isValidLoginToken($requestContent)) {
                        return new JsonResponse(['requestResponse' => true, 'message' => 'VALID_LOGIN_BY_TOKEN']);
                    } else {
                        return new JsonResponse(['requestResponse' => false, 'message' => 'ERROR']);  
                    }
                } else {
                    return new JsonResponse(['requestResponse' => false, 'message' => 'ERROR']);  
                }
            } else {
                return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
            }
        } catch(\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()]);
        } 
    }

    private function isValidLoginToken($token): bool 
    {
        try {
            $decoded = $this->JWTEncoder->decode($token);
            if(isset($decoded['login']) && isset($decoded['password'])) {
                if(is_string($decoded['login']) && is_string($decoded['password'])) {
                    $login = trim($decoded['login']);
                    $password = trim($decoded['password']);
                    if(strlen($login) > 0 && strlen($password) > 0) {
                        if(strlen($password) >= 8 && strlen($password) <= 16) {
                            if(preg_match('/^[a-zA-Z0-9!@#$%^&*_.\-]+$/', $login)) {
                                if(preg_match_all('/[!@#$%^&*_\-]/', $password) >= 2) {
                                    if(preg_match('/^[a-zA-Z0-9!@#$%^&*_\-]+$/', $password)) {
                                        if(preg_match_all('/[A-Z]/', $password) >= 1) {
                                            $login = filter_var($login, FILTER_SANITIZE_STRING);
                                            $password = filter_var($password, FILTER_SANITIZE_STRING);
                                            $user = $this->entityManager->getRepository(User::class)->findOneBy(['login' => $login]);
                                            if(isset($user)) {
                                                if($this->passwordEncoder->isPasswordValid($user, $password)) {
                                                    return true;
                                                } else {
                                                    return false;
                                                }
                                            } else {
                                                return false;
                                            }
                                        } else {
                                            return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                } else {
                                    return false;
                                }
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                     } else {
                        return false;
                     }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch(\Exception $e) {
            return false;
        }
    }

    /**
     * @Route("/api/auth/reset-password", name="api_auth_reset_password", methods={"POST"})
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            if(isset($request) && $request->isMethod('POST')) {
                $requestContent = $request->getContent();
                $requestData = json_decode($requestContent, true);
                if(isset($requestData['login']) && isset($requestData['securityCode']) && isset($requestData['currentToken'])) {
                    if(is_string($requestData['login']) && preg_match('/^\d+$/', $requestData['securityCode']) && is_string($requestData['currentToken'])) {
                        $login = trim($requestData['login']);
                        $securityCode = trim($requestData['securityCode']);
                        $currentToken = trim($requestData['currentToken']);
                        if($currentToken === 'undefined') {
                            if(strlen($login) > 0 && strlen($securityCode) > 0 && strlen($securityCode) == 6 && strlen($currentToken) > 0) {
                                if(preg_match('/^[a-zA-Z0-9!@#$%^&*_.\-]+$/', $login)) {
                                    $login = filter_var($login, FILTER_SANITIZE_STRING);
                                    $user = $this->entityManager->getRepository(User::class)->findOneBy(['login' => $login]);
                                    if(isset($user)) {
                                        if($user->getSecurityCode() == $securityCode) {
                                            if(is_null($user->getLastResetPasswordRequest())) {
                                                $token = base_convert(hash('sha256', $user->getPassword() . mt_rand()), 16, 36);
                                                $secretCode = $this->generateSecretCode();
                                                $timezone = new DateTimeZone('Europe/Paris');
                                                $currentTime = new DateTime('now', $timezone);
                                                $user->setLastResetPasswordRequest($currentTime);
                                                $user->setResetPasswordToken($token);
                                                $user->setResetPasswordSecretCode($secretCode);
                                                $this->entityManager->persist($user);
                                                $this->entityManager->flush();
                                                /*$email = (new Email())
                                                ->from('email@example.com')
                                                ->to('recipient@example.com')
                                                ->subject('Sujet de l\'e-mail')
                                                ->text('Contenu de l\'e-mail');                   
                                                $this->mailer->send($email);*/
                                                return new JsonResponse(['requestResponse' => true, 'reset' => true, 'message' => 'VALID_RESET_PASSWORD']);
                                            } else {
                                                $timezone = new DateTimeZone('Europe/Paris');
                                                $currentTime = new DateTime('now', $timezone);
                                                $lastPasswordRequest = $user->getLastResetPasswordRequest();
                                                $tenMinutesAgo = clone $currentTime;
                                                $tenMinutesAgo->sub(new DateInterval('PT10M'));
                                                        
                                                $diff = $lastPasswordRequest->diff($tenMinutesAgo);
                                                $diffInMinutes = $diff->format('%i');
            
                                                if ($diffInMinutes >= 10) {
                                                    $token = base_convert(hash('sha256', $user->getPassword() . mt_rand()), 16, 36);
                                                    $secretCode = $this->generateSecretCode();
                                                    $timezone = new DateTimeZone('Europe/Paris');
                                                    $currentTime = new DateTime('now', $timezone);
                                                    $user->setLastResetPasswordRequest($currentTime);
                                                    $user->setResetPasswordToken($token);
                                                    $user->setResetPasswordSecretCode($secretCode);
                                                    $this->entityManager->persist($user);
                                                    $this->entityManager->flush();
                                                    /*$email = (new Email())
                                                    ->from('email@example.com')
                                                    ->to('recipient@example.com')
                                                    ->subject('Sujet de l\'e-mail')
                                                    ->text('Contenu de l\'e-mail');                   
                                                    $this->mailer->send($email);*/
                                                    return new JsonResponse(['requestResponse' => true, 'reset' => true, 'message' => 'VALID_RESET_PASSWORD']);
                                                } else {
                                                    $diff = $lastPasswordRequest->diff($tenMinutesAgo);
                                                    $minutes = $diff->i;
                                                    $seconds = $diff->s;
                                                    return new JsonResponse(['requestResponse' => true, 'reset' => false, 'message' => "Veuillez patienter encore $minutes minutes et $seconds secondes avant de soumettre une nouvelle demande de réinitialisation de mot de passe pour cet identifiant."]);
                                                }
                                            }
                                        } else {
                                            return new JsonResponse(['requestResponse' => false, 'message' => 'L\'identifiant ou le code de sécurité saisi est incorrect.']);
                                        }
                                    } else {
                                        return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
                                    }
                                } else {
                                    return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
                                }   
                            } else {
                                return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                            }
                        } else {
                            return new JsonResponse(['requestResponse' => false, 'message' => 'LOGIN_TOKEN_ALREADY_EXISTS']);
                        }
                    } else {
                        return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                    }
                } else {
                    return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                }
            } else {
                return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
            }
        } catch(\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()]);
        }
    }

    private function generateSecretCode(): int 
    {
        $number = array();
        for ($i = 0; $i < 6; $i++) {
            $number[] = mt_rand(0, 9);
        }
        $numberString = implode('', $number);
        $numberInt = intval($numberString);
        return $numberInt;
    }

    /**
     * @Route("/api/auth/reset-password-check", name="api_auth_reset_password_check", methods={"POST"})
     */
    public function resetPasswordCheck(Request $request): JsonResponse
    {
        try {
            if(isset($request) && $request->isMethod('POST')) {
                $requestContent = $request->getContent();
                $requestData = json_decode($requestContent, true);
                if(isset($requestData['hashedLogin']) && isset($requestData['hashedSecurityCode']) && isset($requestData['hashedToken']) && isset($requestData['currentToken'])) {
                    $hashedLogin = trim($requestData['hashedLogin']);
                    $hashedSecurityCode = trim($requestData['hashedSecurityCode']);
                    $hashedToken = trim($requestData['hashedToken']);
                    $currentToken = trim($requestData['currentToken']);
                    if(strlen($hashedToken) > 0 && strlen($hashedSecurityCode) > 0 && strlen($hashedToken) > 0 && strlen($currentToken) > 0) {
                        if(preg_match('/^[a-zA-Z0-9]+$/', $hashedLogin) && preg_match('/^[a-zA-Z0-9]+$/', $hashedSecurityCode) && preg_match('/^[a-zA-Z0-9]+$/', $hashedToken)) {
                            $hashedLogin = filter_var($hashedLogin, FILTER_SANITIZE_STRING);
                            $hashedSecurityCode = filter_var($hashedSecurityCode, FILTER_SANITIZE_STRING);
                            $hashedToken = filter_var($hashedToken, FILTER_SANITIZE_STRING);
                            if($this->isValidHashedUserLogin('login', $hashedLogin)) {
                                $user = $this->entityManager->getRepository(User::class)->findOneBy(['id' => $this->getIdFromHashedUserLogin($hashedLogin)]);
                                if(!is_null($user->getResetPasswordToken())) {
                                    $hashedUserSecurityCode = sha1($user->getSecurityCode());
                                    $hashedUserResetToken = sha1($user->getResetPasswordToken());
                                    if($hashedUserSecurityCode === $hashedSecurityCode) {
                                        if($hashedUserResetToken === $hashedToken) {
                                            return new JsonResponse(['requestResponse' => true, 'reset' => true, 'message' => 'VALID_RESET_PASSWORD_CHECK']);
                                        } else {
                                            return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_7']);
                                        }
                                    } else {
                                        return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_6']);
                                    }
                                } else {
                                    return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_5']);
                                }
                            } else {
                                return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_4']);
                            }
                        } else {
                            return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_3']);
                        }
                    } else {
                        return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_2']);
                    }
                } else {
                    return new JsonResponse(['requestResponse' => false, 'message' => 'INVALID_REQUEST_CREDENTIALS_1']);
                }
            } else {
                return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
            }
        } catch(\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()]);
        }
    }

    private function isValidHashedUserLogin(string $key, string $data): bool 
    {
        try {
            if(is_string($key) && is_string($data)) {
                $queryBuilderLogin = $this->entityManager->getRepository(User::class)->createQueryBuilder('u');
                $queryBuilderLogin->select('u.'.$key)
                            ->where('SHA1(u.'.$key.') = :data')
                            ->setParameter(':data', $data)
                            ->setMaxResults(1);
                $resultLogin = $queryBuilderLogin->getQuery()->getOneOrNullResult();

                if($resultLogin === null) {
                    return false;
                } else {
                    return true;
                }
            }
        } catch(\Exception $e) {
            return false;
        }
    }

    private function getIdFromHashedUserLogin(string $login): ?int
    {
        try {
            if(is_string($login)) {
                $queryBuilderLogin = $this->entityManager->getRepository(User::class)->createQueryBuilder('u');
                $queryBuilderLogin->select('u.id')
                    ->where('SHA1(u.login) = :login')
                    ->setParameter(':login', $login)
                    ->setMaxResults(1);

                $resultLogin = $queryBuilderLogin->getQuery()->getOneOrNullResult();

                if ($resultLogin === null) {
                    return null;
                } else {
                    return $resultLogin['id'];
                }
            } else {
                return null;
            }
        } catch(\Exception $e) {
            return null;
        }
    }

    /**
     * @Route("/api/auth/reset-password-send", name="api_auth_reset_password_send", methods={"POST"})
     */
    public function resetPasswordSend(Request $request): JsonResponse
    {
        try {
            if(isset($request) && $request->isMethod('POST')) {
                $requestContent = $request->getContent();
                $requestData = json_decode($requestContent, true);
                if(isset($requestData['password']) && isset($requestData['repeatPassword']) && isset($requestData['hashedLogin']) && isset($requestData['hashedSecurityCode']) && isset($requestData['hashedToken']) && isset($requestData['currentToken']) && isset($requestData['secretCode'])) {
                    $password = trim($requestData['password']);
                    $repeatPassword = trim($requestData['repeatPassword']);
                    $hashedLogin = trim($requestData['hashedLogin']);
                    $hashedSecurityCode = trim($requestData['hashedSecurityCode']);
                    $hashedToken = trim($requestData['hashedToken']);
                    $currentToken = trim($requestData['currentToken']);
                    $secretCode = trim($requestData['secretCode']);
                    if(strlen($password) >= 8 && strlen($repeatPassword) >= 8 && strlen($hashedLogin) > 0 && strlen($hashedSecurityCode) > 0 && strlen($hashedToken) > 0 && strlen($currentToken) > 0 && strlen($secretCode) == 6) {
                        if($currentToken === 'undefined') {
                            if($password === $repeatPassword) {
                                if(preg_match('/^[a-zA-Z0-9]+$/', $hashedLogin) && preg_match('/^[a-zA-Z0-9]+$/', $hashedSecurityCode) && preg_match('/^[a-zA-Z0-9]+$/', $hashedToken) && preg_match('/^\d+$/', $secretCode)) {
                                    if(preg_match_all('/[!@#$%^&*_\-]/', $password) >= 2) {
                                        if(preg_match('/^[a-zA-Z0-9!@#$%^&*_\-]+$/', $password)) {
                                            if(preg_match_all('/[A-Z]/', $password) >= 1) {
                                                $hashedLogin = filter_var($hashedLogin, FILTER_SANITIZE_STRING);
                                                $hashedSecurityCode = filter_var($hashedSecurityCode, FILTER_SANITIZE_STRING);
                                                $hashedToken = filter_var($hashedToken, FILTER_SANITIZE_STRING);
                                                if($this->isValidHashedUserLogin('login', $hashedLogin)) {
                                                    $user = $this->entityManager->getRepository(User::class)->findOneBy(['id' => $this->getIdFromHashedUserLogin($hashedLogin)]);
                                                    if(!is_null($user->getResetPasswordToken()) && !is_null($user->getResetPasswordSecretCode())) {
                                                        $hashedUserSecurityCode = sha1($user->getSecurityCode());
                                                        $hashedUserResetToken = sha1($user->getResetPasswordToken());
                                                        if($hashedUserSecurityCode === $hashedSecurityCode) {
                                                            if($hashedUserResetToken === $hashedToken) {
                                                                if($user->getResetPasswordSecretCode() == $secretCode) {
                                                                    $newPassword = $this->passwordEncoder->encodePassword($user, $password);
                                                                    $user->setPassword($newPassword);
                                                                    $user->setResetPasswordToken(null);
                                                                    $user->setResetPasswordSecretCode(null);
                                                                    $this->entityManager->persist($user);
                                                                    $this->entityManager->flush();
                                                                    /*$email = (new Email())
                                                                    ->from('email@example.com')
                                                                    ->to('recipient@example.com')
                                                                    ->subject('Sujet de l\'e-mail')
                                                                    ->text('Contenu de l\'e-mail');                   
                                                                    $this->mailer->send($email);*/
                                                                    return new JsonResponse(['requestResponse' => true, 'reset' => true, 'message' => 'VALID_RESET_PASSWORD_SEND']);
                                                                } else {
                                                                    return new JsonResponse(['requestResponse' => false, 'message' => 'Le code secret saisi est incorrect.']);
                                                                }
                                                            } else {
                                                                return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                                                            }
                                                        } else {
                                                            return new JsonResponse(['requestResponse' => false, 'requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                                                        }
                                                    } else {
                                                        return new JsonResponse(['requestResponse' => false, 'message' => 'Ce lien de réinitialisation est invalide ou a expiré.']); 
                                                    }
                                                } else {
                                                    return new JsonResponse(['requestResponse' => false, 'message' => 'Ce lien de réinitialisation est invalide ou a expiré.']); 
                                                }
                                            } else {
                                                return new JsonResponse(['requestResponse' => false, 'message' => 'Le mot de passe saisi doit contenir au moins 1 majuscule.']); 
                                            }
                                        } else {
                                            return new JsonResponse(['requestResponse' => false, 'message' => 'Le mot de passe saisi ne doit pas contenir de caractères spéciaux autres que dans la liste !@#$%^&*-_.']); 
                                        }
                                    } else {
                                        return new JsonResponse(['requestResponse' => false, 'message' => 'Le mot de passe saisi doit contenir au moins 2 caractères spéciaux (dans la liste !@#$%^&*-_).']); 
                                    }
                                } else {
                                    return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']); 
                                }
                            } else {
                                return new JsonResponse(['requestResponse' => false, 'message' => 'Les deux mots de passe saisis ne sont pas identiques.']); 
                            }
                        } else {
                            return new JsonResponse(['requestResponse' => false, 'reset' => false, 'message' => 'LOGIN_TOKEN_ALREADY_EXISTS']);
                        }
                    } else {
                        return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']); 
                    }
                } else {
                    return new JsonResponse(['requestResponse' => false, 'message' => 'Veuillez saisir tous les champs.']);
                }
            } else {
                return new JsonResponse(['requestResponse' => false, 'message' => 'Une erreur est survenue lors du traitement de la requête.']);
            }
        } catch(\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()]);
        }
    }
}