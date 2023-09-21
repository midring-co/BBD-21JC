<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 * @ORM\Table(name="`user`")
 */
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $login;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $email;

    /**
     * @ORM\Column(type="integer", length=6)
     */
    private $securityCode;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $resetPasswordToken;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $lastResetPasswordRequest;

    /**
     * @ORM\Column(type="integer", length=6, nullable=true)
     */
    private $resetPasswordSecretCode;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLogin(): ?string
    {
        return $this->login;
    }
    

    public function setLogin(string $login): self
    {
        $this->login = $login;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getEmail(): ?string 
    {
        return $this->email;
    }

    public function setEmail(string $email): self 
    {
        $this->email = $email;

        return $this;
    }

    public function getSecurityCode(): ?int 
    {
        return $this->securityCode;
    }

    public function setSecurityCode(int $securityCode): self 
    {
        $this->securityCode = $securityCode;

        return $this;
    }

    public function getResetPasswordToken(): ?string 
    {
        return $this->resetPasswordToken;
    }

    public function setResetPasswordToken(?string $resetPasswordToken): self 
    {
        $this->resetPasswordToken = $resetPasswordToken;

        return $this;
    }

    public function getLastResetPasswordRequest(): ?\DateTimeInterface 
    {
        return $this->lastResetPasswordRequest;
    }

    public function setLastResetPasswordRequest(?\DateTimeInterface $lastResetPasswordRequest): self 
    {
        $this->lastResetPasswordRequest = $lastResetPasswordRequest;

        return $this;
    }

    public function getResetPasswordSecretCode(): ?int 
    {
        return $this->resetPasswordSecretCode;
    }

    public function setResetPasswordSecretCode(?int $secretCode): self 
    {
        $this->resetPasswordSecretCode = $secretCode;

        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        if ($roles === null) {
            $roles[] = 'ROLE_USER';
        }
        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    public function getSalt()
    {
       
    }

    public function eraseCredentials()
    {
       
    }

    public function getUsername()
    {
       
    }
}
